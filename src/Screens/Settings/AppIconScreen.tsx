import NetInfo from "@react-native-community/netinfo";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
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
import { settingTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";
import { changeIcon, getIcon } from "react-native-change-icon";

const isDarkMode = true;
import purple_logo from "../../Assets/Logo/purple_app_icon.png";
import blue_logo from "../../Assets/Logo/blue_app_icon.png";
import pink_logo from "../../Assets/Logo/pink_app_icon.png";
import new_year_logo from "../../Assets/Logo/new_year_app_icon.png";
import christmas_logo from "../../Assets/Logo/christmas_app_icon.png";
import halloween_logo from "../../Assets/Logo/halloween_app_icon.png";
import mangolia_logo from "../../Assets/Logo/mangolia_app_icon.png";
import mexico_logo from "../../Assets/Logo/mexico_app_icon.png";
import us_logo from "../../Assets/Logo/us_app_icon.png";

import { showToast } from "../../Components/CustomToast/Action";

const appIconList = [
  {
    id: 1,
    label: "purple_logo",
    img: purple_logo,
    bg: COLORS.purple,
    name: "Purple Theme",
  },
  {
    id: 2,
    label: "blue_logo",
    img: blue_logo,
    bg: COLORS.primary_blue,
    name: "Blue Theme",
  },
  {
    id: 3,
    label: "pink_logo",
    img: pink_logo,
    bg:  COLORS.dark_pink,
    name: "Pink Theme",
  },
  {
    id: 4,
    label: "new_year_logo",
    img: new_year_logo,
    bg: COLORS.newYear_theme,
    name: "New Year",
  },
  {
    id: 5,
    label: "christmas_logo",
    img: christmas_logo,
    bg:COLORS.primary_light_green,
    name: "Christmas",
  },
  {
    id: 6,
    label: "halloween_logo",
    img: halloween_logo,
    bg:"#CE9D59",
    name: "Halloween",
  },
  {
    id: 7,
    label: "mangolia_logo",
    img: mangolia_logo,
    bg:  "#8D3E2D",
    name: "Mongolia",
  },
  {
    id: 8,
    label: "mexico_logo",
    img: mexico_logo,
    bg: "#076D4A",
    name: "Mexico",
  },
  {
    id: 9,
    label: "us_logo",
    img: us_logo,
    bg:  "#BC003C",
    name: "USA",
  },
];
export default function AppIconScreen({ navigation, route }: any) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderMoedl] = useState(false);
  const { t, i18n } = useTranslation();

  const [activeLogo, setActiveLogo] = useState("logo_1");
  const [currentIcon, setCurrentIcon] = useState("");

  const onSelectLogo = async () => {
    try {
      const response = await changeIcon(activeLogo);
      showToast(t("Icon changed successfully"));
      setCurrentIcon(activeLogo); // Update currentIcon to reflect the new active logo
      console.log("Icon changed successfully:", response);
    } catch (error) {
      console.error("Error changing icon:", error);
    }
  };

  useEffect(() => {
    const getCurrentIcon = async () => {
      // if (Platform.OS === "ios") {
      //   setActiveLogo("purple_logo");
      //   setCurrentIcon("purple_logo");
      //   return;
      // }
      const currentIcon = await getIcon();
      console.log("currentIcon>>>>>>",currentIcon);
      
      setActiveLogo(currentIcon === "default" || "Default" ? "purple_logo" : currentIcon);
      setCurrentIcon(currentIcon === "default"  || "Default" ? "purple_logo" : currentIcon);
    };
    getCurrentIcon();
  }, []);

  const renderCell = (item, index) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.cellContainer,
            { justifyContent:"center", alignItems:"center"},

        ]}
        onPress={() => setActiveLogo(item?.label)}
      >
        <View
          style={{ backgroundColor:item?.label === activeLogo ? item.bg :COLORS.white, padding: 3, borderRadius: 5 }}
        >
          <Image source={item?.img} style={styles.logoContainer} />
        </View>
        <View style={styles.labelContainer}>
          <Text style={[styles.labelText,{ fontFamily:item?.label === activeLogo ?  font.bold() : font.medium(),}]}>{item?.name}</Text>
        </View>
        
      </TouchableOpacity>
    );
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
      width: "100%",
      backgroundColor: "#fafafa",
      padding: 8,
    },
    cellContainer: {
      flexDirection: "column",
      width:"33%",
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
      borderRadius:5
      // padding:5
    },
    labelContainer: {
      flex: 1,
      justifyContent: "center",
     marginTop:5,
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
    },
    buttonText: {
      fontSize: 20,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
  });

  return (
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
          title={t("App Icon")}
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
              }}
            ></ImageBackground>
          ) : null
        }
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>
      {/* // ********** View for Profile View    ********** // */}

      <View style={styles.chatContainer}>
        <View style={styles.rootContainer}>
          <FlatList
            data={appIconList}
            numColumns={3}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => renderCell(item, index)}
          />
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: activeLogo === currentIcon ? COLORS.grey : iconTheme().textColorForNew,
              },
            ]}
            onPress={activeLogo !== currentIcon ? onSelectLogo : null}
            activeOpacity={activeLogo !== currentIcon ? 0.7 : 1}
          >
            <Text style={styles.buttonText}>
              {activeLogo === currentIcon ? t("Applied") : t("Set as app icon")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </MainComponent>
  );
}
