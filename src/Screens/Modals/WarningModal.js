// import React from "react";
// import { Modal, View, Text, TouchableOpacity } from "react-native";
// import { useSelector } from "react-redux";

// const WarningModal = ({ visible, type, onClose, message }) => {

//     const suspendedDays = useSelector((state) => state.userBanSlice.suspendedDays);
//   const getTitle = () => {
//     if (type === "ban") return "Account Suspended";
//     if (type === "cannotCreate") return "Access Restricted";
//     return "Warning!";
//   };

//   const getSymble = () => {
//     if (type === "ban") return "🚫";
//     if (type === "cannotCreate") return "❌";
//     return "⚠️";
//   };

//   const getButtonText = () => {
//     return "OK";
//   };

//   const getMessage = () => {
//     if (type === "ban") {
//       return `Your account has been suspended for ${suspendedDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
//     }
//     if (type === "cannotCreate") {
//       return `Your account is suspended. You cannot create a group or channel. Please wait for ${suspendedDays} day(s) for your suspension to be lifted.`
//      // return "You cannot create a group, channel, or broadcast while your account is suspended. Please wait until your suspension is lifted.";
//     }
//     return "Your content violates our community guidelines. Please maintain a respectful and positive environment. Continued misuse may result in restricted access or account suspension.";
//   };

//   const getButtonColor = () => {
//     return type === "ban" || type === "cannotCreate" ? "#D32F2F" : "#FFA726"; // Red for bans and cannot create, orange for warnings
//   };
//   return (
//     <Modal
//       transparent={true}
//       animationType="fade"
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.modalContainer}>
//           <Text style={styles.warningIcon}>{getSymble()}</Text>
//           <Text style={styles.title}>{getTitle()}</Text>
//           <Text style={styles.message}>
//           {message || getMessage()}
//           </Text>
//           <TouchableOpacity style={styles.button} onPress={onClose}>
//             <Text style={styles.buttonText}>{getButtonText()}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = {
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContainer: {
//     width: "80%",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 20,
//     alignItems: "center",
//   },
//   warningIcon: {
//     fontSize: 40,
//     marginBottom: 10,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#D32F2F",
//     marginBottom: 10,
//   },
//   message: {
//     fontSize: 16,
//     textAlign: "center",
//     color: "#333",
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: "#D32F2F",
//     borderRadius: 5,
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// };

// export default WarningModal;



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
import { useSelector } from "react-redux";

// eslint-disable-next-line
 const WarningModal = ({visible, type, onClose, message, title}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity

  const { t } = useTranslation();

  const suspendedDays = useSelector((state) => state.userBanSlice.suspendedDays);

    const getTitle = () => {
      if (type === "Ban") return "Account Restricted!";
      if (type === "cannotCreate") return "Access Restricted!";
      return "Warning!";
    };
  
    const getSymble = () => {
      if (type === "Ban") return "🚫";
      if (type === "cannotCreate") return "❌";
      return "⚠️";
    };
  
    const getButtonText = () => {
      return "OK";
    };
  
    const getMessage = () => {
      if (type === "Ban") {
        // return `Your account has been suspended for ${suspendedDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
     //return `Your account has been suspended for ${suspendedDays} day(s) due to the upload of inappropriate content that violates our community guidelines. Please adhere to our policies to avoid permanent suspension.`
   // return `Your account has been suspended for ${suspendedDays} day(s) due to the use of inappropriate language that violates our community guidelines. Please follow our policies to avoid permanent suspension.` 
   return `Your account has been restricted for ${suspendedDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent restrictions.`
  }
      if (type === "cannotCreate") {
       // return `Your account is suspended. You cannot create a group or channel. Please wait for ${suspendedDays} day(s) for your suspension to be lifted.`
       // return "You cannot create a group, channel, or broadcast while your account is suspended. Please wait until your suspension is lifted.";
      return `Your account is restricted due to repeated violations of our community guidelines. You cannot create a group or channel. Please wait for ${suspendedDays} day(s) for your access to be restored.`
      }
      return "Your content violates our community guidelines. Please maintain a respectful and positive environment. Continued misuse may result in restricted access or account suspension.";
    };
  

  useEffect(() => {
    if (visible) {
      // Check if the modal is visible
      fadeAnim.setValue(0); // Reset opacity to 0 before starting animation
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade in
        duration: 2000, // Animation duration
        useNativeDriver: true, // Use native driver for performance
      }).start();
    }
  }, [fadeAnim, visible]);

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
       width:"100%",
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
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
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
            {title || getTitle()}
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
             {message || getMessage()}
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </View>
         
        </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};
export default WarningModal;