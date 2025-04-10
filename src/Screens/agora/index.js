import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { PermissionsAndroid, Platform, Vibration } from "react-native";
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
} from "react-native-agora";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAgoraData,
  updateCallData,
  updateCallState,
} from "../../reducers/VoipReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { stopSound } from "../../utils/callKitCustom";
import { startCallStatus, StopIncomingSound } from "./agoraHandler";
import {
  Base_Url,
  Base_Url2,
  get_by_id,
  update_call_status,
} from "../../Constant/Api";
import axios from "axios";
import {
  addProfile,
  removeProfile,
  updateCameraMuteState,
  updateMuteState,
} from "../../reducers/ProfileCallingReducer";
import { updateDataAgora } from "../../reducers/dataReducer";
import RNCallKeep from "react-native-callkeep";
export const Agora = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [newRetry, setRetry] = useState(false);

  const agoraData = useSelector(
    (state) => state?.VoipReducer?.agora_data || null
  );

  const userData = useSelector((state) => state.callerIDReducers.userData);

  const callState = useSelector(
    (state) => state?.VoipReducer?.call_state || null
  );

  const callData = useSelector((state) => state?.VoipReducer?.call_data || {});
  const agoraEngineRef = useRef(null); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUids, setRemoteUids] = useState([]); // Store remote user UIDs
  const [allRemoteUids, setAllRemoteUids] = useState([]); // Store remote user UIDs
  const [lastProfile, setLastProfile] = useState(null);
  const profiles = useSelector((state) => state?.profileSlice?.profiles || []);

  const checkGroupCall = useSelector((state) => {
    return state?.callerIDReducers?.userData?.groupCall;
  });

  const appId = agoraData?.app_id;
  const channelName = agoraData?.channel_name;
  const token = agoraData?.token;
  globalThis.chennalSittu = agoraData?.channel_name;

  useEffect(() => {
    if (profiles.length === 1) {
      // Update lastProfile when profiles contains exactly one object
      setLastProfile(profiles[0]);
    } else if (profiles.length === 0 && lastProfile === null) {
      // Optionally handle the case where profiles and lastProfile are both empty
      console.log("Profiles is empty, and no previous profile exists");
    }
  }, [profiles]);

  useEffect(() => {
    if (callState.state !== "outgoing") {
      stopSound();
    }
  }, [callState.state]);

  useEffect(() => {
    if (callState.state == "ended" || callState.state == "") {
      leave();
    }
  }, [callState.state]);

  useEffect(() => {
    if (callData.isCallInitalized && callState.state === "declined") {
      leave();
    }
    if (callState.state === "incoming") {
      Vibration.vibrate([1000, 500, 1000], true);
    }
    if (
      callState.state === "active" ||
      callState.state === "declined" ||
      callState.state === "ended"
    ) {
      Vibration.cancel();
    }
  }, [callState, callData]);

  useEffect(() => {
    updateCallUi();
  }, [remoteUids]);

  const updateCallUi = async () => {
    console.log(
      "allRemoteUids.length====================================",
      allRemoteUids.length
    );

    if (
      remoteUids.length == 1 &&
      allRemoteUids.length > 1 &&
      checkGroupCall != true
    ) {
      const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
      const agoraData = {
        sender: `${senderData.sender_id}`,
        receiver_image: lastProfile?.profile_image,
        receiver_name: lastProfile?.first_name,
      };

      dispatch(updateAgoraData(agoraData));
    }
  };

  const getProfileApi = async (UserId) => {
    console.log("UserId====================================", UserId);

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    const data = {
      user_id: UserId,
    };

    try {
      const response = await axios.post(Base_Url + get_by_id, data, {
        headers,
      });
      console.log("API Response:", response.data.data.user);
      let id = response.data.data.user.id;
      let first_name = response.data.data.user.first_name;
      let profile_image = response.data.data.user.profile_image;
      let chat_user_id = response.data.data.user.chat_user_id;
      dispatch(
        addProfile({
          id, // Unique ID
          first_name, // First name
          profile_image, // Profile image URL
          chat_user_id,
        })
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
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
        .then((response) => {
          console.log("response agora index===========", response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useImperativeHandle(ref, () => ({
    joinCall: () => {
      join();
    },
    leaveCall: () => {
      leave();
    },
    muteAudio: () => {
      muteAudio();
    },
    unMuteAudio: () => {
      unMuteAudio();
    },
    turnOnCamera: () => {
      turnOnCamera();
    },
    turnOffCamera: () => {
      turnOffCamera();
    },
    flipCamera: () => {
      flipCamera();
    },
    changeAudioRoute: (value) => {
      changeAudioRoute(value);
    },
    isJoinedChannel: isJoined,
    guestUids: remoteUids,
  }));

  useEffect(() => {
    setupVideoSDKEngine();
  }, [
    isJoined,
    agoraData,
    JSON.stringify(agoraData),
    callState.state === "outgoing",
    callState.state === "active",
    newRetry,
  ]);

  const handleDeclineCall = async () => {
    turnOffCamera();
    muteAudio();
    await join();
  };

  useEffect(() => {
    if (props?.isVideoCall) {
      agoraEngineRef?.current?.enableVideo();
    } else {
      agoraEngineRef?.current?.disableVideo();
    }
  }, [props?.isVideoCall]);

  const setupVideoSDKEngine = async () => {
    let retryCount = 0; // Track retry attempts
    const maxRetries = 3; // Maximum number of retries
    const retryDelay = 3000; // Retry delay in milliseconds

    const retryJoin = async () => {
      setRetry(!newRetry);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying to join channel... Attempt ${retryCount}`);
        await join();
      } else {
        console.error(
          "Maximum retry attempts reached. Could not join the channel."
        );
      }
    };

    try {
      if (Platform.OS === "android") {
        // await getPermission();
      }

      const agoraEngine = createAgoraRtcEngine();
      agoraEngineRef.current = agoraEngine;

      agoraEngine.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });

      agoraEngine.setVideoEncoderConfiguration({
        dimensions: { width: 1280, height: 720 }, // 720p HD resolution
        frameRate: 30, // Higher frame rate for smoother video
        bitrate: 2000, // Increased bitrate (2000 kbps) for better quality
        orientationMode: 0, // 0: Adaptive, 1: Fixed landscape, 2: Fixed portrait
      });

      // agoraEngine.setVideoEncoderConfiguration({
      //   dimensions: { width: 640, height: 360 }, // Lower resolution (360p) for group calls
      //   frameRate: 15, // Lower frame rate for reduced bandwidth usage
      //   bitrate: 500, // Reduced bitrate (500 kbps) for efficient group call performance
      //   orientationMode: 0, // 0: Adaptive, 1: Fixed landscape, 2: Fixed portrait
      // });

      // agoraEngine.setVideoEncoderConfiguration({
      //   dimensions: { width: 1920, height: 1080 }, // Full HD resolution
      //   frameRate: 30, // Frame rate (30 FPS is standard for smooth video)
      //   bitrate: 1500, // Target bitrate in kbps (1500 kbps = 1.5 Mbps)
      //   orientationMode: 0,
      // });

      //agoraEngine.setVideoEncoderConfiguration(640, 360, 15, 400);

      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: (channel, Uid) => {
          console.log("User successfully joined the channel>>>>>>>>>>",channel.channelId);
          setIsJoined(true);
          retryCount = 0; // Reset retry count on success
          updateCallInitializedStatus(true);

          if (agoraData?.receiver == userData?.id) {
            console.log("Receiver joined the channel");
            props?.startTimer();
          }
         
          if(agoraData?.sender != globalThis.sender_id){
            startCallStatus("answer", channel.channelId);
          }
        },
        onUserJoined: (_connection, Uid) => {
          getProfileApi(Uid);
          console.log("Remote user joined with Uid:", Uid);
          setRemoteUids((prevUids) => {
            const updatedUids = [...new Set([...prevUids, Uid])];
            updateRemoteIds(updatedUids); // Dispatch updated UIDs
            return updatedUids;
          });
          setAllRemoteUids((prevUids) => {
            const updatedUids = [...new Set([...prevUids, Uid])];
            return updatedUids;
          });

          if (agoraData?.sender == userData?.id) {
            console.log("Remote user joined, updating call state to active");
            dispatch(updateCallState({ state: "active" }));
          }

          if (agoraData?.receiver == userData?.id) {
            console.log("Receiver sees all joined users");
          }
          props?.startTimer();
        },
        onUserOffline: (_connection, Uid) => {
          console.log(
            "Remote user went offline with Uid:_connection",
            _connection
          );
          dispatch(removeProfile(Uid));
          setRemoteUids((prevUids) => {
            const updatedUids = prevUids.filter((id) => id !== Uid);
            updateRemoteIds(updatedUids);
            if (updatedUids.length === 0) {
              console.log(
                "No remote users remain. Ending the call...",
                _connection.channelId
              );
              startCallStatus("ended", _connection.channelId);
              dispatch(updateCallState({ state: "ended" }));

              updateCallDisconnectedStatus(true);
              RNCallKeep.endAllCalls();
              props?.stopTimer();
              leave();
              RNCallKeep.endAllCalls();
              RNCallKeep.removeEventListener("endCall");
            }

            return updatedUids;
          });

          // updateCallDisconnectedStatus(true);
          // dispatch(updateCallState({ state: "ended" }));
          // props?.stopTimer();
          // leave();
        },

        onUserMuteVideo: (connection, remoteUid, muted) => {
          console.log(`Remote user ${remoteUid} video is ${muted}`);
          dispatch(updateCameraMuteState({ id: remoteUid, isCameraOn: muted }));
      
          // setRemoteUids((prevUids) =>
          //   prevUids.map((uid) =>
          //     uid === remoteUid ? { ...uid, videoMuted: muted } : uid
          //   )
          // );
        },

        onUserMuteAudio: (data, uid, state) => {
          dispatch(updateMuteState({ id: uid, mute: state }));
        },
      });

      if (props?.isVideoCall) {
        agoraEngine.enableVideo();
      }
      agoraEngine.enableLocalVideo(true);
      agoraEngine.muteLocalAudioStream(false);

      if (callState?.state === "active" || callState?.state === "outgoing") {
        console.log("Attempting to join channel...");
        await join();

        // Retry if no success within a time frame
        setTimeout(() => {
          if (!isJoined) {
            console.log("User has not joined, retrying...");
            retryJoin(); // Retry if join hasn't been successful
          }
        }, retryDelay);
      } else if (callState?.state === "declined") {
        console.log("Call was declined, not joining");
        await handleDeclineCall();
      } else {
        console.log("Call state does not require joining the channel");
      }
    } catch (e) {
      console.error("Error setting up Agora SDK:", e);
    }
  };

  const join = async () => {
    const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
    const newUid = senderData?.sender_id;

    try {
      agoraEngineRef.current.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication
      );
      agoraEngineRef.current.startPreview();
      agoraEngineRef.current.joinChannel(token, channelName, parseInt(newUid), {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.error("Error joining channel:", e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current.leaveChannel();
      dispatch(updateCallState({ state: "ended" }));
      setRemoteUids([]); // Clear remote UIDs on leave
      updateRemoteIds([]);
      setIsJoined(false);
      updateCallInitializedStatus(false);
      agoraEngineRef.current.removeAllListeners();
      agoraEngineRef.current = null;
      stopSound();
      StopIncomingSound();
      props?.stopTimer();
    } catch (e) {
      console.error("Error leaving channel:", e);
    }
  };

  const muteAudio = () => {
    try {
      agoraEngineRef.current.muteLocalAudioStream(true);
    } catch (e) {
      console.error("Error muting audio:", e);
    }
  };

  const unMuteAudio = () => {
    try {
      agoraEngineRef.current.muteLocalAudioStream(false);
    } catch (e) {
      console.error("Error unmuting audio:", e);
    }
  };

  const turnOnCamera = () => {
    try {
      agoraEngineRef.current.enableLocalVideo(true);
    } catch (e) {
      console.error("Error turning on camera:", e);
    }
  };

  const turnOffCamera = () => {
    try {
      agoraEngineRef.current.enableLocalVideo(false);
    } catch (e) {
      console.error("Error turning off camera:", e);
    }
  };

  const flipCamera = () => {
    try {
      agoraEngineRef.current.switchCamera();
    } catch (e) {
      console.error("Error flipping camera:", e);
    }
  };

  const updateRemoteIds = (uids) => {
    dispatch(
      updateCallData({
        guestVideoUids: uids,
      })
    );
  };

  const updateCallInitializedStatus = (status) => {
    dispatch(
      updateCallData({
        isCallInitalized: status,
      })
    );
  };

  const updateCallDisconnectedStatus = () => {
    dispatch(
      updateCallData({
        isCallDisconnected: true,
      })
    );
    dispatch(updateCallState({ isBackground: false }));
  };

  const changeAudioRoute = async (newValue) => {
    try {
      if (Platform.OS === "ios") {
        await agoraEngineRef.current.setEnableSpeakerphone(newValue);
      } else {
        await agoraEngineRef?.current?.setDefaultAudioRouteToSpeakerphone(
          newValue
        );
        await agoraEngineRef?.current?.setEnableSpeakerphone(newValue);
        await agoraEngineRef?.current?.setAudioRouteToSpeakerphone(newValue);
      }
    } catch (e) {
      console.error("Error changing audio route:", e);
    }
  };

  return null;
});

const getPermission = async () => {
  if (Platform.OS === "android") {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
  }
};

export default Agora;
