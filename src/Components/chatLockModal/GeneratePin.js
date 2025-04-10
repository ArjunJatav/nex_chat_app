// PinInput.js

import React, { useState, useRef } from "react";
import { View, TextInput, StyleSheet, Keyboard } from "react-native";

const PinInput = ({ pinLength, onPinEntered }) => {
  const [pin, setPin] = useState(Array(4).fill(0));
  const inputRefs = useRef([]);

  const handleFocus = (value, index) => {
    if (index < pinLength - 1) {
      inputRefs.current[index + 1].focus();
    } else {
      onPinEntered(pin);
    }
  };

  const handleChange = (value, index) => {
    pin[index] = value;

    if (value.length === 0 && index > 0) {
      inputRefs.current[index - 1].focus();
      onPinEntered(pin);
    } else if (value.length === 1 && index <= pinLength - 1) {
      handleFocus(value, index);
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(pinLength)].map((_, index) => (
        <TextInput
          key={index}
          onSubmitEditing={()=>Keyboard.dismiss()}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={styles.pinInput}
          value={pin[index] !== ""}
          maxLength={1}
          keyboardType="numeric"
          onChangeText={(value) => handleChange(value, index)}
          secureTextEntry
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pinInput: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    width: 40,
    height: 40,
    margin: 5,
    textAlign: "center",
    fontSize: 18,
  },
});

export default PinInput;
