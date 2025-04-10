import {
  ActivityIndicator,
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
import { channel_Live_Api, chatBaseUrl } from "../../../Constant/Api";
import { bottomIcon, bottomTab } from "../../../Navigation/Icons";
import { t } from "i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Video from "react-native-video";
import AsyncStorage from "@react-native-async-storage/async-storage";
const isDarkMode = true;

const ChannelScreen = React.memo(({ props, navigation, route }: any) => {
  const { colorTheme } = useContext(ThemeContext);
  const [decryptData, setDecryptData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const yourRef = useRef(null);
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

  const getChannelApi = () => {
    let url = chatBaseUrl + channel_Live_Api;
    //  let url =
    //      "https://tokee-chat.betademo.net:8002/api/group/admin/get-message/661e1c4db71dcd286960690e";
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

            await AsyncStorage.setItem(
              "lastChannelSynctime",
              `${Date.now()}`
            );
            let encryptMessage = response.data.data;
            //@ts-ignore
            let decryptedMessages = [];

            encryptMessage.map((item: any) => {
              let encryptionKey = "1457205c-9353-11ee-b9d1-0242ac120002";
              let decryptedMessage = CryptoJS.AES.decrypt(
                item.message,
                encryptionKey
              ).toString(CryptoJS.enc.Utf8);

              // Store the decrypted message
              decryptedMessages.push(
                //@ts-ignore
                {
                  message: decryptedMessage,
                  createdAt: item.createdAt,
                }
              );
            });

            //@ts-ignore
            setDecryptData(decryptedMessages);
            setLoading(false);
          }
        })
        .catch((error) => {
          setLoading(false);
        });
    } catch (error) {
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

  const [myimages, setmyimages] = useState(false);
  const isNotch = DeviceInfo.hasNotch();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [mylocaldata, setmylocaldata] = useState({});

  return (
    <View style={{ flex: 1, position: "relative" }}>
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
            <TouchableOpacity style={styles.Container}>
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

            <TouchableOpacity style={styles.nameInviteContainer}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.name1conText}>{"Tokee"} </Text>
                <ImageBackground
                  source={require("../../../Assets/Icons/verified_icon.png")}
                  style={{
                    height: 15,
                    width: 15,
                    alignSelf: "center",
                    justifyContent: "center",
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
              }, 100);
            }}
            // inverted
            data={decryptData}
            renderItem={({ item, index }: any) => (
              <View
                key={index}
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
                }}
              >
                <Text
                  style={{
                    fontFamily: font.semibold(),
                    margin: 5,

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
                      fontSize:globalThis.chatFontsize,
                     // paddingTop:10
                      // paddingHorizontal: 10,
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
                            height: (11 * (windowWidth - 40))/9,
                            alignSelf: "center",
                            marginBottom:10
                         // backgroundColor:"red"
                          }}
                        >
                          <Image
                            source={{ uri: imgurl }}
                            style={{
                              width: "100%",
                              height: (11 * (windowWidth - 40))/9,
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
                        <View style={{ marginLeft: -10, marginRight: -10, }}>
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
              </View>
            )}
            ListFooterComponent={() => {
              return <View style={{ height: 10 }}></View>;
            }}
          />

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
              {t("Only Tokee can send messages on this channel")}
            </Text>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
});
export default ChannelScreen;
