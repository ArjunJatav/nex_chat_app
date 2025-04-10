import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
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
  appBarText,
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
  user_control,
} from "../../Constant/Api";
import { chatTop, settingTop, StatusBarColor } from "../../Navigation/Icons";
import { socket, socketDisconnect } from "../../socket";
import {
  UpdateProfileImage,
  clearChatRooms,
  deleteMessageByResId,
  getChannelInfo,
  getDisapperMessage,
  getMyChannelInfo,
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
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import { setChannelSliceData, setProfileData } from "../../Redux/MessageSlice";
import { setPremium, setStorylist } from "../../reducers/friendListSlice";
import {
  setJoinChannelLimitFree,
  setJoinChannelLimitPremium,
  setJoinGroupLimitFree,
  setJoinGroupLimitPremium,
  setNonPremiumBioCharacterLimit,
  setNonPremiumStoryLimit,
  setPinChatLimitFree,
  setPinChatLimitPremium,
  setPremiumBioCharacterLimit,
  setPremiumProfileLinkLimit,
  setStoryCaptionFree,
  setStoryCaptionPremium,
} from "../../Redux/premiumLimit";
import { ChannelTypeModal } from "../Modals/ChannelTypeModal";
import { SuccessModel } from "../Modals/SuccessModel";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
import { DiamondBalanceModal } from "../Modals/DiamondBalanceModel";

const isDarkMode = true;
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
// eslint-disable-next-line
export default function SettingScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const enablenotification = useSelector(
    (state: any) => state.friendListSlice.enableNotification
  );
  const [switchValue, setSwitchValue] = useState(enablenotification);
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
  const [succesaModel, setSuccesaModel] = useState(false);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
const [isDiamondBalanceModal,setisDiamondBalanceModal]=useState(false)
  const [deleteAccountModel, setDeleteAccountModel] = useState(false);
  const { t } = useTranslation();
  const [isUIUpdated, setIsUIUpdated] = useState(false);
  const [isChannelTypeModal, setChannelTypeModal] = useState(false);
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
    globalThis.stealthModeValue == "true" ? true : false
  );
  const [explorePage, setExplorePage] = useState(
    globalThis.ExplorePageValue == "true" ? true : false
  );
  const publicSelected = true;
  const [lastSeenMode, setlastSeenMode] = useState(true);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [premiumMessage, setPremiumMessage] = useState(false);
  const userPremium = useSelector(
    //@ts-expect-error
    (state) => state?.friendListSlice.userPremium
  );
