import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { COLORS, iconTheme, searchBar } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

 // eslint-disable-next-line
export const AddUsereModel = (props: any) => {
  const [phoneCountryCode, phoneCountryCodeSetter] = useState("+1");
  const phoneInput = useRef(null);
  const [phoneNumber, setphoneNumber] = useState("");
  const { t } = useTranslation();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    function onKeyboardDidShow(e: KeyboardEvent) {
      // Remove type here if not using TypeScript
      setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardDidHide() {
      setKeyboardHeight(0);
    }
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      onKeyboardDidShow
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardDidHide
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
      backgroundColor: iconTheme().textColorForNew,
    },
    nameText: {
      fontSize: 18,
      color: COLORS.black,
      // fontWeight: "600",
      fontFamily: font.bold(),
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
        style={[
          styles.modal_view,
          { height: Platform.OS === "ios" ? 350 + keyboardHeight : 350 },
        ]}
      >
        <Text
          style={{
            alignSelf: "flex-start",
            fontSize: 15,
            paddingHorizontal: 20,
            marginTop: 60,
            color: COLORS.black,
            fontFamily: font.semibold(),
          }}
        >
          {t("startConversationWithoutSavingContact")}
        </Text>
        <TouchableOpacity style={[styles.cancel_button]} onPress={props.cancel}>
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
        <View
          style={{
            marginVertical: 30,
            flexDirection: "column",
            paddingHorizontal: 30,
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.nameText}>{t("phone_number")}</Text>
          <PhoneInput
            ref={phoneInput}
            value={phoneNumber}
            textInputStyle={{
              fontFamily: font.semibold(),
              fontSize: 17,

              padding: 0,
              alignSelf: "center",
              marginTop: 0,
            }}
             defaultCode="US"
            layout="first"
            textInputProps={{
              maxLength: 15,
            }}
            placeholder={t("phone_number")}
            codeTextStyle={styles.textInput}
            containerStyle={styles.phoneContainer}
            textContainerStyle={styles.textInput}
          //  onChangeFormattedText={(ref) => {}}
            onChangeText={(text) => {
              setphoneNumber(text);
            }}
            onChangeCountry={(value) => {
              
              phoneCountryCodeSetter("+" + value.callingCode[0]);
            }}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              props.verify_chat(phoneNumber, phoneCountryCode),
                setphoneNumber("");
            }}
          >
            <Text style={styles.buttonText}>{t("verifyAndChat")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
