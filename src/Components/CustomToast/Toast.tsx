import React, {
  useState,
  useRef,
  useImperativeHandle,
  useEffect,
  useContext,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  ToastAndroid,
  useWindowDimensions,
  Platform,
} from "react-native";
import ThemeContext from "../ThemeContext/ThemeContext";
import { COLORS, iconTheme } from "../Colors/Colors";

interface Props {}

export const DURATION = {
  LENGTH_SHORT: 2000,
  FOREVER: 0,
};

const Toast: React.FC<Props> = React.forwardRef((_props, ref) => {
  const { height } = useWindowDimensions();
  const { colorTheme } = useContext(ThemeContext);
  const [isShow, setShow] = useState<boolean>(false);
  const [toastText, setToastText] = useState<string>("");
  const opacityValue = useRef<Animated.Value>(new Animated.Value(1)).current;
  let animation: Animated.CompositeAnimation | null = null;
  let timer: NodeJS.Timeout | null = null;
  let isShowing: boolean = false;

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      left: 0,
      right: 0,
      elevation: 999,
      alignItems: "center",
      zIndex: 10000,
    },
    content: {
      backgroundColor: iconTheme().iconColor,
      borderRadius: 12,
      padding: 10,
      bottom: 64,
      maxWidth: "80%",
    },
    text: {
      fontSize: 17,
      color: COLORS.white,
      textAlign: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
  });

  useEffect(() => {
    return () => {
      animation && animation.stop();
      timer && clearTimeout(timer);
    };
  }, [animation, timer]);

  useImperativeHandle(ref, () => ({
    show: (text: string) => {
      Platform.OS === "android"
        ? ToastAndroid.show(text, ToastAndroid.SHORT)
        : show(text);
    },
  }));

  const show = (text: string) => {
    setShow(true);
    setToastText(text);

    animation = Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });
    animation.start(() => {
      isShowing = true;
      close();
    });
  };

  const close = () => {
    let delay = DURATION.LENGTH_SHORT;

    if (!isShowing && !isShow) {
      return;
    }
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      animation = Animated.timing(opacityValue, {
        toValue: 0.0,
        duration: 500,
        useNativeDriver: true,
      });
      animation.start(() => {
        setShow(false);
        isShowing = false;
      });
    }, delay);
  };

  return (
    <>
      {isShow && Platform.OS !== "android" && (
        <View
          style={[styles.container, { top: height - 120 }]}
          pointerEvents="none"
        >
          <Animated.View style={[styles.content, { opacity: opacityValue }]}>
            <Text style={styles.text}>{toastText}</Text>
          </Animated.View>
        </View>
      )}
    </>
  );
});

export default Toast;
