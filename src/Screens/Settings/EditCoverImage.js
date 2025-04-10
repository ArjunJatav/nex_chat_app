import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
  Keyboard,
  Platform,
  Modal,
  PermissionsAndroid,
  ImageBackground,
  Alert,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { Text } from "react-native";
import { ScrollView } from "react-native";
import axios from "axios";
import { TextInput } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import NetInfo from "@react-native-community/netinfo";
import ProfileDraggableImage from "../../Components/dargText/ProfileDragStickers";
import ProfileDraggableText from "../../Components/dargText/ProfileDragText";
import renderIf from "../../Components/renderIf";
import ColorPicker from "../../Components/dargText/ColorPicker";
import { font } from "../../Components/Fonts/Font";
import { LoaderModel } from "../Modals/LoaderModel";
import { SetProfileModal } from "../Modals/SetProfileModel";
import {
  Base_Url,
  chatUserDetailApi,
  get_profile,
  reportUserApi,
  update_profile,
  userDetailApi,
} from "../../Constant/Api";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { t } from "i18next";
import { stopSound } from "../../utils/callKitCustom";
import { showToast } from "../../Components/CustomToast/Action";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import {
  COLORS,
  iconTheme,
  setWallpaper,
} from "../../Components/Colors/Colors";
import { UpdateNameModel } from "../Modals/UpdatenameModel";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
import WarningModal from "../Modals/WarningModal";
import {
  checkImageNudity,
  getRemainingSuspensionDays,
  updateViolationAttempt,
} from "../agora/agoraHandler";
import {
  setUserBanned,
  setUserSuspendedDays,
} from "../../reducers/userBanSlice";

var isStiPopViewShowing = false;
let banType = "Warning";
let banMessage = "";
let banTitle = "";

