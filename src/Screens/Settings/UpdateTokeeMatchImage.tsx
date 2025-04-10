import React, { useEffect, useState } from "react";
import MainComponent from "../../Components/MainComponent/MainComponent";
import {
  appBarText,
  iconTheme,
  searchBar,
  themeModule,
} from "../../Components/Colors/Colors";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  PermissionsAndroid,
  View,
} from "react-native";
import { Platform } from "react-native";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import DeviceInfo from "react-native-device-info";
import { font } from "../../Components/Fonts/Font";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { SetProfileModal } from "../Modals/SetProfileModel";
const isDarkMode = true;
import ImagePicker from "react-native-image-crop-picker";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { useDispatch, useSelector } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import { LoaderModel } from "../Modals/LoaderModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  deletePreferenceImage,
  upploadTokeePreferenceImage,
} from "../../Constant/Api";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { setMyProfleData } from "../../Redux/MessageSlice";
import FastImage from "react-native-fast-image";
import renderIf from "../../Components/renderIf";
import {
  checkImageNudity,
  getRemainingSuspensionDays,
  updateViolationAttempt,
} from "../agora/agoraHandler";
import WarningModal from "../Modals/WarningModal";
import { setUserBanned, setUserSuspendedDays } from "../../reducers/userBanSlice";

let banType = "Warning";
let banMessage = "";
let banTitle = "";

