import { t } from "i18next";
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
import React from "react";

// eslint-disable-next-line
export const CustomVideoModal = (props: any) => {
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
        style={[styles.modal_view, { height: props.video == true ? 220 : 120 }]}
      >
        <Text
          style={{
            alignSelf: "center",
            fontSize: 20,
            color: textTheme().textColor,
            fontFamily: font.bold(),
          }}
        >
          {t("choose")}
        </Text>
        <View
          style={{
            marginVertical: 10,
            flexDirection: "row",
            paddingHorizontal: 30,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={[styles.upload_button]}
            onPress={props.Camera}
          >
            <Image
              source={require("../../Assets/Image/camera2.png")}
              style={{
                height: 40,
                width: 40,
                tintColor: iconTheme().iconColor,
              }}
            />
            
            <Text style={[styles.Upload_buttonText,{color: textTheme().textColor,}]}>{t("camera")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.upload_button]}
            onPress={props.select}
          >
            <Image
              source={require("../../Assets/Image/gallery.png")}
              style={{
                height: 40,
                width: 40,
                tintColor: iconTheme().iconColor,
              }}
            />
            <Text style={[styles.Upload_buttonText,{color: textTheme().textColor,}]}>{t("gallary")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.upload_button]}
            onPress={props.cancel}
          >
            <Image
              source={require("../../Assets/Image/x-button.png")}
              style={{
                height: 40,
                width: 40,
                tintColor: iconTheme().iconColor,
              }}
            />
            <Text style={[styles.Upload_buttonText,{color: textTheme().textColor,}]}>{t("cancel")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: "700",
    fontFamily: font.regular(),
    marginTop: 5,
    color: textTheme().textColor,
  },
  upload_button: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 7,
  },
  iconContainer: {
    backgroundColor: "#F8D2D0",
    padding: 5,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
  },
});
