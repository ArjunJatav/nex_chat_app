import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import axios from "axios";
import { Platform } from "react-native";
import _BackgroundTimer from "react-native-background-timer";
import RNCallKeep from "react-native-callkeep";
import { Base_Url, update_call_status } from "../Constant/Api";
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
let agoraData = {};


export async function requestFireBasePermission() {
  const authStatus = await messaging().requestPermission({
    provisional: true,
  });

 


  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
   await getFCMToke();
  }
}

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

export const notificationListener = () => {
  // Assume a message-notification contains a "type" property in the data payload of the screen to open

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    stopSound();
    var data = {};
    if (Platform.OS == "ios") {
      data = remoteMessage.data;
      agoraData = data;
    } else {
      data = JSON.parse(remoteMessage?.data?.data);
      agoraData = data;
    }

    // Code Added By Puru
    if (data.notification_type == "new_user_register") {
  
      const newUsers = await AsyncStorage.getItem("newcontacts");
      if (newUsers) {
        var previousUsers = JSON.parse(
          newUsers
        );
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
        data.status !== "ended" &&
        data.status !== "missed" &&
        Platform.OS === "ios"
      ) {
        //
        if (data.status == "incoming") {
          store.dispatch(updateDataAgora(agoraData));
        }
        globalThis.wayOfCall = "pushHelper";
      }

      if (data.status == "active" && data.isVideo == 1 && data.is_video == 1) {
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

      if (data?.status == "declined") {
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
       // .then((response) => {})
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  messaging()
    .getInitialNotification()
    .then(async () => {
      stopSound();
    });

  messaging().onMessage(async (remoteMessage) => {
    if (Platform.OS === "android") {
      if (remoteMessage?.data?.data) {
        let data = JSON.parse(remoteMessage?.data?.data);

        _BackgroundTimer.setTimeout(() => {
          if (
            data.status == "missed" &&
            data.channel_name === globalThis.chennalSittu
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
    }

    stopSound();
    if (Platform.OS === "ios") {
      let data = remoteMessage.data;
      if (data.notification_type == "new_user_register") {
        const newUsers = await AsyncStorage.getItem("newcontacts");
        if (newUsers) {
          var previousUsers = JSON.parse(
            newUsers
          );
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
            store.dispatch(updateDataAgora(agoraData));
          }
          globalThis.wayOfCall = "pushHelper";
        } else if (data.status == "answer") {
          store.dispatch(updateCallState({ state: "active" }));
          store.dispatch(updateCallerId({ id: `${data?.sender}` }));
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
        } else if (data?.status == "declined") {
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


};
