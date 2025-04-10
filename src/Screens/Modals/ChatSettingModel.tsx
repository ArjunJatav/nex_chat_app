import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../../Assets/Language/i18n";
import { COLORS, iconTheme, searchBar } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import { Slider } from "@miblanchard/react-native-slider";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";

// eslint-disable-next-line
export const ChatSettingModel = (props: any) => {
  const { t } = useTranslation();
  const [value, setvalue] = useState(16);
  const [selectedLetter, setSelectedLetter] = useState(globalThis.chatFontsize);
  const [isEnabled, setIsEnabled] = useState(globalThis.allMediaDownload);


  useEffect(() => {
    setIsEnabled(globalThis.allMediaDownload);
    const updateFontSizeAsync = async () => {
      try {
        await updateFontSize(selectedLetter);
      } catch (error) {
        console.error('Error updating font size:', error);
      }
    };
  
    updateFontSizeAsync();
  }, [selectedLetter]);

  // eslint-disable-next-line
  const updateFontSize = async (newSize: any) => {
    await AsyncStorage.setItem("chatFontsize", newSize.toString()); 
    globalThis.chatFontsize = newSize;
  };
  // eslint-disable-next-line
  const handleValueChange = (value:any) => {
    const integerValue = Math.round(value);
    setvalue(integerValue);
    setSelectedLetter(integerValue);
  };
 
  // eslint-disable-next-line
  const toggleSwitchnew = async (newValue:any) => {
      setIsEnabled(newValue);
      await AsyncStorage.setItem('allMediaDownload', JSON.stringify(newValue));
      globalThis.allMediaDownload = newValue;
   
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
    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: searchBar().back_ground,
      right: 20,
      top: 20,
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
    name1Text: {
      fontSize: 16,
      fontFamily: font.semibold(),
      paddingLeft: 10,
      color: COLORS.black,
    },
    naContainer: {
      justifyContent: "center",
      width: "95%",
      flexDirection: "column",
    },
    emptyContainer: {
      borderRadius: 15,
      borderWidth: 1,
      height: 45,
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
    sliderContainer: {
      marginTop: 0,
      marginHorizontal: 5,
      alignItems: "center",
      width: "80%",
    },
    sliderLabel: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    sliderTrack: {
      height: 5,
      backgroundColor: searchBar().back_ground,
      borderRadius: 2,
      width: "98%",
      position: "relative",
      flexDirection: "row",
    },
    dotLine: {
      height: 10,
      width: 2,
      backgroundColor: COLORS.black,
      position: "absolute",
    },
    sliderThumb: {
      height: 25,
      width: 25,
      backgroundColor: iconTheme().iconColor,
      borderRadius: 15,
      position: "absolute",
      top: -10,
    },
    selectedLetterText: {
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 10,
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
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}
        onPress={props.cancel}
      >
        <TouchableOpacity
          style={[styles.modal_view, { height: 350 }]}
          activeOpacity={10}
        >
          <Text
            style={{
              position: "absolute",
              borderRadius: 20,
              left: 20,
              top: 155,
              fontFamily: font.bold(),
              color: COLORS.black,
              fontSize: FontSize.font,
            }}
          >
            {t("change_fontsize")}
          </Text>
          <TouchableOpacity
            style={[styles.cancel_button]}
            onPress={props.cancel}
          >
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
              alignItems: "center",
              justifyContent: "space-between",
              marginVertical: 10,
              paddingHorizontal: 20,
              marginTop: 70,
              flexDirection: "row",
              width: "100%",
            }}
          >
            <View
              style={{
                justifyContent: "center",
              //  margin: 0,
                width: "60%",
                flexDirection: "column",
               
              }}
            >
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: FontSize.font,
                  fontFamily: font.bold(),
                }}
              >
                {t("auto_media_download")}
              </Text>
            </View>
            <View style={{}}>
              <Switch 
              onValueChange={(value) => toggleSwitchnew(value)}
              value={isEnabled} />
            </View>
          </View>
          <View
            style={{
              marginTop: "10%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "10%",
              }}
            >
              <View
                style={{
                  width: "5%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: 10,
                    fontFamily: font.bold(),
                  }}
                >
                  A
                </Text>
              </View>

              <View
                style={{
                  width: "80%",
                  alignItems: "stretch",
                  justifyContent: "center",
                }}
              >
                <Slider
                  value={value}
                  maximumValue={20}
                  minimumValue={12}
                  onValueChange={(value) => handleValueChange(value)}
                />
              </View>

          

              <View
                style={{
                  width: "5%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: value,
                    fontFamily: font.bold(),
                  }}
                >
                  A
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              marginTop: "10%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: iconTheme().iconColor,
                fontSize: selectedLetter,
                fontFamily: font.bold(),
              }}
            >
              {t("hello")}
              {" Tokee"}
            </Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
