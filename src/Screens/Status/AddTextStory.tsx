import NetInfo from "@react-native-community/netinfo";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { COLORS, textTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import { add_story, get_story_count } from "../../Constant/Api";
import { LoaderModel } from "../Modals/LoaderModel";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { useSelector } from "react-redux";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
let premiumAlertHeading = "";
let premiumAlertSubHeading = "";
let premiumAlertFirstButtonText = "";
let premiumAlertSecondButtonText = "";

// eslint-disable-next-line
export default function AddTextStatusScreen({ navigation }: any) {
  const [text, setText] = useState("");
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);

  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );
  const [isColorPickerVisible, setColorPickerVisible] = useState(false);
  const { t } = useTranslation();
  const bgColor = [
    { backgroundColor: "#F6EB7A" },
    { backgroundColor: "#19B043" },
    { backgroundColor: "#EC4E4E" },
    { backgroundColor: "#5652EF" },
    { backgroundColor: "#FFFFFF" },
  ];
  const openColorModel = () => {
    if (!isColorPickerVisible) {
      setColorPickerVisible(true);
    } else {
      if (current < 4) {
        setCurrent(current + 1);
      } else if (current === 4) {
        setCurrent(0);
      } else {
        setColorPickerVisible(false);
      }
    }
  };

  // **********   Headers for api ********** ///
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
  };

  // **********   Data for api ********** ///
  const data = {
    background_color: bgColor[current].backgroundColor,
    title: text,
    file_type: "template",
  };

  // **********   Add story api  ********** ///
  const addStoryApi = () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
        return;
      } else {
        setloaderMoedl(true);
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.Authtoken,
          localization: globalThis.selectLanguage,
        };
        GetApiCall(
          get_story_count,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            countApiSuccess(ResponseData, ErrorStr);
          }
        );
        // PostApiCall(
        //   add_story,
        //   data,
        //   headers,
        //   navigation,
        //   (ResponseData, ErrorStr) => {
        //     apiSuccess(ResponseData, ErrorStr);
        //   }
        // );
      }
    });
  };
  // **********   Method for Navigation for Further screen  ********** ///
  // eslint-disable-next-line
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    console.log("story ppost api response", ResponseData);
    if (ErrorStr) {
      globalThis.errorMessage = ErrorStr;
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      setErrorAlertModel(true);
    } else {
      setloaderMoedl(false);
      setSuccessAlertModel(true);
      // Alert.alert(t("success"), t("story_has_posted"), [
      //   {
      //     text: t("ok"),
      //     onPress: () =>
      //       navigation.navigate("BottomBar", { screen: "chatScreen" }),
      //   },
      // ]);
    }
  };

  // eslint-disable-next-line
  const countApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr; 
      setErrorAlertModel(true);
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
     
    } else {
      console.log("count api response >>>>", ResponseData);
      if (userPremium) {
        PostApiCall(
          add_story,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
        
            console.log("story ppost api response", ResponseData);
         
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      } else {
        if (
          ResponseData?.data?.total_stories == 30 ||
          ResponseData?.data?.total_stories > 30
        ) {
          premiumAlertHeading = t("You_can_add_a_maximum_o_stories");
          premiumAlertSubHeading = t(
            "Upgrade_to_Premium_for_unlimited_stories"
          );
          premiumAlertFirstButtonText = "Continue with Free Plan";
          premiumAlertSecondButtonText = "Go To Premium";
          setShowPremiumAlert(true);
          //  Alert.alert("Oops!","You have exceed your stories limit.")
        } else {
          PostApiCall(
            add_story,
            data,
            headers,
            navigation,
            (ResponseData, ErrorStr) => {
              console.log("story ppost api response", ResponseData);
              apiSuccess(ResponseData, ErrorStr);
            }
          );
        }
      }
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    input: {
      flex: 1,
      fontSize: 20,
      color: COLORS.black,
      width: "85%",
      marginTop: Platform.OS == "android" ? 0 : "50%",
      fontFamily: font.bold(),
      textAlign: "center",
      justifyContent: "center",
    },

    header: {
      flexDirection: "row",
      width: "90%",
      alignSelf: "center",
      justifyContent: "space-between",
      paddingTop: 50,
    },
    cancel_button: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
      padding: 7,
      backgroundColor: "#FCF1FF",
    },
    cancelText: {
      color: COLORS.grey,
      fontSize: 18,
      fontFamily: font.semibold(),
    },
    colorPickerModal: {
      flex: 1,
      position: "absolute",
      right: 10,
      top: 100,
    },
    colorOption: {
      width: 30,
      height: 30,
      borderRadius: 20,
      margin: 10,
      borderColor: "white",
      borderWidth: 2,
    },
  });
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ height: "100%" }}
    >
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

      <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={t("story_has_posted")}
        doneButton={() => {
          setSuccessAlertModel(false),
            navigation.navigate("BottomBar", { screen: "chatScreen" });
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
      <StatusBar translucent backgroundColor="transparent" />
      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, bgColor[current]]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("BottomBar", { screen: "chatScreen" })
              }
            >
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>

            {isColorPickerVisible ? (
              <TouchableOpacity
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={() => setColorPickerVisible(false)}
              >
                <Image
                  source={require("../../Assets/Icons/Cross.png")}
                  style={{ height: 25, width: 25 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={() => openColorModel()}
              >
                <Image
                  source={require("../../Assets/Icons/color_pt.png")}
                  style={{ height: 25, width: 25 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            value={text}
            onChangeText={(text) => setText(text)}
            placeholder={t("share_your_thoughts")}
            multiline={true}
            style={styles.input}
            placeholderTextColor={COLORS.grey}
            autoFocus={true}
            maxLength={250}
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          {text.length > 0 ? (
            <View
              style={{
                position: "absolute",
                bottom: 10,
                right: 18,
              }}
            >
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: textTheme().textColor,
                  paddingVertical: 8,
                  paddingHorizontal: 25,
                  borderRadius: 10,
                  bottom: 60,
                }}
                onPress={() => addStoryApi()}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {t("done")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>

      {isColorPickerVisible ? (
        <View style={[styles.colorPickerModal]}>
          {bgColor.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.colorOption, color]}
              onPress={() => {
                setCurrent(index);
                setColorPickerVisible(false);
              }}
            />
          ))}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
