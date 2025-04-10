import React from "react";
import { Image, Modal, Text, View } from "react-native";
import { COLORS, iconTheme, searchBar } from "../Colors/Colors";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { font } from "../Fonts/Font";
import { t } from "i18next";

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
      borderTopEndRadius: 24,
      borderTopStartRadius: 24,
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
      marginTop: 20,
      justifyContent: "center",
      alignItems: "center",
     // backgroundColor:"red"
    },
    heading: {
      color: "#000",
      fontSize: 15,
      fontFamily: font.medium(),
    },
    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: searchBar().back_ground,
      right: 20,
      top: 20,
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
      marginTop: 50,
    },
    premiumText: {
      color: "#000",
      fontSize: 20,
      fontFamily: font.semibold(),
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
      backgroundColor: iconTheme().textColorForNew,
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
        <View style={[styles.modal_view, { height: 300, paddingHorizontal:16 }]}>

        <TouchableOpacity style={[styles.cancel_button]} onPress={()=> onRequestClose()}>
          <Image
            source={require("../../Assets/Icons/Cross.png")}
            style={{
              height: 15,
              width: 15,
              tintColor: iconTheme().iconColor,
              //
            }}
          />
        </TouchableOpacity>
          {/* premium-text */}
          <View style={styles.premiumTextContainer}>
            <Text style={styles.premiumText}>{Heading}</Text>
          </View>
          {/* heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>{SubHeading}</Text>
          </View>


          <View
          style={{
            marginVertical: 30,
            flexDirection: "column",
            paddingHorizontal: 30,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity style={styles.button} onPress={()=>secondButtonClick()}>
            <Text style={styles.buttonText}>{t("Upgrade_to_Premium")}</Text>
          </TouchableOpacity>
        </View>
      </View>

       
      </TouchableOpacity>
    </Modal>
  );
}

