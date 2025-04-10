import React from "react";
import { StyleSheet, View } from "react-native";

import { images } from "../../../utils/constants/assets";
import { colors } from "../../../utils/constants/colors";
import { AppImageIcon } from "../../../Components/Calling/AppImageIcon";
import { useSelector } from "react-redux";
// eslint-disable-next-line
const AudioCallOptions = (props: any) => {
  const checkGroupCall = useSelector((state) => {
    return state?.callerIDReducers?.userData?.groupCall;
  });

  console.log('checkGroupCallcheckGroupCall====================================',checkGroupCall);

    const memberGroupCall = useSelector((state) => {
      return state?.callerIDReducers?.userData?.memberGroupCall;
    });

      const guestUserUids = useSelector(
        (state) => state?.VoipReducer?.call_data?.guestVideoUids || []
      );
    
      const uniqueGuestUserUids = Array.from(new Set(guestUserUids));

  console.log(
    "checkGroupCall====================================",
    checkGroupCall
  );

  return (
    <View
      style={[
        {
          flexDirection: "row",
          marginHorizontal: 43,
          justifyContent: "space-between",
        },
        props?.containerStyle,
      ]}
    >
      <AppImageIcon
        onPress={props.toggleMuteAudio}
        wrapperStyle={styles.wrapper}
        image={props?.isMuted ? images.mic_off : images.mic_on}
        iconStyle={{ tintColor: "white", height: 30, width: 30 }}
      />
      {checkGroupCall != true && (
        <AppImageIcon
          onPress={props?.pressChat}
          wrapperStyle={styles.wrapper}
          image={images.AddUser_inCall}
          iconStyle={{ tintColor: "white", height: 30, width: 30 }}
        />
      )}
      {checkGroupCall != true && memberGroupCall != true && (
        <AppImageIcon
          onPress={props?.pressVideo}
          wrapperStyle={styles.wrapper}
          image={images.add_video}
          iconStyle={{ tintColor: "white", height: 30, width: 30 }}
        />
      )}
      <AppImageIcon
        onPress={props.toggleSpeaker}
        wrapperStyle={styles.wrapper}
        image={props?.isSpeakerOn ? images.speaker_on : images.speaker_off}
        iconStyle={{ tintColor: "white", height: 30, width: 30 }}
      />
    </View>
  );
};
export default AudioCallOptions;
const styles = StyleSheet.create({
  wrapper: {
    height: 52,
    width: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.white,
  },
});
