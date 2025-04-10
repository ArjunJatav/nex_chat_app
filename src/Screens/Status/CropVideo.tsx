import NetInfo from "@react-native-community/netinfo";
import { t } from "i18next";
import React, { useRef, useState } from "react";
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
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";

const SCREEN_WIDTH = Dimensions.get("screen").width;
export const FRAME_PER_SEC = 1;
export const FRAME_WIDTH = 20;

// eslint-disable-next-line
export const CropVideoScreen = ({ navigation, route }: any) => {
  const paused = false;
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const selectedVideo = route.params.path;
  const videoPlayerRef = useRef();
  const [isVideoLong, setIsVideoLong] = useState(false);

  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  // **********   Headers for api ********** ///
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
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
    if (isVideoLong == false) {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          // Alert.alert(t("noInternet"), t("please_check_internet"), [
          //   { text: t("ok") },
          // ]);
          setNoInternetModel(true);
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
    } else {
      setloaderMoedl(false);
      // Alert.alert(t("videolong"), t("videovalidation"));
      globalThis.errorMessage = t("videolong") + ", "+t("videovalidation");
      setErrorAlertModel(true);
    }
  };
  // **********   Method for Navigation for Further screen  ********** ///
  // eslint-disable-next-line
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
    } else {
      // Alert.alert(t("success"), t("story_has_posted"), [
      //   {
      //     text: t("ok"),
      //     onPress: () =>
      //       navigation.navigate("BottomBar", { screen: "chatScreen" }),
      //   },
      // ]);
      setSuccessAlertModel(true);
      setloaderMoedl(false);
    }
  };

  const handleLoad = (data: any) => {
    const videoDurationInSeconds = data.duration;
    console.log("Video duration >>>>>>>>", videoDurationInSeconds);

    // Duration is provided in milliseconds
    if (videoDurationInSeconds > 15) {
      setIsVideoLong(true);
      console.log("video is greater than 15 seconds");
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />

      <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={t("story_has_posted")}
        doneButton={() => {
          setSuccessAlertModel(false),
            navigation.navigate("BottomBar", { screen: "chatScreen" });
          // successModalCheck()
        }}
      />
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
      <NoInternetModal
        visible={noInternetModel}
        onRequestClose={() => setNoInternetModel(false)}
        headingTaxt={t("noInternet")}
        NoInternetText={t("please_check_internet")}
        cancelButton={() => setNoInternetModel(false)}
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
              onLoad={handleLoad}
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
