// PinModal.js

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import PinInput from "./GeneratePin";

const UnlockChatPinModal = ({
  isVisible,
  onForgotten,
  onPinEntered,
  onSubmit,
  closePinModal,
}) => {
  const pinLength = 4;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={() => closePinModal()}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        onPress={() => closePinModal()}
        activeOpacity={0.7}
      >
        <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
          <Text style={styles.title}>Enter PIN</Text>
          <PinInput pinLength={pinLength} onPinEntered={onPinEntered} />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity onPress={() => onForgotten()}>
              <Text style={styles.closeButton}>Forgot PIN</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSubmit()}>
              <Text style={styles.closeButton}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    color: "blue",
    marginTop: 10,
  },
});

export default UnlockChatPinModal;
