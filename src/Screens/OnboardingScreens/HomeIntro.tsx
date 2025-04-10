import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {  useSelector } from "react-redux";
import { COLORS } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize, IconSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import renderIf from "../../Components/renderIf";
const isDarkMode = true;
 // eslint-disable-next-line
export default function HomeIntroScreen({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
   // eslint-disable-next-line
  const { root } = useSelector((state: any) => state.root);
  const isNotch = DeviceInfo.hasNotch();
  const keyBoardMargin = isNotch == true ? 50 : 0;
  const [showModal, setShowModal] = useState(true);
  const [showHeader, setShowHeader] = useState(false);
  const [showThirdScreen, setShowThirdScreen] = useState(false);
  const [showFourthScreen, setShowFourthScreen] = useState(false);
  const [showFifthScreen, setShowFifthScreen] = useState(false);

  const clickToTheme = () => {
    setTimeout(() => {
      setShowModal(false);
      setShowHeader(true);
    }, 300); // 300 milliseconds delay
  };
  
  function OnsecondScreen() {
    setTimeout(() => {
      setShowModal(false);
      setShowHeader(false);
      setShowThirdScreen(true);
    }, 300); // 300 milliseconds delay
  }
  
  function OnThirdScreen() {
    setTimeout(() => {
      setShowModal(false);
      setShowHeader(false);
      setShowThirdScreen(false);
      setShowFourthScreen(true);
    }, 300); // 300 milliseconds delay
  }
  
  function OnFourthScreen() {
    setTimeout(() => {
      setShowModal(false);
      setShowHeader(false);
      setShowThirdScreen(false);
      setShowFourthScreen(false);
      setShowFifthScreen(true);
    }, 150); // 300 milliseconds delay
  }

  const goToHome = async () => {
    setShowFifthScreen(false);
    setTimeout(async () => {
      await AsyncStorage.setItem("seenIntroScreen", "true");
      navigation.push("BottomBar", { screen: "ChatScreen" });
    }, 200); // 300 milliseconds delay
  };
  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: DeviceInfo.isTablet() ? 20 : 20,
      marginTop: DeviceInfo.isTablet() ? 30 : 20,
      paddingBottom: 10,
    },
    newGroupText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    noDataText: {
      color: colorTheme ? COLORS.primary_blue : "#1F2024",
      fontSize: FontSize.font,
      fontFamily: font.regular(),
      fontWeight: "600",
    },
    chatTopContainer: {
      backgroundColor: colorTheme ? COLORS.primary_blue_light : COLORS.yellow,
      paddingBottom: 60,
    },
    newChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      borderColor: "#fff",
      borderRadius: 15,
    },
    ChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
      borderColor: "#fff",
      borderRadius: 15,
    },
    newChatInnerButton: {
      backgroundColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
      borderRadius: 15,
      borderWidth: 1,
      height: DeviceInfo.isTablet() ? 55 : 45,
      alignItems: "center",
      justifyContent: "center",
      width: DeviceInfo.isTablet() ? 180 : 140,
      borderColor: "transparent",
      flexDirection: "row",
    },
    newChatIcon: {
      height: DeviceInfo.isTablet() ? 25 : 20,
      width: DeviceInfo.isTablet() ? 25 : 20,
      tintColor: "#fff",
      marginRight: 10,
    },
    newChatText: {
      color: "#fff",
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      marginTop: root == "show header" ? -40 : 0,
      height:
        root == "show header"
          ? DeviceInfo.hasNotch() == true
            ? windowHeight - 200
            : windowHeight - 170
          : windowHeight,
    },
    chatContainer2: {
      height: "100%",
      width: windowWidth - 7,
      flexGrow: 1,
      marginBottom:
        Platform.OS == "android" ? (isNotch == true ? 10 : 10) : keyBoardMargin,
      marginTop: Platform.OS == "ios" ? 0 : root == "show header" ? 0 : 35,
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },
    NoDataContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    bottomContainer1: {
      position: "absolute",
      bottom:
        DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true ? 0 : 0,
      flexDirection: "column",
      justifyContent: "flex-end",
      backgroundColor: "#fff",
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: -2, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      borderTopColor: "#deddd9",
      elevation: 5,
    },
    bottomContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
  });


  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Exiting the app when back button is pressed on Android
      BackHandler.exitApp();
      return true; // Prevent default behavior (i.e., going back to the previous screen)
    });

    return () => backHandler.remove(); // Cleanup event listener on unmount
    }, []);

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={COLORS.yellow}
    >
      <CustomStatusBar
        barStyle={isDarkMode ? "dark-content" : "dark-content"}
        backgroundColor={COLORS.yellow}
      />

      {showHeader == false ? (
        <TopBar
          showTitle={true}
          title="Chats"
          showEdit={true}
          navState={navigation}
        />
      ) : (
        <View
          style={{
            height: DeviceInfo.hasNotch() == true ? 30 : 50,
            backgroundColor: COLORS.yellow,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ position: "absolute", left: 20 }}>
            <Text
              style={{
                color: COLORS.black,
                fontSize: FontSize.titleFont,
                fontFamily: font.semibold(),
              }}
            >
              Chats
            </Text>
          </View>
        </View>
      )}

      <Modal visible={showHeader} transparent>
        <TouchableOpacity
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(52, 52, 52, 0.8)",
          }}
          activeOpacity={0.9}
          onPress={() => {
            setTimeout(() => {
              OnsecondScreen();
            }, 200);
            }}
         /// onPress={OnsecondScreen}
        >
          {/* */}
          {Platform.OS == "android" ? (
            <View style={{ height: 50, width: "100%", alignItems: "flex-end" }}>
              <View style={{ justifyContent: "center", flexDirection: "row" }}>
                <Text style={{ color: "#fff", alignSelf: "center" }}>
                  ...Or here!
                </Text>
                <Image
                  source={require("../../Assets/Image/edit.png")}
                  style={{ height: 80, width: 80 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                position: "absolute",
                top: DeviceInfo.hasNotch() == true ? 70 : 30,
                right: 0,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", marginTop: 30 }}>...Or here!</Text>
              <Image
                source={require("../../Assets/Image/edit.png")}
                style={{ height: 80, width: 80 }}
                resizeMode="contain"
              />
            </View>
          )}

          <View
            style={{
              position: "absolute",
              bottom: 70,
              height: 50,
              backgroundColor: "#fff",
              width: "90%",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "transparent",
              borderRadius: 10,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: COLORS.purple }}>Next</Text>
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={styles.chatTopContainer}>
        <View style={styles.groupContainer}>
          {renderIf(
            showThirdScreen !== true,
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.newGroupText}>New Group</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity activeOpacity={0.7}></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            {renderIf(
              showFourthScreen == false,
              <Text style={styles.newGroupText}>New Broadcast</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chatContainer}>
        <View></View>
        {renderIf(
          showHeader == true ||
            showThirdScreen == true ||
            showFifthScreen == true,
          <View style={styles.NoDataContainer}>
            <Image
              source={require("../../Assets/Image/Home.png")}
              style={styles.HomeNoDataImage}
              resizeMode="contain"
            />
            <Text style={styles.noDataText}>
              Start a new chat and have a {"\n"} bun-tastic time!
            </Text>
            <TouchableOpacity style={styles.newChatButton}>
              <View style={styles.newChatInnerButton}>
                <Image
                  source={require("../../Assets/Icons/NotePen.png")}
                  style={styles.newChatIcon}
                />
                <Text style={styles.newChatText}>New Chat</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomContainer1}>
          <View style={styles.bottomContainer}>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                borderRadius: 0,
                padding: 0,
                height:
                  DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
                    ? 80
                    : 60,
                width: windowWidth / 5,
              }}
            >
              <Image
                style={{
                  height: IconSize.bottomTabIcon,
                  width: IconSize.bottomTabIcon,
                  tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
                }}
                resizeMode="contain"
                source={require("../../Assets/Icons/ChatBottom.png")}
              />
              <Text
                style={{
                  color: colorTheme ? COLORS.primary_blue : COLORS.purple,
                  marginTop: 2,
                  fontFamily: font.semibold(),
                  fontSize: FontSize.bottomTabFont,
                  marginBottom: 2,
                }}
              >
                Chats
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                borderRadius: 0,
                padding: 0,
                height:
                  DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
                    ? 80
                    : 60,
                width: windowWidth / 4,
              }}
            >
              <Image
                style={{
                  height: IconSize.bottomTabIcon,
                  width: IconSize.bottomTabIcon,
                  tintColor: "#000",
                }}
                resizeMode="contain"
                source={require("../../Assets/Icons/CallBottom.png")}
              />
              <Text
                style={{
                  color: "#000",
                  marginTop: 2,
                  fontFamily: font.semibold(),
                  fontSize: FontSize.bottomTabFont,
                  marginBottom: 2,
                }}
              >
                Calls
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                borderRadius: 0,
                height:
                  DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
                    ? 80
                    : 60,
                padding: 0,
                width: windowWidth / 4,
              }}
            >
              <Image
                style={{
                  height: IconSize.bottomTabIcon,
                  width: IconSize.bottomTabIcon,
                  tintColor: "#000",
                }}
                resizeMode="contain"
                source={require("../../Assets/Icons/StatusBottom.png")}
              />
              <Text
                style={{
                  color: "#000",
                  marginTop: 2,
                  fontFamily: font.semibold(),
                  fontSize: FontSize.bottomTabFont,
                  marginBottom: 2,
                }}
              >
                Status
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                borderRadius: 0,
                padding: 0,
                height:
                  DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
                    ? 80
                    : 60,
                width: windowWidth / 5,
              }}
            >
              <Image
                style={{
                  height: IconSize.bottomTabIcon,
                  width: IconSize.bottomTabIcon,
                  tintColor: "#000",
                }}
                resizeMode="contain"
                source={require("../../Assets/Icons/SettingBottom.png")}
              />
              <Text
                style={{
                  color: "#000",
                  marginTop: 2,
                  fontFamily: font.semibold(),
                  fontSize: FontSize.bottomTabFont,
                  marginBottom: 2,
                }}
              >
                Settings
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Modal transparent visible={showFifthScreen}>
        <TouchableOpacity
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(52, 52, 52, 0.8)",
          }}
          activeOpacity={0.9}
          onPress={() => {
           
              goToHome();
         
            }}
        >
          <Text
            style={{
              color: "#fff",
              bottom: 150,
              alignSelf: "center",
              position: "absolute",
            }}
          >
            Navigate to different sections of the app here!
          </Text>

          <View
            style={{
              position: "absolute",
              bottom: 240,
              height: 50,
              backgroundColor: "#fff",
              width: "90%",
              alignItems: "center",
              alignSelf: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "transparent",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: COLORS.purple }}>Next</Text>
          </View>
          <View
            style={[
              styles.bottomContainer1,
              {
                bottom: 50,
                width: "90%",
                alignSelf: "center",
                borderRadius: 10,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.bottomContainer,
                { borderRadius: 10, borderWidth: 1 },
              ]}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  padding: 0,

                  height:
                    DeviceInfo.hasNotch() == true ||
                    DeviceInfo.isTablet() == true
                      ? 80
                      : 60,
                  width: windowWidth / 5,
                }}
              >
                <Image
                  style={{
                    height: IconSize.bottomTabIcon,
                    width: IconSize.bottomTabIcon,
                    tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
                  }}
                  resizeMode="contain"
                  source={require("../../Assets/Icons/ChatBottom.png")}
                />
                <Text
                  style={{
                    color: colorTheme ? COLORS.primary_blue : COLORS.purple,
                    marginTop: 2,
                    fontFamily: font.semibold(),
                    fontSize: FontSize.bottomTabFont,
                    marginBottom: 2,
                  }}
                >
                  Chats
                </Text>
              </View>

              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  padding: 0,
                  height:
                    DeviceInfo.hasNotch() == true ||
                    DeviceInfo.isTablet() == true
                      ? 80
                      : 60,
                  width: windowWidth / 4,
                }}
              >
                <Image
                  style={{
                    height: IconSize.bottomTabIcon,
                    width: IconSize.bottomTabIcon,
                    tintColor: "#000",
                  }}
                  resizeMode="contain"
                  source={require("../../Assets/Icons/CallBottom.png")}
                />
                <Text
                  style={{
                    color: "#000",
                    marginTop: 2,
                    fontFamily: font.semibold(),
                    fontSize: FontSize.bottomTabFont,
                    marginBottom: 2,
                  }}
                >
                  Calls
                </Text>
              </View>

              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  height:
                    DeviceInfo.hasNotch() == true ||
                    DeviceInfo.isTablet() == true
                      ? 80
                      : 60,
                  padding: 0,
                  width: windowWidth / 4,
                }}
              >
                <Image
                  style={{
                    height: IconSize.bottomTabIcon,
                    width: IconSize.bottomTabIcon,
                    tintColor: "#000",
                  }}
                  resizeMode="contain"
                  source={require("../../Assets/Icons/StatusBottom.png")}
                />
                <Text
                  style={{
                    color: "#000",
                    marginTop: 2,
                    fontFamily: font.semibold(),
                    fontSize: FontSize.bottomTabFont,
                    marginBottom: 2,
                  }}
                >
                  Status
                </Text>
              </View>

              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  padding: 0,
                  height:
                    DeviceInfo.hasNotch() == true ||
                    DeviceInfo.isTablet() == true
                      ? 80
                      : 60,
                  width: windowWidth / 5,
                }}
              >
                <Image
                  style={{
                    height: IconSize.bottomTabIcon,
                    width: IconSize.bottomTabIcon,
                    tintColor: "#000",
                  }}
                  resizeMode="contain"
                  source={require("../../Assets/Icons/SettingBottom.png")}
                />
                <Text
                  style={{
                    color: "#000",
                    marginTop: 2,
                    fontFamily: font.semibold(),
                    fontSize: FontSize.bottomTabFont,
                    marginBottom: 2,
                  }}
                >
                  Settings
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={showFourthScreen}>
        <TouchableOpacity
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(52, 52, 52, 0.8)",
          }}
          activeOpacity={0.9}
          onPress={() => {
            setTimeout(() => {
              OnFourthScreen();
            }, 100);
            }}
         // onPress={OnFourthScreen}
        >
          <Image
            source={require("../../Assets/Image/broadcast.png")}
            style={{
              height: 100,
              width: 120,
              top:
                Platform.OS == "ios" ? (DeviceInfo.hasNotch() ? 100 : 75) : 35,
              alignSelf: "flex-end",
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "#fff",
              top:
                Platform.OS == "ios" ? (DeviceInfo.hasNotch() ? 80 : 50) : 20,
              alignSelf: "flex-end",
              marginRight: 20,
            }}
          >
            Send broadcast message here
          </Text>

          <View
            style={{
              position: "absolute",
              bottom: 70,
              height: 50,
              backgroundColor: "#fff",
              width: "90%",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "transparent",
              borderRadius: 10,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: COLORS.purple }}>Next</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={showThirdScreen}>
        <TouchableOpacity
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(52, 52, 52, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={0.9}
          onPress={() => {
            setTimeout(() => {
              OnThirdScreen();
            }, 200);
            }}
        //  onPress={OnThirdScreen}
        >
          <Image
            source={require("../../Assets/Image/group.png")}
            style={{
              height: 100,
              width: 120,
              position: "absolute",
              top:
                Platform.OS == "ios" ? (DeviceInfo.hasNotch() ? 110 : 75) : 35,
              left: 0,
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "#fff",
              position: "absolute",
              top:
                Platform.OS == "ios"
                  ? DeviceInfo.hasNotch()
                    ? 190
                    : 150
                  : 110,
              left: 20,
            }}
          >
            Create a group chat here
          </Text>

          <View
            style={{
              position: "absolute",
              bottom: 70,
              height: 50,
              backgroundColor: "#fff",
              width: "90%",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "transparent",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: COLORS.purple }}>Next</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={showModal}>
        <TouchableOpacity
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(52, 52, 52, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={0.9}
          onPress={() => {
            setTimeout(() => {
              clickToTheme();
            }, 200);
            }}
          //onPress={clickToTheme}
        >
          <Image
            source={require("../../Assets/Image/HomeIntro.png")}
            style={{
              height: windowHeight - 230,
              width: windowWidth,
              marginTop: 50,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </MainComponent>
  );
}
