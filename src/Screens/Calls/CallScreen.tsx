import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { useSelector } from "react-redux";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import SearchBar from "../../Components/SearchBar/SearchBar";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import renderIf from "../../Components/renderIf";
import {
  call_history,
  delete_all_calllog,
  delete_calllog,
} from "../../Constant/Api";
import { callTop, chatTop, noDataImage } from "../../Navigation/Icons";
import { CheckIsRoomBlocked, CheckIsRoomsBlocked } from "../../sqliteStore";
import { onCallPress, onGroupCallPress } from "../../utils/callKitCustom";
import { LoaderModel } from "../Modals/LoaderModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
const isDarkMode = true;
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
import { Mixpanel } from "mixpanel-react-native";
import appsFlyer from "react-native-appsflyer";
import { AppsFlyerTracker } from "../EventTracker/AppsFlyerTracker";
import CheckBox from "@react-native-community/checkbox";
import { decryptMessage, encryptMessage } from "../../utils/CryptoHelper";

const data: any[] | (() => any[]) = [];
let groupCallType = "";
export default function CallScreen({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const [fistHide, setFistHide] = useState(true);
  const [products, setProducts] = React.useState(data);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [oldProducts, setOldProducts] = React.useState(data);
  const [searchValue, setSearchValue] = useState("");
  const { t, i18n } = useTranslation();
  const [loaderModel, setloaderMoedl] = useState(false);
  const [selectPressed, setSelectPressed] = useState(false);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [deleteAllCalls, setdeleteAllCalls] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [callMemberModal, setCallMemberModal] = useState(false);
  const callState = useSelector((state: any) => state?.VoipReducer?.call_state);
  const maxSelection = 9;
  const trackAutomaticEvents = false;
  const mixpanel = new Mixpanel(
    `${globalThis.mixpanelToken}`,
    trackAutomaticEvents
  );








  const handleCallEvent = () => {
    const eventName = "Calling";
    const eventValues = {
      af_content_id: "outgoing call",
      af_customer_user_id: globalThis.chatUserId,
      af_quantity: 1,
    };

    AppsFlyerTracker(eventName, eventValues, globalThis.chatUserId); // Pass user ID if you want to set it globally
  };

  const handleButtonPress = () => {
    /// Track button click event with Mixpanel
    mixpanel.track("Calling", {
      type: "outgoing call",
    });
    handleCallEvent();
  };

  useEffect(() => {
    if (Platform.OS == "android") {
      getPermission();
    }
  }, []);

  const getPermission = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  function SelectedCall(index: any) {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      if (index >= 0 && index < updatedProducts.length) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          isselect: !updatedProducts[index]?.isselect || false,
        };
      }
      setProducts(updatedProducts);
      const selectedIds = updatedProducts
        .filter((item) => item.isselect)
        .map((item) => item.id);

      //@ts-ignore
      setSelectedProducts(selectedIds);
      return updatedProducts;
    });
  }

  const cancelSelection = () => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) => ({
        ...product,
        isselect: false,
      }));

      //@ts-ignore
      setSelectedProducts([]); // Clear selected products
      setSelectPressed(!selectPressed);
      return updatedProducts;
    });
  };

  const buttonPress = () => {
    navigation.navigate("NewChatScreen", { data: "NewCall" });
  };

  React.useEffect(() => {
    // Call the method to show all calls when the component mounts
    handler1();
  }, []);

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          setNoInternetModel(true);

          return;
        } else {
          getCallHistory();
          setloaderMoedl(true);
        }
      });
    });
    return unsubscribe2;
  }, []);

  //@ts-ignore
  const getCallHistory = async () => {
    globalThis.Authtoken = await AsyncStorage.getItem("authToken");
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      // @ts-ignore
      Authorization: "Bearer " + globalThis.Authtoken, //@ts-ignore
      localization: globalThis.selectLanguage,
    };

    GetApiCall(call_history, headers, navigation, (ResponseData, ErrorStr) => {
      getApiSuccessResponse(ResponseData, ErrorStr);
    });
  };

  // **********  Method for return the Delete Account api Response   ********** ///
  const getApiSuccessResponse = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      globalThis.errorMessage = ErrorStr;
      setloaderMoedl(false);
      setErrorAlertModel(true);
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      //setloaderMoedl(false);

      setloaderMoedl(false);
      setProducts(ResponseData.data.data);
      setOldProducts(ResponseData.data.data);
    }
  };

  // **********    Method for Show All Call Lists    ********** ///
  const handler1 = () => {
    setFistHide(true);
  };

  // **********    Method for Show Missed Call Lists     ********** ///
  const handler2 = () => {
    setFistHide(false);
  };

  // **********    Method for Searchable Data from list    ********** ///
  // **********    Method for Searchable Data from list    ********** ///
  const searchableData = (text: any) => {
    setSearchValue(text);
    if (text.length > 0) {
      let filter = products?.filter((x) =>
        x?.call_members[0]?.name?.toLowerCase().includes(text.toLowerCase())
      );
      setProducts(filter);
    } else {
      setProducts(oldProducts);
    }
  };

  const clickCross = () => {
    setSearchValue("");
    setProducts(oldProducts);
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 15,
      marginTop: 15,
    },
    tabCalls: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
      height: 40,
    },
    newGroupText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginTop: 15,
      fontSize: 15,
      fontFamily: font.bold(),
    },
    enterText: {
      fontSize: 15,
      width: "90%",
      fontFamily: font.bold(),
      paddingVertical: 10,
    },
    seachContainer: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginTop: 15,
      borderRadius: 20,
      backgroundColor: "#F0E0F1",
      flexDirection: "row",
      width: "100%",
      padding: 0,
    },
    contectText: {
      color: COLORS.black,
      marginTop: 5,
      fontSize: 17,
      fontFamily: font.bold(),
      marginBottom: 10,
    },
    inviteText: {
      color: COLORS.black,
      marginTop: 5,
      fontSize: 17,
      fontFamily: font.bold(),
      marginBottom: 10,
    },
    callText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
    },
    allCallText: {
      color: fistHide
        ? iconTheme().iconColorNew
        : colorTheme
        ? COLORS.grey
        : COLORS.grey,
      fontSize: 14,
      fontFamily: font.semibold(),
      justifyContent: "center",
    },
    allCallContainer: {
      borderBottomLeftRadius: 10,
      borderTopLeftRadius: 10,
      borderWidth: 0.5,
      borderColor: COLORS.grey,
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: 15,
      height: 40,
      width: 100,
      paddingRight: 15,
    },
    missCallContainer: {
      borderBottomRightRadius: 10,
      borderTopRightRadius: 10,
      borderWidth: 0.5,
      borderLeftWidth: 0,
      borderColor: COLORS.grey,
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: 0,
      height: 40,
      width: 100,
      paddingRight: 0,
    },
    missCallText: {
      color: fistHide
        ? colorTheme
          ? COLORS.grey
          : COLORS.grey
        : iconTheme().iconColorNew,
      fontFamily: font.medium(),
      justifyContent: "center",
    },
    noDataText: {
      color: COLORS.grey,
      fontSize: 15,
      fontFamily: font.regular(),
    },
    noCalls: {
      color: COLORS.black,
      fontSize: 18,
      fontFamily: font.bold(),
    },
    chatTopContainer: {
      paddingBottom: 30,
      zIndex: 1002,
    },
    newChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      borderColor: "#fff",
      borderRadius: 15,
    },
    newChatInnerButton: {
      backgroundColor: iconTheme().textColorForNew,
      borderRadius: 15,
      borderWidth: 1,
      height: DeviceInfo.isTablet() ? 55 : 45,
      alignItems: "center",
      justifyContent: "center",
      width: DeviceInfo.isTablet() ? 180 : 140,
      borderColor: "transparent",
      flexDirection: "row",
    },
    newChatIcon: {
      height: DeviceInfo.isTablet() ? 27 : 22,
      width: DeviceInfo.isTablet() ? 27 : 22,
      tintColor: "white",
      marginRight: 10,
    },
    newChatIcon1: {
      height: DeviceInfo.isTablet() ? 27 : 22,
      width: DeviceInfo.isTablet() ? 27 : 22,
      tintColor: iconTheme().iconColor,
    },
    videoIcon: {
      height: DeviceInfo.isTablet() ? 27 : 22,
      width: DeviceInfo.isTablet() ? 27 : 22,
      tintColor: iconTheme().iconColor,
    },
    video0Icon: {
      height: 22,
      width: 22,
      tintColor: iconTheme().iconColor,
    },
    video2Icon: {
      height: 22,
      width: 22,
      tintColor: iconTheme().iconColor,
      marginRight: 10,
    },
    outGoingIcon: {
      marginTop: 5,
      height: 11,
      width: 11,
      marginLeft: 10,
      marginRight: 5,
    },
    missIcon: {
      marginTop: 5,
      height: 11,
      marginLeft: 10,
      width: 11,
      tintColor: "red",
      marginRight: 5,
    },
    incommingIcon: {
      marginTop: 5,
      height: 11,
      marginLeft: 10,
      width: 11,
      tintColor: "green",
      marginRight: 5,
    },
    missRedIcon: {
      height: 12,
      width: 12,
      tintColor: "red",
      marginRight: 10,
      marginLeft: 10,
    },
    searchfIcon: {
      height: 20,
      width: 20,
      tintColor: "#CD98D1",
    },

    newChatText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: font.bold(),
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height:
        DeviceInfo.hasNotch() == true ? windowHeight - 190 : windowHeight - 170,
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },
    NoDataContainer: {
      height: windowHeight - 200,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    nameText: {
      height: 20,
      fontSize: 12,
      fontFamily: font.regular(),
      marginBottom: 2,
      color: COLORS.black,
    },
    name3Text: {
      fontSize: 12,
      fontFamily: font.regular(),
      color: COLORS.black,
      marginTop: -5,
    },
    name2Text: {
      marginBottom: 0,
      fontSize: DeviceInfo.isTablet() ? 15 : 12,
      fontFamily: font.semibold(),
      color: COLORS.black,
      height: 20,
      marginLeft: 10,
    },
    missCaText: {
      height: 20,
      fontSize: DeviceInfo.isTablet() ? 15 : 12,
      fontFamily: font.semibold(),
      marginBottom: 2,
      color: "red",
      marginLeft: 10,
    },
    missCalText: {
      fontSize: DeviceInfo.isTablet() ? 15 : 12,
      marginLeft: 10,
      fontFamily: font.semibold(),
      color: "red",
    },

    profile2Container: {
      alignItems: "center",
      justifyContent: "space-between",
      flexDirection: "row",
      marginTop: 10,
    },
    profile1Container: {
      paddingVertical: Platform.OS == "ios" ? 10 : 5,
      flexDirection: "row",
      // height: 60,
      borderBottomWidth: 1,
      borderBottomColor: "#EAEAEA",
    },
    nameContainer: {
      justifyContent: "center",
      margin: 0,
      width: "70%",
      flexDirection: "column",
    },
    name2Container: {
      justifyContent: "center",
      width: "60%",
    },
    missContainer: {
      margin: 5,
      width: "60%",
      flexDirection: "row",
    },
    listContainer: {
      justifyContent: "center",
      margin: 5,
      marginTop: 10,
      flexDirection: "column",
    },
    Container1: {
      justifyContent: "center",
      width: "15%",
    },
    circleImageLayout: {
      width: DeviceInfo.isTablet() ? 60 : 50,
      height: DeviceInfo.isTablet() ? 60 : 50,
      borderRadius: DeviceInfo.isTablet() ? 30 : 25,
    },
    editProfile: {
      width: "15%",
      alignItems: "center",
      justifyContent: "center",
    },
    edit1Profile: {
      flexDirection: "row",
      width: "15%",
      justifyContent: "center",
      alignItems: "center",
    },
    searchIcon: {
      marginLeft: 10,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      width: "10%",
    },
    searchText: {
      width: "90%",
    },

    groupImagesContainer: {
      flexDirection: "row",
      position: "relative",
      width: 60, // Adjust based on your needs
      height: 60, // Adjust based on your needs
      // backgroundColor:'red',
    },
    smallCircleImage: {
      width: 25,
      height: 25,
      borderRadius: 12.5,
      position: "absolute",
      borderWidth: 1,
      borderColor: "#fff", // Border to create separation,
      top: 20,
    },
    moreText: {
      position: "absolute",
      top: 30, // Adjust position
      left: 10, // Adjust position
      fontSize: 20,
      color: "gray",
      fontWeight: "bold",
    },

    modalContainer: {
      flex: 1,
      backgroundColor: "white",
      padding: 20,
      marginTop: 100,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    header: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
    },
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
    },
    image: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "darkgray",
      marginRight: 10,
    },
    userName: {
      flex: 1,
      fontSize: 16,
    },
    openButton: {
      backgroundColor: "#007BFF",
      padding: 10,
      borderRadius: 5,
    },
    openButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    closeButton: {
      backgroundColor: "#28A745",
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 20,
    },
    closeButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

  function ToDeleteCallLog() {
    if (selectedProducts.length > 0) {
      setloaderMoedl(true);
      let headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        //@ts-ignore
        Authorization: "Bearer " + globalThis.token, //@ts-ignore
        localization: globalThis.selectLanguage,
      };
      let data = {
        //@ts-ignore
        call_ids: selectedProducts,
      };
      PostApiCall(
        delete_calllog,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          apiSuccess(ResponseData, ErrorStr);
        }
      );
    }
  }

  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      globalThis.errorMessage = ErrorStr;
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      setErrorAlertModel(true);
    } else {
      globalThis.successMessage = ResponseData.message;
      setSelectedProducts([]);
      setSelectPressed(false);
      setloaderMoedl(false);
      setSuccessAlertModel(true);
      // console.log("ResponseData",ResponseData.message);

      // GetApiCall(
      //   call_history,
      //   headers,
      //   navigation,
      //   (ResponseData, ErrorStr) => {
      //     getApiSuccessResponse(ResponseData, ErrorStr);
      //     setloaderMoedl(false);
      //   }
      // );
    }
  };

  const handleModalClose = (selectedIds, participants) => {
    const selectedParticipants = participants.filter((participant) =>
      selectedIds.includes(participant._id)
    );

   

    onGroupCallPress({
      call_type: groupCallType,
      contact_image: "",
      contact_name: "",
      contact_chat_id: selectedIds,
      typeOfCall: "GroupCall",
      from: "isNormalGroupCall",
      members: selectedParticipants,
    });
    console.log("Selected User IDs:", selectedIds);
    setCallMemberModal(false);
  };

  function onClearAllClick() {
    setdeleteAllCalls(true);
    setConfirmAlertModel(true);

    // Alert.alert(t("confirm"), t("Areyou_sure_you_want_toclear_all_call_logs"), [
    //   {
    //     text: t("cancel"),
    //     onPress: () => console.log("Cancel Pressed"),
    //     style: "cancel",
    //   },
    //   {
    //     text: t("yes"),
    //     onPress: () => DeleteAllCallLog(),
    //   },
    // ]);
  }

  const deleteCallLog = () => {
    if (deleteAllCalls) {
      console.log("AALLL");

      DeleteAllCallLog();
    } else {
      console.log("SLELECTED");
      ToDeleteCallLog();
    }
  };

  function DeleteAllCallLog() {
    setloaderMoedl(true);
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      //@ts-ignore
      Authorization: "Bearer " + globalThis.token, //@ts-ignore
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      delete_all_calllog,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        apiSuccess(ResponseData, ErrorStr);
      }
    );
  }

  const toggleSelection = (userId) => {
    const maxSelection = 9; // Adjust limit based on groupCallType

    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      if (selectedUserIds.length < maxSelection) {
        setSelectedUserIds([...selectedUserIds, userId]);
      } else {
        Alert.alert(
          "Selection Limit Reached",
          `You can select up to ${maxSelection} users for a ${groupCallType} call.`
        );
      }
    }
  };

  // const renderItem = ({ item }) => {
  //   // Check if the user is the current logged-in user (i.e., globalThis.userChatId)
  //   if (item._id == globalThis.userChatId) {
  //     return null; // Don't render this item if it's the current user
  //   }

  //   return (
  //     <TouchableOpacity
  //       style={styles.itemContainer}
  //       onPress={() => toggleSelection(item._id)}
  //     >
  //       <Image
  //         source={
  //           item.image
  //             ? { uri: item.image }
  //             : {
  //                 uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
  //               }
  //         }
  //         style={styles.image}
  //         resizeMode="contain"
  //       />
  //       <Text style={styles.userName}>{item.name}</Text>
  //       <CheckBox
  //         value={selectedUserIds.includes(item._id)}
  //         onValueChange={() => toggleSelection(item._id)}
  //       />
  //     </TouchableOpacity>
  //   );
  // };

  const renderItem = ({ item }) => {
    if (item._id == globalThis.userChatId) return null; // Don't render the current user

    const isSelected = selectedUserIds.includes(item._id);
    const isMaxReached = selectedUserIds.length >= maxSelection;

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginHorizontal: 12,
          borderRadius: 10,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3, // Android shadow
          marginBottom: 10,
        }}
        onPress={() => {
          if (!isMaxReached || isSelected) {
            toggleSelection(item._id);
          }
        }}
      >
        {/* Profile Image */}
        <Image
          source={
            item.image
              ? { uri: item.image }
              : {
                  uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                }
          }
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
          resizeMode="contain"
        />

        {/* Name */}
        <Text style={{ flex: 1, fontSize: 16, color: "#000" }}>
          {item.name}
        </Text>

        {/* Custom Checkbox */}
        <Pressable
          style={{
            width: 24,
            height: 24,
            borderRadius: 12, // Circular shape
            borderWidth: 2,
            borderColor: isMaxReached && !isSelected ? "#ccc" : "#25D366", // Gray when disabled
            backgroundColor: isSelected ? "#25D366" : "transparent",
            opacity: isMaxReached && !isSelected ? 0.5 : 1, // Reduce opacity for disabled checkboxes
          }}
          onPress={() => {
            if (!isMaxReached || isSelected) {
              toggleSelection(item._id);
            }
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      {/* // **********    StatusBar   ********** /// */}
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        <LoaderModel visible={loaderModel} />
        <ConfirmAlertModel
          visible={confirmAlertModel}
          onRequestClose={() => setConfirmAlertModel(false)}
          confirmText={t("Areyou_sure_you_want_toclear_all_call_logs")}
          cancel={() => setConfirmAlertModel(false)}
          confirmButton={() => {
            setConfirmAlertModel(false), deleteCallLog();
          }}
        />
        <SuccessModel
          visible={successAlertModel}
          onRequestClose={() => setSuccessAlertModel(false)}
          succesText={globalThis.successMessage}
          doneButton={() => {
            setSuccessAlertModel(false), getCallHistory();
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
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        {/* // **********    TopBar   ********** /// */}
        <TopBar
          showTitle={true}
          title={t("calls")}
          callIcon={true}
          navState={navigation}
          checked={
            //@ts-ignore
            globalThis.selectTheme
          }
        />
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            {selectPressed == true ? (
              <TouchableOpacity
                onPress={() => {
                  cancelSelection();
                }}
              >
                <Text style={styles.callText}>{t("cancel")}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.callText}></Text>
            )}

            {selectPressed == false ? (
              <TouchableOpacity
                onPress={() => setSelectPressed(!selectPressed)}
              >
                {oldProducts.length > 0 ? (
                  <Text style={styles.callText}>{t("select")}</Text>
                ) : (
                  <Text style={styles.callText}>{t(" ")}</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (selectedProducts.length > 0) {
                    setConfirmAlertModel(true);
                  }
                }}
              >
                <Text style={styles.callText}>{t("delete")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {
          //@ts-ignore
          globalThis.selectTheme === "christmas" || //@ts-ignore
          globalThis.selectTheme === "newYear" || //@ts-ignore
          globalThis.selectTheme === "newYearTheme" || //@ts-ignore
          globalThis.selectTheme === "mongoliaTheme" || //@ts-ignore
          globalThis.selectTheme === "mexicoTheme" || //@ts-ignore
          globalThis.selectTheme === "indiaTheme" ||
          globalThis.selectTheme === "englandTheme" ||
          globalThis.selectTheme === "americaTheme" ||
          globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={callTop().BackGroundImage}
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
          ) : null
        }
      </View>
      <View style={styles.chatContainer}>
        {/* // **********    View For SearchBar     ********** /// */}

        {renderIf(
          loaderModel == false,
          <>
            {oldProducts.length > 0 ? (
              <View>
                <SearchBar
                  search={searchableData}
                  value={searchValue}
                  clickCross={clickCross}
                  placeHolder={t("search")}
                />

                {/* // **********    View For Show AllCall Container      ********** /// */}
                <View style={styles.tabCalls}>
                  <TouchableOpacity
                    style={styles.allCallContainer}
                    onPress={() => handler1()}
                    activeOpacity={0.3}
                  >
                    <Text
                      style={styles.allCallText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {t("all_calls")}
                    </Text>
                  </TouchableOpacity>

                  {/* // **********    View For Show MissedCall Container      ********** /// */}
                  <TouchableOpacity
                    style={styles.missCallContainer}
                    onPress={() => handler2()}
                    activeOpacity={0.3}
                  >
                    <Text
                      style={styles.missCallText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {t("missed_calls")}
                    </Text>
                  </TouchableOpacity>
                </View>
                {renderIf(
                  selectPressed == true,
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                      alignItems: "center",
                    }}
                    onPress={onClearAllClick}
                  >
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: iconTheme().iconColorNew,
                        padding: 5,
                        height: 24,
                        width: 24,
                        borderRadius: 24,
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/Cross.png")}
                        style={{
                          height: 12,
                          width: 12,
                          tintColor: iconTheme().iconColorNew,
                        }}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ marginLeft: 8, justifyContent: "center" }}>
                      <Text
                        style={{
                          color: iconTheme().iconColorNew,
                          fontSize: 15,
                          fontFamily: font.medium(),
                        }}
                      >
                        {t("clearAll")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {/* // **********    FlatList For Show All Call List    ********** /// */}
                {fistHide ? (
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={products}
                    renderItem={({ item, index }) => {
                      const isGroupCall = item?.is_group_call == 1;
                      const isNormalGroupCall = item?.is_notmal_group_call == 1;
                      return (
                        <View style={styles.profile1Container}>
                          {renderIf(
                            selectPressed == true,
                            <View
                              style={{
                                width: "15%",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  height: 25,
                                  width: 25,
                                  borderWidth: 1,
                                  borderColor: "#BFC6CD",
                                  borderRadius: 5,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onPress={() => SelectedCall(index)}
                              >
                                {item.isselect == true && (
                                  <Image
                                    source={require("../../../src/Assets/Icons/newsent.png")}
                                    style={{
                                      height: 15,
                                      width: 15,
                                      tintColor: "#000",
                                    }}
                                    resizeMode="contain"
                                  />
                                )}
                              </TouchableOpacity>
                            </View>
                          )}

                          <View style={styles.Container1} key={index}>
                            {!isGroupCall &&
                            isNormalGroupCall &&
                            item?.call_members?.length > 1 ? (
                            
                              <View style={styles.groupImagesContainer}>
                                {/* Prepend globalThis.userImage to the call_members array */}
                                {[
                                  { image: globalThis.userImage },
                                  ...item.call_members,
                                ]
                                  .slice(0, 3) // Limit to the first 3 images
                                  .map((member, idx) => (
                                    <View
                                      key={idx}
                                      style={{ position: "relative" }}
                                    >
                                      <Image
                                        source={{
                                          uri:
                                            member?.thumbnail || member?.image,
                                        }}
                                        style={[
                                          styles.smallCircleImage,
                                          { left: idx * 15 }, // Adjust overlapping position
                                        ]}
                                        resizeMode="cover"
                                      />
                                      {/* Show "..." if there are more than 3 call members */}
                                      {idx === 2 &&
                                        item.call_members.length > 2 && (
                                          <Text style={styles.moreText}>
                                            ...
                                          </Text>
                                        )}
                                    </View>
                                  ))}
                              </View>
                            ) : (
                              <Image
                                source={{
                                  uri: isGroupCall
                                    ? item.group_call_image
                                    : item.call_members[0]?.thumbnail ||
                                      item.call_members[0]?.image,
                                }}
                                style={styles.circleImageLayout}
                                resizeMode={isGroupCall ? "contain" : "cover"}
                              />
                            )}
                          </View>

                          {/* <View style={styles.Container1} key={index}>
                            <Image
                              source={{
                                uri: isGroupCall
                                  ? item.group_call_image
                                  : item.call_members[0]?.thumbnail ||
                                    item.call_members[0]?.image,
                              }}
                              style={styles.circleImageLayout}
                              resizeMode={isGroupCall ? "contain" : "cover"}
                            />
                          </View> */}

                          <View
                            style={[
                              styles.nameContainer,
                              { width: selectPressed == false ? "70%" : "60%" },
                            ]}
                          >
                            <Text style={styles.name2Text} numberOfLines={1}>
                              {/* {isGroupCall
                                ? item.group_call_name
                                : item.call_members[0]?.name} */}
                              {!isGroupCall &&
                              isNormalGroupCall &&
                              item?.call_members?.length > 1
                                ? `${item.call_members[0]?.name} & ${item.call_members[1]?.name}` +
                                  (item.call_members?.length > 2
                                    ? ` + ${
                                        item.call_members.length - 2
                                      } others`
                                    : "") // Show "2 others" if more than 2 members
                                : isGroupCall
                                ? item.group_call_name // Show the group call name
                                : item.call_members[0]?.name}
                            </Text>

                            <View style={styles.missContainer}>
                              {item.call_type === "missed" ? (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <Image
                                    source={require("../../Assets/Icons/Missed.png")}
                                    style={styles.missIcon}
                                  />
                                  <Text style={{ fontFamily: font.semibold() }}>
                                    {moment(item.start_time).format(
                                      "DD MMMM, h:mm A"
                                    )}
                                  </Text>
                                </View>
                              ) : item.call_type === "outgoing" ? (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <Image
                                    style={styles.outGoingIcon}
                                    source={require("../../Assets/Icons/OutGoing.png")}
                                  />

                                  <Text style={{ fontFamily: font.semibold() }}>
                                    {moment(item.start_time).format(
                                      "DD MMMM, h:mm A"
                                    )}
                                  </Text>
                                </View>
                              ) : item.call_type === "incoming" ? (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <Image
                                    source={require("../../Assets/Icons/Missed.png")}
                                    style={styles.incommingIcon}
                                  />
                                  <Text style={{ fontFamily: font.semibold() }}>
                                    {moment(item.start_time).format(
                                      "DD MMMM, h:mm A"
                                    )}
                                  </Text>
                                </View>
                              ) : null}

                              <Text style={styles.nameText}>
                                {item.contact}
                              </Text>
                            </View>
                          </View>
                          {item.is_video === 1 &&
                          !item?.call_members[0]?.is_block ? (
                            <TouchableOpacity
                              style={styles.editProfile}
                              onPress={() => {
                                if (isGroupCall) {
                                  const calluserIds = item.call_members.map(
                                    (member) => member._id
                                  );
                                  console.log(
                                    "calluserIds====================================",
                                    calluserIds
                                  );
                                  // Handle individual call
                                  onGroupCallPress({
                                    call_type: "video",
                                    contact_image: item.group_call_image,
                                    contact_name: item.group_call_name,
                                    contact_chat_id: calluserIds,
                                    typeOfCall: "GroupCall",
                                  });
                                  handleButtonPress();
                                } else if (
                                  !isGroupCall &&
                                  isNormalGroupCall &&
                                  item?.call_members?.length > 1
                                ) {
                                  groupCallType = "video";
                                  if (item?.call_members?.length > 9) {
                                    setParticipants(item?.call_members);
                                    setCallMemberModal(true);
                                  } else {
                                    const calluserIds = item.call_members.map(
                                      (member) => member._id
                                    );
                                    onGroupCallPress({
                                      call_type: "video",
                                      contact_image: item.group_call_image,
                                      contact_name: item.group_call_name,
                                      contact_chat_id: calluserIds,
                                      typeOfCall: "GroupCall",
                                      from: "isNormalGroupCall",
                                      members: item?.call_members,
                                    });
                                    handleButtonPress();
                                  }
                                } else {
                                  onCallPress({
                                    call_type: "video",
                                    contact_image: item?.call_members[0]?.image,
                                    contact_name: item?.call_members[0]?.name,
                                    contact_chat_id: item?.call_members[0]?._id,
                                    contact_id: item?.call_members[0]?.id,
                                  });
                                  handleButtonPress();
                                }
                              }}
                              disabled={
                                callState?.state === "active" ? true : false
                              }
                            >
                              <View>
                                <Image
                                  source={require("../../Assets/Icons/videonewicon.png")}
                                  style={[
                                    styles.videoIcon,
                                    { resizeMode: "contain" },
                                  ]}
                                />
                              </View>
                            </TouchableOpacity>
                          ) : !item?.call_members[0]?.is_block ? (
                            <TouchableOpacity
                              style={styles.editProfile}
                              // onPress={() => {
                              //   onCallPress({
                              //     call_type: "audio",
                              //     contact_image: item?.call_members[0]?.image,
                              //     contact_name: item.call_members[0].name,
                              //     contact_chat_id: item?.call_members[0]?._id,
                              //     contact_id: item?.call_members[0]?.id,
                              //   }),
                              //     handleButtonPress();
                              // }}

                              onPress={() => {
                                if (isGroupCall) {
                                  const calluserIds = item.call_members.map(
                                    (member) => member._id
                                  );
                                  console.log(
                                    "calluserIds====================================",
                                    calluserIds
                                  );
                                  // Handle individual call
                                  onGroupCallPress({
                                    call_type: "audio",
                                    contact_image: item.group_call_image,
                                    contact_name: item.group_call_name,
                                    contact_chat_id: calluserIds,
                                    typeOfCall: "GroupCall",
                                  });
                                  handleButtonPress();
                                } else if (
                                  !isGroupCall &&
                                  isNormalGroupCall &&
                                  item?.call_members?.length > 1
                                ) {
                                  groupCallType = "audio";
                                  if (item?.call_members?.length > 9) {
                                    setParticipants(item?.call_members);
                                    setCallMemberModal(true);
                                  } else {
                                    console.log("item==========", item);

                                    const calluserIds = item.call_members.map(
                                      (member) => member._id
                                    );
                                    onGroupCallPress({
                                      call_type: "audio",
                                      contact_image: item?.group_call_image,
                                      contact_name: item?.group_call_name,
                                      contact_chat_id: calluserIds,
                                      typeOfCall: "GroupCall",
                                      from: "isNormalGroupCall",
                                      members: item?.call_members,
                                    });
                                    handleButtonPress();
                                  }
                                } else {
                                  onCallPress({
                                    call_type: "audio",
                                    contact_image: item?.call_members[0]?.image,
                                    contact_name: item?.call_members[0]?.name,
                                    contact_chat_id: item?.call_members[0]?._id,
                                    contact_id: item?.call_members[0]?.id,
                                  });
                                  handleButtonPress();
                                }
                              }}
                              disabled={
                                callState?.state === "active" ? true : false
                              }
                            >
                              <View>
                                <Image
                                  source={require("../../Assets/Icons/CallBottom.png")}
                                  style={styles.newChatIcon1}
                                />
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <></>
                          )}
                        </View>
                      );
                    }}
                    ListFooterComponent={() => {
                      return <View style={{ height: 200 }}></View>;
                    }}
                  />
                ) : (
                  // **********    FlatList For Show Missed Call List    ********** ///

                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={products}
                    renderItem={({ item, index }) => {
                      const isGroupCall = item?.is_group_call == 1;
                      const isNormalGroupCall = item?.is_notmal_group_call == 1;
                      return (
                        <React.Fragment>
                          {item.call_type === "missed" && (
                            <View style={styles.profile1Container}>
                              {renderIf(
                                selectPressed == true,
                                <View
                                  style={{
                                    width: "15%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <TouchableOpacity
                                    style={{
                                      height: 25,
                                      width: 25,
                                      borderWidth: 1,
                                      borderColor: "#BFC6CD",
                                      borderRadius: 5,
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                    onPress={() => SelectedCall(index)}
                                  >
                                    {item.isselect == true && (
                                      <Image
                                        source={require("../../../src/Assets/Icons/newsent.png")}
                                        style={{
                                          height: 15,
                                          width: 15,
                                          tintColor: "#000",
                                        }}
                                        resizeMode="contain"
                                      />
                                    )}
                                  </TouchableOpacity>
                                </View>
                              )}
                              {item.call_type === "missed" ? (
                                <View style={styles.Container1} key={index}>
                                  {!isGroupCall &&
                                  isNormalGroupCall &&
                                  item?.call_members?.length > 1 ? (
                                    // <View style={styles.groupImagesContainer}>
                                    //   {/* Prepend globalThis.userImage to the call_members array */}
                                    //   {[
                                    //     { image: globalThis.userImage },
                                    //     ...item.call_members,
                                    //   ]
                                    //     .slice(0, 4) // Limit the images shown to the first 4
                                    //     .map((member, idx) => (
                                    //       <View
                                    //         key={idx}
                                    //         style={{ position: "relative" }}
                                    //       >
                                    //         <Image
                                    //           source={{
                                    //             uri:
                                    //               member?.thumbnail || member?.image,
                                    //           }}
                                    //           style={[
                                    //             styles.smallCircleImage,
                                    //             { left: idx * 15 }, // Adjust overlapping position
                                    //           ]}
                                    //           resizeMode="cover"
                                    //         />
                                    //         {/* Show "..." if there are more than 2 call members */}
                                    //         {idx === 3 &&
                                    //           item.call_members.length > 2 && (
                                    //             <Text style={styles.moreText}>
                                    //               ...
                                    //             </Text>
                                    //           )}
                                    //       </View>
                                    //     ))}
                                    // </View>
                                    <View style={styles.groupImagesContainer}>
                                      {/* Prepend globalThis.userImage to the call_members array */}
                                      {[
                                        { image: globalThis.userImage },
                                        ...item.call_members,
                                      ]
                                        .slice(0, 3) // Limit to the first 3 images
                                        .map((member, idx) => (
                                          <View
                                            key={idx}
                                            style={{ position: "relative" }}
                                          >
                                            <Image
                                              source={{
                                                uri:
                                                  member?.thumbnail ||
                                                  member?.image,
                                              }}
                                              style={[
                                                styles.smallCircleImage,
                                                { left: idx * 15 }, // Adjust overlapping position
                                              ]}
                                              resizeMode="cover"
                                            />
                                            {/* Show "..." if there are more than 3 call members */}
                                            {idx === 2 &&
                                              item.call_members.length > 2 && (
                                                <Text style={styles.moreText}>
                                                  ...
                                                </Text>
                                              )}
                                          </View>
                                        ))}
                                    </View>
                                  ) : (
                                    <Image
                                      source={{
                                        uri: isGroupCall
                                          ? item.group_call_image
                                          : item.call_members[0]?.thumbnail ||
                                            item.call_members[0]?.image,
                                      }}
                                      style={styles.circleImageLayout}
                                      resizeMode={
                                        isGroupCall ? "contain" : "cover"
                                      }
                                    />
                                  )}
                                </View>
                              ) : null}

                              {item.call_type === "missed" ? (
                                <View style={styles.nameContainer}>
                                  <Text
                                    style={styles.name2Text}
                                    numberOfLines={1}
                                  >
                                    {/* {isGroupCall
                                ? item.group_call_name
                                : item.call_members[0]?.name} */}
                                    {!isGroupCall &&
                                    isNormalGroupCall &&
                                    item?.call_members?.length > 1
                                      ? `${item.call_members[0]?.name} & ${item.call_members[1]?.name}` +
                                        (item.call_members?.length > 2
                                          ? ` + ${
                                              item.call_members.length - 2
                                            } others`
                                          : "") // Show "2 others" if more than 2 members
                                      : isGroupCall
                                      ? item.group_call_name // Show the group call name
                                      : item.call_members[0]?.name}
                                  </Text>

                                  {/* <Text style={styles.name2Text}>
                                    {isGroupCall
                                      ? item.group_call_name
                                      : item.call_members[0]?.name}
                                  </Text> */}

                                  <View style={styles.missContainer}>
                                    {item.call_type === "missed" ? (
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Image
                                          source={require("../../Assets/Icons/Missed.png")}
                                          style={styles.missIcon}
                                        />
                                        <Text
                                          style={{
                                            fontFamily: font.semibold(),
                                          }}
                                        >
                                          {moment(item.start_time).format(
                                            "DD MMMM, h:mm A"
                                          )}
                                        </Text>
                                      </View>
                                    ) : null}
                                  </View>
                                </View>
                              ) : null}
                              {item.call_type === "missed" ? (
                                <View style={styles.editProfile}>
                                  {item.is_video === 1 &&
                                  !item?.call_members[0]?.is_block ? (
                                    <TouchableOpacity
                                      style={styles.editProfile}
                                      // onPress={() => {
                                      //   onCallPress({
                                      //     call_type: "video",
                                      //     contact_image:
                                      //       item?.call_members[0]?.image,
                                      //     contact_name:
                                      //       item?.call_members[0]?.name,
                                      //     contact_chat_id:
                                      //       item?.call_members[0]?._id,
                                      //     contact_id: item?.call_members[0]?.id,
                                      //   }),
                                      //     handleButtonPress();
                                      // }}
                                      onPress={() => {
                                        if (isGroupCall) {
                                          const calluserIds =
                                            item.call_members.map(
                                              (member) => member._id
                                            );
                                          console.log(
                                            "calluserIds====================================",
                                            calluserIds
                                          );
                                          // Handle individual call
                                          onGroupCallPress({
                                            call_type: "video",
                                            contact_image:
                                              item.group_call_image,
                                            contact_name: item.group_call_name,
                                            contact_chat_id: calluserIds,
                                            typeOfCall: "GroupCall",
                                          });
                                          handleButtonPress();
                                        } else if (
                                          !isGroupCall &&
                                          isNormalGroupCall &&
                                          item?.call_members?.length > 1
                                        ) {
                                          groupCallType = "video";
                                          if (item?.call_members?.length > 9) {
                                            setParticipants(item?.call_members);
                                            setCallMemberModal(true);
                                          } else {
                                            const calluserIds =
                                              item.call_members.map(
                                                (member) => member._id
                                              );
                                            onGroupCallPress({
                                              call_type: "video",
                                              contact_image:
                                                item.group_call_image,
                                              contact_name:
                                                item.group_call_name,
                                              contact_chat_id: calluserIds,
                                              typeOfCall: "GroupCall",
                                              from: "isNormalGroupCall",
                                              members: item?.call_members,
                                            });
                                            handleButtonPress();
                                          }
                                        } else {
                                          onCallPress({
                                            call_type: "video",
                                            contact_image:
                                              item?.call_members[0]?.image,
                                            contact_name:
                                              item?.call_members[0]?.name,
                                            contact_chat_id:
                                              item?.call_members[0]?._id,
                                            contact_id:
                                              item?.call_members[0]?.id,
                                          });
                                          handleButtonPress();
                                        }
                                      }}
                                      disabled={
                                        callState?.state === "active"
                                          ? true
                                          : false
                                      }
                                    >
                                      <View>
                                        <Image
                                          source={require("../../Assets/Icons/videonewicon.png")}
                                          style={[
                                            styles.videoIcon,
                                            { resizeMode: "contain" },
                                          ]}
                                        />
                                      </View>
                                    </TouchableOpacity>
                                  ) : !item?.call_members[0]?.is_block ? (
                                    <TouchableOpacity
                                      style={styles.editProfile}
                                      // onPress={() => {
                                      //   onCallPress({
                                      //     call_type: "audio",
                                      //     contact_image:
                                      //       item?.call_members[0]?.image,
                                      //     contact_name:
                                      //       item?.call_members[0]?.name,
                                      //     contact_chat_id:
                                      //       item?.call_members[0]?._id,
                                      //     contact_id: item?.call_members[0]?.id,
                                      //   }),
                                      //     handleButtonPress();
                                      // }}
                                      onPress={() => {
                                        if (isGroupCall) {
                                          const calluserIds =
                                            item.call_members.map(
                                              (member) => member._id
                                            );
                                          console.log(
                                            "calluserIds====================================",
                                            calluserIds
                                          );
                                          // Handle individual call
                                          onGroupCallPress({
                                            call_type: "audio",
                                            contact_image:
                                              item.group_call_image,
                                            contact_name: item.group_call_name,
                                            contact_chat_id: calluserIds,
                                            typeOfCall: "GroupCall",
                                          });
                                          handleButtonPress();
                                        } else if (
                                          !isGroupCall &&
                                          isNormalGroupCall &&
                                          item?.call_members?.length > 1
                                        ) {
                                          groupCallType = "audio";
                                          if (item?.call_members?.length > 9) {
                                            setParticipants(item?.call_members);
                                            setCallMemberModal(true);
                                          } else {
                                            const calluserIds =
                                              item.call_members.map(
                                                (member) => member._id
                                              );
                                            onGroupCallPress({
                                              call_type: "audio",
                                              contact_image:
                                                item.group_call_image,
                                              contact_name:
                                                item.group_call_name,
                                              contact_chat_id: calluserIds,
                                              typeOfCall: "GroupCall",
                                              from: "isNormalGroupCall",
                                              members: item?.call_members,
                                            });

                                            handleButtonPress();
                                          }
                                        } else {
                                          onCallPress({
                                            call_type: "audio",
                                            contact_image:
                                              item?.call_members[0]?.image,
                                            contact_name:
                                              item?.call_members[0]?.name,
                                            contact_chat_id:
                                              item?.call_members[0]?._id,
                                            contact_id:
                                              item?.call_members[0]?.id,
                                          });
                                          handleButtonPress();
                                        }
                                      }}
                                      disabled={
                                        callState?.state === "active"
                                          ? true
                                          : false
                                      }
                                    >
                                      <Image
                                        source={require("../../Assets/Icons/CallBottom.png")}
                                        style={styles.newChatIcon1}
                                      />
                                    </TouchableOpacity>
                                  ) : (
                                    <></>
                                  )}
                                </View>
                              ) : null}
                            </View>
                          )}
                        </React.Fragment>
                      );
                    }}
                    ListFooterComponent={() => {
                      return <View style={{ height: 300 }}></View>;
                    }}
                  />
                )}
              </View>
            ) : (
              <View style={styles.NoDataContainer}>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Image
                    source={noDataImage().Image}
                    style={styles.HomeNoDataImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.noCalls}>{t("noCalls")}</Text>
                  <Text style={styles.noDataText}>
                    {t("allVideoAndAudioCallDisplay")}
                  </Text>
                  <TouchableOpacity
                    style={styles.newChatButton}
                    onPress={() => buttonPress()}
                  >
                    <View style={styles.newChatInnerButton}>
                      <Image
                        source={require("../../Assets/Icons/CallBottom.png")}
                        style={styles.newChatIcon}
                      />
                      <Text style={styles.newChatText}>{t("new_call")}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        <Modal
          visible={callMemberModal}
          animationType="slide"
          transparent
          onRequestClose={() => setCallMemberModal(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.header}>Select Member</Text>
            <FlatList
              data={participants}
              renderItem={renderItem}
              keyExtractor={(item) => item.userId}
            />
            {selectedUserIds.length > 0 && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => handleModalClose(selectedUserIds, participants)}
              >
                <Text style={styles.closeButtonText}>Add to call</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      </View>
    </MainComponent>
  );
}
