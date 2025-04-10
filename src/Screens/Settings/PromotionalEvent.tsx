import NetInfo from "@react-native-community/netinfo";
import React, {useEffect, useState } from "react";
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
import { COLORS, textTheme, themeModule } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { TimeConverter } from "../../Components/DateTimeFormat/TimeConverter";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { notifications_list } from "../../Constant/Api";
import { chatTop, noDataImage, settingTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";

const isDarkMode = true;

// eslint-disable-next-line
export default function NotificationScreen({ navigation }: any) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderMoedl] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [content, setContent] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          // Alert.alert(t("noInternet"), t("please_check_internet"), [
          //   { text: t("ok") },
          // ]);
setNoInternetModel(true);
          return;
        } else {
          getNotificationApi();
          setloaderMoedl(true);
        }
      });
    });
    return unsubscribe2;
  }, []);

  // **********   Headers for Get Terms ANd Condition  ********** ///cd
  const getNotificationApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      "localization":globalThis.selectLanguage,
    };
    GetApiCall(
      notifications_list,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        notidicationApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get  api Response   ********** ///
  // eslint-disable-next-line
  const notidicationApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);  
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr; 
      setErrorAlertModel(true);
    } else {
      setContent(ResponseData.data);
      setloaderMoedl(false);
    }
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },

    chatTopContainer: {
      backgroundColor: themeModule().theme_background,
      paddingBottom: 20,
    },

    chatContainer: {
      backgroundColor: "white",
      borderWidth: 10,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },

    recentStatusContainer: {
      justifyContent: "space-between",
      margin: 0,
      flexDirection: "row",
      width: "100%",
      borderBottomColor: COLORS.grey,
      borderBottomWidth: 0.2,
      paddingBottom:10
    },

    timeContainer: {
      margin: 0,
      // width: "65%",
      flexDirection: "row",
    },

    Container: {
      justifyContent: "center",
      margin: 5,
      marginLeft: 0,
      width: "10%",
    },

    recentStory: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },

    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },

    name1Text: {
      fontSize: DeviceInfo.isTablet() ? 20 : 15,
      fontFamily: font.semibold(),
      paddingLeft: 10,
      color: COLORS.black,
    },
    naContainer: {
      justifyContent: "center",
      width: "60%",
      flexDirection: "column",
    },
    name2Text: {
      fontSize: DeviceInfo.isTablet() ? 18 : 13,
      fontFamily: font.regular(),
      color: COLORS.grey,
      paddingLeft: 10,
    },
    timeText: {
      fontSize: DeviceInfo.isTablet() ? 18 : 13,
      fontFamily: font.regular(),
      color: COLORS.black,
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },

    timetextContainer: {
      borderColor: "transparent",
      width: "20%",
      justifyContent: "center",
    },
    NoDataContainer: {
      height: windowHeight - 80,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    noDataText: {
      color: textTheme().textColor,
      fontSize: 18,
      fontFamily: font.bold(),
      fontWeight: "500",
    },
  });

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      {/* // **********  Status Bar    ********** // */}

      <LoaderModel visible={loaderModel} />
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
      <NoInternetModal
        visible={noInternetModel}
        onRequestClose={() => setNoInternetModel(false)}
        headingTaxt={t("noInternet")}
        NoInternetText={t("please_check_internet")}
        cancelButton={() => setNoInternetModel(false)}
      />
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
          showTitleForBack={true}
          title={t("notification")}
          backArrow={true}
          checked={
            globalThis.selectTheme
          }
          navState={navigation}
        />
      
    {
            
            globalThis.selectTheme === "christmas" || 
            globalThis.selectTheme === "newYear" || 
            globalThis.selectTheme === "newYearTheme" ||
            globalThis.selectTheme === "mongoliaTheme" || 
            globalThis.selectTheme === "mexicoTheme" || 
            globalThis.selectTheme === "indiaTheme" ||
            globalThis.selectTheme === "englandTheme" ||
            globalThis.selectTheme === "americaTheme" ||
            globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={settingTop().BackGroundImage}
              resizeMode="cover"
              style={{
                height: "100%",
                width: windowWidth,
                marginTop: 0,
                position: "absolute",
                bottom: 0,
                zIndex: 0,
                top:  chatTop().top
              }}
            ></ImageBackground>
          ) : null
        }
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>
      {/* // ********** View for Profile View    ********** // */}

      <View style={styles.chatContainer}>
        <View>
          {content.length <= 0  && loaderModel == false ? (
            <View style={styles.NoDataContainer}>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Image
                  source={noDataImage().Image}
                  style={styles.HomeNoDataImage}
                  resizeMode="contain"
                />

                <Text style={styles.noDataText}>{t("no_notification")}</Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={content}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              bounces={false}
              contentContainerStyle={{
                paddingBottom:150
              }}
              // eslint-disable-next-line
              renderItem={({ item, index }: any) => {
                return (
                  <View style={styles.recentStatusContainer}>
                    <View style={styles.Container} key={index}>
                      <TouchableOpacity style={styles.recentStory}>
                        <Image
                          source={{
                            uri: item.from_user.profile_image,
                          }}
                          style={styles.circleImageLayout}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.naContainer}>
                      <Text style={styles.name1Text}>{item.title}</Text>
                      <View style={styles.timeContainer}>
                        <Text style={styles.name2Text}>{item.body}</Text>
                      </View>
                    </View>
                    <View style={styles.timetextContainer}>
                 
                      <TimeConverter isoTime={item.created_at} />
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </MainComponent>
  );
}
