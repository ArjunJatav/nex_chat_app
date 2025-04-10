// DraggableImage.js
import React from "react";
import {
  Dimensions,
  Image,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import Gestures from "react-native-easy-gestures";
const { width, height } = Dimensions.get("window");

const MainImage = ({ source, onChange }) => {
  // Add your image-specific functions here, if needed

  return (
    <Gestures
      draggable={{
        y: false,
        x: false,
      }}
      scalable={{
        min: 0.1,
        max: 4,
      }}
      rotatable={true}
      onChange={(event, styles) => onChange(event, styles)}
    >
      <TouchableOpacity activeOpacity={0.9}>
        <ImageBackground
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 5,
            resizeMode: "contain",
          }}
          resizeMode="contain"
          source={{ uri: source }}
        />
      </TouchableOpacity>
    </Gestures>
  );
};

export default MainImage;
