import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import ImagePicker from "react-native-image-crop-picker";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  iconTheme,
  searchBar,
  setWallpaper,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { get_profile, update_profile } from "../../Constant/Api";
import { settingTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";
import { SetProfileModal } from "../Modals/SetProfileModel";
import axios from "axios";
import renderIf from "../../Components/renderIf";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";

const isDarkMode = true;

// eslint-disable-next-line
export default function EditProfileScreen({ navigation, route }: any) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [filePath, setFilePath] = useState("");
  const [wallpaperModel, setWallpaperModel] = useState(false);
  const [coverModal, setCoverModal] = useState(false);
  const [avatarModel, setAvatarModel] = useState(false);
  const [loaderModel, setloaderMoedl] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [userName, setuserName] = useState(route?.params?.userName);
  const [userTagline, setUserTagline] = useState(
    route?.params?.userTagline != null ? route?.params?.userTagline : ""
  );
  // const [userProfile, setProfile] = useState();
  const [stickers, setStickers] = useState([]);
  const [dragText, setDragText] = useState([]);
  const { t } = useTranslation();

  const focus = useIsFocused();
  const navigationn = useNavigation();
  const userImageUrl = route?.params?.userImage || globalThis.userImage;
  const filePathUrl = filePath;
  const cacheBuster = Date.now();

  ////////   **** FOR PREMIMUM USER ****   //////

  let premiumAlertHeading = "";
  let premiumAlertSubHeading =
    "Upgrade to Premium to gain access to add bio links.";
  let premiumAlertFirstButtonText = "Ok";
  let premiumAlertSecondButtonText = "Go To Premium";
  const [premiumUser, setpremiumUser] = useState(globalThis.isUserPermimum);
  const [inputBoxes, setInputBoxes] = useState([]);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

  // Regex pattern for basic URL validation
  const urlRegex =
    /^(https?:\/\/)?([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,})(\/[^\s]*)?$/i;
  const websiteRegex = /^[a-zA-Z]+([ '-][a-zA-Z]+)*$/;
  // const regex = new RegExp(`\\b(${badword[0].words.join('|')})\\b`, 'i');
  // Function to add a new InputBox
  const addInputBox = () => {
    // Check if all input fields are filled and URLs are valid
    const incompleteFields = inputBoxes.filter(
      (box) => !box.website || !box.url
    );
    const invalidWebsites = inputBoxes.filter(
      (box) => box.website && !websiteRegex.test(box.website)
    );
    const invalidUrls = inputBoxes.filter(
      (box) => box.url && !urlRegex.test(box.url)
    );

    if (incompleteFields.length > 0) {
      // Show alert for incomplete fields
      Alert.alert(
        "Incomplete Links",
        "Please fill in all fields before adding more bio links.",
        [{ text: "OK" }]
      );
    } else if (invalidWebsites.length > 0) {
      // Show alert for invalid website names
      Alert.alert("Invalid Label", "Please ensure all label names are valid.", [
        { text: "OK" },
      ]);
    } else if (invalidUrls.length > 0) {
      // Show alert for invalid URLs
      Alert.alert("Invalid URLs", "Please ensure all URLs are valid.", [
        { text: "OK" },
      ]);
    } else if (inputBoxes.length >= globalThis.profileBioLinksLimit) {
      // Show alert for exceeding the limit
      Alert.alert("Limit Reached", "You can only add up to 10 bio links.", [
        { text: "OK" },
      ]);
    } else {
      // Add new input box if all fields are valid and limit is not reached
      setInputBoxes([...inputBoxes, { id: Date.now(), website: "", url: "" }]);
    }
  };
  // Function to remove an InputBox by ID
  const removeInputBox = (id) => {
    setInputBoxes(inputBoxes.filter((box) => box.id !== id));
  };

  // Function to handle text input changes
  const handleInputChange = (id, field, value) => {
    setInputBoxes(
      inputBoxes.map((box) =>
        box.id === id ? { ...box, [field]: value } : box
      )
    );
  };

  const imageUrl =
    filePathUrl.length === 0
      ? `${userImageUrl}?${cacheBuster}`
      : `${filePathUrl}?${cacheBuster}`;

  ////////////////////// // **********  Methods For Navigation ********** ///////////////////////////
  const buttonPress = () => {
    navigationn.goBack();
  };

  useEffect(() => {
    getProfileApi();
    setFilePath(imageUrl);
  }, [focus]);

  ////////////////////// // **********  Select Image From Lounch Camera  ********** ///////////////////////////
  const captureImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker?.openCamera({
        width: 150,
        height: 150,
        cropping: true,
        compressImageQuality: 0.1,
        mediaType: "photo",
      })
        .then((image) => {
          if (image !== undefined && image !== null) {
            setFilePath(image?.path);
            setWallpaperModel(false);
          }
        })
        .catch(() => {
          setWallpaperModel(false);
        });
    }
  };

  const getProfileApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(get_profile, headers, navigation, (ResponseData, ErrorStr) => {
      profileApiSuccess(ResponseData, ErrorStr);
    });
  };

  // eslint-disable-next-line
  const profileApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      // Navigate to another screen or handle the error in some way
    } else {
      console.log(
        "ResponseData=========================1",
        ResponseData.setting
      );

      ResponseData.setting.map((premimumKey) => {
        if (premimumKey.key == "PREMIUM_PROFILE_LINKS_LIMITS") {
          console.log("key", premimumKey.value);
          // setProfileBioLinksLimit(premimumKey.value);
          globalThis.profileBioLinksLimit = premimumKey.value;
        }
      });
      console.log("profileBioLinksLimit", globalThis.profileBioLinksLimit);

      let apiResponse = JSON.parse(ResponseData.data.bio_link);
      setInputBoxes(premiumUser ? apiResponse : []);
      setCoverImage(ResponseData.data.cover_image);
      setFilePath("");

      setuserName(ResponseData.data.first_name);
      setUserTagline(ResponseData.data.tagline);
      // globalThis.displayName == ResponseData.data.first_name;
      // setFilePath(ResponseData.data.profile_image);

      if (ResponseData.data.sticker_position !== undefined) {
        try {
          const stickerData = JSON.parse(ResponseData.data.sticker_position);
          setStickers(stickerData);
        } catch (error) {
          console.error("Error parsing sticker_position:", error);
        }
      }

      if (ResponseData.data.Image_text !== null) {
        try {
          const imageTextData = JSON.parse(ResponseData.data.Image_text);
          setDragText(imageTextData);
        } catch (error) {
          console.error("Error parsing image text:", error);
        }
      }

      //
      setloaderMoedl(false);
    }
  };

  const captureCoverImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker?.openCamera({
        width: 150,
        height: 150,
        cropping: true,
        mediaType: "photo",
      })
        .then((image) => {
          if (image !== undefined && image !== null) {
            setCoverImage(image?.path);
            setCoverModal(false);
          }
        })
        .catch(() => {
          setCoverModal(false);
        });
    }
  };

  ////////////////////// // **********  Sendig Data as Parameter  ********** //////////////////////////

  const captureImageAvatar = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker?.openCamera({
        width: 100,
        height: 100,
        cropping: true,
        compressImageQuality: 0.1,
        mediaType: "photo",
      })
        .then((image) => {
          if (image !== undefined && image !== null) {
            setAvatarModel(false);
            fetchAIResponse(image?.path);
          }
        })
        .catch(() => {
          setAvatarModel(false);
        });
    }
  };
  ////////////////////// // **********  Sendig Data as Parameter  ********** //////////////////////////

  const imageUpload = new FormData();
  if (filePath !== "") {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    imageUpload.append("profile_image", {
      uri:
        Platform.OS === "android"
          ? "file://" + filePath
          : filePath?.replace("file://", ""),
      type: "image/jpeg", // or photo.type
      name: "userImage.jpg",
    });
  }
  ////////////////////// // **********   Headers for api ********** ////////////////////////
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
  };

  ////////////////////// // **********  Sendig Data as Parameter  ********** ///////////////////////
  const uploaddata = new FormData();
  uploaddata.append("first_name", userName != null ? userName : "");
  uploaddata.append("tagline", userTagline != null ? userTagline : "");
  uploaddata.append(
    "bio_links",
    inputBoxes != null ? JSON.stringify(inputBoxes) : ""
  );
  if (filePath !== "") {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    uploaddata.append("profile_image", {
      uri:
        Platform.OS === "android" ? filePath : filePath?.replace("file://", ""),
      type: "image/jpeg", // or photo.type
      name: "userImage.jpg",
    });
  }

  if (coverImage !== "") {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    uploaddata.append("cover_image", {
      uri:
        Platform.OS === "android"
          ? coverImage
          : coverImage?.replace("file://", ""),
      type: "image/jpeg", // or photo.type
      name: "userImage.jpg",
    });
  }

  ////////////////////// // **********  Select Image From ImageLibarary  ********** //////////////////////

  const selectImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        // width: 300,
        // height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
        // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined) {
          setFilePath(image.path);
          setWallpaperModel(false);
        }
      });
    } else {
      console.log("PERMISSION nOT GRANTED");
    }
  };

  const selectCoverImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        // width: 300,
        // height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
        // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined) {
          setCoverImage(image.path);
          setCoverModal(false);
        }
      });
    } else {
      console.log("PERMISSION nOT GRANTED");
    }
  };

  ////////////////////// // **********  Select Image From Avatar  ********** //////////////////////

  const selectImageAvatar = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined) {
          setAvatarModel(false);
          fetchAIResponse(image?.path);
        }
      });
    } else {
      console.log("PERMISSION nOT GRANTED");
    }
  };
  const saveDataButton = () => {
    // Regex patterns
    const urlRegex =
      /^(https?:\/\/)?([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,})(\/[^\s]*)?$/i;
    const websiteRegex = /^[a-zA-Z]+([ '-][a-zA-Z]+)*$/;

    // Validation
    const incompleteFields = inputBoxes.filter(
      (box) => !box.website || !box.url
    );
    const invalidWebsites = inputBoxes.filter(
      (box) => box.website && !websiteRegex.test(box.website)
    );
    const invalidUrls = inputBoxes.filter(
      (box) => box.url && !urlRegex.test(box.url)
    );

    if (incompleteFields.length > 0) {
      // Show alert for incomplete fields
      Alert.alert(
        "Incomplete Links",
        "Please fill in all fields before adding more bio links.",
        [{ text: "OK" }]
      );
    } else if (invalidWebsites.length > 0) {
      // Show alert for invalid website names
      Alert.alert("Invalid Label", "Please ensure all label names are valid.", [
        { text: "OK" },
      ]);
    } else if (invalidUrls.length > 0) {
      // Show alert for invalid URLs
      Alert.alert("Invalid URLs", "Please ensure all URLs are valid.", [
        { text: "OK" },
      ]);
    } else {
      // Add new input box if all fields are valid

      // Show confirmation alert if all fields are valid
      Alert.alert(t("confirm"), t("do_you_want_to_update_your_profile"), [
        { text: t("cancel") },
        { text: t("yes"), onPress: () => editProfileApi() },
      ]);
    }
  };

  const editProfileApi = () => {
    console.log("uploaddata>>>>", uploaddata);

    setloaderMoedl(true);
    /////////////////////// ********** Internet Permission   ********** ////////////////////
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        setloaderMoedl(false);
        return;
      } else {
        PostApiCall(
          update_profile,
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

  /////////////////////// ********** Edit Profile Response    ********** ////////////////////
  // eslint-disable-next-line
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    // Custom logic to execute on success
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
    } else {
      globalThis.userImage = ResponseData.data.profile_image;
      globalThis.displayName = ResponseData.data.first_name;
      await AsyncStorage.setItem("userName", ResponseData.data.first_name);
      /// await AsyncStorage.getItem("userName");
      Alert.alert(t("success"), ResponseData.message, [
        { text: t("ok"), onPress: () => navigation.navigate("BottomBar") },
      ]);
      setloaderMoedl(false);
    }
  };
  /////////////////////// ********** Request Permission for Open Camera And Galary   ********** ////////////////////

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
    nameInputTextContainer: {
      marginRight: 16,
      marginLeft: 16,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
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
    Container: {
      marginTop: 20,
      justifyContent: "center",
      alignItems: "center",
      width: 100,
      alignSelf: "center",
    },
    circleImageLayout: {
      width: 70,
      height: 70,
      borderRadius: 35,
    },
    plusImageContainer: {
      position: "absolute",
      alignItems: "center",
      bottom: 70,
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    editTextContainer: {
      position: "absolute",
      alignItems: "center",
      backgroundColor: themeModule().theme_background,
      borderRadius: 25,
      height: 25,
      width: 45,
      elevation: 2,
      bottom: -15,
      justifyContent: "center",
    },
    plusImage1Layout: {
      width: 20,
      height: 20,
      tintColor: iconTheme().iconColor,
    },
    nameInputText: {
      fontSize: FontSize.font,
      padding: 0,
      marginTop: 10,
      color: COLORS.black,
      fontFamily: font.regular(),
    },
    phoneContainer: {
      justifyContent: "center",
      width: "100%",
      alignItems: "center",
      color: COLORS.black,
      // marginVertical: 30,
    },
    phoneText: {
      fontFamily: font.regular(),
      fontSize: FontSize.font,
    },
    nameTextContainer: {
      height: 50,
      alignItems: "flex-start",
      paddingLeft: 16,
    },
    nameText: {
      marginTop: 20,
      fontSize: FontSize.font,
      color: COLORS.black,
      fontFamily: font.semibold(),
    },
    newChatIcon: {
      alignItems: "center",
      height: DeviceInfo.isTablet() ? 27 : 20,
      width: DeviceInfo.isTablet() ? 27 : 20,
      tintColor: appBarText().textColor,
    },
    textInput: {
      backgroundColor: searchBar().back_ground,

      borderWidth: 1,
      borderRadius: 10,
      //  marginHorizontal: 10,
      fontSize: FontSize.font,
      paddingLeft: 10,
      opacity: 0.8,
      // marginTop: 20,
      color: COLORS.black,
      height: 48,
      fontFamily: font.semibold(),
    },
    feedbackTextInput: {
      height: 150,
      backgroundColor: searchBar().back_ground,

      borderWidth: 1,
      borderRadius: 10,
      marginHorizontal: 16,
      paddingLeft: 10,
      opacity: 0.8,
      // marginTop: 20,
      color: "#fff",
    },
  });

  // eslint-disable-next-line
  const fetchAIResponse = async (image: any) => {
    const data = new FormData();
    if (image !== null) {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      data.append("photo", {
        uri: Platform.OS === "android" ? image : image.replace("file://", ""),
        type: "image/jpeg",
        name: "photo.jpg",
      });
    }
    setloaderMoedl(true);

    try {
      axios({
        method: "post",
        maxBodyLength: Infinity,
        url: "https://public-api.mirror-ai.net/v2/generate?style<Kenga>",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          "X-Token": `${globalThis.mirrorApiKey}`,
        },
        data: data,
      })
        .then((response) => {
          setloaderMoedl(false);
          if (response.data.ok == true) {
            setloaderMoedl(false);
            navigation.navigate("AvatarScreen", {
              avatarImage: response.data.face.url,
              faceId: response.data.face.id,
              userName: userName,
              userTagline: userTagline != null ? userTagline : "",
            });
          } else {
            alert(response.data.error);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
          if (
            error.response &&
            error.response.data &&
            error.response.data.error
          ) {
            alert(error.response.data.error);
          } else {
            console.log("error.response.=======", error.response);
            //  alert("An error occurred while processing your request.");
          }
        });
    } catch (error) {
      setloaderMoedl(false);
    }
  };

  const userDetailData = {
    cover_image: route?.params?.userImage,
    profile_image: route?.params?.userImage,
    display_name: userName,
    stickers: stickers,
    dragtext: dragText,
  };
  const handlePress = () => {
    navigation.navigate("EditCoverImage", {
      data: userDetailData,
      param: "myProfile",
    });
  };

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      {/* /////////////////////// ********** Open Moedl For Camera   ********** //////////////////// */}
      <SetProfileModal
        visible={wallpaperModel}
        onRequestClose={() => setWallpaperModel(false)}
        Camera={() => captureImage()}
        select={() => selectImage()}
        cancel={() => setWallpaperModel(false)}
      />
 
      <SetProfileModal
        visible={coverModal}
        onRequestClose={() => setCoverModal(false)}
        Camera={() => captureCoverImage()}
        select={() => selectCoverImage()}
        cancel={() => setCoverModal(false)}
      />

      <PremiumAlert
        visible={showPremiumAlert}
        onRequestClose={() => setShowPremiumAlert(false)}
        cancel={() => setShowPremiumAlert(false)}
        Heading={premiumAlertHeading}
        SubHeading={premiumAlertSubHeading}
        FirstButton={premiumAlertFirstButtonText}
        SecondButton={premiumAlertSecondButtonText}
        firstButtonClick={() => setShowPremiumAlert(false)}
        secondButtonClick={() => navigation.navigate("TokeePremium")}
      />

      {/* /////////////////////// ********** Open Moedl For avatar   ********** //////////////////// */}
      <SetProfileModal
        visible={avatarModel}
        onRequestClose={() => setAvatarModel(false)}
        Camera={() => captureImageAvatar()}
        select={() => selectImageAvatar()}
        cancel={() => setAvatarModel(false)}
      />
      {/* /////////////////////// **********  Loader Model    ********** //////////////////// */}
      <LoaderModel
        visible={loaderModel}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />

      {/* /////////////////////// ********** Status Bar   ********** //////////////////// */}
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

        {/* /////////////////////// ********** Top Bar    ********** //////////////////// */}
        <TopBar
          showTitle={true}
          title={t("edit_profile")}
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
              onPress={() => saveDataButton()}
            >
              <Text style={styles.cancelText}>{t("save")} </Text>
            </TouchableOpacity>
          </View>
        </View>

        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
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
            }}
          ></ImageBackground>
        ) : null}
        {/* /////////////////////// ********** Profile View ********** //////////////////// */}
      </View>
      <View style={styles.chatContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            automaticallyAdjustKeyboardInsets={false}
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={{ flexGrow: 1 }}
            style={{ paddingBottom: 200, flex: 1, height: "100%" }}
          >
            <View style={{ height: "100%", flex: 1, paddingBottom: 200 }}>
              <TouchableOpacity
                style={{
                  height: 150,
                  width: "100%",
                  backgroundColor: "lightgray",
                  borderRadius: 5,
                  // overflow: 'hidden',
                }}
                onPress={() => handlePress()}
              >
                <ImageBackground
                  resizeMode="cover"
                  source={{ uri: coverImage }}
                  style={{
                    flex: 1,
                    borderRadius: 5,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.Container,
                      { position: "absolute", bottom: 0 },
                    ]}
                    onPress={() => setWallpaperModel(true)}
                  >
                    {filePath.length == 0 ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.circleImageLayout}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={{ uri: filePath }}
                        style={styles.circleImageLayout}
                        resizeMode="cover"
                      />
                    )}
                    {/* <View style={styles.plusImageContainer}>
                      <Image
                        source={require("../../Assets/Icons/Chat_top.png")}
                        style={styles.plusImage1Layout}
                        resizeMode="contain"
                      />
                    </View> */}
                    <View style={styles.editTextContainer}>
                      <Text
                        style={{
                          padding: 0,
                          color: appBarText().textColor,
                          fontSize: 12,
                          fontFamily: font.medium(),
                        }}
                      >
                        {t("edit")}
                      </Text>
                    </View>

                    {/*  */}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: 10,
                      bottom: 10,
                      backgroundColor: themeModule().theme_background,
                      padding: 5,
                      borderRadius: 30,
                    }}
                    onPress={() => handlePress()}
                  >
                    <Image
                      source={require("../../Assets/Icons/camera.png")}
                      style={[
                        styles.newChatIcon,
                        { tintColor: appBarText().textColor },
                      ]}
                    />
                  </TouchableOpacity>
                </ImageBackground>
              </TouchableOpacity>

              {renderIf(
                globalThis.showMirrorApiAvatar == "YES",
                <TouchableOpacity
                  style={[styles.phoneContainer, { marginTop: 25 }]}
                  onPress={() => setAvatarModel(true)}
                >
                  <Text
                    style={{
                      padding: 0,
                      color: appBarText().textColor,
                      fontSize: 14,
                      fontFamily: font.semibold(),
                    }}
                  >
                    {t("Create Your Avatar")}
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={[
                  styles.phoneContainer,
                  {
                    marginTop: globalThis.showMirrorApiAvatar == "NO" ? 25 : 5,
                  },
                ]}
              >
                <Text style={styles.phoneText}>
                  {route?.params?.phoneNumber}
                </Text>
              </View>
              <View style={styles.nameTextContainer}>
                <Text style={styles.nameText}>{t("name")} </Text>
              </View>
              <View style={styles.nameInputTextContainer}>
                <TextInput
                  placeholder={t("enter_your_name")}
                  style={[styles.textInput, { textTransform: "capitalize" }]}
                  maxLength={30}
                  placeholderTextColor="#959494"
                  defaultValue={userName}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(text) => {
                    if (text.length > 0) {
                      setuserName(text.replace(/[^a-zA-Z0-9 ]/g, ""));
                    } else {
                      setuserName(text.replace(/[^a-zA-Z0-9 ]/g, ""));
                    }
                  }}
                />
              </View>
              <View style={styles.nameTextContainer}>
                <Text style={styles.nameText}>{t("Bio")} </Text>
              </View>
              <View style={[styles.feedbackTextInput]}>
                <TextInput
                  placeholder={t("Enter bio")}
                  cursorColor="#fff"
                  defaultValue={userTagline != null ? userTagline : ""}
                  multiline={true}
                  returnKeyType="go"
                  placeholderTextColor="#959494"
                  blurOnSubmit={true}
                  textAlignVertical="top"
                  maxLength={premiumUser ? 150 : 76}
                  style={{
                    fontSize: FontSize.font,
                    color: COLORS.black,
                    height: "100%",
                    fontFamily: font.semibold(),
                  }}
                  onChangeText={(value) => {
                    value.length > 75
                      ? setShowPremiumAlert(true)
                      : setUserTagline(value);
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                <Text
                  style={{
                    alignSelf: "flex-end",
                    marginTop: 5,
                    fontSize: 14,
                    color: COLORS.black,
                    fontFamily: font.bold(),
                  }}
                >
                  Chatacters Left :{" "}
                  {premiumUser
                    ? 150 - (userTagline?.length || 0)
                    : 75 - (userTagline?.length || 0)}{" "}
                  / {premiumUser ? 150 : 75}{" "}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 30,
                  justifyContent: "space-between",
                  marginHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    // alignSelf: "flex-end",
                    // marginTop: 20,
                    //  marginLeft : 16,
                    fontSize: FontSize.font,
                    color: COLORS.black,
                    fontFamily: font.semibold(),
                  }}
                >
                  Bio links
                </Text>
              </View>

              {inputBoxes.map((box) => (
                <View
                  key={box.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 15,
                    justifyContent: "space-between",
                    marginHorizontal: 16,
                    //  width:"100%"
                    //  backgroundColor:"green"
                  }}
                >
                  <TextInput
                    key={box.id}
                    style={{
                      //marginTop: 10,
                      borderColor: "gray",
                      borderWidth: 1,
                      padding: 8,
                      borderRadius: 4,
                      width: "35%",
                    }}
                    value={box.website}
                    onChangeText={(text) =>
                      handleInputChange(box.id, "website", text)
                    }
                    placeholder="Enter Label"
                  />
                  <TextInput
                    key={box.id}
                    style={{
                      //marginTop: 10,
                      borderColor: "gray",
                      borderWidth: 1,
                      padding: 8,
                      borderRadius: 4,
                      width: "50%",
                    }}
                    value={box.url}
                    placeholder="Enter Url"
                    onChangeText={(text) =>
                      handleInputChange(box.id, "url", text)
                    }
                  />
                  <TouchableOpacity
                    onPress={() => removeInputBox(box.id)}
                    style={{
                      padding: 5,
                      // width:"30%",
                      backgroundColor: "red",
                      borderRadius: 10,
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/Cross.png")}
                      style={{ height: 10, width: 10, tintColor: COLORS.white }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={() =>
                  premiumUser ? addInputBox : setShowPremiumAlert(true)
                }
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 20,
                  alignSelf: "center",
                  flexDirection: "row",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  //  width: windowWidth - 52,
                  height: 45,
                  backgroundColor: searchBar().back_ground,
                }}
              >
                <Image
                  source={require("../../Assets/Icons/plus.png")}
                  style={{
                    height: 15,
                    width: 15,
                    tintColor: iconTheme().iconColor,
                    alignSelf: "center",
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    alignSelf: "center",
                    //   marginTop: 5,
                    marginLeft: 5,
                    fontSize: 15,
                    color: setWallpaper().iconColor,
                    fontFamily: font.medium(),
                  }}
                >
                  {inputBoxes.length > 0 ? "Add more" : "Add bio links"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </MainComponent>
  );
}
