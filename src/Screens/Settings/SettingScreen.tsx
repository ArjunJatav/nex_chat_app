import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";
import DeviceInfo from "react-native-device-info";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  iconTheme,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import renderIf from "../../Components/renderIf";
import {
  delete_account,
  enable_notifications,
  get_by_ChatId,
  get_by_User_allposts,
  get_profile,
  loguot,
  settings_notifications,
} from "../../Constant/Api";
import { settingTop } from "../../Navigation/Icons";
import { socket, socketDisconnect } from "../../socket";
import {
  clearChatRooms,
  deleteMessageByResId,
  getDisapperMessage,
  UpdateProfileImage,
} from "../../sqliteStore";
import { ChatBackUpModel } from "../Modals/ChatBackUpModel";
import { ChatSettingModel } from "../Modals/ChatSettingModel";
import { DeleteAccountModel } from "../Modals/DeleteAccountModel";
import { LoaderModel } from "../Modals/LoaderModel";
import { LogOutModel } from "../Modals/LogOutModel";
import { RateUsModel } from "../Modals/RateUs";
import { SelectLanguageModel } from "../Modals/SelectLanguageModel";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setbackupsuccessfull, toggleSwitch } from "../../Redux/backupSlice";
import { showToast } from "../../Components/CustomToast/Action";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import { setProfileData } from "../../Redux/MessageSlice";
import { setStorylist } from "../../reducers/friendListSlice";

