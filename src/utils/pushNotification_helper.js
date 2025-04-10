import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import axios from "axios";
import { Platform } from "react-native";
import _BackgroundTimer from "react-native-background-timer";
import RNCallKeep from "react-native-callkeep";
import PushNotification from "react-native-push-notification";
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidStyle,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";
import { Base_Url, Base_Url2, update_call_status } from "../Constant/Api";
import {
  resetVoipReducer,
  updateAgoraData,
  updateCallData,
  updateCallState,
} from "../reducers/VoipReducer";
import { updateCallerId } from "../reducers/callerIDReducers";
import { resetDataReducer, updateDataAgora } from "../reducers/dataReducer";
import { socket } from "../socket";
import { store } from "../store";
import { stopSound } from "./callKitCustom";
import VoipPushNotification from "react-native-voip-push-notification";
import { PlaySound, StopIncomingSound } from "../Screens/agora/agoraHandler";
import { NativeModules } from 'react-native';

let agoraData = {};

export async function requestFireBasePermission() {
  console.log("request for firebase permission called");
  const authStatus = await messaging().requestPermission({
    provisional: true,
  });

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  await getFCMToke();
  await VoipConfigure();

  if (enabled) {
    console.log("firebase permission is enabled");
  }
}

async function VoipConfigure() {
  if (Platform.OS === "ios") {
    // Register for VoIP push notifications
    VoipPushNotification.registerVoipToken();

    // Event listener for VoIP push token registration
    VoipPushNotification.addEventListener("register", (token) => {
      console.log("VoIP push token:>>>>>>>>>>>>>>>>>>>>>>>>", token);
      globalThis.voiptoken = token;
      // Save token for later use, e.g., send it to your server
    });

    // Event listener for incoming VoIP push notifications
    VoipPushNotification.addEventListener("notification", (notification) => {
      console.log("VoIP push notification received:", notification.aps.alert);
      let data = notification.aps.alert;
      if (data.status == "incoming") {
        store.dispatch(updateDataAgora(data));
      }
      globalThis.wayOfCall = "pushHelper";
    });

    // Event listener for VoIP push notification load events
    VoipPushNotification.addEventListener("didLoadWithEvents", (events) => {
      if (events && Array.isArray(events) && events.length > 0) {
        events.forEach((voipPushEvent) => {
          const { name, data } = voipPushEvent;
          if (
            name ===
            VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent
          ) {
            console.log("VoIP push event received:", data);
          }
        });
      }
    });
  }
}

const onDisplayNotification = async (data) => {
  console.log(
    "display notifee notification in display notify data====================================",
    data
  );

  PushNotification.localNotificationSchedule({
    message: "Your notification message",
    date: new Date(Date.now() + 600 * 1000), // 60 seconds, change as needed
  });
  // Request permissions (required for iOS)
  const settings = await notifee.requestPermission();

  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
  } else {
  }

  const channelId = await notifee.createChannel({
    id: "default2",
    name: "Default Channel2",
    sound: "test",
    importance: AndroidImportance.HIGH,
  });

  // Display a notification
  await notifee.displayNotification({
    title: data.notification.title,
    body: data.notification.body,
    vibrate: true,
    android: {
      channelId,
      // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: "default",
        launchActivity: "com.deucetek.tokee.MainActivity",
      },

      foreground: true,
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: false,
        list: true,
      },
    },
    data,
  });
};

async function getFCMToke() {
  try {
    let fcmToken = await messaging().getToken();
    messaging().setAPNSToken = fcmToken;
    if (fcmToken) {
   
      globalThis.fcmtoken = fcmToken;
      await AsyncStorage.setItem("fcmtoken", fcmToken);
    }
  } catch (error) {
    return;
  }
}

const { IncomingCall } = NativeModules;

