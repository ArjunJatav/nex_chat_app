//@ts-nocheck
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
  } from "react-native";
  //@ts-ignore
  import HighlightText from "@sanar/react-native-highlight-text";
  import Contacts from "react-native-contacts"; //@ts-ignore
  import CryptoJS from "react-native-crypto-js";
  import { GestureHandlerRootView, State } from "react-native-gesture-handler";
  //@ts-ignore
  import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    OutputFormatAndroidType,
  } from "react-native-audio-recorder-player";
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
  import fs, {
    DocumentDirectoryPath,
    exists,
    readDir,
    readFile,
    stat,
    writeFile,
  } from "react-native-fs";
  import { Swipeable } from "react-native-gesture-handler";
  import WebView from "react-native-webview";
  import {
    COLORS,
    appBarIconTheme,
    appBarText,
    chat,
    chatContainer,
    chatImage,
    chatOther,
    chatTop,
    iconTheme,
    textTheme,
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
    blockRoom,
    checkPinStatus,
    clearMessages,
    deleteMessageByResId,
    deleteRoomId,
    getAllChatTableData,
    getChats,
    getIsLock,
    getMembersFromRoomMembersSql,
    getOtherPersonLastMessage,
    getRoomBackgroundByRoomId,
    getRoomIdFromRes,
    getRooms,
    getTotalMembers,
    getUserDetails,
    insertChatList,
    lockChat,
    muteroom,
    newMessageInsertList,
    removeAllMembersFromRoomMembersSql,
    removeCount,
    replaceLocalPathInChatMessages,
    setSeenCount,
    updateLocalPathInChatMessages,
    updateMessageStatusbyId,
    updateRoomUnseenCount,
    updateblockuser,
    updatedeleteforall,
    updateroominfo,
  } from "../../sqliteStore";
  
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import auth from "@react-native-firebase/auth";
  import axios from "axios";
  import { decode } from "base64-arraybuffer";
  import { t } from "i18next";
  import { any } from "prop-types";
  import { NativeEventEmitter, NativeModules } from "react-native";
  import FastImage from "react-native-fast-image";
  import ImageViewer from "react-native-image-zoom-viewer";
  import Sound from "react-native-sound";
  import RNFetchBlob from "rn-fetch-blob";
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
    getRoomMembersApi,
    get_by_ChatId,
    getlastSeenApi,
    groupDetailApi,
    muteChatApi,
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
    setlastseennew,
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
  import { setProfileData } from "../../Redux/MessageSlice"; //@ts-ignore
  import Drawer from "react-native-drawer";
  import { PostApiCall } from "../../Components/ApiServices/PostApi";
  import AudioMessage from "./AudioMessage";
  import {
    updateAppState,
    updateMediaLoader,
  } from "../../reducers/getAppStateReducers";
  import MediaDownload from "../../Components/MediaDownload/MediaDownload";
import ChatHeader from "./ChatComponents/ChatHeader";
import SystemMessages from "./ChatComponents/SystemMessage";
import { CustomMessageBubble } from "./ChatComponents/CustomMessageBubble";
import RenderInputToolbar from "./ChatComponents/RenderInputToolbar";
  
  const isDarkMode = true;
  const { StipopModule } = NativeModules;
  var count = 1;
  
  var nativeEventEmitter: NativeEventEmitter | null = null;
  
  switch (Platform.OS) {
    case "android":
      const { StipopModule } = NativeModules; //@ts-ignore
      nativeEventEmitter = new NativeEventEmitter(StipopModule);
      break;
  
    case "ios":
      const { StipopEmitter } = NativeModules; //@ts-ignore
      nativeEventEmitter = new NativeEventEmitter(StipopEmitter);
      break;
  }
  var calling_userID = "";
  let TOTALMEM = 0;
