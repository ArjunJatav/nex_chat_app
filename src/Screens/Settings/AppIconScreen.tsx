import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
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
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { changeIcon, getIcon } from "react-native-change-icon";
import FastImage from "react-native-fast-image";

import { showToast } from "../../Components/CustomToast/Action";
import { useSelector } from "react-redux";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";

import logo_1 from "../../Assets/Logo/logo_1.png";
import logo_2 from "../../Assets/Logo/logo_2.png";
import logo_3 from "../../Assets/Logo/logo_3.png";
import logo_4 from "../../Assets/Logo/logo_4.png";
import logo_5 from "../../Assets/Logo/logo_5.png";
import logo_6 from "../../Assets/Logo/logo_6.png";
import logo_7 from "../../Assets/Logo/logo_7.png";
import logo_8 from "../../Assets/Logo/logo_8.png";
import logo_9 from "../../Assets/Logo/logo_9.png";
import logo_10 from "../../Assets/Logo/logo_10.png";
import logo_11 from "../../Assets/Logo/logo_11.png";
import logo_12 from "../../Assets/Logo/logo_12.png";
import logo_13 from "../../Assets/Logo/logo_13.png";
import logo_14 from "../../Assets/Logo/logo_14.png";
import logo_15 from "../../Assets/Logo/logo_15.png";
import logo_16 from "../../Assets/Logo/logo_16.png";
import logo_17 from "../../Assets/Logo/logo_17.png";

