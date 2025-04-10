import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import AWS from "aws-sdk";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../../Components/TopBar/TopBar";
import ImagePicker from "react-native-image-crop-picker";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
import { chatTop } from "../../../Navigation/Icons";
import DeviceInfo from "react-native-device-info";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import { SetProfileModal } from "../../Modals/SetProfileModel";
import { showToast } from "../../../Components/CustomToast/Action";
import RNFetchBlob from "rn-fetch-blob";
import {
  EncryptionKey,
  accessKeyId,
  secretAccessKey,
  translationKey,
} from "../../../Constant/Key";
import { decode } from "base64-arraybuffer";
import { LoaderModel } from "../../Modals/LoaderModel";
import { insertChannelInfo, insertChannelList } from "../../../sqliteStore";
import { PostApiCall } from "../../../Components/ApiServices/PostApi";
import axios from "axios";
import { chatBaseUrl, createChannelApi } from "../../../Constant/Api";
import { socket } from "../../../socket";
import CryptoJS from "react-native-crypto-js";
import { useDispatch, useSelector } from "react-redux";
import { badword } from "../../../Components/BadWord/Bad_words";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getRemainingSuspensionDays,
  updateViolationAttempt,
} from "../../agora/agoraHandler";
import WarningModal from "../../Modals/WarningModal";
import {
  setUserBanned,
  setUserSuspendedDays,
} from "../../../reducers/userBanSlice";
const isDarkMode = true;
const images = [
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739796875560_1739796871443.jpg",
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739796994362_1739796983177.jpg",
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797046221_1739797039370.jpg",
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797091786_1739797084582.jpg",
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797127854_1739797120576.jpg",
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797177163_1739797172456.jpg",
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797278426_1739797253465.jpg",
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797388061_1739797362230.jpg",
  "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797436193_1739797429552.jpg",
];

