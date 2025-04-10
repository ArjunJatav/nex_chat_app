import React, { useState } from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import Gestures from "react-native-easy-gestures";
import FastImage from "react-native-fast-image";
import { textTheme } from "../Colors/Colors";

const DraggableImage = ({
  id,
  source,
  position,
  color,
  onEdit,
  onLongPressImage,
  showImageDelete,
  deleteImage,
  activeImageId,
  onStart,
  onEnd,
  onChange,
  zIndex,
  bigButton,
}) => {
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View
      style={{
        position: "absolute",
        transform: [{ scale: activeImageId == id && bigButton ? 0.5 : 1 }],
        left: activeImageId == id && bigButton && 50,
        top: activeImageId == id && bigButton && 650,
      }}
    >
      <Gestures
        onStart={onStart}
        draggable={{
          y: true,
          x: true,
        }}
        scalable={{
          min: 0.1,
          max: 4,
        }}
        rotatable={true}
        style={{
          position: "absolute",
          left: activeImageId == id && bigButton ? 90 : position.x,
          top: activeImageId == id && bigButton ? 650 : position.y,
        }}
        onEnd={(event, styles) => onEnd(event, styles)}
        onChange={(event, styles) => onChange(event, styles)}
      >
        <TouchableOpacity
          onLongPress={() => onLongPressImage(id)}
          onPress={() => onEdit()}
        >
          <Image
            style={{
              width: 150,
              height: 200,
              borderRadius: 15,
              resizeMode: "stretch",
            }}
            source={{
              uri: source,
              priority: FastImage.priority.high,
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
          {isLoading && (
            <ActivityIndicator
              style={{ position: "absolute", alignSelf: "center" }}
              size="large"
              color={textTheme().textColor}
            />
          )}
          {showImageDelete === id && (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <TouchableOpacity
                onPress={() => deleteImage(id)}
                style={{ alignSelf: "center" }}
              >
                <Image
                  source={require("../../Assets/Image/newdelete.png")}
                  style={{
                    height: 30,
                    width: 30,
                    resizeMode: "contain",
                    tintColor: "red",
                  }}
                />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Gestures>
    </View>
  );
};

export default DraggableImage;
