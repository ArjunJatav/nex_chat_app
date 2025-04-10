import CameraRoll from "@react-native-community/cameraroll";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { font } from "../../Components/Fonts/Font";

import { t } from "i18next";
import { Video as VideoCompress } from "react-native-compressor";
import { LoaderModel } from "../Modals/LoaderModel";
import DeviceInfo from "react-native-device-info";

let cameraAngle = true;

// eslint-disable-next-line
export default function AddCameraStoryScreen({ navigation }: any) {
  const showCamera = true;
  const [data, setData] = useState([]);
  const [startRecord, setStartRecord] = useState(false);
  const [loaderModel, setloaderMoedl] = useState(false);
  const [isPhoto, setIsPhoto] = useState(true);
  const [disable, setDisable] = useState(false);
  const [cameraType, setCameraType] = useState(true);
  const device = useCameraDevice(cameraType ? "back" : "front");
  const [showBackground, setShowBackground] = useState(false);
  const [showGellary, setShowGellary] = useState(false);
  const [timer, setTimer] = useState(0);
  // eslint-disable-next-line
  const recordingTimeout: any = useRef(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const camera = useRef(null);

  const androidVersion = DeviceInfo.getSystemVersion();

  useEffect(() => {
    onPhotoclick();
    if (device != null) {
      setTimeout(() => {
        setCameraType(cameraAngle);
        setloaderMoedl(false);
      }, 600);
    }
  }, []);
  // **********   useEffect for Check Permissio ********** ///
  useEffect(() => {
    checkPermission();
    setloaderMoedl(true);
    getPhotos();
  }, []);

  const toggleTorch = () => {
    setIsTorchOn(!isTorchOn);
  };
  // **********   get Photos from gallary ********** ///
  const getPhotos = () => {
    CameraRoll.getPhotos({
      first: 200,
      assetType: "Photos",
    })
      // eslint-disable-next-line
      .then((res: any) => {
        setData(res.edges);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // **********    Check Permissiom ********** ///
  const checkPermission = async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
    if (newCameraPermission !== "granted") {
      Alert.alert(
        "Camera Permission not allowed",
        "Please provide permission from app settings"
      );
      return;
    }
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    if (newMicrophonePermission !== "granted") {
      Alert.alert(
        "Microphone permission not provided",
        "Please provide permission from app settings"
      );
      return;
    }
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (androidVersion > 12 && Platform.OS === "android") {
      askNewPermission();
    } else {
      askPermission();
    }
  };
  // **********   Check Permissiom ********** ///
  const askPermission = async () => {
    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );

      if (result !== "granted") {
        return;
      } else {
        getPhotos();
      }
    } else {
      getPhotos();
    }
  };

  const askNewPermission = async () => {
    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );

      if (result !== "granted") {
        return;
      } else {
        getPhotos();
      }
    } else {
      getPhotos();
    }
  };
  // **********   method for capture image by using camera ********** ///
  const capturePhoto = async () => {
    if (camera.current) {
      setShowGellary(false);
      if (camera) {
        try {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          const photo = await camera.current.takePhoto({});
          const imagePath = "file://" + photo.path;
          if (photo.path !== undefined && photo.path !== "") {
            cameraAngle = cameraType;
            navigation.navigate("ImageUploadGallery", {
              path: imagePath,
            });
          }
        } catch (error) {
          console.error("Failed to capture photo:", error);
        }
      }
    }
  };

  // eslint-disable-next-line
  async function recordingFinish(path: any) {
    // Set loading state to true initially
    setloaderMoedl(true);
    setDisable(false);
    setStartRecord(false);
    setDisable(false);
    setTimer(0);

    if (path && path.trim() !== "") {
      try {
        // Compress the video
        const compressedVideoPath = await VideoCompress.compress(
          "file://" + path,
          {
            compressionMethod: "auto",
          }
        );

        // If compression is successful
        if (compressedVideoPath !== "") {
          // Navigate to the next screen with loading set to false
          navigation.navigate("CropVideoScreen", {
            path: compressedVideoPath,
            value: "camera",
            // Set loading state to false after compression
          });
          setloaderMoedl(false);
        } else {
          // Handle failure if necessary
        }
      } catch (error) {
        // Handle error if necessary
      } finally {
        // Set loading state to false after compression (if it fails or succeeds)
        setloaderMoedl(false);
      }
    }
  }

  const onPhotoclick = () => {
    checkPermission();
    setShowGellary(true);
    setIsPhoto(true);
    setShowBackground(false);
  };

  const onVideoclick = () => {
    setData([]);
    setShowGellary(false);
    setIsPhoto(false);
    setShowBackground(!showBackground);
  };

  // **********   method for start Recording video  ********** ///
  const startRecording = async () => {
    setShowGellary(false);
    setStartRecord(true);
    setDisable(true);

    if (camera != null) {
      try {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        await camera.current.startRecording({
          // eslint-disable-next-line
          onRecordingFinished: (video: any) => recordingFinish(video.path),
          // eslint-disable-next-line
          onRecordingError: (error: any) => console.error(error),
        });

        recordingTimeout.current = setTimeout(() => {
          stopRecording();
        }, 15000); // 15 seconds in milliseconds
      } catch (error) {
        stopRecording(); // Stop recording in case of an error
      }
    }
  };

  // **********   method for stop video Recording ********** ///
  const stopRecording = async () => {
    try {
      setStartRecord(false);

      if (camera != null) {
        if (camera?.current && showCamera) {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          await camera?.current?.stopRecording();
        }
      }
    } catch (error) {
      return;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Define your navigation logic here
        // For example, go back if possible
        navigation.navigate("BottomBar", { screen: "chatScreen" });
        return true; // Prevent default behavior (exiting the app)
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const navigationState = async () => {
    try {
      onVideoclick();
      // Reset the timer
      setTimer(0);
      navigation.navigate("BottomBar", { screen: "chatScreen" });
    } catch (error) {
      return;
    }
  };

  if (device == null) {
    //Alert.alert("hello")
    return <ActivityIndicator size={20} color={"green"} />;
  }

  // **********  Select Image From ImageLibarary  ********** ///
  const selectImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
        compressImageQuality: 0.2,
        cropperCircleOverlay: false,
        // eslint-disable-next-line
      }).then(async (image: any) => {
        if (image !== undefined) {
          // Compress the image if it's a video
          if (image.mime === "image/jpeg") {
            navigation.navigate("ImageUploadGallery", {
              path: image.path,
              value: "camera",
            });
          } else {
            // Compress the video
            // eslint-disable-next-line
            const result = await VideoCompress.compress(
              image.path,
              {
                compressionMethod: "auto",
              },
              () => {
                setloaderMoedl(true);
              }
            ).then(async (compressedFileUrl) => {
              setloaderMoedl(false);
              navigation.navigate("CropVideoScreen", {
                path: compressedFileUrl,
                value: "camera",
              });
            });
          }
        }
      });
    }
  };

  useEffect(() => {
    if (startRecord) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000); // Update the timer every 1 second

      return () => clearInterval(intervalId);
    }
  }, [startRecord]);

  // **********  Request Permission for Open Camera And Galary   ********** ///
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission",
            buttonPositive: "ok",
          }
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    button: {
      backgroundColor: "gray",
    },
    backButton: {
      backgroundColor: "rgba(0,0,0,0.0)",
      position: "absolute",
      justifyContent: "center",
      width: "100%",
      top: 0,
      padding: 20,
    },
    buttonContainer: {
      backgroundColor: "rgba(0,0,0,0.2)",
      position: "absolute",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      bottom: Platform.OS == "ios" ? 10 : 0,
      padding: 5,
      paddingHorizontal: 20,
    },
    gallaryContainer: {
      backgroundColor: "rgba(0,0,0,0.2)",
      position: "absolute",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      bottom: 0,
      padding: 5,
      paddingHorizontal: 20,
    },
    buttons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    camButton: {
      height: 100,
      width: 50,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
    },

    videocamButton: {
      height: 60,
      width: 60,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "red",
      alignSelf: "center",
      borderWidth: 4,
      borderColor: "white",
    },
    stopvideocamButton: {
      height: 55,
      width: 55,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "white",
      alignSelf: "center",
      borderWidth: 4,
      borderColor: "white",
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <LoaderModel
        visible={loaderModel}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
      <StatusBar translucent backgroundColor="transparent" />
      {showCamera ? (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            photo={isPhoto}
            video={true}
            audio={true}
            torch={isTorchOn ? "on" : "off"}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              padding: 15,
              alignSelf: "center",
            }}
          >
            <TouchableOpacity
              style={{
                width: 100,
              }}
              onPress={() => navigationState()}
            >
              <Text
                style={{
                  fontSize: 16,
                  top: Platform.OS == "ios" ? 40 : 20,
                  fontFamily: font.bold(),
                  color: "white",
                }}
              >
                {t("cancel")}
              </Text>
            </TouchableOpacity>

            {startRecord && (
              <Text
                style={{
                  fontSize: 16,
                  top: Platform.OS == "ios" ? 40 : 20,
                  fontFamily: font.bold(),
                  color: "red",
                }}
              >
                {t("timer")}: {timer} {t("sec")}
              </Text>
            )}
            <TouchableOpacity
              style={{
                width: 100,
              }}
              onPress={toggleTorch}
            >
              <Image
                source={
                  isTorchOn
                    ? require("../../Assets/Icons/flash_on.png")
                    : require("../../Assets/Icons/flash.png")
                }
                style={{
                  top: Platform.OS == "ios" ? 40 : 25,
                  height: 20,
                  width: 20,
                  right: 10,
                  alignSelf: "flex-end",
                  tintColor: "white",
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {showGellary == true || data.length > 0 ? (
            <FlatList
              style={{ width: "100%", bottom: 145, position: "absolute" }}
              horizontal={true}
              showsVerticalScrollIndicator={false}
              data={data}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    Platform.OS === "ios"
                      ? ImagePicker.openPicker({
                          width: 300,
                          height: 400,
                          cropping: false,
                          compressImageQuality: 0.2,
                          cropperCircleOverlay: false,
                        }).then((image) => {
                          if (image.path) {
                            navigation.navigate("ImageUploadGallery", {
                              path: image.path,
                              value: "camera",
                            });
                          }
                        })
                      : navigation.navigate("ImageUploadGallery", {
                          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          path: item?.node?.image?.uri,
                          value: "camera",
                        });
                  }}
                >
                  <Image
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    source={{ uri: item.node.image.uri }}
                    style={{ width: 80, height: 100, paddingHorizontal: 5 }}
                  />
                </TouchableOpacity>
              )}
            />
          ) : null}

          <View style={styles.buttonContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                backgroundColor: "yellow",
              }}
            ></View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.camButton, { alignSelf: "flex-end" }]}
                onPress={() => {
                  selectImage();
                }}
              >
                <Image
                  source={require("../../Assets/Icons/Gallary.png")}
                  style={{
                    height: 40,
                    width: 40,
                    alignSelf: "center",
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {isPhoto ? (
                <TouchableOpacity
                  style={styles.camButton}
                  onPress={capturePhoto}
                >
                  <Image
                    source={require("../../Assets/Icons/Photo_Click.png")}
                    style={{
                      height: 60,
                      width: 60,
                      alignSelf: "center",
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ) : (
                <>
                  {startRecord ? (
                    <TouchableOpacity
                      style={[styles.stopvideocamButton]}
                      onPress={() => stopRecording()}
                    >
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          backgroundColor: "red",
                          borderRadius: 4,
                        }}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        style={[styles.videocamButton]}
                        onPress={() => startRecording()}
                      ></TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {cameraType ? (
                <TouchableOpacity
                  disabled={startRecord}
                  style={[styles.camButton]}
                  onPress={() => setCameraType(false)}
                >
                  <Image
                    source={require("../../Assets/Icons/Rotate_Camera.png")}
                    style={{
                      height: 30,
                      width: 30,
                      resizeMode: "contain",
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  disabled={startRecord}
                  style={[styles.camButton]}
                  onPress={() => setCameraType(true)}
                >
                  <Image
                    source={require("../../Assets/Icons/Rotate_Camera.png")}
                    style={{
                      height: 30,
                      width: 30,
                      resizeMode: "contain",
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flex: 1, flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: !isPhoto ? "#5B5B5E" : "rgba(0,0,0,0.01)",
                  borderRadius: 10,
                  height: 35,
                  justifyContent: "center",
                  alignItems: "center",
                  width: 65,
                }}
                onPress={() => {
                  onVideoclick();
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: font.bold(),
                    color: "white",
                    alignSelf: "center",
                  }}
                >
                  {t("video")}
                </Text>
              </TouchableOpacity>
              <View style={{ width: 10 }}></View>
              <TouchableOpacity
                style={{
                  backgroundColor: isPhoto ? "#5B5B5E" : "rgba(0,0,0,0.01)",
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 35,
                  width: 65,
                }}
                disabled={disable}
                onPress={() => {
                  onPhotoclick();
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: font.bold(),
                    color: "white",
                    alignSelf: "center",
                  }}
                >
                  {t("photo")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}
