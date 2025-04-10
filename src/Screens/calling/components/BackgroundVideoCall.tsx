import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RtcSurfaceView } from "react-native-agora";
import { useDispatch, useSelector } from "react-redux";
import CallProfile from "./CallProfile";

import { StoreType } from "../../../types";
import { images } from "../../../utils/constants/assets";
import { colors } from "../../../utils/constants/colors";
import { updateCallState } from "../../../reducers/VoipReducer";
import { AppImageIcon } from "../../../Components/Calling/AppImageIcon";

interface BackgroundVideoCallProps {
  endCall: () => void;
  toggleMuteAudio: () => void;
  toggleSpeaker: () => void;
  isMuted: boolean;
  isSpeakerOn: boolean;
  callDurationRef: boolean;
  isCameraOn: boolean;
}

const BackgroundVideoCall = (props: BackgroundVideoCallProps) => {
  const dispatch = useDispatch();
  const callState = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_state || {}
  );
  const guestUserUid = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_data?.guestVideoUid
  );

  const agoraData = useSelector(
    (state: StoreType) => state?.VoipReducer?.agora_data || {}
  );

  const userData = useSelector(
    (state: StoreType) => state?.UserReducer?.user || null
  );


  return callState.isBackground ? (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.call]}
      onPress={() => dispatch(updateCallState({ isBackground: false }))}
    >
      <View
        style={{
          width: 116,
          height: 169,
          overflow: "hidden",
          borderRadius: 12,
          backgroundColor: colors.black,
        }}
      >
        {!props?.isCameraOn && guestUserUid !== 0 ? (
          <RtcSurfaceView
            key={"444"}
            canvas={{ uid: guestUserUid }}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        ) : (
          <CallProfile
            backgroundCall={true}
            small={true}
            showPulse={true}
            profileImage={
              agoraData?.sender === userData?.id
                ? agoraData?.receiver_image
                : agoraData?.sender_image
            }
          />
        )}
      </View>
      <AppImageIcon
        onPress={() => dispatch(updateCallState({ isBackground: false }))}
        wrapperStyle={styles.maximizeIcon}
        iconStyle={{ height: 14, width: 14 }}
        image={images.maximize_icon}
      />
    </TouchableOpacity>
  ) : null;
};
export default BackgroundVideoCall;

const styles = StyleSheet.create({
  call: {
    width: 116,
    height: 169,
    position: "absolute",
    borderRadius: 12,
    right: 16,
    zIndex: 200,
    marginTop: 125,
  },
  maximizeIcon: {
    backgroundColor: colors.black,
    height: 32,
    width: 32,
    borderRadius: 100,
    alignSelf: "center",
    position: "absolute",
    bottom: -18,
  },
});
