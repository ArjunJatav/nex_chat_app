import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { dimensions } from "../../../utils/globalFunctions";
import CallDuration from "./CallDuration";
import { STRING_CONSTANTS } from "../../../utils/constants/stringConstants";
import { fonts } from "../../../utils/constants/fonts";
import { colors } from "../../../utils/constants/colors";
import { images } from "../../../utils/constants/assets";
import { AppImageIcon } from "../../../Components/Calling/AppImageIcon";
import { AppText } from "../../../Components/Calling/AppText";
import { useSelector } from "react-redux";

type propTypes = {
  isVideo?: boolean;
  containerStyle?: ViewStyle;
  onEndCallPress?: () => void;
  onIcon3Press?: () => void;
  onIcon4Press?: () => void;
  onAddUserPress?: () => void;
  isAudioEnabled?: boolean;
  isSpeakerEnabled?: boolean;
  // eslint-disable-next-line
  callDurationRef?: any;
};
const AudioCallBar = (props: propTypes) => {
  const guestUserUids = useSelector(
    (state) => state?.VoipReducer?.call_data?.guestVideoUids || []
  );

  const checkGroupCall = useSelector((state) => {
    return state?.callerIDReducers?.userData?.groupCall;
  });

  console.log('checkGroupCall====================================',checkGroupCall);
  

  const uniqueGuestUserUids = Array.from(new Set(guestUserUids));
  return (
    <View style={[styles.container, props?.containerStyle]}>
      <View style={{ flex: 1, marginLeft: props?.isVideo ? 16 : 0 }}>
        <AppText style={styles.title}>
          {props?.isVideo
            ? STRING_CONSTANTS.video_call
            : STRING_CONSTANTS.audio_call}
        </AppText>
        <CallDuration style={styles.desc} />
      </View>

      <AppImageIcon
        onPress={props?.onIcon3Press}
        wrapperStyle={[
          styles.wrapper,
          //   props?.isAudioEnabled && {backgroundColor: colors.white},
        ]}
        image={props?.isAudioEnabled ? images.mic_on : images.mic_off}
        iconStyle={[
          styles.icon,
          //   props?.isAudioEnabled && {tintColor: colors.black},
        ]}
      />

      <AppImageIcon
        onPress={props?.onIcon4Press}
        wrapperStyle={[styles.wrapper]}
        image={props?.isSpeakerEnabled ? images.speaker_on : images.speaker_off}
        iconStyle={[styles.icon]}
      />
      {uniqueGuestUserUids.length < 9 && checkGroupCall != true && (
        <AppImageIcon
          onPress={props?.onAddUserPress}
          wrapperStyle={[styles.wrapper]}
          image={images.AddUser_inCall}
          iconStyle={[styles.icon]}
        />
      )}

      <AppImageIcon
        onPress={props?.onEndCallPress}
        wrapperStyle={[styles.wrapper, { marginRight: 0 }]}
        image={images.end_call}
        iconStyle={{ height: 48, width: 48 }}
      />
    </View>
  );
};
export default AudioCallBar;
const styles = StyleSheet.create({
  container: {
    height: 72,
    width: dimensions().screen_width - 32,
    backgroundColor: colors.black_rgba(1),
    alignSelf: "center",
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  wrapper: {
    height: 48,
    width: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.white,
    //backgroundColor: colors.whiteOpacity(0.12),
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.primary_background_color,
    fontFamily: fonts.primary_bold_font,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary_background_color,
    fontFamily: fonts.primary_regular_font,
    opacity: 0.44,
  },
  icon: {
    height: 26,
    width: 26,
  },
  iconn: {
    height: 26,
    width: 26,
    tintColor: "#ffffff",
  },
});
