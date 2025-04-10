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
import { COLORS, iconTheme, textTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

 // eslint-disable-next-line
export const RateUsModel = (props: any) => {
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
      fontSize: 18,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    button: {
      height: 40,
      marginTop: 10,
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

    upload_button: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
      borderRadius: 10,
      width: "47%",
      height: 100,
      backgroundColor: "#FCF1FF",
    },

    starIcon: {
      height: 25,
      width: 25,
      tintColor: textTheme().textColor,
      marginLeft: 5,
    },
  });

  return (
    <Modal
      style={styles.modal}
      visible={props.visible}
      transparent={true}
      onRequestClose={() => {
        props.onRequestClose;
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(52, 52, 52, 0.1)",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={props.onRequestClose}
      >
        <TouchableOpacity
          style={{ borderRadius: 10, backgroundColor: "white", padding: 25 }}
          onPress={props.rateApp}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Image
              source={require("../../Assets/Icons/star.png")}
              style={styles.starIcon}
              resizeMode="contain"
            />
            <Image
              source={require("../../Assets/Icons/star.png")}
              style={styles.starIcon}
              resizeMode="contain"
            />
            <Image
              source={require("../../Assets/Icons/star.png")}
              style={styles.starIcon}
              resizeMode="contain"
            />
            <Image
              source={require("../../Assets/Icons/star.png")}
              style={styles.starIcon}
              resizeMode="contain"
            />
            <Image
              source={require("../../Assets/Icons/star.png")}
              style={styles.starIcon}
              resizeMode="contain"
            />
          </View>
          <Text
            style={{
              fontSize: 15,
              fontFamily: font.semibold(),
              color: "black",
              marginBottom: 10,
              marginTop: 20,
            }}
          >
            {t("rete_des")}
          </Text>

          <TouchableOpacity style={styles.button} onPress={props.rateApp}>
            <Text style={styles.buttonText}>{t("rate_app")}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