const DiamondBalanceObj = useSelector((state)=>state?.message?.diamondBalanceObj)
console.log("diamond balance ::",DiamondBalanceObj)
  function TosetExploreApiCalling(value) {
    setExplorePage(value);
    const data = {
      is_show_in_friend_suggestion: value,
    };
    console.log("data ::",data)
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    PostApiCall(
      user_control,
data,
headers,
navigation,
async (ResponseData, ErrorStr) => {
  setExplorePage(value);
  globalThis.ExplorePageValue = value;
  await AsyncStorage.setItem("explorePage", value.toString());
console.log("api response::",ResponseData)
})
    
  }
  const toggleFeature = async (feature, value) => {
    setloaderMoedl(true);
    try {
      switch (feature) {
        case "stealth_mode":
          setStealthMode(value); // Update state for stealth mode
          globalThis.stealthModeValue = value;

          await AsyncStorage.setItem("stealthMode", value.toString()); // Store the value in AsyncStorage
          break;

        case "show_last_seen":
          setlastSeenMode(value); // Update state for last seen visibility
          globalThis.lastSeenMode = value;
          await AsyncStorage.setItem("lastSeenMode", value.toString()); // Store the value in AsyncStorage
          break;

          case "explore_page":
          // Store the value in AsyncStorage
          break;
        

        default:
          console.warn(`Unknown feature: ${feature}`);
          break;
      }

      // Optionally navigate or update UI
      navigation.navigate("BottomBar"); // Navigating after a successful API response
    } catch (error) {
      console.error(`Failed to update feature: ${feature}`, error);
      // Alert.alert(t("error"), t("featureUpdateFailed"), [{ text: t("ok") }]);
      setloaderMoedl(false);
      globalThis.errorMessage = t("featureUpdateFailed");
      setErrorAlertModel(true);
    } finally {
      setloaderMoedl(false); // Hide loader in both success and failure cases
    }

    console.log(`${feature} value>>>> `, value);
    const data = {
      [feature]: value,
    };

    PostApiCall(
      enable_notifications,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        apiSuccess2(ResponseData, ErrorStr, feature, value);
      }
    );

    // }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchLastSeenMode = async () => {
        try {
          if (globalThis.isUserPremium) {
            const storedValue = await AsyncStorage.getItem("lastSeenMode");
            if (storedValue != null) {
              setlastSeenMode(storedValue === "true"); // Convert to boolean
            }
          } else {
            setlastSeenMode(true);
          }
        } catch (error) {
          console.error("Failed to fetch lastSeenMode:", error);
          setlastSeenMode(true); // Fallback to default value in case of error
        }
      };

      fetchLastSeenMode();
    }, [])
  );

  useEffect(() => {
    if (!userPremium) {
      globalThis.stealthModeValue = undefined;
    }
  }, []);

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
        globalThis.selectTheme === "indiaTheme" ||
        globalThis.selectTheme === "englandTheme" ||
        globalThis.selectTheme === "americaTheme" ||
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
          // Alert.alert(t("noInternet"), t("please_check_internet"), [
          //   { text: t("ok") },
          // ]);
          setloaderMoedl(false);
          setNoInternetModel(true);
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

    showToast(value ? t("Notifications_Enabled") : t("Notifications_Disabled"));

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
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
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
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
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
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);

      // setloaderMoedl(false);

      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
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
      await AsyncStorage.removeItem("FriendMatchPopup");
      await AsyncStorage.removeItem("lastFriendMatchShown");
      // await AsyncStorage.removeItem("isContactUploaded");
      await AsyncStorage.removeItem("phone_number");
      await AsyncStorage.removeItem("lockChatPinCode");
      await AsyncStorage.removeItem("chatlockusernumber");
      await AsyncStorage.removeItem("setSeenCardIntro");
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
      fromExplore: false
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
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      // Navigate to another screen or handle the error in some way
    } else {
      // setNotificationPermission(ResponseData.status   ? 'undetermined' : 'disabled');
      navigation.navigate("BottomBar");
      setloaderMoedl(false);
    }
  };

  const apiSuccess2 = async (
    ResponseData: any,
    ErrorStr: any,
    feature: any,
    value: any
  ) => {
    if (ErrorStr) {
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      return; // Exit the function if there is an error
    } else {
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
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
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

  function AfterChoosingChannelType(value) {
    setChannelTypeModal(false);

    if (value == "public") {
      navigation.navigate("NewChannelScreen", { type: "public" });
    } else {
      navigation.navigate("NewChannelScreen", { type: "private" });
    }

    //newGroupPress(value);
  }

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
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      // Navigate to another screen or handle the error in some way
    } else {
      setloaderMoedl(false);

      // Extract the relevant data from the response
      const { enable_notifications, stealth_mode, show_last_seen } =
        ResponseData.data;

      // Set the switch values based on the response
      if (
        enable_notifications != undefined &&
        stealth_mode != undefined &&
        show_last_seen != undefined
      ) {
        setSwitchValue(enable_notifications === 1);

        if (!userPremium) {
          setlastSeenMode(true);
          setStealthMode(false);
        } else {
          setlastSeenMode(show_last_seen == 1 ? true : false);
          setStealthMode(stealth_mode === 1);
        }
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
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      // Navigate to another screen or handle the error in some way
    } else {
      setloaderMoedl(false);

      const settings = ResponseData?.setting;

      // Function to find and parse settings by key
      const findSetting = (key) => {
        const setting = settings.find((item) => item.key === key);
        return setting ? parseInt(setting.value, 10) : null;
      };

      // Find and store story caption limits
      const freeCaptionLimit = findSetting(
        "STORY_CAPTION_LIMITS_FOR_FREE_USERS"
      );
      const premiumCaptionLimit = findSetting(
        "STORY_CAPTION_LIMITS_FOR_PREMIUM_USERS"
      );
      const nonPremiumStoryLimit = findSetting("NON_PREMIUM_STORY_LIMITS");
      const premiumProfileLinkLimit = findSetting(
        "PREMIUM_PROFILE_LINKS_LIMITS"
      );
      const nonPremiumBioCharacterLimit = findSetting(
        "BIO_CHARACTER_LIMITS_FOR_FREE_USERS"
      );
      const premiumBioCharacterLimit = findSetting(
        "BIO_CHARACTER_LIMITS_FOR_PREMIUM_USERS"
      );
      const joinGroupLimitFree = findSetting(
        "JOIN_GROUP_LIMITS_FOR_FREE_USERS"
      );
      const joinGroupLimitPremium = findSetting(
        "JOIN_GROUP_LIMITS_FOR_PREMIUM_USERS"
      );
      const joinChannelLimitFree = findSetting(
        "JOIN_CHANNEL_LIMITS_FOR_FREE_USERS"
      );
      const joinChannelLimitPremium = findSetting(
        "JOIN_CHANNEL_LIMITS_FOR_PREMIUM_USERS"
      );
      const pinChatLimitFree = findSetting("PIN_CHAT_LIMITS_FOR_FREE_USERS");
      const pinChatLimitPremium = findSetting(
        "PIN_CHAT_LIMITS_FOR_PREMIUM_USERS"
      );

      // Store the story caption limits
      if (freeCaptionLimit !== null) {
        dispatch(setStoryCaptionFree(freeCaptionLimit));
      }

      if (premiumCaptionLimit !== null) {
        dispatch(setStoryCaptionPremium(premiumCaptionLimit));
      }

      if (nonPremiumStoryLimit !== null) {
        dispatch(setNonPremiumStoryLimit(nonPremiumStoryLimit));
      }

      if (premiumProfileLinkLimit !== null) {
        dispatch(setPremiumProfileLinkLimit(premiumProfileLinkLimit));
      }

      if (nonPremiumBioCharacterLimit !== null) {
        dispatch(setNonPremiumBioCharacterLimit(nonPremiumBioCharacterLimit));
      }

      if (premiumBioCharacterLimit !== null) {
        dispatch(setPremiumBioCharacterLimit(premiumBioCharacterLimit));
      }

      if (joinGroupLimitFree !== null) {
        dispatch(setJoinGroupLimitFree(joinGroupLimitFree));
      }

      if (joinGroupLimitPremium !== null) {
        dispatch(setJoinGroupLimitPremium(joinGroupLimitPremium));
      }

      if (pinChatLimitFree !== null) {
        dispatch(setPinChatLimitFree(pinChatLimitFree));
      }

      if (pinChatLimitPremium !== null) {
        dispatch(setPinChatLimitPremium(pinChatLimitPremium));
      }

      if (joinChannelLimitFree !== null) {
        dispatch(setJoinChannelLimitFree(joinChannelLimitFree));
      }

      if (joinChannelLimitPremium !== null) {
        dispatch(setJoinChannelLimitPremium(joinChannelLimitPremium));
      }

      // Custom logic to execute on success
      setUserTagline(ResponseData.data.tagline);
      setIsForceRemound(!isForceReMount);
      setuserImage("");
      setuserImage(ResponseData.data.thumbnail);
      console.log('ResponseData.data.thumbnail=======',ResponseData.data.thumbnail);
      
      setuserName(ResponseData.data.first_name);
      setphoneNumber(ResponseData.data.phone_number);
      globalThis.userImage = ResponseData.data.profile_image;
      globalThis.thumbnail = ResponseData.data.thumbnail;
      globalThis.userName = ResponseData.data.first_name;
      globalThis.displayName = ResponseData.data.first_name;
      globalThis.myScanner = ResponseData.data.qrcode;
      globalThis.uniqueId = ResponseData?.data?.unique_id;
      globalThis.isUserPremium =
        ResponseData?.data?.premium == 1 ? true : false;
      dispatch(setPremium(globalThis.isUserPremium));
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
        // Alert.alert(t("noInternet"), "", [{ text: t("ok") }]);
        setNoInternetModel(true);
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
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      // setloaderMoedl(false);
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
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

  const AllChaneelListApi = async (chatid: any) => {
    getMyChannelInfo((channels, count) => {
      const reversedData = channels.reverse();
      dispatch(setChannelSliceData(reversedData));
    });
    // console.log("chatid >>>> ",urlStr);

    // return new Promise((resolve, reject) => {
    //   axios({
    //     method: "get",
    //     url: urlStr,
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   })
    //     .then((response) => {
    //       if (response.data.status === true) {
    //         console.log("response.data.data >>>> ",response.data.data);

    //         dispatch(setChannelSliceData(response.data.data));
    //         resolve(response.data.data);
    //       } else {
    //         Alert.alert(response.data.message);
    //         reject(response.data.message);
    //       }
    //     })
    //     .catch((error) => {
    //       console.error("Error in AllChaneelListApi:", error);
    //       reject(error);
    //     });
    // });
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
      // height: 25,
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

  const handleApiCalls = async (chatid: any, username: any, userimage: any) => {
    setloaderMoedl(true); // Start loader

    try {
      // Use Promise.all to wait for all API calls to complete
      await Promise.all([
        getBottomProfileApi(chatid, username, userimage),
        AllPostsListApi(chatid),
        AllChaneelListApi(chatid),
      ]);
    } catch (error) {
      setloaderMoedl(false);
      console.error("Error in one of the API calls:", error);
      // Alert.alert("Error", "An error occurred while fetching data.");
      globalThis.errorMessage = "An error occurred while fetching data.";
      setErrorAlertModel(true);
    } finally {
      setloaderMoedl(false); // Stop loader after all API calls are done
    }
  };

  const getBottomProfileApi = async (
    chatid: any,
    username: any,
    userimage: any
  ) => {
    return new Promise((resolve, reject) => {
      dispatch(
        setProfileData({
          Image_text: "",
          sticker_position: "",
          display_name: username,
          profile_image: userimage,
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
        get_by_ChatId,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          if (ErrorStr) {
            reject(ErrorStr);
          } else {
            getapiSuccess(ResponseData, ErrorStr, username, userimage);
            resolve(ResponseData);
          }
        }
      );
    });
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
          display_name: username,
          profile_image: userimage,
          userProfile: globalThis.userImage,
        })
      );

      UpdateProfileImage(
        ResponseData?.data?.user?.chat_user_id,
        userimage,
        // eslint-disable-next-line
        (res: any) => {
          if (res) {
          } else {
            console.log("can't update profile iamge");
          }
        }
      );
      handlePresentModalPress();
      setloaderMoedl(false);
    }
  };

  const AllPostsListApi = async (chatid: any) => {
    return new Promise((resolve, reject) => {
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
          if (ErrorStr) {
            reject(ErrorStr);
          } else {
            getAllPostByuser(ResponseData, ErrorStr);
            resolve(ResponseData);
          }
        }
      );
    });
  };

  // eslint-disable-next-line
  const getAllPostByuser = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
    } else {
      dispatch(setStorylist(ResponseData.data));
    }
  };

  let premiumAlertHeading = t("Premium_Feature");
  let premiumAlertSubHeading = premiumMessage
    ? t("Premium_Feature_For_stealth_mode")
    : t("Premium_Feature_For_Alert_for_online");
  let premiumAlertFirstButtonText = "Ok";
  let premiumAlertSecondButtonText = "Go To Premium";

  return (
    <MainComponent
      statusBar="light-content"
      statusBarColr="light-content"
      safeAreaColr={topBackground}
    >
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
       <DiamondBalanceModal
          visible={isDiamondBalanceModal}
         onRequestClose={() => setisDiamondBalanceModal(false)}
         popupPressed={()=>{
          setisDiamondBalanceModal(false);
          navigation.navigate("DiamondPurcahse");
         }}
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
      <ChannelTypeModal
        visible={isChannelTypeModal}
        isPublicSelected={publicSelected}
        onRequestClose={() => setChannelTypeModal(false)}
        onNextClick={AfterChoosingChannelType}
      />
      <ChatBackUpModel
        visible={chatBackUpModel}
        onRequestClose={() => setchatBackUpModel(false)}
        cancel={() => setchatBackUpModel(false)}
      />
      <CustomBottomSheetModal
        ref={bottomSheetSettingRef}
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        navigation={navigation}
        publicSelected={true}
        fromScreen={"settingScreen"}
        openChannelModal={() => {
          setChannelTypeModal(true);
        }}
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
      <SuccessModel
        visible={succesaModel}
        onRequestClose={() => setSuccesaModel(false)}
        cancel={() => setSuccesaModel(false)}
        rateApp={() => setSuccesaModel(false)}
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
              top: chatTop().top,
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
              : windowHeight - 175,
          }}
        >
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() => {
              handleApiCalls(globalThis.chatUserId, userName, userImage);
              // getBottomProfileApi(
              //   globalThis.chatUserId,
              //   userName,
              //   getUniqueImageUrl(userImage)
              // ),
              //   AllPostsListApi(globalThis.chatUserId),
              //   AllChaneelListApi(globalThis.chatUserId);
            }}
            activeOpacity={0.7}
          >
            {isForceReMount}
            <View style={styles.Container}>
              {userImage?.length > 0 ? (
                <Image
                  source={{ uri: getUniqueImageUrl(userImage) }}
                  style={styles.circleImageLayout}
                  // resizeMode="cover"
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.nameText}>{userName?.toUpperCase()}</Text>
                {userPremium && (
                  <Image
                    source={require("../../Assets/Image/PremiumBadge.png")}
                    style={{
                      height: 15,
                      width: 15,
                      marginLeft: 5,
                      alignSelf: userName.length > 15 ? "flex-start" : "center",
                      tintColor: iconTheme().iconColorNew,
                    }}
                    resizeMode="cover"
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
                source={require("../../Assets/Icons/Scanner_icon.png")}
                style={styles.newChatIcon}
              />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.enableNoticication,
              { alignItems: "center", height: "auto", flexDirection: "column", },
            ]}
            onPress={()=>setisDiamondBalanceModal(true)}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <View
                style={[styles.enableTextAndIcon, { alignItems: "center" }]}
              >
                <Image
                  source={require("../../Assets/Icons/diamond.png")}
                  style={[
                    styles.newChatIcon,
                    {
                      marginRight: 10,
                      height: DeviceInfo.isTablet() ? 27 : 22,
                      width: DeviceInfo.isTablet() ? 27 : 22,
                      resizeMode: "contain",
                      tintColor: appBarText().textColor,
                    },
                  ]}
                />

                <Text style={styles.nText}>
                  {t("Diamond")} {t("Balance")}
                </Text>
              </View>
              <View style={{ alignItems: "center", flexDirection: "row" }}>
                <Text>{DiamondBalanceObj.credited_diamonds + DiamondBalanceObj.earned_diamonds + DiamondBalanceObj.purchase_diamonds}</Text>
                <Image
                  source={require("../../Assets/Icons/diamond.png")}
                  style={{
                    height: 18,
                    width: 18,
                    tintColor: iconTheme().iconColorNew,
                    marginLeft: 5,
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </TouchableOpacity>

          <View
            style={[
              styles.enableNoticication,
              { alignItems: "center", height: "auto", flexDirection: "column" },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <View
                style={[styles.enableTextAndIcon, { alignItems: "center" }]}
              >
                <Image
                  source={
                    switchValue
                      ? require("../../Assets/Icons/settingunmute.png")
                      : require("../../Assets/Icons/MUTE01.png")
                  }
                  style={[
                    styles.newChatIcon,
                    {
                      marginRight: 10,
                      height: DeviceInfo.isTablet() ? 27 : 22,
                      width: DeviceInfo.isTablet() ? 27 : 22,
                      resizeMode: "contain",
                    },
                  ]}
                />

                <Text style={styles.nText}>{t("enable_notifications")}</Text>
              </View>
              <View>
                <Switch onValueChange={buttonEnable} value={switchValue} />
              </View>
            </View>

            <View style={{ width: "100%" }}>
              <Text style={{ color: "gray", marginLeft: 3 }}>
                {t("enableNotifivationDetails")}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.enableNoticication,
              { alignItems: "center", height: "auto", flexDirection: "column" },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <View
                style={[styles.enableTextAndIcon, { alignItems: "center" }]}
              >
                <Image
                  source={
                    stealthMode
                      ? require("../../Assets/Icons/stealth_mode.png")
                      : require("../../Assets/Icons/stealth_mode.png")
                  }
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("enable_mode_stealth")}</Text>
              </View>
              <View>
                <Switch
                  onValueChange={(value) => {
                    setPremiumMessage(true);
                    if (globalThis.isUserPremium) {
                      toggleFeature("stealth_mode", value); // Toggle feature if the user is premium
                    } else {
                      setShowPremiumAlert(true); // Show alert if the user is not premium
                    }
                  }}
                  value={stealthMode}
                />
              </View>
            </View>
            {/* {renderIf(
              stealthMode, */}
            <View style={{ width: "100%" }}>
              <Text style={{ color: "gray", marginLeft: 3 }}>
                {t("enableStealthDetails")}
              </Text>
            </View>
            {/* )} */}
          </View>

          <View
            style={[
              styles.enableNoticication,
              { alignItems: "center", height: "auto", flexDirection: "column" },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <View
                style={[styles.enableTextAndIcon, { alignItems: "center" }]}
              >
                <Image
                  source={require('../../Assets/Icons/explore2.png')
                  }
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("enable_explore_page")}</Text>
              </View>
              <View>
                <Switch
                  onValueChange={(value) => {
                    TosetExploreApiCalling(value)
                    // toggleFeature("explore_page", value); 
                  }}
                  value={explorePage}
                />
              </View>
            </View>
            {/* {renderIf(
              stealthMode, */}
            <View style={{ width: "100%" }}>
              <Text style={{ color: "gray", marginLeft: 3 }}>
                {t("Show_me_on_explore_page")}
              </Text>
            </View>
            {/* )} */}
          </View>
          <View
            style={[
              styles.enableNoticication,
              { alignItems: "center", height: "auto", flexDirection: "column" },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <View
                style={[
                  styles.enableTextAndIcon,
                  { alignItems: "center", width: "auto" },
                ]}
              >
                <Image
                  source={
                    lastSeenMode
                      ? require("../../Assets/Icons/Eye.png")
                      : require("../../Assets/Icons/Hide.png")
                  }
                  style={[styles.newChatIcon, { marginRight: 10 }]}
                />
                <Text style={styles.nText}>{t("enable_lastseen_online")}</Text>
              </View>
              <View>
                <Switch
                  onValueChange={(value) => {
                    setPremiumMessage(false);
                    if (globalThis.isUserPremium) {
                      toggleFeature("show_last_seen", value); // Toggle feature if the user is premium
                    } else {
                      setShowPremiumAlert(true); // Show alert if the user is not premium
                    }
                  }}
                  value={lastSeenMode}
                />
              </View>
            </View>
            {/* {renderIf(
              lastSeenMode, */}
            <View style={{ width: "100%" }}>
              <Text style={{ color: "gray", marginLeft: 3 }}>
                {t("enableOnlineDetails")}
              </Text>
            </View>
            {/* )} */}
          </View>

          <View
            style={[
              styles.enableNoticication,
              { height: 350, flexDirection: "column" },
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
                  source={require("../../Assets/Icons/Scanner_icon.png")}
                  style={[
                    styles.newChatIcon,
                    {
                      marginRight: 10,
                      height: DeviceInfo.isTablet() ? 27 : 22,
                      width: DeviceInfo.isTablet() ? 27 : 22,
                    },
                  ]}
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
                height: 0.5,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View>

            {/* <TouchableOpacity
              style={[
                styles.enableTextAndIcon,
                {
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 5,
                },
              ]}
              onPress={() => navigation.navigate("ExplorePage")}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/explore.png")}
                  style={[
                    styles.newChatIcon,
                    {
                      marginRight: 10,
                      height: DeviceInfo.isTablet() ? 27 : 22,
                      width: DeviceInfo.isTablet() ? 27 : 22,
                    },
                  ]}
                />
                <Text style={styles.nText}>{t("Explore_Page")} </Text>
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
            </TouchableOpacity> */}
            {/* <View
              style={{
                height: 0.5,
                backgroundColor: COLORS.lightgrey,
                width: "100%",
              }}
            ></View> */}
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
                  source={require("../../Assets/Icons/languagenew.png")}
                  style={[
                    styles.newChatIcon,
                    { marginRight: 10, resizeMode: "contain" },
                  ]}
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
              onPress={() => setChatSettingModel(true)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/chat_setting.png")}
                  style={[
                    styles.newChatIcon,
                    {
                      marginRight: 10,
                      height: DeviceInfo.isTablet() ? 27 : 24,
                      width: DeviceInfo.isTablet() ? 27 : 23,
                    },
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
                  source={require("../../Assets/Icons/App_icon.png")}
                  style={[
                    styles.newChatIcon,
                    { marginRight: 10, width: 25, height: 25 },
                  ]}
                />
                <Text style={styles.nText}>{t("app_icon")}</Text>
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
              onPress={() => fontSettingScreen()}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/font_setting.png")}
                  style={{
                    marginRight: 10,
                    height: DeviceInfo.isTablet() ? 27 : 24,
                    width: DeviceInfo.isTablet() ? 27 : 24,
                    alignSelf: "center",
                    tintColor: iconTheme().iconColorNew,
                  }}
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
                  //  marginBottom: 5,
                  //  marginTop: 5,
                  //  backgroundColor:"red"
                },
              ]}
              onPress={() => navigation.navigate("PremiumFeaturesScreen")}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/tokee_premium.png")}
                  style={[
                    {
                      marginRight: 8,
                      width: 25,
                      height: 22,
                      tintColor: iconTheme().iconColorNew,
                    },
                  ]}
                />
                <Text style={styles.nText}>{t("tokee_premium")}</Text>
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

          {/* <View
            style={[
              styles.enableNoticication,
              { height: 55, flexDirection: "column" },
            ]}
          >
          
          </View> */}

          <View
            style={[
              styles.enableNoticication,
              { height: 220, flexDirection: "column" },
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

            {/* ///by-dinki */}
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
              onPress={() => navigation.navigate("DiamondPurcahse")}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/diamond.png")}
                  style={[
                    {
                      marginRight: 8,
                      width: 25,
                      height: 22,
                      tintColor: iconTheme().iconColorNew,
                    },
                  ]}
                />
                <Text style={styles.nText}>{t("Purchase_Diamond")}</Text>
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
              onPress={() => navigation.navigate("UpdateTokeeMatchImage")}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../Assets/Icons/uil_camera-change.png")}
                  style={[
                    {
                      marginRight: 8,
                      width: 25,
                      height: 22,
                      tintColor: iconTheme().iconColorNew,
                    },
                  ]}
                />
                <Text style={styles.nText}>{t("update_tokee_match_image")}</Text>
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
          <View style={{ width: "100%", height: DeviceInfo.isTablet() ? 50 : 70 }}></View>
        </ScrollView>
      </View>
    </MainComponent>
  );
}
