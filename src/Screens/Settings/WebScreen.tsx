import { t } from "i18next";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { WebView } from "react-native-webview";
import { themeModule } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";

const isDarkMode = true;

// eslint-disable-next-line
export default function WebScreen({ navigation, route }: any) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderMoedl] = useState(false);
  const INJECTED_JAVASCRIPT = `(function() {
        const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);
      })();`;

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

    chatContainer2: {
      width: windowWidth - 7,
      flexGrow: 1,
      marginTop: Platform.OS == "ios" ? 0 : 35,
      backgroundColor: "#fff",
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
  });

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
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
          title={
            route.params.pageName == "Privacy Policy"
              ? t("privacy_policy")
              : t("terms_and_condition")
          }
          backArrow={true}
          navState={navigation}
          checked={
            globalThis.selectTheme
          }
        />

        {
          globalThis.selectTheme === "christmas" || 
          globalThis.selectTheme === "newYear" || 
          globalThis.selectTheme === "newYearTheme" || 
          globalThis.selectTheme === "mongoliaTheme" || 
          globalThis.selectTheme === "mexicoTheme" || 
          globalThis.selectTheme === "indiaTheme" ||
          globalThis.selectTheme === "englandTheme" ||
          globalThis.selectTheme === "americaTheme" ||
          globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={settingTop().BackGroundImage}
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
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>
      {/* // ********** View for Profile View    ********** // */}

      <View style={styles.chatContainer}>
        <WebView
          onLoadStart={() => setloaderMoedl(true)}
          onLoadEnd={() => setloaderMoedl(false)}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          scalesPageToFit={false}
          containerStyle={{ backgroundColor: "#fff",paddingBottom:100 }}
          showsVerticalScrollIndicator={false}
          source={{
            uri: route.params.pageUrl,
          }}
          style={styles.chatContainer2}
        />
      </View>
    </MainComponent>
  );
}