let banType = "Warning";
let banMessage = "";
let banTitle = "";
// eslint-disable-next-line
export default function NewChannelScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const { colorTheme } = useContext(ThemeContext);
  const [filePath, setFilePath] = useState("");
  const [cameraModal, setCameraModal] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelLink, setChannelLink] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [channelId, setChannelId] = useState("");
  const userPremium = useSelector(
    (state) => (state as any)?.friendListSlice.userPremium
  );
  const [currentImage, setCurrentImage] = useState(images[0]);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const isUserBanned = useSelector(
    (state: any) => state.userBanSlice.isUserBanned
  );

  const dispatch = useDispatch();

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    console.log("random index:", randomIndex);
    return images[randomIndex];
  };

  React.useEffect(() => {
    // eslint-disable-next-line
    const handlenewMessageResive = async (data: any) => {
      try {
        if (globalThis.isMyChannelScreenOpen == true) {
          const dateinsert = new Date(
            data.result.createdAt || data.result.messageTime
          );
          const mId = Math.floor(Math.random() * 9000) + 1000;
          const lastMessageType = data.result.message_type;
          const lastMessage = data.result.message;
          const lastMessageId = data.result._id;
          const lastMessageTime = Date.now(); // Update with new timestamp
          const time = data.result.createdAt;
          let channelLinkToSend =
            "https://tokeecorp.com/backend/public/deepLink-forward?type=channel&id=" +
            channelId;
          const objToSend = {
            mId: data.result._id,
            channelName: channelName,
            fromUser: globalThis.chatUserId,
            userName: globalThis.chatUserId,
            currentUserPhoneNumber: globalThis.phone_number,
            message: lastMessage,
            message_type: "notify",
            attachment: [],
            channelId: channelId,
            lastMessage: lastMessage,
            lastMessageId: lastMessageId,
            lastMessageTime: lastMessageTime,
            lastMessageType: lastMessageType,
            parent_message: {},
            isForwarded: false,
            createdAt: data.result.createdAt,
            updatedAt: time,
            localPath: [],
            channelDescription: channelDescription,
            channelImage: filePath ? filePath : currentImage,
            channelType: route?.params?.type,
            channelLink: channelLinkToSend,
            subscribers: 1,
            NotificationAllowed: true,
            isExclusive: userPremium ? true : false,
            isPaid: false,
            isDeletedForAll: false,
            isHide: false,
          };

          // console.log(">>>>>STEP 6",objToSend);
          insertChannelList(objToSend, (res) => {
            console.log("res from sql", res);
            if (res == true) {
              setLoading(false);
              navigation.pop();
            } else {
              console.log("ERROR");
            }
          });
        }
      } catch (error) {}
    };

    socket.on("newMessageResive", handlenewMessageResive);

    return () => {
      socket.off("newMessageResive", handlenewMessageResive);
    };
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      console.log("ON BLUR");
      globalThis.isMyChannelScreenOpen = false;
      // code
    });

    const unsubscribe2 = navigation.addListener("focus", () => {
      setCurrentImage(getRandomImage());
      console.log("ON BLUR");
      globalThis.isMyChannelScreenOpen = true;
      // code
    });
    return () => {
      // executed when unmount
      unsubscribe2();
      unsubscribe();
    };
  }, [navigation]);
  // useEffect(() => {
  //   const generateRandom16DigitNumber = () => {
  //     return Math.floor(
  //       1000000000000000 + Math.random() * 9000000000000000
  //     ).toString();
  //   };

  //   // Function to get the current timestamp
  //   const getCurrentTimestamp = () => {
  //     return Date.now().toString(); // Returns the current timestamp in milliseconds
  //   };

  //   // Function to generate the random number and append the timestamp
  //   // const generateRandomStringWithTimestamp = () => {
  //   //   const randomNumber = generateRandom16DigitNumber();
  //   //   const timestamp = getCurrentTimestamp();
  //   //   const combinedString = `${randomNumber}_${timestamp}`;
  //   //   setChannelLink(combinedString);
  //   //   console.log("combined string >>>", combinedString);
  //   // };

  //   // generateRandomStringWithTimestamp();
  // }, []);

  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    newChatIcon: {
      height: DeviceInfo.isTablet() ? 45 : 40,
      width: DeviceInfo.isTablet() ? 45 : 40,
      // tintColor: iconTheme().iconColor,
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
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: "90%",
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
      height: DeviceInfo.isTablet() ? 50 : 40,
      width: DeviceInfo.isTablet() ? 50 : 40,
      borderRadius: 50,
    },
    newChatIcon2: {
      justifyContent: "center",
      alignItems: "center",
      height: DeviceInfo.isTablet() ? 50 : 40,
      width: DeviceInfo.isTablet() ? 50 : 40,
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
        width: 800,
        height: 800,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
        mediaType: "photo",
        // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined) {
          setFilePath(image.path);
          setCameraModal(false);
        }
      });
    }
  };

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
      ChannelCreationApiCalling(uploadResult.Location);
      setLoading(false);
    } catch (error) {
      alert(error);
      setLoading(false);
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
            setFilePath(image.path);
            setCameraModal(false);
          }
        })
        .catch(() => {
          setCameraModal(false);
        });
    }
  };

  function copyToClipboard(text) {
    console.log("text>>>>>>>>>>>", text);
    const textToString = text.toString();
    navigator.clipboard
      .writeText(textToString)
      .then(() => {
        showToast("Copied!");
        console.log("Text copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy text to clipboard:", error);
      });
  }

  async function TranslateWord(text: any) {
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
            // const resion = text; // You can replace this with any other value
            const resion = `The user attempted to create a channel with an inappropriate name: "${text}".`;
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
          } else {
            if (isUserBanned) {
              banMessage = "";
              banTitle = "";
              banType = "cannotCreate";
              setWarningModalVisible(true);
            } else {
              if (!filePath) {
                ChannelCreationApiCalling(currentImage);
              } else {
                BucketUpload();
              }
            }
            // if (filePath == "" || filePath == null || filePath == undefined) {
            //   // setFilePath(img);
            //   ChannelCreationApiCalling(currentImage);
            // } else {
            //   BucketUpload();
            // }
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

  function nextClick() {
    if (channelName == "" || channelName == null || channelName == undefined) {
      // Alert.alert("", t("please_provide_channel_name"), [{ text: t("ok") }]);

      globalThis.errorMessage = t("please_provide_channel_name");
      setErrorAlertModel(true);
    } else if (channelName?.toLowerCase()?.includes("tokee")) {
      // Alert.alert(t("error"), t("you_cn_use_tokee_name_for_channel"), [
      //   { text: t("ok") },
      // ]);
      globalThis.errorMessage = t("you_cn_use_tokee_name_for_channel");
      setErrorAlertModel(true);
    } else if (route?.params?.type == "public") {
      TranslateWord(channelName);
    } else {
      if (filePath == "" || filePath == null || filePath == undefined) {
        // setFilePath(img);
        ChannelCreationApiCalling(currentImage);
      } else {
        BucketUpload();
      }
    }
  }

  const ChannelCreationApiCalling = async (img: string) => {
    console.log(">>>>>STEP 1");
    const urlStr = chatBaseUrl + createChannelApi;
    console.log("url str====", urlStr);
    console.log("sending data to api>>>>>", {
      name: channelName,
      image: img,
      userId: globalThis.chatUserId,
      isPublic: route?.params?.type == "public" ? true : false,
      description: channelDescription,
      //  inviteLink: channelLink,
    });
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
          isPublic: route?.params?.type == "public" ? true : false,
          description: channelDescription,
          // inviteLink: channelLink,
          isExclusive: userPremium ? true : false,
          isPaid: false,
        },
      })
        .then((response) => {
          console.log(">>>>>>", {
            name: channelName,
            image: img,
            userId: globalThis.chatUserId,
            isPublic: route?.params?.type == "public" ? true : false,
            description: channelDescription,
            inviteLink: channelLink,
            isExclusive: userPremium ? true : false,
            isPaid: false,
          });
          //  setLoading(false);
          if (response.data.status == true) {
            setLoading(false);
            setChannelId(response.data.data._id);

            const mId = Math.floor(Math.random() * 9000) + 1000;

            const messageSend = CryptoJS.AES.encrypt(
              t("encryptionMessage"),
              EncryptionKey
            ).toString();

            socket.emit("joinChannel", {
              roomId: response.data.data._id,
              userId: globalThis.chatUserId,
            });
            const params = {
              mId: mId,
              isNotificationAllowed: true,
              userName: globalThis.displayName,
              phoneNumber: globalThis.phone_number,
              currentUserPhoneNumber: globalThis.phone_number,
              userImage: globalThis.image,
              roomId: response.data.data._id,
              roomName: channelName,
              roomImage: img,
              roomType: "channel",
              roomOwnerId: globalThis.userChatId,
              message: messageSend,
              message_type: "notify",
              roomMembers: [],
              isForwarded: false,
              attachment: [],
              from: globalThis.userChatId,
              resId: new Date().getTime(),
              status: "",
              parent_message_id: "",
              parent_message: {},
              createdAt: new Date(),
              isDeletedForAll: false,
            };

            console.log(">>>>>STEP 3", params);
            socket.emit("sendmessage", params);
          }
        })
        .catch((error) => {
          console.log("in catch 1 ", error.response.data);
          if (error.response.status == 401) {
          }
          setLoading(false);
        });
    } catch (error) {
      console.log("in catch 2 ", error.response.data);
      setLoading(false);
    }
  };

  // const shareOptions = {
  //   title: "Title",
  //   message: channelLink,
  //   subject: "Subject",
  // };

  // const shareLink = () => {
  //   Share.share(shareOptions);
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
          title={t("new_channel")}
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
            <TouchableOpacity onPress={() => nextClick()} activeOpacity={0.7}>
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
            <View style={{ flexDirection: "column" }}>
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  style={styles.addUser}
                  onPress={() => setCameraModal(true)}
                >
                  {filePath == "" ? (
                    <Image
                      source={{ uri: currentImage }}
                      style={styles.newChatIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image
                      source={{ uri: filePath }}
                      style={styles.newChatIcon2}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: "column", width: "85%" }}>
              <View style={styles.nameTextContainer}>
                <Text style={styles.nameText}>{t("channel_name")}</Text>
              </View>
              <View style={styles.nameInputTextContainer}>
                <TextInput
                  style={styles.nameInputText}
                  placeholder={t("enter_group_name")}
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
        </ScrollView>
      </View>
      <LoaderModel visible={isLoading} />
    </MainComponent>
  );
}
