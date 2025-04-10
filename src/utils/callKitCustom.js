import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import _BackgroundTimer from "react-native-background-timer";
import { uuidv4 } from "react-native-compressor";
import { updateCallDuration } from "../reducers/CallDurationReducer";
import {
  updateAgoraData,
  updateCallData,
  updateCallState,
} from "../reducers/VoipReducer";
import { updateCallerId } from "../reducers/callerIDReducers";
import { updateDataAgora } from "../reducers/dataReducer";
import { store } from "../store";
import axios from "axios";
import Sound from "react-native-sound";
import {
  Base_Url,
  Base_Url2,
  callid_ofuser,
  generateAgoraTokenApi,
  get_call_active_member,
  groupCallApi,
  initiate_call,
} from "../Constant/Api";
import { socket } from "../socket";
import { Camera } from "react-native-vision-camera";

var soundInstance = null;
var volume = 1; // Initial volume (0 to 1)
var isPlaying = false;

// export const startCall = async (
//   type,
//   channel,
//   contact_id,
//   contact_image,
//   contact_name,
//   uUID
// ) => {
//   let url = Base_Url2 + initiate_call;

//   const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
//   let contactNum = JSON.parse(await AsyncStorage.getItem("userContactNumber"));
//   // eslint-disable-next-line
//   let { sender_id, userChatId, userImage, userName } = senderData;

//   setTimeout(() => {
//     let bodyData = {
//       notification_type: "calls",
//       uid: "44",
//       contactNum: contactNum,
//       app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
//       channel_name: channel,
//       is_video: type == "video" ? true : false,
//       sender: `${sender_id}`,
//       receiver: `${contact_id}`,
//       status: "incoming",
//       receiver_image: contact_image,
//       receiver_name: contact_name,
//       sender_image: globalThis.userImage,
//       sender_name: globalThis.userName,
//       chatId: senderData?.userChatId,
//       uuid: uUID,
//       uid_2: "84",
//     };

//     try {
//       axios({
//         method: "post",
//         url: url,
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: "Bearer " + globalThis.token,
//         },
//         data: bodyData,
//       })
//         .then((response) => {
//           if (response.data.status == true) {
//             console.log(
//               "startcall response ====================================",
//               response.data.data.call_id
//             );
//             store.dispatch(
//               updateCallerId({ call_id: response?.data?.data?.call_id })
//             );
//             null;
//           } else {
//             if (Platform.OS == "ios") {
//               store.dispatch(updateCallState({ state: "busy" }));
//             }
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   }, 1000);
// };

export const getActiveMembersOnCall = async (call_id) => {
  const url = Base_Url + get_call_active_member;
  console.log('call_id==========', call_id);
  
  try {
    const response = await axios({
      method: "post",
      url: url,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + globalThis.token,
      },
      data: {
        call_id: call_id,
      },
    });
    
    // Return the response data here
    return response.data;
    
  } catch (error) {
    console.log("active call catch=======", error);
  
  }
};



export const startCall = async (
  type,
  channel,
  contact_id,
  contact_image,
  contact_name,
  uUID
) => {
  let url = Base_Url2 + initiate_call;

  console.log('contact_id=====',contact_id)

  const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
  let contactNum = JSON.parse(await AsyncStorage.getItem("userContactNumber"));
  let { sender_id } = senderData;

  return new Promise((resolve, reject) => {
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
            const call_id = response.data.data.call_id;
            console.log(
              "startCall response ====================================",
              response.data.data
            );
            store.dispatch(updateCallerId({ call_id }));
            resolve(call_id); // Resolve with the call_id
          } else {
            if (Platform.OS === "ios") {
              store.dispatch(updateCallState({ state: "busy" }));
            }
            reject(new Error("Call initiation failed"));
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    }, 1000);
  });
};

let isCallInitiated = false;

