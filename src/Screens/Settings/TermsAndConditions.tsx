import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DeviceInfo from "react-native-device-info";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { COLORS } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import { terms_and_condition } from "../../Constant/Api";
import { LoaderModel } from "../Modals/LoaderModel";
import { t } from "i18next";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";

const isDarkMode = true;

// eslint-disable-next-line
export default function TermsAndConditions({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderMoedl] = useState(false);
  const [content, setContent] = useState("");
  const [errorAlertModel, setErrorAlertModel] = useState(false);


  useEffect(() => {
    console.log("In terms and condition page")
    getTermsAndConditionApi();
    setloaderMoedl(true);
  }, []);

  // **********   Headers for Get Terms ANd Condition  ********** ///cd
  const getTermsAndConditionApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      terms_and_condition,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        profileApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get  api Response   ********** ///
  // eslint-disable-next-line
  const profileApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
       setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr; 
      setErrorAlertModel(true);
    } else {
      setContent(ResponseData.data.content);
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

    cancelText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },

    chatTopContainer: {
      backgroundColor: colorTheme ? COLORS.primary_blue_light : COLORS.yellow,
      paddingBottom: 20,
    },
    nameInputTextContainer: {
      marginRight: 16,
      marginLeft: 16,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },
    content: {
      color: "black",
      fontSize: 18,
      fontFamily: font.regular(),
      marginHorizontal: 10,
      marginTop: 20,
    },
  });

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={colorTheme ? COLORS.primary_blue_light : COLORS.yellow}
    >
      {/* // **********  Status Bar    ********** // */}
      <CustomStatusBar
        barStyle={isDarkMode ? "dark-content" : "dark-content"}
        backgroundColor={colorTheme ? COLORS.primary_blue_light : COLORS.yellow}
      />

      <LoaderModel visible={loaderModel} />
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />

      {/* // ********** Title Text   ********** // */}
      <TopBar
        showTitleForBack={true}
        title="Terms And Conditions"
        backArrow={true}
        navState={navigation}
        checked={ 
          globalThis.selectTheme
        }
      />

      <View style={styles.chatTopContainer}>
        <View style={styles.groupContainer}></View>
      </View>
      {/* // ********** View for Profile View    ********** // */}

      <View style={styles.chatContainer}>
        <ScrollView bounces={false}>
          <Text style={styles.content}>
            {content?.replace(/<[^>]*>/g, " ")}
          </Text>
        </ScrollView>
      </View>
    </MainComponent>
  );
}
