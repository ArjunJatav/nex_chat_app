import { TouchableOpacity, StyleSheet, Text, Image } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Base_Url, like_story } from "../Constant/Api";
import { textTheme } from "./Colors/Colors";

export const HeartLike = (props) => {
  const [liked, setLiked] = React.useState(value);
  const [value, setValue] = React.useState(value);

  useEffect(() => {
    if (props.isLiked == 1) {
      setLiked(true);
      setValue(true);
    } else {
      setLiked(false);
      setValue(false);
    }
  }, [props.current, props.isLiked]);

  const makeLike = async () => {
    const urlStr = Base_Url + like_story + props.likeid;

    try {
      await axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + global.token,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            console.log(response.data.message);
          }
        })
        .catch((error) => {
          alert(error);
        });
    } catch (error) {
      alert(error);
    }
  };

  return (
    <TouchableOpacity
      style={{ justifyContent: "center" }}
      onPress={() => {
        if (!globalThis.stealthModeValue || globalThis.stealthModeValue == "false" ) {
          makeLike(), setLiked(!liked);
        }else{
          setLiked(!liked);
        }
       
      }}
    >
      {liked ? (
        <Image
          source={require("../Assets/Image/like.png")}
          style={{
            height: 40,
            width: 40,
            resizeMode: "contain",
            tintColor: textTheme().textColor,
          }}
        />
      ) : (
        <Image
          source={require("../Assets/Image/story_like.png")}
          style={{
            height: 40,
            width: 40,
            resizeMode: "contain",
            tintColor: textTheme().textColor,
          }}
        />
      )}
    </TouchableOpacity>
  );
};
