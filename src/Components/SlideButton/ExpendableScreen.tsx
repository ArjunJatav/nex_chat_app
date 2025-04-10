import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
  FlatList,
  Alert,
} from "react-native";
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { COLORS, iconTheme } from "../Colors/Colors";
import { t } from "i18next";
import { font } from "../Fonts/Font";
import { useSelector } from "react-redux";
import { GetApiCall } from "../ApiServices/GetApi";
import { delete_multiple_posts, delete_story } from "../../Constant/Api";
import NetInfo from "@react-native-community/netinfo";
import { PostApiCall } from "../ApiServices/PostApi";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const INITIAL_HEIGHT = 300; // Initial height as 20% of screen height
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.8; // Maximum height as 60% of screen height
const HEIGHT_RANGE = EXPANDED_HEIGHT - INITIAL_HEIGHT;

const ExpandableView = (props, navigation) => {
  const height = useSharedValue(INITIAL_HEIGHT);
  const [toggled, setToggled] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [expendedHeightOpen, setExpendedHeightOpen] = useState(false);
  const profileData = useSelector((state: any) => state?.message?.profileData);
  const callState = useSelector((state: any) => state?.VoipReducer?.call_state);
  const storyAllList = useSelector(
    (state: any) => state?.friendListSlice.storyList
  );
  const [selectforDelete, setSelectforDelete] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  console.log("storyAllList===", storyAllList);

  let isRoomBlocked = props.isRoomBlocked;

  const handleComplete = (isToggled) => {
    if (isToggled !== toggled) {
      setToggled(isToggled);
      console.log("toggled>>>", toggled);
      if (toggled) {
        setExpendedHeightOpen(false);
      } else {
        setExpendedHeightOpen(true);
      }
    }
  };

  const handleDelete = () => {
    const remainingItems = storyAllList.filter(
      (item) => !selectedItems.includes(item.id)
    );
    // setStoryAllList(remainingItems); // Assuming setStoryAllList updates the list
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
      top: SCREEN_HEIGHT - height.value, // Adjust the top position based on height
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
      justifyContent: "flex-end", // Align items to the bottom of the screen
      alignItems: "center",
      bottom: 80,
      overflow: "hidden",
    },
    expandableView: {
      width: "95%", // Adjust the width as needed
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 10,
      position: "absolute",
      // Absolute position to allow expanding from bottom to top
      // justifyContent: 'center',
      alignItems: "center",
      zIndex: 1001,
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
      margin: expendedHeightOpen ? 0 : 10,
      // alignSelf: "center",
      borderRadius: 15,
      // overflow: "hidden",
      //  justifyContent: "center",
      alignItems: expendedHeightOpen ? "flex-start" : "center",
      // zIndex: 9999999,
      //paddingVertical: 15,
    },
    overlayImage: {
      width: 80,
      height: 80,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "lightgray",
      backgroundColor: "#EFEFEF",
    },
    userDisplayName: {
      color: "#666666",
      marginTop: 4,
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

  const dummyData = [
    {
      id: "1",
      contact_name: "John Doe",
      profile_image: "https://example.com/images/john_doe.jpg",
      thumbnail: "https://example.com/images/john_doe_thumb.jpg",
    },
    {
      id: "2",
      contact_name: "Jane Smith",
      profile_image: "https://example.com/images/jane_smith.jpg",
      thumbnail: "https://example.com/images/jane_smith_thumb.jpg",
    },
    {
      id: "3",
      contact_name: "Bob Johnson",
      profile_image: "https://example.com/images/bob_johnson.jpg",
      thumbnail: "https://example.com/images/bob_johnson_thumb.jpg",
    },
    {
      id: "4",
      contact_name: "Alice Williams",
      profile_image: "https://example.com/images/alice_williams.jpg",
      thumbnail: "https://example.com/images/alice_williams_thumb.jpg",
    },
    {
      id: "5",
      contact_name: "Charlie Brown",
      profile_image: "https://example.com/images/charlie_brown.jpg",
      thumbnail: "https://example.com/images/charlie_brown_thumb.jpg",
    },
    {
      id: "6",
      contact_name: "John Doe",
      profile_image: "https://example.com/images/john_doe.jpg",
      thumbnail: "https://example.com/images/john_doe_thumb.jpg",
    },
    {
      id: "7",
      contact_name: "Jane Smith",
      profile_image: "https://example.com/images/jane_smith.jpg",
      thumbnail: "https://example.com/images/jane_smith_thumb.jpg",
    },
    {
      id: "8",
      contact_name: "Bob Johnson",
      profile_image: "https://example.com/images/bob_johnson.jpg",
      thumbnail: "https://example.com/images/bob_johnson_thumb.jpg",
    },
    {
      id: "9",
      contact_name: "Alice Williams",
      profile_image: "https://example.com/images/alice_williams.jpg",
      thumbnail: "https://example.com/images/alice_williams_thumb.jpg",
    },
    {
      id: "10",
      contact_name: "Charlie Brown",
      profile_image: "https://example.com/images/charlie_brown.jpg",
      thumbnail: "https://example.com/images/charlie_brown_thumb.jpg",
    },
  ];

  console.log("profileData>>", profileData);

  // eslint-disable-next-line
  const deleteConfirmation = () => {
    Alert.alert(t("confirm"), t("do_you_want_delete_story"), [
      { text: t("cancel") },
      { text: t("yes"), onPress: () => deleteStatusApi() },
    ]);
  };

  // **********   Headers for Get Story Api  ********** ///cd
  // eslint-disable-next-line
  const deleteStatusApi = async () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

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
          story_ids: selectedItems,
        };

        PostApiCall(
          delete_multiple_posts,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            deleteApiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  // **********  Method for return the get  api Response   ********** ///
  // eslint-disable-next-line
  const deleteApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      console.log("ResponseData>>>>", ResponseData);

      Alert.alert(t("success"), ResponseData.message, [{ text: t("ok") }]);
    }
  };

  return (
    <View style={styles.container}>
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
                // alignSelf: "center",
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
              style={{ flexDirection: expendedHeightOpen ? "row" : "column" }}
            >
              <Image
                source={{ uri: profileData?.profile_image }}
                style={styles.overlayImage}
                resizeMode="cover"
              />
              <View style={{ flexDirection: "column", width: "70%" }}>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.userDisplayName,
                      {
                        color: COLORS.white,
                        marginTop: expendedHeightOpen ? 0 : 10,
                        marginLeft: expendedHeightOpen ? 10 : 0,
                        fontFamily: font.bold(),
                        textAlign: expendedHeightOpen ? "left" : "center",
                        // fontSize: fontSize.SubHeading,
                        // fontWeight: "bold",
                      },
                    ]}
                  >
                    {profileData?.display_name || profileData?.first_name}
                  </Text>
                  {profileData?.premium == "1" && (
                    <Image
                      source={require("../../Assets/Icons/bx_star_dark.png")}
                      style={{
                        height: 15,
                        width: 15,
                        marginTop: expendedHeightOpen ? 0 : 10,
                        tintColor: iconTheme().iconColorNew,
                        alignSelf: "center",
                      }}
                    />
                  )}
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
                    {profileData?.tagline == null || ""
                      ? "Hey there, I am using Tokee."
                      : profileData?.tagline}
                  </Text>
                )}
              </View>
            </View>

            <View>
              <View
                style={[
                  styles.buttonContainer,
                  { width: WINDOW_WIDTH - WINDOW_WIDTH * 0.1 },
                ]}
              >
                {props.fromScreen != "settingScreen" && (
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={[styles.buttonBox]}
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
                            // fontFamily: FontFamily().style,
                          },
                        ]}
                      >
                        {t("message")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.buttonBox]}
                      onPress={props.audeoCallPress}
                      disabled={
                        callState?.state === "active" ? true : isRoomBlocked
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
                      style={[styles.buttonBox]}
                      disabled={
                        callState?.state === "active" ? true : isRoomBlocked
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
              </View>
            </View>
          </View>
          <View style={{ overflow: "hidden", flex: 1 }}>
            {(storyAllList.length == 0 || expendedHeightOpen) && (
              <View style={{ height: 110, marginTop: 10 }}>
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 18,
                    fontFamily: font.bold(),
                    textDecorationLine: "underline",
                    alignSelf: "center",
                  }}
                >
                  Channels
                </Text>
                <FlatList
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  horizontal
                  data={dummyData}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={{
                        marginTop: 10,
                        flexDirection: "row",
                      }}
                    >
                      <View
                        style={{ paddingHorizontal: 10, width: 80 }}
                        key={index}
                      >
                        <Image
                          //@ts-ignore
                          source={
                            // item.thumbnail ? {uri : item.thumbnail}
                            //   : item.profile_image ?  { uri: item.profile_image }
                            require("../../Assets/Image/girl_profile.png")
                          }
                          style={{ width: 50, height: 50, borderRadius: 25 }}
                          resizeMode="cover"
                        />

                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: font.regular(),
                            color: COLORS.white,
                          }}
                        >
                          {
                            //@ts-ignore
                            item.contact_name
                          }
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {storyAllList.length > 0 && (
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 18,
                  fontFamily: font.bold(),
                  textDecorationLine: "underline",
                  alignSelf: "center",
                }}
              >
                Posts
              </Text>
            )}
            {selectforDelete && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity onPress={handleDelete}>
                  <Text style={[styles.Deletetextt, { marginLeft: 5 }]}>
                    Delete ({selectedItems.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSelectAll}>
                  <Text style={styles.Deletetextt}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={[styles.Deletetextt, { marginRight: 5 }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <FlatList
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              numColumns={3}
              data={storyAllList}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={{
                    padding: 5,
                    marginVertical: 5,
                    width: "33%",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 150,
                  }}
                  onLongPress={() => {
                    props.fromScreen == "settingScreen"
                      ? setSelectforDelete((prev) => !prev)
                      : null;
                    setSelectedItems([]);
                  }}
                  activeOpacity={
                    props.fromScreen == "settingScreen" ? 0.3 : 0.9
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
                      props.postsViewScreen(); // or your navigation function
                    }
                  }}
                >
                  <Image
                    source={
                      item.thumbnail
                        ? { uri: item.thumbnail }
                        : item.profile_image
                        ? { uri: item.profile_image }
                        : require("../../Assets/Image/girl_profile.png")
                    }
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
                        borderColor: iconTheme().iconColor,
                        height: 22,
                        width: 22,
                        justifyContent: "center",
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
                          props.postsViewScreen(); // or your navigation function
                        }
                      }}
                    >
                      {/* {selectedItems.includes(item.id) && ( */}
                      <Image
                        source={require("../../Assets/Icons/bx_check.png")}
                        style={{
                          width: 18,
                          height: 18,

                          tintColor: selectedItems.includes(item.id)
                            ? iconTheme().iconColor
                            : "transparent",
                        }}
                        resizeMode="contain"
                      />
                      {/* )} */}
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>

          {props.fromScreen == "settingScreen" && (
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 30,

                right: 5,
              }}
              // onPress={() => addTextStory()}
            >
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: -10,
                  backgroundColor: iconTheme().iconColor,
                  borderRadius: 25,
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                }}
                //  onPress={() => addTextStory()}
              >
                <Image
                  source={require("../../Assets/Icons/plus.png")}
                  style={{ width: 25, height: 25, margin: 12 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          {/* Your content here */}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default ExpandableView;
