import { t } from "i18next";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ColorMatrix } from "react-native-color-matrix-image-filters";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import Video from "react-native-video";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { COLORS, textTheme } from "../../Components/Colors/Colors";
import { StoryTimeConverter } from "../../Components/DateTimeFormat/TimeConverter";
import { font } from "../../Components/Fonts/Font";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import {
  get_by_ChatId,
  get_by_User_allposts,
  get_by_User_story,
  view_story,
} from "../../Constant/Api";
import { socket } from "../../socket";
//@ts-ignore
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info"; //@ts-ignore
import Gestures from "react-native-easy-gestures";
import { filters } from "../../Components/dargText/filter";
import { EncryptionKey } from "../../Constant/Key";
import { useDispatch, useSelector } from "react-redux";
import { setProfileData } from "../../Redux/MessageSlice";
import { setBottomSheetStory } from "../../reducers/friendListSlice";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import {
  setMainprovider,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setnewroomID,
  setnewroomType,
  setroominfo,
  setyesstart,
} from "../../Redux/ChatHistory";
import { HeartLike } from "../../Components/HeartLike";

const { width, height } = Dimensions.get("screen");

interface Content {
  content: string;
  file_type: string;
  finish: number;
}

let videoTime = "";
export default function FriendStoryViewScreen({ navigation, route }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const [end, setEnd] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [isPreLoading, setPreLoading] = useState<boolean>(false);
  const [load, setLoad] = useState<boolean>(false);
  const progress = useRef<Animated.Value>(new Animated.Value(0)).current;
  const videoPlayer = useRef(null);
  const [videoDuratin, setVideoDuratin] = useState();
  const [isId, setIsId] = useState();
  const userID = route.params.userId;
  const userName = route.params.userName;
  const userImage = route.params.userImage;
  const [replyVisible, setReplyVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [content, setContent] = useState<Content[]>([]);
  const isNotch = DeviceInfo.hasNotch();
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [stickerLoadStates, setStickerLoadStates] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const dispatch = useDispatch();

  const userPremium = useSelector(
    (state) => state?.friendListSlice.userPremium
  );

  const bottomsheetFrom = useSelector(
    (state) => state?.friendListSlice.bottomSheetStory
  );

  console.log("content====================================", content);

  const bottomSheetRef = React.useRef(null);
  const handlePresentModalPress = () => bottomSheetRef?.current?.present();

  useEffect(() => {
    setIsMainImageLoaded(false);
    setStickerLoadStates([]);
  }, [current]);

  useEffect(() => {
    if (bottomsheetFrom == "close for story") {
      start();
    }
  }, [bottomsheetFrom]);


  const allStickersLoaded =
    stickerLoadStates.length === content[current]?.sticker_postion?.length &&
    stickerLoadStates.every(Boolean);

  useEffect(() => {
    if (load == true) {
      setLoad(true);
    }
  }, [load]);

  const [user, setUser] = useState({
    id: 2,
    display_name: "",
    profile_image:
      "https://tokeecorp.com/backend/public/images/user-avatar.png",
  });

  const submitReply = () => {
    const encryptedMessage = CryptoJS.AES.encrypt(
      replyText,
      EncryptionKey
    ).toString();
    const attach = [];

    if (content) {
    } //@ts-ignore
    const idx = content.findIndex((s) => s.id == isId);

    if (content[idx].file_type == "template") {
      attach.push(
        JSON.stringify({
          //@ts-ignore
          background_color: content[idx].background_color, //@ts-ignore
          title: content[idx].title,
          type: "template",
        })
      );
    } else {
      attach.push(
        JSON.stringify({
          //@ts-ignore
          file: content[idx].file,
          type: "file",
        })
      );
    }

    const paramsOfSendlive = {
      storyId: isId, //@ts-ignore
      userName: globalThis.displayName, //@ts-ignore
      userImage: globalThis.image,
      roomType: "single", //@ts-ignore
      roomOwnerId: globalThis.userChatId,
      message: encryptedMessage,
      message_type: "story", //@ts-ignore
      roomMembers: [user.chat_user_id],
      isForwarded: false,
      attachment: attach, //@ts-ignore
      from: globalThis.userChatId,
      resId: Date.now(),
      status: "",
      parent_message_id: "",
      parent_message: {},
      createdAt: new Date(),
      isDeletedForAll: false, //@ts-ignore
      phoneNumber: user.phone_number,
    };

    socket.emit("sendmessage", paramsOfSendlive);

    setReplyText("");
    setReplyVisible(false);
  };

  useEffect(() => {
    replyVisible == true ? stopAnimation() : play();
  }, [replyVisible]);

  const [images, setImages] = useState([
    { src: require("../../Assets/Image/Home.png") },
    { src: require("../../Assets/Image/girl_profile.png") },
    { src: require("../../Assets/Image/new_chat_intro_purple.png") },
  ]);

  const buttonPress = () => {
    navigation.navigate("BottomBar", { screen: "chatScreen" });
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      setTimeout(() => {
        console.log('route?.params?.fromScreen',route?.params?.fromScreen);
        
        route?.params?.fromScreen == "BottomSheet" ? AllPostsListApi(userID) :  getStoryApi();
      }, 100);
    });
    return unsubscribe2;
  }, []);



  ////  
    const AllPostsListApi = async (chatid: any, ) => {
      console.log("AllPostsListApi.data",);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    const data = {
      chat_user_id: chatid,
    };

    PostApiCall(
      get_by_User_allposts,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        apiSuccess(ResponseData, ErrorStr,);
      }
    );
  };

  const onBufferVideo = () => {
    setPreLoading(true);
    stopAnimation();
  };

  const stopAnimation = () => {
    progress.stopAnimation();
  };

  useEffect(() => {
    console.log("globalThis.stealthMode ",globalThis.stealthMode );
    
    if (!globalThis.stealthMode || globalThis.stealthMode == "false" ) {
      ViewStory();
    }
    
  }, [isId]);

  /////////////////////view story///////////////////////////
  const ViewStory = async () => {
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // @ts-ignore
      Authorization: "Bearer " + globalThis.Authtoken, //@ts-ignore
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      view_story + isId,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        viewApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get profilr api Response   ********** ///
  const viewApiSuccess = (ResponseData: any, ErrorStr: any) => {
    console.log("RESPONSE VIEW STORY:>>>>>>>>>", ResponseData.data);
  };

  // **********   Headers for Get Profile Api  ********** ///cd
  const getStoryApi = async () => {
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // @ts-ignore
      Authorization: "Bearer " + globalThis.Authtoken, //@ts-ignore
      localization: globalThis.selectLanguage,
    };

    let body = {
      user_id: userID,
    };
    PostApiCall(
      get_by_User_story,
      body,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        apiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get profilr api Response   ********** ///
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      // Navigate to another screen or handle the error in some way
    } else {
console.log("ResponseData.data",ResponseData.data);


      let tempData = ResponseData.data.map((item: any) => {
        item.sticker_postion = JSON.parse(item.sticker_postion);
        item.image_text = JSON.parse(item.image_text);
        item.mention = JSON.parse(item.mention);
        return item;
      });

      setIsId(ResponseData.data[0].id);
      setContent(tempData);
      setUser(ResponseData.user);
    }
  };

  const start = (n: number) => {
    if (content[current]?.file_type == "video") {
      if (n !== undefined) {
        //@ts-ignore
        setVideoDuratin(Math.round(n.duration) * 1000);
      }
      if (load) {
        Animated.timing(progress, {
          toValue: 1,
          duration: videoDuratin,
          useNativeDriver: false,
        }).start(({ finished }) => {
          //@ts-ignore
          setIsId(content[current]?.id);
          if (finished) {
            next();
          }
        });
      }
    } else if (
      content[current]?.file_type == "template" ||
      content[current]?.file_type == "image"
    ) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        //@ts-ignore
        setIsId(content[current]?.id);
        if (finished) {
          next();
        }
      });
    }
  };

  function play(): void {
    start(end);
    //@ts-ignore
    setIsId(content[current]?.id);
  }

  function next(): void {
    setReplyVisible(false);
    if (current !== content.length - 1) {
      let data = [...content];
      //@ts-ignore
      setIsId(content[current]?.id);
      data[current].finish = 1;
      setContent(data);
      setCurrent(current + 1);
      progress.setValue(0);
      setLoad(false);
    } else {
      close();
    }
  }

  function previous(): void {
    setReplyVisible(false);
    if (current - 1 >= 0) {
      let data = [...content];
      //@ts-ignore
      setIsId(content[current]?.id);
      data[current].finish = 0;
      setContent(data);
      setCurrent(current - 1);
      progress.setValue(0);
      setLoad(false);
    } else {
      progress.setValue(0);
      play();
    }
  }

  function close(): void {
    setContent([]);
    progress.setValue(0);
    setLoad(false);
    navigation.navigate("BottomBar", { screen: "chatScreen" });
  }

  const chooseFont = (fontName) => {
    if (fontName.includes("IBM")) {
      return Platform.OS == "android" ? "IBMPlexSans-Bold" : "IBMPlexSans-Bold";
    } else if (fontName.includes("Dancing")) {
      return Platform.OS == "ios" ? "Dancing Script" : "Dancing_Script_copy";
    } else if (fontName.includes("Felt")) {
      return Platform.OS == "android"
        ? "FeltCondolences-3zV06"
        : "Felt Condolences_";
    } else if (fontName.includes("Party")) {
      return Platform.OS == "ios" ? "Party Story" : "PartyStory-ZVA6z";
    } else if (fontName.includes("Pink")) {
      return Platform.OS == "android" ? "PinkStory-3lO6p" : "PartyStory-ZVA6z";
    }

    return Platform.OS == "android" ? "Skateboarder-mL439" : "SKATEBOARDER";
  };

  const getProfileApi = async (chatid: any) => {
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // @ts-ignore
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    let data = {
      //@ts-ignore
      chat_user_id: chatid,
    };

    PostApiCall(
      get_by_ChatId,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        // setIsLoading(false);
        getapiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  const getapiSuccess = (ResponseData: any, ErrorStr: any) => {
    console.log(
      "ResponseData====================================",
      ResponseData
    );

    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);

      // Navigate to another screen or handle the error in some way
    } else {
      const userData = ResponseData.data.user;
      const imageText = JSON.parse(userData.Image_text);
      const stickerPosition = JSON.parse(userData.sticker_position);
      dispatch(
        setProfileData({
          ...userData,
          Image_text: imageText,
          sticker_position: stickerPosition,
          display_name: userData.first_name,
          profile_image: ResponseData?.data?.user?.profile_image,
        })
      );
      stopAnimation();
      handlePresentModalPress();
      dispatch(setBottomSheetStory("open from story"));
    }
  };

  const parseCaption = (text) => {
    const mentionRegex = /@([\w\s]+)/g;
    const parts = [];
    let lastIndex = 0;

    text?.replace(mentionRegex, (match, p1, index) => {
      if (index > lastIndex) {
        parts.push({ text: text.slice(lastIndex, index), isMention: false });
      }
      parts.push({ text: match, isMention: true });
      lastIndex = index + match.length;
    });

    if (lastIndex < text?.length) {
      parts.push({ text: text?.slice(lastIndex), isMention: false });
    }

    return parts;
  };

  const renderCaption = (inputText) => {
    // Ensure mentionsList is always an array
    const mentionsList = Array.isArray(content[current]?.mention)
      ? content[current].mention
      : [];
    console.log("mentionsList==========", mentionsList);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const mentionRegex = new RegExp(
      `(@(${mentionsList
        .map((friend) => friend.name.replace(/\s+/g, "\\s+"))
        .join("|")})\\b)`,
      "gi"
    );

    const combinedRegex = new RegExp(
      `(${urlRegex.source})|(${mentionRegex.source})`,
      "g"
    );
    const parts = inputText.match(combinedRegex) || [];

    let lastIndex = 0;
    const elements = [];

    parts.forEach((part, index) => {
      const partIndex = inputText.indexOf(part, lastIndex);

      if (partIndex > lastIndex) {
        elements.push(
          <Text key={`${lastIndex}-text`}>
            {inputText.slice(lastIndex, partIndex)}
          </Text>
        );
      }

      if (urlRegex.test(part)) {
        elements.push(
          <Text
            key={`${index}-url`}
            onPress={() => (userPremium ? Linking.openURL(part) : null)}
            style={{ color: "blue", textDecorationLine: "underline" }}
          >
            {part}{" "}
          </Text>
        );
      } else if (mentionRegex.test(part)) {
        const match = part.match(mentionRegex);
        if (match) {
          const mentionName = match[0].replace("@", "").trim();

          const mention = mentionsList.find(
            (m) => m.name.toLowerCase() === mentionName.toLowerCase()
          );
          if (mention) {
            elements.push(
              <Text
                key={`${index}-mention`}
                onPress={() =>
                  userPremium ? getProfileApi(mention.chat_user_id) : null
                }
                style={{ color: "blue", fontWeight: "bold" }}
              >
                {`@${mentionName}`}{" "}
              </Text>
            );
          } else {
            elements.push(<Text key={`${index}-mention`}>{part}</Text>);
          }
        }
      }

      lastIndex = partIndex + part.length;
    });

    if (lastIndex < inputText.length) {
      elements.push(
        <Text key={`${lastIndex}-end`}>{inputText.slice(lastIndex)}</Text>
      );
    }

    return elements;
  };

  const newChattingPress = ({
    profileImage,
    contactName,
    chatId,
    FriendNumber,
  }: any) => {
    dispatch(
      setMainprovider({
        friendId: chatId,
        userName: contactName,
        userImage: profileImage,
        roomType: "single",
        FriendNumber: FriendNumber,
      })
    );
    dispatch(setyesstart(true));
    dispatch(setnewroomType("single"));
    dispatch(
      setroominfo({
        roomimage: profileImage,
        roomName: contactName,
      })
    );
    dispatch(setisnewBlock(false));
    dispatch(setisnewmMute(true));
    dispatch(setisnewArchiveroom(false));
    dispatch(setnewroomID(""));
    navigation.push("ChattingScreen", {
      friendId: chatId,
      userName: contactName,
      userImage: profileImage,
      roomType: "single",
      inside: false,
      screenFrom: "Dashboard",
      FriendNumber: FriendNumber,
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    containerModal: {
      flex: 1,
      backgroundColor: "#000",
    },
    backgroundContainer: {
      position: "absolute",
      //top: "15%",
      bottom: 0,
      left: 0,
      right: 0,
    },
    background: {
      flex: 1,
      resizeMode: "cover", // or 'stretch' or 'contain' as needed
    },
    textView: {
      position: "absolute",
      bottom: 80,
      alignSelf: "center",
      backgroundColor: "rgba(12,12,12,0.5)",
      //backgroundColor:"red",
      padding: 10,
      paddingHorizontal: 15,

      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      // borderRadius: 15,
      width: "100%",
      // flex: 1,
    },
    text: {
      color: "#fff",
      textAlign: "justify",
      fontWeight: "600",
      fontSize: 14,
    },
    showMoreText: {
      color: "lightgray",
      // marginTop: 10,
      textAlign: "center",
      fontWeight: "bold",
    },
    mentionText: {
      color: "blue",
      fontWeight: "bold", // Highlight color for mentions
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <View style={styles.containerModal}>
        <StatusBar hidden />
        {content.length > 0 ? (
          <View style={styles.backgroundContainer}>
            {isPreLoading && (
              <ActivityIndicator
                animating
                color={colorTheme ? COLORS.primary_blue : COLORS.purple}
                size="large"
                style={{
                  flex: 1,
                  position: "absolute",
                  top: "50%",
                  left: "45%",
                }}
              />
            )}

            {content[current]?.file_type === "video" ? (
              <Video
                source={{
                  //@ts-ignore
                  uri: content[current]?.file,
                }}
                muted={false}
                repeat={false}
                resizeMode={"cover"}
                volume={1.0}
                rate={1.0}
                onProgress={() => setLoad(true)}
                ref={videoPlayer}
                autoplay={true}
                onLoadStart={() => {
                  setPreLoading(true);
                  setLoad(false);
                }}
                onReadyForDisplay={() => play()}
                onBuffer={() => onBufferVideo()}
                //@ts-ignore
                onLoad={start}
                onLoadEnd={() => {
                  play();
                  progress.setValue(0);
                }}
                onEnd={() => next()}
                style={{ height: height, width: width }}
              />
            ) : (
              <>
                {
                  //@ts-ignore
                  content[current]?.file_type === "template" ? (
                    <FastImage
                      onLoadEnd={() => {
                        progress.setValue(0);
                        play();
                      }}
                      source={images[current % images.length].src}
                      style={{
                        flex: 1,
                        width: null,
                        height: null,
                      }}
                    >
                      <View
                        style={{
                          //@ts-ignore
                          backgroundColor: content[current].background_color,
                          justifyContent: "center",
                          alignItems: "center",
                          paddingHorizontal: 15,
                          width: width,
                          height: height,
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.black,
                            fontSize: 18,
                            fontFamily: font.bold(),
                            textAlign: "center",
                          }}
                        >
                          {
                            //@ts-ignore
                            content[current].title
                          }
                        </Text>
                      </View>
                    </FastImage>
                  ) : (
                    <ColorMatrix
                      //@ts-ignore
                      matrix={
                        //@ts-ignore
                        content[current].background_color == null
                          ? filters[0].matrix //@ts-ignore
                          : filters[content[current].background_color].matrix
                      }
                      style={{ flex: 1 }}
                    >
                      {isPreLoading && (
                        <ActivityIndicator
                          animating
                          color={COLORS.green}
                          size="large"
                          style={{
                            flex: 1,
                            position: "absolute",
                            top: "50%",
                            left: "45%",
                          }}
                        />
                      )}

                      <ImageBackground
                        source={require("../../Assets/Image/whiteBackground.jpeg")}
                        style={styles.background}
                      >
                        <ColorMatrix
                          //@ts-ignore
                          matrix={
                            //@ts-ignore
                            content[current].background_color == null
                              ? filters[0].matrix //@ts-ignore
                              : filters[content[current].background_color]
                                  .matrix
                          }
                          style={{ flex: 1 }}
                        >
                          <FastImage
                            onLoadEnd={() => {
                              setIsMainImageLoaded(true);
                              progress.setValue(0);
                              play();
                            }}
                            source={{
                              //@ts-ignore
                              uri: content[current].file,
                            }}
                            resizeMode="contain"
                            onLoadStart={() => setPreLoading(true)}
                            onLoad={() => setPreLoading(false)}
                            style={{
                              height: height,
                              width: width,
                              resizeMode: "contain",
                              transform: [
                                {
                                  //@ts-ignore
                                  scale:
                                    content[current].scale == null
                                      ? 0 //@ts-ignore
                                      : parseFloat(content[current].scale),
                                },
                                {
                                  //@ts-ignore
                                  rotate:
                                    content[current].rotation == null
                                      ? `${0}deg` //@ts-ignore
                                      : `${content[current].rotation}deg`,
                                },
                              ],
                            }}
                          />
                        </ColorMatrix>
                      </ImageBackground>
                    </ColorMatrix>
                  )
                }

                {isMainImageLoaded &&
                  content[current]?.sticker_postion?.map((item, index) => (
                    <FastImage
                      key={index}
                      // onLoadEnd={() => {
                      //   progress.setValue(0);
                      //   play();
                      // }}
                      resizeMode="contain"
                      source={{
                        //@ts-ignore
                        uri: item.uri,
                      }}
                      style={{
                        width: 200,
                        height: 250,
                        zIndex: item.zIndex,
                        borderRadius: 15,

                        position: "absolute",
                        left: item.position.x,
                        top: item.position.y,
                        transform: [
                          { scale: item.scale == null ? 0 : item.scale },
                          {
                            rotate:
                              item.rotation == null
                                ? `${0}deg`
                                : `${item.rotation}deg`,
                          },
                        ],
                      }}
                    />
                  ))}

                {!allStickersLoaded && isPreLoading && (
                  <ActivityIndicator
                    animating
                    color={COLORS.green}
                    size="large"
                    style={{
                      flex: 1,
                      position: "absolute",
                      top: "50%",
                      left: "45%",
                    }}
                  />
                )}

                {isMainImageLoaded &&
                  content[current]?.image_text?.map((item, index) => (
                    <View
                      style={{
                        position: "absolute",
                        left: item.position.x,
                        top: item.position.y,
                        zIndex: 15560,
                        transform: [
                          { scale: item.scale == null ? 0 : item.scale },
                          {
                            rotate:
                              item.rotation == null
                                ? `${0}deg`
                                : `${item.rotation}deg`,
                          },
                        ],
                      }}
                    >
                      <Gestures
                        draggable={{
                          y: false,
                          x: false,
                        }}
                        rotatable={false}
                      >
                        <View style={{ maxWidth: 350 }}>
                          <Text
                            style={{
                              color: item.color,
                              fontFamily: chooseFont(item.font),
                              fontSize: 20,
                              padding: 5,
                              borderRadius: 8,
                            }}
                          >
                            {item.text}
                          </Text>
                        </View>
                      </Gestures>
                    </View>
                  ))}
              </>
            )}
          </View>
        ) : null}
        <View
          style={{
            flexDirection: "column",
            flex: 1,
            marginTop: isNotch ? 50 : 0,
            // marginTop: 10,
          }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,1)", "transparent"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 0,
            }}
          />
          <View style={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
            <View
              style={{
                flexDirection: "row",
                paddingTop: 10,
                paddingHorizontal: 10,
              }}
            >
              {content.map((index, key) => {
                return (
                  <View
                    key={key}
                    style={{
                      height: 4,
                      flex: 1,
                      flexDirection: "row",
                      backgroundColor: "rgba(117, 117, 117, 0.5)",
                      marginHorizontal: 2,
                    }}
                  >
                    <Animated.View
                      style={{
                        flex: current === key ? progress : content[key].finish,
                        height: 4,
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      }}
                    />
                  </View>
                );
              })}
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 15,
                left: 20,
              }}
            >
              <TouchableOpacity onPress={() => buttonPress()}>
                <Image
                  source={require("../../Assets/Icons/Back_Arrow.png")}
                  style={{ height: 20, width: 20, tintColor: "#ffff" }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Image
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 25,
                  marginHorizontal: 10,
                }}
                source={
                  userImage
                    ? {
                        uri: userImage,
                      }
                    : {
                        uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                      }
                }
              />
              <View style={{}}>
                <Text
                  style={{
                    fontFamily: font.bold(),
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  {userName}
                </Text>

                {
                  //@ts-ignore
                  content[current]?.created_at != null ? (
                    <StoryTimeConverter
                      isoTime={
                        //@ts-ignore
                        content[current]?.created_at
                      }
                    />
                  ) : null
                }
              </View>
            </View>
          </View>

          <View
            style={{
              height: 50,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 15,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                close();
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: 50,
                  paddingHorizontal: 15,
                }}
              ></View>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <TouchableWithoutFeedback
              onPress={() => previous()}
              onLongPress={() => stopAnimation()} //@ts-ignore
              onPressOut={() => start()}
            >
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              onPress={() => next()}
              onLongPress={() => stopAnimation()} //@ts-ignore
              onPressOut={() => start()}
            >
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
          </View>

          {content[current]?.caption?.length > 0 && replyVisible == false && (
            <View style={styles.textView}>
              <Text style={styles.text}>
                {renderCaption(content[current]?.caption)}
                {!expanded && content[current]?.caption?.length > 200
                  ? "..."
                  : ""}
              </Text>
              {content[current]?.caption?.length > 200 && (
                <TouchableOpacity
                // onPress={handlePress}
                >
                  <Text style={styles.showMoreText}>
                    {expanded ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {replyVisible && (
            <View
              style={{
                height: 55,
                backgroundColor: "white",
                borderRadius: 30,
                justifyContent: "center",
                width: "95%",
                alignSelf: "center",
                position: "absolute",
                elevation: 5,
                borderWidth: 1.5,
                borderColor: textTheme().textColor,
                bottom: 50,
                zIndex: 1001,
              }}
            >
              <View style={{ flexDirection: "row", width: "100%" }}>
                <View
                  style={{
                    width: "70%",
                    justifyContent: "center",
                    paddingLeft: 20,
                  }}
                >
                  <TextInput
                    autoFocus={true}
                    style={{ fontFamily: font.medium() }}
                    placeholderTextColor={COLORS.grey}
                    placeholder={t("textPlaceholder")}
                    onChangeText={(text) => setReplyText(text)}
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>

                <View
                  style={{
                    width: "15%",
                    justifyContent: "center",
                    paddingLeft: 20,
                  }}
                >
                  {content?.length > 0 ? (
                    <HeartLike
                      isLiked={content[current]?.is_like}
                      likeid={content[current]?.id}
                      current={current}
                    />
                  ) : null}
                </View>

                <TouchableOpacity
                  style={{
                    width: "15%",
                    justifyContent: "center",
                    height: "100%",
                    alignItems: "center",
                  }}
                  onPress={() => submitReply()}
                >
                  <Image
                    source={require("../../Assets/Icons/Send_message.png")}
                    style={{
                      width: 25,
                      height: 25,
                      tintColor: textTheme().textColor,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* ... existing code ... */}

          {replyVisible == false && (
            <TouchableOpacity
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                //bottom: 58,
                backgroundColor: "rgba(12,12,12,0.5)",
                height: 80,
                paddingBottom: 40,
                paddingTop: 5,
                zIndex: 1001,
              }}
              onPress={() => setReplyVisible(!replyVisible)}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: COLORS.grey,
                  fontFamily: font.bold(),
                }}
              >
                {t("reply")}
              </Text>
              <Image
                source={require("../../Assets/Icons/Vector.png")}
                style={{
                  width: 15,
                  height: 15,
                  tintColor: COLORS.grey,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <CustomBottomSheetModal
        ref={bottomSheetRef} //@ts-ignore
        navigation={navigation}
        newChattingPress={newChattingPress}
      />
    </KeyboardAvoidingView>
  );
}
