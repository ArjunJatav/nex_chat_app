import React, { useContext } from "react";
import {
  Image,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, iconTheme, searchBar } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";

 // eslint-disable-next-line
export const InviteUsereModel = (props: any) => {
  const { colorTheme } = useContext(ThemeContext);

  const message_data =
    "Lets chat on  Tokee, Join me at - https://play.google.com/store/apps/details?id=com.deucetek.tokee";
  const message_link =
    "Lets chat on  Tokee, Join me at - https://apps.apple.com/fj/app/tokee-messenger/id1641356322";

  const shareOptions = {
    title: "Title",
    message: Platform.OS === "ios" ? message_link : message_data, // Note that according to the documentation at least one of "message" or "url" fields is required
    subject: "Subject",
  };

  
  const buttonPress = async () => {
    try {
      await Share.share(shareOptions);
      // Additional actions can be performed here if needed
      props.onRequestClose();
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };
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
      justifyContent: "center",

      shadowColor: COLORS.black,
      shadowOpacity: 5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 3.5,
    },
    buttonText: {
      fontSize: 18,
      color: COLORS.white,
      fontFamily: font.regular(),
    },
    button: {
      height: 50,
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:iconTheme().textColorForNew,
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
    Upload_buttonText: {
      fontSize: 15,
      fontFamily: font.regular(),
      marginTop: 5,
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
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
      padding: 7,
      backgroundColor: searchBar().back_ground,
      right: 20,
      top: 20,
    },
    phoneContainer: {
      marginTop: 14,
      width: "100%",
      height: 40,
      fontFamily: font.semibold(),
      borderBottomWidth: 1,
      borderBottomColor: "#F6EBF3",
    },
    iconContainer: {
      backgroundColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
      padding: 5,
      borderWidth: 1,
      borderColor: "transparent",
      borderRadius: 10,
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
      <View style={[styles.modal_view, { height: 300 }]}>
        <Text
          style={{
            alignSelf: "center",
            fontSize: 15,
            paddingHorizontal: 20,
            marginTop: 10,
            color: COLORS.black,
            fontWeight: "500",
          }}
        >
          {props.clickAblelData.contact_name}
        </Text>
        <Text
          style={{
            alignSelf: "center",
            fontSize: 15,
            paddingHorizontal: 20,
            marginTop: 20,
            color: COLORS.black,
            fontWeight: "500",
          }}
        >
          Looks like this contact is not on Tokee yet. Invite them and start
          chatting.
        </Text>
        <TouchableOpacity style={[styles.cancel_button]} onPress={props.cancel}>
          <Image
            source={require("../../Assets/Icons/Cross.png")}
            style={{
              height: 15,
              width: 15,
              tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
              //
            }}
          />
        </TouchableOpacity>
        <View
          style={{
            marginVertical: 30,
            flexDirection: "column",
            paddingHorizontal: 30,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity style={styles.button} onPress={() => buttonPress()}>
            <Text style={styles.buttonText}>
              Invite +{props.clickAblelData.phone_number}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
