import NetInfo from "@react-native-community/netinfo";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ColorMatrix } from "react-native-color-matrix-image-filters";
import DeviceInfo from "react-native-device-info"; //@ts-ignore
import Gestures from "react-native-easy-gestures";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import Video from "react-native-video";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { COLORS } from "../../Components/Colors/Colors";
import { StoryTimeConverter } from "../../Components/DateTimeFormat/TimeConverter";
import { font } from "../../Components/Fonts/Font";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import { filters } from "../../Components/dargText/filter";
import {
  get_by_ChatId,
  get_by_User_allposts,
  get_story_viewers,
  get_user_story,
} from "../../Constant/Api";
import { StoryListModel } from "../Modals/StoryViewListModel";
import { useDispatch, useSelector } from "react-redux";
import { setProfileData } from "../../Redux/MessageSlice";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import { setBottomSheetStory } from "../../reducers/friendListSlice";
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
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import { ChannelTypeModal } from "../Modals/ChannelTypeModal";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
const { width, height } = Dimensions.get("screen");

interface Content {
  content: string;
  file_type: string;
  finish: number;
}

export default function MyStatusViewScreen({ route, navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const [end, setEnd] = useState<number>(0);
  const [current, setCurrent] = useState<number>(route.params.index);
  const [isPreLoading, setPreLoading] = useState<boolean>(false);
  const [load, setLoad] = useState<boolean>(false);
  const [videoDuratin, setVideoDuratin] = useState();
  const progress = useRef<Animated.Value>(new Animated.Value(0)).current;
  const [storyViewList, setStoryViewListModel] = useState(false);
  const [getActiveStory, setActiveStory] = useState([]);
  const [content, setContent] = useState<Content[]>([]);
  const videoPlayer = useRef(null);
  const isNotch = DeviceInfo.hasNotch();
  const [isChannelTypeModal, setChannelTypeModal] = useState(false);
  const publicSelected = true;
  const [images, setImages] = useState([
    { src: require("../../Assets/Image/Home.png") },
    { src: require("../../Assets/Image/girl_profile.png") },
    { src: require("../../Assets/Image/new_chat_intro_purple.png") },
  ]);

  const { t, i18n } = useTranslation();
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [stickerLoadStates, setStickerLoadStates] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);

  let premiumAlertHeading = t("Premium_Feature");
  let premiumAlertSubHeading = t(
    "Upgrade_to_Premium_to_see_who_watched_your_status"
  );
  let premiumAlertFirstButtonText = "Ok";
  let premiumAlertSecondButtonText = "Go To Premium";

  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);

  const bottomsheetFrom = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.bottomSheetStory
  );

  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );

  const dispatch = useDispatch();
  const bottomSheetRef = React.useRef(null);
  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  const handlePresentModalPress = () => bottomSheetRef?.current?.present();

  useEffect(() => {
    setIsMainImageLoaded(false);
    setStickerLoadStates([]);
  }, [current]);



  function AfterChoosingChannelType(value) {
    setChannelTypeModal(false);

    if (value == "public") {
    navigation.navigate("NewChannelScreen", { type: "public" });
    } else {
      navigation.navigate("NewChannelScreen", { type: "private" });
    }

    //newGroupPress(value);
  }

  
  useEffect(() => {
    if (bottomsheetFrom == "close for story") {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      start();
    }
  }, [bottomsheetFrom]);

  const handleStickerLoad = (index) => {
    setStickerLoadStates((prevState) => {
      const newState = [...prevState];
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      newState[index] = true;
      return newState;
    });
  };

  const allStickersLoaded =
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    stickerLoadStates.length === content[current]?.sticker_postion?.length &&
    stickerLoadStates.every(Boolean);

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
  // **********   Navigator for Status screen   ********** ///
  const buttonPress = () => {
    navigation.pop();
  };

  // **********   Video Buffer Function  ********** ///

  const onBufferVideo = () => {
    setPreLoading(true);
    stopAnimation();
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      route?.params?.fromScreen == "settingScreen"
        ? AllPostsListApi(globalThis.chatUserId)
        : getStoryApi();
      // getStoryApi();
    });
    return unsubscribe2;
  }, []);

  ////
  const AllPostsListApi = async (chatid: any) => {
    console.log("AllPostsListApi.data");
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
        profileApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********   Get Profile Api  ********** ///cd
  const getStoryApi = async () => {
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // @ts-ignore
      Authorization: "Bearer " + globalThis.Authtoken, //@ts-ignore
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      get_user_story,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        profileApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  const stopAnimation = () => {
    progress.stopAnimation();
  };

  // **********  Method for return the get profilr api Response   ********** ///
  const profileApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // setloaderModel(false);
      globalThis.errorMessage = ErrorStr; 
      setErrorAlertModel(true);
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      let tempData = ResponseData?.data?.map((item: any) => {
        item.sticker_postion = JSON.parse(item.sticker_postion);
        item.image_text = JSON.parse(item.image_text);
        item.mention = JSON.parse(item.mention);
        return item;
      });
      setContent(tempData);
      console.log("tempData", tempData);
    }
  };

  const parseCaption = (text) => {
    const mentionRegex = /@([\w\s]+)/g;
    const parts = [];
    let lastIndex = 0;

    text?.replace(mentionRegex, (match, p1, index) => {
      if (index > lastIndex) {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        parts.push({ text: text.slice(lastIndex, index), isMention: false });
      }
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      parts.push({ text: match, isMention: true });
      lastIndex = index + match.length;
    });

    if (lastIndex < text?.length) {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      parts.push({ text: text?.slice(lastIndex), isMention: false });
    }

    return parts;
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
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr; 
      setErrorAlertModel(true);

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
          userProfile: ResponseData?.data?.user?.profile_image,
        })
      );
      stopAnimation();
      handlePresentModalPress();
      dispatch(setBottomSheetStory("open from story"));
      setloaderMoedl(false);
    }
  };

  // Usage

  const renderCaption = (inputText) => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    const mentionsList = content[current]?.mention || [];

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
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          <Text key={`${lastIndex}-text`}>
            {inputText.slice(lastIndex, partIndex)}
          </Text>
        );
      }

      if (userPremium && urlRegex.test(part)) {
        elements.push(
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          <Text
            key={`${index}-url`}
            onPress={() => Linking.openURL(part)}
            style={{ color: "blue", textDecorationLine: "underline" }}
          >
            {part}{" "}
          </Text>
        );
      } else if (userPremium && mentionRegex.test(part)) {
        const match = part.match(mentionRegex);
        if (match) {
          const mentionName = match[0].replace("@", "").trim();

          const mention = mentionsList.find(
            (m) => m.name.toLowerCase() === mentionName.toLowerCase()
          );
          if (mention) {
            elements.push(
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              <Text
                key={`${index}-mention`}
                onPress={() => getProfileApi(mention.chat_user_id)}
                style={{ color: "blue", fontWeight: "bold" }}
              >
                {`@${mentionName}`}{" "}
              </Text>
            );
          } else {
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            elements.push(<Text key={`${index}-mention`}>{part}</Text>);
          }
        }
      } else {
        // For non-premium users, simply display the text without any formatting
        elements.push(
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          <Text key={`${index}-plain`}>{part}</Text>
        );
      }

      lastIndex = partIndex + part.length;
    });

    if (lastIndex < inputText.length) {
      elements.push(
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        <Text key={`${lastIndex}-end`}>{inputText.slice(lastIndex)}</Text>
      );
    }

    return elements;
  };

  // **********   status start method   ********** ///

  const start = (n: number) => {
    if (content[current]?.file_type == "video") {
      if (n !== undefined) {
        //@ts-ignore
        setVideoDuratin(Math.round(n.duration) * 1000);
      }
      // type video

      if (load) {
        Animated.timing(progress, {
          toValue: 1,
          duration: videoDuratin,
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) {
            next();
          }
        });
      }
    } else {
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        parseCaption(content[current]?.caption);
        if (finished) {
          next();
        }
      });
    }
  };

  function play(): void {
    start(end);
  }

  function next(): void {
    if (current !== content.length - 1) {
      let data = [...content];
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
    if (current - 1 >= 0) {
      let data = [...content];
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

  const openModelList = (storyId: any) => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        setNoInternetModel(true);
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        return;
      } else {
        stopAnimation();
        getStoryViewListApi(storyId);
      }
    });
  };

  // **********   Headers for Get Active Story Api  ********** ///cd
  const getStoryViewListApi = async (storyId: any) => {
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // @ts-ignore
      Authorization: "Bearer " + globalThis.Authtoken, //@ts-ignore
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      get_story_viewers + storyId,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        getStoryViewListApiSuccess(ResponseData, ErrorStr);
      }
    );
  };
  // **********  Method for return the get profilr api Response   ********** ///
  const getStoryViewListApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr; 
      setErrorAlertModel(true);
     // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      // Navigate to another screen or handle the error in some way
    } else {
      if (ResponseData.data.length > 0) {
        setActiveStory(ResponseData.data);
        if (globalThis.isUserPremium) {
          setStoryViewListModel(true);
        } else {
          setShowPremiumAlert(true);
        }
      }
    }
  };

  function close(): void {
    setContent([]);
    progress.setValue(0);
    setLoad(false);
    navigation.navigate("BottomBar", { screen: "chatScreen" });
  }

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
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    eyeIcon: {
      // marginTop: 5,
      height: 18,
      width: 18,
      tintColor: COLORS.white,
      marginRight: 5,
    },
    background: {
      flex: 1,
      resizeMode: "cover", // or 'stretch' or 'contain' as needed
    },
    textView: {
      position: "absolute",
      bottom: 60,
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
    <View style={styles.containerModal}>
      <StoryListModel
        visible={storyViewList}
        storyViewList={getActiveStory}
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        likedCount={content[current]?.likes_count}
        cancel={() => {
          //@ts-ignore
          setStoryViewListModel(false), start();
        }}
        onRequestClose={() => {
          //@ts-ignore
          setStoryViewListModel(false), start();
        }}
      />

<ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
      <NoInternetModal
        visible={noInternetModel}
        onRequestClose={() => setNoInternetModel(false)}
        headingTaxt={t("noInternet")}
        NoInternetText={t("please_check_internet")}
        cancelButton={() => setNoInternetModel(false)}
      />
      <PremiumAlert
        visible={showPremiumAlert}
        onRequestClose={() => setShowPremiumAlert(false)}
        cancel={() => setShowPremiumAlert(false)}
        Heading={premiumAlertHeading}
        SubHeading={premiumAlertSubHeading}
        FirstButton={premiumAlertFirstButtonText}
        SecondButton={premiumAlertSecondButtonText}
        firstButtonClick={() => setShowPremiumAlert(false)}
        secondButtonClick={() => {
          if (premiumAlertSecondButtonText == "Cancel") {
            setShowPremiumAlert(false);
          } else {
            setShowPremiumAlert(false);
            navigation.navigate("PremiumFeaturesScreen");
          }
        }}
      />
      <StatusBar hidden />

      {content.length > 0 ? (
        <View style={styles.backgroundContainer}>
          {isPreLoading && (
            <ActivityIndicator
              animating
              color={colorTheme ? COLORS.primary_blue : COLORS.purple}
              size="large"
              style={{ flex: 1, position: "absolute", top: "50%", left: "45%" }}
            />
          )}
          {content[current].file_type === "video" ? (
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
              onLoadStart={() => setPreLoading(true)}
              onReadyForDisplay={() => play()}
              onBuffer={() => onBufferVideo()}
              // @ts-ignore
              onLoad={start}
              onLoadEnd={() => {
                progress.setValue(0);
                play();
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
                        width: "100%",
                        height: "100%",
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
                  <View
                    //@ts-ignore
                    // matrix={
                    //   //@ts-ignore
                    //   content[current].background_color == null
                    //     ? filters[0].matrix //@ts-ignore
                    //     : filters[content[current].background_color].matrix
                    // }
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

                    <View
                     // source={require("../../Assets/Image/whiteBackground.jpeg")}
                      style={styles.background}
                    >
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
                            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            resizeMode: "contain",
                            transform: [
                              {
                                //@ts-ignore
                                scale:
                                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                  content[current].scale == null
                                    ? 0 //@ts-ignore
                                    : parseFloat(content[current].scale),
                              },
                              {
                                //@ts-ignore
                                rotate:
                                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                  content[current].rotation == null
                                    ? `${0}deg` //@ts-ignore
                                    : `${content[current].rotation}deg`,
                              },
                            ],
                          }}
                        />
                      </ColorMatrix>
                    </View>
                  </View>
                )
              }

              {isMainImageLoaded &&
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
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
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
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
            {content?.map((index, key) => {
              return (
                <View
                  key={key}
                  style={{
                    height: 4,
                    flex: 1,
                    flexDirection: "row",
                    marginHorizontal: 2,
                    backgroundColor:
                      route.params.index > 0 && key < current
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(117, 117, 117, 0.5)",
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
                //@ts-ignore
                globalThis.userImage
                  ? {
                      //@ts-ignore
                      uri: globalThis.userImage,
                    }
                  : {
                      uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                    }
              }
            />
            <View style={{}}>
              <Text
                style={{
                  fontWeight: "bold",
                  color: "white",
                  fontSize: 16,
                  fontFamily: font.bold(),
                }}
              >
                {t("my_status")}
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

        {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          content[current]?.caption?.length > 0 && (
            <View style={styles.textView}>
              <Text style={styles.text}>
                {
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  renderCaption(content[current]?.caption)
                }
                {
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  !expanded && content[current]?.caption?.length > 200
                    ? "..."
                    : ""
                }
              </Text>
              {/* <Text style={styles.text}>
                {expanded
                  ? renderCaption(content[current]?.caption)
                  : renderCaption(content[current]?.caption?.slice(0, 150))}
              </Text> */}
              {/* {content[current]?.caption?.length > 100 && (
            <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            >
              <Text style={styles.showMoreText}>
                {expanded ? "Show Less" : "Show More"}
              </Text>
            </TouchableOpacity>
          )} */}
            </View>
          )
        }
        <TouchableOpacity
          style={{
            flex: 1,
            position: "absolute",
            bottom: 0,
            width: "100%",
            alignSelf: "center",
            flexDirection: "row",
            justifyContent: "center",
            // backgroundColor: "rgba(0,0,0,0.8)",
            backgroundColor: "rgba(12,12,12,0.5)",
            // alignItems:"center",
            height: 60,
            paddingRight: 5,
            zIndex: 1001,
          }}
          //@ts-ignore
          onPress={() => openModelList(content[current]?.id)}
          activeOpacity={0.7} //@ts-ignore
          disabled={content[current]?.viewers_count == 0 ? true : false}
        >
          <View
            style={{
              height: 40,
              flexDirection: "row",
              alignSelf: "flex-start",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../Assets/Icons/Eye.png")}
              style={styles.eyeIcon}
              // resizeMode="contain"
            />

            <Text
              style={{
                color: COLORS.white,
                // marginTop: 3,
                fontSize: 13,
                fontFamily: font.bold(),
                // lineHeight: 18,
                // height: 18,
              }}
            >
              {
                //@ts-ignore
                content[current]?.viewers_count
              }
            </Text>
            <Image
              source={require("../../Assets/Image//like.png")}
              style={{
                marginRight: 2,
                marginTop: 1.5,
                height: 18,
                width: 18,
                tintColor: "red",
                marginLeft: 20,
              }}
              resizeMode="contain"
            />

            <Text
              style={{
                color: COLORS.white,
                fontSize: 13,
                fontFamily: font.semibold(),
                // lineHeight: 18,
                // height: 18,
              }}
            >
              {
                //@ts-ignore
                content[current]?.likes_count
              }
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <CustomBottomSheetModal
        ref={bottomSheetRef} //@ts-ignore
        navigation={navigation}
        newChattingPress={newChattingPress}
        openChannelModal={()=>{
          setChannelTypeModal(true);
        }}
      />
       <ChannelTypeModal
          visible={isChannelTypeModal}
      isPublicSelected={publicSelected}
          onRequestClose={() => setChannelTypeModal(false)}
          onNextClick={AfterChoosingChannelType}
        />
    </View>
  );
}