export const initiateCall = async (
  selectedFriends,
  channel,
  uUID,
  type,
  contact_image,
  contact_name,
  from = "default"
) => {
  if (isCallInitiated) return; // Prevent duplicate execution
  isCallInitiated = true;
  const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
  let contactNum = JSON.parse(await AsyncStorage.getItem("userContactNumber"));
  let members = selectedFriends;
  const senderId = senderData?.sender_id; // Assuming senderData is defined

  if (senderId) {
    members.unshift(senderId); // Add senderId at the beginning of the array
  }



  const url = groupCallApi;
  const payload = {
    call_id: "",
    uid: `${globalThis.sender_id}`,
    uid_2: "84",
    app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
    contactNum: `${contactNum}`,
    chatId: senderData?.userChatId,
    uuid: uUID,
    channel_name: channel,
    jwt: "",
    token: "",
    is_video: type == "video" ? true : false,
    status: "incoming",
    sender_image: contact_image,
    sender_name: contact_name,
    sender: `${senderData?.sender_id}`,
    receiver_image: contact_image,
    receiver_name: contact_name,
    members: members,
    groupCall: from == "isNormalGroupCall" ? false : true,
    isNormalGroupCall: from == "isNormalGroupCall" ? true : false,
  };

  try {

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + globalThis.token,
      },
    });

    if (response.data.status == true) {
      isCallInitiated = false;
      if (from != "isNormalGroupCall") {
        store.dispatch(updateCallerId({ groupCall: true }));
      }

      console.log("Call initiated successfully:", response.data.data);
    } else {
      console.error("Error initiating call:", response.data);
      isCallInitiated = false;
    }
  } catch (error) {
    console.error("API Error:", error);
    isCallInitiated = false;
  }
};

export const sendChatUserIds = async (chat_user_ids) => {
  const url = `${Base_Url}${callid_ofuser}`;
  const bodydata = {
    chat_user_ids: chat_user_ids,
  };

  try {
    const response = await axios.post(url, bodydata, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + globalThis.token,
      },
    });

    return response.data; // Return response if needed
  } catch (error) {
    console.error("Error sending chat user IDs:", error);
    throw error; // Rethrow the error for further handling if needed
  }
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

let isCalling = false;

// export const onCallPress = async ({
//   call_type,
//   contact_image,
//   contact_name,
//   contact_chat_id,
//   contact_id,
// }) => {
//   var cameraPer = false;
//   var microPer = false;
//   const newCameraPermission = await Camera.requestCameraPermission();
//   if (newCameraPermission !== "granted") {
//     Alert.alert(
//       "Camera Permission not allowed",
//       "Please provide permission from app settings."
//     );
//     return false;
//   } else {
//     cameraPer = true;
//   }
//   const newMicrophonePermission = await Camera.requestMicrophonePermission();
//   if (newMicrophonePermission !== "granted") {
//     Alert.alert(
//       "Microphone permission not provided",
//       "Please provide permission from app settings"
//     );
//     return false;
//   } else {
//     microPer = true;
//   }
//   if (microPer == true && cameraPer == true) {
//     playContinuousSound();
//     if (isCalling) return; // Prevent multiple executions
//     isCalling = true;
//     globalThis.statusCheck = "active";
//     const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
//     let uUID = uuidv4().toUpperCase().toString();
//     globalThis.FriendChatId = contact_chat_id;
//     const toUserIds = Array.isArray(contact_chat_id)
//       ? contact_chat_id
//       : [contact_chat_id];
//     const currentTime = new Date().getTime(); // Get the current timestamp in milliseconds
//     const channel = `calling_${senderData?.userChatId}_${currentTime}_${contact_id}`;
//     let contactNum = JSON.parse(
//       await AsyncStorage.getItem("userContactNumber")
//     );

//     const token = await generateAgoraToken(channel, senderData.sender_id);

//     startCall(
//       call_type,
//       channel,
//       contact_id,
//       contact_image,
//       contact_name,
//       uUID
//     );

//     const agoraData = {
//       contactNum: contactNum,
//       uid: `${senderData.sender_id}`,
//       app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
//       channel_name: channel,
//       is_video: call_type == "video" ? true : false,
//       token: token,
//       sender: `${senderData.sender_id}`,
//       receiver: `${contact_id}`,
//       userStatus: senderData?.userName + " called" + " " + contact_name,
//       receiver_image: contact_image,
//       receiver_name: contact_name,
//       sender_image: senderData?.userImage,
//       sender_name: senderData?.userName,
//       status: "incoming",
//       isVideo: call_type == "video" ? true : false,
//       caller: senderData?.userName,
//       uid_2: `${contact_id}`,
//       uuid: uUID,
//       chatId: senderData?.userChatId,
//     };

