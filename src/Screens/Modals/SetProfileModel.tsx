import { t } from "i18next";
import React from "react";
import {
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

 // eslint-disable-next-line
export const SetProfileModal = (props: any) => {
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

    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },
    Upload_buttonText: {
      fontSize: 15,
      fontFamily: font.regular(),
      marginTop: 5,
      color: setWallpaper().iconColor,
    },
    upload_button: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
      borderRadius: 10,
      width: "47%",
      height: 100,
      backgroundColor: searchBar().back_ground,
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
      <View
        style={[styles.modal_view, { height: props.video == true ? 250 : 250 }]}
      >
        <Text
          style={{
            alignSelf: "flex-start",
            fontSize: 20,
            paddingHorizontal: 20,
            marginTop: 25,
            color: COLORS.black,
            fontFamily: font.bold(),
          }}
        >
          {t("choose") + " " + t("image")}
        </Text>
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
        <View
          style={{
            marginVertical: 30,
            flexDirection: "row",
            paddingHorizontal: 30,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={[styles.upload_button]}
            onPress={props.select}
          >
            <Image
              source={require("../../Assets/Icons/Set_Profile.png")}
              style={{
                height: 25,
                width: 25,
                tintColor: setWallpaper().iconColor,
              }}
            />
            <Text style={[styles.Upload_buttonText,{}]} numberOfLines={1}>
              {t("chooseFromGallery")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.upload_button]}
            onPress={props.Camera}
          >
            <Image
              source={require("../../Assets/Icons/CameraIcon.png")}
              style={{
                height: 27,
                width: 27,
                tintColor: setWallpaper().iconColor,
              }}
            />
            <Text style={styles.Upload_buttonText}>{t("takeAPhoto")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
