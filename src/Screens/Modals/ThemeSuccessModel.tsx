import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  iconTheme,
  searchBar,
} from "../../Components/Colors/Colors";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import FastImage from "react-native-fast-image";

// eslint-disable-next-line
export const ThemeSucessModel = (props: any) => {
  const { t } = useTranslation();

  const styles = StyleSheet.create({
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
      height:"100%",
      justifyContent:"center",
      alignItems:"center",
      alignSelf:"center"
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
        style={
          { height: "100%" , width: "100%",
          justifyContent:"center",
          backgroundColor: "#fff",
          elevation: 6,
          shadowColor: COLORS.black,
         }
        }
      >
        <View style={{ paddingTop: 0 }}>
          <FastImage
            style={{ height: 250, width: "90%" }}
            resizeMode="contain"
            source={require("../../Assets/Image/success.png")}
          />
          <Text
            style={{
              fontSize: 24,
              fontFamily: font.bold(),
              color: "#372F4C",
              textAlign: "center",
            }}
          >
            Yayy!!!!
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontFamily: font.bold(),
              color: "#372F4C",
              textAlign: "center",
              marginBottom: 7,
            }}
          >
            Payment Successful
          </Text>
          <View
            style={{
          
              marginTop: 20,
            //backgroundColor:"red",
              marginHorizontal: 20,
            }}
          >
            <TouchableOpacity
              style={{
                height: 50,
                marginTop: 10,
                width: "100%",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
              backgroundColor:
              globalThis.selectTheme == "newYearTheme"
                  ? "#372F4C"
                  : globalThis.selectTheme == "newYear"
                  ? COLORS.newYear_theme
                  : globalThis.selectTheme == "christmas"
                  ? COLORS.primary_light_green
                  : globalThis.selectTheme == "third"
                  ? "#CF1886"
                  : globalThis.selectTheme == "first"
                  ? COLORS.purple
                  : COLORS.primary_blue,
              }}
              onPress={props.returnHome}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: FontSize.font, color: COLORS.white ,  fontFamily: font.bold(),}}>
                  {" "}
                  {t("Return to Home")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
