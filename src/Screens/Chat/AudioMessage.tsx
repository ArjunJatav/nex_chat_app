import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Vibration,
} from "react-native";
import Sound from "react-native-sound";
import Slider from "react-native-slider";
import { iconTheme, textTheme } from "../../Components/Colors/Colors";

const AudioMessage = ({ currentMessage }:object) => {
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const audioPath = currentMessage.startsWith("http")
      ? currentMessage
      : Platform.OS === "android"
      ? "file://" + currentMessage
      : currentMessage.replace("file://", "");
    //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    const audio = new Sound(audioPath, null, (error) => {
      if (error) {
        console.log("Failed to load the sound", error);
        return;
      }
      setDuration(audio.getDuration());
    });
    //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    setSound(audio);

    return () => {
      if (audio) {
        audio.release();
      }
      if (intervalRef.current !== null) {
        cancelAnimationFrame(intervalRef.current);
      }
    };
  }, [currentMessage]);

  const playPauseAudio = () => {
    Vibration.vibrate([100, 50, 100]);
    if (playing) {
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sound.pause();
      setPlaying(false);
      if (intervalRef.current !== null) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sound.play((success) => {
        if (success) {
          setPlaying(false);
          setCurrentTime(0);
        } else {
          console.log("Playback failed due to audio decoding errors");
        }
      });
      setPlaying(true);
      updateCurrentTime();
    }
  };

  const seekAudio = (value) => {
    //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    sound.setCurrentTime(value);
    setCurrentTime(value);
  };

  const updateCurrentTime = () => {
    //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    sound.getCurrentTime((seconds) => {
      if (!isSeeking) {
        setCurrentTime(seconds);
      }
      if (playing) {
        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        intervalRef.current = requestAnimationFrame(updateCurrentTime);
      }
    });
  };

  useEffect(() => {
    if (playing) {
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      intervalRef.current = setInterval(() => {
        if (!isSeeking) {
          //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          sound.getCurrentTime((seconds) => {
            setCurrentTime(seconds);
          });
        }
      }, 500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playing, isSeeking]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const formattedDuration = useMemo(() => formatTime(duration), [duration]);

  return (
    <View style={styles.audioMessageContainer}>
      <TouchableOpacity
        onPress={playPauseAudio}
        style={[
          styles.playPauseButton,
          { backgroundColor: textTheme().textColor },
        ]}
      >
        <Image
          source={
            playing
              ? require("../../Assets/Icons/pause.png")
              : require("../../Assets/Icons/play.png")
          }
          style={{ width: 18, height: 18 }}
        />
      </TouchableOpacity>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={currentTime}
        onValueChange={(value) => {
          setIsSeeking(true);
          setCurrentTime(value);
        }}
        onSlidingComplete={(value) => {
          setIsSeeking(false);
          seekAudio(value);
        }}
        minimumTrackTintColor={textTheme().textColor}
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor={textTheme().textColor}
      />
      <Text style={styles.durationText}>{formattedDuration}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  audioMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  playPauseButton: {
    backgroundColor: iconTheme().iconColorNew,
    padding: 10,
    borderRadius: 50,
    marginRight: 10,
  },
  playPauseText: {
    color: "#fff",
    fontWeight: "bold",
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  durationText: {
    color: "#555",
  },
});

export default AudioMessage;
