import { t } from "i18next";
import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
  Keyboard,
  Platform,
  Modal,
  PermissionsAndroid,
  ImageBackground,
  Alert,
  Text,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { COLORS, iconTheme, themeModule } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import * as RNIap from "react-native-iap";
import { requestSubscription } from "react-native-iap";
import { ScrollView } from "react-native-gesture-handler";
import {
  enable_notifications,
  getsubscription,
  updateSubscriptionStatus,
} from "../../Constant/Api";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { LoaderModel } from "../Modals/LoaderModel";
import { setPremium } from "../../reducers/friendListSlice";
import { useDispatch } from "react-redux";
import { chatTop } from "../../Navigation/Icons";

let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;

const newPlanSku = Platform.select({
  ios: [
    "com.tokee.discountedannualsubscription",
    "com.tokee.monthlysubscription",
  ],
  android: [
    "com.tokee.annualsubscription",
    "com.tokee.premiummonthly"
],
});
var isRecordFetched = false;

export const PremiumSubscription = ({ route, navigation }) => {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [products, setProducts] = useState([]);
  const [androidSubscription, setAndroidSubscription] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [loaderMoedl, setloaderMoedl] = useState(false);
 
  const dispatch = useDispatch()

  const styles = StyleSheet.create({
    chatTopContainer: {
      backgroundColor: themeModule().theme_background,
      paddingBottom: 20,
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 10,
      borderColor: "transparent",
      paddingHorizontal: 10,
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },
    fontNameText: {
      color: COLORS.black,
      fontSize: 18,
      fontFamily: font.regular(),
    },
    applyButton: {
      marginVertical: 30,
      flexDirection: "column",
      paddingHorizontal: 0,
      justifyContent: "space-between",
    },
    applyButtonStyle: {
      height: 50,
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().iconColor,
    },
    applyText: {
      fontSize: 20,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
  });

//   useEffect(() => {
//     initilizeIAPConnection();
   
//   }, []);
  useEffect(()=>{
    getSubscriptionApi()
  },[])

//   useEffect(() => {
//     purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
//       async (purchase) => {
//         console.log("purchase listener", purchase);
//         if (isRecordFetched === true) {
//           console.log("Inside If condition >>>>>>>");
//           //    setLoading(false);
//           return;
//         }
//         // else if (Platform.OS === "android") {
//         //   setLoading(true);
//         // }
//         const receipt = purchase.transactionReceipt;
//         var transId = "";
//         var productId = "";

//         if (receipt) {
//           try {
//             if (Platform.OS === "ios") {
//               //   RNIap.finishTransactionIOS(purchase.transactionId);
//               transId = purchase.originalTransactionIdentifierIOS;
//               productId = purchase.productId;
//               if (transId == undefined) {
//                 transId = purchase.transactionId;
//                 productId = purchase.productId;
//               }
//               if (isRecordFetched == false) {
//                 await RNIap.finishTransaction({
//                   purchase: purchase,
//                   isConsumable: false,
//                 })
//                   .then((json) => {
//                     //    setLoading(false);
//                     console.log("Transaction ID >>>>>>>>>>>>", transId);
//                     //     setLoading(false);

//                     const data = {
//                       subscription_id: transId,
//                       payment_cycle: selectedPlan == 0 ? "Annual" : "Monthly",
//                       amount: selectedPlan == 0 ? "35.99" : "4.99",
//                       product_id: productId,
//                       payment_method: "Apple",
//                       payment_status: "Completed",
//                       payment_data: '{"dfsdf":"dfsdfhkjsdhfkjsf"}',
//                     };

//                     UpdateTransactionApi(data);
//                   })
//                   .catch((error) => {
//                     // showToast(
//                     //   "error while purchase. Please contact to support"
//                     // );
//                     //   setLoading(false);
//                     console.log("finishTransaction inapp", error);
//                   });
//                 isRecordFetched = true;
//               }
//             } else if (Platform.OS === "android") {
//               productId = purchase.productId;
//               transId = purchase.transactionId;
//               //  await RNIap.consumeAllItemsAndroid(purchase.purchaseToken);
//               const transactionReceiptData = JSON.parse(
//                 purchase.transactionReceipt
//               );
//               console.log('transactionReceiptData====================================',transactionReceiptData);
             
//              // setLoading(true);
//               await RNIap.acknowledgePurchaseAndroid({
//                 token: transactionReceiptData.purchaseToken,
//               });

//               await RNIap.finishTransaction({
//                 purchase: purchase,
//                 isConsumable: false,
//               }).then(() => {

//                 if (isRecordFetched == false) {
//                   isRecordFetched = true;
//                 //  setLoading(false);
//                 console.log('transId====================================',transId);
//                   const data = {
//                     subscription_id: transId,
//                     payment_cycle: selectedPlan == 0 ? "Annual" : "Monthly",
//                     amount: selectedPlan == 0 ? "35.99" : "4.99",
//                     product_id: productId,
//                     payment_method: "Google",
//                     payment_status: "Completed",
//                    // payment_data: transactionReceiptData,
//                    payment_data: '{"dfsdf":"dfsdfhkjsdhfkjsf"}',
//                   };

//                   UpdateTransactionApi(data);
//                 }
//               });
//             }
//           } catch (ackErr) {
//          //   setLoading(false);
//             console.log("ackErr INAPP>>>>", ackErr);
//           }
//         }
//       }
//     );

//     purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
//       console.log("purchaseErrorListener INAPP>>>>", error);
//     });

//     return () => {
//       if (purchaseUpdateSubscription) {
//         purchaseUpdateSubscription.remove();
//         purchaseUpdateSubscription = null;
//       }
//     };
//   });


  const getSubscriptionApi = async () => {
   // setloaderMoedl(true);
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    GetApiCall(getsubscription, headers, navigation,(ResponseData, ErrorStr) => {
      profileApiSuccess(ResponseData, ErrorStr);
    });
  };

  const profileApiSuccess = (ResponseData, ErrorStr) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    //   setloaderMoedl(false);
      // Navigate to another screen or handle the error in some way
    } else {

        console.log('ResponseData subscription get api====================================',ResponseData.data.payment_cycle);
    }
  };

  //UpdateTransactionApi

  //'https://tokeecorp.com/backend/public/api/V1/user/purchase/subscription-store'

  const UpdateTransactionApi = async (dataa) => {

    setloaderMoedl(true)
    const data = {
        subscription_id: "GPA.3385-6714-6696-90860",
        payment_cycle: selectedPlan == 0 ? "Annual" : "Monthly",
        amount: selectedPlan == 0 ? "35.99" : "4.99",
        product_id: "com.tokee.premiummonthly",
        payment_method: "Apple",
        payment_status: "Completed",
        payment_data: '{"dfsdf":"dfsdfhkjsdhfkjsf"}',
      };


    
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    PostApiCall(
      updateSubscriptionStatus,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        apiSuccess(ResponseData, ErrorStr);
      }
    );
  };
  const apiSuccess = async (ResponseData, ErrorStr) => {
    setloaderMoedl(false)
    if (ErrorStr) {
        setloaderMoedl(false)
      console.log("Error >>>>", ErrorStr);
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      //   setloaderMoedl(false);
      // Navigate to another screen or handle the error in some way
    } else {
        setloaderMoedl(false)
   
      if (ResponseData.status == true) {
        dispatch(setPremium(true));
        globalThis.isUserPremium = true;
        // payment successfull.
        Alert.alert(t("success"),t("You_are_upgraded_to_Tokee_Premium"), [
            {
              text: t("ok"),
              onPress: () => {
                navigation.navigate("BottomBar");
              },
            },
          ]);
      } else {
        // payment unsuccessful
      }

      //  navigation.navigate("BottomBar");
      // setloaderMoedl(false);
    }
  };

  const initilizeIAPConnection = async () => {
    await RNIap.initConnection()
      .then(async (connection) => {
        console.log("IAP result", connection);
        // if (!IS_IOS) {
        //   isSubscriptionActive();
        // }
        getItems();
      })
      .catch((err) => {
        console.warn(`IAP ERROR ${err.code}`, err.message);
      });
    if (Platform.OS === "ios") {
      await RNIap.clearProductsIOS();
      await RNIap.clearTransactionIOS();
    } else {
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
        .then(async (consumed) => {
          console.log("consumed all items?", consumed);
        })
        .catch((err) => {
          console.warn(
            `flushFailedPurchasesCachedAsPendingAndroid ERROR ${err.code}`,
            err.message
          );
        });
    }
  };

  const getItems = async () => {
    try {
      // const clearProducts = await RNIap.clearProductsIOS();
      // const Products = await RNIap.getSubscriptions({ skus: itemSubs });
      const Products = await RNIap.getSubscriptions({ skus: newPlanSku });
      console.log("availabel subscription======>>>>", Products);
      setProducts(Products);
      console.log("itemSubs--- ", Products);
      if (Platform.OS == "android") {
        setAndroidSubscription(Products);
        console.log(
          " IAP Su",
          Products[0].subscriptionOfferDetails[0].offerToken
        );
      }
      Purchaseproducts = Products;
    } catch (err) {
      console.log("get inapp products error: ", err);
      console.warn("IAP error", err.code, err.message, err);

      //  setError(err.message);
    }
  };

  const handleBuySubscription = async (sku, offerTokenn) => {
    try {
      // const data = await requestSubscription({
      //     sku,
      //     ...(Platform.OS === 'ANDROID' &&

      //         offerToken && { subscriptionOffers: [{sku, offerToken }] }),
      // });
      // console.log('data is', data);
      const skuu = sku;
      const offerToken = Platform.OS === "android" ? offerTokenn || null : null;
      await requestSubscription({
        skuu,
        ...(offerToken && {
          subscriptionOffers: [{ sku, offerToken }],
        }),
      });
    } catch (err) {
      console.error("iap error", err);
    }
  };

  const backButtonClicked = async () => {
    navigation.pop();
  };

  // const SubscribeClicked = async () => {
  //     let planId = newPlanSku[selectedPlan]
  //     console.log('planId====================================',planId);

  //     handleBuySubscription(planId, "")

  // }

  const SubscribeClicked = async () => {
    let planId = newPlanSku[selectedPlan];
    const offerToken = androidSubscription.find(
      (product) => product.productId === planId
    )?.subscriptionOfferDetails[0]?.offerToken;

    console.log("planId:", planId);
    console.log("offerToken:", offerToken);

    if (offerToken) {
      handleBuySubscription(planId, offerToken);
    } else {
      console.error("No offer token found for the selected plan.");
    }
  };

  const renderAnnualCheckBoxView = () => {
    if (selectedPlan == 0) {
      return (
        <View
          style={{
            backgroundColor: iconTheme().iconColor,
            height: 30,
            width: 30,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 15,
          }}
        >
          <Image
            source={require("../../Assets/Icons/check_icon.png")}
            style={{ height: 20, width: 20 }}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            backgroundColor: "#fff",
            height: 30,
            width: 30,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: "#000",
          }}
        ></View>
      );
    }
  };

  const renderMonthlyCheckBoxView = () => {
    if (selectedPlan == 1) {
      return (
        <View
          style={{
            backgroundColor: iconTheme().iconColor,
            height: 30,
            width: 30,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 15,
          }}
        >
          <Image
            source={require("../../Assets/Icons/check_icon.png")}
            style={{ height: 20, width: 20 }}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            backgroundColor: "#fff",
            height: 30,
            width: 30,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: "#000",
          }}
        ></View>
      );
    }
  };

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
        {Platform.OS == "android" ? (
          <CustomStatusBar
            //  barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        <TopBar
          showTitleForBack={true}
          title="Tokee Premium"
          goBack={true}
          checked={globalThis.selectTheme}
          navState={navigation}
          clickGoBack={backButtonClicked}
        />
        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "indiaTheme" ||
        globalThis.selectTheme === "englandTheme" ||
        globalThis.selectTheme === "americaTheme" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ? (
          <ImageBackground
            source={settingTop().BackGroundImage}
            resizeMode="contain"
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
        ) : null}
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>
      <View style={styles.chatContainer}>
        <ScrollView>
          <Text style={styles.fontNameText}>
            Go beyond the limits and unlock a number of exclusive features by
            subscribing to Tokee Premium
          </Text>

          <View
            style={{
              backgroundColor: "lightgray",
              marginHorizontal: 2,
              height: 100,
              borderRadius: 8,
              marginTop: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                height: 50,
                justifyContent: "center",
                width: "100%",
                borderRadius: 8,
                borderBottomWidth: 0.5,
                borderBottomColor: "gray",
              }}
            >
              <TouchableOpacity
                style={{
                  width: "15%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setSelectedPlan(0)}
                activeOpacity={0.7}
              >
                {renderAnnualCheckBoxView()}
              </TouchableOpacity>

              <View
                style={{
                  width: "30%",
                  flexDirection: "row",
                  paddingHorizontal: 5,
                  alignItems: "center",
                }}
              >
                <Text style={styles.fontNameText}>Annual </Text>
                <Text
                  style={[
                    styles.fontNameText,
                    {
                      backgroundColor: iconTheme().iconColor,
                      color: "#fff",
                      paddingHorizontal: 4,
                      fontSize: 12,
                    },
                  ]}
                >
                  -50%
                </Text>
              </View>

              <Text
                style={[
                  styles.fontNameText,
                  {
                    width: "55%",
                    paddingHorizontal: 5,
                    textAlign: "right",
                    alignSelf: "center",
                  },
                ]}
              >
                $2.99 / Month{" "}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                height: 50,
                justifyContent: "center",
                width: "100%",
                borderRadius: 8,
              }}
            >
              <TouchableOpacity
                style={{
                  width: "15%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setSelectedPlan(1)}
                activeOpacity={0.7}
              >
                {renderMonthlyCheckBoxView()}
              </TouchableOpacity>

              <View
                style={{
                  width: "30%",
                  justifyContent: "center",
                  paddingHorizontal: 5,
                }}
              >
                <Text style={styles.fontNameText}>Monthly </Text>
              </View>
              <Text
                style={[
                  styles.fontNameText,
                  {
                    width: "55%",
                    paddingHorizontal: 5,
                    textAlign: "right",
                    alignSelf: "center",
                  },
                ]}
              >
                $4.99 / Month{" "}
              </Text>
            </View>
          </View>

          <View style={styles.applyButton}>
            <TouchableOpacity
              style={styles.applyButtonStyle}
            //   onPress={() => SubscribeClicked()}
            onPress={() => UpdateTransactionApi('hello')}
            >
              <Text style={styles.applyText}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
    </MainComponent>
  );
};
