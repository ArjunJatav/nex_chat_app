import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
//internal imports
import RNCallKeep from "react-native-callkeep";
import { images } from "../../utils/constants/assets";
import { colors } from "../../utils/constants/colors";
import { fonts } from "../../utils/constants/fonts";
import { STRING_CONSTANTS } from "../../utils/constants/stringConstants";
import { emptyFunction } from "../../utils/globalFunctions";
import { globalStyles } from "../../utils/globalStyles";
import { Agora } from "../agora";
import { StoreType } from "../../types";

import {
  resetVoipReducer,
  updateCallData,
  updateCallState,
} from "../../reducers/VoipReducer";
import {
  resetCallerIdReducer,
  updateCallerId,
} from "../../reducers/callerIDReducers";
import { resetDataReducer } from "../../reducers/dataReducer";

import { TouchableWithoutFeedback } from "react-native";
import { Base_Url, update_call_status } from "../../Constant/Api";
import useAppState from "../../hooks/useAppState";
import withCallTimer from "../../hooks/withCallTimer";
import { socket } from "../../socket";
import { stopSound } from "../../utils/callKitCustom";
import { StopIncomingSound } from "../agora/agoraHandler";
import AudioCallOptions from "./components/AudioCallOptions";
import BackgroundAudioCall from "./components/BackgroundAudioCall";
import BackgroundVideoCall from "./components/BackgroundVideoCall";
import CallDuration from "./components/CallDuration";
import CallProfile from "./components/CallProfile";
import Video from "./components/Video";
import { AppBaseModal } from "../../Components/Calling/AppBaseModal";
import { AppText } from "../../Components/Calling/AppText";
import { AppImageIcon } from "../../Components/Calling/AppImageIcon";
//import CallDetectorManager from 'react-native-call-detection';