const DemoChat = React.memo(({ props, navigation, route }: any) => {
    const drawerRef = useRef(null);



    //@ts-ignore
    const videoRef = createRef(null);
    const togglePlaying = () => {};
    //@ts-ignore
    const textInputRef = createRef<any>(null); //@ts-ignore
    const chatListRef = createRef<any>(null);
  
    const { colorTheme } = useContext(ThemeContext);
    const [isloadearly, setisloadearly] = useState(false);
    const windowWidth = Dimensions.get("window").width;
    const windowHeight = Dimensions.get("window").height;
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isStipopShowing, setIsStipopShowing] = useState(false);
    const dispatch = useDispatch();
    const [groupDetailData, setGroupDetailData] = useState<any>([]);
    const [audioPath, setAudioPath] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState("");
    const chatList = useSelector((state: any) => state.socketmessage);
    const { typing } = useSelector((state: any) => state.root);
    const newMessage = useSelector((state: any) => state.message.message);
    const mainprovider = useSelector(
      (state: any) => state.chatHistory.mainprovider
    );
    const updateMediacount = useSelector(
      (state) => state?.getAppStateReducers?.app_state?.updateMediaFunction
    );


    const [userstatus, setuserstatus] = useState("");
    const newroomID = useSelector((state: any) => state.chatHistory.newroomID);
    const [playVideo, setPlayVideo] = useState("");
    const [participantsFrom, setParticipantsFrom] = useState("");
    const [threeDotModal, setThreeDotModal] = useState(false);
    const [userBlocked, setUserBlocked] = useState(route.params.isBlock);
  
    const lastseennew = useSelector(
      (state: any) => state.chatHistory.lastseennew
    );
    const newroomType = useSelector(
      (state: any) => state.chatHistory.newroomType
    );
    const roominfo = useSelector((state: any) => state.chatHistory.roominfo);
    const isnewmute = useSelector((state: any) => state.chatHistory.isnewmute);
    const seenMarkCount = useSelector(
      (state: any) => state.chatHistory.seenMesssages
    );
    const isLock = useSelector((state: any) => state.chatHistory.isLock);
    const [messageClickedId, setMessageClickedId] = useState("");
    const [messageClickd, setMessageClicked] = useState<any>({});
    const [chatModal, setChatModal] = useState(false);
    const [groupFirstMessage, setGroupFirstMessage] = useState("");
    const [showReplyMessage, setShowReplyMessage] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [mygroupimg, setmygroupimg] = useState<any>({});
    const chatMessageTime = Date.now();
    const [newchathistory, setnewchathistory] = useState([]);
    const [cameraModal, setCameraModal] = useState(false);
    const [videoModal, setVideoModal] = useState(false);
    const isNotch = DeviceInfo.hasNotch();
    const [sendItems, setSendItems] = useState(false);
    const [inputHeight, setInputHeight] = useState(40);
    const [drawerGauster, setDrawerGauster] = useState(false);
    // hide and delete work
  
    const deleteRoom = useSelector((state: any) => state.chatHistory.deleteRoom);
    const mediaLoaderdata = useSelector(
      (state: any) => state.getAppStateReducers.mediaLoader
    );
  
    // \\hide and delete work
    const profileData = useSelector((state: any) => state?.message?.profileData);
    const [messages, setMessages] = useState<any>([
      {
        _id: 1,
        messageType: "systemmessage",
        text: t("messages_and_calls_end-to-end_encrypted"),
        createdAt: new Date(),
        system: true,
      },
    ]);
    const [allmembers, setallmembers] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [loaderMoedl, setloaderMoedl] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [inputFocued, setInputFocused] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const chatHistory = useSelector((state: any) => state.chatHistory.message);
    const messageRecieve = useSelector((state: any) => state.messageRecieve);
    const chatmessage = useSelector(
      (state: any) => state.chatListsql.chatmessage
    );
    const intervalIds = useSelector(
      (state: any) => state.chatHistory.intervalIds
    );
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [groupImageModal, setGroupImageModal] = useState(false);
    const [allattachment, setallattachment] = useState([]);
    const [attachmentformate, setattachmentformate] = useState("");
    const [showemoji, setshowemoji] = useState(false);
    const [allsticekrs, setallsticekrs] = useState([]);
    const [stickerfilter, setstickerfilter] = useState("Emoticons");
    const [issticekropen, setissticekropen] = useState(false);
    const [Emoticons, setEmoticons] = useState([]);
    const [Stickers, setStickers] = useState([]);
    const [soundInstance, setSoundInstance] = useState(null);
    const [volume, setVolume] = useState(1); // Initial volume (0 to 1)
    const [isPlaying, setIsPlaying] = useState(false);
    const isnewblock = useSelector((state: any) => state.chatHistory.isnewblock);
    const onlinestatus = useSelector(
      (state: any) => state.chatHistory.onlinestatus
    );
    const [locationModel, setLocationModel] = useState(false);
    const [localContactModel, setLocalContactModel] = useState(false);
    const [myimages, setmyimages] = useState(false);
    const [mylocaldata, setmylocaldata] = useState([]);
    const [whotype, setWhotype] = useState("");
    const [reload, setReload] = useState(false);
    const [SKIP, setSkip] = useState(0);
    const [LIMIT, setLimit] = useState(10);
    const [ISATTOP, setIsTop] = useState(false);
    const isChatLock = route.params?.room?.isLock ? route.params.room.isLock : 0;
  
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

    useEffect(()=> {
        if(newroomID){
            getAllChatTableData(
                "Chatmessages",
                newroomID,
                0,
                75,
                "multiple",
                (data: []) => {
                    //@ts-ignore
                    messageDelAndDis(data.disapperIds);
                    //@ts-ignore
                    if (data.temp.length > 0) {
                      setisloadearly(false);
                      setSkip(LIMIT + SKIP);
                      console.log("dat temp ======>>>>>",data.temp)
                      //@ts-ignore
                      setMessages(data.temp);
                    } else {
                      setisloadearly(false);
                    }
                  }
            );
        }      
    },[newroomID])
    
    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
        )
    }, [])
  
    //@ts-ignore
    var stickerSingleTapListener = null; //@ts-ignore
    var stickerDoubleTapListener = null;
  
    const chattingBottomSheetRef = useRef(null); //@ts-ignore
    const handlePresentModalPress = () =>
      //@ts-ignore
      chattingBottomSheetRef?.current?.present();
  
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          // Define your navigation logic here
          // For example, go back if possible
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
    //   //@ts-ignore
    //   drawerRef.current.close();
    //   setDrawerGauster(false)
    // };
  
    // const openDrawer = () => {
    //   //@ts-ignore
    //   drawerRef.current.open();
    //   setDrawerGauster(true)
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
  
    const onCloseDrawer =()=>{
      setDrawerGauster(false)
  }
  
  
    const tapListenerInit = () => {
      //@ts-ignore
      stickerSingleTapListener = nativeEventEmitter?.addListener(
        "onStickerSingleTapped",
        (event: any) => {
          const stickerImg = event.stickerImg;
          onStickersPick(stickerImg);
        }
      );
    };
  
    useEffect(() => {
      if (route.params.isFromPublicPage) {
        // getRoomMembersAPI();
      }
      GroupDetailApiFunc();
    }, [route.params.isFromPublicPage]);
  
    const getRoomMembersAPI = async () => {
      const getRoomMembersUrl =
        chatBaseUrl + getRoomMembersApi + "?roomId=" + newroomID;
      const res = await axios({
        method: "get",
        url: getRoomMembersUrl,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          //@ts-ignore
          Authorization: "Bearer " + globalThis.token,
          //@ts-ignore
          localization: globalThis.selectLanguage,
        },
      });
  
      if (res.data.status == true) {
        const groupMembers: any[] = [];
  
        //@ts-ignore
        res.data.data.members.forEach((member) => {
          if (member.isRemoved == false) {
            groupMembers.push({
              roomId: res.data.data.roomId,
              chat_user_id: member.user._id,
              contact_name: member.user.name,
              phone_number: member.user.phone_number,
              profile_image: member.user.image,
              isAdmin: member.isAdmin,
            });
          }
        });
  
        addMembersToRoomMembersSql(groupMembers, newroomID, () => {
          count = count + 1;
          dispatch(updateAppState({ updatemediauseeeffect: count + 1 }));
        });
  
        // removeAllMembersFromRoomMembersSql(item.roomId, () => {addMembersToRoomMembersSql(groupMembers, item.roomId, () => {}); });
      } else {
        Alert.alert(res.data.message);
      }
    };
  
    const GroupDetailApiFunc = async () => {
      const urlStr = chatBaseUrl + groupDetailApi + "?roomId=" + newroomID;
      const chatProfileUrl =
        chatBaseUrl + chatUserDetailApi + route.params.friendId;
      const getRoomMembersUrl =
        chatBaseUrl + getRoomMembersApi + "?roomId=" + newroomID;
  
      try {
        // getMembersFromRoomMembersSql(newroomID, async (res: any[]) => {
        //   let fData = {
        //     owber: "",
        //     roomName: "",
        //     roomImage: "",
        //     phone_number: "",
        //     name: "",
        //     image: "",
        //     allow: "",
        //     isPublic: false,
        //   };
  
        //   if (res.length <= 0) {
        //     // No Members Found!
        //     console.log("No Members Found !");
        //   } else {
        //     //@ts-ignore
  
        //     const idx2 = res.filter((f) => f.isAdmin == 1);
        //     try {
        //       //@ts-ignore
        //       fData = res[idx];
  
        //       let sorted = [...res.filter((f) => f.isAdmin)].concat(
        //         res.filter((a) => a.isAdmin == 0).sort((a, b) => a.name - b.name)
        //       );
  
        //       setGroupDetailData(res);
        //       setCurrentUserData(fData);
        //     } catch (error) {}
        //   }
        // });
  
        await axios({
          method: "get",
          url: newroomType == "single" ? chatProfileUrl : urlStr,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            //@ts-ignore
            Authorization: "Bearer " + globalThis.token, //@ts-ignore
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
              Alert.alert(response.data.message);
            }
          })
          .catch((error) => {
            setloaderMoedl(false);
          });
      } catch (error: any) {
        setloaderMoedl(false);
      }
    };
    const tapListenerRemove = () => {
      //@ts-ignore
      if (stickerSingleTapListener != null) {
        //@ts-ignore
        stickerSingleTapListener.remove();
      } //@ts-ignore
      if (stickerDoubleTapListener != null) {
        //@ts-ignore
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
          setDrawerGauster(true)
        }
      );
      keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        (event) => {
          setKeyboardVisible(false);
          setIsStipopShowing(false);
          setDrawerGauster(false)
        }
      );
    };
  
    ///////////////////////////get user data api for bottomsheet////// //@ts-ignore
    const getProfileApi = async (chatid: any, username: any, userimage: any) => {
      setIsLoading(true);
      let headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        // @ts-ignore
        Authorization: "Bearer " + globalThis.Authtoken, //@ts-ignore
        localization: globalThis.selectLanguage,
      };
      let data = {
        //@ts-ignore
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
  
    const getapiSuccess = (
      ResponseData: any,
      ErrorStr: any,
      username: any,
      userimage: any
    ) => {
      if (ErrorStr) {
        Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
        setIsLoading(false);
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
          })
        );
        UpdateProfileImage(
          ResponseData?.data?.user?.chat_user_id,
          ResponseData?.data?.user?.profile_image,
          (res: any) => {
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
  
    const onStickersPick = async (imageUrl: any) => {
      const linkUri = imageUrl;
      const mId = Math.floor(Math.random() * 9000) + 1000;
      const paramsOfSend = {
        mId: mId,
        roomId: newroomID, //@ts-ignore
        fromUser: globalThis.userChatId, //@ts-ignore
        userName: globalThis.displayName, //@ts-ignore
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
        //@ts-ignore
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
          parent_message: {}, //@ts-ignore
          user: { _id: globalThis.userChatId },
          unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
        },
      ]);
      const paramsOfSendforlive = {
        mId: mId, //@ts-ignore
        userName: globalThis.displayName, //@ts-ignore
        phoneNumber: globalThis.phone_number, //@ts-ignore
        currentUserPhoneNumber: globalThis.phone_number, //@ts-ignore
        userImage: globalThis.image,
        roomId: newroomID,
        roomName: mainprovider?.userName,
        roomImage: mainprovider?.userImage,
        roomType: mainprovider?.roomType, //@ts-ignore
        roomOwnerId: globalThis.userChatId,
        message: "",
        message_type: "sticker",
        roomMembers: [mainprovider?.friendId ? mainprovider?.friendId : ""],
        parent_message_id: "",
        attachment: [linkUri], //@ts-ignore
        from: globalThis.userChatId,
        resId: chatMessageTime,
        createdAt: new Date(),
      };
  
      socket.emit("sendmessage", paramsOfSendforlive);
    };
  
    const keyboardListenerRemove = () => {
      if (keyboardDidHideListener != null) {
        keyboardDidHideListener.remove();
      }
      if (keyboardDidShowListener != null) {
        keyboardDidShowListener.remove();
      }
    };
  
    async function onsendallmessage(data) {
    //   if (messageInput.trim() === "") {
    //     // Optionally, you can add a check to prevent sending empty messages.
    //     return;
    //   }
      const messageSend = CryptoJS.AES.encrypt(
        data.text,
        EncryptionKey
      ).toString();

      const mId = Math.floor(Math.random() * 9000) + 1000;

      //@ts-ignore
      onSend([
        //@ts-ignore
        {
          resId: chatMessageTime,
          text: data.text,
          messageType: "text",
          _id: mId,
          messageId: "",
          system: false,
          status: "",
          isForwarded: false,
          parent_message: messageClickd ? messageClickd : {},
          createdAt: new Date(),
          isDeletedForAll: false,
          //@ts-ignore
          user: { _id: globalThis.userChatId },
          unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
          shouldDisappear: disappearmsgchecked,
          disappearMsgTime: disappearmsgchecked
            ? Date.now() + disappeartime * 60000
            : 0,
        },
      ]);
  
      const paramsOfSend = {
        mId: mId,
        roomId: newroomID, //@ts-ignore
        fromUser: globalThis.userChatId, //@ts-ignore
        userName: globalThis.displayName, //@ts-ignore
        phoneNumber: Number(
          //@ts-ignore
          globalThis.phone_number.substr(-10)
        ), //@ts-ignore
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
      insertChatList({
        paramsOfSend: paramsOfSend,
        chatRoom: true,
      });
  
      //@ts-ignore
      const paramsOfSendlive = {
        mId: mId,
        isNotificationAllowed: isnewmute ? isnewmute : true, //@ts-ignore
        userName: globalThis.displayName, //@ts-ignore
        phoneNumber: Number(
          //@ts-ignore
          globalThis.phone_number.substr(-10)
        ), //@ts-ignore
        currentUserPhoneNumber: globalThis.phone_number, //@ts-ignore
        userImage: globalThis.image,
        roomId: newroomID,
        roomName: mainprovider?.userName,
        roomImage: mainprovider?.userImage,
        roomType: mainprovider?.roomType, //@ts-ignore
        roomOwnerId: globalThis.userChatId,
        message: messageSend,
        message_type: "text",
        roomMembers: [mainprovider?.friendId ? mainprovider?.friendId : ""],
        isForwarded: false,
        attachment: [], //@ts-ignore
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
      socket.emit("sendmessage", paramsOfSendlive);
  
      
    //   setMessageInput(""); // Clear the message input field after sending
    if (newroomID) {
    removeCount(newroomID);
    }
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
        //@ts-ignore
        socket.off("group-delete", deleteFunction);
      };
    });
  
    //code by-dinki
    async function OpenPreview(item: any) {
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
  
    useEffect(() => {
      const hideFunction = (data) => {
        if (data.roomId == newroomID) {
          navigation.navigate("ChatScreen");
        }
      };
      socket.on("group-hide", hideFunction);
      return () => {
        //@ts-ignore
        socket.off("group-hide", hideFunction);
      };
    });
  
    useEffect(() => {
      StipopModule.connect(globalThis.userChatId);
      tapListenerInit();
  
      return () => {
        tapListenerRemove();
      };
    }, []);
  
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
      const uniqueIndices: any = new Set();
  
      // Iterate through messages to find highlighted occurrences
      messages.forEach((message: any, index: any) => {
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
  
    const searchmessagefunction = (index: any) => {
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
  
    const scrolltoparentmessage = (idToScroll: any) => {
      const index = messages.findIndex(
        (message) => message.messageId === idToScroll
      );
      if (index !== -1 && messagerefin) {
        //@ts-ignore
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
      socket.on("connect_error", (error: any) => {
        socket.connect;
      });
    }, [socket]);
  
    //route.params
    useEffect(() => {
      if (route.params.inside == true) {
        dispatch(
          setMainprovider({
            ...mainprovider,
            allow: route.params.room.allow,
            isnewblock: route.params.isBlock,
            owner: route.params.room.owner,
          })
        );
        socket.emit("joinRoom", {
          roomId: newroomID, //@ts-ignore
          userId: globalThis.userChatId,
        });
      } else {
        dispatch(
          setMainprovider({
            ...mainprovider,
            allow: "public",
            isnewblock: false, //@ts-ignore
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
      (state: any) => state?.VoipReducer?.call_state || {}
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
        //@ts-ignore
        if (globalThis.userChatId) {
          socket.emit("join", { id: globalThis.userChatId });
        }
  
        //@ts-ignore
        socket.emit("joinRoom", {
          roomId: newroomID, //@ts-ignore
          userId: globalThis.userChatId,
        });
      };
      //@ts-ignore
      socket.on("connect", handleconnect);
      return () => {
        //@ts-ignore
        socket.off("connect", handleconnect);
      };
    }, []);
  
    useEffect(() => {
      const handleTyping = (typingData: any) => {
        if (typingData.result.roomId == newroomID && !isRoomBlocked) {
          //@ts-ignore
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
      const handleCountManage = async (seenMessage: any) => {
        // console.log("dsfdsfdsfsdfsdfdsf",seenMessage)
        if (seenMessage.roomId == newroomID) {
          setSeenCount(
            seenMessage.roomId,
            seenMessage.lastInfoId,
            seenMessage.requestBy,
            (data: any) => {
              if (
                Object.entries(seenMessage).length &&
                seenMessage.roomId == newroomID
              ) {
                setMessages((previousMessages: any) => {
                  let isGet = 0;
                  return previousMessages.map((p: any) => {
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
      //@ts-ignore
      socket.on("seenCountMark", handleCountManage);
      return () => {
        //@ts-ignore
        socket.off("seenCountMark", handleCountManage);
      };
    });
  
    ////////////////lock chat functions/////////////////////
  
    useEffect(() => {
      auth().onAuthStateChanged(async (user) => {
        if (user) {
          //@ts-ignore
          isDeviceVerified = true;
        }
      });
    }, []);
  
    useEffect(() => {
      getChatLockdata();
    }, [isFocused]);
  
    const setPinApi = (chatPin: any) => {
      let url = Base_Url + setpin;
      try {
        axios({
          method: "post",
          url: url,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            //@ts-ignore
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
        //@ts-ignore
        await AsyncStorage.getItem("lockChatPinCode")
      );
      const chatLockusernumber = await AsyncStorage.getItem("chatlockusernumber");
      //@ts-ignore
      setChatLockNumber(chatLockusernumber);
      setVerifyPin(chatLockPin);
    };
  
    async function signIn() {
      const number = chatLockNumber;
      try {
        const confirmation = await auth().signInWithPhoneNumber(
          number.toString()
        );
        // @ts-ignore
        setConfirm(confirmation);
      } catch (error) {}
    }
  
    const handleGeneratePinEntered = (generatePin: any) => {
      const filteredArray = generatePin.filter((value: any) => value !== "");
      setGeneratePin(filteredArray.join("")); // Update the pin state
    };
  
    const handleConfirmPinEntered = (confirmpin: any) => {
      const filteredArray = confirmpin.filter((value: any) => value !== "");
      setConfirmPin(filteredArray.join("")); // Update the pin state
    };
  
    const handleUnlockPinEntered = (unlockpin: any) => {
      const filteredArray = unlockpin.filter((value: any) => value !== "");
      setUnlockPin(filteredArray.join("")); // Update the pin state
    };
  
    const handleVerifyOtp = (otp: any) => {
      const filteredArray = otp.filter((value: any) => value !== "");
      setOtp(filteredArray.join("")); // Update the pin state
    };
  
    const forgetPin = () => {
      signIn();
      setPinModalVisible(false);
      setOtpModalVisible(true);
    };
  
    const verifyOtpSubmit = async () => {
      try {
        // @ts-ignore
        if (otp.length === 6) {
          // @ts-ignore
          const response = await confirm.confirm(otp);
          if (response.user?.uid) {
            setOtpModalVisible(false);
            setGeneratePinModalVisible(true);
          }
        } else {
          setOtp("");
          Alert.alert("Error", "Enter a valid 6-digit OTP.");
        }
      } catch (error) {
        if (error.code === "auth/invalid-verification-code") {
          Alert.alert("", "Invalid OTP, Please try again");
        } else if (error.code === "auth/code-expired") {
          Alert.alert("", "OTP has expired, please request a new one");
        } else {
          //@ts-ignore
          if (isDeviceVerified == true && Platform.OS == "android") {
            //@ts-ignore
            isDeviceVerified = false;
            setOtpModalVisible(false);
            setGeneratePinModalVisible(true);
          } else {
            Alert.alert("Error", "Enter a valid 6-digit OTP.");
          }
        }
      }
    };
  
    const generatePinSubmit = () => {
      if (generatePin.length === 4) {
        setGeneratePinModalVisible(false);
        setConfirmPinModalVisible(true);
      } else {
        Alert.alert("Error", "Enter a valid 4-digit PIN");
      }
    };
  
    const confirmPinSubmit = async () => {
      // Use === instead of ==
      if (generatePin == confirmPin) {
        setPinApi(confirmPin);
        await AsyncStorage.setItem("lockChatPinCode", JSON.stringify(confirmPin));
        showToast("Your chat has been locked");
        setConfirmPinModalVisible(false);
        lockChat(newroomID, lockValue, (res: any) => {
          if (res) {
            socket.emit("changeLockStatus", {
              room: newroomID, //@ts-ignore
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
        Alert.alert("Error", "Your pin and confirm pin does not match.");
      }
    };
  
    const unlockPinSubmit = () => {
      // Use === instead of ==
      if (unlockPin == verifyPin) {
        lockChat(newroomID, lockValue, (res: any) => {
          if (res) {
            socket.emit("changeLockStatus", {
              room: newroomID, //@ts-ignore
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
        Alert.alert("Error", "Enter a valid 4-digit PIN.");
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
            //@ts-ignore
            Authorization: "Bearer " + globalThis.token,
          },
          data: {
            chat_user_id: mainprovider.friendId,
          },
        })
          .then((response) => {
            if (response.data.status == true) {
              calling_userID = response.data.data.user.id;
            } else {
            }
          })
          .catch((error) => {});
      } catch (error) {}
    };
  
    useEffect(() => {
      const deletemessssggggggg = async (deleteMessage: any) => {
        let data = deleteMessage.result;
        if (deleteMessage?.isDeletedForAll) {
          const messageSend = CryptoJS.AES.encrypt(
            "This message was deleted.",
            EncryptionKey
          ).toString();
  
          await updatedeleteforall(messageSend, data, (data: any) => {
            if (data) {
              getAllChatTableData(
                "table_user",
                newroomID,
                0,
                0,
                mainprovider.roomType,
                (data: any) => {
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
      //@ts-ignore
      socket.on("deleteMessage", deletemessssggggggg);
      return () => {
        //@ts-ignore
        socket.off("deleteMessage", deletemessssggggggg);
      };
    });
  
    //@ts-ignore
    useFocusEffect(
      React.useCallback(() => {
        if (newroomID) {
          getRoomBackgroundByRoomId(newroomID, (roomData: any) => {
            if (roomData) {
              setmygroupimg(roomData);
            } else {
              setmygroupimg({});
            }
          });
        //   getTotalMembers(newroomID, (res: any) => {
        //     if (res) {
        //       TOTALMEM = res;
        //     }
        //   });
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
        //@ts-ignore
        soundInstance.setVolume(volume);
      }
    }, [volume]);
  
    useEffect(() => {
      if (soundInstance) {
        //@ts-ignore
        soundInstance.setVolume(volume);
      }
    }, [volume]);
  
    const stopSound = () => {
      if (soundInstance) {
        //@ts-ignore
        soundInstance.stop(); //@ts-ignore
        soundInstance.release();
        setSoundInstance(null);
        setIsPlaying(false);
      }
    };
  
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
        const result: any = await DocumentPicker.pick({
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
        messages.forEach(async (message: any, index: any) => {
          if (message.localPaths && message.localPaths.length > 0) {
            await checkIfFilesExist(message, index);
          }
         
          // if (index == messages.length - 1) {
          //   setPageLoader(false)
          // }
        });
      };
  
  
     
      
      const checkIfFilesExist = async (message: any, messageIndex: any) => {
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
            console.log("if file exists or not =====", fileExists);
            if (fileExists) {
              //@ts-ignore
              updatedLocalPaths.push(item);
            } else {
              console.log("File doesnot exists in path", item);
  
              let newPath = "";
              if (message.messageType == "image") {
                newPath = blurImage;
              } else if (message.messageType == "video") {
                newPath = blurVideo;
              }
  
              //@ts-ignore
              updatedLocalPaths.push(newPath);
              replaceLocalPathInChatMessages(
                message.messageId,
                item,
                newPath,
                (success: any) => {
              
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
  
    async function OnChatModalTextClick(value: any) {
      if (value == "Cancel") {
        setMessageClickedId("");
        setMessageClicked({});
        setChatModal(false);
      } else if (value == "Delete") {
        const params = {
          //@ts-ignore
          userId: globalThis.userChatId,
          messageId: selectedMessageId,
          delete_type: "me",
          message_type: newroomType,
          roomId: newroomID,
        };
        //@ts-ignore
        await deleteMessageByResId(selectedMessageId, newroomType);
        //@ts-ignore
        socket.emit("deleteMessage", params);
        getAllChatTableData(
          "table_user",
          newroomID,
          0,
          0,
          mainprovider.roomType,
          (data: any) => {
            messageDelAndDis(data.disapperIds);
            if (data.temp.length > 0) {
              setMessages(data.temp);
            } else {
              getMembersFromRoomMembersSql(newroomID, async (res) => {
                //@ts-ignore
                const currentUser = res.find(
                  (u) => u.userId == globalThis.chatUserId
                );
                setCurrentUserData(currentUser);
                setMentionSuggestions(res);
                setMentionSuggestionsold(res);
              });
            }
          }
        );
        setismultidelete(false);
        setSelectedMessageId([]);
        setothermessagearray([]);
        setMessageClickedId("");
        setMessageClicked({});
        setChatModal(false);
      } else if (value == "Delete for all") {
        const params = {
          //@ts-ignore
          userId: globalThis.userChatId,
          messageId: selectedMessageId,
          delete_type: "all",
          message_type: newroomType,
          roomId: newroomID,
        };
  
        const messageSend = CryptoJS.AES.encrypt(
          "This message was deleted.",
          EncryptionKey
        ).toString();
        await updatedeleteforall(messageSend, selectedMessageId);
        //@ts-ignore
        socket.emit("deleteMessage", params);
        getAllChatTableData(
          "table_user",
          newroomID,
          0,
          0,
          mainprovider.roomType,
          (data: any) => {
            messageDelAndDis(data.disapperIds);
            if (data.temp.length > 0) {
              setMessages(data.temp);
            } else {
            }
          }
        );
        setismultidelete(false);
        setSelectedMessageId([]);
        setothermessagearray([]);
        setMessageClickedId("");
        setMessageClicked({});
        setChatModal(false);
      } else if (value == "Forward") {
        navigation.navigate("ForwardMessageScreen", {
          messageId: messageClickedId,
          rcvmsg: messageClickd,
        });
        setMessageClickedId("");
        setMessageClicked({});
        setChatModal(false);
      } else if (value == "Reply") {
        setChatModal(false);
        setShowReplyMessage(true);
      } else if (value == "Report") {
        setChatModal(false);
        setReportModal(true);
      }
    }
  
    const handleTranslateClick = (message) => {
      setTranslateClicked(message);
      setlanguageModel(true);
    };
  
    useEffect(() => {
      if (mainprovider.FriendNumber) {
        //@ts-ignore
        getRoomIdFromRes(
          String(mainprovider.FriendNumber), //@ts-ignore
          String(globalThis.phone_number),
          (res: any) => {
            if (res) {
              //@ts-ignore
              socket.emit("joinRoom", {
                roomId: res.roomId,
                //@ts-ignore
                userId: globalThis.userChatId,
              });
  
              getIsLock(res.roomId, (data: any) => {
                if (data == 1 && route?.params.screenFrom == "Dashboard") {
                  setPinModalVisible(true);
                }
                dispatch(setisLock(data));
              });
  
              getOtherPersonLastMessage(
                res.roomId, //@ts-ignore
                globalThis.userChatId,
                (isFound: boolean, lastMessageId: string) => {
                  if (isFound) {
                    socket.emit("seenCountMark", {
                      //@ts-ignore
                      userId: globalThis.userChatId,
                      messageId: lastMessageId,
                    });
  
                    updateRoomUnseenCount(res.roomId, 0);
                  }
                }
              );
  
              dispatch(setMainprovider({
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
              }));
              dispatch(setnewroomID(res?.roomId));
              dispatch(setisnewBlock(res.isUserExitedFromGroup));
              dispatch(setisnewmMute(res.isNotificationAllowed));
              dispatch(setisnewArchiveroom(res.archive));
            }
          }
        );
      }
    }, []);
  
    //function changed by dinki for media download
    const updateMessageStatus = async (newData: any) => {
      console.log("yessssss",newData)
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
          (aMessage: any) => aMessage.resId === newData.resId
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
      let countRed = updateMediacount + 1;
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
        //@ts-ignore
        {
          text: CryptoJS.AES.decrypt(result.message, EncryptionKey).toString(
            CryptoJS.enc.Utf8
          ),
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
      let countRed = updateMediacount + 1;
      dispatch(updateAppState({ updateMediaFunction: countRed }));
    }
  
    // new message recived work
    useEffect(() => {
      const handlenewMessageResive = async (data: any) => {
    
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
        //@ts-ignore
  
        try {
          let userName = "Tokee User";
          if (
            data.result.isNewRoom == 1 &&
            (newroomID == null || newroomID == undefined || newroomID == "")
          ) {
            let seenCount = 0; //@ts-ignore
            if (data.result.fromUser != globalThis.userChatId) {
              seenCount = 1;
            }
            //@ts-ignore
            socket.emit("joinRoom", {
              roomId: data.result.roomId,
              //@ts-ignore
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
              false, //@ts-ignore
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
                //@ts-ignore
                chat_user_id: globalThis.userChatId, //@ts-ignore
                contact_name: globalThis.displayName, //@ts-ignore
                profile_image: globalThis.image, //@ts-ignore
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
            //@ts-ignore
            userObject = {};
          }
  
          //@ts-ignore
          if (data.result.fromUser == globalThis.userChatId) {
            
            
            if (data.result.roomId == newroomID) {
              updateMessageStatus(data.result);
            }
            console.log("deeeeeeee")
            insertChatList({ paramsOfSend: data.result, chatRoom: false });
            if (
              data.result.isForwarded &&
              newroomID == data.result.roomId &&
              data.result.fromUser == globalThis.userChatId
            ) {
              onSend([
                //@ts-ignore
                {
                  text: CryptoJS.AES.decrypt(
                    data.result.message,
                    EncryptionKey
                  ).toString(CryptoJS.enc.Utf8),
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
              const text = CryptoJS.AES.decrypt(
                data.result.message,
                EncryptionKey
              ).toString(CryptoJS.enc.Utf8);
  
              onSend([
                //@ts-ignore
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
            console.log("deeeeeeee")
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
                  let dict = {
                    messageType: data.result.message_type,
                    messageId: data.result._id,
                    attachment: data.result.attachment,
                  };
                  MediaDownload(
                    dict,
                    data.result.roomId,
                    MediaUpdatedOnSame,
                    data.result
                  );
                } else {
                  onSend([
                    //@ts-ignore
                    {
                      text: CryptoJS.AES.decrypt(
                        data.result.message,
                        EncryptionKey
                      ).toString(CryptoJS.enc.Utf8),
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
                  //@ts-ignore
                  {
                    text: CryptoJS.AES.decrypt(
                      data.result.message,
                      EncryptionKey
                    ).toString(CryptoJS.enc.Utf8),
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
              let countRed = updateMediacount + 1;
              dispatch(updateAppState({ updateMediaFunction: countRed }));
            }
          }
  
          if (newroomID == data.result.roomId) {
            console.log("deeeeeeee")
            newMessageInsertList(
              data?.result,
              true, //@ts-ignore
              globalThis.phone_number,
              0,
              () => {
                dispatch(setChatlistmessage(data.result));
              }
            );
          } else {
            //@ts-ignore
            if (data.result.fromUser == globalThis.userChatId) {
              console.log("deeeeeeee")
              newMessageInsertList(
                data?.result,
                true, //@ts-ignore
                globalThis.phone_number,
                0,
                () => {
                  dispatch(setChatlistmessage(data.result));
                }
              );
            } else {
              newMessageInsertList(
                data?.result,
                true, //@ts-ignore
                globalThis.phone_number,
                0,
                () => {
                  dispatch(setChatlistmessage(data.result));
                }
              );
            }
          }
  
          //@ts-ignore
          if (data.result.fromUser !== globalThis.userChatId) {
            console.log("deeeeeeee")
            if (newroomID == data.result.roomId) {
              socket.emit("seenCountMark", {
                //@ts-ignore
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
  
      //@ts-ignore
      socket.on("newMessageResive", handlenewMessageResive);
      return () => {
        //@ts-ignore
        socket.off("newMessageResive", handlenewMessageResive);
      };
    });
  
    useEffect(() => {
      const handleUpdateGroupDetails = async (data: any) => {
        if (data.roomId && newroomID && data.roomId == newroomID) {
          updateroominfo(
            data.new_group_name,
            data.new_group_image,
            data.roomId,
            data.new_group_allow,
            data.owner,
            data.isPublic
          );
          dispatch(
            setMainprovider({
              ...mainprovider,
              userName: data.new_group_name,
              allow: data.new_group_allow,
              userImage: data.new_group_image,
            })
          );
          removeAllMembersFromRoomMembersSql(data.roomId, async () => {
            await addMembersToRoomMembersSql(
              data.remaningMembers,
              data.roomId,
              () => {
                getMembersFromRoomMembersSql(newroomID, async (res) => {
                  //@ts-ignore
                  const currentUser = res.find(
                    (u) => u.userId == globalThis.chatUserId
                  );
                  setCurrentUserData(currentUser);
                  setMentionSuggestions(res);
                  setMentionSuggestionsold(res);
                });
              }
            );
          });
          const currentUserIdx = data.remaningMembers.findIndex(
            //@ts-ignore
            (m: any) => m.chat_user_id == globalThis?.userChatId
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
        //@ts-ignore
        socket.off("updateGroupDetails", handleUpdateGroupDetails);
      };
    });
  
    function getLastSeenstring(RoomLastSeenDate: any) {
      let start: any = new Date(RoomLastSeenDate);
      let end: any = new Date();
      let difference = end - start;
  
      let elapsed_string = "Last seen few seconds ago";
      //Arrange the difference of date in days, hours, minutes, and seconds format
      let days = Math.floor(difference / (1000 * 60 * 60 * 24));
      let hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  
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
    const getUserLastSeen = async () => {
      dispatch(setlastseennew(""));
      const urlStr =
        chatBaseUrl + getlastSeenApi + "?userId=" + route.params.friendId;
      try {
        await axios({
          method: "get",
          url: urlStr,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            //@ts-ignore
            Authorization: "Bearer " + globalThis.token,
          },
        })
          .then((response) => {
            if (response.data.status == true) {
              getLastSeenstring(response.data.data);
            }
          })
          .catch((error) => {
            if (error.response.status == 401) {
              showToast("Session Expired.");
              //@ts-ignore
              globalThis.token = "";
              navigation.navigate("LoginScreen");
            }
          });
      } catch (error) {}
    };
  
    useEffect(() => {
      if (newroomType == "single") {
        if (!isRoomBlocked) {
          const intervalId = setInterval(() => {
            socket.emit("checkOnlineStatus", {
              friendId: mainprovider.friendId, //@ts-ignore
              userId: globalThis.userChatId,
            });
          }, 10000);
          dispatch(setintervalIds([...intervalIds, intervalId]));
        }
      }
    }, [isRoomBlocked, setIsRoomBlocked]);
  
    useEffect(() => {
      const handleOnlineStatus = (data: any) => {
        if (data.isOnline != isOnline) {
          setisOnline(data.isOnline);
          if (!data.isOnline) {
            getLastSeenstring(data?.lastSeen);
          } else {
            dispatch(setonlinestatus("Online"));
          }
        } else {
          if (!data.isOnline) {
            getLastSeenstring(data?.lastSeen);
          } else {
            dispatch(setonlinestatus("Online"));
          }
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
  
      let subDirectory = `${mainDirectory}/Images`;
      // Ensure main directory exists.
  
      let mediaName = attach.split("/").pop();
      let mediaId = mediaName.split(".").slice(0, -1).join(".");
      const filename = `${mediaId}.jpg`;
      const encoded = encodeURIComponent(filename);
      const destinationPath = `${subDirectory}/${encoded}`;
      return destinationPath;
    }
    /////////////////////////////////////////////////// select-image-gallery//////////////////////////////////////////////////
  
    const selectImage = async () => {
      let isCameraPermitted = await requestCameraPermission();
      if (isCameraPermitted) {
        ImagePicker.openPicker({
          width: 300,
          height: 400,
          multiple: true,
          cropping: true,
          // cropperCircleOverlay: true,
          compressImageQuality: 0.2,
        }).then((image: any) => {
          if (image !== undefined) {
            setSendItems(false);
            setCameraModal(false);
            setGroupImageModal(true);
            Keyboard.dismiss();
            setallattachment(image);
          }
        });
      }
    };
  
    /////////////////////////////////////////////////// capture-video-camera//////////////////////////////////////////////////
  
    const captureVideo = async () => {
      let isCameraPermitted = await requestCameraPermission();
      if (isCameraPermitted) {
        ImagePicker.openCamera({
          mediaType: "video",
          compressImageQuality: 0.2,
        }).then(async (image: any) => {
          if (image !== undefined) {
            const imageArr = [image];
            setVideoModal(false);
            //@ts-ignore
            setallattachment(
              imageArr.map((item) => ({ ...item, type: "video/mp4" }))
            );
            setLoading(false);
            setSendItems(false);
            setCameraModal(false);
            setGroupImageModal(true);
            Keyboard.dismiss();
          }
        });
      }
    };
  
    //functn by dinki
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
  
    /////////////////////////////////////////////////// select-video-gallery//////////////////////////////////////////////////
  
    const selectVideo = async () => {
      let isCameraPermitted = await requestCameraPermission();
      if (isCameraPermitted) {
        ImagePicker.openPicker({
          multiple: true,
          mediaType: "video",
          compressVideoPreset: "MediumQuality",
          compressImageQuality: 0.2,
        })
          .then((image: any) => {
            if (image !== undefined) {
              setVideoModal(false);
              setSendItems(false);
              setCameraModal(false);
              setGroupImageModal(true);
              Keyboard.dismiss();
              setallattachment(
                image.map((item) => ({ ...item, type: "video/mp4" }))
              );
            }
          })
          .catch((errrr) => {});
      }
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
  
    const BucketUpload = async (image: any, mediaType: any) => {
      setCameraModal(false);
      setVideoModal(false);
      setLoading(false);
      const allPaths = await allattachment.map((image: any) => image.path);
      const mId = Math.floor(Math.random() * 9000) + 1000;
      const paramsOfSend = {
        mId: mId,
        roomId: newroomID, //@ts-ignore
        fromUser: globalThis.userChatId, //@ts-ignore
        userName: globalThis.displayName, //@ts-ignore
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
  
      insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });
  
      //@ts-ignore
      onSend([
        //@ts-ignore
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
          //@ts-ignore
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
      let newAttachmentUrls: any = [];
      let newLocalPathsUrl: any = [];
  
      // Use Promise.all to wait for all uploads to complete
      await Promise.all(
        image.map(async (file: any, index: any) => {
          const pathParts = file.path.split("/");
          const fileName = Date.now() + "_" + pathParts[pathParts.length - 1];
          const fileNameWithoutExtension = fileName.split(".")[0];
          const fPath = file.path;
          const base64 = await RNFetchBlob.fs.readFile(fPath, "base64");
          const arrayBuffer = decode(base64);
          const contentDeposition = `inline;filename="${fileName}"`;
  
          const params = {
            Bucket: "tokee-chat-staging",
            Key: folderName + fileName,
            Body: arrayBuffer,
            ContentDisposition: contentDeposition,
            ContentType: file.ContentType,
          };
  console.log("BUCKET UPLOAD IMAGE ===>>>",params)
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
  
            //code-by-dinki
            let mediaName = data.Location.split("/").pop();
  
            let mediaId = mediaName.split(".").slice(0, -1).join(".");
  
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
          } catch (err) {}
        })
      );
  
      setUploadProgress([]);
      const paramsOfSendforlive = {
        mId: mId,
        //@ts-ignore
        userName: globalThis.displayName,
        //@ts-ignore
        phoneNumber: globalThis.phone_number, //@ts-ignore
        currentUserPhoneNumber: globalThis.phone_number,
        //@ts-ignore
        userImage: globalThis.image,
        roomId: newroomID,
        roomName: mainprovider?.userName,
        roomImage: mainprovider?.userImage,
        roomType: mainprovider?.roomType,
        //@ts-ignore
        roomOwnerId: globalThis.userChatId,
        message: "",
        message_type: mediaType,
        roomMembers: [mainprovider?.friendId ? mainprovider?.friendId : ""],
        parent_message_id: "",
        attachment: newAttachmentUrls,
        //@ts-ignore
        from: globalThis.userChatId,
        resId: chatMessageTime,
        createdAt: new Date(),
      };
      //@ts-ignore
      socket.emit("sendmessage", paramsOfSendforlive);
    };
  
    const BucketUploadFile = async (file: any, mediaType: any) => {
      setCameraModal(false);
      setVideoModal(false);
      setLoading(false);
      setRecordTime("");
      setAudioPath("");
      setIsRecording(false);
  
      const allPaths = await file.map((image: any) => image.uri || image.path);
      const mId = Math.floor(Math.random() * 9000) + 1000;
      const paramsOfSend = {
        mId: mId,
        roomId: newroomID, //@ts-ignore
        fromUser: globalThis.userChatId, //@ts-ignore
        userName: globalThis.displayName, //@ts-ignore
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
      insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });
      //@ts-ignore
      onSend([
        //@ts-ignore
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
          video: mediaType == "video" ? allPaths : [],
          image: mediaType == "image" ? allPaths : [],
          audio: mediaType == "audio" ? allPaths : [],
          parent_message: {},
          //@ts-ignore
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
      let newAttachmentUrls: any = [];
  
      // // Use Promise.all to wait for all uploads to complete
      await Promise.all(
        file.map(async (document: any, index: any) => {
          const fPath = document.uri || document.path;
          try {
            const base64 =
              Platform.OS == "android"
                ? await RNFetchBlob.fs.readFile(fPath, "base64")
                : await fs.readFile(fPath, "base64");
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
  
            console.log("BUCKET UPLOAD ==>>>>>",params)
  
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
          } catch (err) {
            setLoading(false);
          }
        })
      );
      setUploadProgress([]);
      const paramsOfSendforlive = {
        mId: mId,
        //@ts-ignore
        userName: globalThis.displayName, //@ts-ignore
        phoneNumber: globalThis.phone_number, //@ts-ignore
        currentUserPhoneNumber: globalThis.phone_number,
        //@ts-ignore
        userImage: globalThis.image,
        roomId: newroomID,
        roomName: mainprovider?.userName,
        roomImage: mainprovider?.userImage,
        roomType: mainprovider?.roomType,
        //@ts-ignore
        roomOwnerId: globalThis.userChatId,
        message: "",
        message_type: mediaType,
        roomMembers: [mainprovider?.friendId ? mainprovider?.friendId : ""],
        parent_message_id: "",
        attachment: newAttachmentUrls,
        //@ts-ignore
        from: globalThis.userChatId,
        resId: chatMessageTime,
        createdAt: new Date(),
      };
  
      //@ts-ignore
      socket.emit("sendmessage", paramsOfSendforlive);
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
            Alert.alert("Please allow the permission.");
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
      setRecordTime("");
      setAudioPath("");
      setIsRecording(false);
  
      try {
        audioRecorderPlayer.removeRecordBackListener();
        const result = await audioRecorderPlayer.stopRecorder();
  
        let unique =
          new Date().getUTCMilliseconds() + new Date().getTime().toString(36);
  
        const dirs = RNFS.CachesDirectoryPath;
  
        let ext = Platform.OS === "android" ? "mp3" : "m4a";
  
        let oldPath = `${dirs}/sound.${ext}`;
        let newPath = `${dirs}/sound${unique}.${ext}`;
  
     
        // Check if the file exists at the old path before moving
        const fileExists = await RNFS.exists(result);
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
        audioRecorderPlayer.removeRecordBackListener();
      } catch (error) {}
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
      audioRecorderPlayer.addRecordBackListener((e) => {});
    };
  
    const JoinPublicGroup = async () => {
      setLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const bodydata = JSON.stringify({
        //@ts-ignore
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
          const messageSend = CryptoJS.AES.encrypt(
            `${globalThis.displayName} joined the group.`,
            EncryptionKey
          ).toString();
  
          const paramsOfSendforlive = {
            mId: mId,
            //@ts-ignore
            userName: globalThis.displayName, //@ts-ignore
            phoneNumber: globalThis.phone_number, //@ts-ignore
            currentUserPhoneNumber: globalThis.phone_number,
            //@ts-ignore
            userImage: globalThis.image,
            roomId: newroomID,
            roomName: mainprovider?.userName,
            roomImage: mainprovider?.userImage,
            roomType: mainprovider?.roomType,
            //@ts-ignore
            roomOwnerId: globalThis.userChatId,
            message: messageSend,
            message_type: "notify",
            roomMembers: [],
            parent_message_id: "",
            attachment: [],
            //@ts-ignore
            from: globalThis.userChatId,
            resId: Date.now(),
            createdAt: new Date(),
          };
  
          //@ts-ignore
          socket.emit("joinRoom", {
            roomId: newroomID, //@ts-ignore
            userId: globalThis.userChatId,
          });
  
          let createGroup = {
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
              //@ts-ignore
              Authorization: "Bearer " + globalThis.token,
            },
          });
  
          if (res.data.status == true) {
            const groupMembers: any[] = [];
  
            //@ts-ignore
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
  
            removeAllMembersFromRoomMembersSql(newroomID, () => {
              addMembersToRoomMembersSql(groupMembers, newroomID);
            });
          } else {
            Alert.alert(res.data.message);
          }
  
          setLoading(false);
          navigation.pop(2);
        } catch (err) {}
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
        //@ts-ignore
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
            //@ts-ignore
            mention?.roomName
              ?.toLowerCase()
              .includes(searchText.toLowerCase().slice(1)) ||
            //@ts-ignore
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
  
    async function TranslateWord(text: any, callback: any) {
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
        var textEnteredByUser = response.data.data.translations[0].translatedText;
        const userInput = textEnteredByUser.toLowerCase();
  
        // Split the input sentence into words
        const inputWords = userInput.split(" ");
        const checkBadWord = await AsyncStorage.getItem("BadWords");
        console.log("in fourth",checkBadWord)
        let badWordsInArr = [];
        if (checkBadWord) {
          badWordsInArr = JSON.parse(checkBadWord)
        } else {
          badWordsInArr = badword[0].words
        }
        // Check if any of the input words match any word in the array
        const match = inputWords.some((word) => badWordsInArr.includes(word));
  
        if (match) {
          Alert.alert(
            "Alert!",
            t(
              "This message has an inappropriate content which is prohibited to use."
            ),
            [{ text: t("ok") }]
          );
          callback(true); // Inappropriate words found
        } else {
          callback(false); // No inappropriate words found
        }
      } catch (error) {
        setLoading(false);
        callback(false); // Error occurred, consider it as inappropriate words found
      }
    }
  
    const handleSendMessage = useCallback((chatmessage) => {
       
    //   setMessageInput("");
    //   setSendBtnShow(false);
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
    //   if (messageInput !== "") {
        //@ts-ignore
        if (currentUserData?.isPublic) {
          TranslateWord(chatmessage[0].text, (data: any) => {
            if (!data) {
              onsendallmessage(data);
            }
            return data;
          });
        } else {
          onsendallmessage(chatmessage[0]);
        // }
      }
    }, [
      messageInput,
      disappearmsg,
      disappearmsgchecked,
      isnewblock,
      currentUserData,
    ]);
  
    const renderInputToolbar = useCallback(
      (props: any) => {
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
                          setChatModal(true);
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
                                  //@ts-ignore
                                  style={{
                                    fontSize: 16,
                                    color: iconTheme().iconColorNew,
                                    fontFamily: font.semibold(),
                                  }}
                                  numberOfLines={1}
                                >
                                  {
                                    //@ts-ignore
                                    globalThis.userChatId ===
                                    messageClickd.user?._id
                                      ? "You"
                                      : mentionSuggestions?.find(
                                          (member: any) =>
                                            member &&
                                            member._id === messageClickd.user?._id
                                          //@ts-ignore
                                        )?.name || ""
                                  }
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
                                messageClickd.messageType != "contact" &&
                                messageClickd.messageType != "location" &&
                                messageClickd.messageType != "story" && (
                                  <Image
                                    source={
                                      messageClickd.attachment
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
                              {messageClickd.messageType == "story" && (
                                <FastImage
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
                              onPress={() =>
                                //@ts-ignore
                                handleMentionSelection(item.roomName)
                              }
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
                                //@ts-ignore
                                source={{ uri: item.image }}
                                resizeMode="cover"
                              />
                              <View>
                                <Text style={{ fontFamily: font.semibold() }}>
                                  {
                                    //@ts-ignore
                                    item?.roomName
                                  }
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
                                onStopRecord(),
                                  setIsRecording(false),
                                  setRecordTime(""),
                                  setAudioPath("");
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
                                : mainprovider.allow == "admin" && //@ts-ignore
                                  globalThis.userChatId != mainprovider.owner &&
                                  currentUserData &&
                                  //@ts-ignore
                                  currentUserData.isAdmin != 1
                                ? null
                                : setSendItems(!sendItems);
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
                                ? t("You_cant_message")
                                : mainprovider.allow == "admin" && //@ts-ignore
                                  globalThis.userChatId != mainprovider.owner &&
                                  currentUserData &&
                                  //@ts-ignore
                                  currentUserData.isAdmin != 1
                                ? t("only_admin")
                                : t("typeHere")
                            }
                            onChangeText={(text) => {
                              //  setshowemoji(false);
                                setMessageInput(text);
                                if (mainprovider?.room && text.length > 0) {
                                  //@ts-ignore
                                  socket.emit("typing", {
                                    roomId: mainprovider?.room.roomId,
                                    //@ts-ignore
                                    userId: globalThis.userChatId,
                                    //@ts-ignore
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
                                } else if(text.length == 1){
                                  setSendBtnShow(false);
                                }
                                if( newroomType != "single"){
                              
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
                                          setIsMentioning(true);
                                        } else {
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
                        
                            onTouchStart={()=>{
                              if (isStipopShowing) {
                                switch (Platform.OS) {
                                  case "android":
                                    textInputRef?.current?.focus();
                                    StipopModule.show(
                                      false,
                                      false,
                                      () => {
                                        setIsStipopShowing(false);
                                      }
                                    );
                                    break;
                                }
                              }
                            }}
                            editable={
                              isnewblock == true
                                ? false
                                : mainprovider.allow == "admin" && //@ts-ignore
                                  globalThis.userChatId != mainprovider.owner &&
                                  currentUserData &&
                                  //@ts-ignore
                                  currentUserData.isAdmin != 1
                                ? false
                                : true
                            }
                            multiline={true}
                            //@ts-ignore
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
                                : mainprovider.allow == "admin" && //@ts-ignore
                                  globalThis.userChatId != mainprovider.owner &&
                                  currentUserData &&
                                  //@ts-ignore
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
                               // borderRadius: 50,
                               // marginVertical: 5,
                                borderColor: "transparent",
                               // backgroundColor:"red"
                              }}
                              onPress={handleSendMessage}
                              delayLongPress={500}
                              onLongPress={() => {
                                console.log(route.params.isPublic ,currentUserData?.isPublic);
                               
                                if (isnewblock == false) {
                                  if ((route.params.isPublic != 1 && route.params.isPublic != undefined  ) || (currentUserData?.isPublic != 1 &&  currentUserData?.isPublic != undefined)) {
                                    setDisappearmsg(!disappearmsg);
                                  }
                                }
        
                                // if (messageInput !== "") {
                                //   //@ts-ignore
                                //   if ( || !currentUserData?.isPublic  ) {
                                //     setDisappearmsg(!disappearmsg);
                                //   }
                                // }
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
                                      : mainprovider.allow == "admin" && //@ts-ignore
                                        globalThis.userChatId !=
                                          mainprovider.owner &&
                                        currentUserData &&
                                        //@ts-ignore
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
      },
      [
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
      ]
    );
  
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
        color: iconTheme().iconColorNew,
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
        marginRight: 10,
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
  
    const [stopgifsend, setstopgifsend] = useState(true);
    useFocusEffect(
      React.useCallback(() => {
        if (!stopgifsend) {
          setstopgifsend(true);
        }
      }, [stopgifsend])
    );
  
    const onImageChange = async ({ nativeEvent }: any) => {
      if (stopgifsend && !reportModal) {
        const { linkUri } = nativeEvent;
  
        const mId = Math.floor(Math.random() * 9000) + 1000;
        const paramsOfSend = {
          mId: mId,
          roomId: newroomID, //@ts-ignore
          fromUser: globalThis.userChatId, //@ts-ignore
          userName: globalThis.displayName, //@ts-ignore
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
          //@ts-ignore
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
            parent_message: {}, //@ts-ignore
            user: { _id: globalThis.userChatId },
            unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
          },
        ]);
        const paramsOfSendforlive = {
          mId: mId, //@ts-ignore
          userName: globalThis.displayName, //@ts-ignore
          phoneNumber: globalThis.phone_number, //@ts-ignore
          currentUserPhoneNumber: globalThis.phone_number, //@ts-ignore
          userImage: globalThis.image,
          roomId: newroomID,
          roomName: mainprovider?.userName,
          roomImage: mainprovider?.userImage,
          roomType: mainprovider?.roomType, //@ts-ignore
          roomOwnerId: globalThis.userChatId,
          message: "",
          message_type: "sticker",
          roomMembers: [mainprovider?.friendId ? mainprovider?.friendId : ""],
          parent_message_id: "",
          attachment: [linkUri], //@ts-ignore
          from: globalThis.userChatId,
          resId: chatMessageTime,
          createdAt: new Date(),
        };
        socket.emit("sendmessage", paramsOfSendforlive);
      }
    };
  
    const handleSwipeRight = (message: any) => {
      setMessageClicked(message.currentMessage);
      setMessageClickedId(message.currentMessage.messageId);
      setTimeout(() => {
        setShowReplyMessage(true);
      }, 200);
    };
  
    const handleSwipeRightcancle = () => {
      setMessageClicked({});
      setMessageClickedId("");
      setShowReplyMessage(false);
    };
  
    const renderSystemMessage = useCallback((props: any) => {
      return (
        <View>
          {props.currentMessage.messageType == "systemmessage" ? (
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
                {props.currentMessage.text}
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
  
    const isCloseToTop = ({
      layoutMeasurement,
      contentOffset,
      contentSize,
    }: any) => {
      const paddingToTop = 50;
      return (
        contentSize.height - layoutMeasurement.height - paddingToTop <=
        contentOffset.y
      );
    };
  
    const paginationData = (limit: number, skip: number) => {
      // if (!route.params.isFromPublicPage) {
  
        getAllChatTableData(
          "table_user",
          newroomID,
          skip,
          limit,
          mainprovider.roomType,
          (data: any) => {
            messageDelAndDis(data.disapperIds);
            setisloadearly(true);
            if (data.temp.length > 0) {
              setIsTop(false);
              setMessages((previousMessages: any) =>
                GiftedChat.append(data.temp, previousMessages)
              );
            } else {
              setisloadearly(false);
            }
          }
        );
  
      // }
  
  
    };
  
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
    const onSelectMessageothers = (messageId: any) => {
      //@ts-ignore
      const isSelected: any = othermessagearray.includes(messageId);
      if (isSelected) {
        setothermessagearray((prevIds) =>
          prevIds.filter((id) => id !== messageId)
        ); // Deselect if already selected
      } else {
        //@ts-ignore
        setothermessagearray((prevIds) => [...prevIds, messageId]); // Select the message
      }
    };
  
    const apiKey = "AIzaSyCWQ0n4Mf6SClp4G1cD5ng9w-4RZ3pXsaw";
    const renderBubble = useCallback(
      (props: any) => {
        const isSelected = selectedMessageId.includes(
          //@ts-ignore
          props.currentMessage.messageId
        );
        return (
          <View style={{ width: "100%", alignSelf: "center" }}>
            {ismultidelete && !props.currentMessage.isDeletedForAll && (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  left:
                    ismultidelete &&
                    props.currentMessage.user._id !== globalThis.userChatId
                      ? 0
                      : 10,
                  zIndex: 50,
                  top: "35%",
                }}
                onPress={() => {
                  onSelectMessage(props.currentMessage.messageId);
                  if (props.currentMessage.user._id !== globalThis.userChatId) {
                    onSelectMessageothers(props.currentMessage.messageId);
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
                    props.currentMessage.user._id !== globalThis.userChatId
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
                          props.currentMessage.user._id !== globalThis.userChatId
                            ? "flex-start"
                            : "flex-end",
                      }}
                    >
                      <Bubble
                        {...props}
                        isCustomViewBottom={false}
                        renderCustomView={(props) => {
                          if (
                            //@ts-ignore
                            props?.currentMessage?.messageType === "contact" && //@ts-ignore
                            !props.currentMessage.isDeletedForAll
                          ) {
                            return (
                              <View style={{ overflow: "hidden" }}>
                                {
                                  //@ts-ignore
                                  props.currentMessage.attachment.map(
                                    (videoUri: any, index: any) => (
                                      <TouchableOpacity
                                        key={index}
                                        onPress={() => {}}
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
                                          }}
                                          style={{
                                            backgroundColor: "#fff",
                                            justifyContent: "center",
                                            alignItems: "center", //@ts-ignore
                                            paddingVertical: 8, //@ts-ignore
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
                                  )
                                }
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
                                              backgroundColor: "#0f0", // Change color as needed
                                            }}
                                          />
                                        </View>
                                      ))
                                  }
                                </View>
                              </View>
                            );
                          }
  
                          if (
                            //@ts-ignore
                            props?.currentMessage?.messageType === "location" && //@ts-ignore
                            !props.currentMessage.isDeletedForAll
                          ) {
                            return (
                              <View>
                                <TouchableOpacity
                                  onPress={() => {
                                    const scheme = Platform.select({
                                      ios: "maps://0,0?q=",
                                      android: "geo:0,0?q=",
                                    }); //@ts-ignore
                                    const latLng = `${props.currentMessage.attachment[0].lat},${props.currentMessage.attachment[0].long}`;
                                    const url = Platform.select({
                                      ios: `${scheme}@${latLng}`,
                                      android: `${scheme}${latLng}`,
                                    });
                                    //@ts-ignore
                                    Linking.openURL(url);
                                  }}
                                >
                                  <ImageBackground
                                    source={{
                                      uri: `https://maps.google.com/maps/api/staticmap?center=${
                                        //@ts-ignore
                                        props.currentMessage.attachment[0].lat
                                      },${
                                        //@ts-ignore
                                        props.currentMessage.attachment[0].long
                                      }&zoom=${30}&size=240x150&scale=50&maptype=normal&key=${apiKey}&markers=icon:https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740__480.png|${
                                        //@ts-ignore
                                        props.currentMessage.attachment[0].lat //@ts-ignore
                                      },${
                                        //@ts-ignore
                                        props.currentMessage.attachment[0].long
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
                            //@ts-ignore
                            props?.currentMessage?.messageType === "sticker" && //@ts-ignore
                            !props.currentMessage.isDeletedForAll
                          ) {
                            return (
                              <View style={{ overflow: "hidden" }}>
                                {
                                  //@ts-ignore
                                  props.currentMessage.attachment.map(
                                    (item: any, index: any) => (
                                      <Image
                                        key={index}
                                        source={{ uri: item }}
                                        style={{
                                          height: 150,
                                          width: 150,
                                          overflow: "hidden", //@ts-ignore
                                          //@ts-ignore
                                          borderTopLeftRadius:
                                            //@ts-ignore
                                            props?.currentMessage.user?._id == //@ts-ignore
                                            globalThis.userChatId
                                              ? 13
                                              : 0, //@ts-ignore
                                          //@ts-ignore
                                          borderTopRightRadius:
                                            //@ts-ignore
                                            props?.currentMessage.user?._id !== //@ts-ignore
                                            globalThis.userChatId
                                              ? 13
                                              : 0,
                                        }}
                                        resizeMode="cover"
                                      />
                                    )
                                  )
                                }
                              </View>
                            );
                          }
  
                          if (
                            //@ts-ignore
                            props?.currentMessage?.isForwarded && //@ts-ignore
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
                            //@ts-ignore
                            props?.currentMessage?.messageType === "document" && //@ts-ignore
                            !props.currentMessage.isDeletedForAll
                          ) {
                            return (
                              <View>
                         
                                {
                                  //@ts-ignore
                                  props.currentMessage.attachment.map(
                                    (videoUri: any, index: any) => (
                                      <TouchableOpacity
                                        key={index}
                                        onPress={() =>
                                          !props?.currentMessage?.localPaths
                                            ?.length > 0
                                            ? MediaDownload(
                                                props.currentMessage,
                                                newroomID,
                                                MediaUpdated
                                              )
                                            : handleDocumentPress(
                                                props.currentMessage.localPaths
                                              )
                                        }
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
                                            {"Document"}
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
                                  )
                                }
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
  
                          if (
                            //@ts-ignore
                            props?.currentMessage?.parent_message?.resId && //@ts-ignore
                            !props?.currentMessage?.isDeletedForAll
                          ) {
                            return (
                              <TouchableOpacity
                                onPress={() => {
                                  scrolltoparentmessage(
                                    //@ts-ignore
                                    props?.currentMessage?.parent_message
                                      ?.messageId ||
                                      //@ts-ignore
                                      props?.currentMessage?.parent_message?._id
                                  );
                                }}
                                style={{ padding: 8 }}
                              >
                                <View
                                  style={{
                                    //@ts-ignore
                                    color: COLORS.black,
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    padding: 5,
                                    paddingLeft: 10,
                                    borderLeftWidth: 3,
                                    borderLeftColor: iconTheme().iconColorNew,
                                    borderRadius: 5,
                                    maxWidth: windowWidth - 120,
                                  }}
                                >
                                  {
                                    //@ts-ignore
                                    (props.currentMessage?.parent_message
                                      .message_type || //@ts-ignore
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
                                            //@ts-ignore
                                            style={{
                                              fontSize: 16,
                                              color: iconTheme().iconColorNew,
                                              fontFamily: font.semibold(),
                                            }}
                                            numberOfLines={1}
                                          >
                                            {
                                              //@ts-ignore
                                              globalThis.userChatId === //@ts-ignore //@ts-ignore //@ts-ignore
                                              (props?.currentMessage
                                                .parent_message?.user?._id || //@ts-ignore
                                                //@ts-ignore
                                                //@ts-ignore
                                                props.currentMessage
                                                  .parent_message.from)
                                                ? "You"
                                                : allmembers?.find(
                                                    (member: any) =>
                                                      member &&
                                                      member._id === //@ts-ignore
                                                        (props?.currentMessage //@ts-ignore
                                                          .parent_message?.user
                                                          ?._id || //@ts-ignore
                                                          props.currentMessage //@ts-ignore
                                                            .parent_message.from)
                                                  )?.name || ""
                                            }
                                          </Text>
                                          <View style={{ flexDirection: "row" }}>
                                            <Image
                                              source={
                                                //@ts-ignore
                                                //@ts-ignore
                                                props?.currentMessage
                                                  .parent_message?.message_type ==
                                                  "image" || //@ts-ignore
                                                //@ts-ignore
                                                props?.currentMessage
                                                  .parent_message?.messageType ==
                                                  "image" || //@ts-ignore
                                                //@ts-ignore
                                                props?.currentMessage
                                                  .parent_message?.message_type ==
                                                  "sticker" || //@ts-ignore
                                                //@ts-ignore
                                                props?.currentMessage
                                                  .parent_message?.messageType ==
                                                  "sticker" ||
                                                //@ts-ignore
                                                //@ts-ignore
                                                props?.currentMessage
                                                  .parent_message?.message_type == //@ts-ignore
                                                  "story" ||
                                                //@ts-ignore
                                                //@ts-ignore
                                                props?.currentMessage
                                                  .parent_message?.messageType == //@ts-ignore
                                                  "story"
                                                  ? require("../../Assets/Icons/Gallary.png") //@ts-ignore
                                                  : //@ts-ignore
                                                  //@ts-ignore
                                                  (props?.currentMessage
                                                      .parent_message
                                                      ?.messageType || //@ts-ignore
                                                      //@ts-ignore
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
                                              {
                                                //@ts-ignore
                                                //@ts-ignore
                                                props?.currentMessage
                                                  .parent_message?.messageType || //@ts-ignore
                                                  //@ts-ignore
                                                  //@ts-ignore
                                                  props?.currentMessage
                                                    .parent_message?.message_type
                                              }
                                            </Text>
                                          </View>
                                        </View>
                                        {
                                          //@ts-ignore
                                          (props?.currentMessage.parent_message
                                            ?.message_type == "image" || //@ts-ignore
                                            props?.currentMessage.parent_message
                                              ?.messageType == "image" || //@ts-ignore
                                            props?.currentMessage.parent_message
                                              ?.message_type == "sticker" || //@ts-ignore
                                            props?.currentMessage.parent_message
                                              ?.messageType == "sticker" || //@ts-ignore
                                            props?.currentMessage.parent_message
                                              ?.message_type == "video" || //@ts-ignore
                                            props?.currentMessage.parent_message
                                              ?.messageType == "video" ||
                                            //@ts-ignore
                                            props?.currentMessage.parent_message
                                              ?.message_type == "story" ||
                                            //@ts-ignore
                                            props?.currentMessage.parent_message
                                              ?.messageType == "story") && (
                                            <Image
                                              source={
                                                //@ts-ignore
                                                //@ts-ignore
                                                props?.currentMessage
                                                  .parent_message?.attachment
                                                  ? {
                                                      uri:
                                                        //@ts-ignore
                                                        //@ts-ignore
                                                        props?.currentMessage
                                                          .parent_message
                                                          .attachment[0]?.file ||
                                                        //@ts-ignore
                                                        //@ts-ignore
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
                                              resizeMode="cover"
                                            />
                                          )
                                        }
                                      </View>
                                    ) : (
                                      <Text
                                        style={{ fontFamily: font.semibold() }}
                                      >
                                        {
                                          //@ts-ignore
                                          props.currentMessage.parent_message
                                            .message
                                            ? CryptoJS.AES.decrypt(
                                                //@ts-ignore
                                                //@ts-ignore
                                                props.currentMessage
                                                  .parent_message.message,
                                                EncryptionKey
                                              ).toString(CryptoJS.enc.Utf8) //@ts-ignore
                                            : props.currentMessage.parent_message
                                                .text
                                        }
                                      </Text>
                                    )
                                  }
                                </View>
                              </TouchableOpacity>
                            );
                          }
                          //@ts-ignore
                          if (props?.currentMessage?.messageType == "story") {
                            return (
                              <View style={{ padding: 8 }}>
                                <View
                                  style={{
                                    //@ts-ignore
                                    color: COLORS.black,
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    padding: 5,
                                    paddingLeft: 10,
                                    borderLeftWidth: 3,
                                    borderLeftColor: iconTheme().iconColorNew,
                                    borderRadius: 5,
                                  }}
                                >
                                  {
                                    //@ts-ignore
                                    (props.currentMessage?.message_type || //@ts-ignore
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
                                            //@ts-ignore
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
                                            {
                                              //@ts-ignore
                                              props?.currentMessage.attachment[0]
                                                .type !== "template" && (
                                                <Image
                                                  source={require("../../Assets/Icons/Gallary.png")}
                                                  style={{
                                                    height: 16,
                                                    width: 16,
                                                    tintColor: "#000",
                                                  }}
                                                />
                                              )
                                            }
                                            {
                                              //@ts-ignore
                                              props?.currentMessage.attachment[0]
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
                                                    //@ts-ignore
                                                    //@ts-ignore
                                                    props?.currentMessage
                                                      .attachment[0]?.title
                                                  }
                                                </Text>
                                              )
                                            }
                                          </View>
                                        </View>
  
                                        {props?.currentMessage &&
                                          //@ts-ignore
                                          props?.currentMessage.attachment[0]
                                            .type !== "template" && (
                                            <FastImage
                                              source={{
                                                //@ts-ignore
                                                //@ts-ignore
                                                //@ts-ignore
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
                                      <Text
                                        style={{ fontFamily: font.semibold() }}
                                      >
                                        {
                                          //@ts-ignore
                                          props.currentMessage.parent_message
                                            .message
                                            ? CryptoJS.AES.decrypt(
                                                //@ts-ignore
                                                //@ts-ignore
                                                props.currentMessage
                                                  .parent_message.message,
                                                EncryptionKey
                                              ).toString(CryptoJS.enc.Utf8)
                                            : //@ts-ignore
                                              props.currentMessage.parent_message
                                                .text
                                        }
                                      </Text>
                                    )
                                  }
                                </View>
                              </View>
                            );
                          }
                        }}
                        wrapperStyle={{
                          right: {
                            backgroundColor: chat().back_ground_color,
                            // Change this to the color you want for your sent messages
                          },
                          left: {
                            backgroundColor: chatOther().back_ground_color,
                            // Change this to the color you want for received messages
                          },
                        }}
                        textStyle={{
                          right: {
                            //@ts-ignore chatTextColor
                            fontSize: globalThis.chatFontsize,
                            color: "black",
                            fontFamily: font.semibold(), // Change this to set the text color for sent messages
                          },
                          left: {
                            //@ts-ignore
                            fontSize: globalThis.chatFontsize,
                            color: "black",
                            fontFamily: font.semibold(), // Change this to set the text color for received messages
                          },
                        }}
                      />
  
                      {renderIf(
                        props.currentMessage.user._id !== globalThis.userChatId &&
                          props.currentMessage.messageType == "text",
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
  
                      {props.currentMessage.unreadCount >= 1 &&
                      props.currentMessage.status != "" ? (
                        newroomType != "single" ||
                        (newroomType == "single" &&
                          props.currentMessage.user._id ==
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
                                props.currentMessage.user._id !=
                                globalThis.userChatId
                                  ? 28
                                  : "auto",
                              left:
                                props.currentMessage.user._id ==
                                globalThis.userChatId
                                  ? 28
                                  : "auto",
                              bottom: 4,
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
                              {props.currentMessage.unreadCount > 99
                                ? "+99"
                                : props.currentMessage.unreadCount}
                            </Text>
                          </View>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                    </View>
                  } //@ts-ignore
                  isLeft={props.currentMessage.user._id == globalThis.userChatId}
                />
              </View>
            </GestureHandlerRootView>
          </View>
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
  
    const getLatLongMethod = (currentLongitude: any) => {
      if (currentLongitude) {
        setLocationModel(false);
        setSendItems(false);
        const mId = Math.floor(Math.random() * 9000) + 1000;
        const paramsOfSend = {
          mId: mId,
          roomId: newroomID, //@ts-ignore
          fromUser: globalThis.userChatId, //@ts-ignore
          userName: globalThis.displayName, //@ts-ignore
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
          isNotificationAllowed: isnewmute ? isnewmute : true, //@ts-ignore
          userName: globalThis.displayName, //@ts-ignore
          phoneNumber: globalThis.phone_number, //@ts-ignore
          currentUserPhoneNumber: globalThis.phone_number, //@ts-ignore
          userImage: globalThis.image,
          roomId: newroomID,
          roomName: mainprovider?.userName,
          roomImage: mainprovider?.userImage,
          roomType: mainprovider?.roomType, //@ts-ignore
          roomOwnerId: globalThis.userChatId,
          message: "",
          message_type: "location",
          roomMembers: [mainprovider?.friendId ? mainprovider?.friendId : ""],
          isForwarded: false,
          attachment: [JSON.stringify(currentLongitude)], //@ts-ignore
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
        //@ts-ignore
        socket.emit("sendmessage", paramsOfSendlive);
        //@ts-ignore
        onSend([
          //@ts-ignore
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
            //@ts-ignore
            user: { _id: globalThis.userChatId },
            unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
          },
        ]);
      }
    };
  
    const renderTime = (props: any) => {
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
          {props.currentMessage.shouldDisappear == 1 &&
            props.currentMessage.disappearMsgTime != null &&
            props.currentMessage.disappearMsgTime != 0 && (
              <ChatCounter message={props.currentMessage.disappearMsgTime} />
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
  
    const scale = React.useRef(new Animated.Value(1)).current;
    const onPinchGestureEvent = Animated.event(
      [{ nativeEvent: { scale: scale } }],
      { useNativeDriver: true }
    );
    const getContactData = (contactData: any) => {
      contactSelcted("", contactData?.contactName, contactData?.contactNumber);
  
      setSendItems(false);
    };
  
    function contactSelcted(image: any, name: any, number: any) {
      if (number) {
        if (newroomID) {
          removeCount(newroomID);
        }
        const mId = Math.floor(Math.random() * 9000) + 1000;
  
        const paramsOfSend = {
          mId: mId,
          roomId: newroomID, //@ts-ignore
          fromUser: globalThis.userChatId, //@ts-ignore
          userName: globalThis.displayName, //@ts-ignore
          phoneNumber: globalThis.phone_number, //@ts-ignore
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
          isNotificationAllowed: isnewmute ? isnewmute : true, //@ts-ignore
          userName: globalThis.displayName, //@ts-ignore
          userImage: globalThis.image, //@ts-ignore
          phoneNumber: globalThis.phone_number, //@ts-ignore
          currentUserPhoneNumber: globalThis.phone_number,
          roomId: newroomID,
          roomName: mainprovider?.userName,
          roomImage: mainprovider?.userImage,
          roomType: mainprovider?.roomType, //@ts-ignore
          roomOwnerId: globalThis.userChatId,
          message: "",
          message_type: "contact",
          roomMembers: [mainprovider?.friendId ? mainprovider?.friendId : ""],
          isForwarded: false,
          attachment: [
            JSON.stringify({
              image: image,
              name: name,
              number: number,
            }),
          ], //@ts-ignore
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
        onSend([
          //@ts-ignore
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
            //@ts-ignore
            user: { _id: globalThis.userChatId, name: globalThis.name },
            unreadCount: mainprovider?.roomType == "single" ? 1 : TOTALMEM || 0,
          },
        ]);
  
        setLocalContactModel(false);
      }
    }
  
    // async function contactsave(videoUri: any) {
    //   try {
    //     const permissionGranted = await Contacts.checkPermission();
  
    //     if (!permissionGranted) {
    //       console.error("Contacts permission not granted.");
    //       return;
    //     }
  
    //     const existingContacts = await Contacts.getContactsByPhoneNumber(
    //       videoUri?.number
    //     );
  
    //     if (existingContacts.length > 0) {
    //       showToast("Contact with this number already exists.");
    //       return;
    //     }
  
    //     await Contacts.addContact({
    //       familyName: videoUri?.name,
    //       givenName: videoUri?.name,
    //       phoneNumbers: [{ label: "mobile", number: videoUri?.number }],
    //     });
  
    //     showToast("Contact added successfully.");
    //   } catch (error) {
    //     console.error("Error adding contact:", error);
    //   }
    // }
  
  
  
    async function requestContactsPermission() {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
        ]);
        return (
          granted[PermissionsAndroid.PERMISSIONS.READ_CONTACTS] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  
    async function contactsave(videoUri) {
      try {
        let permissionGranted = false;
    
        if (Platform.OS === 'android') {
          permissionGranted = await requestContactsPermission();
        } else {
          const permission = await Contacts.checkPermission();
          if (permission === 'undefined') {
            const requestPermission = await Contacts.requestPermission();
            permissionGranted = requestPermission === 'authorized';
          } else {
            permissionGranted = permission === 'authorized';
          }
        }
    
        if (!permissionGranted) {
          showToast("Contacts permission not granted.");
          return;
        }
    
        const existingContacts = await Contacts.getContactsByPhoneNumber(videoUri?.number);
        if (existingContacts.length > 0) {
          showToast("Contact with this number already exists.");
          return;
        }
    
        const newContact = {
          familyName: videoUri?.name,
          givenName: videoUri?.name,
          phoneNumbers: [{ label: "mobile", number: videoUri?.number }],
        };
    
        await Contacts.addContact(newContact);
    
        showToast("Contact added successfully.");
      } catch (error) {
        console.error("Error adding contact:", error);
        showToast("Error adding contact.");
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
    }: any) => {
      dispatch(
        setMainprovider({
          friendId: chatId,
          userName: contactName,
          userImage: profileImage,
          roomType: "single",
          FriendNumber: FriendNumber,
          roomName:contactName,
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
            //@ts-ignore
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
          Alert.alert(response.data.message);
        }
      } catch (error: any) {
        setloaderMoedl(false);
        Alert.alert(error);
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
                ({ status, res }) => {
                  if (status) {
                    // Room Blocked
                  } else {
                    console.log(
                      "while adding entry to block user status is false"
                    );
                  }
                }
              );
  
              //@ts-ignore
              socket.emit("leaveRoom", {
                roomId: newroomID, //@ts-ignore
                userId: globalThis.userChatId,
              });
  
              socket.emit("blockusers", {
                touser: route.params.friendId,
                fromuser: globalThis.chatUserId,
                isBlock: opt == "block",
              });
              blockRoom(newroomID, isnewblock);
              dispatch(setisnewBlock(!isnewblock));
              setUserBlocked(!userBlocked);
              setloaderMoedl(false);
              showToast(!isnewblock ? "User blocked" 
              : "User Unblocked");
            } else {
              Alert.alert(response.data.message);
            }
          })
          .catch((error) => {
            setloaderMoedl(false);
          });
      } catch (error: any) {
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
            //@ts-ignore
            userId: globalThis.userChatId,
            roomId: newroomID,
            isNotificationAllowed: !isnewmute,
          },
        })
          .then((response) => {
            if (response.data.status == true) {
             console.log("response.data.message",response.data.message);
            /// console.log("isnewmuteisnewmute",isnewmute);
  
             showToast(isnewmute ? "Chat muted" 
              : "Chat unmuted");
              setloaderMoedl(false);
              dispatch(setisnewmMute(!isnewmute));
              muteroom(newroomID, isnewmute);
            } else {
              Alert.alert(response.data.message);
            }
          })
          .catch((error) => {
            setloaderMoedl(false);
            Alert.alert(error);
          });
      } catch (error: any) {
        setloaderMoedl(false);
        Alert.alert(error);
      }
    };
  
    function OnExitGroupClick() {
      setToShowMenu(false);
      exitAlert();
    }
  
    const exitAlert = () => {
      if (
        //@ts-ignore
       ( globalThis.userChatId == currentUserData?.owner) ||
        //@ts-ignore
       ( currentUserData?.isAdmin == 1)
      ) {
        Alert.alert(
          "Confirm",
          newroomType == "multiple"
            ? "Are you sure you want to delete this group permanently?"
            : "Are you sure you want to delete this broadcast permanently?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("No Pressed"),
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => DeleteGroupApi(),
            },
          ]
        );
      } else {
        Alert.alert(t("confirm"), t("do_you_want_exit_this_group"), [
          { text: t("cancel") },
          { text: t("yes"), onPress: () => exitgroupChat() },
        ]);
      }
    };
  
    const exitNotify = () => {
      //@ts-ignore
      const finalString = globalThis.displayName + " has left this conversation.";
      const paramsOfSendlive = {
        isNotificationAllowed: true, //@ts-ignore
        userName: globalThis.phone_number, //@ts-ignore
        userImage: globalThis.image,
        roomId: newroomID,
        roomName: roominfo.roomName,
        roomImage: roominfo.roomImage,
        roomType: "multiple", //@ts-ignore
        roomOwnerId: globalThis.userChatId,
        message: CryptoJS.AES.encrypt(finalString, EncryptionKey).toString(),
        message_type: "notify",
        roomMembers: [],
        isForwarded: false,
        attachment: [], //@ts-ignore
        from: globalThis.userChatId,
        resId: Date.now(),
        status: "",
        parent_message_id: "",
        createdAt: new Date(),
        isDeletedForAll: false,
      };
  
      socket.emit("sendmessage", paramsOfSendlive);
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
            //@ts-ignore
            userId: globalThis.userChatId,
            roomId: newroomID,
          },
        });
  
        if (response.data.status === true) {
          //@ts-ignore
          socket.emit("leaveRoom", {
            roomId: newroomID, //@ts-ignore
            userId: globalThis.userChatId,
          });
  
          const remaningMembers: object[] = [] as object[];
          groupDetailData.forEach((d: any) => {
            //@ts-ignore
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
  
          const chatIds: string[] = [] as string[]; //@ts-ignore
          groupDetailData.forEach((d) => {
            chatIds.push(d.userId);
          });
          socket.emit("updateGroupDetails", {
            new_group_name: roominfo.groupName,
            new_group_description: userstatus,
            //@ts-ignore
            new_group_allow: currentUserData?.allow,
            new_group_image: roominfo.roomImage,
            remaningMembers: remaningMembers,
            membersList: chatIds,
            roomId: newroomID,
            //@ts-ignore
            isPublic: currentUserData.isPublic,
          });
  
          setloaderMoedl(false);
          blockRoom(newroomID, isnewblock);
          dispatch(setisnewBlock(!isnewblock));
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
  
  
    function VideoClickFromSideMenu(item:any) {
      navigation.navigate("VideoPlayScreen", { videoUrl: item })
    }
    function OnNextClickMenu(MediaType: any, FileType: any, FromTab: any) {
      navigation.navigate("ShowAllMedia", {
        MediaType: MediaType,
        FileType: FileType,
        FromTab: FromTab,
      });
    }
  
    const [currentIndex, setCurrentIndex] = useState(0);





    return (
        <View style={{flex:1}}>
            <CustomStatusBar
                barStyle={isDarkMode ? "dark-content" : "dark-content"}
                backgroundColor={chatTop().back_ground}
            />
            <ChatHeader chatheaderdata={route} navigation={navigation} />
            <View style={styles.chatContainer}>
                <ImageBackground
                style={{
                    flex: 1,
                    justifyContent: "center",
                    overflow: "hidden",
                    marginTop: 0,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    paddingBottom: 0,
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
                    alignTop={true}
                    inverted={true}
                    isKeyboardInternallyHandled={true}
                    messages={messages}
                    onSend={messages => handleSendMessage(messages)}
                    user={{
                        //@ts-ignore
                        _id: globalThis.chatUserId, //@ts-ignore
                        name: globalThis.name, //@ts-ignore
                        avatar: globalThis.userImage,
                    }}
                    // alwaysShowSend
                    renderUsernameOnMessage={newroomType == "multiple" ? true : false}
                    messagesContainerStyle={{ paddingVertical: 10 }}
                    renderBubble={(props) => <CustomMessageBubble {...props} />}
                    renderSystemMessage={(props) => <SystemMessages props={props} />}
                    minComposerHeight={75}
                    maxComposerHeight={75}
                    renderComposer={(props) => <RenderInputToolbar props={props}  />}
                    renderSend={()=> <></>}
                    showAvatarForEveryMessage={false}
                    renderAvatar={newroomType !== "single" && !ismultidelete ? (props) => {
                        const { currentMessage } = props;
                        return (
                        <TouchableOpacity
                            onPress={() => {
                            setstopgifsend(false);
                            getProfileApi(
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
                                //@ts-ignore
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
                        )}: null
                    }
                    renderUsername={(props) => {
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
                    renderMessageImage={(props) => {
                        if (
                          //@ts-ignore
                          props.currentMessage.messageType === "image" && //@ts-ignore
                          !props.currentMessage.isDeletedForAll
                        ) {
                          return (
                            <View>
                              <TouchableOpacity
                                onLongPress={() => {
                                  //@ts-ignore
                                  props.currentMessage?.localPaths &&
                                  //@ts-ignore
                                  props?.currentMessage?.localPaths.length > 0
                                    ? //@ts-ignore
                                      (setChatModal(true),
                                      setMessageClicked(props.currentMessage),
                                      setMessageClickedId(
                                        //@ts-ignore
                                        props.currentMessage.messageId
                                      )) &&
                                      //@ts-ignore
                                      setMessageClicked(props.currentMessage) &&
                                      setMessageClickedId(
                                        //@ts-ignore
                                        props.currentMessage.messageId
                                      )
                                    : null;
                                }}
                                onPress={() => {
                                  if (
                                    //@ts-ignore
                                    props.currentMessage?.localPaths &&
                                    //@ts-ignore
                                    props.currentMessage.localPaths.length > 0
                                  ) {
                                    if (
                                      //@ts-ignore
                                      props.currentMessage.localPaths.length === 1 &&
                                      //@ts-ignore
                                      props.currentMessage.localPaths[0] === blurImage
                                    ) {
                                      //@ts-ignore
                                      MediaDownload(
                                        props.currentMessage,
                                        newroomID,
                                        MediaUpdated
                                      );
                                    } else {
                                      OpenPreview(props.currentMessage);
                                    }
                                  } else {
                                    //@ts-ignore
                                    MediaDownload(
                                      props.currentMessage,
                                      newroomID,
                                      MediaUpdated
                                    );
                                  }
                                }}
                                style={{ flexDirection: "row" }}
                              >
                                {
                                  //@ts-ignore
                                  props.currentMessage.attachment &&
                                  //@ts-ignore
                                  props.currentMessage.attachment.length == 1 ? (
                                    <React.Fragment>
                                      <Image
                                        //@ts-ignore
                                        source={
                                          //@ts-ignore
                                          props?.currentMessage?.localPaths &&
                                          //@ts-ignore
                                          props?.currentMessage?.localPaths.length > 0
                                            ? {
                                                //@ts-ignore
                                                uri: CreateRenderImage(
                                                  //@ts-ignore
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
                                          <ActivityIndicator
                                            size="large"
                                            color="green"
                                          />
                                        </ImageBackground>
                                      )}
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment>
                                      {
                                        //@ts-ignore
                                        props?.currentMessage?.attachment?.length ===
                                        1 ? (
                                          <View style={{ position: "relative" }}>
                                            <Image
                                              // defaultSource={IMAGES.blurImage}
                                              source={
                                                //@ts-ignore
                                                props?.currentMessage?.localPaths &&
                                                //@ts-ignore
                                                props?.currentMessage?.localPaths
                                                  .length > 0
                                                  ? {
                                                      //@ts-ignore
                                                      uri: CreateRenderImage(
                                                        //@ts-ignore
                                                        //@ts-ignore
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
                                                  //@ts-ignore
                                                  props?.currentMessage?.localPaths &&
                                                  //@ts-ignore
                                                  props?.currentMessage?.localPaths
                                                    .length > 0
                                                    ? {
                                                        //@ts-ignore
                                                        uri: CreateRenderImage(
                                                          //@ts-ignore
                                                          //@ts-ignore
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
                                                  //@ts-ignore
                                                  props?.currentMessage?.localPaths &&
                                                  //@ts-ignore
                                                  props?.currentMessage?.localPaths
                                                    .length > 0
                                                    ? {
                                                        //@ts-ignore
                                                        uri: CreateRenderImage(
                                                          //@ts-ignore
                                                          //@ts-ignore
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
                                                    //@ts-ignore
                                                    props?.currentMessage?.attachment
                                                      .length > 2
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
                                                      more
                                                    </Text>
                                                  </View>
                                                )
                                              }
                                            </View>
                                          </>
                                        )
                                      }
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
                                          <ActivityIndicator
                                            size="large"
                                            color="green"
                                          />
                                        </View>
                                      )}
                                    </React.Fragment>
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
                            </View>
                          );
                        }
                        return null; // Return null for other message types
                    }}
                    renderMessageVideo={(props) => {
                        if (
                          //@ts-ignore
                          props.currentMessage.messageType === "video" && //@ts-ignore
                          !props.currentMessage.isDeletedForAll
                        ) {
                          return (
                            <View>
                              <TouchableOpacity
                                onLongPress={() => {
                                  //@ts-ignore
                                  props.currentMessage?.localPaths &&
                                  //@ts-ignore
                                  props.currentMessage?.localPaths.length > 0
                                    ? //@ts-ignore
                                      (setChatModal(true),
                                      setMessageClicked(props.currentMessage),
                                      setMessageClickedId(
                                        //@ts-ignore
                                        props.currentMessage.messageId
                                      )) &&
                                      //@ts-ignore
                                      setMessageClicked(props.currentMessage) &&
                                      setMessageClickedId(
                                        //@ts-ignore
                                        props.currentMessage.messageId
                                      )
                                    : null;
                                }}
                               
                                onPress={() => {
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
                                        props.currentMessage,
                                        newroomID,
                                        MediaUpdated
                                      );
                                    } else {
                                      if (
                                        //@ts-ignore
                                        props.currentMessage?.localPaths.length == 1
                                      ) {
                                        navigation.navigate("VideoPlayScreen", {
                                          videoUrl: props.currentMessage?.localPaths[0],
                                        });
        
                                      } else {
                                        //@ts-ignore
                                        navigation.navigate("VideoListScreen", {
                                          videos: props.currentMessage?.localPaths,
                                        });
                                      }
                                    }
                                  } else {
                                    
                                    //@ts-ignore
                                    MediaDownload(
                                      props.currentMessage,
                                      newroomID,
                                      MediaUpdated
                                    );
                                  }
                                }}
                                style={{ flexDirection: "row" }}
                              >
                                {
                                  //@ts-ignore
                                  props.currentMessage.attachment && //@ts-ignore
                                  props.currentMessage.attachment.length == 1 ? (
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
        
                                      {
                                        //@ts-ignore
                                        props?.currentMessage?.localPaths &&
                                        //@ts-ignore
                                        props?.currentMessage?.localPaths?.length >
                                          0 ? (
                                          <Video
                                            source={{
                                              //@ts-ignore
                                              uri: props.currentMessage.localPaths[0],
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
                                        )
                                      }
        
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
                                          <ActivityIndicator
                                            size="large"
                                            color="green"
                                          />
                                        </ImageBackground>
                                      )}
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment>
                                      {renderIf(
                                        Platform.OS == "ios" &&
                                          props?.currentMessage?.localPaths?.length >
                                            0 &&
                                          props?.currentMessage?.localPaths?.length ==
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
                                      {
                                        //@ts-ignore
                                        props.currentMessage.attachment.length === 1 ? (
                                          <View style={{ position: "relative" }}>
                                            {props?.currentMessage.localPaths?.length >
                                            0 ? (
                                              <Video
                                                source={{
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
                                                props?.currentMessage?.localPaths
                                                  ?.length > 0 &&
                                                props?.currentMessage?.localPaths
                                                  ?.length > 2,
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
                                                      backgroundColor:
                                                        "rgba(0, 0, 0, 0.4)",
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
                                                      backgroundColor:
                                                        "rgba(0, 0, 0, 0.4)",
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
                                              {props?.currentMessage?.localPaths
                                                ?.length > 0 ? (
                                                <Video
                                                  source={{
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
                                                    width: 150,
                                                    height: 150,
                                                    margin: 5,
                                                    opacity:
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
                                          <ActivityIndicator
                                            size="large"
                                            color="green"
                                          />
                                        </View>
                                      )}
                                    </React.Fragment>
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
                            </View>
                          );
                        }
                        return null; // Return null for other message types
                    }}
                    renderMessageAudio={(props) => {
                        if (
                          //@ts-ignore
                          props?.currentMessage?.messageType == "audio" && //@ts-ignore
                          !props?.currentMessage?.isDeletedForAll
                        ) {
                          return (
                            <View>
                              <React.Fragment>
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
                                      onPress={() =>
                                        MediaDownload(
                                          props.currentMessage,
                                          newroomID,
                                          MediaUpdated
                                        )
                                      }
                                    >
                                      {mediaLoaderdata[props?.currentMessage?.messageId]
                                        ?.isMediaLoader == true ? ( // Check if isMediaLoader is true for the current messageId
                                        <View
                                          style={{
                                            // position: "absolute",
                                            // right: 0,
                                            // left: 0,
                                            // top: 0,
                                            // bottom: 0,
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
                                      {/* <Image
                                        source={require("../../Assets/Icons/downloadFile.png")}
                                        style={{ height: 30, width: 30 }}
                                        resizeMode="contain"
                                      /> */}
                                      {/* </View> */}
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
                                            <AudioMessage currentMessage={audioUri} />
                                          </View>
                                        </View>
                                      )
                                    )}
                                  </>
                                )}
                              </React.Fragment>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginHorizontal: 5,
                                }}
                              >
                                {
                                  //@ts-ignoreb
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
                            </View>
                          );
                        }
                    }}
                />
                </ImageBackground>
            </View>
        </View>
    )
})
export default DemoChat;

const styles = StyleSheet.create({
    chatContainer: {
        flex: 1,
        backgroundColor: chatContainer().back_ground,
        borderColor: "transparent",
        borderTopEndRadius: 25,
        borderTopStartRadius: 25,
        marginTop: -30,
      },
});