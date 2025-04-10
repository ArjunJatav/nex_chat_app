import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  EmitterSubscription,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Vibration,
} from "react-native";

import HighlightText from "@sanar/react-native-highlight-text";
import Contacts from "react-native-contacts";
import CryptoJS from "react-native-crypto-js";
import {
  GestureHandlerRootView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";

import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from "react-native-audio-recorder-player";
import { Video as VideoCompress } from "react-native-compressor";

// import { Video as VideoCompress } from "react-native-compressor";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import DeviceInfo from "react-native-device-info";
import DocumentPicker from "react-native-document-picker";
import {
  Bubble,
  Day,
  GiftedChat,
  SystemMessage,
  Time,
} from "react-native-gifted-chat";
import ImagePicker from "react-native-image-crop-picker";
import Video from "react-native-video";
import { useDispatch, useSelector } from "react-redux";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";

import FileViewer from "react-native-file-viewer";
import WebView from "react-native-webview";
import {
  COLORS,
  appBarText,
  chat,
  chatContainer,
  chatImage,
  chatOther,
  chatTop,
  iconTheme,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import renderIf from "../../Components/renderIf";
import {
  EncryptionKey,
  accessKeyId,
  blurImage,
  blurVideo,
  secretAccessKey,
  translationKey,
} from "../../Constant/Key";
import {
  CheckIsRoomBlocked,
  DeleteTheGroup,
  UpdateProfileImage,
  addMembersToRoomMembersSql,
  addMembersToRoomMembersSqlnew,
  blockRoom,
  clearMessages,
  deleteMessageByResId,
  deleteRoomId,
  getAllChatTableData,
  getIsLock,
  getMembersFromRoomMembersSqlsearch,
  getMyChannelInfo,
  getOldMembersFromRoomMembersSql,
  getOtherPersonLastMessage,
  getRoomBackgroundByRoomId,
  getRoomIdFromRes,
  insertChatList,
  insertRoomSql3,
  lockChat,
  muteroom,
  newMessageInsertList,
  removeCount,
  replaceLocalPathInChatMessages,
  setSeenCount,
  updateLocalPathInChatMessages,
  updateRoomUnseenCount,
  updateblockuser,
  updatedeleteforall,
  updatereactionsforothernormal,
  updatereactionsonnormal,
  updateroominfo,
  getChats,
} from "../../sqliteStore";

import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import axios from "axios";
import { decode } from "base64-arraybuffer";
import { t } from "i18next";
import { NativeEventEmitter, NativeModules } from "react-native";
import FastImage from "react-native-fast-image";
import ImageViewer from "react-native-image-zoom-viewer";
import { showToast } from "../../Components/CustomToast/Action";
import ConfirmPinModal from "../../Components/chatLockModal/ConfirmPin";
import PinModal from "../../Components/chatLockModal/GeneratePinModal";
import OtpVerificationModal from "../../Components/chatLockModal/OtpVerificationModal";
import UnlockChatPinModal from "../../Components/chatLockModal/UnlockChat";
import RNFS from "react-native-fs";
import { badword } from "../../Components/BadWord/Bad_words";

import {
  Base_Url,
  addMemberApi,
  blockApi,
  chatBaseUrl,
  chatUserDetailApi,
  deleteGroup,
  deletechatApi,
  exitgroupApi,
  getChannels,
  getRoomMembersApi,
  get_by_ChatId,
  get_by_User_allposts,
  groupDetailApi,
  muteChatApi,
  newRoomChatSyncApi,
  reactionapi,
  reportChatApi,
  setpin,
} from "../../Constant/Api";
import {
  setMainprovider,
  setintervalIds,
  setisLock,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setnewroomID,
  setnewroomType,
  setonlinestatus,
  setroominfo,
  setyesstart,
} from "../../Redux/ChatHistory";
import { setChatlistmessage } from "../../Redux/ChatList";
import { socket } from "../../socket";
import { fontSize } from "../../utils/constants/fonts";
import { CustomVideoModal } from "../Modals/CustomVideoModal";
import LaguageTranslateModal from "../Modals/LaguageTranslateModal";
import { LoaderModel } from "../Modals/LoaderModel";
import { LocalContactModel } from "../Modals/LocalContactModel";
import { LocationModel } from "../Modals/LocationModel";
import { SetProfileModal } from "../Modals/SetProfileModel";
import Animatedcomponent from "./Animatedcomponent";
import { BackHandler } from "react-native";
import ChatCounter from "./ChatCounter";
import SideMenu from "./SideMenu";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import { setChannelSliceData, setProfileData } from "../../Redux/MessageSlice";
import Drawer from "react-native-drawer";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import AudioMessage from "./AudioMessage";
import {
  updateAppState,
  updateMediaLoader,
  updatedmembersall,
} from "../../reducers/getAppStateReducers";
import MediaDownload from "../../Components/MediaDownload/MediaDownload";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import { colors } from "../../utils/constants/colors";
import {
  setStorylist,
  setUserGalleryVideos,
} from "../../reducers/friendListSlice";
import { Pressable } from "react-native";
import { ReactionCount } from "../Modals/ReactionCount";
import CameraRoll from "@react-native-community/cameraroll";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { ChannelTypeModal } from "../Modals/ChannelTypeModal";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import { Mixpanel } from "mixpanel-react-native";
import { AppsFlyerTracker } from "../EventTracker/AppsFlyerTracker";
import { decryptMessage, encryptMessage } from "../../utils/CryptoHelper";
import {
  createRoomRequest,
  getRemainingSuspensionDays,
  updateViolationAttempt,
} from "../agora/agoraHandler";
import WarningModal from "../Modals/WarningModal";
import {
  setUserBanned,
  setUserSuspendedDays,
} from "../../reducers/userBanSlice";

const isDarkMode = true;
const { StipopModule } = NativeModules;

let nativeEventEmitter: NativeEventEmitter | null = null;

switch (Platform.OS) {
  case "android":
    const { StipopModule } = NativeModules;
    nativeEventEmitter = new NativeEventEmitter(StipopModule);
    break;

  case "ios":
    const { StipopEmitter } = NativeModules;
    nativeEventEmitter = new NativeEventEmitter(StipopEmitter);
    break;
}
let calling_userID = "";
const TOTALMEM = 0;
let banType = "Warning";
let banMessage = "";
let banTitle = "";


const ChattingScreen = React.memo(({ props, navigation, route }: object) => {
  const lastTapRef = useRef(0);
  const drawerRef = useRef(null);
  const textInputRef = createRef(null);
  const chatListRef = createRef(null);
  const { colorTheme } = useContext(ThemeContext);
  const [isloadearly, setisloadearly] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isStipopShowing, setIsStipopShowing] = useState(false);
  const [sendMediaData, setSendMediaData] = useState([]);
  const [imageModal, setImageModal] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const dispatch = useDispatch();
  // const [audioPath, setAudioPath] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  // const [recordTime, setRecordTime] = useState("");
  const mainprovider = useSelector((state) => state.chatHistory.mainprovider);
  const updateMediacount = useSelector(
    (state) => state?.getAppStateReducers?.app_state?.updateMediaFunction
  );
  const membersupdated = useSelector(
    (state) => state?.getAppStateReducers?.membersupdated
  );
  const [userstatus, setuserstatus] = useState("");
  const newroomID = useSelector((state) => state.chatHistory.newroomID);
  const syncchatpn = useSelector((state) => state.chatHistory.syncchatpn);
  const [participantsFrom, setParticipantsFrom] = useState("");
  const [userBlocked, setUserBlocked] = useState(route.params.isBlock);
  const newroomType = useSelector((state) => state.chatHistory.newroomType);
  const roominfo = useSelector((state) => state.chatHistory.roominfo);
  const isnewmute = useSelector((state) => state.chatHistory.isnewmute);
  const isLock = useSelector((state) => state.chatHistory.isLock);
  const [messageClickedId, setMessageClickedId] = useState("");
  const [messageClickd, setMessageClicked] = useState({});
  const [lastTap, setLastTap] = useState(null);
  const [chatModal, setChatModal] = useState(false);
  const [showReplyMessage, setShowReplyMessage] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [mygroupimg, setmygroupimg] = useState({});
  const chatMessageTime = Date.now();
  const [cameraModal, setCameraModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const isNotch = DeviceInfo.hasNotch();
  const [sendItems, setSendItems] = useState(false);
  const [drawerGauster, setDrawerGauster] = useState(false);
  // hide and delete work
  const mediaLoaderdata = useSelector(
    (state) => state.getAppStateReducers.mediaLoader
  );
  const [messages, setMessages] = useState([]);
  const [allmembers, setallmembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [inputFocued, setInputFocused] = useState(false);
  const intervalIds = useSelector((state) => state.chatHistory.intervalIds);
  const [groupImageModal, setGroupImageModal] = useState(false);
  const [allattachment, setallattachment] = useState([]);
  const [attachmentformate, setattachmentformate] = useState("");
  const [showemoji, setshowemoji] = useState(false);
  const [soundInstance, setSoundInstance] = useState(null);
  const [volume, setVolume] = useState(1); // Initial volume (0 to 1)
  const [isPlaying, setIsPlaying] = useState(false);
  const isnewblock = useSelector((state) => state.chatHistory.isnewblock);
  const onlinestatus = useSelector((state) => state.chatHistory.onlinestatus);
  const [locationModel, setLocationModel] = useState(false);
  const [localContactModel, setLocalContactModel] = useState(false);
  const [myimages, setmyimages] = useState(false);
  const [mylocaldata, setmylocaldata] = useState([]);
  const [whotype, setWhotype] = useState("");
  const [SKIP, setSkip] = useState(0);
  const [LIMIT, setLimit] = useState(75);
  const [ISATTOP, setIsTop] = useState(false);
  const [isUserPremium, setIsUserPremium] = useState(
    route?.params?.isUserPremium
  );
  const [isDiamonds, setIsDiamonds] = useState(route?.params?.isDiamonds);
  const [isChannelTypeModal, setChannelTypeModal] = useState(false);

  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);

  ////////////////lock chat state/////////////////////
  const [generatePin, setGeneratePin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [unlockPin, setUnlockPin] = useState("");
  const [verifyPin, setVerifyPin] = useState("");
  const [lockValue, setLockValue] = useState(isLock);
  const [chatLockNumber, setChatLockNumber] = useState("");
  const [confirm, setConfirm] = useState();
  const [otp, setOtp] = useState("");
  ///////////////modal visiable state/////////////////
  const [isGeneratePinModalVisible, setGeneratePinModalVisible] =
    useState(false);
  const [isConfirmPinModalVisible, setConfirmPinModalVisible] = useState(false);
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [isOnline, setisOnline] = useState(false);
  const [sendBtnShow, setSendBtnShow] = useState(false);
  const isFocused = useIsFocused();
  const publicSelected = true;
  ////////////////////////////////////////////////////

  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [currentHighlightedIndex, setCurrentHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState(false);
  const [searchTermtext, setSearchTermtext] = useState("");
  const [isGroupJoined, setIsGroupJoined] = useState(
    !route.params.shouldJoinPublicGroup ?? true
  );
  const [currentUserData, setCurrentUserData] = useState({});
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionSuggestionsold, setMentionSuggestionsold] = useState([]);
  const [isMentioning, setIsMentioning] = useState(false);

  const [translateClicked, setTranslateClicked] = useState("");
  const [languageModel, setlanguageModel] = useState(false);
  const [disappearmsg, setDisappearmsg] = useState(false);
  const [disappearmsgchecked, setDisappearmsgchecked] = useState(false);
  const [disappeartime, setdisappeartime] = useState(0);
  const [isRoomBlocked, setIsRoomBlocked] = useState(true);
  const [ismultidelete, setismultidelete] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState([]);
  const [othermessagearray, setothermessagearray] = useState([]);
  const [messagerefin, setmessagerefin] = useState(null);
  const [dotOpacity] = useState(new Animated.Value(0));
  const [uploadProgress, setUploadProgress] = useState([]);
  const [reason, setReason] = useState("");
  const [isBlock, setIsBlock] = useState(false);
  const [searchtextnew, setSearchTextnew] = useState("");
  const [flatListHeight, setFlatListHeight] = useState(0);
  const [remainingTime, setRemainingTime] = useState("00:00");
  const [isLoading, setIsLoading] = useState(false);
  const [toShowMenu, setToShowMenu] = useState(false);
  const [reactmsgon, setreactmsgon] = useState(false);
  const [reactmsgondata, setreactmsgondata] = useState({});
  const [ReactionCountmodel, setReactionCountmodel] = useState(false);
  const [reacttiondata, setreacttiondata] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]); // State to track selected videos
  const [isContactPermissionGranted, setIsContactPermissionGranted] =
    useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const userGalleryVideos = useSelector(
    (state) => state?.friendListSlice?.userGalleryVideos
  );

  var stickerSingleTapListener = null;
  var stickerDoubleTapListener = null;

  const chattingBottomSheetRef = useRef(null);
  const handlePresentModalPress = () =>
    chattingBottomSheetRef?.current?.present();

  ////////////  MIXPANEL EVENT TRACKER    /////////

  console.log(
    "route.params.isPublic====================================",
    route.params.isPublic
  );

  const trackAutomaticEvents = false;
  const mixpanel = new Mixpanel(
    `${globalThis.mixpanelToken}`,
    trackAutomaticEvents
  );

  const handleButtonPress = (eventName) => {
    handleCallEvent("Add Friend by Contact Screen", eventName);
    // Track button click event with Mixpanel
    mixpanel.track("Add Friend by Contact Screen", {
      type: eventName,
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

  useEffect(() => {
    getPhotos();
  }, []);

  useEffect(() => {
    checkContactPermission();
  }, []);

  const checkContactPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: "Contacts Permission",
            message: "This app needs access to your contacts.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setIsContactPermissionGranted(true);
        } else {
          console.log("Contacts permission is required to use this feature.");
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // Handle iOS permissions (if applicable)
      setIsContactPermissionGranted(true); // Assuming iOS permissions are handled separately
    }
  };

  const handleVideoSelection = (item) => {
    const isSelected = selectedVideos.some(
      (video) => video?.node?.image?.uri === item?.node?.image?.uri
    );
    // Prevent selection of more than 5 videos
    if (!isSelected && selectedVideos.length >= 5) {
      globalThis.errorMessage =
        "Limit Reached, " + "You can only select up to 5 videos.";
      setErrorAlertModel(true);
      // Alert.alert("Limit Reached", "You can only select up to 5 videos."); // Optional alert to notify the user
      return; // Exit the function to prevent further selection
    }

    if (isSelected) {
      // Deselect video if it's already selected
      setSelectedVideos(
        selectedVideos.filter(
          (video) => video?.node?.image?.uri !== item?.node?.image?.uri
        )
      );
    } else {
      // Add video to selectedVideos array
      setSelectedVideos([...selectedVideos, item]);
    }
  };

  function AfterChoosingChannelType(value) {
    setChannelTypeModal(false);

    if (value == "public") {
      navigation.navigate("NewChannelScreen", { type: "public" });
    } else {
      navigation.navigate("NewChannelScreen", { type: "private" });
    }

    //newGroupPress(value);
  }
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

  //   useEffect(() => {
  //     const createRoom = async () => {
  //         try {
  //             const data = await createRoomRequest(globalThis.userChatId, [globalThis.userChatId, mainprovider?.friendId ? mainprovider?.friendId : ""],);
  //             // console.log('Room Created:', data.data.members.roomId);

  //             if(!newroomID){
  //               console.log('Room Created:', data);
  //               dispatch(setnewroomID(data.data.members.roomId));}
  //         } catch (error) {
  //             console.error('Error in room create:', error);
  //         }
  //     };

  //     createRoom();
  // }, [newroomID]);

  // function ImageGalleryView(item, index) {
  //   console.log("gallery view item====================================", item);

  //   return (
  //     <TouchableOpacity
  //       style={{
  //         width: "33%",
  //         backgroundColor: "lightgray",
  //         borderWidth: 0.5,
  //         borderColor: "#fff",
  //       }}
  //       onPress={() => {}}
  //     >
  //       <Image
  //         style={{
  //           width: 200,
  //           height: 150,
  //           resizeMode: "cover",
  //         }}
  //         onError={(error) => console.log("error in uploading imageeee", error)}
  //         source={{ uri: item?.node?.image?.uri }}
  //       />

  //       <Image
  //         source={{
  //           uri: "https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png",
  //         }}
  //         style={{
  //           position: "absolute",
  //           top: 50,
  //           alignSelf: "center",
  //           height: 60,
  //           width: 60,
  //           tintColor: iconTheme().iconColorNew,
  //         }}
  //         resizeMode="contain"
  //       />
  //     </TouchableOpacity>
  //   );
  // }

  // useEffect(() => {
  //   const createRoom = async () => {
  //     try {
  //       const data = await createRoomRequest(globalThis.userChatId, [
  //         globalThis.userChatId,
  //         mainprovider?.friendId ? mainprovider?.friendId : "",
  //       ]);
  //       // console.log('Room Created:', data.data.members.roomId);

  //       if (!newroomID) {
  //         console.log("Room Created:", data);
  //         dispatch(setnewroomID(data.data.members.roomId));
  //       }
  //     } catch (error) {
  //       console.error("Error in room create:", error);
  //     }
  //   };

  //   createRoom();
  // }, [newroomID]);

  const ImageGalleryView = (item, index) => {
    // Find the index of the selected video in the selectedVideos array
    const selectedIndex = selectedVideos.findIndex(
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

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("BottomBar", { screen: "chatScreen" });
        return true; // Prevent default behavior (exiting the app)
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      // }
    }, [])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Prevent default behavior of back navigation
      e.preventDefault();
      // Navigate to "chatscreen" explicitly
      navigation.navigate("ChatScreen");
    });

    return unsubscribe;
  }, [navigation]);

  // const closeDrawer = () => {
  //   drawerRef.current.close();
  //   setDrawerGauster(false);
  // };

  // const openDrawer = () => {
  //   drawerRef.current.open();
  //   setDrawerGauster(true);
  // };

  const closeDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.close();
      setDrawerGauster(false);
    } else {
      console.warn("Cannot close drawer: drawerRef is null");
    }
  };

  const openDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.open();
      setDrawerGauster(true);
    } else {
      console.warn("Cannot open drawer: drawerRef is null");
    }
  };

  const onCloseDrawer = () => {
    setDrawerGauster(false);
  };

  const tapListenerInit = () => {
    stickerSingleTapListener = nativeEventEmitter?.addListener(
      "onStickerSingleTapped",
      (event) => {
        const stickerImg = event.stickerImg;
        onStickersPick(stickerImg);
      }
    );
  };

  useEffect(() => {
    // getRoomMembersAPI();
    GroupDetailApiFunc();
  }, [route.params.isFromPublicPage]);

  useEffect(() => {
    const fetchRoomMembers = async () => {
      if (newroomType === "multiple") {
        try {
          await getRoomMembersAPI();
        } catch (error) {
          console.error("Error fetching room members:", error);
        }
      }
    };

    fetchRoomMembers();
  }, [route.params.isFromPublicPage]);

  const getRoomMembersAPI = async () => {
    try {
      const getRoomMembersUrl = `${chatBaseUrl}${getRoomMembersApi}?roomId=${newroomID}`;

      const res = await axios({
        method: "get",
        url: getRoomMembersUrl,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${globalThis.token}`,
          localization: globalThis.selectLanguage,
        },
      });

      if (res.data?.status) {
        let count = 0;
        const groupMembers = [];
        const removedMembers = [];

        res.data.data?.members?.forEach((member) => {
          if (!member?.user?._id) {
            console.warn("Skipping member with missing user ID:", member);
            return;
          }

          const memberData = {
            roomId: res.data.data.roomId,
            chat_user_id: member.user._id,
            contact_name: member.user.name || "Unknown",
            phone_number: member.user.phone_number || "N/A",
            profile_image: member.user.image || null,
            isAdmin: member.isAdmin || false,
          };

          if (member.isRemoved === false) {
            groupMembers.push(memberData);
          } else {
            removedMembers.push(memberData);
          }
        });

        // console.log("groupMembers:", groupMembers);
        // console.log("removedMembers:", removedMembers);

        // Add members to the local database
        addMembersToRoomMembersSqlnew(groupMembers, newroomID, () => {
          count += 1;
          dispatch(updateAppState({ updatemediauseeeffect: count + 1 }));
          dispatch(updatedmembersall(groupMembers)); // Assuming `membersupdated` is `groupMembers`
        });
      } else {
        globalThis.errorMessage =
          res.data?.message || "Unexpected error occurred.";
        setErrorAlertModel(true);
      }
    } catch (error) {
      console.error("Error fetching room members:", error.message);
      globalThis.errorMessage = error.message || "Network error.";
      setErrorAlertModel(true);
    }
  };

  const GroupDetailApiFunc = async () => {
    const urlStr = chatBaseUrl + groupDetailApi + "?roomId=" + newroomID;
    const chatProfileUrl =
      chatBaseUrl + chatUserDetailApi + route.params.friendId;
    const getRoomMembersUrl =
      chatBaseUrl + getRoomMembersApi + "?roomId=" + newroomID;

    try {
      await axios({
        method: "get",
        url: newroomType == "single" ? chatProfileUrl : urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",

          Authorization: "Bearer " + globalThis.token,
          localization: globalThis.selectLanguage,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            if (newroomType == "single") {
              setuserstatus(response?.data?.data?.bio);
            } else {
              setuserstatus(response?.data?.data?.bio);
            }
          } else {
            // Alert.alert(response.data.message);
            globalThis.errorMessage = response.data.message;
            setErrorAlertModel(true);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
        });
    } catch (error) {
      setloaderMoedl(false);
    }
  };
  const tapListenerRemove = () => {
    if (stickerSingleTapListener != null) {
      stickerSingleTapListener.remove();
    }
    if (stickerDoubleTapListener != null) {
      stickerDoubleTapListener.remove();
    }
  };

  var keyboardDidShowListener: EmitterSubscription | null = null;
  var keyboardDidHideListener: EmitterSubscription | null = null;

  const keyboardListenerInit = () => {
    keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardVisible(true);
        setDrawerGauster(true);
      }
    );
    keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      (event) => {
        setKeyboardVisible(false);
        setIsStipopShowing(false);
        setDrawerGauster(false);
      }
    );
  };

  const getAllPostByuser = (ResponseData, ErrorStr) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      // setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
    } else {
      dispatch(setStorylist(ResponseData.data));
    }
  };

  const AllPostsListApi = async (chatid) => {
    return new Promise((resolve, reject) => {
      dispatch(
        setProfileData({
          Image_text: "",
          sticker_position: "",
          chat_user_id: chatid,
        })
      );
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + globalThis.Authtoken,
        localization: globalThis.selectLanguage,
      };
      const data = {
        chat_user_id: chatid,
      };

      PostApiCall(
        get_by_User_allposts,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          if (ErrorStr) {
            reject(ErrorStr);
          } else {
            getAllPostByuser(ResponseData, ErrorStr);
            resolve(ResponseData);
          }
        }
      );
    });
  };

  const AllChaneelListApi = async (chatid) => {
    if (chatid == globalThis.chatUserId) {
      getMyChannelInfo((channels, count) => {
        const reversedData = channels.reverse();

        dispatch(setChannelSliceData(reversedData));
      });
    } else {
      const urlStr = chatBaseUrl + getChannels + "?userId=" + chatid;

      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url: urlStr,
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (response.data.status === true) {
              dispatch(setChannelSliceData(response.data.data));
              resolve(response.data.data);
            } else {
              // Alert.alert(response.data.message);

              reject(response.data.message);
              globalThis.errorMessage = response.data.message;
              setErrorAlertModel(true);
            }
          })
          .catch((error) => {
            console.error("Error in AllChaneelListApi:", error);
            reject(error);
          });
      });
    }
  };

  ///////////////////////////get user data api for bottomsheet//////

  const getProfileApi = async (chatid, username, userimage) => {
    setIsLoading(true);
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    let data = {
      chat_user_id: chatid,
    };

    PostApiCall(
      get_by_ChatId,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        getapiSuccess(ResponseData, ErrorStr, username, userimage);
      }
    );
  };

  const handleApiCalls = async (chatid, username, userimage) => {
    // setloaderMoedl(true); // Start loader

    try {
      // Use Promise.all to wait for all API calls to complete
      await Promise.all([
        getProfileApi(chatid, username, userimage),
        AllPostsListApi(chatid),
        AllChaneelListApi(chatid),
      ]);
    } catch (error) {
      setloaderMoedl(false);
      console.error("Error in one of the API calls:", error);
      // Alert.alert("Error", "An error occurred while fetching data.");
      globalThis.errorMessage = "An error occurred while fetching data.";
      setErrorAlertModel(true);
    } finally {
      setloaderMoedl(false); // Stop loader after all API calls are done
    }
  };

  const getapiSuccess = (ResponseData, ErrorStr, username, userimage) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setIsLoading(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      // Navigate to another screen or handle the error in some way
    } else {
      const userData = ResponseData.data.user;
      const imageText = JSON.parse(userData.Image_text);
      const stickerPosition = JSON.parse(userData.sticker_position);
      dispatch(
        setProfileData({
          ...userData,
          Image_text: imageText,
          sticker_position: stickerPosition,
          display_name: username,
          profile_image: ResponseData?.data?.user?.profile_image,
          userProfile: ResponseData?.data?.user?.profile_image,
        })
      );
      UpdateProfileImage(
        ResponseData?.data?.user?.chat_user_id,
        ResponseData?.data?.user?.profile_image,
        (res) => {
          if (res) {
            console.log("profile image updated successfully");
          } else {
            console.log("profile image can't be updated.");
          }
        }
      );

      handlePresentModalPress();
      setIsLoading(false);
    }
  };
  //////////////////////////////////////////////////////////////////

  const onStickersPick = async (imageUrl) => {
    const linkUri = imageUrl;
    const mId = Math.floor(Math.random() * 9000) + 1000;
    const paramsOfSend = {
      mId: mId,
      roomId: newroomID,
      fromUser: globalThis.userChatId,
      userName: globalThis.displayName,
      currentUserPhoneNumber: globalThis.phone_number,
      message: "",
      message_type: "sticker",
      attachment: [linkUri],
      isBroadcastMessage: false,
      isDeletedForAll: false,
      parent_message: {},
      isForwarded: false,
      storyId: "",
      isStoryRemoved: false,
      resId: chatMessageTime,
      broadcastMessageId: "",
      seenCount: 0,
      deliveredCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(
      "before insert chatlist====================================",
      paramsOfSend
    );

    insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });
    onSend([
      {
        resId: chatMessageTime,
        text: "",
        messageType: "sticker",
        _id: mId,
        messageId: "",
        system: false,
        status: "",
        createdAt: new Date(),
        isForwarded: false,
        image: [linkUri],
        video: [],
        audio: [],
        attachment: [linkUri],
        isDeletedForAll: false,
        parent_message: {},
        user: { _id: globalThis.userChatId },
        unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
      },
    ]);
    const paramsOfSendforlive = {
      mId: mId,
      userName: globalThis.displayName,
      phoneNumber: globalThis.phone_number,
      currentUserPhoneNumber: globalThis.phone_number,
      userImage: globalThis.image,
      roomId: newroomID,
      roomName: mainprovider?.userName,
      roomImage: mainprovider?.userImage,
      roomType: mainprovider?.roomType,
      roomOwnerId: globalThis.userChatId,
      message: "",
      message_type: "sticker",
      roomMembers:
        mainprovider?.roomType !== "single"
          ? []
          : [
              mainprovider?.friendId && mainprovider?.friendId != 0
                ? mainprovider?.friendId
                : "",
            ],
      parent_message_id: "",
      attachment: [linkUri],
      from: globalThis.userChatId,
      resId: chatMessageTime,
      createdAt: new Date(),
    };

    socket.emit("sendmessage", paramsOfSendforlive);

    console.log("paramsOfSendforlive", paramsOfSendforlive);
  };

  const keyboardListenerRemove = () => {
    if (keyboardDidHideListener != null) {
      keyboardDidHideListener.remove();
    }
    if (keyboardDidShowListener != null) {
      keyboardDidShowListener.remove();
    }
  };

  async function onsendallmessage() {
    if (route.params.screenFrom == "NewChatScreen" && messages.length > 1) {
      handleButtonPress("Chat Start With Friend");
    }

    if (messageInput.trim() === "") {
      // Optionally, you can add a check to prevent sending empty messages.
      return;
    }
    // let messageSend;
    // try {
    //   messageSend = CryptoJS.AES.encrypt(
    //     messageInput,
    //     EncryptionKey
    //   ).toString();
    //   console.log("Encrypted Message:", messageSend);
    // } catch (encryptionError) {
    //   console.error("Error during message encryption:", encryptionError);
    //   return; // Exit if encryption fails
    // }

    /////////////with new key///////////////////////
    let messageSend;
    try {
      // Try encrypting the message
      messageSend = encryptMessage(newroomID, messageInput);
      if (!messageSend) {
        console.error("Message encryption failed.");
        return;
      }
      console.log("Encrypted Message by new key:", messageSend);
    } catch (encryptionError) {
      console.error("Error during message encryption:", encryptionError);
      return; // Exit if encryption fails
    }

    setMessageInput(""); // Clear the message input field after sending
    if (newroomID) {
      removeCount(newroomID);
    }

    const mId = Math.floor(Math.random() * 9000) + 1000;

    const paramsOfSend = {
      mId: mId,
      roomId: newroomID,
      fromUser: globalThis.userChatId,
      userName: globalThis.displayName,
      phoneNumber: Number(globalThis.phone_number.substr(-10)),
      currentUserPhoneNumber: globalThis.phone_number,
      message: messageSend,
      message_type: "text",
      attachment: [],
      isBroadcastMessage: false,
      isDeletedForAll: false,
      parent_message: messageClickd ? messageClickd : {},
      isForwarded: false,
      storyId: "",
      isStoryRemoved: false,
      resId: chatMessageTime,
      broadcastMessageId: "",
      seenCount: 0,
      deliveredCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      disappearTime: disappearmsgchecked ? disappeartime : 0,
      shouldDisappear: disappearmsgchecked ? 1 : 0,
      unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
    };

    console.log(
      "before insert chatlist====================================",
      paramsOfSend
    );

    insertChatList({
      paramsOfSend: paramsOfSend,
      chatRoom: true,
    });

    const paramsOfSendlive = {
      mId: mId,
      isNotificationAllowed: isnewmute ? isnewmute : true,
      userName: globalThis.displayName,
      phoneNumber: Number(globalThis.phone_number.substr(-10)),
      currentUserPhoneNumber: globalThis.phone_number,
      userImage: globalThis.image,
      roomId: newroomID,
      roomName: mainprovider?.userName,
      roomImage: mainprovider?.userImage,
      roomType: mainprovider?.roomType,
      roomOwnerId: globalThis.userChatId,
      message: messageSend,
      message_type: "text",
      roomMembers:
        mainprovider?.roomType !== "single"
          ? []
          : [
              mainprovider?.friendId && mainprovider?.friendId != 0
                ? mainprovider?.friendId
                : "",
            ],
      isForwarded: false,
      attachment: [],
      from: globalThis.userChatId,
      resId: chatMessageTime,
      status: "",
      parent_message_id:
        showReplyMessage == true
          ? messageClickd.messageId || messageClickd._id
          : "",
      parent_message: messageClickd ? messageClickd : {},
      createdAt: new Date(),
      isDeletedForAll: false,
      shouldDisappear: disappearmsgchecked,
      disappearTime: disappearmsgchecked ? disappeartime : 0,
    };

    console.log(
      "paramsOfSendlive====================================",
      paramsOfSendlive
    );

    socket.emit("sendmessage", paramsOfSendlive);

    onSend([
      {
        resId: chatMessageTime,
        text: messageInput,
        messageType: "text",
        _id: mId,
        messageId: "",
        system: false,
        status: "",
        isForwarded: false,
        parent_message: messageClickd ? messageClickd : {},
        createdAt: new Date(),
        isDeletedForAll: false,
        image: [],
        video: [],

        user: { _id: globalThis.userChatId },
        unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
        shouldDisappear: disappearmsgchecked,
        disappearMsgTime: disappearmsgchecked
          ? Date.now() + disappeartime * 60000
          : 0,
      },
    ]);

    setMessageClicked({}); // Clear the message input field after sending
    setShowReplyMessage(false);
  }

  useEffect(() => {
    CheckIsRoomBlocked(route.params.friendId, (isblocked) => {
      setIsRoomBlocked(isblocked);
    });
  }, []);

  useEffect(() => {
    keyboardListenerInit();
    return () => {
      keyboardListenerRemove();
    };
  }, []);

  useEffect(() => {
    const deleteFunction = (data) => {
      if (data.roomId == newroomID) {
        navigation.navigate("ChatScreen");
      }
    };
    socket.on("group-delete", deleteFunction);
    return () => {
      socket.off("group-delete", deleteFunction);
    };
  });

  //code by-dinki
  async function OpenPreview(item) {
    const validAttachments = [];

    for (const attach of item.localPaths) {
      const file = attach;
      let mediaName = attach.split("/").pop();
      let mediaId = mediaName.split(".").slice(0, -1).join(".");
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
        validAttachments.push(destinationPath);
      } else {
        validAttachments.push(blurImage);
      }
    }

    if (validAttachments.length > 0) {
      setmylocaldata({
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

  useEffect(() => {
    const hideFunction = (data) => {
      if (data.roomId == newroomID) {
        navigation.navigate("ChatScreen");
      }
    };
    socket.on("group-hide", hideFunction);
    return () => {
      socket.off("group-hide", hideFunction);
    };
  });

  useEffect(() => {
    StipopModule.connect(globalThis.userChatId);
    tapListenerInit();

    return () => {
      tapListenerRemove();
    };
  }, [globalThis.userChatId]);

  const path = Platform.select({
    ios: undefined,
    android: undefined,
  });

  const [audioRecorderPlayer, setAudioRecorderPlayer] = useState(
    new AudioRecorderPlayer()
  );

  audioRecorderPlayer.setSubscriptionDuration(0.1);

  useEffect(() => {
    return () => {
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  useEffect(() => {
    const { routes } = navigation.getState();
    const filteredRouts = routes.filter((route) => {
      return (
        route.name !== "NewBroadcastScreen" &&
        route.name !== "CreateBroadcastScreen"
      );
    });
    navigation.reset({
      index: filteredRouts.length - 1,
      routes: filteredRouts,
    });
  }, []);

  useEffect(() => {
    // Create a Set to store unique indices
    const uniqueIndices = new Set();

    // Iterate through messages to find highlighted occurrences
    messages.forEach((message, index) => {
      if (searchTermtext && searchTermtext.trim() !== "") {
        const isHighlighted = message.text
          .toLowerCase()
          .includes(searchTermtext.toLowerCase());
        if (isHighlighted) {
          uniqueIndices.add(index); // Add the index to the Set
        }
      }
    });

    // Convert the Set back to an array and update the state
    setHighlightedIndices(Array.from(uniqueIndices));
  }, [searchTermtext, messages]);

  const searchmessagefunction = (index) => {
    if (chatListRef.current) {
      chatListRef.current?.scrollToIndex({
        animated: true,
        index: index,
        viewPosition: 0.5,
      });
    } else {
      console.warn(`Invalid index: ${ISATTOP}. Message not found.`);
      // Handle the scenario where the message index is invalid
      // You can display an error message or handle it according to your app's requirements
    }
  };

  useEffect(() => {
    if (chatListRef.current) {
      setmessagerefin(chatListRef.current);
    }
  }, [chatListRef]);

  const scrolltoparentmessage = (idToScroll) => {
    const index = messages.findIndex(
      (message) => message.messageId === idToScroll
    );
    if (index !== -1 && messagerefin) {
      messagerefin?.scrollToIndex({
        animated: true,
        index: index,
        viewPosition: 0.5,
      });
    } else {
      console.warn(`Invalid index: ${index}. Message not found.`);
      // Handle the scenario where the message index is invalid
      // You can display an error message or handle it according to your app's requirements
    }
  };

  // Function to handle scrolling to the previous highlighted message
  const scrollToPreviousHighlightedMessage = () => {
    if (currentHighlightedIndex > 0) {
      // Decrement the current index to navigate to the previous highlighted message
      const previousIndex =
        highlightedIndices && highlightedIndices[currentHighlightedIndex - 1];
      // Scroll to the previous highlighted message
      searchmessagefunction(previousIndex);
      // Update the currentHighlightedIndex state to the new index
      setCurrentHighlightedIndex(currentHighlightedIndex - 1);
    }
  };

  // Function to handle scrolling to the next highlighted message
  const scrollToNextHighlightedMessage = () => {
    if (currentHighlightedIndex < highlightedIndices.length - 1) {
      // Increment the current index to navigate to the next highlighted message
      const nextIndex =
        highlightedIndices && highlightedIndices[currentHighlightedIndex + 1];
      // Scroll to the next highlighted message
      searchmessagefunction(nextIndex);
      // Update the currentHighlightedIndex state to the new index
      setCurrentHighlightedIndex(currentHighlightedIndex + 1);
    }
  };

  function messageDelAndDis(ids) {
    if (ids.length) {
      clearMessages(ids, (res) => {
        if (res) {
          socket.emit("messageDisappear", {
            messageId: ids,
            userId: globalThis.userChatId,
          });
        }
      });
    }
  }

  React.useEffect(() => {
    console.log(
      "newroomID chatting====================================",
      newroomID
    );

    if (newroomID) {
      getChats(newroomID);
      if (!route.params.isFromPublicPage) {
        // setisloadearly(true);
      }
      getAllChatTableData(
        "Chatmessages",
        newroomID,
        SKIP,
        LIMIT,
        mainprovider.roomType,
        (data: []) => {
          messageDelAndDis(data.disapperIds);

          if (data.temp.length > 0) {
            setisloadearly(false);
            setSkip(LIMIT + SKIP);

            // Remove messages from messages state that have same _id as any messages in data.temp
            const filteredMessages = messages.filter(
              (message) =>
                message._id !== 1 && // Filter out messages with _id === 1
                !data.temp.some(
                  (newMessage) => newMessage.resId === message.resId
                )
            );

            // Concatenate filtered messages with new messages from data.temp
            const newMessages = [...filteredMessages, ...data.temp];
            // console.log("newMessages==========", newMessages);

            // Update messages state
            setMessages(newMessages);
          } else {
            setMessages([
              {
                _id: 1,
                resId: 1,
                messageType: "systemmessage",
                text: t("messages_and_calls_end-to-end_encrypted"),
                createdAt: new Date(),
                system: true,
              },
            ]);
            setisloadearly(false);
          }
        }
      );

      // getMembersFromRoomMembersSql(newroomID, async (res) => {
      //
      //   const currentUser = res.find((u) => u.userId == globalThis.chatUserId);
      //   setCurrentUserData(currentUser);

      //   setMentionSuggestions(res);
      //   setMentionSuggestionsold(res);
      // });
    } else {
      setMessages([
        {
          _id: 1,
          resId: 1,
          messageType: "systemmessage",
          text: t("messages_and_calls_end-to-end_encrypted"),
          createdAt: new Date(),
          system: true,
        },
      ]);
    }
  }, [newroomID, syncchatpn]);

  useEffect(() => {
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDots();
  }, [dotOpacity]);

  //*****************GET TOTAL MEMBERS NUMBER */

  React.useEffect(() => {
    socket.on("connect_error", (error) => {
      socket.connect;
    });
  }, [socket]);

  //route.params
  useEffect(() => {
    if (route.params.inside == true) {
      dispatch(
        setMainprovider({
          ...mainprovider,
          allow: route?.params?.room?.allow,
          isnewblock: route?.params?.isBlock,
          owner: route?.params?.room?.owner,
        })
      );
      socket.emit("joinRoom", {
        roomId: newroomID,
        userId: globalThis.userChatId,
      });
    } else {
      dispatch(
        setMainprovider({
          ...mainprovider,
          allow: "public",
          isnewblock: false,
          owner: globalThis.userChatId,
        })
      );
    }
  }, []);

  useEffect(() => {
    if (showReplyMessage && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showReplyMessage]);

  const callState = useSelector(
    (state) => state?.VoipReducer?.call_state || {}
  );

  const buttonPress = () => {
    if (newroomID) {
      if (!isnewblock) {
        setstopgifsend(false);
        navigation.navigate("ContactPageScreen", {
          isMute: route.params.isMute,
          isHide: route.params.isHide,
          isLockchat: route.params.isLock,
          isBlock: route.params.isBlock,
          friendId: route.params.friendId,
          aliasName: route.params.aliasName,
          aliasImage: route.params.aliasImage,
          isLock: route.params.isLock,
          isUserPremium: route?.params?.isUserPremium,
          isDiamonds: route?.params?.isDiamonds,
          fromScreen: "ChattingScreen",
        });
      }
    } else {
      dispatch(setProfileData(roominfo));
      navigation.navigate("UserProfile", {
        roomname: roominfo.roomName,
        roomimage: roominfo.roomImage,
        friendId: route.params.friendId,
      });
    }
  };

  const participantListData = () => {
    setstopgifsend(false);
    navigation.navigate("ContactPageScreen", {
      isMute: route.params.isMute,
      isHide: route.params.isHide,
      isLockchat: route.params.isLock,
      isBlock: route.params.isBlock,
      friendId: route.params.friendId,
      aliasName: route.params.aliasName,
      aliasImage: route.params.aliasImage,
      isLock: route.params.isLock,
      fromScreen: "SideManu",
    });
  };

  useEffect(() => {
    const handleconnect = () => {
      if (globalThis.userChatId) {
        socket.emit("join", { id: globalThis.userChatId });
      }

      socket.emit("joinRoom", {
        roomId: newroomID,
        userId: globalThis.userChatId,
      });
    };

    socket.on("connect", handleconnect);
    return () => {
      socket.off("connect", handleconnect);
    };
  }, []);

  useEffect(() => {
    const handleTyping = (typingData) => {
      if (typingData.result.roomId == newroomID && !isRoomBlocked) {
        if (typingData.result.userId != globalThis.chatUserId) {
          setWhotype(typingData.result.name + " is typing...");
        }
      }
    };
    socket.on("typing", handleTyping);
    setInterval(() => {
      setWhotype("");
    }, 5000);
    return () => {
      socket.off("typing", handleTyping);
    };
  }, [newroomID, whotype]);

  useEffect(() => {
    if (mainprovider?.friendId) {
      getUserData();
    }
  }, [mainprovider]);

  useEffect(() => {
    const handleCountManage = async (seenMessage) => {
      if (seenMessage.roomId == newroomID) {
        setSeenCount(
          seenMessage.roomId,
          seenMessage.lastInfoId,
          seenMessage.requestBy,
          (data) => {
            if (
              Object.entries(seenMessage).length &&
              seenMessage.roomId == newroomID
            ) {
              setMessages((previousMessages) => {
                let isGet = 0;
                return previousMessages.map((p) => {
                  if (p.messageId === seenMessage.lastInfoId) isGet = 1;

                  if (p.user?._id !== seenMessage.requestBy && isGet === 0) {
                    if (p.unreadCount > 0) {
                      p.unreadCount = p.unreadCount - 1;
                    }
                  }
                  return p;
                });
              });
            }
          }
        );
      }
    };

    socket.on("seenCountMark", handleCountManage);
    return () => {
      socket.off("seenCountMark", handleCountManage);
    };
  });

  ////////////////lock chat functions/////////////////////

  useEffect(() => {
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        isDeviceVerified = true;
      }
    });
  }, []);

  useEffect(() => {
    getChatLockdata();
  }, [isFocused]);

  const setPinApi = (chatPin) => {
    let url = Base_Url + setpin;
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",

          Authorization: "Bearer " + globalThis.token,
        },
        data: {
          chat_pin: chatPin,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
          } else {
          }
        })
        .catch((error) => {});
    } catch (error) {}
  };

  const getChatLockdata = async () => {
    const chatLockPin = JSON.parse(
      await AsyncStorage.getItem("lockChatPinCode")
    );
    const chatLockusernumber = await AsyncStorage.getItem("chatlockusernumber");

    setChatLockNumber(chatLockusernumber);
    setVerifyPin(chatLockPin);
  };

  async function signIn() {
    const number = chatLockNumber;
    try {
      const confirmation = await auth().signInWithPhoneNumber(
        number.toString()
      );
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setConfirm(confirmation);
    } catch (error) {}
  }

  const handleGeneratePinEntered = (generatePin) => {
    const filteredArray = generatePin.filter((value) => value !== "");
    setGeneratePin(filteredArray.join("")); // Update the pin state
  };

  const handleConfirmPinEntered = (confirmpin) => {
    const filteredArray = confirmpin.filter((value) => value !== "");
    setConfirmPin(filteredArray.join("")); // Update the pin state
  };

  const handleUnlockPinEntered = (unlockpin) => {
    const filteredArray = unlockpin.filter((value) => value !== "");
    setUnlockPin(filteredArray.join("")); // Update the pin state
  };

  const handleVerifyOtp = (otp) => {
    const filteredArray = otp.filter((value) => value !== "");
    setOtp(filteredArray.join("")); // Update the pin state
  };

  const forgetPin = () => {
    signIn();
    setPinModalVisible(false);
    setOtpModalVisible(true);
  };

  const verifyOtpSubmit = async () => {
    try {
      if (otp.length === 6) {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        const response = await confirm.confirm(otp);
        if (response.user?.uid) {
          setOtpModalVisible(false);
          setGeneratePinModalVisible(true);
        }
      } else {
        setOtp("");
        // Alert.alert("Error", "Enter a valid 6-digit OTP.");
        globalThis.errorMessage = "Enter a valid 6-digit OTP.";
        setErrorAlertModel(true);
      }
    } catch (error) {
      if (error.code === "auth/invalid-verification-code") {
        // Alert.alert("", "Invalid OTP, Please try again");
        globalThis.errorMessage = "Invalid OTP, Please try again";
        setErrorAlertModel(true);
      } else if (error.code === "auth/code-expired") {
        // Alert.alert("", "OTP has expired, please request a new one");
        globalThis.errorMessage = "OTP has expired, please request a new one";
        setErrorAlertModel(true);
      } else {
        if (isDeviceVerified == true && Platform.OS == "android") {
          isDeviceVerified = false;
          setOtpModalVisible(false);
          setGeneratePinModalVisible(true);
        } else {
          // Alert.alert("Error", "Enter a valid 6-digit OTP.");
          globalThis.errorMessage = "Enter a valid 6-digit OTP.";
          setErrorAlertModel(true);
        }
      }
    }
  };

  const generatePinSubmit = () => {
    if (generatePin.length === 4) {
      setGeneratePinModalVisible(false);
      setConfirmPinModalVisible(true);
    } else {
      // Alert.alert("Error", "Enter a valid 4-digit PIN");
      globalThis.errorMessage = "Enter a valid 4-digit PIN";
      setErrorAlertModel(true);
    }
  };

  const confirmPinSubmit = async () => {
    // Use === instead of ==
    if (generatePin == confirmPin) {
      setPinApi(confirmPin);
      await AsyncStorage.setItem("lockChatPinCode", JSON.stringify(confirmPin));
      showToast(t("Your_chat_has_been_locked"));
      setConfirmPinModalVisible(false);
      lockChat(newroomID, lockValue, (res) => {
        if (res) {
          socket.emit("changeLockStatus", {
            room: newroomID,
            user: globalThis.chatUserId,
            lock: lockValue,
          });
          dispatch(setisLock(!isLock));
          setloaderMoedl(false);
        } else {
          setloaderMoedl(false);
        }
      });
    } else {
      // Alert.alert("Error", "Your pin and confirm pin does not match.");
      globalThis.errorMessage = "Your pin and confirm pin does not match.";
      setErrorAlertModel(true);
    }
  };

  const unlockPinSubmit = () => {
    // Use === instead of ==
    if (unlockPin == verifyPin) {
      lockChat(newroomID, lockValue, (res) => {
        if (res) {
          socket.emit("changeLockStatus", {
            room: newroomID,
            user: globalThis.chatUserId,
            lock: lockValue,
          });
          dispatch(setisLock(!isLock));
          setloaderMoedl(false);
        } else {
          setloaderMoedl(false);
        }
        setloaderMoedl(false);
      });
      setPinModalVisible(false);
      setUnlockPin("");
      setConfirmPin("");
    } else {
      setloaderMoedl(false);
      // Alert.alert("Error", "Enter a valid 4-digit PIN.");
      globalThis.errorMessage = "Enter a valid 4-digit PIN.";
      setErrorAlertModel(true);
    }
  };

  const closeModal = () => {
    if (route?.params.screenFrom == "Dashboard") {
      navigation.navigate("ChatScreen");
      setPinModalVisible(false);
      setUnlockPin("");
      setOtp("");
      setGeneratePin("");
      setConfirmPin("");
    } else {
      setPinModalVisible(false);
      setUnlockPin("");
      setOtp("");
      setGeneratePin("");
      setConfirmPin("");
    }
  };

  const close = () => {
    if (route?.params.screenFrom == "Dashboard") {
      navigation.navigate("ChatScreen");
      setPinModalVisible(false);
      setOtpModalVisible(false);
      setGeneratePinModalVisible(false);
      setConfirmPinModalVisible(false);
      setUnlockPin("");
      setOtp("");
      setGeneratePin("");
      setConfirmPin("");
    } else {
      setPinModalVisible(false);
      setOtpModalVisible(false);
      setGeneratePinModalVisible(false);
      setConfirmPinModalVisible(false);
      setUnlockPin("");
      setOtp("");
      setGeneratePin("");
      setConfirmPin("");
    }
  };

  //////////////////////////////////////////////////////////
  const getUserData = async () => {
    let url = Base_Url + "user/users/get-by-chat-id";
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",

          Authorization: "Bearer " + globalThis.token,
        },
        data: {
          chat_user_id: mainprovider.friendId,
        },
      })
        .then((response) => {
          console.log("responseresponseresponse====", response.data);

          if (response.data.status == true) {
            calling_userID = response.data.data.user.id;
            console.log(
              "calling_userID====================================",
              calling_userID
            );
          } else {
          }
        })
        .catch((error) => {
          console.log(
            "calling_userID error====================================",
            error
          );
        });
    } catch (error) {
      console.log(
        "calling_userID second error====================================",
        error
      );
    }
  };

  useEffect(() => {
    const deletemessssggggggg = async (deleteMessage) => {
      let data = deleteMessage.result;

      if (deleteMessage?.isDeletedForAll) {
        // const messageSend = CryptoJS.AES.encrypt(
        //   t("This_message_was_deleted"),
        //   EncryptionKey
        // ).toString();

        const messageSend = encryptMessage(
          newroomID,
          t("This_message_was_deleted")
        );
        await updatedeleteforall(messageSend, data, (data) => {
          if (data) {
            getAllChatTableData(
              "table_user",
              newroomID,
              0,
              0,
              mainprovider.roomType,
              (data) => {
                messageDelAndDis(data.disapperIds);
                if (data.temp.length > 0) {
                  setMessages(data.temp);
                } else {
                }
              }
            );
          }
        });
      }
    };

    socket.on("deleteMessage", deletemessssggggggg);
    return () => {
      socket.off("deleteMessage", deletemessssggggggg);
    };
  });

  useFocusEffect(
    React.useCallback(() => {
      if (newroomID) {
        globalThis.activeRoomId = newroomID;
        getRoomBackgroundByRoomId(newroomID, (roomData) => {
          if (roomData) {
            setmygroupimg(roomData);
          } else {
            setmygroupimg({});
          }
        });
        // getTotalMembers(newroomID, (res) => {
        //   if (res) {
        //     TOTALMEM = res;
        //   }
        // });
      }
    }, [newroomID])
  );

  useEffect(() => {
    if (callState.state != "outgoing") {
      stopSound();
    }
  }, [callState.state]);

  useEffect(() => {
    if (soundInstance) {
      soundInstance.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (soundInstance) {
      soundInstance.setVolume(volume);
    }
  }, [volume]);

  const stopSound = () => {
    if (soundInstance) {
      soundInstance.stop();
      soundInstance.release();
      setSoundInstance(null);
      setIsPlaying(false);
    }
  };

  const onSend = useCallback((newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  }, []);

  function ToclickOnImageIcon() {
    setattachmentformate("image");
    setSendItems(false);
    setCameraModal(true);
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
        const result = await DocumentPicker.pick({
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
        const result = await DocumentPicker.pick({
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

  useFocusEffect(
    useCallback(() => {
      globalThis.isChatDetailOpen = "yes";
      // Add your code here to handle the screen being viewed
      // Cleanup function
      return () => {
        globalThis.isChatDetailOpen = "no";
        // Add your code here to handle the screen not being viewed
      };
    }, [])
  );

  //////////////////////////pick-audio-from modal///////////////////////////////////////////////////////////////////
  const pickAudio = async () => {
    setattachmentformate("audio");
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });

      setSendItems(false);
      setCameraModal(false);
      Keyboard.dismiss();
      setallattachment(result);
      BucketUploadFile(result, "audio");
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  //media-donload work -dinki
  useEffect(() => {
    const checkLocalPaths = () => {
      messages.forEach(async (message, index) => {
        if (message.localPaths && message.localPaths.length > 0) {
          await checkIfFilesExist(message, index);
        }
        // if (index == messages.length - 1) {
        //   setPageLoader(false)
        // }
      });
    };

    const checkIfFilesExist = async (message, messageIndex) => {
      try {
        let updatedLocalPaths = [];
        let isLocalPathUpdated = false;

        // for (let i = 0; i < message.localPaths.length; i++) {
        for await (let item of message.localPaths) {
          // const item = message.localPaths[i];
          let mediaName = item.split("/").pop();

          let mediaId = mediaName.split(".").slice(0, -1).join(".");

          const filename =
            message.messageType == "image"
              ? `${mediaId}.jpg`
              : message.messageType == "video"
              ? `${mediaName}`
              : message.messageType == "audio"
              ? `${mediaName}`
              : `${mediaName}`; // Assuming it's an image, modify according to your logic
          const encoded = encodeURIComponent(filename);

          // Determine the subdirectory based on the message type
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
            updatedLocalPaths.push(item);
          } else {
            let newPath = "";
            if (message.messageType == "image") {
              newPath = blurImage;
            } else if (message.messageType == "video") {
              newPath = blurVideo;
            }

            updatedLocalPaths.push(newPath);
            replaceLocalPathInChatMessages(
              message.messageId,
              item,
              newPath,
              (success) => {
                isLocalPathUpdated = success;
              }
            );
          }
        }

        if (isLocalPathUpdated) {
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[messageIndex].localPaths = updatedLocalPaths;
            return newMessages;
          });
          isLocalPathUpdated = false;
        }
      } catch (error) {
        console.log("error : ", error);
      }

      // Update the message's localPaths if it has been modified

      // messages[messageIndex].localPaths = updatedLocalPaths;
    };

    checkLocalPaths();
  }, [messages]);

  //for media download -dinki
  function MediaUpdated(messageId, pathsArray) {
    // Find the index of the object in the messages array with the given messageId
    const itemToUpdateIndex = messages.findIndex(
      (item) => item.messageId === messageId
    );

    if (itemToUpdateIndex === -1) {
      return;
    }

    // Create a copy of the messages array
    const newMessages = [...messages];

    // Update the localPaths array with the new paths
    newMessages[itemToUpdateIndex] = {
      ...newMessages[itemToUpdateIndex],
      localPaths: pathsArray,
    };

    dispatch(
      updateMediaLoader({
        messageId: messageId,
        isMediaLoader: false,
      })
    );
    // Set the updated messages array
    setMessages(newMessages);
    let countRed = updateMediacount + 1;
    dispatch(updateAppState({ updateMediaFunction: countRed + 1 }));
  }

  async function OnChatModalTextClick(value) {
    if (value == "Cancel") {
      setMessageClickedId("");
      setMessageClicked({});
      setreactmsgon(false);
    } else if (value == "Delete") {
      const params = {
        userId: globalThis.userChatId,
        messageId: selectedMessageId,
        delete_type: "me",
        message_type: newroomType,
        roomId: newroomID,
      };

      await deleteMessageByResId(selectedMessageId, newroomType);

      socket.emit("deleteMessage", params);
      getAllChatTableData(
        "table_user",
        newroomID,
        0,
        0,
        mainprovider.roomType,
        (data) => {
          messageDelAndDis(data.disapperIds);
          if (data.temp.length > 0) {
            setMessages(data.temp);
          } else {
            dispatch(updatedmembersall(membersupdated));
            // getMembersFromRoomMembersSql(newroomID, async (res) => {
            //
            //   const currentUser = res.find(
            //     (u) => u.userId == globalThis.chatUserId
            //   );
            //   setCurrentUserData(currentUser);
            //   setMentionSuggestions(res);
            //   setMentionSuggestionsold(res);
            // });
          }
        }
      );
      setismultidelete(false);
      setSelectedMessageId([]);
      setothermessagearray([]);
      setMessageClickedId("");
      setMessageClicked({});
      let countRed = updateMediacount + 1;
      dispatch(updateAppState({ updateMediaFunction: countRed + 1 }));
      setreactmsgon(false);
    } else if (value == "Delete for all") {
      const params = {
        userId: globalThis.userChatId,
        messageId: selectedMessageId,
        delete_type: "all",
        message_type: newroomType,
        roomId: newroomID,
      };

      // const messageSend = CryptoJS.AES.encrypt(
      //   "This message was deleted.",
      //   EncryptionKey
      // ).toString();

      const messageSend = encryptMessage(
        newroomID,
        "This message was deleted."
      );
      await updatedeleteforall(messageSend, selectedMessageId);

      socket.emit("deleteMessage", params);
      getAllChatTableData(
        "table_user",
        newroomID,
        0,
        0,
        mainprovider.roomType,
        (data) => {
          messageDelAndDis(data.disapperIds);
          if (data.temp.length > 0) {
            let countRed = updateMediacount + 1;
            dispatch(updateAppState({ updateMediaFunction: countRed + 1 }));
            setMessages(data.temp);
          }
        }
      );
      setismultidelete(false);
      setSelectedMessageId([]);
      setothermessagearray([]);
      setMessageClickedId("");
      setMessageClicked({});
      setreactmsgon(false);
    } else if (value == "Forward") {
      navigation.navigate("ForwardMessageScreen", {
        messageId: messageClickedId,
        rcvmsg: messageClickd,
        room_type: newroomType,
      });
      setMessageClickedId("");
      setMessageClicked({});
      setreactmsgon(false);
    } else if (value == "Reply") {
      setreactmsgon(false);
      setShowReplyMessage(true);
    } else if (value == "Report") {
      setreactmsgon(false);
      setReportModal(true);
    }
  }

  const handleTranslateClick = (message) => {
    setTranslateClicked(message);
    setlanguageModel(true);
  };

  useEffect(() => {
    if (mainprovider.FriendNumber) {
      getRoomIdFromRes(
        String(mainprovider.FriendNumber),
        String(globalThis.phone_number),
        async (res) => {
          if (res) {
            socket.emit("joinRoom", {
              roomId: res.roomId,

              userId: globalThis.userChatId,
            });

            getIsLock(res.roomId, (data) => {
              if (data == 1 && route?.params.screenFrom == "Dashboard") {
                setPinModalVisible(true);
              }
              dispatch(setisLock(data));
            });

            getOtherPersonLastMessage(
              res.roomId,
              globalThis.userChatId,
              (isFound: boolean, lastMessageId: string) => {
                if (isFound) {
                  socket.emit("seenCountMark", {
                    userId: globalThis.userChatId,
                    messageId: lastMessageId,
                  });

                  updateRoomUnseenCount(res.roomId, 0);
                }
              }
            );

            dispatch(
              setMainprovider({
                ...mainprovider,
                userImage: res.roomImage,
                room: res,
                roomType: res.roomType,
                friendId: res.friendId,
                lastMessageId: res.lastMessageId,
                isBlock: res.isUserExitedFromGroup,
                userId: res.friendId,
                allow: res.allow,
                owner: res.owner,
                isnewblock: res.isBlock,
              })
            );
            dispatch(setnewroomID(res?.roomId));
            dispatch(setisnewBlock(res.isUserExitedFromGroup));
            dispatch(setisnewmMute(res.isNotificationAllowed));
            dispatch(setisnewArchiveroom(res.archive));
          } else {
            if (!newroomID) {
              console.log("No existing room found, creating a new room...");

              const friendId = mainprovider?.friendId || ""; // cleaner way to handle this

              try {
                const response = await createRoomRequest(
                  globalThis.userChatId,
                  [friendId]
                );

                const roomId = response?.data?.members?.roomId;
                console.log("New room created with ID:", roomId);

                if (roomId) {
                  dispatch(setnewroomID(roomId));
                } else {
                  console.warn(
                    "Room creation response missing roomId",
                    response
                  );
                }
              } catch (error) {
                console.error("Failed to create room:", error);
              }
            }
          }
        }
      );
    }
  }, [mainprovider.FriendNumber]);

  //function changed by dinki for media download
  const updateMessageStatus = async (newData) => {
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

        // const file = attach;
        let mediaName = attach.split("/").pop();
        const mediaId = mediaName.split(".").slice(0, -1).join(".");

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

          pathsArray = Object.keys(pathObj)
            .sort()
            .map((key) => pathObj[key]);
          // MediaUpdated(props.messageId, pathsArray);
        }
      }
    }
    setMessages((previousMessages) => {
      const index = previousMessages.findIndex(
        (aMessage) => aMessage.resId === newData.resId
      );
      const newArr = [...previousMessages];
      if (index !== -1) {
        newArr[index] = {
          ...newArr[index], // Maintain other properties
          status: "sent", // Update the status key
          messageId: newData._id,
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
        };
      }
      return newArr;
    });
    const countRed = updateMediacount + 1;
    dispatch(updateAppState({ updateMediaFunction: countRed }));
  };

  //by-dinki
  function MediaUpdatedOnSame(messageId, Arr, result) {
    let userName = "Tokee User";
    userName = result.userName;
    let userObject = {
      _id:
        result.message_type == "notify" ||
        result.message_type == "broadcast_notify" ||
        result.messageType == "broadcast_notify" ||
        result.messageType == "notify"
          ? globalThis.userChatId
          : result.fromUser,
      name: userName,
    };
    if (result.roomType == "single") {
      userObject = { _id: result.fromUser, name: userName };
    }

    onSend([
      {
        // text: CryptoJS.AES.decrypt(result.message, EncryptionKey).toString(
        //   CryptoJS.enc.Utf8
        // ),
        text: decryptMessage(newroomID, result.message),
        resId: result.resId,
        messageType: result.message_type,
        system:
          result.message_type == "notify" ||
          result.message_type == "broadcast_notify" ||
          result.messageType == "broadcast_notify" ||
          result.messageType == "notify"
            ? true
            : false,
        _id: messages.length + 1,
        messageId: result?._id,
        isForwarded: result.isForwarded,
        attachment:
          result.message_type == "location" ||
          result.message_type == "contact" ||
          result.message_type == "story"
            ? [JSON.parse(result.attachment[0])]
            : result.attachment,
        // code added by Puru
        localPaths: Arr ? Arr : [],
        image: result.message_type == "image" ? result.attachment : [],
        video: result.message_type == "video" ? result.attachment : [],
        audio: result.message_type == "audio" ? result.attachment : [],
        isDeletedForAll: false,
        status: "sent",
        parent_message: result.parent_message,
        createdAt: result.messageTime,
        user: userObject,
        unreadCount: result.unreadCount,
        shouldDisappear: result.shouldDisappear,
        disappearMsgTime: result.shouldDisappear
          ? Date.now() + result.disappearTime * 60000
          : 0,
      },
    ]);
    const countRed = updateMediacount + 1;
    dispatch(updateAppState({ updateMediaFunction: countRed }));
  }

  // new message recived work
  useEffect(() => {
    const handlenewMessageResive = async (data) => {
      console.log("new message resive : ", data);
      const value = await AsyncStorage.getItem("allMediaDownload");
      const allMediaDownload =
        value === "true" || globalThis.allMediaDownload === true;
      globalThis.newMessagerecive = globalThis.newMessagerecive + 1;
      if (data.result.attachment.length > 0) {
        dispatch(
          updateAppState({ updatemediauseeeffect: globalThis.newMessagerecive })
        );
      }
      //        let count = 1
      //  dispatch(updateAppState({updatemediauseeeffect: count + 1}))

      try {
        let userName = "Tokee User";
        if (
          data.result.isNewRoom == 1 &&
          (newroomID == null || newroomID == undefined || newroomID == "")
        ) {
          let seenCount = 0;
          if (data.result.fromUser != globalThis.userChatId) {
            seenCount = 1;
          }

          socket.emit("joinRoom", {
            roomId: data.result.roomId,

            userId: globalThis.userChatId,
          });
          dispatch(setnewroomID(data.result.roomId));
          dispatch(
            setMainprovider({
              userImage: route?.params.userImage,
              userName: route?.params.userName,
              friendId: route?.params.friendId,
              room: {
                roomId: data.result.roomId,
                roomImage: route?.params.userImage,
                roomName: route?.params.userName,
                roomType: "single",
              },
              isBlock: false,
            })
          );

          newMessageInsertList(
            data?.result,
            false,
            globalThis.phone_number,
            seenCount,
            () => {
              dispatch(setChatlistmessage(data.result));
            }
          );

          const members = [
            {
              chat_user_id: data.result.friendId,
              profile_image: data.result.userImage || data.result.roomImage,
              contact_name: data.result.roomName,
              phone_number: Number(
                route?.params.FriendNumber || data.result.phoneNumber
              ),
            },
            {
              chat_user_id: globalThis.userChatId,
              contact_name: globalThis.displayName,
              profile_image: globalThis.image,
              phone_number: Number(globalThis.phone_number),
            },
          ];
          addMembersToRoomMembersSql(members, data.result.roomId);
          removeCount(data.result.roomId);
        }

        userName = data.result.userName;
        let userObject = {
          _id:
            data.result.message_type == "notify" ||
            data.result.message_type == "broadcast_notify" ||
            data.result.messageType == "broadcast_notify" ||
            data.result.messageType == "notify"
              ? globalThis.userChatId
              : data.result.fromUser,
          name: userName,
        };
        if (data.result.roomType == "single") {
          userObject = {};
        }

        if (data.result.fromUser == globalThis.userChatId) {
          if (data.result.roomId == newroomID) {
            updateMessageStatus(data.result);
          }
          // insertChatList({ paramsOfSend: data.result, chatRoom: false });
          if (
            data.result.isForwarded &&
            newroomID == data.result.roomId &&
            data.result.fromUser == globalThis.userChatId
          ) {
            onSend([
              {
                // text: CryptoJS.AES.decrypt(
                //   data.result.message,
                //   EncryptionKey
                // ).toString(CryptoJS.enc.Utf8),
                text: decryptMessage(newroomID, data?.result?.message),
                resId: data.result.resId,
                messageType: data.result.message_type,
                system:
                  data.result.message_type == "notify" ||
                  data.result.message_type == "broadcast_notify" ||
                  data.result.messageType == "broadcast_notify" ||
                  data.result.messageType == "notify"
                    ? true
                    : false,
                _id: Math.floor(Math.random() * 9000) + 1000,
                messageId: data.result?._id,
                isForwarded: data.result.isForwarded,
                attachment:
                  data.result.message_type == "location" ||
                  data.result.message_type == "contact" ||
                  data.result.message_type == "story"
                    ? [JSON.parse(data.result.attachment[0])]
                    : data.result.attachment,
                image:
                  data.result.message_type == "image"
                    ? data.result.attachment
                    : [],
                video:
                  data.result.message_type == "video"
                    ? data.result.attachment
                    : [],
                audio:
                  data.result.message_type == "audio"
                    ? data.result.attachment
                    : [],
                isDeletedForAll: false,
                status: "sent",
                parent_message: data.result.parent_message,
                createdAt: data.result.messageTime,
                user: userObject,
                unreadCount: data.result.unreadCount,
              },
            ]);
          }

          if (
            (data.result.message_type == "notify" ||
              data.result.message_type == "broadcast_notify") &&
            data.result.roomId == newroomID
          ) {
            // const text = CryptoJS.AES.decrypt(
            //   data.result.message,
            //   EncryptionKey
            // ).toString(CryptoJS.enc.Utf8);

            const text = decryptMessage(newroomID, data?.result?.message);

            onSend([
              {
                text: text,
                resId: data.result.resId,
                messageType: data.result.message_type,
                system:
                  data.result.message_type == "notify" ||
                  data.result.message_type == "broadcast_notify" ||
                  data.result.messageType == "broadcast_notify" ||
                  data.result.messageType == "notify"
                    ? true
                    : false,
                _id: Math.floor(Math.random() * 9000) + 1000,
                messageId: data.result?._id,
                isForwarded: data.result.isForwarded,
                attachment:
                  data.result.message_type == "location" ||
                  data.result.message_type == "contact" ||
                  data.result.message_type == "story"
                    ? [JSON.parse(data.result.attachment[0])]
                    : data.result.attachment,
                image:
                  data.result.message_type == "image"
                    ? data.result.attachment
                    : [],
                video:
                  data.result.message_type == "video"
                    ? data.result.attachment
                    : [],
                audio:
                  data.result.message_type == "audio"
                    ? data.result.attachment
                    : [],
                isDeletedForAll: false,
                status: "sent",
                parent_message: data.result.parent_message,
                createdAt: data.result.messageTime,
                user: userObject,
              },
            ]);
          }
        } else {
          if (
            (route.params.friendId &&
              route.params.friendId == data.result.friendId) ||
            newroomID == data.result.roomId
          ) {
            if (allMediaDownload && globalThis.isChatDetailOpen == "yes") {
              if (
                data.result.message_type == "image" ||
                data.result.message_type == "video" ||
                data.result.message_type == "document" ||
                data.result.message_type == "audio"
              ) {
                const dict = {
                  messageType: data.result.message_type,
                  messageId: data.result._id,
                  attachment: data.result.attachment,
                };
                MediaDownload(
                  "chat",
                  dict,
                  data.result.roomId,
                  MediaUpdatedOnSame,
                  data.result
                );
              } else {
                onSend([
                  {
                    // text: CryptoJS.AES.decrypt(
                    //   data.result.message,
                    //   EncryptionKey
                    // ).toString(CryptoJS.enc.Utf8),
                    text: decryptMessage(newroomID, data?.result?.message),
                    resId: data.result.resId,
                    messageType: data.result.message_type,
                    system:
                      data.result.message_type == "notify" ||
                      data.result.message_type == "broadcast_notify" ||
                      data.result.messageType == "broadcast_notify" ||
                      data.result.messageType == "notify"
                        ? true
                        : false,
                    _id: Math.floor(Math.random() * 9000) + 1000,
                    messageId: data.result?._id,
                    isForwarded: data.result.isForwarded,
                    attachment:
                      data.result.message_type == "location" ||
                      data.result.message_type == "contact" ||
                      data.result.message_type == "story"
                        ? [JSON.parse(data.result.attachment[0])]
                        : data.result.attachment,
                    // code added by Puru
                    localPaths: [],
                    image:
                      data.result.message_type == "image"
                        ? data.result.attachment
                        : [],
                    video:
                      data.result.message_type == "video"
                        ? data.result.attachment
                        : [],
                    audio:
                      data.result.message_type == "audio"
                        ? data.result.attachment
                        : [],
                    isDeletedForAll: false,
                    status: "sent",
                    parent_message: data.result.parent_message,
                    createdAt: data.result.messageTime,
                    user: userObject,
                    unreadCount: data.result.unreadCount,
                    shouldDisappear: data.result.shouldDisappear,
                    disappearMsgTime: data.result.shouldDisappear
                      ? Date.now() + data.result.disappearTime * 60000
                      : 0,
                  },
                ]);
              }
            } else {
              onSend([
                {
                  // text: CryptoJS.AES.decrypt(
                  //   data.result.message,
                  //   EncryptionKey
                  // ).toString(CryptoJS.enc.Utf8),
                  text: decryptMessage(newroomID, data?.result?.message),
                  resId: data.result.resId,
                  messageType: data.result.message_type,
                  system:
                    data.result.message_type == "notify" ||
                    data.result.message_type == "broadcast_notify" ||
                    data.result.messageType == "broadcast_notify" ||
                    data.result.messageType == "notify"
                      ? true
                      : false,
                  _id: Math.floor(Math.random() * 9000) + 1000,
                  messageId: data.result?._id,
                  isForwarded: data.result.isForwarded,
                  attachment:
                    data.result.message_type == "location" ||
                    data.result.message_type == "contact" ||
                    data.result.message_type == "story"
                      ? [JSON.parse(data.result.attachment[0])]
                      : data.result.attachment,
                  // code added by Puru
                  localPaths: [],
                  image:
                    data.result.message_type == "image"
                      ? data.result.attachment
                      : [],
                  video:
                    data.result.message_type == "video"
                      ? data.result.attachment
                      : [],
                  audio:
                    data.result.message_type == "audio"
                      ? data.result.attachment
                      : [],
                  isDeletedForAll: false,
                  status: "sent",
                  parent_message: data.result.parent_message,
                  createdAt: data.result.messageTime,
                  user: userObject,
                  unreadCount: data.result.unreadCount,
                  shouldDisappear: data.result.shouldDisappear,
                  disappearMsgTime: data.result.shouldDisappear
                    ? Date.now() + data.result.disappearTime * 60000
                    : 0,
                },
              ]);
            }
            const countRed = updateMediacount + 1;
            dispatch(updateAppState({ updateMediaFunction: countRed }));
          }
        }

        if (newroomID == data.result.roomId) {
          // newMessageInsertList(
          //   data?.result,
          //   true,
          //   globalThis.phone_number,
          //   0,
          //   () => {
          //     dispatch(setChatlistmessage(data.result));
          //   }
          // );
        } else {
          if (data.result.fromUser == globalThis.userChatId) {
            // newMessageInsertList(
            //   data?.result,
            //   true,
            //   globalThis.phone_number,
            //   0,
            //   () => {
            //     dispatch(setChatlistmessage(data.result));
            //   }
            // );
          } else {
            // newMessageInsertList(
            //   data?.result,
            //   true,
            //   globalThis.phone_number,
            //   0,
            //   () => {
            //     dispatch(setChatlistmessage(data.result));
            //   }
            // );
          }
        }

        if (data.result.fromUser !== globalThis.userChatId) {
          if (newroomID == data.result.roomId) {
            socket.emit("seenCountMark", {
              userId: globalThis.userChatId,
              messageId: data.result._id,
            });
            updateRoomUnseenCount(newroomID, 0);
          }
        }
      } catch (error) {
        console.log("error in new Message Reisive : ", error);
      }
    };

    socket.on("newMessageResive", handlenewMessageResive);
    return () => {
      socket.off("newMessageResive", handlenewMessageResive);
    };
  });

  useEffect(() => {
    const handleUpdateGroupDetails = async (data) => {
      if (data.roomId && newroomID && data.roomId == newroomID) {
        // removeAllMembersFromRoomMembersSql(data.roomId, async () => {
        await addMembersToRoomMembersSql(
          data.remaningMembers,
          data.roomId,
          () => {
            dispatch(updatedmembersall(membersupdated));
            // getMembersFromRoomMembersSql(newroomID, async (res) => {
            //
            //   const currentUser = res.find(
            //     (u) => u.userId == globalThis.chatUserId
            //   );
            //   setCurrentUserData(currentUser);
            //   setMentionSuggestions(res);
            //   setMentionSuggestionsold(res);
            // });
          }
        );
        // });

        updateroominfo(
          data?.new_group_name,
          data?.new_group_image,
          data?.roomId,
          data?.new_group_allow,
          data?.owner,
          data?.isPublic
        );
        dispatch(
          setMainprovider({
            ...mainprovider,
            userName: data.new_group_name,
            allow: data.new_group_allow,
            userImage: data.new_group_image,
          })
        );

        const currentUserIdx = data.remaningMembers.findIndex(
          (m) => m.chat_user_id == globalThis?.userChatId
        );
        if (currentUserIdx >= 0) {
          dispatch(setisnewBlock(false));
          blockRoom(newroomID, true);
        } else {
          dispatch(setisnewBlock(true));
          blockRoom(newroomID, false);
        }
      }
    };
    socket.on("updateGroupDetails", handleUpdateGroupDetails);

    return () => {
      socket.off("updateGroupDetails", handleUpdateGroupDetails);
    };
  });

  function getLastSeenstring(RoomLastSeenDate) {
    const start = new Date(RoomLastSeenDate);
    const end = new Date();
    const difference = end - start;

    let elapsed_string = "Last seen few seconds ago";
    //Arrange the difference of date in days, hours, minutes, and seconds format
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes > 0) {
      elapsed_string = "Last seen " + minutes + " minutes ago";
    }

    if (hours > 0) {
      elapsed_string = "Last seen " + hours + " hours ago";
    }
    if (days > 0) {
      elapsed_string = "Last seen " + days + " days ago";
    }
    dispatch(setonlinestatus(elapsed_string));
    return elapsed_string;
  }

  /////////////////////////////////////////user last seen api calling///////////////////////////////////////////////////
  // const getUserLastSeen = async () => {
  //   dispatch(setlastseennew(""));
  //   const urlStr =
  //     chatBaseUrl + getlastSeenApi + "?userId=" + route.params.friendId;
  //   try {
  //     await axios({
  //       method: "get",
  //       url: urlStr,
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //
  //         Authorization: "Bearer " + globalThis.token,
  //       },
  //     })
  //       .then((response) => {
  //         if (response.data.status == true) {
  //           getLastSeenstring(response.data.data);
  //         }
  //       })
  //       .catch((error) => {
  //         if (error.response.status == 401) {
  //           showToast("Session Expired.");
  //
  //           globalThis.token = "";
  //           navigation.navigate("LoginScreen");
  //         }
  //       });
  //   } catch (error) {
  //     console.log("error",error)
  //   }
  // };

  useEffect(() => {
    if (newroomType == "single") {
      if (!isRoomBlocked) {
        const intervalId = setInterval(() => {
          // console.log(">>>>> ",{
          //   friendId: mainprovider.friendId,
          //   userId: globalThis.userChatId,
          // });

          socket.emit("checkOnlineStatus", {
            friendId: mainprovider.friendId,
            userId: globalThis.userChatId,
          });
        }, 10000);
        dispatch(setintervalIds([...intervalIds, intervalId]));
      }
    }
  }, [isRoomBlocked]);

  useEffect(() => {
    const handleOnlineStatus = (data) => {
      // console.log("datadatadatadata",data)
      if (!data.disabled) {
        if (data.isOnline != isOnline) {
          setisOnline(data.isOnline);
          if (!data?.isOnline) {
            getLastSeenstring(data?.lastSeen);
          } else {
            dispatch(setonlinestatus("Online"));
          }
        } else {
          if (!data?.isOnline) {
            getLastSeenstring(data?.lastSeen);
          } else {
            dispatch(setonlinestatus("Online"));
          }
        }
      } else {
        // getLastSeenstring("");
        dispatch(setonlinestatus(""));
      }
    };
    socket.on("checkOnlineStatus", handleOnlineStatus);

    return () => {
      socket.off("checkOnlineStatus", handleOnlineStatus);
    };
  }, [socket, isOnline]);

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
    const isCameraPermitted = await requestCameraPermission();
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
            const imageArr = [image];
            setSendItems(false);
            setCameraModal(false);
            setGroupImageModal(true);
            Keyboard.dismiss();
            setallattachment(imageArr);
            Keyboard.dismiss();
          }
        })
        .catch((error) => {
          console.error("Error checking existence:", error);
        });
    }
  };

  //code -by-dinki
  function CreateRenderImage(attach) {
    let mainDirectory = "";
    if (Platform.OS === "android") {
      mainDirectory = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    } else {
      mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    }

    const subDirectory = `${mainDirectory}/Images`;
    // Ensure main directory exists.

    const mediaName = attach.split("/").pop();
    const mediaId = mediaName.split(".").slice(0, -1).join(".");
    const filename = `${mediaId}.jpg`;
    const encoded = encodeURIComponent(filename);
    const destinationPath = `${subDirectory}/${encoded}`;
    return destinationPath;
  }
  /////////////////////////////////////////////////// select-image-gallery//////////////////////////////////////////////////

  const selectImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        multiple: true,
        cropping: true,
        maxFiles: 5,
        // cropperCircleOverlay: true,
        compressImageQuality: 0.2,
      }).then((image) => {
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
            setGroupImageModal(true);
            Keyboard.dismiss();
            setallattachment(image);
          }
        }
      });
    }
  };

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
          console.log("Captured video:", image);

          // Get the original video file size
          const fileStats = await RNFS.stat(image.path);
          const originalFileSizeInMB = fileStats.size / (1024 * 1024);
          console.log(
            `Original video file size: ${originalFileSizeInMB.toFixed(2)} MB`
          );

          // Compress the video
          const compressedFileUrl = await VideoCompress.compress(
            image.path,
            {
              quality: "medium",
            },
            (progress) => {
              console.log(`Compression progress: ${progress}%`);
              setloaderMoedl(true); // Set loading state during compression
            }
          );

          // Get the size of the compressed video
          const response = await fetch(compressedFileUrl);
          const blob = await response.blob();
          const compressedFileSizeInMB = blob.size / (1024 * 1024);
          console.log(
            `Compressed video file size: ${compressedFileSizeInMB.toFixed(
              2
            )} MB`
          );

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

  //functn by dinki
  const copyFileToFolder = async (srcPath, destFolder, fileName) => {
    // try {
    // Ensure the destination folder exists
    await RNFS.mkdir(destFolder);
    const encoded = encodeURIComponent(fileName);
    const destPath = `${destFolder}/${encoded}`;
    // Copy the file to the destination folder
    await RNFS.copyFile(srcPath, destPath);

    return destPath;
    // } catch (err) {
    //   throw err;
    // }
  };

  /////////////////////////////////////////////////// select-video-gallery//////////////////////////////////////////////////

  // const selectVideo = async () => {
  //   let isCameraPermitted = await requestCameraPermission();
  //   if (isCameraPermitted) {
  //     try {
  //       const images = await ImagePicker.openPicker({
  //         multiple: true,
  //         mediaType: "video",
  //         compressVideoPreset: "MediumQuality",

  //         //compressImageQuality: 0.2,
  //       });

  //       if (images && images.length > 0) {
  //         console.log("Selected videos:", images);
  //         // Create an array to hold the compressed video URLs
  //         const compressedUrls = await Promise.all(
  //           images.map(async (media) => {
  //             try {
  //               // Get original file size
  //               const fileStats = await RNFS.stat(media.path);
  //               const originalFileSizeInMB = fileStats.size / (1024 * 1024);
  //               console.log(
  //                 `Original video file size: ${originalFileSizeInMB.toFixed(
  //                   2
  //                 )} MB`
  //               );

  //               // Compress the video
  //               const compressedFileUrl = await VideoCompress.compress(
  //                 media.path,
  //                 {
  //                   quality: "medium",
  //                 },
  //                 (progress) => {
  //                   console.log({ compression: progress });
  //                   setloaderMoedl(true);
  //                 }
  //               );
  //               setloaderMoedl(false);

  //               // Get the size of the compressed video
  //               const response = await fetch(compressedFileUrl);
  //               const blob = await response.blob();
  //               const compressedFileSizeInMB = blob.size / (1024 * 1024);
  //               console.log(
  //                 `Compressed video file size: ${compressedFileSizeInMB.toFixed(
  //                   2
  //                 )} MB`
  //               );

  //               if (compressedFileSizeInMB > 80) {
  //                 alert(
  //                   "The total size of your selected videos is too large. Please select fewer videos to continue."
  //                 );
  //                 return null; // Skip this video
  //               }

  //               return {
  //                 ...media,
  //                 path: compressedFileUrl, // Replace the path with the compressed URL
  //                 size: compressedFileSizeInMB, // Use the size of the compressed file
  //                 type: "video/mp4", // Ensure the type is set
  //               };
  //             } catch (error) {
  //               setloaderMoedl(false);
  //               console.error("Error processing video:", error);
  //               return media; // Return the original media if there's an error
  //             }
  //           })
  //         );

  //         // Calculate the total size of compressed videos

  //         // Only run these lines if compression is successful and size is acceptable
  //         setallattachment(compressedUrls);

  //         // Uncomment these lines as needed
  //         setVideoModal(false);
  //         setSendItems(false);
  //         setCameraModal(false);
  //         Keyboard.dismiss();
  //         setTimeout(() => {
  //           setGroupImageModal(true);
  //         }, 1500);
  //       }
  //     } catch (error) {
  //       console.error("Error selecting videos:", error);
  //       setloaderMoedl(false);
  //     }
  //   }
  // };

  // const selectVideoByCamera = async (selectimages) => {
  //   console.log(
  //     "selectimages====================================",
  //     selectimages
  //   );
  //   setImageModal(false);
  //   // Check if the provided selectimages is valid
  //   if (!selectimages || !selectimages.uri) {
  //     console.error("Invalid media selected.");
  //     return;
  //   }

  //   try {
  //     // Get original file size
  //     const fileStats = await RNFS.stat(selectimages.uri);
  //     const originalFileSizeInMB = fileStats.size / (1024 * 1024);
  //     console.log(
  //       `Original video file size: ${originalFileSizeInMB.toFixed(2)} MB`
  //     );

  //     // Compress the video
  //     const compressedFileUrl = await VideoCompress.compress(
  //       selectimages.uri,
  //       {
  //         quality: "medium",
  //       },
  //       (progress) => {
  //         console.log({ compression: progress });
  //         setloaderMoedl(true);
  //       }
  //     );
  //     setloaderMoedl(false);

  //     // Get the size of the compressed video
  //     const response = await fetch(compressedFileUrl);
  //     const blob = await response.blob();
  //     const compressedFileSizeInMB = blob.size / (1024 * 1024);
  //     console.log(
  //       `Compressed video file size: ${compressedFileSizeInMB.toFixed(2)} MB`
  //     );

  //     if (compressedFileSizeInMB > 80) {
  //       alert(
  //         "The total size of your selected videos is too large. Please select fewer videos to continue."
  //       );
  //       return null; // Skip this video
  //     }

  //     // Prepare the final data object
  //     const compressedMedia = {
  //       ...selectimages,
  //       path: compressedFileUrl, // Replace the path with the compressed URL
  //       size: compressedFileSizeInMB, // Use the size of the compressed file
  //       type: "video/mp4", // Ensure the type is set
  //     };

  //     // Handle the compressed media as needed
  //     setallattachment([compressedMedia]); // Store it as an array if needed

  //     // Uncomment these lines as needed
  //     setVideoModal(false);
  //     setSendItems(false);
  //     setCameraModal(false);
  //     Keyboard.dismiss();
  //     setTimeout(() => {
  //       setGroupImageModal(true);
  //     }, 1500);
  //   } catch (error) {
  //     console.error("Error processing video:", error);
  //     setloaderMoedl(false);
  //   }
  // };

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
        console.log("Selected Image >>>>>", selectImage);
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

  const formatFileSize = (size) => {
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

  const BucketUpload = async (image, mediaType) => {
    setCameraModal(false);
    setVideoModal(false);
    setLoading(false);
    const allPaths = await allattachment.map((image) => image.path);
    const mId = Math.floor(Math.random() * 9000) + 1000;
    const paramsOfSend = {
      mId: mId,
      roomId: newroomID,
      fromUser: globalThis.userChatId,
      userName: globalThis.displayName,
      currentUserPhoneNumber: globalThis.phone_number,
      message: "",
      message_type: mediaType,
      attachment: allPaths,
      isBroadcastMessage: false,
      isDeletedForAll: false,
      parent_message: messageClickd ? messageClickd : {},
      isForwarded: false,
      storyId: "",
      isStoryRemoved: false,
      resId: chatMessageTime,
      broadcastMessageId: "",
      seenCount: 0,
      deliveredCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(".........>>>>>>>>>>>>>>", paramsOfSend);

    insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });

    onSend([
      {
        resId: chatMessageTime,
        text: "",
        messageType: mediaType,
        _id: mId,
        messageId: "",
        system: false,
        status: "",
        createdAt: new Date(),
        isForwarded: false,
        image: mediaType == "image" ? allPaths : [],
        video: mediaType == "video" ? allPaths : [],
        audio: mediaType == "audio" ? allPaths : [],
        attachment: allPaths,
        isDeletedForAll: false,
        parent_message: {},

        user: { _id: globalThis.userChatId },
        unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
      },
    ]);
    setGroupImageModal(false);
    const AWS = require("aws-sdk"); // Make sure to import the AWS SDK
    const bucket = new AWS.S3({
      bucketName: "tokee-chat-staging",
      region: "us-east-2",
      accessKeyId: globalThis.accessKey,
      secretAccessKey: globalThis.awsSecretAccessKey,
      s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/",
    });

    const folderName = "Document/";
    const newAttachmentUrls = [];
    // let newLocalPathsUrl = [];

    // Use Promise.all to wait for all uploads to complete
    await Promise.all(
      image.map(async (file, index) => {
        const pathParts = file.path.split("/");
        const fileName = Date.now() + "_" + pathParts[pathParts.length - 1];
        // const fileNameWithoutExtension = fileName.split(".")[0];
        const fPath = file.path;
        const base64 = await RNFS?.readFile(fPath, "base64");
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
            .on("httpUploadProgress", (progress) => {
              const { loaded, total } = progress;
              const percentage = (loaded / total) * 100;
              setUploadProgress((prevProgress) => {
                const updatedProgress = [...prevProgress];
                updatedProgress[index] = percentage;
                return updatedProgress;
              });
              if (percentage === 100) {
                // Handle completion
              }
            })
            .promise();

          //code-by-dinki
          const mediaName = data.Location.split("/").pop();

          const mediaId = mediaName.split(".").slice(0, -1).join(".");

          const fileName = `${mediaId}.jpg`;

          let destFolder = "";

          if (Platform.OS == "android") {
            destFolder = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/Images`;
          } else {
            destFolder = `${RNFS.DocumentDirectoryPath}/TokeeMedia/Images`;
          }

          const localPath = await copyFileToFolder(
            file.path,
            destFolder,
            fileName
          );

          updateLocalPathInChatMessages(mId, localPath, () => {});

          newAttachmentUrls.push(data.Location);
        } catch (err) {
          console.log("err", err);
        }
      })
    );

    setUploadProgress([]);
    const paramsOfSendforlive = {
      mId: mId,

      userName: globalThis.displayName,

      phoneNumber: globalThis.phone_number,
      currentUserPhoneNumber: globalThis.phone_number,

      userImage: globalThis.image,
      roomId: newroomID,
      roomName: mainprovider?.userName,
      roomImage: mainprovider?.userImage,
      roomType: mainprovider?.roomType,

      roomOwnerId: globalThis.userChatId,
      message: "",
      message_type: mediaType,
      roomMembers:
        mainprovider?.roomType !== "single"
          ? []
          : [
              mainprovider?.friendId && mainprovider?.friendId != 0
                ? mainprovider?.friendId
                : "",
            ],

      parent_message_id: "",
      attachment: newAttachmentUrls,

      from: globalThis.userChatId,
      resId: chatMessageTime,
      createdAt: new Date(),
    };

    console.log("paramsOfSendforlive======", paramsOfSendforlive);

    socket.emit("sendmessage", paramsOfSendforlive);
  };

  // const readFileAsBase64 = async (fPath) => {
  //   try {
  //     // Ensure fPath is a valid string
  //     if (!fPath) {
  //       throw new Error("File path is required");
  //     }

  //     // Read the file in base64 format
  //     const base64 = await RNFS.readFile(fPath, 'base64');
  //     return base64;
  //   } catch (error) {
  //     console.error("Error reading file:", error);
  //     throw error; // Optionally rethrow the error for further handling
  //   }
  // };

  const BucketUploadFile = async (file, mediaType) => {
    console.log("filefile", file);

    setCameraModal(false);
    setVideoModal(false);
    setLoading(false);
    setIsRecording(false);

    const allPaths = file.map((image) => image.uri || image.path);
    const mId = Math.floor(Math.random() * 9000) + 1000;

    const paramsOfSend = {
      mId,
      roomId: newroomID,
      fromUser: globalThis.userChatId,
      userName: globalThis.displayName,
      currentUserPhoneNumber: globalThis.phone_number,
      message: "",
      message_type: mediaType,
      attachment: allPaths,
      isBroadcastMessage: false,
      isDeletedForAll: false,
      parent_message: messageClickd || {},
      isForwarded: false,
      storyId: "",
      isStoryRemoved: false,
      resId: chatMessageTime,
      broadcastMessageId: "",
      seenCount: 0,
      deliveredCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });

    onSend([
      {
        resId: chatMessageTime,
        text: "",
        messageType: mediaType,
        _id: mId,
        messageId: "",
        system: false,
        status: "",
        createdAt: new Date(),
        isForwarded: false,
        attachment: allPaths,
        isDeletedForAll: false,
        video: mediaType === "video" ? allPaths : [],
        image: mediaType === "image" ? allPaths : [],
        audio: mediaType === "audio" ? allPaths : [],
        parent_message: {},
        user: { _id: globalThis.userChatId },
        unreadCount: mainprovider?.roomType === "single" ? 1 : TOTALMEM || 0,
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
    const newAttachmentUrls = [];

    // Use Promise.all to wait for all uploads to complete
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

                console.log(
                  "destFolder====================================",
                  destFolder
                );

                const localPath = await copyFileToFolder(
                  fPath,
                  destFolder,
                  fileNamemew
                );
                updateLocalPathInChatMessages(mId, localPath, () => {});
                newAttachmentUrls.push(datanew.Location);
                console.log(
                  "datanew====================================",
                  datanew
                );
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

              updateLocalPathInChatMessages(mId, localPath, () => {});

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

    const paramsOfSendforlive = {
      mId,
      userName: globalThis.displayName,
      phoneNumber: globalThis.phone_number,
      currentUserPhoneNumber: globalThis.phone_number,
      userImage: globalThis.image,
      roomId: newroomID,
      roomName: mainprovider?.userName,
      roomImage: mainprovider?.userImage,
      roomType: mainprovider?.roomType,
      roomOwnerId: globalThis.userChatId,
      message: "",
      message_type: mediaType,
      roomMembers:
        mainprovider?.roomType !== "single"
          ? []
          : [
              mainprovider?.friendId && mainprovider?.friendId != 0
                ? mainprovider?.friendId
                : "",
            ],
      parent_message_id: "",
      attachment: newAttachmentUrls,
      from: globalThis.userChatId,
      resId: chatMessageTime,
      createdAt: new Date(),
    };

    console.log("paramsOfSendforlive for video", paramsOfSendforlive);

    socket.emit("sendmessage", paramsOfSendforlive);

    setTimeout(async () => {
      try {
        const cacheDir = RNFS.CachesDirectoryPath;
        await RNFS.unlink(cacheDir);
        console.log("Cache cleaned successfully!");
      } catch (error) {
        console.error("Error cleaning cache:", error);
      }
    }, 1000);
  };

  const checkAndRequestPermissions = async () => {
    try {
      if (Platform.OS === "android") {
        try {
          const grants = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);

          if (
            grants["android.permission.RECORD_AUDIO"] ===
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            startRecording();
          } else {
            return;
          }
        } catch (err) {
          // Alert.alert("Please allow the permission.");
          globalThis.errorMessage = "Please allow the permission.";
          setErrorAlertModel(true);
          return;
        }
      } else {
        startRecording();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const submitVoiceAudio = async () => {
    setIsRecording(false);

    try {
      audioRecorderPlayer.removeRecordBackListener();
      const result = await audioRecorderPlayer.stopRecorder();

      console.log("Recorded file path:", result);

      const unique =
        new Date().getUTCMilliseconds() + new Date().getTime().toString(36);
      const dirs = RNFS.CachesDirectoryPath;
      const ext = Platform.OS === "android" ? "mp3" : "m4a";
      const newPath = `${dirs}/sound${unique}.${ext}`;

      // Check if the file exists at the old path before moving
      const fileExists = await RNFS.exists(result);
      console.log("File exists at old path:", fileExists);

      if (fileExists) {
        await RNFS.moveFile(result, newPath);
        BucketUploadFile([{ path: newPath, type: `audio/${ext}` }], "audio");
      } else {
        console.error("File does not exist at old path:", result);
      }
    } catch (err) {
      console.error("Error during audio processing:", err);
    }
  };

  const onStopRecord = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      console.log("result", result);
      audioRecorderPlayer.removeRecordBackListener();
    } catch (error) {
      console.log("error", error);
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };

    const uri = await audioRecorderPlayer.startRecorder(path, audioSet);
    audioRecorderPlayer.addRecordBackListener((e) => {
      console.log("eeee", e);
    });
  };

  const JoinPublicGroup = async () => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const bodydata = JSON.stringify({
      userId: globalThis.userChatId,
      roomId: route?.params?.room?.roomId,
      members: [globalThis.userChatId],
      operation: "ADD",
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: bodydata,
    };
    const response = await fetch(chatBaseUrl + addMemberApi, requestOptions);
    const data = await response.json();

    if (data.status === true) {
      try {
        setIsGroupJoined(true);
        const mId = Math.floor(Math.random() * 9000) + 1000;
        // const messageSend = CryptoJS.AES.encrypt(
        //   `${globalThis.displayName} joined the group.`,
        //   EncryptionKey
        // ).toString();
        const messageSend = encryptMessage(
          newroomID,
          `${globalThis.displayName} joined the group.`
        );

        const paramsOfSendforlive = {
          mId: mId,

          userName: globalThis.displayName,
          phoneNumber: globalThis.phone_number,
          currentUserPhoneNumber: globalThis.phone_number,

          userImage: globalThis.image,
          roomId: newroomID,
          roomName: mainprovider?.userName,
          roomImage: mainprovider?.userImage,
          roomType: mainprovider?.roomType,

          roomOwnerId: globalThis.userChatId,
          message: messageSend,
          message_type: "notify",
          roomMembers: [],
          parent_message_id: "",
          attachment: [],

          from: globalThis.userChatId,
          resId: Date.now(),
          createdAt: new Date(),
        };

        socket.emit("joinRoom", {
          roomId: newroomID,
          userId: globalThis.userChatId,
        });

        const createGroup = {
          roomId: newroomID,
          roomName: mainprovider?.userName,
          roomImage: mainprovider?.userImage,
          roomType: mainprovider?.roomType,
          friendId: "",
          fromUser: globalThis.userChatId,
          isPublic: data.data.isPublic,
          owner: data.data.owner,
          allow: data.data.allow,
        };

        newMessageInsertList(createGroup, false, "0");

        socket.emit("sendmessage", paramsOfSendforlive);

        const getRoomMembersUrl =
          chatBaseUrl + getRoomMembersApi + "?roomId=" + newroomID;

        const res = await axios({
          method: "get",
          url: getRoomMembersUrl,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",

            Authorization: "Bearer " + globalThis.token,
          },
        });

        if (res.data.status == true) {
          const groupMembers = [];

          res.data.data.members.forEach((member) => {
            if (member.isRemoved == false) {
              groupMembers.push({
                roomId: res.data.data.roomId,
                chat_user_id: member.user._id,
                contact_name: member.user.name,
                phone_number: member.user.phone_number,
                isAdmin: member.isAdmin,
              });
            }
          });

          // removeAllMembersFromRoomMembersSql(newroomID, () => {
          //   addMembersToRoomMembersSql(groupMembers, newroomID);
          // });
          addMembersToRoomMembersSqlnew(groupMembers, newroomID, () => {
            // count = count + 1;
            // dispatch(updateAppState({ updatemediauseeeffect: count + 1 }));

            dispatch(updatedmembersall(membersupdated));
          });
        } else {
          // Alert.alert(res.data.message);
          globalThis.errorMessage = res.data.message;
          setErrorAlertModel(true);
        }

        setLoading(false);
        navigation.pop(2);
      } catch (err) {
        console.log("error", err);
      }
    } else {
      setLoading(false);
      // throw new Error("Failed to Delete Chat");
    }
  };

  const ReportuserChat = async () => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const bodydata = JSON.stringify({
      userId: globalThis.userChatId,
      chatId: messageClickd?._id,
      reason: reason,
      isBlockUser: isBlock,
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: bodydata,
    };
    const response = await fetch(chatBaseUrl + reportChatApi, requestOptions);
    const data = await response.json();

    if (data.status === true) {
      setMessageClicked({});
      setMessageClickedId("");
      setLoading(false);
      setReportModal(!reportModal);
      if (isBlock) {
        setUserBlocked(true);
        blockRoom(newroomID, 1);
      }
      setIsBlock(false);
      setReason("");
      return data;
    } else {
      setMessageClicked({});
      setMessageClickedId("");
      setIsBlock(false);
      setReason("");
      setReportModal(!reportModal);
      setLoading(false);
      // throw new Error("Failed to Delete Chat");
    }
  };

  const handleMentionSelection = (selectedMention) => {
    setSearchTextnew("");
    // Check if there is text after @
    const atIndex = messageInput.lastIndexOf("@");
    if (atIndex !== -1) {
      // Split the selected mention by whitespace to get individual words
      const mentionWords = selectedMention.split(/\s+/);
      // Take only the first word of the mention
      const firstWord = mentionWords[0];
      // Construct the updated text with the first word of the mention
      const updatedText =
        messageInput.substring(0, atIndex + 1) + firstWord + " ";
      setMessageInput(updatedText);
    }
    setIsMentioning(false);
  };

  const filterMentionSuggestions = (searchText) => {
    if (searchText === "") {
      setMentionSuggestions([...mentionSuggestionsold]);
    } else {
      const filteredSuggestions = mentionSuggestionsold.filter(
        (mention) =>
          mention?.userName
            ?.toLowerCase()
            .includes(searchText.toLowerCase().slice(1)) ||
          mention?.phone_number
            ?.toLowerCase()
            .includes(searchText.toLowerCase().slice(1))
      );
      if (filteredSuggestions.length == 0) {
        setIsMentioning(false);
      }
      setMentionSuggestions([...filteredSuggestions]);
    }
  };

  useEffect(() => {
    if (disappearmsg && messageInput.length == 0) {
      setDisappearmsg(false);
      setDisappearmsgchecked(false);
      setdisappeartime(0);
    }
  }, [messageInput]);

  async function TranslateWord(text, callback) {
    console.log("in translate word");
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
      console.log('before match===================================');
      if (match) {
        console.log("match====================================", match);

        const resion = `In the group "${roominfo.roomName}", the user posted inappropriate content: "${text}".`; // You can replace this with any other value

        const result = await updateViolationAttempt(resion); // Call the custom function

        setLoading(false);
        console.log(
          "result.data.violation_attempt====================================",
          result.data
        );

        if (result.success) {
          const violationAttempt = result.data.violation_attempt 
          console.log('result?.data?.suspended_remove_date====================================',result?.data?.suspended_remove_date);
         
          const remainingDays = getRemainingSuspensionDays(result?.data?.suspended_remove_date);

          if (result.data.violation_attempt == 1) {
            banType = "Warning";
            setWarningModalVisible(true);
          } else if (result.data.violation_attempt  > 1 && result.data.violation_attempt  <= 4) {
            banType = "Ban";
            dispatch(setUserSuspendedDays(remainingDays));
            setWarningModalVisible(true);
            dispatch(setUserBanned(result.data.is_ban));
          } else if (result.data.violation_attempt  == 5) {
            banType = "Ban";
            banMessage = `Your account has been suspended for ${remainingDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
            banTitle = "Account Suspended!";
            dispatch(setUserSuspendedDays(remainingDays));
            setWarningModalVisible(true);
            dispatch(setUserBanned(result.data.is_ban));
          } else if (result.data.violation_attempt  > 5) {
            banType = "Ban";
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

        callback(true); // Inappropriate words found
      } else {
        console.log('No inappropriate words found====================================');

        callback(false); // No inappropriate words found
      }
    } catch (error) {
      setLoading(false);
      callback(false); // Error occurred, consider it as inappropriate words found
    }
  }

  const handleSendMessage = useCallback(() => {
    setMessageInput("");
    setSendBtnShow(false);
    if (disappearmsg) {
      setDisappearmsg(false);
    }
    if (disappearmsgchecked) {
      setDisappearmsgchecked(false);
      setdisappeartime(0);
    }
    if (isnewblock == true) {
      return;
    }
    if (messageInput !== "") {
      console.log("currentUserData?.isPublic", currentUserData?.isPublic);
      if (currentUserData && currentUserData?.isPublic) {
        TranslateWord(messageInput, (data) => {
          if (!data) {
            console.log(
              "in not datatattatatta===================================="
            );

            onsendallmessage();
          }
          return data;
        });
      } else {
        onsendallmessage();
      }
    }
  }, [
    messageInput,
    disappearmsg,
    disappearmsgchecked,
    isnewblock,
    currentUserData,
  ]);

  const renderInputToolbar = useCallback(() => {
    // Customize the input toolbar as per your requirements.
    return (
      <>
        {isGroupJoined == false ? (
          <TouchableOpacity
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
              padding: DeviceInfo.hasNotch() == true ? 0 : 10,
            }}
            onPress={JoinPublicGroup}
          >
            <Text
              style={{ fontSize: fontSize.input_title_size, color: "#fff" }}
            >
              {t("Join_Room")}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              bottom: Platform.OS == "ios" ? 0 : 0,
              top: isMentioning
                ? Platform.OS == "ios"
                  ? -flatListHeight - 15
                  : -flatListHeight
                : Platform.OS == "ios"
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
                      setreactmsgon(true);
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
                      source={require("../../Assets/Icons/Delete.png")}
                    />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, color: "red" }}>
                    {selectedMessageId && selectedMessageId.length}{" "}
                    {t("Selected")}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {renderIf(
                  showReplyMessage == true,
                  <View
                    style={{
                      position: "absolute",
                      minHeight: 76,
                      width: "100%",
                      backgroundColor: "#fff",
                      bottom: 80,
                      padding: 5,
                      borderTopRightRadius: 10,
                      borderTopLeftRadius: 10,
                      paddingBottom: 25,
                    }}
                  >
                    <View
                      style={{
                        borderRadius: 10,
                        borderWidth: 0,
                        backgroundColor: "#efefef",
                        height: "100%",
                        padding: 5,
                        paddingLeft: 10,
                        borderLeftColor: iconTheme().iconColorNew,
                        borderLeftWidth: 4,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          top: 0,
                          right: 5,
                          zIndex: 20,
                          backgroundColor: chatContainer().back_ground,
                          borderRadius: 50,
                          width: 30,
                          height: 30,
                        }}
                        onPress={() => {
                          handleSwipeRightcancle();
                          setShowReplyMessage(false);
                          setMessageClicked({});
                        }}
                      >
                        <Text style={{ fontSize: 18 }}>x</Text>
                      </TouchableOpacity>
                      {messageClickd.messageType == "text" ? (
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: font.semibold(),
                          }}
                        >
                          {messageClickd.text}
                        </Text>
                      ) : (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <View>
                            <Text
                              style={{
                                fontSize: 16,
                                color: iconTheme().iconColorNew,
                                fontFamily: font.semibold(),
                              }}
                              numberOfLines={1}
                            >
                              {globalThis.userChatId === messageClickd.user?._id
                                ? "You"
                                : mentionSuggestions?.find(
                                    (member) =>
                                      member &&
                                      member._id === messageClickd.user?._id
                                  )?.name || ""}
                            </Text>
                            <View style={{ flexDirection: "row" }}>
                              <Image
                                source={
                                  messageClickd.messageType == "image"
                                    ? require("../../Assets/Icons/Gallary.png")
                                    : messageClickd.messageType == "video"
                                    ? require("../../Assets/Icons/Gallary.png")
                                    : require("../../Assets/Icons/docs.png")
                                }
                                style={{
                                  height: 20,
                                  width: 20,
                                  tintColor: "#000",
                                }}
                              />
                              <Text
                                style={{
                                  textTransform: "capitalize",
                                  color: "#000",
                                  fontFamily: font.semibold(),
                                }}
                              >
                                {" "}
                                {messageClickd.messageType}
                              </Text>
                            </View>
                          </View>
                          {messageClickd &&
                            messageClickd?.messageType != "contact" &&
                            messageClickd?.messageType != "location" &&
                            messageClickd?.messageType != "story" && (
                              <Image
                                source={
                                  messageClickd?.attachment
                                    ? { uri: messageClickd?.attachment[0] }
                                    : require("../../Assets/Icons/Gallary.png")
                                }
                                style={{
                                  height: 40,
                                  width: 60,
                                  borderTopRightRadius: 10,
                                  borderBottomRightRadius: 10,
                                }}
                                resizeMode="cover"
                              />
                            )}

                          {messageClickd?.messageType == "story" && (
                            <Image
                              source={{
                                uri: messageClickd?.attachment[0].file,
                              }}
                              style={{
                                height: 40,
                                width: 60,
                                borderTopRightRadius: 10,
                                borderBottomRightRadius: 10,
                              }}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {disappearmsg && (
                  <View
                    style={{
                      position: "absolute",
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      paddingBottom: 15,
                      bottom: 100,
                      backgroundColor: "#fff",
                      alignSelf: "center",
                      zIndex: 150,
                      flex: 1,
                      width: "100%",
                    }}
                  >
                    <Text
                      style={{
                        color: iconTheme().iconColorNew,
                        fontFamily: font.semibold(),
                        textAlign: "center",
                        paddingVertical: 10,
                        marginBottom: 10,
                      }}
                    >
                      {`This message will disappear after ${
                        disappeartime == 10
                          ? "10 minutes"
                          : disappeartime == 30
                          ? "30 minutes"
                          : disappeartime == 60
                          ? "1 hour"
                          : disappeartime == 720
                          ? "12 hours"
                          : disappeartime == 1440
                          ? "24 hours"
                          : ""
                      }.`}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flex: 1,
                        width: "100%",
                        justifyContent: "space-around",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setDisappearmsgchecked(!disappearmsgchecked);
                          setdisappeartime(10);
                        }}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View style={{}}>
                          <View
                            style={{
                              backgroundColor:
                                disappeartime == 10
                                  ? iconTheme().iconColor
                                  : "lightgrey",
                              height: 30,
                              width: 30,
                              borderRadius: 50,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: font.semibold(),
                                fontSize: 12,
                              }}
                            >
                              10m
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setDisappearmsgchecked(!disappearmsgchecked);
                          setdisappeartime(30);
                        }}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View style={{}}>
                          <View
                            style={{
                              backgroundColor:
                                disappeartime == 30
                                  ? iconTheme().iconColor
                                  : "lightgrey",
                              height: 30,
                              width: 30,
                              borderRadius: 50,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: font.semibold(),
                                fontSize: 12,
                              }}
                            >
                              30m
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setDisappearmsgchecked(!disappearmsgchecked);
                          setdisappeartime(60);
                        }}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View style={{}}>
                          <View
                            style={{
                              backgroundColor:
                                disappeartime == 60
                                  ? iconTheme().iconColor
                                  : "lightgrey",
                              height: 30,
                              width: 30,
                              borderRadius: 50,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: font.semibold(),
                                fontSize: 12,
                              }}
                            >
                              1h
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setDisappearmsgchecked(!disappearmsgchecked);
                          setdisappeartime(720);
                        }}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View style={{}}>
                          <View
                            style={{
                              backgroundColor:
                                disappeartime == 720
                                  ? iconTheme().iconColor
                                  : "lightgrey",
                              height: 30,
                              width: 30,
                              borderRadius: 50,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: font.semibold(),
                                fontSize: 12,
                              }}
                            >
                              12h
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setDisappearmsgchecked(!disappearmsgchecked);
                          setdisappeartime(1440);
                        }}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View style={{}}>
                          <View
                            style={{
                              backgroundColor:
                                disappeartime == 1440
                                  ? iconTheme().iconColor
                                  : "lightgrey",
                              height: 30,
                              width: 30,
                              borderRadius: 50,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: font.semibold(),
                                fontSize: 12,
                              }}
                            >
                              24h
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {isMentioning && (
                  <FlatList
                    onLayout={(event) => {
                      const { height } = event.nativeEvent.layout;
                      setFlatListHeight(height);
                    }}
                    style={{
                      position: "relative",
                      left: 0,
                      right: 0,
                      width: windowWidth - 20,
                      borderRadius: 20,
                      alignSelf: "center",
                      backgroundColor: "#fff",
                      marginBottom: 5,
                      marginTop: -5,
                      bottom: 0,
                      zIndex: 0,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      maxHeight: 200,
                    }}
                    keyboardShouldPersistTaps={"always"}
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={mentionSuggestions}
                    renderItem={({ item, index }) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleMentionSelection(item.userName)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 5,
                          }}
                        >
                          <FastImage
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 50,
                              marginRight: 5,
                            }}
                            source={{ uri: item.image }}
                            resizeMode="cover"
                          />
                          <View>
                            <Text style={{ fontFamily: font.semibold() }}>
                              {item?.userName}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "center",
                    paddingTop: 10,
                    backgroundColor: "#fff",
                    paddingBottom: 60,
                  }}
                >
                  {isRecording ? (
                    <View
                      style={{
                        width: "98%",
                        backgroundColor:
                          isnewblock == true ? "darkgray" : "#fff",
                        flexDirection: "row",
                        height: 50,
                        borderRadius: 30,
                        elevation: 10,
                        borderWidth: 0.2,
                        borderColor: COLORS.grey,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          width: "20%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() => submitVoiceAudio()}
                      >
                        <Text
                          style={{
                            color: iconTheme().iconColorNew,
                            fontSize: 15,
                            fontFamily: font.semibold(),
                          }}
                        >
                          {t("send")}
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={{
                          width: "60%",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "row",
                        }}
                      >
                        <Text>{t("recording")}</Text>
                        <Animated.Text
                          style={{
                            color: "black",
                            opacity: dotOpacity,
                            fontSize: 20,
                          }}
                        >
                          ...
                        </Animated.Text>
                      </View>

                      <TouchableOpacity
                        style={{
                          marginLeft: "auto",
                          marginRight: 5,
                          width: 40,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 0,
                          borderRadius: 50,
                          marginVertical: 5,
                          borderColor: "transparent",
                        }}
                        onPress={() => {
                          if (!isnewblock) {
                            onStopRecord();
                            setIsRecording(false);
                            // setRecordTime(""),
                            // setAudioPath("");
                          }
                        }}
                      >
                        <Image
                          source={require("../../Assets/Icons/Cross.png")}
                          style={{
                            height: 20,
                            width: 20,
                            tintColor: iconTheme().iconColorNew,
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: "98%",
                        flexDirection: "row",
                        //  height: 50,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          width: "10%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPressIn={() => {
                          Keyboard.dismiss();
                          isnewblock == true
                            ? null
                            : mainprovider.allow == "admin" &&
                              globalThis.userChatId != mainprovider.owner &&
                              currentUserData &&
                              currentUserData.isAdmin != 1
                            ? null
                            : checkContactPermission();
                          setSendItems(!sendItems);
                        }}
                      >
                        <Image
                          source={require("../../Assets/Icons/plus.png")}
                          style={{
                            height: 20,
                            width: 20,
                            tintColor: iconTheme().iconColorNew,
                          }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      <TextInput
                        showsVerticalScrollIndicator={false} // Hide vertical scrollbar on iOS
                        showsHorizontalScrollIndicator={false}
                        size={17}
                        textContentType={"none"}
                        keyboardType={"default"}
                        onImageChange={(event) => {
                          // Will log an object of type { uri: string, linkUri: string, data: string, mime: string}
                          onImageChange(event);
                        }}
                        ref={textInputRef}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        placeholderTextColor={COLORS.grey}
                        placeholder={
                          isnewblock == true
                            ? mainprovider?.roomType == "single"
                              ? t("You_cant_message")
                              : t("You_cant_messagegroup")
                            : mainprovider.allow == "admin" &&
                              globalThis.userChatId != mainprovider.owner &&
                              currentUserData &&
                              currentUserData.isAdmin != 1
                            ? t("only_admin")
                            : t("typeHere")
                        }
                        onChangeText={(text) => {
                          //  setshowemoji(false);
                          setMessageInput(text);
                          if (mainprovider?.room && text.length > 0) {
                            socket.emit("typing", {
                              roomId: mainprovider?.room.roomId,

                              userId: globalThis.userChatId,

                              name: globalThis.displayName,
                              roomType: mainprovider?.roomType,
                              friendId:
                                mainprovider?.roomType == "single"
                                  ? mainprovider?.friendId
                                  : "",
                            });
                          }

                          if (text.length > 0) {
                            setSendBtnShow(true);
                          } else if (text.length == 1) {
                            setSendBtnShow(false);
                          }
                          if (newroomType != "single") {
                            const lastChar = messageInput.substr(
                              messageInput.length - 1
                            );
                            const currentChar = text.substr(text.length - 1);
                            const spaceCheck = /[^@a-zA-Z_0-9]/g;

                            if (text.length === 0) {
                              setIsMentioning(false);
                            } else {
                              if (
                                spaceCheck.test(lastChar) &&
                                currentChar != "@"
                              ) {
                                setIsMentioning(false);
                              } else {
                                if (lastChar == "@") {
                                  setSearchTextnew("");
                                } else {
                                  setSearchTextnew(text);
                                }
                                const checkSpecialChar =
                                  currentChar.match(/[^@a-zA-Z_0-9]/);
                                if (
                                  checkSpecialChar === null ||
                                  currentChar === "@"
                                ) {
                                  const pattern = new RegExp(
                                    `\\B@[a-zA-Z0-9_-]+|\\B@`,
                                    `gi`
                                  );
                                  const matches = text.match(pattern) || [];
                                  if (matches.length > 0) {
                                    if (text.substr(text.length - 1) == "@") {
                                      getMembersFromRoomMembersSqlsearch(
                                        newroomID,
                                        "",
                                        (res) => {
                                          const currentUser = res.find(
                                            (u) =>
                                              u.userId == globalThis.chatUserId
                                          );

                                          setCurrentUserData(currentUser);
                                          setMentionSuggestions(res);
                                          setMentionSuggestionsold(res);
                                          setIsMentioning(true);
                                        }
                                      );
                                    }

                                    filterMentionSuggestions(
                                      matches[matches.length - 1]
                                    );
                                  } else {
                                    setIsMentioning(false);
                                  }
                                  // }
                                } else if (checkSpecialChar != null) {
                                  setIsMentioning(false);
                                }
                              }
                            }
                          }

                          // Handle text input changes
                        }}
                        onTouchStart={() => {
                          if (isStipopShowing) {
                            switch (Platform.OS) {
                              case "android":
                                textInputRef?.current?.focus();
                                StipopModule.show(false, false, () => {
                                  setIsStipopShowing(false);
                                });
                                break;
                            }
                          }
                        }}
                        editable={
                          isnewblock == true
                            ? false
                            : mainprovider.allow == "admin" &&
                              globalThis.userChatId != mainprovider.owner &&
                              currentUserData &&
                              currentUserData.isAdmin != 1
                            ? false
                            : true
                        }
                        multiline={true}
                        value={isnewblock == true ? null : messageInput}
                        onFocus={() => {
                          isnewblock == true ? null : setInputFocused(true);
                          setshowemoji(false);
                        }}
                        textAlignVertical="center"
                        style={{
                          // position:"absolute",
                          width: "70%",
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
                          width: "10%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        disabled={
                          isnewblock == true
                            ? true
                            : mainprovider.allow == "admin" &&
                              globalThis.userChatId != mainprovider.owner &&
                              currentUserData &&
                              currentUserData.isAdmin != 1
                            ? true
                            : false
                        }
                        onPressIn={() => {
                          switch (Platform.OS) {
                            case "android":
                              if (isnewblock == false) {
                                textInputRef?.current?.focus();
                                StipopModule.show(
                                  isKeyboardVisible,
                                  isStipopShowing,
                                  (resultBool) => {
                                    setIsStipopShowing(resultBool);
                                  }
                                );
                              }

                              break;

                            case "ios":
                              if (isnewblock == false) {
                                StipopModule.show(
                                  isKeyboardVisible,
                                  isStipopShowing,
                                  (error, resultBool) => {
                                    setIsStipopShowing(resultBool);
                                  }
                                );
                              }

                              break;
                          }
                        }}
                      >
                        <Image
                          source={require("../../Assets/Icons/faceImg.png")}
                          style={{
                            height: 28,
                            width: 28,
                            tintColor: iconTheme().iconColorNew,
                          }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      {/*======================Send============  */}
                      {sendBtnShow ? (
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
                          onPress={handleSendMessage}
                          delayLongPress={500}
                          onLongPress={() => {
                            console.log("long pressed", isnewblock);
                            // ReactNativeHapticFeedback.trigger("impactHeavy", {
                            //   enableVibrateFallback: true,
                            //   ignoreAndroidSystemSettings: false,
                            // });
                            if (!isnewblock) {
                              console.log("in if");
                              console.log(
                                "route.params.isPublicroute.params.isPublic",
                                route.params.isPublic
                              );
                              console.log(
                                "currentUserData?.isPubliccurrentUserData?.isPublic",
                                currentUserData?.isPublic
                              );

                              // if (
                              //   (route.params.isPublic != 1 &&
                              //     route.params.isPublic != undefined) ||
                              //   (currentUserData?.isPublic != 1 &&
                              //     currentUserData?.isPublic != undefined)
                              // ) {
                              //   console.log("second if")
                              setDisappearmsg(!disappearmsg);
                              // }
                            }
                          }}
                        >
                          <Image
                            source={require("../../Assets/Icons/Send_message.png")}
                            style={{
                              height: 22,
                              width: 22,
                              tintColor: iconTheme().iconColorNew,
                            }}
                          />
                        </TouchableOpacity>
                      ) : (
                        <>
                          {/* =========Audio record */}
                          {isRecording ? (
                            <></>
                          ) : (
                            <TouchableOpacity
                              style={{
                                marginLeft: "auto",
                                marginRight: 5,
                                width: "10%",
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 0,
                                borderRadius: 50,
                                marginVertical: 5,
                                borderColor: "transparent",
                              }}
                              disabled={
                                isnewblock == true
                                  ? true
                                  : mainprovider.allow == "admin" &&
                                    globalThis.userChatId !=
                                      mainprovider.owner &&
                                    currentUserData &&
                                    currentUserData.isAdmin != 1
                                  ? true
                                  : false
                              }
                              onPress={() => {
                                if (!isnewblock) {
                                  checkAndRequestPermissions();
                                }
                              }}
                            >
                              <Image
                                source={require("../../Assets/Icons/Mike.png")}
                                style={{
                                  height: 22,
                                  width: 22,
                                  tintColor: iconTheme().iconColorNew,
                                }}
                              />
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </>
    );
  }, [
    ismultidelete,
    setismultidelete,
    setDisappearmsgchecked,
    setdisappeartime,
    disappeartime,
    disappearmsgchecked,
    disappearmsg,
    setDisappearmsg,
    flatListHeight,
    setFlatListHeight,
    filterMentionSuggestions,
    setMessageInput,
    messageInput,
    isnewblock,
    showReplyMessage,
    isRecording,
    setIsRecording,
    mentionSuggestions,
    isMentioning,
    setMentionSuggestions,
    setIsMentioning,
    searchtextnew,
    setSearchTextnew,
    mentionSuggestionsold,
    setMentionSuggestionsold,
  ]);

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
      flex: 1,
      backgroundColor: chatContainer().back_ground,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      position: "relative",
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
      width: "100%",
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
      width: "42%",
      flexDirection: "column",
    },
    name1conText: {
      fontSize: FontSize.font,
      fontFamily: font.bold(),
      color: colors.black,
      paddingLeft: 10,
    },
    name2conText: {
      fontSize: DeviceInfo.isTablet() ? 16 : 10,
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
      //marginLeft: 10,
      // marginRight: 10,
      flexDirection: "row",
      width: "30%",
      justifyContent: "flex-end",
      alignItems: "center",
      //backgroundColor:'red'
    },
    newChatIcon: {
      height: DeviceInfo.isTablet() ? 32 : 25,
      width: DeviceInfo.isTablet() ? 32 : 25,
      tintColor: iconTheme().iconColorNew,
      marginRight: 20,
    },
    newCallIcon: {
      height: 25,
      width: 25,
      tintColor: iconTheme().iconColorNew,
      marginRight: 10,
    },
    plusImage1Layout: {
      width: 20,
      height: 20,
      tintColor: iconTheme().iconColorNew,
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
    chatMainBubble: {
      flexDirection: "row",
      maxWidth: "80%",
      borderColor: "transparent",
      marginTop: 0,
      borderBottomLeftRadius: 10,
      borderTopLeftRadius: 10,
      borderBottomRightRadius: 20,
      padding: 2,
      paddingHorizontal: 16,
    },

    backgroundImageContainer: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      flexDirection: "row",
    },
    image: {
      flex: 1,
      paddingTop: 40,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    text: {
      color: COLORS.white,
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "left",
    },
    text_1: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "right",
      fontFamily: font.bold(),
    },
    flat_main_view: {
      justifyContent: "center",
      backgroundColor: "#fff",
      marginTop: 10,
    },
    flat_view: {
      paddingStart: 10,
    },
    chat_view: {
      flex: 1,
      paddingVertical: 20,
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "lightgray",
      backgroundColor: "#fff",
    },
    chat_heading: {
      color: COLORS.black,
      fontSize: 25,
      fontWeight: "bold",
      fontFamily: font.bold(),
    },
    name_text: {
      color: appBarText().textColor,
      fontWeight: "bold",
      fontFamily: font.regular(),
      fontSize: FontSize.font,
    },
    massege_text: {
      color: COLORS.grey,
      fontSize: 15,
      fontFamily: font.regular(),
    },
    count: {
      backgroundColor: COLORS.yellow_light,
      width: 20,
      borderRadius: 32,
      textAlign: "center",
      color: COLORS.white,
    },
    dot: {
      backgroundColor: COLORS.yellow,
      width: 10,
      height: 10,
      borderRadius: 35,
      left: 42,
      top: 10,
    },
    chatDetailHeader: {
      height: 70,
      width: "100%",
    },
    headerImageContainer: {
      width: "15%",
      justifyContent: "center",
      height: "100%",
    },
    headerBackgroundImage: {
      height: "100%",
      width: "100%",
    },
    userImage: {
      height: 50,
      width: 50,
      borderRadius: 50,
    },
    userStatusContainer: {
      width: "60%",
      justifyContent: "center",
    },
    HeaderUserName: {
      color: "#fff",
      fontSize: 18,
      fontFamily: font.bold(),
      fontWeight: "700",
    },
    headerThreeDotContainer: {
      width: "15%",
      alignItems: "center",
      justifyContent: "center",
    },
    HeaderUserStatus: {
      color: "#fff",
      fontSize: 15,
      fontFamily: font.bold(),
    },
    headerBackButtonContainer: {
      width: "10%",
      alignItems: "center",
      justifyContent: "center",
    },
    chatMainContainer: {
      backgroundColor: "red",
    },
    fileAttachment: {
      height: 22,
      width: 22,
    },
    stickerMainView: {
      backgroundColor: "#fff",
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
    },
    stickerRowView: {
      flexDirection: "row",
      width: "100%",
      flexWrap: "wrap",
      marginTop: 50,
    },
    stickerView: {
      width: "15%",
      padding: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    stickerBottomTab: {
      position: "absolute",
      height: 40,
      backgroundColor: "#ccffcc",
      bottom: Platform.OS == "android" ? 20 : 80,
      flexDirection: "row",
      overflow: "hidden",
      zIndex: 1,
    },
    keyboardTopButtonView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      top: 10,
      alignSelf: "center",
      width: 60,
    },
    keyboardTopButtonIcon: {
      height: 20,
      width: 20,
    },
    buyButton: {
      position: "absolute",
      right: 20,
      bottom: 0,
      backgroundColor: COLORS.yellow,
      padding: 5,
    },
    plusModalContainer: {
      width: "100%",
      position: "absolute",
      bottom: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    plusModalRowContainer: {
      alignItems: "center",
      backgroundColor: "#fff",
      width: "90%",
      marginRight: 10,
      borderRadius: 15,
    },
    plusModalImageTextConatiner: {
      width: "100%",
      borderBottomWidth: 0.2,
      padding: 5,
      borderColor: COLORS.grey,
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
    carouselContainer: {
      height: 180,
      width: "100%",
    },
    headerSearchContainer: {
      width: "20%",
      justifyContent: "center",
      alignItems: "center",
    },
    searchBox: {
      flexDirection: "row",
      borderRadius: 5,
      shadowColor: "black",
      backgroundColor: "#fff",
      padding: 0,
      shadowOffset: {
        width: 1,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 8,
      justifyContent: "center",
    },
    mainContainer: {
      flexDirection: "row",
    },
    imageContainer: {
      width: 50,
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    userProfile: {
      height: 50,
      width: 50,
      borderWidth: 1,
      borderRadius: 25,
      borderColor: "transparent",
    },
    textContainer: {
      width: "65%",
      paddingHorizontal: 10,
    },
    friendName: {
      fontSize: 16,
      color: COLORS.black,
      fontFamily: font.regular(),
      textTransform: "capitalize",
    },
    friendTagline: {
      color: "darkgray",
      marginTop: 5,
      fontSize: 15,
    },
    chatModalContainer: {
      position: "absolute",
      bottom: 70,
      left: 5,
      right: 5,
    },
    chatModalTextContainer: {
      height: 40,
      backgroundColor: "#fff",
      marginHorizontal: 10,
      alignItems: "center",
      flexDirection: "row",
    },
    checkBoxContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "20%",
    },
    reportImageLayout: {
      width: 22,
      height: 22,
      tintColor: iconTheme().iconColorNew,
      marginRight: 5,
      marginLeft: 5,
    },
    forWord_icon: {
      width: 20,
      height: 20,
      tintColor: iconTheme().iconColorNew,
      marginRight: 5,
      marginLeft: 5,
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

  const [stopgifsend, setstopgifsend] = useState(true);
  useFocusEffect(
    React.useCallback(() => {
      if (!stopgifsend) {
        setstopgifsend(true);
      }
    }, [stopgifsend])
  );

  const onImageChange = async ({ nativeEvent }) => {
    if (stopgifsend && !reportModal) {
      const { linkUri } = nativeEvent;

      const mId = Math.floor(Math.random() * 9000) + 1000;
      const paramsOfSend = {
        mId: mId,
        roomId: newroomID,
        fromUser: globalThis.userChatId,
        userName: globalThis.displayName,
        currentUserPhoneNumber: globalThis.phone_number,
        message: "",
        message_type: "sticker",
        attachment: [linkUri],
        isBroadcastMessage: false,
        isDeletedForAll: false,
        parent_message: {},
        isForwarded: false,
        storyId: "",
        isStoryRemoved: false,
        resId: chatMessageTime,
        broadcastMessageId: "",
        seenCount: 0,
        deliveredCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });
      onSend([
        {
          resId: chatMessageTime,
          text: "",
          messageType: "sticker",
          _id: mId,
          messageId: "",
          system: false,
          status: "",
          createdAt: new Date(),
          isForwarded: false,
          image: [linkUri],
          video: [],
          audio: [],
          attachment: [linkUri],
          isDeletedForAll: false,
          parent_message: {},
          user: { _id: globalThis.userChatId },
          unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
        },
      ]);
      const paramsOfSendforlive = {
        mId: mId,
        userName: globalThis.displayName,
        phoneNumber: globalThis.phone_number,
        currentUserPhoneNumber: globalThis.phone_number,
        userImage: globalThis.image,
        roomId: newroomID,
        roomName: mainprovider?.userName,
        roomImage: mainprovider?.userImage,
        roomType: mainprovider?.roomType,
        roomOwnerId: globalThis.userChatId,
        message: "",
        message_type: "sticker",
        roomMembers:
          mainprovider?.roomType !== "single"
            ? []
            : [
                mainprovider?.friendId && mainprovider?.friendId != 0
                  ? mainprovider?.friendId
                  : "",
              ],

        parent_message_id: "",
        attachment: [linkUri],
        from: globalThis.userChatId,
        resId: chatMessageTime,
        createdAt: new Date(),
      };

      socket.emit("sendmessage", paramsOfSendforlive);
      console.log("paramsOfSendforlive", paramsOfSendforlive);
    }
  };

  const handleSwipeRight = (message) => {
    setMessageClicked(message.currentMessage);
    setMessageClickedId([message.currentMessage.messageId]);
    setTimeout(() => {
      setShowReplyMessage(true);
    }, 200);
  };

  const handleSwipeRightcancle = () => {
    setMessageClicked({});
    setMessageClickedId("");
    setShowReplyMessage(false);
  };

  const renderSystemMessage = useCallback((props: object) => {
    return (
      <View>
        {props?.currentMessage?.messageType == "systemmessage" ? (
          <View
            style={{
              backgroundColor: chatTop().back_ground,
              borderRadius: 13,
              flexDirection: "row",
              alignSelf: "center",
              marginHorizontal: 30,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                backgroundColor: iconTheme().iconColorNew,
                width: 32,
                borderRadius: 13,
                borderBottomRightRadius: 0,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                style={{ height: 25, width: 25 }}
                resizeMode="center"
                source={require("../../Assets/Icons/msgicon.png")}
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                color: iconTheme().iconColorNew,
                fontFamily: font.semibold(),
                paddingHorizontal: 10,
                paddingVertical: 10,
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              {props?.currentMessage?.text}
            </Text>
          </View>
        ) : (
          <SystemMessage
            {...props}
            containerStyle={{
              marginBottom: 15,
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
        )}
      </View>
    );
  }, []);

  const handleDocumentPress = async (path) => {
    if (Platform.OS == "android") {
      setloaderMoedl(true);
    }
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

      const mediaName = path[0].split("/").pop();
      const mediaId = mediaName.split(".").slice(0, -1).join(".");
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

      // Open the file after the delay
      FileViewer.open(destinationPath)
        .then(() => {
          console.log("File opened successfully");
        })
        .catch((error) => {
          console.error("Error opening file with FileViewer:", error);
        });
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      if (Platform.OS == "android") {
        setloaderMoedl(false);
      }
      // setloaderMoedl(false); // Hide loader after operations complete
    }
  };

  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToTop = 50;
    return (
      contentSize.height - layoutMeasurement.height - paddingToTop <=
      contentOffset.y
    );
  };

  // const getPaginationDataFromApi = async (createAt) => {
  //   const lastMessageTimeISO = new Date(createAt).toISOString();
  //   axios
  //     .get(`${chatBaseUrl}${newRoomChatSyncApi}`, {
  //       params: {
  //         userId: globalThis.userChatId,
  //         roomIds: newroomID,
  //         limit:75,
  //         skip:0,
  //         lastMessageTime:lastMessageTimeISO
  //       },
  //       headers: {
  //         "Content-Type": "application/json",
  //         api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
  //       },
  //     })
  //     .then((syncResponse) => {
  //       if (syncResponse.data.status) {
  //         const ress = { chats: syncResponse.data.data || [] };
  //         insertRoomSql3(ress, globalThis.userChatId, async (status) => {
  //           if (status == true) {
  //             let LIMIT = 75
  //             paginationData(LIMIT, SKIP);
  //             setSkip(LIMIT + SKIP);

  //             await AsyncStorage.setItem("lastsynctime", `${Date.now()}`).catch(
  //               (err) =>
  //                 console.error("Error saving sync time to AsyncStorage:", err)
  //             );
  //           }
  //         });
  //       } else {
  //         console.warn("Room sync response status is false");
  //       }
  //     })
  //     .catch((err) => {
  //       console.error(
  //         "Error syncing room IDs:",
  //         err.response || err.message || err
  //       );
  //     });
  // };

  // const paginationData = (limit: number, skip: number) => {
  //   console.log('limit============',limit);
  //   console.log('skip============',skip);

  //   // if (!route.params.isFromPublicPage) {
  //   const lastMessage = messages[messages.length - 1];
  //   const lastCreatedAt = lastMessage.createdAt;

  //   console.log("CreatedAt of the last message:", lastCreatedAt);
  //   getAllChatTableData(
  //     "table_user",
  //     newroomID,
  //     skip,
  //     limit,
  //     mainprovider.roomType,
  //     (data) => {
  //       messageDelAndDis(data.disapperIds);
  //       setisloadearly(true);
  //       if (data.temp.length > 0) {
  //         setIsTop(false);
  //         // setMessages((previousMessages) =>
  //         //   GiftedChat.append(data.temp, previousMessages)
  //         // );
  //         const filteredMessages = messages.filter(
  //           (message) =>
  //             message._id !== 1 && // Filter out messages with _id === 1
  //             !data.temp.some(
  //               (newMessage) => newMessage.resId === message.resId
  //             )
  //         );

  //         // Concatenate filtered messages with new messages from data.temp
  //         const newMessages = [...filteredMessages, ...data.temp];

  //         // Update messages state
  //         setMessages(newMessages);
  //       } else {
  //         console.log("in else---------------");
  //         getPaginationDataFromApi(lastCreatedAt);
  //         setisloadearly(false);
  //       }
  //     }
  //   );

  //   // }
  // };

  let lastFetchedMessageId = null; // Track the ID of the last fetched message

  const getPaginationDataFromApi = async (createAt) => {
    try {
      const lastMessageTimeISO = new Date(createAt).toISOString();
      console.log(
        "globalThis.userChatId====================================",
        globalThis.userChatId
      );
      console.log("newroomID====", newroomID);
      console.log(
        "lastMessageTimeISO====================================",
        lastMessageTimeISO
      );
      const syncResponse = await axios.get(
        `${chatBaseUrl}${newRoomChatSyncApi}`,
        {
          params: {
            userId: globalThis.userChatId,
            roomIds: newroomID,
            limit: 75,
            skip: 0,
            lastMessageTime: lastMessageTimeISO,
          },
          headers: {
            "Content-Type": "application/json",
            api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
          },
        }
      );

      if (syncResponse.data.status) {
        const chats = syncResponse.data.data || [];
        console.log("chats====================================", chats);

        if (chats.length === 0 || chats[0]?._id === lastFetchedMessageId) {
          console.log(
            "No new data to fetch from the API. Stopping pagination."
          );
          setisloadearly(false);
          return; // Exit if no new data
        }

        // Update the last fetched message ID
        lastFetchedMessageId = chats[0]?._id; // Replace _id with your unique identifier

        const ress = { chats };
        insertRoomSql3(ress, globalThis.userChatId, async (status) => {
          if (status === true) {
            const LIMIT = 75;
            paginationData(LIMIT, SKIP);
            setSkip(LIMIT + SKIP);

            await AsyncStorage.setItem("lastsynctime", `${Date.now()}`).catch(
              (err) =>
                console.error("Error saving sync time to AsyncStorage:", err)
            );
          }
        });
      } else {
        console.warn("Room sync response status is false");
      }
    } catch (err) {
      console.error(
        "Error syncing room IDs:",
        err.response || err.message || err
      );
    }
  };

  const paginationData = (limit, skip) => {
    const lastMessage = messages[messages.length - 1];
    const lastCreatedAt = lastMessage?.createdAt; // Ensure lastMessage exists

    getAllChatTableData(
      "table_user",
      newroomID,
      skip,
      limit,
      mainprovider.roomType,
      (data) => {
        messageDelAndDis(data.disapperIds);
        setisloadearly(true);

        if (data.temp.length > 0) {
          setIsTop(false);

          const filteredMessages = messages.filter(
            (message) =>
              message._id !== 1 &&
              !data.temp.some(
                (newMessage) => newMessage.resId === message.resId
              )
          );

          const newMessages = [...filteredMessages, ...data.temp];
          setMessages(newMessages);
        } else {
          console.log(
            "No more messages in local storage. Fetching from API..."
          );
          if (!lastCreatedAt) {
            console.log("No lastCreatedAt, stopping further pagination.");
            setisloadearly(false);
            return; // Exit if no valid last message timestamp
          }

          getPaginationDataFromApi(lastCreatedAt);
        }
      }
    );
  };

  const onSelectMessage = (messageId) => {
    const isSelected = selectedMessageId.includes(messageId);

    if (isSelected) {
      setSelectedMessageId((prevIds) =>
        prevIds.filter((id) => id !== messageId)
      ); // Deselect if already selected
    } else {
      setSelectedMessageId((prevIds) => [...prevIds, messageId]); // Select the message
    }
  };
  const onSelectMessageothers = (messageId) => {
    const isSelected = othermessagearray.includes(messageId);
    if (isSelected) {
      setothermessagearray((prevIds) =>
        prevIds.filter((id) => id !== messageId)
      ); // Deselect if already selected
    } else {
      setothermessagearray((prevIds) => [...prevIds, messageId]); // Select the message
    }
  };

  // const scaleAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef({});
  const apiKey = "AIzaSyCWQ0n4Mf6SClp4G1cD5ng9w-4RZ3pXsaw";

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

  const renderBubble = useCallback(
    (props: object) => {
      if (!scaleAnimation.current[props?.currentMessage.messageId]) {
        scaleAnimation.current[props?.currentMessage.messageId] =
          new Animated.Value(1);
      }
      const isSelected = selectedMessageId.includes(
        props?.currentMessage?.messageId
      );
      return (
        <Animated.View
          style={{
            width: "100%",
            alignSelf: "center",
            transform: [
              {
                scale: scaleAnimation.current[props?.currentMessage.messageId],
              },
            ],
          }}
        >
          {ismultidelete && !props?.currentMessage?.isDeletedForAll && (
            <TouchableOpacity
              style={{
                position: "absolute",
                left:
                  ismultidelete &&
                  props?.currentMessage?.user._id !== globalThis.userChatId
                    ? 0
                    : 10,
                zIndex: 50,
                top: "35%",
              }}
              onPress={() => {
                onSelectMessage(props?.currentMessage?.messageId);
                if (props?.currentMessage?.user._id !== globalThis.userChatId) {
                  onSelectMessageothers(props?.currentMessage?.messageId);
                }
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
                      source={require("../../Assets/Icons/bx_check.png")}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          <GestureHandlerRootView>
            <View
              style={{
                position: "relative",
                marginLeft:
                  ismultidelete &&
                  props?.currentMessage?.user._id !== globalThis.userChatId
                    ? 35
                    : 0,
              }}
            >
              <Animatedcomponent
                data={props}
                handleSwipeRight={handleSwipeRight}
                content={
                  <View
                    style={{
                      position: "relative",
                      flex: 1,
                      alignSelf:
                        props?.currentMessage?.user._id !==
                        globalThis.userChatId
                          ? "flex-start"
                          : "flex-end",
                    }}
                  >
                    <Bubble
                      {...props}
                      isCustomViewBottom={false}
                      renderCustomView={(props: object) => {
                        if (
                          props?.currentMessage?.messageType === "contact" &&
                          !props?.currentMessage?.isDeletedForAll
                        ) {
                          return (
                            <View style={{ overflow: "hidden" }}>
                              {props?.currentMessage?.attachment.map(
                                (videoUri, index) => (
                                  <TouchableOpacity
                                    key={index}
                                    onPressIn={() =>
                                      handlePressIn(
                                        props?.currentMessage?.messageId
                                      )
                                    }
                                    onPressOut={() =>
                                      handlePressOut(
                                        props?.currentMessage?.messageId
                                      )
                                    }
                                    onLongPress={() => {
                                      setreactmsgon(true);
                                      setreactmsgondata(props.currentMessage);
                                      setMessageClicked(props.currentMessage);
                                      setMessageClickedId([
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
                                      );
                                    }}
                                    style={{ padding: 5, width: 200 }}
                                  >
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                                        padding: 5,
                                        borderRadius: 5,
                                      }}
                                    >
                                      <View>
                                        <Text
                                          style={{
                                            fontSize: 17,
                                            marginRight: 20,
                                            fontFamily: font.semibold(),
                                            color: COLORS.black,
                                          }}
                                        >
                                          {videoUri?.name}
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: 16,
                                            marginRight: 20,
                                            fontFamily: font.semibold(),
                                          }}
                                        >
                                          {videoUri?.number}
                                        </Text>
                                      </View>
                                    </View>
                                    <TouchableOpacity
                                      onPress={() => {
                                        contactsave(videoUri);
                                        ReactNativeHapticFeedback.trigger(
                                          "impactHeavy",
                                          {
                                            enableVibrateFallback: true,
                                            ignoreAndroidSystemSettings: false,
                                          }
                                        );
                                      }}
                                      style={{
                                        backgroundColor: "#fff",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingVertical: 8,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        borderColor: "transparent",
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontSize: 15,
                                          fontFamily: font.semibold(),
                                          color: iconTheme().iconColorNew,
                                        }}
                                      >
                                        {t("Save_Contact")}
                                      </Text>
                                    </TouchableOpacity>
                                  </TouchableOpacity>
                                )
                              )}
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginHorizontal: 5,
                                }}
                              >
                                {props?.currentMessage?.status == "" &&
                                  uploadProgress.map((progress, index) => (
                                    <View
                                      key={index}
                                      style={{
                                        width:
                                          props?.currentMessage?.attachment
                                            .length == 1
                                            ? 190
                                            : 310 /
                                              props?.currentMessage?.attachment
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
                                          backgroundColor: "#0f0", // Change color as needed
                                        }}
                                      />
                                    </View>
                                  ))}
                              </View>
                            </View>
                          );
                        }

                        if (
                          props?.currentMessage?.messageType === "location" &&
                          !props?.currentMessage?.isDeletedForAll
                        ) {
                          return (
                            <View>
                              <TouchableOpacity
                                onPressIn={() =>
                                  handlePressIn(
                                    props?.currentMessage?.messageId
                                  )
                                }
                                onPressOut={() =>
                                  handlePressOut(
                                    props?.currentMessage?.messageId
                                  )
                                }
                                onLongPress={() => {
                                  setreactmsgon(true);
                                  setreactmsgondata(props.currentMessage);
                                  setMessageClicked(props.currentMessage);
                                  setMessageClickedId([
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
                                  );
                                  const scheme = Platform.select({
                                    ios: "maps://0,0?q=",
                                    android: "geo:0,0?q=",
                                  });
                                  const latLng = `${props?.currentMessage?.attachment[0].lat},${props?.currentMessage?.attachment[0].long}`;
                                  const url = Platform.select({
                                    ios: `${scheme}@${latLng}`,
                                    android: `${scheme}${latLng}`,
                                  });

                                  Linking.openURL(url);
                                }}
                              >
                                <ImageBackground
                                  source={{
                                    uri: `https://maps.google.com/maps/api/staticmap?center=${
                                      props?.currentMessage?.attachment[0].lat
                                    },${
                                      props?.currentMessage?.attachment[0].long
                                    }&zoom=${30}&size=240x150&scale=50&maptype=normal&key=${apiKey}&markers=icon:https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740__480.png|${
                                      props?.currentMessage?.attachment[0].lat
                                    },${
                                      props?.currentMessage?.attachment[0].long
                                    }`,
                                  }} // Update the path or use a URL
                                  style={{
                                    position: "relative",
                                    height: 130,
                                    width: 200,
                                    margin: 5,
                                  }}
                                ></ImageBackground>
                              </TouchableOpacity>
                            </View>
                          );
                        }

                        if (
                          props?.currentMessage?.messageType === "sticker" &&
                          !props?.currentMessage?.isDeletedForAll
                        ) {
                          return (
                            <TouchableOpacity
                              onPressIn={() =>
                                handlePressIn(props?.currentMessage?.messageId)
                              }
                              onPressOut={() =>
                                handlePressOut(props?.currentMessage?.messageId)
                              }
                              onLongPress={() => {
                                setreactmsgon(true);
                                setreactmsgondata(props.currentMessage);
                                setMessageClicked(props.currentMessage);
                                setMessageClickedId([
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
                                );
                              }}
                              style={{ overflow: "hidden" }}
                            >
                              {props?.currentMessage?.attachment.map(
                                (item, index) => (
                                  <Image
                                    key={index}
                                    source={{ uri: item }}
                                    style={{
                                      height: 150,
                                      width: 150,
                                      overflow: "hidden",

                                      borderTopLeftRadius:
                                        props?.currentMessage.user?._id ==
                                        globalThis.userChatId
                                          ? 13
                                          : 0,

                                      borderTopRightRadius:
                                        props?.currentMessage.user?._id !==
                                        globalThis.userChatId
                                          ? 13
                                          : 0,
                                    }}
                                    resizeMode="cover"
                                  />
                                )
                              )}
                            </TouchableOpacity>
                          );
                        }

                        if (
                          props?.currentMessage?.isForwarded &&
                          !props?.currentMessage?.isDeletedForAll
                        ) {
                          return (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 10,
                                paddingTop: 10,
                              }}
                            >
                              <Image
                                source={require("../../Assets/Icons/forward.png")}
                                style={{
                                  width: 20,
                                  height: 20,
                                  marginRight: 20,
                                  marginLeft: 10,
                                }}
                              />
                              {/* <Text style={{ fontFamily: font.semibold() }}>
                                {t("Send")}
                              </Text> */}
                              <Text style={{ fontFamily: font.semibold() }}>
                                {t("forwarded")}
                              </Text>
                            </View>
                          );
                        }
                        if (
                          props?.currentMessage?.messageType === "document" &&
                          !props?.currentMessage?.isDeletedForAll
                        ) {
                          return (
                            <View>
                              {props?.currentMessage?.attachment.map(
                                (videoUri, index) => (
                                  <TouchableOpacity
                                    key={index}
                                    onPressIn={() =>
                                      handlePressIn(
                                        props?.currentMessage?.messageId
                                      )
                                    }
                                    onPressOut={() =>
                                      handlePressOut(
                                        props?.currentMessage?.messageId
                                      )
                                    }
                                    onLongPress={() => {
                                      setreactmsgon(true);
                                      setreactmsgondata(props.currentMessage);
                                      setMessageClicked(props.currentMessage);
                                      setMessageClickedId([
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
                                      !props?.currentMessage?.localPaths
                                        ?.length > 0
                                        ? MediaDownload(
                                            "chat",
                                            props.currentMessage,
                                            newroomID,
                                            MediaUpdated
                                          )
                                        : handleDocumentPress(
                                            props?.currentMessage?.localPaths
                                          );
                                      ReactNativeHapticFeedback.trigger(
                                        "impactHeavy",
                                        {
                                          enableVibrateFallback: true,
                                          ignoreAndroidSystemSettings: false,
                                        }
                                      );
                                    }}
                                    style={{ padding: 5, width: 200 }}
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
                                        source={require("../../Assets/Icons/pdfview.png")} // Replace with your document icon image
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
                                        props?.currentMessage?.localPaths
                                          ?.length == 0,

                                        <View>
                                          {mediaLoaderdata[
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
                                                marginLeft: 25,
                                              }}
                                            >
                                              <ActivityIndicator
                                                size="small"
                                                color="#000000"
                                              />
                                            </View>
                                          ) : (
                                            <Image
                                              source={require("../../Assets/Icons/downloadFile.png")} // Replace with your document icon image
                                              style={{
                                                width: 24,
                                                height: 24,
                                                marginRight: 8,
                                                opacity: 0.6,
                                                marginLeft: 25,
                                              }}
                                            />
                                          )}
                                        </View>
                                      )}
                                      {/* {renderIf(
                                          !props?.currentMessage?.localPaths
                                            ?.length > 0,
                                          <Image
                                            source={require("../../Assets/Icons/downloadFile.png")} // Replace with your document icon image
                                            style={{
                                              width: 24,
                                              height: 24,
                                              marginRight: 8,
                                              opacity: 0.6,
                                              marginLeft: "auto",
                                            }}
                                          />
                                        )} */}
                                    </View>
                                  </TouchableOpacity>
                                )
                              )}
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginHorizontal: 5,
                                }}
                              >
                                {props?.currentMessage?.status == "" &&
                                  uploadProgress.map((progress, index) => (
                                    <View
                                      key={index}
                                      style={{
                                        width:
                                          props?.currentMessage?.attachment
                                            .length == 1
                                            ? 190
                                            : 310 /
                                              props?.currentMessage?.attachment
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
                                  ))}
                              </View>
                            </View>
                          );
                        }

                        if (
                          props?.currentMessage?.parent_message?.resId &&
                          !props?.currentMessage?.isDeletedForAll
                        ) {
                          return (
                            <TouchableOpacity
                              onPressIn={() =>
                                handlePressIn(props?.currentMessage?.messageId)
                              }
                              onPressOut={() =>
                                handlePressOut(props?.currentMessage?.messageId)
                              }
                              onLongPress={() => {
                                setreactmsgon(true);
                                setreactmsgondata(props.currentMessage);
                                setMessageClicked(props.currentMessage);
                                setMessageClickedId([
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
                                scrolltoparentmessage(
                                  props?.currentMessage?.parent_message
                                    ?.messageId ||
                                    props?.currentMessage?.parent_message?._id
                                );
                              }}
                              style={{ padding: 8 }}
                            >
                              <View
                                style={{
                                  // color: COLORS.black,
                                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                                  padding: 5,
                                  paddingLeft: 10,
                                  borderLeftWidth: 3,
                                  borderLeftColor: iconTheme().iconColorNew,
                                  borderRadius: 5,
                                  maxWidth: windowWidth - 120,
                                }}
                              >
                                {(props.currentMessage?.parent_message
                                  .message_type ||
                                  props.currentMessage?.parent_message
                                    .messageType) != "text" ? (
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <View>
                                      <Text
                                        style={{
                                          fontSize: 16,
                                          color: iconTheme().iconColorNew,
                                          fontFamily: font.semibold(),
                                        }}
                                        numberOfLines={1}
                                      >
                                        {globalThis.userChatId ===
                                        (props?.currentMessage.parent_message
                                          ?.user?._id ||
                                          props.currentMessage.parent_message
                                            .from)
                                          ? "You"
                                          : allmembers?.find(
                                              (member) =>
                                                member &&
                                                member._id ===
                                                  (props?.currentMessage
                                                    .parent_message?.user
                                                    ?._id ||
                                                    props.currentMessage
                                                      .parent_message.from)
                                            )?.name || ""}
                                      </Text>
                                      <View style={{ flexDirection: "row" }}>
                                        <Image
                                          source={
                                            props?.currentMessage.parent_message
                                              ?.message_type == "image" ||
                                            props?.currentMessage.parent_message
                                              ?.messageType == "image" ||
                                            props?.currentMessage.parent_message
                                              ?.message_type == "sticker" ||
                                            props?.currentMessage.parent_message
                                              ?.messageType == "sticker" ||
                                            props?.currentMessage.parent_message
                                              ?.message_type == "story" ||
                                            props?.currentMessage.parent_message
                                              ?.messageType == "story"
                                              ? require("../../Assets/Icons/Gallary.png")
                                              : (props?.currentMessage
                                                  .parent_message
                                                  ?.messageType ||
                                                  props?.currentMessage
                                                    .parent_message
                                                    ?.message_type) == "video"
                                              ? require("../../Assets/Icons/Gallary.png")
                                              : require("../../Assets/Icons/docs.png")
                                          }
                                          style={{
                                            height: 16,
                                            width: 16,
                                            tintColor: "#000",
                                          }}
                                        />
                                        <Text
                                          style={{
                                            textTransform: "capitalize",
                                            color: "#000",
                                            marginRight: 20,
                                            marginLeft: 3,
                                            fontSize: 12,
                                            fontFamily: font.semibold(),
                                          }}
                                        >
                                          {props?.currentMessage.parent_message
                                            ?.messageType ||
                                            props?.currentMessage.parent_message
                                              ?.message_type}
                                        </Text>
                                      </View>
                                    </View>

                                    {(props?.currentMessage?.parent_message
                                      ?.message_type == "image" ||
                                      props?.currentMessage?.parent_message
                                        ?.messageType == "image" ||
                                      props?.currentMessage?.parent_message
                                        ?.message_type == "sticker" ||
                                      props?.currentMessage?.parent_message
                                        ?.messageType == "sticker" ||
                                      props?.currentMessage?.parent_message
                                        ?.message_type == "video" ||
                                      props?.currentMessage?.parent_message
                                        ?.messageType == "video" ||
                                      props?.currentMessage?.parent_message
                                        ?.message_type == "story" ||
                                      props?.currentMessage?.parent_message
                                        ?.messageType == "story") && (
                                      <Image
                                        source={
                                          //
                                          props?.currentMessage.parent_message
                                            .attachment[0]?.file != undefined
                                            ? {
                                                uri:
                                                  props?.currentMessage
                                                    .parent_message
                                                    .attachment[0]?.file ||
                                                  props?.currentMessage
                                                    .parent_message
                                                    .attachment[0],
                                              }
                                            : require("../../Assets/Icons/Gallary.png")
                                        }
                                        style={{
                                          height: 40,
                                          width: 60,
                                          borderTopRightRadius: 8,
                                          borderBottomRightRadius: 8,
                                        }}
                                        resizeMode="contain"
                                      />
                                    )}
                                  </View>
                                ) : (
                                  // <Text style={{ fontFamily: font.semibold() }}>
                                  //   {props?.currentMessage?.parent_message
                                  //     ?.message
                                  //     ? CryptoJS.AES.decrypt(
                                  //         props?.currentMessage?.parent_message
                                  //           ?.message,
                                  //         EncryptionKey
                                  //       ).toString(CryptoJS.enc.Utf8)
                                  //     : props?.currentMessage?.parent_message
                                  //         .text}
                                  // </Text>
                                  <Text style={{ fontFamily: font.semibold() }}>
                                    {props?.currentMessage?.parent_message
                                      ?.message
                                      ? decryptMessage(
                                          newroomID,
                                          props?.currentMessage?.parent_message
                                            ?.message
                                        )
                                      : props?.currentMessage?.parent_message
                                          ?.text}
                                  </Text>
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                        }

                        if (props?.currentMessage?.messageType == "story") {
                          return (
                            <View style={{ padding: 8 }}>
                              <TouchableOpacity
                                onPressIn={() =>
                                  handlePressIn(
                                    props?.currentMessage?.messageId
                                  )
                                }
                                onPressOut={() =>
                                  handlePressOut(
                                    props?.currentMessage?.messageId
                                  )
                                }
                                onLongPress={() => {
                                  setreactmsgon(true);
                                  setreactmsgondata(props.currentMessage);
                                  setMessageClicked(props.currentMessage);
                                  setMessageClickedId([
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
                                  );
                                }}
                                style={{
                                  color: COLORS.black,
                                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                                  padding: 5,
                                  paddingLeft: 10,
                                  borderLeftWidth: 3,
                                  borderLeftColor: iconTheme().iconColorNew,
                                  borderRadius: 5,
                                }}
                              >
                                {(props.currentMessage?.message_type ||
                                  props.currentMessage?.messageType) !=
                                "text" ? (
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <View>
                                      <Text
                                        style={{
                                          fontSize: 16,
                                          color: iconTheme().iconColorNew,
                                          fontFamily: font.semibold(),
                                          marginRight: 10,
                                        }}
                                        numberOfLines={1}
                                      >
                                        {t("status")}
                                      </Text>
                                      <View style={{ flexDirection: "row" }}>
                                        {props?.currentMessage.attachment[0]
                                          .type !== "template" && (
                                          <Image
                                            source={require("../../Assets/Icons/Gallary.png")}
                                            style={{
                                              height: 16,
                                              width: 16,
                                              tintColor: "#000",
                                            }}
                                          />
                                        )}
                                        {props?.currentMessage.attachment[0]
                                          .type == "template" && (
                                          <Text
                                            style={{
                                              textTransform: "capitalize",
                                              color: "#000",
                                              marginRight: 20,
                                              fontFamily: font.semibold(),
                                              marginLeft: 3,
                                              fontSize: 12,
                                            }}
                                          >
                                            {
                                              props?.currentMessage
                                                .attachment[0]?.title
                                            }
                                          </Text>
                                        )}
                                      </View>
                                    </View>

                                    {props?.currentMessage &&
                                      props?.currentMessage.attachment[0]
                                        .type !== "template" && (
                                        <FastImage
                                          source={{
                                            uri: props?.currentMessage
                                              .attachment[0]?.file,
                                          }}
                                          style={{
                                            height: 40,
                                            width: 60,
                                            borderTopRightRadius: 8,
                                            borderBottomRightRadius: 8,
                                          }}
                                          resizeMode="cover"
                                        />
                                      )}
                                  </View>
                                ) : (
                                  // <Text style={{ fontFamily: font.semibold() }}>
                                  //   {props?.currentMessage?.parent_message
                                  //     .message
                                  //     ? CryptoJS.AES.decrypt(
                                  //         props.currentMessage.parent_message
                                  //           .message,
                                  //         EncryptionKey
                                  //       ).toString(CryptoJS.enc.Utf8)
                                  //     : props?.currentMessage?.parent_message
                                  //         .text}
                                  // </Text>
                                  <Text style={{ fontFamily: font.semibold() }}>
                                    {props?.currentMessage?.parent_message
                                      ?.message
                                      ? decryptMessage(
                                          newroomID,
                                          props?.currentMessage?.parent_message
                                            ?.message
                                        )
                                      : props?.currentMessage?.parent_message
                                          ?.text}
                                  </Text>
                                )}
                              </TouchableOpacity>
                            </View>
                          );
                        }
                      }}
                      wrapperStyle={{
                        right: {
                          backgroundColor: chat().back_ground_color,
                          marginBottom:
                            props?.currentMessage?.reactions &&
                            props?.currentMessage?.reactions?.length
                              ? 15
                              : 0,
                          // Change this to the color you want for your sent messages
                        },
                        left: {
                          backgroundColor: chatOther().back_ground_color,
                          marginBottom:
                            props?.currentMessage?.reactions &&
                            props?.currentMessage?.reactions?.length
                              ? 15
                              : 0,
                          // Change this to the color you want for received messages
                        },
                      }}
                      textStyle={{
                        right: {
                          fontSize: globalThis.chatFontsize,
                          color: "black",
                          fontFamily: font.semibold(), // Change this to set the text color for sent messages
                        },
                        left: {
                          fontSize: globalThis.chatFontsize,
                          color: "black",
                          fontFamily: font.semibold(), // Change this to set the text color for received messages
                        },
                      }}
                    />

                    {renderIf(
                      props?.currentMessage?.user._id !==
                        globalThis.userChatId &&
                        props?.currentMessage?.messageType == "text",
                      <TouchableOpacity
                        style={{
                          height: 40,
                          width: 50,
                          alignItems: "center",
                          justifyContent: "center",
                          // backgroundColor: "red",
                          position: "absolute",
                          right: 10,
                          top: 0,
                        }}
                        onPress={() =>
                          handleTranslateClick(props.currentMessage)
                        }
                      >
                        <Image
                          source={require("../../Assets/Icons/translate.png")}
                          style={{ height: 20, width: 20 }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    )}

                    {globalThis.isUserPremium && (
                      <>
                        {props?.currentMessage?.unreadCount >= 1 &&
                        props?.currentMessage?.status != "" ? (
                          newroomType != "single" ||
                          (newroomType == "single" &&
                            props?.currentMessage?.user._id ==
                              globalThis.userChatId) ? (
                            <View
                              style={{
                                backgroundColor: textTheme().textColor,
                                alignItems: "center",
                                justifyContent: "center",
                                position: "absolute",
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 1,
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                right:
                                  props?.currentMessage?.user._id !=
                                  globalThis.userChatId
                                    ? 28
                                    : "auto",
                                left:
                                  props?.currentMessage?.user._id ==
                                  globalThis.userChatId
                                    ? 28
                                    : "auto",
                                bottom:
                                  props?.currentMessage?.reactions &&
                                  props?.currentMessage?.reactions?.length > 0
                                    ? 28
                                    : 4,
                              }}
                            >
                              <Text
                                style={{
                                  paddingVertical: 2,
                                  color: COLORS.white,
                                  fontSize: 10,
                                  fontFamily: font.regular(),
                                  paddingHorizontal: 6,
                                }}
                              >
                                {props?.currentMessage?.unreadCount > 99
                                  ? "+99"
                                  : props?.currentMessage?.unreadCount}
                              </Text>
                            </View>
                          ) : (
                            <></>
                          )
                        ) : (
                          <></>
                        )}
                      </>
                    )}

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
                  </View>
                }
                isLeft={
                  props?.currentMessage?.user._id == globalThis.userChatId
                }
              />
            </View>
          </GestureHandlerRootView>
        </Animated.View>
      );
    },
    [
      messages,
      setMessages,
      ismultidelete,
      setSelectedMessageId,
      selectedMessageId,
      setothermessagearray,
      othermessagearray,
      remainingTime,
      setRemainingTime,
      mediaLoaderdata,
    ]
  );

  const getLatLongMethod = (currentLongitude) => {
    if (currentLongitude) {
      setLocationModel(false);
      setSendItems(false);
      const mId = Math.floor(Math.random() * 9000) + 1000;
      const paramsOfSend = {
        mId: mId,
        roomId: newroomID,
        fromUser: globalThis.userChatId,
        userName: globalThis.displayName,
        currentUserPhoneNumber: globalThis.phone_number,
        message: "",
        message_type: "location",
        attachment: [currentLongitude],
        isBroadcastMessage: false,
        isDeletedForAll: false,
        parent_message: {},
        isForwarded: false,
        storyId: "",
        isStoryRemoved: false,
        resId: chatMessageTime,
        broadcastMessageId: "",
        seenCount: 0,
        deliveredCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });

      const paramsOfSendlive = {
        mId: mId,
        isNotificationAllowed: isnewmute ? isnewmute : true,
        userName: globalThis.displayName,
        phoneNumber: globalThis.phone_number,
        currentUserPhoneNumber: globalThis.phone_number,
        userImage: globalThis.image,
        roomId: newroomID,
        roomName: mainprovider?.userName,
        roomImage: mainprovider?.userImage,
        roomType: mainprovider?.roomType,
        roomOwnerId: globalThis.userChatId,
        message: "",
        message_type: "location",
        roomMembers:
          mainprovider?.roomType !== "single"
            ? []
            : [
                mainprovider?.friendId && mainprovider?.friendId != 0
                  ? mainprovider?.friendId
                  : "",
              ],
        isForwarded: false,
        attachment: [JSON.stringify(currentLongitude)],
        from: globalThis.userChatId,
        resId: chatMessageTime,
        status: "",
        parent_message_id:
          showReplyMessage == true
            ? messageClickd.messageId || messageClickd._id
            : "",
        parent_message: messageClickd ? messageClickd : {},
        createdAt: new Date(),
        isDeletedForAll: false,
      };

      socket.emit("sendmessage", paramsOfSendlive);
      console.log("paramsOfSendforlive", paramsOfSendlive);

      onSend([
        {
          system: false,
          resId: chatMessageTime,
          text: "",
          messageType: "location",
          _id: mId,
          messageId: "",
          status: "",
          isForwarded: false,
          parent_message: messageClickd ? messageClickd : {},
          createdAt: new Date(),
          isDeletedForAll: false,
          image: [],
          video: [],
          attachment: [currentLongitude],

          user: { _id: globalThis.userChatId },
          unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
          isDeletedForAll: false,
        },
      ]);
    }
  };

  const renderTime = (props: object) => {
    return (
      <View
        style={{
          flexDirection:
            props?.currentMessage.user?._id == globalThis.chatUserId
              ? "row"
              : "row-reverse",
          alignItems: "center",
          paddingLeft: 5,
        }}
      >
        {props?.currentMessage?.shouldDisappear == 1 &&
          props?.currentMessage?.disappearMsgTime != null &&
          props?.currentMessage?.disappearMsgTime != 0 && (
            <ChatCounter message={props?.currentMessage?.disappearMsgTime} />
          )}

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

  const CustomDayComponent = (props: object) => {
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

  // const scale = React.useRef(new Animated.Value(1)).current;
  // const onPinchGestureEvent = Animated.event(
  //   [{ nativeEvent: { scale: scale } }],
  //   { useNativeDriver: true }
  // );
  const getContactData = (contactData) => {
    contactSelcted("", contactData?.contactName, contactData?.contactNumber);

    setSendItems(false);
  };

  function contactSelcted(image, name, number) {
    if (number) {
      if (newroomID) {
        removeCount(newroomID);
      }
      const mId = Math.floor(Math.random() * 9000) + 1000;

      const paramsOfSend = {
        mId: mId,
        roomId: newroomID,
        fromUser: globalThis.userChatId,
        userName: globalThis.displayName,
        phoneNumber: globalThis.phone_number,
        currentUserPhoneNumber: globalThis.phone_number,
        message: "",
        message_type: "contact",
        attachment: [
          {
            image: image,
            name: name,
            number: number,
          },
        ],
        isBroadcastMessage: false,
        isDeletedForAll: false,
        parent_message: {},
        isForwarded: false,
        storyId: "",
        isStoryRemoved: false,
        resId: chatMessageTime,
        broadcastMessageId: "",
        seenCount: 0,
        deliveredCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      insertChatList({
        paramsOfSend: paramsOfSend,
        chatRoom: true,
      });

      const paramsOfSendlive = {
        mId: mId,
        isNotificationAllowed: isnewmute ? isnewmute : true,
        userName: globalThis.displayName,
        userImage: globalThis.image,
        phoneNumber: globalThis.phone_number,
        currentUserPhoneNumber: globalThis.phone_number,
        roomId: newroomID,
        roomName: mainprovider?.userName,
        roomImage: mainprovider?.userImage,
        roomType: mainprovider?.roomType,
        roomOwnerId: globalThis.userChatId,
        message: "",
        message_type: "contact",
        roomMembers:
          mainprovider?.roomType !== "single"
            ? []
            : [
                mainprovider?.friendId && mainprovider?.friendId != 0
                  ? mainprovider?.friendId
                  : "",
              ],
        isForwarded: false,
        attachment: [
          JSON.stringify({
            image: image,
            name: name,
            number: number,
          }),
        ],
        from: globalThis.userChatId,
        resId: chatMessageTime,
        status: "",
        parent_message_id:
          showReplyMessage == true
            ? messageClickd.messageId || messageClickd._id
            : "",
        parent_message: messageClickd ? messageClickd : {},
        createdAt: new Date(),
        isDeletedForAll: false,
      };
      socket.emit("sendmessage", paramsOfSendlive);
      console.log("paramsOfSendforlive", paramsOfSendlive);
      onSend([
        {
          resId: chatMessageTime,
          text: "",
          messageType: "contact",
          _id: mId,
          messageId: "",
          system: false,
          status: "",
          isForwarded: false,
          parent_message: {},
          createdAt: new Date(),
          isDeletedForAll: false,
          image: [],
          video: [],
          attachment: [
            {
              image: image,
              name: name,
              number: number,
            },
          ],

          user: { _id: globalThis.userChatId, name: globalThis.name },
          unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
        },
      ]);

      setLocalContactModel(false);
    }
  }

  async function requestContactsPermission() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
      ]);
      return (
        granted[PermissionsAndroid.PERMISSIONS.READ_CONTACTS] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  async function contactsave(videoUri) {
    try {
      let permissionGranted = false;

      if (Platform.OS === "android") {
        permissionGranted = await requestContactsPermission();
      } else {
        const permission = await Contacts.checkPermission();
        if (permission === "undefined") {
          const requestPermission = await Contacts.requestPermission();
          permissionGranted = requestPermission === "authorized";
        } else {
          permissionGranted = permission === "authorized";
        }
      }

      if (!permissionGranted) {
        showToast(t("Contacts_permission_not_granted"));
        return;
      }

      const existingContacts = await Contacts.getContactsByPhoneNumber(
        videoUri?.number
      );
      if (existingContacts.length > 0) {
        showToast(t("Contact_with_this_number_already_exists"));
        return;
      }

      const newContact = {
        familyName: videoUri?.name,
        givenName: videoUri?.name,
        phoneNumbers: [{ label: "mobile", number: videoUri?.number }],
      };

      await Contacts.addContact(newContact);

      showToast(t("Contact_added_successfully"));
    } catch (error) {
      console.error("Error adding contact:", error);
      showToast(t("Error_adding_contact"));
    }
  }

  function TranslatedLangugae(data, translatedText) {
    const updatedMessages = messages?.map((message) => {
      // Check condition: if status is empty and resId matches
      if (message.resId == data.resId) {
        return {
          ...message,
          text: translatedText,
        };
      }
      return message; // For other messages, return as is
    });
    setMessages(updatedMessages);
  }

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

  const newChattingPress = ({
    profileImage,
    contactName,
    chatId,
    FriendNumber,
  }) => {
    dispatch(
      setMainprovider({
        friendId: chatId,
        userName: contactName,
        userImage: profileImage,
        roomType: "single",
        FriendNumber: FriendNumber,
        roomName: contactName,
      })
    );
    dispatch(setyesstart(true));
    dispatch(setnewroomType("single"));
    dispatch(
      setroominfo({
        roomImage: profileImage,
        roomName: contactName,
      })
    );
    dispatch(setisnewBlock(false));
    dispatch(setisnewmMute(true));
    dispatch(setisnewArchiveroom(false));
    dispatch(setnewroomID(""));
    navigation.push("ChattingScreen", {
      friendId: chatId,
      userName: contactName,
      userImage: profileImage,
      roomType: "single",
      inside: false,
      screenFrom: "Dashboard",
      FriendNumber: FriendNumber,
    });
  };

  function OnMuteChatClick() {
    setToShowMenu(false);
    mutechatfunct();
  }

  const deleteChat = async () => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + deletechatApi;
    try {
      const response = await axios({
        method: "DELETE",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userId: globalThis.userChatId,
          roomId: newroomID,
        },
      });

      if (response.data.status === true) {
        setloaderMoedl(false);
        deleteRoomId(newroomID);
        navigation.pop();
      } else {
        setloaderMoedl(false);
        // Alert.alert(response.data.message);
        globalThis.errorMessage = response.data.message;
        setErrorAlertModel(true);
      }
    } catch (error) {
      setloaderMoedl(false);
      console.log("sdfdsfdsfdsf", error);
      globalThis.errorMessage = error;
      setErrorAlertModel(true);
      // Alert.alert(error);
    }
  };

  const BlockChatApiCalling = async (opt) => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + blockApi;

    try {
      await axios({
        method: "post",
        url: urlStr,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${globalThis.token}`,
        },
        data: {
          from: globalThis.chatUserId,
          to: route.params.friendId,
          opt: opt,
          roomId: newroomID,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            updateblockuser(
              {
                fromuser: globalThis.chatUserId,
                touser: route.params.friendId,
              },
              opt == "block" ? "insert" : "remove",
              ({ status }) => {
                if (status) {
                  // Room Blocked
                } else {
                  console.log(
                    "while adding entry to block user status is false"
                  );
                }
              }
            );

            if (opt == "block") {
              socket.emit("leaveRoom", {
                roomId: newroomID,
                userId: globalThis.userChatId,
              });
            } else {
              socket.emit("joinRoom", {
                roomId: newroomID,
                userId: globalThis.userChatId,
              });
            }

            socket.emit("blockusers", {
              touser: route.params.friendId,
              fromuser: globalThis.chatUserId,
              isBlock: opt == "block",
            });
            blockRoom(newroomID, isnewblock);
            dispatch(setisnewBlock(!isnewblock));
            setUserBlocked(!userBlocked);
            setloaderMoedl(false);
            showToast(!isnewblock ? t("User_blocked") : t("User_Unblocked"));
          } else {
            // Alert.alert(response.data.message);
            globalThis.errorMessage = response.data.message;
            setErrorAlertModel(true);
          }
        })
        .catch((error) => {
          console.log("error", error);
          setloaderMoedl(false);
        });
    } catch (error) {
      console.log("error", error);
      setloaderMoedl(false);
    }
  };

  const mutechatfunct = async () => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + muteChatApi;
    try {
      await axios({
        method: "PATCH",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userId: globalThis.userChatId,
          roomId: newroomID,
          isNotificationAllowed: !isnewmute,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            showToast(isnewmute ? t("chat_muted") : t("chat_unmuted"));
            setloaderMoedl(false);
            dispatch(setisnewmMute(!isnewmute));
            muteroom(newroomID, isnewmute);
          } else {
            // Alert.alert(response.data.message);
            globalThis.errorMessage = response.data.message;
            setErrorAlertModel(true);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
          console.log("sdfdsfdsfdsf", error);
          // Alert.alert(error);
          globalThis.errorMessage = error;
          setErrorAlertModel(true);
        });
    } catch (error) {
      setloaderMoedl(false);
      console.log("sdfdsfdsfdsf", error);
      // Alert.alert(error);
      globalThis.errorMessage = error;
      setErrorAlertModel(true);
    }
  };

  function OnExitGroupClick() {
    setToShowMenu(false);
    exitAlert();
  }

  const exitAlert = () => {
    if (
      globalThis.userChatId == currentUserData?.owner ||
      currentUserData?.isAdmin == 1
    ) {
      globalThis.confirmAction = "DeleteGroupApi";

      globalThis.confirmMessage =
        newroomType == "multiple"
          ? t("Are_you_sure_you_want_to_deletethisgrouppermanently")
          : t("Are_you_sure_you_want_to_deletetbroad");

      setConfirmAlertModel(true);
      // Alert.alert(
      //   t("confirm"),
      //   newroomType == "multiple"
      //     ? t("Are_you_sure_you_want_to_deletethisgrouppermanently")
      //     : t("Are_you_sure_you_want_to_deletetbroad"),
      //   [
      //     {
      //       text: t("cancel"),
      //       onPress: () => console.log("No Pressed"),
      //       style: "cancel",
      //     },
      //     {
      //       text: t("yes"),
      //       onPress: () => DeleteGroupApi(),
      //     },
      //   ]
      // );
    } else {
      globalThis.confirmAction = "exitgroupChat";

      globalThis.confirmMessage = t("do_you_want_exit_this_group");

      setConfirmAlertModel(true);
      // Alert.alert(t("confirm"), t("do_you_want_exit_this_group"), [
      //   { text: t("cancel") },
      //   { text: t("yes"), onPress: () => exitgroupChat() },
      // ]);
    }
  };

  const exitNotify = () => {
    const mId = Math.floor(Math.random() * 9000) + 1000;

    const finalString =
      globalThis.displayName + " " + t("has_left_this_conversation");
    const paramsOfSendlive = {
      isNotificationAllowed: true,
      userName: globalThis.phone_number,
      userImage: globalThis.image,
      roomId: newroomID,
      roomName: roominfo.roomName,
      roomImage: roominfo.roomImage,
      roomType: "multiple",
      roomOwnerId: globalThis.userChatId,
      // message: CryptoJS.AES.encrypt(finalString, EncryptionKey).toString(),
      message: encryptMessage(newroomID, finalString),
      message_type: "notify",
      roomMembers: [],
      isForwarded: false,
      attachment: [],
      from: globalThis.userChatId,
      resId: Date.now(),
      status: "",
      parent_message_id: "",
      createdAt: new Date(),
      isDeletedForAll: false,
      mId: mId,
      phoneNumber: Number(globalThis.phone_number.substr(-10)),
      currentUserPhoneNumber: globalThis.phone_number,
      shouldDisappear: 0,
      disappearTime: 0,
    };

    socket.emit("sendmessage", paramsOfSendlive);
    console.log("paramsOfSendforlive", paramsOfSendlive);
  };

  const exitgroupChat = async () => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + exitgroupApi;
    try {
      exitNotify();
      const response = await axios({
        method: "DELETE",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userId: globalThis.userChatId,
          roomId: newroomID,
        },
      });

      if (response.data.status === true) {
        socket.emit("leaveRoom", {
          roomId: newroomID,
          userId: globalThis.userChatId,
        });

        getOldMembersFromRoomMembersSql(newroomID, async (res) => {
          let fData = {
            owner: "",
            roomName: "",
            roomImage: "",
            phone_number: "",
            name: "",
            image: "",
            allow: "",
            isPublic: false,
          };

          if (res.length <= 0) {
            // No Members Found!
            console.log("No Members Found !");
          } else {
            const idx = res.filter((f) => f.isAdmin == 1);
            try {
              fData = res[idx];

              // let sorted = [...res.filter((f) => f.isAdmin)].concat(
              //   res.filter((a) => a.isAdmin == 0).sort((a, b) => a.name - b.name)
              // );

              // setGroupDetailData(res);
              setCurrentUserData(fData);

              const remaningMembers: object[] = [] as object[];

              res.forEach((d) => {
                if (d.userId != globalThis.userChatId) {
                  remaningMembers.push({
                    chat_user_id: d.userId,
                    contact_name: d.userName || d.name || d.roomName,
                    profile_image: d.image,
                    phone_number: d.phone_number,
                    isAdmin: d.isAdmin,
                  });
                }
              });

              const chatIds: string[] = [] as string[];
              res.forEach((d) => {
                chatIds.push(d.userId);
              });

              socket.emit("updateGroupDetails", {
                new_group_name: roominfo.roomName,
                new_group_description: userstatus,

                new_group_allow: fData?.allow,
                new_group_image: roominfo.roomImage,
                remaningMembers: remaningMembers,
                membersList: chatIds,
                roomId: newroomID,

                isPublic: fData?.isPublic,
              });

              setloaderMoedl(false);
              drawerRef.current.close();
              blockRoom(newroomID, isnewblock);
              dispatch(setisnewBlock(!isnewblock));
            } catch (error) {
              console.log("errr", error);
            }
          }
        });
      } else {
        setloaderMoedl(false);
      }
    } catch (error) {
      setloaderMoedl(false);
    }
  };

  const DeleteGroupApi = async () => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + deleteGroup;
    try {
      const response = await axios({
        method: "DELETE",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
        },
        data: {
          roomId: newroomID,
        },
      });
      if (response.data.status === true) {
        DeleteTheGroup(newroomID);
        navigation.pop();
        setloaderMoedl(false);
      } else {
        setloaderMoedl(false);
      }
    } catch (error) {
      setloaderMoedl(false);
    }
  };

  function VideoClickFromSideMenu(item) {
    navigation.navigate("VideoPlayScreen", { videoUrl: item });
  }
  function OnNextClickMenu(MediaType, FileType, FromTab) {
    navigation.navigate("ShowAllMedia", {
      MediaType: MediaType,
      FileType: FileType,
      FromTab: FromTab,
    });
  }

  // const [currentIndex, setCurrentIndex] = useState(0);

  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [premiumAlertHeading, setpremiumAlertHeading] = useState("");
  const [premiumAlertSubHeading, setpremiumAlertSubHeading] = useState("");
  const [premiumAlertFirstButtonText, setpremiumAlertFirstButtonText] =
    useState("");
  const [premiumAlertSecondButtonText, setpremiumAlertSecondButtonText] =
    useState("");

  const Reactionapifunction = (messageId, reaction, react) => {
    const url = chatBaseUrl + reactionapi;
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
          roomId: newroomID,
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
              updatereactionsonnormal(id, updatedReactions); // Update reactions
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
              updatereactionsonnormal(id, updatedReactions); // Update reactions
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
            updatereactionsonnormal(id, updatedReactions); // Update reactions
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
          updatereactionsonnormal(id, updatedReactions); // Update reactions
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

  useEffect(() => {
    const handleReactionadd = (data) => {
      console.log("reaction on/:", data);
      if (data.user != globalThis.userChatId) {
        updatereactionsforothernormal(
          data.messageId,
          data.isAdd,
          data.reaction,
          data.user,
          () => {
            console.log("yes done");
            if (
              newroomID == data.roomId &&
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

                  console.log("userInReaction", existingReactionIndex);
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
                        updatereactionsforothernormal(
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
                        const updatedReactions = reactions.map(
                          (reaction, index) =>
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
                        updatereactionsforothernormal(
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
                      const updatedReactions = reactions.map(
                        (reaction, index) =>
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
                      updatereactionsforothernormal(
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
                    updatereactionsforothernormal(
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
          }
        );
      }
    };

    socket.on("message-reaction", handleReactionadd);

    return () => {
      socket.off("message-reaction", handleReactionadd);
    };
  });

  const confirmActionPressed = (actionPerformed) => {
    console.log("actionPerformed", actionPerformed);

    switch (actionPerformed) {
      case "DeleteGroupApi":
        DeleteGroupApi();
        break;
      case "exitgroupChat":
        exitgroupChat();
        break;
      case "OnChatModalTextClick":
        OnChatModalTextClick("Delete for all");
        break;
      case "Delete":
        OnChatModalTextClick("Delete");
        break;
      // case "removeMember":
      //   // Retrieve parameters from `confirmParams`
      //   const { newroomID, userId, userName } = globalThis.confirmParams;
      //   removeMember(newroomID, userId, userName);
      //   break;
      // Add more cases as needed
      default:
        console.warn("No action found for:", actionPerformed);
    }
  };

  return (
    <Drawer
      tweenDuration={250} // Adjust animation duration as needed
      useNativeAnimations={true} // Enable native animations for smoother performance
      easing="linear" // Adjust the duration as needed
      onDragStart={() => setDrawerGauster(false)}
      onClose={onCloseDrawer}
      tweenHandler={(ratio) => ({
        mainOverlay: {
          opacity: ratio / 2,
          backgroundColor: "black",
        },
        main: { opacity: (2 - ratio) / 2 },
      })}
      useInteractionManager={true}
      side="right"
      type="overlay"
      acceptPan={!drawerGauster}
      ref={drawerRef}
      content={
        <SideMenu
          visible={true}
          onRequestClose={closeDrawer}
          // autoCloseTimeout={5000}
          roomId={newroomID}
          roomType={newroomType}
          roomImage={roominfo.roomImage}
          roomName={roominfo.roomName}
          chatId={mainprovider.friendId}
          contactId={calling_userID}
          onMuteclick={OnMuteChatClick}
          OnExitGroupClick={OnExitGroupClick}
          isUserBlock={isnewblock}
          OnNextClickMenu={OnNextClickMenu}
          mygroupimg={mygroupimg}
          deleteChat={deleteChat}
          UserActivity={BlockChatApiCalling}
          navigation={navigation}
          isLock={isLock}
          newChattingPress={newChattingPress}
          getProfileApi={handleApiCalls}
          getParticipantList={participantListData}
          getParticipantListFrom={setParticipantsFrom}
          onVideoClick={VideoClickFromSideMenu}
          isnewmute={isnewmute}
          setCurrentUserData={setCurrentUserData}
          setShowPremiumAlert={setShowPremiumAlert}
          premiumAlertHeading={setpremiumAlertHeading}
          premiumAlertSubHeading={setpremiumAlertSubHeading}
          premiumAlertFirstButtonText={setpremiumAlertFirstButtonText}
          premiumAlertSecondButtonText={setpremiumAlertSecondButtonText}
          allowGroupCall={route?.params?.isPublic}
        />
      }
      tapToClose={true}
      negotiatePan={true}
      openDrawerOffset={0.2}
      panOpenMask={0.1}
    >
      <View style={{ flex: 1, position: "relative" }}>
        <ChannelTypeModal
          visible={isChannelTypeModal}
          isPublicSelected={publicSelected}
          onRequestClose={() => setChannelTypeModal(false)}
          onNextClick={AfterChoosingChannelType}
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

        <ErrorAlertModel
          visible={errorAlertModel}
          onRequestClose={() => setErrorAlertModel(false)}
          errorText={globalThis.errorMessage}
          cancelButton={() => setErrorAlertModel(false)}
        />

        <ConfirmAlertModel
          visible={confirmAlertModel}
          onRequestClose={() => setConfirmAlertModel(false)}
          confirmText={globalThis.confirmMessage}
          cancel={() => setConfirmAlertModel(false)}
          confirmButton={() => {
            setConfirmAlertModel(false); // Close the alert
            if (globalThis.confirmAction) {
              confirmActionPressed(globalThis.confirmAction); // Execute the specific action
            }
          }}
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
        <ReactionCount
          visible={ReactionCountmodel}
          onRequestClose={() => setReactionCountmodel(false)}
          cancel={() => setReactionCountmodel(false)}
          sendContactData={reacttiondata}
        />
        <LaguageTranslateModal
          visible={languageModel}
          onRequestClose={() => setlanguageModel(false)}
          translateMessage={translateClicked}
          cancel={() => setlanguageModel(false)}
          TranslatedLangugae={TranslatedLangugae}
        />
        <CustomBottomSheetModal
          ref={chattingBottomSheetRef}
          navigation={navigation}
          newChattingPress={newChattingPress}
          openChannelModal={() => {
            setChannelTypeModal(true);
          }}
        />
        <LoaderModel
          visible={loaderMoedl}
          onRequestClose={() => setloaderMoedl(false)}
          cancel={() => setloaderMoedl(false)}
        />

        {/* lock chat model start */}
        <PinModal
          isVisible={isGeneratePinModalVisible}
          onClose={close}
          onPinEntered={handleGeneratePinEntered}
          onSubmit={generatePinSubmit}
        />

        <ConfirmPinModal
          isVisible={isConfirmPinModalVisible}
          onClose={close}
          onPinEntered={handleConfirmPinEntered}
          onSubmit={confirmPinSubmit}
        />

        <UnlockChatPinModal
          isVisible={isPinModalVisible}
          onForgotten={forgetPin}
          onPinEntered={handleUnlockPinEntered}
          onSubmit={unlockPinSubmit}
          closePinModal={closeModal}
        />

        <OtpVerificationModal
          isVisible={isOtpModalVisible}
          onClose={close}
          onPinEntered={handleVerifyOtp}
          VerifyOtp={verifyOtpSubmit}
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
                top: isNotch ? 60 : 60,
              }}
              onPress={() => {
                setmyimages(false);
              }}
            >
              <Image
                source={require("../../Assets/Icons/Back_Arrow.png")}
                style={{
                  height: 25,
                  width: 25,
                  marginLeft: 10,
                  tintColor: iconTheme().iconColorNew,
                }}
              />
            </TouchableOpacity>
            {mylocaldata?.type == "image" ? (
              <View
                style={{
                  height: windowHeight,
                  width: windowWidth - 20,
                }}
              >
                <ImageViewer
                  saveToLocalByLongPress={false}
                  renderIndicator={() => {
                    return null;
                  }}
                  style={{
                    height: windowHeight,
                    width: windowWidth - 20,
                  }}
                  imageUrls={mylocaldata?.attachment.map((url) => ({ url }))}
                  loadingRender={() => <ActivityIndicator size={"large"} />}

                  // onChange={(index) => setCurrentIndex(index)}
                />
                {/* <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: 3,
                      zIndex: 20,
                      top: isNotch ? 60 : 60,
                    }}
                    onPress={() => {
                      
                      downloadFile(mylocaldata?.attachment[currentIndex]);
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/downloadFile.png")}
                      style={{
                        height: 25,
                        width: 25,
                        marginLeft: 10,
                        tintColor: iconTheme().iconColorNew,
                      }}
                    />
                  </TouchableOpacity> */}
              </View>
            ) : (
              <>
                {/* <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: 3,
                      zIndex: 20,
                      top: isNotch ? 60 : 60,
                    }}
                    onPress={() => {
                      
                      downloadFile(mylocaldata?.attachment[currentIndex]);
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/downloadFile.png")}
                      style={{
                        height: 25,
                        width: 25,
                        marginLeft: 10,
                        tintColor: iconTheme().iconColorNew,
                      }}
                    />
                  </TouchableOpacity> */}

                <FlatList
                  data={mylocaldata.attachment}
                  horizontal
                  contentContainerStyle={{ alignItems: "center" }}
                  renderItem={({ item, index }) => (
                    <View
                      key={index}
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {mylocaldata?.type == "video" && (
                        <Video
                          style={{
                            width: windowWidth,
                            height: 300,
                            padding: 20,
                            // Other video styles...
                          }}
                          onLoadStart={() => {
                            setLoading(true);
                            // setCurrentIndex(index);
                          }}
                          onLoad={() => setLoading(false)}
                          source={{ uri: item }}
                          resizeMode="contain"
                          controls={true}
                          paused={isPlaying}
                        />
                      )}
                    </View>
                  )}
                />
              </>
            )}
          </View>
        </Modal>

        <Modal transparent visible={reportModal}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                overflow: "hidden",
                padding: 12,
                width: "90%",
              }}
            >
              <Text
                style={{
                  fontFamily: font.bold(),
                  fontSize: 18,
                  marginBottom: 8,
                  opacity: 0.9,
                }}
              >
                {t("report")}{" "}
                {
                  allmembers?.find(
                    (member) => member && member._id == messageClickd?.user?._id
                  )?.name
                }
                ?
              </Text>
              <Text
                style={{
                  opacity: 0.8,
                  fontSize: 14,
                  fontFamily: font.semibold(),
                }}
              >
                This message will be forwarded to Tokee. The content will not be
                notified.
              </Text>
              <TextInput
                onChangeText={(text) => setReason(text)}
                value={reason}
                style={{
                  borderWidth: 1,
                  borderColor: "#000000",
                  marginTop: 8,
                  padding: 6,
                  fontSize: 14,
                  fontFamily: font.medium(),
                }}
                onSubmitEditing={() => Keyboard.dismiss()}
                multiline={true}
                placeholder="Reason for reporting"
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                {/* <CheckBox
                  
                  value={isBlock}
                  onValueChange={(value) => setIsBlock(value)}
                /> */}
                <Text
                  style={{
                    fontSize: 14,
                    marginLeft: 8,
                    fontFamily: font.semibold(),
                  }}
                >
                  {t("block_Contact")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setReportModal(!reportModal);
                    setMessageClicked({});
                    setMessageClickedId("");
                  }}
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                >
                  <Text style={{ fontFamily: font.semibold() }}>
                    {t("cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={ReportuserChat}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: "#50aa53",
                    borderRadius: 4,
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ color: "white", fontFamily: font.semibold() }}>
                    {t("report")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal transparent visible={chatModal} animationType="fade">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
            {ismultidelete ? (
              <View style={styles.chatModalContainer}>
                {renderIf(
                  othermessagearray && othermessagearray.length == 0,
                  <TouchableOpacity
                    style={[
                      styles.chatModalTextContainer,
                      {
                        borderTopRightRadius: 10,
                        borderTopLeftRadius: 10,
                      },
                    ]}
                    onPress={() => {
                      if (selectedMessageId && selectedMessageId.length > 0) {
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

                        globalThis.confirmAction = "OnChatModalTextClick";

                        (globalThis.confirmMessage = t("delete_for_all")),
                          selectedMessageId.length < 2
                            ? t("Delete_for_all_single")
                            : t("Delete_for_all_multiple");

                        setConfirmAlertModel(true);
                      }
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/Delete.png")}
                      style={styles.reportImageLayout}
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
                    styles.chatModalTextContainer,
                    {
                      borderColor: "#ccc",
                      borderTopWidth: 1,
                      borderTopRightRadius:
                        othermessagearray.length == 0 ? 0 : 10,
                      borderTopLeftRadius:
                        othermessagearray.length == 0 ? 0 : 10,
                      borderBottomRightRadius: 10,
                      borderBottomLeftRadius: 10,
                    },
                  ]}
                  onPress={() => {
                    if (selectedMessageId && selectedMessageId.length > 0) {
                      // Alert.alert(
                      //   t("delete_for_me"), // Title of the alert
                      //   selectedMessageId.length < 2
                      //     ? t("sinle_msg_delete") // Message when only one message is selected
                      //     : t("All_sinle_msg_delete"), // Message when multiple messages are selected
                      //   [
                      //     { text: t("cancel") }, // Cancel button
                      //     {
                      //       text: t("ok"),
                      //       onPress: () => {
                      //         OnChatModalTextClick("Delete"); // Action on pressing "ok"
                      //       },
                      //     },
                      //   ]
                      // );

                      globalThis.confirmAction = "Delete";

                      (globalThis.confirmMessage = t("delete_for_me")), // Title of the alert
                        selectedMessageId.length < 2
                          ? t("sinle_msg_delete") // Message when only one message is selected
                          : t("All_sinle_msg_delete");

                      setConfirmAlertModel(true);
                    }
                  }}
                >
                  <Image
                    source={require("../../Assets/Icons/Delete.png")}
                    style={styles.reportImageLayout}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: "black",
                      fontSize: 15,
                      fontFamily: font.semibold(),
                    }}
                  >
                    {t("delete_for_me")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => OnChatModalTextClick("Cancel")}
                  style={[
                    styles.chatModalTextContainer,
                    {
                      backgroundColor: iconTheme().iconColorNew,
                      marginTop: 15,
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      height: 45,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 18,
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
            ) : (
              <View style={styles.chatModalContainer}>
                <TouchableOpacity
                  style={[
                    styles.chatModalTextContainer,
                    { borderTopRightRadius: 10, borderTopLeftRadius: 10 },
                  ]}
                  onPress={() => OnChatModalTextClick("Forward")}
                >
                  <Image
                    source={require("../../Assets/Icons/forward.png")}
                    style={styles.forWord_icon}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 15,
                      fontFamily: font.semibold(),
                    }}
                  >
                    {t("forward")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chatModalTextContainer,
                    { borderColor: "#ccc", borderTopWidth: 1 },
                  ]}
                  onPress={() => OnChatModalTextClick("Reply")}
                >
                  <Image
                    source={require("../../Assets/Icons/forward.png")}
                    style={[
                      styles.forWord_icon,
                      { transform: [{ scaleX: -1 }] },
                    ]}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 15,
                      fontFamily: font.semibold(),
                    }}
                  >
                    {t("reply")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chatModalTextContainer,
                    {
                      borderColor: "#ccc",
                      borderTopWidth: 1,
                      borderBottomRightRadius: 10,
                      borderBottomLeftRadius: 10,
                    },
                  ]}
                  onPress={() => {
                    setismultidelete(true);
                    setreactmsgon(false);
                    onSelectMessage(messageClickd.messageId);
                    if (messageClickd.user._id !== globalThis.userChatId) {
                      onSelectMessageothers(messageClickd.messageId);
                    }
                  }}
                >
                  <Image
                    source={require("../../Assets/Icons/Delete.png")}
                    style={styles.reportImageLayout}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: "black",
                      fontSize: 15,
                      fontFamily: font.semibold(),
                    }}
                  >
                    {t("delete")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => OnChatModalTextClick("Cancel")}
                  style={[
                    styles.chatModalTextContainer,
                    {
                      backgroundColor: iconTheme().iconColorNew,
                      marginTop: 15,
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      height: 45,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 18,
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
            )}
          </View>
        </Modal>

        <Modal
          visible={sendItems}
          transparent
          animationType="fade"
          style={{ justifyContent: "center", alignItems: "center" }}
          onRequestClose={() => setSendItems(false)}
        >
          <LocationModel
            visible={locationModel}
            onRequestClose={() => setLocationModel(false)}
            cancel={() => setLocationModel(false)}
            sendcurrentLongitude={getLatLongMethod}
          />
          {isContactPermissionGranted && (
            <LocalContactModel
              visible={localContactModel}
              onRequestClose={() => setLocalContactModel(false)}
              cancel={() => setLocalContactModel(false)}
              sendContactData={getContactData}
            />
          )}

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
                    source={require("../../Assets/Icons/cam_icon.png")}
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
                    source={require("../../Assets/Icons/gallary_icon.png")}
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
                    source={require("../../Assets/Icons/doc_icon.png")}
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
                    source={require("../../Assets/Icons/audio_iocn.png")}
                    style={styles.plusModalIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.plusModalText}>{t("audio")}</Text>
                </TouchableOpacity>
              </View>

              {/* second-part */}
              <View style={styles.plusModalImageTextConatiner}>
                <TouchableOpacity
                  onPress={() => {
                    setLocationModel(true);
                  }}
                  style={styles.plusModalButton}
                >
                  <Image
                    source={require("../../Assets/Icons/location_icon.png")}
                    style={styles.plusModalIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.plusModalText}>{t("location")}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.plusModalImageTextConatiner}>
                <TouchableOpacity
                  onPress={() => {
                    checkContactPermission();
                    if (isContactPermissionGranted) {
                      setLocalContactModel(true);
                    } else {
                      Alert.alert(
                        t("tokee_would_like_to_access_your_contact"),
                        t("please_enable_contacts_permission"),
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Open Settings",
                            onPress: () => {
                              Linking.openSettings(), setSendItems(false);
                            },
                          },
                        ]
                      );
                    }
                  }}
                  style={styles.plusModalButton}
                >
                  <Image
                    source={require("../../Assets/Icons/contact_icon.png")}
                    style={styles.plusModalIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.plusModalText}>{t("contact")}</Text>
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

        {groupImageModal && (
          <View>
            <View
              style={{
                position: "relative",
                height: windowHeight,
                width: windowWidth,
                backgroundColor: "#000",
              }}
            >
              {/* group-name-modal-header */}
              <View
                style={{
                  height: windowHeight - 100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    left: 3,
                    zIndex: 10,
                    top: isNotch ? 60 : 60,
                  }}
                  onPress={() => setGroupImageModal(false)}
                >
                  <Image
                    source={require("../../Assets/Icons/Back_Arrow.png")}
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
                  renderItem={({ item, index }) => (
                    <View
                      key={index}
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {attachmentformate == "image" && (
                        <Image
                          onLoad={() => Keyboard.dismiss()}
                          source={{ uri: item.path }}
                          style={{ height: 300, width: windowWidth - 20 }}
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
                            style={{
                              width: windowWidth,
                              height: 300,
                              padding: 20,
                              // Other video styles...
                            }}
                            repeat={false}
                            muted={true}
                            volume={0.0}
                            paused={false}
                            source={{ uri: item?.path }}
                            resizeMode="contain"
                            controls={true}
                            onLoad={() => Keyboard.dismiss()} // Ensure the video starts paused
                          />
                        </View>
                      )}

                      {attachmentformate == "audio" && (
                        <View style={{ height: 64, width: 320 }}>
                          <WebView
                            onLoad={() => Keyboard.dismiss()}
                            style={{
                              backgroundColor: chat().back_ground_color,
                              marginBottom: 5,
                              marginLeft: -280,
                              marginRight: -350,
                            }}
                            scrollEnabled={false}
                            useWebKit={false}
                            mediaPlaybackRequiresUserAction={true}
                            messagingEnabled={true}
                            allowsAirPlayForMediaPlayback={true}
                            automaticallyAdjustContentInsets={false}
                            injectedJavaScript={`
                                      document.querySelector('audio').setAttribute('autoplay', 'false');
                                    `}
                            source={{
                              html: `<html>
                                        <style>
                                        body{background-color:#fff;}
                                        
                                          audio {
                                            margin-left:29%;
                                            width:330px;
                                            height: 100%; / Make the audio fill its container /
                                          }
                                          audio::-webkit-media-controls-panel {
                                            background-color: ${
                                              chat().back_ground_color
                                            } ;
                    
                                          }
                                        </style>
                                        <body>
                                          <audio autoplay={false} controls="controls">
                                            <source src="${
                                              item.uri
                                            }" type="audio/mpeg"/>
                                          </audio>
                                        </body>
                                      </html>`,
                            }}
                          />
                        </View>
                      )}

                      {attachmentformate == "document" && (
                        <View>
                          <Image
                            onLoad={() => Keyboard.dismiss()}
                            source={require("../../Assets/Icons/doct.png")}
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
                            {formatFileSize(item?.size)} ~{" "}
                            {item?.type.split("/").pop()}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                />
              </View>

              <View
                style={{
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: iconTheme().iconColorNew,
                    paddingHorizontal: 15,
                    paddingVertical: 5,
                    borderWidth: 1,
                    borderColor: "transparent",
                    borderRadius: 10,
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
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontFamily: font.regular(),
                    }}
                  >
                    {t("send")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <SetProfileModal
          {...props}
          visible={cameraModal}
          onRequestClose={() => setCameraModal(false)}
          Camera={() => captureImage()}
          select={() => selectImage()}
          cancel={() => setCameraModal(false)}
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
            {!searchTerm ? (
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
                        setreactmsgon(false);
                        if (selectedMessageId && selectedMessageId.length > 0) {
                          setSelectedMessageId([]);
                          setothermessagearray([]);
                        }
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/Cross.png")}
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
                      {t("delete")}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        if (selectedMessageId && selectedMessageId.length > 0) {
                          setreactmsgon(false);
                          setSelectedMessageId([]);
                          setothermessagearray([]);
                        }
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.black,
                          fontSize: 16,
                        }}
                      >
                        {t("Reselect")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.Container1}
                      onPress={() => {
                        if (isStipopShowing) {
                          const handleStipop = (resultBool) => {
                            setIsStipopShowing(resultBool);
                          };

                          StipopModule.show(
                            isKeyboardVisible,
                            isStipopShowing,
                            Platform.OS === "android"
                              ? handleStipop
                              : (error, resultBool) => handleStipop(resultBool)
                          );

                          if (Platform.OS === "android") {
                            textInputRef.current?.focus();
                          }
                        }

                        // Dispatch and navigate immediately
                        dispatch(setnewroomID(""));
                        navigation.navigate("BottomBar");
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/Back_Arrow.png")}
                        style={styles.backIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.Container}
                      onPress={() => buttonPress()}
                    >
                      <Image
                        source={{
                          uri: roominfo.aliasImage || roominfo.roomImage,
                        }}
                        style={styles.circleImageLayout}
                        resizeMode="cover"
                      />

                      {/* <View style={styles.plusImageContainer}>
                        <Image
                          source={require("../../Assets/Icons/Chat_top.png")}
                          style={styles.plusImage1Layout}
                          resizeMode="contain"
                        />
                      </View> */}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.nameInviteContainer}
                      onPress={() => buttonPress()}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={styles.name1conText}>
                          {roominfo.aliasName
                            ? roominfo.aliasName
                            : roominfo.contactName
                            ? roominfo.contactName
                            : typeof roominfo.roomName == "number"
                            ? "+" + roominfo.roomName
                            : roominfo.roomName}
                        </Text>

                        {(isUserPremium == 1 || isUserPremium == true) && (
                          <Image
                            source={require("../../Assets/Image/PremiumBadge.png")}
                            style={{
                              height: 15,
                              width: 15,
                              marginLeft: Platform.OS === "ios" ? 5 : 10,
                              //  alignSelf:"center",
                              // marginTop: 5,
                              tintColor: iconTheme().iconColorNew,
                            }}
                          />
                        )}

                        {(isDiamonds == 1 || isDiamonds == true) && (
                          <Image
                            source={require("../../Assets/Icons/diamond.png")}
                            style={{
                              height: 15,
                              width: 15,
                              // marginTop: 2,
                              marginLeft: Platform.OS === "ios" ? 2 : 5,
                              tintColor: iconTheme().iconColorNew,
                            }}
                          />
                        )}
                      </View>

                      {(onlinestatus || whotype) &&
                        isnewblock == false &&
                        newroomType == "single" && (
                          <Text style={styles.name2conText}>
                            {whotype
                              ? newroomType == "single"
                                ? "typing..."
                                : whotype
                              : onlinestatus}
                          </Text>
                        )}
                    </TouchableOpacity>
                    <View style={[styles.editProfile, { marginLeft: "auto" }]}>
                      <TouchableOpacity
                        onPress={() => setSearchTerm(!searchTerm)}
                      >
                        <Image
                          source={require("../../Assets/Icons/Search.png")}
                          style={{
                            ...styles.newChatIcon,
                            tintColor: colors.black,
                            width: 20,
                            height: 20,
                          }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={openDrawer}>
                        <Image
                          source={require("../../Assets/Icons/menu.png")}
                          style={{
                            ...styles.newChatIcon,
                            width: 20,
                            height: 20,
                            marginRight: 0,
                            tintColor: colors.black,
                          }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ) : (
              <View
                style={{ ...styles.profile1Container, flex: 1, width: "100%" }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <View style={{ width: "100%" }}>
                    <View style={{ justifyContent: "center" }}>
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: "#fff",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          source={require("../../Assets/Icons/Search.png")}
                          style={{
                            tintColor: iconTheme().iconColorNew,
                            height: 20,
                            width: 20,
                            alignSelf: "center",
                            marginLeft: 10,
                          }}
                        />
                        <TextInput
                          multiline={false}
                          autoFocus={true}
                          style={{
                            flex: 1,
                            height: 40,
                            backgroundColor: "#fff",
                            borderColor: "gray",
                            borderWidth: 0,
                            paddingHorizontal: 10, // Padding for left and right
                            paddingVertical: 0, // Remove vertical padding to avoid misalignment
                            fontSize: 16,
                            color: "#292423",
                            fontFamily: font.regular(),
                            textAlignVertical: "center", // Vertically center the text and placeholder
                          }}
                          placeholder={t("search_messages")}
                          placeholderTextColor="gray" // Optional: set placeholder text color
                          value={searchTermtext}
                          onSubmitEditing={() => Keyboard.dismiss()}
                          onChangeText={setSearchTermtext}
                        />

                        <Text
                          style={{
                            marginHorizontal: 15,
                            fontFamily: font.regular(),
                          }}
                        >
                          {highlightedIndices.length}
                        </Text>
                        <TouchableOpacity
                          style={{
                            borderWidth: 1,
                            borderColor: iconTheme().iconColorNew,
                            padding: 5,
                            borderRadius: 50,
                            transform: [{ rotate: "-90deg" }],
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                          }}
                          onPress={() => {
                            scrollToNextHighlightedMessage();
                          }}
                        >
                          <Image
                            source={require("../../Assets/Icons/Arrow_Forword.png")}
                            style={{
                              height: 17,
                              width: 17,
                              tintColor: iconTheme().iconColorNew,
                              resizeMode: "contain",
                            }}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            borderWidth: 1,
                            borderColor: iconTheme().iconColorNew,
                            padding: 5,
                            borderRadius: 50,
                            transform: [{ rotate: "90deg" }],
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                          }}
                          onPress={() => {
                            scrollToPreviousHighlightedMessage();
                          }}
                        >
                          <Image
                            source={require("../../Assets/Icons/Arrow_Forword.png")}
                            style={{
                              height: 17,
                              width: 17,
                              tintColor: iconTheme().iconColorNew,
                              resizeMode: "contain",
                            }}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                          }}
                          onPress={() => {
                            setSearchTerm(!searchTerm),
                              setSearchTermtext(""),
                              setHighlightedIndices([]),
                              setCurrentHighlightedIndex(-1);
                          }}
                        >
                          <Image
                            source={require("../../Assets/Icons/Cross.png")}
                            style={{
                              height: 20,
                              width: 20,
                              tintColor: iconTheme().iconColorNew,
                              resizeMode: "contain",
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
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
                : require("../../Assets/Icons/trans.png")
            }
          >
            <GiftedChat
              messageContainerRef={chatListRef}
              keyboardShouldPersistTaps="handled"
              infiniteScroll
              isLoadingEarlier={isloadearly}
              loadEarlier={isloadearly}
              alignTop={true}
              inverted={true}
              isAnimated
              isKeyboardInternallyHandled={true}
              onSend={(messages) => onSend(messages)}
              shouldUpdateMessage={(props: object) => {
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
              renderFooter={() => renderFooter()}
              renderMessageText={(props: object) => {
                const { currentMessage } = props;
                const messageText = currentMessage?.text;
                const parts = messageText?.split(/(@\S+)/); // Split the message by '@' with non-whitespace characters following it
                const messageComponents = parts?.map((part, index) => {
                  if (part.startsWith("@")) {
                    return (
                      <HighlightText
                        key={index}
                        style={{
                          fontSize: globalThis.chatFontsize,
                          fontFamily: font.bold(),
                          color:
                            currentMessage?.user?._id == globalThis.chatUserId
                              ? chatOther().chatTextColor
                              : COLORS.black,
                          maxWidth: windowWidth - 120,
                        }}
                        highlightStyle={{
                          backgroundColor: iconTheme().iconColorNew,
                        }}
                        textToHighlight={part}
                        searchWords={[searchTermtext]}
                      />
                    );
                  } else {
                    return (
                      <HighlightText
                        key={index}
                        style={{
                          fontSize: globalThis.chatFontsize,
                          fontFamily: font.semibold(),
                          color:
                            currentMessage?.user?._id == globalThis.chatUserId
                              ? chatOther().chatTextColor
                              : COLORS.black,
                          maxWidth: windowWidth - 120,
                        }}
                        highlightStyle={{
                          backgroundColor: iconTheme().iconColorNew,
                        }}
                        textToHighlight={part}
                        searchWords={[searchTermtext]}
                      />
                    );
                  }
                });

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
                      {messageComponents}
                    </TouchableWithoutFeedback>
                  </Animated.View>
                );
              }}
              messages={messages}
              showAvatarForEveryMessage={false}
              renderUsername={(props: object) => {
                return (
                  <Text
                    style={{
                      fontFamily: font.medium(),
                      paddingLeft: 5,
                      fontSize: 12,
                      color: COLORS.grey,
                    }}
                  >
                    {props.name}
                  </Text>
                );
              }}
              renderUsernameOnMessage={newroomType == "multiple" ? true : false}
              messagesContainerStyle={{ paddingVertical: 10 }}
              listViewProps={{
                onScrollToIndexFailed: (info) => {
                  const wait = new Promise((resolve) =>
                    setTimeout(resolve, 500)
                  );
                  wait.then(() => {
                    chatListRef?.current?.scrollToIndex({
                      index: info.index,
                      animated: true,
                    });
                  });
                },
                scrollEventThrottle: 400,
                onScroll: ({ nativeEvent }) => {
                  Keyboard.dismiss();

                  if (isStipopShowing) {
                    switch (Platform.OS) {
                      case "android":
                        textInputRef.current.focus();
                        StipopModule.show(
                          isKeyboardVisible,
                          isStipopShowing,
                          (resultBool) => {
                            setIsStipopShowing(resultBool);
                          }
                        );
                        break;

                      case "ios":
                        StipopModule.show(
                          isKeyboardVisible,
                          isStipopShowing,
                          (error, resultBool) => {
                            setIsStipopShowing(resultBool);
                          }
                        );
                        break;
                    }
                  }
                  if (isCloseToTop(nativeEvent) && !ISATTOP) {
                    setIsTop(true);
                    paginationData(LIMIT, SKIP);
                    setSkip(LIMIT + SKIP);
                  }
                },
              }}
              renderDay={CustomDayComponent}
              alwaysShowSend
              onInputTextChanged={(text) => setMessageInput(text)}
              text={messageInput}
              renderInputToolbar={() => renderInputToolbar()}
              renderBubble={renderBubble}
              renderTime={renderTime}
              renderSystemMessage={renderSystemMessage}
              onPress={(context, message) => {
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
                    // Double tap detected
                    setMessageClicked(message);
                    setMessageClickedId([message.messageId]);
                    setreactmsgon(true);
                    setreactmsgondata(message);

                    // Trigger double-click haptic feedback
                    ReactNativeHapticFeedback.trigger("effectDoubleClick", {
                      enableVibrateFallback: true,
                      ignoreAndroidSystemSettings: false,
                    });
                  }

                  // Update last tap
                  lastTapRef.current = now;
                }
              }}
              onLongPress={(context, message) => {
                ReactNativeHapticFeedback.trigger("impactHeavy", {
                  enableVibrateFallback: true,
                  ignoreAndroidSystemSettings: false,
                });
                // message.isDeletedForAll ? null : setChatModal(true);
                setMessageClicked(message);
                setMessageClickedId([message.messageId]);
                message.isDeletedForAll ? null : setreactmsgon(true);
                setreactmsgondata(message);
              }}
              renderAvatar={
                newroomType !== "single" && !ismultidelete
                  ? (props: object) => {
                      const { currentMessage } = props;
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            setstopgifsend(false);
                            handleApiCalls(
                              currentMessage?.user._id,
                              currentMessage?.user.name,
                              currentMessage?.user.avatar ||
                                "https://tokeecorp.com/backend/public/images/user-avatar.png"
                            );
                          }}
                        >
                          {currentMessage?.user.avatar ? (
                            <View>
                              <Image
                                style={{
                                  height: 35,
                                  width: 35,
                                  borderRadius: 50,
                                }}
                                source={{ uri: currentMessage.user.avatar }}
                              />
                            </View>
                          ) : (
                            <View>
                              <Image
                                style={{
                                  height: 35,
                                  width: 35,
                                  borderRadius: 50,
                                }}
                                source={require("../../Assets/Icons/user_avatar.png")}
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }
                  : null
              }
              renderMessageImage={(props: object) => {
                if (
                  props?.currentMessage?.messageType === "image" &&
                  !props?.currentMessage?.isDeletedForAll
                ) {
                  return (
                    <View>
                      <TouchableOpacity
                        onPressIn={() =>
                          handlePressIn(props?.currentMessage?.messageId)
                        }
                        onPressOut={() =>
                          handlePressOut(props?.currentMessage?.messageId)
                        }
                        onLongPress={() => {
                          setreactmsgon(true);
                          setreactmsgondata(props.currentMessage);
                          setMessageClicked(props.currentMessage);
                          setMessageClickedId([
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
                            props.currentMessage?.localPaths &&
                            props?.currentMessage?.localPaths.length > 0
                          ) {
                            if (
                              props?.currentMessage?.localPaths.length === 1 &&
                              props?.currentMessage?.localPaths[0] === blurImage
                            ) {
                              MediaDownload(
                                "chat",
                                props.currentMessage,
                                newroomID,
                                MediaUpdated
                              );
                            } else {
                              OpenPreview(props.currentMessage);
                            }
                          } else {
                            MediaDownload(
                              "chat",
                              props.currentMessage,
                              newroomID,
                              MediaUpdated
                            );
                          }
                        }}
                        style={{ flexDirection: "row" }}
                      >
                        {props?.currentMessage?.attachment &&
                        props?.currentMessage?.attachment.length == 1 ? (
                          <React.Fragment>
                            <Image
                              source={
                                props?.currentMessage?.localPaths &&
                                props?.currentMessage?.localPaths.length > 0
                                  ? {
                                      uri: CreateRenderImage(
                                        props?.currentMessage.localPaths[0]
                                      ),
                                    }
                                  : require("../../Assets/Image/blur.png")
                              }
                              style={{ width: 200, height: 250, margin: 5 }}
                              resizeMode="cover"
                            />
                            {mediaLoaderdata[props?.currentMessage?.messageId]
                              ?.isMediaLoader && ( // Check if isMediaLoader is true for the current messageId
                              <ImageBackground
                                source={require("../../Assets/Image/loaderblur.png")}
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
                                <ActivityIndicator size="large" color="green" />
                              </ImageBackground>
                            )}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            {props?.currentMessage?.attachment?.length === 1 ? (
                              <View style={{ position: "relative" }}>
                                <Image
                                  // defaultSource={IMAGES.blurImage}
                                  source={
                                    props?.currentMessage?.localPaths &&
                                    props?.currentMessage?.localPaths.length > 0
                                      ? {
                                          uri: CreateRenderImage(
                                            props?.currentMessage.localPaths[0]
                                          ),
                                        }
                                      : require("../../Assets/Image/blur.png")
                                  }
                                  style={{
                                    width: 150,
                                    height: 150,
                                    margin: 5,
                                  }}
                                  resizeMode="cover"
                                />
                                {mediaLoaderdata[
                                  props?.currentMessage?.messageId
                                ]?.isMediaLoader && ( // Check if isMediaLoader is true for the current messageId
                                  <ImageBackground
                                    source={require("../../Assets/Image/loaderblur.png")}
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
                                <View style={{ position: "relative" }}>
                                  <Image
                                    defaultSource={require("../../Assets/Image/blur.png")}
                                    source={
                                      props?.currentMessage?.localPaths &&
                                      props?.currentMessage?.localPaths.length >
                                        0
                                        ? {
                                            uri: CreateRenderImage(
                                              props?.currentMessage
                                                .localPaths[0]
                                            ),
                                          }
                                        : require("../../Assets/Image/blur.png")
                                    }
                                    style={{
                                      width: 150,
                                      height: 150,
                                      margin: 5,
                                    }}
                                    resizeMode="cover"
                                  />
                                </View>
                                <View style={{ position: "relative" }}>
                                  <Image
                                    defaultSource={require("../../Assets/Image/blur.png")}
                                    source={
                                      props?.currentMessage?.localPaths &&
                                      props?.currentMessage?.localPaths.length >
                                        0
                                        ? {
                                            uri: CreateRenderImage(
                                              props?.currentMessage
                                                .localPaths[1]
                                            ),
                                          }
                                        : require("../../Assets/Image/blur.png")
                                    }
                                    style={{
                                      width: 150,
                                      height: 150,
                                      margin: 5,

                                      opacity:
                                        props?.currentMessage?.attachment
                                          .length > 2
                                          ? 0.5
                                          : 1,
                                    }}
                                    resizeMode="cover"
                                  />

                                  {props?.currentMessage?.attachment?.length >
                                    2 && (
                                    <View
                                      style={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 0,
                                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                        borderRadius: 8,
                                      }}
                                    >
                                      <Text
                                        style={{
                                          color: "white",
                                          fontSize: 12,
                                          fontFamily: font.regular(),
                                        }}
                                      >
                                        +
                                        {props?.currentMessage?.attachment
                                          ?.length - 2}{" "}
                                        more
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </>
                            )}
                            {mediaLoaderdata[props?.currentMessage?.messageId]
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
                                <ActivityIndicator size="large" color="green" />
                              </View>
                            )}
                          </React.Fragment>
                        )}
                      </TouchableOpacity>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginHorizontal: 5,
                        }}
                      >
                        {props?.currentMessage?.status == "" &&
                          uploadProgress.map((progress, index) => (
                            <View
                              key={index}
                              style={{
                                width:
                                  props?.currentMessage?.attachment.length == 1
                                    ? 200
                                    : 310 /
                                      props?.currentMessage?.attachment.length,
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
                          ))}
                      </View>
                    </View>
                  );
                }
                return null; // Return null for other message types
              }}
              renderMessageVideo={(props: object) => {
                if (
                  props?.currentMessage?.messageType === "video" &&
                  !props?.currentMessage?.isDeletedForAll
                ) {
                  return (
                    <View>
                      <TouchableOpacity
                        onPressIn={() =>
                          handlePressIn(props?.currentMessage?.messageId)
                        }
                        onPressOut={() =>
                          handlePressOut(props?.currentMessage?.messageId)
                        }
                        onLongPress={() => {
                          setreactmsgon(true);
                          setreactmsgondata(props.currentMessage);
                          setMessageClicked(props.currentMessage);
                          setMessageClickedId([
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
                            props.currentMessage?.localPaths &&
                            props.currentMessage?.localPaths.length > 0
                          ) {
                            if (
                              props.currentMessage?.localPaths.length == 1 &&
                              props.currentMessage?.localPaths[0] == blurVideo
                            ) {
                              MediaDownload(
                                "chat",
                                props.currentMessage,
                                newroomID,
                                MediaUpdated
                              );
                            } else {
                              if (
                                props.currentMessage?.localPaths.length == 1
                              ) {
                                navigation.navigate("VideoPlayScreen", {
                                  videoUrl: props.currentMessage?.localPaths[0],
                                });
                              } else {
                                navigation.navigate("VideoListScreen", {
                                  videos: props.currentMessage?.localPaths,
                                });
                              }
                            }
                          } else {
                            MediaDownload(
                              "chat",
                              props.currentMessage,
                              newroomID,
                              MediaUpdated
                            );
                          }
                        }}
                        style={{ flexDirection: "row" }}
                      >
                        {props?.currentMessage?.attachment &&
                        props?.currentMessage?.attachment.length == 1 ? (
                          <React.Fragment>
                            {renderIf(
                              Platform.OS == "ios" &&
                                props?.currentMessage?.localPaths?.length > 0,
                              <View
                                style={{
                                  position: "absolute",
                                  top: 100,
                                  left: 80,
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
                                  source={require("../../Assets/Icons/play-button.png")}
                                  style={{
                                    height: 40,
                                    width: 40,
                                    tintColor: "#fff",
                                  }}
                                  resizeMode="contain"
                                />
                              </View>
                            )}

                            {props?.currentMessage?.localPaths &&
                            props?.currentMessage?.localPaths?.length > 0 ? (
                              <Video
                                source={{
                                  uri: props?.currentMessage?.localPaths[0],
                                }}
                                paused
                                posterResizeMode="contain"
                                poster="https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png"
                                style={{
                                  width: 200,
                                  height: 250,
                                  margin: 5,
                                }}
                              />
                            ) : (
                              <View
                                style={{
                                  width: 200,
                                  height: 250,
                                  margin: 5,
                                  backgroundColor: "#000",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Image
                                  source={require("../../Assets/Icons/downloadFile.png")}
                                  style={{
                                    height: 50,
                                    width: 50,
                                    tintColor: "#fff",
                                  }}
                                  resizeMode="contain"
                                />
                              </View>
                            )}

                            {mediaLoaderdata[props?.currentMessage?.messageId]
                              ?.isMediaLoader && ( // Check if isMediaLoader is true for the current messageId
                              <ImageBackground
                                source={require("../../Assets/Image/loaderblur.png")}
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
                                <ActivityIndicator size="large" color="green" />
                              </ImageBackground>
                            )}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            {renderIf(
                              Platform.OS == "ios" &&
                                props?.currentMessage?.localPaths?.length > 0 &&
                                props?.currentMessage?.localPaths?.length == 2,
                              <View
                                style={{
                                  flexDirection: "row",
                                  position: "absolute",
                                  zIndex: 200,
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
                                      source={require("../../Assets/Icons/play-button.png")}
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
                                      source={require("../../Assets/Icons/play-button.png")}
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
                            {props?.currentMessage?.attachment.length === 1 ? (
                              <View style={{ position: "relative" }}>
                                {props?.currentMessage.localPaths?.length >
                                0 ? (
                                  <Video
                                    source={{
                                      uri: props.currentMessage.localPaths[0],
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
                                      source={require("../../Assets/Icons/downloadFile.png")}
                                      style={{
                                        height: 50,
                                        width: 50,
                                        tintColor: "#fff",
                                      }}
                                      resizeMode="contain"
                                    />
                                  </View>
                                )}
                              </View>
                            ) : (
                              <>
                                {renderIf(
                                  Platform.OS == "ios" &&
                                    props?.currentMessage?.localPaths?.length >
                                      0 &&
                                    props?.currentMessage?.localPaths?.length >
                                      2,
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      position: "absolute",
                                      zIndex: 200,
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
                                          source={require("../../Assets/Icons/play-button.png")}
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
                                          source={require("../../Assets/Icons/play-button.png")}
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
                                <View style={{ position: "relative" }}>
                                  {props?.currentMessage?.localPaths?.length >
                                  0 ? (
                                    <Video
                                      source={{
                                        uri: props.currentMessage.localPaths[0],
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
                                        justifyContent: "center",
                                        backgroundColor: "#000",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Image
                                        source={require("../../Assets/Icons/downloadFile.png")}
                                        style={{
                                          height: 50,
                                          width: 50,
                                          tintColor: "#fff",
                                        }}
                                        resizeMode="contain"
                                      />
                                    </View>
                                  )}
                                </View>
                                <View style={{ position: "relative" }}>
                                  {props?.currentMessage?.localPaths &&
                                  props?.currentMessage?.localPaths?.length >
                                    0 ? (
                                    <Video
                                      source={{
                                        uri: props.currentMessage.localPaths[1],
                                      }}
                                      paused
                                      posterResizeMode="contain"
                                      poster="https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png"
                                      style={{
                                        width: 150,
                                        height: 150,
                                        margin: 5,
                                        opacity:
                                          props?.currentMessage?.attachment
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
                                        width: 150,
                                        height: 150,
                                        margin: 5,
                                      }}
                                    >
                                      <Image
                                        source={require("../../Assets/Icons/downloadFile.png")}
                                        style={{
                                          height: 50,
                                          width: 50,
                                          tintColor: "#fff",
                                        }}
                                        resizeMode="contain"
                                      />
                                    </View>
                                  )}

                                  {props?.currentMessage?.attachment.length >
                                    2 && (
                                    <View
                                      style={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 0,
                                        backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                                        {props?.currentMessage?.attachment
                                          .length - 2}{" "}
                                        {t("more")}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </>
                            )}

                            {mediaLoaderdata[props?.currentMessage?.messageId]
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
                                <ActivityIndicator size="large" color="green" />
                              </View>
                            )}
                          </React.Fragment>
                        )}
                      </TouchableOpacity>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginHorizontal: 5,
                        }}
                      >
                        {props?.currentMessage?.status == "" &&
                          uploadProgress.map((progress, index) => (
                            <View
                              key={index}
                              style={{
                                width:
                                  props?.currentMessage?.attachment.length == 1
                                    ? 200
                                    : 310 /
                                      props?.currentMessage?.attachment.length,
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
                          ))}
                      </View>

                      {/* } */}
                    </View>
                  );
                }
                return null; // Return null for other message types
              }}
              renderMessageAudio={(props: object) => {
                if (
                  props?.currentMessage?.messageType == "audio" &&
                  !props?.currentMessage?.isDeletedForAll
                ) {
                  return (
                    <View>
                      <TouchableOpacity
                        onPressIn={() =>
                          handlePressIn(props?.currentMessage?.messageId)
                        }
                        onPressOut={() =>
                          handlePressOut(props?.currentMessage?.messageId)
                        }
                        onLongPress={() => {
                          setreactmsgon(true);
                          setreactmsgondata(props.currentMessage);
                          setMessageClicked(props.currentMessage);
                          setMessageClickedId([
                            props?.currentMessage?.messageId,
                          ]);
                          ReactNativeHapticFeedback.trigger("impactHeavy", {
                            enableVibrateFallback: true,
                            ignoreAndroidSystemSettings: false,
                          });
                        }}
                      >
                        {!props?.currentMessage?.localPaths?.length > 0 ? (
                          <View
                            style={{
                              height: 50,
                              width: 300,
                              flexDirection: "row",
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                // width: "20%",
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: 10,
                                marginTop: 10,
                              }}
                              onPress={() => {
                                ReactNativeHapticFeedback.trigger(
                                  "impactHeavy",
                                  {
                                    enableVibrateFallback: true,
                                    ignoreAndroidSystemSettings: false,
                                  }
                                );
                                MediaDownload(
                                  "chat",
                                  props.currentMessage,
                                  newroomID,
                                  MediaUpdated
                                );
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
                                  source={require("../../Assets/Icons/downloadFile.png")}
                                  style={{ height: 30, width: 30 }}
                                  resizeMode="contain"
                                />
                              )}
                            </TouchableOpacity>

                            <View
                              style={{
                                width: "70%",
                                justifyContent: "center",
                                borderWidth: 1.5,
                                borderColor: "#ccc",
                                alignItems: "center",
                                marginTop: 10,
                                marginLeft: 10,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 22,
                                  marginHorizontal: 20,
                                  alignSelf: "center",
                                }}
                              >
                                Audio File
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <>
                            {props?.currentMessage?.localPaths?.map(
                              (audioUri, index) => (
                                <View key={index}>
                                  <View style={{ height: 50, width: 300 }}>
                                    {/* { Platform.OS === "ios" ?   <AudioMessage currentMessage={props?.currentMessage.attachment[0]} /> : 
                                    <AudioMessage currentMessage={audioUri} />
                              } */}
                                    <AudioMessage currentMessage={audioUri} />
                                  </View>
                                </View>
                              )
                            )}
                          </>
                        )}
                      </TouchableOpacity>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginHorizontal: 5,
                        }}
                      >
                        {props?.currentMessage?.status == "" &&
                          uploadProgress.map((progress, index) => (
                            <View
                              key={index}
                              style={{
                                width:
                                  props?.currentMessage?.attachment.length == 1
                                    ? 200
                                    : 310 /
                                      props?.currentMessage?.attachment.length,
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
                          ))}
                      </View>
                    </View>
                  );
                }
              }}
              user={{
                _id: globalThis.chatUserId,
                name: globalThis.name,
                avatar: globalThis.userImage,
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
                {ismultidelete ? (
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
                        minWidth: "70%",
                      }}
                    >
                      {renderIf(
                        othermessagearray && othermessagearray.length == 0,
                        <TouchableOpacity
                          style={{
                            height: 40,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            alignItems: "center",
                            flexDirection: "row",
                            borderBottomWidth: 1.0,
                            borderBottomColor: "#FAF7F7",
                          }}
                          onPress={() => {
                            if (
                              selectedMessageId &&
                              selectedMessageId.length > 0
                            ) {
                              globalThis.confirmAction = "OnChatModalTextClick";

                              (globalThis.confirmMessage = t("delete_for_all")),
                                selectedMessageId.length < 2
                                  ? t("Delete_for_all_single")
                                  : t("Delete_for_all_multiple");

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
                            source={require("../../Assets/Icons/Delete.png")}
                            style={{
                              width: 22,
                              height: 22,
                              tintColor: iconTheme().iconColorNew,
                              marginRight: 5,
                              marginLeft: 5,
                              transform: [{ scaleX: -1 }],
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
                        style={{
                          height: 40,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          alignItems: "center",
                          flexDirection: "row",
                          borderBottomWidth: 0,
                          borderBottomColor: "#FAF7F7",
                        }}
                        onPress={() => {
                          if (
                            selectedMessageId &&
                            selectedMessageId.length > 0
                          ) {
                            // Alert.alert(
                            //   t("delete_for_me"), // Title of the alert
                            //   selectedMessageId.length < 2
                            //     ? t("sinle_msg_delete") // Message when only one message is selected
                            //     : t("All_sinle_msg_delete"), // Message when multiple messages are selected
                            //   [
                            //     { text: t("cancel") }, // Cancel button
                            //     {
                            //       text: t("ok"),
                            //       onPress: () => {
                            //         OnChatModalTextClick("Delete"); // Action on pressing "ok"
                            //       },
                            //     },
                            //   ]
                            // );
                            globalThis.confirmAction = "Delete";

                            (globalThis.confirmMessage = t("delete_for_me")), // Title of the alert
                              selectedMessageId.length < 2
                                ? t("sinle_msg_delete") // Message when only one message is selected
                                : t("All_sinle_msg_delete");

                            setConfirmAlertModel(true);
                          }
                        }}
                      >
                        <Image
                          source={require("../../Assets/Icons/Delete.png")}
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
                          {t("delete_for_me")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ) : (
                  <>
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
                            style={{
                              fontSize: 22,
                              letterSpacing: 15,
                              color: "#000",
                            }}
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
                            style={{
                              fontSize: 22,
                              letterSpacing: 15,
                              color: "#000",
                            }}
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
                            style={{
                              fontSize: 22,
                              letterSpacing: 15,
                              color: "#000",
                            }}
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
                            style={{
                              fontSize: 22,
                              letterSpacing: 15,
                              color: "#000",
                            }}
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
                            style={{
                              fontSize: 22,
                              letterSpacing: 15,
                              color: "#000",
                            }}
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
                            style={{
                              fontSize: 22,
                              letterSpacing: 15,
                              color: "#000",
                            }}
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
                        <TouchableOpacity
                          style={{
                            height: 40,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            alignItems: "center",
                            flexDirection: "row",
                            borderBottomWidth: 1.0,
                            borderBottomColor: "#FAF7F7",
                          }}
                          onPress={() => OnChatModalTextClick("Forward")}
                        >
                          <Image
                            source={require("../../Assets/Icons/forward.png")}
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

                        <TouchableOpacity
                          style={{
                            height: 40,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            alignItems: "center",
                            flexDirection: "row",
                            borderBottomWidth: 1.0,
                            borderBottomColor: "#FAF7F7",
                          }}
                          onPress={() => OnChatModalTextClick("Reply")}
                        >
                          <Image
                            source={require("../../Assets/Icons/forward.png")}
                            style={{
                              width: 22,
                              height: 22,
                              tintColor: iconTheme().iconColorNew,
                              marginRight: 5,
                              marginLeft: 5,
                              transform: [{ scaleX: -1 }],
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
                            {t("reply")}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            height: 40,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            alignItems: "center",
                            flexDirection: "row",
                            borderBottomWidth: 0,
                            borderBottomColor: "#FAF7F7",
                          }}
                          onPress={() => {
                            setismultidelete(true);
                            setreactmsgon(false);
                            onSelectMessage(messageClickd.messageId);
                            if (
                              messageClickd.user._id !== globalThis.userChatId
                            ) {
                              onSelectMessageothers(messageClickd.messageId);
                            }
                          }}
                        >
                          <Image
                            source={require("../../Assets/Icons/Delete.png")}
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
                            {t("delete")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  </>
                )}
              </View>
            </Pressable>
          )}
        </View>
      </View>

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
                source={require("../../Assets/Icons/Back.png")}
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
                  source={require("../../Assets/Icons/correct_sign.png")}
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
    </Drawer>
  );
});
export default ChattingScreen;
