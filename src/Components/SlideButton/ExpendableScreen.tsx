import React, { Fragment, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  Linking,
  ImageBackground,
  Modal,
} from "react-native";
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  ScrollView,
  FlatList,
} from "react-native-gesture-handler";
import { COLORS, iconTheme } from "../Colors/Colors";
import { t } from "i18next";
import { font } from "../Fonts/Font";
import { useDispatch, useSelector } from "react-redux";
import { GetApiCall } from "../ApiServices/GetApi";
import {
  delete_multiple_posts,
  delete_story,
  get_by_User_allposts,
} from "../../Constant/Api";
import NetInfo from "@react-native-community/netinfo";
import { PostApiCall } from "../ApiServices/PostApi";
import { WINDOW_WIDTH, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { setChannelObj, setProfileData } from "../../Redux/MessageSlice";
import { setStorylist } from "../../reducers/friendListSlice";
import { getChannelInfoById } from "../../sqliteStore";
import DeviceInfo from "react-native-device-info";
import ImageViewer from "react-native-image-zoom-viewer";
import { ConfirmAlertModel } from "../../Screens/Modals/ConfirmAlertModel";
import { SuccessModel } from "../../Screens/Modals/SuccessModel";
import { ErrorAlertModel } from "../../Screens/Modals/ErrorAlertModel";
import { NoInternetModal } from "../../Screens/Modals/NoInternetModel";
import WarningModal from "../../Screens/Modals/WarningModal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const INITIAL_HEIGHT = 300; // Initial height as 20% of screen height
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8; // Maximum height as 60% of screen height
const HEIGHT_RANGE = EXPANDED_HEIGHT - INITIAL_HEIGHT;
let banType = "Warning";

const ExpandableView = (props, navigation) => {
  const height = useSharedValue(INITIAL_HEIGHT);
  const [toggled, setToggled] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [expendedHeightOpen, setExpendedHeightOpen] = useState(false);
  const [showProfileLink, setShowProfileLink] = useState(false);
  const profileData = useSelector((state: any) => state?.message?.profileData);
  const callState = useSelector((state: any) => state?.VoipReducer?.call_state);
  const storyAllList = useSelector(
    (state: any) => state?.friendListSlice?.storyList
  );

  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );
  const [toShowProfile, setToShowProfile] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectforDelete, setSelectforDelete] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [inputBoxes, setInputBoxes] = useState([]);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const dispatch = useDispatch();
  const channelDataList = useSelector(
    (state: any) => state?.message?.channelSliceData
  );

  const isUserBanned = useSelector(
    (state: any) => state.userBanSlice.isUserBanned
  );
  //Zoom
  const imageZoom = {
    url: profileData?.userProfile
      ? profileData?.userProfile
      : "https://tokeecorp.com/backend/public/images/user-avatar.png", // Single image URL
  };
  let isRoomBlocked = props.isRoomBlocked;

  const handleShowMore = () => {
    setShowAll(!showAll);
  };
  const handleComplete = (isToggled) => {
    if (isToggled !== toggled) {
      setToggled(isToggled);
      // console.log("toggled>>>", toggled);
      if (toggled) {
        setExpendedHeightOpen(false);
      } else {
        setExpendedHeightOpen(true);
      }
    }
  };

  useEffect(() => {
    if (profileData?.bio_link) {
      try {
        let profileLinksData = JSON.parse(profileData.bio_link);
        setInputBoxes(profileLinksData);
      } catch (error) {
        console.error("Error parsing bio_link:", error);
        setInputBoxes([]); // Set to an empty array in case of error
      }
    } else {
      setInputBoxes([]); // Default value when bio_link is not present
    }
  }, [profileData]);

  const displayedBoxes = showAll ? inputBoxes : inputBoxes.slice(0, 2);
  const handleDelete = () => {
    setSelectforDelete(false);
    setSelectedItems([]);
    deleteConfirmation();
  };

  const handleSelectAll = () => {
    const allItemIds = storyAllList.map((item) => item.id);
    setSelectedItems(allItemIds);
  };

  const handleCancel = () => {
    setSelectforDelete(false);
    setSelectedItems([]);
  };

  const animatedGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = height.value;
      console.log("ctx.startY", ctx);
    },
    onActive: (event, ctx) => {
      const newHeight = ctx.startY - event.translationY; // Subtract to expand from bottom to top
      height.value = Math.max(
        INITIAL_HEIGHT,
        Math.min(newHeight, EXPANDED_HEIGHT)
      );
    },
    onEnd: () => {
      if (height.value < INITIAL_HEIGHT + HEIGHT_RANGE / 2) {
        height.value = withSpring(INITIAL_HEIGHT);
        runOnJS(handleComplete)(false);
        // setExpendedHeightOpen(false);
      } else {
        height.value = withSpring(EXPANDED_HEIGHT);
        runOnJS(handleComplete)(true);
        // setExpendedHeightOpen(true);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      // top: SCREEN_HEIGHT - height.value, // Adjust the top position based on height
      bottom: 0,
    };
  });

  const toggleHeight = () => {
    if (height.value === INITIAL_HEIGHT) {
      height.value = withSpring(EXPANDED_HEIGHT);
      runOnJS(handleComplete)(true);
      // setExpendedHeightOpen(true);
    } else {
      height.value = withSpring(INITIAL_HEIGHT);
      runOnJS(handleComplete)(false);
      // setExpendedHeightOpen(false);
    }
  };

  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;

    if (timeSinceLastTap < 300) {
      // Double tap detected
      height.value = withSpring(INITIAL_HEIGHT);
      runOnJS(handleComplete)(false);
      setLastTap(0); // Reset last tap
    } else {
      // Single tap detected
      toggleHeight();
      setLastTap(now); // Update last tap time
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // justifyContent: "flex-end", // Align items to the bottom of the screen
      // alignItems: "center",
      bottom: 0,
      overflow: "hidden",
    },
    expandableView: {
      width: "100%", // Adjust the width as needed
      backgroundColor: "rgba(20, 20, 20, 0.8)",
      borderRadius: 30,
      position: "absolute",
      // Absolute position to allow expanding from bottom to top
      // justifyContent: 'center',
      alignItems: "center",
      zIndex: 1001,
      bottom: 0,
      borderBottomEndRadius: 0,
      borderBottomStartRadius: 0,
    },
    iconContainer: {
      position: "absolute",
      top: 160, // Adjust as needed to position the icon
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 10,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      elevation: 3, // Add shadow if needed
    },
    contentContainer: {
      flex: 1,
      alignItems: "center",
    },
    containerHeadline: {
      fontSize: 24,
      fontWeight: "600",
      padding: 20,
    },

    overlay: {
      // position: "absolute",
      marginVertical: 10,
      // alignSelf: "center",
      borderRadius: 15,
      // overflow: "hidden",
      //  justifyContent: "center",
      alignItems: expendedHeightOpen ? "flex-start" : "center",
      // zIndex: 9999999,
      //paddingVertical: 15,
      // backgroundColor:"red"
    },
    overlayImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#F0E0F1",
    },
    userDisplayName: {
      color: "#666666",
      //  marginTop: 4,
      textTransform: "capitalize",
      textAlign: expendedHeightOpen ? "left" : "center",
    },
    scrollContainer: {
      position: "absolute",
      top: 100,
      paddingHorizontal: 15,
      zIndex: 55,
      right: 0,
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
      fontFamily: expendedHeightOpen ? font.semibold() : font.bold(),
      color: COLORS.white,
    },
    cameraContainer: {
      position: "absolute",
      bottom: -10,
      right: 0,
    },
    buttonContainer: {
      flexDirection: "row",
      width: "100%",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#rgba(255, 255, 255, 0.2)",
      marginTop: 15,
      justifyContent: "center",
    },
    buttonBox: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      marginRight: 2,
      paddingHorizontal: 20,
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
    Deletetextt: {
      color: COLORS.white,
      marginTop: expendedHeightOpen ? 10 : 0,
      fontSize: 15,
      fontFamily: font.bold(),
      // textDecorationLine: "underline",
      alignSelf: "center",
      paddingBottom: 5,
    },
  });

  // eslint-disable-next-line
  const deleteConfirmation = () => {
    globalThis.selectedItems = selectedItems;
    setConfirmAlertModel(true);
    // Alert.alert(t("confirm"), t("do_you_want_delete_story"), [
    //   { text: t("cancel") },
    //   { text: t("yes"), onPress: () => deleteStatusApi() },
    // ]);
  };

  // **********   Headers for Get Story Api  ********** ///cd
  // eslint-disable-next-line
  const deleteStatusApi = async (selectedItem) => {
    // console.log("selectedItems",selectedItem.length);

    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
        return;
      } else {
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          localization: globalThis.selectLanguage,
          Authorization: "Bearer " + globalThis.Authtoken,
        };

        const data = {
          //@ts-ignore
          story_ids: selectedItem,
        };

        PostApiCall(
          delete_multiple_posts,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            // console.log("delte posts>");
            deleteApiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  console.log(globalThis.selectedItems);

  // **********  Method for return the get  api Response   ********** ///
  // eslint-disable-next-line
  const deleteApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      AllPostsListApi(globalThis.chatUserId);
      globalThis.successMessage = ResponseData.message;
      setSuccessAlertModel(true);
      // Alert.alert(t("success"), ResponseData.message, [{ text: t("ok") }]);
    }
  };
  const AllPostsListApi = async (chatid: any) => {
    // dispatch(
    //   setProfileData({
    //     Image_text: "",
    //     sticker_position: "",
    //     chat_user_id: chatid,
    //   })
    // );
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    const data = {
      chat_user_id: chatid,
    };

    PostApiCall(
      get_by_User_allposts,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        getAllPostByuser(ResponseData, ErrorStr);
      }
    );
  };

  // eslint-disable-next-line profileData?.tagline
  const getAllPostByuser = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      // setloaderMoedl(false);
    } else {
      // console.log("api response:", ResponseData.data);
      dispatch(setStorylist(ResponseData.data));
    }
  };

  const openLink = async (url) => {
    try {
      // Ensure the URL has a valid protocol (http or https)
      const formattedUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `https://${url}`;

      console.log("formattedUrl:", formattedUrl); // Log the formatted URL

      // Directly try to open the URL
      await Linking.openURL(formattedUrl);
    } catch (error) {
      console.error("Error opening link:", error);
      // Alert.alert("Error", "An error occurred while trying to open the URL.");
      globalThis.errorMessage =
        "An error occurred while trying to open the URL.";
      setErrorAlertModel(true);
    }
  };

  globalThis.confirmText =
    globalThis.selectedItems?.length > 1
      ? "Do you want to delete these stories?"
      : t("do_you_want_delete_story");

  return (
    <View style={{ flex: 1 }}>
      <ConfirmAlertModel
        visible={confirmAlertModel}
        onRequestClose={() => setConfirmAlertModel(false)}
        confirmText={globalThis.confirmText}
        cancel={() => setConfirmAlertModel(false)}
        confirmButton={() => {
          setConfirmAlertModel(false),
            deleteStatusApi(globalThis.selectedItems);
        }}
      />

      <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={globalThis.successMessage}
        doneButton={() => {
          setSuccessAlertModel(false);
        }}
      />
      <WarningModal
        visible={warningModalVisible}
        type={"cannotCreate"}
        onClose={() => setWarningModalVisible(false)}
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
      <PanGestureHandler onGestureEvent={animatedGestureHandler}>
        <Animated.View style={[styles.expandableView, animatedStyle]}>
          <TouchableOpacity onPress={handleTap}>
            <Image
              source={require("../../Assets/Icons/Arrow_Forword.png")}
              style={{
                height: 15,
                width: 18,
                tintColor: COLORS.white,
                marginTop: expendedHeightOpen ? 10 : 10,
                transform: [
                  { rotate: expendedHeightOpen ? "90deg" : "-90deg" },
                ],
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View
            style={[
              styles.overlay,
              {
                //bottom: 60,
              },
            ]}
          >
            <View
              style={{
                flexDirection: expendedHeightOpen ? "row" : "column",
                alignItems: expendedHeightOpen ? "flex-start" : "center",
                //  backgroundColor:"red",
                paddingHorizontal: 10,
                width: WINDOW_WIDTH,
              }}
            >
              <TouchableOpacity
                style={{
                  borderWidth: 2,
                  borderColor: expendedHeightOpen
                    ? iconTheme().iconColorNew
                    : "transparent",
                  padding: 5,
                  borderRadius: expendedHeightOpen ? 38 : 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setToShowProfile(!toShowProfile)}
              >
                <Image
                  source={{
                    uri: profileData?.profile_image
                      ? profileData?.profile_image
                      : "https://tokeecorp.com/backend/public/images/user-avatar.png",
                  }}
                  style={[
                    styles.overlayImage,
                    {
                      borderRadius: expendedHeightOpen ? 30 : 10,
                      width: expendedHeightOpen ? 60 : 80,
                      height: expendedHeightOpen ? 60 : 80,
                    },
                  ]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View
                style={{ flexDirection: "column", width: WINDOW_WIDTH - 90 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: expendedHeightOpen
                      ? "flex-start"
                      : "center",
                    marginTop: expendedHeightOpen ? 0 : 5,
                    // backgroundColor:"red"
                  }}
                >
                  <Text
                    style={[
                      styles.userDisplayName,
                      {
                        color: COLORS.white,
                        //  marginTop: expendedHeightOpen ? 0 : 10,
                        marginLeft: expendedHeightOpen ? 10 : 0,
                        fontFamily: font.bold(),
                        textAlign: expendedHeightOpen ? "left" : "center",
                        //  backgroundColor:"red"
                        // fontSize: fontSize.SubHeading,
                        // fontWeight: "bold",
                      },
                    ]}
                  >
                    {profileData?.display_name || profileData?.first_name}
                  </Text>
                  {profileData?.premium == "1" && (
                    <Image
                      source={require("../../Assets/Image/PremiumBadge.png")}
                      style={{
                        height: 16,
                        width: 16,
                        marginLeft: Platform.OS === "ios" ? 5 : 10,
                        // marginTop: expendedHeightOpen ? 0 : 10,
                        tintColor: COLORS.light_green,
                        alignSelf: "center",
                      }}
                    />
                  )}
                  {profileData?.is_diamonds == 1 ? (
                    <Image
                      source={require("../../Assets/Icons/diamond.png")}
                      style={{
                        alignSelf: "center",
                        height: 16,
                        width: 16,
                        // marginTop: 2,
                        marginLeft: Platform.OS === "ios" ? 5 : 5,
                        tintColor: COLORS.light_green,
                      }}
                    />
                  ) : null}
                </View>
                {expendedHeightOpen && (
                  <Text
                    style={[
                      styles.userDisplayName,
                      {
                        color: COLORS.white,
                        marginTop: expendedHeightOpen ? 0 : 10,
                        marginLeft: expendedHeightOpen ? 10 : 0,
                        fontFamily: font.regular(),
                        textAlign: "left",
                        // fontSize: fontSize.SubHeading,
                        // fontWeight: "bold",
                      },
                    ]}
                  >
                    {profileData?.tagline == null ||
                    profileData?.tagline == "" ||
                    profileData?.tagline == undefined
                      ? "Hey there, I am using Tokee."
                      : profileData?.tagline}
                  </Text>
                )}
              </View>
            </View>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={{ height: "100%" }}
            >
              {inputBoxes.length > 0 && expendedHeightOpen && (
                <View
                  style={{
                    width: WINDOW_WIDTH,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowProfileLink(!showProfileLink)}
                    style={{
                      width: WINDOW_WIDTH - 20,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: 16,
                        fontFamily: font.bold(),
                        textDecorationLine: "underline",
                        alignSelf: "center",
                        //  marginTop: 15,
                      }}
                    >
                      {t("Profile_Links")}
                    </Text>

                    {inputBoxes.length > 2 && (
                      <TouchableOpacity onPress={handleShowMore}>
                        <Text
                          style={{
                            color: COLORS.white, // Change this to your preferred color
                            fontSize: 15,
                            fontFamily: font.semibold(),
                            textAlign: "center",
                            marginVertical: 10,
                          }}
                        >
                          {showAll ? t("Show_Less") : t("Show_More")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                  {/* {showProfileLink && ( */}
                  <ScrollView
                    scrollEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    //    style={{ height: inputBoxes.length > 5 ?  : "auto" }}
                  >
                    <View
                      style={{
                        // justifyContent: "space-between",
                        flexDirection: "column",
                        marginHorizontal: 10,
                        paddingVertical: 10,
                      }}
                    >
                      {displayedBoxes.map((box, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-start", // Aligns the items to the top
                            width: SCREEN_WIDTH - 20,
                            marginBottom: 8,
                          }}
                        >
                          <View
                            style={{
                              width: "35%",
                              flexDirection: "row",
                              alignItems: "center", // Align items horizontally
                            }}
                          >
                            <Text
                              // numberOfLines={1}
                              style={{
                                color: COLORS.white,
                                fontSize: 14,
                                fontWeight: "bold",
                                //  fontFamily: font.bold(),
                                flexShrink: 1, // Allows the text to shrink when space is limited
                              }}
                            >
                              {box?.website}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: "5%", // Small width for colon
                              justifyContent: "center", // Vertically center the colon
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: COLORS.white,
                                fontSize: 14,
                                fontWeight: "bold",
                                //fontFamily: font.bold(),
                              }}
                            >
                              {" : "}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => openLink(box?.url)}
                            style={{ width: "60%" }}
                          >
                            <Text
                              style={{
                                color: COLORS.white,
                                fontSize: 14,
                                //fontWeight:'500',
                                //fontFamily: font.bold(),
                                flexWrap: "wrap", // Allows text to wrap to the next line if needed
                              }}
                            >
                              {box?.url}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}

                      {/* {inputBoxes &&
                          inputBoxes?.map((box, index) => (
                            <View
                              key={index}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 6,
                                width: SCREEN_WIDTH - 20,
                              }}
                            >
                              <Text
                                numberOfLines={1}
                                style={{
                                  color: COLORS.white,
                                  fontSize: 18,
                                  fontFamily: font.bold(),
                                  // alignSelf: "center",
                                  //    marginTop: 5,
                                  width: 100,
                                }}
                              >
                                {box?.website}
                                {" : "}
                              </Text>
                              <TouchableOpacity
                                onPress={() => openLink(box?.url)}
                              >
                                <Text
                                  style={{
                                    color: "#fff",
                                    fontSize: 15,
                                    fontFamily: font.semibold(),
                                    textDecorationLine: "underline",
                                    width: SCREEN_WIDTH - 120,
                                  }}
                                  //  numberOfLines={1}
                                  //ellipsizeMode="tail"
                                >
                                  {box?.url}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ))} */}
                    </View>
                  </ScrollView>
                  {/* )} */}
                </View>
              )}

              <View style={[styles.buttonContainer, { width: WINDOW_WIDTH }]}>
                {props.isFriendalready ? (
                  <>
                    {props.fromScreen != "settingScreen" &&
                      profileData?.chat_user_id != globalThis.chatUserId && (
                        <View style={{ flexDirection: "row" }}>
                          <TouchableOpacity
                            style={[
                              styles.buttonBox,
                              {
                                paddingVertical: expendedHeightOpen ? 20 : 10,
                                marginRight: 2,
                                paddingHorizontal: expendedHeightOpen ? 20 : 10,
                              },
                            ]}
                            onPress={props.messagePress}
                          >
                            <Image
                              source={require("../../Assets/Icons/bkchat.png")}
                              style={[styles.icon, { tintColor: COLORS.white }]}
                            />
                            <Text
                              style={[
                                styles.text,
                                {
                                  color: COLORS.white,
                                },
                              ]}
                            >
                              {t("message")}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.buttonBox,
                              {
                                paddingVertical: expendedHeightOpen ? 20 : 10,
                                marginRight: 2,
                                paddingHorizontal: expendedHeightOpen ? 20 : 10,
                              },
                            ]}
                            onPress={props.audeoCallPress}
                            disabled={
                              callState?.state === "active"
                                ? true
                                : isRoomBlocked
                            }
                          >
                            <Image
                              source={require("../../Assets/Icons/bkaudio.png")}
                              style={[styles.icon, { tintColor: COLORS.white }]}
                            />

                            <Text
                              style={[
                                styles.text,
                                {
                                  color: COLORS.white,
                                },
                              ]}
                            >
                              {t("auido_call")}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.buttonBox,
                              {
                                paddingVertical: expendedHeightOpen ? 20 : 10,
                                marginRight: 2,
                                paddingHorizontal: expendedHeightOpen ? 20 : 10,
                              },
                            ]}
                            disabled={
                              callState?.state === "active"
                                ? true
                                : isRoomBlocked
                            }
                            onPress={props.videoCallPress}
                          >
                            <Image
                              source={require("../../Assets/Icons/bkvideo.png")}
                              style={[styles.icon, { tintColor: COLORS.white }]}
                              resizeMode="contain"
                            />
                            <Text
                              style={[
                                styles.text,
                                {
                                  color: COLORS.white,
                                },
                              ]}
                            >
                              {t("video_call")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                  </>
                ) : (
                  <>
                    {profileData?.chat_user_id != globalThis.chatUserId && (
                      <View
                        style={{
                          flexDirection: "row",
                          width: "100%",
                          justifyContent: "center",
                          marginBottom: props.isFriendalready ? 0 : 15,
                        }}
                      >
                        {props.sendrequestloading ? (
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: iconTheme().iconColorNew,
                              padding: 8,
                              flexDirection: "row",
                              borderRadius: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: "#fff",
                                fontFamily: font.bold(),
                                marginRight: 5,
                              }}
                            >
                              {t("Sending_Request")}
                            </Text>
                            <ActivityIndicator size="small" color={"#ffff"} />
                          </View>
                        ) : (
                          <>
                            {props.requestsent ? (
                              <View
                                style={{
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#d3d3d3",
                                  padding: 8,
                                  borderRadius: 5,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#a9a9a9",
                                    fontFamily: font.bold(),
                                  }}
                                >
                                  {t("Friend_Request_Sent")}
                                </Text>
                              </View>
                            ) : props.showRequestBothButton ? (
                              <View
                                style={{
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#d3d3d3",
                                  padding: 8,
                                  borderRadius: 5,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#a9a9a9",
                                    fontFamily: font.bold(),
                                  }}
                                >
                                  {t("Friend_Request_confirm")}
                                </Text>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => {
                                  if (globalThis.isUserPremium) {
                                    props.SendFriendRequest();
                                  } else {
                                    props.setShowPremiumAlert(true);
                                    props.setpremiumheading(
                                      t(
                                        "You_can_add_friend_afterupgrade_to_premium"
                                      )
                                    );
                                    props.setpremiumsubheading(
                                      t(
                                        "Expand_your_social_network_by_adding_people_as_friends_and_enhancing_your"
                                      )
                                    );
                                  }
                                }}
                                style={{
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: iconTheme().iconColorNew,
                                  padding: 8,
                                  borderRadius: 5,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#fff",
                                    fontFamily: font.bold(),
                                  }}
                                >
                                  {t("add_friend")}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </>
                )}
              </View>

              <View>
                {(storyAllList.length === 0 || expendedHeightOpen) && (
                  <View>
                    {expendedHeightOpen && (
                      <Text
                        style={{
                          color: COLORS.white,
                          fontSize: 18,
                          fontFamily: font.bold(),
                          textDecorationLine: "underline",
                          alignSelf: "center",
                        }}
                      >
                        {t("channels")}
                      </Text>
                    )}

                    {channelDataList.length === 0 && expendedHeightOpen && (
                      <View
                        style={{
                          width: WINDOW_WIDTH,
                        }}
                      >
                        {profileData?.chat_user_id === globalThis.chatUserId ? (
                          <Text
                            style={{
                              color: COLORS.white,
                              fontSize: 18,
                              fontFamily: font.regular(),
                              alignSelf: "center",
                              marginTop: 10,
                            }}
                          >
                            {t("You_don_own_any_channels")}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              color: COLORS.white,
                              fontSize: 18,
                              fontFamily: font.regular(),
                              alignSelf: "center",
                              marginTop: 10,
                            }}
                          >
                            {profileData?.display_name +
                              " " +
                              t("does_not_own_any_channel") ||
                              profileData?.first_name +
                                t("does_not_own_any_channel")}
                          </Text>
                        )}
                        {profileData?.chat_user_id === globalThis.chatUserId ? (
                          <TouchableOpacity
                            style={{
                              backgroundColor: iconTheme().iconColorNew,
                              alignSelf: "center",
                              paddingVertical: 10,
                              paddingHorizontal: 20,
                              marginTop: 20,
                              borderWidth: 1,
                              borderColor: "transparent",
                              borderRadius: 10,
                            }}
                            // onPress={props.channelCreateClick}
                            onPress={() => {

                              if (isUserBanned) {
                                setWarningModalVisible(true); // Show modal if banned
                              } else {

                                if (!userPremium && channelDataList.length >= 2) {
                                  props.setShowPremiumAlert(true);
                                  props.setpremiumheading(
                                    t("You_canadda_maximum_of_2_channels")
                                  );
                                  props.setpremiumsubheading(
                                    t("Upgrade_to_Premium_for100_channels")
                                  );
                                } else {
                                  props.channelCreateClick();
                                }
                              }

                            }}
                          >
                            <Text style={{ color: "#fff", fontSize: 15 }}>
                              {t("Create_Now")}
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    )}

                    {channelDataList.length > 0 && (
                      <>
                        <FlatList
                          showsHorizontalScrollIndicator={false}
                          showsVerticalScrollIndicator={false}
                          horizontal
                          data={channelDataList}
                          nestedScrollEnabled={false}
                          contentContainerStyle={{
                            paddingRight: 0, // Add padding to the right to prevent overlap
                          }}
                          renderItem={({ item, index }) => (
                            <TouchableOpacity
                              style={{
                                marginTop: 10,
                                flexDirection: "row",
                                marginRight:
                                  index === channelDataList.length - 1 ? 60 : 0, // Add margin to the last item
                              }}
                              onPress={() => {
                                props.channelClick(item);
                              }}
                            >
                              <View
                                style={{
                                  paddingHorizontal: 10,
                                  width: 80,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  alignContent: "center",
                                }}
                                key={index}
                              >
                                <View
                                  style={{
                                    padding: 3,
                                    borderWidth: 2,
                                    borderColor: iconTheme().iconColorNew,
                                    borderRadius: 30,
                                  }}
                                >
                                  <Image
                                    source={{
                                      uri: item.image || item.channelImage,
                                    }}
                                    style={{
                                      width: 50,
                                      height: 50,
                                      borderRadius: 25,
                                    }}
                                    resizeMode="cover"
                                  />
                                  {(item?.isExclusive === 1 ||
                                    item?.isExclusive === true) && (
                                    <ImageBackground
                                      source={require("../../Assets/Icons/verified_icon.png")}
                                      style={{
                                        height: 15,
                                        width: 15,
                                        alignSelf: "center",
                                        justifyContent: "center",
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        marginLeft: 5,
                                      }}
                                      resizeMode="contain"
                                    >
                                      <Image
                                        source={require("../../Assets/Icons/correct_sign.png")}
                                        style={{
                                          height: 10,
                                          width: 10,
                                          alignSelf: "center",
                                          tintColor: COLORS.white,
                                        }}
                                        resizeMode="contain"
                                      />
                                    </ImageBackground>
                                  )}
                                </View>

                                <Text
                                  numberOfLines={1}
                                  style={{
                                    fontFamily: font.regular(),
                                    color: COLORS.white,
                                  }}
                                >
                                  {item.name || item.channelName}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          )}
                        />
                        {props.fromScreen === "settingScreen" && (
                          <TouchableOpacity
                            style={{
                              position: "absolute",
                              bottom: 7,
                              right: 0,
                            }}
                            onPress={() => {
                              if (isUserBanned) {
                                setWarningModalVisible(true); // Show modal if banned
                              } else {
                                // Proceed with creation logic
                                if (
                                  !userPremium &&
                                  channelDataList.length >= 2
                                ) {
                                  props.setShowPremiumAlert(true);
                                  props.setpremiumheading(
                                    t("You_canadda_maximum_of_2_channels")
                                  );
                                  props.setpremiumsubheading(
                                    t("Upgrade_to_Premium_for100_channels")
                                  );
                                } else {
                                  props.channelCreateClick();
                                }
                              }
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                position: "absolute",
                                right: 10,
                                bottom: 0,
                                backgroundColor: iconTheme().iconColorNew,
                                borderRadius: 25,
                                height: 50,
                                width: 50,
                                justifyContent: "center",
                              }}
                              onPress={() => {
                                if (isUserBanned) {
                                  setWarningModalVisible(true); // Show modal if banned
                                } else {
                                  if (
                                    !userPremium &&
                                    channelDataList.length >= 2
                                  ) {
                                    props.setShowPremiumAlert(true);
                                    props.setpremiumheading(
                                      t("You_canadda_maximum_of_2_channels")
                                    );
                                    props.setpremiumsubheading(
                                      t("Upgrade_to_Premium_for100_channels")
                                    );
                                  } else {
                                    props.channelCreateClick();
                                  }
                                }
                              }}
                            >
                              <Image
                                source={require("../../Assets/Icons/plus.png")}
                                style={{ width: 25, height: 25, margin: 12 }}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                )}
                <View
                  style={{
                    width: WINDOW_WIDTH,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 18,
                      fontFamily: font.bold(),
                      textDecorationLine: "underline",
                      alignSelf: "center",
                      marginTop: 40,
                      marginBottom: 10,
                    }}
                  >
                    {t("posts")}
                  </Text>
                </View>
                {/* )} */}

                {storyAllList.length === 0 && (
                  <View
                    style={{
                      width: WINDOW_WIDTH,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: 18,
                        fontFamily: font.regular(),
                        alignSelf: "center",
                      }}
                    >
                      {profileData?.chat_user_id === globalThis.chatUserId
                        ? t("You_haven_posted_anything")
                        : profileData?.display_name +
                            " " +
                            t("has_not_posted_anything") ||
                          profileData?.first_name +
                            " " +
                            t("has_not_posted_anything")}

                      {/* {profileData?.display_name || profileData?.first_name} has
                      not posted anything. */}
                    </Text>
                  </View>
                )}
                {selectforDelete && storyAllList.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingHorizontal: 6,
                      width: WINDOW_WIDTH,
                    }}
                  >
                    <TouchableOpacity onPress={handleDelete}>
                      <Text style={[styles.Deletetextt, { marginLeft: 5 }]}>
                        {t("delete")} ({selectedItems.length})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSelectAll}>
                      <Text style={styles.Deletetextt}>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancel}>
                      <Text style={[styles.Deletetextt, { marginRight: 5 }]}>
                        {t("cancel")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {storyAllList.length > 0 &&
                props.isFriendalready == false &&
                profileData?.chat_user_id != globalThis.chatUserId ? (
                  <>
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: 18,
                        fontFamily: font.regular(),
                        alignSelf: "center",
                        marginTop: 10,
                        marginHorizontal: 10,
                        textAlign: "center",
                      }}
                    >
                      {t("to_view_the_posts")}{" "}
                      {profileData?.display_name || profileData?.first_name}
                    </Text>
                  </>
                ) : (
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    numColumns={3}
                    data={storyAllList}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingLeft: 10 }}
                    renderItem={({ item, index }) =>
                      item.file_type === "template" ? (
                        <TouchableOpacity
                          style={{
                            //@ts-ignore
                            backgroundColor: item.background_color,
                            marginVertical: 5,
                            marginRight: 10,
                            width: WINDOW_WIDTH / 3.3 - 3,
                            justifyContent: "center",
                            alignItems: "center",
                            height: 150,
                            borderRadius: 5,
                          }}
                          onPress={() => {
                            if (selectforDelete) {
                              if (selectedItems.includes(item.id)) {
                                setSelectedItems(
                                  selectedItems.filter((id) => id !== item.id)
                                );
                              } else {
                                setSelectedItems([...selectedItems, item.id]);
                              }
                            } else {
                              props.postsViewScreen(index); // or your navigation function
                            }
                          }}
                          onLongPress={() => {
                            if (props.fromScreen === "settingScreen") {
                              setSelectforDelete((prev) => !prev);
                              setSelectedItems([]);
                            }
                          }}
                        >
                          <Text
                            style={{
                              color: COLORS.black,
                              fontSize: 8,
                              fontFamily: font.semibold(),
                              textAlign: "center",
                            }}
                          >
                            {
                              //@ts-ignore
                              item.title
                            }
                          </Text>
                          {selectforDelete && (
                            <TouchableOpacity
                              style={{
                                position: "absolute",
                                top: 5,
                                right: 10,
                                backgroundColor: COLORS.white,
                                borderRadius: 15,
                                borderWidth: 2,
                                borderColor: iconTheme().iconColorNew,
                                height: 22,
                                width: 22,
                                justifyContent: "center",
                              }}
                              onPress={() => {
                                if (selectforDelete) {
                                  if (selectedItems.includes(item.id)) {
                                    setSelectedItems(
                                      selectedItems.filter(
                                        (id) => id !== item.id
                                      )
                                    );
                                  } else {
                                    setSelectedItems([
                                      ...selectedItems,
                                      item.id,
                                    ]);
                                  }
                                } else {
                                  props.postsViewScreen(index); // or your navigation function
                                }
                              }}
                            >
                              <Image
                                source={require("../../Assets/Icons/bx_check.png")}
                                style={{
                                  width: 18,
                                  height: 18,
                                  tintColor: selectedItems.includes(item.id)
                                    ? iconTheme().iconColorNew
                                    : "transparent",
                                }}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{
                            marginVertical: 5,
                            marginRight: 10,
                            width: WINDOW_WIDTH / 3.3 - 3,
                            justifyContent: "center",
                            alignItems: "center",
                            height: 150,
                          }}
                          onLongPress={() => {
                            if (props.fromScreen === "settingScreen") {
                              setSelectforDelete((prev) => !prev);
                              setSelectedItems([]);
                            }
                          }}
                          activeOpacity={
                            props.fromScreen === "settingScreen" ? 0.3 : 0.9
                          }
                          onPress={() => {
                            if (selectforDelete) {
                              if (selectedItems.includes(item.id)) {
                                setSelectedItems(
                                  selectedItems.filter((id) => id !== item.id)
                                );
                              } else {
                                setSelectedItems([...selectedItems, item.id]);
                              }
                            } else {
                              props.postsViewScreen(index); // or your navigation function
                            }
                          }}
                        >
                          {/* {console.log("item.thumbnail", item.thumbnail)} */}
                          <Image
                            source={{ uri: item.thumbnail }}
                            style={{
                              height: 150,
                              width: "100%",
                              borderRadius: 5,
                            }}
                            resizeMode="cover"
                          />
                          {selectforDelete && (
                            <TouchableOpacity
                              style={{
                                position: "absolute",
                                top: 5,
                                right: 10,
                                backgroundColor: COLORS.white,
                                borderRadius: 15,
                                borderWidth: 2,
                                borderColor: iconTheme().iconColorNew,
                                height: 22,
                                width: 22,
                                justifyContent: "center",
                              }}
                              onPress={() => {
                                if (selectforDelete) {
                                  if (selectedItems.includes(item.id)) {
                                    setSelectedItems(
                                      selectedItems.filter(
                                        (id) => id !== item.id
                                      )
                                    );
                                  } else {
                                    setSelectedItems([
                                      ...selectedItems,
                                      item.id,
                                    ]);
                                  }
                                } else {
                                  props.postsViewScreen(index); // or your navigation function
                                }
                              }}
                            >
                              <Image
                                source={require("../../Assets/Icons/bx_check.png")}
                                style={{
                                  width: 18,
                                  height: 18,
                                  tintColor: selectedItems.includes(item.id)
                                    ? iconTheme().iconColorNew
                                    : "transparent",
                                }}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
                          )}
                        </TouchableOpacity>
                      )
                    }
                  />
                )}
              </View>
            </ScrollView>
          </View>

          {props.fromScreen === "settingScreen" && (
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 30,
                right: 5,
              }}
              onPress={props.navigationToAddStory}
            >
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: -10,
                  backgroundColor: iconTheme().iconColorNew,
                  borderRadius: 25,
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                }}
                onPress={props.navigationToAddStory}
              >
                <Image
                  source={require("../../Assets/Icons/plus.png")}
                  style={{ width: 25, height: 25, margin: 12 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          <Modal visible={toShowProfile}>
            <View
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.9)",
              }}
            >
              <TouchableOpacity
                style={{
                  position: "absolute",
                  left: 3,
                  zIndex: 20,
                  top: DeviceInfo.hasNotch() ? 60 : 60,
                }}
                onPress={() => {
                  setToShowProfile(false);
                }}
              >
                <Image
                  source={require("../../Assets/Icons//Back_Arrow.png")}
                  style={{
                    height: 25,
                    width: 25,
                    marginLeft: 10,
                    tintColor: iconTheme().iconColorNew,
                  }}
                />
              </TouchableOpacity>

              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: Dimensions.get("window").height - 60,
                  width: WINDOW_WIDTH,
                }}
              >
                <ImageViewer
                  saveToLocalByLongPress={false} //@ts-ignore
                  renderIndicator={() => {
                    return null;
                  }}
                  style={{
                    height: Dimensions.get("window").height - 50,
                    width: WINDOW_WIDTH - 10,
                    marginTop: 10,
                  }} //@ts-ignore
                  imageUrls={[imageZoom]}
                  loadingRender={() => <ActivityIndicator size={"large"} />}
                  //@ts-ignore
                />
                {/* <Image
                  source={{
                    uri: profileData?.userProfile
                      ? profileData?.userProfile
                      : "https://tokeecorp.com/backend/public/images/user-avatar.png",
                  }}
                  style={{
                    height: Dimensions.get("window").height - 50,
                    width: WINDOW_WIDTH - 10,
                    marginTop: 10,
                  }}
                  resizeMode="contain"
                /> */}
              </View>
            </View>
          </Modal>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default ExpandableView;
