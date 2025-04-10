import React from 'react';
import {StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import { StoreType } from '../../../types';
import {colors} from '../../../utils/constants/colors';
import {fonts} from '../../../utils/constants/fonts';
import {formatElapsedTime} from '../../../utils/globalFunctions';
import { AppText } from '../../../Components/Calling/AppText';

interface CallDurationProps {
  // eslint-disable-next-line
  style?: any;
}

const CallDuration = (props: CallDurationProps) => {
  const callDuration = useSelector(
    (state: StoreType) => state?.CallDurationReducer.call_duration || 0,
  );

  return (
    <AppText style={props.style ? props?.style : styles.duration}>
      {callDuration > 0 ? formatElapsedTime(callDuration) : 'Connecting ...'}
    </AppText>
  );
};

export default CallDuration;

const styles = StyleSheet.create({
  duration: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.whiteOpacity(0.56),
    fontFamily: fonts.primary_semi_bold_font,
    marginBottom: 44,
  },
});
