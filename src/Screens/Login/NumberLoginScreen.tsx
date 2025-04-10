import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import PhoneInput from "react-native-phone-number-input";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  loginthemeModule,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import { Base_Url, check_account_suspend, Get_Otp, twiliolookup } from "../../Constant/Api";
import { logoIcon } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";
import axios from "axios";
import { CaptchaModelShow } from "../Modals/CaptchaModel";
import { accessKeyId, secretAccessKey } from "../../Constant/Key";
import crashlytics from "@react-native-firebase/crashlytics";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";

const isDarkMode = false;

// eslint-disable-next-line
export default function NumberLoginScreen({ navigation ,route}: any) {
  const [phoneNumber, setphoneNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneCountryCode, phoneCountryCodeSetter] = useState("+1");
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const phoneInput = useRef(null);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [captchaModel, setCaptchaModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);

  const { t } = useTranslation();

  // **********   Headers for api ********** ///
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      TakeData();
    });
    return unsubscribe2;
  }, []);

  const TakeData = async () => {
    const name = await AsyncStorage.getItem("filledName");
    const number = await AsyncStorage.getItem("filledNumber");
    if (name !== null) {
      setUserName(name);
    }
    if (number !== null) {
      setphoneNumber(number);
    }
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          // Alert.alert(
          //   "No Internet",
          //   "No Internet, Please check your Internet Connection."
          // );

          return;
        } else {
          setphoneNumber("");
          setUserName("");
        }
      });
    });
    return unsubscribe2;
  }, []);

  // **********   Login Button Method  ********** ///
  const LoginButtonPress = () => {
    // console.log(data)
    if (userName?.toLowerCase()?.includes("tokee")) {
      globalThis.errorMessage = t("you_cn_use_tokee_name");
      setErrorAlertModel(true);
      // Alert.alert(
      //   t("error"),
      //   t("you_cn_use_tokee_name"),
      //   [{ text: t("ok") }]
      // );
      return; // Exit early if "toke" is found
    }
    if (userName == "") {
      globalThis.errorMessage =
        "Name Field Required, " + t("Please_provide_name");
      setErrorAlertModel(true);
      // Alert.alert("Name Field Required", t("Please_provide_name"), [
      //   { text: t("ok") },
      // ]);
      //  Alert.alert( t('Please_provide_name'),);
    } else if (phoneNumber == "") {
      globalThis.errorMessage =
        "Phone Number Required, " + t("please_provide_phone_number");
      setErrorAlertModel(true);
      // Alert.alert("Phone Number Required", t("please_provide_phone_number"), [
      //   { text: t("ok") },
      // ]);
    } else if (phoneCountryCode == "") {
      // Alert.alert("Invalid!", "Select different Country.");
      globalThis.errorMessage = "Invalid, " + "Select different Country.";
      setErrorAlertModel(true);
    } else if (phoneNumber.length < 7) {
      // Alert.alert("", t("valid_phone"), [{ text: t("ok") }]);
      globalThis.errorMessage = "Invalid, " + t("valid_phone");
      setErrorAlertModel(true);
    } else {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          // Alert.alert(
          //   "No Internet",
          //   "No Internet, Please check your Internet Connection."
          // );
          setNoInternetModel(true);
          return;
        } else {
          //  setCaptchaModel(true);
          NavigateOTPScreen();
        }
      });
    }
  };


  // const checkAccountSuspend = async() => {

  //   const url = Base_Url + check_account_suspend;
  //   try {
  //     axios({
  //       method: "post",
  //       url: url,
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         localization: globalThis.selectLanguage,
  //       },
  //       data: {
  //         country_code: phoneCountryCode,
  //         phone_number: phoneNumber,
  //       },
  //     })
  //       .then((response) => {
  //         console.log('====================================',response.data);
  //         if (response.data.status == true) {
           
            
  //         } else {
  //           alert(response.data.message);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   } catch (error) {
  //     console.log("error", error);
  //   }


  // }


  const checkAccountSuspend = async () => {
    const url = Base_Url + check_account_suspend;
    setloaderMoedl(true);
    try {
      const response = await axios.post(url, {
        country_code: phoneCountryCode,
        phone_number: phoneNumber,
      }, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          localization: globalThis.selectLanguage,
        },
      });
  
      console.log("API Response:", response.data);
  
      if (response.data.status) {
        return response.data; // Return the response to be used elsewhere
      } else {
        globalThis.errorMessage = response.data.message;
        setloaderMoedl(false);
        setErrorAlertModel(true);
        return null;
      }
    } catch (error) {
     alert(error);
     setloaderMoedl(false);
      return null;
    }
  };
  





  const lookupPhoneNumber = async (phoneNumb) => {
    console.log("its first >>>>>>>")
    // const url = `https://lookups.twilio.com/v2/PhoneNumbers/${phoneNumb}`;

    const url = Base_Url + twiliolookup;
    try {
      const response = await axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          phone_number: phoneNumb,
        },
      });

      if (!response.data.valid) {
        setloaderMoedl(false);
        globalThis.errorMessage =
          "Invalid Number, " + "Please check your mobile number";
        setErrorAlertModel(true);
        // Alert.alert("Invalid Number", "Please check your mobile number", [
        //   { text: "OK" },
        // ]);
      } else {
        setloaderMoedl(false);
        const data = {
          country_code: phoneCountryCode,
          phone_number: phoneNumber,
        };
        console.log("dta:",data)
        // sendOTP(phoneCountryCode+phoneNumber)
        // return
        PostApiCall(
          Get_Otp,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      }
      // Handle the successful response here
    } catch (error) {
      setloaderMoedl(false);
      let errorMessage = "An error occurred";

      if (error.response) {
        console.log("error.response", error.response);
        switch (error.response.status) {
          case 400:
            errorMessage = "Bad Request";
            break;
          case 401:
            errorMessage = "Unauthorized";
            break;
          case 403:
            errorMessage = "Forbidden";
            break;
          case 404:
            errorMessage = "Not Found";
            break;
          case 429:
            errorMessage = "Too Many Requests";
            break;
          case 500:
            errorMessage = "Internal Server Error";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server";
      } else {
        console.log("error.response2", error.response);
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }

      // Alert.alert("Error", errorMessage, [{ text: "OK" }]);
      globalThis.errorMessage = errorMessage;
      setErrorAlertModel(true);
    }
  };
  // **********   Method for Navigation for Further screen  ********** ///
  // eslint-disable-next-line
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    console.log("firebaseotp", ResponseData, ErrorStr);
    if (ErrorStr) {
      setUserName("");
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      globalThis.errorMessage = ErrorStr;
      setloaderMoedl(false);
      setErrorAlertModel(true);

      // Navigate to another screen or handle the error in some way
    } else {
      console.log("it is 111")
      setloaderMoedl(false);
      // setCaptchaModel(true);
      let code = phoneCountryCode.toString();
      let phone = phoneNumber.toString();
      let name = userName.toString();
      console.log("it is 222",code,phone,name,phoneCountryCode)
      SaveData();
      console.log("it is 333")
      navigation.push("OtpVerificationScreen", {
        code: code,
        phone: phone,
        name: name,
        phoneCountryCode: phoneCountryCode,
        // email:route.params.email || ""
      });
    }
  };

  const styles = StyleSheet.create({
    logoView: {
      height: DeviceInfo.isTablet() == true ? 320 : 220,
      alignItems: "center",
      justifyContent: "center",
    },

    mainContainer: {
      height: windowHeight,
      width: windowWidth,
    },
    logoImage: {
      height: DeviceInfo.isTablet() == true ? 250 : 150,
      width: DeviceInfo.isTablet() == true ? 250 : 150,
      tintColor: logoIcon().tintColor,
      marginTop: 90,
    },
    button: {
      height: 50,
      marginTop: 50,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: loginthemeModule().loginButton,
    },
    formContainer: {
      height: "100%",
      backgroundColor:
        globalThis.selectTheme === "newYearTheme"
          ? "#3B344E"
          : globalThis.selectTheme === "newYear"
          ? "#E88E34"
          : globalThis.selectTheme === "christmas"
          ? "#B92519"
          : "#fff",
      borderWidth: 0,
      borderTopEndRadius: 30,
      borderTopStartRadius: 30,
      borderColor: "transparent",
      bottom: 0,
      marginBottom: 0,
      width: windowWidth,
    },
    textInput: {
      paddingVertical: 0,
      fontFamily: font.semibold(),
      color: loginthemeModule().textColor,
      backgroundColor:
        globalThis.selectTheme === "newYearTheme"
          ? "#3B344E"
          : globalThis.selectTheme === "newYear"
          ? "#E88E34"
          : globalThis.selectTheme === "christmas"
          ? "#B92519"
          : "#fff",
      alignItems: "center",
      fontSize: DeviceInfo.isTablet() == true ? 27 : 17,
    },
    phoneContainer: {
      marginTop: 10,
      width: "100%",
      backgroundColor:
        globalThis.selectTheme === "newYearTheme"
          ? "#3B344E"
          : globalThis.selectTheme === "newYear"
          ? "#E88E34"
          : globalThis.selectTheme === "christmas"
          ? "#B92519"
          : "#fff",
      fontFamily: font.semibold(),
      borderBottomWidth: 1,
      borderBottomColor: "#F6EBF3",
    },
    signUpTextContainer: {
      height: 60,
      alignItems: "flex-start",
      paddingLeft: DeviceInfo.isTablet() == true ? 32 : 16,
    },
    nameTextContainer: {
      height: 50,
      alignItems: "flex-start",
      paddingLeft: DeviceInfo.isTablet() == true ? 32 : 16,
    },
    phTextContainer: {
      alignItems: "flex-start",
      paddingLeft: DeviceInfo.isTablet() == true ? 32 : 16,
      paddingRight: 16,
      fontFamily: font.semibold(),
      position: "relative",
      zIndex: 1,
    },
    nameInputTextContainer: {
      marginRight: 16,
      marginLeft: DeviceInfo.isTablet() == true ? 32 : 16,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },

    signUpText: {
      marginTop: 20,
      fontSize: DeviceInfo.isTablet() == true ? 32 : 24,
      fontWeight: "900",
      color: appBarText().signUpText,
      fontFamily: font.semibold(),
    },
    nameText: {
      marginTop: 20,
      fontSize: FontSize.font,
      color: loginthemeModule().textColor,
      fontWeight: "600",
      fontFamily: font.regular(),
    },
    detailsText: {
      fontSize: DeviceInfo.isTablet() == true ? 24 : 15,
      color: loginthemeModule().textColor,
      fontFamily: font.medium(),
      marginTop: 8,
    },
    buttonText: {
      fontSize: FontSize.font,
      
      color:
        globalThis.selectTheme === "newYearTheme"
          ? COLORS.black
          : globalThis.selectTheme === "newYear"
          ? COLORS.black
          : globalThis.selectTheme === "christmas"
          ? COLORS.primary_light_green
          : COLORS.white,
      fontFamily: font.bold(),
    },
    nameInputText: {
      fontSize: FontSize.font,
      padding: 0,
      marginTop: 10,
      color: loginthemeModule().textColor,
      fontFamily: font.regular(),
    },
  });

  const SaveData = async () => {
    await AsyncStorage.setItem("filledName", userName);
    await AsyncStorage.setItem("filledNumber", phoneNumber.toString());
    setloaderMoedl(false);
  };

