import { useFocusEffect } from "@react-navigation/native";
import { t } from "i18next";
import React, {useState } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { appBarIconTheme, COLORS, iconTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import DeviceInfo from "react-native-device-info";
import { Mixpanel } from "mixpanel-react-native";
import { AppsFlyerTracker } from "../EventTracker/AppsFlyerTracker";


// eslint-disable-next-line
export const AddFriendModal = (props: any) => {
  const [publicSelected, setPublicSelected] = useState(true);
  const [privateSelected, setPrivateSelected] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setPublicSelected(props.isPublicSelected);
      setPrivateSelected(!props.isPublicSelected);
    }, [])
  );

    ////////////  MIXPANEL EVENT TRACKER    ///////// 

    const trackAutomaticEvents = false;
    const mixpanel = new Mixpanel(
      `${globalThis.mixpanelToken}`,
      trackAutomaticEvents
    );
  
  
  
    const handleButtonPress = (eventName) => {
      handleCallEvent("Add Friend by Contact Screen",eventName)
      // Track button click event with Mixpanel
      mixpanel.track("Add Friend by Contact Screen", {
        type: eventName,
      });
    };

    const handleCallEvent = (eventTrack,eventName1) => {
      const eventName = eventTrack;
      const eventValues = {
        af_content_id: eventName1,
        af_customer_user_id: globalThis.chatUserId,
        af_quantity: 1,
      };
    
      AppsFlyerTracker(eventName, eventValues, globalThis.chatUserId); // Pass user ID if you want to set it globally
    };
  

  function OnPublicSelecetd() {
    setPrivateSelected(false);
    setPublicSelected(true);
  }

  function OnPrivateSelecetd() {
    setPublicSelected(false);
    setPrivateSelected(true);
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
      <View style={[styles.modal_view]}>
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
          {t("add_friend_by")}
        </Text>

          <View style={{
            flexDirection:"row",
            justifyContent:"space-between",
            alignItems:"center",
            marginTop:30,
            marginBottom:30
          }}>

            

            <TouchableOpacity onPress={() => props.clickQrScanner()} style={styles.oneButtonContainer}>
                <Image
                     source={require("../../Assets/Icons/Scanner_icon.png")}
                     style={[styles.personIcon,{ height: DeviceInfo.isTablet() ? 30 : 25,
                       width: DeviceInfo.isTablet() ? 30 : 25,tintColor: iconTheme().iconColorNew,}]} 
                    resizeMode="contain"
                />
                <Text style={{color: COLORS.black,
            fontFamily:font.bold()}}>{t("QR_code")}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => props.clickPersonphone()} style={styles.oneButtonContainer}>
                <Image
                    source={require("../../Assets/Icons/CallBottom.png")}
                    style={[styles.personIcon,{tintColor: iconTheme().iconColorNew}]}
                    resizeMode="contain"
                />
                <Text style={{color: COLORS.black,
            fontFamily:font.bold()}}>{t("phone_number")}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={() => {
                props.onRequestClose();
                props.navState.navigate("NewChatScreen", { data: "NewChat" });
                handleButtonPress("Move To Contact Screen");
              }}
               style={styles.oneButtonContainer}>
                <Image
                    source={require("../../Assets/Icons/bxs_contact2.png")}
                    style={[styles.personIcon,{ height: DeviceInfo.isTablet() ? 30 : 23,
                      width: DeviceInfo.isTablet() ? 30 : 23,tintColor: iconTheme().iconColorNew}]}
                    resizeMode="contain"
                />
                <Text style={{color: COLORS.black,
            fontFamily:font.bold()}}>{t("contact")}</Text>
            </TouchableOpacity>

          </View>
       
      
      </View>
    </Modal>
  );
};

export const styles = StyleSheet.create({
    oneButtonContainer:{
        width: "33%",
        justifyContent: "center",
        alignItems: "center",
    },
    personIcon:{
        height: DeviceInfo.isTablet() ? 30 : 25,
        width: DeviceInfo.isTablet() ? 30 : 25,
        marginRight: 5,
        tintColor: appBarIconTheme().iconColor,
    },
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