//     //  store.dispatch(updateCallerId({ id: `${senderData.sender_id}` }));
//     store.dispatch(
//       updateCallData({
//         isVideo: call_type == "video" ? true : false,
//         guestUserUid: 0,
//       })
//     );

//     setTimeout(() => {
//       store.dispatch(updateDataAgora(agoraData));
//       store.dispatch(updateAgoraData(agoraData));
//       store.dispatch(updateCallDuration(0));
//       store.dispatch(
//         updateCallState({
//           state: "outgoing",
//           isBackground: false,
//           // guestVideoUid:555
//         })
//       );
//     }, 400);

//     setTimeout(() => {
//       socket.emit("callEvents", {
//         toUserId: toUserIds,
//         data: agoraData,
//       });
//       isCalling = false;
//     }, 2000);
//   }
// };

export const onCallPress = async ({
  call_type,
  contact_image,
  contact_name,
  contact_chat_id,
  contact_id,
}) => {
  console.log("contact_id onpress====",contact_id)
  var cameraPer = false;
  var microPer = false;

  const newCameraPermission = await Camera.requestCameraPermission();
  if (newCameraPermission !== "granted") {
    Alert.alert(
      "Camera Permission not allowed",
      "Please provide permission from app settings."
    );
    return false;
  } else {
    cameraPer = true;
  }

  const newMicrophonePermission = await Camera.requestMicrophonePermission();
  if (newMicrophonePermission !== "granted") {
    Alert.alert(
      "Microphone permission not provided",
      "Please provide permission from app settings"
    );
    return false;
  } else {
    microPer = true;
  }

  if (microPer && cameraPer) {
    playContinuousSound();
    if (isCalling) return; // Prevent multiple executions
    isCalling = true;

    globalThis.statusCheck = "active";
    const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
    let uUID = uuidv4().toUpperCase().toString();
    globalThis.FriendChatId = contact_chat_id;

    const toUserIds = Array.isArray(contact_chat_id)
      ? contact_chat_id
      : [contact_chat_id];
    const currentTime = new Date().getTime();
    const channel = `calling_${senderData?.userChatId}_${currentTime}_${contact_id}`;
    let contactNum = JSON.parse(
      await AsyncStorage.getItem("userContactNumber")
    );

    const token = await generateAgoraToken(channel, senderData.sender_id);

    try {
      const call_id = await startCall(
        call_type,
        channel,
        contact_id,
        contact_image,
        contact_name,
        uUID
      ); // Wait for call_id

      console.log("Call ID:", call_id);

      const agoraData = {
        contactNum: contactNum,
        uid: `${senderData.sender_id}`,
        app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
        channel_name: channel,
        is_video: call_type === "video",
        token: token,
        sender: `${senderData.sender_id}`,
        receiver: `${contact_id}`,
        userStatus: senderData?.userName + " called " + contact_name,
        receiver_image: contact_image,
        receiver_name: contact_name,
        sender_image: senderData?.userImage,
        sender_name: senderData?.userName,
        status: "incoming",
        isVideo: call_type === "video",
        caller: senderData?.userName,
        uid_2: `${contact_id}`,
        uuid: uUID,
        chatId: senderData?.userChatId,
        call_id: call_id, // Include call_id here
      };

      store.dispatch(
        updateCallData({
          isVideo: call_type === "video",
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
          })
        );
      }, 400);

      setTimeout(() => {
        socket.emit("callEvents", {
          toUserId: toUserIds,
          data: agoraData,
        });
        isCalling = false;
      }, 2000);
    } catch (error) {
      console.log("Error initiating call:", error);
    }
  }
};

