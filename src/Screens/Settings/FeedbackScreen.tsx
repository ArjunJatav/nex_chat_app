import NetInfo from "@react-native-community/netinfo";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  iconTheme,
  searchBar,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { feedback } from "../../Constant/Api";
import { settingTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";
import { CaptchaModelShow } from "../Modals/CaptchaModel";

const isDarkMode = true;

  // eslint-disable-next-line
export default function FeedbackScreen({ navigation }: any) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderMoedl] = useState(false);
  const { t } = useTranslation();
  const [email, setEmail] = useState();
  const [para, setPara] = useState("");
  const Phone = globalThis.phone_number;
  const [captchaModel, setCaptchaModel] = useState(false);
    // eslint-disable-next-line
  const validateEmail = (email: any) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // **********   Login Button Method  ********** ///
  const feedbackApi = async () => {
    if (!email) {
      Alert.alert("", t("Enter_Your_Email"), [
        { text: t("ok") },
      ]);
    }
    else if (!validateEmail(email)) {
      Alert.alert(t("Invalid_Email"), t("enter_valid_email"), [
        { text: t("ok") },
      ]);
    } else if (para === "") {
      Alert.alert(t("feedback_required"), t("how_can_we_help"), [
        { text: t("ok") },
      ]);
    } else {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + globalThis.Authtoken,
        "localization":globalThis.selectLanguage,
      };
      const data = {
        name: globalThis.userName, 
        phone_number: globalThis.phone_number,
        email: email,
        message: para,
      };
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          Alert.alert(t("noInternet"), t("please_check_internet"));
          return;
        } else {
          setloaderMoedl(true);

          PostApiCall(
            feedback,
            data,
            headers,
            navigation,
            (ResponseData, ErrorStr) => {
              apiSuccess(ResponseData, ErrorStr);
            }
          );
        }
      });
    }
  };

  // **********  Method for return the get  api Response   ********** ///
    // eslint-disable-next-line
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);  
      setloaderMoedl(false);
    } else {
      Alert.alert(t("success"), ResponseData.message, [
        { text: t("ok"), onPress: () => navigation.navigate("BottomBar") },
      ]);
      setloaderMoedl(false);
    }
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },

    chatTopContainer: {
      backgroundColor: themeModule().theme_background,
      paddingBottom: 20,
    },

    chatContainer: {
      backgroundColor: "white",
      borderWidth: 10,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },

    modalText: {
      color: COLORS.black,
      fontSize: 20,
      alignSelf: "center",
      fontFamily:font.semibold()
    },
    textInput: {
      backgroundColor: searchBar().back_ground,
      borderWidth: 1,
      borderRadius: 10,
      marginHorizontal: 10,
      fontSize: FontSize.font,
      paddingLeft: 10,
      opacity: 0.8,
      marginTop: 20,
      color: COLORS.black,
      height: 48,
      fontFamily:font.semibold()
    },
    feedbackTextInput: {
      height: 150,
      backgroundColor: searchBar().back_ground,
      borderWidth: 1,
      borderRadius: 10,
      marginHorizontal: 10,
      paddingLeft: 10,
      opacity: 0.8,
      marginTop: 20,
      color: "#fff",
    },
    submiBtn: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: "#3aff13",
      width: "45%",
      justifyContent: "center",
      alignItems: "center",
    },
    button: {
      height: 50,
      marginTop: 50,
      borderRadius: 10,
      marginHorizontal: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().iconColor,
    },
    buttonText: {
      fontSize: FontSize.font,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
  });

  return (
    <View style={{flex:1}}>
          <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      {/* // **********  Status Bar    ********** // */}

      <LoaderModel visible={loaderModel} />
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        <TopBar
          showTitleForBack={true}
          title={t("feedback")}
          backArrow={true}
          checked={
            globalThis.selectTheme
          }
          navState={navigation}
        />
   
    {
            globalThis.selectTheme === "christmas" ||
            globalThis.selectTheme === "newYear" || 
            globalThis.selectTheme === "newYearTheme" || 
            globalThis.selectTheme === "mongoliaTheme" || 
            globalThis.selectTheme === "mexicoTheme" || 
            globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={settingTop().BackGroundImage}
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
          ) : null
        }
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>
      {/* // ********** View for Profile View    ********** // */}

      <View style={styles.chatContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
          behavior={Platform.OS == "android" ? "height" : "padding"}
          enabled
        >
          <ScrollView
            style={{
              height: "auto",
            }}
          >
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.modalText]}>{t("write_us_at")}</Text>
              <Text style={[styles.modalText, { fontSize: 18 }]}>
                support@deucetek.com
              </Text>
            </View>

            <TextInput
              placeholder={t("enter_your_name")}
              style={[styles.textInput, { textTransform: "capitalize" }]}
              placeholderTextColor="#959494"
              cursorColor="#fff"
              defaultValue={
                globalThis.userName
              }
              editable={false}
              selectTextOnFocus={false}
              onSubmitEditing={()=>Keyboard.dismiss()}

            />
            <TextInput
             // placeholder={t("enter_your_phone")}
              style={[styles.textInput]}
              keyboardType="numeric"
              placeholderTextColor="#959494" 
              defaultValue={globalThis.phone_number}
              value={Phone}
              editable={false}
              selectTextOnFocus={false}
              maxLength={16}
              cursorColor="#fff"
              onSubmitEditing={()=>Keyboard.dismiss()}

            />

            <TextInput
              placeholder={t("Enter_Your_Email")}
              style={[styles.textInput]}
              placeholderTextColor="#959494"
              cursorColor="#fff"
                // eslint-disable-next-line
              onChangeText={(value: any) => setEmail(value)}
              onSubmitEditing={()=>Keyboard.dismiss()}

            />

            <View style={[styles.feedbackTextInput]}>
              <TextInput
                placeholder={t("how_can_we_help")}
                cursorColor="#fff"
                defaultValue={para}
                multiline={true}
                returnKeyType="go"
                placeholderTextColor="#959494"
                blurOnSubmit={true}
                textAlignVertical="top"
                maxLength={200}
                style={{
                  fontSize: FontSize.font,
                  color: COLORS.black,
                  height: "100%",
                  fontFamily:font.semibold()
                }}
                onChangeText={(value) => setPara(value)}
                onSubmitEditing={()=>Keyboard.dismiss()}

              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCaptchaModel(true)}
            >
              <Text style={styles.buttonText}> {t("submit")}</Text>
            </TouchableOpacity>


          </ScrollView>
        </KeyboardAvoidingView>
      </View>
 
    </MainComponent>
    {captchaModel && (
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
           // flex:1,
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
            captchaVerified={() => feedbackApi()}
          />
        </View>
      )}

    </View>

  );
}