export const EditCoverImage = ({ route, navigation }) => {
  const [images, setImages] = React.useState(
    route?.params?.data?.stickers || []
  ); // List of images
  const [textInputs, setTextInputs] = React.useState(
    route?.params?.data?.dragtext
  );
  const [activeTextId, setActiveTextId] = React.useState(null);
  const [activeImageId, setActiveImageId] = React.useState(null);
  const [showInput, setShowInput] = React.useState(false);
  const [textInputValue, setTextInputValue] = React.useState("");
  const [editedText, setEditedText] = React.useState("");
  const [colorModal, setColorModal] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState("#FF0000");
  const [deleteActiveId, setDeleteActiveId] = React.useState("");
  const [userDetailData, setUserDetailData] = React.useState({});
  const [loaderModel, setloaderMoedl] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [reportModal, setReportModal] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [reportUserId, setReportUserId] = React.useState("");
  const [coverImageModal, setcoverImageModal] = React.useState(false);
  const [coverImage, setCoverImage] = React.useState();
  const [userDisplayName, setUserDisplayName] = React.useState();
  const [userTagline, setUserTagline] = React.useState("");
  const [wallpaperModel, setWallpaperModel] = React.useState(false);
  const [updatenamemodel, setupdatenamemodel] = React.useState(false);
  const [showBoi, setShowBio] = React.useState(false);
  const [showPremiumAlert, setShowPremiumAlert] = React.useState(false);
  const [edit, setEdit] = React.useState(
    route.params.param == "myProfile" ? false : true
  );
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [prevStyles, setPrevStyles] = React.useState({
    position: { x: 100, y: 400 },
    scale: 1,
    rotation: 0,
  });

  const [stickerFriend, setStickerFriend] = React.useState([]);
  const [textFriend, setTextFriend] = React.useState([]);
  const callState = useSelector(
    (state) => state?.VoipReducer?.call_state || {}
  );
  const textInputRef = React.useRef(null);
  var stickerSingleTapListener = null;
  var stickerDoubleTapListener = null;
  const { StipopModule } = NativeModules;
  const dispatch = useDispatch();

  const userImageUrl =
    route?.params?.data?.profile_image || globalThis.userImage;
  const cacheBuster = Date.now();

  const imageUrl = `${userImageUrl}?${cacheBuster}`;

  var nativeEventEmitter = null;

  switch (Platform.OS) {
    case "android":
      // eslint-disable-next-line
      const { StipopModule } = NativeModules;
      nativeEventEmitter = new NativeEventEmitter(StipopModule);
      break;

    case "ios":
      // eslint-disable-next-line
      const { StipopEmitter } = NativeModules;
      nativeEventEmitter = new NativeEventEmitter(StipopEmitter);
      break;
  }

  React.useEffect(() => {
    isStiPopViewShowing = false;
    if (callState.state != "outgoing") {
      stopSound();
    }
  }, [callState.state]);

  useEffect(() => {
    getProfileApi();
    setProfileImage(imageUrl);
  }, []);

  let fromPage = route.params.ChatDetail;
  /////   ****   useEffect for Calling Initial State  **** ////
  React.useEffect(() => {
    NetInfo.fetch().then((state) => {
      if (state.isInternetReachable === false) {
        alert("No Internet, Please check your Internet Connection.");
        return;
      } else {
        UserDetailApiCalling();
      }
    });
  }, []);

  const UserDetailApiCalling = async () => {
    let endPoint = fromPage ? chatUserDetailApi : userDetailApi;
    const urlStr = Base_Url + endPoint;
    try {
      await axios({
        method: "post",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
        data: fromPage
          ? {
              chat_user_id: route.params.Id,
            }
          : {
              unique_id: route.params.Id,
            },
      })
        .then((response) => {
          if (response.data.status == true) {
            if (response?.data?.data?.sticker_position !== undefined) {
              try {
                let stickerData = JSON.parse(
                  response.data.data.sticker_position
                );
                setStickerFriend(stickerData);
              } catch (error) {
                console.error("Error parsing sticker_position:", error);
              }
            }

            if (response?.data?.data?.Image_text !== null) {
              try {
                let imageTextData = JSON.parse(response.data.data.Image_text);
                setTextFriend(imageTextData);
              } catch (error) {
                console.error("Error parsing image text:", error);
              }
            }
            setUserDetailData(
              fromPage ? response.data.data.user : response.data.data
            );
          }
        })
        .catch((error) => {
          alert(error);
        });
    } catch (error) {
      alert(error);
    }
  };

  const addImage = async (path) => {
    // Ensure path is not null or undefined
    if (!path) {
      return;
    }
    const newImage = {
      id: Date.now(),
      uri: path,
      position: { x: 100, y: 100 },
      scale: 1,
      rotation: 0,
      zIndex: 1,
    };

    try {
      // Append the new image to the existing array of images
      setImages((prevImages) =>
        prevImages ? [...prevImages, newImage] : [newImage]
      );
    } catch (error) {
      console.error("Error adding image:", error);
    }
  };

  const Reportuser = async (reportReason, ReportUserId) => {
    if (reportReason == "") {
      alert("Please enter a reason.");
      return;
    } else {
      const urlStr = Base_Url + reportUserApi;
      try {
        axios({
          method: "post",
          url: urlStr,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + globalThis.token,
          },
          data: {
            reported_user_id: ReportUserId.toString(),
            report_reason: reportReason.toString(),
            report_type: "User",
          },
        })
          .then((response) => {
            if (response.data.status == true) {
              setReason("");
              setReportModal(!reportModal);
              setReportUserId("");
              showToast(response.data.message);
            }
          })
          .catch((error) => {
            setReportModal(!reportModal);
            alert(error);
            setReportUserId("");
            setReason("");
          });
      } catch (error) {
        setReportModal(!reportModal);
        alert(error);
        setReportUserId("");
        setReason("");
      }
    }
  };

  const tapListenerInit = () => {
    stickerSingleTapListener = nativeEventEmitter?.addListener(
      "onStickerSingleTapped",
      (event) => {
        const stickerImg = event.stickerImg;
        addImage(stickerImg);
      }
    );
  };

  const tapListenerRemove = () => {
    if (stickerSingleTapListener != null) {
      stickerSingleTapListener.remove();
    }
    if (stickerDoubleTapListener != null) {
      stickerDoubleTapListener.remove();
    }
  };

  React.useEffect(() => {
    StipopModule.connect(globalThis.userChatId);
    tapListenerInit();
    return () => {
      tapListenerRemove();
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (stickerSingleTapListener) {
        stickerSingleTapListener.remove();
      }
    };
  }, []);

  const captureCoverImage = async () => {
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openCamera({
        width: Dimensions.get("screen").width,
        height: Dimensions.get("screen").height,
        cropping: true,
        //enableRotationGesture: true,
        cropperRotateButtonsHidden: true,
        hideBottomControls: true,
        mediaType: "photo",
      })
        .then((image) => {
          if (image !== undefined) {
            setcoverImageModal(false);

            setTimeout(async () => {
              setloaderMoedl(true);
              // Add delay before making API call
              const filePath = image.path.startsWith("file://")
                ? image.path
                : `file://${image.path}`;

              const response = await checkImageNudity(filePath);
              console.log(
                "Nudity Check Response:",
                response?.data?.is_nude_file
              );
              if (response?.data?.is_nude_file == true) {
                setloaderMoedl(false);

                const reason = `In update profile, the user uploaded inappropriate image.`;
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
                setCoverImage(image.path);

                setTextInputs([]);
                setImages([]);
              }
            }, 500);
          }
        })
        .catch((e) => {
          console.log("error>>>", e);
          setcoverImageModal(false);
        });
    }
  };

  ////////////////////launchImageLibrary/////////////////

  const selectCoverImage = async () => {
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        mediaType: "photo",
        width: Dimensions.get("screen").width,
        height: Dimensions.get("screen").height,
        cropping: true,
        // enableRotationGesture: true,
        cropperRotateButtonsHidden: true,
        hideBottomControls: true,
      })
        .then((image) => {
          if (image !== undefined) {
            setcoverImageModal(false);

            setTimeout(async () => {
              setloaderMoedl(true);
              // Add delay before making API call
              const filePath = image.path.startsWith("file://")
                ? image.path
                : `file://${image.path}`;

              const response = await checkImageNudity(filePath);
              console.log(
                "Nudity Check Response:",
                response?.data?.is_nude_file
              );
              if (response?.data?.is_nude_file == true) {
                setloaderMoedl(false);

                const reason = `In update profile, the user uploaded inappropriate image.`;
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
                setCoverImage(image.path);
                setTextInputs([]);
                setImages([]);
              }
            }, 500);
          }
        })
        .catch(() => {
          setcoverImageModal(false);
        });
    }
  };

  const removeStipopView = () => {
    if (showInput == true) {
      handleSubmitText();
    } else if (isStiPopViewShowing == true) {
      switch (Platform.OS) {
        case "android":
          StipopModule.show(true, true, () => {
            isStiPopViewShowing = false;
          });

          return;

        case "ios":
          StipopModule.show(isStiPopViewShowing, isStiPopViewShowing, () => {
            isStiPopViewShowing = false;
          });
          return;
      }
    } else if (activeTextId !== null) {
      handleEditText();
    }
  };

  const handleButtonClick = () => {
    textBackPress();

    if (showInput) {
      setActiveTextId(null);
      setShowInput(false);
      setTimeout(() => {
        if (Platform.OS === "android") {
          textInputRef.current?.focus();
          StipopModule.show(isStiPopViewShowing, isStiPopViewShowing, () => {
            isStiPopViewShowing = true;
            setShowInput(false);
          });
        } else if (Platform.OS === "ios") {
          StipopModule.show(isStiPopViewShowing, isStiPopViewShowing, () => {
            isStiPopViewShowing = true;
          });
        }
      }, 600);
    } else {
      if (isStiPopViewShowing) {
        if (Platform.OS === "android") {
          StipopModule.show(isStiPopViewShowing, isStiPopViewShowing, () => {
            isStiPopViewShowing = false;
          });
        } else if (Platform.OS === "ios") {
          StipopModule.show(isStiPopViewShowing, isStiPopViewShowing, () => {
            isStiPopViewShowing = false;
            Keyboard.dismiss();
          });
        }
        return;
      }

      if (Platform.OS === "android") {
        StipopModule.show(isStiPopViewShowing, isStiPopViewShowing, () => {
          isStiPopViewShowing = true;
          setShowInput(false);
        });
      } else if (Platform.OS === "ios") {
        StipopModule.show(isStiPopViewShowing, isStiPopViewShowing, () => {
          isStiPopViewShowing = true;
        });
      }
    }
  };

  const onStartImageDrag = (id) => {
    setDeleteActiveId("");
    setActiveImageId(id);
  };

  const deleteImage = (id) => {
    // Update the state to remove the image with the specified ID
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  const updateImagePosition = (id, newPosition) => {
    const transform = newPosition.transform || [];
    let rotation = 0;
    let scale = 1;
    transform.forEach((item) => {
      if (item.rotate) {
        rotation = parseFloat(item.rotate.replace("deg", "")); // Extract rotation value and convert to float
      }
      if (item.scale) {
        scale = item.scale; // Extract scale value
      }
    });

    setImages((prevImages) =>
      prevImages.map((image, index) =>
        image.id === id
          ? {
              ...image,
              position: { x: newPosition?.left, y: newPosition?.top },
              rotation: rotation,
              scale: scale,
              zIndex: index,
            }
          : image
      )
    );
  };

  const handleDeleteText = (id) => {
    setTextInputs((prevInputs) =>
      prevInputs.filter((input) => input.id !== id)
    );
  };

  const updateTextPosition = (id, newPosition) => {
    const transform = newPosition.transform || [];
    let rotation = 0;
    let scale = 1;
    transform.forEach((item) => {
      if (item.rotate) {
        rotation = parseFloat(item.rotate.replace("deg", "")); // Extract rotation value and convert to float
      }
      if (item.scale) {
        scale = item.scale; // Extract scale value
      }
    });

    setTextInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.id === id
          ? {
              ...input,
              position: { x: newPosition?.left, y: newPosition?.top },
              rotation: rotation,
              scale: scale,
            }
          : input
      )
    );
  };

  const handleSubmitText = () => {
    isStiPopViewShowing = false;
    Keyboard.dismiss;
    if (textInputValue.trim() !== "") {
      setTextInputs((prevInputs) => [
        ...prevInputs,
        {
          id: Date.now(),
          text: textInputValue,
          position: { x: 100, y: 400 },
          color: selectedColor,
          rotation: 0,
          scale: 1,
          font: "font",
        },
      ]);
      setTextInputValue("");
      setShowInput(false); // Hide the text input after submitting
    } else {
      setShowInput(false);
    }
  };

  // Function to handle editing existing text
  const handleEditText = () => {
    Keyboard.dismiss;
    if (activeTextId !== null && editedText.trim() !== "") {
      setActiveTextId(activeTextId);
      setTextInputs((prevInputs) =>
        prevInputs.map((input) =>
          input.id === activeTextId
            ? {
                ...input,
                text: editedText,
                color: selectedColor,
                font: "font",
                position: {
                  x: prevStyles?.position.x,
                  y: prevStyles?.position.y,
                },
                rotation: prevStyles?.rotation,
                scale: prevStyles?.scale,
              }
            : input
        )
      );
      setEditedText(""); // Reset edited text value
      setActiveTextId(null); // Reset active text ID
    }
  };

  const onStartDrag = (id) => {
    setActiveImageId("");
    setDeleteActiveId(id);
  };

  const onSavePrevStyles = (event, styles) => {
    // Extract rotation and scale from the transform property
    const transform = styles.transform || [];
    let rotation = 0;
    let scale = 1;
    transform.forEach((item) => {
      if (item.rotate) {
        rotation = parseFloat(item.rotate.replace("deg", "")); // Extract rotation value and convert to float
      }
      if (item.scale) {
        scale = item.scale; // Extract scale value
      }
    });

    // Update prevStyles with position, rotation, and scale
    setPrevStyles({
      position: { x: styles.left, y: styles.top },
      rotation: rotation,
      scale: scale,
    });
  };

  const handleSetActiveText = (id) => {
    setActiveTextId(id);
    setEditedText(textInputs.find((input) => input.id === id)?.text || "");
  };

  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF", // Red, Green, Blue
    "#FFFF00",
    "#FF00FF",
    "#00FFFF", // Yellow, Magenta, Cyan
    "#C0C0C0",
    "#808080", // Silver, Gray, White
    "#800000",
    "#008000",
    "#000080", // Maroon, Olive, Navy
    "#808000",
    "#800080",
    "#008080", // Teal, Purple, Aqua
    "#FFA500",
    "#FFC0CB",
    "#000000", // Orange, Pink, Black
    "#FFD700",
    "#00FF7F",
    "#ADFF2F", // Gold, SpringGreen, GreenYellow
    "#FF69B4",
    "#9370DB",
    "#D8BFD8", // HotPink, MediumPurple, Thistle
    "#DDA0DD",
    "#B0E0E6",
    "#00CED1", // Plum, PowderBlue, DarkTurquoise
    "#7FFFD4",
    "#F0FFF0",
    "#F0F8FF", // AquaMarine, HoneyDew, AliceBlue
  ];

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

  const captureImage = async () => {
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openCamera({
        // width: 300,
        // height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
        mediaType: "photo",
      })
        .then((image) => {
          if (image !== undefined && image !== null && image !== "") {
            setWallpaperModel(false);

            setTimeout(async () => {
              setloaderMoedl(true);
              // Add delay before making API call
              const filePath = image.path.startsWith("file://")
                ? image.path
                : `file://${image.path}`;

              const response = await checkImageNudity(filePath);
              console.log(
                "Nudity Check Response:",
                response?.data?.is_nude_file
              );
              if (response?.data?.is_nude_file == true) {
                setloaderMoedl(false);

                const reason = `In update profile, the user uploaded inappropriate image.`;
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
                UpdateImageApi(image.path);
              }
            }, 500);
          }
        })
        .catch(() => {
          setWallpaperModel(false);
        });
    }
  };
  ////////////////////launchImageLibrary/////////////////

  const selectImage = async () => {
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        mediaType: "photo",
        // width: 300,
        // height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
      })
        .then((image) => {
          if (image !== undefined) {
            setWallpaperModel(false);
            setTimeout(async () => {
              setloaderMoedl(true);
              // Add delay before making API call
              const filePath = image.path.startsWith("file://")
                ? image.path
                : `file://${image.path}`;

              const response = await checkImageNudity(filePath);
              console.log(
                "Nudity Check Response:",
                response?.data?.is_nude_file
              );
              if (response?.data?.is_nude_file == true) {
                setloaderMoedl(false);

                const reason = `In update profile, the user uploaded inappropriate image.`;
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
                UpdateImageApi(image.path);
              }
            }, 500);
          }
        })
        .catch(() => {
          setWallpaperModel(false);
        });
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const getProfileApi = async () => {
    setloaderMoedl(true);
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(get_profile, headers, navigation, (ResponseData, ErrorStr) => {
      profileApiSuccess(ResponseData, ErrorStr);
    });
  };

  const profileApiSuccess = (ResponseData, ErrorStr) => {
    if (ErrorStr) {
      //  Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      globalThis.errorMessage = ErrorStr;
      setloaderMoedl(false);
      setErrorAlertModel(true);
      // Navigate to another screen or handle the error in some way
    } else {
      (globalThis.userImage = ""), setCoverImage(ResponseData.data.cover_image);

      setProfileImage("");
      globalThis.userImage = ResponseData.data.profile_image;
      setUserDisplayName(ResponseData.data.first_name);
      setUserTagline(ResponseData.data.tagline);
      setloaderMoedl(false);
    }
  };

  let headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    // eslint-disable-next-line
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
  };

  const uploaddata = new FormData();
  uploaddata.append("first_name", userDisplayName);
  uploaddata.append("tagline", userTagline != null ? userTagline : "");
  uploaddata.append("Image_text", JSON.stringify(textInputs));
  uploaddata.append("sticker_position", JSON.stringify(images));

  if (coverImage !== "") {
    uploaddata.append("cover_image", {
      uri:
        Platform.OS === "android"
          ? coverImage
          : coverImage?.replace("file://", ""),
      type: "image/jpeg", // or photo.type
      name: "userImage.jpg",
    });
  }

  const editProfileApi = () => {
    setloaderMoedl(true);
    /////////////////////// ********** Internet Permission   ********** ////////////////////
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setloaderMoedl(false);
        setNoInternetModel(true);
        return;
      } else {
        setloaderMoedl(true);
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

  const apiSuccess = (ResponseData, ErrorStr) => {
    // Custom logic to execute on success
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      globalThis.errorMessage = ErrorStr;
      setloaderMoedl(false);
      setErrorAlertModel(true);
    } else {
      globalThis.userImage = ResponseData.data.profile_image;
      globalThis.successMessage = ResponseData.message;
      // Alert.alert(t("success"), ResponseData.message, [
      //   { text: t("ok"), onPress: () => navigation.navigate("BottomBar") },
      // ]);
      setloaderMoedl(false);
      setSuccessAlertModel(true);
    }
  };

  function UpdateImageApi(img) {
    const urlStr = Base_Url + update_profile;
    setloaderMoedl(true);
    const data = new FormData();
    if (img !== "") {
      data.append("profile_image", {
        uri:
          Platform.OS === "android"
            ? "file://" + img
            : img?.replace("file://", ""),
        type: "image/jpeg", // or photo.type
        name: "userImage.jpg",
      });
    }
    data.append("first_name", userDisplayName);
    data.append("tagline", userTagline != null ? userTagline : "");

    try {
      axios({
        method: "post",
        url: urlStr,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          // eslint-disable-next-line
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + globalThis.Authtoken,
          localization: globalThis.selectLanguage,
        },
        data: data,
      })
        .then((response) => {
          setloaderMoedl(false);
          if (response.data.status == true) {
            globalThis.updateProfile = "update profile";
            setWallpaperModel(false);

            globalThis.userImage = response.data.data.profile_image;
            setProfileImage(response.data.data.profile_image);
          } else {
            let messaqe = response.data.message;
            alert(t("error"), messaqe, [{ text: t("cancel") }]);
          }
        })
        .catch((error) => {
          alert(error);
          setloaderMoedl(false);
        });
    } catch (error) {
      alert(error);
      setloaderMoedl(false);
    }
  }

  const textBackPress = () => {
    showInput
      ? handleSubmitText()
      : activeTextId !== null
      ? handleEditText()
      : null;
  };

  let premiumAlertHeading =
    showBoi == true ? "You have exceed the Limit" : "Premium Feature";
  let premiumAlertSubHeading =
    showBoi == true
      ? "Upgrade to Premium to gain access to add more bio"
      : "You have exceed the Limit.";
  let premiumAlertFirstButtonText = "Ok";
  let premiumAlertSecondButtonText = "Go To Premium";

  return (
    <View
      onTouchStart={() => {
        Platform.OS == "ios" && showInput != true && activeTextId == null
          ? removeStipopView()
          : null;
      }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" />

      {renderIf(loaderModel == true, <LoaderModel visible={loaderModel} />)}

      <SetProfileModal
        visible={wallpaperModel}
        onRequestClose={() => setWallpaperModel(false)}
        Camera={() => captureImage()}
        select={() => selectImage()}
        cancel={() => setWallpaperModel(false)}
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

      <SetProfileModal
        visible={coverImageModal}
        onRequestClose={() => setcoverImageModal(false)}
        Camera={() => captureCoverImage()}
        select={() => selectCoverImage()}
        cancel={() => setcoverImageModal(false)}
      />
      <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={globalThis.successMessage}
        doneButton={() => {
          setSuccessAlertModel(false), navigation.navigate("BottomBar");
          //successModalCheck()
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

      <PremiumAlert
        visible={showPremiumAlert}
        onRequestClose={() => setShowPremiumAlert(false)}
        cancel={() => setShowPremiumAlert(false)}
        Heading={premiumAlertHeading}
        SubHeading={premiumAlertSubHeading}
        FirstButton={premiumAlertFirstButtonText}
        SecondButton={premiumAlertSecondButtonText}
        firstButtonClick={() => {
          setShowPremiumAlert(false);
        }}
        secondButtonClick={() => {
          if (premiumAlertSecondButtonText == "Cancel") {
            setShowPremiumAlert(false);
          } else {
            setupdatenamemodel(false);
            setShowPremiumAlert(false);
            navigation.navigate("PremiumFeaturesScreen");
          }
        }}
      />

      <UpdateNameModel
        visible={updatenamemodel}
        data={{
          username: userDisplayName,
          aboutus: userTagline || "",
        }}
        onRequestClose={() => {
          setupdatenamemodel(false);
        }}
        cancel={() => setupdatenamemodel(false)}
        navigation={navigation}
        setUserDisplayName={setUserDisplayName}
        setUserTagline={setUserTagline}
        setShowPremiumAlert={setShowPremiumAlert}
        setShowBio={setShowBio}
      />

      <Modal
        transparent={true}
        visible={colorModal}
        onRequestClose={() => setColorModal(false)}
        supportedOrientations={["portrait", "landscape"]}
      >
        <TouchableOpacity
          onPress={() => setColorModal(false)}
          activeOpacity={1}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            zIndex: 0,
          }}
        >
          <View
            style={{
              backgroundColor: "#ffff",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          >
            {/* Scrollable view for color options */}
            <ScrollView>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  paddingVertical: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {colors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      // Handle color selection
                      setSelectedColor(color);
                    }}
                    style={{
                      backgroundColor: color,
                      width: 40,
                      height: 40,
                      margin: 5,
                      borderRadius: 8,
                    }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent
        visible={reportModal}
        supportedOrientations={["portrait", "landscape"]}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              overflow: "hidden",
              padding: 12,
              width: "90%",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                marginBottom: 8,
                opacity: 0.9,
                fontFamily: font.semibold(),
              }}
            >
              {"Report User?"}
            </Text>
            <Text
              style={{
                opacity: 0.8,
                fontSize: 14,
                fontFamily: font.semibold(),
              }}
            >
              This message will be forwarded to Tokee(Admin).
            </Text>
            <TextInput
              maxLength={150}
              onChangeText={(text) => setReason(text)}
              value={reason}
              style={{
                borderWidth: 1,
                borderColor: "#000000",
                marginTop: 10,
                padding: 6,
                fontSize: 14,
                height: 80,
                borderRadius: 5,
              }}
              multiline={true}
              placeholder="Reason for reporting"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setReportModal(!reportModal);
                  setReason("");
                  setReportUserId("");
                }}
                style={{ paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Text style={{ fontFamily: font.semibold() }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Reportuser(reason, reportUserId)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: "#7FD25A",
                  borderRadius: 4,
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: "white", fontFamily: font.semibold() }}>
                  {"Report"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <LoaderModel visible={loaderModel} />
      </Modal>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <View
            style={{
              backgroundColor: "#fff",
              justifyContent: "center",
              position: "absolute",
              top: 70,
              right: 20,
              borderRadius: 20,
            }}
          >
            <TouchableOpacity
              style={{
                alignItems: "center",
                borderBottomWidth: 0.5,
                padding: 20,
                flexDirection: "row",
                justifyContent: "flex-start",
                borderColor: "lightgray",
              }}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("SendAmount", {
                  profile_image: userDetailData?.profile_image,
                  wallet_id: userDetailData?.wallet_id,
                  display_name: userDetailData?.display_name,
                  screenFrom: "Home",
                });
              }}
            >
              <Text
                style={[
                  styles.text,
                  {
                    fontFamily: font.semibold(),
                  },
                ]}
              >
                Send Money
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 20,
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
              onPress={() => {
                setModalVisible(false);
                setReportModal(!reportModal);
                setReportUserId(userDetailData?.chat_user_id);
              }}
            >
              <Text
                style={[
                  styles.text,
                  {
                    color: "red",
                    fontFamily: font.semibold(),
                  },
                ]}
              >
                Report User
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ImageBackground
        source={{
          uri: coverImage,
        }} // Provide the path to your image
        style={styles.backgroundImage}
        resizeMode="cover" // This will make the image fill the entire container without distorting its aspect ratio
      >
        {edit ? null : (
          <>
            {images?.map((item, index) => (
              <Image
                key={index}
                source={{
                  uri: item.uri,
                }}
                style={{
                  width: 100,
                  height: 100,
                  zIndex: item.zIndex,
                  resizeMode: "stretch",
                  position: "absolute",
                  left: item.position.x,
                  top: item.position.y,
                  transform: [
                    { scale: item.scale == null ? 0 : item.scale },
                    {
                      rotate:
                        item.rotation == null
                          ? `${0}deg`
                          : `${item.rotation}deg`,
                    },
                  ],
                }}
              />
            ))}
          </>
        )}

        {stickerFriend?.map((item, index) => (
          <Image
            key={index}
            source={{
              uri: item.uri,
            }}
            style={{
              width: 100,
              height: 100,
              zIndex: item.zIndex,
              resizeMode: "stretch",
              position: "absolute",
              left: item.position.x,
              top: item.position.y,
              transform: [
                { scale: item.scale == null ? 0 : item.scale },
                {
                  rotate:
                    item.rotation == null ? `${0}deg` : `${item.rotation}deg`,
                },
              ],
            }}
          />
        ))}

        {textFriend?.map((item, index) => (
          <View
            key={index}
            style={{
              position: "absolute",
              left: item.position.x,
              top: item.position.y,
              zIndex: 15555,
              transform: [
                { scale: item.scale == null ? 0 : item.scale },
                {
                  rotate:
                    item.rotation == null ? `${0}deg` : `${item.rotation}deg`,
                },
              ],
            }}
          >
            <Text
              style={{
                color: item.color,
                fontFamily: item.font,
                fontSize: 20,
                padding: 5,
                borderRadius: 8,
              }}
            >
              {item.text}
            </Text>
          </View>
        ))}

        {textInputs?.map((item) => (
          <>
            {edit ? null : (
              <View
                style={{
                  position: "absolute",
                  left: item.position.x,
                  top: item.position.y,
                  zIndex: 15555,
                  transform: [
                    { scale: item.scale == null ? 0 : item.scale },
                    {
                      rotate:
                        item.rotation == null
                          ? `${0}deg`
                          : `${item.rotation}deg`,
                    },
                  ],
                }}
              >
                <Text
                  style={{
                    color: item.color,
                    fontFamily: item.font,
                    fontSize: 20,
                    padding: 5,
                    borderRadius: 8,
                  }}
                >
                  {item.text}
                </Text>
              </View>
            )}
          </>
        ))}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            position: "absolute",
            top: 50,
            width: "100%",
            paddingHorizontal: 10,
            zIndex: 999,
          }}
        >
          <View style={{}}>
            {route.params.param == "myProfile" && (
              <TouchableOpacity //@ts-ignore
                onPress={() => {
                  navigation.navigate("EditProfileScreen", {
                    fromExplore: false,
                  });
                }}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 45,
                  width: 45,
                  backgroundColor: "rgba(20, 20, 20, 0.8)",
                  borderRadius: 5,
                }}
              >
                <Image
                  source={require("../../Assets/Icons/Cross.png")}
                  style={{ height: 20, width: 20, tintColor: "#fff" }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {route.params.param == "myProfile" && (
              <TouchableOpacity
                onPress={() => {
                  edit ? editProfileApi() : setEdit(true);
                }}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 45,
                  width: 45,
                  backgroundColor: "rgba(156, 49, 163, 0.8)",
                  borderRadius: 5,
                }}
              >
                {/* <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "bold",
                    fontSize: 18,
                    padding: 8,
                  }}
                >
                  {edit ? "Done" : "Edit"}
                </Text> */}
                <Image
                  source={
                    edit
                      ? require("../../Assets/Icons/savebutton.png")
                      : require("../../Assets/Icons/NotePen.png")
                  }
                  style={{ height: 20, width: 20, tintColor: "#fff" }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {showInput == false && activeTextId == null && (
          <View
            style={[
              styles.overlay,
              {
                // bottom: route.params.param == "myProfile" ? 150 : 60,
                backgroundColor:
                  route.params.param == "myProfile"
                    ? "rgba(20, 20, 20, 0.8)"
                    : "rgba(0,0,0,0.2)",
              },
            ]}
          >
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 101,
                  alignSelf: "center",
                }}
              >
                <Image
                  source={{ uri: profileImage == "" ? imageUrl : profileImage }}
                  style={styles.overlayImage}
                  resizeMode="cover"
                />
                {route.params.param == "myProfile" && (
                  <TouchableOpacity
                    style={styles.cameraContainer}
                    onPress={() => setWallpaperModel(true)}
                  >
                    <Image
                      // eslint-disable-next-line
                      source={require("../../Assets/Icons/CameraIcon.png")}
                      style={{ height: 16, width: 16, tintColor: "#fff" }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text
                style={[
                  styles.userDisplayName,
                  {
                    color: "#fff",
                    fontFamily: font.semibold(),
                    fontSize: 16,
                    fontWeight: "bold",
                  },
                ]}
              >
                {userDisplayName}
              </Text>
              {userTagline && (
                <Text
                  style={[
                    styles.userDisplayName,
                    {
                      color: COLORS.white,
                      fontFamily: font.regular(),
                    },
                  ]}
                >
                  {userTagline}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.applyButtonStyle,
                { marginTop: 35, flexDirection: "row" },
              ]}
              onPress={() => setupdatenamemodel(true)}
            >
              <Image
                source={require("../../Assets/Icons/NotePen.png")}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: "#000",
                  marginRight: 5,
                }}
                resizeMode="contain"
              />
              <Text style={styles.applyText}>{t("Edit_Bio")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {edit ? (
          <>
            {images?.map((image) => (
              <ProfileDraggableImage
                key={image.id}
                id={image.id}
                source={image.uri}
                position={image.position}
                onEdit={() => setActiveImageId(image.id)}
                activeImageId={activeImageId}
                onStart={() => onStartImageDrag(image.id)}
                deleteImage={() => deleteImage(image.id)}
                onEnd={(event, styles) => {}}
                onChange={(event, styles) => {
                  updateImagePosition(image.id, styles);
                }}
                zIndex={image.zIndex}
                // Other props as needed...
              />
            ))}
          </>
        ) : null}

        {edit ? (
          <>
            {textInputs?.map(
              (input) =>
                activeTextId !== input.id && (
                  <ProfileDraggableText
                    font={input.font}
                    id={input.id}
                    key={input.id}
                    text={input.text}
                    position={input.position}
                    color={input.color}
                    rotation={input.rotation}
                    scale={input.scale}
                    onEdit={() => {
                      handleSetActiveText(input.id);
                    }}
                    onEnd={(event, styles) => {
                      onSavePrevStyles(event, styles);
                    }}
                    onLongPressText={() => {}}
                    showDelete={""}
                    deleteText={() => handleDeleteText(input.id)}
                    activeTextId={activeTextId}
                    onStart={() => onStartDrag(input.id)}
                    prevStyles={""}
                    onChange={(event, styles) => {
                      updateTextPosition(input.id, styles);
                    }}
                    bigButton={""}
                    deleteActiveId={deleteActiveId}
                  />
                )
            )}
          </>
        ) : null}

        {activeTextId !== null || showInput ? (
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={() => textBackPress()}
          >
            <View
              style={{
                justifyContent: "center",
                alignContent: "center",
                flex: 1,
                paddingHorizontal: 20,
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            >
              {activeTextId !== null && (
                <TextInput
                  maxLength={30}
                  ref={textInputRef}
                  style={[
                    styles.input,
                    {
                      textAlignVertical: "top",
                      textAlign: "center",
                      color: selectedColor,
                      fontFamily: "font",
                    },
                  ]}
                  value={editedText}
                  onChangeText={setEditedText}
                  autoFocus={true}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              )}
              {showInput && (
                <TextInput
                  maxLength={30}
                  ref={textInputRef}
                  style={[
                    styles.input,
                    {
                      textAlignVertical: "top",
                      textAlign: "center",
                      color: selectedColor,
                      fontFamily: "font",
                      minHeight: 50,
                    },
                  ]}
                  value={textInputValue}
                  onChangeText={(text) => setTextInputValue(text)}
                  multiline={true}
                  autoFocus={true}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              )}

              {activeTextId !== null || showInput ? (
                <View style={{ marginTop: 10, paddingVertical: 20 }}>
                  <ColorPicker
                    selectedColor={selectedColor}
                    onColorChange={handleColorChange}
                  />
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ) : null}

        {route.params.param == "myProfile" && edit && (
          <View style={styles.scrollContainer}>
            <TouchableOpacity
              style={styles.textContainer}
              onPress={handleButtonClick}
            >
              <Image
                // eslint-disable-next-line
                source={require("../../Assets/Icons/smile.png")}
                style={{ height: 25, width: 30, tintColor: "#fff" }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textContainer}
              onPress={() => {
                if (isStiPopViewShowing) {
                  switch (Platform.OS) {
                    case "android":
                      StipopModule.show(true, true, () => {
                        isStiPopViewShowing = false;
                      });
                      break;

                    case "ios":
                      StipopModule.show(
                        isStiPopViewShowing,
                        isStiPopViewShowing,
                        () => {
                          isStiPopViewShowing = false;
                        }
                      );
                      break;
                  }
                }
                setTimeout(() => {
                  setShowInput(true);
                }, 500);
              }}
            >
              <Image
                // eslint-disable-next-line
                source={require("../../Assets/Icons/profiletext.png")}
                style={{ height: 25, width: 25, tintColor: "#fff" }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textContainer}
              onPress={() => setcoverImageModal(true)}
            >
              <Image
                // eslint-disable-next-line
                source={require("../../Assets/Icons/CameraIcon.png")}
                style={{ height: 30, width: 30, tintColor: "#fff" }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  applyButton: {
    marginVertical: 30,
    flexDirection: "column",
    paddingHorizontal: 0,
    justifyContent: "space-between",
  },
  applyButtonStyle: {
    height: 50,
    // marginTop: 10,
    width: WINDOW_WIDTH - 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  applyText: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: font.semibold(),
  },
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    flex: 1,
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
    position: "absolute", // Ensure the background image covers the entire screen
  },
  overlay: {
    position: "absolute",
    margin: 0,
    // alignSelf: "center",
    borderRadius: 30,
    overflow: "hidden",
    // justifyContent: "center",
    alignItems: "center",
    zIndex: 9999999,
    paddingVertical: 15,
    width: WINDOW_WIDTH,
    bottom: 0,
    // height:"50%",
    paddingTop: 30,
    paddingBottom: 90,
  },
  overlayImage: {
    width: 100,
    height: 100,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(240, 224, 241, 1)",
    backgroundColor: "rgba(240, 224, 241, 1)",
  },
  userDisplayName: {
    color: "#666666",
    marginTop: 8,
    textTransform: "capitalize",
    textAlign: "center",
  },
  scrollContainer: {
    position: "absolute",
    top: 109,
    paddingHorizontal: 3,
    zIndex: 55,
    right: 10,
    backgroundColor: "rgba(20, 20, 20, 0.8)",
    borderRadius: 5,
  },
  textContainer: {
    paddingVertical: 15,
    zIndex: 50,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "800",
    color: "white",
    marginTop: 4,
  },
  cameraContainer: {
    position: "absolute",
    bottom: 0,
    right: -10,
    backgroundColor: setWallpaper().iconColor,
    borderRadius: 100,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "lightgray",
    marginTop: 15,
    paddingHorizontal: "10%",
  },
  buttonBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginRight: 2,
    paddingHorizontal: 10,
  },
  icon: {
    height: 30,
    width: 30,
    tintColor: "#000",
  },
  input: {
    backgroundColor: "transparent",
    color: "white",
    fontSize: 25,
    textAlignVertical: "center",
    zIndex: 30,
  },
  textt: {
    color: "#000",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
  },
});
