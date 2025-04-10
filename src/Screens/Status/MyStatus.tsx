import NetInfo from "@react-native-community/netinfo";
import React, { useContext, useEffect, useState } from "react";
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
import { MyStoryTimeConverter } from "../../Components/DateTimeFormat/TimeConverter";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import {
  delete_story,
  get_story_count,
  get_user_story,
} from "../../Constant/Api";
import { chatTop, statusTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";
import { useSelector } from "react-redux";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
const isDarkMode = true;
let premiumAlertHeading = "";
let premiumAlertSubHeading = "";
let premiumAlertFirstButtonText = "";
let premiumAlertSecondButtonText = "";

// eslint-disable-next-line
export default function MyStatusScreen({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [content, setContent] = useState([]);
  const { t } = useTranslation();
  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );
  const [loaderModel, setloaderModel] = useState(false);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);

  const nonPremiumStoryLimit = useSelector(
    (state: any) => state?.premiumLimitSlice?.nonPremiumStoryLimit
  );

  // **********   Focus on screen  ********** ///
  useEffect(() => {
    setloaderModel(true);
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          setloaderModel(false);
          setNoInternetModel(true);
          // Alert.alert(t("noInternet"), t("please_check_internet"), [
          //   { text: t("ok") },
          // ]);

          return;
        } else {
          getStoryApi();
          setloaderModel(true);
        }
      });
    });
    return unsubscribe2;
  }, []);

  // **********   Headers for Get Story Api  ********** ///
  const getStoryApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      localization: globalThis.selectLanguage,
      Authorization: "Bearer " + globalThis.Authtoken,
    };
    GetApiCall(
      get_user_story,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        profileApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get profilr api Response   ********** ///
  // eslint-disable-next-line
  const profileApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      setloaderModel(false);
      globalThis.errorMessage = ErrorStr; 
      setErrorAlertModel(true);
      
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);

      // setloaderModel(false);
    } else {
      setloaderModel(false);
      setContent(ResponseData.data);

      if (ResponseData.data == "") {
        globalThis.allDelete = true;
        // navigation.navigate("StatusScreen");
        // navigation.navigate("BottomBar", { screen: "chatScreen" });
      }
    }
    setloaderModel(false);
  };

  // **********   Headers for Get Story Api  ********** ///cd
  // eslint-disable-next-line
  const deleteStatusApi = async (id: any) => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        setNoInternetModel(true);
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);

        return;
      } else {
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          localization: globalThis.selectLanguage,
          Authorization: "Bearer " + globalThis.Authtoken,
        };

        GetApiCall(
          delete_story + id,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            deleteApiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  // **********  Method for return the get  api Response   ********** ///
  // eslint-disable-next-line
  const deleteApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      getStoryApi();
      globalThis.successMessage = ResponseData.message;
      setSuccessAlertModel(true);

      // Alert.alert(t("success"), ResponseData.message, [
      //   { text: t("ok"), onPress: () => getStoryApi() },
      // ]);
    }
  };

  // **********   Navigator to MyStatusViewScreen  ********** ///

  // eslint-disable-next-line
  const statusView = (index: any) => {
    navigation.navigate("MyStatusViewScreen", { index: index });
  };

  // **********   Confirm alert for delete status ********** ///

  // eslint-disable-next-line
  const deleteConfirmation = (id: any) => {
    globalThis.selectedId = id;
    setConfirmAlertModel(true);
    // Alert.alert(t("confirm"), t("do_you_want_delete_story"), [
    //   { text: t("cancel") },
    //   { text: t("yes"), onPress: () => deleteStatusApi(id) },
    // ]);
  };

  const addTextStory = () => {
    const paramToSend = "TextStory";
    OnStoryUpload(paramToSend);
    //navigation.navigate("AddTextStatusScreen");
  };

  function OnStoryUpload(value) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    GetApiCall(
      get_story_count,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        countApiSuccess(ResponseData, ErrorStr, value);
      }
    );
  }

  // eslint-disable-next-line
  const countApiSuccess = (ResponseData: any, ErrorStr: any, value: String) => {
    if (ErrorStr) {
      setloaderModel(false);
      globalThis.errorMessage = ErrorStr; 
      setErrorAlertModel(true);
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      console.log("count api response >>>>", ResponseData);
      if (userPremium) {
        if (value == "cameraStory") {
          navigation.navigate("AddCameraStoryScreen");
        } else {
          navigation.navigate("AddTextStatusScreen");
        }
      } else {
        if (
          ResponseData?.data?.total_stories == nonPremiumStoryLimit ||
          ResponseData?.data?.total_stories > nonPremiumStoryLimit
        ) {
          premiumAlertHeading = t("You_can_add_a_maximum_o_stories");
          premiumAlertSubHeading = t(
            "Upgrade_to_Premium_for_unlimited_stories"
          );
          premiumAlertFirstButtonText = "Continue with Free Plan";
          premiumAlertSecondButtonText = "Go To Premium";
          setShowPremiumAlert(true);
          // Alert.alert("Oops!","You have exceed your stories limit.")
        } else {
          if (value == "cameraStory") {
            navigation.navigate("AddCameraStoryScreen");
          } else {
            navigation.navigate("AddTextStatusScreen");
          }
        }
      }
    }
  };

  const addCameraStory = async () => {
    const paramToSend = "cameraStory";

    OnStoryUpload(paramToSend);
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
    },

    topContainer: {
      backgroundColor: themeModule().theme_background,
      paddingBottom: 60,
    },
    profile2Container: {
      marginTop: 10,
      flexDirection: "row",
      height: 60,
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
    },
    naContainer: {
      justifyContent: "center",
      width: "70%",
    },
    NoDataContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    noDataText: {
      color: colorTheme ? COLORS.primary_blue : "#1F2024",
      fontSize: 18,
      fontFamily: font.bold(),
      fontWeight: "500",
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },
    name2conText: {
      marginTop: 0,
      fontSize: 12,
      fontFamily: font.bold(),
      color: COLORS.grey,
      paddingLeft: 3,
      // height: 20,
    },
    name1conText: {
      marginBottom: 0,
      fontSize: 13,
      fontFamily: font.bold(),
      paddingLeft: 10,
      height: 20,
    },
    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    Container2: {
      justifyContent: "center",
      marginLeft: 0,
      width: "15%",
    },

    statusContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height:
        DeviceInfo.hasNotch() == true ? windowHeight - 10 : windowHeight - 10,
    },
    editProfile2: {
      width: "15%",
      alignItems: "center",
      justifyContent: "center",
    },
    deleteIcon: {
      height: 25,
      width: 25,
      tintColor: textTheme().textColor,
      marginRight: 10,
    },
    eyeIcon: {
      height: 18,
      width: 18,
      tintColor: COLORS.grey,
      marginLeft: 10,
    },
    teststatus: {
      position: "absolute",
      bottom:
        DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
          ? 260
          : 200,
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
    tImage1Layout: {
      width: 25,
      height: 25,
      margin: 12,
    },
    cameraDesign: {
      position: "absolute",
      bottom:
        DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
          ? 200
          : 140,
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
  });
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <LoaderModel visible={loaderModel} />
      <ConfirmAlertModel
        visible={confirmAlertModel}
        onRequestClose={() => setConfirmAlertModel(false)}
        confirmText={t("do_you_want_delete_story")}
        cancel={() => setConfirmAlertModel(false)}
        confirmButton={() => {
          setConfirmAlertModel(false), deleteStatusApi(globalThis.selectedId);
        }}
      />

      <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={globalThis.successMessage}
        doneButton={() => {
          setSuccessAlertModel(false) ;
          if (globalThis.allDelete) {
            navigation.navigate("BottomBar", { screen: "chatScreen" });
          }
        
        }}
      />
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

      <PremiumAlert
        visible={showPremiumAlert}
        onRequestClose={() => setShowPremiumAlert(false)}
        cancel={() => setShowPremiumAlert(false)}
        Heading={premiumAlertHeading}
        SubHeading={premiumAlertSubHeading}
        FirstButton={premiumAlertFirstButtonText}
        SecondButton={premiumAlertSecondButtonText}
        firstButtonClick={() => setShowPremiumAlert(false)}
        secondButtonClick={() => {
          if (premiumAlertSecondButtonText == "Cancel") {
            setShowPremiumAlert(false);
          } else {
            setShowPremiumAlert(false);
            navigation.navigate("PremiumFeaturesScreen");
          }
        }}
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
          title={t("my_status")}
          backArrow={true}
          navState={navigation}
          checked={globalThis.selectTheme}
        />

        <View style={styles.topContainer}>
          <View style={styles.groupContainer}></View>
        </View>

        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
        globalThis.selectTheme === "indiaTheme" ||
        globalThis.selectTheme === "englandTheme" ||
        globalThis.selectTheme === "americaTheme" ||
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
              top: chatTop().top,
            }}
          ></ImageBackground>
        ) : null}
      </View>
      <View style={styles.statusContainer}>
        <FlatList
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          data={content}
          // eslint-disable-next-line
          renderItem={({ item, index }: any) => {
            return (
              <View style={[styles.profile2Container, {}]}>
                <TouchableOpacity style={styles.Container2}>
                  {item.file_type === "image" || item.file_type === "video" ? (
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.circleImageLayout}
                      resizeMode="cover"
                    />
                  ) : (
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        backgroundColor: item?.background_color,
                        borderRadius: 25,
                        height: 50,
                        width: 50,
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/tstyle.png")}
                        style={{
                          width: 20,
                          height: 20,
                          margin: 15,
                          tintColor: COLORS.black,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.naContainer}
                  onPress={() => statusView(index)}
                >
                  <MyStoryTimeConverter
                    isoTime={item.created_at}
                    textColor={textTheme().textColor}
                  />
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={require("../../Assets/Icons/Eye.png")}
                      style={styles.eyeIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.name2conText}>
                      {item.viewers_count}
                      {item.viewers_count === "0"
                        ? " " + t("views")
                        : " " + t("views")}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editProfile2}
                  onPress={() => deleteConfirmation(item.id)}
                >
                  <Image
                    source={require("../../Assets/Icons/Delete.png")}
                    style={styles.deleteIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            );
          }}
          ListFooterComponent={() => {
            return <View style={{ height: 300 }}></View>;
          }}
        />
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
