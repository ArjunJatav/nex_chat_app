import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import {  PermissionsAndroid, Platform, Vibration } from "react-native";
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
} from "react-native-agora";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCallData,
  updateCallState,
} from "../../reducers/VoipReducer";

import { stopSound } from "../../utils/callKitCustom";
import { StopIncomingSound } from "./agoraHandler";

export const Agora = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();

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
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user

  const appId = agoraData?.app_id;
  const channelName = agoraData?.channel_name;
  const token = agoraData?.token;

  useEffect(() => {
    if (callState.state !== "outgoing") {
      stopSound();
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
    guestUid: remoteUid,
  }));

  useEffect(() => {
    setupVideoSDKEngine();
  }, [isJoined, agoraData, JSON.stringify(agoraData), callState.state === "outgoing", callState.state === "active"]);

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
    try {
      if (Platform.OS === "android") {
        await getPermission();
      }
      const agoraEngine = createAgoraRtcEngine();
      agoraEngineRef.current = agoraEngine;

      agoraEngine.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });

      agoraEngine.setVideoEncoderConfiguration({
        dimensions: { width: 1920, height: 1080 }, // Full HD resolution
        frameRate: 30,
        bitrate: 4500,
      });

      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          setIsJoined(true);
          updateCallInitializedStatus(true);
          if (agoraData?.receiver === userData?.id) {
            props?.startTimer();
          }
        },
        onUserJoined: (_connection, Uid) => {
          setRemoteUid(Uid);
          updateRemoteId(Uid);
          if (agoraData?.sender === userData?.id) {
            dispatch(updateCallState({ state: "active" }));
          }
          props?.startTimer();
        },
        onUserOffline: (_connection) => {
          setRemoteUid(0);
          updateRemoteId(0);
          updateCallDisconnectedStatus(true);
          dispatch(updateCallState({ state: "ended" }));
          props?.stopTimer();
          leave();
        },
        onUserMuteVideo: (_connection, remoteUid, muted) => {
          if (muted) {
            updateRemoteId(0);
          } else {
            updateRemoteId(remoteUid);
          }
        },
        onConnectionLost: () => {
          setRemoteUid(0);
          updateRemoteId(0);
          updateCallDisconnectedStatus(true);
          dispatch(updateCallState({ state: "ended" }));
          props?.stopTimer();
          leave();
        },
      });

      if (props?.isVideoCall) {
        agoraEngine.enableVideo();
      }
      agoraEngine.enableLocalVideo(true);
      agoraEngine.muteLocalAudioStream(false);

      if (callState?.state === "active" || callState?.state === "outgoing") {
       await join();
      } else if (callState?.state === "declined") {
       await handleDeclineCall();
      }
    } catch (e) {
      console.error("Error setting up Agora SDK:", e);
    }
  };

  const join = async () => {
    const newUid =
      agoraData?.sender === userData?.id ? agoraData?.uid : agoraData?.uid_2;

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
      globalThis.statusCheck = undefined;
      globalThis.callStatus = undefined;
      agoraEngineRef.current.leaveChannel();
      dispatch(updateCallState({ state: "ended" }));
      setRemoteUid(0);
      updateRemoteId(0);
      setIsJoined(false);
      updateCallInitializedStatus(false);
      agoraEngineRef.current.removeAllListeners();
      agoraEngineRef.current = null;
      stopSound();
      StopIncomingSound()
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

  const updateRemoteId = (uid) => {
    dispatch(
      updateCallData({
        guestVideoUid: uid,
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
        await agoraEngineRef.current.setDefaultAudioRouteToSpeakerphone(newValue);
        await agoraEngineRef.current.setEnableSpeakerphone(newValue);
        await agoraEngineRef.current.setAudioRouteToSpeakerphone(newValue);
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