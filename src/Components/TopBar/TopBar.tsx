import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  appBarIconTheme,
  iconTheme,
  themeModule,
} from "../Colors/Colors";
import { FontSize } from "../DeviceSpecs/DeviceStyles";
import { font } from "../Fonts/Font";
import ThemeContext from "../ThemeContext/ThemeContext";
import renderIf from "../renderIf";
import { t } from "i18next";

export default function TopBar(props: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [addUserModel, setAddUserModel] = useState(false);

  const navigation = useNavigation();

  const styles = StyleSheet.create({
    topBarStyle: {
      marginTop: DeviceInfo.hasNotch() == true ? 0 : 15,
      height: DeviceInfo.hasNotch() == true ? 50 : 50,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1001,
    },
    titleContainer: {
      position: "absolute",
      left: 20,
    },
    titleWithArrowBackContainer: {
      position: "absolute",
      left: 50,
      width: "78%",
    },
    title: {
      //@ts-ignore
      color:
        props.checked === "englandTheme"
          ? "#FFFFFF"
          : props.checked === "americaTheme"
          ? "#FFFFFF"
          : props.checked === "indiaTheme"
          ? "#FFFFFF"
          : props.checked === "usindepTheme"
          ? "#FFFFFF"
          : props.checked === "mexicoTheme"
          ? "#003422"
          : props.checked === "mongoliaTheme"
          ? "#8D3E2D"
          : props.checked === "newYearTheme"
          ? COLORS.white
          : props.checked === "newYear"
          ? COLORS.white
          : props.checked === "christmas"
          ? COLORS.white
          : COLORS.black,
      fontSize: FontSize.titleFont,
      fontFamily: font.semibold(),
    },
    questionIconContainer: {
      position: "absolute",
      right: 50,
    },

    QrIconContainer: {
      position: "absolute",
      right: 85,
    },

    questionIcon: {
      height: DeviceInfo.isTablet() ? 27 : 20,
      width: DeviceInfo.isTablet() ? 27 : 20,
      tintColor: appBarIconTheme().iconColor,
    },
    filterIcon: {
      height: DeviceInfo.isTablet() ? 27 : 23,
      width: DeviceInfo.isTablet() ? 27 : 23,
      tintColor: appBarIconTheme().iconColor,
    },
    callIcon: {
      height: DeviceInfo.isTablet() ? 30 : 23,
      width: DeviceInfo.isTablet() ? 30 : 25,
      tintColor: appBarIconTheme().iconColor,
    },
    personIcon: {
      height: DeviceInfo.isTablet() ? 30 : 25,
      width: DeviceInfo.isTablet() ? 30 : 25,
      marginRight: 5,
      tintColor: appBarIconTheme().iconColor,
    },
    scanIcon: {
      height: DeviceInfo.isTablet() ? 30 : 25,
      width: DeviceInfo.isTablet() ? 30 : 25,
      marginRight: 10,
      tintColor: appBarIconTheme().iconColor,
    },
    backIcon: {
      height: 25,
      width: 25,
      //@ts-ignore
      tintColor:
        props.checked === "christmas"
          ? COLORS.white
          : //@ts-ignore
          props.checked == "third"
          ? COLORS.dark_pink
          : COLORS.white,
    },
    editIconContainer: {
      position: "absolute",
      right: 20,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    backArrowContainer: {
      position: "absolute",
      left: 10,
      borderRadius: 5,
      //@ts-ignore
      backgroundColor:
        props.checked === "englandTheme"
          ? "#5770A8"
          : props.checked === "americaTheme"
          ? "#0F3343"
          : props.checked === "indiaTheme"
          ? COLORS.primary_light_green
          : props.checked === "usindepTheme"
          ? "#1A255B"
          : props.checked === "mexicoTheme"
          ? "#003422"
          : props.checked === "mongoliaTheme"
          ? "#07050C"
          : props.checked === "newYearTheme"
          ? "#CE9D59" //@ts-ignore
          : props.checked === "newYear"
          ? COLORS.black
          : //@ts-ignore
          props.checked === "christmas"
          ? COLORS.primary_light_green
          : //@ts-ignore
          props.checked == "third"
          ? COLORS.light_green //@ts-ignore
          : props.checked == "second"
          ? COLORS.primary_blue
          : COLORS.purple,
    },
  });
  return (
    <View style={styles.topBarStyle}>
      {renderIf(
        props.showTitle == true,
        <View style={styles.titleContainer}>
          <Text style={[styles.title]}>{props.title}</Text>
        </View>
      )}
      {renderIf(
        props.showTitleForBack == true,
        <View style={styles.titleWithArrowBackContainer}>
          <Text style={[styles.title]} numberOfLines={1}>
            {props.title}
          </Text>
        </View>
      )}

      {renderIf(
        props.shareIcon == true,
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={() => props.clickShareIcon()}
        >
          <Image
            source={require("../../Assets/Icons/Share.png")}
            style={styles.filterIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {renderIf(
        props.showQuestion == true,
        <View style={styles.questionIconContainer}>
          <Image
            source={require("../../Assets/Icons/QuestionTopBar.png")}
            style={[styles.questionIcon, { marginRight: 5 }]}
            resizeMode="contain"
          />
        </View>
      )}
      {renderIf(
        props.showSearch == true,
        <TouchableOpacity
          style={[styles.questionIconContainer, { right: 55 }]}
          onPress={props.searchFunction}
        >
          <Image
            source={require("../../Assets/Icons/Search.png")}
            style={[styles.questionIcon, { marginRight: 5 }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {renderIf(
        props.showGlobe == true,
        <TouchableOpacity
          style={[styles.questionIconContainer, { right: 55 }]}
          onPress={props.globeFunction}
        >
          <Image
            source={require("../../Assets/Icons/globe.png")}
            style={[styles.questionIcon, { marginRight: 5 }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {renderIf(
        props.showEdit == true,
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={props.onEditClick}
          // onPress={() => {
          //   props.navState.navigate("NewChatScreen", { data: "NewChat" });
          // }}
        >
          <Image
            source={require("../../Assets/Icons/NotePen.png")}
            style={styles.questionIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {renderIf(
        props.backArrow == true,
        <TouchableOpacity
          style={[
            styles.backArrowContainer,
            {
              width: 25,
              height: 25,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
          onPress={() => {
            if (props.title == t("Pending_Requests")) {
              props.navState.navigate("BottomBar");
            } else {
              props.navState.pop();
            }
          }}
        >
          <Image
            source={require("../../Assets/Icons/back2.png")}
            style={[
              styles.backIcon,
              { width: "100%", height: 13, resizeMode: "contain" },
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {renderIf(
        props.goBack == true,
        <TouchableOpacity
          style={[
            styles.backArrowContainer,
            {
              width: 25,
              height: 25,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
          onPress={props.clickGoBack}
        >
          <Image
            source={require("../../Assets/Icons/back2.png")}
            style={[
              styles.backIcon,
              { width: "100%", height: 13, resizeMode: "contain" },
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {renderIf(
        props.personIcon == true,
        <TouchableOpacity
          style={styles.questionIconContainer}
          onPress={() => props.clickPerson()}
        >
          <Image
            source={require("../../Assets/Icons/AddUser.png")}
            style={styles.personIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {renderIf(
        props.QrScanner == true,
        <TouchableOpacity
          style={styles.QrIconContainer}
          onPress={() => props.clickPerson()}
        >
          <Image
            source={require("../../Assets/Icons/AddUser.png")}
            style={styles.scanIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {renderIf(
        props.filterIcon == true,
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={() => props.clickScan()}
        >
          <Image
            source={require("../../Assets/Icons/Sync.png")}
            style={styles.filterIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {renderIf(
        props.shareIcon == true,
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={() => props.clickShareIcon()}
        >
          <Image
            source={require("../../Assets/Icons/Share.png")}
            style={styles.filterIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {renderIf(
        props.callIcon == true,
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={() => {
            props.navState.navigate("NewChatScreen", { data: "NewCall" });
          }}
        >
          <Image
            source={require("../../Assets/Icons/CallBottom.png")}
            style={styles.callIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {renderIf(
        props.Avatar == true,
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={props.onPress}
        >
          <Text
            style={{
              fontFamily: font.medium(),
              fontSize: 18,
              color: iconTheme().iconColor,
            }}
          >
            Done
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
