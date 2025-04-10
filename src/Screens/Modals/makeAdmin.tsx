import React from "react";
import { Modal, StyleSheet } from "react-native";
import { COLORS, iconTheme, searchBar } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

// eslint-disable-next-line
export const MakeAdminModel = (props: any) => {
  const styles = StyleSheet.create({
    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },
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
    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: searchBar().back_ground,
      right: 20,
      top: 20,
    },
    button: {
      height: 50,
      marginTop: 10,
      width: "90%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().iconColor,
      alignSelf: "center",
    },
  });

  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent
    ></Modal>
  );
};
