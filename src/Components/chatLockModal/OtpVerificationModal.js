// PinModal.js

import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PinInput from "./GeneratePin";

const OtpVerificationModal = ({
  isVisible,
  onClose,
  onPinEntered,
  VerifyOtp,
}) => {
  const pinLength = 6;
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={() => onClose()}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        onPress={() => onClose()}
        activeOpacity={1}
      >
        <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
          <Text style={styles.title}>Please Enter OTP</Text>
          <PinInput pinLength={pinLength} onPinEntered={onPinEntered} />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity onPress={() => onClose()}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => VerifyOtp()}>
              <Text style={styles.closeButton}>Verify</Text>
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
    padding: 40,
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

export default OtpVerificationModal;
