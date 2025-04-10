import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Text, View } from "react-native";
import { afterLogin, iconTheme } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";

const isDarkMode = true;

 // eslint-disable-next-line
export default function AfterLogin({ navigation }: any) {
  const { t } = useTranslation();

  // **********   Method for Navigation for Further screen  ********** ///
  const Navigation = async () => {
    const seenIntroScreen = await AsyncStorage.getItem("seenIntroScreen");
    console.log('seenIntroScreen=======',seenIntroScreen);
    

    setTimeout(() => {
      {
        seenIntroScreen
          ? navigation.reset({
              index: 0,
              routes: [
                {
                  name: "BottomBar",
                },
              ],
            })
          : navigation.push("BottomBar");
      }
    }, 3000);
  };

  useEffect(() => {
    Navigation();
  }, []);

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={afterLogin().back_ground}
    >
      {/* **********   StausBar    **********  */}

      {Platform.OS == "android" ? (
        <CustomStatusBar
          barStyle={isDarkMode ? "dark-content" : "dark-content"}
          backgroundColor={afterLogin().back_ground}
        />
      ) : null}

      {/* **********   View For Showing the Text     **********  */}
      <View
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: afterLogin().back_ground,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: iconTheme().textColorForNew,
            fontSize: FontSize.font,
            textAlign: "center",
            fontFamily: font.bold(),
          }}
        >
          {t("welcome_msg")}
        </Text>
      </View>
    </MainComponent>
  );
}
