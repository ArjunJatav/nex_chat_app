import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MainComponent from "../../Components/MainComponent/MainComponent";
import {
  COLORS,
  appBarText,
  iconTheme,
  searchBar,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
import { chatTop, settingTop } from "../../Navigation/Icons";
import DeviceInfo from "react-native-device-info";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import { useTranslation } from "react-i18next";
import DatePicker from "react-native-date-picker";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import {
  getContinentsApi,
  getCountriesApi,
  getLanguagesApi,
  update_friend_preferences,
} from "../../Constant/Api";
import renderIf from "../../Components/renderIf";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import { LoaderModel } from "../Modals/LoaderModel";
const isDarkMode = true;
import NetInfo from "@react-native-community/netinfo";
import { NoInternetModal } from "../Modals/NoInternetModel";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SuccessModel } from "../Modals/SuccessModel";

export default function TokeeMatchOnBoard({ navigation }) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [datestr, setDatestr] = useState("");
  const [genderSelected, setGenderSelected] = useState("male");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [country, setCountry] = useState("");
  const [filteredFriendCountryData, setFilteredFriendCountryData] = useState(
    []
  );
  const [friendCountryData, setFriendCountryData] = useState([]);
  const [countryCode, setCountryCode] = useState(0);
  const [LanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [selectedLangugaes, setSelectedLanguages] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [friendContinentDropdownOpen, setFriendContinentDropdownOpen] =
    useState(false);
  const [filteredContinentData, setFilteredContinentData] = useState([]);
  const [friendCountinentCode, setFriendCountinentCode] = useState(0);
  const [friendCountinent, setFriendCountinent] = useState("");
  const [friendContinentData, setFriendContinentData] = useState([]);
  const [friendCountryDropdownOpen, setFriendCountryDropdownOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [selectedFriendCountries, setSelectedFriendCountries] = useState([]);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [loaderModel, setloaderMoedl] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);

  useEffect(() => {
    getCountryApiCalling("");
    getContinentsApiCalling();
  }, []);

  const renderSelectedCountries = () => {
    console.log("selectedFriendCountries", selectedFriendCountries);
    return selectedFriendCountries.length > 0
      ? //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        selectedFriendCountries.map((country) => country.name).join(", ")
      : t("select") + " " + t("Country");
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

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
  };

  const uploaddata = new FormData();
  const countryCodeInString = countryCode.toString();
  uploaddata.append("country_id", countryCodeInString);
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

  // const convertedDate = convertDateFormat(datestr);
  // uploaddata.append("dob", convertedDate);
  // uploaddata.append("gender", genderSelected);

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
      console.log("updae api data ", ResponseData);
      globalThis.isUserProfileComplete = ResponseData.is_profile_completed;
      globalThis.successMessage = ResponseData.message;
      // globalThis.age = ResponseData.data.age;

      setloaderMoedl(false);
      // setErrorAlertModel(true);
      setSuccessAlertModel(true);
    }
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

  const isGenderSelected = (gender) => {
    setGenderSelected(gender);
  };

  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
      //backgroundColor: "red",
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
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
    chatContainer: {
      backgroundColor: "#575B64",
      borderTopWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
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
  });

  const saveDataButton = () => {
    Keyboard.dismiss();

    // if (!datestr) {
    //     globalThis.errorMessage = t("Oops") + " " + t("please_select_dob");
    //     setErrorAlertModel(true);
    //     return;
    //   }
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

    if (friendContinentData.length < 0 || friendCountryData.length == 0) {
      globalThis.errorMessage =
        t("Oops") + " " + t("please_select_friend_country");
      setErrorAlertModel(true);
      return;
    }
    editProfileApi();
    // setConfirmAlertModel(true);
  };
  const handleSearch = (query) => {
    setCountry(query);
    const newData = countryData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(newData);
  };

  const buttonPress = () => {
    Keyboard.dismiss();
    navigation.navigate("BottomBar");
  };

  const handleSearchForFriendCountry = (text) => {
    setSearchQuery(text); // Update search query
    const filtered = friendCountryData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFriendCountryData(filtered);
  };

  const handleSearchForFriendContinent = (query) => {
    setFriendCountinent(query);
    const newData = friendContinentData.filter((item) =>
      //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContinentData(newData);
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

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <DatePicker
        mode="date"
        modal
        maximumDate={new Date(new Date().setFullYear(new Date().getFullYear()))}
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
          setSuccessAlertModel(false), navigation.navigate("ExplorePage");
        }}
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
          title={t("Explore_Page")}
          checked={globalThis.selectTheme}
        />
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")} </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => saveDataButton()}
            >
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
            resizeMode="cover"
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
        <ScrollView
          style={{ marginBottom: 10, top : -12,borderTopLeftRadius:25,borderTopRightRadius:25 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <View style={{ height: windowHeight - 200 }}>
            
            <ImageBackground
              source={require("../../Assets/Image/tokeeMatchBackground.png")}
              style={{
                height: "100%",
                width: "100%",
              //  borderTopLeftRadius: 25
              
                
             //   flex: 1,
                position: "absolute",
                top : -10
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 25,
                  fontWeight: "600",
                  alignSelf: "center",
                  marginTop: 55,
                }}
              >
                {t("FindandMatch")}
              </Text>

              <View style={{ position: "absolute", bottom: 40,alignSelf:"center" }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    alignSelf: "center",
                    marginTop: 15,
                    textAlign: "center",
                    marginHorizontal: 25,
                  }}
                >
                  {t("friend_match_text")}
                </Text>

                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    height: 40,
                    width: "85%",
                    backgroundColor: iconTheme().iconColorNew,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                    paddingVertical: 10,
                    borderRadius: 10,
                    marginBottom: 20,
                  }}
                  onPress={() => navigation.navigate("TokeeMatchQuestion")}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {t("LetExplore")}
                  </Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </ScrollView>
      </View>
    </MainComponent>
  );
}
