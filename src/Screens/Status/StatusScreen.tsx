import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import {
  COLORS,
  iconTheme,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { StoryTimeConverter2 } from "../../Components/DateTimeFormat/TimeConverter";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { get_active_story, get_user_story } from "../../Constant/Api";
import { statusTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";

const isDarkMode = true;

// eslint-disable-next-line
export default function StatusScreen({ navigation }: any) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [content, setContent] = useState([]);
  const [getActiveStory, setActiveStory] = useState([]);
  const [loaderModel, setloaderModel] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setloaderModel(true);
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          Alert.alert(t("noInternet"), t("please_check_internet"), [
            { text: t("ok") },
          ]);
          setloaderModel(false);
          return;
        } else {
          getStoryApi();
          getActiveStoryApi();
        }
      });
    });
    return unsubscribe2;
  }, []);

  // **********   Headers for Get Profile Api  ********** ///cd
  const getStoryApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      get_user_story,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        userStoryApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********   Headers for Get Active Story Api  ********** ///cd
  const getActiveStoryApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
    };
    GetApiCall(
      get_active_story,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        getActiveStoryApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get profilr api Response   ********** ///
  // eslint-disable-next-line
  const getActiveStoryApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderModel(false);
    } else {
      setActiveStory(ResponseData.data);
      setloaderModel(false);
    }
  };

  // **********  Method for return the get user story api Response   ********** ///
  // eslint-disable-next-line
  const userStoryApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderModel(false);
    } else {
      setContent(ResponseData.data);
      setloaderModel(false);
    }
  };
  // ********** My Status Button     ********** ///
  const myStstusButton = () => {
    if (content.length > 0) {
      navigation.navigate("MyStatusScreen");
    } else {
      navigation.navigate("AddCameraStoryScreen");
    }
  };
  // ********** Friend Story viev screen    ********** ///
  // eslint-disable-next-line
  const storyView = (userId: any, userImage: any, userName: any) => {
    navigation.navigate("FriendStoryViewScreen", {
      userId: userId,
      userImage: userImage,
      userName: userName,
    });
  };
  const addTextStory = () => {
    navigation.navigate("AddTextStatusScreen");
  };

  const addCameraStory = async () => {
    navigation.navigate("AddCameraStoryScreen");
  };

  const styles = StyleSheet.create({
    recentUpdateText: {
      color: COLORS.light_black,
      marginTop: 15,
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
      marginBottom: 10,
    },
    inviteText: {
      color: COLORS.black,
      marginTop: 5,
      fontSize: 17,
      fontFamily: font.bold(),
      marginBottom: 10,
    },

    chatTopContainer: {
      backgroundColor: themeModule().theme_background,
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

    newChatText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: font.bold(),
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height:
        DeviceInfo.hasNotch() == true ? windowHeight - 190 : windowHeight - 170,
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },
    NoDataContainer: {
      marginTop: 100,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
    },

    timeText: {
      fontSize: 12,
      fontFamily: font.bold(),
      color: COLORS.grey,
    },
    tapToText: {
      fontSize: 12,
      fontFamily: font.bold(),
      color: COLORS.grey,
    },

    missCalText: {
      fontSize: 12,
      marginLeft: 20,
      fontFamily: font.bold(),
      color: "red",
    },

    myStatusContainer: {
      alignItems: "center",
      justifyContent: "space-between",
      margin: 0,
      flexDirection: "row",
      width: "100%",
    },
    recentStatusContainer: {
      alignItems: "center",
      justifyContent: "space-between",
      margin: 0,
      flexDirection: "row",
      width: "100%",
    },
    nameContainer: {
      justifyContent: "center",
      margin: 0,
      width: "65%",
      flexDirection: "column",
    },
    statusContainer: {
      justifyContent: "center",
      margin: 0,
      width: "65%",
      backgroundColor: "red",
      flexDirection: "column",
    },
    timeContainer: {
      margin: 0,
      width: "65%",
      flexDirection: "row",
    },
    tapToHereContainer: {
      margin: 0,
      width: "100%",
      flexDirection: "row",
      marginBottom: 5,
    },
    listContainer: {
      justifyContent: "center",
      margin: 5,
      marginTop: 10,
      flexDirection: "column",
    },
    Container: {
      justifyContent: "center",
      margin: 5,
      marginLeft: 0,
      width: "10%",
    },
    myStory: {
      width: 54,
      height: 54,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: iconTheme().iconColor,
      borderStyle: "solid",
    },

    recentStory: {
      width: 54,
      height: 54,
      borderRadius: 27,
      borderWidth: 2,
      borderColor: iconTheme().iconColor,
    },
    viewStory: {
      width: 54,
      height: 54,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: COLORS.grey,
    },
    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    plusImage1Layout: {
      width: 15,
      height: 15,
      margin: 2,
    },
    tImage1Layout: {
      width: 25,
      height: 25,
      margin: 12,
    },
    name1Text: {
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
      color: textTheme().textColor,
      paddingLeft: 10,
    },
    naContainer: {
      justifyContent: "center",
      margin: 0,
      width: "70%",
      flexDirection: "column",
    },
    name2Text: {
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.regular(),
      color: COLORS.grey,
      paddingLeft: 10,
    },
    plusImageContainer: {
      position: "absolute",
      right: DeviceInfo.isTablet() == true ? 27 : -5,
      bottom: DeviceInfo.isTablet() == true ? -5 : -10,
      backgroundColor: iconTheme().iconColor,
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    cameraDesign: {
      position: "absolute",
      bottom:
        DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
          ? 100
          : 40,
      right: 10,
    },
    cameraImageContainer: {
      position: "absolute",
      right: -5,
      bottom: -10,
      backgroundColor: iconTheme().iconColor,
      borderRadius: 25,
      height: 50,
      width: 50,
      justifyContent: "center",
    },
    teststatus: {
      position: "absolute",
      bottom:
        DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
          ? 160
          : 100,
      right: 10,
    },
    textStatusContainer: {
      position: "absolute",
      right: -5,
      bottom: -10,
      backgroundColor: iconTheme().iconColor,
      borderRadius: 25,
      height: 50,
      width: 50,
      justifyContent: "center",
    },
    circleviewLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderColor: COLORS.grey,
      borderWidth: 2,
    },
    editProfile: {
      borderRadius: 15,
      borderWidth: 1,
      height: 45,
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
    emptyContainer: {
      borderRadius: 15,
      borderWidth: 1,
      height: 45,
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
  });
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <LoaderModel visible={loaderModel} />
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        <TopBar
          showTitle={true}
          title={t("status")}
          checked={
            globalThis.selectTheme
          }
        />
        <View style={styles.chatTopContainer}></View>

        {
         
          globalThis.selectTheme === "christmas" || 
          globalThis.selectTheme === "newYear" || 
          globalThis.selectTheme === "newYearTheme" || 
          globalThis.selectTheme === "mongoliaTheme" ||
          globalThis.selectTheme === "mexicoTheme" || 
          globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={statusTop().BackGroundImage}
              resizeMode="cover" // Update the path or use a URL
              style={{
                height: "100%",
                width: windowWidth,
                marginTop: 0,
                position: "absolute",
                bottom: 0,
                zIndex: 0,
              }}
            ></ImageBackground>
          ) : null
        }
      </View>
      <View style={styles.chatContainer}>
        <TouchableOpacity
          style={styles.myStatusContainer}
          onPress={() => myStstusButton()}
        >
          <View style={styles.Container}>
            <View>
              <View style={styles.myStory}>
                <Image
                  source={{
                    uri: globalThis.userImage,
                  }}
                  style={styles.circleImageLayout}
                  resizeMode="cover"
                />
              </View>
            </View>
            {content.length > 0 ? null : (
              <View style={styles.plusImageContainer}>
                <Image
                  source={require("../../Assets/Icons/plus.png")}
                  style={styles.plusImage1Layout}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
          <View style={styles.naContainer}>
            <Text style={styles.name1Text}>{t("my_status")}</Text>
            {content.length > 0 ? (
              <Text style={[styles.name2Text]}>{t("tap_to_view_status")}</Text>
            ) : (
              <Text style={[styles.name2Text]}>
                {t("tap_here_to_add_status")}
              </Text>
            )}
          </View>

          <View style={styles.emptyContainer}></View>
        </TouchableOpacity>

        <View>
          <Text style={styles.recentUpdateText}>{t("recent_update")}</Text>
        </View>
        <View>
          <FlatList
            data={getActiveStory}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  style={styles.recentStatusContainer}
                  onPress={() =>
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    storyView(item.id, item.profile_image, item.name)
                  }
                >
                  <View style={styles.Container} key={index}>
                    <View style={styles.recentStory}>
                      {
                         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        item.profile_image ? ( // Conditional rendering based on userImage availability
                          <Image
                            source={{
                              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              uri: item.profile_image,
                            }}
                            style={styles.circleImageLayout}
                            resizeMode="cover"
                          />
                        ) : (
                          // Placeholder image or loading indicator
                          <Image
                            source={{
                              uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                            }}
                            style={styles.circleImageLayout}
                            resizeMode="cover"
                          />
                        )
                      }
                    </View>
                  </View>

                  <View style={styles.naContainer}>
                    <Text style={styles.name1Text}>
                      {
                        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        item.name
                      }
                    </Text>
                    <View style={styles.timeContainer}>
                      <StoryTimeConverter2
                        isoTime={
                          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          item.story_created_time
                        }
                      />
                    </View>
                  </View>
                  <View style={styles.emptyContainer}></View>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={() => {
              return <View style={{ height: 300 }}></View>;
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.teststatus}
          onPress={() => addTextStory()}
        >
          <TouchableOpacity
            style={styles.textStatusContainer}
            onPress={() => addTextStory()}
          >
            <Image
              source={require("../../Assets/Icons/tstyle.png")}
              style={styles.tImage1Layout}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cameraDesign}
          onPress={() => addCameraStory()}
        >
          <TouchableOpacity
            style={styles.cameraImageContainer}
            onPress={() => addCameraStory()}
          >
            <Image
              source={require("../../Assets/Icons/camera.png")}
              style={styles.tImage1Layout}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </MainComponent>
  );
}
