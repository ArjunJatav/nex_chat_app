import React from "react";
import { Modal, Text, View } from "react-native";
import { COLORS, iconTheme } from "../Colors/Colors";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { font } from "../Fonts/Font";

export default function PremiumAlert({
  visible: visible,
  onRequestClose: onRequestClose,
  cancel: cancel,
  Heading: Heading,
  SubHeading: SubHeading,
  FirstButton: FirstButton,
  SecondButton: SecondButton,
  firstButtonClick:firstButtonClick,
  secondButtonClick:secondButtonClick
}) {
  const styles = StyleSheet.create({
    modal_view: {
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
      position: "absolute",
      backgroundColor: COLORS.white,
      borderTopEndRadius: 12,
      borderTopStartRadius: 12,
      elevation: 6,
      // justifyContent: "center",
      shadowColor: COLORS.black,
      shadowOpacity: 5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 3.5,
    },
    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },
    headingContainer: {
      // height: 50,
      marginTop: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    heading: {
      color: "#000",
      fontSize: 20,
      fontFamily: font.bold(),
    },
    SubHeadingContainer: {
      height: 50,
      marginTop: 5,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
    },
    SubHeading: {
      color: "#000",
      fontSize: 13,
      fontFamily: font.bold(),
    },
    buttonContainer: {
      flexDirection: "row",
      position: "absolute",
      bottom: 50,
      justifyContent: "flex-end",
      right: 20,
    },
    firstButtonContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginRight: 25,
    },
    secondButtonContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    firstButtonText: {
      color: iconTheme().iconColor,
      fontSize: 17,
      fontFamily: font.semibold(),
    },
    premiumTextContainer: {
      alignItems: "center",
      marginTop: 10,
    },
    premiumText: {
      color: "#000",
      fontSize: 25,
      fontFamily: font.bold(),
    },
  });
  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={visible}
      transparent={true}
      onRequestClose={() => {
        onRequestClose;
      }}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.4)" }}
        onPress={cancel}
      >
        <View style={[styles.modal_view, { height: "35%", paddingHorizontal:10 }]}>
          {/* premium-text */}
          <View style={styles.premiumTextContainer}>
            <Text style={styles.premiumText}>Upgrade To Premium</Text>
          </View>
          {/* heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>{Heading}</Text>
          </View>

          {/* sub-heading */}
          <View style={styles.SubHeadingContainer}>
            <Text style={styles.SubHeading}>{SubHeading}</Text>
          </View>

          {/* button-container */}
          <View style={styles.buttonContainer}>
            {/* first-button */}
            <TouchableOpacity style={styles.firstButtonContainer} onPress={()=>firstButtonClick()}>
              <Text style={styles.firstButtonText}>{FirstButton}</Text>
            </TouchableOpacity>

            {/* second-button */}
            <TouchableOpacity style={styles.secondButtonContainer} onPress={()=>secondButtonClick()}>
              <Text style={styles.firstButtonText}>{SecondButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
