import { t } from "i18next";
import React, { useState } from "react";
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, iconTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

 // eslint-disable-next-line
export const StatusType = (props: any) => {
  const [textStatus, setTextStatusSelected] = useState(true);
  const [cameraSelected, setCameraSelected] = useState(false);

  function OnTextStatusSelected() {
    setCameraSelected(false);
    setTextStatusSelected(true);
  }

  function OnPrivateSelecetd() {
    setTextStatusSelected(false);
    setCameraSelected(true);
  }
  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      onRequestClose={props.onRequestClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}
        onPress={() => {
          props.onRequestClose();
        }}
      ></TouchableOpacity>
      <View style={[styles.modal_view, { height: Platform.OS == "ios" ? 280 : 300 }]}>
        <Text
          style={{
            alignSelf: "center",
            fontSize: 18,
            paddingHorizontal: 20,
            marginTop: 20,
            color: COLORS.black,
            fontFamily:font.bold()
          }}
        >
          {t("addStatus")}
        </Text>
        <Text
          style={{
            color: "#000",
            fontSize: 15,
            marginBottom: 0,
            marginTop: 15,
            marginLeft: 20,
            fontFamily:font.semibold()
          }}
        >
          {t("please_select_Status_type")}
        </Text>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            marginTop: 20,
          }}
        >
          <View
            style={{ width: "15%", justifyContent: "center", paddingLeft: 20 }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 25,
                borderWidth: 2,
                borderColor: textStatus ? "green" : "gray",
                padding: 2.5,
                height: 25,
                width: 25,
                justifyContent: "center",
              }}
              onPress={() => OnTextStatusSelected()}
            >
              <View
                style={{
                  backgroundColor: textStatus ? "green" : "transparent",
                  borderColor: "green",
                  borderRadius: 25,
                  height: 15,
                  width: 15,
                }}
              ></View>
            </TouchableOpacity>
          </View>

          <View style={{ width: "85%", justifyContent: "center" }}>
            <Text style={{ color: "#000", fontSize: 15,fontFamily:font.semibold() }}>
              {" "}
              {t("text_Status")}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            marginTop: 20,
          }}
        >
          <View
            style={{
              width: "15%",
              justifyContent: "center",
              paddingLeft: 20,
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 25,
                borderWidth: 2,
                borderColor: cameraSelected ? "green" : "gray",
                padding: 2.5,
                height: 25,
                width: 25,
                justifyContent: "center",
              }}
              onPress={() => OnPrivateSelecetd()}
            >
              <View
                style={{
                  backgroundColor: cameraSelected ? "green" : "transparent",
                  borderColor: cameraSelected ? "green" : "gray",
                  borderRadius: 25,
                  height: 15,
                  width: 15,
                }}
              ></View>
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: "85%",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#000", fontSize: 15,fontFamily:font.semibold() }}>
              {" "}
              {t("camera_Status")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginTop: 20,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: iconTheme().textColorForNew,
            marginHorizontal: 20,
            padding: 10,
            borderWidth: 1,
            borderColor: "transparent",
            borderRadius: 10,
          }}
          onPress={() => props.onNextClick(textStatus ? "text" : "camera")}
        >
          <Text style={{ color: "#fff",fontFamily:font.bold() }}>{t("next")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export const styles = StyleSheet.create({
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
});
