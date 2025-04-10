// PinModal.js

import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import PinInput from "./GeneratePin";
import { t } from "i18next";

const PinModal = ({ isVisible, onClose, onPinEntered, onSubmit }) => {
  const pinLength = 4;
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
          <Text style={styles.title}>{t("generate_pin")}</Text>
          <PinInput pinLength={pinLength} onPinEntered={onPinEntered} />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity onPress={() => onClose()}>
            <Text style={styles.closeButton}>{t("Close")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSubmit()}>
            <Text style={styles.closeButton}>{t("submit")}</Text>
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

export default PinModal;
