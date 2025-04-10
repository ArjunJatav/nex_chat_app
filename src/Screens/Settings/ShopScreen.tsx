import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import FastImage from "react-native-fast-image";
import * as RNIap from "react-native-iap";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  gredient,
  iconTheme,
  searchBar,
  themeModule,
} from "../../Components/Colors/Colors";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import renderIf from "../../Components/renderIf";
import Share from "react-native-share";
import {
  Base_Url,
  earned_diamonds,
  friend_suggesstion,
  revert_card,
  sendfriendrequest,
  theme_purchase,
  theme_purchase_list,
  update_diamond_purchase,
} from "../../Constant/Api";
import { LoaderModel } from "../Modals/LoaderModel";
import { ThemeSucessModel } from "../Modals/ThemeSuccessModel";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
import { Mixpanel } from "mixpanel-react-native";
import { AppsFlyerTracker } from "../EventTracker/AppsFlyerTracker";
import Swiper from "react-native-deck-swiper";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setmyrequestdata } from "../../Redux/ChatHistory";
import { DiamondTopupModel } from "../Modals/DiamondTopUpModel";
import { showToast } from "../../Components/CustomToast/Action";
import { FriendMatchPeopleModel } from "../Modals/FoundMatchPeopleModal";
import { setDiamondBalanceObj } from "../../Redux/MessageSlice";
import { setDaimonds } from "../../reducers/friendListSlice";
import LinearGradient from "react-native-linear-gradient";

