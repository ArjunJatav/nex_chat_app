import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  COLORS,
  CustomModel,
  gredient,
  iconTheme,
} from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import recordingAnimation from "../../Assets/Logo/mangoliaColorStar.json";
import LottieView from "lottie-react-native";
import LinearGradient from "react-native-linear-gradient";
import renderIf from "../../Components/renderIf";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";

// eslint-disable-next-line
export const FriendMatchModel = (props: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity
  const [checked, setChecked] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkIfDoNotShow = async () => {
      const doNotShowAgainId = await AsyncStorage.getItem('FriendMatchPopup');
      if (doNotShowAgainId === props.id) {
        setChecked(true);
      }
    };
    checkIfDoNotShow();
  }, [props.id]); // When the modal ID changes, recheck if it was dismissed

  const handleCheckBoxChange = async () => {
    try {
      setChecked(!checked);
      const newValue = !checked ? "yes" : "no"; // Toggle the checkbox value
  
      // Store the data properly
      const modalId = props.id ? String(props.id) : ""; // Ensure modalId is a string
      await AsyncStorage.setItem(
        "FriendMatchPopup",
        newValue === "yes" ? modalId : ""
      );
  
      // If "Do not show again" is checked, call the provided callback
      if (!checked && props.onDoNotShowAgain) {
        props.onDoNotShowAgain();
      }
    } catch (error) {
      console.error("Error in handleCheckBoxChange:", error);
    }
  };
  useEffect(() => {
    globalThis.DonotshowPopup = checked;
    if (props.visible) {
      // Check if the modal is visible
      fadeAnim.setValue(0); // Reset opacity to 0 before starting animation
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade in
        duration: 2000, // Animation duration
        useNativeDriver: true, // Use native driver for performance
      }).start();
    }
  }, [fadeAnim, props.visible]);

  const styles = StyleSheet.create({
    modal_view: {
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
      position: "absolute",
      backgroundColor: "#fff",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
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
    cancelButton: {
      height: 50,
      marginTop: 2,
      // borderRadius: 10,
      borderBottomRightRadius: 10,
      borderBottomLeftRadius: 10,
      // position:"absolute",
      width: "100%",
      // bottom: 15,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,
    },
    button: {
      height: 40,
      marginTop: 10,
      borderRadius: 10,
      // position:"absolute",
      width: "50%",
      bottom: 15,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,
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

    upload_button: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
      borderRadius: 10,
      width: "47%",
      height: 100,
      backgroundColor: "#FCF1FF",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(52, 52, 52, 0.5)",
      alignItems: "center",
      justifyContent: "center",
    },
    exploreFriendText: {
      fontSize: 25,
      fontFamily: font.bold(),
      color: iconTheme().textColorForNew,
      // marginBottom: 20,
      marginTop: 10,
      textAlign: "center",
    },
    descriptionText: {
      fontSize: 18,
      fontFamily: font.regular(),
      color: COLORS.black,
      fontWeight: "400",
      marginBottom: 20,
      textAlign: "center",
      marginTop: 0,
      marginHorizontal: 10,
    },
    starIcon: {
      height: 150,
      width: "100%",
      // tintColor: textTheme().textColor,
      //marginLeft: 5,
    },
    checkBoxContainer: {
      height: 30,
      alignSelf: "flex-start",
      marginBottom: 20,
      flexDirection: "row",
      justifyContent: 'center',
    },
    checkButtonContainer: {
      height: 20,
      width: 20,
      borderWidth: 1,
      borderColor: "#000",
      marginLeft: 20,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:10
    },
    doNotShowText: {
      marginLeft: 5,
      fontSize: 12,
      marginTop:2
      // alignSelf:"center"
    },
    buttonsConatiner: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-around",
      height: 40,
      gap: 12,
      marginBottom: 10,
      paddingHorizontal: 10,
    },
  });

  return (
    <Modal
      style={styles.modal}
      visible={props.visible}
      transparent={true}
      onRequestClose={() => {
        props.onRequestClose;
      }}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={CustomModel().BackColor}
          start={{ x: 0, y: 0.1 }} // Start at the top
          end={{ x: 0, y: 0 }}
          style={{
            //  height: 150,
            // width: "100%",
            width: "85%",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
            }}
          >
            <Text style={styles.exploreFriendText}>{props.title}</Text>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <Image
                source={{uri:props.image}}
                style={{height:250,width:250}}
                resizeMode="contain"
              />
            </View>
            <View
              style={{
                alignItems: "center",
              }}
            >
              <Text style={styles.descriptionText}>
                {props.descriptionText}
              </Text>
              {/* <Text style={{marginVertical:20,textAlign:"center"}}>{globalThis.numberOfPeople} people found in this region with Explore Profile's button.</Text> */}
              <View style={styles.checkBoxContainer}>
              <TouchableOpacity
  style={styles.checkButtonContainer}
  onPress={handleCheckBoxChange}
>
                  {renderIf(
                    checked == true,
                    <Image
                      source={require("../../Assets/Icons/correct_sign.png")}
                      style={{ height: 18, width: 18 }}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.doNotShowText}>Do not show this to me again.</Text>
              </View>

              <View style={styles.buttonsConatiner}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={props.removeButton}
                >
                  <Text style={styles.buttonText}>{t("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={ checked ? props.onRequestClose :props.exploreButton}
                >
                  <Text style={styles.buttonText}>
                    {checked ? t("ok") : t("Explore")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};
