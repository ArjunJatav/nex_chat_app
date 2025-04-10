import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
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
  createTableUser,
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
} from "./src/sqliteStore";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";

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
import { Alert, PermissionsAndroid, Platform } from "react-native";
import RNCallKeep from "react-native-callkeep"; 
import CryptoJS from "react-native-crypto-js"; 
import PushNotification from "react-native-push-notification";
import { useDispatch, useSelector } from "react-redux";
import {
  Base_Url,
  UpdateLastSeenApi,
  alldataapiV2,
  chatBaseUrl,
  update_call_status,
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
import { updateCallerId } from "./src/reducers/callerIDReducers";

import axios from "axios";
import { AppState, LogBox } from "react-native";

import BackgroundTimer from "react-native-background-timer";
import {
  setDeleteRoom,
  setHideRoom,
  setMainprovider,
  setUnreadCount,
  setsyncchatlist,
} from "./src/Redux/ChatHistory";
import { setChatlistmessage } from "./src/Redux/ChatList";
import ForwardMessageScreen from "./src/Screens/Chat/ForwardMessage";
import OrderSummary from "./src/Screens/Settings/OrderSummary";
import ShopScreen from "./src/Screens/Settings/ShopScreen";
import ThemeScreen from "./src/Screens/Settings/ThemeScreen";
import {stopSound} from "./src/utils/callKitCustom";
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
import {  setupdateblock } from "./src/Redux/MessageSlice";
import ChatSettingScreen from "./src/Screens/Settings/ChatSettingScreen";
import MediaDownload from "./src/Components/MediaDownload/MediaDownload";
import { updateAppState, updateMediaLoader, updatedmembersall } from "./src/reducers/getAppStateReducers";
import DemoChat from "./src/Screens/Chat/DemoChat";
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions";
import PendingRequest from "./src/Screens/Chat/PendingRequest";
import AppIconScreen from "./src/Screens/Settings/AppIconScreen";
import TokeePremium from "./src/Screens/Settings/TokeePremium";

LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreAllLogs(); 

var agoraNewData = {};
var statusCheck = {};

const App = () => {
  const mainprovider = useSelector(
     // eslint-disable-next-line
    (state: any) => state.chatHistory.mainprovider
  );
  const [colorTheme, setColorTheme] = useState(false);
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const appState = AppState.currentState;
   // eslint-disable-next-line
  const agoraData = useSelector((state: any) => state.VoipReducer?.agora_data);

  const callState = useSelector(
     // eslint-disable-next-line
    (state: any) => state?.VoipReducer?.call_state || null
  );
   // eslint-disable-next-line
  const allData = useSelector((state: any) => state?.dataReducer?.data);
   // eslint-disable-next-line
  const newroomID = useSelector((state: any) => state.chatHistory.newroomID);
 
  agoraNewData = allData;
 

  const syncchatlist = useSelector(
     // eslint-disable-next-line
    (state: any) => state.chatHistory.syncchatlist
  );

  
  const membersupdated = useSelector(
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.getAppStateReducers?.membersupdated
  );

   // eslint-disable-next-line
  const connectstate = useSelector((state: any) => state?.getAppStateReducers?.app_state?.isAppActive);

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


  useEffect(() => {
    if (callState.state != "outgoing") {
      stopSound();
      StopIncomingSound();
    }
  }, [callState.state]);

  React.useEffect(() => {
     // eslint-disable-next-line
    socket.on("connect_error", (error: any) => {
      socket.connect;
    });
  }, [socket]);

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
        // syncData();
      }
    });

    socket.on("disconnect", () => {
      // Automatically attempt to reconnect
      socket.connect;
    });

    socket.on("reconnect", () => {
      socket.connect;
    });
  }, [socket]);

  // ================================================
  // seen emit work
  useEffect(() => {
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

  useEffect(() => {
     // eslint-disable-next-line
    const handleBlockUsers = async (data:any) => {
      updateblockuser(
        { touser: data.touser, fromuser: data.fromuser },
        data.isBlock ? "insert" : "remove",
         // eslint-disable-next-line
        ({ res, status }:any) => {
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

  // delivered message work
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

  // 30 dec - Yogesh
  React.useEffect(() => {
     // eslint-disable-next-line
    const deletemessssggggggg = async (deleteMessage: any) => {
      console.log('detlet ', deleteMessage);

      let data = deleteMessage.result;
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
     // eslint-disable-next-line
    const deleteFunction = (data:any) => {
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
    const hideFunction = (data:any) => {
      HideTheGroup(data);
      dispatch(setHideRoom(data.roomId));
    };
    socket.on("group-hide", hideFunction);
    return () => {
      
      socket.off("group-hide", hideFunction);
    };
  });



   // eslint-disable-next-line
  const checkIfFilesExist = async (message: any) => {
    try {
      let updatedLocalPaths = [];
      let isLocalPathUpdated = false;

      // for (let i = 0; i < message.localPaths.length; i++) {
      for await (let item of message.attachment) {
        // const item = message.localPaths[i];
        let mediaName = item.split("/").pop();
     
        let mediaId = mediaName.split(".").slice(0, -1).join(".");
        
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

        let destinationPath =
          Platform.OS === "android"
            ? `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`
            : `${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`;
           
        const fileExists = await RNFS.exists(destinationPath);
       if (fileExists) {
        
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        updatedLocalPaths.push(destinationPath);
      
        const UpdatedPath = JSON.stringify(updatedLocalPaths)
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        insertChatList({ paramsOfSend: {...message,localPaths: UpdatedPath}, chatRoom: false });
       }else{
        const UpdatedPath = JSON.stringify(updatedLocalPaths)
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        insertChatList({ paramsOfSend: {...message,localPaths: UpdatedPath}, chatRoom: false });
       }

   
      }
   

   
    } catch (error) {
      console.log("error : ", error);
    }

    // Update the message's localPaths if it has been modified

    // messages[messageIndex].localPaths = updatedLocalPaths;
  };
  function MediaUpdated(id,path,newmsg) {
 
dispatch(updateMediaLoader({
      messageId: id,
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      isMediaLoader: false,
    }));
    //sample
  }
  React.useEffect(() => {
   
     // eslint-disable-next-line
    const handlenewMessageResive = async (data: any) => {    
      
      const value = await AsyncStorage.getItem("allMediaDownload");
      try {
        const allMediaDownload =
          value === "true" || globalThis.allMediaDownload === true;
          let dict = {
            messageType: data.result.message_type,
            messageId: data.result._id,
            attachment: data.result.attachment,
          };
          if (
            data.result.message_type == "image" ||
            data.result.message_type == "video" ||
            data.result.message_type == "document" ||
            data.result.message_type == "audio"
          ) {

            if (allMediaDownload && globalThis.isChatDetailOpen == "no") {
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          MediaDownload(dict, data.result.roomId, MediaUpdated);
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
              phone_number: Number(data.result.phoneNumber),
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
        } else {
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
        }

        
        if (globalThis.userChatId == data.result.fromUser) {
         checkIfFilesExist(data?.result)
         

        } else {
          checkIfFilesExist(data?.result)
          
          
        }
      } catch (error) { }
    };

    socket.on("newMessageResive", handlenewMessageResive);

    return () => {
     
      socket.off("newMessageResive", handlenewMessageResive);
    };
  });

  useEffect(() => {
     // eslint-disable-next-line
    const handleJoinGroup = (data:any) => {

      console.log("public group members add",data)
     
      addMemberToRoomMembersSql(
        {
          chat_user_id: data.chat_user_id,
          contact_name: data.contact_name,
          isAdmin: 0,
          profile_image: data.profile_image,
          phone_number: data.phone_number,
        },
        data.roomId,
        ()=> {
          if(data.roomId == newroomID){
            dispatch(updatedmembersall(membersupdated))
          }
        }
      );
    };

    
    socket.on("joinGroup", handleJoinGroup);

    return () => {
      socket.off("joinGroup", handleJoinGroup);
    };
  });

  var count = 1

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
      console.log("updateeeememberssss",data)
      // removeAllMembersFromRoomMembersSql(data.roomId, () => {
      //   addMembersToRoomMembersSql(data.remaningMembers, data.roomId);
      // });
      addMembersToRoomMembersSqlnew(data.remaningMembers, data.roomId, () => {
        count = count + 1;
        dispatch(updateAppState({ updatemediauseeeffect: count + 1 }));
       
        dispatch(updatedmembersall(membersupdated))

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

  useEffect(() => {

    // if (__DEV__ && Platform.OS == "ios") {
    //   NativeModules.DevSettings.setIsDebuggingRemotely(true);
    // }
    
     // eslint-disable-next-line
    socket.on("checkOnlineStatus", (data: any) => {
      if (data.status == "request") {
        let params = {
          to: data.fromUser,
          roomId: data.roomId,
          fromUser: data.to,
          status: "response",
        };
        
        socket.emit("checkOnlineStatus", params);
      }
    });
  });

  const geturerchatid = async() =>{
    const chatUserID = await AsyncStorage.getItem("chatUserID");
    if(chatUserID){
      globalThis.chatUserId = chatUserID;
      globalThis.userChatId = chatUserID; 
    }
  }

  useEffect(() => {
     // eslint-disable-next-line
    socket.on("newGroupCreated", (data: any) => {
      let createGroup = {
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
        let myObj = {
         
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

  useEffect(() => {
    
    globalThis.pushCondication = "true";
    if (statusCheck == "active") {
      RNCallKeep.endAllCalls();
      stopSound();
      
    }
  }, [statusCheck]);

  useEffect(() => {
    checkPermission();

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
      const notificationPermission = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      if (notificationPermission === RESULTS.DENIED || notificationPermission === RESULTS.BLOCKED) {
        await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      }
      
    }
  };
  // syncing all data from server first time

  const syncData = async () => {
    let lastsynctime =  await AsyncStorage.getItem("lastsynctime");
    if(lastsynctime && globalThis.userChatId){
      
      const  withoutbackuparray = [
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=room`,
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=chat`,
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=block`,
        `${chatBaseUrl}${alldataapiV2}${globalThis.userChatId}&lastSync=${lastsynctime}&requestFor=deletedRooms`,
      ]
  
     const apis = withoutbackuparray;

     console.log("withoutbackuparray",withoutbackuparray)
    
      Promise.all(apis.map((a) => syncDataModule(a, a.split("=").pop() + "s")))
        .then(async (res) => {
      
          BackgroundTimer.setTimeout(() => {
            
            axios({
              method: "get",
              url: `https://chat.tokeecorp.com:8002/api/user/rooms/last-message/${globalThis.userChatId}`,
              headers: {
                "Content-Type": "application/json",
                api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
              },
            })
              .then((response) => {
                if (response.data.status) {
                  response?.data.data?.map((room) => {
                    getUnseenMessageCount(
                      room.roomId,
                      room.message_time,
                      (unseenMessageCount) => {
                        updateUnseenMessageCount(room.roomId, unseenMessageCount);
                      }
                    );
                  });
                }
              })
              .catch((err) => {
                console.log("errror: ", err);
              });
          }, 200);
          // dispatch(setsyncloader(true));
        
        })
        .catch((err) => {});
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
           
            let res = {};
            
            res[type] = response.data.data;
            if (type == "rooms" && response.data.data.length == 0) {
              globalThis.isNewAccount = true;
            } else if (type == "rooms" && response.data.data.length > 0) {
              globalThis.isNewAccount = false;
            }
            // insertRoomSql(res, globalThis.userChatId)

            insertRoomSql(res, globalThis.userChatId, (status) => {
            
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
                        response?.data.data?.map(async(room) => {
                          getUnseenMessageCount(
                            room.roomId,
                            room.message_time,
                            (unseenMessageCount) => {
                              updateUnseenMessageCount(
                                room.roomId,
                                unseenMessageCount
                              );
                              dispatch(setsyncchatlist(!syncchatlist))
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

  const updateuserSyncTime = async() => {
    const USERID = await AsyncStorage.getItem("chatUserID");
    const urlStr = chatBaseUrl + "/api/user/update/timestamp/" + USERID;
    
    try {
      await axios({
        method: "put",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
        },
      })
        .then(async () => {
          
       
        })
        .catch((error) => {
          alert(error);
        //  dispatch(setsyncloader(true));
        });
    } catch (error) {
      alert(error);
     // dispatch(setsyncloader(true));
    }

  }

  React.useEffect(() => {
    createTableUser();
    requestUserData();
  
  }, [globalThis.chatUserId,connectstate]);

  const requestUserData = async () => {
    const myChatId = await AsyncStorage.getItem("chatUserID");
    const themeUse = await AsyncStorage.getItem("selectTheme");

    if (themeUse !== null) {
     
      globalThis.selectTheme = themeUse;
    }
    

    if (myChatId != null || myChatId != undefined) {
      console.log("myChatId",myChatId)
     
      socket.emit("join", { id: myChatId }); 
      if (globalThis.isDatasynced == undefined) {
       
        globalThis.isDatasynced = true;
        syncData();
      }

      updateLastSeenApi(myChatId);
      initiateSocketConnection(myChatId);
      setInterval(() => {
        updateLastSeenApi(myChatId);
      }, 20000);
    }
  };

  // =======================Audio and video ====================
  useEffect(() => {
    if (Platform.OS === "android") {
      RNCallKeep.addEventListener("answerCall", answerCall);
      RNCallKeep.addEventListener("didPerformDTMFAction", didPerformDTMFAction);
      RNCallKeep.addEventListener(
        "didReceiveStartCallAction",
        didReceiveStartCallAction
      );
      RNCallKeep.addEventListener(
        "didPerformSetMutedCallAction",
        didPerformSetMutedCallAction
      );
      RNCallKeep.addEventListener(
        "didToggleHoldCallAction",
        didToggleHoldCallAction
      );
    }

    return () => {
      RNCallKeep.removeEventListener("answerCall");
      RNCallKeep.removeEventListener("didPerformDTMFAction");
      RNCallKeep.removeEventListener("didReceiveStartCallAction");
      RNCallKeep.removeEventListener("didPerformSetMutedCallAction");
      RNCallKeep.removeEventListener("didToggleHoldCallAction");
      RNCallKeep.removeEventListener("endCall");
    };
  }, []);

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
              is_video: agoraNewData?.is_video === "1" ? true : false,
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
              isVideo: agoraNewData?.is_video === "1" ? true : false,
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
  const didPerformDTMFAction = ({ callUUID, digits }: any) => {
   
  };

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
    const url = Base_Url + update_call_status;
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
          alert(error);
        });
    } catch (error) {
      alert(error);
     }
  };

  const answerCalliOSCall = () => {
    for (let i = 0; i < 10; i++) {
      RNCallKeep.backToForeground();
    } 
    globalThis.statusCheck = "active";
    dispatch(updateCallState({ state: "active", isBackground: false }));
    _BackgroundTimer.setTimeout(() => {
      //   RNCallKeep.endAllCalls();
    }, 500);

    RNCallKeep.removeEventListener("endCall");
  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    dispatch(updateCallerId({ id: `${agoraNewData?.receiver}`, callUUID: "" }));
 // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    globalThis.activeChannel = agoraNewData?.channel_name; 
    const agora_Data = {
      uid: "88", 
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      app_id: agoraNewData?.app_id,
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: agoraNewData?.channel_name,
      is_video:
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        agoraNewData?.is_video == 1 ||
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          agoraNewData?.is_video == "1" ||
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          agoraNewData?.is_video == true
          ? true
          : false,
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
      isVideo:
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        agoraNewData?.is_video == 1 ||
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          agoraNewData?.is_video == "1" ||
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          agoraNewData?.is_video == true
          ? true
          : false,
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
 // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    globalThis.FriendChatId = agoraNewData?.chatId;
    dispatch(updateAgoraData(agora_Data));
    dispatch(
      updateCallData({
        isVideo: agora_Data?.is_video,
        session: agora_Data?.is_video
          ? "agora_session.video"
          : "agora_session.audio",
        guestVideoUid: 155,
      })
    );

    
    socket.emit("callEvents", {
      
      toUserId: agoraData?.chatId,
      data: agora_Data,
    });
    startCall("answer", agoraData?.channel_name);
    globalThis.wayOfCall = undefined;
  };

   // eslint-disable-next-line
  const answerCall = ({ callUUID }: any) => {
    RNCallKeep.endAllCalls();
    StopIncomingSound()
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
      toUserId: agoraNewData.chatId,
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



  const initiateSocketConnection = async () => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
     globalThis.sender_id = senderData.sender_id;

      // eslint-disable-next-line
    socket.on("callEvents", async (data:any) => {
      const loginToken = await AsyncStorage.getItem("authToken");
      const dataAgora = data.data;
      if (dataAgora.status === "busy") {
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
        Platform.OS == "android"
      ) {
        PlaySound("https://wokii.io/backend/public/uploads/ringtone/ringtone.mp3");
        globalThis.statusCheck = "active";
        globalThis.activeChannel = dataAgora?.channel_name;
        
        RNCallKeep.backToForeground(); 
        globalThis.wayOfCall = undefined; 
        globalThis.callStatus = dataAgora?.channel_name;

        const agoraData = {
          uid: "88",
          app_id: dataAgora?.app_id,
          channel_name: dataAgora?.channel_name,
          is_video: dataAgora?.is_video,
          token: "",
          receiver: dataAgora?.receiver,
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
          uid_2: "48",
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
            guestVideoUid: 155,
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
        stopSound();
        globalThis.callStatus = dataAgora?.channel_name;
        globalThis.statusCheck = "active";
        globalThis.activeChannel = dataAgora?.channel_name;
        statusCheck = "active";
        dispatch(updateCallState({ state: "active" })); 
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        dispatch(updateCallerId({ id: `${dataAgora?.sender}` }));
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
          isVideo:true
        };
    
        if (dataAgora?.request == "request" && globalThis.statusCheck == 'active') {
          setTimeout(async () => {
            const alertStatus = await getAlertVisibleCondition();
            if (alertStatus == false) {
              Alert.alert("Request Alert", "Video call request", [
                {
                  text: "Ok",
                  onPress: () => {
                    
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
                          guestVideoUid: 155,
                        })
                      );
                      dispatch(updateCallState({ state: "active" }));
                    }, 1000);
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
              guestVideoUid: 156,
            })
          );
          dispatch(updateCallState({ state: "active" }));
        }
      } else if (dataAgora.status == "ended") {
          stopSound();
        if (globalThis.activeChannel === dataAgora?.channel_name) {
          globalThis.statusCheck = undefined;
          globalThis.activeChannel=undefined;
          RNCallKeep.endAllCalls(); 
          dispatch(updateCallState({ state: "ended" }));
          setTimeout(() => {
            RNCallKeep.removeEventListener("endCall");
          }, 2000);
        } else {
          RNCallKeep.endAllCalls();
        }
      } else if (dataAgora?.status == "declined") {
        stopSound();
        globalThis.statusCheck = undefined;
        globalThis.activeChannel=undefined;
        RNCallKeep.endCall(dataAgora?.uuid);
        dispatch(updateCallState({ state: "declined" }));
        setTimeout(() => {
          dispatch(resetDataReducer());
          dispatch(resetVoipReducer());
          RNCallKeep.removeEventListener("endCall");
          RNCallKeep.endAllCalls();
          globalThis.statusCheck = undefined;
          globalThis.activeChannel=undefined;
         // stopSound()
        }, 2000);
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
          alert(error)
         });
    } catch (error) { 
      alert(error)
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
            <NavigationContainer>
              {isNotEmpty(agoraData?.app_id) && <Calling />}
              <Toast {...{ ref: toastRef }} />
              <Stack.Navigator
                screenOptions={{ headerShown: false, gestureEnabled: false }}
              >
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="AfterLogin" component={AfterLogin} />
                <Stack.Screen name="BottomBar" component={BottomTab} />
                <Stack.Screen name="ThemeScreen" component={ThemeScreen} />
                <Stack.Screen name="ShopScreen" component={ShopScreen} />
                <Stack.Screen name="OrderSummary" component={OrderSummary} />
                <Stack.Screen name="EditCoverImage"
                 component={EditCoverImage} />
                <Stack.Screen
                  name="NewChatScreen"
                  component={NewChatScreen}
                  options={{
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                  }}
                />
                <Stack.Screen name="MyStatusScreen" component={MyStatusScreen} />
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
                <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
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
                <Stack.Screen name="StoryListModel" component={StoryListModel} />
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
                <Stack.Screen name="CropVideoScreen" component={CropVideoScreen} />
                <Stack.Screen name="ReportUserModel" component={ReportUserModel} />
                <Stack.Screen name="HomeIntroScreen" component={HomeIntroScreen} />
                <Stack.Screen name="WebScreen" component={WebScreen} />
                <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
                <Stack.Screen name="SearchGroup" component={SearchGroup} />
                <Stack.Screen name="AllPublicGroup" component={AllPublicGroup} />
                <Stack.Screen name="QrScannerScreen" component={QrScannerScreen} />
                <Stack.Screen name="MyScannerScreen" component={MyScannerScreen} />
                <Stack.Screen name="ChatSettingScreen" component={ChatSettingScreen} />
                <Stack.Screen
                  name="FontSettingScreen"
                  component={FontSettingScreen}
                />
                <Stack.Screen
                  name="ChatBackupScreen"
                  component={ChatBackup}
                />
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
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeContext.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};
export default App;
