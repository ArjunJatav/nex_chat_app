import React, { useContext, useState } from "react";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import {
  COLORS,
  appBarText,
  themeModule,
} from "../../../Components/Colors/Colors";
import AWS from "aws-sdk";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Keyboard,
  PermissionsAndroid,
  Platform,
  View,
} from "react-native";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../../Components/TopBar/TopBar";
import { TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
import { useTranslation } from "react-i18next";
import { chatTop } from "../../../Navigation/Icons";
import { ScrollView } from "react-native";
import DeviceInfo from "react-native-device-info";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import { SetProfileModal } from "../../Modals/SetProfileModel";
import ImagePicker from "react-native-image-crop-picker";
import { Image } from "react-native";
import { TextInput } from "react-native";
import { chatBaseUrl, updateChannelApi } from "../../../Constant/Api";
import axios from "axios";
import { LoaderModel } from "../../Modals/LoaderModel";
import {
  accessKeyId,
  secretAccessKey,
  translationKey,
} from "../../../Constant/Key";
import RNFetchBlob from "rn-fetch-blob";
import { decode } from "base64-arraybuffer";
import { updateChannelInfo } from "../../../sqliteStore";
import { useDispatch, useSelector } from "react-redux";
import { setChannelObj } from "../../../Redux/MessageSlice";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { badword } from "../../../Components/BadWord/Bad_words";
import {
  checkImageNudity,
  getRemainingSuspensionDays,
  updateViolationAttempt,
} from "../../agora/agoraHandler";
import {
  setUserBanned,
  setUserSuspendedDays,
} from "../../../reducers/userBanSlice";
import WarningModal from "../../Modals/WarningModal";
const isDarkMode = true;
let banType = "Warning";
let banMessage = "";
let banTitle = "";

export default function EditChannelScreen({ navigation, route }: any) {
  const [cameraModal, setCameraModal] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { colorTheme } = useContext(ThemeContext);
  const [filePath, setFilePath] = useState(
    route?.params?.channelData?.channelImage
  );
  const channelInfo = useSelector(
    // eslint-disable-next-line
    (state: any) => state?.message?.channelObj
  );
  const [channelName, setChannelName] = useState(
    route?.params?.channelData?.channelName
  );
  const [channelDescription, setChannelDescription] = useState(
    route?.params?.channelData?.channelDescription
  );
  const [channelLink, setChannelLink] = useState(
    route?.params?.channelData?.channelLink
  );
  const [privateSelected, setPrivateSelected] = useState(
    route?.params?.channelData?.channelType == "public" ? false : true
  );
  const [isLoading, setLoading] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);

  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    newChatIcon2: {
      justifyContent: "center",
      alignItems: "center",
      height: DeviceInfo.isTablet() ? 50 : 40,
      width: DeviceInfo.isTablet() ? 50 : 40,
      borderRadius: 50,
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: "90%",
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: 20,
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    imageContainer: {
      justifyContent: "center",
      paddingLeft: 10,
      alignItems: "center",
    },
    addUser: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colorTheme ? COLORS.primary_blue_light : COLORS.yellow,
      height: DeviceInfo.isTablet() ? 50 : 50,
      width: DeviceInfo.isTablet() ? 50 : 50,
      borderRadius: 50,
    },
    nameTextContainer: {
      alignItems: "flex-start",
      paddingLeft: 10,
    },
    nameText: {
      fontSize: FontSize.font,
      color: COLORS.black,
      fontFamily: font.semibold(),
      alignItems: "center",
      justifyContent: "center",
    },
    nameInputTextContainer: {
      marginRight: 10,
      marginLeft: 10,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },
    nameInputText: {
      fontSize: 16,
      padding: 0,
      marginTop: 10,
      color: COLORS.black,
      fontFamily: font.medium(),
    },
  });

  // **********  Request Permission for Open Camera And Galary   ********** ///
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission",
            buttonPositive: "ok",
          }
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  // **********  Select Image From ImageLibarary  ********** ///
  const selectImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: false,
        compressImageQuality: 1,
        cropperCircleOverlay: false,
        mediaType: "photo",
        // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined && image !== null) {
          setCameraModal(false);

          setTimeout(async () => {
            setLoading(true);
            // Add delay before making API call
            const filePath = image.path.startsWith("file://")
              ? image.path
              : `file://${image.path}`;

            const response = await checkImageNudity(filePath);
            console.log(
              "Nudity Check Response:",
              response?.data?.is_nude_file
            );
            if (response?.data?.is_nude_file == true) {
              setLoading(false);
              setCameraModal(false);
              const reason = `The user attempted to upload a inappropriate image as the channel profile picture.`;
              const result = await updateViolationAttempt(reason);
              console.log(
                "result?.data?.suspended_remove_date====================================",
                result
              );
              if (result.success) {
                const remainingDays = getRemainingSuspensionDays(
                  result?.data?.suspended_remove_date
                );

                if (result.data.violation_attempt == 1) {
                  banType = "Warning";
                  setWarningModalVisible(true);
                } else if (
                  result.data.violation_attempt > 1 &&
                  result.data.violation_attempt <= 4
                ) {
                  banType = "Ban";
                  dispatch(setUserSuspendedDays(remainingDays));
                  setWarningModalVisible(true);
                  dispatch(setUserBanned(result.data.is_ban));
                } else if (result.data.violation_attempt == 5) {
                  banType = "Ban";
                  banMessage = `Your account has been suspended for ${remainingDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
                  banTitle = "Account Suspended!";
                  dispatch(setUserSuspendedDays(remainingDays));
                  setWarningModalVisible(true);
                  dispatch(setUserBanned(result.data.is_ban));
                } else if (result.data.violation_attempt > 5) {
                  banType = "Ban";
                  banMessage = `Your account has been permanently suspended due to multiple violations of our community guidelines. This decision is final, and you will no longer be able to access your account.`;
                  banTitle = "Account Permanently Suspended!";
                  setWarningModalVisible(true);
                  dispatch(setUserBanned(true)); // Ensure the user is marked as permanently banned
                } else {
                  globalThis.errorMessage =
                    "This channel profile photo violates our guidelines as it contains inappropriate content. Please upload a suitable image.";
                  setErrorAlertModel(true);
                }
              }
            } else {
              setLoading(false);
            setFilePath(image.path);
          setCameraModal(false);
            }
          }, 500);
        }
        // if (image !== undefined) {
        //   setFilePath(image.path);
        //   setCameraModal(false);
        // }
      });
    }
  };
  // **********  Select Image From Lounch Camera  ********** ///
  const captureImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
        mediaType: "photo",
      })
        .then((image) => {
          if (image !== undefined && image !== null) {
            setCameraModal(false);

            setTimeout(async () => {
              setLoading(true);
              // Add delay before making API call
              const filePath = image.path.startsWith("file://")
                ? image.path
                : `file://${image.path}`;

              const response = await checkImageNudity(filePath);
              console.log(
                "Nudity Check Response:",
                response?.data?.is_nude_file
              );
              if (response?.data?.is_nude_file == true) {
                setLoading(false);
                setCameraModal(false);
                const reason = `The user attempted to upload a inappropriate image as the channel profile picture.`;
                const result = await updateViolationAttempt(reason);
                console.log(
                  "result?.data?.suspended_remove_date====================================",
                  result
                );
                if (result.success) {
                  const remainingDays = getRemainingSuspensionDays(
                    result?.data?.suspended_remove_date
                  );

                  if (result.data.violation_attempt == 1) {
                    banType = "Warning";
                    setWarningModalVisible(true);
                  } else if (
                    result.data.violation_attempt > 1 &&
                    result.data.violation_attempt <= 4
                  ) {
                    banType = "Ban";
                    dispatch(setUserSuspendedDays(remainingDays));
                    setWarningModalVisible(true);
                    dispatch(setUserBanned(result.data.is_ban));
                  } else if (result.data.violation_attempt == 5) {
                    banType = "Ban";
                    banMessage = `Your account has been suspended for ${remainingDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
                    banTitle = "Account Suspended!";
                    dispatch(setUserSuspendedDays(remainingDays));
                    setWarningModalVisible(true);
                    dispatch(setUserBanned(result.data.is_ban));
                  } else if (result.data.violation_attempt > 5) {
                    banType = "Ban";
                    banMessage = `Your account has been permanently suspended due to multiple violations of our community guidelines. This decision is final, and you will no longer be able to access your account.`;
                    banTitle = "Account Permanently Suspended!";
                    setWarningModalVisible(true);
                    dispatch(setUserBanned(true)); // Ensure the user is marked as permanently banned
                  } else {
                    globalThis.errorMessage =
                      "This channel profile photo violates our guidelines as it contains inappropriate content. Please upload a suitable image.";
                    setErrorAlertModel(true);
                  }
                }
              } else {
                setLoading(false);
                setFilePath(image.path);
                setCameraModal(false);
              }
            }, 500);
          }
          // if (image !== undefined && image !== null) {
          //   setFilePath(image.path);
          //   setCameraModal(false);
          // }
        })
        .catch(() => {
          setCameraModal(false);
        });
    }
  };

  async function TranslateWord(text: any, img: any) {
    // First, check if the input text contains "toke"

    const urlStr =
      "https://www.googleapis.com/language/translate/v2?key=" +
      translationKey +
      "&target=" +
      "en" +
      "&q=" +
      text.replace(/[^a-zA-Z0-9 ]/g, "");
    setLoading(true);
    try {
      await axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then(async (response) => {
          setLoading(false);

          var textEnteredByUser =
            response.data.data.translations[0].translatedText;
          const userInput = textEnteredByUser.toLowerCase();

          // Split the input sentence into words
          const inputWords = userInput.split(" ");
          const checkBadWord = await AsyncStorage.getItem("BadWords");
          let badWordsInArr: string[] = [];
          if (checkBadWord) {
            badWordsInArr = JSON.parse(checkBadWord);
          } else {
            badWordsInArr = badword[0].words;
          }

          // Check if any of the input words match any word in the array
          const match = inputWords.some((word: any) =>
            badWordsInArr.includes(word)
          );

          if (match) {
            //const resion = text; // You can replace this with any other value
            const resion = `The user attempted to edit the channel name to an inappropriate name: "${text}".`;

            const result = await updateViolationAttempt(resion); // Call the custom function

            if (result.success) {
              const remainingDays = getRemainingSuspensionDays(
                result?.data?.suspended_remove_date
              );

              if (result.data.violation_attempt == 1) {
                banType = "Warning";
                setWarningModalVisible(true);
              } else if (
                result.data.violation_attempt > 1 &&
                result.data.violation_attempt <= 4
              ) {
                banType = "Ban";
                dispatch(setUserSuspendedDays(remainingDays));
                setWarningModalVisible(true);
                dispatch(setUserBanned(result.data.is_ban));
              } else if (result.data.violation_attempt == 5) {
                banMessage = `Your account has been suspended for ${remainingDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
                banTitle = "Account Suspended!";
                dispatch(setUserSuspendedDays(remainingDays));
                setWarningModalVisible(true);
                dispatch(setUserBanned(result.data.is_ban));
              } else if (result.data.violation_attempt > 5) {
                banMessage = `Your account has been permanently suspended due to multiple violations of our community guidelines. This decision is final, and you will no longer be able to access your account.`;
                banTitle = "Account Permanently Suspended!";
                setWarningModalVisible(true);
                dispatch(setUserBanned(true)); // Ensure the user is marked as permanently banned
              } else {
                globalThis.errorMessage =
                  "This channel name has an inappropriate content which is prohibited to use.";
                setErrorAlertModel(true);
              }
            } else {
              globalThis.errorMessage =
                "This channel name has an inappropriate content which is prohibited to use.";
              setErrorAlertModel(true);
            }

            // Alert.alert(
            //   "Alert!",
            //   t(
            //     "This channel name has an inappropriate content which is prohibited to use."
            //   ),
            //   [{ text: t("ok") }]
            // );
          } else {
            console.log("data to send in api", {
              name: channelName,
              image: img,
              userId: globalThis.chatUserId,
              isPublic: privateSelected ? false : true,
              description: channelDescription,
              inviteLink: channelLink,
            });
            const urlStr = chatBaseUrl + updateChannelApi;
            try {
              setLoading(true);
              await axios({
                method: "put",
                url: urlStr,
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + globalThis.Authtoken,
                },
                data: {
                  name: channelName,
                  image: img,
                  userId: globalThis.chatUserId,
                  isPublic: privateSelected ? false : true,
                  description: channelDescription,
                  inviteLink: channelLink,
                  channelId: channelInfo?.channelId,
                },
              })
                .then((response) => {
                  if (response.data.status == true) {
                    console.log("api response true", response.data);
                    if (response.data.data == true) {
                      const objToSend = {
                        ownerId: channelInfo?.owner,
                        channelName: channelName,
                        channelDes: channelDescription,
                        image: img,
                        type: privateSelected ? "private" : "public",
                        link: channelLink,
                        subs: channelInfo.Subcribers,
                        notifiAllow: channelInfo?.NotificationAllowed,
                        channelId: channelInfo?.channelId,
                        isExclusive: channelInfo.isExclusive,
                      };
                      updateChannelInfo(
                        channelInfo?.channelId,
                        objToSend,
                        (res) => {
                          if (res == true) {
                            setLoading(false);
                            const objForDispatch = {
                              NotificationAllowed:
                                channelInfo?.NotificationAllowed,
                              Subcribers: channelInfo.Subcribers,
                              channelDescription: channelDescription,
                              channelId: channelInfo?.channelId,
                              channelImage: img,
                              channelLink: channelLink,
                              channelName: channelName,
                              channelType: privateSelected
                                ? "private"
                                : "public",
                              owner: channelInfo?.owner,
                              isExclusive: channelInfo.isExclusive,
                            };
                            dispatch(setChannelObj(objForDispatch));
                            navigation.pop();
                          }
                        }
                      );
                    }

                    console.log("channel api data>>>>>", response.data.data);
                  }
                })
                .catch((error) => {
                  console.log("in catch 1 ", error);
                  if (error.response.status == 401) {
                  }
                  setLoading(false);
                });
            } catch (error) {
              console.log("in catch 2 ", error.response.data);
              setLoading(false);
            }
          }
        })
        .catch((error) => {
          setLoading(false);
          console.log("sdfdsfdsfdsf", error);
          // Alert.alert(error);
          globalThis.errorMessage = error;
          setErrorAlertModel(true);
        });
    } catch (error: any) {
      setLoading(false);
      console.log("sdfdsfdsfdsf", error);
      // Alert.alert(error);
      globalThis.errorMessage = error;
      setErrorAlertModel(true);
    }
  }

  //touploadimage
  const BucketUpload = async () => {
    setLoading(true);

    const s3 = new AWS.S3({
      accessKeyId: globalThis.accessKey,
      secretAccessKey: globalThis.awsSecretAccessKey,
      region: "us-east-2",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com",
    });
    try {
      // Read the image file
      const response = await RNFetchBlob.fs.readFile(filePath, "base64");
      const binaryData = decode(response);
      const pathParts = filePath.split("/");
      const fileName = Date.now() + "_" + pathParts[pathParts.length - 1];
      const folderName = "Profile/";
      const contentDeposition = `inline;filename="${fileName}"`;

      // Set S3 parameters
      const params = {
        Bucket: "tokee-chat-staging",
        Key: folderName + fileName, // Update with the desired S3 key
        Body: binaryData,
        ContentDisposition: contentDeposition,
        ContentType: "image/jpeg", // Adjust the content type based on your file type
      };

      // Upload the image to S3
      const uploadResult = await s3.upload(params).promise();
      setFilePath(uploadResult.Location);
      ChannelUpdateApiCalling(uploadResult.Location);
    } catch (error) {
      alert(error);
    }
  };
  //toCheckValidations

  async function ChannelUpdateApiCalling(img) {
    if (channelName == "" || channelName == " ") {
      // Alert.alert("", t("please_provide_channel_name"), [{ text: t("ok") }]);
      globalThis.errorMessage = t("please_provide_channel_name");
      setErrorAlertModel(true);
    } else if (channelName?.toLowerCase()?.includes("tokee")) {
      // Alert.alert(t("Alert"), t("YoucauseTokee_in_the_channel_name"), [
      //   { text: t("ok") },
      // ]);
      globalThis.errorMessage = t("YoucauseTokee_in_the_channel_name");
      setErrorAlertModel(true);
    } else if (route?.params?.channelData?.channelType == "public") {
      TranslateWord(channelName, img);
    } else {
      const urlStr = chatBaseUrl + updateChannelApi;
      try {
        setLoading(true);
        await axios({
          method: "post",
          url: urlStr,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: {
            name: channelName,
            image: img,
            userId: globalThis.chatUserId,
            isPublic: privateSelected ? false : true,
            description: channelDescription,
            inviteLink: channelLink,
          },
        })
          .then((response) => {
            setLoading(false);
            if (response.data.status == true) {
              console.log("api response true", response.data);
              const objToSend = {
                ownerId: globalThis.chatUserId,
                channelName: channelName,
                channelDes: channelDescription,
                image: img,
                type: privateSelected ? false : true,
                link: channelLink,
                subs: 1,
                notifiAllow: true,
                channelId: response.data.data._id,
              };
              console.log("channel api data>>>>>", response.data.data);
            }
          })
          .catch((error) => {
            console.log("in catch 1 ", error);
            if (error.response.status == 401) {
            }
            setLoading(false);
          });
      } catch (error) {
        console.log("in catch 2 ", error.response.data);
        setLoading(false);
      }
    }
  }
  //update-channe;-api-calling
  // const ChannelUpdateApiCalling = async (img: string) => {
  //   const urlStr = chatBaseUrl + updateChannelApi;

  //   try {
  //     setLoading(true);
  //     await axios({
  //       method: "post",
  //       url: urlStr,
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       data: {
  //         name: channelName,
  //         image: img,
  //         userId: globalThis.chatUserId,
  //         isPublic: privateSelected ? false : true,
  //         description: channelDescription,
  //         inviteLink : channelLink
  //       },
  //     })
  //       .then((response) => {

  //         setLoading(false);
  //         if (response.data.status == true) {
  //           console.log("api response true",response.data)
  //           const objToSend = {
  //       ownerId: globalThis.chatUserId,
  //       channelName: channelName,
  //       channelDes: channelDescription,
  //       image: img,
  //       type: privateSelected ? false : true,
  //       link: channelLink,
  //       subs: 1,
  //       notifiAllow:true,
  //       channelId :response.data.data._id
  //     };
  //     console.log("channel api data>>>>>",response.data.data)

  //         }
  //       })
  //       .catch((error) => {
  //         console.log("in catch 1 ",error)
  //         if (error.response.status == 401) {
  //         }
  //         setLoading(false);
  //       });
  //   } catch (error) {
  //     console.log("in catch 2 ",error.response.data)
  //     setLoading(false);
  //   }
  // };

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <SetProfileModal
        // {...props}
        visible={cameraModal}
        onRequestClose={() => setCameraModal(false)}
        Camera={() => captureImage()}
        select={() => selectImage()}
        cancel={() => setCameraModal(false)}
      />

      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />

      <WarningModal
        visible={warningModalVisible}
        type={banType}
        onClose={() => {
          if (
            banTitle === "Account Suspended!" ||
            banTitle === "Account Permanently Suspended!"
          ) {
            setWarningModalVisible(false);
            banType = "Warning";
            banMessage = "";
            banTitle = "";

            dispatch(setUserSuspendedDays(0));
            navigation.push("Login");
          } else {
            setWarningModalVisible(false);
          }
        }}
        message={banMessage}
        title={banTitle}
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
          showTitle={true}
          title={t("Edit_Channel")}
          checked={globalThis.selectTheme}
        />

        {/* // **********    View For Show the Screen Container     ********** /// */}
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            {/* // **********    View For Cancel Button     ********** /// */}
            <TouchableOpacity
              onPress={() => navigation.pop()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("cancel")} </Text>
            </TouchableOpacity>

            {/* // **********    View For Next Button     ********** /// */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                filePath == channelInfo?.channelImage
                  ? ChannelUpdateApiCalling(filePath)
                  : BucketUpload()
              }
            >
              <Text style={styles.cancelText}>{t("next")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
        globalThis.selectTheme === "mexicoTheme" ||
        globalThis.selectTheme === "usindepTheme" ? (
          <ImageBackground
            source={chatTop().BackGroundImage}
            resizeMode="cover" // Update the path or use a URL
            style={{
              height: "100%",
              width: Dimensions.get("window").width,
              marginTop: 0,
              position: "absolute",
              bottom: 0,
              zIndex: 0,
              top: chatTop().top,
            }}
          ></ImageBackground>
        ) : null}
      </View>
      <View style={styles.chatContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{
            height: "auto",
            maxHeight: DeviceInfo.hasNotch()
              ? null
              : Dimensions.get("window").height - 190,
          }}
        >
          <View style={{ flexDirection: "row", marginVertical: 20 }}>
            <View
              style={{
                flexDirection: "column",
                // backgroundColor: "red",
                justifyContent: "center",
              }}
            >
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  style={styles.addUser}
                  onPress={() => setCameraModal(true)}
                >
                  <Image
                    source={{ uri: filePath }}
                    style={styles.newChatIcon2}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              {/* <View
                style={{
                  backgroundColor:iconTheme().iconColorNew,
                  height: 20,
                  width: 20,
                  position: "absolute",
                  bottom: 5,
                  right: 0,
                  borderWidth: 1,
                  borderRadius: 15,
                  borderColor: "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image source={{uri:"https://cdn-icons-png.flaticon.com/512/764/764599.png"}} style={{height:12,width:12}} resizeMode="contain"/>
              </View> */}
            </View>

            <View style={{ flexDirection: "column", width: "85%" }}>
              <View style={styles.nameTextContainer}>
                <Text style={styles.nameText}>{t("channel_name")}</Text>
              </View>
              <View style={styles.nameInputTextContainer}>
                <TextInput
                  style={styles.nameInputText}
                  placeholder={"Enter Channel Name"}
                  defaultValue={channelName}
                  onChangeText={(text) => setChannelName(text)}
                  maxLength={40}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
            </View>
          </View>

          <View style={styles.nameTextContainer}>
            <Text style={styles.nameText}>{t("channel_description")}</Text>
          </View>
          <View style={styles.nameInputTextContainer}>
            <TextInput
              style={styles.nameInputText}
              placeholder={t("enter_group_description")}
              defaultValue={channelDescription}
              onChangeText={(text) => setChannelDescription(text)}
              maxLength={150}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>

          <View style={[styles.nameTextContainer, { marginTop: 20 }]}>
            <Text style={styles.nameText}>{t("channel_link")}</Text>
          </View>
          <View
            style={[
              styles.nameInputTextContainer,
              { flexDirection: "row", justifyContent: "space-between" },
            ]}
          >
            <TextInput
              style={styles.nameInputText}
              placeholder={t("enter_group_description")}
              value={channelLink}
              defaultValue={channelLink}
              onChangeText={(text) => setChannelLink(text)}
              editable={false}
              multiline
              // maxLength={150}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
          {/* <View style={[styles.nameTextContainer, { marginTop: 20 }]}>
            <Text style={styles.nameText}>{t("Channel_Type")}</Text>
          </View> */}

          {/* <View
            style={{
              flexDirection: "row",
              marginTop: 15,
              marginHorizontal: 10,
            }}
          >
            <View style={{ width: "50%", flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  borderRadius: 25,
                  borderWidth: 2,
                  borderColor: !privateSelected ? "green" : "gray",
                  padding: 2.5,
                  height: 25,
                  width: 25,
                  justifyContent: "center",
                }}
                onPress={() => setPrivateSelected(false)}
              >
                <View
                  style={{
                    backgroundColor: !privateSelected ? "green" : "transparent",
                    borderColor: !privateSelected ? "green" : "gray",
                    borderRadius: 25,
                    height: 15,
                    width: 15,
                  }}
                ></View>
              </TouchableOpacity>
              <Text
                style={{
                  color: "#000",
                  fontSize: 15,
                  marginLeft: 5,
                  marginTop: 3,
                }}
              >
                {t("Public")}
              </Text>
            </View>

            <View style={{ width: "50%", flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  borderRadius: 25,
                  borderWidth: 2,
                  borderColor: privateSelected ? "green" : "gray",
                  padding: 2.5,
                  height: 25,
                  width: 25,
                  justifyContent: "center",
                }}
                onPress={() => setPrivateSelected(true)}
              >
                <View
                  style={{
                    backgroundColor: privateSelected ? "green" : "transparent",
                    borderColor: privateSelected ? "green" : "gray",
                    borderRadius: 25,
                    height: 15,
                    width: 15,
                  }}
                ></View>
              </TouchableOpacity>
              <Text
                style={{
                  color: "#000",
                  fontSize: 15,
                  marginLeft: 5,
                  marginTop: 3,
                }}
              >
                {t("Private")}
              </Text>
            </View>
          </View> */}
        </ScrollView>
      </View>
      <LoaderModel visible={isLoading} />
    </MainComponent>
  );
}
