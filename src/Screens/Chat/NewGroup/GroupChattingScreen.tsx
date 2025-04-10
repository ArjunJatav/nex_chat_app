import React, { useContext } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { COLORS } from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { font } from "../../../Components/Fonts/Font";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";

const isDarkMode = true;

export default function GroupChatScreen({ navigation, route }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const buttonPress = () => {
    navigation.navigate("GroupPeofileScreen", {
      group_name: route.params.group_name,
      selected_data: route.params.selected_data,
    });
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },

    newGroupText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      fontSize: 15,
      fontFamily: font.bold(),
    },

    chatTopContainer: {
      backgroundColor: colorTheme ? COLORS.primary_blue_light : COLORS.white,
      paddingBottom: 60,
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

    chatContainer: {
      backgroundColor: colorTheme ? COLORS.white : COLORS.primary_blue_light,
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },
    chatReciveContainer: {
      backgroundColor: colorTheme ? COLORS.primary_blue_light : COLORS.white,
      flexDirection: "column",
      marginTop: 10,
      borderBottomRightRadius: 10,
      borderTopRightRadius: 10,
      borderBottomLeftRadius: 20,
    },
    chatSendContainer: {
      backgroundColor: colorTheme ? COLORS.secondry_blue : COLORS.yellow_light,
      flexDirection: "row",
      marginTop: 10,
      borderBottomLeftRadius: 10,
      borderTopLeftRadius: 10,
      borderBottomRightRadius: 20,
    },
    receiverText: {
      fontSize: 14,
      margin: 10,
      fontFamily: font.medium(),
      color: COLORS.black,
    },
    sendText: {
      fontSize: 14,
      margin: 10,
      fontFamily: font.medium(),
      color: COLORS.black,
    },
    profile1Container: {
      marginTop: 20,
      flexDirection: "row",
      height: 50,
    },
    Container: {
      justifyContent: "center",
      width: "10%",
    },
    Container1: {
      justifyContent: "center",
      width: "10%",
    },
    circleImageLayout: {
      width: 45,
      height: 45,
      borderRadius: 23,
    },
    plusImageLayout: {
      width: 25,
      height: 25,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    nameInviteContainer: {
      justifyContent: "center",
      marginLeft: 10,
      width: "52%",
      flexDirection: "column",
    },
    name1conText: {
      fontSize: DeviceInfo.isTablet() ? 18 : 13,
      fontFamily: font.bold(),
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      paddingLeft: 10,
    },
    name2conText: {
      fontSize: 10,
      fontFamily: font.medium(),
      color: COLORS.black,
      paddingLeft: 10,
    },

    plusImageContainer: {
      position: "absolute",
      right: DeviceInfo.isTablet() == true ? 40 : 0,
      bottom: 48,
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    editProfile: {
      marginLeft: 10,
      flexDirection: "row",
      width: "25%",
      justifyContent: "center",
      alignItems: "center",
    },
    newChatIcon: {
      height: DeviceInfo.isTablet() ? 32 : 25,
      width: DeviceInfo.isTablet() ? 32 : 25,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginRight: 20,
    },
    newCallIcon: {
      height: DeviceInfo.isTablet() ? 32 : 25,
      width: DeviceInfo.isTablet() ? 32 : 25,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginRight: 10,
    },
    plusImage1Layout: {
      width: 20,
      height: 20,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    backIcon: {
      height: 22,
      width: 22,
      tintColor: COLORS.black,
    },
    chatBox: {
      height: 60,
      backgroundColor: "white",
      borderRadius: 30,
      justifyContent: "center",
      width: "100%",
      position: "absolute",
      elevation: 5,
      bottom:
        DeviceInfo.hasNotch() == true || DeviceInfo.isTablet()
          ? 160
          : Platform.OS === "ios"
          ? 140
          : 100,
    },
    plusIconDesign: {
      width: "10%",
      justifyContent: "center",
      paddingLeft: 10,
    },
    plusIcon1Design: {
      width: "10%",
      justifyContent: "center",
    },
  });
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={colorTheme ? COLORS.primary_blue_light : COLORS.white}
    >
      {DeviceInfo.hasNotch() == true ? null : (
        <CustomStatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={
            colorTheme ? COLORS.primary_blue_light : COLORS.white
          }
        />
      )}

      <View style={styles.chatTopContainer}>
        <View style={styles.groupContainer}>
          <View style={styles.profile1Container}>
            <TouchableOpacity
              style={styles.Container1}
              onPress={() => {
                navigation.pop();
              }}
            >
              <Image
                source={require("../../../Assets/Icons/Back_Arrow.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Container}
              onPress={() => buttonPress()}
            >
              <Image
                source={require("../../../Assets/Image/girl_profile.png")}
                style={styles.circleImageLayout}
                resizeMode="contain"
              />
              {/* <View style={styles.plusImageContainer}>
                <Image
                  source={require("../../../Assets/Icons/Chat_top.png")}
                  style={styles.plusImage1Layout}
                  resizeMode="contain"
                />
              </View> */}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nameInviteContainer}
              onPress={() => buttonPress()}
            >
              <Text style={styles.name1conText}>{route.params.group_name}</Text>
              <Text style={styles.name2conText}>
                {route.params.selected_data.length} Members
              </Text>
            </TouchableOpacity>
            <View style={styles.editProfile}>
              <Image
                source={require("../../../Assets/Icons/Video.png")}
                style={styles.newChatIcon}
                resizeMode="contain"
              />

              <Image
                source={require("../../../Assets/Icons/CallBottom.png")}
                style={styles.newCallIcon}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.chatContainer}>
        <View style={{ width: "50%", flexDirection: "row" }}>
          <View style={styles.chatReciveContainer}>
            <Text style={styles.receiverText}>Hello 👋, How ?</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <View style={styles.chatSendContainer}>
            <Text style={styles.sendText}>Hello, How are you?</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <View style={styles.chatSendContainer}>
            <Text style={styles.sendText}>Whats Going on Bro?</Text>
          </View>
        </View>

        <View style={styles.chatBox}>
          <View style={{ flexDirection: "row", width: "100%" }}>
            <View style={styles.plusIconDesign}>
              <Image
                source={require("../../../Assets/Icons/plus.png")}
                style={styles.plusImageLayout}
                resizeMode="contain"
              />
            </View>
            <View
              style={{
                width: "60%",
                justifyContent: "center",
                paddingLeft: 10,
              }}
            >
              <TextInput
                style={{ fontFamily: font.medium() }}
                placeholderTextColor={COLORS.grey}
                onSubmitEditing={()=>Keyboard.dismiss()}

                placeholder="Text here .. "
              />
            </View>
            <View style={styles.plusIcon1Design}>
              <Image
                source={require("../../../Assets/Icons/File_Share.png")}
                style={styles.plusImageLayout}
                resizeMode="contain"
              />
            </View>
            <View style={styles.plusIcon1Design}>
              <Image
                source={require("../../../Assets/Icons/Mike.png")}
                style={styles.plusImageLayout}
                resizeMode="contain"
              />
            </View>
            <View style={styles.plusIcon1Design}>
              <Image
                source={require("../../../Assets/Icons/Send_message.png")}
                style={styles.plusImageLayout}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>
    </MainComponent>
  );
}
