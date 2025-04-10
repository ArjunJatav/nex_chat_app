import React from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import Gestures from "react-native-easy-gestures";


const ProfileDraggableText = ({
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
          max: 3,
        }}
        rotatable={true}
        onEnd={(event, styles) => onEnd(event, styles)}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          transform: [
            { scale: scale },
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
          {deleteActiveId == id ? (
            <View
              style={{
                borderWidth: 2,
                borderStyle: "dotted",
                maxWidth: Dimensions.get("screen").width,
                borderColor: "lightgray",
              }}
            >
              <Text
                style={{
                  color,
                  fontSize: 18,
                  padding: 5,
                  borderRadius: 8,
                  fontWeight: "900",
                }}
              >
                {text}
              </Text>

              <View
                style={{
                  position: "absolute", // Position the text absolutely within the TouchableOpacity
                  top: -15, // Place it at the top
                  right: -10, // Place it at the end
                  backgroundColor: "transparent", // Background color for better visibility
                }}
              >
                <TouchableOpacity
                  onPressIn={() => deleteText(id)}
                  style={{
                    backgroundColor: "#000000",
                    borderRadius: 15,
                    padding: 10,
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
          ) : (
            <View style={{ width: 300 }}>
              <Text
                style={{
                  color,
                  fontSize: 16,
                  padding: 5,
                  borderRadius: 8,
                  fontWeight: "900",
                }}
              >
                {text}
              </Text>
            </View>
          )}

          {/* {showDelete === id && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity onPress={() => deleteText(id)}>
                <Image
                 // source={IMAGES.newdelete}
                  style={{
                    height: 30,
                    width: 30,
                    resizeMode: "contain",
                    tintColor: "red",
                  }}
                />
              </TouchableOpacity>
            </View>
          )} */}
        </TouchableOpacity>
      </Gestures>
    </View>
  );
};

export default ProfileDraggableText;
