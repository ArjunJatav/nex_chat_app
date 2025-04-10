import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  Platform,
  Text,
  View,
} from "react-native";
import MainComponent from "../../Components/MainComponent/MainComponent";
import * as RNIap from "react-native-iap";
import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { Image } from "react-native";
import renderIf from "../../Components/renderIf";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { diamond_purchase } from "../../Constant/Api";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { LoaderModel } from "../Modals/LoaderModel";
import { useDispatch } from "react-redux";
import { setDiamondBalanceObj } from "../../Redux/MessageSlice";
import { setDaimonds } from "../../reducers/friendListSlice";
const isDarkMode = true;
let apiCall = false;

export default function DiamondPurchase({ navigation }) {
  const { t } = useTranslation();
  const navigationn = useNavigation();
  const [checked, setChecked] = useState(50);
  const [checkedAmount, setCheckedAmount] = useState(0.99);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const dispatch = useDispatch();

  const itemSubs = Platform.select({
    ios: [
      "com.tokee.fiftyDiamonds",
      "com.tokee.hundredDiamonds",
      "com.tokee.twohundredDiamonds",
    ],
    android: ["50diamonds", "100diamonds", "200diamonds"],
  });

  function CheckBoxChecked(value: number) {
    if (value == 50) {
      globalThis.checkedValue = 50;
      globalThis.checkedAmount = 0.99;
      setChecked(50);
      setCheckedAmount(0.99);
    } else if (value == 100) {
      globalThis.checkedValue = 100;
      globalThis.checkedAmount = 1.99;
      setChecked(100);
      setCheckedAmount(1.99);
    } else {
      globalThis.checkedValue = 200;
      globalThis.checkedAmount = 2.99;
      setChecked(200);
      setCheckedAmount(2.99);
    }
  }

  useEffect(() => {
    console.log("iap useeffect=========");

    initilizeIAPConnection();
  }, []);

  const requestPuechase = () => {
    let packageName = "";

    if (checked === 50) {
      packageName =
        Platform.OS === "ios" ? "com.tokee.fiftyDiamonds" : "50diamonds";
    } else if (checked === 100) {
      packageName =
        Platform.OS === "ios" ? "com.tokee.hundredDiamonds" : "100diamonds";
    } else {
      packageName =
        Platform.OS === "ios" ? "com.tokee.twohundredDiamonds" : "200diamonds";
    }

    // Request the subscription with the appropriate package name
    requestSubscription([packageName]);
  };

  ///////////////////////// **********   ReQUEST FOR  Purchase Theme  ********** ///////////////////////////////
  // eslint-disable-next-line
  const requestSubscription = async (itemSubs: any) => {
    apiCall = true;
   // setloaderMoedl(true);

    try {
      if (Platform.OS === "android") {
        await RNIap.requestPurchase({
          skus: itemSubs,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        })
          .then(async () => {
            console.log("");
          })
          .catch((err) => {
            console.log("", err);
          });
      } else if (Platform.OS === "ios") {
        await RNIap.requestSubscription({ sku: itemSubs.toString() })
          .then(async (result) => {
            console.log("", result);
          })
          .catch((err) => {
            setloaderMoedl(false);
            console.log("err======", err);
          });
      }
    } catch (err) {
      console.log("err>>>>>>>>>>", err);
      setloaderMoedl(false);
    }
  };
  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    buttonText: {
      fontSize: 18,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    button: {
      height: 45,
      // marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,
      position: "absolute",
      bottom: 220,
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: Dimensions.get("window").height,
    },
    balanceHeading: {
      color: COLORS.black,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
      // textDecorationLine:"underline"
    },
    fontNameText: {
      color: COLORS.black,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
  });

  // eslint-disable-next-line

  useEffect(() => {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            if (Platform.OS === "ios") {
              RNIap.finishTransaction({ purchase });
            } else if (Platform.OS === "android") {
              const isConsumable = true; // if we were dealing with non-consumables this would be false but we aren't.
              const ackResult = await RNIap.finishTransaction({
                purchase: purchase,
                isConsumable: isConsumable,
              });
              const transactionReceiptData = JSON.parse(
                purchase.transactionReceipt
              );
            }

            global.transactionId = purchase.transactionId;
            PurchaseButtonClick(purchase.transactionId);
            const isConsumable = true;
            RNIap.finishTransaction({ purchase, isConsumable: isConsumable });
          } catch (ackErr) {
            setloaderMoedl(false);
          }
        }
      }
    );
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {});
    return () => {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      if (purchaseUpdateSubscription) {
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        purchaseUpdateSubscription.remove();
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        purchaseUpdateSubscription = null;
      }
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      if (purchaseErrorSubscription) {
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        purchaseErrorSubscription.remove();
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        purchaseErrorSubscription = null;
      }
    };
  }, []);

  ///////////////////////// **********  In App  Purchase  for diamond  ********** ///////////////////////////////
  const initilizeIAPConnection = async () => {
   // setloaderMoedl(true);
    await RNIap.initConnection()
      .then(async (connection) => {
        const availablePurchases = await RNIap.getAvailablePurchases();

        availablePurchases.forEach((purchase) => {
          RNIap.finishTransaction({ purchase, isConsumable: true });
        });
        getItems();
      })
      .catch((err) => {
        console.log(`IAP ERROR ${err.code}`, err.message);
        setloaderMoedl(false);
      });
    await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
      .then(async (consumed) => {
        setloaderMoedl(false);
      })
      .catch((err) => {
        console.log(
          `flushFailedPurchasesCachedAsPendingAndroid ERROR ${err.code}`,
          err.message
        );
        setloaderMoedl(false);
      });
  };

  ///////////////////////// **********   Set Iteams Sub Purchase diamond  ********** ///////////////////////////////

  // eslint-disable-next-line
  const getItems = async () => {
  //  setloaderMoedl(true);
    try {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      const products = await RNIap.getProducts({ skus: itemSubs });
      console.log("products======", products);

      const Purchaseproducts = products;
      setloaderMoedl(false);
    } catch (err) {
      setloaderMoedl(false);
      return;
    }
  };

  const buttonPress = () => {
    Keyboard.dismiss();
    navigationn.goBack();
  };

  function PurchaseButtonClick(id) {
    //globalThis.checkedValue = 200;
    // globalThis.checkedAmount = 2.99;
    console.log("data to send in api::", {
      quantity: globalThis.checkedValue ? globalThis.checkedValue : checked,
      amount: globalThis.checkedAmount
        ? globalThis.checkedAmount
        : checkedAmount,
      transaction_id: id,
      payment_method: Platform.OS == "android" ? "Google" : "Apple",
    });
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    const data = {
      quantity: globalThis.checkedValue ? globalThis.checkedValue : checked,
      amount: globalThis.checkedAmount
        ? globalThis.checkedAmount
        : checkedAmount,
      transaction_id: id,
      payment_method: Platform.OS == "android" ? "Google" : "Apple",
    };



    if (apiCall == true) {
      console.log("api is calling....");
      apiCall = false;
      PostApiCall(
        diamond_purchase,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          if (ErrorStr) {
            setloaderMoedl(false);
            // Alert.alert(t("error"), ErrorStr, [{ text: t("ok") }]);
            globalThis.errorMessage = ErrorStr;
            setErrorAlertModel(true);
          } else {
            globalThis.successMessage = ResponseData.message;
            globalThis.purchasedDiamonds = ResponseData.data.purchase_diamonds;
            globalThis.creditedDiamonds = ResponseData.data.credited_diamonds;
            globalThis.DiamondBalance =
              ResponseData.data.credited_diamonds +
              ResponseData.data.purchase_diamonds +
              ResponseData.data.earned_diamonds;
              dispatch(setDiamondBalanceObj(ResponseData.data))
                const totalDiamondsFirst = 
                      parseFloat(ResponseData.data.purchase_diamonds) +
                      parseFloat(ResponseData.data.credited_diamonds) +
                      parseFloat(ResponseData.data.earned_diamonds);
                      dispatch(setDaimonds(totalDiamondsFirst));
            apiCall = false;
            setloaderMoedl(false);
            setTimeout(() => {
              setSuccessAlertModel(true);
            }, 500);

            // Alert.alert(t("success"), ResponseData.message, [{ text: t("done") }]);
          }
        }
      );
    }
  }
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={t("Diamond_purchased_succes")}
        doneButton={() => {
          setSuccessAlertModel(false);
          navigation.navigate("BottomBar");
        }}
      />
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
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
          showTitle={true}
          title={t("Diamond_Purchase")}
          checked={globalThis.selectTheme}
        />
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")} </Text>
            </TouchableOpacity>
          </View>
        </View>
        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
        globalThis.selectTheme === "indiaTheme" ||
        globalThis.selectTheme === "englandTheme" ||
        globalThis.selectTheme === "americaTheme" ||
        globalThis.selectTheme === "mexicoTheme" ||
        globalThis.selectTheme === "usindepTheme" ? (
          <ImageBackground
            source={settingTop().BackGroundImage}
            resizeMode="cover" // Update the path or use a URL
            style={{
              height: "100%",
              width: Dimensions.get("window").width,
              marginTop: 0,
              position: "absolute",
              bottom: 0,
              zIndex: 0,
              top: chatTop().top,
            }}
          ></ImageBackground>
        ) : null}
      </View>
      <View style={styles.chatContainer}>
        <View
          style={{
            backgroundColor: COLORS.white,
            marginHorizontal: 2,
            // paddingRight: 5,
            height: 180,
            // backgroundColor:"red",
            borderRadius: 8,
            marginTop: 0,
            shadowColor: COLORS.lightgrey,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 1,
            elevation: 5,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              // backgroundColor:"red",
              alignItems: "center",
              height: 60,
              // justifyContent: "center",
              width: Dimensions.get("window").width - 24,
              borderRadius: 8,

              borderBottomWidth: 0.5,
              borderBottomColor: COLORS.lightgrey,
            }}
            onPress={() => CheckBoxChecked(50)}
          >
            <TouchableOpacity
              style={{
                width: 40,
                height: 60,
                //   backgroundColor:"red",
                justifyContent: "center",
                alignItems: "center",
              }}
              activeOpacity={0.7}
              onPress={() => CheckBoxChecked(50)}
            >
              <View
                style={{
                  backgroundColor:
                    checked == 50 ? iconTheme().iconColor : "#fff",
                  height: 30,
                  width: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}
              >
                {renderIf(
                  checked == 50,
                  <Image
                    source={require("../../Assets/Icons/check_icon.png")}
                    style={{ height: 20, width: 20 }}
                  />
                )}
              </View>
            </TouchableOpacity>
            <View
              style={{
                width: Dimensions.get("window").width - 190,
                // backgroundColor:"green",
                //  height: 65,
                flexDirection: "column",
              }}
            >
              <View
                style={{
                  // backgroundColor:"red",
                  flexDirection: "row",
                  // paddingHorizontal: 5,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={[
                    styles.balanceHeading,
                    {
                      color: COLORS.black,
                      marginLeft: 5,
                      // marginTop: Platform.OS == "ios" ? 10 : 0,
                    },
                  ]}
                >
                  50 {t("Diamonds")}
                </Text>
              </View>
            </View>

            <View
              style={{
                width: 120,
                //  backgroundColor:"red",
                justifyContent: "center",
                alignItems: "flex-end",
                //  backgroundColor:"red",
                flexDirection: "column",
              }}
            >
              <Text
                style={[
                  styles.fontNameText,
                  {
                    width: 65,

                    textAlign: "left",
                    alignSelf: "flex-end",
                    fontFamily: font.regular(),
                    color: checked == 50 ? COLORS.black : COLORS.grey,
                    fontSize: 15,
                    lineHeight: 18, // Set a line height close to font size
                    marginBottom: 0, // Ensure no bottom margin
                    paddingBottom: 0, // E
                  },
                ]}
              >
                $0.99
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              //  backgroundColor:"red",
              alignItems: "center",
              height: 60,
              // justifyContent: "center",
              width: Dimensions.get("window").width - 24,
              borderRadius: 8,

              borderBottomWidth: 0.5,
              borderBottomColor: COLORS.lightgrey,
            }}
            onPress={() => CheckBoxChecked(100)}
          >
            <TouchableOpacity
              style={{
                width: 40,
                height: 60,
                //  backgroundColor:"red",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => CheckBoxChecked(100)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  backgroundColor:
                    checked == 100 ? iconTheme().iconColor : "#fff",
                  height: 30,
                  width: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}
              >
                <Image
                  source={require("../../Assets/Icons/check_icon.png")}
                  style={{ height: 20, width: 20 }}
                />
              </View>
            </TouchableOpacity>
            <View
              style={{
                width: Dimensions.get("window").width - 190,
                // backgroundColor:"green",
                //  height: 65,
                flexDirection: "column",
              }}
            >
              <View
                style={{
                  // backgroundColor:"red",
                  flexDirection: "row",
                  // paddingHorizontal: 5,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={[
                    styles.balanceHeading,
                    {
                      color: COLORS.black,
                      // marginTop: Platform.OS == "ios" ? 10 : 0,
                    },
                  ]}
                >
                  100 {t("Diamonds")}
                </Text>
              </View>
            </View>

            <View
              style={{
                width: 120,
                //  backgroundColor:"red",
                justifyContent: "center",
                alignItems: "flex-end",
                //  backgroundColor:"red",
                flexDirection: "column",
              }}
            >
              <Text
                style={[
                  styles.fontNameText,
                  {
                    width: 65,

                    textAlign: "left",
                    alignSelf: "flex-end",
                    fontFamily: font.regular(),
                    color: checked == 100 ? "#000" : COLORS.grey,
                    fontSize: 15,
                    lineHeight: 18, // Set a line height close to font size
                    marginBottom: 0, // Ensure no bottom margin
                    paddingBottom: 0, // E
                  },
                ]}
              >
                $1.99
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              //  backgroundColor:"red",
              alignItems: "center",
              height: 60,
              // justifyContent: "center",
              width: Dimensions.get("window").width - 24,
              borderRadius: 8,

              borderBottomWidth: 0.5,
              borderBottomColor: COLORS.lightgrey,
            }}
            onPress={() => CheckBoxChecked(200)}
          >
            <TouchableOpacity
              style={{
                width: 40,
                height: 60,
                // backgroundColor:"red",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => CheckBoxChecked(200)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  backgroundColor:
                    checked == 200 ? iconTheme().iconColor : "#fff",
                  height: 30,
                  width: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}
              >
                <Image
                  source={require("../../Assets/Icons/check_icon.png")}
                  style={{ height: 20, width: 20 }}
                />
              </View>
            </TouchableOpacity>
            <View
              style={{
                width: Dimensions.get("window").width - 190,
                // backgroundColor:"green",
                //  height: 65,
                flexDirection: "column",
              }}
            >
              <View
                style={{
                  // backgroundColor:"red",
                  flexDirection: "row",
                  // paddingHorizontal: 5,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={[
                    styles.balanceHeading,
                    {
                      color: COLORS.black,
                      // marginTop: Platform.OS == "ios" ? 10 : 0,
                    },
                  ]}
                >
                  200 {t("Diamonds")}
                </Text>
              </View>
            </View>

            <View
              style={{
                width: 120,
                //  backgroundColor:"red",
                justifyContent: "center",
                alignItems: "flex-end",
                //  backgroundColor:"red",
                flexDirection: "column",
              }}
            >
              <Text
                style={[
                  styles.fontNameText,
                  {
                    width: 65,

                    textAlign: "left",
                    alignSelf: "flex-end",
                    fontFamily: font.regular(),
                    color: checked == 200 ? "#000" : COLORS.grey,
                    fontSize: 15,
                    lineHeight: 18, // Set a line height close to font size
                    marginBottom: 0, // Ensure no bottom margin
                    paddingBottom: 0, // E
                  },
                ]}
              >
                $2.99
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => requestPuechase()}
          // onPress={() => SubscribeClicked()}
        >
          <Text style={styles.buttonText}>{t("PurchaseDiamond")}</Text>
        </TouchableOpacity>
      </View>
    </MainComponent>
  );
}
