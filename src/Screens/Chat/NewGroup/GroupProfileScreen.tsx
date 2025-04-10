import React, { useContext, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MainComponent from "../../../Components/MainComponent/MainComponent";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";

import { StatusBar } from "react-native";
import DeviceInfo from "react-native-device-info";
import { COLORS, themeModule } from "../../../Components/Colors/Colors";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
import { t } from "i18next";
const isDarkMode = true;

export default function GroupPeofileScreen({ props, navigation, route }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [checked, setChecked] = useState("first");

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
    },

    nText: {
      color: COLORS.black,
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
      marginBottom: 10,
    },
    statusText: {
      color: COLORS.black,
      fontSize: DeviceInfo.isTablet() ? 16 : 12,
      fontFamily: font.medium(),
    },
    sText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      fontSize: FontSize.font,
      fontFamily: font.bold(),
      marginLeft: 10,
    },
    reportText: {
      color: "red",
      fontSize: FontSize.font,
      fontFamily: font.bold(),
      marginLeft: 10,
    },

    themeTopContainer: {
      height: DeviceInfo.hasNotch() == true ? "30%" : "30%",
      width: "100%",
    },

    themeContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height:
        DeviceInfo.hasNotch() == true ? windowHeight - 10 : windowHeight - 10,
    },
    chooseContainer: {
      justifyContent: "center",
      margin: 5,
      marginTop: 10,
      flexDirection: "column",
    },
    Container: {
      alignItems: "center",
      margin: 5,
      marginTop: 20,
      flexDirection: "row",
    },
    reportContainer: {
      alignItems: "center",
      margin: 5,
      marginTop: 20,
      flexDirection: "row",
    },
    circleImageLayout: {
      width: DeviceInfo.isTablet() ? 32 : 25,
      height: DeviceInfo.isTablet() ? 32 : 25,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    circleImageLayout1: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },

    reportImageLayout: {
      width: DeviceInfo.isTablet() ? 30 : 25,
      height: DeviceInfo.isTablet() ? 30 : 25,
      tintColor: "red",
    },
    plusImageContainer: {
      position: "absolute",
      top: DeviceInfo.hasNotch() == true ? 20 : 40,
      height: 25,
      width: 25,
    },
    plusImageContainer1: {
      position: "absolute",
      top: DeviceInfo.hasNotch() == true ? 20 : 40,
      right: 20,
      borderRadius: 20,
      height: DeviceInfo.isTablet() ? 32 : 25,
      width: DeviceInfo.isTablet() ? 40 : 30,
      alignItems: "center",
      justifyContent: "center",
    },
    contactContainer: {
      position: "absolute",
      flexDirection: "row",
      bottom: 10,
      borderRadius: 20,
      height: 100,
      width: "100%",
    },
    plusImage1Layout: {
      width: 20,
      height: 20,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    backArrowContainer: {
      position: "absolute",
      left: 16,
      borderRadius: 5,
      width: "100%",
      alignItems: "center",
      justifyContent: "space-around",
      flexDirection: "row",
      backgroundColor:themeModule().premiumBackIcon,
    },
    contact2Container: {
      position: "absolute",
      borderRadius: 5,
      paddingHorizontal: 10,
      width: "100%",
      alignItems: "center",
      justifyContent: "space-around",
      flexDirection: "row",
    },
    backIcon: {
      height: 25,
      width: 25,
      tintColor: colorTheme ? COLORS.white : COLORS.white,
    },
    nameInviteContainer: {
      justifyContent: "center",
      width: "70%",
      flexDirection: "column",
    },
    name1conText: {
      fontSize: 18,
      fontFamily: font.bold(),
      color: COLORS.white,
    },
    nameconText: {
      fontSize: DeviceInfo.isTablet() ? 18 : 15,
      fontFamily: font.medium(),
    },
    name2conText: {
      fontSize: DeviceInfo.isTablet() ? 16 : 13,
      fontFamily: font.medium(),
      color: COLORS.white,
    },
    namecoText: {
      marginTop: 2,
      fontSize: DeviceInfo.isTablet() ? 16 : 12,
      fontFamily: font.regular(),
    },
    naContainer: {
      marginLeft: 5,
      justifyContent: "center",
      width: "60%",
    },
    Container2: {
      justifyContent: "center",
      marginLeft: 0,
      width: "15%",
    },
    adminText: {
      fontSize: 14,
      fontFamily: font.medium(),
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    editProfile2: {
      height: 30,
      width: "20%",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
      alignItems: "center",
      justifyContent: "center",
    },
    inviteText: {
      color: COLORS.black,
      marginTop: 5,
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
      marginBottom: 10,
    },
    profile2Container: {
      marginTop: 10,
      flexDirection: "row",
      height: 60,
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
      alignItems: "center",
    },
  });

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={"rgba(52, 52, 52, 0.0)"}
    >
      <StatusBar
        barStyle={isDarkMode ? "dark-content" : "dark-content"}
        backgroundColor={"rgba(52, 52, 52, 0.0)"}
      />

      <View>
        <View style={styles.themeTopContainer}>
          <View></View>
          <Image
            source={require("../../../Assets/Icons/Profile_Photo1.png")}
            style={{ width: "auto", height: "100%" }}
          />

          <View style={styles.plusImageContainer}>
            <TouchableOpacity
              style={styles.backArrowContainer}
              onPress={() => {
                navigation.pop();
              }}
            >
              <Image
                source={require("../../../Assets/Icons/Back.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.plusImageContainer1}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("EditGroupScreen", {
                  group_name: route.params.group_name,
                  selected_data: route.params.selected_data,
                });
              }}
            >
              <Text
                style={{
                  color: colorTheme ? COLORS.primary_blue : COLORS.purple,
                  fontSize: FontSize.font,
                  fontFamily: font.medium(),
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactContainer}>
            <TouchableOpacity style={styles.contact2Container}>
              <TouchableOpacity style={styles.nameInviteContainer}>
                <Text style={styles.name1conText}>
                  {route.params.group_name}
                </Text>
                <Text style={styles.name2conText}>
                  {"Created by You, 10/10/2023"}
                </Text>
              </TouchableOpacity>
              <Image
                source={require("../../../Assets/Icons/videonewicon.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
              <Image
                source={require("../../../Assets/Icons/CallBottom.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.themeContainer}>
          <View style={{ marginBottom: 250 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.chooseContainer}>
                <Text style={styles.nText}>Status</Text>
                <Text style={styles.statusText}>
                  “You miss 100% of the shots you don’t take”- Wayne
                  Gretsky”-Eun Kyung..
                </Text>
              </View>
              <View style={styles.chooseContainer}>
                <Text style={styles.nText}>Group Type</Text>
                <Text style={styles.statusText}>
                {t("user_admin_messages_allowed")}
                </Text>
              </View>
              <View style={{ backgroundColor: "white", marginTop: 10 }}></View>
              <View></View>
              <View style={styles.Container}>
                <Image
                  source={require("../../../Assets/Icons/Mute.png")}
                  style={styles.circleImageLayout}
                  resizeMode="contain"
                />
                <Text style={styles.sText}>Mute Chat</Text>
              </View>
              <View style={styles.Container}>
                <Image
                  source={require("../../../Assets/Icons/Hide.png")}
                  style={styles.circleImageLayout}
                  resizeMode="contain"
                />
                <Text style={styles.sText}>Hide Chat</Text>
              </View>
              <View style={styles.Container}>
                <Image
                  source={require("../../../Assets/Icons/Lock.png")}
                  style={styles.circleImageLayout}
                  resizeMode="contain"
                />
                <Text style={styles.sText}>Lock Chat</Text>
              </View>

              <View style={styles.reportContainer}>
                <Image
                  source={require("../../../Assets/Icons/Delete.png")}
                  style={styles.reportImageLayout}
                  resizeMode="contain"
                />
                <Text style={styles.reportText}>Delete Group</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </MainComponent>
  );
}
