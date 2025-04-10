import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../../../utils/constants/colors';
import { globalStyles } from '../../../utils/globalStyles';

type callProfileProps = {
  showPulse: boolean;
  profileImage?: string;
  small?: boolean;
  backgroundCall?: boolean;
};
// eslint-disable-next-line
const Pulse = ({delay = 0}) => {
  const animation = useSharedValue(0);
  const size = 112;

  useEffect(() => {
    animation.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, [animation, delay]);

  const animatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(
      animation.value,
      [0, 1],
      [1, 0],
      Extrapolate.CLAMP,
    );
    return {
      opacity: opacity,
      height: size * (animation.value * (animation.value + 0.85)),
      width: size * (animation.value * (animation.value + 0.85)),
      borderRadius: (size * (animation.value + 0.85)) / 2,
    };
  });

  return <Animated.View style={[styles.pulse, animatedStyles]} />;
};

const CallProfile = (props: callProfileProps) => {
  return (
    <View
      style={[
        styles.container,
        props?.small && {
          marginTop: 50,
          height: 80,
          width: 80,
        },
        props?.backgroundCall && {
          marginLeft: 20,
        },
      ]}>
      {props?.showPulse
        ? [1, 2, 3].map((ele: number) => (
            <Pulse key={ele} delay={ele === 1 ? 200 : ele === 2 ? 400 : 800} />
          ))
        : null}
      <View
        style={[
          styles.profile,
          props?.small && {
            height: 50,
            width: 50,
          },
        ]}>
        <Image source={{uri: props?.profileImage}} style={globalStyles.wh100} />
      </View>
    </View>
  );
};

export default CallProfile;

const styles = StyleSheet.create({
  container: {
    height: 208,
    width: 208,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 56,
  },
  profile: {
    height: 112,
    width: 112,
    borderRadius: 56,
    backgroundColor: colors.gray,
    position: 'absolute',
    overflow: 'hidden',
  },
  pulse: {
    borderColor: colors.primary_background_color,
    borderWidth: 1,
    position: 'absolute',
  },
});
