import { ImageBackground, StyleSheet, View } from "react-native";
import { t } from "i18next";
import DeviceInfo from "react-native-device-info";
import React, { useEffect, useRef, useState } from "react";

import WebView from "react-native-webview";
import { themeModule } from "../../../Components/Colors/Colors";
import { LoaderModel } from "../../Modals/LoaderModel";
import TopBar from "../../../Components/TopBar/TopBar";
import { chatTop, settingTop } from "../../../Navigation/Icons";
import { Dimensions } from "react-native";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
const isDarkMode = true;
const ChannelWebScreen = ({ navigation, route }) => {
  const isNotch = DeviceInfo.hasNotch();
  // const colorMode = useSelector((state) => state.ChatId.colorMode);
  const [isLoading, setIsLoading] = useState(true);
  const [webUrl, setWebUrl] = useState([]);

  useEffect(() => {
    if (route.params.webUrl != undefined && route.params.webUrl != null) {
      setWebUrl(route.params.webUrl);
    }
  }, []);

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
          title={""}
          backArrow={true}
          checked={
            //@ts-ignore
            globalThis.selectTheme
          }
          navState={navigation}
        />

        {
          //@ts-ignore
          globalThis.selectTheme === "christmas" || //@ts-ignore
          globalThis.selectTheme === "newYear" || //@ts-ignore
          globalThis.selectTheme === "newYearTheme" || //@ts-ignore
          globalThis.selectTheme === "mongoliaTheme" || //@ts-ignore
          globalThis.selectTheme === "indiaTheme" ||
          globalThis.selectTheme === "englandTheme" ||
          globalThis.selectTheme === "americaTheme" ||
          globalThis.selectTheme === "mexicoTheme" || //@ts-ignore
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
          containerStyle={{ backgroundColor: "#fff" }}
          showsVerticalScrollIndicator={false}
          source={{
            uri: route?.params?.webUrl,
          }}
          style={styles.chatContainer2}
        />
      </View>
    </MainComponent>
  );
};
export default ChannelWebScreen;
