import { Vibration } from "react-native";
import Sound from "react-native-sound";

export const PlaySound = (file, totalDuration = 90000) => {

  if (globalThis.silent == true) {
    Vibration.vibrate([1000, 500, 1000], true);
  } else {
    Vibration.vibrate([1000, 500, 1000], true);
    this.music = new Sound(file, null, (error) => {
      if (error) {
        console.log("Error >>>>>>", error);
      }

      let startTime = new Date().getTime();
      let isPlaying = false;

      const playLoop = () => {
        isPlaying = true;
        this.music.play((success) => {
          if (success) {
            const currentTime = new Date().getTime();
            const elapsedDuration = currentTime - startTime;
            if (elapsedDuration < totalDuration && isPlaying) {
              // Continue playing in a loop until the total duration is reached
              playLoop();
            } else {
              this.music.release();
              isPlaying = false;
            }
          } else {
            console.log("playback failed due to audio decoding errors");
          }
        });
      };

      playLoop();
    });
  }
};

export const StopIncomingSound = () => {
  Vibration.cancel();
  if (this.music != null) {
    this.music.stop();
    this.music == null;
    Vibration.cancel();
  }
};
