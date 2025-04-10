import React, { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  Share,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";

import DeviceInfo from "react-native-device-info";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import {
  COLORS,
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

const isDarkMode = true;

// eslint-disable-next-line
export default function MyScannerScreen({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderModel] = useState(false);

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
      position:"relative",
      height: DeviceInfo.hasNotch() ? windowHeight  : windowHeight,
    },
    content: {
      color: "black",
      fontSize: 18,
      fontFamily: font.regular(),
      marginHorizontal: 10,
      marginTop: 20,
    },
    Image: {
      height: 250,
      width: 250,
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
    
      <View style={styles.chatContainer}>
      
        <View
          style={{
            backgroundColor: QrTokee().qrbackgroundColor,
            position: "relative",
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 20,
            borderRadius: 10,
            // flexDirection: "column",
          }}
        >

      <View style={{
            height: 100,
            // width: "100%",
            left:0,
            right:0,
            // backgroundColor:"red",
            zIndex:500,
            top:-90,
            // bottom:0,
            position:"absolute",
            // backgroundColor:"red"
          //  tintColor: QrTokee().iconColor,
          }}>
      <Image
          // source={IMAGES.bx_bot}
          source={require("../../Assets/Icons/qrbunny.png")}
          resizeMode="contain"
          style={{
            width: "100%",
            height: "100%",
          //  tintColor: QrTokee().iconColor,
          }}
        />
      </View>
     
       
          <View
            style={{
              backgroundColor: COLORS.white,
              padding: 10,
              borderRadius: 10,
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
                alignItems: "flex-end",
                justifyContent: "flex-start",
                height: 120,
                width: 120,
               // zIndex:1001,
                position:"absolute",
               right:0,
               top:-80,
                flexDirection: "column",
                // backgroundColor:"red"
              }}
            >
             
             
            </View>

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: 50,
                width: 50,
                zIndex:1001,
                position:"absolute",
               right:108,
               top:108,
                flexDirection: "column",
                 backgroundColor:QrTokee().qrbackgroundColor,
                 borderRadius:20,
           
              }}
            >
             
                <Image
                  // source={IMAGES.bx_bot}
                  source={require("../../Assets/Icons/ChatBottom.png")}
                  resizeMode="contain"
                  style={{
                    width: 35,
                 // right:10,
                    height: 35,
                    alignSelf:"center",
                   tintColor: QrTokee().qrbackgroundiconColor,
                  }}
                />
             
            </View>

            
          </View>
          <View>
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
          </View> 
        </View>
      </View>
    </MainComponent>
  );
}
