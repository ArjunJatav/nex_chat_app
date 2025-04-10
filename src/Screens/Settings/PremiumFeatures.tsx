import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Platform,
  Image,
  ScrollView,
  Alert,
  Pressable,
  ImageBackground,
  StatusBar,
} from "react-native";
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import MainComponent from "../../Components/MainComponent/MainComponent";
import { COLORS, gredient, iconTheme, premiumBack, themeModule } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { getsubscription, updateSubscriptionStatus } from "../../Constant/Api";
import { t } from "i18next";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { LoaderModel } from "../Modals/LoaderModel";
import { useDispatch } from "react-redux";
import { setPremium } from "../../reducers/friendListSlice";
import { TokeePremiumModel } from "../Modals/TokeePremiumModel";
import DeviceInfo from "react-native-device-info";
import renderIf from "../../Components/renderIf";
import * as RNIap from "react-native-iap";
import { requestSubscription } from "react-native-iap";
import recordingAnimation from "../../Assets/Logo/Star.json";
import Lottie from "lottie-react-native";
import { compose } from "@reduxjs/toolkit";
import LinearGradient from "react-native-linear-gradient";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";

//let purchaseUpdateSubscription = null;
//let purchaseErrorSubscription = null;

globalThis.selectedIndex = 0;

const newPlanSku = Platform.select({
  ios: [
    "com.tokee.discountedannualsubscription",
    "com.tokee.monthlysubscription",
  ],
  android: ["com.tokee.annualsubscription", "com.tokee.premiummonthly"],
});
//var isRecordFetched = false;

