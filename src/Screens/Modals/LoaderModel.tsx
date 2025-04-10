import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { textTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

 // eslint-disable-next-line
export const LoaderModel = (props: any) => {
  const { t } = useTranslation();
  const styles = StyleSheet.create({
    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },
    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: "#FCF1FF",
      right: 20,
      top: 20,
    },
  });

  return (
    <Modal
      style={styles.modal}
      visible={props.visible}
      transparent={true}
      onRequestClose={() => {
        props.onRequestClose;
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(52, 52, 52, 0.1)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{ borderRadius: 10, backgroundColor: "white", padding: 25 }}
        >
          <Text
            style={{
              fontSize: 20,
             
              color: textTheme().textColor,
              marginBottom: 10,
              fontFamily:font.semibold()
            }}
          >
            {t("loading")}
          </Text>
          <ActivityIndicator size="large" color={textTheme().textColor} />
        </View>
      </View>
    </Modal>
  );
};