const isDarkMode = true;
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
// eslint-disable-next-line
export default function SettingScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [switchValue, setSwitchValue] = useState(true);
  const [phoneNumber, setphoneNumber] = useState("");
  const [userName, setuserName] = useState("");
  const [userTagline, setUserTagline] = useState("");
  const [userImage, setuserImage] = useState("");
  const [chatBackUpModel, setchatBackUpModel] = useState(false);
  const [chatLogOutModel, setlogOutModel] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [languageModel, setlanguageModel] = useState(false);
  const [chatSettingModel, setChatSettingModel] = useState(false);
  const [rateModel, setRateModel] = useState(false);
  const [deleteAccountModel, setDeleteAccountModel] = useState(false);
  const { t } = useTranslation();
  const [isUIUpdated, setIsUIUpdated] = useState(false);

  const [imageSource, setImageSource] = useState(null);
  const [topBackground, setTopBackground] = useState("");
  const [isForceReMount, setIsForceRemound] = useState(true);
  // eslint-disable-next-line
  const { backupsuccessfull } = useSelector((state: any) => state.backup);
  const bottomSheetSettingRef = useRef(null); //@ts-ignore
  const handlePresentModalPress = useCallback(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    bottomSheetSettingRef.current?.present(), [];
  });
  ////// ******    PREMIMUM  USER  ********  ////
  const [stealthMode, setStealthMode] = useState(
    (globalThis.stealthModeValue== "true" ? true : false)
  );

  const stealthModeValue = async (value: boolean) => {
    console.log("value>>>>", value);

    // To handle switch toggle
    setStealthMode(value);
    globalThis.stealthModeValue = value;
    //  setStealthMode(value);
    await AsyncStorage.setItem("stealthMode", value.toString());
  };

  useFocusEffect(
    React.useCallback(() => {
      if (backupsuccessfull) {
        dispatch(setbackupsuccessfull(false));
        dispatch(toggleSwitch(false));
      } else {
        dispatch(setbackupsuccessfull(false));
      }
    }, [])
  );

  useEffect(() => {
    console.log("globalThis.stealthMode>>", globalThis.stealthModeValue);

    // setloaderMoedl(true);
    setuserName(globalThis.userName);
    setphoneNumber(globalThis.phone_number);
    // setStealthMode(globalThis.stealthMode);
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      if (
        globalThis.selectTheme == "christmas" ||
        globalThis.selectTheme == "newYear" ||
        globalThis.selectTheme == "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
        globalThis.selectTheme == "mexicoTheme" ||
        globalThis.selectTheme == "usindepTheme"
      ) {
        setTopBackground(themeModule().theme_background);
        setImageSource(settingTop().BackGroundImage);
      } else {
        setTopBackground(themeModule().theme_background);
        setImageSource(null);
      }
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected === false) {
          Alert.alert(t("noInternet"), t("please_check_internet"), [
            { text: t("ok") },
          ]);
          setloaderMoedl(false);
          return;
        } else {
          setIsUIUpdated(!isUIUpdated);
          getProfileApi();
          getNotificatonApi();
        }
      });
    });
    return unsubscribe2;
  }, []);

  const saveSwitchValue = async (value: boolean) => {
    try {
      await AsyncStorage.setItem("switchValue", value.toString());
    } catch (error) {
      console.error("Error saving switch value to AsyncStorage:", error);
    }
  };

  const buttonEnable = async (value: boolean) => {
    // To handle switch toggle
    setSwitchValue(value);
    saveSwitchValue(value);

    showToast(value ? "Notifications Enabled" : "Notifications Disabled");

    const data = {
      enable_notifications: value,
    };

    PostApiCall(
      enable_notifications,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        apiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // ********** Logout Api Calling method    ********** ///
  const logOutButton = () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        return;
      } else {
        loguotApi();
      }
    });
  };

  // ********** Delete Account  Api Calling method    ********** ///
  const deleteAccount = () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);
        return;
      } else {
        socket.emit("logout", { userId: globalThis.chatUserId });
        deleteAccountApi();
        setDeleteAccountModel(false);
      }
    });
  };

  // **********   Headers for Delete Account Api  ********** ///
  const deleteAccountApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      delete_account,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        deleteAccountApiSucess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the Delete Account api Response   ********** ///
  // eslint-disable-next-line
  const deleteAccountApiSucess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);

      setloaderMoedl(false);
    } else {
      globalThis.Authtoken = undefined;
      globalThis.chatUserId = undefined;
      globalThis.userName = undefined;
      globalThis.Authtoken = undefined;
      globalThis.token = undefined;
      globalThis.chatUserId = undefined;
      globalThis.userChatId = undefined;
      globalThis.userImage = undefined;
      globalThis.thumbnail = undefined;
      globalThis.image = undefined;
      globalThis.userName = undefined;
      globalThis.displayName = undefined;
      globalThis.phone_number = undefined;
      globalThis.sender_id = undefined;
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userImage");
      await AsyncStorage.removeItem("thumbnail");
      await AsyncStorage.removeItem("userName");
      await AsyncStorage.removeItem("chatUserID");
      // await AsyncStorage.removeItem("isContactUploaded");
      await AsyncStorage.removeItem("phone_number");
      await AsyncStorage.removeItem("lockChatPinCode");
      await AsyncStorage.removeItem("chatlockusernumber");
      navigation.navigate("Login");
      setloaderMoedl(false);
    }
  };

  const notificationScreen = () => {
    navigation.navigate("NotificationScreen");
  };
  const fontSettingScreen = () => {
    navigation.navigate("FontSettingScreen");
  };

  const EditProfile = () => {
    // setloaderMoedl(true);
    navigation.navigate("EditProfileScreen", {
      phoneNumber: phoneNumber,
      userName: userName,
      userImage: userImage,
      userTagline: userTagline == null ? "" : userTagline,
    });
    setloaderMoedl(false);
  };

  const myScanner = () => {
    navigation.navigate("MyScannerScreen");
  };

  // **********   Headers for api ********** ///
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
  };

  // **********  Method for return the api Response   ********** ///
  // eslint-disable-next-line
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      // Navigate to another screen or handle the error in some way
    } else {
      console.log("ResponseData   grt", ResponseData);
      // setNotificationPermission(ResponseData.status   ? 'undetermined' : 'disabled');

      navigation.navigate("BottomBar");
      setloaderMoedl(false);
    }
  };

  const message_data =
    "https://play.google.com/store/apps/details?id=com.deucetek.tokee";
  const message_link =
    "https://apps.apple.com/fj/app/tokee-messenger/id1641356322";

  const handleClick = () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        return;
      } else {
        Linking.canOpenURL(
          Platform.OS === "ios" ? message_link : message_data
        ).then((supported) => {
          if (supported) {
            Linking.openURL(
              Platform.OS === "ios" ? message_link : message_data
            );
          }
        });
        setRateModel(false);
      }
    });
  };

  // eslint-disable-next-line
  const openWebViewUrl = (pageName: any, pageUrl: any) => {
    navigation.navigate("WebScreen", { pageName: pageName, pageUrl: pageUrl });
  };

  // **********   GET NOTIFICATION API  ********** ///cd
  const getNotificatonApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      settings_notifications,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        NotificationApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get profilr api Response   ********** ///
  // eslint-disable-next-line
  const NotificationApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      // Navigate to another screen or handle the error in some way
    } else {
      setloaderMoedl(false);
      const Notification_value = ResponseData.data.enable_notifications;
      if (Notification_value == "1") {
        setSwitchValue(true);
      } else {
        setSwitchValue(false);
      }
    }
  };

  // **********   Headers for Get Profile Api  ********** ///cd
  const getProfileApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(get_profile, headers, navigation, (ResponseData, ErrorStr) => {
      profileApiSuccess(ResponseData, ErrorStr);
    });
  };

  // **********  Method for return the get profilr api Response   ********** ///
  // eslint-disable-next-line
  const profileApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      // Navigate to another screen or handle the error in some way
    } else {
      setloaderMoedl(false);
      console.log("RESPONSE GET ", ResponseData.data);

      // Custom logic to execute on success
      setUserTagline(ResponseData.data.tagline);
      setIsForceRemound(!isForceReMount);
      setuserImage("");
      setuserImage(ResponseData.data.thumbnail);
      setuserName(ResponseData.data.first_name);
      setphoneNumber(ResponseData.data.phone_number);
      globalThis.userImage = ResponseData.data.profile_image;
      globalThis.thumbnail = ResponseData.data.thumbnail;
      globalThis.userName = ResponseData.data.first_name;
      globalThis.displayName = ResponseData.data.first_name;
      globalThis.myScanner = ResponseData.data.qrcode;
      globalThis.uniqueId = ResponseData?.data?.unique_id;
      globalThis.chatUserId = ResponseData?.data?.chat_user_id;
      globalThis.isUserPermimum =
        ResponseData?.data?.premium == 1 ? true : false;
      console.log("globalThis.isUserPermimum", globalThis.isUserPermimum);
      // eslint-disable-next-line
      ResponseData.setting.map((item: any) => {
        if (item.key == "MIRROR_API_KEY") {
          globalThis.mirrorApiKey = item.value;
        }

        if (item.key == "SHOW_MIRROR_API_AVTAR") {
          globalThis.showMirrorApiAvatar = item.value;
        }
      });
      setloaderMoedl(false);
      setIsUIUpdated(!isUIUpdated);
    }
  };

  // **********   Headers for loguot Api  ********** ///
  const loguotApi = async () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), "", [{ text: t("ok") }]);
        return;
      } else {
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.Authtoken,
          localization: globalThis.selectLanguage,
        };

        GetApiCall(loguot, headers, navigation, (ResponseData, ErrorStr) => {
          loguotApiSucess(ResponseData, ErrorStr);
          // socketDisconnect();
        });
        setlogOutModel(false);
      }
    });
  };

  const UserLoggedOut = async () => {
    globalThis.Authtoken = undefined;
    globalThis.chatUserId = undefined;
    globalThis.userImage = undefined;
    globalThis.thumbnail = undefined;
    globalThis.userName = undefined;
    globalThis.Authtoken = undefined;
    globalThis.token = undefined;
    globalThis.chatUserId = undefined;
    globalThis.userChatId = undefined;
    globalThis.image = undefined;
    globalThis.userName = undefined;
    globalThis.displayName = undefined;
    globalThis.phone_number = undefined;
    globalThis.sender_id = undefined;

    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userImage");
    await AsyncStorage.removeItem("thumbnail");
    await AsyncStorage.removeItem("userName");
    await AsyncStorage.removeItem("chatUserID");
    //await AsyncStorage.removeItem("isContactUploaded");
    await AsyncStorage.removeItem("phone_number");
    await AsyncStorage.removeItem("lockChatPinCode");
    await AsyncStorage.removeItem("chatlockusernumber");

    setloaderMoedl(false);
    socketDisconnect();

    clearChatRooms();
    navigation.navigate("Login");
    setloaderMoedl(false);
  };
  // **********  Method for return the loguot api Response   ********** ///
  // eslint-disable-next-line
  const loguotApiSucess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
    } else {
      // eslint-disable-next-line
      getDisapperMessage((data: any) => {
        if (data) {
          for (const d of data) {
            const params = {
              userId: globalThis.userChatId,
              messageId: [d.mId],
              delete_type: "me",
              message_type: d.message_type,
              roomId: d.roomId,
            };
            deleteMessageByResId(params.messageId);
            socket.emit("deleteMessage", params);
          }
        }
      });
      socket.emit("logout", { userId: globalThis.chatUserId });
      // Custom logic to execute on succes
      Alert.alert(t("success"), ResponseData.message, [
        { text: t("ok"), onPress: () => UserLoggedOut() },
      ]);
    }
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    buttonText: {
      fontSize: 14,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    button: {
      height: 50,
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: textTheme().textColor,
    },
    nameText: {
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
      color: COLORS.black,
      paddingLeft: 10,
      height: 25,
    },
    name2Text: {
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.regular(),
      color: COLORS.black,
      paddingLeft: 10,
      height: 25,
    },
    nText: {
      color: COLORS.black,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
      textAlign: "center",
    },
    deleteAccount: {
      color: "red",
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },

    settingTopContainer: {
      backgroundColor: topBackground,
      paddingBottom: 60,
    },
    newChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      borderColor: "#fff",
      borderRadius: 15,
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
    editProfile: {
      flexDirection: "row",
      width: "10%",
      alignItems: "center",
    },
    switchButton: {
      borderRadius: 15,
      borderWidth: 1,
      backgroundColor: "black",
      height: 25,
      borderColor: "transparent",
      flexDirection: "row",
      width: "15%",
    },
    newChatIcon: {
      alignItems: "center",
      height: DeviceInfo.isTablet() ? 27 : 22,
      width: DeviceInfo.isTablet() ? 27 : 22,
      tintColor: iconTheme().iconColorNew,
    },

    chatContainer: {
      backgroundColor: "#fff",
      paddingHorizontal: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
    },

    profileContainer: {
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 10,
      margin: 0,
      flexDirection: "row",
      // backgroundColor:COLORS.lightgrey,
      width: "100%",
    },

    enableNoticication: {
      alignItems: "center",
      justifyContent: "space-between",
      alignSelf: "center",
      marginVertical: 10,
      marginLeft: 2,
      marginRight: 0,
      // marginHorizontal:"auto",
      padding: 10,
      height: 55,
      borderRadius: 10,
      flexDirection: "row",
      width: windowWidth - 34,
      backgroundColor: "#FFF",
      shadowColor: COLORS.lightgrey,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      //shadowRadius: 5,
      elevation: 5,
    },
    nameContainer: {
      justifyContent: "center",
      margin: 0,
      width: "60%",
      flexDirection: "column",
    },
    enableTextAndIcon: {
      // justifyContent: "center",
      margin: 0,
      width: "60%",
      flexDirection: "row",
    },

    listContainer: {
      justifyContent: "center",
      marginVertical: 4,
      marginTop: 2,
      flexDirection: "column",
      height: 38,
    },
    Container: {
      justifyContent: "center",
      width: "10%",
    },
    circleImageLayout: {
      width: DeviceInfo.isTablet() ? 60 : 50,
      height: DeviceInfo.isTablet() ? 60 : 50,
      borderRadius: DeviceInfo.isTablet() ? 30 : 25,
    },
    text: {
      fontSize: 25,
      textAlign: "center",
      margin: 30,
    },
  });

  const getUniqueImageUrl = (userIma) => {
    return `${userIma}?${new Date().getTime()}`;
  };




    // eslint-disable-next-line
    const getBottomProfileApi = async (chatid: any, username: any, userimage: any) => {
     
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
        get_by_ChatId,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          getapiSuccess(ResponseData, ErrorStr, username, userimage);
        }
      );
    };


    const getapiSuccess = (
      // eslint-disable-next-line
      ResponseData: any,
      // eslint-disable-next-line
      ErrorStr: any,
      // eslint-disable-next-line
      username: any,
      // eslint-disable-next-line
      userimage: any
    ) => {
      if (ErrorStr) {
        Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
        setloaderMoedl(false);
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
            display_name: username,
            profile_image: ResponseData?.data?.user?.profile_image,
          })
        );
  
        UpdateProfileImage(
          ResponseData?.data?.user?.chat_user_id,
          ResponseData?.data?.user?.profile_image,
          // eslint-disable-next-line
          (res: any) => {
            if (res) {
           //   console.log("profile image updated");
            } else {
              console.log("can't update profile iamge");
            }
          }
        );
        handlePresentModalPress();
        setloaderMoedl(false);
      }
    };


    const AllPostsListApi = async (chatid: any, ) => {
      dispatch(
        setProfileData({
          Image_text: "",
          sticker_position: "",
          chat_user_id: chatid,
        })
      );
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
          getAllPostByuser(ResponseData, ErrorStr,);
        }
      );
    };
  
     // eslint-disable-next-line
     const getAllPostByuser = (ResponseData: any, ErrorStr: any) => {
      if (ErrorStr) {
        Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
        setloaderMoedl(false);
      } else {
       console.log("ResponseData>>>>>",ResponseData.data);
       dispatch(setStorylist(ResponseData.data))
      }
       
    };
  

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={topBackground}
    >
      <ChatBackUpModel
        visible={chatBackUpModel}
        onRequestClose={() => setchatBackUpModel(false)}
        cancel={() => setchatBackUpModel(false)}
      />
