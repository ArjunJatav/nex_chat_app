import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo, { hasNotch } from "react-native-device-info";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import FileViewer from "react-native-file-viewer";
import {
  COLORS,
  chat,
  chatContainer,
  chatImage,
  chatOther,
  chatTop,
  iconTheme,
  textTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
import {
  Bubble,
  Day,
  GiftedChat,
  IMessage,
  SystemMessage,
  Time,
} from "react-native-gifted-chat";
const isDarkMode = true;
import { t } from "i18next";
import CryptoJS from "react-native-crypto-js";
import {
  EncryptionKey,
  blurImage,
  blurVideo,
  translationKey,
} from "../../../Constant/Key";
import {
  checkChannelExists,
  deleteMessagesForAll,
  getChannelChats,
  getChannelInfo,
  getChannelInfoById,
  increaseSubscribers,
  insertChannelInfo,
  insertChannelList,
  insertChannelMessage,
  replaceLocalPathInChannelMessages,
  updateChannelUnseenMessageCount,
  updateLocalPathInChannelMessages,
  updateMessageAndChannelInfo,
  updatereactions,
  updatereactionsforother,
} from "../../../sqliteStore";
import DocumentPicker from "react-native-document-picker";
import ImagePicker from "react-native-image-crop-picker";
import { socket } from "../../../socket";
import { useFocusEffect } from "@react-navigation/native";
import { SetProfileModal } from "../../Modals/SetProfileModel";
import Video from "react-native-video";
import RNFS from "react-native-fs";
import { decode } from "base64-arraybuffer";
import { useDispatch, useSelector } from "react-redux";
import MediaDownload from "../../../Components/MediaDownload/MediaDownload";
import ImageViewer from "react-native-image-zoom-viewer";
import {
  GestureHandlerRootView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import {
  updateAppState,
  updateMediaLoader,
} from "../../../reducers/getAppStateReducers";
import renderIf from "../../../Components/renderIf";
import { CustomVideoModal } from "../../Modals/CustomVideoModal";
import AudioMessage from "../AudioMessage";
import { fontSize } from "../../../utils/constants/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";

import PremiumAlert from "../../../Components/CustomAlert/PremiumAlert";
import { Video as VideoCompress } from "react-native-compressor";
import {
  chatBaseUrl,
  getChannelData,
  reactionapi,
  joinChannel,
  newChannelChatSyncApi,
} from "../../../Constant/Api";
import axios from "axios";
import { Animated } from "react-native";
import { Pressable } from "react-native";
import { ReactionCount } from "../../Modals/ReactionCount";
import { setChannelObj } from "../../../Redux/MessageSlice";
import { colors } from "../../../utils/constants/colors";
import { LoaderModel } from "../../Modals/LoaderModel";
import { setUserGalleryVideos } from "../../../reducers/friendListSlice";
import CameraRoll from "@react-native-community/cameraroll";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { badword } from "../../../Components/BadWord/Bad_words";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
import { ConfirmAlertModel } from "../../Modals/ConfirmAlertModel";
import { decryptMessage, encryptMessage } from "../../../utils/CryptoHelper";
import WarningModal from "../../Modals/WarningModal";
import {
  setUserBanned,
  setUserSuspendedDays,
} from "../../../reducers/userBanSlice";
import { getRemainingSuspensionDays, updateViolationAttempt } from "../../agora/agoraHandler";
let banType = "Warning";
let banMessage = "";
let banTitle = "";
export default function ChannelChatting({ navigation, route, props }: any) {
  const lastTapRef = useRef(0);
  //@ts-expect-error
  const chatListRef = createRef<any>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [myimages, setmyimages] = useState(false);
  const [mylocaldata, setmylocaldata] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendItems, setSendItems] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [allattachment, setallattachment] = useState([]);
  const [attachmentformate, setattachmentformate] = useState("");
  const [cameraModal, setCameraModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [groupImageModal, setGroupImageModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const chatMessageTime = Date.now();
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [LinkChannelData, setLinkChannelData] = useState("");
  const [channelExists, setChannelExists] = useState(false);
  const [LinkChannelChat, setLinkChannelChat] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reactmsgon, setreactmsgon] = useState(false);
  const [reactmsgondata, setreactmsgondata] = useState({});
  const [lastTap, setLastTap] = useState(null);
  const [ReactionCountmodel, setReactionCountmodel] = useState(false);
  const [reacttiondata, setreacttiondata] = useState([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [selectedMessageId, setSelectedMessageId] = useState([]);
  const [ismultidelete, setismultidelete] = useState(false);
  const [mediaCaption, setMediaCaption] = useState("");
  const [imageModal, setImageModal] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]); // State to track selected videos
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50; // Number of messages to fetch per page
  const [hasMore, setHasMore] = useState(true);
  const [isloadearly, setisloadearly] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const userGalleryVideos = useSelector(
    (state: any) => state?.friendListSlice?.userGalleryVideos
  );

  const joinChannelLimitFree = useSelector(
    (state: any) => state?.premiumLimitSlice?.joinChannelLimitFree
  );
  const joinChannelLimitPremium = useSelector(
    (state: any) => state?.premiumLimitSlice?.joinChannelLimitPremium
  );

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  console.log(
    "messasjdsd====================================",
    messages.length
  );

  useEffect(() => {
    function onKeyboardDidShow(e: KeyboardEvent) {
      // Remove type here if not using TypeScript
      setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardDidHide() {
      setKeyboardHeight(0);
    }
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      //@ts-expect-error
      onKeyboardDidShow
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardDidHide
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reactmsgon) {
      // Bubble in
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Bubble out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [reactmsgon]);
  const mediaLoaderdata = useSelector(
    (state: any) => state.getAppStateReducers.mediaLoader
  );
  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );
  const updateMediacount = useSelector(
    //@ts-ignore
    (state) => state?.getAppStateReducers?.app_state?.updateMediaFunction
  );
  const dispatch = useDispatch();
  const WINDOW_WIDTH = Dimensions.get("window").width;
  //@ts-ignore
  const textInputRef = createRef<any>(null);
  const connectstate = useSelector(
    // eslint-disable-next-line
    (state: any) => state?.getAppStateReducers?.app_state
  );

  const channelInfo = useSelector(
    // eslint-disable-next-line
    (state: any) => state?.message?.channelObj
  );
  // console.log("====================================", channelInfo?.channelType + "hjvjhgjfhgjhfj");

  //message-to-send=in-gifted-chat

  const onSend = useCallback((newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      globalThis.isChannelDetailOpen = "yes";

      // Add your code here to handle the screen being viewed
      // Cleanup function
      return () => {
        globalThis.isChannelDetailOpen = "no";
        // Add your code here to handle the screen not being viewed
      };
    }, [])
  );

  useEffect(() => {
    getPhotos();
  }, []);

  const handleVideoSelection = (item) => {
    const isSelected = selectedVideos.some(
      //@ts-expect-error
      (video) => video?.node?.image?.uri === item?.node?.image?.uri
    );
    // Prevent selection of more than 5 videos
    if (!isSelected && selectedVideos.length >= 5) {
      globalThis.errorMessage =
        "Limit Reached, You can only select up to 5 videos.";
      setErrorAlertModel(true);
      // Alert.alert("Limit Reached", "You can only select up to 5 videos."); // Optional alert to notify the user
      return; // Exit the function to prevent further selection
    }

    if (isSelected) {
      // Deselect video if it's already selected
      setSelectedVideos(
        selectedVideos.filter(
          //@ts-expect-error
          (video) => video?.node?.image?.uri !== item?.node?.image?.uri
        )
      );
    } else {
      // Add video to selectedVideos array
      //@ts-expect-error
      setSelectedVideos([...selectedVideos, item]);
    }
  };

  const getPhotos = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      // sendMediaData.slice();
      CameraRoll.getPhotos({
        first: 500,
        assetType: "Videos",
      })
        .then((res) => {
          // setSendMediaData(res.edges);
          dispatch(setUserGalleryVideos(res.edges));
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      CameraRoll.getPhotos({
        first: 500,
        assetType: "Videos",
      })
        .then((res) => {
          // setSendMediaData(res.edges);
          dispatch(setUserGalleryVideos(res.edges));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const ImageGalleryView = (item, index) => {
    // Find the index of the selected video in the selectedVideos array
    const selectedIndex = selectedVideos.findIndex(
      //@ts-expect-error
      (video) => video?.node?.image?.uri === item?.node?.image?.uri
    );

    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={{
          width: "33%",
          backgroundColor: "lightgray",
          borderWidth: 0.5,
          borderColor: "#fff",
          position: "relative", // Ensure absolute positioning for the count and blur
        }}
        onPress={() => handleVideoSelection(item)} // Handle video selection
      >
        <Image
          style={{
            width: 200,
            height: 150,
            resizeMode: "cover",
          }}
          onError={(error) => console.log("error in uploading image", error)}
          source={{ uri: item?.node?.image?.uri }}
        />

        {/* Play icon */}
        <Image
          source={{
            uri: "https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png",
          }}
          style={{
            position: "absolute",
            top: 50,
            alignSelf: "center",
            height: 60,
            width: 60,
            tintColor: iconTheme().iconColorNew, // Customize as needed
          }}
          resizeMode="contain"
        />

        {/* If video is selected, show blur effect (simulated with semi-transparent overlay) */}
        {selectedIndex !== -1 && (
          <>
            {/* Simulate blur effect using a semi-transparent overlay */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark transparent overlay for blur-like effect
                borderRadius: 5, // Optional: to soften edges
              }}
            />

            {/* Show the selected order count */}
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                height: 30,
                width: 30,
                borderRadius: 15,
                backgroundColor: iconTheme().iconColorNew, // Green background for selected count
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  marginLeft: 3,
                  marginBottom: 2,
                }}
              >
                {selectedIndex + 1} {/* Display the selection count */}
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  //when it is my msg
  const updateMessageStatus = async (newData: any) => {
    let mainDirectory = "";
    let pathObj = {};
    let pathsArray = [];

    if (Platform.OS == "android") {
      mainDirectory = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    } else {
      mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    }

    let subDirectory = "";

    switch (newData.message_type) {
      case "image":
        subDirectory = `${mainDirectory}/Images`;
        break;
      case "video":
        subDirectory = `${mainDirectory}/Videos`;
        break;
      case "document":
        subDirectory = `${mainDirectory}/Documents`;
        break;
      default:
        subDirectory = `${mainDirectory}/Others`;
        break;
    }

    // Ensure main directory exists
    const mainDirectoryExists = await RNFS.exists(mainDirectory);
    if (!mainDirectoryExists) {
      await RNFS.mkdir(mainDirectory);
    }

    // Ensure subdirectory exists
    const subDirectoryExists = await RNFS.exists(subDirectory);
    if (!subDirectoryExists) {
      await RNFS.mkdir(subDirectory);
    }

    if (newData.attachment.length > 0) {
      for (let index = 0; index < newData.attachment.length; index++) {
        const attach = newData.attachment[index];

        const file = attach;
        let mediaName = attach.split("/").pop();
        let mediaId = mediaName.split(".").slice(0, -1).join(".");

        // Use index to ensure the filename is unique
        const filename =
          newData.message_type === "image"
            ? `${mediaId}.jpg`
            : newData.message_type === "video"
            ? `${mediaName}`
            : newData.message_type === "document"
            ? `${mediaName}`
            : `${mediaName}`;
        const encoded = encodeURIComponent(filename);
        const destinationPath = `${subDirectory}/${encoded}`;
        pathObj[index] = destinationPath;

        // Check if all downloads are complete
        if (Object.keys(pathObj).length === newData.attachment.length) {
          // Convert pathObj to an array of paths
          //@ts-ignore
          pathsArray = Object.keys(pathObj)
            .sort()
            .map((key) => pathObj[key]);
          // MediaUpdated(props.messageId, pathsArray);
        }
      }
    }

    setMessages((previousMessages: any) => {
      const index = previousMessages.findIndex(
        (aMessage: any) => aMessage._id === newData.mId
      );

      const newArr = [...previousMessages];
      if (index !== -1) {
        newArr[index] = {
          ...newArr[index], // Maintain other properties
          status: "sent", // Update the status key
          messageId: newData._id,
          _id: newData._id,
          localPaths:
            newData.message_type == "image" ||
            newData.message_type == "video" ||
            newData.message_type == "document" ||
            newData.message_type == "audio"
              ? pathsArray
              : [],
          unreadCount: newData.unreadCount,
          attachment:
            newData.message_type == "location" ||
            newData.message_type == "contact" ||
            newData.message_type == "story"
              ? [JSON.parse(newData.attachment[0])]
              : newData.attachment,
          message: newData.message,
          // isDeletedForAll: newData.isDeletedForAll,
        };
      }

      return newArr;
    });
    let countRed = updateMediacount + 1;
    dispatch(updateAppState({ updateMediaFunction: countRed }));
  };

  function MediaUpdatedOnSame(messageId, Arr, result) {
    onSend([
      //@ts-expect-error
      {
        resId: chatMessageTime,
        text: decryptMessage(result.roomId, result.message),
        // CryptoJS.AES.decrypt(result.message, EncryptionKey).toString(
        //   CryptoJS.enc.Utf8
        // ),
        _id: result._id,
        messageId: result._id,
        system: result.message_type == "notify" ? true : false,
        status: "",
        isForwarded: false,
        parent_message: {},
        createdAt: new Date(),
        isDeletedForAll: false,
        user: { _id: result.fromUser },
        roomId: result.roomId,
        roomOwnerId: result.roomOwnerId,
        messageType: result.message_type,
        attachment: result.attachment,
        message: decryptMessage(result.roomId, result.message),
        // CryptoJS.AES.decrypt(result.message, EncryptionKey).toString(
        //   CryptoJS.enc.Utf8
        // ),
        roomType: "channel",
        image: [],
        audio: [],
        video: [],
        localPaths: Arr,
      },
    ]);
  }
  //new-message-receive-work
  React.useEffect(() => {
    // eslint-disable-next-line
    const handlenewMessageResive = async (data: any) => {
      if (
        globalThis.isChannelDetailOpen == "yes" &&
        data.result.roomId == channelInfo?.channelId
      ) {
        try {
          if (data.result.fromUser != globalThis.userChatId) {
            const dateinsert = new Date(
              data.result.createdAt || data.result.messageTime
            );
            const mId = Math.floor(Math.random() * 9000) + 1000;
            const lastMessageType = data.result.message_type;
            const lastMessage = data.result.message;
            const lastMessageId = data.result._id;
            const lastMessageTime = data.result.resId; // Update with new timestamp
            const time = `${dateinsert}`;

            const objToSend = {
              mId: data.result._id,
              channelName: data.result.roomName,
              fromUser: data.result.fromUser,
              userName: data.result.userName,
              currentUserPhoneNumber: globalThis.phone_number,
              message: lastMessage,
              message_type: data.result.message_type,
              attachment: data.result.attachment,
              channelId: data.result.roomId,
              lastMessage: lastMessage,
              lastMessageId: lastMessageId,
              lastMessageTime: Date.now(),
              lastMessageType: lastMessageType,
              parent_message: {},
              isForwarded: false,
              createdAt: data.result.createdAt,
              updatedAt: time,
              localPath: [],
              channelDescription: channelInfo.channelDescription,
              channelImage: channelInfo.channelImage,
              channelType: channelInfo.channelType,
              channelLink: channelInfo.channelLink,
              subscribers: channelInfo.Subcribers,
              NotificationAllowed: channelInfo.NotificationAllowed,
              isDeletedForAll: false,
            };

            insertChannelList(objToSend, async (res) => {
              if (res == true) {
                if (
                  lastMessageType == "image" ||
                  lastMessageType == "video" ||
                  lastMessageType == "document" ||
                  lastMessageType == "audio"
                ) {
                  const value = await AsyncStorage.getItem("allMediaDownload");
                  const allMediaDownload =
                    value === "true" || globalThis.allMediaDownload === true;

                  if (allMediaDownload) {
                    let dict = {
                      messageType: data.result.message_type,
                      messageId: data.result._id,
                      attachment: data.result.attachment,
                    };
                    MediaDownload(
                      "channel",
                      dict,
                      data.result.roomId,
                      MediaUpdatedOnSame,
                      data.result
                    );
                  } else {
                    onSend([
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      {
                        resId: chatMessageTime,
                        // text: CryptoJS.AES.decrypt(
                        //   lastMessage,
                        //   EncryptionKey
                        // ).toString(CryptoJS.enc.Utf8),
                        text: encryptMessage(
                          channelInfo?.channelId,
                          lastMessage
                        ),
                        _id: lastMessageId,
                        messageId: lastMessageId,
                        system: lastMessageType == "notify" ? true : false,
                        status: "",
                        isForwarded: false,
                        parent_message: {},
                        createdAt: new Date(),
                        isDeletedForAll: false,
                        user: { _id: data.result.fromUser },
                        roomId: channelInfo?.channelId,
                        roomOwnerId: data.result.roomOwnerId,
                        messageType: lastMessageType,
                        attachment: data.result.attachment,
                        message: lastMessage,
                        roomType: "channel",
                        image: [],
                        audio: [],
                        video: [],
                        localPaths: [],
                      },
                    ]);
                  }
                } else {
                  onSend([
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    {
                      resId: chatMessageTime,
                      // text: CryptoJS.AES.decrypt(
                      //   lastMessage,
                      //   EncryptionKey
                      // ).toString(CryptoJS.enc.Utf8),
                      text: encryptMessage(channelInfo?.channelId, lastMessage),
                      _id: lastMessageId,
                      messageId: lastMessageId,
                      system: lastMessageType == "notify" ? true : false,
                      status: "",
                      isForwarded: false,
                      parent_message: {},
                      createdAt: new Date(),
                      isDeletedForAll: false,
                      user: { _id: data.result.fromUser },
                      roomId: channelInfo?.channelId,
                      roomOwnerId: data.result.roomOwnerId,
                      messageType: lastMessageType,
                      attachment: data.result.attachment,
                      // message: CryptoJS.AES.decrypt(
                      //   lastMessage,
                      //   EncryptionKey
                      // ).toString(CryptoJS.enc.Utf8),
                      message: decryptMessage(
                        channelInfo?.channelId,
                        lastMessage
                      ),

                      roomType: "channel",
                      image: [],
                      // audio:  [],
                      localPaths: [],
                    },
                  ]);
                }

                // setLoading(false);
                // navigation.pop();
              } else {
                console.log("ERROR");
              }
            });
          } else {
            const updates = {
              newMId: data.result._id, // The new mId you want to set
              newAttachment: data.result.attachment, // The new attachment to be set
              newLastMessageType: data.result.message_type, // The new lastMessageType to be set
            };

            updateMessageAndChannelInfo(data.result.mId, updates, (success) => {
              if (success) {
                console.log(
                  "Message and Channel Information updated successfully"
                );
              } else {
                console.log("Failed to update message or channel information");
              }
            });

            // if (data.result.attachment && data.result.attachment.length > 0) {
            updateMessageStatus(data.result);
            // }
          }
        } catch (error) {
          console.log("error >>>", error);
        }
      }
    };

    socket.on("newMessageResive", handlenewMessageResive);

    return () => {
      socket.off("newMessageResive", handlenewMessageResive);
    };
  });

  //to-make-image-from-localpath
  function CreateRenderImage(attach) {
    if (attach.startsWith("http") || attach.startsWith("https")) {
      return attach;
    } else {
      let mainDirectory = "";
      if (Platform.OS == "android") {
        mainDirectory = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia`;
      } else {
        mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
      }

      let subDirectory = `${mainDirectory}/Images`;
      // Ensure main directory exists.

      let mediaName = attach?.split("/").pop();
      let mediaId = mediaName?.split(".").slice(0, -1).join(".");
      const filename = `${mediaId}.jpg`;
      const encoded = encodeURIComponent(filename);
      const destinationPath = `${subDirectory}/${encoded}`;

      return destinationPath;
    }
  }

  const renderSystemMessage = useCallback((props: any) => {
    return (
      <View>
        <SystemMessage
          {...props}
          containerStyle={{
            marginBottom: 25,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: chatTop().back_ground,
            alignSelf: "center",
            borderRadius: 2,
            borderBottomRightRadius: 10,
            borderTopLeftRadius: 10,
            marginHorizontal: 10,
          }}
          textStyle={{
            color: iconTheme().iconColorNew,
            fontFamily: font.semibold(),
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 10,
          }}
        />
      </View>
    );
  }, []);

  useEffect(() => {
    console.log("useeffect calling=========");

    if (route?.params?.deepLinking == true) {
      checkChannelExists(route?.params?.channelId, (success) => {
        if (success) {
          setChannelExists(true);
          getChannelInfoById(route?.params?.channelId, (result) => {
            dispatch(setChannelObj(result));
            getChannelChats(route?.params?.channelId, offset, limit, (res) => {
              if (res.length > 0) {
                const formattedMessages = res.map((message) => {
                  if (
                    message.message_type === "text" ||
                    message.message_type === "image" ||
                    message.message_type === "video" ||
                    message.message_type === "audio" ||
                    (message.message_type === "document" &&
                      message.isDeletedForAll == false)
                  ) {
                    return {
                      _id: message?.mId,
                      messageId: message?.mId,
                      text: (() => {
                        if (
                          message.message_type === "image" ||
                          message.message_type === "video" ||
                          message.message_type === "audio" ||
                          message.message_type === "document"
                        ) {
                          return "";
                        } else {
                          try {
                            return decryptMessage(
                              route?.params?.channelId,
                              message.message
                            );
                            // return CryptoJS.AES.decrypt(
                            //   message.message,
                            //   EncryptionKey
                            // ).toString(CryptoJS.enc.Utf8);
                          } catch (error) {
                            console.log("Decryption error: 4", error.message);
                            return "Decryption failed"; // Placeholder in case of error
                          }
                        }
                      })(),
                      createdAt: new Date(message.createdAt),
                      attachment: message?.attachment,
                      localPaths: Array.isArray(message.localPath)
                        ? message.localPath
                        : [],
                      messageType: message?.message_type,
                      audio: [],
                      video: [],
                      image: [], // This is fine; it's likely used elsewhere
                      isDeletedForAll: message?.isDeletedForAll,
                      reactions: message?.reactions || [],
                      user: {
                        _id: message.fromUser,
                        name: message.userName,
                      },
                      message:
                        message.message_type === "image" ||
                        message.message_type === "video" ||
                        message.message_type === "audio" ||
                        message.message_type === "document"
                          ? message.message
                          : decryptMessage(
                              route?.params?.channelId,
                              message.message
                            ),
                      // : CryptoJS.AES.decrypt(
                      //     message.message,
                      //     EncryptionKey
                      //   ).toString(CryptoJS.enc.Utf8),
                      system: false,
                    };
                  } else if (message.message_type === "notify") {
                    return {
                      _id: message.mId,
                      messageId: message.mId,
                      text: (() => {
                        if (
                          message.message_type == "image" ||
                          message.message_type == "video" ||
                          message.message_type == "audio" ||
                          message.message_type == "document"
                        ) {
                          return message.message;
                        } else {
                          try {
                            return decryptMessage(
                              route?.params?.channelId,
                              message.message
                            );
                            // return CryptoJS.AES.decrypt(
                            //   message?.message,
                            //   EncryptionKey
                            // ).toString(CryptoJS.enc.Utf8);
                          } catch (decryptError) {
                            console.log(
                              "Decryption error: 3",
                              decryptError.message
                            );
                            return "Decryption failed"; // or handle accordingly
                          }
                        }
                      })(),
                      createdAt: new Date(message.createdAt),
                      system: true, // This marks it as a system message
                      user: {
                        _id: "",
                        name: message.userName,
                      },
                    };
                  }
                  return null;
                });

                const validMessages = formattedMessages.filter(
                  (message) =>
                    (message !== null && message.isDeletedForAll == true) || 1
                );
                const sortedMessages = validMessages.sort(
                  (a, b) => b.createdAt - a.createdAt
                );

                setMessages(sortedMessages);
              } else {
                const msg = {
                  _id: "h5554",
                  text: t("messages_and_calls_end-to-end_encrypted"),
                  createdAt: new Date(),
                  attachment: [],
                  localPaths: [],
                  messageType: "notify",
                  audio: [],
                  system: true,
                  video: [],
                  image: [], // This is fine; it's likely used elsewhere
                  user: {
                    _id: globalThis.chatUserId,
                    name: "ddfb",
                  },
                };

                //@ts-expect-error
                setMessages([msg]);
              }
            });
          });
        } else {
          setChannelExists(false);
          AllChaneelDataApi();
        }
      });
    } else {
      console.log("it is for step 1", channelInfo?.channelId);
      setChannelExists(true);
      getChannelChats(channelInfo?.channelId, offset, limit, (res) => {
        console.log("it is for step 2", res);
        if (res.length > 0) {
          const formattedMessages = res.map((message) => {
            console.log("it is for step 3");
            try {
              let decryptedText = "";
              if (
                message.message_type == "image" ||
                message.message_type == "video" ||
                message.message_type == "audio" ||
                message.message_type == "document"
              ) {
                decryptedText = message.message;
              } else {
                decryptedText = decryptMessage(
                  channelInfo?.channelId,
                  message.message
                );
                //  CryptoJS.AES.decrypt(
                //   message.message,
                //   EncryptionKey
                // ).toString(CryptoJS.enc.Utf8);
              }

              console.log("it is for step 4", decryptedText);
              if (
                ["text", "image", "video", "audio", "document"].includes(
                  message.message_type
                )
              ) {
                console.log("it is for step 5");
                return {
                  _id: message.mId,
                  messageId: message.mId,
                  text:
                    message.message_type == "image" ||
                    message.message_type == "video" ||
                    message.message_type == "audio" ||
                    message.message_type == "document"
                      ? ""
                      : decryptedText,
                  createdAt: new Date(message.createdAt),
                  attachment: message.attachment || [],
                  localPaths: Array.isArray(message.localPath)
                    ? message.localPath
                    : [],
                  messageType: message.message_type,
                  audio: [],
                  video: [],
                  image: [],
                  reactions: message?.reactions || [],
                  isDeletedForAll: message?.isDeletedForAll || 0,
                  user: {
                    _id: message.fromUser,
                    name: message.userName,
                  },
                  system: false,
                  message: decryptedText,
                };
              } else if (message.message_type === "notify") {
                console.log("it is for step 6");
                return {
                  _id: message.mId,
                  messageId: message.mId,
                  text: decryptedText,
                  createdAt: new Date(message.createdAt),
                  system: true,
                  user: {
                    _id: "",
                    name: message.userName,
                  },
                };
              }
            } catch (error) {
              console.error("Error processing message:", error);
            }

            return null;
          });

          const validMessages = formattedMessages.filter(
            (message) => message !== null
          );
          const sortedMessages = validMessages.sort(
            (a, b) => b.createdAt - a.createdAt
          );
          setMessages(sortedMessages);
        } else {
          const msg = {
            _id: "h5554",
            text: t("messages_and_calls_end-to-end_encrypted"),
            createdAt: new Date(),
            attachment: [],
            localPaths: [],
            messageType: "notify",
            audio: [],
            system: true,
            video: [],
            image: [],
            user: {
              _id: globalThis.chatUserId,
              name: "ddfb",
            },
          };

          // @ts-expect-error
          setMessages([msg]);
        }
      });
    }
  }, [route?.params?.deepLinking, channelInfo?.channelId]);

  //   const fetchChannelChat = async () => {
  //     if (isloadearly) return; // Prevent simultaneous fetches
  //     setisloadearly(true);
  //     const lastMessage = messages[messages.length - 1];
  //     const lastCreatedAt = lastMessage?.createdAt || new Date().toISOString();

  //     try {
  //       console.log("Fetching earlier messages...");

  //       // Update offset before making the request
  //       const currentOffset = offset;
  //       const newOffset = currentOffset + limit;

  //       console.log("Offset:", currentOffset, "New Offset:", newOffset);
  //       console.log("Limit:", limit);

  //       // Fetch channel chats
  //       getChannelChats(channelInfo?.channelId, currentOffset, limit, (res) => {
  //         console.log("Fetched messages:", res.length);

  //         if (res.length > 0) {
  //           setChannelExists(true);

  //           // Map and format messages
  //           const formattedMessages = res.map((message) => {
  //             try {
  //               let decryptedText = "";
  //               if (
  //                 ["image", "video", "audio", "document"].includes(
  //                   message.message_type
  //                 )
  //               ) {
  //                 decryptedText = message.message;
  //               } else {
  //                 decryptedText = CryptoJS.AES.decrypt(
  //                   message.message,
  //                   EncryptionKey
  //                 ).toString(CryptoJS.enc.Utf8);
  //               }

  //               if (
  //                 ["text", "image", "video", "audio", "document"].includes(
  //                   message.message_type
  //                 )
  //               ) {
  //                 return {
  //                   _id: message.mId,
  //                   messageId: message.mId,
  //                   text:
  //                     ["image", "video", "audio", "document"].includes(
  //                       message.message_type
  //                     )
  //                       ? ""
  //                       : decryptedText,
  //                   createdAt: new Date(message.createdAt),
  //                   attachment: message.attachment || [],
  //                   localPaths: Array.isArray(message.localPath)
  //                     ? message.localPath
  //                     : [],
  //                   messageType: message.message_type,
  //                   audio: [],
  //                   video: [],
  //                   image: [],
  //                   reactions: message?.reactions || [],
  //                   isDeletedForAll: message?.isDeletedForAll || 0,
  //                   user: {
  //                     _id: message.fromUser,
  //                     name: message.userName,
  //                   },
  //                   system: false,
  //                   message: decryptedText,
  //                 };
  //               } else if (message.message_type === "notify") {
  //                 return {
  //                   _id: message.mId,
  //                   messageId: message.mId,
  //                   text: decryptedText,
  //                   createdAt: new Date(message.createdAt),
  //                   system: true,
  //                   user: {
  //                     _id: "",
  //                     name: message.userName,
  //                   },
  //                 };
  //               }
  //             } catch (error) {
  //               console.error("Error processing message:", error);
  //             }
  //             return null;
  //           });

  //           // Filter out invalid or duplicate messages
  //           const validMessages = formattedMessages.filter((msg) => msg !== null);

  //           setMessages((prevMessages) => {
  //             const existingMessageIds = new Set(prevMessages.map((msg) => msg._id));

  //             // Exclude duplicates
  //             const newMessages = validMessages.filter(
  //               (msg) => !existingMessageIds.has(msg._id)
  //             );

  //             return [...prevMessages, ...newMessages].sort(
  //               (a, b) => b.createdAt - a.createdAt
  //             );
  //           });

  //           // Update offset only if messages are fetched
  //           setOffset(newOffset);
  //         } else {
  //           // Handle no new messages
  //           console.log("No more messages to fetch.");
  //           getPaginationDataFromApi(lastCreatedAt)
  //         }
  //       });
  //     } catch (error) {
  //       console.error("Error in fetchChannelChat:", error);
  //     } finally {
  //       setisloadearly(false); // Allow future fetches
  //     }
  //   };

  //   const getPaginationDataFromApi = async (lastMessageTimeISO) => {
  //   //  const lastMessageTimeISO = new Date(createAt).toISOString();
  //     // console.log('userid=============',globalThis.userChatId);
  //     // console.log('channelInfo?.channelId=============',channelInfo?.channelId);
  //     console.log('lastMessageTimeISO=============', lastMessageTimeISO);

  //     setisloadearly(true);

  //     try {

  //       // Make the API request
  //       const response = await axios.get(
  //         `${chatBaseUrl}${newChannelChatSyncApi}`,
  //         {
  //           params: {
  //             userId: globalThis.userChatId,
  //             channelIds: channelInfo?.channelId,
  //             limit: 50,
  //             skip: 0,
  //             lastMessageTime: lastMessageTimeISO,
  //           },
  //           headers: {
  //             "Content-Type": "application/json",
  //             api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
  //           },
  //         }
  //       );

  //       // Check if the response is valid
  //       if (response.data.status) {
  //         setisloadearly(false);

  // console.log('channel res=============>>>>>',response.data.data.length);

  //         // Loop through each response item and process it
  //         response.data.data.forEach((res) => {
  //           console.log("channel res=========", res);

  //           const obj = {
  //             lastMessageId: res._id,
  //             localPath: [],
  //             attachment: res.attachment,
  //             channelId: res.channelId,
  //             fromUser: res.from._id,
  //             userName: res.from.name,
  //             currentUserPhoneNumber: res.from.phone_number,
  //             message: res.message,
  //             parent_message: {},
  //             isForwarded: res.isForwarded,
  //             createdAt: res.createdAt,
  //             updatedAt: res.updatedAt,
  //             lastMessageType: res.message_type,
  //             reactions: res.reactions?.reactions || [],
  //             isDeletedForAll: res?.isDeletedForAll,
  //           };

  //           // Call insertChannelMessage to store the message
  //           insertChannelMessage(obj, (success) => {
  //             console.log("Channel message insert success:", success);
  //             fetchChannelChat();
  //           });
  //         });
  //       } else {
  //         setisloadearly(false);
  //         console.warn("Channel sync response status is false");
  //       }
  //     } catch (err) {
  //       setisloadearly(false);
  //       console.error(
  //         "Error syncing room IDs:",
  //         err.response || err.message || err
  //       );
  //     }
  //   };

  const fetchChannelChat = async () => {
    if (isloadearly) return; // Prevent simultaneous fetches
    setisloadearly(true);

    const lastMessage = messages[messages.length - 1];
    const lastCreatedAt = lastMessage?.createdAt || new Date().toISOString();

    try {
      console.log("Fetching earlier messages...");
      // Update offset before making the request
      const currentOffset = offset;
      const newOffset = currentOffset + limit;

      console.log("Offset:", currentOffset, "New Offset:", newOffset);
      console.log("Limit:", limit);

      // Fetch channel chats
      getChannelChats(channelInfo?.channelId, currentOffset, limit, (res) => {
        console.log("Fetched messages:", res.length);

        if (res.length > 0) {
          setChannelExists(true);

          // Map and format messages
          const formattedMessages = res.map((message) => {
            try {
              let decryptedText = "";
              if (
                ["image", "video", "audio", "document"].includes(
                  message.message_type
                )
              ) {
                decryptedText = message.message;
              } else {
                decryptedText = decryptMessage(
                  channelInfo?.channelId,
                  message.message
                );
                //CryptoJS.AES.decrypt(message.message, EncryptionKey).toString(CryptoJS.enc.Utf8);
              }

              if (
                ["text", "image", "video", "audio", "document"].includes(
                  message.message_type
                )
              ) {
                return {
                  _id: message.mId,
                  messageId: message.mId,
                  text: ["image", "video", "audio", "document"].includes(
                    message.message_type
                  )
                    ? ""
                    : decryptedText,
                  createdAt: new Date(message.createdAt),
                  attachment: message.attachment || [],
                  localPaths: Array.isArray(message.localPath)
                    ? message.localPath
                    : [],
                  messageType: message.message_type,
                  audio: [],
                  video: [],
                  image: [],
                  reactions: message?.reactions || [],
                  isDeletedForAll: message?.isDeletedForAll || 0,
                  user: { _id: message.fromUser, name: message.userName },
                  system: false,
                  message: decryptedText,
                };
              } else if (message.message_type === "notify") {
                return {
                  _id: message.mId,
                  messageId: message.mId,
                  text: decryptedText,
                  createdAt: new Date(message.createdAt),
                  system: true,
                  user: { _id: "", name: message.userName },
                };
              }
            } catch (error) {
              console.error("Error processing message:", error);
            }
            return null;
          });

          // Filter out invalid or duplicate messages
          const validMessages = formattedMessages.filter((msg) => msg !== null);

          setMessages((prevMessages) => {
            const existingMessageIds = new Set(
              prevMessages.map((msg) => msg._id)
            );

            // Exclude duplicates
            const newMessages = validMessages.filter(
              (msg) => !existingMessageIds.has(msg._id)
            );

            return [...prevMessages, ...newMessages].sort(
              (a, b) => b.createdAt - a.createdAt
            );
          });

          // Update offset only if messages are fetched
          setOffset(newOffset);
        } else {
          // Handle no new messages
          console.log("No more messages to fetch.");
          getPaginationDataFromApi(lastCreatedAt); // This function may trigger further fetches if needed
        }
      });
    } catch (error) {
      console.error("Error in fetchChannelChat:", error);
    } finally {
      setisloadearly(false); // Allow future fetches
    }
  };

  const getPaginationDataFromApi = async (lastMessageTimeISO) => {
    console.log("Last message time:", lastMessageTimeISO);
    setisloadearly(true);

    try {
      // Make the API request
      const response = await axios.get(
        `${chatBaseUrl}${newChannelChatSyncApi}`,
        {
          params: {
            userId: globalThis.userChatId,
            channelIds: channelInfo?.channelId,
            limit: 50,
            skip: 0,
            lastMessageTime: lastMessageTimeISO,
          },
          headers: {
            "Content-Type": "application/json",
            api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
          },
        }
      );

      // Check if the response is valid
      if (response.data.status) {
        setisloadearly(false);

        console.log("Channel sync response length:", response.data.data.length);

        // Loop through each response item and process it
        response.data.data.forEach((res) => {
          const obj = {
            lastMessageId: res._id,
            localPath: [],
            attachment: res.attachment,
            channelId: res.channelId,
            fromUser: res.from._id,
            userName: res.from.name,
            currentUserPhoneNumber: res.from.phone_number,
            message: res.message,
            parent_message: {},
            isForwarded: res.isForwarded,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt,
            lastMessageType: res.message_type,
            reactions: res.reactions?.reactions || [],
            isDeletedForAll: res?.isDeletedForAll,
          };

          // Call insertChannelMessage to store the message
          insertChannelMessage(obj, (success) => {
            console.log("Channel message insert success:", success);
            fetchChannelChat(); // Fetch again after insertion to update the UI
          });
        });
      } else {
        setisloadearly(false);
        console.warn("Channel sync response status is false");
      }
    } catch (err) {
      setisloadearly(false);
      console.error(
        "Error syncing room IDs:",
        err.response || err.message || err
      );
    }
  };

  useEffect(() => {
    let count = { count: 0 };
    updateChannelUnseenMessageCount(channelInfo?.channelId, count);
  }, []);

  const renderTime = (props: any) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 5,
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <Time
          {...props}
          timeTextStyle={{
            right: {
              color: chatOther().chatTextColor,
              opacity: 0.6,
              fontFamily: font.semibold(),
            }, // Change this to set the text color for sent messages' time
            left: { color: "black", opacity: 0.6, fontFamily: font.semibold() }, // Change this to set the text color for received messages' time
          }}
        />
      </View>
    );
  };

  function JoinChanelViaLink() {
    getChannelInfo(async (channels, count) => {
      let joinedChannelLength = channels.length - count;
      if (joinedChannelLength > joinChannelLimitFree && !userPremium) {
        setShowPremiumAlert(true);
      } else {
        if (joinedChannelLength < joinChannelLimitPremium) {
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          const bodydata = JSON.stringify({
            userId: globalThis.userChatId,
            //@ts-expect-error
            channelId: LinkChannelData._id,
          });
          const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: bodydata,
          };

          const response = await fetch(
            chatBaseUrl + joinChannel,
            requestOptions
          );

          const data = await response.json();
          if (data.status === true) {
            try {
              const mId = Math.floor(Math.random() * 9000) + 1000;

              // const dateinsert = new Date(
              //   data.result.createdAt || data.result.messageTime
              // );
              socket.emit("joinChannel", {
                //@ts-expect-error
                roomId: LinkChannelData._id,
                userId: globalThis.chatUserId,
              });
              let channelLinkToSend =
                "https://tokeecorp.com/backend/public/deepLink-forward?type=channel&id=" +
                //@ts-expect-error
                LinkChannelData?._id;
              const obj = {
                //@ts-expect-error
                ownerId: LinkChannelData?.owner,
                //@ts-expect-error
                channelName: LinkChannelData?.name,
                //@ts-expect-error
                channelDescription: LinkChannelData.description,
                //@ts-expect-error
                image: LinkChannelData?.image,
                //@ts-expect-error
                type: LinkChannelData?.isPublic ? "public" : "private", // Assuming type can be derived from isPublic
                link: channelLinkToSend, // Add link if available
                //@ts-expect-error
                subs: LinkChannelData?.membersCount + 1,
                notifiAllow: true, // Default or based on other conditions
                //@ts-expect-error
                channelId: LinkChannelData?._id,
                lastMessage: "",
                //@ts-expect-error
                lastMessageId: LinkChannelData._id + 1,
                lastMessageType: "notify",
                lastMessageTime: Date.now(),
                //@ts-expect-error
                isExclusive: LinkChannelData?.isExclusive ? 1 : 0,
                //@ts-expect-error
                isPaid: LinkChannelData?.isPaid ? 1 : 0,
                isHide: 0,
              };

              insertChannelInfo(obj, (res) => {
                if (res == true) {
                  //@ts-expect-error
                  increaseSubscribers(LinkChannelData._id, (result) => {
                    if (result == true) {
                      getChannelInfoById(route?.params?.channelId, (result) => {
                        dispatch(setChannelObj(result));
                      });

                      const processMessages = async () => {
                        await Promise.all(
                          LinkChannelChat.map(async (res: any) => {
                            console.log(
                              "res.reactions?.reactions",
                              res.reactions?.reactions
                            );
                            const obj = {
                              _id: res._id,
                              mId: res._id,
                              lastMessageId: res._id,
                              localPath: [],
                              attachment: res.attachment,
                              channelId: res.channelId,
                              //@ts-expect-error
                              fromUser: LinkChannelData?.owner,
                              userName: "dhdjdh",
                              currentUserPhoneNumber: "2244234",
                              message: res.message,
                              parent_message: {},
                              isForwarded: res.isForwarded,
                              createdAt: res.createdAt,
                              updatedAt: res.updatedAt,
                              lastMessageType: res.message_type,
                              reactions: res.reactions || [],
                              isDeletedForAll: res.isDeletedForAll,
                            };

                            // setreacttiondata(res.reactions?.reactions);

                            // Ensure insertChannelMessage is handled properly, and wait for it to complete
                            await new Promise((resolve) =>
                              insertChannelMessage(obj, (success) => {
                                resolve(success);
                                setChannelExists(true);
                              })
                            );
                          })
                        );

                        // setMessages(processedMessages);
                      };

                      // Call the function to process messages
                      processMessages();

                      // navigation.pop();
                    }
                  });
                }
              });
            } catch {}
          } else {
            console.log("status false", data);
          }
        } else {
          globalThis.errorMessage =
            "The Channel join limit has been reached. You cannot join more Channels.";
          setErrorAlertModel(true);
          // Alert.alert(
          //   t("error"), // The title of the alert
          //   t(
          //     "The Channel join limit has been reached. You cannot join more Channels."
          //   ), // The message body
          //   [{ text: t("OK") }] // Button options
          // );
        }
      }
      /// setChannelData(channels);
    });
  }

  async function TranslateWord(text, callback) {
    const urlStr =
      "https://www.googleapis.com/language/translate/v2?key=" +
      translationKey +
      "&target=" +
      "en" +
      "&q=" +
      text.replace(/[^a-zA-Z0-9 ]/g, "");
    setLoading(true);
    try {
      const response = await axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      setLoading(false);
      const textEnteredByUser =
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
      const match = inputWords.some((word) => badWordsInArr.includes(word));

      if (match) {
        const resion = `In the channel "${channelInfo.channelName}", the user posted inappropriate content: "${text}".`;

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
              "This message has an inappropriate content which is prohibited to use.";
            setErrorAlertModel(true);
          }
        } else {
          globalThis.errorMessage =
            "This message has an inappropriate content which is prohibited to use.";
          setErrorAlertModel(true);
        }

        callback(true);

        // Alert.alert(
        //   "Alert!",
        //   t(
        //     "This message has an inappropriate content which is prohibited to use."
        //   ),
        //   [{ text: t("ok") }]
        // );
        // Inappropriate words found
      } else {
        callback(false); // No inappropriate words found
      }
    } catch (error) {
      setLoading(false);
      callback(false); // Error occurred, consider it as inappropriate words found
    }
  }

  function OnSendClick() {
    if (messageInput !== "") {
      if (channelInfo?.channelType == "public") {
        TranslateWord(messageInput, (data) => {
          if (!data) {
            onsendallmessage();
          }
          return data;
        });
      } else {
        onsendallmessage();
      }
    }
  }
  async function onsendallmessage() {
    if (messageInput.trim() === "") {
      // Optionally, you can add a check to prevent sending empty messages.
      return;
    }

    const messageSend = encryptMessage(channelInfo?.channelId, messageInput);

    // CryptoJS.AES.encrypt(
    //   messageInput,
    //   EncryptionKey
    // ).toString();
    const mId = Math.floor(Math.random() * 9000) + 1000;

    setMessageInput(""); // Clear the message input field after sending

    const paramsOfSend = {
      mId: mId,
      channelId: channelInfo?.channelId,
      fromUser: globalThis.userChatId,
      userName: globalThis.displayName,
      phoneNumber: Number(globalThis.phone_number.substr(-10)),
      message: messageSend,
      message_type: "text",
      attachment: [],
      parent_message: {},
      isForwarded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      localPath: [],
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channelId: channelInfo.channelId,
      channelName: channelInfo.channelName,
      channelDescription: channelInfo.channelDescription,
      channelImage: channelInfo.channelImage,
      channelType: channelInfo.channelType,
      channelLink: channelInfo.channelLink,
      subscribers: channelInfo.Subcribers,
      NotificationAllowed: channelInfo.NotificationAllowed,
      lastMessageId: mId,
      lastMessageType: "text",
      lastMessageTime: Date.now(),
      isDeletedForAll: false,
    };
    insertChannelList(paramsOfSend);

    socket.emit("joinChannel", {
      roomId: channelInfo?.channelId,
      userId: globalThis.chatUserId,
    });
    const paramsToSendForLive = {
      roomId: channelInfo?.channelId,
      roomOwnerId: globalThis.userChatId,
      message_type: "text",
      attachment: [],
      message: messageSend,
      roomType: "channel",
      userName: globalThis.displayName,
      phoneNumber: globalThis.phone_number,
      currentUserPhoneNumber: globalThis.phone_number,
      userImage: globalThis.image,
      mId: mId,
      isDeletedForAll: false,
    };

    socket.emit("sendmessage", paramsToSendForLive);

    onSend([
      //@ts-expect-error
      {
        resId: chatMessageTime,
        text: messageInput,
        _id: mId,
        messageId: mId,
        system: false,
        status: "",
        isForwarded: false,
        parent_message: {},
        createdAt: new Date(),
        isDeletedForAll: false,
        user: { _id: globalThis.userChatId },
        roomId: channelInfo?.channelId,
        roomOwnerId: globalThis.userChatId,
        messageType: "text",
        attachment: [],
        message: messageSend,
        roomType: "channel",
        video: [],
        image: [],
        audio: [],
        localPaths: [],
      },
    ]);
  }

  const styles = StyleSheet.create({
    chatTopContainer: {
      backgroundColor: chatTop().back_ground,
      paddingBottom: 60,
    },
    plusModalContainer: {
      width: "100%",
      position: "absolute",
      bottom: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    plusModalImageTextConatiner: {
      width: "100%",
      borderBottomWidth: 0.2,
      padding: 5,
      borderColor: COLORS.grey,
    },
    profile1Container: {
      marginTop: 20,
      flexDirection: "row",
      height: 50,
      width: "100%",
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    Container1: {
      justifyContent: "center",
      width: "10%",
    },
    backIcon: {
      height: 22,
      width: 22,
      tintColor: COLORS.black,
    },
    Container: {
      justifyContent: "center",
      width: "10%",
    },
    circleImageLayout: {
      width: 45,
      height: 45,
      borderRadius: 23,
    },
    nameInviteContainer: {
      justifyContent: "center",
      marginLeft: 10,
      width: "70%",
      flexDirection: "column",
    },
    plusModalRowContainer: {
      alignItems: "center",
      backgroundColor: "#fff",
      width: "90%",
      marginRight: 10,
      borderRadius: 15,
    },
    name1conText: {
      fontSize: FontSize.font,
      fontFamily: font.bold(),
      color: colors.black,
      paddingLeft: 10,
    },
    chatContainer: {
      flex: 1,
      backgroundColor: chatContainer().back_ground,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      overflow: "hidden",
    },
    plusModalButton: {
      alignItems: "center",
      flexDirection: "row",
      width: "100%",
      padding: 5,
    },
    plusModalIcon: {
      height: 28,
      width: 28,
      tintColor: iconTheme().iconColorNew,
    },
    plusModalText: {
      marginLeft: 10,
      fontSize: 15,
      fontFamily: font.semibold(),
      color: "#000",
    },
  });

  const baseStyles = StyleSheet.create({
    userMessage: {
      position: "absolute",
      backgroundColor: "#fff",
      borderRadius: 100,
      paddingHorizontal: 10,
      paddingVertical: 2,
      bottom: -3,
      right: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    otherUserMessage: {
      position: "absolute",
      backgroundColor: "#f1f0f0",
      borderRadius: 100,
      paddingHorizontal: 10,
      paddingVertical: 2,
      bottom: -3,
      left: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
  });

  function ToclickOnImageIcon() {
    setattachmentformate("image");
    setSendItems(false);
    setCameraModal(true);
  }

  function MediaUpdated(messageId: any, pathsArray: any) {
    // Find the index of the object in the messages array with the given messageId
    const itemToUpdateIndex = messages.findIndex(
      (item: any) => item.messageId === messageId
    );

    if (itemToUpdateIndex === -1) {
      return;
    }

    // Create a copy of the messages array
    const newMessages = [...messages];

    // Update the localPaths array with the new paths
    newMessages[itemToUpdateIndex] = {
      ...newMessages[itemToUpdateIndex],
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      localPaths: pathsArray,
    };

    dispatch(
      updateMediaLoader({
        messageId: messageId,
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        isMediaLoader: false,
      })
    );
    // Set the updated messages array
    setMessages(newMessages);
    let countRed = updateMediacount + 1;
    dispatch(updateAppState({ updateMediaFunction: countRed + 1 }));
  }
  /////////////////////////////////////////////////// video click event//////////////////////////////////////////////////

  function ToclickOnVideoIcon() {
    setattachmentformate("video");
    setSendItems(false);
    setVideoModal(true);
  }
  //////////////////////////////pick-document-byclick from modal////////////////////////////////////////////////////////
  const pickDocument = async () => {
    setattachmentformate("document");
    try {
      if (Platform.OS == "android") {
        const result: any = await DocumentPicker.pick({
          type: [DocumentPicker.types.pdf],
        });
        Keyboard.dismiss();
        setSendItems(false);
        setCameraModal(false);
        setallattachment(result);
        setTimeout(() => {
          Keyboard.dismiss();
          setGroupImageModal(true);
        }, 1500);
      } else {
        const result: any = await DocumentPicker.pick({
          type: [DocumentPicker.types.pdf],
          mode: "import",
          copyTo: "documentDirectory",
        });
        Keyboard.dismiss();
        setSendItems(false);
        setCameraModal(false);
        setallattachment(result);
        setTimeout(() => {
          Keyboard.dismiss();
          setGroupImageModal(true);
        }, 1500);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  //////////////////////////pick-audio-from modal///////////////////////////////////////////////////////////////////
  const pickAudio = async () => {
    setattachmentformate("audio");
    try {
      const result: any = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });

      setSendItems(false);
      setCameraModal(false);
      Keyboard.dismiss();
      //  testPathNormalization(result);
      BucketUploadFile(result, "audio");
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        let granted;

        if (Platform.Version >= 33) {
          const [readImagesGranted, readVideosGranted] = await Promise.all([
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              {
                title: "Read Media Images Permission",
                message: "App needs permission to access your images",
                buttonPositive: "OK",
              }
            ),
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
              {
                title: "Read Media Videos Permission",
                message: "App needs permission to access your videos",
                buttonPositive: "OK",
              }
            ),
          ]);

          granted =
            readImagesGranted === PermissionsAndroid.RESULTS.GRANTED &&
            readVideosGranted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "Read External Storage Permission",
              message: "App needs permission to access your external storage",
              buttonPositive: "OK",
            }
          );
          granted = granted === PermissionsAndroid.RESULTS.GRANTED;
        }

        return granted;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // For iOS or non-Android platforms
    }
  };

  const captureImage = async () => {
    let isCameraPermitted = await requestCameraPermission();

    if (isCameraPermitted) {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        mediaType: "photo",
        multiple: true,
        compressImageQuality: 0.2,
      })
        .then((image) => {
          if (image !== undefined) {
            const imageArr: any = [image];
            setSendItems(false);
            setCameraModal(false);
            Keyboard.dismiss();
            setallattachment(imageArr);
            // setallattachment(
            //   image.map((item) => ({ ...item, type: "video/mp4" }))
            // );

            setGroupImageModal(true);
          }
        })
        .catch((error) => {
          console.error("Error checking existence:", error);
        });
    }
  };

  const copyFileToFolder = async (srcPath, destFolder, fileName) => {
    try {
      // Ensure the destination folder exists
      await RNFS.mkdir(destFolder);
      const encoded = encodeURIComponent(fileName);
      const destPath = `${destFolder}/${encoded}`;
      // Copy the file to the destination folder
      await RNFS.copyFile(srcPath, destPath);

      return destPath;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const checkLocalPaths = async () => {
      const updatedMessages = [...messages]; // Copy messages to modify them
      let shouldUpdateState = false;

      for (const [index, message] of messages.entries()) {
        //@ts-expect-error

        //@ts-expect-error
        if (message?.localPaths) {
          const isUpdated = await checkIfFilesExist(
            message,
            index,
            updatedMessages
          );
          if (isUpdated) {
            shouldUpdateState = true; // Mark that state update is needed
          }
        }
      }

      // Update the state only if necessary
      if (shouldUpdateState) {
        setMessages(updatedMessages);
      }
    };

    checkLocalPaths();
  }, [messages]);

  const checkIfFilesExist = async (
    message: any,
    messageIndex: any,
    updatedMessages: any[]
  ) => {
    try {
      let updatedLocalPaths = [];
      let isLocalPathUpdated = false;

      for (const item of message.localPaths) {
        let mediaName = item.split("/").pop();
        let mediaId = mediaName.split(".").slice(0, -1).join(".");

        const filename =
          message.messageType === "image"
            ? `${mediaId}.jpg`
            : message.messageType === "video"
            ? `${mediaName}`
            : message.messageType === "audio"
            ? `${mediaName}`
            : `${mediaName}`; // Modify logic if necessary

        const encoded = encodeURIComponent(filename);

        let subDirectory = "";
        switch (message.messageType) {
          case "image":
            subDirectory = "Images";
            break;
          case "video":
            subDirectory = "Videos";
            break;
          case "document":
            subDirectory = "Documents";
            break;
          default:
            subDirectory = "Others";
            break;
        }

        let destinationPath =
          Platform.OS === "android"
            ? `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`
            : `${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`;

        const fileExists = await RNFS.exists(destinationPath);

        if (fileExists) {
          //@ts-expect-error
          updatedLocalPaths.push(item);
        } else {
          let newPath = message.messageType === "image" ? blurImage : blurVideo;
          //@ts-expect-error
          updatedLocalPaths.push(newPath);
          await replaceLocalPathInChannelMessages(
            message.messageId,
            item,
            newPath
          );
          isLocalPathUpdated = true;
        }
      }

      if (isLocalPathUpdated) {
        updatedMessages[messageIndex] = {
          ...message,
          localPaths: updatedLocalPaths,
        };
        return true; // Return true to indicate state should be updated
      }
    } catch (error) {
      console.log("error : ", error);
    }
    return false; // No state update needed
  };

  const BucketUploadFile = async (file: any, mediaType: any) => {
    setCameraModal(false);
    setVideoModal(false);

    const allPaths = await file.map((image: any) => image.uri || image.path);

    const mId = Math.floor(Math.random() * 9000) + 1000;

    const paramsOfSend = {
      mId,
      channelId: channelInfo?.channelId,
      fromUser: globalThis.userChatId,
      userName: globalThis.displayName,
      phoneNumber: Number(globalThis.phone_number.substr(-10)),
      message: mediaCaption,
      message_type: mediaType,
      attachment: allPaths,
      parent_message: {},
      isForwarded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      localPath: [],
      ...channelInfo,
      lastMessageId: mId,
      lastMessageType: mediaType,
      lastMessageTime: Date.now(),
      isDeletedForAll: false,
    };

    //-----
    insertChannelList(paramsOfSend);

    onSend([
      {
        resId: chatMessageTime,
        text: "",
        _id: mId,
        messageId: mId,
        system: false,
        status: "",
        isForwarded: false,
        parent_message: {},
        createdAt: new Date(),
        isDeletedForAll: false,
        user: { _id: globalThis.userChatId },
        roomId: channelInfo?.channelId,
        roomOwnerId: globalThis.userChatId,
        messageType: mediaType,
        attachment: allPaths,
        message: mediaCaption,
        roomType: "channel",
        video: mediaType === "video" ? allPaths : [],
        image: mediaType === "image" ? allPaths : [],
        audio: mediaType === "audio" ? allPaths : [],
        localPaths: [],
      },
    ]);

    setGroupImageModal(false);

    const AWS = require("aws-sdk");
    const bucket = new AWS.S3({
      bucketName: "tokee-chat-staging",
      region: "us-east-2",
      accessKeyId: globalThis.accessKey,
      secretAccessKey: globalThis.awsSecretAccessKey,
      s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/",
    });

    const folderName = "Document/";
    let newAttachmentUrls: any = [];

    await Promise.all(
      file.map(async (document, index) => {
        const fPath = document.uri || document.path;

        try {
          if (mediaType == "video") {
            const fileSize = await RNFS.stat(fPath).then((stat) => stat.size);
            const chunkSize = 1024 * 1024; // 1MB chunks
            let offset = 0;

            while (offset < fileSize) {
              const chunk = await RNFS.read(fPath, chunkSize, offset, "base64");
              const arrayBuffer = decode(chunk);

              // Only upload the last chunk as a file
              if (offset + chunkSize >= fileSize) {
                const pathParts = fPath.split("/");
                const fileName = `${Date.now()}_${
                  pathParts[pathParts.length - 1]
                }`;
                const contentDisposition = `inline;filename="${fileName}"`;
                const type = document?.type?.split("/");

                const params = {
                  Bucket: "tokee-chat-staging",
                  Key: `${folderName}${globalThis.chatUserId}${Date.now()}.${
                    type[1]
                  }`,
                  Body: arrayBuffer,
                  ContentDisposition: contentDisposition,
                  ContentType: document.type,
                };

                const data = await bucket.upload(params);

                data.on("httpUploadProgress", (progress) => {
                  const { loaded, total } = progress;
                  const percentage = (loaded / total) * 100;

                  setUploadProgress((prevProgress) => {
                    const updatedProgress = [...prevProgress];
                    updatedProgress[index] = percentage;
                    return updatedProgress;
                  });
                });

                const datanew = await data.promise();
                const mediaName = datanew.Location.split("/").pop();
                const mediaId = mediaName.split(".").slice(0, -1).join(".");
                let fileNamemew = "";
                let destFolder = "";
                if (mediaType == "video") {
                  destFolder = `${RNFS.DocumentDirectoryPath}/TokeeMedia/Videos`;
                  fileNamemew = `${mediaId}.` + type[1];
                } else if (mediaType == "document") {
                  destFolder = `${RNFS.DocumentDirectoryPath}/TokeeMedia/Documents`;
                  fileNamemew = `${mediaId}.` + type[1];
                } else {
                  destFolder = `${RNFS.DocumentDirectoryPath}/TokeeMedia/Others`;
                  fileNamemew = `${mediaId}.` + type[1];
                }

                // let destFolder = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`;
                // fileNamemew = `${mediaId}.${type[1]}`;

                const localPath = await copyFileToFolder(
                  fPath,
                  destFolder,
                  fileNamemew
                );
                updateLocalPathInChannelMessages(mId, localPath, () => {});
                newAttachmentUrls.push(datanew.Location);
              }

              offset += chunkSize;
            }
          } else {
            const base64 =
              Platform.OS == "android"
                ? await RNFS?.readFile(fPath, "base64")
                : await RNFS?.readFile(fPath, "base64");

            const arrayBuffer = decode(base64);

            const pathParts = fPath.split("/");

            const fileName = Date.now() + "_" + pathParts[pathParts.length - 1];

            const contentDeposition = `inline;filename="${fileName}"`;

            let type = document?.type?.split("/");

            const params = {
              Bucket: "tokee-chat-staging",

              Key:
                folderName + globalThis.chatUserId + Date.now() + "." + type[1],

              Body: arrayBuffer,

              ContentDisposition: contentDeposition,

              ContentType: document.type,
            };

            const data = await bucket.upload(params);

            data.on("httpUploadProgress", (progress: any) => {
              const { loaded, total } = progress;

              const percentage = (loaded / total) * 100;

              setUploadProgress((prevProgress) => {
                const updatedProgress = [...prevProgress]; //@ts-ignore

                updatedProgress[index] = percentage;

                return updatedProgress;
              });

              if (percentage == 100) {
              }
            });

            try {
              const datanew = await data.promise();

              //code -by-dinki

              let mediaName = datanew.Location.split("/").pop();

              let mediaId = mediaName.split(".").slice(0, -1).join(".");

              let fileName = "";

              // const fileName = `${mediaId}.jpg`

              let destFolder = "";

              if (mediaType == "video") {
                if (Platform.OS == "android") {
                  destFolder = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/Videos`;
                } else {
                  destFolder = `${RNFS.DocumentDirectoryPath}/TokeeMedia/Videos`;
                }

                fileName = `${mediaId}.` + type[1];
              } else if (mediaType == "document") {
                if (Platform.OS == "android") {
                  destFolder = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/Documents`;
                } else {
                  destFolder = `${RNFS.DocumentDirectoryPath}/TokeeMedia/Documents`;
                }

                fileName = `${mediaId}.pdf`;
              } else {
                if (Platform.OS == "android") {
                  destFolder = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/Others`;
                } else {
                  destFolder = `${RNFS.DocumentDirectoryPath}/TokeeMedia/Others`;
                }

                fileName = `${mediaId}.` + type[1];
              }

              const localPath = await copyFileToFolder(
                fPath,

                destFolder,

                fileName
              );

              updateLocalPathInChannelMessages(mId, localPath, () => {});

              newAttachmentUrls.push(datanew.Location);
            } catch (error) {
              throw error;
            }
          }
        } catch (err) {
          console.error("Error uploading file:", err);
          setLoading(false);
        }
      })
    );

    setUploadProgress([]);
    const paramsToSendForLive = {
      roomId: channelInfo?.channelId,
      roomOwnerId: globalThis.userChatId,
      message_type: mediaType,
      attachment: newAttachmentUrls,
      message: mediaCaption,
      roomType: "channel",
      userName: globalThis.displayName, //@ts-ignore
      phoneNumber: globalThis.phone_number, //@ts-ignore
      currentUserPhoneNumber: globalThis.phone_number, //@ts-ignore
      userImage: globalThis.image,
      mId: mId,
    };
    socket.emit("joinChannel", {
      roomId: channelInfo?.channelId,
      userId: globalThis.chatUserId,
    });

    socket.emit("sendmessage", paramsToSendForLive);
    setMediaCaption("");

    setTimeout(async () => {
      try {
        const cacheDir = RNFS.CachesDirectoryPath;
        await RNFS.unlink(cacheDir);
      } catch (error) {
        console.error("Error cleaning cache:", error);
      }
    }, 1000);
  };

  const BucketUpload = async (image, mediaType) => {
    setCameraModal(false);
    setVideoModal(false);
    setLoading(false);
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    const allPaths = allattachment.map((img) => img.path);

    const mId = Math.floor(Math.random() * 9000) + 1000;

    const paramsOfSend = {
      mId,
      channelId: channelInfo?.channelId,
      fromUser: globalThis.userChatId,
      userName: globalThis.displayName,
      phoneNumber: Number(globalThis.phone_number.substr(-10)),
      message: mediaCaption,
      message_type: mediaType,
      attachment: allPaths,
      parent_message: {},
      isForwarded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      localPath: [],
      ...channelInfo,
      lastMessageId: mId,
      lastMessageType: mediaType,
      lastMessageTime: Date.now(),
      isDeletedForAll: false,
    };
    //-----
    insertChannelList(paramsOfSend);

    onSend([
      {
        resId: chatMessageTime,
        text: "",
        _id: mId,
        messageId: mId,
        system: false,
        status: "",
        isForwarded: false,
        parent_message: {},
        createdAt: new Date(),
        isDeletedForAll: false,
        user: { _id: globalThis.userChatId },
        roomId: channelInfo?.channelId,
        roomOwnerId: globalThis.userChatId,
        messageType: mediaType,
        attachment: allPaths,
        message: mediaCaption,
        roomType: "channel",
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        image: mediaType === "image" ? allPaths : [],
        // audio: mediaType === "audio" ? allPaths : [],
        localPaths: [],
      },
    ]);

    setGroupImageModal(false);

    const AWS = require("aws-sdk");
    const bucket = new AWS.S3({
      bucketName: "tokee-chat-staging",
      region: "us-east-2",
      accessKeyId: globalThis.accessKey,
      secretAccessKey: globalThis.awsSecretAccessKey,
      s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/",
    });

    const folderName = "Document/";
    let newAttachmentUrls = [];

    await Promise.all(
      image.map(async (file, index) => {
        const pathParts = file.path?.split("/");
        const fileName = Date.now() + "_" + pathParts[pathParts.length - 1];
        const base64 = await RNFS.readFile(file.path, "base64");
        const arrayBuffer = decode(base64);
        const contentDeposition = `inline;filename="${fileName}"`;

        const params = {
          Bucket: "tokee-chat-staging",
          Key: folderName + fileName,
          Body: arrayBuffer,
          ContentDisposition: contentDeposition,
          ContentType: file.ContentType,
        };

        try {
          const data = await bucket
            .upload(params)
            .on("httpUploadProgress", (progress: any) => {
              const { loaded, total } = progress;
              const percentage = (loaded / total) * 100;
              setUploadProgress((prevProgress) => {
                const updatedProgress = [...prevProgress]; //@ts-ignore
                updatedProgress[index] = percentage;
                return updatedProgress;
              });
              if (percentage === 100) {
                // Handle completion
              }
            })
            .promise();

          const fileNameWithoutExtension = fileName.split(".")[0];
          const localPath = await copyFileToFolder(
            file.path,
            `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/Images`,
            `${fileNameWithoutExtension}.jpg`
          );

          updateLocalPathInChannelMessages(mId, localPath, () => {});
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          newAttachmentUrls.push(data.Location);
        } catch (err) {
          console.error("Upload error: ", err);
        }
      })
    );

    setUploadProgress([]);

    socket.emit("joinChannel", {
      roomId: channelInfo?.channelId,
      userId: globalThis.chatUserId,
    });

    const paramsToSendForLive = {
      roomId: channelInfo?.channelId,
      roomOwnerId: globalThis.userChatId,
      message_type: mediaType,
      attachment: newAttachmentUrls,
      message: mediaCaption,
      roomType: "channel",
      userName: globalThis.displayName,
      phoneNumber: globalThis.phone_number,
      currentUserPhoneNumber: globalThis.phone_number,
      userImage: globalThis.image,
      mId: mId,
    };

    socket.emit("sendmessage", paramsToSendForLive);
    setMediaCaption("");
  };

  const formatFileSize = (size: any) => {
    if (size < 1024) {
      return size + " B";
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + " KB";
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }
  };

  async function OpenPreview(item: any) {
    const validAttachments = [];

    for (const attach of item.localPaths) {
      if (attach.startsWith("http") || attach.startsWith("https")) {
        return null;
      }
      const file = attach;
      let mediaName = attach?.split("/").pop();
      let mediaId = mediaName?.split(".").slice(0, -1).join(".");
      const fileTitle = mediaId;
      const filename = `${fileTitle}.jpg`;

      const encoded = encodeURIComponent(filename);
      // let destinationPath = "";
      let mainDirectory = "";
      if (Platform.OS == "android") {
        mainDirectory = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia`;
      } else {
        mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
      }
      let subDirectory = `${mainDirectory}/Images`;
      const mainDirectoryExists = await RNFS.exists(mainDirectory);
      if (!mainDirectoryExists) {
        await RNFS.mkdir(mainDirectory);
      }

      // Ensure subdirectory exists
      const subDirectoryExists = await RNFS.exists(subDirectory);
      if (!subDirectoryExists) {
        await RNFS.mkdir(subDirectory);
      }

      const destinationPath = `${subDirectory}/${encoded}`;
      const fileExists = await RNFS.exists(destinationPath);
      if (fileExists) {
        //@ts-ignore
        validAttachments.push(destinationPath);
      } else {
        //@ts-ignore
        validAttachments.push(blurImage);
      }
    }

    if (validAttachments.length > 0) {
      setmylocaldata({
        //@ts-ignore
        attachment: validAttachments,
        type: "image",
        data: item,
      });
      setTimeout(() => {
        setmyimages(true);
      }, 500);
    } else {
      // Alert.alert("None of the files exist.");
    }
  }

  /////////////////////////////////////////////////// capture-video-camera//////////////////////////////////////////////////

  const captureVideo = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      try {
        const image = await ImagePicker.openCamera({
          mediaType: "video",
          compressImageQuality: 0.2,
        });

        if (image !== undefined) {
          // Get the original video file size
          const fileStats = await RNFS.stat(image.path);
          const originalFileSizeInMB = fileStats.size / (1024 * 1024);

          // Compress the video
          const compressedFileUrl = await VideoCompress.compress(
            image.path,
            {
              quality: "medium",
            },
            (progress) => {
              setloaderMoedl(true); // Set loading state during compression
            }
          );

          // Get the size of the compressed video
          const response = await fetch(compressedFileUrl);
          const blob = await response.blob();
          const compressedFileSizeInMB = blob.size / (1024 * 1024);

          setloaderMoedl(false); // Stop loading after compression

          // Check if the compressed file size is within limits
          if (compressedFileSizeInMB > 80) {
            alert(
              "The video size is too large after compression. Please try a smaller video."
            );
            return; // Exit if the file size is too large
          }

          // Set the compressed video as the attachment
          const imageArr = [
            {
              ...image,
              path: compressedFileUrl, // Replace the original path with the compressed file URL
              type: "video/mp4", // Ensure the media type is set correctly
            },
          ];

          setallattachment(imageArr);
          setLoading(false);
          setSendItems(false);
          setCameraModal(false);
          setGroupImageModal(true);
          setVideoModal(false);
          Keyboard.dismiss();
        }
      } catch (error) {
        console.error("Error capturing or compressing video:", error);
        setloaderMoedl(false);
        setVideoModal(false);
      }
    }
  };
  /////////////////////////////////////////////////// select-video-gallery//////////////////////////////////////////////////

  const selectVideoByCamera = async (selectimages) => {
    console.log(
      "selectimages====================================",
      selectimages
    );

    setImageModal(false);
    setVideoModal(false);

    if (!selectimages || !Array.isArray(selectimages)) {
      console.error("Invalid media selected.");
      return;
    }

    let totalCompressedVideos = [];

    try {
      for (const selectedImage of selectimages) {
        // console.log("Selected Image >>>>>", selectImage);
        const videoUri = selectedImage?.node?.image?.uri;

        // Validate if URI exists for the video
        if (!videoUri) {
          console.error("Invalid media selected.");
          continue; // Skip invalid video
        }

        // Get original file size
        //    const fileStats = await RNFS.stat(videoUri);
        //    const originalFileSizeInMB = fileStats.size / (1024 * 1024);
        // console.log(
        //   `Original video file size: ${originalFileSizeInMB.toFixed(2)} MB`
        // );

        // Compress the video
        const compressedFileUrl = await VideoCompress.compress(
          videoUri,
          {
            quality: "medium",
          },
          (progress) => {
            console.log({ compression: progress });
            setloaderMoedl(true); // Show loading during compression
          }
        );

        // Get the size of the compressed video
        const response = await fetch(compressedFileUrl);
        //    const blob = await response.blob();
        //    const compressedFileSizeInMB = blob.size / (1024 * 1024);
        // console.log(
        //   `Compressed video file size: ${compressedFileSizeInMB.toFixed(2)} MB`
        // );

        // Check if compressed video is larger than the limit
        // if (compressedFileSizeInMB > 80) {
        //   alert(
        //     "The total size of your selected videos is too large. Please select fewer videos to continue."
        //   );
        //   continue; // Skip this video if it's too large
        // }

        // Prepare the final compressed video object
        const compressedMedia = {
          ...selectedImage, // Preserve the original structure
          path: compressedFileUrl, // Add the compressed URL path
          //   size: compressedFileSizeInMB, // Store the compressed file size
          type: "video/mp4", // Ensure type is set
        };

        // Add compressed video to the total array
        totalCompressedVideos.push(compressedMedia);
      }

      setloaderMoedl(false); // Hide the loading modal after processing

      if (totalCompressedVideos.length > 0) {
        // Handle the compressed videos as needed (e.g., store them in state)
        setallattachment(totalCompressedVideos); // Store all compressed videos in the array

        // Close modals and proceed to the next step
        setVideoModal(false);
        setSendItems(false);
        setCameraModal(false);
        setSelectedVideos([]);
        Keyboard.dismiss();
        setTimeout(() => {
          setGroupImageModal(true);
        }, 1500);
      } else {
        console.error("No valid videos to process.");
      }
    } catch (error) {
      console.error("Error processing video(s):", error);
      setloaderMoedl(false);
      setSelectedVideos([]);
    }
  };

  /////////////////////////////////////////////////// select-image-gallery//////////////////////////////////////////////////

  const selectImage = async () => {
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        multiple: true,
        cropping: true,
        maxFiles: 5,
        // cropperCircleOverlay: true,
        compressImageQuality: 0.2,
      }).then((image: any) => {
        if (image !== undefined) {
          if (image.length > 5) {
            // Alert.alert(
            //   "Alert",
            //   "You cannot choose more than 5 photos at a time."
            // );

            globalThis.errorMessage =
              "You cannot choose more than 5 photos at a time.";
            setErrorAlertModel(true);
          } else {
            setSendItems(false);
            setCameraModal(false);
            Keyboard.dismiss();
            setallattachment(image);

            setGroupImageModal(true);
          }
        }
      });
    }
  };

  const handleDocumentPress = async (path) => {
    if (Platform.OS == "android") {
      setloaderMoedl(true);
    }
    // Show loader
    let mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    let subDirectory = `${mainDirectory}/Documents`;

    try {
      const mainDirectoryExists = await RNFS.exists(mainDirectory);
      if (!mainDirectoryExists) {
        await RNFS.mkdir(mainDirectory);
      }

      const subDirectoryExists = await RNFS.exists(subDirectory);
      if (!subDirectoryExists) {
        await RNFS.mkdir(subDirectory);
      }

      let mediaName = path[0].split("/").pop();
      let mediaId = mediaName.split(".").slice(0, -1).join(".");
      let filename = `${mediaName}`;
      let encoded = encodeURIComponent(filename);
      let destinationPath = `${subDirectory}/${encoded}`;
      // Ensure the loader runs for at least 1 second
      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      // Rename file if it already exists
      let fileExists = await RNFS.exists(destinationPath);
      let counter = 1;
      while (fileExists) {
        filename = `${mediaId}(${counter}).pdf`;
        encoded = encodeURIComponent(filename);
        destinationPath = `${subDirectory}/${encoded}`;
        fileExists = await RNFS.exists(destinationPath);
        counter++;
      }

      // Copy file to the destination directory
      await RNFS.copyFile(path[0], destinationPath);

      // Ensure the file exists before trying to open it
      const fileExistsAfterCopy = await RNFS.exists(destinationPath);
      if (!fileExistsAfterCopy) {
        throw new Error("File not found after copy");
      }

      // Wait for both delay and file opening operation to complete
      await Promise.all([delay]);
      // console.log("destinationPath:", destinationPath);
      // Open the file after the delay
      FileViewer.open(destinationPath)

        .then(() => {
          console.log("File opened successfully");
        })
        .catch((error) => {
          setloaderMoedl(false);
          console.error("Error opening file with FileViewer:", error);
        });
    } catch (error) {
      setloaderMoedl(false);
      console.error("Error processing file:", error);
    } finally {
      if (Platform.OS == "android") {
        setloaderMoedl(false);
      }
      // setloaderMoedl(false); // Hide loader after operations complete
    }
  };

  const Reactionapifunction = (messageId, reaction, react) => {
    let url = chatBaseUrl + reactionapi;
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
        },
        data: {
          messageId: messageId,
          reaction: reaction,
          react: react,
          userId: globalThis.userChatId,
          channelId: channelInfo?.channelId,
        },
      })
        .then(async (response) => {
          if (response.data.status == true) {
            console.log("reaction response", response.data);
          }
        })
        .catch((error) => {
          console.log("wwwwwwwwwwwwwwwwww", error);
          // setLoading(false);
        });
    } catch (error) {
      console.log("eeeeeeeeeeeeeeeeee", error);
      // setLoading(false);
    }
  };

  let premiumAlertHeading = "You have exceed the Limit";
  let premiumAlertSubHeading =
    "You can Join Maximum of 50 Channels only. To Join more than 50 upgrade to premium.";
  let premiumAlertSecondButtonText = "Go To Premium";

  const onsendreaction = (id, newIcon) => {
    // Initialize iconssend to true
    let iconssend = true;

    // Map through messages to update reactions
    const updatedReacticons = messages.map((item) => {
      // Check if the item ID matches
      if (item.messageId === id) {
        // Ensure reactions is an array
        const reactions = item.reactions || [];

        // Check if the emoji is already present in reactions
        const existingReactionIndex = reactions.findIndex(
          (data) => data.emoji === newIcon
        );

        if (existingReactionIndex !== -1) {
          const existingReaction = reactions[existingReactionIndex];
          const userInReaction = existingReaction.users?.some(
            (user) => user.userId === globalThis.userChatId
          );

          if (userInReaction) {
            // User has already reacted with this emoji
            if (existingReaction.users.length === 1) {
              // Remove the reaction if it's only sent by the current user
              const updatedReactions = reactions.filter(
                (_, index) => index !== existingReactionIndex
              );
              const updatedItem = {
                ...item,
                reactions: updatedReactions,
                isreact: false,
              };
              updatereactions(id, updatedReactions); // Update reactions
              iconssend = false; // No need to update count
              return updatedItem;
            } else {
              // User has reacted but other users have also reacted
              const updatedReactions = reactions.map((reaction, index) =>
                index === existingReactionIndex
                  ? {
                      ...reaction,
                      count: (reaction.count || 0) - 1,
                      users: reaction.users.filter(
                        (user) => user.userId !== globalThis.userChatId
                      ),
                    }
                  : reaction
              );
              const updatedItem = {
                ...item,
                reactions: updatedReactions,
                isreact: false,
              };
              updatereactions(id, updatedReactions); // Update reactions
              iconssend = false; // No need to update count
              return updatedItem;
            }
          } else {
            // User has not reacted with this emoji
            const updatedReactions = reactions.map((reaction, index) =>
              index === existingReactionIndex
                ? {
                    ...reaction,
                    count: (reaction.count || 0) + 1,
                    users: [
                      ...(reaction.users || []),
                      { userId: globalThis.userChatId },
                    ],
                  }
                : reaction
            );
            const updatedItem = {
              ...item,
              reactions: updatedReactions,
              isreact: true,
            };
            updatereactions(id, updatedReactions); // Update reactions
            return updatedItem;
          }
        } else {
          // Emoji is not present, so add a new reaction object
          const newReaction = {
            emoji: newIcon,
            count: 1,
            users: [{ userId: globalThis.userChatId }],
          };
          const updatedReactions = [...reactions, newReaction];
          const updatedItem = {
            ...item,
            reactions: updatedReactions,
            isreact: true,
          };
          updatereactions(id, updatedReactions); // Update reactions
          return updatedItem;
        }
      }

      // Return the item unchanged if the ID doesn't match
      return item;
    });

    // Call Reactionapifunction with the updated iconssend state
    Reactionapifunction(id, newIcon, iconssend);

    // Update the messages state with the updated reactions

    setMessages(updatedReacticons);
    setreactmsgon(false);
  };

  async function OnChatModalTextClick(value: any) {
    if (value == "Delete for all") {
      const params = {
        //@ts-ignore
        userId: globalThis.userChatId,
        messageIds: selectedMessageId,
        channelId: channelInfo?.channelId,
      };
      //@ts-ignore
      socket.emit("deleteChannelMessage", params);
      setreactmsgon(false);
      setismultidelete(false);
      setSelectedMessageId([]);
    }
  }

  const onSelectMessage = (messageId: any) => {
    //@ts-ignore
    const isSelected: any = selectedMessageId.includes(messageId);

    if (isSelected) {
      setSelectedMessageId((prevIds) =>
        prevIds.filter((id) => id !== messageId)
      ); // Deselect if already selected
    } else {
      //@ts-ignore
      setSelectedMessageId((prevIds) => [...prevIds, messageId]); // Select the message
    }
  };

  useEffect(() => {
    const deletemessssggggggg = async (deleteMessage: any) => {
      // let data = deleteMessage.result;

      await deleteMessagesForAll(deleteMessage?.messageIds, () => {
        if (deleteMessage.channelId == channelInfo?.channelId) {
          // Filter messages
          const selectedMessageIdsSet = new Set(deleteMessage?.messageIds);
          const updatedMessages = messages.filter(
            (message) => !selectedMessageIdsSet?.has(message?._id)
          );

          // Update the state
          setMessages(updatedMessages);
        }
      });
    };
    //@ts-ignore
    socket.on("deleteChannelMessage", deletemessssggggggg);
    return () => {
      //@ts-ignore
      socket.off("deleteChannelMessage", deletemessssggggggg);
    };
  });

  useEffect(() => {
    // eslint-disable-next-line
    const handleReactionadd = (data: any) => {
      if (data.user != globalThis.userChatId) {
        updatereactionsforother(
          data.messageId,
          data.isAdd,
          data.reaction,
          data.user,
          () => {
            console.log("yes done");
          }
        );
      }

      if (
        channelInfo?.channelId == data.channelId &&
        data.user != globalThis.userChatId
      ) {
        let iconssend = true;
        const updatedReacticons = messages.map((item) => {
          // Check if the item ID matches
          if (item.messageId === data.messageId) {
            // Ensure reactions is an array
            const reactions = item.reactions || [];

            // Check if the emoji is already present in reactions
            const existingReactionIndex = reactions.findIndex(
              (reaction) => reaction.emoji === data.reaction
            );

            // console.log("userInReaction", existingReactionIndex);
            if (existingReactionIndex !== -1) {
              const existingReaction = reactions[existingReactionIndex];
              const userInReaction = existingReaction.users?.some(
                (user) => user.userId === data.user
              );

              if (userInReaction) {
                // User has already reacted with this emoji
                if (existingReaction.users.length === 1) {
                  // Remove the reaction if it's only sent by the current user
                  const updatedReactions = reactions.filter(
                    (_, index) => index !== existingReactionIndex
                  );
                  const updatedItem = {
                    ...item,
                    reactions: updatedReactions,
                    isreact: data.isAdd,
                  };
                  // updatereactionsonnormal(data.messageId, updatedReactions); // Update reactions
                  updatereactionsforother(
                    data.messageId,
                    data.isAdd,
                    data.reaction,
                    data.user,
                    () => {}
                  );
                  iconssend = false; // No need to update count
                  return updatedItem;
                } else {
                  // User has reacted but other users have also reacted
                  const updatedReactions = reactions.map((reaction, index) =>
                    index === existingReactionIndex
                      ? {
                          ...reaction,
                          count: (reaction.count || 0) - 1,
                          users: reaction.users.filter(
                            (user) => user.userId !== data.user
                          ),
                        }
                      : reaction
                  );
                  const updatedItem = {
                    ...item,
                    reactions: updatedReactions,
                    isreact: data.isAdd,
                  };
                  // updatereactionsonnormal(data.messageId, updatedReactions); // Update reactions
                  updatereactionsforother(
                    data.messageId,
                    data.isAdd,
                    data.reaction,
                    data.user,
                    () => {}
                  );
                  iconssend = false; // No need to update count
                  return updatedItem;
                }
              } else {
                // User has not reacted with this emoji
                const updatedReactions = reactions.map((reaction, index) =>
                  index === existingReactionIndex
                    ? {
                        ...reaction,
                        count: (reaction.count || 0) + 1,
                        users: [
                          ...(reaction.users || []),
                          { userId: data.user },
                        ],
                      }
                    : reaction
                );
                const updatedItem = {
                  ...item,
                  reactions: updatedReactions,
                  isreact: data.isAdd,
                };
                // updatereactionsonnormal(data.messageId, updatedReactions); // Update reactions
                updatereactionsforother(
                  data.messageId,
                  data.isAdd,
                  data.reaction,
                  data.user,
                  () => {}
                );
                return updatedItem;
              }
            } else {
              // Emoji is not present, so add a new reaction object
              const newReaction = {
                emoji: data.reaction,
                count: 1,
                users: [{ userId: data.user }],
              };
              const updatedReactions = [...reactions, newReaction];
              const updatedItem = {
                ...item,
                reactions: updatedReactions,
                isreact: data.isAdd,
              };
              // updatereactionsonnormal(data.messageId, updatedReactions); // Update reactions
              updatereactionsforother(
                data.messageId,
                data.isAdd,
                data.reaction,
                data.user,
                () => {}
              );
              return updatedItem;
            }
          }

          // Return the item unchanged if the ID doesn't match
          return item;
        });

        setMessages(updatedReacticons);
      }
    };

    socket.on("message-reaction", handleReactionadd);

    return () => {
      socket.off("message-reaction", handleReactionadd);
    };
  });

  const renderFooter = () => {
    return (
      <View
        style={{
          padding: 10,
          alignItems: "center",
          justifyContent: "center",
          height: 30,
        }}
      >
        <Text></Text>
      </View>
    );
  };

  const CustomDayComponent = (props) => {
    return (
      <Day
        {...props}
        textStyle={{
          textAlign: "center",
          paddingVertical: 3,
          paddingHorizontal: 15,
          color: colors.white,
          fontFamily: font.medium(),
        }}
        wrapperStyle={{
          backgroundColor: "rgba(20, 20, 20, 0.3)",
          borderRadius: 100,
        }}
      />
    );
  };

  const scaleAnimation = useRef({});

  const handlePressIn = (messageid) => {
    Animated.spring(scaleAnimation.current[messageid], {
      toValue: 0.95, // Scale down
      friction: 3, // Adjust friction for bounce effect
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (messageid) => {
    Animated.spring(scaleAnimation.current[messageid], {
      toValue: 1, // Scale back to original
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // console.log("route.params.channelIdroute.params.channelIdroute.params.channelId",route.params.channelId);

  const AllChaneelDataApi = async () => {
    const urlStr = chatBaseUrl + getChannelData + route?.params?.channelId;
    // console.log("urlStrurlStrurlStrurlStr",urlStr);
    try {
      const response = await axios.get(urlStr, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.status) {
        // console.log("API response:", response.data);

        const { channel, chats } = response.data.data;
        dispatch(setChannelObj(channel));
        setLinkChannelData(channel);
        setLinkChannelChat(chats);

        if (chats?.length > 0) {
          const formattedMessages = chats
            .map((message) => {
              if (
                ["text", "image", "video", "audio", "document"].includes(
                  message.message_type
                )
              ) {
                return {
                  _id: message._id,
                  messageId: message._id,
                  text: (() => {
                    if (
                      message.message_type == "image" ||
                      message.message_type == "video" ||
                      message.message_type == "audio" ||
                      message.message_type == "document"
                    ) {
                      return "";
                    } else {
                      try {
                        return decryptMessage(
                          route?.params?.channelId,
                          message.message
                        );
                        //  CryptoJS.AES.decrypt(
                        //   message?.message,
                        //   EncryptionKey
                        // ).toString(CryptoJS.enc.Utf8);
                      } catch (decryptError) {
                        console.log(
                          "Decryption error: 2",
                          decryptError.message
                        );
                        return "Decryption failed"; // or handle accordingly
                      }
                    }
                  })(),
                  createdAt: new Date(message.createdAt),
                  attachment: message.attachment,
                  reactions: message?.reactions?.reactions || [],
                  localPaths: [],
                  messageType: message.message_type,
                  message: message.message,
                  isDeletedForAll: message?.isDeletedForAll,
                  audio:
                    message.message_type === "audio" ? message.attachment : [],
                  video:
                    message.message_type === "video" ? message.attachment : [],
                  image:
                    message.message_type === "image" ? message.attachment : [],
                  user: {
                    _id: message.fromUser,
                    name: message.userName,
                  },
                  system: false,
                };
              } else if (message.message_type === "notify") {
                return {
                  _id: message._id,
                  messageId: message._id,
                  text: (() => {
                    if (
                      message.message_type == "image" ||
                      message.message_type == "video" ||
                      message.message_type == "audio" ||
                      message.message_type == "document"
                    ) {
                      return message.message;
                    } else {
                      try {
                        return encryptMessage(
                          route?.params?.channelId,
                          message.message
                        );
                        // CryptoJS.AES.decrypt(
                        //   message?.message,
                        //   EncryptionKey
                        // ).toString(CryptoJS.enc.Utf8);
                      } catch (decryptError) {
                        console.log(
                          "Decryption error: 2",
                          decryptError.message
                        );
                        return "Decryption failed"; // or handle accordingly
                      }
                    }
                  })(),
                  createdAt: new Date(message.createdAt),
                  attachment: message.attachment,
                  reactions: message?.reactions?.reactions || [],
                  localPaths: [],
                  messageType: message.message_type,
                  isDeletedForAll: message?.isDeletedForAll,
                  audio: [],
                  video: [],
                  image: [],
                  user: {
                    _id: "",
                    name: message.userName,
                  },
                  system: true,
                };
              }
              return null;
            })
            .filter((message) => message && !message.isDeletedForAll)
            .sort((a, b) => b.createdAt - a.createdAt);

          setMessages(formattedMessages);
        }
      } else {
        console.log("API error:", response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.log("Server Error:", error.response.data);
        alert(
          `Server Error: ${
            error.response.data.message || "Please try again later."
          }`
        );
      } else if (error.request) {
        // Request was made but no response received
        console.log("Network Error:", error.request);
        alert(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        // Something happened in setting up the request
        console.log("Error:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  console.log(
    "props?.currentMessage?.reactions",
    props?.currentMessage?.reactions
  );

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <SetProfileModal
        //@ts-ignore
        {...props}
        visible={cameraModal}
        onRequestClose={() => setCameraModal(false)}
        Camera={() => captureImage()}
        select={() => selectImage()}
        cancel={() => setCameraModal(false)}
      />

      <ReactionCount
        visible={ReactionCountmodel}
        onRequestClose={() => setReactionCountmodel(false)}
        cancel={() => setReactionCountmodel(false)}
        sendContactData={reacttiondata}
      />

      <CustomVideoModal
        {...props}
        visible={videoModal}
        onRequestClose={() => setVideoModal(false)}
        Camera={() => captureVideo()}
        select={() => {
          setVideoModal(false), setImageModal(true);
        }}
        cancel={() => setVideoModal(false)}
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

      <ConfirmAlertModel
        visible={confirmAlertModel}
        onRequestClose={() => setConfirmAlertModel(false)}
        confirmText={globalThis.confirmAlertText}
        cancel={() => setConfirmAlertModel(false)}
        confirmButton={() => {
          setConfirmAlertModel(false), OnChatModalTextClick("Delete for all");
        }}
      />

      <PremiumAlert
        visible={showPremiumAlert}
        onRequestClose={() => setShowPremiumAlert(false)}
        cancel={() => setShowPremiumAlert(false)}
        Heading={premiumAlertHeading}
        SubHeading={premiumAlertSubHeading}
        FirstButton={""}
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
      {/* lock chat model end */}
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
          {loading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
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
                      </View>
                    </GestureHandlerRootView>
                  )}
                />
              </>
            )
          }
        </View>
      </Modal>

      <Modal visible={groupImageModal}>
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <View
            style={{
              height: Dimensions.get("window").height - 100,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                left: 3,
                zIndex: 10,
                top: DeviceInfo.hasNotch() ? 60 : 60,
              }}
              onPress={() => setGroupImageModal(false)}
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

            <FlatList
              data={allattachment}
              horizontal
              contentContainerStyle={{ alignItems: "center" }}
              renderItem={({ item }) => (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    // backgroundColor:"red"
                  }}
                >
                  {attachmentformate == "image" && (
                    <Image
                      onLoad={() => Keyboard.dismiss()}
                      //@ts-ignore
                      source={{ uri: item.path }}
                      style={{
                        height: 300,
                        width: Dimensions.get("window").width - 20,
                      }}
                      resizeMode="contain"
                    />
                  )}
                  {attachmentformate == "video" && (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Video
                        //@ts-ignore
                        style={{
                          width: Dimensions.get("window").width,
                          height: 300,
                          padding: 20,
                          // Other video styles...
                        }}
                        //@ts-ignore
                        source={{ uri: item?.path }}
                        resizeMode="contain"
                        controls={true}
                        onLoad={() => Keyboard.dismiss()} // Ensure the video starts paused
                      />
                    </View>
                  )}

                  {attachmentformate == "audio" && (
                    <View style={{ height: 64, width: 320 }}>
                      <AudioMessage currentMessage={item.uri} />
                    </View>
                  )}

                  {attachmentformate == "document" && (
                    <View>
                      <Image
                        onLoad={() => Keyboard.dismiss()}
                        source={require("../../../Assets/Icons/doct.png")}
                        style={{
                          height: 105,
                          width: 81,
                          alignSelf: "center",
                        }}
                        resizeMode="contain"
                      />
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 18,
                          opacity: 0.8,
                          fontFamily: font.semibold(),
                          marginTop: 10,
                          textAlign: "center",
                        }}
                      >
                        {t("no_preview_available")}
                      </Text>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 18,
                          opacity: 0.8,
                          marginTop: 10,
                          fontFamily: font.semibold(),
                          textAlign: "center",
                        }}
                      >
                        {
                          //@ts-ignore
                          formatFileSize(item?.size)
                        }{" "}
                        ~{" "}
                        {
                          //@ts-ignore
                          item?.type?.split("/").pop()
                        }
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>
          <View
            style={{
              height: 50,
              // justifyContent: "center",
              alignItems: "center",
              // backgroundColor:"red",
              borderWidth: 1,
              borderColor: iconTheme().iconColorNew,
              borderRadius: 10,
              flexDirection: "row",
              paddingLeft: 5,
              position: "absolute",
              bottom: DeviceInfo.hasNotch()
                ? keyboardHeight == 0
                  ? 50
                  : keyboardHeight + 10
                : 10,
              backgroundColor: "#000000",
              width: "97%",
              alignSelf: "center",
            }}
          >
            <View style={{ width: "90%" }}>
              <TextInput
                placeholder="Enter Caption"
                defaultValue={mediaCaption}
                placeholderTextColor="#fff"
                multiline={true}
                maxLength={50}
                cursorColor="#fff"
                onChangeText={(text) => setMediaCaption(text)}
                style={{ color: "#fff", fontSize: 18 }}
              />
            </View>

            <TouchableOpacity
              style={{
                marginLeft: "auto",
                marginRight: 5,
                width: "10%",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "transparent",
                borderRadius: 20,
                backgroundColor: iconTheme().iconColorNew,
                height: "80%",
                alignSelf: "center",
              }}
              onPress={() => {
                if (
                  attachmentformate == "document" ||
                  attachmentformate == "audio" ||
                  attachmentformate == "video"
                ) {
                  BucketUploadFile(allattachment, attachmentformate);
                } else {
                  BucketUpload(allattachment, attachmentformate);
                }
              }}
            >
              <Image
                source={require("../../../Assets/Icons/Send_message.png")}
                style={{
                  height: 22,
                  width: 22,
                  tintColor: "#fff",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={sendItems}
        transparent
        animationType="fade"
        style={{ justifyContent: "center", alignItems: "center" }}
        onRequestClose={() => setSendItems(false)}
      >
        <TouchableOpacity onPress={() => setSendItems(false)}>
          <View
            style={{ height: "100%", backgroundColor: "rgba(0,0,0,0.4)" }}
          ></View>
        </TouchableOpacity>

        <View style={styles.plusModalContainer}>
          <View style={styles.plusModalRowContainer}>
            {/* first-part */}

            <View style={styles.plusModalImageTextConatiner}>
              <TouchableOpacity
                onPress={() => ToclickOnImageIcon()}
                style={styles.plusModalButton}
              >
                <Image
                  source={require("../../../Assets/Icons/cam_icon.png")}
                  style={styles.plusModalIcon}
                  resizeMode="contain"
                />
                <Text style={styles.plusModalText}>
                  {t("camera") + " & " + t("photo")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* third-part */}
            <View style={styles.plusModalImageTextConatiner}>
              <TouchableOpacity
                onPress={() => ToclickOnVideoIcon()}
                style={styles.plusModalButton}
              >
                <Image
                  source={require("../../../Assets/Icons/gallary_icon.png")}
                  style={styles.plusModalIcon}
                  resizeMode="contain"
                />
                <Text style={styles.plusModalText}>{t("video")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.plusModalImageTextConatiner}>
              <TouchableOpacity
                onPress={() => pickDocument()}
                style={styles.plusModalButton}
              >
                <Image
                  source={require("../../../Assets/Icons/doc_icon.png")}
                  style={styles.plusModalIcon}
                  resizeMode="contain"
                />
                <Text style={styles.plusModalText}>{t("document")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.plusModalImageTextConatiner}>
              <TouchableOpacity
                onPress={() => {
                  pickAudio();
                }}
                style={styles.plusModalButton}
              >
                <Image
                  source={require("../../../Assets/Icons/audio_iocn.png")}
                  style={styles.plusModalIcon}
                  resizeMode="contain"
                />
                <Text style={styles.plusModalText}>{t("audio")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setSendItems(!sendItems)}
            style={[
              styles.plusModalRowContainer,
              {
                backgroundColor: iconTheme().iconColorNew,
                marginTop: 15,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                height: 50,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 20,
                color: COLORS.white,
                fontFamily: font.bold(),
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {t("cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        transparent={false}
        visible={imageModal}
        onRequestClose={() => {
          setImageModal(false);
        }}
      >
        <View style={{ paddingBottom: 80 }}>
          <View
            style={{
              height: Platform.OS === "ios" ? 60 : 20,
              backgroundColor: themeModule().theme_background,
            }}
          ></View>
          <View
            style={{
              height: 60,
              justifyContent: "center",
              backgroundColor: themeModule().theme_background,
              // marginTop: Platform.OS === "ios" ? 60 : 20,
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                left: 20,
                zIndex: 1,
                backgroundColor: textTheme().textColor,
                borderRadius: 5,
              }}
              onPress={() => {
                setSelectedVideos([]);
                setImageModal(false);
              }}
            >
              <Image
                source={require("../../../Assets/Icons/Back.png")}
                style={{
                  height: 25,
                  width: 25,
                  //@ts-ignore
                  tintColor: COLORS.white,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {selectedVideos?.length > 0 && (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 20,
                  zIndex: 1,
                  backgroundColor: textTheme().textColor,
                  borderRadius: 5,
                }}
                onPress={() => selectVideoByCamera(selectedVideos)}
              >
                <Image
                  source={require("../../../Assets/Icons/correct_sign.png")}
                  style={{
                    height: 25,
                    width: 25,
                    //@ts-ignore
                    tintColor: COLORS.white,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {userGalleryVideos.length === 0 ? (
              <Text
                style={{ fontSize: 18, color: "gray", textAlign: "center" }}
              >
                No videos available.
              </Text>
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={userGalleryVideos}
                numColumns={3}
                renderItem={({ item, index }) => ImageGalleryView(item, index)}
                keyExtractor={(item) => item.node.image.uri} // Add a key extractor if your data has unique identifiers
                ListFooterComponent={<View style={{ height: 80 }} />}
              />
            )}
          </View>
        </View>
      </Modal>

      {DeviceInfo.hasNotch() == true ? (
        <CustomStatusBar
          barStyle={isDarkMode ? "dark-content" : "dark-content"}
          backgroundColor={chatTop().back_ground}
        />
      ) : (
        <CustomStatusBar
          barStyle={isDarkMode ? "dark-content" : "dark-content"}
          backgroundColor={chatTop().back_ground}
        />
      )}

      <View style={styles.chatTopContainer}>
        <View style={styles.groupContainer}>
          <View style={styles.profile1Container}>
            {ismultidelete ? (
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flex: 1,
                  paddingHorizontal: 10,
                }}
              >
                <TouchableOpacity
                  style={{ width: "33.33%" }}
                  onPress={() => {
                    setismultidelete(!ismultidelete);
                    if (selectedMessageId && selectedMessageId.length > 0) {
                      setSelectedMessageId([]);
                    }
                  }}
                >
                  <Image
                    source={require("../../../Assets/Icons/Cross.png")}
                    style={{
                      height: 22,
                      width: 22,
                      tintColor: COLORS.black,
                    }}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    width: "33.33%",
                    fontSize: 17,
                    fontFamily: font.bold(),
                    color: iconTheme().iconColorNew,
                  }}
                >
                  Delete
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    if (selectedMessageId && selectedMessageId.length > 0) {
                      setSelectedMessageId([]);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.black,
                      fontSize: 16,
                    }}
                  >
                    Reselect
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.Container1}
                  onPress={() => {
                    navigation.navigate("BottomBar", {
                      screen: "chatScreen",
                    });
                    // navigation.pop();
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
                  onPress={
                    () =>
                      navigation.navigate("ChannelProfile", {
                        channelData: channelInfo,
                        isChannelExist: channelExists == false ? false : true,
                      })
                    // route?.params?.deepLinking == true && channelExists == false
                    //   ? null
                    //   : navigation.navigate("ChannelProfile", {
                    //       channelData: channelInfo,
                    //     })
                  }
                >
                  <Image
                    source={{
                      uri:
                        route?.params?.deepLinking == true &&
                        channelExists == false
                          ? // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            LinkChannelData?.image
                          : channelInfo.channelImage,
                    }}
                    style={[styles.circleImageLayout]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                {console.log("channelExists", channelExists)}
                <TouchableOpacity
                  style={styles.nameInviteContainer}
                  onPress={
                    () =>
                      navigation.navigate("ChannelProfile", {
                        channelData: channelInfo,
                        isChannelExist: channelExists == false ? false : true,
                      })
                    // route?.params?.deepLinking == true && channelExists == false
                    //   ? null
                    //   : navigation.navigate("ChannelProfile", {
                    //       channelData: channelInfo,
                    //     })
                  }
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.name1conText} numberOfLines={1}>
                      {route?.params?.deepLinking == true &&
                      channelExists == false
                        ? // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          LinkChannelData?.name
                        : channelInfo?.channelName}
                    </Text>

                    {route?.params?.deepLinking == true &&
                    channelExists == false ? (
                      LinkChannelData?.isExclusive ? (
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
                      ) : null
                    ) : (
                      <>
                        {channelInfo?.isExclusive ? (
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
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.chatContainer}>
        <ImageBackground
          style={{
            flex: 1,
            justifyContent: "center",
            overflow: "hidden",
            marginTop: 0,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            paddingBottom: 10,
          }}
          source={
            chatImage().Image
              ? chatImage().Image
              : require("../../../Assets/Icons/trans.png")
          }
        >
          <GiftedChat
            messageContainerRef={chatListRef}
            messages={messages}
            renderDay={CustomDayComponent}
            renderTime={renderTime} //@ts-ignore
            onSend={(newMessages) => onSend(newMessages)}
            infiniteScroll
            isLoadingEarlier={isloadearly}
            loadEarlier={isloadearly}
            shouldUpdateMessage={(props) => {
              //@ts-ignore
              const { currentMessage, previousMessages } = props;

              // Check if there are previous messages
              if (previousMessages && previousMessages.length > 0) {
                const previousMessage =
                  previousMessages[previousMessages.length - 1];
                // Compare the ID of the current message with the ID of the previous message
                if (currentMessage?._id === previousMessage._id) {
                  // If the IDs match, don't update the message
                  return false;
                }
              }
              return true;
            }}
            user={{
              _id: globalThis.userChatId,
              name: globalThis.name, //@ts-ignore
              avatar: globalThis.userImage, // Ensure this matches the sending user's ID
            }}
            renderFooter={() => renderFooter()}
            alignTop={true}
            inverted={true}
            isKeyboardInternallyHandled={true}
            listViewProps={{
              onScrollToIndexFailed: (info) => {
                const wait = new Promise((resolve) => setTimeout(resolve, 500));
                wait.then(() => {
                  chatListRef?.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                });
              },
              scrollEventThrottle: 400,
              onScroll: ({ nativeEvent }: any) => {
                Keyboard.dismiss();
                fetchChannelChat();
                //  setOffset(offset + 1);
              },
            }}
            renderSystemMessage={renderSystemMessage}
            onPress={(context, message: any) => {
              const now = Date.now();
              const DOUBLE_PRESS_DELAY = 300; // milliseconds
              // Trigger haptic feedback
              ReactNativeHapticFeedback.trigger("impactLight", {
                enableVibrateFallback: true,
                ignoreAndroidSystemSettings: false,
              });
              if (!message.isDeletedForAll) {
                if (
                  lastTapRef.current &&
                  now - lastTapRef.current < DOUBLE_PRESS_DELAY
                ) {
                  setSelectedMessageId([message.messageId]);
                  setreactmsgon(true);
                  setreactmsgondata(message);
                  ReactNativeHapticFeedback.trigger("effectDoubleClick", {
                    enableVibrateFallback: true,
                    ignoreAndroidSystemSettings: false,
                  });
                }
                lastTapRef.current = now;
              }
            }}
            onLongPress={(context, message: any) => {
              ReactNativeHapticFeedback.trigger("impactHeavy", {
                enableVibrateFallback: true,
                ignoreAndroidSystemSettings: false,
              });
              setreactmsgon(true);
              setSelectedMessageId([message.messageId]);
              setreactmsgondata(message);
            }}
            renderMessageText={(props: object) => {
              const { currentMessage } = props;
              return (
                <Animated.View>
                  <TouchableWithoutFeedback
                    onPressIn={() => {
                      handlePressIn(currentMessage?.messageId);
                    }}
                    onPressOut={() => {
                      handlePressOut(currentMessage?.messageId);
                    }}
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      // alignItems: "center",
                      paddingHorizontal: 13,
                      paddingVertical: 7,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: globalThis.chatFontsize,
                        fontFamily: font.semibold(),
                        color:
                          currentMessage?.user?._id == globalThis.chatUserId
                            ? chatOther().chatTextColor
                            : COLORS.black,
                        maxWidth: WINDOW_WIDTH - 120,
                      }}
                    >
                      {currentMessage?.text}
                    </Text>
                  </TouchableWithoutFeedback>
                </Animated.View>
              );
            }}
            renderBubble={(props) => {
              if (!props?.currentMessage?.isDeletedForAll) {
                if (!scaleAnimation.current[props?.currentMessage.messageId]) {
                  scaleAnimation.current[props?.currentMessage.messageId] =
                    new Animated.Value(1);
                }

                const isSelected = selectedMessageId.includes(
                  //@ts-ignore
                  props.currentMessage.messageId
                );
                return (
                  <Animated.View
                    style={{
                      width: "100%",
                      alignSelf: "center",
                      transform: [
                        {
                          scale:
                            scaleAnimation.current[
                              props?.currentMessage.messageId
                            ],
                        },
                      ],
                    }}
                  >
                    {ismultidelete && (
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          left:
                            ismultidelete &&
                            props.currentMessage.user._id !==
                              globalThis.userChatId
                              ? 0
                              : 10,
                          zIndex: 50,
                          top: "35%",
                        }}
                        onPress={() => {
                          onSelectMessage(props.currentMessage.messageId);
                        }}
                      >
                        <View style={{}}>
                          <View
                            style={{
                              height: 22,
                              width: 22,
                              borderColor: !isSelected
                                ? "darkgrey"
                                : iconTheme().iconColorNew,
                              borderRadius: 50,
                              borderWidth: 2,
                              backgroundColor: !isSelected
                                ? "white"
                                : iconTheme().iconColorNew,
                            }}
                          >
                            {isSelected && (
                              <Image
                                style={{ width: 18, height: 18 }}
                                source={require("../../../Assets/Icons/bx_check.png")}
                              />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                    <Bubble
                      {...props}
                      isCustomViewBottom={false}
                      wrapperStyle={{
                        right: {
                          backgroundColor: chat().back_ground_color,
                          marginBottom:
                            props?.currentMessage?.reactions &&
                            props?.currentMessage?.reactions?.length
                              ? 15
                              : 0,
                          // marginLeft: 10,
                          // alignSelf: "stretch",
                          width: ismultidelete
                            ? WINDOW_WIDTH - 50
                            : WINDOW_WIDTH - 15,

                          // Change this to the color you want for your sent messages
                        },
                        left: {
                          backgroundColor: chatOther().back_ground_color,
                          // marginRight: 10,
                          marginBottom:
                            props?.currentMessage?.reactions &&
                            props?.currentMessage?.reactions?.length
                              ? 15
                              : 0,
                          width: ismultidelete
                            ? WINDOW_WIDTH - 50
                            : WINDOW_WIDTH - 15,
                          // alignSelf: "stretch", // Make the bubble take full width
                          // marginLeft: 0, // Ensure no margin on the left side
                          borderRadius: 15, // Adjust border radius if necessary
                          // Change this to the color you want for received messages
                        },
                      }}
                      renderCustomView={() => {
                        if (
                          //@ts-ignore
                          props?.currentMessage?.messageType === "document" && //@ts-ignore
                          !props.currentMessage.isDeletedForAll
                        ) {
                          return (
                            <View style={{}}>
                              {
                                //@ts-ignore
                                props.currentMessage.attachment.map(
                                  (videoUri: any, index: any) => (
                                    <TouchableOpacity
                                      key={index}
                                      onPressIn={() => {
                                        handlePressIn(
                                          props?.currentMessage?.messageId
                                        );
                                      }}
                                      onPressOut={() => {
                                        handlePressOut(
                                          props?.currentMessage?.messageId
                                        );
                                      }}
                                      onLongPress={() => {
                                        setreactmsgon(true);
                                        setreactmsgondata(props.currentMessage);
                                        setSelectedMessageId([
                                          props?.currentMessage?.messageId,
                                        ]);
                                        ReactNativeHapticFeedback.trigger(
                                          "impactHeavy",
                                          {
                                            enableVibrateFallback: true,
                                            ignoreAndroidSystemSettings: false,
                                          }
                                        );
                                      }}
                                      onPress={() => {
                                        ReactNativeHapticFeedback.trigger(
                                          "impactHeavy",
                                          {
                                            enableVibrateFallback: true,
                                            ignoreAndroidSystemSettings: false,
                                          }
                                        ),
                                          //@ts-expect-error
                                          !props?.currentMessage?.localPaths
                                            ?.length > 0
                                            ? //@ts-expect-error
                                              MediaDownload(
                                                "channel",
                                                props.currentMessage,
                                                channelInfo?.channelId,
                                                MediaUpdated
                                              )
                                            : handleDocumentPress(
                                                //@ts-expect-error
                                                props.currentMessage.localPaths
                                              );
                                      }}
                                      style={{
                                        padding: 5,
                                        width: WINDOW_WIDTH - 20,
                                        // backgroundColor:"green",
                                      }}
                                    >
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                                          padding: 3,
                                          borderRadius: 5,
                                        }}
                                      >
                                        <Image
                                          source={require("../../../Assets/Icons/pdfview.png")} // Replace with your document icon image
                                          style={{
                                            width: 24,
                                            height: 24,
                                            marginRight: 8,
                                          }}
                                        />
                                        <Text
                                          style={{
                                            fontSize: 16,
                                            fontFamily: font.semibold(),
                                            marginRight: 20,
                                          }}
                                        >
                                          {t("document")}
                                        </Text>
                                        {renderIf(
                                          //@ts-expect-error
                                          props?.currentMessage?.localPaths
                                            ?.length == 0,

                                          <View>
                                            {mediaLoaderdata[
                                              //@ts-expect-error
                                              props?.currentMessage?.messageId
                                            ]?.isMediaLoader ? ( // Check if isMediaLoader is true for the current messageId
                                              <View
                                                style={{
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  width: 24,
                                                  height: 24,
                                                  marginRight: 6,
                                                  // opacity: 0.6,
                                                  marginLeft: 200,
                                                }}
                                              >
                                                <ActivityIndicator
                                                  size="small"
                                                  color="#000000"
                                                />
                                              </View>
                                            ) : (
                                              <Image
                                                source={require("../../../Assets/Icons/downloadFile.png")} // Replace with your document icon image
                                                style={{
                                                  width: 24,
                                                  height: 24,
                                                  marginRight: 8,
                                                  opacity: 0.6,
                                                  marginLeft: 200,
                                                }}
                                              />
                                            )}
                                          </View>
                                        )}
                                      </View>
                                    </TouchableOpacity>
                                  )
                                )
                              }
                              {renderIf(
                                props.currentMessage.message,
                                <View style={{ marginHorizontal: 10 }}>
                                  <Text style={{ color: "#000", fontSize: 15 }}>
                                    {props.currentMessage.message}
                                  </Text>
                                </View>
                              )}

                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginHorizontal: 5,
                                }}
                              >
                                {
                                  //@ts-ignore
                                  props.currentMessage.status == "" &&
                                    uploadProgress.map((progress, index) => (
                                      <View
                                        key={index}
                                        style={{
                                          //@ts-ignore
                                          width:
                                            //@ts-ignore
                                            props.currentMessage.attachment
                                              .length == 1
                                              ? 190
                                              : 310 / //@ts-ignore
                                                props.currentMessage.attachment
                                                  .length,
                                          height: 5,
                                          backgroundColor: "#f0f0f0",
                                          marginTop: 1,
                                        }}
                                      >
                                        <View
                                          style={{
                                            width: `${progress || 0}%`,
                                            height: 5,
                                            backgroundColor:
                                              iconTheme().iconColorNew, // Change color as needed
                                          }}
                                        />
                                      </View>
                                    ))
                                }
                              </View>
                            </View>
                          );
                        }
                      }}
                      textStyle={{
                        right: {
                          fontSize: globalThis.chatFontsize,
                          color: "black",
                          fontFamily: font.semibold(),
                          textAlign: "left",
                          // Change this to set the text color for sent messages
                        },
                        left: {
                          fontSize: globalThis.chatFontsize,
                          color: "black",
                          fontFamily: font.semibold(), // Change this to set the text color for received messages
                        },
                      }}
                    />
                    {props?.currentMessage?.reactions &&
                      props?.currentMessage?.reactions?.length > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            setReactionCountmodel(true),
                              setreacttiondata(
                                props?.currentMessage?.reactions
                              );
                          }}
                          style={
                            props?.currentMessage?.user?._id ==
                            globalThis.userChatId
                              ? baseStyles.userMessage
                              : baseStyles.otherUserMessage
                          }
                        >
                          {props?.currentMessage?.reactions?.map(
                            (data, index) => (
                              <Text
                                key={index}
                                style={{
                                  fontSize: 15,
                                  color: "#000",
                                  paddingRight: 3,
                                }}
                              >
                                {data?.emoji}
                              </Text>
                            )
                          )}
                          <Text style={{ fontSize: 15, fontWeight: "700" }}>
                            {props?.currentMessage?.reactions.reduce(
                              (acc, val) => {
                                return acc + val.count;
                              },
                              0
                            )}
                          </Text>
                        </TouchableOpacity>
                      )}
                  </Animated.View>
                );
              }
            }}
            showAvatarForEveryMessage={false}
            placeholder="Type a message..."
            // renderAvatar={() => null}
            showUserAvatar={false}
            renderAvatar={null}
            alwaysShowSend={true}
            renderInputToolbar={() => (
              <View
                style={{
                  bottom: Platform.OS == "ios" ? 0 : 0,
                  top:
                    Platform.OS == "ios"
                      ? DeviceInfo.hasNotch() == true
                        ? -35
                        : -15
                      : -15,
                }}
              >
                {ismultidelete ? (
                  <View
                    style={{
                      width: "100%",
                      backgroundColor: "#efefef",
                      position: "relative",
                      zIndex: 60,
                      height: 70,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flex: 1,
                        paddingHorizontal: 10,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          if (
                            selectedMessageId &&
                            selectedMessageId.length > 0
                          ) {
                            globalThis.confirmAlertText =
                              selectedMessageId.length < 2
                                ? t("delete_for_all") +
                                  ", " +
                                  t("Delete_for_all_single")
                                : t("delete_for_all") +
                                  ", " +
                                  t("Delete_for_all_multiple");
                            setConfirmAlertModel(true);
                            // Alert.alert(
                            //   t("delete_for_all"),
                            //   selectedMessageId.length < 2
                            //     ? t("Delete_for_all_single")
                            //     : t("Delete_for_all_multiple"),
                            //   [
                            //     { text: t("cancel") },
                            //     {
                            //       text: t("ok"),
                            //       onPress: () => {
                            //         OnChatModalTextClick("Delete for all");
                            //       },
                            //     },
                            //   ]
                            // );
                          }
                        }}
                      >
                        <Image
                          style={{
                            height: 25,
                            width: 25,
                            tintColor:
                              selectedMessageId && selectedMessageId.length > 0
                                ? "red"
                                : "darkgrey",
                          }}
                          source={require("../../../Assets/Icons/Delete.png")}
                        />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 16, color: "red" }}>
                        {selectedMessageId && selectedMessageId.length}{" "}
                        {t("Selected")}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "center",
                      paddingTop: 10,
                      backgroundColor: "#fff",
                      paddingBottom: 60,
                    }}
                    // style={{
                    //   bottom: Platform.OS == "ios" ? 0 : 0,
                    //   top:
                    //     Platform.OS == "ios"
                    //       ? DeviceInfo.hasNotch() == true
                    //         ? -35
                    //         : -15
                    //       : -25,
                    // }}
                  >
                    {route?.params?.deepLinking == true &&
                    channelExists == false ? (
                      <>
                        <TouchableOpacity
                          style={{
                            //  bottom: Platform.OS == "ios" ? 15 : 0,
                            backgroundColor: iconTheme().iconColorNew,
                            width: "90%",
                            alignSelf: "center",
                            borderWidth: 1,
                            borderColor: "transparent",
                            borderRadius: 20,
                            justifyContent: "center",
                            alignItems: "center",
                            padding: DeviceInfo.hasNotch() == true ? 10 : 10,
                            //top: 15,
                          }}
                          onPress={() => JoinChanelViaLink()}
                        >
                          <Text
                            style={{
                              fontSize: fontSize.input_title_size,
                              color: "#fff",
                            }}
                          >
                            {t("Join_Channel")}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        {channelInfo?.owner != globalThis.chatUserId ? (
                          <View
                            style={{
                              bottom: Platform.OS == "ios" ? 15 : 0,
                              backgroundColor: iconTheme().iconColorNew,
                              width: "90%",
                              alignSelf: "center",
                              borderWidth: 1,
                              borderColor: "transparent",
                              borderRadius: 20,
                              justifyContent: "center",
                              alignItems: "center",
                              padding: DeviceInfo.hasNotch() == true ? 10 : 10,
                              top: 0,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: fontSize.input_title_size,
                                color: "#fff",
                              }}
                            >
                              {t("Only_Admin_Can_Message")}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={{
                              flexDirection: "row",
                              width: "100%",
                              justifyContent: "center",
                              // paddingTop: 10,

                              //   paddingBottom: 60,
                              // marginBottom:50
                            }}
                          >
                            <View
                              style={{
                                width: "98%",
                                flexDirection: "row",
                                // backgroundColor: "red",
                                marginBottom: 50,
                                // paddingBottom: 60,
                                //height: 50,
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  width: "10%",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onPress={() => setSendItems(!sendItems)}
                              >
                                <Image
                                  source={require("../../../Assets/Icons/plus.png")}
                                  style={{
                                    height: 20,
                                    width: 20,
                                    tintColor: iconTheme().iconColorNew,
                                  }}
                                  resizeMode="contain"
                                />
                              </TouchableOpacity>

                              <TextInput
                                //showsVerticalScrollIndicator={false}
                                // Hide vertical scrollbar on iOS
                                // showsHorizontalScrollIndicator={false}
                                //size={17}
                                textContentType={"none"}
                                keyboardType={"default"}
                                ref={textInputRef}
                                onSubmitEditing={() => Keyboard.dismiss()}
                                placeholderTextColor={COLORS.grey}
                                placeholder={t("typeHere")}
                                onChangeText={(text) => {
                                  setMessageInput(text);
                                }}
                                //   editable={
                                //     isnewblock == true
                                //       ? false
                                //       : mainprovider.allow == "admin" && //@ts-ignore
                                //         globalThis.userChatId != mainprovider.owner &&
                                //         currentUserData &&
                                //         //@ts-ignore
                                //         currentUserData.isAdmin != 1
                                //       ? false
                                //       : true
                                //   }
                                multiline={true}
                                //@ts-ignore
                                value={messageInput}
                                textAlignVertical="center"
                                style={{
                                  // position:"absolute",
                                  width: "77%",
                                  paddingRight: 15,
                                  color: COLORS.black,
                                  marginTop: Platform.OS == "ios" ? 5 : 4,
                                  borderRadius: messageInput ? 10 : 20,
                                  fontFamily: font.regular(),
                                  elevation: 10,
                                  borderWidth: 1,
                                  borderColor: iconTheme().iconColorNew,
                                  paddingLeft: 15,
                                  minHeight: Platform.OS == "android" ? 40 : 34,
                                  maxHeight: Platform.OS == "android" ? 45 : 55,
                                  backgroundColor: "#F8F8F8",
                                }}
                              />

                              <TouchableOpacity
                                style={{
                                  marginLeft: "auto",
                                  marginRight: 5,
                                  width: "10%",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderWidth: 0,
                                  borderColor: "transparent",
                                }}
                                onPress={() => OnSendClick()}
                              >
                                <Image
                                  source={require("../../../Assets/Icons/Send_message.png")}
                                  style={{
                                    height: 22,
                                    width: 22,
                                    tintColor: iconTheme().iconColorNew,
                                  }}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>
            )}
            renderMessageVideo={(props) => {
              if (
                //@ts-ignore
                props.currentMessage.messageType === "video" && //@ts-ignore
                !props.currentMessage.isDeletedForAll
              ) {
                return (
                  <>
                    <TouchableOpacity
                      onPressIn={() => {
                        handlePressIn(props?.currentMessage?.messageId);
                      }}
                      onPressOut={() => {
                        handlePressOut(props?.currentMessage?.messageId);
                      }}
                      onLongPress={() => {
                        setreactmsgon(true);
                        setreactmsgondata(props.currentMessage);
                        setSelectedMessageId([
                          props?.currentMessage?.messageId,
                        ]);
                        ReactNativeHapticFeedback.trigger("impactHeavy", {
                          enableVibrateFallback: true,
                          ignoreAndroidSystemSettings: false,
                        });
                      }}
                      onPress={() => {
                        ReactNativeHapticFeedback.trigger("impactHeavy", {
                          enableVibrateFallback: true,
                          ignoreAndroidSystemSettings: false,
                        });
                        if (
                          route?.params?.deepLinking == true &&
                          channelExists == false
                        ) {
                        } else {
                          if (
                            //@ts-ignore
                            props.currentMessage?.localPaths &&
                            //@ts-ignore
                            props.currentMessage?.localPaths.length > 0
                          ) {
                            if (
                              //@ts-ignore
                              props.currentMessage?.localPaths.length == 1 &&
                              //@ts-ignore
                              props.currentMessage?.localPaths[0] == blurVideo
                            ) {
                              //@ts-ignore
                              MediaDownload(
                                "channel",
                                props.currentMessage,
                                channelInfo?.channelId,
                                MediaUpdated
                              );
                            } else {
                              if (
                                //@ts-ignore
                                props.currentMessage?.localPaths.length == 1
                              ) {
                                navigation.navigate("VideoPlayScreen", {
                                  //@ts-expect-error
                                  videoUrl: props.currentMessage?.localPaths[0],
                                });
                              } else {
                                //@ts-ignore
                                navigation.navigate("VideoListScreen", {
                                  //@ts-expect-error
                                  videos: props.currentMessage?.localPaths,
                                });
                              }
                            }
                          } else {
                            //@ts-ignore
                            MediaDownload(
                              "channel",
                              props.currentMessage,
                              channelInfo?.channelId,
                              MediaUpdated
                            );
                          }
                        }
                      }}
                      style={{
                        flexDirection:
                          props.currentMessage.attachment.length == 1
                            ? "row-reverse"
                            : "row",
                        //  backgroundColor: "red",
                      }}
                    >
                      {
                        //@ts-ignore
                        props.currentMessage.attachment && //@ts-ignore
                        props.currentMessage.attachment.length == 1 ? (
                          <React.Fragment>
                            {renderIf(
                              Platform.OS == "ios" &&
                                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                props?.currentMessage?.localPaths?.length > 0,
                              <View
                                style={{
                                  position: "absolute",
                                  top: 100,
                                  left: (WINDOW_WIDTH - 70) / 2,
                                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                                  height: 50,
                                  width: 50,
                                  zIndex: 100,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  borderWidth: 1,
                                  borderColor: "transparent",
                                  borderRadius: 25,
                                }}
                              >
                                <Image
                                  source={require("../../../Assets/Icons/play-button.png")}
                                  style={{
                                    height: 40,
                                    width: 40,
                                    tintColor: "#fff",
                                  }}
                                  resizeMode="contain"
                                />
                              </View>
                            )}

                            {
                              //@ts-ignore
                              props?.currentMessage?.localPaths &&
                              //@ts-ignore
                              props?.currentMessage?.localPaths?.length > 0 ? (
                                <Video
                                  source={{
                                    //@ts-ignore
                                    uri: props.currentMessage.localPaths[0],
                                  }}
                                  paused
                                  posterResizeMode="contain"
                                  poster="https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png"
                                  style={{
                                    width: "94%",
                                    height: 250,
                                    marginRight: 10,
                                    //  margin: 5,
                                  }}
                                />
                              ) : (
                                <View
                                  style={{
                                    width: "98%",
                                    height: 250,
                                    margin: 5,
                                    backgroundColor: "#000",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    paddingHorizontal: 10,
                                  }}
                                >
                                  <Image
                                    source={require("../../../Assets/Icons/downloadFile.png")}
                                    style={{
                                      height: 50,
                                      width: 50,
                                      tintColor: "#fff",
                                    }}
                                    resizeMode="contain"
                                  />
                                </View>
                              )
                            }

                            {
                              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              mediaLoaderdata[props?.currentMessage?.messageId]
                                ?.isMediaLoader && ( // Check if isMediaLoader is true for the current messageId
                                <ImageBackground
                                  source={require("../../../Assets/Image/loaderblur.png")}
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    // backgroundColor:"red",
                                    // height:50,width:50,alignSelf:'center'
                                  }}
                                >
                                  <ActivityIndicator
                                    size="large"
                                    color="green"
                                  />
                                </ImageBackground>
                              )
                            }
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            {renderIf(
                              Platform.OS == "ios" &&
                                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                props?.currentMessage?.localPaths?.length > 0 &&
                                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                props?.currentMessage?.localPaths?.length == 2,
                              <View
                                style={{
                                  flexDirection: "row",
                                  position: "absolute",
                                  zIndex: 200,
                                  width: "100%",
                                  alignSelf: "center",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <View
                                  style={{
                                    // backgroundColor: "red",
                                    height: 150,
                                    width: 160,
                                    // position: "absolute",
                                    // zIndex: 200,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <View
                                    style={{
                                      justifyContent: "center",
                                      alignItems: "center",
                                      borderWidth: 1,
                                      borderColor: "transparent",
                                      borderRadius: 25,
                                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                                    }}
                                  >
                                    <Image
                                      source={require("../../../Assets/Icons/play-button.png")}
                                      style={{
                                        height: 40,
                                        width: 40,
                                        tintColor: "#fff",
                                      }}
                                      resizeMode="contain"
                                    />
                                  </View>
                                </View>

                                <View
                                  style={{
                                    // backgroundColor: "red",
                                    height: 150,
                                    width: 160,
                                    // position: "absolute",
                                    // zIndex: 200,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <View
                                    style={{
                                      justifyContent: "center",
                                      alignItems: "center",
                                      borderWidth: 1,
                                      borderColor: "transparent",
                                      borderRadius: 25,
                                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                                    }}
                                  >
                                    <Image
                                      source={require("../../../Assets/Icons/play-button.png")}
                                      style={{
                                        height: 40,
                                        width: 40,
                                        tintColor: "#fff",
                                      }}
                                      resizeMode="contain"
                                    />
                                  </View>
                                </View>
                              </View>
                            )}
                            {
                              //@ts-ignore
                              props.currentMessage.attachment.length === 1 ? (
                                <View style={{ position: "relative" }}>
                                  {
                                    //@ts-expect-error
                                    props?.currentMessage.localPaths?.length >
                                    0 ? (
                                      <Video
                                        source={{
                                          //@ts-expect-error
                                          uri: props.currentMessage
                                            .localPaths[0],
                                        }}
                                        paused
                                        posterResizeMode="contain"
                                        poster="https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png"
                                        style={{
                                          width: 150,
                                          height: 150,
                                          margin: 5,
                                        }}
                                        //paused={paused}
                                      />
                                    ) : (
                                      <View
                                        style={{
                                          width: 150,
                                          height: 150,
                                          margin: 5,
                                          backgroundColor: "#000",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Image
                                          source={require("../../../Assets/Icons/downloadFile.png")}
                                          style={{
                                            height: 50,
                                            width: 50,
                                            tintColor: "#fff",
                                          }}
                                          resizeMode="contain"
                                        />
                                      </View>
                                    )
                                  }
                                </View>
                              ) : (
                                <>
                                  {renderIf(
                                    Platform.OS == "ios" &&
                                      //@ts-expect-error
                                      props?.currentMessage?.localPaths
                                        ?.length > 0 &&
                                      //@ts-expect-error
                                      props?.currentMessage?.localPaths
                                        ?.length > 2,
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        position: "absolute",
                                        zIndex: 200,
                                        //  backgroundColor:"green"
                                      }}
                                    >
                                      <View
                                        style={{
                                          //  backgroundColor: "red",
                                          height: 150,
                                          width: 160,
                                          // position: "absolute",
                                          // zIndex: 200,
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <View
                                          style={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: "transparent",
                                            borderRadius: 25,
                                            backgroundColor:
                                              "rgba(0, 0, 0, 0.4)",
                                            //        alignSelf:"center"
                                          }}
                                        >
                                          <Image
                                            source={require("../../../Assets/Icons/play-button.png")}
                                            style={{
                                              height: 40,
                                              width: 40,
                                              tintColor: "#fff",
                                            }}
                                            resizeMode="contain"
                                          />
                                        </View>
                                      </View>

                                      <View
                                        style={{
                                          // backgroundColor: "red",
                                          height: 150,
                                          width: 160,
                                          // position: "absolute",
                                          // zIndex: 200,
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <View
                                          style={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: "transparent",
                                            borderRadius: 25,
                                            backgroundColor:
                                              "rgba(0, 0, 0, 0.4)",
                                          }}
                                        >
                                          <Image
                                            source={require("../../../Assets/Icons/play-button.png")}
                                            style={{
                                              height: 40,
                                              width: 40,
                                              tintColor: "#fff",
                                            }}
                                            resizeMode="contain"
                                          />
                                        </View>
                                      </View>
                                    </View>
                                  )}
                                  <View
                                    style={{
                                      position: "relative",
                                      width: "50%",
                                      marginRight: 5,
                                    }}
                                  >
                                    {
                                      //@ts-expect-error
                                      props?.currentMessage?.localPaths
                                        ?.length > 0 ? (
                                        <Video
                                          source={{
                                            //@ts-expect-error
                                            uri: props.currentMessage
                                              .localPaths[0],
                                          }}
                                          paused
                                          posterResizeMode="contain"
                                          poster="https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png"
                                          style={{
                                            width: "100%",
                                            height: 150,
                                            margin: 5,
                                          }}

                                          //paused={paused}
                                        />
                                      ) : (
                                        <View
                                          style={{
                                            width: "100%",
                                            height: 150,
                                            margin: 5,
                                            justifyContent: "center",
                                            backgroundColor: "#000",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Image
                                            source={require("../../../Assets/Icons/downloadFile.png")}
                                            style={{
                                              height: 50,
                                              width: 50,
                                              tintColor: "#fff",
                                            }}
                                            resizeMode="contain"
                                          />
                                        </View>
                                      )
                                    }
                                  </View>
                                  <View
                                    style={{
                                      position: "relative",
                                      width: "47%",
                                    }}
                                  >
                                    {
                                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                      props?.currentMessage?.localPaths &&
                                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                      props?.currentMessage?.localPaths
                                        ?.length > 0 ? (
                                        <Video
                                          source={{
                                            uri: props.currentMessage
                                              .localPaths[1],
                                          }}
                                          paused
                                          posterResizeMode="contain"
                                          poster="https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png"
                                          style={{
                                            width: "100%",
                                            height: 150,
                                            margin: 5,
                                            opacity:
                                              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                              props.currentMessage.attachment
                                                .length > 2
                                                ? 0.5
                                                : 1,
                                          }}

                                          //paused={paused}
                                        />
                                      ) : (
                                        <View
                                          style={{
                                            backgroundColor: "#000",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: "100%",
                                            height: 150,
                                            margin: 5,
                                          }}
                                        >
                                          <Image
                                            source={require("../../../Assets/Icons/downloadFile.png")}
                                            style={{
                                              height: 50,
                                              width: 50,
                                              tintColor: "#fff",
                                            }}
                                            resizeMode="contain"
                                          />
                                        </View>
                                      )
                                    }

                                    {
                                      //@ts-ignore
                                      props.currentMessage.attachment.length >
                                        2 && (
                                        <View
                                          style={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            backgroundColor:
                                              "rgba(0, 0, 0, 0.5)",
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 8,
                                          }}
                                        >
                                          <Text
                                            style={{
                                              color: "white",
                                              fontSize: 12,
                                              fontFamily: font.semibold(),
                                            }}
                                          >
                                            +
                                            {
                                              //@ts-ignore
                                              props.currentMessage.attachment
                                                .length - 2
                                            }{" "}
                                            {t("more")}
                                          </Text>
                                        </View>
                                      )
                                    }
                                  </View>
                                </>
                              )
                            }

                            {
                              //@ts-expect-error
                              mediaLoaderdata[props?.currentMessage?.messageId]
                                ?.isMediaLoader && ( // Check if isMediaLoader is true for the current messageId
                                <View
                                  //   source={require('../../Assets/Image/loaderblur.png')}
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    // backgroundColor:"red",
                                    // height:50,width:50,alignSelf:'center'
                                  }}
                                >
                                  <ActivityIndicator
                                    size="large"
                                    color="green"
                                  />
                                </View>
                              )
                            }
                          </React.Fragment>
                        )
                      }
                    </TouchableOpacity>
                    {renderIf(
                      props.currentMessage.message,
                      <View style={{ marginHorizontal: 10 }}>
                        <Text style={{ color: "#000", fontSize: 15 }}>
                          {props.currentMessage.message}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 5,
                      }}
                    >
                      {
                        //@ts-ignore
                        props.currentMessage.status == "" &&
                          uploadProgress.map((progress, index) => (
                            <View
                              key={index}
                              style={{
                                //@ts-ignore
                                width:
                                  //@ts-ignore
                                  props.currentMessage.attachment.length == 1
                                    ? 200
                                    : 310 / //@ts-ignore
                                      props.currentMessage.attachment.length,
                                height: 5,
                                backgroundColor: "#f0f0f0",
                                marginTop: 1,
                              }}
                            >
                              <View
                                style={{
                                  width: `${progress || 0}%`,
                                  height: 5,
                                  backgroundColor: iconTheme().iconColorNew, // Change color as needed
                                }}
                              />
                            </View>
                          ))
                      }
                    </View>

                    {/* } */}
                  </>
                );
              }
              return null; // Return null for other message types
            }}
            renderMessageImage={(props) => {
              if (
                //@ts-ignore
                props.currentMessage.messageType === "image" &&
                !props.currentMessage.isDeletedForAll
              ) {
                return (
                  <View>
                    <TouchableOpacity
                      style={{ flexDirection: "row" }}
                      onPressIn={() => {
                        handlePressIn(props?.currentMessage?.messageId);
                      }}
                      onPressOut={() => {
                        handlePressOut(props?.currentMessage?.messageId);
                      }}
                      onLongPress={() => {
                        setreactmsgon(true);
                        setreactmsgondata(props.currentMessage);
                        setSelectedMessageId([
                          props?.currentMessage?.messageId,
                        ]);
                        ReactNativeHapticFeedback.trigger("impactHeavy", {
                          enableVibrateFallback: true,
                          ignoreAndroidSystemSettings: false,
                        });
                      }}
                      onPress={() => {
                        ReactNativeHapticFeedback.trigger("impactHeavy", {
                          enableVibrateFallback: true,
                          ignoreAndroidSystemSettings: false,
                        });
                        if (
                          route?.params?.deepLinking == true &&
                          channelExists == false
                        ) {
                        } else {
                          if (
                            //@ts-ignore
                            props.currentMessage?.localPaths &&
                            //@ts-ignore
                            props.currentMessage.localPaths.length > 0
                          ) {
                            if (
                              //@ts-ignore
                              // props.currentMessage.localPaths.length === 1 &&
                              //@ts-ignore
                              props.currentMessage.localPaths[0] === blurImage
                            ) {
                              //@ts-ignore
                              MediaDownload(
                                "channel",
                                props.currentMessage,
                                channelInfo?.channelId,
                                MediaUpdated
                              );
                            } else {
                              OpenPreview(props.currentMessage);
                            }
                          } else {
                            //@ts-ignore
                            MediaDownload(
                              "channel",
                              props.currentMessage,
                              channelInfo?.channelId,
                              MediaUpdated
                            );
                          }
                        }
                      }}
                      // onPress={()=>console.log("props.currentMessage?.localPaths",props.currentMessage?.localPaths)}
                    >
                      {
                        //@ts-ignore
                        props?.currentMessage?.attachment &&
                        //@ts-ignore
                        props?.currentMessage?.attachment?.length == 1 ? (
                          <React.Fragment>
                            <Image
                              //@ts-ignore
                              source={
                                //@ts-ignore
                                props?.currentMessage?.localPaths &&
                                //@ts-ignore
                                props?.currentMessage?.localPaths?.length > 0
                                  ? {
                                      //@ts-ignore
                                      uri: CreateRenderImage(
                                        //@ts-ignore
                                        props?.currentMessage.localPaths[0]
                                      ),
                                    }
                                  : require("../../../Assets/Image/blur.png")
                              }
                              style={{ width: "98%", height: 250, margin: 5 }}
                              resizeMode="cover"
                            />
                            {
                              //@ts-expect-error
                              mediaLoaderdata[props?.currentMessage?.messageId]
                                ?.isMediaLoader && ( // Check if isMediaLoader is true for the current messageId
                                <ImageBackground
                                  source={require("../../../Assets/Image/loaderblur.png")}
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <ActivityIndicator
                                    size="large"
                                    color="green"
                                  />
                                </ImageBackground>
                              )
                            }
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            {
                              //@ts-ignore
                              props?.currentMessage?.attachment?.length ===
                              1 ? (
                                <View style={{ position: "relative" }}>
                                  <Image
                                    defaultSource={require("../../../Assets/Image/blur.png")}
                                    source={
                                      //@ts-ignore
                                      props?.currentMessage?.localPaths &&
                                      //@ts-ignore
                                      props?.currentMessage?.localPaths
                                        ?.length > 0
                                        ? {
                                            //@ts-ignore
                                            uri: CreateRenderImage(
                                              //@ts-ignore
                                              //@ts-ignore
                                              props?.currentMessage
                                                .localPaths[0]
                                            ),
                                          }
                                        : require("../../../Assets/Image/blur.png")
                                    }
                                    style={{
                                      width: 150,
                                      height: 150,
                                      margin: 5,
                                    }}
                                    resizeMode="cover"
                                  />
                                  {mediaLoaderdata[
                                    //@ts-expect-error
                                    props?.currentMessage?.messageId
                                  ]?.isMediaLoader && ( // Check if isMediaLoader is true for the current messageId
                                    <ImageBackground
                                      source={require("../../../Assets/Image/loaderblur.png")}
                                      style={{
                                        position: "absolute",
                                        right: 0,
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        // backgroundColor:"red",
                                        // height:50,width:50,alignSelf:'center'
                                      }}
                                    >
                                      <ActivityIndicator
                                        size="large"
                                        color="green"
                                      />
                                    </ImageBackground>
                                  )}
                                </View>
                              ) : (
                                <>
                                  <View
                                    style={{
                                      position: "relative",
                                      width: "47%",
                                      marginRight: 10,
                                    }}
                                  >
                                    <Image
                                      //  defaultSource={require("../../../Assets/Image/blur.png")}
                                      source={
                                        //@ts-ignore
                                        props?.currentMessage?.localPaths &&
                                        //@ts-ignore
                                        props?.currentMessage?.localPaths
                                          ?.length > 0
                                          ? {
                                              //@ts-ignore
                                              uri: CreateRenderImage(
                                                props?.currentMessage
                                                  ?.localPaths[0]
                                              ),
                                            }
                                          : require("../../../Assets/Image/blur.png")
                                      }
                                      style={{
                                        width: "100%",
                                        height: 150,
                                        margin: 5,
                                      }}
                                      resizeMode="cover"
                                    />
                                  </View>
                                  <View
                                    style={{
                                      position: "relative",
                                      width: "47%",
                                    }}
                                  >
                                    <Image
                                      // defaultSource={require("../../../Assets/Image/blur.png")}
                                      source={
                                        //@ts-ignore
                                        props?.currentMessage?.localPaths &&
                                        //@ts-ignore
                                        props?.currentMessage?.localPaths
                                          ?.length > 0
                                          ? {
                                              //@ts-ignore
                                              uri: CreateRenderImage(
                                                props?.currentMessage
                                                  .localPaths[1]
                                              ),
                                            }
                                          : require("../../../Assets/Image/blur.png")
                                      }
                                      style={{
                                        width: "100%",
                                        height: 150,
                                        margin: 5,

                                        opacity:
                                          //@ts-ignore
                                          props?.currentMessage?.attachment
                                            ?.length > 2
                                            ? 0.5
                                            : 1,
                                      }}
                                      resizeMode="cover"
                                    />

                                    {
                                      //@ts-ignore
                                      //@ts-ignore
                                      props?.currentMessage?.attachment
                                        ?.length > 2 && (
                                        <View
                                          style={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            backgroundColor:
                                              "rgba(0, 0, 0, 0.5)",
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 8,
                                          }}
                                        >
                                          <Text
                                            //@ts-ignore
                                            style={{
                                              color: "white",
                                              fontSize: 12,
                                              fontFamily: font.regular(),
                                            }}
                                          >
                                            +
                                            {
                                              //@ts-ignore
                                              //@ts-ignore
                                              props?.currentMessage?.attachment
                                                ?.length - 2
                                            }{" "}
                                            {t("more")}
                                          </Text>
                                        </View>
                                      )
                                    }
                                  </View>
                                </>
                              )
                            }
                            {
                              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              mediaLoaderdata[props?.currentMessage?.messageId]
                                ?.isMediaLoader && ( // Check if isMediaLoader is true for the current messageId
                                <View
                                  // source={require('../../Assets/Image/loaderblur.png')}
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    // backgroundColor:"red",
                                    // height:50,width:50,alignSelf:'center'
                                  }}
                                >
                                  <ActivityIndicator
                                    size="large"
                                    color="green"
                                  />
                                </View>
                              )
                            }
                          </React.Fragment>
                        )
                      }
                    </TouchableOpacity>
                    {renderIf(
                      props.currentMessage.message,
                      <View style={{ marginHorizontal: 10 }}>
                        <Text style={{ color: "#000", fontSize: 15 }}>
                          {props.currentMessage.message}
                        </Text>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 5,
                      }}
                    >
                      {
                        //@ts-ignore
                        props.currentMessage.status == "" &&
                          uploadProgress.map((progress, index) => (
                            <View
                              key={index}
                              style={{
                                //@ts-ignore
                                width:
                                  //@ts-ignore
                                  props?.currentMessage?.attachment?.length == 1
                                    ? "90%"
                                    : 310 / //@ts-ignore
                                      props?.currentMessage?.attachment?.length,
                                height: 5,
                                backgroundColor: "#f0f0f0",
                                marginTop: 1,
                              }}
                            >
                              <View
                                style={{
                                  width: `${progress || 0}%`,
                                  height: 5,
                                  backgroundColor: iconTheme().iconColorNew, // Change color as needed
                                }}
                              />
                            </View>
                          ))
                      }
                    </View>
                  </View>
                );
              }
              return null; // Return null for other message types
            }}
            renderMessageAudio={(props) => {
              if (
                //@ts-ignore
                props?.currentMessage?.messageType == "audio" &&
                !props.currentMessage.isDeletedForAll
              ) {
                return (
                  <View style={{ width: "100%" }}>
                    <TouchableOpacity
                      onPressIn={() => {
                        handlePressIn(props?.currentMessage?.messageId);
                      }}
                      onPressOut={() => {
                        handlePressOut(props?.currentMessage?.messageId);
                      }}
                      onLongPress={() => {
                        setreactmsgon(true);
                        setreactmsgondata(props.currentMessage);
                        setSelectedMessageId([
                          props?.currentMessage?.messageId,
                        ]);
                        ReactNativeHapticFeedback.trigger("impactHeavy", {
                          enableVibrateFallback: true,
                          ignoreAndroidSystemSettings: false,
                        });
                      }}
                    >
                      {
                        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        !props?.currentMessage?.localPaths?.length > 0 ? (
                          <View
                            style={{
                              height: 50,
                              width: "100%",
                              flexDirection: "row",
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                // width: "20%",
                                justifyContent: "center",
                                // alignItems: "center",
                                marginLeft: 10,
                                marginTop: 10,
                              }}
                              onPress={() => {
                                if (
                                  route?.params?.deepLinking == true &&
                                  channelExists == false
                                ) {
                                } else {
                                  //@ts-ignore
                                  MediaDownload(
                                    "channel",
                                    props.currentMessage,
                                    channelInfo?.channelId,
                                    MediaUpdated
                                  );
                                }
                              }}
                            >
                              {mediaLoaderdata[props?.currentMessage?.messageId]
                                ?.isMediaLoader == true ? ( // Check if isMediaLoader is true for the current messageId
                                <View
                                  style={{
                                    height: 30,
                                    width: 30,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <ActivityIndicator
                                    size="small"
                                    color="#000000"
                                  />
                                </View>
                              ) : (
                                <Image
                                  source={require("../../../Assets/Icons/downloadFile.png")}
                                  style={{ height: 30, width: 30 }}
                                  resizeMode="contain"
                                />
                              )}
                            </TouchableOpacity>

                            <View
                              style={{
                                // width: "100%",
                                flex: 1,
                                justifyContent: "center",
                                borderWidth: 1.5,
                                borderColor: "#ccc",
                                alignItems: "center",
                                marginTop: 10,
                                marginLeft: 10,
                                marginRight: 10,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 22,
                                  marginHorizontal: 20,
                                  alignSelf: "center",
                                }}
                              >
                                {t("Audio_File")}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <>
                            {
                              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              props?.currentMessage?.localPaths?.map(
                                (audioUri, index) => (
                                  <View key={index}>
                                    <View
                                      style={{
                                        height: 50,
                                        width: WINDOW_WIDTH - 20,
                                      }}
                                    >
                                      {/* { Platform.OS === "ios" ?   <AudioMessage currentMessage={props?.currentMessage.attachment[0]} /> : 
                                <AudioMessage currentMessage={audioUri} />
                          } */}
                                      <AudioMessage currentMessage={audioUri} />
                                    </View>
                                  </View>
                                )
                              )
                            }
                          </>
                        )
                      }
                    </TouchableOpacity>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 5,
                      }}
                    >
                      {
                        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        props.currentMessage.status == "" &&
                          uploadProgress.map((progress, index) => (
                            <View
                              key={index}
                              style={{
                                width:
                                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                  props.currentMessage.attachment.length == 1
                                    ? 200
                                    : 310 /
                                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                      props.currentMessage.attachment.length,
                                height: 5,
                                backgroundColor: "#f0f0f0",
                                marginTop: 1,
                              }}
                            >
                              <View
                                style={{
                                  width: `${progress || 0}%`,
                                  height: 5,
                                  backgroundColor: iconTheme().iconColorNew, // Change color as needed
                                }}
                              />
                            </View>
                          ))
                      }
                    </View>
                  </View>
                );
              }
            }}
          />
        </ImageBackground>
        {reactmsgon && (
          <Pressable
            onPress={() => {
              setreactmsgon(false);
            }}
            style={{
              position: "absolute",
              bottom: 0,
              flex: 1,
              backgroundColor: "#4d4b4cd9",
              height: "100%",
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              // Android shadow property
              elevation: 5,
            }}
          >
            <View>
              <Animated.View
                style={{
                  opacity: opacityAnim,
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1], // Adjust scale values as needed
                      }),
                    },
                  ],
                }}
              >
                <Text
                  style={{
                    color: "#ffff",
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 10,
                    fontFamily: font.medium(),
                  }}
                >
                  {t("Tap_to_react_message")}
                </Text>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 100,
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(reactmsgondata.messageId, "👍");
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      👍
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(reactmsgondata?.messageId, "❤️");
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      ❤️
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(reactmsgondata?.messageId, "😂");
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      😂
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(reactmsgondata?.messageId, "😮");
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      😮
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(reactmsgondata?.messageId, "😢");
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      😢
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onsendreaction(reactmsgondata?.messageId, "🙏");
                    }}
                  >
                    <Text
                      style={{ fontSize: 22, letterSpacing: 15, color: "#000" }}
                    >
                      🙏
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
              <Animated.View
                style={{
                  opacity: opacityAnim,
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1], // Adjust scale values as needed
                      }),
                    },
                  ],
                }}
              >
                <View
                  style={{
                    borderRadius: 10,
                    backgroundColor: "#fff",
                    marginTop: 10,
                  }}
                >
                  {channelInfo?.owner == globalThis.chatUserId && (
                    <TouchableOpacity
                      style={[
                        {
                          height: 40,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          alignItems: "center",
                          flexDirection: "row",
                          borderBottomWidth: 1.0,
                          borderBottomColor: "#FAF7F7",
                        },
                      ]}
                      onPress={() => {
                        setismultidelete(true);
                        setreactmsgon(false);
                      }}
                    >
                      <Image
                        source={require("../../../Assets/Icons/Delete.png")}
                        style={{
                          width: 22,
                          height: 22,
                          tintColor: iconTheme().iconColorNew,
                          marginRight: 5,
                          marginLeft: 5,
                        }}
                        resizeMode="contain"
                      />
                      <Text
                        style={{
                          color: "black",
                          fontSize: 15,
                          fontFamily: font.semibold(),
                        }}
                      >
                        {t("delete_for_all")}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      {
                        height: 40,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        alignItems: "center",
                        flexDirection: "row",
                      },
                    ]}
                    onPress={() => {
                      setreactmsgon(false);
                      navigation.navigate("ForwardMessageScreen", {
                        messageId: reactmsgondata?.messageId,
                        rcvmsg: reactmsgondata,
                        room_type: "channel",
                      });
                    }}
                  >
                    <Image
                      source={require("../../../Assets/Icons/forward.png")}
                      style={{
                        width: 22,
                        height: 22,
                        tintColor: iconTheme().iconColorNew,
                        marginRight: 5,
                        marginLeft: 5,
                      }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: "black",
                        fontSize: 15,
                        fontFamily: font.semibold(),
                      }}
                    >
                      {t("forward")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Pressable>
        )}
      </View>
      <LoaderModel visible={loaderMoedl} />
    </View>
  );
}
