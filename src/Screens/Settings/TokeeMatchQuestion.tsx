import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ImagePicker from "react-native-image-crop-picker";
import {
  COLORS,
  iconTheme,
  searchBar,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { Image } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";
import { font } from "../../Components/Fonts/Font";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import {
  getContinentsApi,
  getCountriesApi,
  getLanguagesApi,
  update_friend_preferences,
} from "../../Constant/Api";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { LoaderModel } from "../Modals/LoaderModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { SuccessModel } from "../Modals/SuccessModel";
import { useDispatch, useSelector } from "react-redux";
import { setMyProfleData } from "../../Redux/MessageSlice";
import renderIf from "../../Components/renderIf";
import { SetProfileModal } from "../Modals/SetProfileModel";
import {
  checkImageNudity,
  getRemainingSuspensionDays,
  updateViolationAttempt,
} from "../agora/agoraHandler";
import {
  setUserBanned,
  setUserSuspendedDays,
} from "../../reducers/userBanSlice";
import WarningModal from "../Modals/WarningModal";

const isDarkMode = true;
const TOTAL_PAGES = 7;
let banType = "Warning";
let banMessage = "";
let banTitle = "";

export default function TokeeMatchQuestion({ navigation }) {
  const { t } = useTranslation();
  const [languageData, setLanguageData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [ageMoreThanSeventeen, setAgeMoreThanSeventeen] = useState(true);
  const [countryData, setCountryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredFriendCountryData, setFilteredFriendCountryData] = useState(
    []
  );
  const [selectedFriendCountries, setSelectedFriendCountries] = useState([]);
  const [friendCountryData, setFriendCountryData] = useState([]);
  const [friendCountinentCode, setFriendCountinentCode] = useState(0);
  const [friendCountinent, setFriendCountinent] = useState("");
  const [country, setCountry] = useState("");
  const [filteredContinentData, setFilteredContinentData] = useState([]);
  const [friendContinentData, setFriendContinentData] = useState([]);
  const [countryCode, setCountryCode] = useState(0);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [selectedLangugaes, setSelectedLanguages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderSelected, setGenderSelected] = useState("male");
  const [friendGenderSelected, setFriendGenderSelected] = useState("male");
  const [loaderModel, setloaderMoedl] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [openProfileModal, SetOpenProfileModal] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [image, setImage] = useState(0);
  const [images, setImages] = useState({
    firstImage: "",
    secondImage: "",
    thirdImage: "",
    fourthImage: "",
    fifthImage: "",
  });
  const myprofileData = useSelector(
    (state) =>
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      state?.message?.myProfileData
  );
  const dispatch = useDispatch();

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const updateImageState = (imagePath) => {
    const updatedImages = { ...images };
    switch (image) {
      case 1:
        updatedImages.firstImage = imagePath;
        break;
      case 2:
        updatedImages.secondImage = imagePath;
        break;
      case 3:
        updatedImages.thirdImage = imagePath;
        break;
      case 4:
        updatedImages.fourthImage = imagePath;
        break;
      case 5:
        updatedImages.fifthImage = imagePath;
        break;
      default:
        break;
    }
    setImages(updatedImages); // Update the images state with the new image path
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    topBarContainer: {
      height: 50,
      backgroundColor: "#fff",
      marginTop: 20,
      flexDirection: "row",
    },
    backButtonContainer: {
      //  width: "15%",
      justifyContent: "center",
    },
    backButton: {
      height: 20,
      width: 20,
      marginLeft: 15,
      tintColor: iconTheme().iconColorNew,
    },
    topBarTitleContainer: {
      width: Dimensions.get("window").width - 70,
      justifyContent: "center",
      paddingRight: 10,
      alignItems: "center",
    },
    topBarTitle: {
      fontSize: 15,
      color: "#000",
      fontWeight: "600",
    },
    ageText: {
      color: "#000",
      // marginTop: 40,
    },
    container: {
      marginHorizontal: 15,
    },
    radioButton: {
      borderRadius: 25,
      borderWidth: 2,
      borderColor: iconTheme().iconColorNew,
      padding: 2.5,
      height: 25,
      width: 25,
      justifyContent: "center",
    },
    radioButtonContainer: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: searchBar().back_ground,
      padding: 10,
      borderWidth: 1,
      borderRadius: 10,
      borderColor: "transparent",
    },
    radioButtonText: {
      color: "#000",
      fontSize: 15,
      marginLeft: 10,
      fontWeight: "600",
    },
    bottomButton: {
      position: "absolute",
      //  top: Platform.OS == "ios" ? Dimensions.get("window").height - 200 : Dimensions.get("window").height - 80,
      bottom: 40, // 40 units from the bottom
      height: 40,
      width: "90%",
      backgroundColor: iconTheme().iconColorNew,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      borderRadius: 10,
    },
    bottomButtonText: {
      color: "#fff",
      fontWeight: "600",
    },
    nameInputTextContainer: {
      marginRight: 16,
      marginLeft: 16,
      // borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      // borderBottomColor: "#F6EBF3",
    },
    textInput: {
      backgroundColor: "#E8E8E8",
      borderColor: "transparent",
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

    row: {
      flexDirection: "row",
      // marginTop: 30,
    },
    imageColumn: {
      width: "35%",
      height: 330,
      margin: 10,
      justifyContent: "center",
      alignSelf: "center",
      marginTop: 0,
      // marginBottom: 16,
    },
    imageColumn1: {
      width: "60%",
      height: 330,
      // marginBottom: 16,
    },
    imageColumn2: {
      width: "45%",
      height: 150,
      marginTop: 10,
      marginBottom: 16,
      // backgroundColor:"green"
    },
    imageContainer: {
      height: 180,
      borderWidth: 1,
      borderColor: "#ccc",
      alignItems: "center",
      justifyContent: "center",
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
      //   borderRadius: 10,
      //     backgroundColor: iconTheme().iconColorNew,
      //  alignItems: "center",
      //     //justifyContent: "center",
      //     height:20,width:20
    },
    cameraIcon: {
      height: 25,
      width: 25,
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
      tintColor: iconTheme().iconColorNew,
    },
    deleteIcon: {
      height: 15,
      width: 15,
      tintColor: iconTheme().iconColorNew,
    },
    searchIconContainer: {
      width: "10%",
      justifyContent: "center",
    },
    searchIcon: {
      height: 15,
      width: 15,
      tintColor: "#A4A4A4",
    },
  });

  function ToFillValues() {
    if (myprofileData.country) {
      setCountry(myprofileData.country.name);
    } else {
      setCountry("");
    }
    if (myprofileData.country_id && myprofileData.country_id != 0) {
      setCountryCode(myprofileData.country_id);
    } else {
      setCountryCode(0);
    }

    if (myprofileData.friend_country) {
      setFriendCountryData(myprofileData.friend_country);
      setFilteredFriendCountryData(myprofileData.friend_country); // Initialize filtered data
      setSelectedFriendCountries(
        myprofileData.friend_country // Pre-select items
      );
    } else {
      setFriendCountryData([]);
      setFilteredFriendCountryData([]);
      setSelectedFriendCountries([]); // Clear selection
    }

    if (myprofileData.gender) {
      setGenderSelected(myprofileData.gender);
    } else {
      setGenderSelected("male");
    }

    if (myprofileData.friend_continent) {
      setFriendCountinent(myprofileData.friend_continent.name);
      setFriendCountinentCode(myprofileData.friend_continent.id);
      getCountryApiCalling(myprofileData.friend_continent.id);
    } else {
      setFriendCountinent("");
    }
    if (myprofileData.user_languages) {
      setSelectedLanguages(myprofileData.user_languages);
    } else {
      setSelectedLanguages([]);
    }

    if (myprofileData.friend_gender) {
      setFriendGenderSelected(myprofileData.friend_gender);
    } else {
      setFriendGenderSelected("male");
    }
    getContinentsApiCalling();
    setPageNumber(4);
    getCountryApiCalling("");
    getLanguagesApiCalling();
  }
  useEffect(() => {
    if (globalThis.isUserseventeenYearsOld) {
      ToFillValues();
    } else {
      getCountryApiCalling("");
      getLanguagesApiCalling();
    }
  }, []);

  const toggleSelectionLanguage = (item) => {
    const isSelected = selectedLangugaes.some(
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      (country) => country.id === item.id
    );
    if (isSelected) {
      // Remove from selection
      setSelectedLanguages((prev) =>
        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        prev.filter((country) => country.id !== item.id)
      );
    } else {
      // Add to selection
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setSelectedLanguages((prev) => [...prev, item]);
    }
  };

  const toggleSelection = (item) => {
    const isSelected = selectedFriendCountries.some(
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      (country) => country.id === item.id
    );
    if (isSelected) {
      // Remove from selection
      setSelectedFriendCountries((prev) =>
        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        prev.filter((country) => country.id !== item.id)
      );
    } else {
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setSelectedFriendCountries((prev) => [...prev, item]);
    }
  };
  const validateImages = () => {
    const { firstImage, secondImage, thirdImage, fourthImage, fifthImage } =
      images;

    // Check if at least one image is uploaded
    if (firstImage || secondImage || thirdImage || fourthImage || fifthImage) {
      return true; // At least one image is uploaded
    }

    return false; // No images uploaded
  };

  function onContinueClick() {
    console.log("imges>>", images);
    const isAtLeastOneImageValid = validateImages();
    if (pageNumber == 1) {
      if (ageMoreThanSeventeen == true) {
        setPageNumber(2);
      } else {
        navigation.pop();
      }
    } else if (pageNumber == 2) {
      if (!isAtLeastOneImageValid) {
        globalThis.errorMessage = "" + t("please_select_one_image");
        setErrorAlertModel(true);
      } else {
        setPageNumber(3);
      }
    } else if (pageNumber == 3) {
      if (country) {
        setPageNumber(4);
      } else {
        globalThis.errorMessage = "" + t("please_select_country");
        setErrorAlertModel(true);
      }
    } else if (pageNumber == 4) {
      if (selectedLangugaes.length > 0) {
        getContinentsApiCalling();
        setPageNumber(5);
      } else {
        globalThis.errorMessage = "" + t("please_select_language");
        setErrorAlertModel(true);
      }
    } else if (pageNumber == 5) {
      if (friendCountinent) {
        console.log("friendCountinentCode", friendCountinentCode);
        getCountryApiCalling(friendCountinentCode);
        if (friendCountinentCode == 8) {
          setPageNumber(7);
        } else {
          setPageNumber(6);
        }
      } else {
        globalThis.errorMessage = "" + t("pls_select_continent_match");
        setErrorAlertModel(true);
      }
    } else if (pageNumber == 6) {
      if (selectedFriendCountries.length > 0) {
        setPageNumber(7);
      } else {
        globalThis.errorMessage = "" + t("pls_select_countries_match");
        setErrorAlertModel(true);
      }
    } else {
      editProfileApi();
      // setPageNumber(7);
    }
    // else {

    // }
  }

  const getLanguagesApiCalling = () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      getLanguagesApi,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        setLanguageData(ResponseData.data);
      }
    );
  };

  const uploaddata = new FormData();
  const countryCodeInString = countryCode.toString();
  uploaddata.append("country_id", countryCodeInString);
  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  const idsOfLangugage = selectedLangugaes.map((item) => item.id);
  const friendLangugeToString = JSON.stringify(idsOfLangugage);
  uploaddata.append("user_languages", friendLangugeToString);
  const friendContinentToString = friendCountinentCode.toString();
  uploaddata.append("friend_continent", friendContinentToString);
  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  const ids = selectedFriendCountries.map((item) => item.id);
  const friendCountryToString = JSON.stringify(ids);
  uploaddata.append("friend_country", friendCountryToString);
  uploaddata.append("gender", genderSelected);
  uploaddata.append("friend_gender", friendGenderSelected);
  const typeValue = "image/jpeg"; // Example value for type
  const nameValue = "example.jpg";

  const result = Object.values(images)
    .filter((uri) => uri !== "") // Filter out empty URIs
    .map((uri) => ({
      uri: Platform.OS === "android" ? uri : uri?.replace("file://", ""),
      type: typeValue,
      name: nameValue,
    }));

  console.log("result >>>", result);

  // Append each item to formData with the required indexed key format
  result.forEach((asset, index) => {
    //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    uploaddata.append(`preference_images[${index}]`, {
      uri: asset.uri,
      name: asset.name,
      type: asset.type,
    });
  });
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
  };

  const editProfileApi = () => {
    setloaderMoedl(true);
    /////////////////////// ********** Internet Permission   ********** ////////////////////
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
        setloaderMoedl(false);
        return;
      } else {
        console.log("upload data ::", uploaddata);
        PostApiCall(
          update_friend_preferences,
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
  const apiSuccess = async (ResponseData, ErrorStr) => {
    // Custom logic to execute on success
    if (ErrorStr) {
      globalThis.errorMessage = ErrorStr;
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);

      setTimeout(() => {
        setErrorAlertModel(true);
      }, 500);
    } else {
      console.log("updae api data ", ResponseData);
      globalThis.isUserProfileComplete = ResponseData.is_profile_completed;
      globalThis.successMessage = ResponseData.message;
      globalThis.isUserseventeenYearsOld = true;
      // globalThis.age = ResponseData.data.age;
      globalThis.toCallSuggestionApi = true;
      dispatch(setMyProfleData(ResponseData.data.preference));

      setloaderMoedl(false);
      // setErrorAlertModel(true);
      setSuccessAlertModel(true);
    }
  };

  const renderSelectedCountries = () => {
    console.log("selectedFriendCountries", selectedFriendCountries);
    return selectedFriendCountries.length > 0
      ? //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        selectedFriendCountries.map((country) => country.name).join(", ")
      : t("select") + " " + t("Country");
  };

  const handleSearchForFriendContinent = (query) => {
    setFriendCountinent(query);
    const newData = friendContinentData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContinentData(newData);
  };

  const getCountryApiCalling = (id) => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    const apiUrl = getCountriesApi + "?continent_id=" + id;
    console.log("api url", apiUrl);
    GetApiCall(apiUrl, headers, navigation, (ResponseData, ErrorStr) => {
      console.log("country api response:", ResponseData.data);
      if (!id) {
        setCountryData(ResponseData.data);
        setFilteredData(ResponseData.data);
      } else {
        setFilteredFriendCountryData(ResponseData.data);
        setFriendCountryData(ResponseData.data);
      }
    });
  };

  const getContinentsApiCalling = () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      getContinentsApi,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        setFilteredContinentData(ResponseData.data);
        setFriendContinentData(ResponseData.data);
      }
    );
  };

  const handleSearchForFriendCountry = (text) => {
    setSearchQuery(text); // Update search query
    const filtered = friendCountryData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFriendCountryData(filtered);
  };

  const isGenderSelected = (gender) => {
    setGenderSelected(gender);
  };

  const handleSearch = (query) => {
    setCountry(query);
    const newData = countryData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(newData);
  };

  const renderSelectedLanguages = () => {
    return selectedLangugaes.length > 0
      ? //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        selectedLangugaes.map((lang) => lang.name).join(", ")
      : t("select") + " " + "the" + " " + t("language");
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
  const selectImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (!isCameraPermitted) {
      console.log("PERMISSION NOT GRANTED");
      return;
    }

    ImagePicker.openPicker({
      width: 800,
      height: 800,
      compressImageQuality: 0.2,
      mediaType: "photo",
    })
      .then(async (clickedImage) => {
        if (clickedImage?.path) {
          console.log("Selected Image:", clickedImage);
          SetOpenProfileModal(false);
          setTimeout(async () => {
            setloaderMoedl(true)
            // Add delay before making API call
            const filePath = clickedImage.path.startsWith("file://")
            ? clickedImage.path
            : `file://${clickedImage.path}`;
  

            const response = await checkImageNudity(filePath);
            console.log("Nudity Check Response:", response?.data?.is_nude_file);
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
      .catch((error) => console.error("ImagePicker Error:", error));
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
          if (clickedImage?.path) {
            console.log("Selected Image:", clickedImage);
            SetOpenProfileModal(false);
  
            setTimeout(async () => {
              setloaderMoedl(true)
              // Add delay before making API call
              const filePath = clickedImage.path.startsWith("file://")
              ? clickedImage.path
              : `file://${clickedImage.path}`;
    
  
              const response = await checkImageNudity(filePath);
              console.log("Nudity Check Response:", response?.data?.is_nude_file);
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

  const renderImageSection = (imageKey, imageUri, index) => (
    <View
      style={[
        styles.imageContainer,
        {
          height: imageKey == "firstImage" ? 320 : 150,
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

  const handleDelete = (imageKey) => {
    setImages((prevImages) => ({
      ...prevImages,
      [imageKey]: "", // Clear the specific image by using the imageKey
    }));
  };
  ///for image selection////////
  const forImageSelection = (num: number) => {
    setImage(num);
    SetOpenProfileModal(true);
  };

  const ProgressBar = ({ pageNumber }) => {
    const progress = (pageNumber - 1) / (TOTAL_PAGES - 1); // Calculate progress percentage

    return (
      <View
        style={{
          height: 8,
          width: "95%",
          backgroundColor: "#ddd",
          borderRadius: 5,
          overflow: "hidden",
          marginBottom: 20,
          alignSelf: "center",
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: iconTheme().iconColorNew, // Change to your theme color
          }}
        />
      </View>
    );
  };
  return (
    <MainComponent statusBar="#000" statusBarColr="#000" safeAreaColr={"#fff"}>
      <View
        style={{
          height: "100%",
          position: "relative",
          backgroundColor: "#fff",
        }}
      >
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
          visible={openProfileModal}
          onRequestClose={() => SetOpenProfileModal(false)}
          Camera={() => captureImage()}
          select={() => selectImage()}
          cancel={() => SetOpenProfileModal(false)}
        />
        <SuccessModel
          visible={successAlertModel}
          onRequestClose={() => setSuccessAlertModel(false)}
          succesText={globalThis.successMessage}
          doneButton={() => {
            setSuccessAlertModel(false);

            navigation.navigate("BottomBar", {
              screen: "ShopScreen",
              params: { forTab: 2 },
            });
          }}
        />

        <NoInternetModal
          visible={noInternetModel}
          onRequestClose={() => setNoInternetModel(false)}
          headingTaxt={t("noInternet")}
          NoInternetText={t("please_check_internet")}
          cancelButton={() => setNoInternetModel(false)}
        />
        <ErrorAlertModel
          visible={errorAlertModel}
          onRequestClose={() => setErrorAlertModel(false)}
          errorText={globalThis.errorMessage}
          cancelButton={() => setErrorAlertModel(false)}
        />
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        <View style={styles.topBarContainer}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              onPress={() => {
                pageNumber == 1
                  ? navigation.pop()
                  : globalThis.isUserseventeenYearsOld
                  ? pageNumber == 4
                    ? navigation.pop()
                    : setPageNumber(pageNumber - 1)
                  : setPageNumber(pageNumber - 1);
              }}
            >
              <Image
                source={require("../../Assets/Icons/Back_Arrow.png")}
                style={styles.backButton}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.topBarTitleContainer}>
            <Text style={styles.topBarTitle}>
              {pageNumber == 1
                ? t("Age_Confirmation")
                : pageNumber == 2
                ? t("time_to_put_face")
                : pageNumber == 3
                ? t("Country")
                : pageNumber == 4
                ? t("select_language")
                : pageNumber == 5
                ? t("choose_continent")
                : pageNumber == 6
                ? t("choose_country")
                : pageNumber == 7
                ? t("gender")
                : t("match")}
            </Text>
          </View>
        </View>
        <ProgressBar pageNumber={pageNumber} />
        {pageNumber == 1 ? (
          <View style={styles.container}>
            <View style={{ justifyContent: "center" }}>
              <Text style={styles.ageText}>
                {t("I_acknowledge_that_I_am_17yearsololder")}
              </Text>
            </View>

            <View style={{ height: 100 }}>
              <TouchableOpacity
                style={styles.radioButtonContainer}
                onPress={() => setAgeMoreThanSeventeen(true)}
              >
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setAgeMoreThanSeventeen(true)}
                >
                  <View
                    style={{
                      backgroundColor: ageMoreThanSeventeen
                        ? iconTheme().iconColorNew
                        : "transparent",
                      borderRadius: 25,
                      height: 15,
                      width: 15,
                    }}
                  ></View>
                </TouchableOpacity>
                <Text style={styles.radioButtonText}>{t("yes")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioButtonContainer, { marginTop: 10 }]}
                onPress={() => setAgeMoreThanSeventeen(false)}
              >
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setAgeMoreThanSeventeen(false)}
                >
                  <View
                    style={{
                      backgroundColor: !ageMoreThanSeventeen
                        ? iconTheme().iconColorNew
                        : "transparent",
                      borderRadius: 25,
                      height: 15,
                      width: 15,
                    }}
                  ></View>
                </TouchableOpacity>
                <Text style={styles.radioButtonText}>{t("no")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : pageNumber == 2 ? (
          <View style={styles.container}>
            <Text style={styles.ageText}>{t("tokee_match_profile_text")}</Text>
            <View
              style={{ flexDirection: "column", flexGrow: 1, marginTop: 10 }}
            >
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
                  gap: 20,
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
            </View>
          </View>
        ) : pageNumber == 3 ? (
          <View style={styles.container}>
            {/* /////////////////////////////////country-container//////////////////////////////////////// */}
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={styles.ageText}>{t("select_country")}</Text>
            </View>
            <View style={{ height: 550 }}>
              <View
                style={[
                  styles.nameInputTextContainer,
                  { paddingBottom: 0, flexDirection: "row" },
                ]}
              >
                <View
                  style={[
                    styles.textInput,
                    { flexDirection: "row", paddingLeft: 10, width: "85%" },
                  ]}
                >
                  <View style={styles.searchIconContainer}>
                    <Image
                      source={require("../../Assets/Icons/Search.png")}
                      style={styles.searchIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <TextInput
                    style={{
                      width: "90%",
                      height: "100%",
                      justifyContent: "center",
                      borderRadius: 5,
                    }}
                    placeholderTextColor={"#000"}
                    placeholder={t("search") + " " + "the" + " " + t("Country")}
                    value={country}
                    onChangeText={(text) => handleSearch(text)}
                  />
                  {/* <View
                    style={{
                      height: "100%",
                      width: "10%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => {
                        setCountry("");
                        setFilteredData(countryData);
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/Cross.png")}
                        style={{ height: 15, width: 15, tintColor: "gray" }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View> */}
                </View>
                <TouchableOpacity
                  style={{
                    width: "15%",
                    justifyContent: "center",
                    alignItems: "flex-end",
                  }}
                  onPress={() => {
                    setCountry("");
                    setFilteredData(countryData);
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  height: 500,
                  // backgroundColor: searchBar().model_ground,
                  marginRight: 16,
                  marginLeft: 16,
                  // borderWidth: 1,
                  // borderRadius: 5,
                  paddingLeft: 10,
                  marginTop: 12,
                }}
              >
                <FlatList
                  data={filteredData}
                  ListHeaderComponent={() => {
                    if (filteredData.length == 0) {
                      return (
                        <View style={{ height: 30, justifyContent: "center" }}>
                          <Text>{t("No_country_found")}</Text>
                        </View>
                      );
                    }
                  }}
                  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        height: 30,
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                      onPress={() => {
                        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        setCountry(item.name);
                        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        setCountryCode(item.id); // Update search query with selected country
                        setTimeout(() => {
                          Keyboard.dismiss();
                        }, 700);
                      }}
                    >
                      <Text>
                        {
                          //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          item.name
                        }
                      </Text>
                      {renderIf(
                        country == item.name,
                        <Image
                          source={require("../../Assets/Icons/correct_sign.png")}
                          style={{
                            height: 18,
                            width: 18,
                            tintColor: iconTheme().iconColorNew,
                            // marginRight:10
                          }}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        ) : pageNumber == 4 ? (
          <View style={styles.container}>
            {/* /////////////////////////////////language-container//////////////////////////////////////// */}
            <View
              style={{
                justifyContent: "center",
                marginHorizontal: 15,
                marginBottom: 10,
              }}
            >
              <Text style={styles.ageText}>
                {t("You_can_select_multiple_languages")}
              </Text>
            </View>
            <View style={[styles.nameInputTextContainer, { marginTop: 0 }]}>
              <TouchableOpacity
                style={[styles.textInput, { flexDirection: "row" }]}
                onPress={() => {}}
              >
                <View style={{ width: "90%", justifyContent: "center" }}>
                  <Text>{renderSelectedLanguages()}</Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  height: 500,
                  // backgroundColor: searchBar().model_ground,
                  // borderWidth: 1,
                  // borderRadius: 5,
                  paddingLeft: 10,
                  marginTop: 12,
                }}
              >
                <FlatList
                  data={languageData}
                  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const isSelected = selectedLangugaes.some(
                      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      (country) => country.id === item.id
                    );
                    return (
                      <TouchableOpacity
                        style={{
                          height: 30,
                          justifyContent: "space-between",
                          backgroundColor: "transparent",
                          paddingHorizontal: 5,
                          borderRadius: 5,
                          marginVertical: 2,
                          flexDirection: "row",
                        }}
                        onPress={() => toggleSelectionLanguage(item)}
                      >
                        <Text>
                          {
                            //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            item.name
                          }
                        </Text>
                        {renderIf(
                          isSelected,
                          <View
                            style={{
                              height: 20,
                              width: 20,
                              borderColor: iconTheme().iconColorNew,
                              borderWidth: 1,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={require("../../Assets/Icons/correct_sign.png")}
                              style={{
                                height: 15,
                                width: 15,
                                tintColor: iconTheme().iconColorNew,
                                // marginRight:10
                              }}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </View>
          </View>
        ) : pageNumber == 5 ? (
          <View style={styles.container}>
            {/* /////////////////////////////////friend-continent-container//////////////////////////////////////// */}
            <View
              style={{
                justifyContent: "center",
                marginHorizontal: 15,
                marginBottom: 5,
              }}
            >
              <Text style={styles.ageText}>{t("search_continent_match")}</Text>
            </View>
            <View style={[styles.nameInputTextContainer, { paddingBottom: 0 }]}>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={[
                    styles.textInput,
                    { flexDirection: "row", paddingLeft: 10, width: "85%" },
                  ]}
                  onPress={() => {
                    setFilteredContinentData(friendContinentData); // Reset list
                  }}
                  activeOpacity={1} // Prevent dropdown from closing on touch
                >
                  <View
                    style={{
                      height: "100%",
                      width: "10%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/Search.png")}
                      style={styles.searchIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <TextInput
                    style={{
                      width: "90%",
                      height: "100%",
                      justifyContent: "center",
                      borderRadius: 5,
                    }}
                    placeholderTextColor={"#000"}
                    placeholder={t("search") + " " + t("Continent")}
                    value={friendCountinent}
                    onChangeText={(text) =>
                      handleSearchForFriendContinent(text)
                    }
                  />
                  {/* <View
                  style={{
                    height: "100%",
                    width: "10%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      setFriendCountinent("");
                      setFilteredContinentData(friendContinentData);
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/Cross.png")}
                      style={{ height: 15, width: 15, tintColor: "gray" }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: "15%",
                    justifyContent: "center",
                    alignItems: "flex-end",
                  }}
                  onPress={() => {
                    setFriendCountinent("");
                    setFilteredContinentData(friendContinentData);
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  height: 350,
                  //   backgroundColor: searchBar().model_ground,
                  // borderWidth: 1,
                  // borderRadius: 5,
                  paddingLeft: 10,
                  marginTop: 12,
                }}
              >
                <FlatList
                  data={filteredContinentData}
                  ListHeaderComponent={() => {
                    if (filteredContinentData.length == 0) {
                      return (
                        <View style={{ height: 30, justifyContent: "center" }}>
                          <Text>{t("No_continent_found")}</Text>
                        </View>
                      );
                    }
                  }}
                  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        height: 30,
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                      onPress={() => {
                        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        setFriendCountinent(item.name);
                        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        setFriendCountinentCode(item.id);
                        setSelectedFriendCountries([]);

                        setTimeout(() => {
                          Keyboard.dismiss();
                        }, 700);
                      }}
                    >
                      <Text>
                        {
                          //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          item.name
                        }
                      </Text>
                      {renderIf(
                        friendCountinent == item.name,
                        <Image
                          source={require("../../Assets/Icons/correct_sign.png")}
                          style={{
                            height: 18,
                            width: 18,
                            tintColor: iconTheme().iconColorNew,
                            // marginRight:10
                          }}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        ) : pageNumber == 6 ? (
          <View style={styles.container}>
            <View
              style={{
                justifyContent: "center",
                marginHorizontal: 15,
                marginBottom: 5,
              }}
            >
              <Text style={styles.ageText}>{t("search_countries_match")}</Text>
            </View>
            {/* /////////////////////////////////friend-country-container//////////////////////////////////////// */}
            <View style={[styles.nameInputTextContainer, { marginTop: 0 }]}>
              <TouchableOpacity
                style={[styles.textInput, { flexDirection: "row" }]}
              >
                <View style={{ width: "90%", justifyContent: "center" }}>
                  <Text>{renderSelectedCountries()}</Text>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  height: 440,
                  // backgroundColor: searchBar().model_ground,
                  // borderWidth: 1,
                  // borderRadius: 5,
                  paddingLeft: 10,
                  marginTop: 5,
                }}
              >
                {/* Search Input */}
                <TextInput
                  style={{
                    height: 40,
                    borderColor: "#ccc",
                    borderBottomWidth: 1,
                    marginBottom: 5,
                    paddingHorizontal: 8,
                  }}
                  placeholder={t("search") + " " + t("Country")}
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearchForFriendCountry}
                />

                {/* Dropdown List */}
                <FlatList
                  data={filteredFriendCountryData}
                  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item, index }) => {
                    const isSelected = selectedFriendCountries.some(
                      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      (country) => country.id === item.id
                    );
                    return (
                      <TouchableOpacity
                        style={{
                          height: 30,
                          justifyContent: "space-between",
                          flexDirection: "row",
                          // backgroundColor: isSelected
                          //   ? "#d3d3d3"
                          //   : "transparent",
                          paddingHorizontal: 5,
                          borderRadius: 5,
                          marginVertical: 2,
                          marginTop: index == 0 ? 12 : 0,
                        }}
                        onPress={() => toggleSelection(item)}
                      >
                        <Text>
                          {
                            //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            item.name
                          }
                        </Text>
                        {renderIf(
                          isSelected,
                          <View
                            style={{
                              height: 20,
                              width: 20,
                              borderColor: iconTheme().iconColorNew,
                              borderWidth: 1,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={require("../../Assets/Icons/correct_sign.png")}
                              style={{
                                height: 15,
                                width: 15,
                                tintColor: iconTheme().iconColorNew,
                                // marginRight:10
                              }}
                              resizeMode="contain"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.container}>
            <View style={{ justifyContent: "center", marginHorizontal: 15 }}>
              <Text style={styles.ageText}>{t("gender_des")}</Text>
            </View>

            <View style={{ height: 100, marginHorizontal: 15 }}>
              <TouchableOpacity
                style={[
                  styles.radioButtonContainer,
                  { justifyContent: "space-between" },
                ]}
                onPress={() => isGenderSelected("male")}
              >
                <Text style={styles.radioButtonText}>{t("Male")}</Text>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => isGenderSelected("male")}
                >
                  <View
                    style={{
                      backgroundColor:
                        genderSelected == "male"
                          ? iconTheme().iconColorNew
                          : "transparent",
                      borderRadius: 25,
                      height: 15,
                      width: 15,
                    }}
                  ></View>
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioButtonContainer,
                  { marginTop: 10, justifyContent: "space-between" },
                ]}
                onPress={() => isGenderSelected("female")}
              >
                <Text style={styles.radioButtonText}>{t("Female")}</Text>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => isGenderSelected("female")}
                >
                  <View
                    style={{
                      backgroundColor:
                        genderSelected == "female"
                          ? iconTheme().iconColorNew
                          : "transparent",
                      borderRadius: 25,
                      height: 15,
                      width: 15,
                    }}
                  ></View>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {renderIf(
          !keyboardVisible,
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => onContinueClick()}
          >
            <Text style={styles.bottomButtonText}>{t("Continue")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <LoaderModel
        visible={loaderModel}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
    </MainComponent>
  );
}
