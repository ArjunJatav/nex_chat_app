import React, { useCallback, useContext, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import FileViewer from "react-native-file-viewer";
import DeviceInfo from "react-native-device-info";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import {
  COLORS,
  chatTop,
  iconTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import { StyleSheet } from "react-native";
import { font } from "../../../Components/Fonts/Font";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import { TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { Switch } from "react-native";
import renderIf from "../../../Components/renderIf";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";
import {
  chatBaseUrl,
  exitChannelApi,
  mute_channel_api,
  reportchannel,
} from "../../../Constant/Api";
import axios from "axios";
import { LoaderModel } from "../../Modals/LoaderModel";
import {
  decreaseSubscribers,
  exitChannelFromTable,
  getChannelMedia,
  updateChannelInfo,
} from "../../../sqliteStore";
import { useFocusEffect } from "@react-navigation/native";
import ImageViewer from "react-native-image-zoom-viewer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Video from "react-native-video";
import { useDispatch, useSelector } from "react-redux";
import { setChannelObj } from "../../../Redux/MessageSlice";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import { bottomIcon } from "../../../Navigation/Icons";
import WebView from "react-native-webview";
import AudioMessage from "../AudioMessage";
import { socket } from "../../../socket";
import { t } from "i18next";
import { ReportChannelModel } from "../../Modals/ReportChannelModel";
import { PostApiCall } from "../../../Components/ApiServices/PostApi";
import { ConfirmAlertModel } from "../../Modals/ConfirmAlertModel";
import { SuccessModel } from "../../Modals/SuccessModel";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
import { NoInternetModal } from "../../Modals/NoInternetModel";
const isDarkMode = true;

export default function ChannelProfile({ navigation, route }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myimages, setmyimages] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toShowImage, setToShowImage] = useState(false);
  const [switchValue, setSwitchValue] = useState(
    route?.params?.channelData?.NotificationAllowed == 1 ? true : false
  );
  const dispatch = useDispatch();
  const channelInfo = useSelector(
    // eslint-disable-next-line
    (state: any) => state?.message?.channelObj
  );

  const [mylocaldata, setmylocaldata] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const imageZoom = {
    url: channelInfo?.channelImage || channelInfo?.image, // Single image URL
  };
  const [reportUser, setReportUser] = useState(false);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  useEffect(() => {
    // Function to fetch the value from AsyncStorage
    const fetchSwitchValue = async () => {
      try {
        const value = await AsyncStorage.getItem("switchValue");

        if (value !== null) {
          setSwitchValue(value === "true" ? true : false); // Set the state with the fetched value
        }
      } catch (error) {
        console.error("Error fetching switch value:", error);
      }
    };

    fetchSwitchValue(); // Call the function inside useEffect
  }, []);

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    newGroupText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      fontSize: 15,
      fontFamily: font.bold(),
    },
    chatTopContainer: {
      backgroundColor: chatTop().back_ground,
      paddingBottom: 20,
    },
    channelcover: {
      borderWidth: 2,
      borderRadius: 100,
      width: 120,
      height: 120,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 2,
      alignSelf: "center",
      overflow: "hidden",
      objectFit: "cover",
    },
    channelimage: {
      // tintColor: bottomIcon().tintColor,
      height: "100%",
      width: "100%",
      resizeMode: "cover",
      borderRadius: 100,
    },
    boxwork: {
      alignItems: "center",
      justifyContent: "space-between",
      alignSelf: "center",
      marginVertical: 5,
      marginLeft: 2,
      marginRight: 0,
      // marginHorizontal:"auto",
      padding: 10,
      // height: 55,
      borderRadius: 10,
      // flexDirection: "row",
      width: "100%",
      backgroundColor: "#FFF",
      shadowColor: COLORS.lightgrey,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      //shadowRadius: 5,
      elevation: 5,
    },
    innertext: {
      fontFamily: font.semibold(),
      color: COLORS.black,
      width: "100%",
    },
    profile1Container: {
      marginTop: 20,
      flexDirection: "row",
      height: 50,
    },
    Container1: {
      justifyContent: "center",
      width: "10%",
    },
    backIcon: {
      height: 22,
      width: 22,
      tintColor: COLORS.white,
    },
    toptext: {
      color: COLORS.black,
      width: WINDOW_WIDTH / 3,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "600",
      fontFamily: font.semibold(),
    },
    backArrowContainer: {
      marginLeft: 10,
      // width:"auto",
      // position: "absolute",
      // flexDirection:"row",
      // alignItems:"center",
      // left: 10,
      backgroundColor: themeModule().premiumBackIcon,
      borderRadius: 5,
    },
    Container: {
      justifyContent: "center",
      width: "10%",
    },
    plusImageContainer: {
      position: "absolute",
      right: DeviceInfo.isTablet() == true ? 40 : 5,
      bottom: 48,
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    plusImage1Layout: {
      width: 20,
      height: 20,
      tintColor: iconTheme().iconColorNew,
    },
    nameInviteContainer: {
      justifyContent: "center",
      marginLeft: 10,
      width: "62%",
      flexDirection: "column",
    },
    name1conText: {
      fontSize: FontSize.font,
      fontFamily: font.bold(),
      color: iconTheme().iconColorNew,
      paddingLeft: 10,
    },
    name2conText: {
      fontSize: DeviceInfo.isTablet() ? 16 : 10,
      fontFamily: font.medium(),
      color: COLORS.black,
      paddingLeft: 10,
    },
    editProfile: {
      marginRight: 10,
      // flexDirection: "row",
      // width: "15%",
      // justifyContent: "center",
      alignItems: "flex-end",
    },
    heading: {
      color: "#000",
      fontSize: 18,
      fontFamily: font.semibold(),
    },
    outertab: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    arrowchavron: {
      width: 12,
      height: 12,
      resizeMode: "contain",
      transform: [{ scaleX: -1 }],
    },
    tabimg: {
      width: 23,
      height: 23,
      resizeMode: "contain",
      marginRight: 10,
    },
    tabsview: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
  useFocusEffect(
    useCallback(() => {
      getChannelMedia(channelInfo.channelId, (res) => {
        const filteredMedia = res.reduce((acc, item) => {
          if (Array.isArray(item.localPath)) {
            // Handle case where localPath is an array
            if (item.localPath.length > 0) {
              item.localPath.forEach((path) => {
                if (path && path !== "[]") {
                  // Ensure path is not the empty array string
                  acc.push({
                    ...item,
                    localPath: path,
                  });
                }
              });
            }
          } else if (typeof item.localPath === "string") {
            // Handle case where localPath is a string
            if (item.localPath !== "[]" && item.localPath.length > 0) {
              acc.push(item);
            }
          }
          return acc;
        }, []);

        console.log("filtered media", filteredMedia);
        setMedia(filteredMedia);
      });
    }, [channelInfo.channelId])
  );
  // useFocusEffect(
  //   useCallback(() => {
  //     getChannelMedia(channelInfo.channelId, (res) => {
  //       // Filter out items that have a non-empty localPath array or a valid string path
  //       const filteredMedia = res.reduce((acc, item) => {
  //         // If localPath is an array and has elements
  //         if (Array.isArray(item.localPath) && item.localPath.length > 0) {
  //           item.localPath.forEach((path) => {
  //             acc.push({
  //               ...item,
  //               localPath: path, // Use each individual path as a separate item
  //             });
  //           });
  //         }
  //         // If localPath is a non-empty string, add it directly
  //         else if (
  //           typeof item.localPath === "string" &&
  //           item.localPath.length > 0
  //         ) {
  //           acc.push(item);
  //         }
  //         return acc; // Return the accumulator after each iteration
  //       }, []); // Initial empty array for the accumulator

  //       console.log("filtered media", filteredMedia);
  //       setMedia(filteredMedia);
  //     });
  //   }, [channelInfo.channelId])
  // );

  async function exitChannel() {
    socket.emit("exitChannel", {
      userId: globalThis.userChatId,
      channelId: channelInfo.channelId,
      owner: channelInfo?.owner,
    });
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const bodydata = JSON.stringify({
      userId: globalThis.userChatId,
      channelId: channelInfo.channelId,
    });
    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: bodydata,
    };

    const response = await fetch(chatBaseUrl + exitChannelApi, requestOptions);

    const data = await response.json();
    try {
      if (data.status === true) {
        exitChannelFromTable(channelInfo.channelId, (success) => {
          if (success == true) {
            // navigation.pop(2);
            navigation.navigate("BottomBar", {
              screen: "chatScreen",
            });
            // decreaseSubscribers(channelInfo.channelId,(res)=>{
            //   if (res == true) {
            //     navigation.pop(2);
            //   }
            // })
          }
        });
      } else {
        console.log("exit channel api respon se:", data);
      }
    } catch (error) {
      console.log("in catch", error);
    }
  }
  console.log("channelInfo:", channelInfo);

  const shareOptions = {
    title: "Title",
    message: channelInfo?.channelLink,
    subject: "Subject",
  };

  const shareLink = () => {
    Share.share(shareOptions);
  };

  function CreateRenderImage(attach) {
    // Check if attach is defined and is a string
    if (typeof attach !== "string" || !attach) {
      console.error("Invalid attach:", attach); // Log the error for debugging
      return null; // Return null or a fallback image path
    }

    let mainDirectory = "";
    if (Platform.OS === "android") {
      mainDirectory = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    } else {
      mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    }

    let subDirectory = `${mainDirectory}/Images`;

    // Split the attach URL to get the file name
    let mediaName = attach.split("/").pop();

    // Ensure mediaName is valid
    if (!mediaName) {
      console.error("Invalid media name:", mediaName);
      return null;
    }

    let mediaId = mediaName.split(".").slice(0, -1).join(".");
    const filename = `${mediaId}.jpg`;
    const encoded = encodeURIComponent(filename);
    const destinationPath = `${subDirectory}/${encoded}`;

    return destinationPath;
  }

  const handleDocumentPress = async (path) => {
    if (Platform.OS == "android") {
      setLoading(true);
    }
    console.log("path:", path);
    // Show loader
    const mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    const subDirectory = `${mainDirectory}/Documents`;

    try {
      const mainDirectoryExists = await RNFS.exists(mainDirectory);
      if (!mainDirectoryExists) {
        await RNFS.mkdir(mainDirectory);
      }

      const subDirectoryExists = await RNFS.exists(subDirectory);
      if (!subDirectoryExists) {
        await RNFS.mkdir(subDirectory);
      }

      const mediaName = path[0]?.split("/")?.pop();
      const mediaId = mediaName?.split(".")?.slice(0, -1)?.join(".");
      let filename = `${mediaName}`;
      let encoded = encodeURIComponent(filename);
      let destinationPath = `${subDirectory}/${encoded}`;

      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      let fileExists = await RNFS.exists(destinationPath);
      let counter = 1;
      while (fileExists) {
        filename = `${mediaId}(${counter}).pdf`;
        encoded = encodeURIComponent(filename);
        destinationPath = `${subDirectory}/${encoded}`;
        fileExists = await RNFS.exists(destinationPath);
        counter++;
      }

      await RNFS.copyFile(path, destinationPath);

      const fileExistsAfterCopy = await RNFS.exists(destinationPath);
      if (!fileExistsAfterCopy) {
        throw new Error("File not found after copy");
      }

      await Promise.all([delay]);
      console.log("destination path:", destinationPath);
      FileViewer.open(destinationPath)
        .then(() => {
          setLoading(false);
          console.log("File opened successfully");
        })
        .catch((error) => {
          setLoading(false);
          console.error("Error opening file with FileViewer:", error);
        });
    } catch (error) {
      setLoading(false);
      console.error("Error processing file:", error);
    } finally {
    }
  };

  // let headers = {
  //   Accept: "application/json",
  //   "Content-Type": "application/x-www-form-urlencoded",
  //   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  //   "Content-Type": "multipart/form-data",
  //   Authorization: "Bearer " + globalThis.Authtoken,
  //   localization: globalThis.selectLanguage,
  // }

  const ReportuserChat = async (reason: string) => {
    ////i///////////////////////// ********** InterNet Permission    ********** ///////////////////////////////////
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
        return;
      } else {
        const urlStr = chatBaseUrl + reportchannel;
        try {
          const response = await axios({
            method: "POST",
            url: urlStr,
            headers: {
              "Content-Type": "application/json",
              api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
            },
            data: {
              userId: globalThis.chatUserId,
              channelId: channelInfo.channelId,
              reason: reason,
            },
          });
          if (response.data.status === true) {
            console.log("response.data.status", response);
            setReportUser(false);
            globalThis.successMessage = t("Report_submitted_successfully");
            setSuccessAlertModel(true);

            // Alert.alert(t("success"), t("Report_submitted_successfully"), [{ text: t("done") }]);
          } else {
            console.log("response.data.status", response);
            setReportUser(false);
            globalThis.errorMessage = response?.data?.message;
            setErrorAlertModel(true);
            //Alert.alert(t("error"), response?.data?.message, [{ text: t("ok") }]);
          }
        } catch (error) {
          console.log("response.data.status", error);
          // Alert.alert(t("error"), error?.message, [{ text: t("ok") }]);
          setReportUser(false);
          globalThis.errorMessage = error?.message;
          setErrorAlertModel(true);
        }
      }
    });
  };

  console.log("====================================", channelInfo?.channelType);
  console.log();
  console.log("====================================");

  return (
    <MainComponent statusBar="#000" statusBarColr="#000" safeAreaColr={"#ffff"}>
      <View
        style={{
          position: "relative",
          //  flex:1
          // backgroundColor: themeModule().theme_background,
        }}
      >
        {/* // **********  Status Bar    ********** // */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={"#ffff"}
          />
        ) : null}
        <ReportChannelModel
          visible={reportUser}
          onRequestClose={() => setReportUser(false)}
          cancel={() => setReportUser(false)}
          report_user={ReportuserChat}
        />
        <ConfirmAlertModel
          visible={confirmAlertModel}
          onRequestClose={() => setConfirmAlertModel(false)}
          confirmText={t("You_want_to_exit_from_this_channel")}
          cancel={() => setConfirmAlertModel(false)}
          confirmButton={() => {
            setConfirmAlertModel(false), exitChannel();
          }}
        />
        <SuccessModel
          visible={successAlertModel}
          onRequestClose={() => setSuccessAlertModel(false)}
          succesText={globalThis.successMessage}
          doneButton={() => {
            setSuccessAlertModel(false);
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

        <Modal visible={myimages}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#000",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                left: 3,
                zIndex: 20,
                top: DeviceInfo.hasNotch() ? 60 : 60,
              }}
              onPress={() => {
                setmyimages(false);
              }}
            >
              <Image
                source={require("../../../Assets/Icons/Back_Arrow.png")}
                style={{
                  height: 25,
                  width: 25,
                  marginLeft: 10,
                  tintColor: iconTheme().iconColorNew,
                }}
              />
            </TouchableOpacity>
            {
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              mylocaldata?.type == "image" ? (
                <View
                  style={{
                    height: Dimensions.get("window").height,
                    width: Dimensions.get("window").width - 20,
                  }}
                >
                  <ImageViewer
                    saveToLocalByLongPress={false} // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    renderIndicator={() => {
                      return null;
                    }}
                    style={{
                      height: Dimensions.get("window").height,
                      width: Dimensions.get("window").width - 20,
                    }}
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    imageUrls={mylocaldata?.attachment.map((url) => ({ url }))}
                    loadingRender={() => <ActivityIndicator size={"large"} />}
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    onChange={(index) => setCurrentIndex(index)}
                  />
                </View>
              ) : mylocaldata?.type == "audio" ? (
                <View
                  style={{
                    height: 64,
                    width: 320,
                    // alignSelf: "center",
                    // marginTop:
                    //   Dimensions.get("window").height * 0.4,
                    backgroundColor: "#fff",
                  }}
                >
                  <AudioMessage currentMessage={mylocaldata?.attachment} />
                </View>
              ) : (
                <>
                  <FlatList
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    data={mylocaldata.attachment}
                    horizontal
                    contentContainerStyle={{ alignItems: "center" }}
                    renderItem={({ item, index }: any) => (
                      <GestureHandlerRootView>
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            //  backgroundColor: "red",
                          }}
                        >
                          {
                            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            mylocaldata.type == "video" && (
                              <Video
                                style={{
                                  width: Dimensions.get("window").width,
                                  height: 300,
                                  padding: 20,
                                }}
                                onLoadStart={() => {
                                  setLoading(true);
                                  setCurrentIndex(index);
                                }}
                                onLoad={() => setLoading(false)}
                                source={{ uri: item }}
                                resizeMode="contain"
                                controls={true}
                                paused={isPlaying}
                              />
                            )
                          }
                          {console.log("mylocaldata?.type", mylocaldata?.type)}
                        </View>
                      </GestureHandlerRootView>
                    )}
                  />
                </>
              )
            }
          </View>
        </Modal>
        <Modal visible={toShowImage}>
          <View
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "rgba(0,0,0,0.9)",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                left: 3,
                zIndex: 20,
                top: DeviceInfo.hasNotch() ? 60 : 60,
              }}
              onPress={() => {
                setToShowImage(false);
              }}
            >
              <Image
                source={require("../../../Assets/Icons//Back_Arrow.png")}
                style={{
                  height: 25,
                  width: 25,
                  marginLeft: 10,
                  tintColor: iconTheme().iconColorNew,
                }}
              />
            </TouchableOpacity>

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: Dimensions.get("window").height - 60,
                width: WINDOW_WIDTH,
              }}
            >
              <ImageViewer
                saveToLocalByLongPress={false} //@ts-ignore
                renderIndicator={() => {
                  return null;
                }}
                style={{
                  height: Dimensions.get("window").height - 50,
                  width: WINDOW_WIDTH - 10,
                  marginTop: 10,
                }} //@ts-ignore
                imageUrls={[imageZoom]}
                loadingRender={() => <ActivityIndicator size={"large"} />}
                //@ts-ignore
              />
              {/* <Image
                  source={{
                    uri: profileData?.userProfile
                      ? profileData?.userProfile
                      : "https://tokeecorp.com/backend/public/images/user-avatar.png",
                  }}
                  style={{
                    height: Dimensions.get("window").height - 50,
                    width: WINDOW_WIDTH - 10,
                    marginTop: 10,
                  }}
                  resizeMode="contain"
                /> */}
            </View>
          </View>
        </Modal>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 20,
            alignItems: "center",
          }}
        >
          <View style={{ width: WINDOW_WIDTH / 3, flexDirection: "row" }}>
            <TouchableOpacity
              style={[
                styles.backArrowContainer,
                {
                  width: 25,
                  height: 25,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
              onPress={() => {
                navigation.pop();
              }}
            >
              <Image
                source={require("../../../Assets/Icons/back2.png")}
                style={[
                  styles.backIcon,
                  { width: "100%", height: 13, resizeMode: "contain" },
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.toptext]}>{t("channel_info")}</Text>
          <View style={{ width: WINDOW_WIDTH / 3 }}>
            {renderIf(
              channelInfo?.owner == globalThis.chatUserId,
              <TouchableOpacity
                style={[styles.editProfile]}
                onPress={() =>
                  navigation.navigate("EditChannelScreen", {
                    channelData: channelInfo,
                  })
                }
              >
                <Text style={[styles.name1conText, { marginRight: 5 }]}>
                  {t("edit")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={true}
          style={{
            // height: Dimensions.get("window").height,
            // paddingBottom:200,
            // flexGrow:1
            maxHeight: DeviceInfo.hasNotch()
              ? Dimensions.get("window").height - 200
              : Dimensions.get("window").height - 120,
          }}
        >
          <View>
            <TouchableOpacity
              style={[
                styles.channelcover,
                {
                  borderBlockColor: iconTheme().iconColorNew,
                  backgroundColor: themeModule().theme_background,
                },
              ]}
              onPress={() => setToShowImage(!toShowImage)}
            >
              <Image
                source={{
                  uri: channelInfo?.channelImage || channelInfo?.image,
                }}
                style={[styles.channelimage]}
              />
            </TouchableOpacity>

            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "center",

                marginHorizontal: 20,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: COLORS.black,
                  fontSize: 25,
                  fontFamily: font.bold(),
                  marginRight: 2,
                }}
              >
                {channelInfo?.channelName || channelInfo?.name}
              </Text>
              <View style={{ alignSelf: "center" }}>
                {channelInfo.isExclusive ? (
                  <ImageBackground
                    source={require("../../../Assets/Icons/verified_icon.png")}
                    style={{
                      height: 15,
                      width: 15,
                      alignSelf: "center",
                      justifyContent: "center",
                      marginLeft: 5,
                    }}
                    resizeMode="contain"
                  >
                    <Image
                      source={require("../../../Assets/Icons/correct_sign.png")}
                      style={{
                        height: 10,
                        width: 10,
                        alignSelf: "center",
                        tintColor: COLORS.white,
                      }}
                      resizeMode="contain"
                    />
                  </ImageBackground>
                ) : null}
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
            {renderIf(
              channelInfo?.channelDescription,
              <>
                <View style={styles.boxwork}>
                  <View style={{ width: "100%" }}>
                    <Text style={styles.innertext}>
                      {channelInfo?.channelDescription}
                    </Text>
                  </View>
                </View>
              </>
            )}
            {renderIf(
              route?.params?.isChannelExist,
              <View style={[styles.boxwork, { flexDirection: "row" }]}>
                <View style={{ flexShrink: 1 }}>
                  <Text
                    style={[
                      styles.innertext,
                      { color: iconTheme().iconColorNew },
                    ]}
                  >
                    {channelInfo?.channelLink}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => shareLink()}>
                  <Image
                    source={require("../../../Assets/Icons/Share.png")}
                    style={{
                      height: 20,
                      width: 20,
                      marginTop: 5,
                      tintColor: iconTheme().iconColorNew,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}

            <View>
              <View style={[styles.boxwork, { marginTop: 10 }]}>
                <TouchableOpacity
                  disabled={channelInfo?.owner != globalThis.chatUserId}
                  onPress={() => {
                    navigation.navigate("ChannelMembers", {
                      channelId: channelInfo?.channelId,
                    });
                  }}
                  style={[styles.outertab, { marginTop: 10 }]}
                >
                  <View style={[styles.tabsview, { flexShrink: 1 }]}>
                    <View>
                      <Image
                        style={[
                          styles.tabimg,
                          { tintColor: iconTheme().iconColorNew },
                        ]}
                        source={require("../../../Assets/Icons/AddGroup.png")}
                      />
                    </View>
                    <Text style={styles.innertext}>{t("subscribers")}</Text>
                  </View>

                  <View style={{}}>
                    <Text style={[styles.innertext, { marginRight: 10 }]}>
                      {channelInfo?.Subcribers || channelInfo?.membersCount + 1}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={[styles.outertab, { marginTop: 20 }]}>
                  <View style={[styles.tabsview, { flexShrink: 1 }]}>
                    <View>
                      <Image
                        style={[
                          styles.tabimg,
                          { tintColor: iconTheme().iconColorNew },
                        ]}
                        source={require("../../../Assets/Icons/settingFill.png")}
                      />
                    </View>
                    <Text style={styles.innertext}>{t("Channel_Type")}</Text>
                  </View>

                  <View style={{}}>
                    <Text
                      style={[
                        styles.innertext,
                        { marginRight: 10, textTransform: "capitalize" },
                      ]}
                    >
                      {channelInfo?.channelType
                        ? channelInfo?.channelType
                        : channelInfo?.isPublic
                        ? "Public"
                        : "Private"}
                      {/* {(channelInfo?.channelType) != "private" ? "Public" : "Private"} */}
                    </Text>
                  </View>
                </View>
              </View>

              {renderIf(
                channelInfo?.owner != globalThis.chatUserId &&
                  route?.params?.isChannelExist == true,
                <View style={[styles.boxwork, { marginTop: 10 }]}>
                  <TouchableOpacity
                    onPress={() => {
                      setReportUser(true);
                    }}
                    style={[styles.outertab]}
                  >
                    <View style={[styles.tabsview, { flexShrink: 1 }]}>
                      <View>
                        <Image
                          style={[styles.tabimg, { tintColor: "red" }]}
                          source={require("../../../Assets/Icons/Report.png")}
                        />
                      </View>
                      <Text style={[styles.innertext, { color: "red" }]}>
                        {t("Report_Channel")}
                      </Text>
                    </View>

                    <View style={{}}></View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={
                      () => setConfirmAlertModel(true)
                      // Alert.alert(
                      //   t("Are_You_Sure"),
                      //   t("You_want_to_exit_from_this_channel"),
                      //   [
                      //     {
                      //       text: t("yes"),
                      //       onPress: () => exitChannel(),
                      //     },
                      //     {
                      //       text: t("cancel"),
                      //       onPress: () => null,
                      //       style: "cancel",
                      //     },
                      //   ]
                      // )
                    }
                    style={[styles.outertab, { marginTop: 20 }]}
                  >
                    <View style={[styles.tabsview, { flexShrink: 1 }]}>
                      <View>
                        <Image
                          style={[styles.tabimg, { tintColor: "red" }]}
                          source={require("../../../Assets/Icons/exit_group.png")}
                        />
                      </View>
                      <Text style={[styles.innertext, { color: "red" }]}>
                        {t("Exit_Channel")}
                      </Text>
                    </View>

                    <View style={{}}></View>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {renderIf(
              media.length > 0 && route?.params?.isChannelExist == true,
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  // borderBottomWidth: 2,
                  // borderBottomColor: "#000",
                }}
              >
                <Text style={styles.heading}>{t("Shared_Media")}</Text>
              </View>
            )}

            {renderIf(
              route?.params?.isChannelExist == true,
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap", // Allow items to wrap within the row
                  width: Dimensions.get("window").width - 15, // Use the calculated screen width for proper layout
                }}
              >
                <FlatList
                  data={media} // Use the flattened data
                  numColumns={3}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <>
                      {item?.message_type === "image" ? (
                        <TouchableOpacity
                          style={{
                            width: (Dimensions.get("window").width - 45) / 3, // 33% width to fit 3 items per row
                            flexDirection: "column",
                            alignItems: "center",
                            height: 80,
                            margin: 5,
                            // backgroundColor:"red"
                          }}
                          onPress={() => {
                            setmylocaldata({
                              attachment: [item.localPath], // Set this specific image as attachment
                              type: "image",
                              data: item.attachment,
                            });
                            setTimeout(() => {
                              setmyimages(true);
                            }, 500);
                          }}
                        >
                          <Image
                            source={{ uri: CreateRenderImage(item?.localPath) }}
                            style={{
                              height: "100%",
                              width: "100%",
                              //ß marginTop: 10,
                            }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ) : item?.message_type === "video" ? (
                        <TouchableOpacity
                          style={{
                            width: (Dimensions.get("window").width - 45) / 3, // 33% width to fit 3 items per row
                            flexDirection: "column",
                            alignItems: "center",
                            height: 80,
                            margin: 5,
                            // backgroundColor:"red",
                            // width: "33%",
                            justifyContent: "center",
                            // alignItems: "center",
                            // flexDirection: "column",
                          }}
                          onPress={() => {
                            setmylocaldata({
                              attachment: [item.localPath], // Set this specific video as attachment
                              type: "video",
                              data: item.attachment,
                            });
                            setTimeout(() => {
                              setmyimages(true);
                            }, 500);
                          }}
                        >
                          <Image
                            source={{
                              uri: "https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png",
                            }}
                            style={{
                              height: 80,
                              width: 80,
                              // marginTop: 10,
                            }}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      ) : item?.message_type === "audio" ? (
                        <TouchableOpacity
                          style={{
                            width: (Dimensions.get("window").width - 45) / 3, // 33% width to fit 3 items per row
                            flexDirection: "column",
                            alignItems: "center",
                            height: 80,
                            margin: 5,
                          }}
                          onPress={() => {
                            setmylocaldata({
                              attachment: item.localPath,
                              type: "audio",
                              data: item.attachment,
                            });
                            setTimeout(() => {
                              setmyimages(true);
                            }, 500);
                          }}
                        >
                          <View
                            style={{
                              width: "100%",
                              height: "100%",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={require("../../../Assets/Icons/AudioSideMenu.png")}
                              style={{ height: "100%", width: "65%" }}
                              resizeMode="cover"
                            />
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{
                            width: (Dimensions.get("window").width - 45) / 3, // 33% width to fit 3 items per row
                            flexDirection: "column",
                            alignItems: "center",
                            height: 80,
                            margin: 5,
                            // backgroundColor:"red",
                            // backgroundColor: "red",
                          }}
                          onPress={() => handleDocumentPress(item.localPath)}
                        >
                          <View
                            style={{
                              width: "100%",
                              height: "100%",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={require("../../../Assets/Icons/pdfview.png")}
                              style={{ height: "100%", width: "65%" }}
                              resizeMode="contain"
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                  contentContainerStyle={{
                    flexWrap: "wrap",
                    flexDirection: "row",
                  }}
                />
              </View>
            )}
          </View>
        </ScrollView>
        <LoaderModel visible={isLoading} />
      </View>
    </MainComponent>
  );
}
