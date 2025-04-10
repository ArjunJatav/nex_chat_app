import NetInfo from "@react-native-community/netinfo";
import { t } from "i18next";
import React, {  useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Video from "react-native-video";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { add_story } from "../../Constant/Api";
import { LoaderModel } from "../Modals/LoaderModel";

const SCREEN_WIDTH = Dimensions.get("screen").width;
export const FRAME_PER_SEC = 1;
export const FRAME_WIDTH = 20;

// eslint-disable-next-line
export const CropVideoScreen = ({ navigation, route }: any) => {
  const paused = false;
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const selectedVideo = route.params.path;
  const videoPlayerRef = useRef();

  // **********   Headers for api ********** ///
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
    Authorization: "Bearer " + globalThis.Authtoken, 
    "localization":globalThis.selectLanguage,
  };

  // **********  Sendig Data as Parameter  ********** ///
  const uploaddata = new FormData();

  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  uploaddata.append("file", {
    uri:
      Platform.OS === "android"
        ? selectedVideo
        : selectedVideo?.replace("file://", ""),
    type: "video/mp4", // or photo.type
    name: "video.mp4",
  });
  uploaddata.append("file_type", "video");

  // **********   Add story api  ********** ///
  const addStoryApi = () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        return;
      } else {
        setloaderMoedl(true);

        PostApiCall(
          add_story,
          uploaddata,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };
  // **********   Method for Navigation for Further screen  ********** ///
  // eslint-disable-next-line
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);  
      setloaderMoedl(false);
    } else {
      Alert.alert(t("success"), t("story_has_posted"), [
        {
          text: t("ok"),
          onPress: () =>
            navigation.navigate("BottomBar", { screen: "chatScreen" }),
        },
      ]);
      setloaderMoedl(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          padding: 15,
          marginTop: 30,
          alignSelf: "center",
        }}
      >
        <TouchableOpacity
          style={styles.okButton}
          onPress={() => navigation.navigate("AddCameraStoryScreen")}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {t("cancel")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.okButton} onPress={() => addStoryApi()}>
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {t("post")}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedVideo ? (
        <>
          <View style={styles.videoContainer}>
            <Video
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              ref={videoPlayerRef}
              style={styles.video}
              resizeMode={"cover"}
              source={{ uri: selectedVideo }}
              repeat={true}
              paused={paused}
            />
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  buttonContainer: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonText: {
    color: "#fff",
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: "75%",
    backgroundColor: "rgba(255,255,255,0.1)",
    zIndex: 0,
  },
  video: {
    height: "100%",
    width: "100%",
  },
  okButton: {
    justifyContent: "center",
    padding: 5,
    borderRadius: 8,
  },
});
