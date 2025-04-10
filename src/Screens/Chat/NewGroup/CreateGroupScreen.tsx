import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
//@ts-ignore
import AWS, { Credentials } from "aws-sdk";
import axios from "axios";
import { decode } from "base64-arraybuffer";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; //@ts-ignore
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import ImagePicker from "react-native-image-crop-picker";
import { useDispatch, useSelector } from "react-redux";
import RNFetchBlob from "rn-fetch-blob";
import { badword } from "../../../Components/BadWord/Bad_words";
import {
  COLORS,
  appBarText,
  iconTheme,
  searchBar,
  setWallpaper,
  textTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import TopBar from "../../../Components/TopBar/TopBar";
import renderIf from "../../../Components/renderIf";
import {
  EncryptionKey,
  accessKeyId,
  secretAccessKey,
  translationKey,
} from "../../../Constant/Key";
import { chatTop } from "../../../Navigation/Icons";
import {
  setMainprovider,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setnewroomID,
  setnewroomType,
  setroominfo,
  setyesstart,
} from "../../../Redux/ChatHistory";
import { socket } from "../../../socket";
import {
  addMembersToRoomMembersSql,
  insertChatList,
  newMessageInsertList,
  removeCount,
} from "../../../sqliteStore";
import { LoaderModel } from "../../Modals/LoaderModel";
import { SetProfileModal } from "../../Modals/SetProfileModel";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
import { Mixpanel } from "mixpanel-react-native";
import { AppsFlyerTracker } from "../../EventTracker/AppsFlyerTracker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRemainingSuspensionDays, updateViolationAttempt } from "../../agora/agoraHandler";
import {
  setUserBanned,
  setUserSuspendedDays,
} from "../../../reducers/userBanSlice";
import WarningModal from "../../Modals/WarningModal";

const isDarkMode = true;
const data = [
  { id: 1, name: "Eun Kyung", contact: "+91-9065812452", isChecked: false },
];

let banType = "Warning";
let banMessage = "";
let banTitle = "";
export default function CreateGroupScreen({ navigation, route }: any) {
  const dispatch = useDispatch();
  const { colorTheme } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState(route?.params?.groupTitle);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [groupDescription, setGroupDescription] = useState(
    route?.params?.groupDesc || ""
  );
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
  const [currentImage, setCurrentImage] = useState(images[0]);
  const [products, setProducts] = React.useState(data);
  const [checked, setChecked] = useState("first");
  const [isPublic, setIsPublic] = useState("private");
  const [cameraModal, setCameraModal] = useState(false);
  const [filePath, setFilePath] = useState("");
  const { t, i18n } = useTranslation();
  const [groupType, setGroupType] = useState(route?.params?.groupType);
  const [membersData, setMembersData] = useState(route.params.selected_data);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const isUserBanned = useSelector(
    (state: any) => state.userBanSlice.isUserBanned
  );
  // socket.connect;

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    console.log("random index:", randomIndex);
    return images[randomIndex];
  };

  React.useEffect(() => {
    setCurrentImage(getRandomImage());
    socket.on("connect_error", (error: any) => {
      socket.connect;
      // Handle the error (e.g., display an error message)
    });
  }, [socket]);

  const buttonPress = () => {
    if (groupType == "public") {
      navigation.navigate("ChatScreen");
    } else {
      navigation.navigate("NewGroupScreen");
    }
  };

  const buttonPress2 = () => {
    if (groupName?.toLowerCase()?.includes("tokee")) {
      // Alert.alert(
      //   "Alert!",
      //   "You can't use 'Tokee' in the group name.",
      //   [{ text: t("ok") }]
      // );
      globalThis.errorMessage = "You can't use 'Tokee' in the group name.";
      setErrorAlertModel(true);

      return; // Exit early if "toke" is found
    }
    if (groupName == "" || groupName == "undefined" || groupName == null) {
      // Alert.alert("", t("please_provide_group_name"), [{ text: t("ok") }]);
      globalThis.errorMessage = t("please_provide_group_name");
      setErrorAlertModel(true);
    } else {
      if (filePath == "") {
        const imageSend = currentImage;

        if (groupType == "public") {
          createPublicGroup(imageSend);
        } else {
          if (membersData.length > 0) {
            createGroup(imageSend);
          } else {
            // Alert.alert("", t("please_provide_group_name"), [
            //   { text: t("ok") },
            // ]);
            globalThis.errorMessage = t("please_provide_group_name");
            setErrorAlertModel(true);
          }

          //
        }
      } else {
        BucketUpload();
      }
    }
  };

  const handleChange = (id: any) => {
    let temp = products.map((product) => {
      if (id === product.id) {
        return { ...product, isChecked: !product.isChecked };
      }
      return product;
    });
    setProducts(temp);
  };

  // **********  Select Image From Lounch Camera  ********** ///
  const captureImage = async () => {
    let isCameraPermitted = await requestCameraPermission();
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
        .catch((e) => {
          setCameraModal(false);
        });
    }
  };
  // **********  Sendig Data as Parameter  ********** ///
  const imageUpload = new FormData();
  if (filePath !== "") {
    let Imageurlstr = filePath?.replace("file://", "");
    //@ts-ignore
    imageUpload.append("profile_image", {
      uri:
        Platform.OS === "android"
          ? "file://" + filePath
          : filePath?.replace("file://", ""),
      type: "image/jpeg", // or photo.type
      name: "userImage.jpg",
    });
  }

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
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
        mediaType: "photo",
      }).then((image: any) => {
        if (image !== undefined) {
          setFilePath(image.path);
          setCameraModal(false);
        }
      });
    }
  };

  let selected = products.filter((product) => product.isChecked);

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 30 : 20,
    },
    newGroupText: {
      color: appBarText().textColor,
      marginTop: 15,
      fontSize: 15,
      fontFamily: font.bold(),
    },
    enterText: {
      color: COLORS.black,
      justifyContent: "center",
      height: 45,
      marginLeft: 10,
      fontSize: 15,
      width: "85%",
      fontFamily: font.bold(),
    },
    seachContainer: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginTop: 15,
      height: 45,
      borderRadius: 20,
      fontFamily: font.bold(),
      backgroundColor: "#F0E0F1",
      flexDirection: "row",
      width: "100%",
    },

    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },

    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },

    newChatIcon: {
      height: DeviceInfo.isTablet() ? 45 : 40,
      width: DeviceInfo.isTablet() ? 45 : 40,
      //tintColor: iconTheme().iconColor,
    },
    newChatIcon2: {
      justifyContent: "center",
      alignItems: "center",
      height: DeviceInfo.isTablet() ? 50 : 40,
      width: DeviceInfo.isTablet() ? 50 : 40,
      borderRadius: 50,
    },
    newcrossIcon: {
      height: 10,
      width: 10,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
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

    nameTextContainer: {
      alignItems: "flex-start",
      paddingLeft: 10,
    },
    imageContainer: {
      justifyContent: "center",
      paddingLeft: 10,
      alignItems: "center",
    },
    nameText: {
      fontSize: FontSize.font,
      color: COLORS.black,
      fontFamily: font.semibold(),
      alignItems: "center",
      justifyContent: "center",
    },
    groupText: {
      fontSize: 18,
      color: COLORS.black,
      fontFamily: font.semibold(),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    lenText: {
      fontSize: 10,
      color: COLORS.black,
      fontFamily: font.medium(),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    editText: {
      fontSize: 12,
      color: COLORS.black,
      fontFamily: font.medium(),
      alignItems: "center",
      justifyContent: "center",
    },

    profile1Container2: {
      marginTop: 10,
      flexDirection: "column",
      justifyContent: "center",
    },

    nameContainer: {
      marginLeft: 20,
      justifyContent: "center",
      margin: 0,
      marginBottom: 10,
      width: "50%",
    },
    nameInputText: {
      fontSize: 16,
      padding: 0,
      marginTop: 10,
      color: COLORS.black,
      fontFamily: font.medium(),
    },

    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
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
    addUser: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colorTheme ? COLORS.primary_blue_light : COLORS.yellow,
      height: DeviceInfo.isTablet() ? 50 : 40,
      width: DeviceInfo.isTablet() ? 50 : 40,
      borderRadius: 50,
    },
  });

  const trackAutomaticEvents = false;
  const mixpanel = new Mixpanel(
    `${globalThis.mixpanelToken}`,
    trackAutomaticEvents
  );
  console.log("globalThis.mixpanelToken", globalThis.mixpanelToken);
  const createGroupEvent = (string) => {
    console.log("string", string, "groupType", groupType);
    handleCallEvent("Create Group", string);
    // Track button click event
    mixpanel.track("Create Group", {
      type: groupType,
      GroupName: string,
    });
  };
  const handleCallEvent = (eventTrack, eventName1) => {
    const eventName = eventTrack;
    const eventValues = {
      af_content_id: eventName1,
      af_customer_user_id: globalThis.chatUserId,
      af_quantity: 1,
    };

    AppsFlyerTracker(eventName, eventValues, globalThis.chatUserId); // Pass user ID if you want to set it globally
  };

  function createPublicGroup(image: any) {
    setLoading(true);

    const groupParams = {
      roomName: groupName,
      //@ts-ignore
      roomOwnerId: globalThis.chatUserId,
      roomMembers: [],
      membersRaw: [
        {
          //@ts-ignore
          chat_user_id: globalThis.userChatId,
          //@ts-ignore
          contact_name: globalThis.displayName,
          //@ts-ignore
          profile_image: globalThis.image,
          //@ts-ignore
          phone_number: globalThis.phone_number,
        },
      ],
      groupType: "multiple",
      group_image: image,
      group_description: groupDescription,
      allow: checked == "first" ? "public" : "admin",
      isPublic: groupType == "public" ? true : false,
    };
    createGroupEvent(groupName);

    console.log("groupParamsgroupParams", groupParams);
    //@ts-ignore
    socket.emit("createGroup", groupParams);
  }
  function createGroup(image: any) {
    //@ts-ignore

    setLoading(true);
    const arrayOfChatIds = membersData.map(
      (obj: { chat_user_id: any }) => obj.chat_user_id
    );

    const groupParams = {
      roomName: groupName,
      //@ts-ignore
      roomOwnerId: globalThis.chatUserId,
      roomMembers: arrayOfChatIds,
      membersRaw: [
        ...membersData,
        {
          //@ts-ignore
          chat_user_id: globalThis.userChatId,
          //@ts-ignore
          contact_name: globalThis.displayName,
          //@ts-ignore
          profile_image: globalThis.image,
          //@ts-ignore
          phone_number: globalThis.phone_number,
        },
      ],
      groupType: "multiple",
      group_image: image,
      group_description: groupDescription,
      allow: checked == "first" ? "public" : "admin",
      isPublic: groupType == "public" ? true : false,
    };
    createGroupEvent(groupName);
    //@ts-ignore
    socket.emit("createGroup", groupParams);
    // }
  }

  useEffect(() => {
    const messageSend = CryptoJS.AES.encrypt(
      "This Group is created by " + //@ts-ignore
        globalThis.userName,
      EncryptionKey
    ).toString();
    //@ts-ignore
    const handlenewGroupCreated = async (data: any) => {
      console.log("datadatadata", data);
      try {
        //@ts-ignore
        if (data.result.fromUser == globalThis.chatUserId) {
          const mId = Math.floor(Math.random() * 9000) + 1000;
          const paramsOfSend = {
            mId: mId,
            roomId: data.result.roomId, //@ts-ignore
            fromUser: globalThis.userChatId,
            message: messageSend,
            message_type: "notify",
            attachment: [],
            isBroadcastMessage: false,
            isDeletedForAll: false,
            parent_message: {},
            isForwarded: false,
            storyId: "",
            isStoryRemoved: false,
            resId: new Date(data.result.time).getTime(),
            broadcastMessageId: "",
            seenCount: 0,
            deliveredCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            //yash ---work
            members: groupType == "public" ? [] : membersData,
          };
          const params = {
            mId: mId,
            isNotificationAllowed: true, //@ts-ignore
            userName: globalThis.displayName, //@ts-ignore
            phoneNumber: globalThis.phone_number, //@ts-ignore
            currentUserPhoneNumber: globalThis.phone_number, //@ts-ignore
            userImage: globalThis.image,
            roomId: data.result.roomId,
            roomName: data.result.roomName,
            roomImage: data.result.roomImage,
            roomType: data.result.roomType, //@ts-ignore
            roomOwnerId: globalThis.userChatId,
            message: messageSend,
            message_type: "notify",
            roomMembers: [],
            isForwarded: false,
            attachment: [], //@ts-ignore
            from: globalThis.userChatId,
            resId: new Date(data.result.time).getTime(),
            status: "",
            parent_message_id: "",
            parent_message: {},
            createdAt: new Date(),
            isDeletedForAll: false,
          };

          //@ts-ignore
          socket.emit("sendmessage", params);

          let createGroup = {
            roomId: data.result.roomId,
            roomName: data.result.roomName,
            roomImage: data.result.roomImage,
            roomType: data.result.roomType,
            friendId: data.result.fromUser,
            fromUser: data.result.fromUser,
            isNotificationAllowed: data.result.isNotificationAllowed,
            allow: data.result.allow,
            isPublic: data.result.isPublic,
          };

          newMessageInsertList(createGroup, false, "0");
          insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });
          let myObj = {
            //@ts-ignore
            chat_user_id: globalThis.userChatId, //@ts-ignore
            contact_name: globalThis.displayName, //@ts-ignore
            profile_image: globalThis.image, //@ts-ignore
            phone_number: globalThis.phone_number, //@ts-ignore
            isAdmin: data.result.fromUser == globalThis.userChatId ? 1 : 0,
          };
          if (groupType == "public") {
            addMembersToRoomMembersSql([myObj], data.result.roomId);
          } else {
            addMembersToRoomMembersSql(
              [...membersData, myObj],
              data.result.roomId
            );
          }

          //@ts-ignore
          socket.emit("joinRoom", {
            roomId: data.result.roomId, //@ts-ignore
            userId: globalThis.chatUserId,
          });
          dispatch(setnewroomID(data.result.roomId));
          dispatch(setnewroomType(data.result.roomType));
          dispatch(
            setroominfo({
              roomImage: data.result.roomImage,
              roomName: data.result.roomName,
            })
          );

          dispatch(
            setMainprovider({
              userImage: data.result.roomImage,
              userName: data.result.roomName,
              room: data.result,
              roomType: data.result.roomType,
              friendId: "",
              lastMessageId: "",
              isBlock: false,
            })
          );

          dispatch(setyesstart(true));
          removeCount(data.result.roomId);
          dispatch(setisnewBlock(false));
          dispatch(setisnewmMute(true));
          dispatch(setisnewArchiveroom(false));
          setLoading(false);
          navigation.navigate("BottomBar", {
            userImage: data.result.roomImage,
            userName: data.result.roomName,
            room: data.result,
            roomType: data.result.roomType,
            friendId: "",
            lastMessageId: "",
            isBlock: false,
            inside: true,
            screenFrom: "chatScreen",
          });
        }
      } catch (error) {
        console.log(">>>>> err : ", error);
      }
    };

    //@ts-ignore
    socket.on("newGroupCreated", handlenewGroupCreated);
    return () => {
      //@ts-ignore
      socket.off("newGroupCreated", handlenewGroupCreated);
    };
  });

  const BucketUpload = async () => {
    setLoading(true);

    const s3 = new AWS.S3({
      accessKeyId: globalThis.accessKey,
      secretAccessKey: globalThis.awsSecretAccessKey,
      region: "us-east-2",
      //@ts-ignore
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

      if (groupType == "public") {
        createPublicGroup(uploadResult.Location);
      } else {
        createGroup(uploadResult.Location);
      }

      //@ts-ignore
    } catch (error) {}
  };

  const handleRemoveMember = (index: number) => {
    const newArray = [...membersData];
    newArray.splice(index, 1);
    setMembersData(newArray);
  };

  function OnAddMemberClick() {
    route.params.navigationFunction(membersData);
    navigation.navigate("NewGroupScreen", {
      groupType: "private",
      addedData: membersData,
      groupTitle: groupName,
      groupDesc: groupDescription,
    });
  }

  async function TranslateWord(text: any) {
    // First, check if the input text contains "toke"
    if (text?.toLowerCase()?.includes("tokee")) {
      // Alert.alert(
      //   "Alert!",
      //   "You can't use 'Tokee' in the group name.",
      //   [{ text: t("ok") }]
      // );
      globalThis.errorMessage = "You can't use 'Tokee' in the group name.";
      setErrorAlertModel(true);
      return; // Exit early if "toke" is found
    }

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
            if (groupType == "public") {
              //const resion = text; // You can replace this with any other value

              const resion = `The user attempted to create a group with an inappropriate name: "${text}".`;

              const result = await updateViolationAttempt(resion); // Call the custom function

              if (result.success) {
          const remainingDays = getRemainingSuspensionDays(result?.data?.suspended_remove_date);

                if (result.data.violation_attempt == 1) {
                  banType = "Warning";
                  setWarningModalVisible(true);
                } else if (result.data.violation_attempt > 1 && result.data.violation_attempt <= 4) {
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
                    "This group name has an inappropriate content which is prohibited to use.";
                  setErrorAlertModel(true);
                }
              } else {
                globalThis.errorMessage =
                  "This group name has an inappropriate content which is prohibited to use.";
                setErrorAlertModel(true);
              }
            } else {
              buttonPress2();
            }
          } else {
            if (isUserBanned) {
              banType = "cannotCreate";
              setWarningModalVisible(true);
            } else {
              buttonPress2();
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
        {/* // **********    View For Show the StatusBar    ********** /// */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        {/* // **********    View For Show the TopBar    ********** /// */}
        <TopBar
          showTitle={true}
          title={t("new_group")}
          checked={
            //@ts-ignore
            globalThis.selectTheme
          }
        />

        {/* // **********    View For Show the Screen Container     ********** /// */}
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                groupType == "public"
                  ? groupName == "" ||
                    groupName == "undefined" ||
                    groupName == null
                    ? buttonPress2()
                    : TranslateWord(groupName)
                  : buttonPress2();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("create_group")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* // **********    TopBar   ********** /// */}

        {
          //@ts-ignore
          globalThis.selectTheme === "christmas" || //@ts-ignore
          globalThis.selectTheme === "newYear" || //@ts-ignore
          globalThis.selectTheme === "newYearTheme" || //@ts-ignore
          globalThis.selectTheme === "mongoliaTheme" || //@ts-ignore
          globalThis.selectTheme === "indiaTheme" ||
          globalThis.selectTheme === "englandTheme" ||
          globalThis.selectTheme === "americaTheme" ||
          globalThis.selectTheme === "mexicoTheme" || //@ts-ignore
          globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={chatTop().BackGroundImage}
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
          ) : null
        }
      </View>

      <View style={[styles.chatContainer]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{
            height: "auto",
            maxHeight: DeviceInfo.hasNotch() ? null : windowHeight - 190,
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
                <Text style={styles.nameText}>{t("group_name")}</Text>
              </View>
              <View style={styles.nameInputTextContainer}>
                <TextInput
                  style={styles.nameInputText}
                  placeholder={t("enter_group_name")}
                  defaultValue={groupName}
                  onChangeText={(text) => setGroupName(text)}
                  maxLength={40}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
            </View>
          </View>
          <View style={styles.nameTextContainer}>
            <Text style={styles.nameText}>{t("group_description")}</Text>
          </View>
          <View style={styles.nameInputTextContainer}>
            <TextInput
              style={styles.nameInputText}
              placeholder={t("enter_group_description")}
              defaultValue={groupDescription}
              onChangeText={(text) => setGroupDescription(text)}
              maxLength={150}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
          <View style={styles.nameTextContainer}>
            <Text style={styles.lenText}>{t("150_characters")}</Text>
          </View>

          <View style={styles.nameTextContainer}>
            <Text style={styles.groupText}>{t("allow_Message_Type")}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 25,
                borderWidth: 2,
                borderColor: checked === "first" ? "green" : "grey",
                padding: 2.5,
              }}
              onPress={() => setChecked("first")}
            >
              <View
                style={{
                  backgroundColor: checked === "first" ? "green" : "white",
                  borderColor: checked === "first" ? "green" : "red",
                  borderRadius: 25,
                  height: 15,
                  width: 15,
                }}
              ></View>
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10, fontFamily: font.regular() }}>
              {t("allow_user_and_admin_msg")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 25,
                borderWidth: 2,
                borderColor: checked !== "first" ? "green" : "grey",
                padding: 2.5,
              }}
              onPress={() => setChecked("second")}
            >
              <View
                style={{
                  backgroundColor: checked !== "first" ? "green" : "white",
                  borderColor: checked !== "first" ? "green" : "red",
                  borderRadius: 25,
                  height: 15,
                  width: 15,
                }}
              ></View>
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10, fontFamily: font.regular() }}>
              {t("allow_admin_msg")}
            </Text>
          </View>

          {renderIf(
            groupType == "private",
            <>
              <View style={styles.nameTextContainer}>
                <Text style={styles.nameText}>{t("group_members")}</Text>
              </View>
              <View style={{ marginBottom: 10, marginTop: 10, marginLeft: 10 }}>
                <FlatList
                  horizontal
                  data={membersData}
                  ListFooterComponent={() => (
                    <TouchableOpacity
                      onPress={() => OnAddMemberClick()}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: searchBar().back_ground,
                        width: 80,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                        marginTop: 5,
                        height: 95,
                      }}
                    >
                      <Image
                        source={require("../../../Assets/Icons/plus.png")}
                        style={{
                          height: 20,
                          width: 20,
                          tintColor: textTheme().textColor,
                          marginBottom: 10,
                        }}
                      />
                      <Text
                        style={{
                          color: setWallpaper().iconColor,
                          fontFamily: font.regular(),
                          textAlign: "center",
                        }}
                      >
                        {t("addMembers")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[styles.profile1Container2, {}]}
                      onPress={() => handleChange(item.id)}
                    >
                      <View
                        style={{
                          paddingHorizontal: 10,
                          width: 80,
                          // backgroundColor: "red",
                        }}
                        key={index}
                      >
                        <Image
                          source={
                            //@ts-ignore
                            item.profile_image
                              ? //@ts-ignore
                                { uri: item.profile_image }
                              : require("../../../Assets/Image/girl_profile.png")
                          }
                          style={styles.circleImageLayout}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={{
                            position: "absolute",
                            right: 10,
                            zIndex: 10,
                            justifyContent: "center",
                            alignItems: "center",
                            height: 20,
                            width: 20,
                            borderRadius: 50,
                            backgroundColor: searchBar().back_ground,
                          }}
                          onPress={() => handleRemoveMember(index)}
                        >
                          <Image
                            source={require("../../../Assets/Icons/Cross.png")}
                            style={{
                              height: 10,
                              width: 10,
                              tintColor: iconTheme().iconColor,
                            }}
                          />
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                          style={{
                            backgroundColor: searchBar().back_ground,
                            position: "absolute",
                            top: 0,
                            right: 3,
                            paddingHorizontal: 1,
                            borderWidth: 1,
                            borderColor: "transparent",
                            borderRadius: 40,
                            justifyContent: "center",
                            alignItems: "center",
                            height: 20,
                            width: 20,
                          }}
                          onPress={() => handleRemoveMember(index)}
                        >
                          <Text
                            style={{
                              color: setWallpaper().iconColor,
                            }}
                          >
                            x
                          </Text>
                        </TouchableOpacity> */}

                        <Text
                          style={{
                            alignSelf: "center",
                            fontFamily: font.regular(),
                          }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <LoaderModel visible={loading} />
    </MainComponent>
  );
}