const PremiumFeaturesScreen = ({ navigation }) => {
  const isDarkMode = true;
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  //selectedIndex
  const [tokeePremiumModel, setTokeePremiumModel] = useState(false);
  const [paymentCycle, setPaymentCycle] = useState("");
  const [paymentCycleCheck, setPaymentCycleCheck] = useState(false);
  const [isUIUpdated, setIsUIUpdated] = useState(false);
  const dispatch = useDispatch();
  const [loaderMoedl, setloaderMoedl] = useState(false);

  const [products, setProducts] = useState([]);
  const [androidSubscription, setAndroidSubscription] = useState([]);
  const [UIUpdateRequired, setUIUpdateRequired] = useState(false);

  const isRecordFetched = useRef(false); // Use ref to persist the flag across re-renders
  const purchaseUpdateSubscription = useRef(null);
  const purchaseErrorSubscription = useRef(null);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);

  const planArray = [
    {
      id: 1,
      fomattedAmount: "",
      amount: "$4.99",
      productId: "com.tokee.premiummonthly",
      monthlyAmount: "",
      priceAmountMicros: "",
    },
    {
      id: 2,
      fomattedAmount: "",
      amount: "$35.99",
      productId: "com.tokee.annualsubscription",
      monthlyAmount: "$2.99",
      priceAmountMicros: "",
    },
  ];

  console.log("globalThis.selectedIndex >>>>", globalThis.selectedIndex);

  const [plan, setPlan] = useState(planArray);

  useEffect(() => {
    getSubscriptionApi();
  }, []);

  useEffect(() => {
    initilizeIAPConnection();
  }, []);

  const updateSelectedIndex = async (index: any) => {
    setSelectedPlan(index);
    globalThis.selectedIndex = index;
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

  useEffect(() => {
    purchaseUpdateSubscription.current = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        console.log("purchase listener", purchase);
        if (isRecordFetched.current) {
          console.log(
            "Skipping purchase handling as transaction is already processed"
          );
          return;
        }

        const receipt = purchase.transactionReceipt;
        let transId = "";
        let productId = "";

        if (receipt) {
          try {
            if (Platform.OS === "ios") {
              transId =
                purchase.originalTransactionIdentifierIOS ||
                purchase.transactionId;
              productId = purchase.productId;

              setloaderMoedl(true);
              await RNIap.finishTransaction({ purchase, isConsumable: false });

              if (!isRecordFetched.current) {
                isRecordFetched.current = true; // Mark as fetched early to avoid duplicate API calls
                const data = {
                  subscription_id: transId,
                  payment_cycle:
                    globalThis.selectedIndex == 0 ? "Annual" : "Monthly",
                  amount: globalThis.selectedIndex == 0 ? "35.99" : "4.99",
                  product_id: productId,
                  payment_method: "Apple",
                  payment_status: "Completed",
                  payment_data: receipt,
                };

                UpdateTransactionApi(data);
              }
              setloaderMoedl(false);
            } else if (Platform.OS === "android") {
              productId = purchase.productId;
              transId = purchase.transactionId;
              const transactionReceiptData = JSON.parse(
                purchase.transactionReceipt
              );

              console.log("transactionReceiptData", transactionReceiptData);

              setloaderMoedl(true);
              await RNIap.acknowledgePurchaseAndroid({
                token: transactionReceiptData.purchaseToken,
              });
              await RNIap.finishTransaction({ purchase, isConsumable: false });
              const stringifiedData = JSON.stringify(transactionReceiptData);

              if (!isRecordFetched.current) {
                isRecordFetched.current = true;
                const data = {
                  subscription_id: transactionReceiptData.purchaseToken,
                  payment_cycle:
                    globalThis.selectedIndex == 0 ? "Annual" : "Monthly",
                  amount: globalThis.selectedIndex == 0 ? "35.99" : "4.99",
                  product_id: productId,
                  payment_method: "Google",
                  payment_status: "Completed",
                  payment_data: stringifiedData,
                };

                UpdateTransactionApi(data);
              }
              setloaderMoedl(false);
            }
          } catch (error) {
            console.log("Error processing transaction", error);
            setloaderMoedl(false);
          }
        }
      }
    );

    purchaseErrorSubscription.current = RNIap.purchaseErrorListener((error) => {
      console.log("purchaseErrorListener", error);
    });

    return () => {
      if (purchaseUpdateSubscription.current) {
        purchaseUpdateSubscription.current.remove();
        purchaseUpdateSubscription.current = null;
      }
      if (purchaseErrorSubscription.current) {
        purchaseErrorSubscription.current.remove();
        purchaseErrorSubscription.current = null;
      }
    };
  }, []);

  // useEffect(() => {
  //   purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
  //     async (purchase) => {
  //       console.log("purchase listener", purchase);
  //       if (isRecordFetched === true) {
  //         console.log("Inside If condition >>>>>>>");
  //         setloaderMoedl(false);
  //         return;
  //       }
  //       const receipt = purchase.transactionReceipt;
  //       var transId = "";
  //       var productId = "";

  //       if (receipt) {
  //         try {
  //           if (Platform.OS === "ios") {
  //             transId = purchase.originalTransactionIdentifierIOS;
  //             productId = purchase.productId;
  //             if (transId == undefined) {
  //               transId = purchase.transactionId;
  //               productId = purchase.productId;
  //             }
  //             setloaderMoedl(true);
  //             if (isRecordFetched == false) {
  //               await RNIap.finishTransaction({
  //                 purchase: purchase,
  //                 isConsumable: false,
  //               })
  //                 .then((json) => {
  //                   setloaderMoedl(false);

  //                   const data = {
  //                     subscription_id: transId,
  //                     payment_cycle: selectedPlan == 0 ? "Annual" : "Monthly",
  //                     amount: selectedPlan == 0 ? "35.99" : "4.99",
  //                     product_id: productId,
  //                     payment_method: "Apple",
  //                     payment_status: "Completed",
  //                     payment_data: receipt,
  //                   };

  //                   UpdateTransactionApi(data);
  //                 })
  //                 .catch((error) => {
  //                   setloaderMoedl(false);
  //                   console.log("finishTransaction inapp", error);
  //                 });
  //               isRecordFetched = true;
  //             }
  //           } else if (Platform.OS === "android") {
  //             productId = purchase.productId;
  //             transId = purchase.transactionId;
  //             const transactionReceiptData = JSON.parse(
  //               purchase.transactionReceipt
  //             );
  //             console.log(
  //               "transactionReceiptData====================================",
  //               transactionReceiptData
  //             );

  //             setloaderMoedl(true);
  //             await RNIap.acknowledgePurchaseAndroid({
  //               token: transactionReceiptData.purchaseToken,
  //             });

  //             await RNIap.finishTransaction({
  //               purchase: purchase,
  //               isConsumable: false,
  //             }).then(() => {
  //               if (isRecordFetched == false) {
  //                 isRecordFetched = true;
  //                 setloaderMoedl(false);
  //                 console.log(
  //                   "transId====================================",
  //                   transId
  //                 );
  //                 const data = {
  //                   subscription_id: transactionReceiptData.purchaseToken,
  //                   payment_cycle: selectedPlan == 0 ? "Annual" : "Monthly",
  //                   amount: selectedPlan == 0 ? "35.99" : "4.99",
  //                   product_id: productId,
  //                   payment_method: "Google",
  //                   payment_status: "Completed",
  //                   payment_data: transactionReceiptData,
  //                 };

  //                 UpdateTransactionApi(data);
  //               }
  //             });
  //           }
  //         } catch (ackErr) {
  //           setloaderMoedl(false);
  //           console.log("ackErr INAPP>>>>", ackErr);
  //         }
  //       }
  //     }
  //   );

  //   purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
  //     console.log("purchaseErrorListener INAPP>>>>", error);
  //   });

  //   return () => {
  //     if (purchaseUpdateSubscription) {
  //       purchaseUpdateSubscription.remove();
  //       purchaseUpdateSubscription = null;
  //     }
  //   };
  // });

  // const getformattedPrice = async (formattedPrice:) => {

  // }

  const getProductDetails = async (allProducts: any, planProductId: any) => {
    const currentProduct = await allProducts.find((product: any) => {
      return planProductId === product.productId;
    });

    if (currentProduct) {
      const pricingPhase =
        currentProduct?.subscriptionOfferDetails[0]?.pricingPhases
          ?.pricingPhaseList[0];
      return {
        formattedPrice: pricingPhase?.formattedPrice,
        priceAmountMicros: pricingPhase?.priceAmountMicros,
      };
    }

    return {
      formattedPrice: "",
      priceAmountMicros: "",
    };
  };

  const updatePlanArray = async (products: any) => {
    console.log("products in update plan array >>>>>", products);

    // Update each plan in the planArray
    const updatedPlanArray = await Promise.all(
      planArray.map(async (plantemp) => {
        console.log("Plan Row >>>>>", plantemp);

        // Get formatted price and priceAmountMicros for each product
        const { formattedPrice, priceAmountMicros } = await getProductDetails(
          products,
          plantemp.productId
        );

        return {
          ...plantemp,
          fomattedAmount: formattedPrice, // Update formatted price
          priceAmountMicros: priceAmountMicros, // Update priceAmountMicros
        };
      })
    );

    console.log(
      "Updated Plan Array ======",
      updatedPlanArray[1].priceAmountMicros
    );
    setPlan(updatedPlanArray);
    setUIUpdateRequired(!UIUpdateRequired);
  };

  const formatPrice = (amountMicros, fomattedAmount) => {
    console.log(
      "fomattedAmount====================================",
      fomattedAmount
    );

    // Convert micros to regular amount
    const discountedAmount = amountMicros / 1000000;

    // Calculate original amount before 40% discount
    const originalAmount = discountedAmount / 0.6;

    // Extract currency symbol from fomattedAmount
    const currencySymbolMatch = fomattedAmount.match(/[\p{Sc}]/u); // Matches currency symbols using Unicode property
    const currencySymbol = currencySymbolMatch ? currencySymbolMatch[0] : "$"; // Default to '$' if no symbol found

    // Format the original amount with the extracted currency symbol, fixing to 2 decimal points
    return `${currencySymbol}${originalAmount.toFixed(2).toLocaleString()}`; // Return formatted price with two decimals
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
        
      }
      Purchaseproducts = Products;
      if (Platform.OS == "android") {
        updatePlanArray(Products);
      }
    } catch (err) {
      console.log("get inapp products error: ", err);
      console.warn("IAP error", err.code, err.message, err);

      //  setError(err.message);
    }
  };

  const handleBuySubscription = async (sku, offerTokenn) => {
    console.log("sku===================", sku);

    try {
      const skuu = sku; // Assuming skuu might be used elsewhere
      const offerToken = Platform.OS === "android" ? offerTokenn || null : null;

      await requestSubscription({
        sku: skuu, // corrected from `sku` to `skuu`
        ...(offerToken && {
          subscriptionOffers: [
            {
              sku: skuu, // skuu should be passed as a string
              offerToken: offerToken, // offerToken as a string
            },
          ],
        }),
      })
        .then(async (res) => {
          console.log("request subscription", JSON.stringify(res));
          // handle/store response
        })
        .catch((err) => {
          console.log("error buying product", err);
        });
    } catch (error) {
      console.error("Error during subscription request:", error);
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

    if (offerToken || planId) {
      if (Platform.OS === "ios") {
        handleBuySubscription(planId, "");
      } else {
        handleBuySubscription(planId, offerToken);
      }
    } else {
      console.error("No offer token found for the selected plan.");
    }
  };

  const getSubscriptionApi = async () => {
    setloaderMoedl(true);
    // setloaderMoedl(true);
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    GetApiCall(
      getsubscription,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        profileApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  const profileApiSuccess = (ResponseData, ErrorStr) => {
    if (ErrorStr) {
      setloaderMoedl(false);
      //  Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setPaymentCycleCheck(true);
    } else {
      setloaderMoedl(false);
      let PAYMENTCYCLE = ResponseData.data.payment_cycle ?? "";
      setPaymentCycle(PAYMENTCYCLE);
      setPaymentCycleCheck(true);
      setloaderMoedl(false);

      if (PAYMENTCYCLE == "Monthly") {
        globalThis.selectedIndex = 0;
      }

      //   setSelectedPlan(PAYMENTCYCLE == "Monthly" ? 0 : 1);
    }
  };
  const UpdateTransactionApi = async (data) => {
    setloaderMoedl(true);
    // const generateRandomSubscriptionId = () => {
    //   const randomPart = () =>
    //     Math.floor(Math.random() * 10000)
    //       .toString()
    //       .padStart(4, "0"); // Generates a random 4-digit number
    //   return `GPA.${randomPart()}-${randomPart()}-${randomPart()}-${randomPart()}0`;
    // };

    // Example of data with a random subscription_id
    // const dataa = {
    //   subscription_id: generateRandomSubscriptionId(),
    //   payment_cycle: selectedPlan == 0 ? "Annual" : "Monthly",
    //   amount: selectedPlan == 0 ? "35.99" : "4.99",
    //   product_id: "com.tokee.premiummonthly",
    //   payment_method: Platform.OS === "ios" ? "Apple" : "Google",
    //   payment_status: "Completed",
    //   payment_data: '{"dfsdf":"dfsdfhkjsdhfkjsf"}',
    // };

    console.log("Data before sending to purchase api >>>", data);

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
    console.log(
      "purchase api ResponseData====================================",
      ResponseData.data
    );
    setloaderMoedl(false);
    if (ErrorStr) {
      setloaderMoedl(false);
      globalThis.errorMessage= ErrorStr;
      console.log("Error >>>>", ErrorStr);
      setErrorAlertModel(true);
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      setloaderMoedl(false);
      dispatch(setPremium(true));
      globalThis.isUserPremium = true;
      setSuccessAlertModel(true)
      // Alert.alert(t("success"), t("You_are_upgraded_to_Tokee_Premium"), [
      //   {
      //     text: t("ok"),
      //     onPress: () => {
      //       navigation.navigate("BottomBar");
      //     },
      //   },
      // ]);
    }
  };

  const listItemClicked = async (index: any) => {
    setIsUIUpdated(!isUIUpdated);
    console.log("index >>>>>>>>", index);
    setSelectedIndex(index);
    setTokeePremiumModel(true);
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
    } else if (paymentCycle == "Monthly") {
      return (
        <View
          style={{
            backgroundColor: COLORS.grey,
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
    } else if (paymentCycle == "Annual") {
      return (
        <View
          style={{
            backgroundColor: COLORS.grey,
            height: 30,
            width: 30,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 15,
          }}
        ></View>
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

  const renderAnnualCheckBoxView = () => {
    if (selectedPlan == 0) {
      return (
        <View
          style={{
            backgroundColor:
              paymentCycle == "Annual" ? COLORS.grey : iconTheme().iconColor,
            height: 30,
            width: 30,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 15,
          }}
        >
          {/* {renderIf(
            paymentCycle != "Annual", */}
          <Image
            source={require("../../Assets/Icons/check_icon.png")}
            style={{ height: 20, width: 20 }}
          />
          {/* )} */}
        </View>
      );
    }

    // else if (paymentCycle == "Monthly" || paymentCycle == "Annual") {
    //   return (
    //     <View
    //       style={{
    //         backgroundColor: COLORS.grey,
    //         height: 30,
    //         width: 30,
    //         justifyContent: "center",
    //         alignItems: "center",
    //         borderRadius: 15,
    //       }}
    //     >
    //       <Image
    //         source={require("../../Assets/Icons/check_icon.png")}
    //         style={{ height: 20, width: 20 }}
    //       />
    //     </View>
    //   );
    // }
    else {
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

  const styles = StyleSheet.create({
    outertab: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: WINDOW_WIDTH,
    },
    arrowchavron: {
      width: 12,
      height: 12,
      resizeMode: "contain",
      transform: [{ scaleX: -1 }],
    },
    tabimg: {
      width: 23,
      height: 23,
      resizeMode: "contain",
      marginRight: 10,
    },
    tabsview: {
      flexDirection: "row",
      alignItems: "center",
    },
    innertext: {
      fontFamily: font.semibold(),
      color: COLORS.black,
    },
    boxwork: {
      alignItems: "center",
      justifyContent: "space-between",
      alignSelf: "center",
      marginVertical: 5,
      marginLeft: 2,
      marginRight: 0,
      // marginHorizontal:"auto",
      padding: 10,
      // height: 55,
      borderRadius: 10,
      flexDirection: "row",
      width: "100%",
      backgroundColor: "#FFF",
      shadowColor: COLORS.lightgrey,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      //shadowRadius: 5,
      elevation: 5,
    },
    channelimage: {
      // tintColor: bottomIcon().tintColor,
      //  height: 190,
      width: "100%",
      resizeMode: "contain",
     // paddingHorizontal: 0,
      // zIndex: 9999,
      // backgroundColor:"green"
    },
    channelcover: {
      width: "100%",

      //   height: 240,
      alignSelf: "center",
      backgroundColor: "purple",
      paddingVertical: 1,
      //    position: "absolute",
    },
    toptext: {
      color: COLORS.black,
      width: WINDOW_WIDTH / 3,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "600",
      fontFamily: font.semibold(),
    },
    backArrowContainer: {
      marginLeft: 10,
      borderRadius: 5,
      backgroundColor: themeModule().premiumBackIcon,
    },
    backIcon: {
      height: 25,
      width: 25,
      //@ts-ignore
      tintColor:
        globalThis.selectTheme === "christmas"
          ? COLORS.white
          : //@ts-ignore
          globalThis.selectTheme == "third"
          ? COLORS.dark_pink
          : COLORS.white,
    },
    fontNameText: {
      color: COLORS.black,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
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
      width: WINDOW_WIDTH - 34,
      backgroundColor: "#FFF",
      shadowColor: COLORS.lightgrey,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      //shadowRadius: 5,
      elevation: 5,
    },
    enableTextAndIcon: {
      // justifyContent: "center",
      margin: 0,
      width: "60%",
      flexDirection: "row",
    },
    itemContainer: {
      flexDirection: "row",
      height: 50,
      justifyContent: "space-between",
      width: "100%",
      // marginHorizontal:32,
      borderRadius: 8,
    },
    iconContainer: {
      width: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    icon: {
      height: 25,
      width: 25,
      alignSelf: "center",
    },
    titleContainer: {
      // width: WINDOW_WIDTH-80,
      justifyContent: "center",
      // backgroundColor:"red"
      // paddingHorizontal: 5,
    },
    arrowContainer: {
      width: 40,
      //  paddingHorizontal: 5,
      alignSelf: "center",
    },
    arrowIcon: {
      marginRight: 10,
      height: 12,
      width: 12,
      alignSelf: "flex-end",
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
      backgroundColor:
        paymentCycle == "Annual" ? COLORS.grey : iconTheme().textColorForNew,
    },
  });

  const openWebViewUrl = (pageName: any, pageUrl: any) => {
    navigation.navigate("WebScreen", { pageName: pageName, pageUrl: pageUrl });
  };

  const ListItem = ({ onPress, iconSource, title, isLastItem, index }) => {
    return (
      <Pressable
        style={[
          styles.itemContainer,
          {
            borderBottomWidth: isLastItem ? 0 : 0.5,
            borderBottomColor: isLastItem ? "transparent" : COLORS.lightgrey,
          },
        ]}
        onPress={() => listItemClicked(index)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: WINDOW_WIDTH - 88,
          }}
        >
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Image
              source={iconSource}
              style={[styles.icon, { tintColor: iconTheme().iconColor }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.fontNameText}>{title}</Text>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <Image
            source={require("../../Assets/Icons/Arrow_Forword.png")}
            style={styles.arrowIcon}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS == "android" ? (
        <CustomStatusBar
          barStyle={isDarkMode ? "dark-content" : "dark-content"}
          backgroundColor={themeModule().premiumScreen}
        />
      ) : null}

      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
         <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={t("You_are_upgraded_to_Tokee_Premium")}
        doneButton={() => {
         setSuccessAlertModel(false),
          navigation.navigate("BottomBar");
        }}
      />
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
      <TokeePremiumModel
        visible={tokeePremiumModel}
        onRequestClose={() => setTokeePremiumModel(false)}
        cancel={() => setTokeePremiumModel(false)}
        paymentCycle={paymentCycle}
        selectedPlan={selectedPlan}
        UpdateTransactionApi={SubscribeClicked}
        paymentCycleCheck={paymentCycleCheck}
        selectedIndex={selectedIndex}
        plan={plan}
      />
      {renderIf(
        loaderMoedl == false,
        <View
          style={{
            position: "relative",
            /// backgroundColor: themeModule().premiumScreen,
            // backgroundColor: COLORS.purple,
          }}
        >
          {/* // **********  Status Bar    ********** // */}

          {/* // ********** Title Text   ********** // */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              // position:"relative"
              //   paddingBottom: Platform.OS === "ios" ? 0 : 50,
              backgroundColor: COLORS.white,
            }}
          >
           
            <View style={styles.channelcover}>
              <LinearGradient
                colors={gredient().BackColor}
                start={{ x: 0, y: 0 }} // Start at the top
                end={{ x: 0, y: 1 }}
                style={{
                  //  height: 150,
                  width: "100%",

                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
               
                  <Image
                    source={
                      premiumBack().Image
                    }
                    style={[
                      styles.channelimage,
                      {

                        height: 150,
                       // backgroundColor:"red",
                        width:"100%",
                        marginTop: 70,
                      },
                      // { tintColor: iconTheme().iconColor },
                    ]}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      color: COLORS.white,
                      fontSize: 22,
                      fontFamily: font.semibold(),
                      marginRight: 2,
                    }}
                  >
                    Tokee Premium
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      color: COLORS.white,
                      fontSize: 15,
                      fontFamily: font.regular(),
                      marginBottom: 10,
                    }}
                  >
                    {t("premium_feature_detail")}
                  </Text>
                  <Lottie
                    source={recordingAnimation}
                    autoPlay
                    loop
                    style={[
                      styles.channelimage,
                      {
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        right: 0,
                      },
                    ]}
                  />

                  <TouchableOpacity
                    style={[
                      styles.backArrowContainer,
                      {
                        width: 25,
                        height: 25,
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        position: "absolute",
                        left: 10,
                        top: DeviceInfo.hasNotch() ? 64 : 34,
                      },
                    ]}
                    onPress={() => {
                      navigation.pop();
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/back2.png")}
                      style={[
                        styles.backIcon,
                        { width: "100%", height: 13, resizeMode: "contain" },
                      ]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
             
              </LinearGradient>
            </View>

            <View style={{ position: "relative" }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  width: WINDOW_WIDTH,

                  marginTop: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: COLORS.white,
                    marginHorizontal: 2,
                    // paddingRight: 5,
                    height: 115,
                    // backgroundColor:"red",
                    borderRadius: 8,
                    marginTop: 0,
                    shadowColor: COLORS.lightgrey,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 1,
                    elevation: 5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      //  backgroundColor:"red",
                      alignItems: "center",
                      height: 60,
                      // justifyContent: "center",
                      width: WINDOW_WIDTH - 24,
                      borderRadius: 8,

                      borderBottomWidth: 0.5,
                      borderBottomColor: COLORS.lightgrey,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        width: 40,
                        height: 60,
                        //  backgroundColor:"red",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => updateSelectedIndex(0)}
                      activeOpacity={0.7}
                    >
                      {renderAnnualCheckBoxView()}
                    </TouchableOpacity>

                    <View
                      style={{
                        width: WINDOW_WIDTH - 190,
                        // backgroundColor:"green",
                        //  height: 65,
                        flexDirection: "column",
                      }}
                    >
                      <View
                        style={{
                          //  width: WINDOW_WIDTH - 220,
                          flexDirection: "row",
                          // paddingHorizontal: 5,
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Text
                          style={[
                            styles.fontNameText,
                            {
                              color:
                                paymentCycle == "Annual"
                                  ? COLORS.grey
                                  : COLORS.black,
                              marginTop: Platform.OS == "ios" ? 10 : 0,
                            },
                          ]}
                        >
                          {t("Annual")}
                          {paymentCycle == "Annual"
                            ? `(${t("Current_plan")})`
                            : " "}
                        </Text>
                        {/* {paymentCycle == "Annual" && (
                          <Text
                            style={[
                              styles.fontNameText,
                              {
                               // borderRadius: 5,
                               
                                color:
                                  paymentCycle == "Annual"
                                    ? COLORS.grey
                                    : COLORS.white,
                                // paddingHorizontal: 4,
                                fontSize:
                                  paymentCycle == "Annual" ? FontSize.font : 12,
                                marginTop: Platform.OS == "ios" ? 10 : 0,
                              },
                            ]}
                          >
                          
                            {/* {paymentCycle == "Annual"
                          ? `(${t("Current_plan")})`
                          : "-40%"} */}
                        {/* </Text>
                        )} */}
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          width: "100%",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            textDecorationLine: "line-through",
                          }}
                        >
                          {Platform.OS == "ios"
                            ? " $59.99 "
                            : formatPrice(
                                plan[1].priceAmountMicros,
                                plan[1].fomattedAmount
                              )}
                        </Text>

                        <Text
                          style={{
                            fontSize: 13,
                            marginLeft: 5,
                            marginTop: Platform.OS == "ios" ? 0 : 0,
                          //  backgroundColor:"red"
                          }}
                        >
                          {Platform.OS == "ios"
                            ? " $35.99 "
                            : " " + plan[1].fomattedAmount}/Year{" "}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        width: 120,
                        // backgroundColor:"red",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/Subtract.png")}
                        resizeMode="contain"
                        style={{
                          height: 45,
                          width: 45,
                          tintColor: iconTheme().iconColor,
                          marginRight: 10,
                        }}
                      />
                      <View
                        style={{
                           width:65,

                          justifyContent: "flex-end",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <Text
                          style={[
                            styles.fontNameText,
                            {
                              width:65,
                              textAlign: "left",
                              alignSelf: "center",
                              fontFamily: font.regular(),
                              color:
                                paymentCycle == "Annual"
                                  ? COLORS.grey
                                  : COLORS.black,
                              fontSize: 15,
                              lineHeight: 18, // Set a line height close to font size
                              marginBottom: 0, // Ensure no bottom margin
                              paddingBottom: 0, // E
                            },
                          ]}
                        >
                          {Platform.OS == "ios"
                            ? `${planArray[1].monthlyAmount}`
                            : `${plan[1].fomattedAmount.replace(
                                /[^a-zA-Z$€£¥₹]+/g,
                                ""
                              )}${(
                                parseFloat(
                                  plan[1].fomattedAmount.replace(
                                    /[^0-9.-]+/g,
                                    ""
                                  )
                                ) / 12
                              ).toFixed(2)}`}{" "}
                          {/* This will divide the amount by 12 and display it as a monthly value */}
                        </Text>
                        <Text
                          style={[
                            styles.fontNameText,
                            {
                              width:65,
                              textAlign: "left",
                              alignSelf: "center",
                              marginBottom: 0,
                              lineHeight: 14,

                              fontFamily: font.regular(),
                              color:
                                paymentCycle == "Annual"
                                  ? COLORS.grey
                                  : COLORS.black,
                              fontSize: 12,
                            },
                          ]}
                        >
                          {"Per Month"}
                          {/* This will divide the amount by 12 and display it as a monthly value */}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      // backgroundColor:"red",
                      height: 50,
                      //  alignItems:"center",
                      // justifyContent: "center",
                      width: WINDOW_WIDTH - 24,
                      borderRadius: 8,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        width: 40,
                        // backgroundColor:"red",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        paymentCycle == "Annual" || paymentCycle == "Monthly"
                          ? null
                          : updateSelectedIndex(1);
                      }}
                      activeOpacity={0.7}
                    >
                      {renderMonthlyCheckBoxView()}
                    </TouchableOpacity>

                    <View
                      style={{
                        width: WINDOW_WIDTH - 190,
                        justifyContent: "center",
                        //  backgroundColor:"green"
                        // marginRight:5
                      }}
                    >
                      <Text
                        style={[
                          styles.fontNameText,
                          {
                            color:
                              paymentCycle == "Monthly" ||
                              paymentCycle == "Annual"
                                ? COLORS.grey
                                : COLORS.black,
                          },
                        ]}
                      >
                        {t("Monthly") + " "}
                        {paymentCycle == "Monthly"
                          ? `(${t("Current_plan")})`
                          : ""}{" "}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 120,
                        //   backgroundColor:"red",
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
                            color:
                              paymentCycle == "Monthly" ||
                              paymentCycle == "Annual"
                                ? COLORS.grey
                                : COLORS.black,
                            fontSize: 15,
                            lineHeight: 18, // Set a line height close to font size
                            marginBottom: 0, // Ensure no bottom margin
                            paddingBottom: 0, // E
                          },
                        ]}
                      >
                        {Platform.OS == "ios"
                          ? plan[0].amount
                          : plan[0].fomattedAmount}
                      </Text>
                      <Text
                        style={[
                          styles.fontNameText,
                          {
                            // width: 130,
                            lineHeight: 14,
                            width: 65,
                            textAlign: "left",
                            alignSelf: "flex-end",
                            fontFamily: font.regular(),
                            color:
                              paymentCycle == "Monthly" ||
                              paymentCycle == "Annual"
                                ? COLORS.grey
                                : COLORS.black,
                            fontSize: 12,
                          },
                        ]}
                      >
                        {"Per Month"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: COLORS.white,
                    marginHorizontal: 2,
                    paddingHorizontal: 5,
                    height: 800,
                    borderRadius: 8,
                    marginTop: 10,
                    shadowColor: COLORS.lightgrey,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 1,
                    elevation: 5,
                    marginBottom: 100,
                  }}
                >
                  <ListItem
                    onPress={() => {
                      1;
                    }}
                    iconSource={require("../../Assets/Icons/last_seen.png")}
                    title={t("last_seen_time")}
                    isLastItem={false}
                    index={0}
                  />
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/App_icon.png")}
                    title={t("Premium_App_Icons")}
                    isLastItem={false}
                    index={1}
                  />

                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/stealth_mode.png")}
                    title={t("stealth_mode")}
                    isLastItem={false}
                    index={2}
                  />

                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/Premium_Badges.png")}
                    title={t("premium_badge")}
                    isLastItem={false}
                    index={3}
                  />
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/story_unlimited.png")}
                    title={t("unlimited_story")}
                    isLastItem={false}
                    index={4}
                  />
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/last_seen_user.png")}
                    title={t("story_views")}
                    isLastItem={false}
                    index={5}
                  />
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/storylike.png")}
                    title={t("story_likes")}
                    isLastItem={false}
                    index={6}
                  />
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/story_caption.png")}
                    title={t("Enhancement_to_caption")}
                    isLastItem={false}
                    index={7}
                  />
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/Pinned_Chat.png")}
                    title={t("pinned_chat")}
                    isLastItem={false}
                    index={8}
                  />
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/Profile_Bio.png")}
                    title={t("expended_bio")}
                    isLastItem={false}
                    index={9}
                  />
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/ph_user-thin.png")}
                    title={t("profile_links")}
                    isLastItem={false}
                    index={10}
                  />
                  {/* <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/channelbadge.png")}
                    title={t("premium_channel")}
                    isLastItem={false}
                    index={11}
                  /> */}
                  {/* <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/Messages_infinite.png")}
                    title={t("Infinite_react")}
                    isLastItem={false}
                    index={12}
                  /> */}
                  <ListItem
                    onPress={() => {}}
                    iconSource={require("../../Assets/Icons/channel_icon.png")}
                    title={t("Unlimited_channels")}
                    isLastItem={false}
                    index={12}
                  />
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#f8f8f8",
                      paddingVertical: 5,
                      width: "100%",
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{ color: "gray", fontWeight: "400", fontSize: 13 }}
                    >
                      By subscribing to Tokee Premium, you agree to the{" "}
                      <Text
                        onPress={() =>
                          openWebViewUrl(
                            "Terms and Conditions",
                            "https://tokee.app/terms-of-use/"
                          )
                        }
                        style={{
                          fontWeight: "600",
                          fontSize: 13,
                          color: iconTheme().textColorForNew,
                        }}
                      >
                        Tokee Terms of Service
                      </Text>{" "}
                      and{" "}
                      <Text
                        onPress={() =>
                          openWebViewUrl(
                            "Privacy Policy",
                            "https://tokee.app/privacy-policy/"
                          )
                        }
                        style={{
                          fontWeight: "600",
                          fontSize: 13,
                          color: iconTheme().textColorForNew,
                        }}
                      >
                        Privacy Policy
                      </Text>
                      . Subscriptions auto-renew unless canceled via your{" "}
                      {Platform.OS === "ios" ? "App Store" : "Google Play"}{" "}
                      settings.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          {paymentCycle != "Annual" && paymentCycleCheck && (
            <View
              style={{
                marginVertical: 0,
                flexDirection: "column",
                paddingHorizontal: 30,
                justifyContent: "center",
                position: "absolute",
                width: WINDOW_WIDTH,
                bottom: DeviceInfo.hasNotch() ? 30 : 40,
                left: 0,
                //backgroundColor:'red',
                //  backgroundColor:"red",
                height:
                  Platform.OS === "ios" ? 60 : DeviceInfo.hasNotch() ? 60 : 60,
              }}
            >
              <TouchableOpacity
                style={styles.button}
                // onPress={() => UpdateTransactionApi("Data")}
                onPress={() => SubscribeClicked()}
              >
                <Text style={styles.buttonText}>
                  {paymentCycle == "Monthly"
                    ? Platform.OS == "ios"
                      ? t("Upgrade_for_Per_Year")
                      : "Upgrade for" +
                        " " +
                        plan[1].fomattedAmount +
                        " " +
                        "Per Year"
                    : selectedPlan == 0
                    ? Platform.OS == "ios"
                      ? t("Subscribe_for_Per_Year")
                      : "Subscribe for" +
                        " " +
                        plan[1].fomattedAmount +
                        " " +
                        "Per Year"
                    : Platform.OS == "ios"
                    ? t("Subscribe_for_Per_Months")
                    : "Subscribe for" +
                      " " +
                      plan[0].fomattedAmount +
                      " " +
                      "Per Month"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default PremiumFeaturesScreen;