//   const NavigateOTPScreen = async () => {
//     checkAccountSuspend();
//     console.log("its second >>>>>>>")
//     setloaderMoedl(true);
//     if (globalThis.isTwillioLookupEnabled == "YES") {
//       lookupPhoneNumber(phoneCountryCode + phoneNumber);
//     } else {
//       const data = {
//         country_code: phoneCountryCode,
//         phone_number: phoneNumber,
//       };
// console.log("data",data)
//       PostApiCall(
//         Get_Otp,
//         data,
//         headers,
//         navigation,
//         (ResponseData, ErrorStr) => {
//           apiSuccess(ResponseData, ErrorStr);
//         }
//       );
//     }
//   };

const NavigateOTPScreen = async () => {
  const accountData = await checkAccountSuspend();
  

  console.log('accountData====================================',accountData);
  console.log();
  console.log('====================================');

  if (accountData.status == true) {
    console.log("Account is active, proceeding to OTP...");

    setloaderMoedl(true);

    if (globalThis.isTwillioLookupEnabled == "YES") {
      lookupPhoneNumber(phoneCountryCode + phoneNumber);
    } else {
      const data = {
        country_code: phoneCountryCode,
        phone_number: phoneNumber,
      };

      console.log("data", data);

      PostApiCall(
        Get_Otp,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          apiSuccess(ResponseData, ErrorStr);
        }
      );
    }
  } else {
    globalThis.errorMessage = accountData.message;
    setloaderMoedl(false);
    setErrorAlertModel(true);
  }
};

  console.log("globalThis.selectTheme", globalThis.selectTheme);

  return (
    <View
      style={{
        backgroundColor: loginthemeModule().theme_background,
        flex: 1,
      }}
    >
      {/* **********   StausBar    **********  */}
      <CustomStatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={loginthemeModule().theme_background}
      />
      {/* **********  Calling Model for Loading     **********  */}

      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
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

      <TouchableOpacity
        style={{
          left: 16,
          borderRadius: 5,
          marginTop: 20,
          backgroundColor: themeModule().premiumBackIcon,
          width: 35,
          height: 35,
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => {
          navigation.pop();
        }}
      >
        <Image
          source={require("../../Assets/Icons/Back.png")}
          style={{
            height: 25,
            width: 25,
            tintColor:
              globalThis.selectTheme == "third"
                ? COLORS.dark_pink
                : COLORS.white,
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <KeyboardAvoidingView style={{ flex: 1, height: "100%" }}>
        <ScrollView
          style={{
            height: "100%",
            backgroundColor: loginthemeModule().theme_background,
            paddingBottom: 300,
          }}
          contentContainerStyle={{ flexGrow: 1 }}
          automaticallyAdjustContentInsets={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.mainContainer,
              {
                backgroundColor: loginthemeModule().theme_background,
              },
            ]}
          >
            {/* **********   Logo View   **********  */}
            <ImageBackground
              source={
                globalThis.selectTheme === "indiaTheme"
                  ? require("../../Assets/Icons/India_login_top.png")
                  : globalThis.selectTheme === "englandTheme"
                  ? require("../../Assets/Icons/England_login_top.png")
                  : globalThis.selectTheme === "newYear"
                  ? require("../../Assets/Icons/NewYearBird.png")
                  : globalThis.selectTheme === "mexicoTheme"
                  ? require("../../Assets/Icons/mexico_login_back.png")
                  : globalThis.selectTheme === "usindepTheme"
                  ? require("../../Assets/Icons/login_us_back.png")
                  : undefined
              }
              resizeMode={"contain"} // Update the path or use a URL
              style={{ height: "auto", width: windowWidth, marginTop: 0 }}
            >
              <View style={styles.logoView}>
                <Image
                  source={logoIcon().logoPng}
                  resizeMode="contain"
                  style={styles.logoImage}
                />
              </View>
            </ImageBackground>
            {/* **********   View for Sign Data   **********  */}

            {/* <ScrollView > */}
            <View style={styles.formContainer}>
              <View style={styles.signUpTextContainer}>
                <Text style={styles.signUpText}>{t("sign_up")}</Text>
              </View>
              <View style={styles.nameTextContainer}>
                <Text style={styles.nameText}>{t("name")}</Text>
              </View>
              <View style={styles.nameInputTextContainer}>
                <TextInput
                  style={styles.nameInputText}
                  maxLength={30}
                  placeholder={t("enter_your_name")}
                  placeholderTextColor={loginthemeModule().textColor}
                  defaultValue={userName}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(text) => {
                    if (text.length > 0) {
                      // Remove the leading '0' and update the state
                      setUserName(text.replace(/[^a-zA-Z0-9 ]/g, ""));
                    } else {
                      // If the input doesn't start with '0', apply the usual logic
                      setUserName(text.replace(/[^a-zA-Z0-9 ]/g, ""));
                    }

                    //setUserName(text)
                  }}
                />
              </View>

              <View style={styles.phTextContainer}>
                <Text style={styles.nameText}>{t("phone_number")}</Text>
                {/* **********   Phone Input View  **********  */}
                <PhoneInput
                  ref={phoneInput}
                  defaultValue={phoneNumber}
                  value={phoneNumber}
                  textInputStyle={{
                    fontFamily: font.semibold(),
                    fontSize: FontSize.font,
                    color: loginthemeModule().textColor,
                    backgroundColor: "red",
                  }}
                  defaultCode="US"
                  layout="first"
                  placeholder={t("phone_number")}
                  textInputProps={{
                    placeholderTextColor: loginthemeModule().textColor,
                    maxLength: 15,
                    defaultValue: phoneNumber,
                    value: phoneNumber,
                    style: {
                      fontFamily: font.semibold(),
                      fontSize: 15,
                      width: "100%",
                      color: loginthemeModule().textColor,
                    },
                  }}
                  codeTextStyle={styles.textInput}
                  containerStyle={styles.phoneContainer}
                  textContainerStyle={styles.textInput}
                  // onChangeFormattedText={(ref) => {}}
                  onChangeText={(inputValue) => {
                    // Check if the input starts with '0' and is not an empty string
                    if (inputValue.length > 0) {
                      // Remove the leading '0' and update the state
                      setphoneNumber(inputValue.replace(/[^0-9]/g, ""));
                    } else {
                      // If the input doesn't start with '0', apply the usual logic
                      setphoneNumber(inputValue.replace(/[^0-9]/g, ""));
                    }
                  }}
                  onChangeCountry={(value) => {
                    phoneCountryCodeSetter("+" + value.callingCode[0]);
                  }}
                />

                <Text style={styles.detailsText}>
                  {t("verify_your_number")}
                </Text>
                {/* **********   Submit Button  **********  */}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    // setCaptchaModel(true)
                    LoginButtonPress()
                  }
                >
                  <Text style={styles.buttonText}> {t("submit")}</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  position: "relative",
                  height: "50%",
                  width: windowWidth,
                  bottom: 0,
                  zIndex: 0,
                }}
              >
                <ImageBackground
                  source={
                    globalThis.selectTheme === "newYear"
                      ? require("../../Assets/Icons/NewYear_login_bottom.png")
                      : globalThis.selectTheme === "newYearTheme"
                      ? require("../../Assets/Icons/NewYearLoginBack.png")
                      : undefined
                  } // Update the path or use a URL
                  style={{
                    position: "relative",
                    height: "80%",
                    width: windowWidth,
                    bottom: 0,
                  }}
                ></ImageBackground>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {captchaModel && (
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          }}
        >
          <CaptchaModelShow
            // visible={captchaModel}
            // onRequestClose={() => setCaptchaModel(false)}

            cancel={() => setCaptchaModel(false)}
            captchaVerified={() => NavigateOTPScreen()}
          />
        </View>
      )}
    </View>
  );
}
