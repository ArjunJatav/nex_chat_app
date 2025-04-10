import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  iconTheme,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import {  settingTop } from "../../Navigation/Icons";
import { font } from "../../Components/Fonts/Font";
import { t } from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isDarkMode = true;


// eslint-disable-next-line
export default function FontSettingScreen({ navigation }: any) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [selectedFont, setSelectedFont] = useState(globalThis.checkBoxPressed);

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
      paddingHorizontal: 10,
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },

    Container: {
      justifyContent: "center",
      margin: 5,
      marginLeft: 0,
      width: "10%",
    },

    fontFamily: {
      color: COLORS.black,
      fontSize: 18,
      fontFamily: font.semibold(),
      marginTop: 10,
    },
    outerCheckBox: {
      borderColor: textTheme().textColor,
      borderRadius: 25,
      borderWidth: 2,
      padding: 3,
      width: 25,
      marginTop: 5,
    },
    fontNameText: {
      color: COLORS.black,
      fontSize: 18,
      fontFamily: font.regular(),
    },
    checkBoxInner: {
      borderRadius: 25,
      height: 15,
      width: 15,
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
    textleftContainer: {
      flexDirection: "row",
      marginTop: 20,
      alignItems: "center",
      height: 60,
      backgroundColor: themeModule().theme_background,
      borderBottomLeftRadius: 15,
      borderTopRightRadius: 15,
      width: "85%",
      alignSelf: "flex-end",
    },
    textRightContainer: {
      flexDirection: "row",
      marginTop: 20,
      alignItems: "center",
      height: 60,
      backgroundColor: themeModule().theme_background,
      borderTopLeftRadius: 15,
      borderBottomRightRadius: 15,
      width: "85%",
      alignSelf: "flex-start",
    },
  });
  // eslint-disable-next-line
  const boxPressed = async (value: any) => {
    setSelectedFont(value);
    globalThis.checkBoxPressed = value;
    await AsyncStorage.setItem("selectFontStyle", value);
  };

  const applyFontstyle = async () => {
    const selectFontStyle = await AsyncStorage.getItem("fontStyleSet");
    if (selectFontStyle === globalThis.checkBoxPressed) {
      boxPressed(selectFontStyle);
      globalThis.checkBoxPressed == selectFontStyle;
      navigation.pop()
    
    } else{
      Alert.alert(t("confirm"), t("change_app_font_style"), [
        {
          text: t("cancel"),
    
          onPress: async () => {
           
            globalThis.checkBoxPressed = selectFontStyle
            navigation.pop()

          }
        },
        {
          text: t("yes"),
          onPress: async () => {
            AsyncStorage.setItem("fontStyleSet", globalThis.checkBoxPressed);
          //  navigation.goBack();
            await navigation.reset({
              index: 0,
              routes: [
                {
                  name: "BottomBar",
                },
              ],
            });
          },
        },
      ]);

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
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        <TopBar
          showTitleForBack={true}
          title={t("Font_Settings")}
          goBack={true}
          checked={
            globalThis.selectTheme
          }
          navState={navigation}
          clickGoBack={applyFontstyle}
        />
        {
          globalThis.selectTheme === "christmas" || 
          globalThis.selectTheme === "newYear" || 
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
              }}
            ></ImageBackground>
          ) : null
        }
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>
      {/* // ********** View for Profile View    ********** // */}

      <View style={styles.chatContainer}>
        <Text style={styles.fontFamily}>{t("Font_Style")}</Text>

        <View
          style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}
        >
          <View style={{ width: "10%" }}>
            <TouchableOpacity
              style={styles.outerCheckBox}
              onPress={() => {
                boxPressed("Dancing Script");
              }}
            >
              <View
                style={[
                  styles.checkBoxInner,
                  {
                    backgroundColor:
                      selectedFont == "Dancing Script"
                        ? textTheme().textColor
                        : COLORS.white,
                  },
                ]}
              ></View>
            </TouchableOpacity>
          </View>
          <Text style={styles.fontNameText}>{t("dancing_Script")}</Text>
        </View>
        <View
          style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}
        >
          <View style={{ width: "10%" }}>
            <TouchableOpacity
              style={styles.outerCheckBox}
              onPress={() => {
                boxPressed("Skateboarder");
              }}
            >
              <View
                style={[
                  styles.checkBoxInner,
                  {
                    backgroundColor:
                      selectedFont == "Skateboarder"
                        ? textTheme().textColor
                        : COLORS.white,
                  },
                ]}
              ></View>
            </TouchableOpacity>
          </View>
          <Text style={styles.fontNameText}>{t("Skateboarder")}</Text>
        </View>
        <View
          style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}
        >
          <View style={{ width: "10%" }}>
            <TouchableOpacity
              style={styles.outerCheckBox}
              onPress={() => {
                boxPressed("Simple");
              }}
            >
              <View
                style={[
                  styles.checkBoxInner,
                  {
                    backgroundColor:
                      selectedFont == "Simple"
                        ? textTheme().textColor
                        : COLORS.white,
                  },
                ]}
              ></View>
            </TouchableOpacity>
          </View>
          <Text style={styles.fontNameText}>{t("normal")}</Text>
        </View>
        <View
          style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}
        >
          <View style={{ width: "10%" }}>
            <TouchableOpacity
              style={styles.outerCheckBox}
              onPress={() => {
                boxPressed("FeltCondolences");
              }}
            >
              <View
                style={[
                  styles.checkBoxInner,
                  {
                    backgroundColor:
                      selectedFont == "FeltCondolences"
                        ? textTheme().textColor
                        : COLORS.white,
                  },
                ]}
              ></View>
            </TouchableOpacity>
          </View>
          <Text style={styles.fontNameText}>{t("FeltCondolences")}</Text>
        </View>
        <View style={styles.textleftContainer}>
          <Text
            style={{
              color: COLORS.black,
              fontSize: 18,
              fontFamily: font.regular(),
              paddingHorizontal: 10,
            }}
          >
            {t("This_is_font_style_text.")}
          </Text>
        </View>

        {/* <View style={styles.textRightContainer}>
          <Text
            style={{
              color: COLORS.black,
              fontSize: 18,
              fontFamily: font.regular(),
              paddingHorizontal: 10,
            }}
          >
            {t("This_is_font_style_text.")}
          </Text>
        </View> */}
        <View style={styles.applyButton}>
          <TouchableOpacity
            style={styles.applyButtonStyle}
            onPress={() => applyFontstyle()}
          >
            <Text style={styles.applyText}>{t("apply")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MainComponent>
  );
}
