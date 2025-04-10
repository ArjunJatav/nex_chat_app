import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, searchBar, textTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

 // eslint-disable-next-line
export const ChatBackUpModel = (props: any) => {
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    modal_view: {
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
      position: "absolute",
      backgroundColor: "#fff",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
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
      marginTop: 0,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: textTheme().textColor,
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
    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: searchBar().back_ground,
      right: 20,
      top: 20,
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
      <View style={[styles.modal_view, { height: 300 }]}>
        <Text
          style={{
            alignSelf: "flex-start",
            fontSize: 15,
            paddingHorizontal: 20,
            marginTop: 60,
            color: COLORS.black,
            fontWeight: "400",
          }}
        >
          {t("chat_backup_description")}{" "}
        </Text>
        <TouchableOpacity style={[styles.cancel_button]} onPress={props.cancel}>
          <Image
            source={require("../../Assets/Icons/Cross.png")}
            style={{
              height: 15,
              width: 15,
              tintColor: textTheme().textColor,
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
          <TouchableOpacity style={styles.button} onPress={props.cancel}>
            <Text style={styles.buttonText}>{t("i_understand")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