export const onGroupCallPress = async ({
  call_type,
  contact_image,
  contact_name,
  contact_chat_id,
  typeOfCall,
  from = "default",
  members = [],
}) => {


  const response = await sendChatUserIds(contact_chat_id);
  console.log("sendChatUserIds Response:", response?.data?.userIds[0]);

  const namesToShow = members
    .slice(0, 2)
    .map((member) => member.name)
    .join(" & ");
  const additionalCount = members.length > 2 ? members.length - 2 : 0;


  
  // Construct the display text
  const displayText =
    additionalCount > 1
      ? `${namesToShow} + ${additionalCount} others`
      : namesToShow;

  var cameraPer = false;
  var microPer = false;


  const newCameraPermission = await Camera.requestCameraPermission();
  if (newCameraPermission !== "granted") {
    Alert.alert(
      "Camera Permission not allowed",
      "Please provide permission from app settings."
    );
    return false;
  } else {
    cameraPer = true;
  }

  const newMicrophonePermission = await Camera.requestMicrophonePermission();
  if (newMicrophonePermission !== "granted") {
    Alert.alert(
      "Microphone permission not provided",
      "Please provide permission from app settings"
    );
    return false;
  } else {
    microPer = true;
  }
  if (microPer == true && cameraPer == true) {
    playContinuousSound();
    if (isCalling) return; // Prevent multiple executions
    isCalling = true;
    globalThis.statusCheck = "active";
    const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
    let uUID = uuidv4().toUpperCase().toString();
    globalThis.FriendChatId = contact_chat_id;
    const toUserIds = Array.isArray(contact_chat_id)
      ? contact_chat_id
      : [contact_chat_id];
    const currentTime = new Date().getTime(); // Get the current timestamp in milliseconds
    const channel = `calling_${senderData?.userChatId}_${currentTime}_groupCall`;
    let contactNum = JSON.parse(
      await AsyncStorage.getItem("userContactNumber")
    );

    const token = await generateAgoraToken(channel, senderData.sender_id);
    if (from == "isNormalGroupCall") {
      store.dispatch(updateCallerId({ memberGroupCall: true }));
    }else{
      store.dispatch(updateCallerId({ groupCall: true }));
    }

    const otherParticipantsCount = response?.data?.userIds?.length - 1;

    console.log('otherParticipantsCount======',otherParticipantsCount);
    

    // Final display string
    const display =  otherParticipantsCount >= 1 ? `${senderData?.userName} and ${otherParticipantsCount} others` : `${senderData?.userName}`;

    const agoraData = {
      contactNum: contactNum,
      uid: `${senderData.sender_id}`,
      app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
      channel_name: channel,
      is_video: call_type == "video" ? true : false,
      token: token,
      sender: `${senderData.sender_id}`,
      receiver: 48845,
      userStatus: "group call",
      receiver_image:
        from == "isNormalGroupCall"
          ? "https://cdn-icons-png.freepik.com/256/10210/10210774.png?semt=ais_hybrid"
          : contact_image,
      receiver_name: from == "isNormalGroupCall" ? displayText : contact_name,
      sender_image:
        from == "isNormalGroupCall"
          ? "https://cdn-icons-png.freepik.com/256/10210/10210774.png?semt=ais_hybrid"
          : contact_image,
      sender_name: from == "isNormalGroupCall" ? display : contact_name,
      status: "incoming",
      isVideo: call_type == "video" ? true : false,
      caller: senderData?.userName,
      uid_2: 7878,
      uuid: uUID,
      chatId: senderData?.userChatId,
      groupCall: from == "isNormalGroupCall" ? false : true,
      isNormalGroupCall:"isNormalGroupCall" ? true : false,
    };

    initiateCall(
      response?.data?.userIds,
      channel,
      uUID,
      call_type,
      from == "isNormalGroupCall"
        ? "https://cdn-icons-png.freepik.com/256/10210/10210774.png?semt=ais_hybrid"
        : contact_image,
      from == "isNormalGroupCall" ? display : contact_name,
      from
    );

    //  store.dispatch(updateCallerId({ id: `${senderData.sender_id}` }));
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
        toUserId: toUserIds,
        data: agoraData,
      });
      isCalling = false;
    }, 2000);
  }
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
  } else {
    console.log("no sound instance");
  }
};
