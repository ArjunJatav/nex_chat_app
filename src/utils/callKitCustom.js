import AsyncStorage from "@react-native-async-storage/async-storage";
import {Platform } from "react-native";
import _BackgroundTimer from "react-native-background-timer";
import { uuidv4 } from "react-native-compressor";
import { updateCallDuration } from "../reducers/CallDurationReducer";
import {
  updateAgoraData,
  updateCallData,
  updateCallState,
} from "../reducers/VoipReducer";
import { updateCallerId } from "../reducers/callerIDReducers";
import {updateDataAgora } from "../reducers/dataReducer";
import { store } from "../store";
import axios from "axios";
import Sound from "react-native-sound";
import { Base_Url, initiate_call } from "../Constant/Api";
import { socket } from "../socket";

var soundInstance = null;
var volume = 1; // Initial volume (0 to 1)
var isPlaying = false;

export const startCall = async (
  type,
  channel,
  contact_id,
  contact_image,
  contact_name,
  uUID
) => {

  let url = Base_Url + initiate_call;

  const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
  let contactNum = JSON.parse(await AsyncStorage.getItem("userContactNumber"));
   // eslint-disable-next-line
  let { sender_id, userChatId, userImage, userName } = senderData;

  setTimeout(() => {
    let bodyData = {
      notification_type: "calls",
      uid: "44",
      contactNum: contactNum,
      app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
      channel_name: channel,
      is_video: type == "video" ? true : false,
      sender: `${sender_id}`,
      receiver: `${contact_id}`,
      status: "incoming",
      receiver_image: contact_image,
      receiver_name: contact_name,
      sender_image: globalThis.userImage,
      sender_name: globalThis.userName,
      chatId: senderData?.userChatId,
      uuid: uUID,
      uid_2: "84",
    };

    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
        data: bodyData,
      })
        .then((response) => {
          if (response.data.status == true) {
            null;
          } else {
            if (Platform.OS == "ios") {
              store.dispatch(updateCallState({ state: "busy" }));
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  }, 1000);
};

let isCalling = false;

export const onCallPress = async ({
  call_type,
  contact_image,
  contact_name,
  contact_chat_id,
  contact_id,
}) => {
  if (isCalling) return; // Prevent multiple executions
  isCalling = true;
  globalThis.statusCheck = "active";
  const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
  let uUID = uuidv4().toUpperCase().toString();
  globalThis.FriendChatId = contact_chat_id;
  const currentTime = new Date().getTime(); // Get the current timestamp in milliseconds
  const channel = `calling_${senderData?.userChatId}_${currentTime}_${contact_id}`;
  let contactNum = JSON.parse(await AsyncStorage.getItem("userContactNumber"));
  const agoraData = {
    contactNum: contactNum,
    uid: "44",
    app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
    channel_name: channel,
    is_video: call_type == "video" ? true : false,
    token: "",
    sender: `${senderData.sender_id}`,
    receiver: `${contact_id}`,
    userStatus: senderData?.userName + " called" + " " + contact_name,
    receiver_image: contact_image,
    receiver_name: contact_name,
    sender_image: senderData?.userImage,
    sender_name: senderData?.userName,
    status: "incoming",
    isVideo: call_type == "video" ? true : false,
    caller: senderData?.userName,
    uid_2: "84",
    uuid: uUID,
    chatId: senderData?.userChatId,
  };
  startCall(call_type, channel, contact_id, contact_image, contact_name, uUID);
  playContinuousSound();
  store.dispatch(updateCallerId({ id: `${senderData.sender_id}` }));
  store.dispatch(
    updateCallData({
      isVideo: call_type == "video" ? true : false,
      guestUserUid: 0,
    })
  );

  setTimeout(() => {
    store.dispatch(updateDataAgora(agoraData));
    store.dispatch(updateAgoraData(agoraData));
    store.dispatch(updateCallDuration(0));
    store.dispatch(
      updateCallState({
        state: "outgoing",
        isBackground: false,
        // guestVideoUid:555
      })
    );
 
  }, 400);
  setTimeout(() => {
    socket.emit("callEvents", {
      toUserId: contact_chat_id,
      data: agoraData,
    });
    isCalling = false;
  }, 2000);

  // Reset isCalling flag after the call is initiated

};

export const playContinuousSound = () => {
  // Do not start a new instance if already playing
  if (isPlaying) {
    return;
  }
  // Replace 'your_sound_file.mp3' with the actual file name/path
  const sound = new Sound(
    "https://tokeecorp.com/backend/public/uploads/ringtone/dialtone.mp3",
    null,
    (error) => {
      if (error) {
        console.log("Error loading sound", error);
        return;
      }

      soundInstance = sound;
      isPlaying = true;
      // Set the initial volume
      sound.setVolume(volume);

      // Play the sound continuously until stopped
      sound.setNumberOfLoops(-1); // Set to -1 for infinite loop
      sound.play((success) => {
        if (!success || !isPlaying) {
          console.log("Error playing sound or stopped by user");
        }
      });
    }
  );
};

export const stopSound = () => {
  if (soundInstance) {
    soundInstance.stop();
    soundInstance.release();
    soundInstance = null;
    isPlaying = false;
  }
};