const appIconList = [
  {
    id: 1,
    label: "logo_1",
    img: logo_1,
    bg: COLORS.purple,
    name: "Default",
  },

  {
    id: 3,
    label: "logo_3",
    img: logo_3,
    bg: COLORS.dark_pink,
    name: "Neon 1",
  },
  {
    id: 4,
    label: "logo_4",
    img: logo_4,
    bg: COLORS.newYear_theme,
    name: "Neon 2",
  },
  {
    id: 5,
    label: "logo_5",
    img: logo_5,
    bg: COLORS.primary_light_green,
    name: "Classic",
  },
  {
    id: 6,
    label: "logo_6",
    img: logo_6,
    bg: "#CE9D59",
    name: "Gradient",
  },
  {
    id: 7,
    label: "logo_7",
    img: logo_7,
    bg: "#8D3E2D",
    name: "Classic 2",
  },
  {
    id: 8,
    label: "logo_8",
    img: logo_8,
    bg: "#076D4A",
    name: "Framed",
  },

  {
    id: 12,
    label: "logo_12",
    img: logo_12,
    bg: "#BC003C",
    name: "Boxed",
  },

  {
    id: 15,
    label: "logo_15",
    img: logo_15,
    bg: "#BC003C",
    name: "Classic 3",
  },
  {
    id: 16,
    label: "logo_16",
    img: logo_16,
    bg: "#BC003C",
    name: "Yokee 3",
  },
  {
    id: 2,
    label: "logo_2",
    img: logo_2,
    bg: COLORS.primary_blue,
    name: "Obsidian",
  },
  {
    id: 9,
    label: "logo_9",
    img: logo_9,
    bg: "#BC003C",
    name: "Blanco",
  },
  {
    id: 10,
    label: "logo_10",
    img: logo_10,
    bg: "#BC003C",
    name: "Yokee 1",
  },
  {
    id: 11,
    label: "logo_11",
    img: logo_11,
    bg: "#BC003C",
    name: "Toby",
  },
  {
    id: 13,
    label: "logo_13",
    img: logo_13,
    bg: "#BC003C",
    name: "Yokee 2",
  },
  {
    id: 14,
    label: "logo_14",
    img: logo_14,
    bg: "#BC003C",
    name: "Nox 1",
  },

  {
    id: 17,
    label: "logo_17",
    img: logo_17,
    bg: "#BC003C",
    name: "Stellae",
  },
];

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const AppIconScreen = ({ navigation, route }: any) => {
  const isDarkMode = true;
  const { t, i18n } = useTranslation();
  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );
  const [activeLogo, setActiveLogo] = useState("logo_1");
  const [currentIcon, setCurrentIcon] = useState("");
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

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
      height: windowHeight - 30,
    },

    recentStatusContainer: {
      justifyContent: "space-between",
      margin: 0,
      flexDirection: "row",
      width: "100%",
      borderBottomColor: COLORS.grey,
      borderBottomWidth: 0.2,
      paddingBottom: 10,
    },

    timeContainer: {
      margin: 0,
      // width: "65%",
      flexDirection: "row",
    },

    Container: {
      justifyContent: "center",
      margin: 5,
      marginLeft: 0,
      width: "10%",
    },

    recentStory: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },

    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },

    name1Text: {
      fontSize: DeviceInfo.isTablet() ? 20 : 15,
      fontFamily: font.semibold(),
      paddingLeft: 10,
      color: COLORS.black,
    },
    naContainer: {
      justifyContent: "center",
      width: "60%",
      flexDirection: "column",
    },
    name2Text: {
      fontSize: DeviceInfo.isTablet() ? 18 : 13,
      fontFamily: font.regular(),
      color: COLORS.grey,
      paddingLeft: 10,
    },
    timeText: {
      fontSize: DeviceInfo.isTablet() ? 18 : 13,
      fontFamily: font.regular(),
      color: COLORS.black,
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },

    timetextContainer: {
      borderColor: "transparent",
      width: "20%",
      justifyContent: "center",
    },
    NoDataContainer: {
      height: windowHeight - 80,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    noDataText: {
      color: textTheme().textColor,
      fontSize: 18,
      fontFamily: font.bold(),
      fontWeight: "500",
    },
    safeAreaContainer: {
      flex: 1,
      width: "100%",
    },
    rootContainer: {
      //  flex: 1,
      // width: "100%",
      // backgroundColor: "#fafafa",
      // padding: 8,
    },
    cellContainer: {
      flexDirection: "column",
      width: "33%",
      //  backgroundColor:"red",
      // backgroundColor: '#EEEDE7',
      //   elevation: 5,
      marginVertical: 10,
      padding: 6,
    },
    logoContainer: {
      height: 60,
      width: 60,
      resizeMode: "contain",
      borderRadius: 5,
      // padding:5
    },
    labelContainer: {
      flex: 1,
      justifyContent: "center",
      marginTop: 5,
    },
    labelText: {
      fontSize: 12,
      fontFamily: font.bold(),
    },
    radioButtonSection: {
      alignItems: "center",
      justifyContent: "center",
      marginRight: 6,
    },
    radioButtonOuterContainer: {
      height: 20,
      width: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#656565",
      alignItems: "center",
      justifyContent: "center",
    },
    radioButtonInnerContainer: {
      height: 12,
      width: 12,
      borderRadius: 6,
    },
    buttonContainer: {
      marginTop: "20%",
      height: 45,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ae3251",
      elevation: 5,
    },
    buttonLabel: {
      color: "#fff",
      fontWeight: "bold",
    },
    button: {
      height: 50,
      marginTop: "20%",
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,

      // paddingBottom:500,
    },
    buttonText: {
      fontSize: 20,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
  });

  const paidIcons = [
    "logo_2",
    "logo_9",
    "logo_10",
    "logo_11",
    "logo_13",
    "logo_14",
    "logo_17",
  ];

  const onSelectLogo = async () => {
    if (paidIcons.includes(activeLogo) && !userPremium) {
      setShowPremiumAlert(true);
    } else {
      try {
        const response = await changeIcon(activeLogo);
        showToast(t("Icon_changed_successfully"));
        setCurrentIcon(activeLogo); // Update currentIcon to reflect the new active logo
      } catch (error) {
        console.error("Error changing icon:", error);
      }
    }
  };

  useEffect(() => {
    const getCurrentIcon = async () => {
      const currentIcon = await getIcon();
      console.log("currentIcon>>>>>>", currentIcon);

      setActiveLogo(
        currentIcon === "default" || currentIcon === "Default"
          ? "logo_1"
          : currentIcon
      );
      setCurrentIcon(
        currentIcon === "default" || currentIcon === "Default"
          ? "logo_1"
          : currentIcon
      );
    };
    getCurrentIcon();
  }, [currentIcon]);

  const renderCell = useCallback(
    (item, index) => {
      return (
        <TouchableOpacity
          key={index}
          activeOpacity={0.8}
          style={[
            styles.cellContainer,
            { justifyContent: "center", alignItems: "center" },
          ]}
          onPress={() => setActiveLogo(item?.label)}
        >
          <View
            style={{
              backgroundColor:
                item?.label === activeLogo ? "green" : "transparent",
              padding: 3,
              borderRadius: 5,
            }}
          >
            <View>
              <FastImage
                source={item.img}
                style={styles.logoContainer}
                resizeMode={FastImage.resizeMode.contain}
              />
              {paidIcons.includes(item?.label) && (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    backgroundColor: "green",
                    borderRadius: 15,
                    borderWidth: 2,
                    borderColor: COLORS.white,
                    height: 25,
                    width: 25,
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={
                      paidIcons
                        ? require("../../Assets/Icons/bx_star_border.png") // Star icon for paid logos
                        : null // Check icon for free logos
                    }
                    style={{
                      width: 20,
                      height: 20,
                      alignSelf: "center",
                      tintColor: COLORS.white,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}

              {item?.label === activeLogo && (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    backgroundColor: "green",
                    borderRadius: 15,
                    borderWidth: 2,
                    borderColor: COLORS.white,
                    height: 25,
                    width: 25,
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={
                      paidIcons.includes(activeLogo)
                        ? require("../../Assets/Icons/bx_star_border.png") // Star icon for paid logos
                        : require("../../Assets/Icons/bx_check.png") // Check icon for free logos
                    }
                    style={{
                      width: 20,
                      height: 20,
                      alignSelf: "center",
                      tintColor: COLORS.white,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.labelText,
                {
                  fontFamily:
                    item?.label === activeLogo ? font.bold() : font.medium(),
                },
              ]}
            >
              {item?.name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [activeLogo] // Dependencies array
  );

  let HeadingText = t("You_cant_change_app_icon");
  let SubHeading = t("you_have_to_upgrade_your_plan");

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      {/* // **********  Status Bar    ********** // */}

      <PremiumAlert
        visible={showPremiumAlert}
        onRequestClose={() => setShowPremiumAlert(false)}
        cancel={() => setShowPremiumAlert(false)}
        Heading={HeadingText}
        SubHeading={SubHeading}
        FirstButton={"Ok"}
        SecondButton={"Go To Premium"}
        firstButtonClick={() => setShowPremiumAlert(false)}
        secondButtonClick={() => {
          setShowPremiumAlert(false);
          navigation.navigate("PremiumFeaturesScreen");
        }}
      />
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
          title={t("app_icon")}
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
              resizeMode="cover"
              style={{
                height: "100%",
                width: windowWidth,
                marginTop: 0,
                position: "absolute",
                bottom: 0,
                zIndex: 0,
                top: chatTop().top,
              }}
            ></ImageBackground>
          ) : null
        }

        <View style={styles.chatTopContainer}></View>
        <View style={styles.groupContainer}></View>
      </View>
      {/* // ********** View for Profile View    ********** // */}

      <View style={styles.chatContainer}>
        {/* <View style={styles.rootContainer}> */}
        {appIconList.length > 0 ? (
          <FlatList
            data={appIconList}
            numColumns={3}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            windowSize={20}
            maxToRenderPerBatch={20}
            removeClippedSubviews={true}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => renderCell(item, index)}
            contentContainerStyle={{ paddingBottom: 200 }}
          />
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}

        {/* </View> */}
        {activeLogo != currentIcon && (
          <View
            style={{
              paddingHorizontal: 30,
              alignSelf: "center",
              position: "absolute",
              width: windowWidth,
              bottom: Platform.OS === "ios" ? 180 : 50,
              height: Platform.OS === "ios" ? 60 : 130,
            }}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                activeLogo !== currentIcon ? onSelectLogo() : null
              }
            >
              <Text style={styles.buttonText}>
                {activeLogo === currentIcon
                  ? t("Applied")
                  : t("Set_as_app_icon")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </MainComponent>
  );
};

export default AppIconScreen;