export const notificationListener = () => {
  // Assume a message-notification contains a "type" property in the data payload of the screen to open

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("foreground Notification received >>>>>>>", remoteMessage);

    const state = store.getState();
    const groupCalling = state?.callerIDReducers?.userData?.groupCall;
    const memberGroupCall = state?.callerIDReducers?.userData?.memberGroupCall;

    var data = {};
    if (Platform.OS == "ios") {
      data = remoteMessage.data;

      console.log("foreground Notification data >>>>>>>", data);
      agoraData = data;
    } else {
      data = remoteMessage?.data;
      console.log("Notification received in killed state >>>>>>>", data);

      agoraData = data;
      if (data?.status == "missed" && data.channel_name === globalThis.activeChannel) {
          StopIncomingSound();
          IncomingCall.removeIncomingCallNotification();
          console.log("Notification missed kill index.js >>>>>>>", remoteMessage);
          globalThis.statusCheck = undefined;
          store.dispatch(
            updateCallState({
              state: "ended",
              isBackground: false,
            })
          );
     

      }


    }

    // Code Added By Puru
    if (data?.notification_type == "new_user_register") {
      const newUsers = await AsyncStorage.getItem("newcontacts");
      if (newUsers) {
        var previousUsers = JSON.parse(newUsers);
        var tempArray = [...previousUsers, agoraData];
        var jsonStr = JSON.stringify(tempArray);
        await AsyncStorage.setItem("newcontacts", jsonStr);
      } else {
        // Convert JSON string back to array
        var tempArray2 = [];
        tempArray2.push(agoraData);
        var jsonStr2 = JSON.stringify(tempArray2);
        await AsyncStorage.setItem("newcontacts", jsonStr2);
      }
    } else {
      if (
        data?.status !== "ended" &&
        data?.status !== "missed" &&
        Platform.OS === "ios"
      ) {
        //
        if (data?.status == "incoming") {
          store.dispatch(updateDataAgora(agoraData));
          store.dispatch(updateCallerId({call_id:agoraData?.call_id}));
        }
        globalThis.wayOfCall = "pushHelper";
      }

      else if (
        data?.status !== "ended" &&
        data?.status !== "missed" &&
        Platform.OS == "android"
      ) {
        //
        if (data?.status == "incoming") {
       //   console.log("play incoming sound >>>>>>>>>>>>")

          let type = data.is_video == "1" ? "video call" : " audio call"

          globalThis.statusCheck = "active";
          globalThis.activeChannel = data?.channel_name;
          globalThis.wayOfCall = undefined;
          globalThis.callStatus = data?.channel_name;

          const notificationData = {
            // title: remoteMessage?.data?.sender_name,  // You can set this dynamically
            title: "Tokee " + type,  // You can set this dynamically
            message: 'Incoming Call from ' + remoteMessage?.data?.sender_name,  // Custom message
            extraData: JSON.stringify(remoteMessage?.data) // Any extra data you want to pass to the intent
          };
          PlaySound(
            "https://wokii.io/backend/public/uploads/ringtone/ringtone.mp3"
          );

          IncomingCall.showIncomingCallNotification(notificationData);

        }
        globalThis.wayOfCall = "pushHelper";
      }

      if (data?.status == "active" && data?.isVideo == 1 && data?.is_video == 1) {
        if (data?.request == "accepct") {
          stopSound();
          store.dispatch(
            updateCallData({
              isVideo: true,
              session: "agora_session.video",
              guestVideoUid: 156,
            })
          );
        }
      }

      if (data?.status == "declined" && globalThis.statusCheck != "active" && groupCalling != true &&  memberGroupCall != true) {
        stopSound();
        RNCallKeep.endCall(data?.uuid);
        store.dispatch(
          updateCallData({
            session: "",
            token: "",
            isCallDisconnected: true,
          })
        );
        store.dispatch(updateCallState({ state: "declined" }));
        RNCallKeep.endAllCalls();
        setTimeout(() => {
          RNCallKeep.removeEventListener("endCall");
        }, 2000);
        store.dispatch(updateAgoraData({}));
        setTimeout(() => {
          store.dispatch(resetDataReducer());
          store.dispatch(resetVoipReducer());
        }, 500);
      } else if (data.status == "ended") {
        endCall();
        RNCallKeep.endAllCalls();
        
        store.dispatch(updateCallState({ state: "ended" }));
        setTimeout(() => {
          store.dispatch(resetDataReducer());
          store.dispatch(resetVoipReducer());
        }, 1500);
        setTimeout(() => {
          RNCallKeep.removeEventListener("endCall");
        }, 2000);
      }
    }
  });



  messaging().onMessage(async (remoteMessage) => {
    const state = store.getState();
    const checkGroupCall = state?.callerIDReducers?.userData?.groupCall;
    const checkMemberGroupCall = state?.callerIDReducers?.userData?.memberGroupCall;

    let data = remoteMessage.data;
    if (Platform.OS === "android") {
      if (data?.roomId) {
        if (globalThis.activeRoomId != data?.roomId) {
          onDisplayNotification(remoteMessage);
        }
      } else {

        let data = remoteMessage?.data
        if (data.status == "missed" && data.channel_name === globalThis.activeChannel) {
          _BackgroundTimer.setTimeout(() => {

            StopIncomingSound();
            IncomingCall.removeIncomingCallNotification();
            globalThis.statusCheck = undefined;
            store.dispatch(
              updateCallState({
                state: "ended",
                isBackground: false,
              })
            );

            console.log("Notification missed kill index.js >>>>>>>", remoteMessage);
          }, 2000);

        }
        // else if(data.status == "incoming"){
        //   console.log("Inside Incoming call notification >>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        //   PlaySound(
        //     "https://wokii.io/backend/public/uploads/ringtone/ringtone.mp3"
        //   );
        //   globalThis.statusCheck = "active";
        //   globalThis.activeChannel = data?.channel_name;  
        //   globalThis.wayOfCall = undefined;
        //   globalThis.callStatus = data?.channel_name;

        //   const agoraData = {
        //     uid: "88",
        //     app_id: data?.app_id,
        //     channel_name: data?.channel_name,
        //     is_video: data?.is_video,
        //     token: "",
        //     receiver: data?.receiver,
        //     sender: data?.sender,
        //     userStatus:
        //     data?.sender_name +
        //       " " +
        //       "called" +
        //       " " +
        //       data?.receiver_name,
        //     receiver_image: data?.receiver_image,
        //     receiver_name: data?.receiver_name,
        //     sender_image: data?.sender_image,
        //     sender_name: data?.sender_name,
        //     isVideo: true,
        //     caller: data?.sender,
        //     uid_2: "48",
        //     uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
        //     status: data?.status,
        //   };

        //   dispatch(updateAgoraData(agoraData));
        //   dispatch(
        //     updateCallData({
        //       isVideo: true,
        //       session: "agora_session.video",
        //         // ? "agora_session.video"
        //         // : "agora_session.audio",
        //       guestVideoUid: 155,
        //     })
        //   );
        //   dispatch(
        //     updateCallState({
        //       state: "incoming",
        //       isBackground: false,
        //       isVideo: true,
        //     })
        //   );
        //   setTimeout(() => {
        //     globalThis.statusCheck = "active";
        //   }, 2500);
        // }

        onDisplayNotification(remoteMessage);
      }



      if (remoteMessage?.data) {
        let data = remoteMessage?.data;

        _BackgroundTimer.setTimeout(() => {
          if (
            data.status == "missed" &&
            data.channel_name === globalThis.activeChannel
          ) {
            globalThis.statusCheck = undefined;
            store.dispatch(
              updateCallState({
                state: "ended",
                isBackground: false,
              })
            );
          }
        }, 7000);
      }
    } else {
      if (data?.roomId) {
        if (globalThis.activeRoomId != data?.roomId) {
          onDisplayNotification(remoteMessage);
        }
      } else {
        onDisplayNotification(remoteMessage);
      }
    }

    stopSound();

    // if(remoteMessage.data.notification_type == "account_suspended"){
      
    // }

    // await AsyncStorage.removeItem("authToken");
    // await AsyncStorage.removeItem("userImage");
    // await AsyncStorage.removeItem("userName");
    // await AsyncStorage.removeItem("chatUserID");
    // await AsyncStorage.removeItem("isContactUploaded");
    // await AsyncStorage.removeItem("lockChatPinCode");
    // await AsyncStorage.removeItem("chatlockusernumber");
    // await AsyncStorage.removeItem("isAllContactUploaded");
    // await AsyncStorage.removeItem("tokeeContactListTemp");
    // showToast(t("sessionExpired"));
   // navigation.push("Login");

    if (Platform.OS === "ios") {
      console.log("remote message background  >>>>>>>", remoteMessage);
   
      let data = remoteMessage.data;
      console.log("Background Notification data >>>>>>>", data);
      if (data.notification_type == "new_user_register") {
        const newUsers = await AsyncStorage.getItem("newcontacts");
        if (newUsers) {
          var previousUsers = JSON.parse(newUsers);
          var tempArray = [...previousUsers, data];
          var jsonStr = JSON.stringify(tempArray);
          await AsyncStorage.setItem("newcontacts", jsonStr);
        } else {
          // Convert JSON string back to array
          var tempArray2 = [];
          tempArray2.push(data);
          var jsonStr2 = JSON.stringify(tempArray2);
          await AsyncStorage.setItem("newcontacts", jsonStr2);
        }
      } else {
        agoraData = data;
        if (
          data.status !== "ended" &&
          data.status !== "missed" &&
          Platform.OS === "ios"
        ) {
          if (data.status == "incoming") {
            console.log('incoming agoraData===============',agoraData);
            store.dispatch(updateDataAgora(agoraData));
          }
          globalThis.wayOfCall = "pushHelper";
        } else if (data.status == "answer") {
        
          store.dispatch(updateCallState({ state: "active" }));
          store.dispatch(updateCallerId({ id: `${data?.sender}` }));
          stopSound();
        } else if (data.status == "ended") {
          if (globalThis.activeChannel === data?.channel_name) {
            RNCallKeep.endAllCalls();
            store.dispatch(updateCallState({ state: "ended" }));
            setTimeout(() => {
              store.dispatch(resetDataReducer());
              store.dispatch(resetVoipReducer());
            }, 1500);
            setTimeout(() => {
              RNCallKeep.removeEventListener("endCall");
            }, 2000);
            // eslint-disable-next-line
            store.dispatch(agoraUserCallInfo({}));
            stopSound();
          } else {
            RNCallKeep.endAllCalls();
          }
        } else if (data?.status == "declined" && checkGroupCall != true && checkMemberGroupCall != true) {
          stopSound();
          // eslint-disable-next-line
          store.dispatch(agoraUserCallInfo({}));
          store.dispatch(
            updateCallData({
              session: "",
              token: "",
              isCallDisconnected: true,
            })
          );
          store.dispatch(updateCallState({ state: "declined" }));
          RNCallKeep.endAllCalls();
          setTimeout(() => {
            RNCallKeep.removeEventListener("endCall");
          }, 2000);
          store.dispatch(updateAgoraData({}));
          setTimeout(() => {
            store.dispatch(resetDataReducer());
            store.dispatch(resetVoipReducer());
          }, 500);
        }
      }
    }
  });


  const endCall = ({ callUUID }) => {
    RNCallKeep.endCall(callUUID);
    stopSound();
    globalThis.wayOfCall = undefined;
    globalThis.isCallIntiate = false;
    globalThis.callStateUpdate = true;
    const agora_Data = {
      uid: "88",
      app_id: agoraData?.app_id,
      channel_name: agoraData?.channel_name,
      is_video: agoraData?.is_video,
      jwt: "",
      token: "",
      receiver: agoraData?.receiver,
      sender: agoraData?.sender,
      userStatus: " ",
      receiver_image: agoraData?.receiver_image,
      receiver_name: agoraData?.receiver_name,
      sender_image: agoraData?.sender_image,
      sender_name: agoraData?.sender_name,
      token_2: "",
      isVideo: agoraData?.isVideo,
      image:
        "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
      caller: agoraData?.sender_name,
      uid_2: "48",
      roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
      uuid: agoraData?.uuid,
      id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      status: "ended",
    };

    socket.emit("callEvents", {
      toUserId: agoraData.chatId,
      data: agora_Data,
    });
    // check if timer is running then stop it

    startCall("ended", agoraData?.channel_name);
    store.dispatch(updateCallState({ state: "ended" }));
    store.dispatch(resetDataReducer());
    store.dispatch(resetVoipReducer());
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
        // .then((response) => {})
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };
};