////////////////////////////////////////////////////
let allData = {};
interface CallingProps {
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
}
const Calling = ({ startTimer, stopTimer }: CallingProps) => {
  const [visible, setVisible] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const callRef = useRef(null);
  const appStateVisible = useAppState();
  //hooks
  const dispatch = useDispatch();
  // eslint-disable-next-line
  const agoraRef = useRef<any>(null);
  //redux states

  ////////get calling data////////////////////////////////////////////////////////////////////////////

  const callState = useSelector((state: StoreType) => {
    return state?.VoipReducer?.call_state || {};
  });
  const callData = useSelector((state: StoreType) => {
    return state?.VoipReducer?.call_data || {};
  });
  const agoraData = useSelector((state: StoreType) => {
    return state?.VoipReducer?.agora_data || {};
  });


  const userData = { id: `${globalThis.sender_id}` };

  const userPushData = useSelector((state: StoreType) => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    return state.callerIDReducers.userData || {};
  });



  globalThis.callStatus = agoraData?.channel_name;
 
  const data = useSelector((state) => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    return state.dataReducer.data;
  });
  allData = data;

  const hideBusy = () => {
    globalThis.statusCheck = undefined;
    leaveCall();
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCall("missed", allData?.channel_name);
    StopIncomingSound()
    setTimeout(() => {
      dispatch(resetDataReducer());
      dispatch(resetVoipReducer());
      stopSound()
    }, 1000);
  };

  useEffect(()=>{
    if(callState.state === "ended"){
      globalThis.statusCheck = undefined;
    }

  },[callState.state])

  // end call if user is busy on another call
  useEffect(() => {
    if (callState.state == "busy") {
      setTimeout(() => {
        stopSound()
        hideBusy();
        StopIncomingSound()
      }, 5000);
    }
  }, [callState.state]);

  useEffect(() => {
    if (callState.state === "incoming") {
      Vibration.vibrate([1000, 500, 1000], true);
    }
    if (callState.state === "active" || callState.state === "declined") {
      Vibration.cancel();
    }
  }, [callState]);

  useEffect(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (callState.state == "") {
      globalThis.statusCheck = undefined;
    }
  }, [callState.state]);

  useEffect(() => {
    if (callState.state != "outgoing") {
      stopSound();
    }
  }, [callState.state]);

  // end call after 1 minutes if user not picked-up
  useEffect(() => {
    if (callState.state === "outgoing") {
      // Set up the timeout only when callState.state is 'outgoing'
      const timeoutId = setTimeout(() => {
        try {
          endCall();
          stopSound();
          StopIncomingSound()
          globalThis.statusCheck = undefined
        } catch (error) {
          console.error("Error in setTimeout function:", error);
        }
      }, 90000);

      // Clean up the timeout when the component unmounts or when the call state changes
      return () => clearTimeout(timeoutId);
    }
  }, [callState.state]);

  useEffect(() => {
    if (callState.state === "incoming") {
      // Set up the timeout only when callState.state is 'outgoing'
      const timeoutId = setTimeout(() => {
        try {
          globalThis.statusCheck = undefined
          endCall();
          StopIncomingSound();
        } catch (error) {
          console.error("Error in setTimeout function:", error);
        }
      }, 90000);

      // Clean up the timeout when the component unmounts or when the call state changes
      return () => clearTimeout(timeoutId);
    }
  }, [callState.state]);

  const startCall = async (type: string, channel: string) => {

    const url: string = Base_Url + update_call_status;
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
          console.log('response===========',response.data);
          
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const addVideo = () => {
    const agoraData = {
      uid: "44",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      app_id: allData?.app_id,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: allData?.channel_name,
      is_video: true,
      jwt: "",
      token: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver: allData?.receiver,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender: allData?.sender,
      userStatus: " ",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_image: allData?.receiver_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_name: allData?.receiver_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_image: allData?.sender_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_name: allData?.sender_name,
      token_2: "",
      isVideo: true,
      image:
        "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      caller: allData?.sender_name,
      uid_2: "84",
      roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
      uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      status: "active",
      request: "request",
  
      from: globalThis.userChatId,
    };
 
    socket.emit("callEvents", {
      toUserId: globalThis.FriendChatId,
      data: agoraData,
    });
   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCall("request", allData?.channel_name);
  };

  const answerCall = () => {
    Vibration.cancel();
    StopIncomingSound();
    globalThis.statusCheck = "active";
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    globalThis.activeChannel = allData?.channel_name,
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    globalThis.callStatus = allData?.channel_name;
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    dispatch(updateCallerId({ fromPush: false }));
    dispatch(updateCallState({ state: "active" }));
   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    dispatch(updateCallerId({ id: `${allData?.sender}`, callUUID: "" }));
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    globalThis.FriendChatId = allData?.chatId;
    const agoraData = {
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: allData?.channel_name,
      status: "answer",
    };

    socket.emit("callEvents", {
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      toUserId: allData?.chatId,
      data: agoraData,
    });
    joinVideoCall();
   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCall("active", allData?.channel_name);
    setTimeout(() => {
      StopIncomingSound();
    }, 500);
  };

  const endCall = () => {
      stopSound()
      StopIncomingSound();

      if (callState.state === "outgoing") {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        startCall("missed", allData?.channel_name);
      } else {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        startCall("ended", allData?.channel_name);
      }
      dispatch(updateCallState({ state: "ended" }));
      globalThis.statusCheck = undefined;
      globalThis.callStatus = undefined;
      globalThis.activeChannel = undefined
      RNCallKeep.endAllCalls();

      globalThis.isCallIntiate = false;
      globalThis.callStateUpdate = true;
      const agoraData = {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        channel_name: allData?.channel_name,
        status: "ended",
      };

      leaveCall();
      socket.emit("callEvents", {
        toUserId: globalThis.FriendChatId,
        data: agoraData,
      });

      setTimeout(() => {        
        dispatch(resetDataReducer());
        dispatch(resetVoipReducer());
        dispatch(resetCallerIdReducer());
        stopSound()
      }, 700);

      globalThis.wayOfCall = undefined;

      setTimeout(() => {
        RNCallKeep.removeEventListener("endCall");
        stopSound()
      }, 1000);
  };

  const rejectCall = () => {
    globalThis.statusCheck = undefined;
    globalThis.callStatus = undefined;
    globalThis.activeChannel = undefined
    StopIncomingSound();
    RNCallKeep.endCall("b8236c1b-9f68-4b6e-a8ce-803aec634c98");
    RNCallKeep.endAllCalls();
    globalThis.isCallIntiate = false;
    globalThis.callStateUpdate = true;
    const agoraData = {
      uid: "44",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      app_id: allData?.app_id,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: allData?.channel_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      is_video: allData?.is_video,
      jwt: "",
      token: "",
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver: allData?.receiver,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender: allData?.sender,
      userStatus: "",
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_image: allData?.receiver_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_name: allData.receiver_name,
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_image: allData?.sender_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_name: allData?.sender_name,
      token_2: "",
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      isVideo: allData?.isVideo,
      image:
        "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      caller: allData?.sender_name,
      uid_2: "84",
      roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
      uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      status: "declined",
    };

    socket.emit("callEvents", {
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      toUserId: allData?.chatId,
      data: agoraData,
    });

   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCall("declined", allData?.channel_name);

    RNCallKeep.endCall("b8236c1b-9f68-4b6e-a8ce-803aec634c98");
    agoraRef?.current?.turnOffCamera();
    agoraRef?.current?.muteAudio();

    setTimeout(() => {
      dispatch(resetDataReducer());
      dispatch(resetVoipReducer());
      dispatch(resetCallerIdReducer());
      globalThis.statusCheck = undefined;
      globalThis.callStatus = undefined;
      globalThis.activeChannel = undefined
    }, 500);
  };
  const minimizeCall = () => {
    dispatch(updateCallState({ isBackground: true }));
  };

  const getDesc = () => {
    if (callState.state === "incoming")
      return STRING_CONSTANTS.incoming_call(
        agoraData.is_video ? "video" : "audio"
      );
    else if (callState.state === "outgoing") return STRING_CONSTANTS.calling;
    else if (callState.state === "active") return STRING_CONSTANTS.calling;
    else if (callState.state === "busy") return STRING_CONSTANTS.userBusy;
    else if (callState.state === "ended") return STRING_CONSTANTS.call_ended;
    else if (callState.state === "declined") return STRING_CONSTANTS.call_declined;
  };
  // if call is video call enable spaeaker by default
  useEffect(() => {
    if (callState.state == "active" && Platform.OS == "ios") {
      joinVideoCall();
    }

    if (callState.state === "active" && agoraData.is_video) {
      setTimeout(() => {
        agoraRef?.current?.changeAudioRoute(true);
        setIsSpeakerOn(true);
      }, 2000);
    }
  }, [callState]);

  // if app is killed end the call
  useEffect(() => {
    if (appStateVisible === "inactive" && callState.state === "outgoing") {
      endCall();
    }
  }, [appStateVisible]);

  const Footer = () => {
    if (callState.state === "incoming")
      return (
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 80,
            justifyContent: "space-between",
          }}
        >
          <AppImageIcon
            onPress={rejectCall}
            wrapperStyle={styles.endCall}
            image={images.reject_call}
          />
          <AppImageIcon
            onPress={answerCall}
            wrapperStyle={styles.endCall}
            image={images.accept_call}
          />
        </View>
      );
    else if (callState.state === "outgoing")
      return (
        <AppImageIcon
          onPress={endCall}
          wrapperStyle={styles.endCall}
          image={images.reject_call}
        />
      );
    else if (callState.state === "busy")
      return (
        <AppImageIcon
          onPress={hideBusy}
          wrapperStyle={styles.endCall}
          image={images.reject_call}
        />
      );
    else if (callState.state === "active")
      return (
        <View>
          <AudioCallOptions
            toggleMuteAudio={() => setIsMute(!isMute)}
            toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
            isMuted={isMute}
            pressChat={() => addVideo()}
            isSpeakerOn={isSpeakerOn}
          />
          <AppImageIcon
            onPress={endCall}
            wrapperStyle={styles.endCall}
            image={images.end_call}
          />
        </View>
      );
    else if (callState.state === "ended")
      return (
        <AppImageIcon
          onPress={() => closeCallScreen()}
          wrapperStyle={styles.endCall}
          image={images.reject_call}
        />
      );
    else if (callState.state === "declined")
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 80,
          }}
        ></View>
      );
    else {
      return (
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 80,
            justifyContent: "space-between",
          }}
        >
          <AppImageIcon
            onPress={rejectCall}
            wrapperStyle={styles.endCall}
            image={images.reject_call}
          />
          <AppImageIcon
            onPress={answerCall}
            wrapperStyle={styles.endCall}
            image={images.accept_call}
          />
        </View>
      );
    }
  };



  useEffect(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (callState.state === '') {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [callState]);




  const joinVideoCall = () => {
    agoraRef?.current?.joinCall();
  };
  const muteAudio = () => {
    agoraRef?.current?.muteAudio();
  };
  const unmuteAudio = () => {
    agoraRef?.current?.unMuteAudio();
  };

  const closeCallScreen = () => {
    dispatch(updateCallState({ state: "" }));
    dispatch(updateCallData({ isCallDisconnected: false }));
    stopTimer();
    dispatch(resetDataReducer());
    dispatch(resetVoipReducer());
    dispatch(resetCallerIdReducer());
  };

  useEffect(() => {
    if (isMute) {
      muteAudio();
    } else {
      unmuteAudio();
    }
  }, [isMute]);

  useEffect(() => {
    agoraRef?.current?.changeAudioRoute(isSpeakerOn);
  }, [isSpeakerOn]);

  useEffect(() => {
    if (isCameraOn) {
      agoraRef?.current?.turnOffCamera();
    } else {
      agoraRef?.current?.turnOnCamera();
    }
  }, [isCameraOn]);

  const leaveCall = () => {
    agoraRef?.current?.leaveCall();
    stopTimer();
  };



  return (
    <>
      {callState.isBackground ? (
        agoraData?.is_video ? (
          <BackgroundVideoCall
            endCall={endCall}
            toggleMuteAudio={() => setIsMute(!isMute)}
            toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
            isMuted={isMute}
            isSpeakerOn={isSpeakerOn}
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            callDurationRef={callRef}
            isCameraOn={isCameraOn}
          />
        ) : (
          <BackgroundAudioCall
            endCall={endCall}
            toggleMuteAudio={() => setIsMute(!isMute)}
            toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
            isMuted={isMute}
            isSpeakerOn={isSpeakerOn}
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            callDurationRef={callRef}
          />
        )
      ) : (
        <>
          {callState.state !== "incoming" ? (
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            <AppBaseModal
              visible={visible}
              onDismiss={emptyFunction}
              backgroundOverlay={{ justifyContent: "flex-end" }}
              animationType="fade"
            >
              <ImageBackground
                style={globalStyles.wh100}
                source={images.call_bg}
              >
                {!agoraData?.is_video && (
                  <View style={styles.upperArea}>
                    <AppImageIcon
                      onPress={minimizeCall}
                      wrapperStyle={styles.backBtn}
                      image={
                        callState.state === "active" ? images.back_arrow : null
                      }
                      iconStyle={{ tintColor: colors.white }}
                    />
                  </View>
                )}

                {(callState?.state !== "active" ||
                  !agoraData?.is_video ||
                  callData?.isCallDisconnected) && (
                  <View style={{ flex: 6, alignItems: "center" }}>
                    {/* Sized Box */}
                    {agoraData?.is_video ? (
                      <View style={{ height: hp(20) }} />
                    ) : null}

                    <AppText style={styles.name}>
                      {agoraData?.sender == userData?.id
                        ? agoraData?.receiver_name
                        : agoraData?.sender_name}
                    </AppText>

                    {callState?.state === "active" ? (
                      <>
                        <CallDuration />
                      </>
                    ) : (
                      <>
                        <AppText style={styles.duration}>{getDesc()}</AppText>
                        <AppText
                          style={[
                            styles.duration,
                            { paddingHorizontal: 10, marginBottom: 0 },
                          ]}
                        >
                          Good internet connection is highly recommended since
                          bad internet connection will result in a poor calling
                          experience.
                        </AppText>
                      </>
                    )}
                    <CallProfile
                      showPulse={
                        callState.state === "outgoing" ||
                        callState.state === "active"
                      }
                      profileImage={
                        agoraData?.sender == userData?.id
                          ? agoraData?.receiver_image
                          : agoraData?.sender_image
                      }
                    />
                  </View>
                )}
                {callState?.state === "active" &&
                  agoraData?.is_video &&
                  !callData?.isCallDisconnected && (
                    <Video
                      endCall={endCall}
                      toggleMuteAudio={() => setIsMute(!isMute)}
                      toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
                      switchCamera={() => setIsCameraOn(!isCameraOn)}
                      flipCamera={() => agoraRef?.current?.flipCamera()}
                      isCameraOn={isCameraOn}
                      isMuted={isMute}
                      isSpeakerOn={isSpeakerOn}
                      callDurationRef={callRef}
                      minimizeCall={minimizeCall} sessionId={""} token={""} isJoined={false}                    />
                  )}
                {(callState?.state !== "active" ||
                  !agoraData?.is_video ||
                  callData?.isCallDisconnected) && (
                  <View style={{ flex: 3.5 }}>
                    <Footer />
                  </View>
                )}
              </ImageBackground>
            </AppBaseModal>
          ) : (
            <TouchableWithoutFeedback
              onPress={() => {
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                dispatch(updateCallerId({ fullView: true }));
              }}
            >
              {userPushData.fullView == false ? (
                <View
                  style={{
                    width: "98%",
                    backgroundColor: "#fff",
                    position: "absolute",
                    borderRadius: 15,
                    zIndex: 20,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: -2, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    top: 30,
                    right: "1%",
                    left: "1%",
                    paddingVertical: 10,
                    paddingBottom: 15,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          marginHorizontal: 10,
                          marginTop: 10,
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#000",
                        }}
                      >
                        {agoraData?.sender_name}
                      </Text>
                      <Text
                        style={{
                          marginHorizontal: 10,
                          color: "#000",
                          fontSize: 14,
                        }}
                      >
                        Incoming call via Tokee
                      </Text>
                    </View>
                    <Image
                      source={{ uri: agoraData?.sender_image }}
                      style={{
                        height: 50,
                        width: 50,
                        // alignSelf: "center",
                        resizeMode: "contain",
                        margin: 10,
                        borderRadius: 50,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      // width: "95%",
                      justifyContent: "space-between",
                      alignItems: "center",

                      alignSelf: "center",
                    }}
                  >
                    <TouchableWithoutFeedback onPress={() => rejectCall()}>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#A01517",
                          height: 50,
                          width: "45%",
                          marginHorizontal: 10,
                          borderWidth: 1,
                          borderColor: "transparent",
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          DECLINE
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={answerCall}>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#1C5B23",
                          height: 50,
                          width: "45%",
                          marginHorizontal: 10,
                          borderWidth: 1,
                          borderColor: "transparent",
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          ANSWER
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              ) : (
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                <AppBaseModal
                  visible={visible}
                  onDismiss={emptyFunction}
                  backgroundOverlay={{ justifyContent: "flex-end" }}
                  animationType="fade"
                >
                  <ImageBackground
                    style={globalStyles.wh100}
                    source={images.call_bg}
                  >
                    {!agoraData?.is_video && (
                      <View style={styles.upperArea}>
                        <AppImageIcon
                          onPress={minimizeCall}
                          wrapperStyle={styles.backBtn}
                          image={
                            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            callState.state === "active"
                              ? images.back_arrow
                              : null
                          }
                          iconStyle={{ tintColor: colors.white }}
                        />
                      </View>
                    )}

                    {(
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      callState?.state !== "active" ||
                      !agoraData?.is_video ||
                      callData?.isCallDisconnected) && (
                      <View style={{ flex: 6, alignItems: "center" }}>
                        {/* Sized Box */}
                        {agoraData?.is_video ? (
                          <View style={{ height: hp(20) }} />
                        ) : null}

                        <AppText style={styles.name}>
                          {agoraData?.sender == userData?.id
                            ? agoraData?.receiver_name
                            : agoraData?.sender_name}
                        </AppText>

                        {
                          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        callState?.state === "active" ? (
                          <>
                            <CallDuration />
                          </>
                        ) : (
                          <>
                            <AppText style={styles.duration}>
                              {getDesc()}
                            </AppText>
                            <AppText
                              style={[
                                styles.duration,
                                { paddingHorizontal: 10, marginBottom: 0 },
                              ]}
                            >
                              Good internet connection is highly recommended
                              since bad internet connection will result in a
                              poor calling experience.
                            </AppText>
                          </>
                        )}
                        <CallProfile
                          showPulse={
                            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            callState.state === "outgoing" ||
                            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            callState.state === "active"
                          }
                          profileImage={
                            agoraData?.sender == userData?.id
                              ? agoraData?.receiver_image
                              : agoraData?.sender_image
                          }
                        />
                      </View>
                    )}
                    {
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    callState?.state === "active" &&
                      agoraData?.is_video &&
                      !callData?.isCallDisconnected && (
                        <Video
                                endCall={endCall}
                                toggleMuteAudio={() => setIsMute(!isMute)}
                                toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
                                switchCamera={() => setIsCameraOn(!isCameraOn)}
                                flipCamera={() => agoraRef?.current?.flipCamera()}
                                isCameraOn={isCameraOn}
                                isMuted={isMute}
                                isSpeakerOn={isSpeakerOn}
                                callDurationRef={callRef}
                                minimizeCall={minimizeCall} sessionId={""} token={""} isJoined={false}                        />
                      )}
                    {(
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      callState?.state !== "active" ||
                      !agoraData?.is_video ||
                      callData?.isCallDisconnected) && (
                      <View style={{ flex: 3.5 }}>
                        <Footer />
                      </View>
                    )}
                  </ImageBackground>
                </AppBaseModal>
              )}
            </TouchableWithoutFeedback>
          )}
        </>
      )}

      <Agora
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        startTimer={startTimer}
        stopTimer={stopTimer}
        isVideoCall={agoraData?.is_video}
        ref={agoraRef}
      />
    </>
  );
};

const styles = StyleSheet.create({
  upperArea: {
    flex: 2.5,
    justifyContent: "center",
    paddingLeft: 28,
  },
  backBtn: {
    height: 48,
    width: 48,
    backgroundColor: colors.black,
    borderRadius: 24,
    marginBottom: hp(1),
  },
  name: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
    fontFamily: fonts.primary_bold_font,
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.whiteOpacity(0.56),
    fontFamily: fonts.primary_semi_bold_font,
    marginBottom: 44,
  },
  endCall: {
    height: 56,
    width: 56,
    alignSelf: "center",
    marginTop: 68,
  },
});

export default withCallTimer(Calling);