export default function UpdateTokeeMatchImage({ navigation, route }: any) {
  const { t } = useTranslation();
  const navigationn = useNavigation();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderMoedl] = useState(false);
  const [image, setImage] = useState(0);
  const dispatch = useDispatch();
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [errorModel, setErrorModel] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [images, setImages] = useState({
    firstImage: "",
    secondImage: "",
    thirdImage: "",
    fourthImage: "",
    fifthImage: "",
  });
  const [openProfileModal, SetOpenProfileModal] = useState(false);
  const [initialImages, setInitialImages] = useState([]); // Store images from API with IDs
  const [changedImages, setChangedImages] = useState({});
  const myprofileData = useSelector(
    (state) =>
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      state?.message?.myProfileData
  );
  console.log("myprofile data", myprofileData);
  const validateImages = () => {
    const { firstImage, secondImage, thirdImage, fourthImage, fifthImage } =
      images;

    // Check if at least one image is uploaded
    if (firstImage || secondImage || thirdImage || fourthImage || fifthImage) {
      return true; // At least one image is uploaded
    }

    return false; // No images uploaded
  };

  const forImageSelection = (num: number) => {
    setImage(num);
    SetOpenProfileModal(true);
  };

  const handleDelete = (imageKey) => {
    // Count non-empty images
    const nonEmptyImages = Object.values(images).filter(
      (image) => image !== ""
    ).length;

    // Prevent deletion if there's only one image left
    if (nonEmptyImages <= 1) {
      Alert.alert(
        "Cannot Delete",
        "You must keep at least one image.",
        [{ text: "OK" }],
        { cancelable: true }
      );
      return;
    }

    // Collect image ID to delete
    const imageToDelete = initialImages.find(
      (image) => image.image === images[imageKey]
    );

    if (imageToDelete) {
      // Call delete API if the image exists in initialImages
      deleteImageApi(imageToDelete.id);
    }

    // Clear the selected image slot
    const updatedImages = { ...images };
    updatedImages[imageKey] = ""; // Clear the selected image slot
    setImages(updatedImages);

    // Update initialImages if the deleted image exists in the initial API data
    const updatedInitialImages = initialImages.filter(
      (img) => img.image !== images[imageKey]
    );
    setInitialImages(updatedInitialImages);
  };

  const deleteImageApi = (imageId) => {
    const headers2 = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    // API payload
    const payload = {
      image_id: [imageId], // Send image ID as an array
    };

    // Call the delete API
    PostApiCall(
      deletePreferenceImage, // API URL for deleting images
      payload,
      headers2,
      navigationn,
      (responseData, errorStr) => {
        if (responseData) {
          console.log("Image deleted successfully:", responseData);
          const myData = myprofileData;
          console.log("delte api not called");
          const uploadedImages = responseData?.data;

          dispatch(setMyProfleData({}));

          dispatch(
            setMyProfleData({
              ...myData,
              preference_images: uploadedImages,
            })
          );
        } else {
          console.log("Error deleting image:", errorStr);
        }
      }
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      if (globalThis.isUserseventeenYearsOld == true) {
        const newImages = { ...images };
        console.log("myprofile data >>>", myprofileData.preference_images);

        myprofileData.preference_images.forEach((item, index) => {
          console.log("item>>>", item);
          if (index === 0) newImages.firstImage = item.image;
          if (index === 1) newImages.secondImage = item.image;
          if (index === 2) newImages.thirdImage = item.image;
          if (index === 3) newImages.fourthImage = item.image;
          if (index === 4) newImages.fifthImage = item.image;
        });

        setImages(newImages); // Set the images state
        setInitialImages(myprofileData.preference_images); // Store initial images with IDs
      } else {
        globalThis.errorMessage =
          "You haven't completed the Tokee Match onboarding process yet." +
          "Please complete it first to proceed.";
        setErrorModel(true);
      }
    }, []) // Dependency array can include `myprofileData` to trigger re-run on change
  );

  const updateImageState = (imagePath) => {
    const updatedImages = { ...images };
    const updatedChanges = { ...changedImages };

    switch (image) {
      case 1:
        updatedImages.firstImage = imagePath;
        //@ts-expect-error
        updatedChanges.firstImage = imagePath; // Track change
        break;
      case 2:
        updatedImages.secondImage = imagePath;
        //@ts-expect-error
        updatedChanges.secondImage = imagePath; // Track change
        break;
      case 3:
        updatedImages.thirdImage = imagePath;
        //@ts-expect-error
        updatedChanges.thirdImage = imagePath; // Track change
        break;
      case 4:
        updatedImages.fourthImage = imagePath;
        //@ts-expect-error
        updatedChanges.fourthImage = imagePath; // Track change
        break;
      case 5:
        updatedImages.fifthImage = imagePath;
        //@ts-expect-error
        updatedChanges.fifthImage = imagePath; // Track change
        break;
      default:
        break;
    }

    setImages(updatedImages); // Update images state
    setChangedImages(updatedChanges); // Track changes
  };

  const typeValue = "image/jpeg"; // Example MIME type
  const nameValue = "example.jpg"; // Default name for the image
  const uploaddata = new FormData();

  const result = Object.values(images)
    .filter((uri) => uri !== "") // Exclude empty URIs
    .map((uri, index) => ({
      uri: Platform.OS === "android" ? uri : uri?.replace("file://", ""), // Remove `file://` prefix for iOS
      type: typeValue, // Set the MIME type
      name: `image_${index + 1}.jpg`, // Dynamically name each image
    }));

  result.forEach((asset, index) => {
    //@ts-expect-error
    uploaddata.append(`preference_images[${index}]`, {
      uri: asset.uri,
      name: asset.name,
      type: asset.type,
    });
  });

  const editProfileApi = () => {
    const imagesToUpload = [];
    const imagesToDelete = [];

    // Detect deleted images by comparing initialImages with current images state
    initialImages.forEach((initialImage) => {
      //@ts-expect-error
      const stillExists = Object.values(images).includes(initialImage.image);
      if (!stillExists) {
        //@ts-expect-error
        imagesToDelete.push(initialImage.id); // Collect deleted image IDs
      }
    });

    // Detect new images by comparing current images state with initialImages
    Object.values(images).forEach((imageUri) => {
      if (
        imageUri && // Ensure image URI is not empty
        !initialImages.some(
          (img) =>
            //@ts-expect-error
            img.image === imageUri
        ) // Image is not in initialImages
      ) {
        //@ts-expect-error
        imagesToUpload.push({
          uri:
            Platform.OS === "android"
              ? imageUri
              : imageUri.replace("file://", ""), // Ensure correct URI format
          type: "image/jpeg",
          name: `image_${new Date().getTime()}.jpg`, // Use a unique name
        });
      }
    });

    const uploaddata = new FormData();
    imagesToUpload.forEach((asset, index) => {
      //@ts-expect-error
      uploaddata.append(`preference_images[${index}]`, {
        //@ts-expect-error
        uri: asset.uri,
        //@ts-expect-error
        name: asset.name,
        //@ts-expect-error
        type: asset.type,
      });
    });

    const headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    const headers2 = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    setloaderMoedl(true);

    // Ensure internet connectivity before making the API call
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        setNoInternetModel(true);
        setloaderMoedl(false);
        return;
      } else {
        // Upload new images
        console.log("Uploading images:", uploaddata);
        PostApiCall(
          upploadTokeePreferenceImage,
          uploaddata,
          headers,
          navigationn,
          (uploadResponse, uploadError) => {
            console.log("Upload Response:", uploadResponse);
            console.log("Upload Error:", uploadError);

            // Delete removed images
            if (imagesToDelete.length > 0) {
              console.log("Deleting images:", imagesToDelete);
              PostApiCall(
                deletePreferenceImage,
                { image_id: imagesToDelete },
                headers2,
                navigationn,
                (deleteResponse, deleteError) => {
                  console.log("Delete Response:", deleteResponse);
                  console.log("Delete Error:", deleteError);
                  const myData = myprofileData;
                  console.log("delte api not called");
                  const uploadedImages = deleteResponse?.data;

                  dispatch(setMyProfleData({}));

                  dispatch(
                    setMyProfleData({
                      ...myData,
                      preference_images: uploadedImages,
                    })
                  );
                  setloaderMoedl(false);
                  navigationn.goBack();
                }
              );
            } else {
              const myData = myprofileData;
              console.log("delte api not called");
              const uploadedImages = uploadResponse?.data;

              dispatch(setMyProfleData({}));

              dispatch(
                setMyProfleData({
                  ...myData,
                  preference_images: uploadedImages,
                })
              );
              setloaderMoedl(false);
              navigationn.goBack();
            }
          }
        );
      }
    });
  };

  const renderImageSection = (imageKey, imageUri, index) => (
    <View
      style={[
        styles.imageContainer,
        {
          height: imageKey == "firstImage" ? 350 : 166,
          backgroundColor: searchBar().back_ground,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          borderStyle: "dashed",
          marginTop: imageKey == "thirdImage" ? 20 : 0,
          borderWidth: 1,
          borderColor: iconTheme().iconColorNew,
        },
      ]}
    >
      {imageUri ? (
        <View style={styles.imageWrapper}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(imageKey)}
          >
            <Image
              source={require("../../Assets/Icons/Delete.png")}
              style={styles.deleteIcon}
            />
          </TouchableOpacity>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => forImageSelection(index)}
          >
            <Image
              source={require("../../Assets/Icons/pen.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          // style={styles.cameraButton}
          onPress={() => {
            if (!imageUri) forImageSelection(index);
          }}
        >
          {/* <Text style={{fontSize:18,color:searchBar().back_ground}}>+</Text> */}
          <Image
            source={require("../../Assets/Image/uil_plus.png")}
            style={styles.cameraIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },
    row: {
      flexDirection: "row",
      marginTop: 15,
    },
    imageColumn: {
      width: "35%",
      height: 330,
      margin: 10,
      justifyContent: "center",
      alignSelf: "center",
      // marginBottom: 16,
    },
    imageColumn2: {
      width: "48%",
      height: 200,
      marginTop: 10,
      marginBottom: 16,
    },
    imageContainer: {
      height: 180,
      borderWidth: 1,
      borderColor: "#ccc",
      alignItems: "center",
      justifyContent: "center",
      // marginBottom: 16,
    },
    imageColumn1: {
      width: "60%",
      height: 330,
      // marginBottom: 16,
    },
    imageWrapper: {
      height: "100%",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      height: "90%",
      width: "90%",
    },
    cameraButton: {
      borderRadius: 50,
      backgroundColor: "#ccc",
      alignItems: "center",
      justifyContent: "center",
      padding: 10,
    },
    cameraIcon: {
      height: 35,
      width: 35,
    },
    editButton: {
      height: 20,
      width: 20,
      backgroundColor: themeModule().theme_background,
      position: "absolute",
      right: 5,
      bottom: 12,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteButton: {
      height: 30,
      width: 30,
      backgroundColor: themeModule().theme_background,
      position: "absolute",
      right: 3,
      top: 3,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
    },
    icon: {
      height: 12,
      width: 12,
    },
    deleteIcon: {
      height: 15,
      width: 15,
    },
  });

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t("camera_permission"),
            message: t("cameraPermission"),
            buttonPositive: t("ok"),
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

  const selectImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 800,
        height: 800,
        // cropping: true,
        compressImageQuality: 0.2,
        // cropperCircleOverlay: true,
        mediaType: "photo",
      }).then((clickedImage) => {
        if (clickedImage) {
          SetOpenProfileModal(false);

          setTimeout(async () => {
            setloaderMoedl(true);
            // Add delay before making API call
            const filePath = clickedImage.path.startsWith("file://")
              ? clickedImage.path
              : `file://${clickedImage.path}`;

            const response = await checkImageNudity(filePath);
            console.log(
              "Nudity Check Response:",
              response?.data?.is_nude_file
            );
            if (response?.data?.is_nude_file == true) {
              setloaderMoedl(false);
              SetOpenProfileModal(false);
              const reason = `In Tokee Match, the user uploaded inappropriate image.`;
              const result = await updateViolationAttempt(reason);
              if (result.success) {
        const remainingDays = getRemainingSuspensionDays(result?.data?.suspended_remove_date);

                if (result.data.violation_attempt == 1) {
                  banType = "Warning";
                  setWarningModalVisible(true);
                } else if (
                  result.data.violation_attempt > 1 &&
                  result.data.violation_attempt <= 4
                ) {
                  banType = "Ban";
                  dispatch(setUserSuspendedDays(remainingDays));
                  setWarningModalVisible(true);
                  dispatch(setUserBanned(result.data.is_ban));
                } else if (result.data.violation_attempt == 5) {
                  banType = "Ban";
                  banMessage = `Your account has been suspended for ${remainingDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
                  banTitle = "Account Suspended!";
                  dispatch(setUserSuspendedDays(remainingDays));
                  setWarningModalVisible(true);
                  dispatch(setUserBanned(result.data.is_ban));
                } else if (result.data.violation_attempt > 5) {
                  banType = "Ban";
                  banMessage = `Your account has been permanently suspended due to multiple violations of our community guidelines. This decision is final, and you will no longer be able to access your account.`;
                  banTitle = "Account Permanently Suspended!";
                  setWarningModalVisible(true);
                  dispatch(setUserBanned(true)); // Ensure the user is marked as permanently banned
                } else {
                  globalThis.errorMessage =
                    "This photo violates our guidelines as it contains inappropriate content. Please upload a suitable image.";
                  setErrorAlertModel(true);
                }
              }
            } else {
              setloaderMoedl(false);
              updateImageState(filePath);
              SetOpenProfileModal(false);
            }
          }, 500);
        }
      });
    } else {
      console.log("PERMISSION NOT GRANTED");
    }
  };

  // Function to handle image capture
  const captureImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openCamera({
        mediaType: "photo",
        compressImageQuality: 0.6,
      })
        .then((clickedImage) => {
          if (clickedImage) {
            SetOpenProfileModal(false);

            setTimeout(async () => {
              setloaderMoedl(true);
              // Add delay before making API call
              const filePath = clickedImage.path.startsWith("file://")
                ? clickedImage.path
                : `file://${clickedImage.path}`;

              const response = await checkImageNudity(filePath);
              console.log(
                "Nudity Check Response:",
                response?.data?.is_nude_file
              );
              if (response?.data?.is_nude_file == true) {
                setloaderMoedl(false);
                SetOpenProfileModal(false);
                const reason = `In Tokee Match, the user uploaded inappropriate image.`;
                const result = await updateViolationAttempt(reason);
                if (result.success) {
           const remainingDays = getRemainingSuspensionDays(result?.data?.suspended_remove_date);

                  if (result.data.violation_attempt == 1) {
                    banType = "Warning";
                    setWarningModalVisible(true);
                  } else if (
                    result.data.violation_attempt > 1 &&
                    result.data.violation_attempt <= 4
                  ) {
                    banType = "Ban";
                    dispatch(setUserSuspendedDays(remainingDays));
                    setWarningModalVisible(true);
                    dispatch(setUserBanned(result.data.is_ban));
                  } else if (result.data.violation_attempt == 5) {
                    banType = "Ban";
                    banMessage = `Your account has been suspended for ${remainingDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
                    banTitle = "Account Suspended!";
                    dispatch(setUserSuspendedDays(remainingDays));
                    setWarningModalVisible(true);
                    dispatch(setUserBanned(result.data.is_ban));
                  } else if (result.data.violation_attempt > 5) {
                    banType = "Ban";
                    banMessage = `Your account has been permanently suspended due to multiple violations of our community guidelines. This decision is final, and you will no longer be able to access your account.`;
                    banTitle = "Account Permanently Suspended!";
                    setWarningModalVisible(true);
                    dispatch(setUserBanned(true)); // Ensure the user is marked as permanently banned
                  } else {
                    globalThis.errorMessage =
                      "This photo violates our guidelines as it contains inappropriate content. Please upload a suitable image.";
                    setErrorAlertModel(true);
                  }
                }
              } else {
                setloaderMoedl(false);
                updateImageState(filePath);
                SetOpenProfileModal(false);
              }
            }, 500);
          }
        })
        .catch(() => {
          SetOpenProfileModal(false);
        });
    }
  };

  const buttonPress = () => {
    //  Keyboard.dismiss();

    navigationn.goBack();
  };

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <SetProfileModal
        visible={openProfileModal}
        onRequestClose={() => SetOpenProfileModal(false)}
        Camera={() => captureImage()}
        select={() => selectImage()}
        cancel={() => SetOpenProfileModal(false)}
      />

      <NoInternetModal
        visible={noInternetModel}
        onRequestClose={() => setNoInternetModel(false)}
        headingTaxt={t("noInternet")}
        NoInternetText={t("please_check_internet")}
        cancelButton={() => setNoInternetModel(false)}
      />

      <WarningModal
        visible={warningModalVisible}
        type={banType}
        onClose={() => {
          if (
            banTitle === "Account Suspended!" ||
            banTitle === "Account Permanently Suspended!"
          ) {

            setWarningModalVisible(false);
                    banType = "Warning";
                        banMessage = "";
                        banTitle = "";
                        dispatch(setUserSuspendedDays(0));
            navigation.push("Login");
          } else {
            setWarningModalVisible(false);
          }
        }}
        message={banMessage}
        title={banTitle}
      />

      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        <TopBar
          showTitle={true}
          title={t("update_tokee_match_image")}
          checked={globalThis.selectTheme}
        />

        {/* /////////////////////// **********   TopBar Text    ********** //////////////////// */}
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")} </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const isAtLeastOneImageValid = validateImages();
                if (!isAtLeastOneImageValid) {
                  globalThis.errorMessage = "" + t("please_select_one_image");
                  setErrorAlertModel(true);
                } else {
                  editProfileApi();
                }
              }}
              //   onPress={() => {
              //     if (
              //       !globalThis.isUserPremium &&
              //       userTagline?.length > charLimit
              //     ) {
              //       setShowBio(true);
              //       setShowPremiumAlert(true);
              //     } else {
              //       saveDataButton();
              //     }
              //   }}
            >
              <Text style={styles.cancelText}>{t("save")} </Text>
            </TouchableOpacity>
          </View>
        </View>
        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
        globalThis.selectTheme === "indiaTheme" ||
        globalThis.selectTheme === "englandTheme" ||
        globalThis.selectTheme === "americaTheme" ||
        globalThis.selectTheme === "mexicoTheme" ||
        globalThis.selectTheme === "usindepTheme" ? (
          <ImageBackground
            source={settingTop().BackGroundImage}
            resizeMode="cover" // Update the path or use a URL
            style={{
              height: "100%",
              width: windowWidth,
              marginTop: 0,
              position: "absolute",
              bottom: 0,
              zIndex: 0,
              top: chatTop().top,
            }}
          ></ImageBackground>
        ) : null}
      </View>

      <View style={styles.chatContainer}>
        <Text>{t("enahance_text")}</Text>
        <View style={styles.row}>
          <View style={[styles.imageColumn1]}>
            {renderImageSection("firstImage", images.firstImage, 1)}
          </View>
          <View style={styles.imageColumn}>
            {renderImageSection("secondImage", images.secondImage, 2)}
            {renderImageSection("thirdImage", images.thirdImage, 3)}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: 0,
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View style={styles.imageColumn2}>
            {renderImageSection("fourthImage", images.fourthImage, 4)}
          </View>
          <View style={styles.imageColumn2}>
            {renderImageSection("fifthImage", images.fifthImage, 5)}
          </View>
        </View>
        {/* <View style={styles.row}>
          <View style={styles.imageColumn}>
            {renderImageSection("firstImage", images.firstImage, 1)}
            {renderImageSection("secondImage", images.secondImage, 2)}
          </View>

          <View style={styles.imageColumn}>
            {renderImageSection("thirdImage", images.thirdImage, 3)}
            {renderImageSection("fourthImage", images.fourthImage, 4)}
            {renderImageSection("fifthImage", images.fifthImage, 5)}
          </View>
        </View> */}
      </View>
      <LoaderModel
        visible={loaderModel}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />

      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
      {renderIf(
        errorModel == true,
        <ErrorAlertModel
          visible={errorModel}
          onRequestClose={() => setErrorModel(false)}
          errorText={globalThis.errorMessage}
          cancelButton={() => {
            setErrorModel(false);
            navigation.navigate("TokeeMatchOnBoard");
          }}
        />
      )}
    </MainComponent>
  );
}
