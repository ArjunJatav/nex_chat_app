/**
 * @format
 */
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidStyle,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { AppRegistry, Platform } from "react-native";
import _BackgroundTimer from "react-native-background-timer";
import RNCallKeep from "react-native-callkeep";
import "react-native-image-keyboard";
import PushNotification from "react-native-push-notification";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { name as appName } from "./app.json";
import { Base_Url, update_call_status } from "./src/Constant/Api";
import { PlaySound } from "./src/Screens/agora/agoraHandler";
import {
  resetVoipReducer,
  updateAgoraData,
  updateCallData,
  updateCallState,
} from "./src/reducers/VoipReducer";
import { updateCallerId } from "./src/reducers/callerIDReducers";
import { resetDataReducer, updateDataAgora } from "./src/reducers/dataReducer";
import { socket } from "./src/socket";
import { persistor, store } from "./src/store";

let agoraData = {};
let uuid = 0;
global.appOpned = true;
RNCallKeep.setAvailable(true);

const ReduxApp = () => (
  <Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

const onDisplayNotification = async () => {
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

const endCall = () => {
  globalThis.statusCheck = undefined;
  // @ts-ignore
  RNCallKeep.endCall("b8236c1b-9f68-4b6e-a8ce-803aec634c98");

  _BackgroundTimer.setTimeout(() => {
    // @ts-ignore
    globalThis.isCallIntiate = false;
    // @ts-ignore
    globalThis.callStateUpdate = true;
    // @ts-ignore
    const agora_Data = {
      uid: "88",
      app_id: agoraData?.app_id,
      channel_name: agoraData?.channel_name,
      is_video: agoraData?.is_video,
      jwt: "",
      token: "",
      receiver: agoraData?.receiver,
      sender: agoraData?.sender,
      userStatus: "",
      receiver_image: agoraData?.receiver_image,
      receiver_name: agoraData?.receiver_name,
      sender_image: agoraData?.sender_image,
      sender_name: agoraData?.sender_name,
      token_2: "",
      isVideo: agoraData?.isVideo,
      image: agoraData?.image,
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

    // leaveCall();
    store.dispatch(updateCallState({ state: "ended" }));
    store.dispatch(resetDataReducer());
    store.dispatch(resetVoipReducer());
  }, 1000);
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
        // @ts-ignore
        Authorization: "Bearer " + globalThis.token,
      },
      data: {
        channel_name: channel,
        status: type,
      },
    })
      .then((response) => {})
      .catch((error) => {});
  } catch (error) {}
};

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  let data = JSON.parse(remoteMessage?.data?.data);
  agoraData = data;

  if (
    data?.status !== "ended" &&
    data?.status !== "missed" &&
    data.notification_type == "calls" &&
    Platform.OS === "android"
  ) {
    for (var i = 0; i < 50; i++) {
      RNCallKeep.backToForeground();
    }
    _BackgroundTimer.setTimeout(() => {
      callKeeper(data);
    }, 5000);

    // if (global.pushCondication == undefined) {
    // for (var i = 0; i < 10; i++) {
    //   RNCallKeep.backToForeground();
    // }

    // const agora = {
    //   uid: "88",
    //   app_id: agoraData?.app_id,
    //   channel_name: agoraData?.channel_name,
    //   is_video: agoraData?.is_video === 1 ? true : false,
    //   jwt: "",
    //   token: "",
    //   receiver: agoraData?.receiver,
    //   sender: agoraData?.sender,
    //   userStatus: " ",
    //   receiver_image: agoraData?.receiver_image,
    //   receiver_name: agoraData?.receiver_name,
    //   sender_image: agoraData?.sender_image,
    //   sender_name: agoraData?.sender_name,
    //   token_2: "",
    //   isVideo: agoraData?.is_video === 1 ? true : false,
    //   image:
    //     "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
    //   caller: agoraData?.sender_name,
    //   uid_2: "48",
    //   roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
    //   uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
    //   id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
    //   status: "answer",
    //   chatId: agoraData.chatId,
    //   callkeep: "push",
    // };

    // store.dispatch(updateDataAgora(agora));
    // _BackgroundTimer.setTimeout(() => {
    //   store.dispatch(updateAgoraData(agora));
    //   store.dispatch(
    //     updateCallData({
    //       isVideo: agoraData?.is_video === 1 ? true : false,
    //       session: "agora_session.video",
    //       guestVideoUid: 155,
    //       // isCallInitalized: true,
    //     })
    //   );
    //   store.dispatch(
    //     updateCallState({
    //       state: "incoming",
    //       isBackground: false,
    //       isVideo: agoraData?.is_video === 1 ? true : false,
    //     })
    //   );
    // }, 1000);

    // RNCallKeep.endCall("b8236c1b-9f68-4b6e-a8ce-803aec634c98");
    // }
  }
});

AppRegistry.registerComponent(appName, () => ReduxApp);