import { useFocusEffect } from "@react-navigation/native";
import { t } from "i18next";
import React, {useState } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { appBarIconTheme, COLORS, iconTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import DeviceInfo from "react-native-device-info";


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
          {t("Add Friend By")}
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
                    source={require("../../Assets/Icons/scan.png")}
                    style={styles.personIcon}
                    resizeMode="contain"
                />
                <Text style={{color: COLORS.black,
            fontFamily:font.bold()}}>QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => props.clickPersonphone()} style={styles.oneButtonContainer}>
                <Image
                    source={require("../../Assets/Icons/CallBottom.png")}
                    style={styles.personIcon}
                    resizeMode="contain"
                />
                <Text style={{color: COLORS.black,
            fontFamily:font.bold()}}>Phone Number</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={() => {
                props.onRequestClose();
                props.navState.navigate("NewChatScreen", { data: "NewChat" });
              }}
               style={styles.oneButtonContainer}>
                <Image
                    source={require("../../Assets/Icons/bxs_contact.png")}
                    style={styles.personIcon}
                    resizeMode="contain"
                />
                <Text style={{color: COLORS.black,
            fontFamily:font.bold()}}>Contact</Text>
            </TouchableOpacity>

          </View>
       
        {/* <View
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
                borderColor: publicSelected ? "green" : "gray",
                padding: 2.5,
                height: 25,
                width: 25,
                justifyContent: "center",
              }}
              onPress={() => OnPublicSelecetd()}
            >
              <View
                style={{
                  backgroundColor: publicSelected ? "green" : "transparent",
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
              {t("public_group")}
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
                borderColor: privateSelected ? "green" : "gray",
                padding: 2.5,
                height: 25,
                width: 25,
                justifyContent: "center",
              }}
              onPress={() => OnPrivateSelecetd()}
            >
              <View
                style={{
                  backgroundColor: privateSelected ? "green" : "transparent",
                  borderColor: privateSelected ? "green" : "gray",
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
              {t("private_group")}
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
          onPress={() =>
            props.onNextClick(publicSelected ? "public" : "private")
          }
        >
          <Text style={{ color: "#fff",fontFamily:font.bold() }}>{t("next")}</Text>
        </TouchableOpacity> */}
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
