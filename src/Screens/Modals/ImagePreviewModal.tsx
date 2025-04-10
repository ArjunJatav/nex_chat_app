import React from "react";
import {  Image, Platform } from "react-native";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import Video from "react-native-video";
import AudioMessage from "../Chat/AudioMessage";
import { COLORS, themeModule } from "../../Components/Colors/Colors";

// eslint-disable-next-line
export const ImagePreviewModel = (props: any) => {
  const styles = StyleSheet.create({
    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },
    FullView: {
      height: "100%",
      width: "100%",
      backgroundColor: "#000",
    },
    backContainer: {
      height: 50,
      marginTop: DeviceInfo.hasNotch() ? 50 : 10,
      justifyContent: "center",
    },
    backButton: {
      position: "absolute",
      left: 20,
      justifyContent: "center",
      alignItems: "center",
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

      <View style={styles.FullView}>
        <View style={styles.backContainer}>
        <TouchableOpacity
            style={{
              left: 10,
              position: "absolute",
              borderRadius: 5,
              zIndex: 900000,
              top: Platform.OS === "ios" ? 60 : 20,
              backgroundColor:
              themeModule().premiumBackIcon,
                  width: 25,
                  height: 25,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
            }}
            onPress={() => {
              props.onRequestClose()
            }}
          >
            <Image
              source={require("../../Assets/Icons/back2.png")}
              style={{
                width: "100%", height: 13, resizeMode: "contain",
                tintColor:
                  globalThis.selectTheme == "third"
                    ? COLORS.dark_pink
                    : COLORS.white,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        

        <View style={{ justifyContent: "center", alignItems: "center" }}>
          {props?.file?.type == "image" ? (
            <Image
              source={{ uri: props?.file?.attachment }}
              style={{ height: 500, width: "90%", alignSelf: "center" }}
              resizeMode="contain"
            />
          ) : props?.file?.type == "video" ? (
            <Video
              source={{
               
                uri: props?.file?.attachment,
              }}
              controls={true}
              style={{ height: 500, width: 400 }}
            />
          ) : (
            <View
            style={{
              height: 64,
              width: "95%",
              alignSelf: "center",
              marginTop: "70%",
              backgroundColor: "#fff",
            }}
          >
            <View style={{ height: 50, width: "90%", alignSelf: "center" }}>
              <AudioMessage
                currentMessage={props?.file?.attachment?.localPath[0]}
              />
            </View>
            </View>
           
          )}
        </View>
      </View>
    </Modal>
  );
};
