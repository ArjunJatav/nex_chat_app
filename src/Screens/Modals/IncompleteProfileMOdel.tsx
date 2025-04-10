import React, { useEffect, useRef } from "react";
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

// eslint-disable-next-line
export const IncompleteProfileModel = (props: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity

  const { t } = useTranslation();

  useEffect(() => {
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
    button: {
      height: 50,
      marginTop: 10,
     // borderRadius: 10,
      borderBottomRightRadius:10,
      borderBottomLeftRadius:10,
      // position:"absolute",
       width:"50%",
     // bottom: 15,
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

    starIcon: {
      height: 150,
      width: "100%",
      // tintColor: textTheme().textColor,
      //marginLeft: 5,
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(52, 52, 52, 0.5)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
         <LinearGradient
                colors={CustomModel().BackColor}
                start={{ x: 0, y: 0.4 }} // Start at the top
                end={{ x: 0, y: 0 }}
                style={{
                  //  height: 150,
                  width: "85%",
                 borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
        
        <View
          style={{
         
           // backgroundColor: COLORS.white,
            // paddingHorizontal: 20,
            width: "100%",
           
          }}
        >
          
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop:10,
            }}
          >
            <Animated.Image
              source={require("../../Assets/Icons/Cry_Icon.png")}
              style={[
                styles.starIcon,
                {
                  opacity: fadeAnim, // Bind opacity to animated value
                  position:"relative",
                  left: 0,
              //   top: -55,
                  bottom: 0,
                  right: 0,
                },
              ]}
              resizeMode="contain"
            />
            {/* <LottieView
              source={recordingAnimation}
              autoPlay
              loop
              speed={0.5}
              style={[
                styles.starIcon,
                {
                  position: "absolute",
                  //backgroundColor:"red",
                  // width:"120%",
                  //  left: 0,
                  top: 0,
                  bottom: 0,
                  // right: 0,
                },
              ]}
            /> */}
          </View>
          <View style={{
          alignItems:"center"
            }}>
               <Text
            style={{
              fontSize: 28,
              fontFamily: font.bold(),
              color:iconTheme().textColorForNew,
             // marginBottom: 20,
              marginTop: 10,
            }}
          >
            {"Oops!"}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: font.regular(),
              color: COLORS.black,
              fontWeight:"400",
              marginBottom: 10,
              marginTop: 10,
              textAlign:"center",
              marginHorizontal:10
            }}
          >
            {props.errorText}
          </Text>

          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-around",
              height: 55,
              gap:12,
            marginBottom:10,
            paddingHorizontal:10,
            marginTop:20
            }}
          >
          <TouchableOpacity style={styles.button} onPress={props.cancelButton}>
              <Text style={styles.buttonText}>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={props.confirmButton}>
              <Text style={styles.buttonText}>{t("Proceed")}</Text>
            </TouchableOpacity>
          </View>
          </View>
         
        </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};
