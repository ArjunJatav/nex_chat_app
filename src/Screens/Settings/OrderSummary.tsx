import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
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
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import renderIf from "../../Components/renderIf";
import { theme_purchase, theme_purchase_list } from "../../Constant/Api";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";

const isDarkMode = true;
let apiCall = false;

// eslint-disable-next-line
export default function OrderSummary({ navigation }: any) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [checked, setChecked] = useState(globalThis.selectTheme);
  const { t } = useTranslation();
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [purchasedTheme, setPurchasedTheme] = useState([]);
  const { toggleTheme } = useContext(ThemeContext);

  const [processing, setprocessing] = useState(false);

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
      "localization":globalThis.selectLanguage,
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
        setChecked(savedValue);
      }
    } catch (error) {
      return;
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
    purchaseUpdateSubscription = RNIap.purchaseErrorListener(() => {
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
      .catch(() => {});
    await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
      .then(async () => {})
      .catch(() => {});
  };
  ///////////////////////// **********   Set Iteams Sub Purchase Theme  ********** ///////////////////////////////
  const itemSubs = Platform.select({
    ios: [
      "com.deucetek.theme3",
      "com.deucetek.christmasTheme",
      "com.deucetek.newyearTheme",
    ],
    android: [
      "com.deucetek.theme3",
      "com.deucetek.christmastheme",
      "com.deucetek.newyeartheme",
    ],
  });

  // eslint-disable-next-line
  const getItems = async (itemSubs: any) => {
    try {
      const products = await RNIap.getProducts({ skus: itemSubs });
      const Purchaseproducts = products;
      console.log("Purchaseproducts",Purchaseproducts);
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
          .then(async () => {
            
          })
          .catch((err) => {});
      } else if (Platform.OS === "ios") {
        await RNIap.requestSubscription({ sku: itemSubs.toString() })
          .then(async () => {
          
          })
          .catch(() => {
            return;
          });
      }
    } catch (err) {
      return;
    }
  };


  // Function to handle the theme selection
  const ThemeSelection = async (value: string) => {
    apiCall = false;
    if (
      checked === "newYearTheme" ||
      checked === "newYear" ||
      checked === "christmas"
    ) {
      const purchaseStatus = checkIfPurchased();
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
      checked === "christmas"
    ) {
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

      requestSubscription([packagename]);
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
          "localization":globalThis.selectLanguage,
        };
        const data = {
          payment_method: Platform.OS === "android" ? "Google" : "Apple",
          theme_name: themeName.toUpperCase(),
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
          setprocessing(false);
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
    } else {
      apiCall = true;
      Alert.alert(t("success"), ResponseData.message, [
        {
          text: t("done"),
          onPress: () => applyTheme(ResponseData?.data?.purchase_item_for),
        },
      ]);
    }
  };

  ///////////////////////// **********   APPLY TEME FOR API   ********** ///////////////////////////////
  // eslint-disable-next-line
  const applyTheme = async (CheckedValue: any) => {
    await AsyncStorage.setItem("selectTheme", CheckedValue);
    globalThis.selectTheme = CheckedValue;
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
      borderRadius: 10, // Adjust if you want rounded corners
      backgroundColor: "skyblue", // Example background color
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    subtitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#1F2024",
    },
    nText: {
      color: COLORS.black,
      fontSize: 15,
      fontFamily: font.bold(),
      paddingBottom: 10,
    },

    themeTopContainer: {
      backgroundColor: themeModule().theme_background,
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
      //  paddingVertical: 10,
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    christmatTheme3: {
      marginTop: 10,
      backgroundColor: COLORS.christmas_red,
      //  paddingVertical: 10,
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
    whitesmallLineTheme: {
      height: 8,
      backgroundColor: "#F0E0F1",
      width: "25%",
      marginTop: 5,
    },
    yellowText: {
      margin: 2,
      fontSize: 15,
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
      fontSize: FontSize.font,
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
      const themeName = purchasedTheme[i].theme_name.toUpperCase();
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
    } else if (checked == "second") {
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
            <Text style={styles.buttonSecondTheme}> {t("Confirm")}</Text>
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
            <Text style={styles.buttonSecondTheme}> {t("Confirm")}</Text>
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

            <Text style={styles.buttonSecondTheme}> {t("Confirm")}</Text>
          </View>
        );
      }
    }
  }

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        <LoaderModel visible={loaderMoedl} />
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        <TopBar
          showTitleForBack={true}
          title={t("Order Summary")}
          backArrow={true}
          navState={navigation}
          checked={checked}
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          checked={
            globalThis.selectTheme
          }
        />

        <View style={styles.themeTopContainer}></View>

    {
            globalThis.selectTheme === "christmas" || 
            globalThis.selectTheme === "newYear" || 
            globalThis.selectTheme === "newYearTheme" || 
            globalThis.selectTheme === "mongoliaTheme" || 
            globalThis.selectTheme === "indiaTheme" ||
            globalThis.selectTheme === "englandTheme" ||
            globalThis.selectTheme === "americaTheme" ||
            globalThis.selectTheme === "mexicoTheme" || 
            globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={
                settingTop().BackGroundImage
              }
              resizeMode="cover" // Update the path or use a URL
              style={{
                height: "100%",
                width: windowWidth,
                marginTop: 0,
                position: "absolute",
                bottom: 0,
                zIndex: 0,
                top:  chatTop().top
              }}
            ></ImageBackground>
          ) : null
        }
      </View>
      <View style={styles.themeContainer}>
        <View style={[styles.chooseContainer]}>
          {!processing && (
            <ScrollView
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ marginVertical: 24, paddingHorizontal: 12 }}>
                <View style={[styles.slide]}>
                  <FastImage
                    style={{ width: "100%", flex: 1 }}
                    source={require("../../Assets/Image/wallimage.jpg")}
                  />
                  {/* <Text style={styles.title}>Slide 1</Text> */}
                </View>
              </View>

              <View style={{ paddingHorizontal: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderBottomWidth: 1,
                    borderBottomColor: "#EAEAEA",
                    paddingBottom: 8,
                    paddingTop: 38,
                  }}
                >
                  <Text style={styles.subtitle}>Subtotal</Text>
                  <Text style={styles.subtitle}>$1.99</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderBottomWidth: 1,
                    borderBottomColor: "#EAEAEA",
                    paddingBottom: 8,
                    paddingTop: 14,
                  }}
                >
                  <Text style={styles.subtitle}>Total</Text>
                  <Text style={styles.subtitle}>$1.99</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {processing && (
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
        </View>
      </View>
      {renderIf(
        !processing && globalThis.selectTheme !== checked,
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
              checked == "newYearTheme"
                ? ThemeSelection("newYearTheme")
                : checked == "newYear"
                ? ThemeSelection("newYear")
                : checked == "christmas"
                ? ThemeSelection("christmas")
                : checked == "third"
                ? ThemeSelection("third")
                : checked == "first"
                ? ThemeSelection("first")
                : ThemeSelection("second");
            }}
          >
            {renderPurchaseButtonTitle()}
          </TouchableOpacity>
        </View>
      )}
    </MainComponent>
  );
}
