import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import DeviceInfo from "react-native-device-info";
import ImageViewer from "react-native-image-zoom-viewer";

import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
//@ts-ignore
import CryptoJS from "react-native-crypto-js";

import {
  COLORS,
  chatContainer,
  chatImage,
  chatTop,
  iconTheme,
} from "../../../Components/Colors/Colors";

import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import axios from "axios";
import WebView from "react-native-webview";
import moment from "moment";
import HTML, {
  RenderHTML,
  HTMLElementModel,
  HTMLContentModel,
} from "react-native-render-html";
import { LoaderModel } from "../../Modals/LoaderModel";
import {
  channel_Id,
  channel_Live_Api,
  chatBaseUrl,
  reactionapi,
} from "../../../Constant/Api";
import { bottomIcon, bottomTab } from "../../../Navigation/Icons";
import { t } from "i18next";
import { GestureHandlerRootView,TouchableWithoutFeedback } from "react-native-gesture-handler";
import Video from "react-native-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactionCount } from "../../Modals/ReactionCount";
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import FastImage from "react-native-fast-image";
import { decryptMessage } from "../../../utils/CryptoHelper";

const isDarkMode = true;

const ChannelScreen = React.memo(({ props, navigation, route }: any) => {
  const lastTapRef = useRef(0);
  const { colorTheme } = useContext(ThemeContext);
  const [decryptData, setDecryptData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const yourRef = useRef(null);
  const [reactmsgon, setreactmsgon] = useState(false);
  const [reactmsgondata, setreactmsgondata] = useState({});

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reactmsgon) {
      // Bubble in
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Bubble out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [reactmsgon]);

  const bottomOffset = DeviceInfo.hasNotch() ? 60 : 50;

  useEffect(() => {
    getChannelApi();
    setLoading(true);
    globalThis.newChannelMsg = 0;
  }, []);

  const handleContentSizeChange = useCallback(() => {
    if (yourRef?.current && decryptData && decryptData?.length > 0) {
      if (yourRef?.current) {
        // yourRef?.current?.scrollToEnd({ animated: false });
        const lastIndex = decryptData?.length - 1; //@ts-ignore
        yourRef?.current?.scrollToIndex({
          animated: false,
          index: lastIndex,
          viewPosition: 0,
        });
      }
    }
  }, [decryptData, setDecryptData]);

  const updateObject = (idToUpdate, newKeyValues) => {
    // Find the index of the object to update
    const index = decryptData.findIndex((item) => item._id === idToUpdate);
    // console.log("decryptDatadecryptData",idToUpdate)
    // Check if the object was found
    if (index !== -1) {
      // Create a new array with the updated object
      const updatedData = [
        ...decryptData.slice(0, index),
        { ...decryptData[index], ...newKeyValues},
        ...decryptData.slice(index + 1),
      ];

      // Update the state
      setDecryptData(updatedData);
    }
  };

  const getChannelApi = () => {
     let url = chatBaseUrl + channel_Live_Api;
    // let url =
    //   "https://tokee-chat.betademo.net/api/group/admin/get-message/661e1c4db71dcd286960690e";
    try {
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
        },
      })
        .then(async (response) => {
          if (response.data.status == true) {
            console.log("dddddddddddddddkhjhjlljljkljljlkj", response);
            await AsyncStorage.setItem("lastChannelSynctime", `${Date.now()}`);
            let encryptMessage = response.data.data;
            //@ts-ignore
            let decryptedMessages = [];

            let isreact = false;
            let reacticons = [];
            let reactCount = 0;

            encryptMessage.map((item: any) => {
             
              let decryptedMessage = decryptMessage(channel_Id, item.message);
              // CryptoJS.AES.decrypt(
              //   item.message,
              //   encryptionKey
              // ).toString(CryptoJS.enc.Utf8);

              // Store the decrypted message
              decryptedMessages.push(
                //@ts-ignore
                {
                  _id: item._id,
                  message: decryptedMessage,
                  createdAt: item.createdAt,
                  isreact: false,
                  reactCount: 0,
                  reactions: item.reactions?.reactions || [],
                }
              );
            });

            //@ts-ignore
            setDecryptData(decryptedMessages);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log("rrrrrrrrrrrrrrrrrrrrr", error);
          setLoading(false);
        });
    } catch (error) {
      console.log("tttttttttttttttttttttttt", error);
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    newGroupText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      fontSize: 15,
      fontFamily: font.bold(),
    },
    chatTopContainer: {
      backgroundColor: chatTop().back_ground,
      paddingBottom: 60,
    },
    ChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
      borderColor: "#fff",
      borderRadius: 15,
    },

    chatContainer: {
      flex: 1,
      backgroundColor: chatContainer().back_ground,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
    },

    receiverText: {
      fontSize: 14,
      margin: 10,
      fontFamily: font.medium(),
      color: COLORS.black,
    },
    sendText: {
      fontSize: 14,
      margin: 10,
      fontFamily: font.medium(),
      color: COLORS.black,
    },
    profile1Container: {
      marginTop: 20,
      flexDirection: "row",
      height: 50,
    },
    Container: {
      justifyContent: "center",
      width: "10%",
    },
    Container1: {
      justifyContent: "center",
      width: "10%",
    },
    circleImageLayout: {
      width: 45,
      height: 45,
      borderRadius: 23,
      borderWidth: 1,
      tintColor: bottomIcon().tintColor,
    },
    plusImageLayout: {
      width: 25,
      height: 25,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    nameInviteContainer: {
      justifyContent: "center",
      marginLeft: 10,
      width: "62%",
      flexDirection: "column",
    },
    name1conText: {
      fontSize: FontSize.font,
      fontFamily: font.bold(),
      color: iconTheme().iconColorNew,
      paddingLeft: 10,
    },
    name2conText: {
      fontSize: DeviceInfo.isTablet() ? 16 : 10,
      fontFamily: font.medium(),
      color: COLORS.black,
      paddingLeft: 10,
    },

    plusImageContainer: {
      position: "absolute",
      right: DeviceInfo.isTablet() == true ? 40 : 5,
      bottom: 48,
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    editProfile: {
      marginLeft: 10,
      flexDirection: "row",
      width: "15%",
      justifyContent: "center",
      alignItems: "center",
    },
    newChatIcon: {
      height: DeviceInfo.isTablet() ? 32 : 25,
      width: DeviceInfo.isTablet() ? 32 : 25,
      tintColor: iconTheme().iconColor,
      marginRight: 20,
    },
    newCallIcon: {
      height: 25,
      width: 25,
      tintColor: iconTheme().iconColorNew,
      marginRight: 10,
    },
    plusImage1Layout: {
      width: 20,
      height: 20,
      tintColor: iconTheme().iconColorNew,
    },
    backIcon: {
      height: 22,
      width: 22,
      tintColor: COLORS.black,
    },
  });

  // Define the custom HTML element model for the "video" tag
  const videoModel = {
    tagName: "video",
    contentModel: "block", // Set content model to "block" to allow nested elements
  };

  const source = {
    html: "<video></video>",
  };

  const customHTMLElementModels = {
    video: HTMLElementModel.fromCustomModel({
      tagName: "video",
      mixedUAStyles: {
        alignSelf: "center",
      },
      contentModel: HTMLContentModel.block,
    }),
  };

  const Reactionapifunction = (messageId, reaction, react) => {
    console.log("reactionpayload", messageId, reaction, react);
    let url = chatBaseUrl + reactionapi;
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
        },
        data: {
          messageId: messageId,
          reaction: reaction,
          react: react,
          userId: globalThis.userChatId,
        },
      })
        .then(async (response) => {
          if (response.data.status == true) {
            console.log("reaction response", response.data);
          }
        })
        .catch((error) => {
          console.log("wwwwwwwwwwwwwwwwww", error);
          setLoading(false);
        });
    } catch (error) {
      console.log("eeeeeeeeeeeeeeeeee", error);
      setLoading(false);
    }
  };

  const handlePress = async (getUrl: any) => {
    const url = getUrl; // Replace with your URL
    try {
      // Open the URL in the browser
      navigation.navigate("ChannelWebScreen", {
        webUrl: url,
      });
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  const onsendreaction = (id, newIcon, reactCount) => {
    // Initialize iconssend to true
    let iconssend = true;

    const updatedReacticons = decryptData.map((item) => {
      console.log("Processing item:", item);

      if (item._id === id) {
        console.log("Item matched:", item);

        // Check if any reaction object contains the emoji equal to newIcon
        const existingReactionIndex = item?.reactions?.findIndex(
          (data) => data.emoji === newIcon
        );
       console.log("Existing reaction index:", existingReactionIndex);

        if (existingReactionIndex !== -1) {
          const existingReaction = item?.reactions[existingReactionIndex];
          const userInReaction = existingReaction.users?.some(
            (user) => user.userId === globalThis.userChatId
          );

          if (userInReaction) {
            // User has already reacted with this emoji
            // Remove the reaction if it's only sent by the current user
            if (existingReaction.users.length === 1) {
              // Only this user has reacted, so remove the reaction
              const updatedReactions = item.reactions.filter(
                (_, index) => index !== existingReactionIndex
              );
              const newReactCount = reactCount - (existingReaction.count || 0);

              iconssend = false; // No longer send if reaction is removed or user already reacted

              return {
                ...item,
                reactions: updatedReactions,
                reactCount: newReactCount,
                isreact: false,
              };
            } else {
              // User has reacted but other users have also reacted
              // Decrease the count and keep the reaction
              const updatedReactions = item.reactions.map((reaction, index) =>
                index === existingReactionIndex
                  ? {
                      ...reaction,
                      count: (reaction.count || 0) - 1,
                      users: reaction.users.filter(
                        (user) => user.userId !== globalThis.userChatId
                      ),
                    }
                  : reaction
              );

              iconssend = false; // User has already reacted, so no need to update count

              return {
                ...item,
                reactions: updatedReactions,
                reactCount: reactCount - 1,
                isreact: false,
              };
            }
          } else {
            // User has not reacted, so add the reaction
            const updatedReactions = item.reactions.map((reaction, index) =>
              index === existingReactionIndex
                ? {
                    ...reaction,
                    count: (reaction.count || 0) + 1,
                    users: [
                      ...(reaction.users || []),
                      { userId: globalThis.userChatId },
                    ],
                  }
                : reaction
            );

            return {
              ...item,
              reactions: updatedReactions,
              reactCount: reactCount + 1,
              isreact: true,
            };
          }
        } else {
          // Emoji is not present, so add a new reaction object
          const newReaction = {
            emoji: newIcon,
            count: 1,
            users: [{ userId: globalThis.userChatId }],
          };
          const updatedReactions = [...(item.reactions || []), newReaction];

          return {
            ...item,
            reactions: updatedReactions,
            reactCount: reactCount + 1,
            isreact: true,
          };
        }
      }

      return item;
    });

    // Call Reactionapifunction with the updated iconssend state
    Reactionapifunction(id, newIcon, iconssend);

    // Now handle updatedReacticons with your state update or API call
    console.log("Updated Reacticons:", updatedReacticons);
    setDecryptData(updatedReacticons);
    setreactmsgon(false);
  };

  const [myimages, setmyimages] = useState(false);
  const isNotch = DeviceInfo.hasNotch();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [mylocaldata, setmylocaldata] = useState({});
  const [lastTap, setLastTap] = useState(null);
  const [ReactionCountmodel, setReactionCountmodel] = useState(false);
  const [reacttiondata, setreacttiondata] = useState([]);

  const scaleAnimation = useRef({});
  
  const handlePressIn = (messageid) => {
    Animated.spring(scaleAnimation.current[messageid], {
      toValue: 0.95, // Scale down
      friction: 3,   // Adjust friction for bounce effect
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (messageid) => {
    Animated.spring(scaleAnimation.current[messageid], {
      toValue: 1,    // Scale back to original
      friction: 3,
      useNativeDriver: true,
    }).start();
  };


  
  return (
    <View style={{flex: 1, position: "relative" }}>
      <Modal visible={myimages}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              left: 3,
              zIndex: 20,
              top: isNotch ? 60 : 60,
            }}
            onPress={() => {
              setmyimages(false);
            }}
          >
            <Image
              source={require("../../../Assets/Icons/Back_Arrow.png")}
              style={{
                height: 25,
                width: 25,
                marginLeft: 10,
                tintColor: iconTheme().iconColor,
              }}
            />
          </TouchableOpacity>

          {mylocaldata && (
            <View>
              {
                //@ts-ignore
                mylocaldata?.type == "image" ? (
                  <View
                    style={{
                      height: windowHeight,
                      width: windowWidth - 20,
                    }}
                  >
                    <ImageViewer
                      saveToLocalByLongPress={false} //@ts-ignore
                      renderIndicator={() => {
                        return null;
                      }}
                      style={{
                        height: windowHeight,
                        width: windowWidth - 20,
                      }} //@ts-ignore
                      imageUrls={mylocaldata?.attachment?.map((url) => ({
                        url,
                      }))}
                      loadingRender={() => <ActivityIndicator size={"large"} />}
                    />
                  </View>
                ) : (
                  <GestureHandlerRootView>
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      {
                        //@ts-ignore
                        mylocaldata.type == "video" && (
                          <Video
                            //@ts-ignore
                            style={{
                              width: windowWidth,
                              height: 300,
                              padding: 20,
                              // Other video styles...
                            }}
                            onLoadStart={() => setLoading(true)}
                            onLoad={() => setLoading(false)}
                            //@ts-ignore
                            source={{ uri: mylocaldata?.attachment }}
                            resizeMode="contain"
                            controls={true}
                            paused={isPlaying}
                          />
                        )
                      }
                    </View>
                  </GestureHandlerRootView>
                )
              }
            </View>
          )}
        </View>
      </Modal>

      <ReactionCount
        visible={ReactionCountmodel}
        onRequestClose={() => setReactionCountmodel(false)}
        cancel={() => setReactionCountmodel(false)}
        sendContactData={reacttiondata}
      />

      <LoaderModel visible={loading} />
      {DeviceInfo.hasNotch() == true ? (
        <CustomStatusBar
          barStyle={isDarkMode ? "dark-content" : "dark-content"}
          backgroundColor={chatTop().back_ground}
        />
      ) : (
        <CustomStatusBar
          barStyle={isDarkMode ? "dark-content" : "dark-content"}
          backgroundColor={chatTop().back_ground}
        />
      )}

      <View style={styles.chatTopContainer}>
        <View style={styles.groupContainer}>
          <View style={styles.profile1Container}>
            <TouchableOpacity
              style={styles.Container1}
              onPress={() => {
                navigation.navigate("ChatScreen");
              }}
            >
              <Image
                source={require("../../../Assets/Icons/Back_Arrow.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("ChannelDetail", {
                  decryptData: decryptData,
                });
              }}
              style={styles.Container}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: 45,
                  backgroundColor: chatTop().back_ground,
                  borderRadius: 25,
                  height: 45,
                  borderWidth: 1,
                  borderColor: iconTheme().iconColorNew,
                }}
              >
                <Image
                  source={bottomTab().ChatIcon}
                  resizeMode="contain"
                  style={{
                    width: 32,
                    height: 32,
                    tintColor: bottomIcon().tintColor,
                  }}
                />
              </View>
              {/* <View style={styles.plusImageContainer}>
                <Image
                  source={require("../../../Assets/Icons/Chat_top.png")}
                  style={styles.plusImage1Layout}
                  resizeMode="contain"
                />
              </View> */}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate("ChannelDetail", {
                  decryptData: decryptData,
                });
              }}
              style={styles.nameInviteContainer}
            >
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.name1conText}>{"Tokee"} </Text>
                <ImageBackground
                  source={require("../../../Assets/Icons/verified_icon.png")}
                  style={{
                    height: 15,
                    width: 15,
                    alignSelf: "center",
                    justifyContent: "center",
                    marginLeft: 5,
                  }}
                  resizeMode="contain"
                >
                  <Image
                    source={require("../../../Assets/Icons/correct_sign.png")}
                    style={{
                      height: 10,
                      width: 10,
                      alignSelf: "center",
                      tintColor: COLORS.white,
                    }}
                    resizeMode="contain"
                  />
                </ImageBackground>
              </View>
              <Text style={styles.name2conText}>{t("official_account")}</Text>
            </TouchableOpacity>

            <View style={styles.editProfile}></View>
          </View>
        </View>
      </View>
      <View style={styles.chatContainer}>
        <ImageBackground
          style={{
            flex: 1,
            overflow: "hidden",
            marginTop: 0,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          }}
          source={
            chatImage().Image
              ? chatImage().Image
              : require("../../../Assets/Icons/trans.png")
          }
        >
          <FlatList
            showsHorizontalScrollIndicator={false}
            ref={yourRef}
            onContentSizeChange={handleContentSizeChange}
            onScrollToIndexFailed={(error) => {
              //@ts-ignore
              yourRef.current.scrollToOffset({
                offset: error.averageItemLength * error.index,
                animated: false,
              });
              setTimeout(() => {
                if (decryptData.length !== 0 && yourRef !== null) {
                  //@ts-ignore
                  yourRef.current.scrollToIndex({
                    index: error.index,
                    animated: false,
                    viewPosition: 0,
                  });
                }
              }, 0);
            }}
            showsVerticalScrollIndicator={false} //@ts-ignore
            // inverted
            data={decryptData}
            renderItem={({ item, index }: any) => {
              if (!scaleAnimation.current[item?._id]) {
                scaleAnimation.current[item?._id] = new Animated.Value(1);
              }
              return(
              <Animated.View key={index} style={{transform: [{ scale: scaleAnimation.current[item?._id] }]}}>
                <Pressable
                  onPressIn={()=> {
                    handlePressIn(item?._id);
                  }}
                  onPressOut={()=> {
                    handlePressOut(item?._id);
                  }}
                  onPress={() => {
                    const now = Date.now();
                    const DOUBLE_PRESS_DELAY = 300; // Milliseconds
                    ReactNativeHapticFeedback.trigger("impactLight", {
                      enableVibrateFallback: true,
                      ignoreAndroidSystemSettings: false,
                    });
                    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
                      setreactmsgon(true);
                      setreactmsgondata(item);
                      ReactNativeHapticFeedback.trigger("effectDoubleClick", {
                        enableVibrateFallback: true,
                        ignoreAndroidSystemSettings: false,
                  })
                    }
                    lastTapRef.current = now;
                  }}
                  onLongPress={() => {
                    setreactmsgon(true);
                    setreactmsgondata(item);
                    ReactNativeHapticFeedback.trigger("impactHeavy", {
                      enableVibrateFallback: true,
                    ignoreAndroidSystemSettings: false,
                  })
                  }}
                  style={{
                    marginTop: 20,
                    borderBottomLeftRadius: 15,
                    borderBottomRightRadius: 15,
                    borderTopRightRadius: 15,
                    width: "95%",
                    backgroundColor:
                      //@ts-ignore
                      globalThis.selectTheme === "mongoliaTheme"
                        ? "#FDF1E9"
                        : "#F5F5F5",
                    marginHorizontal: 10,
                    justifyContent: "flex-start",
                    position: "relative",
                    marginBottom:
                      item?.reactions && item?.reactions?.length > 0 ? 13 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: font.semibold(),
                      margin: 5,
                      color: COLORS.black,
                      fontSize: 16,
                    }}
                  >
                    {" "}
                    Tokee{" "}
                  </Text>

                  <RenderHTML
                    source={{ html: item?.message }}
                    contentWidth={Dimensions.get("window").width}
                    tagsStyles={{
                      p: {
                        marginVertical: 10,
                        marginHorizontal: 10,
                        // paddingBottom:10,
                        fontSize: globalThis.chatFontsize,
                        color: COLORS.black,
                        // paddingTop:10
                        // paddingHorizontal: 10,
                      },
                      li: {
                        fontSize: globalThis.chatFontsize,
                        color: COLORS.black,
                      },
                      // img: { width: "100%", overflow: "hidden" },
                    }}
                    customHTMLElementModels={{
                      video: HTMLElementModel.fromCustomModel({
                        tagName: "video",
                        mixedUAStyles: {
                          alignSelf: "center",
                        },
                        contentModel: HTMLContentModel.block,
                      }),
                    }}
                    renderers={{
                      video: (htmlAttribs: any) => {
                        // Extract the video source URI from the HTML attributes

                        const videourl =
                          htmlAttribs?.tnode?.domNode?.children[0]?.next?.attribs
                            ?.src ||
                          htmlAttribs?.tnode?.domNode?.children[0]?.attribs?.src;

                        // Render the video using a WebView
                        return (
                          <Pressable
                          onPressIn={()=> {
                            handlePressIn(item?._id);
                          }}
                          onPressOut={()=> {
                            handlePressOut(item?._id);
                          }}
                          onLongPress={() => {
                            setreactmsgon(true);
                            setreactmsgondata(item);
                            ReactNativeHapticFeedback.trigger("impactHeavy", {
                              enableVibrateFallback: true,
                            ignoreAndroidSystemSettings: false,
                          })
                          }}
                            onPress={() => {
                              setmyimages(true);
                              setmylocaldata({
                                //@ts-ignore
                                attachment: videourl,
                                type: "video",
                              });
                            }}
                            style={{
                              width: "95%",
                              height: 255,
                              alignSelf: "center",
                            }}
                          >
                            <WebView
                              source={{
                                html: `
                                  <video 
                                    playsinline 
                                    controls 
                                    src="${videourl}" 
                                    style="
                                      width: 100%;
                                      height: 100%;
                                      border-radius: 15px;
                                    
                                    "
                                  ></video>
                                `,
                              }}
                              useWebKit={true}
                              originWhitelist={["*"]}
                              allowsInlineMediaPlayback={true}
                              style={{
                                width: "100%",
                                height: 255,
                                borderRadius: 15,
                              }}
                            ></WebView>
                          </Pressable>
                        );
                      },

                      img: (htmlAttribs: any) => {
                        // Extract the video source URI from the HTML attributes

                        const imgurl = htmlAttribs?.tnode?.domNode?.attribs?.src;

                        return (
                          <Pressable
                          onPressIn={()=> {
                            handlePressIn(item?._id);
                          }}
                          onPressOut={()=> {
                            handlePressOut(item?._id);
                          }}
                          onLongPress={() => {
                            setreactmsgon(true);
                            setreactmsgondata(item);
                            ReactNativeHapticFeedback.trigger("impactHeavy", {
                              enableVibrateFallback: true,
                            ignoreAndroidSystemSettings: false,
                          })
                          }}
                            onPress={() => {
                              setmyimages(true);
                              setmylocaldata({
                                //@ts-ignore
                                attachment: [imgurl],
                                type: "image",
                              });
                            }}
                            style={{
                              width: "100%",
                              height: (11 * (windowWidth - 40)) / 9,
                              alignSelf: "center",
                              marginBottom: 10,
                              // backgroundColor:"red"
                            }}
                          >
                            <FastImage
                              source={{ uri: imgurl }}
                              style={{
                                width: "100%",
                                height: (11 * (windowWidth - 40)) / 9,
                                borderRadius: 20,

                                overflow: "hidden",
                              }}
                              resizeMode="cover"
                            />
                          </Pressable>
                        );
                      },

                      a: (htmlAttribs: any) => {
                        // Extract the URL from the HTML attributes
                        const linkurl =
                          htmlAttribs?.tnode?.domNode?.children[0]?.parent
                            ?.attribs?.href;
                        const linkText =
                          htmlAttribs?.tnode?.domNode?.children[0]?.parent
                            ?.children?.[0]?.data;
                        // Render the URL link
                        return (
                          <View style={{ marginLeft: -10, marginRight: -10 }}>
                            <Text
                              style={{
                                fontFamily: font.regular(),
                                fontSize: globalThis.chatFontsize,
                                marginHorizontal: 10,
                                marginVertical: 5,
                                alignSelf: "flex-end",
                              }}
                            >
                              {moment(item?.createdAt).format("DD MMMM, h:mm A")}
                            </Text>
                            <TouchableOpacity
                              style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                borderTopWidth: 0.5,
                                // borderColor: COLORS.grey,
                                flex: 1,
                                width: "100%",
                                overflow: "hidden",
                                //  backgroundColor:"red",
                                // elevation: 0.5,
                              }}
                              onPress={() => handlePress(linkurl)}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.name1conText,
                                  {
                                    color: "blue",
                                    marginTop: 10,
                                    marginBottom: 10,
                                    fontFamily: font.regular(),
                                    fontSize: globalThis.chatFontsize,
                                    textAlign: "center",
                                    width: windowWidth * 0.7,
                                  },
                                ]}
                              >
                                {linkText}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      },
                    }}
                  />

                  {item?.reactions && item?.reactions?.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setReactionCountmodel(true),
                          setreacttiondata(item?.reactions);
                      }}
                      style={{
                        position: "absolute",
                        backgroundColor: "#fff",
                        borderRadius: 100,
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                        bottom: -15,
                        left: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        // Android shadow property
                        elevation: 5,
                      }}
                    >
                      {item.reactions?.map((data, index) => (
                        <Text
                          key={index}
                          style={{ fontSize: 15, color: "#000", paddingRight: 3 }}
                        >
                          {data?.emoji}
                        </Text>
                      ))}
                      <Text style={{ fontSize: 15, fontWeight: "700" }}>
                        {item?.reactions.reduce((acc, val) => {
                          return acc + val.count;
                        }, 0)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </Pressable>
              </Animated.View>
            )}}
            ListFooterComponent={() => {
              return <View style={{ height: 10 }}></View>;
            }}
          />

          {reactmsgon && (
            <Pressable
              onPress={() => {
                setreactmsgon(false);
              }}
              style={{
                position: "absolute",
                bottom: DeviceInfo.hasNotch() == true ? 60 : 50,
                flex: 1,
                backgroundColor: "#4d4b4cd9",
                height: "100%",
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                // Android shadow property
                elevation: 5,
              }}
            >
              <Animated.View
                style={{
                  opacity: opacityAnim,
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1], // Adjust scale values as needed
                      }),
                    },
                  ],
                }}
              >
                <Text
                  style={{
                    color: "#ffff",
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 10,
                    fontFamily: font.medium(),
                    width:"100%",
                  }}
                >
                  {t("Tap_to_react_message")}
                </Text>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 100,
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(
                        reactmsgondata?._id,
                        "👍",
                        reactmsgondata?.reactCount
                      );
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      👍
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(
                        reactmsgondata?._id,
                        "❤️",
                        reactmsgondata?.reactCount
                      );
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      ❤️
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(
                        reactmsgondata?._id,
                        "😂",
                        reactmsgondata?.reactCount
                      );
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      😂
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(
                        reactmsgondata?._id,
                        "😮",
                        reactmsgondata?.reactCount
                      );
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      😮
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(
                        reactmsgondata?._id,
                        "😢",
                        reactmsgondata?.reactCount
                      );
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      😢
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(
                        reactmsgondata?._id,
                        "🙏",
                        reactmsgondata?.reactCount
                      );
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      🙏
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Pressable>
          )}

          <View
            style={{
              height: DeviceInfo.hasNotch() == true ? 60 : 50,
              bottom: Platform.OS == "ios" ? 0 : 0,
              width: "100%",
              backgroundColor: chatTop().back_ground,
              justifyContent: "center",

              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  shadowRadius: 3.84,
                },
                android: {
                  elevation: 5,
                },
              }),
            }}
          >
            <Text
              style={{
                fontFamily: font.medium(),
                fontSize: 15,
                marginVertical: 5,

                alignSelf: "center",
              }}
            >
              {t("only_tokee_team_can_send_on")}
            </Text>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
});
export default ChannelScreen;