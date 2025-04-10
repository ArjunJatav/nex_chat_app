import React, { useState } from "react";
import {  Image, TouchableOpacity, View } from "react-native";
import Gestures from "react-native-easy-gestures";
import FastImage from "react-native-fast-image";

const ProfileDraggableImage = ({
  id,
  source,
  position,
  onEdit,
  deleteImage,
  activeImageId,
  onStart,
  onEnd,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
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
        left: activeImageId == id ? 0 : position.x,
        top: activeImageId == id ? 0 : position.y,
        transform: [{ scale: activeImageId == id ? 0 : 1 }],
      }}
      onEnd={(event, styles) => {onEnd(event, styles)}}
      onChange={(event, styles) => onChange(event, styles)}
    >
      {activeImageId !== id ? (
        <TouchableOpacity onPress={() => onEdit()}>
          <Image
            style={{
              width: 100,
              height: 100,
              borderRadius: 15,
              resizeMode: "contain",
            }}
            source={{
              uri: source,
              priority: FastImage.priority.high,
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />

        </TouchableOpacity>
      ) : (
        <View
          style={{
            borderWidth: 1, 
            borderColor: "black", 
            borderStyle: "dotted", 
            justifyContent: "center",
            alignItems: "center",
            position: "relative", 
          }}
        >
          <Image
            style={{
              width: 100,
              height: 100,
              borderRadius: 5,
              resizeMode: "contain",
            }}
            resizeMode="contain"
            source={{ uri: source }}
          />
          <View
            style={{
              position: "absolute", 
              top: -15, 
              right: -10, 
              backgroundColor: "transparent", 
            }}
          >
            <TouchableOpacity
              onPressIn={() => deleteImage(id)}
              style={{
                backgroundColor: "#000000",
                borderRadius: 15,
                padding: 5,
                zIndex: 99999999,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
               source={require('../../Assets/Icons/Cross.png')}
                style={{
                  height: 10,
                  width: 10,
                  resizeMode: "contain",
                  tintColor: "#fff",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Gestures>
  );
};

export default ProfileDraggableImage;
