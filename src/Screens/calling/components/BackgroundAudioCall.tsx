import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";


import { StoreType } from "../../../types";
import { images } from "../../../utils/constants/assets";
import { colors } from "../../../utils/constants/colors";
import { fonts } from "../../../utils/constants/fonts";
import CallDuration from "./CallDuration";
import { updateCallState } from "../../../reducers/VoipReducer";
import { AppImageIcon } from "../../../Components/Calling/AppImageIcon";
import { AppText } from "../../../Components/Calling/AppText";

interface BackgroundAudioCallProps {
  endCall: () => void;
  toggleMuteAudio: () => void;
  toggleSpeaker: () => void;
  isMuted: boolean;
  isSpeakerOn: boolean;
  callDurationRef: boolean;
}

const BackgroundAudioCall = (props: BackgroundAudioCallProps) => {
  const dispatch = useDispatch();
  const callState = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_state || {}
  );

  const endCall = () => {
    dispatch(updateCallState({ isBackground: false }));
    props?.endCall();
  };
  return callState.isBackground ? (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.call]}
      onPress={() => dispatch(updateCallState({ isBackground: false }))}
    >
      <View style={styles.wrapperLeft}>
        <AppImageIcon
          wrapperStyle={styles.micStyle}
          image={props?.isMuted ? images.mic_off : images.mic_on}
          iconStyle={{ tintColor: colors.white }}
          onPress={props?.toggleMuteAudio}
        />
        <View style={styles.textWrapper}>
          <AppText style={styles.audioCallText}>Audio Call</AppText>
          <CallDuration style={styles.timeText} />
        </View>
      </View>
      <View style={styles.wrapperRight}>
        <AppImageIcon
          wrapperStyle={[
            styles.speakerStyle,
            props?.isSpeakerOn && { backgroundColor: "white" },
          ]}
          image={images.speaker_on}
          iconStyle={{
            tintColor: props?.isSpeakerOn ? colors.black : colors.white,
          }}
          onPress={props?.toggleSpeaker}
        />
        <AppImageIcon
          image={images.end_call}
          iconStyle={{ width: 48, height: 48 }}
          onPress={endCall}
        />
      </View>
    </TouchableOpacity>
  ) : null;
};
export default BackgroundAudioCall;
const styles = StyleSheet.create({
  call: {
    width: "90%",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    borderRadius: 100,
    position: "absolute",
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-between",
    marginTop: 150,
    zIndex: 200,
  },
  ongoingCallText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
    fontFamily: fonts.primary_bold_font,
  },
  timeText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary_background_color,
    fontFamily: fonts.primary_regular_font,
    opacity: 0.44,
  },
  wrapperLeft: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 12,
  },
  micStyle: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: colors.rockt_orange,
  },
  textWrapper: {
    marginLeft: 12,
  },
  audioCallText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
    fontFamily: fonts.primary_bold_font,
  },
  wrapperRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  speakerStyle: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },

  rejectCallStyle: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "#EB5757",
    marginLeft: 12,
  },
});
