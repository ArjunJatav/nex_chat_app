import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeContext from "./src/Components/ThemeContext/ThemeContext";
import LoginScreen from "./src/Screens/Login/LoginScreen";
import {
  DeleteTheGroup,
  HideTheGroup,
  addMemberToRoomMembersSql,
  addMembersToRoomMembersSql,
  blockRoom,
  checkMessageAlreadyExist,
  insertChatList,
  insertRoomSql,
  newMessageInsertList,
  removeCount,
  setSeenCount,
  updateMessage,
  updateMessageStatusbyId,
  updateblockuser,
  updatedeleteforall,
  updateroominfo,
  getUnseenMessageCount,
  updateUnseenMessageCount,
  addMembersToRoomMembersSqlnew,
  insertChannelList,
  addMemberToChannelRoomMembersSql,
  insertChannelMessage,
  insertChannelInfo,
  getUnseenChannelMessageCount,
  updateChannelUnseenMessageCount,
  increaseSubscribers,
  updatereactionsforother,
  checkChannelExists,
  getChannelInfoById,
  removeMemberFromChannelRoomMembersSql,
  decreaseSubscribers,
  deleteMessagesForAll,
  DeleteTheChannel,
  HideTheChannel,
  updatereactionsforothernormal,
} from "./src/sqliteStore";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";

import NetInfo from "@react-native-community/netinfo";
import _BackgroundTimer from "react-native-background-timer";
import { uuidv4 } from "react-native-compressor";
import { toastRef } from "./src/Components/CustomToast/Action";
import Toast from "./src/Components/CustomToast/Toast";
import BottomTab from "./src/Navigation/BottomTab";
import ChattingScreen from "./src/Screens/Chat/ChattingScreen";
import ContactPageScreen from "./src/Screens/Chat/ContactPage";
import AddMembersScreen from "./src/Screens/Chat/NewBroadCast/AddMemebers";
import CreateBroadcastScreen from "./src/Screens/Chat/NewBroadCast/CreateBroadCast";
import EditBroadcastScreen from "./src/Screens/Chat/NewBroadCast/EditBroadcastScreen";
import NewBroadcastScreen from "./src/Screens/Chat/NewBroadCast/NewBroadcastScreen";
import NewChatScreen from "./src/Screens/Chat/NewChatScreen";
import CreateGroupScreen from "./src/Screens/Chat/NewGroup/CreateGroupScreen";
import EditGroupScreen from "./src/Screens/Chat/NewGroup/EditGroupScreen";
import GroupChatScreen from "./src/Screens/Chat/NewGroup/GroupChattingScreen";
import GroupPeofileScreen from "./src/Screens/Chat/NewGroup/GroupProfileScreen";
import NewGroupScreen from "./src/Screens/Chat/NewGroup/NewGroupScreen";
import AfterLogin from "./src/Screens/Login/AfterLogin";
import OtpVerificationScreen from "./src/Screens/Login/OtpVerification";
import { DeleteAccountModel } from "./src/Screens/Modals/DeleteAccountModel";
import { LogOutModel } from "./src/Screens/Modals/LogOutModel";
import { StoryListModel } from "./src/Screens/Modals/StoryViewListModel";
import HomeIntroScreen from "./src/Screens/OnboardingScreens/HomeIntro";
import EditProfileScreen from "./src/Screens/Settings/EditProfile";
import NotificationScreen from "./src/Screens/Settings/PromotionalEvent";
import TermsAndConditions from "./src/Screens/Settings/TermsAndConditions";
import SplashScreen from "./src/Screens/Splash/SplashScreen";
import AddCameraStoryScreen from "./src/Screens/Status/AddCameraStory";
import AddTextStatusScreen from "./src/Screens/Status/AddTextStory";
import { CropVideoScreen } from "./src/Screens/Status/CropVideo";
import { ImageUploadGallery } from "./src/Screens/Status/ImageUpload";
import MyStatusScreen from "./src/Screens/Status/MyStatus";
import MyScannerScreen from "./src/Screens/Settings/MyScannerScreen";
import RNFS from "react-native-fs";
import {
  Alert,
  DeviceEventEmitter,
  PermissionsAndroid,
  Platform,
  Text,
} from "react-native";
import RNCallKeep from "react-native-callkeep";
import CryptoJS from "react-native-crypto-js";
import PushNotification from "react-native-push-notification";
import { useDispatch, useSelector } from "react-redux";
import {
  Base_Url,
  Base_Url2,
  CTA_api,
  UpdateLastSeenApi,
  alldataapiV2,
  alldataapiV3,
  chatBaseUrl,
  generateAgoraTokenApi,
  update_call_status,
  video_url,
} from "./src/Constant/Api";
import { EncryptionKey } from "./src/Constant/Key";
import { ReportUserModel } from "./src/Screens/Modals/ReportUserModel";
import { SelectLanguageModel } from "./src/Screens/Modals/SelectLanguageModel";
import WebScreen from "./src/Screens/Settings/WebScreen";
import FriendStoryViewScreen from "./src/Screens/Status/FriendStoryViewScreen";
import MyStatusViewScreen from "./src/Screens/Status/MyStatusViewScreen";
import Calling from "./src/Screens/calling";
import { resetDataReducer, updateDataAgora } from "./src/reducers/dataReducer";
import { isNotEmpty } from "./src/utils/globalFunctions";
import {
  resetVoipReducer,
  updateAgoraData,
  updateCallData,
  updateCallState,
} from "./src/reducers/VoipReducer";
import {
  resetCallerIdReducer,
  updateCallerId,
} from "./src/reducers/callerIDReducers";

import axios from "axios";
import { AppState, LogBox } from "react-native";

import BackgroundTimer from "react-native-background-timer";
import {
  setDeleteRoom,
  setHideRoom,
  setMainprovider,
  setUnreadCount,
  setsyncchatlist,
  setsyncchatpn,
} from "./src/Redux/ChatHistory";
import {
  setChannellistmessage,
  setChatlistmessage,
} from "./src/Redux/ChatList";
import ForwardMessageScreen from "./src/Screens/Chat/ForwardMessage";
import OrderSummary from "./src/Screens/Settings/OrderSummary";
import ShopScreen from "./src/Screens/Settings/ShopScreen";
import ThemeScreen from "./src/Screens/Settings/ThemeScreen";
import { getActiveMembersOnCall, stopSound } from "./src/utils/callKitCustom";
import {
  notificationListener,
  requestFireBasePermission,
} from "./src/utils/pushNotification_helper";
import AllPublicGroup from "./src/Screens/Chat/AllPublicGroup";
import SearchGroup from "./src/Screens/Chat/SearchGroup";
import FeedbackScreen from "./src/Screens/Settings/FeedbackScreen";
import { PlaySound, StopIncomingSound } from "./src/Screens/agora/agoraHandler";
import { socket } from "./src/socket";
import QrScannerScreen from "./src/Screens/Chat/QrScannerScreen";
import FontSettingScreen from "./src/Screens/Settings/FontSettingScreen";
import ChannelScreen from "./src/Screens/Chat/ChannelScreens/ChannelScreen";
import AvatarScreen from "./src/Screens/AvatarScreen/AvatarScreen";
import ChannelWebScreen from "./src/Screens/Chat/ChannelScreens/ChannelWebScreen";
import ShowAllMedia from "./src/Screens/Chat/ShowAllMedia";
import { EditCoverImage } from "./src/Screens/Settings/EditCoverImage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { VideoListScreen } from "./src/Screens/Chat/VideoListScreen";
import { VideoPlayScreen } from "./src/Screens/Chat/VideoPlayScreen";
import ChatBackup from "./src/Screens/Settings/ChatBackup";
import { setChannelObj, setupdateblock } from "./src/Redux/MessageSlice";
import ChatSettingScreen from "./src/Screens/Settings/ChatSettingScreen";
import MediaDownload from "./src/Components/MediaDownload/MediaDownload";
import {
  updateAppState,
  updateMediaLoader,
  updatedmembersall,
} from "./src/reducers/getAppStateReducers";
import DemoChat from "./src/Screens/Chat/DemoChat";
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions";
import PendingRequest from "./src/Screens/Chat/PendingRequest";
import AppIconScreen from "./src/Screens/Settings/AppIconScreen";
import TokeePremium from "./src/Screens/Settings/TokeePremium";
import ChannelDetail from "./src/Screens/Chat/ChannelScreens/ChannelDetail";
import ChannelMedia from "./src/Screens/Chat/ChannelScreens/ChannelMedia";
import { PremiumSubscription } from "./src/Screens/Settings/PremiumSubscription";
import PremiumFeaturesScreen from "./src/Screens/Settings/PremiumFeatures";
import EditChannelScreen from "./src/Screens/Chat/ChannelScreens/EditChannelScreen";
import NewChannelScreen from "./src/Screens/Chat/ChannelScreens/NewChannelScreen";
import ChannelChatting from "./src/Screens/Chat/ChannelScreens/ChannelChatting";
import ChannelProfile from "./src/Screens/Chat/ChannelScreens/ChannelProfile";
import ChannelMembers from "./src/Screens/Chat/ChannelScreens/ChannelMembers";
import { Linking } from "react-native";
import CallScreen from "./src/Screens/Calls/CallScreen";
import { Camera } from "react-native-vision-camera";
import crashlytics from "@react-native-firebase/crashlytics";
import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import NumberLoginScreen from "./src/Screens/Login/NumberLoginScreen";
import NumberSocialLogin from "./src/Screens/Login/NumberSocialLogin";
import ExplorePage from "./src/Screens/Settings/ExplorePage";
import DiamondPurchase from "./src/Screens/Settings/DiamondPurchase";
import TokeeMatchOnBoard from "./src/Screens/Settings/TokeeMatchOnBorad";
import { GetApiCall } from "./src/Components/ApiServices/GetApi";
import TokeeMatchQuestion from "./src/Screens/Settings/TokeeMatchQuestion";
import UpdateTokeeMatchImage from "./src/Screens/Settings/UpdateTokeeMatchImage";
import { store } from "./src/store";
import ForceUpdateScreen from "./src/Screens/Splash/FoceUpdateScreen";

LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreAllLogs();

let agoraNewData = {};
let statusCheck = {};
let newformattedNames = "";
const getQueryParams = (url) => {
  const params = {};
  const [_, queryString] = url.split("?"); // Split the URL at '?' to get the query string
  console.log("__", _);
  if (queryString) {
    const pairs = queryString.split("&"); // Split the query string into key-value pairs
    pairs.forEach((pair) => {
      const [key, value] = pair.split("="); // Split each pair at '=' to get the key and value
      params[key] = decodeURIComponent(value);
    });
  }
  return params;
};
export const isMountedRef = React.createRef();
export const navigationRef = createNavigationContainerRef();
const App = () => {
  const agoraRef = useRef<any>(null);
  const mainprovider = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.mainprovider
  );
  const channelInfo = useSelector(
    // eslint-disable-next-line
    (state: any) => state?.message?.channelObj
  );
  const [colorTheme, setColorTheme] = useState(false);

  const leaveCall = () => {
    agoraRef?.current?.leaveCall();
  };

  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const [initialURL, setInitialURL] = useState(null); // State to store initial URL
  const appState = AppState.currentState;
  // eslint-disable-next-line
  const agoraData = useSelector((state: any) => state.VoipReducer?.agora_data);
  //console.log("Agora data from selector >>>>>>>", agoraData);
  const updateMediacount = useSelector(
    //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.getAppStateReducers?.app_state?.updateMediaFunction
  );

  const guestUserUids = useSelector(
    (state) => state?.VoipReducer?.call_data?.guestVideoUids || []
  );

  const uniqueGuestUserUids = Array.from(new Set(guestUserUids));

  const callState = useSelector(
    // eslint-disable-next-line
    (state: any) => state?.VoipReducer?.call_state || null
  );
  // eslint-disable-next-line
  const allData = useSelector((state: any) => state?.dataReducer?.data);
  // eslint-disable-next-line
  const newroomID = useSelector((state: any) => state.chatHistory.newroomID);

  const checkGroupCall = useSelector((state) => {
    return state?.callerIDReducers?.userData?.groupCall;
  });

  const memberGroupCall = useSelector((state) => {
    return state?.callerIDReducers?.userData?.memberGroupCall;
  });

  console.log("allData==============....", checkGroupCall);

  agoraNewData = allData;

  const syncchatlist = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.syncchatlist
  );

  // const syncchatpn = useSelector(
  //   // eslint-disable-next-line
  //   (state: any) => state.chatHistory.syncchatpn
  // );

  const membersupdated = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.getAppStateReducers?.membersupdated
  );

  const connectstate = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.getAppStateReducers?.app_state?.isAppActive
  );

  // =========== call keep only
  const [heldCalls, setHeldCalls] = useState({}); // callKeep uuid: held
  const [mutedCalls, setMutedCalls] = useState({}); // callKeep uuid: muted
  const [calls, setCalls] = useState({}); // callKeep uuid: number
  const getNewUuid = () => uuidv4().toUpperCase().toString();

  // eslint-disable-next-line
  const addCall = (callUUID: any, number: any) => {
    setHeldCalls({ ...heldCalls, [callUUID]: false });
    setCalls({ ...calls, [callUUID]: number });
  };

  // eslint-disable-next-line
  const setCallHeld = (callUUID: any, held: any) => {
    setHeldCalls({ ...heldCalls, [callUUID]: held });
  };

  // eslint-disable-next-line
  const setCallMuted = (callUUID: any, muted: any) => {
    setMutedCalls({ ...mutedCalls, [callUUID]: muted });
  };

  const generateAgoraToken = async (channelName, uid) => {
    let url = Base_Url + generateAgoraTokenApi;

    let bodyData = {
      channel_name: channelName,
      uid: uid,
    };

    try {
      const response = await axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
        data: bodyData,
      });

      console.log("Token API response: ", response.data.token);

      return response.data.token; // Return the token
    } catch (error) {
      console.error("Error generating token: ", error);
      throw error;
    }
  };

  useEffect(() => {
    const eventListener = DeviceEventEmitter.addListener(
      "notificationEvent",
      (eventData) => {
        console.log("Setting up notification listener eventData...", eventData);
        if (eventData) {
          let data = JSON.parse(eventData.event);
          _BackgroundTimer.setTimeout(() => {
            console.log(
              "data?.call_id====================================",
              data?.call_id
            );
            console.log("data====================================", data);

            globalThis.callStatus = data?.channel_name;
            dispatch(updateDataAgora(data));
            console.log(
              "before dispatch callid====================================",
              data?.call_id
            );

            dispatch(updateCallerId({ call_id: data?.call_id }));
            dispatch(updateCallerId({ groupCall: data?.groupCall }));
            const agoraData = {
              uid: "88",
              app_id: data?.app_id,
              channel_name: data?.channel_name,
              is_video: data?.is_video == "1" ? true : false,
              jwt: "",
              token: "",
              receiver: data?.receiver,
              sender: data?.sender,
              userStatus:
                data?.sender_name + " " + "called" + " " + data?.receiver_name,
              receiver_image: data?.receiver_image,
              receiver_name: data?.receiver_name,
              sender_image: data?.sender_image,
              sender_name: data?.sender_name,
              token_2: "",
              isVideo: data?.isVideo == "1" ? true : false,
              image:
                "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
              caller: data?.sender,
              uid_2: "48",
              roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
              uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
              id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
              status: data?.status,
              groupCall: agoraNewData?.groupCall,
            };

            //     PlaySound("https://wokii.io/backend/public/uploads/ringtone/ringtone.mp3");

            globalThis.chennalSittu = data?.channel_name;

            dispatch(updateAgoraData(agoraData));
            dispatch(
              updateCallData({
                isVideo: agoraData?.isVideo,
                session:
                  agoraData?.isVideo == true
                    ? "agora_session.video"
                    : "agora_session.audio",
                guestVideoUid: 155,
              })
            );
            dispatch(
              updateCallState({
                state: "incoming",
                isBackground: false,
              })
            );
          }, 100);
        }
      }
    );

    // Clean up listener when component is unmounted
    return () => {
      eventListener.remove();
    };
  }, []);

  useEffect(() => {
    // Listen for notification data sent from the native side
    const subscription = DeviceEventEmitter.addListener(
      "notificationEvent",
      (event) => {
        const callData = JSON.parse(event.event); // Parse incoming call data
        console.log(
          "incoming notification data====================================",
          callData
        );

        //  dispatch(setIncomingCall(callData)); // Store the incoming call data in Redux
        //   setShowCallScreen(true); // Show the call screen
      }
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (callState.state != "outgoing") {
      stopSound();
      StopIncomingSound();
    }
  }, [callState.state]);

  React.useEffect(() => {
    // eslint-disable-next-line
    socket.on("connect_error", (error: any) => {
      console.log("connect_error");
      socket.connect;
    });
  }, [socket]);

  // Code commented By Puru
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const token = await AsyncStorage.getItem("authToken");
      const url = event.url || ""; // Handle URL from the event
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      const { id } = getQueryParams(url);
      // Navigate to ChatScreen if id exists and navigation is ready
      if (id && navigationRef.isReady() && token) {
        setTimeout(() => {
          checkChannelExists(id, (success) => {
            if (success) {
              getChannelInfoById(id, (result) => {
                dispatch(setChannelObj(result));
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                navigationRef.navigate("ChannelChatting", {
                  channelId: id,
                  deepLinking: true,
                });
              });
            } else {
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              navigationRef.navigate("ChannelChatting", {
                channelId: id,
                deepLinking: true,
              });
            }
          });

          globalThis.appStateReader = true;
        }, 5000);

        // navigationRef.navigate("ChannelChatting", { channelId : id, deepLinking: true });
      } else if (id) {
        // Store the ID if navigation is not ready
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        setInitialURL({ id });
      }
    };

    // Subscribe to deep link event
    const unsubscribe = Linking.addListener("url", handleDeepLink);

    // Handle initial URL when the app is launched from a killed state
    const getInitialLink = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink({ url });
      }
    };

    getInitialLink(); // Call this to check for an initial URL

    return () => {
      // Cleanup function: remove the event listener on unmount
      unsubscribe.remove();
    };
  }, [initialURL && navigationRef.isReady(), appState, navigationRef]);

  useEffect(() => {
    const subscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        // Reconnect the socket when the internet connection is regained
        if (!socket.connected) {
          socket.connect;
        }
      }
    });

    return () => {
      subscribe();
    };
  }, [socket]);

  // Yogesh - 30 dec
  React.useEffect(() => {
    socket.connect;
    socket.on("connect", () => {
      if (globalThis.chatUserId) {
        socket.emit("join", { id: globalThis.chatUserId });
      }
      if (Platform.OS == "ios") {
        console.log("socket connect again");
        syncData();
      }
    });

    socket.on("disconnect", () => {
      console.log("uuuuuuuuuu");
      // Automatically attempt to reconnect
      socket.connect;
    });

    socket.on("reconnect", () => {
      socket.connect;
    });
  }, [socket]);

  // ================================================
  // seen emit work
  // Code commented By Puru
  useEffect(() => {
    crashlytics().setCrashlyticsCollectionEnabled(true);
    // eslint-disable-next-line
    const handleCountManage = async (seenMessage: any) => {
      if (seenMessage.roomId !== newroomID) {
        setSeenCount(
          seenMessage.roomId,
          seenMessage.lastInfoId,
          seenMessage.requestBy,
          // eslint-disable-next-line
          (data: any) => {
            dispatch(setUnreadCount(seenMessage));
          }
        );
      }
    };

    socket.on("seenCountMark", handleCountManage);
    return () => {
      socket.off("seenCountMark", handleCountManage);
    };
  });

  // Code commented By Puru

  useEffect(() => {
    // eslint-disable-next-line
    const handleBlockUsers = async (data: any) => {
      updateblockuser(
        { touser: data.touser, fromuser: data.fromuser },
        data.isBlock ? "insert" : "remove",
        // eslint-disable-next-line
        ({ res, status }: any) => {
          if (!status) {
            console.log("for block user local data not updated.");
          }
        }
      );
      dispatch(setupdateblock(data.isBlock));
    };

    socket.on("blockusers", handleBlockUsers);
    return () => {
      socket.off("blockusers", handleBlockUsers);
    };
  });

  // Code Commented By Puru
  React.useEffect(() => {
    // eslint-disable-next-line
    const handledelivered = async (seemMessage: any) => {
      const totalMembers = seemMessage.totalMembers
        ? seemMessage.totalMembers
        : 0;
      if (!totalMembers) {
        return;
      }
      await updateMessageStatusbyId({
        seenCount: seemMessage.seenCount ? seemMessage.seenCount : 0,
        deliveredCount: seemMessage.deliveredCount
          ? seemMessage.deliveredCount
          : 0,
        status: "delivered",
        _id: seemMessage.message_id,
        totalMembers: seemMessage.totalMembers ? seemMessage.totalMembers : 0,
        roomId: seemMessage.roomId,
      });
    };

    socket.on("markDelivered", handledelivered);
    return () => {
      socket.off("markDelivered", handledelivered);
    };
  });

  // Code Commented by Puru
  React.useEffect(() => {
    const deletemessssggggggg = async (deleteMessage) => {
      console.log('deleteMessage socket data',deleteMessage);
      
      const data = deleteMessage.result;
      if (deleteMessage.isDeletedForAll) {
        const messageSend = CryptoJS.AES.encrypt(
          "This message was deleted.",
          EncryptionKey
        ).toString();
        updatedeleteforall(messageSend, data);
      }
    };

    socket.on("deleteMessage", deletemessssggggggg);
    return () => {
      socket.off("deleteMessage", deletemessssggggggg);
    };
  });

  useEffect(() => {
    const deletemessssggggggg = async (deleteMessage) => {
      // let data = deleteMessage.result;

      await deleteMessagesForAll(deleteMessage?.messageIds, () => {});
    };

    socket.on("deleteChannelMessage", deletemessssggggggg);
    return () => {
      socket.off("deleteChannelMessage", deletemessssggggggg);
    };
  });

  // Code Commented By Puru

  useEffect(() => {
    // eslint-disable-next-line
    const deleteFunction = (data: any) => {
      DeleteTheGroup(data.roomId);
      dispatch(setDeleteRoom(data.roomId));
    };
    socket.on("group-delete", deleteFunction);
    return () => {
      socket.off("group-delete", deleteFunction);
    };
  });

  useEffect(() => {
    // eslint-disable-next-line
    const deleteFunction = (data: any) => {
      DeleteTheChannel(data.channelId);
      dispatch(setDeleteRoom(data.channelId));
    };
    socket.on("channel-delete", deleteFunction);
    return () => {
      socket.off("channel-delete", deleteFunction);
    };
  });

  // Code Commented By Puru

  useEffect(() => {
    console.log("sdfdsfdsfdsf");
    getVideoDownloadStatus();
  }, []);

  const getVideoDownloadStatus = async () => {
    try {
      const videoDownloaded = await AsyncStorage.getItem("videoDownloaded");
      if (videoDownloaded == null) {
        downloadVideos();
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  async function downloadVideos() {
    const tempDir = RNFS.DocumentDirectoryPath;
    const fileName = "PremiumVideos";
    const filePath = `${tempDir}/${fileName}`;
    try {
      // Download the file
      const response = await RNFetchBlob.config({
        fileCache: true,
        appendExt: "zip",
        timeout: 30000, // 30 seconds timeout
      }).fetch("GET", video_url);

      if (response.info().status === 200) {
        try {
          const unzipResult = unzip(response.data, filePath);
          // Handle success or error
          if (await unzipResult) {
            // Handle unzipped files in targetPath
            console.log("video unzipped successfully");
            await AsyncStorage.setItem("videoDownloaded", "yes");
          } else {
            console.log("Unzip failed!");
          }
        } catch (errr) {
          console.log("Unzip failed!", errr);
        }
      } else {
        throw new Error(
          `Failed to download file. Status code: ${response.info().status}`
        );
      }
    } catch (error) {
      console.error("Error handling file in app .js:", error);
      throw error;
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    const hideFunction = (data: any) => {
      HideTheGroup(data);
      dispatch(setHideRoom(data.roomId));
    };
    socket.on("group-hide", hideFunction);
    return () => {
      socket.off("group-hide", hideFunction);
    };
  });

  useEffect(() => {
    // eslint-disable-next-line
    const hideFunction = (data: any) => {
      console.log("yessssssssssss", data);
      HideTheChannel(data);
      dispatch(setHideRoom(data.channelId + data.isHide));
    };
    socket.on("channel-hide", hideFunction);
    return () => {
      socket.off("channel-hide", hideFunction);
    };
  });

  // eslint-disable-next-line
  const checkIfFilesExist = async (message: any) => {
    try {
      const updatedLocalPaths = [];

      // let isLocalPathUpdated = false;

      // for (let i = 0; i < message.localPaths.length; i++) {

      for await (const item of message.attachment) {
        // const item = message.localPaths[i];

        const mediaName = item.split("/").pop();

        const mediaId = mediaName.split(".").slice(0, -1).join(".");

        const filename =
          message.message_type == "image"
            ? `${mediaId}.jpg`
            : message.message_type == "video"
            ? `${mediaName}`
            : message.message_type == "audio"
            ? `${mediaName}`
            : `${mediaName}`; // Assuming it's an image, modify according to your logic

        const encoded = encodeURIComponent(filename);

        // Determine the subdirectory based on the message type

        let subDirectory = "";

        switch (message.message_type) {
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

        const destinationPath =
          Platform.OS === "android"
            ? `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`
            : `${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`;

        const fileExists = await RNFS.exists(destinationPath);

        if (fileExists) {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"

          updatedLocalPaths.push(destinationPath);
          const UpdatedPath = JSON.stringify(updatedLocalPaths);

          if (
            message.roomType == "channel" &&
            globalThis.isChannelDetailOpen == "no"
          ) {
            const dateinsert = new Date(
              message.createdAt || message.messageTime
            );
            // const mId = Math.floor(Math.random() * 9000) + 1000;
            const lastMessageType = message.message_type;
            const lastMessage = message.message;
            const lastMessageId = message._id;
            // const lastMessageTime = message.resId; // Update with new timestamp
            const time = `${dateinsert}`;

            //channel-work

            const objToSend = {
              mId: message._id,
              channelName: message.roomName,
              fromUser: message.fromUser,
              userName: message.userName,
              currentUserPhoneNumber: globalThis.phone_number,
              message: lastMessage,
              message_type: message.message_type,
              attachment: message.attachment,
              channelId: message.roomId,
              lastMessage: lastMessage,
              lastMessageId: lastMessageId,
              lastMessageTime: Date.now(),
              lastMessageType: lastMessageType,
              parent_message: {},
              isForwarded: false,
              createdAt: message.createdAt,
              updatedAt: time,
              localPath: UpdatedPath,
              isDeletedForAll: message.isDeletedForAll || false,
            };

            insertChannelList(objToSend, () => {
              const countRed = updateMediacount + 1;
              dispatch(setChannellistmessage(message));
              dispatch(updateAppState({ updateMediaFunction: countRed }));
            });
          } else {
            console.log("222 app.js");
            insertChatList({
              paramsOfSend: { ...message, localPaths: UpdatedPath },
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              chatRoom: false,
            });
          }
        } else {
          const UpdatedPath = JSON.stringify(updatedLocalPaths);

          if (
            message.roomType == "channel" &&
            globalThis.isChannelDetailOpen == "no"
          ) {
            //channel-work
            const dateinsert = new Date(
              message.createdAt || message.messageTime
            );
            // const mId = Math.floor(Math.random() * 9000) + 1000;
            const lastMessageType = message.message_type;
            const lastMessage = message.message;
            const lastMessageId = message._id;
            // const lastMessageTime = message.resId; // Update with new timestamp
            const time = `${dateinsert}`;

            //channel-work
            const objToSend = {
              mId: message._id,
              channelName: message.roomName,
              fromUser: message.fromUser,
              userName: message.userName,
              currentUserPhoneNumber: globalThis.phone_number,
              message: lastMessage,
              message_type: message.message_type,
              attachment: message.attachment,
              channelId: message.roomId,
              lastMessage: lastMessage,
              lastMessageId: lastMessageId,
              lastMessageTime: Date.now(),
              lastMessageType: lastMessageType,
              parent_message: {},
              isForwarded: false,
              createdAt: message.createdAt,
              updatedAt: time,
              localPath: UpdatedPath,
              isDeletedForAll: message.isDeletedForAll || false,
            };

            insertChannelList(objToSend, () => {
              const countRed = updateMediacount + 1;
              dispatch(setChannellistmessage(message));
              dispatch(updateAppState({ updateMediaFunction: countRed }));
            });
          } else {
            console.log("111 app.js");
            insertChatList({
              paramsOfSend: { ...message, localPaths: UpdatedPath },
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              chatRoom: false,
            });
          }
        }
      }
    } catch (error) {
      console.log("error : ", error);
    }

    // Update the message's localPaths if it has been modified

    // messages[messageIndex].localPaths = updatedLocalPaths;
  };
  function MediaUpdated(id) {
    dispatch(
      updateMediaLoader({
        messageId: id,
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        isMediaLoader: false,
      })
    );
    //sample
  }

  // Code commented By Puru
  React.useEffect(() => {
    // eslint-disable-next-line
    const handlenewMessageResive = async (data: any) => {
      // console.log("newmessage resive app : ", data)
      const value = await AsyncStorage.getItem("allMediaDownload");
      try {
        const allMediaDownload =
          value === "true" || globalThis.allMediaDownload === true;
        const dict = {
          messageType: data.result.message_type,
          messageId: data.result._id,
          attachment: data.result.attachment,
        };

        // if (
        //   data.result.fromUser != globalThis.userChatId &&
        //   data.result.roomType == "channel"
        // ) {
        //   // data.result.roomId
        //   // incrementUnseenMessageCount(data.result.roomId, (res) => {
        //   //   if (res == true) {
        //   //     console.log("unseen channel msg increased");
        //   //   }
        //   // });
        // }
        if (
          data.result.message_type == "image" ||
          data.result.message_type == "video" ||
          data.result.message_type == "document" ||
          data.result.message_type == "audio"
        ) {
          if (data?.result?.roomType == "channel") {
            //channel-work
            if (allMediaDownload && globalThis.isChannelDetailOpen == "no") {
              //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              MediaDownload("channel", dict, data.result.roomId, MediaUpdated);
            }
          } else {
            if (allMediaDownload && globalThis.isChatDetailOpen == "no") {
              //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              MediaDownload("chat", dict, data.result.roomId, MediaUpdated);
            }
          }
        }
        if (data?.result.isNewRoom) {
          let seenCount = 0;
          if (data.result.fromUser != globalThis.userChatId) {
            seenCount = 1;
          }
          newMessageInsertList(
            data?.result,
            false,
            globalThis.phone_number,
            seenCount,
            () => {
              dispatch(setChatlistmessage(data.result));
            }
          );
          if (globalThis.userChatId == data.result.fromUser) {
            removeCount(data.result.roomId);
          }

          updateMessage(data?.result, "sent");
          const members = [
            // friend
            {
              chat_user_id: data.result.friendId,
              contact_name: data.result.roomName,
              profile_image: data.result.roomImage,
              phone_number: Number(
                data?.result?.currentUserPhoneNumber ||
                  data?.result?.phoneNumber
              ),
            },
            // me
            {
              chat_user_id: globalThis.userChatId,
              contact_name: globalThis.displayName,
              profile_image: globalThis.image,
              phone_number: Number(globalThis.phone_number),
            },
          ];

          addMembersToRoomMembersSql(members, data.result.roomId);
          socket.emit("joinRoom", {
            roomId: data.result.roomId,
            userId: globalThis.userId,
          });
        } else if (data.result.roomType != "channel") {
          checkMessageAlreadyExist(data.result._id, (isExist: boolean) => {
            if (!isExist) {
              newMessageInsertList(
                data?.result,
                true,
                globalThis.phone_number,
                0,
                // eslint-disable-next-line
                (res: any) => {
                  dispatch(setChatlistmessage(data.result));
                }
              );
            }
          });
        } else {
          if (
            globalThis.isChannelDetailOpen == "no" &&
            data.result.message_type == "text" &&
            data.result.roomType == "channel"
          ) {
            //channel-work
            const dateinsert = new Date(
              data.result.createdAt || data.result.messageTime
            );
            // const mId = Math.floor(Math.random() * 9000) + 1000;
            const lastMessageType = data.result.message_type;
            const lastMessage = data.result.message;
            const lastMessageId = data.result._id;
            // const lastMessageTime = data.result.resId; // Update with new timestamp
            const time = `${dateinsert}`;
            //channel-work
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
              localPath: data.result.attachment,
              isDeletedForAll: data.result.isDeletedForAll || false,
            };

            insertChannelList(objToSend, (res) => {
              console.log("ddddddddddddddddd", res);
              // const countRed = updateMediacount + 1;
              // dispatch(updateAppState({ updateMediaFunction: countRed }));
              dispatch(setChannellistmessage(data.result));
            });
          }
        }

        if (globalThis.userChatId == data.result.fromUser) {
          checkIfFilesExist(data?.result);
        } else {
          checkIfFilesExist(data?.result);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    socket.on("newMessageResive", handlenewMessageResive);

    return () => {
      socket.off("newMessageResive", handlenewMessageResive);
    };
  });

  // Code commented by Puru

  useEffect(() => {
    // eslint-disable-next-line
    const handleJoinGroup = (data: any) => {
      addMemberToRoomMembersSql(
        {
          chat_user_id: data.chat_user_id,
          contact_name: data.contact_name,
          isAdmin: 0,
          profile_image: data.profile_image,
          phone_number: data.phone_number,
        },
        data.roomId,
        () => {
          if (data.roomId == newroomID) {
            dispatch(updatedmembersall(membersupdated));
          }
        }
      );
    };

    socket.on("joinGroup", handleJoinGroup);

    return () => {
      socket.off("joinGroup", handleJoinGroup);
    };
  });

  useEffect(() => {
    // eslint-disable-next-line
    const handleJoinGroup = (data: any) => {
      if (data.owner == globalThis.chatUserId) {
        addMemberToChannelRoomMembersSql(data, data.channelId, () => {
          const countRed = updateMediacount + 1;
          dispatch(updateAppState({ updateMediaFunction: countRed }));
          if (data.roomId == newroomID) {
            // dispatch(updatedmembersall(membersupdated));
          }
        });
      }
      increaseSubscribers(data.channelId, (res) => {
        if (res == true) {
          const countRed = updateMediacount + 1;
          dispatch(updateAppState({ updateMediaFunction: countRed }));
        }
      });

      if (data.channelId == channelInfo.channelId) {
        const updatedChannel = {
          ...channelInfo,
          Subcribers: channelInfo.Subcribers + 1, // Increment the Subscribers count
        };
        dispatch(setChannelObj(updatedChannel));
      }
    };

    socket.on("channel-join", handleJoinGroup);

    return () => {
      socket.off("channel-join", handleJoinGroup);
    };
  });

  useEffect(() => {
    // eslint-disable-next-line
    const handleJoinGroup = (result: any) => {
      const data = result.result;
      if (data.owner == globalThis.chatUserId) {
        removeMemberFromChannelRoomMembersSql(data, data.channelId, () => {
          const countRed = updateMediacount - 1;
          dispatch(updateAppState({ updateMediaFunction: countRed }));
          if (data.roomId == newroomID) {
            // dispatch(updatedmembersall(membersupdated));
          }
        });
      }
      decreaseSubscribers(data.channelId, (res) => {
        if (res == true) {
          const countRed = updateMediacount - 1;
          dispatch(updateAppState({ updateMediaFunction: countRed }));
        }
      });

      if (data.channelId == channelInfo.channelId) {
        const updatedChannel = {
          ...channelInfo,
          Subcribers: channelInfo.Subcribers - 1, // Increment the Subscribers count
        };
        dispatch(setChannelObj(updatedChannel));
      }
    };

    socket.on("exitChannel", handleJoinGroup);

    return () => {
      socket.off("exitChannel", handleJoinGroup);
    };
  });

  useEffect(() => {
    // eslint-disable-next-line
    const handleReactionadd = (data: any) => {
      console.log("datadatadatadatadata", data);
      if (data.user != globalThis.userChatId) {
        if (data?.roomId) {
          updatereactionsforothernormal(
            data.messageId,
            data.isAdd,
            data.reaction,
            data.user,
            () => {}
          );
        } else {
          updatereactionsforother(
            data.messageId,
            data.isAdd,
            data.reaction,
            data.user,
            () => {}
          );
        }
      }
    };

    socket.on("message-reaction", handleReactionadd);

    return () => {
      socket.off("message-reaction", handleReactionadd);
    };
  });

  let count = 1;

  // Code commented by Puru
  useEffect(() => {
    const handleUpdateGroupDetails = (data: {
      new_group_name: string;
      new_group_description: string;
      new_group_allow: string;
      new_group_image: string;
      membersList: string[];
      remaningMembers: object[];
      roomId: string;
      owner: string;
      isPublic: boolean;
    }) => {
      addMembersToRoomMembersSqlnew(data.remaningMembers, data.roomId, () => {
        count = count + 1;
        dispatch(updateAppState({ updatemediauseeeffect: count + 1 }));

        dispatch(updatedmembersall(membersupdated));
      });

      updateroominfo(
        data.new_group_name,
        data.new_group_image,
        data.roomId,
        data.new_group_allow,
        data.owner,
        data.isPublic
      );

      if (mainprovider && mainprovider.roomId == data.roomId) {
        dispatch(
          setMainprovider({ ...mainprovider, allow: data.new_group_allow })
        );
      }

      const currentUserIdx = data.remaningMembers.findIndex(
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        (m) => m.chat_user_id == globalThis?.userChatId
      );
      if (currentUserIdx >= 0) {
        blockRoom(data.roomId, true);
      } else {
        blockRoom(data.roomId, false);
      }
    };

    socket.on("updateGroupDetails", handleUpdateGroupDetails);

    return () => {
      socket.off("updateGroupDetails", handleUpdateGroupDetails);
    };
  });

  // Code commented By Puru
  useEffect(() => {
    // eslint-disable-next-line
    socket.on("checkOnlineStatus", (data: any) => {
      if (data.status == "request") {
        const params = {
          to: data.fromUser,
          roomId: data.roomId,
          fromUser: data.to,
          status: "response",
        };

        socket.emit("checkOnlineStatus", params);
      }
    });
  });

  const geturerchatid = async () => {
    const chatUserID = await AsyncStorage.getItem("chatUserID");
    if (chatUserID) {
      globalThis.chatUserId = chatUserID;
      globalThis.userChatId = chatUserID;
    }
  };

  //code commented by Puru

  useEffect(() => {
    // eslint-disable-next-line
    socket.on("newGroupCreated", (data: any) => {
      const createGroup = {
        roomId: data.result.roomId,
        roomName: data.result.roomName,
        roomImage: data.result.roomImage,
        roomType: data.result.roomType,
        fromUser: data.result.fromUser,
        friendId: data.result.fromUser,
        isNotificationAllowed: 1,
        allow: data.result.allow,
        message: "",
        message_type: "text",
        messageTime: Date.now(),
        _id: 67698329,
      };
      socket.emit("joinRoom", {
        roomId: data.result.roomId,
        userId: globalThis.userChatId,
      });
      // eslint-disable-next-line
      newMessageInsertList(createGroup, false, 0, 0, (roomData: any) => {
        const myObj = {
          chat_user_id: globalThis.userChatId,
          contact_name: globalThis.displayName,
          profile_image: globalThis.image,
          phone_number: globalThis.phone_number,
          isAdmin: data.result.fromUser == globalThis.userChatId ? 1 : 0,
        };

        addMembersToRoomMembersSql(
          [...data.result.membersRaw, myObj],
          data.result.roomId
        );
      });
    });
  });

  // firebase connection
  useEffect(() => {
    geturerchatid();
    requestFireBasePermission();
    notificationListener();
  }, []);

  // code commented by Puru
  useEffect(() => {
    globalThis.pushCondication = "true";
  }, [appState]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      RNCallKeep.addEventListener("answerCall", answerCalliOSCall);
      RNCallKeep.addEventListener("endCall", endCall);
      RNCallKeep.addEventListener("didLoadWithEvents", (events) => {
        Platform.OS == "ios" && UpdateDataIos(events);
      });
    }

    PushNotification.createChannel({
      channelId: "41556458488",
      channelName: "Tokee",
      playSound: true,
    });
  }, []);

  // code commented by Puru
  useEffect(() => {
    globalThis.pushCondication = "true";
    ToUpdateTime();
    if (statusCheck == "active") {
      RNCallKeep.endAllCalls();
      stopSound();
    }
  }, [statusCheck]);

  async function ToUpdateTime() {
    const lastsynctime = await AsyncStorage.getItem("lastsynctime");
    if (lastsynctime == null) {
      AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
    }
  }
  useEffect(() => {
    // checkPermission();

    PushNotification.createChannel({
      channelId: "41556458488",
      channelName: "Tokee",
      playSound: true,
    });
    // Load theme preference from local storage
    loadThemePreference();
  }, []);

  const checkPermission = async () => {
    // const newCameraPermission = await Camera.requestCameraPermission();
    // if (newCameraPermission !== "granted") {
    //   Alert.alert(
    //     "Camera Permission not allowed",
    //     "Please provide permission from app settings"
    //   );
    //   return;
    // } else {
    // }
    // const newMicrophonePermission = await Camera.requestMicrophonePermission();
    // if (newMicrophonePermission !== "granted") {
    //   Alert.alert(
    //     "Microphone permission not provided",
    //     "Please provide permission from app settings"
    //   );
    //   return;
    // } else {
    // }
    getPermission();
  };

  const getPermission = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
      const notificationPermission = await check(
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS
      );
      if (
        notificationPermission === RESULTS.DENIED ||
        notificationPermission === RESULTS.BLOCKED
      ) {
        await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      }
    }
  };
  // syncing all data from server first time

  const syncData = async () => {
    const lastsynctime = await AsyncStorage.getItem("lastsynctime");
    console.log("last sync rime:", lastsynctime);
    if (lastsynctime && globalThis.userChatId) {
      const withoutbackuparray = [
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=room`,
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=chat`,
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=block`,
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=deletedRooms`,
        `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=channel`,
        `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=channel-chat`,
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=deletedChannels`,
      ];

      const apis = withoutbackuparray;

      Promise.all(apis.map((a) => syncDataModule(a, a.split("=").pop() + "s")))
        .then(async () => {
          // BackgroundTimer.setTimeout(() => {
          //   axios({
          //     method: "get",
          //     url: `https://chat.tokeecorp.com:8002/api/user/rooms/last-message/${globalThis.userChatId}`,
          //     headers: {
          //       "Content-Type": "application/json",
          //       api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
          //     },
          //   })
          //     .then((response) => {
          //       if (response.data.status) {
          //         response?.data.data?.map((room) => {
          //           getUnseenMessageCount(
          //             room.roomId,
          //             room.message_time,
          //             (unseenMessageCount) => {
          //               updateUnseenMessageCount(
          //                 room.roomId,
          //                 unseenMessageCount,
          //                 ()=> {
          //                   dispatch(setsyncchatlist(!syncchatlist));
          //                 }
          //               );
          //             }
          //           );
          //         });
          //       }
          //     })
          //     .catch((err) => {
          //       console.log("errror: ", err);
          //     });
          // }, 200);
          // dispatch(setsyncloader(true));
        })
        .catch((err) => {
          console.log("err", err);
        });
    }
  };

  const syncDataModule = (api: string, type: string) => {
    return new Promise((resolve, reject) => {
      axios({
        method: "get",
        url: api,
        headers: {
          "Content-Type": "application/json",
          api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
        },
      })
        .then(async (response) => {
          if (response.data.status == true) {
            const res = {};

            res[type] = response.data.data;
            if (type == "rooms" && response.data.data.length == 0) {
              globalThis.isNewAccount = true;
            } else if (type == "rooms" && response.data.data.length > 0) {
              globalThis.isNewAccount = false;
            } else if (type == "channels" && response?.data?.data?.length > 0) {
              response.data.data.forEach((channel) => {
                console.log("channel?.lastMessage?", channel?.lastMessage);
                //const itsTime = new Date(Number(channel.lastMessage.createdAt))
                const dateObject = new Date(channel?.lastMessage?.createdAt);
                const unixTimestampInMillis = dateObject.getTime();
                const channelLinkToSend =
                  "https://tokeecorp.com/backend/public/deepLink-forward?type=channel&id=" +
                  channel?._id;
                const paramsOfSend = {
                  ownerId: channel?.owner,
                  channelName: channel?.name,
                  channelDescription: channel?.description,
                  image: channel?.image,
                  type: channel?.isPublic ? "public" : "private", // Assuming type can be derived from isPublic
                  link: channelLinkToSend, // Add link if available
                  subs: channel?.membersCount + 1,
                  notifiAllow: channel?.isNotificationAllowed, // Default or based on other conditions
                  channelId: channel?._id,
                  lastMessage: channel?.lastMessage?.message,
                  lastMessageId: channel?.lastMessage?._id,
                  lastMessageType: channel?.lastMessage?.messageType,
                  lastMessageTime: unixTimestampInMillis,
                  //  createdAt:unixTimestampInSeconds,
                  time: channel?.lastMessage?.createdAt, // Or any other relevant time
                  isExclusive: channel.isExclusive,
                  isPaid: channel?.isPaid,
                  isHide: channel?.isHide || false,
                };

                insertChannelInfo(paramsOfSend, (success) => {
                  if (success) {
                    console.log(
                      `Channel ${channel.name} inserted successfully.`
                    );
                  } else {
                    console.error(`Failed to insert channel ${channel.name}.`);
                  }
                });
              });
            } else if (
              type == "channel-chats" &&
              response.data.data.length > 0
            ) {
              response.data.data.forEach((res) => {
                const obj = {
                  lastMessageId: res._id,
                  // localPath: [],
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

                insertChannelMessage(obj, () => {});
              });
            }

            if (
              type == "deletedChannelss" &&
              response?.data?.data?.length > 0
            ) {
              console.log("deletedChannels", response.data.data);
              response.data.data.map((data) => {
                DeleteTheChannel(data.channelId);
                dispatch(setDeleteRoom(data.channelId));
              });
            }
            // insertRoomSql(res, globalThis.userChatId)

            insertRoomSql(res, globalThis.userChatId, (status) => {
              dispatch(setsyncchatpn(Date.now()));
              if (status == true) {
                BackgroundTimer.setTimeout(() => {
                  axios({
                    method: "get",
                    url: `${chatBaseUrl}/api/user/rooms/last-message/${globalThis.userChatId}`,
                    headers: {
                      "Content-Type": "application/json",
                      api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
                    },
                  })
                    .then((response) => {
                      if (response.data.status) {
                        console.log("response?.data", response?.data);
                        response?.data.data?.map(async (room) => {
                          getUnseenMessageCount(
                            room.roomId,
                            room.message_time,
                            (unseenMessageCount) => {
                              updateUnseenMessageCount(
                                room.roomId,
                                unseenMessageCount,
                                () => {
                                  dispatch(setsyncchatlist(!syncchatlist));
                                }
                              );
                            }
                          );
                        });
                      }
                    })
                    .catch((err) => {
                      console.log("errror: ", err);
                    });
                }, 200);
              }
            });

            resolve(response.data);
          } else {
            reject(response.data);
          }
        })
        .catch((error) => {
          reject(new Error(error).message);
        });
    });
  };

  // const updateuserSyncTime = async () => {
  //   const USERID = await AsyncStorage.getItem("chatUserID");
  //   const urlStr = chatBaseUrl + "/api/user/update/timestamp/" + USERID;

  //   try {
  //     await axios({
  //       method: "put",
  //       url: urlStr,
  //       headers: {
  //         "Content-Type": "application/json",
  //         api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
  //       },
  //     })
  //       .then(async () => {})
  //       .catch((error) => {
  //         console.log("errr",error)
  //         // alert(error);
  //         //  dispatch(setsyncloader(true));
  //       });
  //   } catch (error) {
  //     // alert(error);
  //     // dispatch(setsyncloader(true));
  //   }
  // };

  // code commented by Puru
  React.useEffect(() => {
    // createTableUser();
    requestUserData();
  }, [globalThis.chatUserId, connectstate]);

  const requestUserData = async () => {
    const myChatId = await AsyncStorage.getItem("chatUserID");
    const themeUse = await AsyncStorage.getItem("selectTheme");

    if (themeUse !== null) {
      globalThis.selectTheme = themeUse;
    }

    if (myChatId != null || myChatId != undefined) {
      socket.emit("join", { id: myChatId });
      if (globalThis.isDatasynced == undefined) {
        globalThis.isDatasynced = true;
        syncData();
      }

      updateLastSeenApi(myChatId);
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      initiateSocketConnection(myChatId);
      setInterval(() => {
        updateLastSeenApi(myChatId);
      }, 20000);
    }
  };

  // eslint-disable-next-line
  const UpdateDataIos = (events: any) => {
    // map through events and find item with name RNCallKeepDidDisplayIncomingCall
    // eslint-disable-next-line
    let newEvent = events?.filter((item: any) => {
      return item?.name === "RNCallKeepDidDisplayIncomingCall";
    });

    const data1 = newEvent[0]?.data?.payload;
    agoraNewData = data1;
    dispatch(updateDataAgora(agoraNewData));
    dispatch(updateCallerId({ call_id: agoraNewData?.call_id }));

    for (let i = 0; i < events.length; i++) {
      const item = events[i];
      if (item?.name === "RNCallKeepPerformAnswerCallAction") {
        for (let i = 0; i < 5; i++) {
          RNCallKeep.backToForeground();
        }
        // RNCallKeep.endAllCalls();
        _BackgroundTimer.setTimeout(() => {
          if (Platform.OS == "ios") {
            dispatch(updateCallState({ state: "active", isBackground: false }));
            dispatch(
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              updateCallerId({ id: `${agoraNewData?.receiver}`, callUUID: "" })
            );

            const agora_Data = {
              uid: "88",
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              app_id: agoraNewData?.app_id,
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              channel_name: agoraNewData?.channel_name,
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              is_video: agoraNewData?.is_video === 1 ? true : false,
              jwt: "",
              token: "",
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              receiver: agoraNewData?.receiver,
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              sender: agoraNewData?.sender,
              userStatus: "",
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              receiver_image: agoraNewData?.receiver_image,
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              receiver_name: agoraNewData?.receiver_name,
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              sender_image: agoraNewData?.sender_image,
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              sender_name: agoraNewData?.sender_name,
              token_2: "",
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              isVideo: agoraNewData?.is_video === 1 ? true : false,
              image:
                "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              caller: agoraNewData?.sender_name,
              uid_2: "48",
              roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              uuid: agoraNewData?.uuid,
              id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
              status: "answer",
            };

            dispatch(updateAgoraData(agora_Data));
            dispatch(
              updateCallData({
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                isVideo: agoraNewData?.is_video,
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                session: agoraNewData?.is_video
                  ? "agora_session.video"
                  : "agora_session.audio",
                guestVideoUid: 155,
              })
            );

            socket.emit("callEvents", {
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              toUserId: agoraNewData?.chatId,
              data: agora_Data,
            });
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            startCall("answer", agoraNewData?.channel_name);
            globalThis.wayOfCall = undefined;
          }
        }, 500);
      }
    }
  };

  // eslint-disable-next-line
  const didPerformDTMFAction = ({ callUUID, digits }: any) => {};

  // eslint-disable-next-line
  const didReceiveStartCallAction = ({ handle }: any) => {
    if (!handle) {
      // @TODO: sometime we receive `didReceiveStartCallAction` with handle` undefined`
      return;
    }
    const callUUID = getNewUuid();
    addCall(callUUID, handle);
    RNCallKeep.startCall(callUUID, handle, handle);
    BackgroundTimer.setTimeout(() => {
      RNCallKeep.setCurrentCallActive(callUUID);
    }, 1000);
  };

  // eslint-disable-next-line
  const didPerformSetMutedCallAction = ({ muted, callUUID }: any) => {
    setCallMuted(callUUID, muted);
  };

  // eslint-disable-next-line
  const didToggleHoldCallAction = ({ hold, callUUID }: any) => {
    setCallHeld(callUUID, hold);
  };

  const startCall = async (type, channel) => {
    const url = Base_Url2 + update_call_status;
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
          channel_name: channel,
          status: type,
        },
      })
        .then(() => {
          null;
        })

        .catch((error) => {
          console.log("sdfdsfdsfdsf", error);
          alert(error);
        });
    } catch (error) {
      console.log("sdfdsfdsfdsf", error);
      alert(error);
    }
  };

  const answerCalliOSCall = async () => {
    if (globalThis.statusCheck == "active") {
      return;
    }
    for (let i = 0; i < 10; i++) {
      RNCallKeep.backToForeground();
    }
    if (!agoraNewData) {
      RNCallKeep.addEventListener("didLoadWithEvents", (events) => {
        Platform.OS == "ios" && UpdateDataIos(events);
      });
      _BackgroundTimer.setTimeout(async () => {
        console.log('if condication answerios=============',agoraNewData);
        
        globalThis.statusCheck = "active";
        dispatch(updateCallState({ state: "active", isBackground: false }));

        _BackgroundTimer.setTimeout(() => {
          RNCallKeep.backToForeground();
          dispatch(updateCallState({ state: "active", isBackground: false }));
        }, 800);

        RNCallKeep.removeEventListener("endCall");

        dispatch(
          updateCallerId({
            id: agoraNewData?.receiver || "",
            callUUID: "",
            groupCall: agoraNewData?.groupCall || false,
          })
        );

        dispatch(updateCallerId({ call_id: agoraNewData?.call_id }));

        const senderDataString = await AsyncStorage.getItem("sender_Data");
        const senderData = senderDataString ? JSON.parse(senderDataString) : {};

        globalThis.activeChannel = agoraNewData?.channel_name || "";

        const token = await generateAgoraToken(
          agoraNewData?.channel_name || "",
          senderData?.sender_id || ""
        );

        const agora_Data = {
          uid: "88",
          app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
          channel_name: agoraNewData?.channel_name || "",
          is_video:
            agoraNewData?.is_video == 1 ||
            agoraNewData?.is_video == "1" ||
            agoraNewData?.is_video == true
              ? true
              : false,
          jwt: "",
          token: "",
          receiver: `${senderData.sender_id || ""}`,
          sender: agoraNewData?.sender || "",
          userStatus: "",
          receiver_image: agoraNewData?.receiver_image || "",
          receiver_name: agoraNewData?.receiver_name || "",
          sender_image: agoraNewData?.sender_image || "",
          sender_name: agoraNewData?.sender_name || "",
          token_2: "",
          isVideo:
            agoraNewData?.is_video == 1 ||
            agoraNewData?.is_video == "1" ||
            agoraNewData?.is_video == true
              ? true
              : false,
          image:
            "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
          caller: agoraNewData?.sender_name || "",
          uid_2: `${senderData.sender_id || ""}`,
          roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
          uuid: agoraNewData?.uuid || "",
          id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
          status: "answer",
          groupCall: agoraNewData?.groupCall || false,
        };

        socket.emit("callEvents", {
          toUserId: agoraNewData?.chatId || "",
          data: agora_Data,
        });

        console.log("agoraData?.chatId===============", agoraNewData?.chatId);

        startCall("answer", agoraNewData?.channel_name || "");
        globalThis.FriendChatId = agoraNewData?.chatId || "";
        dispatch(updateAgoraData(agora_Data));
        dispatch(
          updateCallData({
            isVideo: agora_Data.is_video,
            session: agora_Data.is_video
              ? "agora_session.video"
              : "agora_session.audio",
            guestVideoUid: 155,
          })
        );

        globalThis.wayOfCall = undefined;
      }, 700);
    } else {
      console.log('else condication answerios=============',agoraNewData);
      console.log('else condication answerios=============',agoraNewData.length);
      globalThis.statusCheck = "active";
      dispatch(updateCallState({ state: "active", isBackground: false }));

      _BackgroundTimer.setTimeout(() => {
        RNCallKeep.backToForeground();
        dispatch(updateCallState({ state: "active", isBackground: false }));
      }, 800);

      RNCallKeep.removeEventListener("endCall");

      dispatch(
        updateCallerId({
          id: agoraNewData?.receiver || "",
          callUUID: "",
          groupCall: agoraNewData?.groupCall || false,
        })
      );

      dispatch(updateCallerId({ call_id: agoraNewData?.call_id }));

      const senderDataString = await AsyncStorage.getItem("sender_Data");
      const senderData = senderDataString ? JSON.parse(senderDataString) : {};

      globalThis.activeChannel = agoraNewData?.channel_name || "";

      const token = await generateAgoraToken(
        agoraNewData?.channel_name || "",
        senderData?.sender_id || ""
      );

      const agora_Data = {
        uid: agoraNewData?.uid,
        app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
        channel_name: agoraNewData?.channel_name || "",
        is_video: Boolean(Number(agoraNewData?.is_video)),
        jwt: "",
        token:token,
        receiver: `${senderData.sender_id || ""}`,
        sender: agoraNewData?.sender || "",
        userStatus: "",
        receiver_image: agoraNewData?.receiver_image || "",
        receiver_name: agoraNewData?.receiver_name || "",
        sender_image: agoraNewData?.sender_image || "",
        sender_name: agoraNewData?.sender_name || "",
        token_2: "",
        isVideo: Boolean(Number(agoraNewData?.is_video)), // Remove if unnecessary
        image:
          "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
        caller: agoraNewData?.sender_name || "",
        uid_2: `${senderData.sender_id || ""}`,
        roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
        uuid: agoraNewData?.uuid || "",
        id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
        status: "answer",
        groupCall: agoraNewData?.groupCall || false,
      };

      socket.emit("callEvents", {
        toUserId: agoraNewData?.chatId || "",
        data: agora_Data,
      });

      console.log("agoraData?.chatId===============", agoraNewData?.chatId);

      startCall("answer", agoraNewData?.channel_name || "");
      globalThis.FriendChatId = agoraNewData?.chatId || "";
      dispatch(updateAgoraData(agora_Data));
      dispatch(
        updateCallData({
          isVideo: agora_Data.is_video,
          session: agora_Data.is_video
            ? "agora_session.video"
            : "agora_session.audio",
          guestVideoUid: 155,
        })
      );

      globalThis.wayOfCall = undefined;
    }
  };

  // eslint-disable-next-line
  const answerCall = ({ callUUID }: any) => {
    RNCallKeep.endAllCalls();
    StopIncomingSound();
    stopSound();
    globalThis.statusCheck = "active";
    const number = calls[callUUID];
    RNCallKeep.startCall(callUUID, number, number);

    BackgroundTimer.setTimeout(() => {
      RNCallKeep.setCurrentCallActive(callUUID);
    }, 2000);

    BackgroundTimer.setTimeout(() => {
      RNCallKeep.backToForeground();
    }, 4000);

    statusCheck = "active";
    dispatch(updateCallState({ state: "active" }));
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    dispatch(updateCallerId({ id: `${agoraNewData?.receiver}` }));
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    globalThis.activeChannel = agoraNewData?.channel_name;

    const agoraData = {
      uid: "44",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      app_id: agoraNewData?.app_id,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: agoraNewData?.channel_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      is_video: agoraNewData?.is_video,
      jwt: "",
      token: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver: agoraNewData?.receiver,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender: agoraNewData?.sender,
      userStatus: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_image: agoraNewData?.receiver_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_name: agoraNewData?.receiver_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_image: agoraNewData?.sender_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_name: agoraNewData?.sender_name,
      token_2: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      isVideo: agoraNewData?.is_video,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      image: agoraNewData?.image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      caller: agoraNewData?.sender_name,
      uid_2: "84",
      roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      uuid: agoraNewData?.uuid,
      id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      status: "answer",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      chatId: agoraNewData.chatId,
    };
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    globalThis.FriendChatId = agoraNewData.chatId;

    socket.emit("callEvents", {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      toUserId: agoraNewData?.chatId,
      data: agoraData,
    });

    dispatch(
      updateCallData({
        isVideo: agoraData?.is_video,
        session: agoraData?.is_video
          ? "agora_session.video"
          : "agora_session.audio",
        guestVideoUid: 155,
      })
    );

    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCall("active", agoraNewData?.channel_name);
    dispatch(updateAgoraData(agoraData));
  };

  // eslint-disable-next-line
  const endCall = ({ callUUID }: any) => {
    if (globalThis.statusCheck == "active") {
      return;
    }
    globalThis.statusCheck = undefined;
    RNCallKeep.removeEventListener("endCall");
    RNCallKeep.endAllCalls();
    RNCallKeep.endCall(callUUID);
    globalThis.isCallIntiate = false;

    globalThis.callStateUpdate = true;

    const agoraData = {
      uid: "44",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      app_id: agoraNewData?.app_id,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: agoraNewData?.channel_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      is_video: agoraNewData?.is_video,
      jwt: "",
      token: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver: agoraNewData?.receiver,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender: agoraNewData?.sender,
      userStatus: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_image: agoraNewData?.receiver_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_name: agoraNewData?.sender_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_image: agoraNewData?.sender_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_name: agoraNewData?.sender_name,
      token_2: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      isVideo: agoraNewData?.isVideo,
      image:
        "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      caller: agoraNewData?.sender_name,
      uid_2: "84",
      roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      uuid: agoraNewData?.uuid,
      id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      status: "declined",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      chatId: agoraNewData?.chatId,
    };

    socket.emit("callEvents", {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      toUserId: agoraNewData?.chatId,
      data: agoraData,
    });

    startCall("declined", agoraData?.channel_name);

    setTimeout(() => {
      statusCheck = {};
      dispatch(resetDataReducer());
      dispatch(resetVoipReducer());
    }, 1000);
    globalThis.wayOfCall = undefined;

    setTimeout(() => {
      RNCallKeep.removeEventListener("endCall");
    }, 2000);
  };

  useEffect(() => {
    if (callState.state !== "active") {
      statusCheck = {};
      globalThis.statusCheck = undefined;
    }
  }, [callState.state]);

  useEffect(() => {
    if (callState.state != "outgoing") {
      stopSound();
    }
  }, [callState.state]);

  const getAlertVisibleCondition = async () => {
    const status = await AsyncStorage.getItem("alertVisible");
    if (status == null) {
      await AsyncStorage.setItem("alertVisible", "yes");
      return false;
    } else {
      return true;
    }
  };

  const resetAlertVisibleCondition = async () => {
    try {
      await AsyncStorage.removeItem("alertVisible");
    } catch (error) {
      console.error("Error saving alert status:", error);
    }
  };

  console.log("App State >>>>>>>>>>>", AppState.currentState);

  const initiateSocketConnection = async () => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
    globalThis.sender_id = senderData.sender_id;

    // eslint-disable-next-line
    socket.on("callEvents", async (data: any) => {
      console.log("socket data====================================", data.data);

      const loginToken = await AsyncStorage.getItem("authToken");
      const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
      const dataAgora = data.data;
      const state = store.getState();
      const checkGroupCallll = state?.callerIDReducers?.userData?.groupCall;
      const checkMemberGroupCalll =
        state?.callerIDReducers?.userData?.memberGroupCall;

      if (
        dataAgora.status === "busy" &&
        checkGroupCallll != true &&
        checkMemberGroupCalll != true
      ) {
        dispatch(updateCallState({ state: "busy" }));
      }
      if (
        globalThis.statusCheck == "active" &&
        dataAgora?.channel_name != globalThis.callStatus
      ) {
        const busy_line = {
          channel_name: dataAgora?.channel_name,
          status: "busy",
        };

        socket.emit("callEvents", {
          toUserId: dataAgora?.chatId,
          data: busy_line,
        });
        return;
      }

      dispatch(updateDataAgora(dataAgora));
      if (dataAgora.status == "incoming" && Platform.OS == "ios") {
        RNCallKeep.addEventListener("endCall", endCall);
      }

      if (
        dataAgora.status == "incoming" &&
        callState.state != "active" &&
        loginToken != null &&
        Platform.OS == "android" &&
        AppState.currentState == "active"
      ) {
        PlaySound(
          "https://wokii.io/backend/public/uploads/ringtone/ringtone.mp3"
        );
        globalThis.statusCheck = "active";
        globalThis.activeChannel = dataAgora?.channel_name;
        if (dataAgora?.groupCall == true) {
          dispatch(updateCallerId({ groupCall: true }));
        }

        globalThis.wayOfCall = undefined;
        globalThis.callStatus = dataAgora?.channel_name;

        const token = await generateAgoraToken(
          dataAgora?.channel_name,
          senderData?.sender_id
        );
        dispatch(updateCallerId({ call_id: dataAgora?.call_id }));

        //  const activeMembersResponse = await getActiveMembersOnCall(dataAgora.call_id);

        //  const formattedNames =
        //  activeMembersResponse.data.member.join(" & ");

        //  console.log('formattedNames=========',formattedNames);

        const agoraData = {
          uid: dataAgora?.uid,
          app_id: dataAgora?.app_id,
          channel_name: dataAgora?.channel_name,
          is_video: dataAgora?.is_video,
          token: token,
          receiver: `${senderData.sender_id}`,
          sender: dataAgora?.sender,
          userStatus:
            dataAgora?.sender_name +
            " " +
            "called" +
            " " +
            dataAgora?.receiver_name,
          receiver_image: dataAgora?.receiver_image,
          receiver_name: dataAgora?.receiver_name,
          sender_image: dataAgora?.sender_image,
          sender_name: dataAgora?.sender_name,
          isVideo: dataAgora?.isVideo,
          caller: dataAgora?.sender,
          uid_2: `${senderData.sender_id}`,
          uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
          status: dataAgora?.status,
        };

        dispatch(updateAgoraData(agoraData));
        dispatch(
          updateCallData({
            isVideo: dataAgora?.isVideo,
            session: dataAgora?.isVideo
              ? "agora_session.video"
              : "agora_session.audio",
            //guestVideoUid: 155,
          })
        );
        dispatch(
          updateCallState({
            state: "incoming",
            isBackground: false,
            isVideo: dataAgora?.isVideo,
          })
        );
        setTimeout(() => {
          globalThis.statusCheck = "active";
        }, 2500);
      } else if (dataAgora.status == "answer") {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        dispatch(updateCallerId({ id: `${senderData.sender_id}` }));
        stopSound();
        globalThis.callStatus = dataAgora?.channel_name;
        globalThis.statusCheck = "active";
        globalThis.activeChannel = dataAgora?.channel_name;
        statusCheck = "active";
        dispatch(updateCallState({ state: "active" }));
      } else if (
        dataAgora.status == "active" &&
        dataAgora.isVideo == true &&
        dataAgora.is_video == true
      ) {
        const agoraDataaa = {
          channel_name: dataAgora?.channel_name,
          status: "active",
          request: "accepct",
          is_video: true,
          isVideo: true,
        };

        if (
          dataAgora?.request == "request" &&
          globalThis.statusCheck == "active" &&
          uniqueGuestUserUids?.length < 2
        ) {
          setTimeout(async () => {
            const alertStatus = await getAlertVisibleCondition();
            if (alertStatus == false) {
              Alert.alert("Request Alert", "Video call request", [
                {
                  text: "Ok",
                  onPress: () => {
                    if (uniqueGuestUserUids?.length < 2) {
                      resetAlertVisibleCondition();
                      socket.emit("callEvents", {
                        toUserId: dataAgora?.from,
                        data: agoraDataaa,
                      });
                      startCall("accepct", agoraData?.channel_name);
                      setTimeout(() => {
                        dispatch(updateAgoraData(dataAgora));
                        dispatch(
                          updateCallData({
                            isVideo: true,
                            session: "agora_session.video",
                            // guestVideoUid: 155,
                          })
                        );
                        dispatch(updateCallState({ state: "active" }));
                      }, 1000);
                    }
                  },
                },
                {
                  text: "Cancel",
                  onPress: () => resetAlertVisibleCondition(),
                  style: "cancel",
                },
              ]);
            }
          }, 6000);
        } else if (dataAgora?.request == "accepct") {
          dispatch(updateAgoraData(agoraDataaa));
          dispatch(
            updateCallData({
              isVideo: true,
              session: "agora_session.video",
              // guestVideoUid: 156,
            })
          );
          dispatch(updateCallState({ state: "active" }));
        }
      } else if (dataAgora.status == "ended") {
        stopSound();
        if (globalThis.activeChannel === dataAgora?.channel_name) {
          globalThis.statusCheck = undefined;
          globalThis.activeChannel = undefined;
          RNCallKeep.endAllCalls();
          dispatch(updateCallState({ state: "ended" }));
          dispatch(resetCallerIdReducer());
          setTimeout(() => {
            RNCallKeep.removeEventListener("endCall");
          }, 2000);
        } else {
          RNCallKeep.endAllCalls();
        }
      } else if (dataAgora?.status == "declined") {
        const state = store.getState();
        const checkGroupCalll = state?.callerIDReducers?.userData?.groupCall;
        const checkMemberGroupCall =
          state?.callerIDReducers?.userData?.memberGroupCall;
        console.log("checkGroupCall=======", checkGroupCall);
        console.log("checkMemberGroupCall=======", checkMemberGroupCall);

        if (checkGroupCalll != true && checkMemberGroupCall != true) {
          stopSound();
          globalThis.statusCheck = undefined;
          globalThis.activeChannel = undefined;
          RNCallKeep.endCall(dataAgora?.uuid);
          dispatch(updateCallState({ state: "declined" }));
          setTimeout(() => {
            dispatch(resetDataReducer());
            dispatch(resetVoipReducer());
            dispatch(resetCallerIdReducer());
            RNCallKeep.removeEventListener("endCall");
            RNCallKeep.endAllCalls();
            globalThis.statusCheck = undefined;
            globalThis.activeChannel = undefined;
            // stopSound()
          }, 2000);
        }
      }
    });
  };

  // eslint-disable-next-line
  const updateLastSeenApi = async (id: any) => {
    const urlStr = chatBaseUrl + UpdateLastSeenApi;
    try {
      await axios({
        method: "PATCH",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          userId: id,
        }),
      })
        .then(() => {
          // if (response.data.status == true) {
          // } else {
          // }
        })
        .catch((error) => {
          console.log("error", error);
          //  alert(error)
        });
    } catch (error) {
      // alert(error)
    }
  };

  const loadThemePreference = async () => {
    try {
      const themePreference = await AsyncStorage.getItem("themePreference");
      if (themePreference !== null) {
        setColorTheme(themePreference === "dark");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !colorTheme ? "dark" : "light";
    setColorTheme(!colorTheme);
    saveThemePreference(newTheme);
  };

  // eslint-disable-next-line
  const saveThemePreference = async (theme: any) => {
    try {
      await AsyncStorage.setItem("themePreference", theme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeContext.Provider value={{ colorTheme, toggleTheme }}>
          <SafeAreaProvider>
            <NavigationContainer ref={navigationRef}>
              {isNotEmpty(agoraData?.app_id) && <Calling />}
              <Toast {...{ ref: toastRef }} />
              <Stack.Navigator
                screenOptions={{ headerShown: false, gestureEnabled: false }}
              >
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen
                  name="ForceUpdateScreen"
                  component={ForceUpdateScreen}
                />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen
                  name="NumberLoginScreen"
                  component={NumberLoginScreen}
                />
                <Stack.Screen
                  name="NumberSocialLogin"
                  component={NumberSocialLogin}
                />
                <Stack.Screen name="AfterLogin" component={AfterLogin} />
                <Stack.Screen name="BottomBar" component={BottomTab} />
                <Stack.Screen name="ThemeScreen" component={ThemeScreen} />
                <Stack.Screen name="ShopScreen" component={ShopScreen} />
                <Stack.Screen name="OrderSummary" component={OrderSummary} />
                <Stack.Screen name="CallScreen" component={CallScreen} />
                <Stack.Screen
                  name="EditCoverImage"
                  component={EditCoverImage}
                />
                <Stack.Screen
                  name="NewChatScreen"
                  component={NewChatScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="MyStatusScreen"
                  component={MyStatusScreen}
                />
                <Stack.Screen
                  name="NewGroupScreen"
                  component={NewGroupScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="ForwardMessageScreen"
                  component={ForwardMessageScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="NewBroadcastScreen"
                  component={NewBroadcastScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="ChattingScreen"
                  component={ChattingScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="ChannelDetail"
                  component={ChannelDetail}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="ChannelMedia"
                  component={ChannelMedia}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="DemoChat"
                  component={DemoChat}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="ContactPageScreen"
                  component={ContactPageScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="PendingRequest"
                  component={PendingRequest}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="OtpVerificationScreen"
                  component={OtpVerificationScreen}
                />
                <Stack.Screen
                  name="CreateBroadcastScreen"
                  component={CreateBroadcastScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="EditBroadcastScreen"
                  component={EditBroadcastScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="AddMembersScreen"
                  component={AddMembersScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="CreateGroupScreen"
                  component={CreateGroupScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="GroupChatScreen"
                  component={GroupChatScreen}
                />
                <Stack.Screen
                  name="GroupPeofileScreen"
                  component={GroupPeofileScreen}
                />
                <Stack.Screen
                  name="EditGroupScreen"
                  component={EditGroupScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="EditProfileScreen"
                  component={EditProfileScreen}
                />

                <Stack.Screen name="LogoutModel" component={LogOutModel} />
                <Stack.Screen
                  name="StoryListModel"
                  component={StoryListModel}
                />
                <Stack.Screen
                  name="SelectLanguageModel"
                  component={SelectLanguageModel}
                />
                <Stack.Screen
                  name="DeleteAccountModel"
                  component={DeleteAccountModel}
                />
                <Stack.Screen
                  name="AddTextStatusScreen"
                  component={AddTextStatusScreen}
                />
                <Stack.Screen
                  name="MyStatusViewScreen"
                  component={MyStatusViewScreen}
                />
                <Stack.Screen
                  name="TermsAndConditions"
                  component={TermsAndConditions}
                />
                <Stack.Screen
                  name="NotificationScreen"
                  component={NotificationScreen}
                />
                <Stack.Screen
                  name="FriendStoryViewScreen"
                  component={FriendStoryViewScreen}
                />
                <Stack.Screen
                  name="AddCameraStoryScreen"
                  component={AddCameraStoryScreen}
                />
                <Stack.Screen
                  name="ImageUploadGallery"
                  component={ImageUploadGallery}
                />
                <Stack.Screen
                  name="CropVideoScreen"
                  component={CropVideoScreen}
                />
                <Stack.Screen
                  name="ReportUserModel"
                  component={ReportUserModel}
                />
                <Stack.Screen
                  name="HomeIntroScreen"
                  component={HomeIntroScreen}
                />
                <Stack.Screen name="WebScreen" component={WebScreen} />
                <Stack.Screen
                  name="FeedbackScreen"
                  component={FeedbackScreen}
                />
                <Stack.Screen name="SearchGroup" component={SearchGroup} />
                <Stack.Screen
                  name="AllPublicGroup"
                  component={AllPublicGroup}
                />
                <Stack.Screen
                  name="QrScannerScreen"
                  component={QrScannerScreen}
                />
                <Stack.Screen name="ExplorePage" component={ExplorePage} />
                <Stack.Screen
                  name="MyScannerScreen"
                  component={MyScannerScreen}
                />
                <Stack.Screen
                  name="ChatSettingScreen"
                  component={ChatSettingScreen}
                />
                <Stack.Screen
                  name="FontSettingScreen"
                  component={FontSettingScreen}
                />
                <Stack.Screen name="ChatBackupScreen" component={ChatBackup} />
                <Stack.Screen name="AvatarScreen" component={AvatarScreen} />
                <Stack.Screen
                  name="ChannelScreen"
                  component={ChannelScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="ChannelMembers"
                  component={ChannelMembers}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="ChannelWebScreen"
                  component={ChannelWebScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="ShowAllMedia"
                  component={ShowAllMedia}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="VideoListScreen"
                  component={VideoListScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="VideoPlayScreen"
                  component={VideoPlayScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="AppIconScreen"
                  component={AppIconScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="TokeePremium"
                  component={TokeePremium}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="PremiumSubscription"
                  component={PremiumSubscription}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="PremiumFeaturesScreen"
                  component={PremiumFeaturesScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="EditChannelScreen"
                  component={EditChannelScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="NewChannelScreen"
                  component={NewChannelScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="ChannelChatting"
                  component={ChannelChatting}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />

                <Stack.Screen
                  name="ChannelProfile"
                  component={ChannelProfile}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="DiamondPurcahse"
                  component={DiamondPurchase}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="TokeeMatchOnBoard"
                  component={TokeeMatchOnBoard}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="TokeeMatchQuestion"
                  component={TokeeMatchQuestion}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen
                  name="UpdateTokeeMatchImage"
                  component={UpdateTokeeMatchImage}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeContext.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};
export default App;
