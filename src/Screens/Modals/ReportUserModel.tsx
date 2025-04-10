import React, {  useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  iconTheme,
  searchBar,
  setWallpaper,
} from "../../Components/Colors/Colors";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";

 // eslint-disable-next-line
export const ReportUserModel = (props: any) => {
  const [reason, setreason] = useState("");
  const { t } = useTranslation();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    function onKeyboardDidShow(e: KeyboardEvent) {
      // Remove type here if not using TypeScript
      setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardDidHide() {
      setKeyboardHeight(0);
    }
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      onKeyboardDidShow
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardDidHide
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    modal_view: {
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
      position: "absolute",
      backgroundColor: "#fff",
      borderTopEndRadius: 12,
      borderTopStartRadius: 12,
      elevation: 6,
      shadowColor: COLORS.black,
      shadowOpacity: 5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 3.5,
    },
    buttonText: {
      fontSize: 20,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    button: {
      height: 50,
      marginTop: 30,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,
    },
    nameText: {
      fontSize: 18,
      color: COLORS.black,
      fontWeight: "600",
      fontFamily: font.regular(),
    },
    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },

    textInput: {
      paddingVertical: 0,
      fontFamily: font.semibold(),
      backgroundColor: "#fff",
      alignItems: "center",
      fontSize: 17,
    },

    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: searchBar().back_ground,
      right: 20,
      top: 20,
    },

    nameInputTextContainer: {
      marginRight: 16,
      marginLeft: DeviceInfo.isTablet() == true ? 32 : 16,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },
    nameInputText: {
      fontSize: FontSize.font,
      padding: 0,
      marginTop: 10,
      color: COLORS.black,

      fontFamily: font.regular(),
    },
  });
  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      onRequestClose={() => {
        props.onRequestClose;
      }}
    >
      <View
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}
      ></View>
      <View
        style={[
          styles.modal_view,
          { height: Platform.OS === "ios" ? 280 + keyboardHeight : 280 },
        ]}
      >
        <Text
          style={{
            alignSelf: "flex-start",
            fontSize: 15,
            paddingHorizontal: 20,
            marginTop: 50,
            color: COLORS.black,
            fontFamily: font.semibold(),
          }}
        >
          {"    " + t("writeToAdmin")}
        </Text>
        <TouchableOpacity style={[styles.cancel_button]} onPress={props.cancel}>
          <Image
            source={require("../../Assets/Icons/Cross.png")}
            style={{
              height: 15,
              width: 15,
              tintColor: setWallpaper().iconColor,
              //
            }}
          />
        </TouchableOpacity>
        <View
          style={{
            marginVertical: 30,
            flexDirection: "column",
            paddingHorizontal: 30,
            justifyContent: "space-between",
          }}
        >
          <View style={styles.nameInputTextContainer}>
            <TextInput
              style={styles.nameInputText}
              placeholder={t("enterReport")}
              placeholderTextColor={"grey"}
              onChangeText={(text) => setreason(text)}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              props.report_user(reason);
              setreason("");
            }}
          >
            <Text style={styles.buttonText}>{t("report")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
