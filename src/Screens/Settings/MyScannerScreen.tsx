import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Share,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Animated
} from "react-native";

import DeviceInfo from "react-native-device-info";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import {
  COLORS,
  iconTheme,
  QrTokee,
  themeModule,
} from "../../Components/Colors/Colors";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
import { LoaderModel } from "../Modals/LoaderModel";
import { t } from "i18next";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
const isDarkMode = true;

// eslint-disable-next-line
export default function MyScannerScreen({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderModel] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(1)).current;

    // Array of image sources
    const images = [
      require('../../Assets/Icons/yokee.png'),
      require('../../Assets/Icons/toby.png'),
      require('../../Assets/Icons/Layer_1.png'),
      require('../../Assets/Icons/jokee.png'),
      require('../../Assets/Icons/furlee.png'),
      require('../../Assets/Icons/duckee.png'),
      require('../../Assets/Icons/doramp.png'),
      require('../../Assets/Icons/cloudy.png'),
      require('../../Assets/Icons/carrotkee.png'),
      require('../../Assets/Icons/brain.png'),
      require('../../Assets/Icons/qrbunny.png'),
    ];
  
    // State to track the current image index
    const [currentIndex, setCurrentIndex] = useState(0);
  
    // Function to change the image
    const changeImage = () => {
      ReactNativeHapticFeedback.trigger("impactHeavy", {
        enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    })
      // Update the index to the next image, or loop back to the first one
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

  useEffect(() => {}, []);
  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },

    cancelText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },

    chatTopContainer: {
      backgroundColor: themeModule().theme_background,
      paddingBottom: 20,
    },
    nameInputTextContainer: {
      marginRight: 16,
      marginLeft: 16,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },
    chatContainer: {
      backgroundColor: themeModule().theme_background,
      justifyContent: "center",
      alignItems: "center",
      flexDirection:"row",
      position:"relative",
      height: windowHeight + (Platform.OS == "ios" ? 0 : 50),
      paddingHorizontal:10,
      
    },
    content: {
      color: "black",
      fontSize: 18,
      fontFamily: font.regular(),
      marginHorizontal: 10,
      marginTop: 20,
    },
    Image: {
      height: WINDOW_WIDTH-100,
      width: WINDOW_WIDTH-100,
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    backgroundImage: {
      height: 300,
      width: 300,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
  });

  const message_data = "Lets chat on Tokee, Join me at - " + globalThis.myScanner;

  const shareOptions = {
    title: "Title",
    message: message_data, 
    subject: "Subject",
  };

  const Inviteuser = () => {
    Share.share(shareOptions);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnimation, {
      toValue: 0.95, // Scale down
      friction: 3,   // Adjust friction for bounce effect
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,    // Scale back to original
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <LoaderModel
        visible={loaderModel}
        onRequestClose={() => setloaderModel(false)}
        cancel={() => setloaderModel(false)}
      />
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {/* // **********  Status Bar    ********** // */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        {/* <LoaderModel visible={loaderModel} /> */}

        {/* // ********** Title Text   ********** // */}
        <TopBar
          showTitleForBack={true}
          title={t("my_qr_code")}
          backArrow={true}
          navState={navigation}
          shareIcon={true}
          checked={
            globalThis.selectTheme
          }
          clickShareIcon={Inviteuser}
        />
      </View>
      {/* // ********** View for Profile View    ********** // */}
    
      <Pressable style={styles.chatContainer}>
        <Animated.View
          style={{
            width:"100%",
            backgroundColor: QrTokee().qrbackgroundColor,
            position: "relative",
            paddingHorizontal: 15,
            paddingTop: 15,
            paddingBottom: 15,
            borderRadius: 16,
            transform: [{ scale: scaleAnimation }],
           // backgroundColor:"red"
            // flexDirection: "column",
          }}
        >

      <Pressable
      style={{
            height: 200,
            // width: "100%",
            left:0,
            right:0,
            // backgroundColor:"red",
            zIndex:0,
            top:-138,
            // bottom:0,
            position:"absolute",
           //  backgroundColor:"red"
          //  tintColor: QrTokee().iconColor,
          }}>
      <Image
          // source={IMAGES.bx_bot}
          source={images[currentIndex]}
          resizeMode="contain"
          style={{
            width: "100%",
            height: "100%",
          //  tintColor: QrTokee().iconColor,
          }}
        />
      </Pressable>
     
       
          <Pressable
          onPressIn={handlePressIn}  // Add event handlers for touch events
          onPressOut={handlePressOut}  onPress={changeImage}
            style={{
              backgroundColor: COLORS.white,
              paddingVertical: 20,
              borderRadius: 16,
              flexDirection:"row",
              alignItems:"center",
              justifyContent:"center"
            }}
          >
           
            <Image
              style={[styles.Image,{zIndex:20}]}
              source={{
                uri: globalThis.myScanner,
              }}
              resizeMode="contain"
            />
          

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: 55,
                width: 55,
                zIndex:1001,
                position:"absolute",
              //  right:108,
              //  top:"auto",
              //  bottom:0,
                flexDirection: "column",
                 backgroundColor:iconTheme().iconColorNew,
                 borderRadius:100,
           
              }}
            >
             
                <Image
                  // source={IMAGES.bx_bot}
                  source={images[currentIndex]}
                  resizeMode="contain"
                  style={{
                    width: 45,
                 // right:10,
                    height: 45,
                    alignSelf:"center",
                 //  tintColor: QrTokee().qrbackgroundiconColor,
                  }}
                />
             
            </View>

            
          </Pressable>
          <Pressable
          onPressIn={handlePressIn}  // Add event handlers for touch events
          onPressOut={handlePressOut}  onPress={changeImage}
          >
          <Text
                style={{
                  // width: 190,
                  // paddingLeft: 20,
                  paddingTop: 15,
                  color: QrTokee().qrbackgroundtextColor,
                  fontSize: 20,
                  fontFamily: font.bold(),
                  textAlign:"center"
                }}
                numberOfLines={1}
              >
                {
                   globalThis.userName.toUpperCase()
                
                }
          </Text>
          </Pressable>
           
        </Animated.View>
      </Pressable>
    </MainComponent>
  );
}
