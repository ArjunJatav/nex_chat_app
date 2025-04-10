import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import { font } from "../../Components/Fonts/Font";

const ChatCounter = ({ message }) => {
  // Function to calculate remaining time
  const calculateRemainingTime = (distime) => {
    const currentTime = new Date().getTime();
    const timeDiff = distime - currentTime;

    if (timeDiff <= 0) {
      return ""; // Return empty string if time difference is zero or negative
    }

    const totalMinutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Format the remaining time as "hh:mm"
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    return formattedTime;
  };

  const [remainingTime, setRemainingTime] = useState(
    calculateRemainingTime(message)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      let newRemainingTime = calculateRemainingTime(message);

      // Check if remaining time is negative, set it to zero
      if (
        parseInt(newRemainingTime.split(":")[0]) < 0 ||
        parseInt(newRemainingTime.split(":")[1]) < 0
      ) {
        newRemainingTime = "00:00";
      }

      setRemainingTime(newRemainingTime);
      // If remaining time is zero, clear the interval
      if (newRemainingTime === "00:00") {
        clearInterval(interval);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [message]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* Render remaining time */}
      {message && (
        <Text
          style={{
            color: "black",
            opacity: 0.6,
            fontFamily: font.semibold(),
            fontSize: 12,
            fontWeight: "800",
            position: "relative",
            bottom: 4,
          }}
        >
          {remainingTime}
        </Text>
      )}
    </View>
  );
};

export default ChatCounter;
