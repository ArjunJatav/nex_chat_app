/**
 * @format
 */
import React from "react";
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { AppRegistry, Platform } from "react-native";
import _BackgroundTimer from "react-native-background-timer";
import RNCallKeep from "react-native-callkeep";
import "react-native-image-keyboard";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { name as appName } from "./app.json";
// import { Base_Url, update_call_status } from "./src/Constant/Api";
import { PlaySound, StopIncomingSound } from "./src/Screens/agora/agoraHandler";
import {
  updateAgoraData,
  updateCallData,
  updateCallState,
} from "./src/reducers/VoipReducer";
import {updateDataAgora } from "./src/reducers/dataReducer";
import { persistor, store } from "./src/store";
import { NativeModules } from 'react-native';
import { stopSound } from "./src/utils/callKitCustom";

// let agoraData = {};
globalThis.appOpned = true;
RNCallKeep.setAvailable(true);
globalThis.appStateReader = false;

const ReduxApp = () => (
  <Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

// function HeadlessCheck() {
//   return <ReduxApp />;
// }

const onDisplayNotification = async (data) => {
  // PushNotification.localNotificationSchedule({
  //   message: "Your notification message",
  //   date: new Date(Date.now() + 600 * 1000), // 60 seconds, change as needed
  // });
  // Request permissions (required for iOS)
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      console.log("yes")
  } else {
    console.log("no")
  }

  const channelId = await notifee.createChannel({
    id: "default2",
    name: "Default Channel2",
    sound: "test",
    importance: AndroidImportance.HIGH,
  });

  // Display a notification
  await notifee.displayNotification({
    title: "Notification Title",
    body: "Main body content of the notification",
    vibrate: true,
    android: {
      channelId,
      // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: "default",
      },

      foreground: true,
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
      ongoing: true,
      loopSound: true,
    },
    ios: {
      channelId,
      // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: "default",
      },
      sound: "test.mp3",
      foreground: true,
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
    },
    data
  });
};

// const answerCall = ({ callUUID }) => {
//   if (global.killState !== true) {
//     global.statusCheck = "active";
//     _BackgroundTimer.setTimeout(() => {
//       RNCallKeep.setCurrentCallActive(callUUID);
//     }, 1000);

//     _BackgroundTimer.setTimeout(() => {
//       RNCallKeep.backToForeground();
//     }, 2000);

//     _BackgroundTimer.setTimeout(() => {
//       // RNCallKeep.endCall("b8236c1b-9f68-4b6e-a8ce-803aec634c98");
//       store.dispatch(updateCallState({ state: "active" }));
//       startCall("active", agoraData?.channel_name);
//       store.dispatch(
//         updateCallerId({ id: `${agoraData?.receiver}`, callUUID: "" })
//       );

//       const agora_Data = {
//         uid: "88",
//         app_id: agoraData?.app_id,
//         channel_name: agoraData?.channel_name,
//         is_video: agoraData?.is_video === 1 ? true : false,
//         jwt: "",
//         token: "",
//         receiver: agoraData?.receiver,
//         sender: agoraData?.sender,
//         userStatus: "",
//         receiver_image: agoraData?.receiver_image,
//         receiver_name: agoraData?.receiver_name,
//         sender_image: agoraData?.sender_image,
//         sender_name: agoraData?.sender_name,
//         token_2: "",
//         isVideo: agoraData?.is_video === 1 ? true : false,
//         image:
//           "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
//         caller: agoraData?.sender_name,
//         uid_2: "48",
//         roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
//         uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
//         id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
//         status: "answer",
//       };

//       store.dispatch(updateAgoraData(agora_Data));
//       store.dispatch(updateDataAgora(agora_Data));

//       store.dispatch(
//         updateCallData({
//           isVideo: agoraData?.is_video === 1 ? true : false,
//           session:
//             agoraData?.is_video === 1
//               ? "agora_session.video"
//               : "agora_session.audio",
//           guestVideoUid: 155,
//           // isCallInitalized: true,
//         })
//       );

//       socket.emit("callEvents", {
//         toUserId: agoraData?.chatId,
//         data: agora_Data,
//       });
//       global.killState = true;
//     }, 500);
//   }
// };

