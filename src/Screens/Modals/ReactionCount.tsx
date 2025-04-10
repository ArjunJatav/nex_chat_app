import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  COLORS,
  searchBar,
  setWallpaper,
} from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

import DeviceInfo from "react-native-device-info";
import { colors } from "../../utils/constants/colors";
import { t } from "i18next";

// eslint-disable-next-line
export const ReactionCount = React.memo((props: any) => {
  // console.log("sendContactData", props.sendContactData);

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
    upload_button: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
      borderRadius: 10,
      width: "47%",
      height: 100,
      backgroundColor: "#FCF1FF",
    },
    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 10,
      backgroundColor: searchBar().back_ground,
      right: 15,
      top: 15,
      zIndex: 50,
    },
    phoneContainer: {
      marginTop: 14,
      width: "100%",
      height: 40,
      fontFamily: font.semibold(),
      borderBottomWidth: 1,
      borderBottomColor: "#F6EBF3",
    },

    recentStatusContainer: {
      justifyContent: "center",
      margin: 0,
      flexDirection: "row",
      width: "100%",
    },
    Container: {
      margin: 5,
      marginLeft: 0,
      width: "10%",
    },
    recentStory: {
      width: 45,
      height: 45,
      borderRadius: 30,
    },
    circleImageLayout: {
      width: 40,
      height: 40,
      borderRadius: 25,
    },
    name1Text: {
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
      paddingLeft: 10,
    },
    numberText: {
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
      paddingLeft: 10,
      color: COLORS.grey,
    },
    naContainer: {
      justifyContent: "center",
      marginLeft: 10,
      width: "70%",
      flexDirection: "column",
    },
    timeContainer: {
      margin: 0,
      width: "65%",
      flexDirection: "row",
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
    },
    emptyContainer: {
      borderRadius: 15,
      borderWidth: 1,
      height: 45,
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
  });

  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      //   onRequestClose={props.onRequestClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}
        onPress={props.cancel}
      ></TouchableOpacity>
      <View style={[styles.modal_view]}>
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
        <View style={{ paddingHorizontal: 20 }}>
          <FlatList
            data={props.sendContactData}
            // eslint-disable-next-line
            renderItem={({ item, index }: any) => {
              return (
                <View
                  style={{
                    marginBottom: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  key={index}
                >
                  <Text style={{ color: colors.black, fontSize: 20 }}>
                    {item.emoji}
                  </Text>
                  <Text
                    style={{
                      color: colors.black,
                      marginLeft: 20,
                      fontFamily: font.semibold(),
                      fontSize: 16,
                    }}
                  >
                    {item?.users?.length || item.count}
                  </Text>
                </View>
              );
            }}
            ListHeaderComponent={() => {
              return (
                <Text
                  style={{
                    color: colors.black,
                    marginLeft: 20,
                    textAlign: "center",
                    fontSize: 16,
                    marginTop: "5%",
                    fontFamily: font.bold(),
                  }}
                >
                  {props.sendContactData.reduce((acc, val) => {
                    return acc + val.count;
                  }, 0)}{" "}
                 {t("reactions")}
                </Text>
              );
            }}
            ListFooterComponent={() => {
              return <View style={{ height: 10 }}></View>;
            }}
          />
        </View>
      </View>
    </Modal>
  );
});
