import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { dimensions } from "../../../utils/globalFunctions";
import { globalStyles } from "../../../utils/globalStyles";

import { RtcSurfaceView, RtcTextureView } from "react-native-agora";
import { useSelector } from "react-redux";

import { StoreType } from "../../../types";
import { stopSound } from "../../../utils/callKitCustom";
import { images } from "../../../utils/constants/assets";
import { colors } from "../../../utils/constants/colors";
import CallBar from "./CallBar";
import CallProfile from "./CallProfile";
import { AppImageIcon } from "../../../Components/Calling/AppImageIcon";
interface VideoProps {
  sessionId: string;
  token: string;
  isJoined: boolean;
  endCall: () => void;
  toggleMuteAudio: () => void;
  toggleSpeaker: () => void;
  switchCamera: () => void;
  isCameraOn: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  // eslint-disable-next-line
  callDurationRef?: any;
  flipCamera?: () => void;
  minimizeCall: () => void;
}

const Video = (props: VideoProps) => {

  const guestUserUid = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_data?.guestVideoUid
  );
  const isCallInitialized = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_data?.isCallInitalized
  );
  const callState = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_state || {}
  );
  const agoraData = useSelector(
    (state: StoreType) => state?.VoipReducer?.agora_data || null
  );

  const [isVideoFlipped, setIsVideoFlipped] = useState(false);
  const userData = useSelector(
    (state: StoreType) => state?.UserReducer?.user || null
  );



  useEffect(() => {
    if (callState.state != "outgoing") {
      stopSound();
    }
  }, [callState.state]);


  const flipCamera = () => {
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    props?.flipCamera();
  };

  const toggleUserVid = () => {
    setIsVideoFlipped(!isVideoFlipped);
  };





  return (
    <View style={[globalStyles.flex1]}>
      <AppImageIcon
        onPress={props?.minimizeCall}
        wrapperStyle={styles.backBtn}
        image={images.back_arrow}
        iconStyle={{ tintColor: colors.white }}
      />
      <View
        style={{
          width: dimensions().screen_width,
          height: dimensions().screen_height,
        }}
      >
        {!isVideoFlipped ? (
          guestUserUid !== 0 ? (
            <RtcSurfaceView
              key={"444"}
              canvas={{ uid: guestUserUid }}
              style={{
                width: dimensions().screen_width,
                height: dimensions().screen_height,
              }}
            />
          ) : (
            <View
              style={{
                width: dimensions().screen_width,
                height: dimensions().screen_height,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CallProfile
                showPulse={true}
                profileImage={
                  Number(agoraData?.sender) === Number(userData?.id)
                    ? agoraData?.receiver_image
                    : agoraData?.sender_image
                }
              />
            </View>
          )
        ) : (
          isCallInitialized &&
          (props?.isCameraOn ? (
            <View
              style={{
                width: dimensions().screen_width,
                height: dimensions().screen_height,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CallProfile
                showPulse={true}
                profileImage={
                  Number(agoraData?.sender) === Number(userData?.id)
                    ? agoraData?.receiver_image
                    : agoraData?.sender_image
                }
              />
            </View>
          ) : (
            <RtcSurfaceView
              key={"111"}
              canvas={{ uid: 0 }}
              style={{
                width: dimensions().screen_width,
                height: dimensions().screen_height,
              }}
            />
          ))
        )}
      </View>

      <View style={styles.publisherStyle}>
        <TouchableOpacity
          onPress={() => {
            toggleUserVid();
          }}
          style={{
            width: 116,
            height: 169,
            overflow: "hidden",
            borderRadius: 12,
            backgroundColor: colors.black,
            borderWidth: !isVideoFlipped && props?.isCameraOn ? 1 : 0,
            borderColor: "grey",
          }}
        >
          {!isVideoFlipped ? (
            isCallInitialized &&
            (props?.isCameraOn ? (
              <View
                style={{
                  width: 116,
                  height: 169,
                  overflow: "hidden",
                  borderRadius: 12,
                  backgroundColor: colors.black,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CallProfile
                  small={true}
                  showPulse={true}
                  profileImage={
                    Number(agoraData?.sender) === Number(userData?.id)
                      ? agoraData?.sender_image
                      : agoraData?.receiver_image
                  }
                />
              </View>
            ) : (
              <>
                {Platform.OS === "android" ? (
                  <RtcTextureView
                    key={"333"}
                    canvas={{ uid: 0 }}
                    style={globalStyles.wh100}
                  />
                ) : (
                  <RtcSurfaceView
                    key={"333"}
                    canvas={{ uid: 0 }}
                    style={globalStyles.wh100}
                  />
                )}
              </>
            ))
          ) : guestUserUid !== 0 ? (
            <>
              {Platform.OS === "android" ? (
                <RtcTextureView
                  key={"222"}
                  canvas={{ uid: guestUserUid }}
                  style={globalStyles.wh100}
                />
              ) : (
                <RtcSurfaceView
                  key={"222"}
                  canvas={{ uid: guestUserUid }}
                  style={globalStyles.wh100}
                />
              )}
            </>
          ) : (
            <View
              style={{
                width: 116,
                height: 169,
                overflow: "hidden",
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CallProfile
                small={true}
                showPulse={true}
                profileImage={
                  Number(agoraData?.sender) === Number(userData?.id)
                    ? agoraData?.sender_image
                    : agoraData?.receiver_image
                }
              />
            </View>
          )}
        </TouchableOpacity>
        <AppImageIcon
          onPress={flipCamera}
          wrapperStyle={styles.flipIcon}
          image={images.flip_camera}
        />
      </View>
      <CallBar
        isVideo={true}
        containerStyle={styles.callBar}
        isVideoEnabled={props?.isCameraOn}
        isAudioEnabled={!props?.isMuted}
        isSpeakerEnabled={props?.isSpeakerOn}
        onIcon2Press={props?.switchCamera}
        onIcon3Press={props?.toggleMuteAudio}
        onIcon4Press={props?.toggleSpeaker}
        onEndCallPress={props?.endCall}
        callDurationRef={props?.callDurationRef}
      />
    </View>
  );
};
export default Video;
const styles = StyleSheet.create({
  publisherStyle: {
    width: 116,
    height: 169,
    position: "absolute",
    borderRadius: 12,
    top: 47,
    right: 16,
    zIndex: 200,
  },
  flipIcon: {
    backgroundColor: colors.black,
    height: 32,
    width: 32,
    borderRadius: 100,
    alignSelf: "center",
    position: "absolute",
    bottom: -20,
  },
  callBar: {
    position: "absolute",
    zIndex: 101,
    top: dimensions().screen_height - 150,
  },
  backBtn: {
    height: 48,
    width: 48,
    backgroundColor: colors.black,
    borderRadius: 24,
    position: "absolute",
    top: 47,
    left: 28,
    zIndex: 99,
  },
});
