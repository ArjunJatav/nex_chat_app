import React, { useState } from "react";
import {
  Dimensions,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import Video from "react-native-video";
import { Image } from "react-native";
import { COLORS } from "../../Components/Colors/Colors";
const windowWidth = Dimensions.get("window").width;

 // eslint-disable-next-line
export const VideoPlayScreen = ({ route, navigation }:any) => {
  const url = route.params?.videoUrl;
  const [isLoading, setIsLoading] = useState(true);
  const isPlaying = true;

 
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{
          left: 16,
          borderRadius: 5,
          zIndex: 1001,
          top: Platform.OS === "ios" ? 60 : 20,
          backgroundColor:
            globalThis.selectTheme === "mongoliaTheme"
              ? "#8D3E2D" 
              : globalThis.selectTheme === "newYearTheme"
              ? "#CE9D59"
              : 
              globalThis.selectTheme === "newYear"
              ? COLORS.black
              : 
              globalThis.selectTheme === "christmas"
              ? COLORS.primary_light_green 
              : globalThis.selectTheme == "third"
              ? COLORS.light_green 
              : globalThis.selectTheme == "second"
              ? COLORS.primary_blue
              : COLORS.purple,
          width: 30,
          height: 30,
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => {
          navigation.pop();
        }}
      >
        <Image
          source={require("../../Assets/Icons/Back.png")}
          style={{
            height: 25,
            width: 25,
            tintColor:
              globalThis.selectTheme == "third"
                ? COLORS.dark_pink
                : COLORS.white,
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>

     

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {isLoading && (
          <ActivityIndicator
            size="large"
            color="green"
            style={{ alignSelf: "center", flex: 1, position: "absolute" }}
          />
        )}
        <Video
          source={{ uri: url }}
          style={styles.video}
          resizeMode="contain"
          controls={true}
          paused={!isPlaying}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  videoContainer: {
    width: windowWidth,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 10,
  },
  video: {
    width: windowWidth - 20,
    height: 300,
  },
});