const callKeeper = (dataAgora) => {
  RNCallKeep.backToForeground();

  _BackgroundTimer.setTimeout(() => {
    globalThis.callStatus = dataAgora?.channel_name;
    store.dispatch(updateDataAgora(dataAgora));
    const agoraData = {
      uid: "88",
      app_id: dataAgora?.app_id,
      channel_name: dataAgora?.channel_name,
      is_video: dataAgora?.is_video == "1" ? true : false,
      jwt: "",
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
      token_2: "",
      isVideo: dataAgora?.isVideo == "1" ? true : false,
      image:
        "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
      caller: dataAgora?.sender,
      uid_2: "48",
      roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
      uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      status: dataAgora?.status,
    };

    PlaySound("https://wokii.io/backend/public/uploads/ringtone/ringtone.mp3");

    globalThis.chennalSittu = dataAgora?.channel_name;

    store.dispatch(updateAgoraData(agoraData));
    store.dispatch(
      updateCallData({
        isVideo: dataAgora?.isVideo,
        session:
          dataAgora?.isVideo == "1"
            ? "agora_session.video"
            : "agora_session.audio",
        guestVideoUid: 155,
        // isCallInitalized: true,
      })
    );
    store.dispatch(
      updateCallState({
        state: "incoming",
        isBackground: false,
      })
    );
  }, 1500);
};

// const endCall = () => {
//   globalThis.statusCheck = undefined;
//   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
//   RNCallKeep.endCall("b8236c1b-9f68-4b6e-a8ce-803aec634c98");

//   _BackgroundTimer.setTimeout(() => {
//     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
//     globalThis.isCallIntiate = false;
//     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
//     globalThis.callStateUpdate = true;
//     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
//     const agora_Data = {
//       uid: "88",
//       app_id: agoraData?.app_id,
//       channel_name: agoraData?.channel_name,
//       is_video: agoraData?.is_video,
//       jwt: "",
//       token: "",
//       receiver: agoraData?.receiver,
//       sender: agoraData?.sender,
//       userStatus: "",
//       receiver_image: agoraData?.receiver_image,
//       receiver_name: agoraData?.receiver_name,
//       sender_image: agoraData?.sender_image,
//       sender_name: agoraData?.sender_name,
//       token_2: "",
//       isVideo: agoraData?.isVideo,
//       image: agoraData?.image,
//       caller: agoraData?.sender_name,
//       uid_2: "48",
//       roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
//       uuid: agoraData?.uuid,
//       id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
//       status: "ended",
//     };

//     socket.emit("callEvents", {
//       toUserId: agoraData.chatId,
//       data: agora_Data,
//     });
//     // check if timer is running then stop it

//     startCall("ended", agoraData?.channel_name);

//     // leaveCall();
//     store.dispatch(updateCallState({ state: "ended" }));
//     store.dispatch(resetDataReducer());
//     store.dispatch(resetVoipReducer());
//   }, 1000);
// };

// const startCall = async (type, channel) => {
//   const url = Base_Url + update_call_status;
//   try {
//     axios({
//       method: "post",
//       url: url,
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
//         Authorization: "Bearer " + globalThis.token,
//       },
//       data: {
//         channel_name: channel,
//         status: type,
//       },
//     })
//       .then((response) => {})
//       .catch((error) => {});
//   } catch (error) {}
// };

// Register background handler
const { IncomingCall } = NativeModules;
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if( Platform.OS === "ios"){
    onDisplayNotification(remoteMessage.data)
  }else{

    let data = remoteMessage?.data
    console.log("Notification received in killed state in index.js >>>>>>>", remoteMessage);

    if(data.status == "missed" && data.channel_name === globalThis.activeChannel){
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
  // const  agoraData = data;

  if (
    data?.status !== "ended" &&
    data?.status !== "missed" &&
    data.notification_type == "calls" &&
    Platform.OS === "android"
  ) {

    globalThis.statusCheck = "active";
    globalThis.activeChannel = data?.channel_name;
    globalThis.wayOfCall = undefined;
    globalThis.callStatus = data?.channel_name;

    let type = data.is_video == "1" ? "video call" : " audio call"
    const notificationData = {
      title: "Tokee " + type,  // You can set this dynamically
      message: 'Incoming Call from ' + remoteMessage?.data?.sender_name,  // Custom message
      extraData: JSON.stringify(remoteMessage?.data) // Any extra data you want to pass to the intent
    };
    console.log("Sending Notification Data >>>>>>>",notificationData)
    PlaySound(
      "https://wokii.io/backend/public/uploads/ringtone/ringtone.mp3"
    );
    IncomingCall.showIncomingCallNotification(notificationData);
   
  }
}
});
AppRegistry.registerComponent(appName, () => ReduxApp);
