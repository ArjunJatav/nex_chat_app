import React, { useState } from "react";
import { Linking, Platform, SafeAreaView } from "react-native";
import { Text, View } from "react-native";
import {
  iconTheme,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { NoInternetModal } from "../Modals/NoInternetModel";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";

export default function ForceUpdateScreen({ route }) {
  const isDarkMode = true;
  const [noInternetModel, setNoInternetModel] = useState(false);
  const { t, i18n } = useTranslation();
  console.log("route>>>", route.params.ResponseData);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    },
    updateTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#000",
      textAlign: "center",
    },
    updateText: {
      color: "#000",
      fontSize: 15,
      marginTop: 10,
      textAlign: "center",
    },
    description: { color: "#000", marginTop: 10, textAlign: "center" },
    button: {
      backgroundColor: iconTheme().iconColorNew,
      borderRadius: 10,
      padding: 15,
      marginTop: 20,
      alignSelf: "center",
    },
    buttonText: {
      color: "#fff",
    },
    appUpdateImage: {
      height: 200,
      width: 200,
      alignSelf: "center",
      marginTop: 150,
    },
  });

  const appStore = () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
        return;
      } else {
        Platform.OS === "ios"
          ? Linking.canOpenURL(
              "https://apps.apple.com/fj/app/tokee-messenger/id1641356322"
            ).then((supported) => {
              if (supported) {
                Linking.openURL(
                  "https://apps.apple.com/fj/app/tokee-messenger/id1641356322"
                );
              }
            })
          : Linking.canOpenURL(
              "https://play.google.com/store/apps/details?id=com.deucetek.tokee"
            ).then((supported) => {
              if (supported) {
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.deucetek.tokee"
                );
              }
            });
      }
    });
  };
  return (
    <View style={{ flex: 1 }}>
      <NoInternetModal
        visible={noInternetModel}
        onRequestClose={() => setNoInternetModel(false)}
        headingTaxt={t("noInternet")}
        NoInternetText={t("please_check_internet")}
        cancelButton={() => setNoInternetModel(false)}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#fff", alignItems: "center" }}
      >
        <View
          style={{
            position: "relative",
            backgroundColor: "#fff",
          }}
        >
          {Platform.OS == "android" ? (
            <CustomStatusBar
              barStyle={isDarkMode ? "dark-content" : "dark-content"}
              backgroundColor={"#fff"}
            />
          ) : null}
          <Image
            source={require("../../Assets/Image/appUpdate.png")}
            style={styles.appUpdateImage}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.updateTitle,
              {
                color:
                  textTheme().textColor != "#fff"
                    ? textTheme().textColor
                    : "#000000",
              },
            ]}
          >
            {route.params.ResponseData.message}
          </Text>
          <Text
            style={[
              styles.updateText,
              {
                color:
                  textTheme().textColor != "#fff"
                    ? textTheme().textColor
                    : "#000000",
              },
            ]}
          >
            Version: {route.params.ResponseData.data.minimum_support_version}
          </Text>
          <Text
            style={[
              styles.description,
              {
                color:
                  textTheme().textColor != "#fff"
                    ? textTheme().textColor
                    : "#000000",
              },
            ]}
          >
            {route.params.ResponseData.data.force_update_content}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => appStore()}>
            <Text style={styles.buttonText}>UPDATE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
