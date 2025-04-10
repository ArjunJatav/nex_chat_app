import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-native-date-picker";
import {
  Dimensions,
  FlatList,
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
  TouchableWithoutFeedback,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import ImagePicker from "react-native-image-crop-picker";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  iconTheme,
  searchBar,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import {
  getContinentsApi,
  getCountriesApi,
  getLanguagesApi,
  get_profile,
  update_profile,
} from "../../Constant/Api";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";
import { SetProfileModal } from "../Modals/SetProfileModel";
import axios from "axios";
import renderIf from "../../Components/renderIf";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
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
import { useDispatch } from "react-redux";
// import MultiSelect from "react-native-multiple-select";

const isDarkMode = true;
let banType = "Warning";
let banMessage = "";
let banTitle = "";

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
  const [userTagline, setUserTagline] = useState("");
  const [languageData, setLanguageData] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [dragText, setDragText] = useState([]);
  const { t } = useTranslation();

  const [filteredData, setFilteredData] = useState([]);
  const [filteredContinentData, setFilteredContinentData] = useState([]);
  const [filteredFriendCountryData, setFilteredFriendCountryData] = useState(
    []
  );
  const focus = useIsFocused();
  const navigationn = useNavigation();
  const userImageUrl = route?.params?.userImage || globalThis.userImage;
  const filePathUrl = filePath;
  const cacheBuster = Date.now();

  console.log("filePath===========", filePath.length);

  // const premiumUser = true;
  const [inputBoxes, setInputBoxes] = useState([]);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [showBoi, setShowBio] = useState(false);
  const [bioCharaLimitFreeUser, setBioCharaLimitFreeUser] = useState(0);
  const [profileLinkLimit, setProfileLinkLimit] = useState(0);
  const [bioCharaLimitPremiumUser, setBioCharaLimitPremiumUser] = useState(0);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [datestr, setDatestr] = useState("");

  const [genderSelected, setGenderSelected] = useState("male");
  const [friendGenderSelected, setFriendGenderSelected] = useState("male");
  const [country, setCountry] = useState("");
  const [continents, setContinents] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [friendCountryDropdownOpen, setFriendCountryDropdownOpen] =
    useState(false);
  const [selectedFriendCountries, setSelectedFriendCountries] = useState([]);
  const [friendContinentDropdownOpen, setFriendContinentDropdownOpen] =
    useState(false);
  const [friendCountinent, setFriendCountinent] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [continentsDropdownOpen, setContinentsDropdownOpen] = useState(false);
  const [LanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const [selectedLangugaes, setSelectedLanguages] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [friendCountryData, setFriendCountryData] = useState([]);
  const [friendContinentData, setFriendContinentData] = useState([]);
  const [countryCode, setCountryCode] = useState(0);
  const [friendCountinentCode, setFriendCountinentCode] = useState(0);
  const [continentCode, setContinentCode] = useState(0);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const dispatch = useDispatch();
  // Regex pattern for basic URL validation
  // Regex pattern for basic URL validation
  const urlRegex =
    /^(https?:\/\/)?([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,})(\/[^\s]*)?$/i;
  const websiteRegex = /^[^\s]+$/;

  // Function to add a new InputBox
  const addInputBox = () => {
    if (!inputBoxes) {
      // Initialize inputBoxes if it is null or undefined
      setInputBoxes([]);

      return;
    }

    // Remove spaces from website and URL fields
    const sanitizedInputBoxes = inputBoxes.map((box) => ({
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      ...box,
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      website: box.website.replace(/\s+/g, ""), // Remove spaces from website
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      url: box.url.replace(/\s+/g, ""), // Remove spaces from URL
    }));

    // Check for incomplete fields
    const incompleteFields = sanitizedInputBoxes.filter(
      (box) => !box.website || !box.url
    );
    // Validate website names

    // Validate URLs
    const invalidUrls = sanitizedInputBoxes.filter(
      (box) => box.url && !urlRegex.test(box.url)
    );
    if (incompleteFields.length > 0) {
      // Show alert for incomplete fields
      // Alert.alert(
      //   t("Incomplete_Links"),
      //   t("Please_fill_in_all_fields_before_addinmoreo"),
      //   [{ text: t("ok") }]
      // );

      globalThis.errorMessage =
        t("Incomplete_Links") +
        ", " +
        t("Please_fill_in_all_fields_before_addinmoreo");
      setErrorAlertModel(true);
    } else if (invalidUrls.length > 0) {
      // Show alert for invalid URLs
      // Alert.alert(t("Invali_uels"), t("Please_ensure_all_URLs_are_valid"), [
      //   { text: t("ok") },
      // ]);

      globalThis.errorMessage = t("Please_ensure_all_URLs_are_valid");
      setErrorAlertModel(true);
    } else if (inputBoxes.length >= globalThis.profileBioLinksLimit) {
      // Show alert for exceeding the limit
      // Alert.alert(t("Limit_Reached"), t("You_can_only_add_upo_bio_links"), [
      //   { text: t("ok") },
      // ]);
      globalThis.errorMessage =
        t("Limit_Reached") + ", " + t("You_can_only_add_upo_bio_links");
      setErrorAlertModel(true);
    } else {
      // Add new input box if all fields are valid and limit is not reached
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setInputBoxes([...inputBoxes, { id: Date.now(), website: "", url: "" }]);
    }
  };
  // Function to remove an InputBox by ID
  const removeInputBox = (id) => {
    //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    setInputBoxes(inputBoxes?.filter((box) => box?.id !== id));
  };

  // Function to handle text input changes
  const handleInputChange = (id, field, value) => {
    setInputBoxes(
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      inputBoxes?.map((box) =>
        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        box?.id === id ? { ...box, [field]: value } : box
      )
    );
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
        getLanguagesApiCalling();
      }
    );
  };

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
  const getCountryApiCalling = (id) => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      getCountriesApi + "?continent_id=" + id,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        if (!id) {
          setCountryData(ResponseData.data);
          setFilteredData(ResponseData.data);
        } else {
          setFilteredFriendCountryData(ResponseData.data);
          setFriendCountryData(ResponseData.data);
        }
      }
    );
  };
  const imageUrl =
    filePathUrl.length === 0
      ? `${userImageUrl}?${cacheBuster}`
      : `${filePathUrl}?${cacheBuster}`;

  ////////////////////// // **********  Methods For Navigation ********** ///////////////////////////
  const buttonPress = () => {
    //  Keyboard.dismiss();
    if (route?.params?.fromExplore == false) {
      navigationn.goBack();
    } else {
      navigation.navigate("BottomBar");
    }
  };

  useEffect(() => {
    if (route?.params?.userTagline) {
      setUserTagline(route?.params?.userTagline);
    }
    // const todayDate = new Date();
    // const finalDate = formatDate(todayDate);
    // setDatestr(finalDate);
    getProfileApi();
    setFilePath(imageUrl);
    getCountryApiCalling("");
    getContinentsApiCalling();
  }, [focus, route?.params?.userTagline]);

  ////////////////////// // **********  Select Image From Lounch Camera  ********** ///////////////////////////
  const captureImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker?.openCamera({
        // width: 150,
        // height: 150,
        // cropping: true,
        // compressImageQuality: 0.1,
        mediaType: "photo",
      })
        .then((image) => {
          if (image !== undefined && image !== null) {
            // setFilePath(image?.path);
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
                console.log(
                  "result?.data?.suspended_remove_date====================================",
                  result
                );
                if (result.success) {
                  const remainingDays = getRemainingSuspensionDays(
                    result?.data?.suspended_remove_date
                  );
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
                setFilePath(image?.path);
              }
            }, 500);
          }
        })
        .catch(() => {
          setWallpaperModel(false);
        });
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);

    // Get day, month, and year
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns month from 0 to 11
    const year = date.getFullYear();

    // Return the formatted date as dd-mm-yyyy
    return `${day}-${month}-${year}`;
  };

  function convertToISO8601(input) {
    // Detect if the input is already in ISO-compatible format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return new Date(input).toISOString(); // Convert directly to ISO 8601
    }

    // Otherwise, validate the input as DD-MM-YYYY
    if (!/^\d{2}-\d{2}-\d{4}$/.test(input)) {
      throw new Error("Invalid date format. Expected DD-MM-YYYY.");
    }

    // Split the DD-MM-YYYY string into day, month, and year
    const [day, month, year] = input.split("-").map(Number);

    // Create a UTC date object
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString();
  }

  const isGenderSelected = (gender) => {
    setGenderSelected(gender);
  };
  const isFriendGenderSelected = (gender) => {
    setFriendGenderSelected(gender);
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
  // eslint-disable-next-line
  const profileApiSuccess = (ResponseData: any, ErrorStr: any) => {
    console.log("profile api response ::", ResponseData.data);
    if (ErrorStr) {
      //Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      console.log("ErrorStr", ErrorStr);
      setloaderMoedl(false);
      // Navigate to another screen or handle the error in some way
    } else {
      console.log("STEP 1 >>.");
      setuserName(ResponseData.data.first_name);
      setCoverImage(ResponseData.data.cover_image);
      setFilePath("");
      console.log("STEP 2 >>.");

      setUserTagline(ResponseData.data.tagline);
      console.log("STEP 3 >>.");
      if (ResponseData.data.country) {
        setCountry(ResponseData.data.country.name);
      } else {
        setCountry("");
      }
      console.log("STEP 4 >>.");
      if (ResponseData.data.country_id && ResponseData.data.country_id != 0) {
        setCountryCode(ResponseData.data.country_id);
      } else {
        setCountryCode(0);
      }
      console.log("STEP 5 >>.");
      if (ResponseData.data.continent) {
        setContinents(ResponseData.data.continent.name);
      } else {
        setContinents("");
      }
      console.log("STEP 6 >>.");
      if (
        ResponseData.data.continent_id &&
        ResponseData.data.continent_id != 0
      ) {
        setContinentCode(ResponseData.data.continent_id);
        //  getCountryApiCalling(ResponseData.data.continent_id);
      } else {
        setContinentCode(0);
      }
      console.log("STEP 7 >>.", ResponseData.data.friend_country);
      if (ResponseData.data.friend_country) {
        setFriendCountryData(ResponseData.data.friend_country);
        setFilteredFriendCountryData(ResponseData.data.friend_country); // Initialize filtered data
        setSelectedFriendCountries(
          ResponseData.data.friend_country // Pre-select items
        );
      } else {
        setFriendCountryData([]);
        setFilteredFriendCountryData([]);
        setSelectedFriendCountries([]); // Clear selection
      }

      if (ResponseData.data.dob) {
        const date = convertDateFormat(ResponseData.data.dob);
        setDatestr(date);
        const isDate = convertToISO8601(ResponseData.data.dob);
        const convertedDate = new Date(isDate);
        setDate(convertedDate);
      } else {
        setDatestr("");
      }

      if (ResponseData.data.gender) {
        setGenderSelected(ResponseData.data.gender);
      } else {
        setGenderSelected("male");
      }

      if (ResponseData.data.friend_continent) {
        setFriendCountinent(ResponseData.data.friend_continent.name);
        getCountryApiCalling(ResponseData.data.friend_continent.id);
      } else {
        setFriendCountinent("");
      }
      console.log("STEP 9 >>.");
      if (ResponseData.data.user_languages) {
        setSelectedLanguages(ResponseData.data.user_languages);
      } else {
        setSelectedLanguages([]);
      }
      if (ResponseData.data.friend_gender) {
        setFriendGenderSelected(ResponseData.data.friend_gender);
      } else {
        setFriendGenderSelected("male");
      }
      console.log("STEP 10 >>.");
      ResponseData.setting.map((premiumKey) => {
        if (premiumKey.key == "PREMIUM_PROFILE_LINKS_LIMITS") {
          setProfileLinkLimit(Number(premiumKey.value));
          globalThis.profileBioLinksLimit = premiumKey.value;
        }
        if (premiumKey.key === "BIO_CHARACTER_LIMITS_FOR_FREE_USERS") {
          setBioCharaLimitFreeUser(Number(premiumKey.value));
          globalThis.bioCharacterLimitsForFreeUsers = premiumKey.value;
        }

        if (premiumKey.key === "BIO_CHARACTER_LIMITS_FOR_PREMIUM_USERS") {
          setBioCharaLimitPremiumUser(Number(premiumKey.value));
          globalThis.bioCharacterLimitsForPremiumUsers = premiumKey.value;
        }
      });

      const apiResponse = JSON.parse(ResponseData?.data?.bio_link || []);
      if (premiumUser) {
        setInputBoxes(apiResponse);
      } else {
        setInputBoxes([]);
      }

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
            setCoverModal(false);
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
                console.log(
                  "result?.data?.suspended_remove_date====================================",
                  result
                );
                if (result.success) {
                  const remainingDays = getRemainingSuspensionDays(
                    result?.data?.suspended_remove_date
                  );

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
                setCoverImage(image?.path);
              }
            }, 500);
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
        compressImageQuality: 0.7,
        mediaType: "photo",
      })
        .then((image) => {
          if (image !== undefined && image !== null) {
            setAvatarModel(false);

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
                setAvatarModel(false);
                const reason = `In update profile, the user uploaded inappropriate image.`;
                const result = await updateViolationAttempt(reason);
                console.log(
                  "result?.data?.suspended_remove_date====================================",
                  result
                );
                if (result.success) {
                  const remainingDays = getRemainingSuspensionDays(
                    result?.data?.suspended_remove_date
                  );

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
                      "This profile photo violates our guidelines as it contains inappropriate content. Please upload a suitable image.";
                    setErrorAlertModel(true);
                  }
                }
              } else {
                setloaderMoedl(false);
                fetchAIResponse(image?.path);
              }
            }, 500);
          }
        })
        .catch(() => {
          setAvatarModel(false);
        });
    }
  };

  function convertDateFormat(dateStr) {
    const parts = dateStr.split("-");

    // Check if the first part is the year (YYYY)
    if (parts[0].length === 4) {
      // Input is in YYYY-MM-DD, convert to DD-MM-YYYY
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    } else {
      // Input is in DD-MM-YYYY, convert to YYYY-MM-DD
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
  }

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
  const countryCodeInString = countryCode.toString();
  uploaddata.append("country_id", countryCodeInString);
  const continentCodeInString = continentCode.toString();
  uploaddata.append("continent_id", continentCodeInString);
  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  const ids = selectedFriendCountries.map((item) => item.id);
  const friendCountryToString = JSON.stringify(ids);
  uploaddata.append("friend_country", friendCountryToString);
  const friendContinentToString = friendCountinentCode.toString();
  uploaddata.append("friend_continent", friendContinentToString);
  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  const idsOfLangugage = selectedLangugaes.map((item) => item.id);
  const friendLangugeToString = JSON.stringify(idsOfLangugage);
  uploaddata.append("user_languages", friendLangugeToString);
  uploaddata.append(
    "bio_links",
    inputBoxes != null ? JSON.stringify(inputBoxes) : ""
  );
  const convertedDate = convertDateFormat(datestr);
  uploaddata.append("dob", convertedDate);
  uploaddata.append("gender", genderSelected);
  uploaddata.append("friend_gender", friendGenderSelected);
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
        width: 800,
        height: 800,
        cropping: false,
        compressImageQuality: 1.0,
        cropperCircleOverlay: true,
        mediaType: "photo",
        // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined) {
          setWallpaperModel(false);
          setTimeout(async () => {
            setloaderMoedl(true);
            // Add delay before making API call
            const filePath = image.path.startsWith("file://")
              ? image.path
              : `file://${image.path}`;

            const response = await checkImageNudity(filePath);
            console.log("Nudity Check Response:", response?.data?.is_nude_file);
            if (response?.data?.is_nude_file == true) {
              setloaderMoedl(false);
              setAvatarModel(false);
              const reason = `In update profile, the user uploaded inappropriate image.`;
              const result = await updateViolationAttempt(reason);
              console.log(
                "result?.data?.suspended_remove_date====================================",
                result
              );
              if (result.success) {
                const remainingDays = getRemainingSuspensionDays(
                  result?.data?.suspended_remove_date
                );

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
                    "This profile photo violates our guidelines as it contains inappropriate content. Please upload a suitable image.";
                  setErrorAlertModel(true);
                }
              }
            } else {
              setloaderMoedl(false);
              setFilePath(image.path);
            }
          }, 500);
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
        mediaType: "photo",
        // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined) {
          setCoverModal(false);
          setTimeout(async () => {
            setloaderMoedl(true);
            // Add delay before making API call
            const filePath = image.path.startsWith("file://")
              ? image.path
              : `file://${image.path}`;

            const response = await checkImageNudity(filePath);
            console.log("Nudity Check Response:", response?.data?.is_nude_file);
            if (response?.data?.is_nude_file == true) {
              setloaderMoedl(false);
              setAvatarModel(false);
              const reason = `In update profile, the user uploaded inappropriate image.`;
              const result = await updateViolationAttempt(reason);
              console.log(
                "result?.data?.suspended_remove_date====================================",
                result
              );
              if (result.success) {
                const remainingDays = getRemainingSuspensionDays(
                  result?.data?.suspended_remove_date
                );

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
                    "This profile photo violates our guidelines as it contains inappropriate content. Please upload a suitable image.";
                  setErrorAlertModel(true);
                }
              }
            } else {
              setloaderMoedl(false);
              setCoverImage(image.path);
            }
          }, 500);
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
        mediaType: "photo",
        // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined) {
          setAvatarModel(false);

          setTimeout(async () => {
            setloaderMoedl(true);
            // Add delay before making API call
            const filePath = image.path.startsWith("file://")
              ? image.path
              : `file://${image.path}`;

            const response = await checkImageNudity(filePath);
            console.log("Nudity Check Response:", response?.data?.is_nude_file);
            if (response?.data?.is_nude_file == true) {
              setloaderMoedl(false);
              setAvatarModel(false);
              const reason = `In update profile, the user uploaded inappropriate image.`;
              const result = await updateViolationAttempt(reason);
              console.log(
                "result?.data?.suspended_remove_date====================================",
                result
              );

              if (result.success) {
                const remainingDays = getRemainingSuspensionDays(
                  result?.data?.suspended_remove_date
                );

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
                    "This profile photo violates our guidelines as it contains inappropriate content. Please upload a suitable image.";
                  setErrorAlertModel(true);
                }
              }
            } else {
              setloaderMoedl(false);
              fetchAIResponse(image?.path);
            }
          }, 500);
        }
      });
    } else {
      console.log("PERMISSION nOT GRANTED");
    }
  };
  const saveDataButton = () => {
    Keyboard.dismiss();
    console.log("imageUrl====================================", imageUrl);

    // Check for profile image
    if (
      imageUrl.startsWith(
        "https://tokeecorp.com/backend/public/images/user-avatar.png"
      )
    ) {
      globalThis.errorMessage = "Please choose a profile image.";
      setErrorAlertModel(true);
      return;
    }

    if (userName?.toLowerCase()?.includes("tokee")) {
      globalThis.errorMessage = t("you_cn_use_tokee_name");
      setErrorAlertModel(true);
      return; // Exit early if "tokee" is found
    }

    if (userName === "" || userName === null) {
      globalThis.errorMessage = "Name Field is Required.";
      setErrorAlertModel(true);
      return;
    }

    // Regex patterns
    const urlRegex =
      /^(https?:\/\/)?([a-zA-Z0-9\-\.]+)\.([a-zA-Z]{2,})(\/[^\s]*)?$/i;
    const websiteRegex = /^[^\s]+$/;

    const sanitizedInputBoxes = inputBoxes?.map((box) => ({
      ...box,
      website: box.website.replace(/\s+/g, ""), // Remove spaces from website
      url: box.url.replace(/\s+/g, ""), // Remove spaces from URL
    }));

    // Validation for incomplete fields
    const incompleteFields = sanitizedInputBoxes?.filter(
      (box) => !box?.website || !box?.url
    );
    if (incompleteFields?.length > 0) {
      globalThis.errorMessage =
        t("Incomplete_Links") +
        ", " +
        t("Please_fill_in_all_fields_before_addinmoreo");
      setErrorAlertModel(true);
      return;
    }

    if (!datestr) {
      globalThis.errorMessage = t("Oops") + " " + t("please_select_dob");
      setErrorAlertModel(true);
      return;
    }

    if (!country) {
      globalThis.errorMessage = "" + t("please_select_country");
      setErrorAlertModel(true);
      return;
    }

    if (!friendCountinent) {
      globalThis.errorMessage =
        t("Oops") + " " + t("please_select_friend_continents");
      setErrorAlertModel(true);
      return;
    }

    if (friendCountryData.length < 0 || friendCountryData.length === 0) {
      globalThis.errorMessage =
        t("Oops") + " " + t("please_select_friend_country");
      setErrorAlertModel(true);
      return;
    }

    // Validate website names
    const invalidWebsites = sanitizedInputBoxes?.filter(
      (box) => !websiteRegex.test(box?.website)
    );
    if (invalidWebsites?.length > 0) {
      globalThis.errorMessage =
        t("Invali_Label") + ", " + t("Please_ensure_all_label_names_are_valid");
      setErrorAlertModel(true);
      return;
    }

    // Validate URL format
    const invalidUrls = sanitizedInputBoxes?.filter(
      (box) => !urlRegex.test(box?.url)
    );
    if (invalidUrls?.length > 0) {
      globalThis.errorMessage =
        t("Invali_uels") + ", " + t("Please_ensure_all_URLs_are_valid");
      setErrorAlertModel(true);
      return;
    }

    setConfirmAlertModel(true);
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
      globalThis.errorMessage = ErrorStr;
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);

      setTimeout(() => {
        setErrorAlertModel(true);
      }, 500);
    } else {
      console.log("updae api data ", ResponseData.data);
      globalThis.isUserProfileComplete = ResponseData.is_profile_completed;
      globalThis.successMessage = ResponseData.message;
      globalThis.userImage = ResponseData.data.profile_image;
      globalThis.userImage = ResponseData.data.profile_image;
      globalThis.thumbnail = ResponseData.data.thumbnail;
      globalThis.displayName = ResponseData.data.first_name;
      globalThis.age = ResponseData.data.age;

      const sender_Data = {
        userImage: ResponseData.data.profile_image,
        userName: ResponseData.data.first_name,
        sender_id: ResponseData.data.id,
        userChatId: ResponseData.data.chat_user_id,
      };

      await AsyncStorage.setItem("sender_Data", JSON.stringify(sender_Data));

      // let countryName = "not assigned";
      // if (ResponseData.data.country.name) {
      //   countryName = ResponseData.data.country.name;
      // } else {
      //   countryName = "not assigned";
      // }
      // globalThis.countryName = countryName;

      // let continentName = "not assigned";
      // if (ResponseData.data.continent.name) {
      //   continentName = ResponseData.data.continent.name;
      // } else {
      //   continentName = "not assigned";
      // }
      // globalThis.continentName = continentName;

      // let friend_country = "not assigned";
      // if (ResponseData.data.friend_country) {
      //   friend_country = ResponseData.data.friend_country;
      // } else {
      //   friend_country = "not assigned";
      // }
      // globalThis.friendCountry = friend_country;
      await AsyncStorage.setItem("userName", ResponseData.data.first_name);
      /// await AsyncStorage.getItem("userName");
      // Alert.alert(t("success"), ResponseData.message, [
      //   { text: t("ok"), onPress: () => navigation.navigate("BottomBar") },
      // ]);

      setloaderMoedl(false);
      // setErrorAlertModel(true);
      setSuccessAlertModel(true);
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
      // borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      // borderBottomColor: "#F6EBF3",
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
    dropDownContainer: {
      height: 50,
      width: 50,
      backgroundColor: "red",
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

  const premiumUser = globalThis.isUserPremium;

  const charLimit = premiumUser
    ? bioCharaLimitPremiumUser
    : bioCharaLimitFreeUser;

  ////////   **** FOR PREMIMUM USER ****   //////

  let premiumAlertHeading =
    showBoi == true ? t("You_have_exceed_the_Limit") : t("Premium_Feature");
  let premiumAlertSubHeading =
    showBoi == true
      ? t("You_have_exceed_the_Limit_bio")
      : t("You_have_exceed_the_Limit_Add_More_links");
  let premiumAlertFirstButtonText = "Ok";
  let premiumAlertSecondButtonText = "Go To Premium";

  const renderSelectedCountries = () => {
    console.log("selectedFriendCountries", selectedFriendCountries);
    return selectedFriendCountries.length > 0
      ? //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        selectedFriendCountries.map((country) => country.name).join(", ")
      : t("select") + " " + t("Country");
  };

  const renderSelectedLanguages = () => {
    return selectedLangugaes.length > 0
      ? //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        selectedLangugaes.map((lang) => lang.name).join(", ")
      : t("select") + " " + t("language");
  };

  const handleSearch = (query) => {
    setCountry(query);
    const newData = countryData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(newData);
  };

  const handleSearchForFriendContinent = (query) => {
    setFriendCountinent(query);
    const newData = friendContinentData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContinentData(newData);
  };

  const handleSearchForFriendCountry = (text) => {
    setSearchQuery(text); // Update search query
    const filtered = friendCountryData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFriendCountryData(filtered);
  };

  const handleOutsidePress = () => {
    console.log("pressed outside");
    if (LanguageDropdownOpen) {
      setLanguageDropdownOpen(false);
      //   Keyboard.dismiss();
    }
    if (countryDropdownOpen) {
      setCountryDropdownOpen(false);
      //  Keyboard.dismiss();
    }
    if (friendContinentDropdownOpen) {
      //  setFriendContinentDropdownOpen(false);
      //  Keyboard.dismiss();
    }
    if (friendCountryDropdownOpen) {
      //  setFriendCountryDropdownOpen(false);
      //   Keyboard.dismiss();
    }
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

      <DatePicker
        mode="date"
        modal
        maximumDate={
          new Date(new Date().setFullYear(new Date().getFullYear() - 17))
        }
        open={open}
        date={date}
        onConfirm={(selectedDate) => {
          setOpen(false);
          setDate(selectedDate);
          console.log("selectedDate", selectedDate);
          console.log("<>", typeof selectedDate);
          const isDate = formatDate(selectedDate);

          setDatestr(isDate);
          // setDobValue(moment(selectedDate).format("YYYY-MM-DD"));
        }}
        onCancel={() => {
          setOpen(false);
        }}
        theme="auto"
      />

      <SetProfileModal
        visible={coverModal}
        onRequestClose={() => setCoverModal(false)}
        Camera={() => captureCoverImage()}
        select={() => selectCoverImage()}
        cancel={() => setCoverModal(false)}
      />
      <ConfirmAlertModel
        visible={confirmAlertModel}
        onRequestClose={() => setConfirmAlertModel(false)}
        confirmText={t("do_you_want_to_update_your_profile")}
        cancel={() => setConfirmAlertModel(false)}
        confirmButton={() => {
          setConfirmAlertModel(false), editProfileApi();
        }}
      />
      <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={globalThis.successMessage}
        doneButton={() => {
          setSuccessAlertModel(false), navigation.navigate("BottomBar");
        }}
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
        firstButtonClick={() => setShowPremiumAlert(false)}
        secondButtonClick={() => {
          if (premiumAlertSecondButtonText == "Cancel") {
            setShowPremiumAlert(false);
          } else {
            setShowPremiumAlert(false);
            navigation.navigate("PremiumFeaturesScreen");
          }
        }}
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
              onPress={() => {
                if (
                  !globalThis.isUserPremium &&
                  userTagline?.length > charLimit
                ) {
                  setShowBio(true);
                  setShowPremiumAlert(true);
                } else {
                  saveDataButton();
                }
              }}
            >
              <Text style={styles.cancelText}>{t("save")} </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ///////////////////////////////////theme-based-header//////////////////////////////// */}
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
        {/* /////////////////////// ********** Profile View ********** //////////////////// */}
      </View>
      <View style={styles.chatContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "height" : "height"}
          style={{ flex: 1 }} // Transparent background
          keyboardVerticalOffset={Platform.OS === "ios" ? 170 : 170}
        >
          <TouchableWithoutFeedback
            onPress={handleOutsidePress}
            accessible={false} // Ensures interaction with child components
          >
            <ScrollView
              automaticallyAdjustKeyboardInsets={false}
              showsVerticalScrollIndicator={false}
              bounces={true}
              contentContainerStyle={{ flexGrow: 1 }}
              contentInsetAdjustmentBehavior="never"
              keyboardShouldPersistTaps="always"
              style={{ flex: 1, height: "100%" }}
            >
              <View style={{ height: "100%", flex: 1, paddingBottom: 250 }}>
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
                      {filePath?.length == 0 ? (
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
                      marginTop:
                        globalThis.showMirrorApiAvatar == "NO" ? 25 : 25,
                    },
                  ]}
                >
                  <Text style={styles.phoneText}>
                    {route?.params?.phoneNumber}
                  </Text>
                </View>
                <View style={styles.nameTextContainer}>
                  <Text style={styles.nameText}>{t("Your_name")} </Text>
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

                {/* /////////////age-container/////////// */}
                <View style={styles.nameTextContainer}>
                  <Text style={styles.nameText}>{t("your_dob")} </Text>
                </View>
                <View style={[styles.nameInputTextContainer]}>
                  <TouchableOpacity
                    style={[styles.textInput, { flexDirection: "row" }]}
                    onPress={() => setOpen(true)}
                  >
                    <View style={{ width: "90%", justifyContent: "center" }}>
                      <Text>
                        {datestr
                          ? datestr
                          : // : t("select") + " " + t("date_of_birth")}
                            t("Select_Date_of_Birth")}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: "10%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/calendar.png")}
                        style={{ height: 15, width: 15 }}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* ///////////////////////////////email-container/////////////////////////////////// */}
                {renderIf(
                  globalThis.userEmailId,
                  <>
                    <View style={styles.nameTextContainer}>
                      <Text style={styles.nameText}>{t("your_mail")} </Text>
                    </View>
                    <View style={[styles.nameInputTextContainer]}>
                      <View
                        style={[styles.textInput, {flexDirection: "row" }]}
                        // onPress={() => setOpen(true)}
                      >
                        <View
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          <Text>{globalThis.userEmailId}</Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}

                {/* /////////////gender-container////////////////// */}
                <View style={styles.nameTextContainer}>
                  <Text style={styles.nameText}>{t("your_gender")} </Text>
                </View>

                {/* //////////////male-gender-container////////////// */}
                <View
                  style={[
                    styles.nameInputTextContainer,
                    { flexDirection: "row", alignItems: "center" },
                  ]}
                >
                  <View style={{ width: "10%" }}>
                    <TouchableOpacity
                      style={{
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor:
                          genderSelected == "male" ? "green" : "gray",
                        padding: 2.5,
                        height: 25,
                        width: 25,
                        justifyContent: "center",
                      }}
                      onPress={() => isGenderSelected("male")}
                    >
                      <View
                        style={{
                          backgroundColor:
                            genderSelected == "male" ? "green" : "transparent",
                          borderColor:
                            genderSelected == "male" ? "green" : "gray",
                          borderRadius: 25,
                          height: 15,
                          width: 15,
                        }}
                      ></View>
                    </TouchableOpacity>
                  </View>

                  <View style={{ width: "90%" }}>
                    <Text style={[styles.nameText, { marginTop: 0 }]}>
                      {t("Male")}
                    </Text>
                  </View>
                </View>

                {/* //////////////female-gender-container////////////// */}
                <View
                  style={[
                    styles.nameInputTextContainer,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 5,
                    },
                  ]}
                >
                  <View style={{ width: "10%" }}>
                    <TouchableOpacity
                      style={{
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor:
                          genderSelected == "female" ? "green" : "gray",
                        padding: 2.5,
                        height: 25,
                        width: 25,
                        justifyContent: "center",
                      }}
                      onPress={() => isGenderSelected("female")}
                    >
                      <View
                        style={{
                          backgroundColor:
                            genderSelected == "female"
                              ? "green"
                              : "transparent",
                          borderColor:
                            genderSelected == "female" ? "green" : "gray",
                          borderRadius: 25,
                          height: 15,
                          width: 15,
                        }}
                      ></View>
                    </TouchableOpacity>
                  </View>

                  <View style={{ width: "90%" }}>
                    <Text style={[styles.nameText, { marginTop: 0 }]}>
                      {t("Female")}
                    </Text>
                  </View>
                </View>

                {/* //////////////others-gender-container////////////// */}
                {/* <View
                style={[
                  styles.nameInputTextContainer,
                  { flexDirection: "row", alignItems: "center", marginTop: 5 },
                ]}
              >
                <View style={{ width: "10%" }}>
                  <TouchableOpacity
                    style={{
                      borderRadius: 25,
                      borderWidth: 2,
                      borderColor:
                        genderSelected != "male" && genderSelected != "female"
                          ? "green"
                          : "gray",
                      padding: 2.5,
                      height: 25,
                      width: 25,
                      justifyContent: "center",
                    }}
                    onPress={() => isGenderSelected("others")}
                  >
                    <View
                      style={{
                        backgroundColor:
                          genderSelected == "male"
                            ? "transparent"
                            : genderSelected == "female"
                            ? "transparent"
                            : "green",
                        borderColor:
                          genderSelected != "male" && genderSelected != "female"
                            ? "green"
                            : "gray",
                        borderRadius: 25,
                        height: 15,
                        width: 15,
                      }}
                    ></View>
                  </TouchableOpacity>
                </View>

                <View style={{ width: "90%" }}>
                  <Text style={[styles.nameText, { marginTop: 0 }]}>
                    {t("Others")}
                  </Text>
                </View>
              </View> */}

                {/* /////////////country-container////////////////// */}
                <View style={styles.nameTextContainer}>
                  <Text style={styles.nameText}>{t("your_country")}</Text>
                </View>

                <View
                  style={[styles.nameInputTextContainer, { paddingBottom: 0 }]}
                >
                  <TouchableOpacity
                    style={[
                      styles.textInput,
                      { flexDirection: "row", paddingLeft: 10 },
                    ]}
                    onPress={() => {
                      setCountryDropdownOpen(!countryDropdownOpen);
                      setFilteredData(countryData); // Reset list
                    }}
                    activeOpacity={1} // Prevent dropdown from closing on touch
                  >
                    <TextInput
                      style={{
                        width: "90%",
                        height: "100%",
                        justifyContent: "center",
                        borderRadius: 5,
                      }}
                      placeholderTextColor={"#000"}
                      placeholder={t("search") + " " + t("Country")}
                      value={country}
                      onFocus={() => setCountryDropdownOpen(true)}
                      onChangeText={(text) => handleSearch(text)}
                    />
                    <View
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
                    </View>
                  </TouchableOpacity>
                </View>

                {countryDropdownOpen && (
                  <View
                    style={{
                      maxHeight: 200,
                      backgroundColor: searchBar().model_ground,
                      marginRight: 16,
                      marginLeft: 16,
                      borderWidth: 1,
                      borderRadius: 5,
                      paddingLeft: 10,
                      marginTop: 5,
                    }}
                  >
                    <FlatList
                      data={filteredData}
                      nestedScrollEnabled={true}
                      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ height: 30, justifyContent: "center" }}
                          onPress={() => {
                            //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            setCountry(item.name);
                            //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            setCountryCode(item.id); // Update search query with selected country
                            setCountryDropdownOpen(false);
                            Keyboard.dismiss();
                          }}
                        >
                          <Text>
                            {
                              //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              item.name
                            }
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {/* ///////////////////////language-dropdown//////////////////////// */}
                <View style={styles.nameTextContainer}>
                  <Text style={styles.nameText}>{t("your_language")}</Text>
                </View>
                <View style={[styles.nameInputTextContainer, { marginTop: 0 }]}>
                  <TouchableOpacity
                    style={[styles.textInput, { flexDirection: "row" }]}
                    onPress={() => {
                      setCountryDropdownOpen(false);
                      setContinentsDropdownOpen(false);

                      setLanguageDropdownOpen(!LanguageDropdownOpen);
                    }}
                  >
                    <View style={{ width: "90%", justifyContent: "center" }}>
                      <Text>{renderSelectedLanguages()}</Text>
                    </View>
                    <View
                      style={{
                        width: "10%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/back2.png")}
                        style={{
                          height: 15,
                          width: 15,
                          transform: [{ rotate: "270deg" }],
                        }}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>

                  {renderIf(
                    LanguageDropdownOpen,
                    <View
                      style={{
                        height: 150,
                        backgroundColor: searchBar().model_ground,
                        //  marginRight: 16,
                        // marginLeft: 16,
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingLeft: 10,
                      }}
                    >
                      <FlatList
                        data={languageData}
                        nestedScrollEnabled={true}
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
                                justifyContent: "center",
                                backgroundColor: isSelected
                                  ? "#d3d3d3"
                                  : "transparent",
                                paddingHorizontal: 5,
                                borderRadius: 5,
                                marginVertical: 2,
                              }}
                              onPress={() => toggleSelectionLanguage(item)}
                            >
                              <Text>
                                {
                                  //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                  item.name
                                }
                              </Text>
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </View>
                  )}
                </View>

                {/* ///////////////////////bio-container//////////////////////// */}
                <View style={styles.nameTextContainer}>
                  <Text style={styles.nameText}>{t("your_bio")} </Text>
                </View>
                <View style={styles.feedbackTextInput}>
                  <TextInput
                    placeholder={t("enter_bio")}
                    cursorColor="#fff"
                    defaultValue={userTagline ? userTagline : ""}
                    multiline={true}
                    returnKeyType="go"
                    placeholderTextColor="#959494"
                    blurOnSubmit={true}
                    textAlignVertical="top"
                    maxLength={charLimit ? charLimit : 75}
                    style={{
                      fontSize: FontSize.font,
                      color: COLORS.black,
                      height: "100%",
                      fontFamily: font.semibold(),
                    }}
                    onChangeText={(value) => {
                      const previousLength = userTagline?.length || 0;
                      if (
                        value.length >= charLimit &&
                        value.length > previousLength
                      ) {
                        if (!premiumUser) {
                          setShowBio(true);
                          setShowPremiumAlert(true);
                        }
                        value = value.slice(0, charLimit);
                      }

                      setUserTagline(value);
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
                    {t("characters_left")}:{" "}
                    {charLimit - userTagline?.length || 0} / {charLimit}
                  </Text>
                </View>

                {/* ///////////////////////profile-links//////////////////////// */}
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 35,
                    justifyContent: "space-between",
                    marginHorizontal: 16,
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: FontSize.font,
                        color: COLORS.black,
                        fontFamily: font.semibold(),
                      }}
                    >
                      {t("Profile_Links")}
                    </Text>
                    <Text
                      style={{
                        fontSize: FontSize.font,
                        color: COLORS.grey,
                        fontFamily: font.regular(),
                      }}
                    >
                      {premiumUser
                        ? profileLinkLimit - inputBoxes?.length > 1
                          ? ` (${profileLinkLimit - inputBoxes?.length} ${t(
                              "left_links"
                            )})`
                          : ` (${profileLinkLimit - inputBoxes?.length} ${t(
                              "left_link"
                            )})`
                        : ""}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setShowBio(false),
                        premiumUser ? addInputBox() : setShowPremiumAlert(true);
                    }}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      // marginTop: 20,
                      alignSelf: "center",
                      flexDirection: "row",
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      //  width: windowWidth - 52,
                      height: 40,
                      backgroundColor: iconTheme().iconColor,
                    }}
                  >
                    <Text
                      style={{
                        alignSelf: "center",
                        //   marginTop: 5,
                        marginLeft: 5,
                        fontSize: 15,
                        color: COLORS.white,
                        fontFamily: font.medium(),
                      }}
                    >
                      {t("add_links")}
                    </Text>
                    <Image
                      source={require("../../Assets/Icons/plus.png")}
                      style={{
                        height: 15,
                        width: 15,
                        tintColor: COLORS.white,
                        alignSelf: "center",
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>

                {inputBoxes &&
                  inputBoxes?.map((box, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 15,
                        justifyContent: "space-between",
                        marginHorizontal: 16,
                      }}
                    >
                      <TextInput
                        style={{
                          borderColor: "gray",
                          borderWidth: 1,
                          padding: 8,
                          borderRadius: 4,
                          width: "35%",
                        }}
                        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        value={box?.website}
                        onChangeText={(text) => {
                          //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          handleInputChange(box?.id, "website", text);
                        }}
                        placeholder={t("Enter_label")}
                        maxLength={15}
                      />
                      <TextInput
                        style={{
                          //marginTop: 10,
                          borderColor: "gray",
                          borderWidth: 1,
                          padding: 8,
                          borderRadius: 4,
                          width: "50%",
                        }}
                        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        value={box?.url}
                        placeholder={t("Enter_Url")}
                        onChangeText={(text) =>
                          //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          handleInputChange(box?.id, "url", text)
                        }
                      />
                      <TouchableOpacity
                        //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        onPress={() => removeInputBox(box?.id)}
                        style={{
                          padding: 5,
                          // width:"30%",
                          backgroundColor: "red",
                          borderRadius: 10,
                        }}
                      >
                        <Image
                          source={require("../../Assets/Icons/Cross.png")}
                          style={{
                            height: 10,
                            width: 10,
                            tintColor: COLORS.white,
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}

                {/* /////////////friend-continents-container////////////////// */}
                <View
                  style={{
                    marginHorizontal: 20,
                    alignItems: "flex-start",
                    paddingLeft: 0,
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={[
                      styles.nameText,
                      // { backgroundColor: searchBar().back_ground },
                    ]}
                  >
                    {t("select_friend_location_text")}
                  </Text>
                </View>

                {/* ////////friend-continent/////////////// */}

                <View style={styles.nameTextContainer}>
                  <Text style={styles.nameText}>
                    {/* {t("select")} {t("Continent")} */}
                    {t("select_continent")}
                  </Text>
                </View>

                <View
                  style={[styles.nameInputTextContainer, { paddingBottom: 0 }]}
                >
                  <TouchableOpacity
                    style={[
                      styles.textInput,
                      { flexDirection: "row", paddingLeft: 10 },
                    ]}
                    onPress={() => {
                      setFriendContinentDropdownOpen(
                        !friendContinentDropdownOpen
                      );
                      setFilteredContinentData(friendContinentData); // Reset list
                    }}
                    activeOpacity={1} // Prevent dropdown from closing on touch
                  >
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
                      onFocus={() => setFriendContinentDropdownOpen(true)}
                      onChangeText={(text) =>
                        handleSearchForFriendContinent(text)
                      }
                    />

                    <View
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
                    </View>
                  </TouchableOpacity>
                </View>

                {friendContinentDropdownOpen && (
                  <View
                    style={{
                      maxHeight: 200,
                      backgroundColor: searchBar().model_ground,
                      marginRight: 16,
                      marginLeft: 16,
                      borderWidth: 1,
                      borderRadius: 5,
                      paddingLeft: 10,
                      marginTop: 5,
                    }}
                  >
                    <FlatList
                      keyboardShouldPersistTaps={true}
                      nestedScrollEnabled={true}
                      data={filteredContinentData}
                      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ height: 30, justifyContent: "center" }}
                          onPress={() => {
                            //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            setFriendCountinent(item.name);
                            //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            setFriendCountinentCode(item.id);
                            setSelectedFriendCountries([]);
                            setFriendContinentDropdownOpen(false);

                            //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            getCountryApiCalling(item.id);
                          }}
                        >
                          <Text>
                            {
                              //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              item.name
                            }
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {/* ////////friend-country/////////////// */}
                {renderIf(
                  friendCountinentCode != 8,
                  <View>
                    <View style={styles.nameTextContainer}>
                      <Text style={styles.nameText}>
                        {/* {t("select")} {t("Country")} */}
                        {t("select_country_match")}
                      </Text>
                    </View>
                    {/* Dropdown Trigger */}
                    <View
                      style={[styles.nameInputTextContainer, { marginTop: 0 }]}
                    >
                      <TouchableOpacity
                        style={[styles.textInput, { flexDirection: "row" }]}
                        onPress={() => {
                          if (friendCountinent) {
                            setFriendCountryDropdownOpen(
                              !friendCountryDropdownOpen
                            );
                            setFilteredFriendCountryData(friendCountryData); // Reset the filtered list
                          } else {
                            globalThis.errorMessage =
                              t("Oops") + " " + t("please_select_continents");
                            setErrorAlertModel(true);
                          }
                        }}
                      >
                        <View
                          style={{ width: "90%", justifyContent: "center" }}
                        >
                          <Text>{renderSelectedCountries()}</Text>
                        </View>
                        <View
                          style={{
                            width: "10%",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            source={require("../../Assets/Icons/back2.png")}
                            style={{
                              height: 15,
                              width: 15,
                              transform: [{ rotate: "270deg" }],
                            }}
                            resizeMode="contain"
                          />
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Dropdown with Search and List */}
                    {friendCountryDropdownOpen && (
                      <View
                        style={{
                          maxHeight: 200,
                          backgroundColor: searchBar().model_ground,
                          marginRight: 16,
                          marginLeft: 16,
                          borderWidth: 1,
                          borderRadius: 5,
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
                          nestedScrollEnabled={true}
                          //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                          keyExtractor={(item) => item.id.toString()}
                          renderItem={({ item }) => {
                            const isSelected = selectedFriendCountries.some(
                              //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                              (country) => country.id === item.id
                            );
                            return (
                              <TouchableOpacity
                                style={{
                                  height: 30,
                                  justifyContent: "center",
                                  backgroundColor: isSelected
                                    ? "#d3d3d3"
                                    : "transparent",
                                  paddingHorizontal: 5,
                                  borderRadius: 5,
                                  marginVertical: 2,
                                }}
                                onPress={() => toggleSelection(item)}
                              >
                                <Text>
                                  {
                                    //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                    item.name
                                  }
                                </Text>
                              </TouchableOpacity>
                            );
                          }}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* ////////friend-gender/////////////// */}
                {/* <View style={styles.nameTextContainer}>
                  <Text style={styles.nameText}>
                    {t("Select_Gender")}
                  </Text>
                </View> */}

                {/* //////////////male-gender-container////////////// */}
                {/* <View
                  style={[
                    styles.nameInputTextContainer,
                    { flexDirection: "row", alignItems: "center" },
                  ]}
                >
                  <View style={{ width: "10%" }}>
                    <TouchableOpacity
                      style={{
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor:
                          friendGenderSelected == "male" ? "green" : "gray",
                        padding: 2.5,
                        height: 25,
                        width: 25,
                        justifyContent: "center",
                      }}
                      onPress={() => isFriendGenderSelected("male")}
                    >
                      <View
                        style={{
                          backgroundColor:
                            friendGenderSelected == "male"
                              ? "green"
                              : "transparent",
                          borderColor:
                            friendGenderSelected == "male" ? "green" : "gray",
                          borderRadius: 25,
                          height: 15,
                          width: 15,
                        }}
                      ></View>
                    </TouchableOpacity>
                  </View>

                  <View style={{ width: "90%" }}>
                    <Text style={[styles.nameText, { marginTop: 0 }]}>
                      {t("Male")}
                    </Text>
                  </View>
                </View> */}

                {/* //////////////female-gender-container////////////// */}
                {/* <View
                  style={[
                    styles.nameInputTextContainer,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 5,
                    },
                  ]}
                >
                  <View style={{ width: "10%" }}>
                    <TouchableOpacity
                      style={{
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor:
                          friendGenderSelected == "female" ? "green" : "gray",
                        padding: 2.5,
                        height: 25,
                        width: 25,
                        justifyContent: "center",
                      }}
                      onPress={() => isFriendGenderSelected("female")}
                    >
                      <View
                        style={{
                          backgroundColor:
                            friendGenderSelected == "female"
                              ? "green"
                              : "transparent",
                          borderColor:
                            friendGenderSelected == "female" ? "green" : "gray",
                          borderRadius: 25,
                          height: 15,
                          width: 15,
                        }}
                      ></View>
                    </TouchableOpacity>
                  </View>

                  <View style={{ width: "90%" }}>
                    <Text style={[styles.nameText, { marginTop: 0 }]}>
                      {t("Female")}
                    </Text>
                  </View>
                </View> */}
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </MainComponent>
  );
}
