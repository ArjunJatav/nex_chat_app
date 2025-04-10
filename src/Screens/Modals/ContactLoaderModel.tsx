import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { COLORS, iconTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

// eslint-disable-next-line
export const ContactLoaderModel = (props: any) => {
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
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().iconColor,
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(52, 52, 52, 0.5)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            borderRadius: 10,
            backgroundColor: "white",
            padding: 25,
            paddingHorizontal: 10,
          }}
        >
          <ActivityIndicator size="large" color={iconTheme().iconColor} />
          <Text
            style={{
              fontSize: 18,
              fontFamily: font.semibold(),
              color: iconTheme().iconColor,
              marginTop: 10,
            }}
          >
            {t("fetchingContacts")}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
