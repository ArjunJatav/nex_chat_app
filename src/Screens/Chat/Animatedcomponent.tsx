import React from "react";
import { Platform, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const Animatedcomponent = React.memo(
  ({ handleSwipeRight, content, isLeft, data }: any) => {
    const startingPosition = 0;
    const range = 100; // Define the range of movement
    const x = useSharedValue(startingPosition);
    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx) => {
        ctx.startX = x.value;
      },
      onActive: (event: any, ctx: any) => {
        const nextX = ctx.startX + event.translationX;
        if (isLeft) {
          // If the movement is towards the left and within the range
          x.value = Math.max(
            startingPosition - range,
            Math.min(ctx.startX, nextX)
          );
        } else {
          // If the movement is towards the right and within the range
          x.value = Math.min(
            startingPosition + range,
            Math.max(ctx.startX, nextX)
          );
        }
      },
      onEnd: () => {
        x.value = withSpring(startingPosition);
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: x.value }],
    }));

    return (
      <View>
        {data?.currentMessage?.attachment &&
        data?.currentMessage?.attachment?.length > 1 ? (
          <View>{content}</View>
        ) : (
          <PanGestureHandler
            activeOffsetX={[-20, 20]}
            onFailed={(event) => {
              x.value = withSpring(0);
              // Perform any actions when the gesture handling fails
            }}
            onActivated={(event) => {
              // Perform any actions when the gesture handling fails
            }}
            onBegan={(event) => {
              // Perform any actions when the gesture handling fails
            }}
            onCancelled={(event) => {
              x.value = withSpring(0);
              // Perform any actions when the gesture handling fails
            }}
            onEnded={(event) => {
              x.value = withSpring(0);
              // Perform any actions when the gesture handling fails
            }}
            onHandlerStateChange={({ nativeEvent }) => {
              if (Platform.OS == "android") {
                if (x.value > 80) {
                  handleSwipeRight(data);
                  x.value = withSpring(0);
                } else if (x.value < 0 && x.value < -50) {
                  handleSwipeRight(data);
                  x.value = withSpring(0);
                }
              } else {
                if (nativeEvent.state == State.END) {
                  if (x.value > 70) {
                    handleSwipeRight(data);
                    x.value = withSpring(0);
                  } else if (x.value < 0 && x.value < -70) {
                    handleSwipeRight(data);
                    x.value = withSpring(0);
                  }
                }
              }
              // Perform any actions when the gesture handling fails
            }}
            onGestureEvent={gestureHandler}
          >
            <Animated.View style={[animatedStyle]}>{content}</Animated.View>
          </PanGestureHandler>
        )}
      </View>
    );
  }
);
export default Animatedcomponent;
