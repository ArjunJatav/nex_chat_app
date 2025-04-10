import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {dimensions} from '../../../utils/globalFunctions';
import CallDuration from './CallDuration';
import { STRING_CONSTANTS } from '../../../utils/constants/stringConstants';
import { fonts } from '../../../utils/constants/fonts';
import { colors } from '../../../utils/constants/colors';
import { images } from '../../../utils/constants/assets';
import { AppImageIcon } from '../../../Components/Calling/AppImageIcon';
import { AppText } from '../../../Components/Calling/AppText';

type propTypes = {
  isVideo?: boolean;
  containerStyle?: ViewStyle;
  onEndCallPress?: () => void;
  onIcon1Press?: () => void;
  onIcon2Press?: () => void;
  onIcon3Press?: () => void;
  onIcon4Press?: () => void;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isSpeakerEnabled?: boolean;
  // eslint-disable-next-line
  callDurationRef?: any;
};
const CallBar = (props: propTypes) => {
  return (
    <View style={[styles.container, props?.containerStyle]}>
      <AppImageIcon
        onPress={props?.onIcon1Press}
        wrapperStyle={[styles.wrapper, {backgroundColor: colors.rockt_orange}]}
        image={props?.isVideo ? null : images.mic_on}
        iconStyle={styles.icon}
      />
      <View style={{flex: 1, marginLeft: props?.isVideo ? 16 : 0}}>
        <AppText style={styles.title}>
          {props?.isVideo
            ? STRING_CONSTANTS.video_call
            : STRING_CONSTANTS.audio_call}
        </AppText>
        <CallDuration style={styles.desc} />
      </View>
      <AppImageIcon
        onPress={props?.onIcon2Press}
        wrapperStyle={[
          styles.wrapper,
          !props?.isVideoEnabled && {backgroundColor: colors.white},
        ]}
        image={images.video}
        iconStyle={[
          styles.icon,
          !props?.isVideoEnabled && {tintColor: colors.black},
        ]}
      />
      <AppImageIcon
        onPress={props?.onIcon3Press}
        wrapperStyle={[
          styles.wrapper,
          props?.isAudioEnabled && {backgroundColor: colors.white},
        ]}
        image={props?.isAudioEnabled ? images.mic_on : images.mic_off}
        iconStyle={[
          styles.icon,
          props?.isAudioEnabled && {tintColor: colors.black},
        ]}
      />
      <AppImageIcon
        onPress={props?.onIcon4Press}
        wrapperStyle={[
          styles.wrapper,
          props?.isSpeakerEnabled && {backgroundColor: colors.white},
        ]}
        image={images.speaker_on}
        iconStyle={[
          styles.icon,
          props?.isSpeakerEnabled && {tintColor: colors.black},
        ]}
      />
      <AppImageIcon
        onPress={props?.onEndCallPress}
        wrapperStyle={[styles.wrapper, {marginRight: 0}]}
        image={images.end_call}
        iconStyle={{height: 48, width: 48}}
      />
    </View>
  );
};
export default CallBar;
const styles = StyleSheet.create({
  container: {
    height: 72,
    width: dimensions().screen_width - 32,
    backgroundColor: colors.black_rgba(0.44),
    alignSelf: 'center',
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  wrapper: {
    height: 48,
    width: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.whiteOpacity(0.12),
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
    height: 24,
    width: 24,
  },
});