<CustomBottomSheetModal
          ref={bottomSheetSettingRef}
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          navigation={navigation}
          // newChattingPress={newChattingPress}
          fromScreen={"settingScreen"}
        />
      <LogOutModel
        visible={chatLogOutModel}
        onRequestClose={() => setlogOutModel(false)}
        cancel={() => setlogOutModel(false)}
        logout={() => logOutButton()}
      />

      <SelectLanguageModel
        visible={languageModel}
        onRequestClose={() => setlanguageModel(false)}
        cancel={() => setlanguageModel(false)}
      />

      <ChatSettingModel
        visible={chatSettingModel}
        cancel={() => setChatSettingModel(false)}
      />
      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />

      <RateUsModel
        visible={rateModel}
        onRequestClose={() => setRateModel(false)}
        cancel={() => setRateModel(false)}
        rateApp={() => handleClick()}
      />
      <DeleteAccountModel
        visible={deleteAccountModel}
        onRequestClose={() => setDeleteAccountModel(false)}
        cancel={() => setDeleteAccountModel(false)}
        delete={() => deleteAccount()}
      />

      <View
        style={{
          position: "relative",
          backgroundColor: topBackground,
        }}
      >
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={topBackground}
          />
        ) : null}
        <TopBar
          showTitle={true}
          title={t("settings")}
          checked={globalThis.selectTheme}
        />
        <View style={styles.settingTopContainer}></View>

        {renderIf(
          imageSource != null,

          <ImageBackground
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            source={imageSource}
            resizeMode="cover"
            style={{
              height: "100%",
              width: windowWidth,
              marginTop: 0,
              position: "absolute",
              bottom: 0,
              zIndex: 0,
            }}
          ></ImageBackground>
        )}
      </View>

      <View style={styles.chatContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={true}
          style={{
            height: "90%",
            maxHeight: DeviceInfo.hasNotch()
              ? windowHeight - 250
              : windowHeight - 190,
          }}
        >
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() =>{getBottomProfileApi(globalThis.chatUserId,userName,userImage), AllPostsListApi( globalThis.chatUserId,);}}
            activeOpacity={0.7}
          >
            {isForceReMount}
            <View style={styles.Container}>
              {userImage?.length > 0 ? (
                <Image
                  source={{ uri: getUniqueImageUrl(userImage) }}
                  style={styles.circleImageLayout}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={{
                    uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                  }}
                  style={styles.circleImageLayout}
                  resizeMode="cover"
                />
              )}
            </View>
            <View style={styles.nameContainer}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.nameText}>{userName?.toUpperCase()}</Text>
                {globalThis.isUserPermimum && (
                  <Image
                    source={require("../../Assets/Icons/bx_star_dark.png")}
                    style={{
                      height: 15,
                      width: 15,
                      marginLeft: 5,
                      marginTop: 2,
                      tintColor: iconTheme().iconColorNew,
                    }}
                  />
                )}
              </View>

              <Text style={styles.name2Text}>{phoneNumber}</Text>
            </View>
            <TouchableOpacity
              onPress={() => EditProfile()}
              activeOpacity={0.7}
              style={styles.editProfile}
            >
              <Image
                source={require("../../Assets/Icons/NotePen.png")}
                style={styles.newChatIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => myScanner()}
              activeOpacity={0.7}
              style={styles.editProfile}
            >
              <Image
                source={require("../../Assets/Icons/scan.png")}
                style={styles.newChatIcon}
              />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={[styles.enableNoticication, { alignItems: "center" }]}>
            <View style={[styles.enableTextAndIcon, { alignItems: "center" }]}>
              <Image
                source={
                  switchValue
                    ? require("../../Assets/Icons/notification.png")
                    : require("../../Assets/Icons/mute_notificatio.png")
                }
                style={[styles.newChatIcon, { marginRight: 10 }]}
              />
              <Text style={styles.nText}>{t("enable_notifications")}</Text>
            </View>
            <View>
              <Switch onValueChange={buttonEnable} value={switchValue} />
            </View>
          </View>
          {renderIf(
            switchValue,
            <Text style={{ color: "gray", marginLeft: 10 }}>
              To receive Tokee notifications, please enable notification
              permissions in your phone’s settings.
            </Text>
          )}
         
          <View style={[styles.enableNoticication, { alignItems: "center" }]}>
            <View style={[styles.enableTextAndIcon, { alignItems: "center" }]}>
              <Image
                source={
                  stealthMode
                    ? require("../../Assets/Icons/Hide.png")
                    : require("../../Assets/Icons/Eye.png")
                }
                style={[styles.newChatIcon, { marginRight: 10 }]}
              />
              <Text style={styles.nText}>{"Stealth Mode"}</Text>
            </View>
            <View>
              <Switch onValueChange={stealthModeValue} value={stealthMode} />
            </View>
          </View>
          {renderIf(
            stealthMode,
            <Text style={{ color: "gray", marginLeft: 10 }}>
              Gain the ability to browse other people’s stories anonymously with Stealth Mode.
            </Text>
          )}
          <View
            style={[
              styles.enableNoticication,
              { height: 300, flexDirection: "column" },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 5,
                },
              ]}
              onPress={() => myScanner()}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/scan.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("my_qr_code")} </Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 0.3,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  // backgroundColor:COLORS.lightgrey
                },
              ]}
              onPress={() => setlanguageModel(true)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/language_glob.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("language")} </Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 0.3,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              ]}
              onPress={() => navigation.navigate("ChatBackupScreen")}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/Chat_backup_new.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("chat_backup")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 0.3,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              ]}
              onPress={() => setChatSettingModel(true)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/chat_setting.png")}
                  style={[
                    styles.newChatIcon,
                    { marginRight: 10, height: 24, width: 23 },
                  ]}
                />
                <Text style={styles.nText}>{t("chat_setting")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 0.5,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              ]}
              onPress={() => navigation.navigate("AppIconScreen")} /// AppIconScreen
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/chnage_app_icon.png")}
                  style={[
                    styles.newChatIcon,
                    { marginRight: 10, width: 20, height: 20 },
                  ]}
                />
                <Text style={styles.nText}>{t("App Icon")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 0.3,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 5,
                },
              ]}
              onPress={() => fontSettingScreen()}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/font_setting.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("Font_Settings")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.enableNoticication,
              { height: 55, flexDirection: "column" },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 5,
                },
              ]}
              onPress={() => navigation.navigate("TokeePremium")}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/Group.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>Tokee Premium</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.enableNoticication,
              { height: 140, flexDirection: "column" },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 5,
                },
              ]}
              onPress={() => notificationScreen()}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/exclamation.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("promotional_events")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 0.5,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              ]}
              onPress={() =>
                openWebViewUrl(
                  "Privacy Policy",
                  "https://tokee.app/privacy-policy/"
                )
              }
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/terms.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("privacy_policy")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>

            {/* by-dinki */}
            <View
              style={{
                height: 0.5,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              ]}
              onPress={() =>
                openWebViewUrl(
                  "terms n condition",
                  "https://tokee.app/terms-of-use/"
                )
              }
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/Privacy_policy.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("terms_and_condition")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.enableNoticication,
              { height: 100, flexDirection: "column" },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 5,
                },
              ]}
              onPress={() => navigation.navigate("FeedbackScreen")}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/Feedback_icon.png")}
                  style={[
                    styles.newChatIcon,
                    { marginRight: 10, width: 20, height: 20 },
                  ]}
                />
                <Text style={styles.nText}>{t("feedback")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 0.5,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              ]}
              onPress={() => setRateModel(true)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/rate_icon.png")}
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("rate_app")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.enableNoticication,
              { height: 55, flexDirection: "column" },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 5,
                  // backgroundColor:"green"
                },
              ]}
              onPress={() => setDeleteAccountModel(true)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/Delete_account.png")}
                  style={[
                    styles.newChatIcon,
                    { marginRight: 10, tintColor: "red" },
                  ]}
                  resizeMode="contain"
                />
                <Text style={styles.deleteAccount}>{t("delete_account")}</Text>
              </View>
              <Image
                source={require("../../Assets/Icons/Arrow_Forword.png")}
                style={{
                  marginRight: 5,
                  height: 13,
                  width: 10,
                  alignSelf: "center",
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ width: "100%", height: 30 }}></View>
        </ScrollView>
      </View>
    </MainComponent>
  );
}