let apiCall = false;
let lastSwipedDirection = "right";
let lastSwipedData = {};
let imageIdex = 0;
// eslint-disable-next-line
const ShopScreen = React.memo(({ navigation, route }: any) => {
  const { top } = useSafeAreaInsets();
  const swiperRef = useRef(null);

  const [seenCardInro, setSeenCardIntro] = useState(false);
  const [topUpMOdel, setTopUpModel] = useState(false);
  const [friendSugesstionData, setFriendSugesstionData] = useState([]);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [themecolor, setthemecolor] = useState(themeModule().theme_background);
  const [checked, setChecked] = useState(globalThis.selectTheme);
  const { t } = useTranslation();
  const [navigateToImageScreen, setNavigateToImageScreen] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [themeSuccessModel, setThemeSuccessModel] = useState(false);
  const [purchasedTheme, setPurchasedTheme] = useState([]);
  const currentText = " (" + t("current") + ")";
  const { toggleTheme } = useContext(ThemeContext);
  const [processing, setprocessing] = useState(false);
  const [swipedCards, setSwipedCards] = useState([]); // Store swiped cards with direction
  const [success, setsuccess] = useState(false);
  const [failed, setfailed] = useState(false);
  const scrollViewRef = useRef();
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState("");
  const [tabactive, settabactive] = useState(
    route?.params?.forTab == 2 ? 1 : 0
  );
  const myprofileData = useSelector(
    (state) =>
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      state?.message?.myProfileData
  );
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [showFriendMatchPeopletModel, setShowFriendMatchPeopletModel] =
    useState(false);
  const [imageIndexes, setImageIndexes] = useState(
    0 // Initialize index for each profile
  );

  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const myrequestdata = useSelector(
    (state) =>
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      state.chatHistory.myrequestdata
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const dispatch = useDispatch();

  const dimonds = useSelector(
    (state) =>
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      state?.friendListSlice?.dimonds
  );

  const handleTapRight = (cardIndex) => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    setImageIndexes((prevIndexes) => {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      const newIndexes = [...prevIndexes];
      const currentProfile = friendSugesstionData[cardIndex];

      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      if (currentProfile?.preference_images?.length > 0) {
        newIndexes[cardIndex] =
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          (newIndexes[cardIndex] + 1) % currentProfile.preference_images.length; // Wrap around
      }

      forceRerenderSwiper();
      return newIndexes;
    });
  };

  const handleTapLeft = (cardIndex) => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    setImageIndexes((prevIndexes) => {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      const newIndexes = [...prevIndexes];
      const currentProfile = friendSugesstionData[cardIndex];
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      if (currentProfile?.preference_images?.length > 0) {
        newIndexes[cardIndex] =
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          (newIndexes[cardIndex] -
            1 +
            currentProfile.preference_images.length) %
          currentProfile.preference_images.length; // Wrap around
      }
      forceRerenderSwiper();
      return newIndexes;
    });
  };

  // code added by Puru
  const [swiperKey, setSwiperKey] = useState(0);

  let pageNumber = 1;
  const saveCheckedState = async (value: string) => {
    try {
      await AsyncStorage.setItem("checkedState", value);
    } catch (error) {
      console.log("", error);
    }
  };

  const hexToRgb = (hex) => {
    // Remove '#' if present
    hex = hex.replace(/^#/, "");

    // Parse the hex values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
  };
  const colorForShadow = hexToRgb(searchBar().back_ground);
  async function Getseen() {
    //setSeenCardIntro
    const seen = await AsyncStorage.getItem("setSeenCardIntro");

    if (seen == "true") {
      setSeenCardIntro(true);
    } else {
      setSeenCardIntro(false);
    }
  }
  useFocusEffect(
    React.useCallback(() => {
      if (route?.params?.forTab == 2 || globalThis.forScreen == "match") {
        settabactive(1);
        if (
          myprofileData?.preference_images?.length == 0 &&
          globalThis.isUserseventeenYearsOld == true &&
          friendSugesstionData.length > 0
        ) {
          lastSwipedDirection = "right";
          lastSwipedData = {};
          imageIdex = 0;
          console.log("inside if");
          setNavigateToImageScreen(true);
          globalThis.successText =
            "Enhance your Tokee Match Profile! Add photos to increase your chances of connecting with other tokee users and make your experience even better!";
          setSuccessAlertModel(true);
        }
      }
    //  settabactive(0);

      setChecked(globalThis.selectTheme);
      setthemecolor(themeModule().theme_background);
      Getseen();
      if (globalThis.toCallSuggestionApi == true) {
        globalThis.toCallSuggestionApi = false;
        setFriendSugesstionData([]);
        AllSuggestions();
      }
    }, [])
  );

  useEffect(() => {
    setFriendSugesstionData([]);
    AllSuggestions();
    loadCheckedState();
    initilizeIAPConnection();
  }, []);

  function EarnedApiCalling() {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    const data = {
      diamonds: 50,
    };
    PostApiCall(
      earned_diamonds,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        if (ResponseData.status == true) {
          globalThis.purchasedDiamonds = ResponseData.data.purchase_diamonds;
          globalThis.creditedDiamonds = ResponseData.data.credited_diamonds;
          globalThis.DiamondBalance =
            ResponseData.data.purchase_diamonds +
            ResponseData.data.credited_diamonds +
            ResponseData.data.earned_diamonds;
          const totalDiamondsFirst =
            parseFloat(ResponseData.data.purchase_diamonds) +
            parseFloat(ResponseData.data.credited_diamonds) +
            parseFloat(ResponseData.data.earned_diamonds);
          dispatch(setDaimonds(totalDiamondsFirst));
          Alert.alert(
            "Success!",
            "You've just earned 50 Diamonds for sharing the Tokee Match feature!",
            [{ text: "Ok", onPress: () => console.log("OK Pressed") }]
          );
        }

        if (ErrorStr) {
          console.log("eror str", ErrorStr);
        }
      }
    );
  }
  const shareToFacebook = async () => {
    const shareOptions = {
      title: "Share via",
      message: "Explore Tokee's new Feature!",
      url:
        Platform.OS === "ios"
          ? "https://apps.apple.com/fj/app/tokee-messenger/id1641356322"
          : "https://play.google.com/store/apps/details?id=com.deucetek.tokee", // Content URL
    };

    try {
      const result = await Share.open(shareOptions); // Opens the native share sheet
      EarnedApiCalling();
      console.log("Shared successfully:", result);
    } catch (error) {
      if (error.message !== "User did not share") {
        console.error("Error sharing:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          // Alert.alert(t("noInternet"), t("please_check_internet"), [
          //   { text: t("ok") },
          // ]);
          setNoInternetModel(true);
          return;
        } else {
          getPurchaseList();
        }
      });
    });
    return unsubscribe2;
  }, []);

  ///////////////////////// **********   Headers for Get Profile Api  ********** ///////////////////////////////
  const getPurchaseList = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      theme_purchase_list,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        getPurchaseListResponse(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get getPurchaseResponse api Response   ********** ///
  // eslint-disable-next-line
  const getPurchaseListResponse = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
    } else {
      setPurchasedTheme(ResponseData.data);
      setloaderMoedl(false);
    }
  };
  ///////////////////////// **********   loadCheckedState  ********** ///////////////////////////////
  const loadCheckedState = async () => {
    try {
      const savedValue = await AsyncStorage.getItem("checkedState");
      if (savedValue) {
        console.log("", savedValue);
      }
    } catch (error) {
      console.log("", error);
    }
  };

  useEffect(() => {
    let purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            if (Platform.OS === "ios") {
              RNIap.finishTransaction({ purchase });

              let productId = purchase.productId;
              let transactionId = purchase.transactionId;
              if (apiCall == false) {
                callThemePurchaseApi(productId, transactionId);
              }
            } else if (Platform.OS === "android") {
              const isConsumable = true;
              const ackResult = await RNIap.finishTransaction({
                purchase: purchase,
                isConsumable: isConsumable,
              });
              const transactionReceiptData = JSON.parse(
                purchase.transactionReceipt
              );
              setprocessing(true);
              ///////////////////////// **********   Call Api For Purchase Theme  ********** ///////////////////////////////
              callThemePurchaseApi(
                transactionReceiptData.productId,
                transactionReceiptData.orderId
              );
            }
            const isConsumable = true;

            RNIap.finishTransaction({ purchase, isConsumable: isConsumable });
          } catch (ackErr) {
            setprocessing(false);
          }
        }
      }
    );
    purchaseUpdateSubscription = RNIap.purchaseErrorListener((error) => {
      setprocessing(false);
    });
    return () => {};
  }, []);
  ///////////////////////// **********  In App  Purchase  for Theme  ********** ///////////////////////////////
  const initilizeIAPConnection = async () => {
    await RNIap.initConnection()
      .then(async (connection) => {
        const availablePurchases = await RNIap.getAvailablePurchases();

        availablePurchases.forEach((purchase) => {
          RNIap.finishTransaction({ purchase, isConsumable: true });
        });
        getItems(itemSubs);
      })
      .catch((err) => {
        console.log("err", err);
      });
    await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
      .then(async (consumed) => {})
      .catch((err) => {
        console.log("err", err);
      });
  };
  ///////////////////////// **********   Set Iteams Sub Purchase Theme  ********** ///////////////////////////////
  const itemSubs = Platform.select({
    ios: [
      //  "com.deucetek.theme3",
      "com.deucetek.christmasTheme",
      // "com.deucetek.newyearTheme",
      // "com.deucetek.usindepTheme",
    ],
    android: [
      // "com.deucetek.theme3",
      "com.deucetek.christmastheme",
      // "com.deucetek.newyeartheme",
      // "com.deucetek.usindepTheme",
    ],
  });

  // eslint-disable-next-line
  const getItems = async (itemSubs: any) => {
    try {
      let products = await RNIap.getProducts({ skus: itemSubs });
      const Purchaseproducts = products;
    } catch (err) {
      return;
    }
  };

  ///////////////////////// **********   ReQUEST FOR  Purchase Theme  ********** ///////////////////////////////
  // eslint-disable-next-line
  const requestSubscription = async (itemSubs: any) => {
    try {
      if (Platform.OS === "android") {
        await RNIap.requestPurchase({
          skus: itemSubs,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        })
          .then(async (result) => {
            if (Platform.OS === "android") {
            }
          })
          .catch((err) => {});
      } else if (Platform.OS === "ios") {
        await RNIap.requestSubscription({ sku: itemSubs.toString() })

          .then(async (result) => {
            console.log("result", result);
          })
          .catch((err) => {
            console.log("in errrrrr", err);
          });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  ///////////////////////// **********   SELECT THEME HANDLE   ********** ///////////////////////////////
  const handleThemeSelection = async (value: string) => {
    setChecked(value);
    saveCheckedState(value);
  };
  // Function to handle the theme selection
  const ThemeSelection = async (value: string) => {
    apiCall = false;
    if (
      checked === "newYearTheme" ||
      checked === "newYear" ||
      checked === "christmas" ||
      checked === "usindepTheme"
    ) {
      const purchaseStatus = checkIfPurchased();
      if (purchaseStatus == true) {
        await AsyncStorage.setItem("selectTheme", value);

        globalThis.selectTheme = value;
        toggleTheme(value);
        createShopEvent(value);
        globalThis.successText = t("colorThemeSuccess");
        setSuccessAlertModel(true);
        // Alert.alert(t("success"), t("colorThemeSuccess"), [
        //   { text: t("done"), onPress: () => navigation.navigate("BottomBar") },
        // ]);
      } else {
        requestPuechase();
      }
    } else {
      await AsyncStorage.setItem("selectTheme", value);
      createShopEvent(value);
      globalThis.selectTheme = value;
      toggleTheme(value);
      globalThis.successText = t("colorThemeSuccess");
      setSuccessAlertModel(true);
      // Alert.alert(t("success"), t("colorThemeSuccess"), [
      //   { text: t("done"), onPress: () => navigation.navigate("BottomBar") },
      // ]);
    }
  };

  const requestPuechase = () => {
    globalThis.radioChecked = checked;
    if (
      checked === "newYearTheme" ||
      checked === "newYear" ||
      checked === "christmas" ||
      checked === "usindepTheme"
    ) {
      if (Platform.OS == "ios") {
        if (checked === "newYearTheme") {
          globalThis.packagename = "com.deucetek.theme3";
        } else if (checked === "newYear") {
          globalThis.packagename = "com.deucetek.newyearTheme";
        } else if (checked === "usindepTheme") {
          globalThis.packagename = "com.deucetek.usindepTheme";
        } else {
          globalThis.packagename = "com.deucetek.christmasTheme";
        }
        requestSubscription(["com.deucetek.christmasTheme"]);
      } else {
        if (checked === "newYearTheme") {
          globalThis.packagename = "com.deucetek.theme3";
        } else if (checked === "newYear") {
          globalThis.packagename = "com.deucetek.newyeartheme";
        } else if (checked === "usindepTheme") {
          globalThis.packagename = "com.deucetek.usindepTheme";
        } else {
          globalThis.packagename = "com.deucetek.christmastheme";
        }
        requestSubscription(["com.deucetek.christmastheme"]);
      }
    } else {
      globalThis.successText = t("colorThemeSuccess");
      setSuccessAlertModel(true);
    }
  };

  // **********   Headers for loguot Api  ********** ///
  // eslint-disable-next-line
  const callThemePurchaseApi = async (themeName: any, TransactionId: any) => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        setNoInternetModel(true);
        return;
      } else {
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.Authtoken,
          localization: globalThis.selectLanguage,
        };
        const data = {
          payment_method: Platform.OS === "android" ? "Google" : "Apple",
          theme_name: globalThis.packagename.toUpperCase(),
          order_amount: "1.99",
          transaction_id: TransactionId,
          purchase_item_for: globalThis.radioChecked,
        };
        if (apiCall == false) {
          apiCall = true;

          PostApiCall(
            theme_purchase,
            data,
            headers,
            navigation,
            (ResponseData, ErrorStr) => {
              themePurchaseSuccess(ResponseData, ErrorStr);
            }
          );
        } else {
          console.log("api not callll");
        }
      }
    });
  };

  const trackAutomaticEvents = false;
  const mixpanel = new Mixpanel(
    `${globalThis.mixpanelToken}`,
    trackAutomaticEvents
  );

  const createShopEvent = (string) => {
    handleCallEvent();
    // Track button click event
    mixpanel.track("Shop", {
      type: "Purchase",
      ThemeName: string,
    });
  };

  const handleCallEvent = () => {
    const eventName = "Shop";
    const eventValues = {
      af_content_id: "Purchase",
      af_customer_user_id: globalThis.chatUserId,
      af_quantity: 1,
    };

    AppsFlyerTracker(eventName, eventValues, globalThis.chatUserId); // Pass user ID if you want to set it globally
  };

  ///////////////////////// **********   THEME PURCHASE API RESPONSE  ********** ///////////////////////////////
  // eslint-disable-next-line
  const themePurchaseSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      setprocessing(false);
    } else {
      apiCall = true;
      setloaderMoedl(false);
      globalThis.selectTheme = ResponseData?.data?.purchase_item_for;
      setThemeSuccessModel(true);
      createShopEvent(ResponseData?.data?.purchase_item_for);
    }
  };

  ///////////////////////// **********   APPLY TEME FOR API   ********** ///////////////////////////////
  // eslint-disable-next-line
  const applyTheme = async (CheckedValue: any) => {
    await AsyncStorage.setItem("selectTheme", CheckedValue);
    toggleTheme(CheckedValue);
    globalThis.successText = t("colorThemeSuccess");
    // createShopEvent(CheckedValue);
    setSuccessAlertModel(true);
    // Alert.alert(t("success"), t("colorThemeSuccess"), [
    //   { text: t("done"), onPress: () => navigation.navigate("BottomBar") },
    // ]);
  };

  function AllSuggestions() {
    setloaderMoedl(true);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      friend_suggesstion + "?page=" + pageNumber,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        setloaderMoedl(false);

        // Check if the first API response is empty
        if (ResponseData.data.length === 0) {
          setFriendSugesstionData([]);
          setIsFirstLoad(false);
        } else {
          const initialIndexes = ResponseData.data.map(() => 0);
          imageIdex = initialIndexes;
          console.log("initialIndexes>>", initialIndexes);
          setImageIndexes(initialIndexes); // Set initial image indexes
          setFriendSugesstionData(ResponseData.data);
        }
        //   setIsFirstLoad(false); // Mark as no longer first load

        if (ErrorStr) {
          console.log("in friend suggestio api erorr ", ErrorStr);
        }
      }
    );
  }

  let isApiCallInProgress = false; // Flag to manage API call state

  // Function to fetch friend suggestions with pagination
  function AllSuggestionsPagination() {
    // Prevent making another API call if one is already in progress
    if (isApiCallInProgress) return;
    // Set the flag to true, indicating the API call is in progress
    isApiCallInProgress = true;

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    if (dimonds < 0) {
      dispatch(setDaimonds(0));
    }

    // Make the API call
    GetApiCall(
      friend_suggesstion + "?page=" + pageNumber,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        // Reset the flag once the response is received
        isApiCallInProgress = false;

        // Log the response data for debugging
        setloaderMoedl(false); // Stop the loading spinner

        // Check if the response data is empty
        if (ResponseData.data.length === 0) {
          setIsFirstLoad(false);
          setFriendSugesstionData([]);
        } else {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          setFriendSugesstionData([...friendSugesstionData, ResponseData.data]);
        }

        // Log any error if occurred
        if (ErrorStr) {
          console.log("In friend suggestion API error: ", ErrorStr);
        }
      }
    );
  }

  const styles = StyleSheet.create({
    slide: {
      justifyContent: "center",
      alignItems: "center",
      height: 123,
      borderRadius: 10,
      backgroundColor: "skyblue",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    nText: {
      color: COLORS.black,
      fontSize: 15,
      fontFamily: font.bold(),
      paddingBottom: 10,
    },

    themeTopContainer: {
      backgroundColor: themecolor,
      paddingBottom: 60,
    },

    themeContainer: {
      backgroundColor: "#fff",
      borderWidth: 15,
      borderColor: "transparent",
    },
    chooseContainer: {
      justifyContent: "center",
    },
    rowFristTheme: {
      marginTop: 20,
      flexDirection: "row",
      width: "100%",
    },
    rowSecondTheme: {
      marginTop: 20,
      flexDirection: "row",
      width: "100%",
    },

    christmasTheme: {
      marginTop: 20,
      flexDirection: "row",
      width: "100%",
    },

    newYearTheme: {
      marginTop: 20,
      flexDirection: "row",
      width: "100%",
    },
    new_YearTheme: {
      marginTop: 20,
      flexDirection: "row",
      width: "100%",
    },
    yelloTheme: {
      backgroundColor: COLORS.yellow,
      width: "80%",
      borderRadius: 10,
    },
    blueTheme: {
      backgroundColor: COLORS.primary_blue_light,
      width: "80%",
      borderRadius: 10,
    },
    thirdTheme: {
      backgroundColor: "#FFC8E6",
      width: "80%",
      borderRadius: 10,
    },
    christmas_Theme: {
      backgroundColor: COLORS.primary_green,
      width: "80%",
      borderRadius: 10,
    },
    newYear_Theme: {
      backgroundColor: COLORS.newYear_yellow,
      width: "80%",
      borderRadius: 10,
    },
    new_Year_Theme: {
      backgroundColor: "#CE9D59",
      width: "80%",
      borderRadius: 10,
    },
    mongolia_Theme: {
      backgroundColor: "#D1EFED",
      width: "80%",
      borderRadius: 10,
    },
    mexicoTheme: {
      backgroundColor: "#D9D29A",
      width: "80%",
      borderRadius: 10,
    },
    englandTheme: {
      backgroundColor: "#DC4C4D",
      width: "80%",
      borderRadius: 10,
    },
    indiaTheme: {
      backgroundColor: "#D55434",
      width: "80%",
      borderRadius: 10,
    },
    usindepTheme: {
      backgroundColor: "#1A255B",
      width: "80%",
      borderRadius: 10,
    },
    lightblueTheme: {
      backgroundColor: COLORS.light_blue,
      height: 100,
      width: "85%",
      borderRadius: 10,
    },
    yelloThemeFristRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
    },
    yelloThemeRow: {
      height: 15,
      backgroundColor: COLORS.purple,
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    blueThemeRow: {
      height: 15,
      backgroundColor: COLORS.primary_blue,
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    thirdThemeRow: {
      height: 15,
      backgroundColor: "#CF1886",
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    christmasThirdThemeRow: {
      height: 15,
      backgroundColor: COLORS.primary_light_green,
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    newYearThirdThemeRow: {
      height: 15,
      backgroundColor: COLORS.newYear_light_yellow,
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    new_YearThirdThemeRow: {
      height: 15,
      backgroundColor: "#FBEDC8",
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    mongoliaThirdThemeRow: {
      height: 15,
      backgroundColor: "#F7CFB5",
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    mexicoThirdThemeRow: {
      height: 15,
      backgroundColor: "#5C5300",
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    englandThirdThemeRow: {
      height: 15,
      backgroundColor: "#F7CFB5",
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    indiaThirdThemeRow: {
      height: 15,
      backgroundColor: "#EFFFFF",
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },
    usindepThirdThemeRow: {
      height: 15,
      backgroundColor: "#FFFFFF",
      width: "50%",
      borderRadius: 2,
      marginTop: 10,
    },

    yelloSecondThemeRow: {
      height: 15,
      backgroundColor: COLORS.purple,
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    blueSecondThemeRow: {
      height: 15,
      backgroundColor: COLORS.primary_blue,
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    thirdSecondThemeRow: {
      height: 15,
      backgroundColor: "#CF1886",
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    cristmasSecondThemeRow: {
      height: 15,
      backgroundColor: COLORS.primary_light_green,
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    newYaerSecondThemeRow: {
      height: 15,
      backgroundColor: COLORS.newYear_light_yellow,
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },

    new_Yaer_SecondThemeRow: {
      height: 15,
      backgroundColor: "#FBEDC8",
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    mongoliaSecondThemeRow: {
      height: 15,
      backgroundColor: "#F7CFB5",
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    mexicoSecondThemeRow: {
      height: 15,
      backgroundColor: "#5C5300",
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    englandSecondThemeRow: {
      height: 15,
      backgroundColor: "#F7CFB5",
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    usindepSecondThemeRow: {
      height: 15,
      backgroundColor: "#FFFFFF",
      width: "10%",
      borderRadius: 2,
      marginTop: 10,
    },
    purpleTheme: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      marginTop: 10,
    },
    purpleFristTheme: {
      height: 8,
      backgroundColor: COLORS.purple,
      width: "40%",
      borderRadius: 2,
    },

    blueFristTheme: {
      height: 8,
      backgroundColor: COLORS.primary_blue,
      width: "40%",
      borderRadius: 2,
    },
    greenFristTheme: {
      height: 8,
      backgroundColor: "#6FC086",
      width: "40%",
      borderRadius: 2,
    },
    christmasGreenTheme: {
      height: 8,
      backgroundColor: COLORS.primary_light_green,
      width: "40%",
      borderRadius: 2,
    },
    newYearYellowTheme: {
      height: 8,
      backgroundColor: COLORS.newYear_light_yellow,
      width: "40%",
      borderRadius: 2,
    },

    new_Year_YellowTheme: {
      height: 8,
      backgroundColor: "#FBEDC8",
      width: "40%",
      borderRadius: 2,
    },

    mongolia_YellowTheme: {
      height: 8,
      backgroundColor: "#F7CFB5",
      width: "40%",
      borderRadius: 2,
    },
    mexico_YellowTheme: {
      height: 8,
      backgroundColor: "#5C5300",
      width: "40%",
      borderRadius: 2,
    },
    england_YellowTheme: {
      height: 8,
      backgroundColor: "#F7CFB5",
      width: "40%",
      borderRadius: 2,
    },
    usindep_YellowTheme: {
      height: 8,
      backgroundColor: "#FFFFFF",
      width: "40%",
      borderRadius: 2,
    },
    purpleSecondTheme: {
      height: 8,
      backgroundColor: COLORS.purple,
      width: "15%",
      borderRadius: 2,
    },
    blueSecondTheme: {
      height: 8,
      backgroundColor: COLORS.primary_blue,
      width: "15%",
      borderRadius: 2,
    },
    greenSecondTheme: {
      height: 8,
      backgroundColor: "#6FC086",
      width: "15%",
      borderRadius: 2,
    },
    christmasGreenSecondTheme: {
      height: 8,
      backgroundColor: COLORS.primary_light_green,
      width: "15%",
      borderRadius: 2,
    },

    newyearYellowSecondTheme: {
      height: 8,
      backgroundColor: COLORS.newYear_light_yellow,
      width: "15%",
      borderRadius: 2,
    },
    new_year_YellowSecondTheme: {
      height: 8,
      backgroundColor: "#FBEDC8",
      width: "15%",
      borderRadius: 2,
    },
    mongolia_YellowSecondTheme: {
      height: 8,
      backgroundColor: "#F7CFB5",
      width: "15%",
      borderRadius: 2,
    },
    mexico_YellowSecondTheme: {
      height: 8,
      backgroundColor: "#5C5300",
      width: "15%",
      borderRadius: 2,
    },
    england_YellowSecondTheme: {
      height: 8,
      backgroundColor: "#F7CFB5",
      width: "15%",
      borderRadius: 2,
    },
    usindep_YellowSecondTheme: {
      height: 8,
      backgroundColor: "#FFFFFF",
      width: "15%",
      borderRadius: 2,
    },
    circularTheme: {
      marginTop: 10,
      backgroundColor: COLORS.light_yellow,
      paddingVertical: 10,
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
    },
    circularBlueTheme: {
      marginTop: 10,
      backgroundColor: COLORS.light_blue,
      paddingVertical: 10,
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
    },
    circularBlueTheme3: {
      marginTop: 10,
      backgroundColor: "#ED89C0",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    christmatTheme3: {
      marginTop: 10,
      backgroundColor: COLORS.christmas_red,
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },

    newYearTheme3: {
      marginTop: 10,
      backgroundColor: COLORS.newYear_theme,
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    new_Year_Theme3: {
      marginTop: 10,
      backgroundColor: "#372F4C",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    mongolia_Theme3: {
      marginTop: 10,
      backgroundColor: "#8D3E2D",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    mexico_Theme3: {
      marginTop: 10,
      backgroundColor: "#076D4A",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    england_Theme3: {
      marginTop: 10,
      backgroundColor: "#5770A8",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    usindep_Theme3: {
      marginTop: 10,
      backgroundColor: "#BC003C",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    circularRowTheme: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
    },
    circularSecTheme: {
      height: 40,
      width: 40,
      borderRadius: 50,
      backgroundColor: "#F0E0F1",
      margin: 5,
    },
    circularCristmasSecTheme: {
      height: 40,
      width: 40,
      borderRadius: 50,
      backgroundColor: COLORS.christmas_yellow,
      margin: 5,
    },
    circularnewYearSecTheme: {
      height: 40,
      width: 40,
      borderRadius: 50,
      backgroundColor: COLORS.newYear_yellow,
      margin: 5,
    },
    circular_new_YearSecTheme: {
      height: 40,
      width: 40,
      borderRadius: 50,
      backgroundColor: "#FBEDC8",
      margin: 5,
    },
    circular_mongoliaTheme: {
      height: 40,
      width: 40,
      borderRadius: 50,
      backgroundColor: "#FDF1E9",
      margin: 5,
    },
    whiteRowTheme: {
      width: "100%",
      paddingVertical: 15,
    },
    whiteLineTheme: {
      height: 8,
      backgroundColor: "#F0E0F1",
      width: "50%",
    },
    yellowLineTheme: {
      height: 8,
      backgroundColor: COLORS.christmas_yellow,
      width: "50%",
    },
    newYearlineTheme: {
      height: 8,
      backgroundColor: COLORS.newYear_yellow,
      width: "50%",
    },
    new_Year_lineTheme: {
      height: 8,
      backgroundColor: "#FBEDC8",
      width: "50%",
    },
    mongolia_lineTheme: {
      height: 8,
      backgroundColor: "#FDF1E9",
      width: "50%",
    },
    wyellowLineTheme: {
      height: 8,
      backgroundColor: COLORS.christmas_yellow,
      width: "25%",
      marginTop: 5,
    },
    newyellowLineTheme: {
      height: 8,
      backgroundColor: COLORS.newYear_yellow,
      width: "25%",
      marginTop: 5,
    },
    new_yellow_LineTheme: {
      height: 8,
      backgroundColor: "#FBEDC8",
      width: "25%",
      marginTop: 5,
    },
    mongolia_LineTheme: {
      height: 8,
      backgroundColor: "#FDF1E9",
      width: "25%",
      marginTop: 5,
    },
    whitesmallLineTheme: {
      height: 8,
      backgroundColor: "#F0E0F1",
      width: "25%",
      marginTop: 5,
    },
    yellowText: {
      margin: 2,
      fontSize: 13,
      marginLeft: 10,
      marginRight: 10,
      justifyContent: "center",
      fontFamily: font.regular(),
    },
    yellowTextContainer: {
      backgroundColor: "#EBEBEB",
      justifyContent: "center",
      alignItems: "flex-start",
      borderBottomRightRadius: 10,
      borderBottomLeftRadius: 10,
    },
    thirdTextContainer: {
      flexDirection: "row",
      backgroundColor: "#EBEBEB",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottomRightRadius: 10,
      borderBottomLeftRadius: 10,
    },
    firstButton: {
      height: 50,
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.purple,
    },
    secondButton: {
      height: 50,
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.primary_blue,
    },
    thirdButton: {
      height: 50,
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonFirstTheme: {
      fontSize: FontSize.font,
      color: COLORS.white,
      fontFamily: font.medium(),
    },
    buttonSecondTheme: {
      fontSize: 14,
      color: COLORS.white,
    },

    newChatIcon: {
      alignItems: "center",
      height: 20,
      width: 20,
      tintColor: COLORS.white,
    },
    checkIcon: {
      alignItems: "center",
      height: 22,
      width: 22,
      tintColor: COLORS.white,
    },
    tabContainer: {
      flexDirection: "row",
      marginTop: 20,
      marginBottom: 10,
      height: 40,
      borderWidth: 0.5,
      borderColor: COLORS.grey,
      borderRadius: 10,
      width: "70%",
      alignSelf: "center",
    },
    tabButton: {
      justifyContent: "center",
      alignItems: "center",
      height: 40,
      width: "50%",
      borderRightWidth: 1,
      borderRightColor: COLORS.grey,
    },

    tabText: {
      fontSize: 14,
      color: COLORS.grey,
    },
    tabTextActive: {
      color: iconTheme().iconColorNew, // Highlight active tab text
    },
    page: {},
    card: {
      height: windowHeight - 400,
      borderRadius: 10,
      overflow: "hidden",
      elevation: 5,
      backgroundColor: "#ccc",
      width: windowWidth - 30,
      marginTop: -40,
    },
    image: {
      width: "100%",
      height: "100%", // Full height of the card
      position: "absolute", // Ensures the image covers the entire card
    },
    overlayButtons: {
      position: "absolute", // Position buttons on top of the image
      bottom: 20, // Adjust this to move buttons up or down
      width: "80%",
      flexDirection: "row",
      alignSelf: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      zIndex: 10,
    },
    likeButton: {
      backgroundColor: searchBar().back_ground, // Green for Like
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 40,
      justifyContent: "center",
      height: 80,
      width: 80,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "gray",
      overflow: "hidden",
    },
    innerShadow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 40,
      backgroundColor: "transparent",
    },
    dislikeButton: {
      backgroundColor: "#F44336", // Red for Dislike
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 25,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    cardFooter: {
      position: "absolute",
      bottom: 123,
      left: 20,
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 2,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
      //  padding: 3,
    },
    location: {
      position: "absolute",
      bottom: 88,
      left: 20,
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 3,
      borderRadius: 2,
      paddingVertical: 4,
    },
    diamondContainer: {
      height: 30,
      // width: 110,
      backgroundColor: searchBar().back_ground,
      right: 10,
      position: "absolute",
      marginTop: 10,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      borderColor: "gray",
      borderWidth: 0.8,
    },
    chatTopContainer: {
      paddingBottom: 30,
      zIndex: 1002,
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 15,
      marginTop: 15,
    },
    callText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height:
        DeviceInfo.hasNotch() == true ? windowHeight - 190 : windowHeight - 170,
    },
    infoIconContainer: {
      zIndex: 1,
      height: 20,
      width: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    infoIconTextContainer: {
      right: 50,
      top: 60,
      left: 30,
      position: "absolute",
      backgroundColor: "rgba(0,0,0,0.1)",
      width: "auto",
      zIndex: 100,
    },
  });

  const returnPackageName = () => {
    let packagename = "";
    if (Platform.OS == "ios") {
      if (checked === "newYearTheme") {
        packagename = "com.deucetek.theme3";
      } else if (checked === "newYear") {
        packagename = "com.deucetek.newyearTheme";
      } else {
        packagename = "com.deucetek.christmasTheme";
      }
    } else {
      if (checked === "newYearTheme") {
        packagename = "com.deucetek.theme3";
      } else if (checked === "newYear") {
        packagename = "com.deucetek.newyeartheme";
      } else {
        packagename = "com.deucetek.christmastheme";
      }
    }

    return packagename.toUpperCase();
  };

  function checkIfPurchased() {
    let SelectedStatus = false;
    for (var i = 0; i < purchasedTheme.length; i++) {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      const themeName = purchasedTheme[i]?.theme_name?.toUpperCase();
      if (themeName == returnPackageName()) {
        SelectedStatus = true;
      }
    }
    return SelectedStatus;
  }

  function renderPurchaseButtonTitle() {
    const themes = {
      first: t("apply_yellauve"),
      indiaTheme: t("Apply_India_Theme"),
      americaTheme: t("Apply_America_Theme"),
      englandTheme: t("Apply_England_Theme"),
      third: t("apply_pink"),
      mexicoTheme: t("Apply_Mexico_Theme"),
      mongoliaTheme: t("Apply_Mongolia_Theme"),
      second: t("apply_blurple"),
      newYearTheme: {
        purchased: t("apply_newyear"),
        notPurchased: t("by_newYearTheme") + " $1.99",
      },
      newYear: {
        purchased: t("apply_helloween"),
        notPurchased: t("by_newyear") + " $1.99",
      },
      usindepTheme: {
        purchased: t("Apply_US_Independence_day_Theme"),
        notPurchased: t("Buy_Theme_US_day_for") + " $1.99",
      },
      christmas: {
        purchased: t("apply_christmas"),
        notPurchased: t("by_christmas") + " $1.99",
      },
    };

    const renderButtonContent = (text, icon) => (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image source={icon} style={styles.newChatIcon} />
        <Text style={styles.buttonSecondTheme}>{text}</Text>
      </View>
    );

    if (
      checked === "newYearTheme" ||
      checked === "newYear" ||
      checked === "usindepTheme" ||
      checked === "christmas"
    ) {
      const status = checkIfPurchased();
      const themeText = status
        ? themes[checked]?.purchased
        : themes[checked]?.notPurchased;
      const icon = status
        ? require("../../Assets/Icons/check_icon.png")
        : require("../../Assets/Icons/lock_icon.png");

      return renderButtonContent(themeText, icon);
    } else {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      const themeText = themes[checked] || themes?.default?.purchased;
      return renderButtonContent(
        themeText,
        require("../../Assets/Icons/check_icon.png")
      );
    }
  }

  const themeColors: { [key: string]: string } = {
    first: "#F4EB8A",
    second: "#FCF1FF",
    mongoliaTheme: "#D1EFED",
    mexicoTheme: "#D9D29A",
    usindepTheme: "#BC003C",
    third: "#FFC8E6",
    christmas: "#B92519",
    newYear: "#E88E34",
    newYearTheme: "#372F4C",
    americaTheme: "#A30025",
    englandTheme: "#DC4C4D",
    indiaTheme: "#D55434",
  };

  const changethemecolor = (themecolorarg: string) => {
    const color = themeColors[themecolorarg];
    if (color) {
      setthemecolor(color);
    }
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  let requestQueue = []; // Queue to handle API calls
  let isProcessing = false; // Flag to prevent overlapping processing

  function ToUpdate(item) {
    console.log("dimonds", dimonds);
    if (dimonds == 0) {
      setTopUpModel(true);
      if (swiperRef.current) {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        swiperRef.current.swipeBack();
      }
    } else {
      lastSwipedData = {};
      //  setImageIndexes(imageIdex);
      lastSwipedData = item;
      lastSwipedDirection = "right";

      // Add the swipe action to the queue
      enqueueRequest(() => SendFriendRequest(item));
      const latestDimonds = dimonds - 10;
      dispatch(setDaimonds(latestDimonds));
    }
  }

  function enqueueRequest(request) {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    requestQueue.push(request); // Add the request to the queue

    if (!isProcessing) {
      processQueue();
    }
  }

  async function processQueue() {
    if (requestQueue.length === 0) {
      isProcessing = false; // No more requests to process
      return;
    }

    isProcessing = true; // Mark processing as active

    const currentRequest = requestQueue.shift(); // Get the next request

    try {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      await currentRequest(); // Execute the request
    } catch (error) {
      console.log("Request failed, retrying...", error);
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      requestQueue.push(currentRequest); // Re-add failed request to the queue
    }

    // Continue processing the next request
    processQueue();
  }

  const SendFriendRequest = async (item) => {
    showToast(t("Friend request sent successfully."));
    const url = Base_Url + sendfriendrequest;
    try {
      const response = await axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
        data: {
          request_user_id: item?.id,
        },
      });

      if (response.data.status === true) {
        console.log("response of send request api", item?.id);
        const newobject = {
          to_user: {
            id: item?.id,
          },
        };
        const newdataaa = [...myrequestdata, newobject];
        dispatch(setmyrequestdata(newdataaa));
        await UpdatePurchaseApiCalling(response.data.data.friend_request_id); // Wait for the purchase update
      }
    } catch (error) {
      console.log("Error in SendFriendRequest:", error.response || error);
      throw error; // Bubble up the error for retry
    }
  };

  const handleRevert = () => {
    console.log("🛠️ Last Swiped Data:", lastSwipedData);
    console.log("🛠️ Last Swiped Direction:", lastSwipedDirection);

    if (!lastSwipedData || Object.keys(lastSwipedData).length === 0) {
      console.log("No card to revert!");
      return;
    }
    console.log("lastSwipedData >>> :::", lastSwipedData);

    // Restore card to the data list
    //  setFriendSugesstionData((prevData) => [lastSwipedData, ...prevData]);
    let temp: any = [];
    temp.push(lastSwipedData);
    for (let i = 0; i < friendSugesstionData.length; i++) {
      let item = friendSugesstionData[i];
      temp.push(item);
    }
    console.log("Temp Object >>>>>>", temp);
    setFriendSugesstionData(temp);

    // Restore Image Index
    setImageIndexes((prevIndexes) => [0, ...prevIndexes]); // Ensure image index is also reset

    // Force re-render to show updated card
    forceRerenderSwiper();

    if (lastSwipedDirection === "right") {
      const latestDimonds = dimonds + 10;
      dispatch(setDaimonds(latestDimonds));
      // updateFriendSuggestions()
      console.log("Reverted a right swipe, calling API...");
      RevertCardApiCalling();
      // Call API to revert right swipe
      // revertRightSwipeAPI(lastSwipedData);
    }

    // Reset stored swipe data

    lastSwipedData = {};
    lastSwipedDirection = "";
    console.log("friend sugest data ::: >>>>", friendSugesstionData);
  };

  function RevertCardApiCalling() {
    const data = {
      friend_id: lastSwipedData.id,
    };
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    PostApiCall(
      revert_card,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        console.log("reevert api response >>", ResponseData);
        dispatch(setDiamondBalanceObj(ResponseData.data));
        globalThis.purchasedDiamonds = ResponseData.data.purchase_diamonds;
        globalThis.creditedDiamonds = ResponseData.data.credited_diamonds;

        globalThis.DiamondBalance =
          ResponseData.data.credited_diamonds +
          ResponseData.data.earned_diamonds +
          ResponseData.data.purchase_diamonds;
        console.log("reevert api error >>", ErrorStr);
        // themePurchaseSuccess(ResponseData, ErrorStr);
      }
    );
  }
  function UpdatePurchaseApiCalling(id) {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    let cred = globalThis.creditedDiamonds;
    let purchase = globalThis.purchasedDiamonds;
    let earned = globalThis.earnedDiamonds;

    if (globalThis.creditedDiamonds > 10) {
      cred = globalThis.creditedDiamonds - 10;
      purchase = globalThis.purchasedDiamonds;
      earned = globalThis.earnedDiamonds;
    } else if (globalThis.earnedDiamonds > 10) {
      cred = 0;
      purchase = globalThis.purchasedDiamonds;
      earned = globalThis.earnedDiamonds - 10;
    } else {
      cred = 0;
      purchase = globalThis.purchasedDiamonds - 10;
      earned = 0;
    }

    const data = {
      purchase_diamonds: purchase,
      credited_diamonds: cred,
      earned_diamonds: earned,
      consumed_diamonds: 10,
      friend_request_id: id,
    };

    return new Promise((resolve, reject) => {
      PostApiCall(
        update_diamond_purchase,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          if (ResponseData.status === true) {
            dispatch(setDiamondBalanceObj(ResponseData.data));
            globalThis.purchasedDiamonds = ResponseData.data.purchase_diamonds;
            globalThis.creditedDiamonds = ResponseData.data.credited_diamonds;

            globalThis.DiamondBalance =
              ResponseData.data.credited_diamonds +
              ResponseData.data.earned_diamonds +
              ResponseData.data.purchase_diamonds;

            updateFriendSuggestions();
            if (friendSugesstionData.length > 0) {
              forceRerenderSwiper();
            }
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            resolve(); // Resolve the promise on success
          } else if (ErrorStr) {
            console.log("Error in UpdatePurchaseApi:", ErrorStr);
            reject(ErrorStr); // Reject the promise on error
          }
        }
      );
    });
  }

  const handler1 = () => {
    // if (pagerChatListRef.current) {

    // pagerChatListRef.current.setPage(0); // Navigate to the first page
    settabactive(0); // Highlight the first tab
    // }
  };

  const handler2 = () => {
    setTimeout(() => {
      if (
        myprofileData?.preference_images?.length == 0 &&
        globalThis.isUserseventeenYearsOld == true &&
        friendSugesstionData.length > 0
      ) {
        setNavigateToImageScreen(true);
        globalThis.successText =
          "Enhance your Tokee Match Profile! Add photos to increase your chances of connecting with other tokee users and make your experience even better!";
        setSuccessAlertModel(true);
      }

      settabactive(1);
    }, 1000);
  };

  // Call scrollToTop when the component is mounted or shown
  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      scrollToTop();
    });
    return unsubscribe2;
  }, []);
  const handleDislike = () => {
    if (swiperRef.current) {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      swiperRef.current.swipeLeft(); // Programmatically swipe left to show the next card
    }
    updateFriendSuggestions();
    forceRerenderSwiper();
  };

  const updateFriendSuggestions = () => {
    setFriendSugesstionData((prevData) => prevData.slice(1)); // Remove the first card
  };

  const forceRerenderSwiper = () => {
    setSwiperKey((prevKey) => prevKey + 1); // Increment key to re-render Swiper
  };

  function RightIcons() {
    if (globalThis.selectTheme == "second") {
      return require("../../Assets/rightwrong/secondright.png");
    } else if (globalThis.selectTheme == "third") {
      return require("../../Assets/rightwrong/thirdright.png");
    } else if (globalThis.selectTheme == "mongoliaTheme") {
      return require("../../Assets/rightwrong/mongoliaright.png");
    } else if (globalThis.selectTheme == "mexicoTheme") {
      return require("../../Assets/rightwrong/mexicoright.png");
    } else if (globalThis.selectTheme == "englandTheme") {
      return require("../../Assets/rightwrong/Englandright.png");
    } else if (globalThis.selectTheme == "indiaTheme") {
      return require("../../Assets/rightwrong/indiaright.png");
    } else if (globalThis.selectTheme == "americaTheme") {
      return require("../../Assets/rightwrong/americaright.png");
    } else if (globalThis.selectTheme == "usindepTheme") {
      return require("../../Assets/rightwrong/usindepright.png");
    } else if (globalThis.selectTheme == "christmas") {
      return require("../../Assets/rightwrong/christmasright.png");
    } else if (globalThis.selectTheme == "newYear") {
      return require("../../Assets/rightwrong/newyearright.png");
    } else if (globalThis.selectTheme == "newYearTheme") {
      return require("../../Assets/rightwrong/newyearthemeright.png");
    } else {
      return require("../../Assets/rightwrong/defaultright.png");
    }
  }

  function WrongIcons() {
    if (globalThis.selectTheme == "second") {
      return require("../../Assets/rightwrong/second.png");
    } else if (globalThis.selectTheme == "third") {
      return require("../../Assets/rightwrong/third.png");
    } else if (globalThis.selectTheme == "mongoliaTheme") {
      return require("../../Assets/rightwrong/mongolia.png");
    } else if (globalThis.selectTheme == "mexicoTheme") {
      return require("../../Assets/rightwrong/mexico.png");
    } else if (globalThis.selectTheme == "englandTheme") {
      return require("../../Assets/rightwrong/England.png");
    } else if (globalThis.selectTheme == "indiaTheme") {
      return require("../../Assets/rightwrong/india.png");
    } else if (globalThis.selectTheme == "americaTheme") {
      return require("../../Assets/rightwrong/America.png");
    } else if (globalThis.selectTheme == "usindepTheme") {
      return require("../../Assets/rightwrong/usindep.png");
    } else if (globalThis.selectTheme == "christmas") {
      return require("../../Assets/rightwrong/christmas.png");
    } else if (globalThis.selectTheme == "newYear") {
      return require("../../Assets/rightwrong/newyear.png");
    } else if (globalThis.selectTheme == "newYearTheme") {
      return require("../../Assets/rightwrong/newyeartheme.png");
    } else {
      return require("../../Assets/rightwrong/default.png");
    }
  }

  function RevertIcons() {
    if (globalThis.selectTheme == "second") {
      return require("../../Assets/rightwrong/secondrefresh.png");
    } else if (globalThis.selectTheme == "third") {
      return require("../../Assets/rightwrong/thirdrefresh.png");
    } else if (globalThis.selectTheme == "mongoliaTheme") {
      return require("../../Assets/rightwrong/mongoliarefresh.png");
    } else if (globalThis.selectTheme == "mexicoTheme") {
      return require("../../Assets/rightwrong/mexicorefresh.png");
    } else if (globalThis.selectTheme == "englandTheme") {
      return require("../../Assets/rightwrong/Englandrefresh.png");
    } else if (globalThis.selectTheme == "indiaTheme") {
      return require("../../Assets/rightwrong/indiarefresh.png");
    } else if (globalThis.selectTheme == "americaTheme") {
      return require("../../Assets/rightwrong/americarefresh.png");
    } else if (globalThis.selectTheme == "usindepTheme") {
      return require("../../Assets/rightwrong/usindependrefresh.png");
    } else if (globalThis.selectTheme == "christmas") {
      return require("../../Assets/rightwrong/christmasrefresh.png");
    } else if (globalThis.selectTheme == "newYear") {
      return require("../../Assets/rightwrong/newyearrefresh.png");
    } else if (globalThis.selectTheme == "newYearTheme") {
      return require("../../Assets/rightwrong/newyearthemerefresh.png");
    } else {
      return require("../../Assets/rightwrong/defaultrefresh.png");
    }
  }
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themecolor}
    >
      <View
        style={{
          position: "relative",
          backgroundColor: themecolor,
        }}
      >
        <LoaderModel visible={loaderMoedl} />
        <DiamondTopupModel
          visible={topUpMOdel}
          cancel={() => {
            setTopUpModel(false);
          }}
          errorText={t("Refill your diamonds.")}
          firstText={t("Oops")}
          onRequestClose={() => {
            setTopUpModel(false);
          }}
          confirmButton={() => {
            setTopUpModel(false);
            globalThis.forScreen = "match";
            navigation.navigate("DiamondPurcahse");
          }}
        />
        <ConfirmAlertModel
          visible={confirmAlertModel}
          onRequestClose={() => setConfirmAlertModel(false)}
          confirmText={globalThis.confirmText}
          cancel={() => setConfirmAlertModel(false)}
          confirmButton={() => {
            setConfirmAlertModel(false);
            SendFriendRequest(selectedFriend);
          }}
        />
        <SuccessModel
          visible={successAlertModel}
          onRequestClose={() => setSuccessAlertModel(false)}
          succesText={globalThis.successText}
          doneButton={() => {
            if (navigateToImageScreen) {
              setSuccessAlertModel(false);
              setNavigateToImageScreen(false);
              navigation.navigate("UpdateTokeeMatchImage");
            } else {
              setSuccessAlertModel(false);
              navigation.navigate("BottomBar");
            }
          }}
        />
        <FriendMatchPeopleModel
          visible={showFriendMatchPeopletModel}
          onRequestClose={() => setShowFriendMatchPeopletModel(false)}
          succesText={
            globalThis.numberOfPeople + " " + "People found in this region."
          }
          succesNextText="On each request 10 diamonds will be deducted."
          doneButton={() => {
            setShowFriendMatchPeopletModel(false);
            navigation.navigate("BottomBar");
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
        <ThemeSucessModel
          visible={themeSuccessModel}
          returnHome={() => {
            setThemeSuccessModel(false), applyTheme(globalThis.selectTheme);
          }}
        />
        {Platform.OS == "android" ? (
          <View
            style={{
              height: StatusBar.currentHeight || top,
              backgroundColor: themecolor,
            }}
          >
            <SafeAreaView
              style={{ backgroundColor: themecolor }}
            ></SafeAreaView>
          </View>
        ) : null}

        <TopBar
          showTitle={true}
          title={t("explore")}
          navState={navigation}
          checked={checked}
        />
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity
            // onPress={() => {
            //   cancelSelection();
            // }}
            >
              {/* <Text style={styles.callText}>{t("cancel")}</Text> */}
            </TouchableOpacity>

            <View
            // onPress={() => setSelectPressed(!selectPressed)}
            >
              {tabactive == 1 && globalThis.isUserseventeenYearsOld == true ? (
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={() => {
                      globalThis.forScreen = "match";
                      navigation.navigate("DiamondPurcahse");
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/diamond.png")}
                      style={{
                        height: 22,
                        width: 22,
                        tintColor: appBarText().textColor,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={() => {
                      globalThis.forScreen = "match";
                      navigation.navigate("TokeeMatchQuestion");
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/filter.png")}
                      style={{
                        height: 20,
                        width: 20,
                        tintColor: appBarText().textColor,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      //  setIsFirstLoad(true);
                      shareToFacebook();
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/Share.png")}
                      style={{
                        height: 22,
                        width: 22,
                        tintColor: appBarText().textColor,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    height: 22,
                    width: 22,
                  }}
                ></View>
              )}
            </View>
          </View>
        </View>

        {/* <View style={styles.themeTopContainer}></View> */}

        {checked === "christmas" ||
        checked === "newYear" ||
        checked === "newYearTheme" ||
        checked === "mexicoTheme" ||
        checked === "americaTheme" ||
        checked === "englandTheme" ||
        checked === "indiaTheme" ||
        checked === "mongoliaTheme" ||
        checked === "usindepTheme" ? (
          <ImageBackground
            source={
              checked == "americaTheme"
                ? require("../../Assets/Icons/americaThemeTop.png")
                : checked == "indiaTheme"
                ? require("../../Assets/Icons/IndiaThemeTop.png")
                : checked == "englandTheme"
                ? require("../../Assets/Icons/EnglandThemeTop.png")
                : checked == "usindepTheme"
                ? require("../../Assets/Icons/us_top_back.png")
                : checked == "mexicoTheme"
                ? require("../../Assets/Icons/top_mexico.png")
                : checked == "mongoliaTheme"
                ? require("../../Assets/Icons/mongoliaTheme_top.png")
                : checked == "newYearTheme"
                ? require("../../Assets/Icons/SettingPageNewYearTheme.png")
                : checked == "newYear"
                ? require("../../Assets/Icons/NewYearSetting.png")
                : checked == "christmas"
                ? require("../../Assets/Icons/SettingChristmas.png")
                : checked == "third"
                ? undefined
                : checked == "second"
                ? undefined
                : undefined
            }
            resizeMode="cover" // Update the path or use a URL
            style={{
              height: "100%",
              width: windowWidth,
              marginTop: 0,
              position: "absolute",
              bottom: 0,
              zIndex: 0,
              top:
                Platform.OS === "ios"
                  ? DeviceInfo.hasNotch()
                    ? -40
                    : -40
                  : DeviceInfo.hasNotch()
                  ? 0
                  : -40,
            }}
          ></ImageBackground>
        ) : null}
      </View>
      <View style={styles.chatContainer}>
        {/* /////////////////////////////////tab-work/////////////////// */}
        {tabactive == 1 &&
          seenCardInro == false &&
          globalThis.isUserseventeenYearsOld == true &&
          friendSugesstionData.length > 0 && (
            <TouchableOpacity
              style={{
                position: "absolute",
                backgroundColor: "rgba(0,0,0,0.6)",
                zIndex: 1,
                height: windowHeight - 300,
                width: windowWidth,
                marginHorizontal: 0,
                marginLeft: -10,
                justifyContent: "center",
                alignItems: "center",
                // borderRadius: 10,
                // overflow: "hidden",
                // elevation: 5,
                //marginHorizontal: 10,
                // marginTop: 10,
              }}
              onPress={async () => {
                await AsyncStorage.setItem("setSeenCardIntro", "true");
                setSeenCardIntro(true);
                setShowFriendMatchPeopletModel(true);
              }}
            >
              <Image
                source={require("../../Assets/Image/Group4.png")}
                style={{ height: 300, width: 300 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton]}
            onPress={() => handler1()}
          >
            <Text
              style={[
                styles.tabText,
                tabactive === 0 && styles.tabTextActive, // Highlight active tab text
              ]}
            >
              {t("themes")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              {
                borderRightWidth: 0,
              },
            ]}
            onPress={() => handler2()}
          >
            <Text
              style={[
                styles.tabText,
                tabactive === 1 && styles.tabTextActive, // Highlight active tab text
              ]}
            >
              {t("tokee_match")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PagerView */}
        {/* <PagerView
        style={{ height:windowHeight - 300}}
        initialPage={0}
        onPageSelected={onPageSelected}
        ref={pagerChatListRef}
      > */}
        {tabactive == 0 ? (
          <View key="1" style={styles.page}>
            <View style={styles.themeContainer}>
              <View style={[styles.chooseContainer]}>
                {!processing && !success && !failed && (
                  <ScrollView
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    ref={scrollViewRef}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.nText}>{t("choose_your_theme")}</Text>
                    <View
                      style={{
                        marginBottom: DeviceInfo.hasNotch() ? 270 : 85,
                      }}
                    >
                      {/*    ********** TAB FOR YELLAUE THEME  ***************   */}

                      <View
                        style={[
                          styles.rowFristTheme,
                          { opacity: checked === "first" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "first" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("first");
                              changethemecolor("first");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "first" ? "#19B043" : "white",
                                borderColor:
                                  checked === "first" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.yelloTheme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.yelloThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.yelloSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.purpleFristTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.purpleSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.circularTheme}>
                            <View style={styles.circularRowTheme}>
                              <View style={styles.circularSecTheme}></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.whiteLineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.whitesmallLineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                          </View>
                          <View style={styles.thirdTextContainer}>
                            <Text
                              style={[
                                styles.yellowText,
                                {
                                  fontWeight:
                                    globalThis.selectTheme !== checked
                                      ? "800"
                                      : "300",
                                },
                              ]}
                            >
                              {t("yellauve")}
                              {globalThis.selectTheme == "first"
                                ? currentText
                                : null}
                            </Text>
                            <Text style={styles.yellowText}>{t("Free")}</Text>
                          </View>
                        </View>
                      </View>

                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "first",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //  paddingHorizontal: 20,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}
                      {/*    ********** TAB FOR BLURPLE THEME  ***************   */}

                      <View
                        style={[
                          styles.rowSecondTheme,
                          { opacity: checked === "second" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "second" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("second");
                              changethemecolor("second");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "second" ? "#19B043" : "white",
                                borderColor:
                                  checked === "second" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.blueTheme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.blueThemeRow}>
                              <Text></Text>
                            </View>

                            <View style={styles.blueSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>
                          <View style={styles.purpleTheme}>
                            <View style={styles.blueFristTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.blueSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.circularBlueTheme}>
                            <View style={styles.circularRowTheme}>
                              <View style={styles.circularSecTheme}></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.whiteLineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.whitesmallLineTheme}>
                                  <Text></Text>
                                </View>
                                <View></View>
                              </View>
                            </View>
                          </View>
                          <View style={styles.thirdTextContainer}>
                            <Text
                              style={[
                                styles.yellowText,
                                {
                                  fontWeight:
                                    globalThis.selectTheme !== checked
                                      ? "800"
                                      : "300",
                                },
                              ]}
                            >
                              {t("blurple")}
                              {globalThis.selectTheme == "second"
                                ? currentText
                                : null}
                            </Text>
                            <Text style={styles.yellowText}>{t("Free")}</Text>
                          </View>
                        </View>
                      </View>
                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "second",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //  paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/*    ********** TAB FOR PINK THEME  ***************   */}

                      <View
                        style={[
                          styles.rowSecondTheme,
                          { opacity: checked === "third" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "third" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("third");
                              changethemecolor("third");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "third" ? "#19B043" : "white",
                                borderColor:
                                  checked === "third" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.thirdTheme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.thirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.thirdSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.greenFristTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.greenSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.circularBlueTheme3}>
                            <View style={styles.circularRowTheme}>
                              <View style={styles.circularSecTheme}></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.whiteLineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.whitesmallLineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("theme_3")}
                                {globalThis.selectTheme == "third"
                                  ? currentText
                                  : null}
                              </Text>

                              <Text style={styles.yellowText}>{t("Free")}</Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "third",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //  paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}
                      {/*    ********** TAB FOR MONGOLIA THEME  ***************   */}
                      <View
                        style={[
                          styles.newYearTheme,
                          { opacity: checked === "mongoliaTheme" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "mongoliaTheme"
                                  ? "#19B043"
                                  : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("mongoliaTheme");
                              changethemecolor("mongoliaTheme");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "mongoliaTheme"
                                    ? "#19B043"
                                    : "white",
                                borderColor:
                                  checked === "mongoliaTheme" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.mongolia_Theme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.mongoliaThirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.mongoliaSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.mongolia_YellowTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.mongolia_YellowSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.mongolia_Theme3}>
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circular_mongoliaTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.mongolia_lineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.mongolia_LineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("mongolia")}
                                {globalThis.selectTheme == "mongoliaTheme"
                                  ? currentText
                                  : null}
                              </Text>
                              <Text style={styles.yellowText}>{t("Free")}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "mongoliaTheme",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            // paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}
                      {/*    ********** TAB FOR MEXICO THEME  ***************   */}
                      <View
                        style={[
                          styles.newYearTheme,
                          { opacity: checked === "mexicoTheme" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "mexicoTheme" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("mexicoTheme");
                              changethemecolor("mexicoTheme");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "mexicoTheme"
                                    ? "#19B043"
                                    : "white",
                                borderColor:
                                  checked === "mexicoTheme" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.mexicoTheme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.mexicoThirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.mexicoSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.mexico_YellowTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.mexico_YellowSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.mexico_Theme3}>
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circular_mongoliaTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.mongolia_lineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.mongolia_LineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("mexico")}
                                {globalThis.selectTheme == "mexicoTheme"
                                  ? currentText
                                  : null}
                              </Text>
                              <Text style={styles.yellowText}>{t("Free")}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "mexicoTheme",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //  paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/*    ********** TAB FOR ENGLAND THEME  ***************   */}
                      <View
                        style={[
                          styles.newYearTheme,
                          { opacity: checked === "englandTheme" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "englandTheme" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("englandTheme");
                              changethemecolor("englandTheme");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "englandTheme"
                                    ? "#19B043"
                                    : "white",
                                borderColor:
                                  checked === "englandTheme" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.englandTheme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.englandThirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.englandSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.england_YellowTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.england_YellowSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.england_Theme3}>
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circular_mongoliaTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.mongolia_lineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.mongolia_LineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("England")}
                                {globalThis.selectTheme == "englandTheme"
                                  ? currentText
                                  : null}
                              </Text>
                              <Text style={styles.yellowText}>{t("Free")}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "englandTheme",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //  paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor: "#DC4C4D",
                              },
                            ]}
                            onPress={() => ThemeSelection("englandTheme")}
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/*    ********** TAB FOR INDIA THEME  ***************   */}
                      <View
                        style={[
                          styles.newYearTheme,
                          { opacity: checked === "indiaTheme" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "indiaTheme" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("indiaTheme");
                              changethemecolor("indiaTheme");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "indiaTheme"
                                    ? "#19B043"
                                    : "white",
                                borderColor:
                                  checked === "indiaTheme" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.indiaTheme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.indiaThirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View
                              style={[
                                styles.englandSecondThemeRow,
                                { backgroundColor: "#EFFFFF" },
                              ]}
                            >
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View
                              style={[
                                styles.england_YellowTheme,
                                { backgroundColor: "#EFFFFF" },
                              ]}
                            >
                              <Text></Text>
                            </View>
                            <View
                              style={[
                                styles.england_YellowSecondTheme,
                                { backgroundColor: "#EFFFFF" },
                              ]}
                            >
                              <Text></Text>
                            </View>
                          </View>

                          <View
                            style={[
                              styles.england_Theme3,
                              { backgroundColor: "#FDCE5F" },
                            ]}
                          >
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circular_mongoliaTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.mongolia_lineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.mongolia_LineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("India")}
                                {globalThis.selectTheme == "indiaTheme"
                                  ? currentText
                                  : null}
                              </Text>
                              <Text style={styles.yellowText}>{t("Free")}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "indiaTheme",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //  paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor: "#D55434",
                              },
                            ]}
                            onPress={() => ThemeSelection("indiaTheme")}
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/*    ********** TAB FOR AMERICA THEME  ***************   */}
                      <View
                        style={[
                          styles.newYearTheme,
                          { opacity: checked === "americaTheme" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "americaTheme" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("americaTheme");
                              changethemecolor("americaTheme");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "americaTheme"
                                    ? "#19B043"
                                    : "white",
                                borderColor:
                                  checked === "americaTheme" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View
                          style={[
                            styles.indiaTheme,
                            { backgroundColor: "#0F3343" },
                          ]}
                        >
                          <View style={styles.yelloThemeFristRow}>
                            <View
                              style={[
                                styles.indiaThirdThemeRow,
                                { backgroundColor: "#FFF9D8" },
                              ]}
                            >
                              <Text></Text>
                            </View>
                            <View
                              style={[
                                styles.englandSecondThemeRow,
                                { backgroundColor: "#FFF9D8" },
                              ]}
                            >
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View
                              style={[
                                styles.england_YellowTheme,
                                { backgroundColor: "#FFF9D8" },
                              ]}
                            >
                              <Text></Text>
                            </View>
                            <View
                              style={[
                                styles.england_YellowSecondTheme,
                                { backgroundColor: "#FFF9D8" },
                              ]}
                            >
                              <Text></Text>
                            </View>
                          </View>

                          <View
                            style={[
                              styles.england_Theme3,
                              { backgroundColor: "#C91228" },
                            ]}
                          >
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circular_mongoliaTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.mongolia_lineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.mongolia_LineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("America")}
                                {globalThis.selectTheme == "americaTheme"
                                  ? currentText
                                  : null}
                              </Text>
                              <Text style={styles.yellowText}>{t("Free")}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "americaTheme",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //  paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor: "#0F3343",
                              },
                            ]}
                            onPress={() => ThemeSelection("americaTheme")}
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/*    ********** TAB FOR US INDEPENDANCE THEME  ***************   */}
                      <View
                        style={[
                          styles.newYearTheme,
                          { opacity: checked === "usindepTheme" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "usindepTheme" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("usindepTheme");
                              changethemecolor("usindepTheme");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "usindepTheme"
                                    ? "#19B043"
                                    : "white",
                                borderColor:
                                  checked === "usindepTheme" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.usindepTheme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.usindepThirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.usindepSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.usindep_YellowTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.usindep_YellowSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.usindep_Theme3}>
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circular_mongoliaTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.mongolia_lineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.mongolia_LineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("us_independence_day")}
                                {globalThis.selectTheme == "usindepTheme"
                                  ? currentText
                                  : null}
                              </Text>
                              {/* //<Text style={styles.yellowText}>$1.99</Text>
                        <Text style={styles.yellowText}>$1.99</Text> */}
                              <Text style={styles.yellowText}>
                                {t("$1.99")}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "usindepTheme",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //  paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/*    ********** TAB FOR CHRISTMAS THEME  ***************   */}
                      <View
                        style={[
                          styles.christmasTheme,
                          { opacity: checked === "christmas" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "christmas" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("christmas");
                              changethemecolor("christmas");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "christmas" ? "#19B043" : "white",
                                borderColor:
                                  checked === "christmas" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.christmas_Theme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.christmasThirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.cristmasSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.christmasGreenTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.christmasGreenSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.christmatTheme3}>
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circularCristmasSecTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.yellowLineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.wyellowLineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("christmas")}
                                {globalThis.selectTheme == "christmas"
                                  ? currentText
                                  : null}
                              </Text>
                              <Text style={styles.yellowText}>$1.99</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "christmas",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/*    ********** TAB FOR HELLOWEEN THEME  ***************   */}

                      <View
                        style={[
                          styles.newYearTheme,
                          { opacity: checked === "newYear" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "newYear" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("newYear");
                              changethemecolor("newYear");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "newYear" ? "#19B043" : "white",
                                borderColor:
                                  checked === "newYear" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.newYear_Theme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.newYearThirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.newYaerSecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.newYearYellowTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.newyearYellowSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.newYearTheme3}>
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circularnewYearSecTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.newYearlineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.newyellowLineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("helloweeen")}
                                {globalThis.selectTheme == "newYear"
                                  ? currentText
                                  : null}
                              </Text>
                              <Text style={styles.yellowText}>$1.99</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "newYear",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //   paddingHorizontal: 15,
                            marginBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}

                      {/*    ********** TAB FOR NEWYEAR THEME  ***************   */}

                      <View
                        style={[
                          styles.newYearTheme,
                          { opacity: checked === "newYearTheme" ? 1 : 0.4 },
                        ]}
                      >
                        <View style={{ width: "20%" }}>
                          <TouchableOpacity
                            style={{
                              borderRadius: 25,
                              borderWidth: 2,
                              borderColor:
                                checked === "newYearTheme" ? "#19B043" : "grey",
                              padding: 3,
                              width: 25,
                              marginTop: 10,
                            }}
                            onPress={() => {
                              handleThemeSelection("newYearTheme");
                              changethemecolor("newYearTheme");
                            }}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  checked === "newYearTheme"
                                    ? "#19B043"
                                    : "white",
                                borderColor:
                                  checked === "newYearTheme" ? "grey" : "red",
                                borderRadius: 25,
                                height: 15,
                                width: 15,
                              }}
                            ></View>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.new_Year_Theme}>
                          <View style={styles.yelloThemeFristRow}>
                            <View style={styles.new_YearThirdThemeRow}>
                              <Text></Text>
                            </View>
                            <View style={styles.new_Yaer_SecondThemeRow}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.purpleTheme}>
                            <View style={styles.new_Year_YellowTheme}>
                              <Text></Text>
                            </View>
                            <View style={styles.new_year_YellowSecondTheme}>
                              <Text></Text>
                            </View>
                          </View>

                          <View style={styles.new_Year_Theme3}>
                            <View style={styles.circularRowTheme}>
                              <View
                                style={styles.circular_new_YearSecTheme}
                              ></View>
                              <View style={styles.whiteRowTheme}>
                                <View style={styles.new_Year_lineTheme}>
                                  <Text></Text>
                                </View>
                                <View style={styles.new_yellow_LineTheme}>
                                  <Text></Text>
                                </View>
                              </View>
                              <View></View>
                            </View>
                            <View style={styles.thirdTextContainer}>
                              <Text
                                style={[
                                  styles.yellowText,
                                  {
                                    fontWeight:
                                      globalThis.selectTheme !== checked
                                        ? "800"
                                        : "300",
                                  },
                                ]}
                              >
                                {t("new_year")}
                                {globalThis.selectTheme == "newYearTheme"
                                  ? currentText
                                  : null}
                              </Text>
                              <Text style={styles.yellowText}>$1.99</Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {renderIf(
                        !processing &&
                          !success &&
                          !failed &&
                          globalThis.selectTheme !== checked &&
                          checked == "newYearTheme",

                        <View
                          style={{
                            width: "100%",
                            marginTop: 20,
                            //  position: "absolute",
                            left: 0,
                            right: 0,
                            // bottom: DeviceInfo.hasNotch() ? 250 : 0,
                            zIndex: 5,
                            //    paddingHorizontal: 15,
                            marginBottom: 50,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.thirdButton,
                              {
                                marginTop: "auto",
                                backgroundColor:
                                  checked == "mongoliaTheme"
                                    ? "#8D3E2D"
                                    : checked == "mexicoTheme"
                                    ? "#076D4A"
                                    : checked == "usindepTheme"
                                    ? "#BC003C"
                                    : checked == "newYearTheme"
                                    ? "#372F4C"
                                    : checked == "newYear"
                                    ? COLORS.newYear_theme
                                    : checked == "christmas"
                                    ? COLORS.primary_light_green
                                    : checked == "third"
                                    ? "#CF1886"
                                    : checked == "first"
                                    ? COLORS.purple
                                    : COLORS.primary_blue,
                              },
                            ]}
                            onPress={() =>
                              checked == "usindepTheme"
                                ? ThemeSelection("usindepTheme")
                                : checked == "mexicoTheme"
                                ? ThemeSelection("mexicoTheme")
                                : checked == "mongoliaTheme"
                                ? ThemeSelection("mongoliaTheme")
                                : checked == "newYearTheme"
                                ? ThemeSelection("newYearTheme")
                                : checked == "newYear"
                                ? ThemeSelection("newYear")
                                : checked == "christmas"
                                ? ThemeSelection("christmas")
                                : checked == "third"
                                ? ThemeSelection("third")
                                : checked == "first"
                                ? ThemeSelection("first")
                                : ThemeSelection("second")
                            }
                          >
                            {renderPurchaseButtonTitle()}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                )}

                {processing && !success && !failed && (
                  <View style={{ paddingTop: 114 }}>
                    <ActivityIndicator
                      size={91}
                      color={
                        checked == "newYearTheme"
                          ? "#372F4C"
                          : checked == "newYear"
                          ? COLORS.newYear_theme
                          : checked == "christmas"
                          ? COLORS.primary_light_green
                          : checked == "third"
                          ? "#CF1886"
                          : checked == "first"
                          ? COLORS.purple
                          : COLORS.primary_blue
                      }
                    />
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: "#372F4C",
                        textAlign: "center",
                        marginBottom: 7,
                      }}
                    >
                      Processing
                    </Text>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: "#372F4C",
                        textAlign: "center",
                        fontSize: 14,
                      }}
                    >
                      Please Wait while your
                    </Text>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: "#372F4C",
                        textAlign: "center",
                        fontSize: 14,
                      }}
                    >
                      payment is being processed
                    </Text>
                  </View>
                )}

                {failed && (
                  <View style={{ paddingTop: 50 }}>
                    <FastImage
                      style={{ height: 259 }}
                      resizeMode="contain"
                      source={require("../../Assets/Image/failed.png")}
                    />
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "700",
                        color: "#372F4C",
                        textAlign: "center",
                      }}
                    >
                      Oh no, your
                    </Text>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "700",
                        color: "#372F4C",
                        textAlign: "center",
                        marginBottom: 7,
                      }}
                    >
                      Payment Failed
                    </Text>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: "#372F4C",
                        textAlign: "center",
                        fontSize: 14,
                      }}
                    >
                      Something went wrong.
                    </Text>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: "#372F4C",
                        textAlign: "center",
                        fontSize: 14,
                      }}
                    >
                      Please try again!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View key="2" style={styles.page}>
            {globalThis.isUserseventeenYearsOld == true ? (
              <>
                {friendSugesstionData.length > 0 ? (
                  <>
                    <Swiper
                      key={swiperKey}
                      cards={friendSugesstionData}
                      ref={swiperRef}
                      cardHorizontalMargin={0}
                      cardIndex={0}
                      onSwipedRight={(cardIndex) => {
                        ToUpdate(friendSugesstionData[cardIndex]);
                      }}
                      onSwiped={() => {
                        if (
                          friendSugesstionData.length < 5 &&
                          !isApiCallInProgress
                        ) {
                          pageNumber = pageNumber + 1;
                          AllSuggestionsPagination();
                        }
                      }} // Hide after any swipe
                      onSwipedAll={() => {
                        pageNumber = pageNumber + 1;
                        AllSuggestionsPagination();
                      }}
                      onSwipedLeft={() => {
                        //setShowLike(false);
                        handleDislike();
                      }}
                      renderCard={(profile, cardIndex) => {
                        console.log("Rendering Card for Index:Profile:", profile);

                        if (!profile) {
                          return (
                            <View style={styles.card}>
                              <Text>{t("No_Profile_Found")}</Text>
                            </View>
                          );
                        }
                        console.log("profile profile>", profile);
                        const currentImageIndex = imageIndexes[cardIndex];
                        const currentImage =
                          Array.isArray(profile?.preference_images) &&
                          profile?.preference_images?.length > currentImageIndex
                            ? profile?.preference_images[currentImageIndex]
                                ?.image
                            : null;

                        console.log("current image>", currentImage);
                        return (
                          <View style={[styles.card]}>
                            {/* Full-height image */}
                            {currentImage ? (
                              <Image
                                source={{ uri: currentImage }}
                                style={styles.image}
                                resizeMode="cover"
                              />
                            ) : (
                              <>
                                {profile?.profile_image ==
                                "https://tokeecorp.com/backend/public/images/user-avatar.png" ? (
                                  <Image
                                    source={{ uri: profile.cover_image }}
                                    style={[styles.image, { opacity: 0.3 }]}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <Image
                                    source={{ uri: profile?.profile_image }}
                                    style={styles.image}
                                    resizeMode="cover"
                                  />
                                )}
                              </>
                              // <Image
                              //   source={{
                              //     uri:
                              //       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              //       profile?.profile_image ==
                              //       "https://tokeecorp.com/backend/public/images/user-avatar.png"
                              //         ? // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              //           profile?.cover_image
                              //         : // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              //           profile?.profile_image,
                              //   }}
                              //   style={[
                              //     styles.image,
                              //     {
                              //       opacity:
                              //         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              //         profile?.profile_image ==
                              //         "https://tokeecorp.com/backend/public/images/user-avatar.png"
                              //           ? 0.3
                              //           : 1.0,
                              //     },
                              //   ]}
                              //   resizeMode="cover"
                              // />
                            )}

                            <View style={styles.diamondContainer}>
                              <Image
                                source={require("../../Assets/Icons/diamond.png")}
                                style={{
                                  height: 20,
                                  width: 20,
                                  tintColor: appBarText().textColor,
                                }}
                                resizeMode="contain"
                              />
                              <Text
                                style={{ marginLeft: 5, fontWeight: "700" }}
                              >
                                {dimonds < 0 ? 0 : dimonds}
                              </Text>
                            </View>
                            <View style={styles.overlayButtons}>
                              <TouchableOpacity
                                onPress={() => {
                                  lastSwipedData = {};
                                  lastSwipedData = profile;
                                  lastSwipedDirection = "left";
                                  setTimeout(() => {
                                    if (swiperRef.current) {
                                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                      swiperRef.current.swipeLeft(); // Programmatically swipe right to show the next card
                                    }
                                  }, 300); // 500ms delay
                                }}
                              >
                                <Image
                                  source={WrongIcons()}
                                  style={{ height: 90, width: 90 }}
                                  resizeMode="contain"
                                />
                              </TouchableOpacity>

                              <TouchableOpacity onPress={() => handleRevert()}>
                                <Image
                                  source={RevertIcons()}
                                  style={{ height: 90, width: 90 }}
                                  resizeMode="contain"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  // Add a delay of 500ms before executing the logic
                                  setTimeout(() => {
                                    if (swiperRef.current) {
                                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                      swiperRef.current.swipeRight(); // Programmatically swipe right to show the next card
                                    }
                                  }, 300); // 500ms delay
                                }}
                              >
                                <Image
                                  source={RightIcons()}
                                  style={{ height: 90, width: 90 }}
                                  resizeMode="contain"
                                />
                              </TouchableOpacity>
                            </View>

                            {/* Card Footer */}
                            <View style={styles.cardFooter}>
                              <Text style={styles.name}>
                                {
                                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                  profile?.first_name || "Unknown"
                                }
                              </Text>
                              {renderIf(
                                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                profile?.age,
                                <>
                                  <Text
                                    style={{
                                      fontSize: 25,
                                      marginHorizontal: 10,
                                      color: "green",
                                    }}
                                  >
                                    •
                                  </Text>
                                  <Text style={styles.name}>
                                    {
                                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                      profile?.age
                                    }
                                  </Text>
                                </>
                              )}
                            </View>
                            <View style={styles.location}>
                              <Image
                                source={require("../../Assets/Icons/location_icon.png")}
                                style={{
                                  height: 20,
                                  width: 20,
                                  tintColor: "white",
                                }}
                                resizeMode="contain"
                              />
                              <Text style={[styles.name, { marginLeft: 5 }]}>
                                {
                                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                  profile?.country?.name
                                }
                              </Text>
                            </View>
                            {/* Left and Right Tap Sections */}
                            <View
                              style={[
                                StyleSheet.absoluteFill,
                                { flexDirection: "row" },
                              ]}
                            >
                              {/* Left Section */}
                              {renderIf(
                                profile?.preference_images?.length > 1,
                                <TouchableOpacity
                                  style={{
                                    flex: 1,
                                    width: "50%",
                                    height: windowHeight - 400,
                                  }}
                                  onPress={() => handleTapLeft(cardIndex)} // Handle left tap
                                />
                              )}
                              {/* Right Section */}
                              {renderIf(
                                profile?.preference_images?.length > 1,
                                <TouchableOpacity
                                  style={{
                                    flex: 1,
                                    width: "50%",
                                    height: windowHeight - 400,
                                  }}
                                  onPress={() => handleTapRight(cardIndex)} // Handle right tap
                                />
                              )}
                            </View>
                          </View>
                        );
                      }}
                      stackSize={3}
                      //  backgroundColor="red"
                    />
                  </>
                ) : (
                  <View
                    style={{
                      backgroundColor: "white",
                      height: windowHeight - 400,
                      borderRadius: 10,
                      elevation: 5,
                      marginHorizontal: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{ color: "#000", fontSize: 15, fontWeight: "600" }}
                    >
                      {t("No_more_matches_available")}
                    </Text>
                    {!isFirstLoad && (
                      <Text
                        style={{
                          color: "#000",
                          fontSize: 15,
                          fontWeight: "600",
                          marginTop: 10,
                          textAlign: "center",
                          marginHorizontal: 10,
                        }}
                      >
                        {t("Change_your_prefernces_from_above_filtericon")}
                      </Text>
                    )}
                    {isFirstLoad && (
                      <Text
                        style={{
                          color: "#000",
                          fontSize: 15,
                          fontWeight: "600",
                          marginTop: 10,
                          textAlign: "center",
                          marginHorizontal: 10,
                        }}
                      >
                        {t("Change_your_prefernces_from_above_filtericon")}
                      </Text>
                    )}
                  </View>
                )}
              </>
            ) : (
              <View
                style={{
                  height: windowHeight - 300,
                  // backgroundColor: "red",
                  alignItems: "center",
                  paddingTop: 150,
                  // justifyContent: "center",
                }}
              >
                <Image
                  source={require("../../Assets/Image/normal.png")}
                  style={{ height: 100, width: 200 }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    color: "#000",
                    textAlign: "center",
                    marginHorizontal: 20,
                  }}
                >
                  {t(
                    "Explore_and_connect_with_thepeople_which_matches_your_vibe"
                  )}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: iconTheme().iconColorNew,
                    padding: 10,
                    borderRadius: 10,
                    marginTop: 20,
                    paddingHorizontal: 20,
                  }}
                  onPress={() => {
                    globalThis.forScreen = "match";
                    navigation.navigate("TokeeMatchOnBoard");
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}
                  >
                    {t("Start_Explore")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        {/* First Page: Themes */}

        {/* Second Page: Tokee Match */}

        {/* </PagerView> */}

        {failed && (
          <View
            style={{
              width: "100%",
              marginTop: 20,
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
              paddingHorizontal: 15,
            }}
          >
            <TouchableOpacity
              style={[
                styles.thirdButton,
                {
                  marginTop: "auto",
                  backgroundColor:
                    checked == "newYearTheme"
                      ? "#372F4C"
                      : checked == "newYear"
                      ? COLORS.newYear_theme
                      : checked == "christmas"
                      ? COLORS.primary_light_green
                      : checked == "third"
                      ? "#CF1886"
                      : checked == "first"
                      ? COLORS.purple
                      : COLORS.primary_blue,
                },
              ]}
              onPress={() => {
                setfailed(false);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.buttonSecondTheme}> {t("Retry")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {success && (
          <Modal
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            animationType="fade"
            visible={success}
            transparent={true}
            onRequestClose={() => {
              setsuccess(false);
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(52, 52, 52, 0.1)",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            ></View>
            <View style={{ paddingTop: 50 }}>
              <FastImage
                style={{ height: 350, width: "90%" }}
                resizeMode="contain"
                source={require("../../Assets/Image/success.png")}
              />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#372F4C",
                  textAlign: "center",
                }}
              >
                Yayy!!!!
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#372F4C",
                  textAlign: "center",
                  marginBottom: 7,
                }}
              >
                Payment Successful
              </Text>
              <View
                style={{
                  width: "100%",
                  marginTop: 20,
                  paddingHorizontal: 20,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.thirdButton,
                    {
                      marginTop: "auto",
                      backgroundColor:
                        checked == "newYearTheme"
                          ? "#372F4C"
                          : checked == "newYear"
                          ? COLORS.newYear_theme
                          : checked == "christmas"
                          ? COLORS.primary_light_green
                          : checked == "third"
                          ? "#CF1886"
                          : checked == "first"
                          ? COLORS.purple
                          : COLORS.primary_blue,
                    },
                  ]}
                  onPress={() => {
                    setsuccess(false);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.buttonSecondTheme}>
                      {" "}
                      {t("Return to Home")}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </MainComponent>
  );
});

export default ShopScreen;
