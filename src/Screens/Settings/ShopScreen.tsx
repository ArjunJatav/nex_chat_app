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
import { COLORS, themeModule } from "../../Components/Colors/Colors";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import renderIf from "../../Components/renderIf";
import { theme_purchase, theme_purchase_list } from "../../Constant/Api";
import { LoaderModel } from "../Modals/LoaderModel";
import { ThemeSucessModel } from "../Modals/ThemeSuccessModel";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native";

let apiCall = false;

// eslint-disable-next-line
const ShopScreen = React.memo(({ navigation }: any) => {
  const { top } = useSafeAreaInsets();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [themecolor, setthemecolor] = useState(themeModule().theme_background); 
  const [checked, setChecked] = useState(globalThis.selectTheme);
  const { t} = useTranslation();
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [themeSuccessModel, setThemeSuccessModel] = useState(false);
  const [purchasedTheme, setPurchasedTheme] = useState([]);
  const currentText = " (" + t("current") + ")";
  const { toggleTheme } = useContext(ThemeContext);
  const [processing, setprocessing] = useState(false);
  const [success, setsuccess] = useState(false);
  const [failed, setfailed] = useState(false);
  const scrollViewRef = useRef();


  const saveCheckedState = async (value: string) => {
    try {
      await AsyncStorage.setItem("checkedState", value);
    } catch (error) {
      console.log("",error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setChecked(globalThis.selectTheme);
      setthemecolor(themeModule().theme_background);
    }, [])
  );

  useEffect(() => {
    loadCheckedState();
    initilizeIAPConnection();
  }, []);

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          Alert.alert(t("noInternet"), t("please_check_internet"), [
            { text: t("ok") },
          ]);
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
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
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
        console.log("",savedValue);
      }
    } catch (error) {
      console.log("",error);
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
      .catch((err) => {});
    await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
      .then(async (consumed) => {})
      .catch((err) => {});
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
      console.log("Purchaseproducts",Purchaseproducts)
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

          .then(async (result) => {})
          .catch((err) => {
            console.log("in errrrrr", err);
          });
      }
    } catch (err) {}
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
      let purchaseStatus = checkIfPurchased();
      if (purchaseStatus == true) {
        await AsyncStorage.setItem("selectTheme", value);
       
        globalThis.selectTheme = value;
        toggleTheme(value);

        Alert.alert(t("success"), t("colorThemeSuccess"), [
          { text: t("done"), onPress: () => navigation.navigate("BottomBar") },
        ]);
      } else {        
        requestPuechase();
      }
    } else {
      await AsyncStorage.setItem("selectTheme", value);
     
      globalThis.selectTheme = value;
      toggleTheme(value);
      Alert.alert(t("success"), t("colorThemeSuccess"), [
        { text: t("done"), onPress: () => navigation.navigate("BottomBar") },
      ]);
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
      Alert.alert(t("success"), t("colorThemeSuccess"), [
        { text: t("done"), onPress: () => navigation.navigate("BottomBar") },
      ]);
    }
  };

  // **********   Headers for loguot Api  ********** ///
  // eslint-disable-next-line
  const callThemePurchaseApi = async (themeName: any, TransactionId: any) => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        return;
      } else {
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.Authtoken, 
          localization: globalThis.selectLanguage,
        };
        let data = {
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

  ///////////////////////// **********   THEME PURCHASE API RESPONSE  ********** ///////////////////////////////
  // eslint-disable-next-line
  const themePurchaseSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setprocessing(false);
      setloaderMoedl(false);
    } else {
      apiCall = true;
      setloaderMoedl(false); 
      globalThis.selectTheme = ResponseData?.data?.purchase_item_for;
      setThemeSuccessModel(true);
            
    }
  };

  ///////////////////////// **********   APPLY TEME FOR API   ********** ///////////////////////////////
  // eslint-disable-next-line
  const applyTheme = async (CheckedValue: any) => {
    await AsyncStorage.setItem("selectTheme", CheckedValue);
    toggleTheme(CheckedValue);
    Alert.alert(t("success"), t("colorThemeSuccess"), [
      { text: t("done"), onPress: () => navigation.navigate("BottomBar") },
    ]);
  };

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
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height:
        DeviceInfo.hasNotch() == true ? windowHeight - 10 : windowHeight - 100,
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
      let themeName = purchasedTheme[i].theme_name.toUpperCase();
      if (themeName == returnPackageName()) {
        SelectedStatus = true;
      }
    }
    return SelectedStatus;
  }

  function renderPurchaseButtonTitle() {
    if (checked == "first") {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../Assets/Icons/check_icon.png")}
            style={styles.newChatIcon}
          />
          <Text style={styles.buttonSecondTheme}> {t("apply_yellauve")}</Text>
        </View>
      );
    } else if (checked == "third") {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../Assets/Icons/check_icon.png")}
            style={styles.newChatIcon}
          />
          <Text style={styles.buttonSecondTheme}> {t("apply_pink")}</Text>
        </View>
      );
    } else if (checked == "mexicoTheme") {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../Assets/Icons/check_icon.png")}
            style={styles.newChatIcon}
          />
          <Text style={styles.buttonSecondTheme}>
            {" "}
            {t("Apply_Mexico_Theme")}
          </Text>
        </View>
      );
    } else if (checked == "mongoliaTheme") {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../Assets/Icons/check_icon.png")}
            style={styles.newChatIcon}
          />
          <Text style={styles.buttonSecondTheme}>
            {" "}
            {t("Apply_Mongolia_Theme")}
          </Text>
        </View>
      );
    }  else if (checked == "second") {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../Assets/Icons/check_icon.png")}
            style={styles.newChatIcon}
          />

          <Text style={styles.buttonSecondTheme}> {t("apply_blurple")}</Text>
        </View>
      );
    } else if (checked == "newYearTheme") {
      const status = checkIfPurchased();
      if (status == true) {
        return (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../Assets/Icons/check_icon.png")}
              style={styles.newChatIcon}
            />

            <Text style={styles.buttonSecondTheme}> {t("apply_newyear")}</Text>
          </View>
        );
      } else {
        return (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../Assets/Icons/lock_icon.png")}
              style={styles.newChatIcon}
            />
            <Text style={styles.buttonSecondTheme}>
              {" "}
              {t("by_newYearTheme") + " $1.99"}
            </Text>
          </View>
        );
      }
    } else if (checked == "newYear") {
      const status = checkIfPurchased();
      if (status == true) {
        return (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../Assets/Icons/check_icon.png")}
              style={styles.newChatIcon}
            />

            <Text style={styles.buttonSecondTheme}>
              {" "}
              {t("apply_helloween")}
            </Text>
          </View>
        );
      } else {
        return (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../Assets/Icons/lock_icon.png")}
              style={styles.newChatIcon}
            />
            <Text style={styles.buttonSecondTheme}>
              {" "}
              {t("by_newyear") + " $1.99"}
            </Text>
          </View>
        );
      }}
      else if (checked == "usindepTheme") {
        const status = checkIfPurchased();
        if (status == true) {
          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../Assets/Icons/check_icon.png")}
                style={styles.newChatIcon}
              />
  
              <Text style={styles.buttonSecondTheme}>
                {" "}
                {t("Apply_US_Independence_day_Theme")}
              </Text>
            </View>
          );
        } else {
          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../Assets/Icons/lock_icon.png")}
                style={styles.newChatIcon}
              />
              <Text style={styles.buttonSecondTheme}>
                {" "}
                {t("Buy_Theme_US_day_for") + " $1.99"}
              </Text>
            </View>
          );
        }
    } else {
      const status = checkIfPurchased();
      if (status == true) {
        return (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../Assets/Icons/check_icon.png")}
              style={styles.newChatIcon}
            />

            <Text style={styles.buttonSecondTheme}>
              {" "}
              {t("apply_christmas")}
            </Text>
          </View>
        );
      } else {
        return (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../Assets/Icons/lock_icon.png")}
              style={styles.newChatIcon}
            />

            <Text style={styles.buttonSecondTheme}>
              {" "}
              {t("by_christmas") + " $1.99"}
            </Text>
          </View>
        );
      }
    }
  }

  // eslint-disable-next-line
  const changethemecolor = (themecolorarg: any) => {
    if (themecolorarg === "first") {
      setthemecolor("#F4EB8A");
    } else if (themecolorarg === "second") {
      setthemecolor("#FCF1FF");
    } else if (themecolorarg === "mongoliaTheme") {
      setthemecolor("#D1EFED");
    } else if (themecolorarg === "mexicoTheme") {
      setthemecolor("#D9D29A");
    } else if (themecolorarg === "usindepTheme") {
      setthemecolor("#BC003C");
    } else if (themecolorarg === "third") {
      setthemecolor("#FFC8E6");
    } else if (themecolorarg === "christmas") {
      setthemecolor("#B92519");
    } else if (themecolorarg === "newYear") {
      setthemecolor("#E88E34");
    } else if (themecolorarg === "newYearTheme") {
      setthemecolor("#372F4C");
    }
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Call scrollToTop when the component is mounted or shown
  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      scrollToTop();
    });
    return unsubscribe2;
  }, []);

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
            <SafeAreaView style={{ backgroundColor: themecolor }}>
            </SafeAreaView>
          </View>
        ) : 
        null}

        <TopBar
          showTitle={true}
          title={t("shop")}
          navState={navigation}
          checked={checked}
        />

        <View style={styles.themeTopContainer}></View>

        {
          checked === "christmas" || 
          checked === "newYear" || 
          checked === "newYearTheme" ||
          checked === "mexicoTheme" ||
          checked === "mongoliaTheme" ||
          checked === "usindepTheme" ? (
            <ImageBackground
              source={
                checked == "usindepTheme"
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
              }}
            ></ImageBackground>
          ) : null
        }
      </View>
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
                        borderColor: checked === "first" ? "#19B043" : "grey",
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
                          borderColor: checked === "first" ? "grey" : "red",
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
                        {
                          globalThis.selectTheme == "first" ? currentText : null
                        }
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
                        borderColor: checked === "second" ? "#19B043" : "grey",
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
                          borderColor: checked === "second" ? "grey" : "red",
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
                        {
                          globalThis.selectTheme == "second"
                            ? currentText
                            : null
                        }
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
                        borderColor: checked === "third" ? "#19B043" : "grey",
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
                          borderColor: checked === "third" ? "grey" : "red",
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
                          {
                            globalThis.selectTheme == "third"
                              ? currentText
                              : null
                          }
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
                          checked === "mongoliaTheme" ? "#19B043" : "grey",
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
                            checked === "mongoliaTheme" ? "#19B043" : "white",
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
                        <View style={styles.circular_mongoliaTheme}></View>
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
                          {
                            globalThis.selectTheme == "mongoliaTheme"
                              ? currentText
                              : null
                          }
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
                            checked === "mexicoTheme" ? "#19B043" : "white",
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
                        <View style={styles.circular_mongoliaTheme}></View>
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
                          {
                            globalThis.selectTheme == "mexicoTheme"
                              ? currentText
                              : null
                          }
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
                            checked === "usindepTheme" ? "#19B043" : "white",
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
                        <View style={styles.circular_mongoliaTheme}></View>
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
                          {
                            globalThis.selectTheme == "usindepTheme"
                              ? currentText
                              : null
                          }
                        </Text>
                        {/* //<Text style={styles.yellowText}>$1.99</Text>
                        <Text style={styles.yellowText}>$1.99</Text> */}
                        <Text style={styles.yellowText}>{t("$1.99")}</Text>
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
                          borderColor: checked === "christmas" ? "grey" : "red",
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
                        <View style={styles.circularCristmasSecTheme}></View>
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
                          {
                            globalThis.selectTheme == "christmas"
                              ? currentText
                              : null
                          }
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
                        borderColor: checked === "newYear" ? "#19B043" : "grey",
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
                          borderColor: checked === "newYear" ? "grey" : "red",
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
                        <View style={styles.circularnewYearSecTheme}></View>
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
                          {
                            globalThis.selectTheme == "newYear"
                              ? currentText
                              : null
                          }
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
                            checked === "newYearTheme" ? "#19B043" : "white",
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
                        <View style={styles.circular_new_YearSecTheme}></View>
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
                          {
                            globalThis.selectTheme == "newYearTheme"
                              ? currentText
                              : null
                          }
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
    </MainComponent>
  );
});

export default ShopScreen;
