// DraggableText.js
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Gestures from "react-native-easy-gestures";

const DraggableText = ({
  id,
  text,
  position,
  color,
  onEdit,
  onLongPressText,
  showDelete,
  deleteText,
  activeTextId,
  onStart,
  font,
  onEnd,
  rotation,
  scale,
  onChange,
  bigButton,
  deleteActiveId,
}) => {
  const baseFontSize = 20;
  return (
    <View
      style={{
        position: "absolute",
        zIndex: activeTextId === id ? 5560 : 5551,
        transform: [{ scale: deleteActiveId == id && bigButton ? 0.5 : 1 }],
        left: deleteActiveId == id && bigButton && 50,
        top: deleteActiveId == id && bigButton && 650,
      }}
    >
      <Gestures
        onStart={onStart}
        onChange={(event, styles) => onChange(event, styles)}
        draggable={{
          y: true,
          x: true,
        }}
        scalable={{
          min: 0.1,
          max: 4,
        }}
        rotatable={true}
        onEnd={(event, styles) => onEnd(event, styles)}
        style={{
          position: "absolute",
          left: deleteActiveId == id && bigButton ? 90 : position.x,
          top: deleteActiveId == id && bigButton ? 90 : position.y,
          transform: [
            { scale: deleteActiveId == id && bigButton ? 90 : scale },
            { rotate: rotation == 0 ? `${rotation}deg` : `${rotation}deg` },
          ],
        }}
      >
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: text.length < 10 ? 100 : "auto",
            height: text.length < 10 ? 50 : "auto",
          }}
          onLongPress={() => onLongPressText(id)}
          onPress={() => onEdit()}
        >
          <View style={{ maxWidth: 350 }}>
            <Text
              style={{
                color,
                fontSize: 20,
                padding: 5,
                borderRadius: 8,
                fontFamily: font,
              }}
            >
              {text}
            </Text>
          </View>

          {showDelete === id && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity onPress={() => deleteText(id)}>
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

export default DraggableText;
