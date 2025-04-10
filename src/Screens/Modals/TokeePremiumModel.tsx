import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  Text,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { COLORS, gredient, iconTheme, premiumBack, themeModule } from "../../Components/Colors/Colors";
import { StyleSheet } from "react-native";
import { FlatList } from "react-native";
import { font } from "../../Components/Fonts/Font";
import Video from "react-native-video";
import { useTranslation } from "react-i18next";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import DeviceInfo from "react-native-device-info";
import { bottomIcon } from "../../Navigation/Icons";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import RNFS from "react-native-fs";
import LinearGradient from "react-native-linear-gradient";
import Lottie from "lottie-react-native";
import recordingAnimation from "../../Assets/Logo/Star.json";
export const TokeePremiumModel = (props: any) => {
  const { t } = useTranslation();
  const { width: viewportWidth } = Dimensions.get("window");
  const [currentIndex, setCurrentIndex] = useState(props?.selectedIndex);
  const scrollX = useRef(new Animated.Value(0)).current;
  const ref = useRef();
  const [videoRepet, setVideoRepet] = useState(false);
  // Add this line

  const fileName = "PremiumVideos";
  const tempDir = RNFS.DocumentDirectoryPath;
  const initialPath = Platform.OS == "android" ? "file://" : "";
  const filePath = `${initialPath}${tempDir}/${fileName}/`;

  console.log("props.plan====================================", props.plan);

  const styles = StyleSheet.create({
    modal_view: {
      height: Dimensions.get("window").height,
      width: Dimensions.get("window").width,
      bottom: 0,
      left: 0,
      right: 0,
      // position: "absolute",
      backgroundColor: "#fff",
      borderTopEndRadius: 15,
      borderTopStartRadius: 15,
      elevation: 6,
      shadowColor: COLORS.black,
      shadowOpacity: 5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 3.5,
    },
    buttonText: {
      fontSize: 20,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    button: {
      height: "100%",
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,
    },
    nameText: {
      fontSize: 18,
      color: COLORS.black,
      fontWeight: "600",
      fontFamily: font.regular(),
    },
    modal: {
      width: Dimensions.get("window").width,
      marginLeft: 0,
      marginBottom: 0,
    },
    dotContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 16,
      // height:20,
      marginBottom: 16,
      //  backgroundColor:'red'
    },

    upload_button: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
      borderRadius: 10,
      width: "47%",
      height: 100,
      backgroundColor: "#FCF1FF",
    },
    cancel_button: {
      position: "absolute",
      borderRadius: 5,
      padding: 12,
      backgroundColor: iconTheme().textColorForNew,
      left: 10,
      top: DeviceInfo.hasNotch() == true ? 70 : 30,
      zIndex: 100,
      marginTop: DeviceInfo.hasNotch() == true ? 0 : 15,
    },
    slide: {
      width: viewportWidth * 1.0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#FFFDED",
      borderRadius: 12,
      paddingHorizontal: 2,
      height:
        DeviceInfo.hasNotch() == true
          ? Dimensions.get("window").height - 452
          : Dimensions.get("window").height - 378,
    },
    dot: {
      height: 5,
      width: 5,
      borderRadius: 5,
      backgroundColor: "#888",
      marginHorizontal: 5,
    },
    activeDot: {
      backgroundColor: iconTheme().textColorForNew,
    },
    buttonTextW: {
      fontSize: 15,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    channelimage: {
      //  tintColor: bottomIcon().tintColor,
      height: 250,
      width: "100%",
      resizeMode: "contain",
    },
    channelcover: {
      width: "100%",
      height: 250,
      alignSelf: "center",
      marginTop: -50,
    },
    fontNameText: {
      color: COLORS.black,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
  });

  const data = [
    {
      id: "1",
      title: "Item 1",
      text: t("View_Last_Seen_Times"),
      index: 0,
      //  video: require("../../Assets/Video/Tokee_Last_Seen_Times.mp4"),
      name: "Tokee_Last_Seen_Times.mp4",
      description: t("View_Last_Seen_Times_Des"),
    },
    {
      id: "2",
      title: "Item 2",
      text: t("Premium_App_Icons"),
      index: 1,
      //  video: require("../../Assets/Video/Premium_Icon.mp4"),
      name: "Premium_Icon.mp4",
      description: t("Premium_App_Icons_des"),
    },
    {
      id: "3",
      title: "Item 3",
      text: t("stealth_mode"),
      index: 2,
      // video: require("../../Assets/Video/Stealth_Mode_video.mp4"),
      name: "Stealth_Mode_video.mp4",
      description: t("Stealth_Mode_des"),
    },
    {
      id: "4",
      title: "Item 4",
      text: t("Premium_Badges"),
      index: 3,
      //  video: require("../../Assets/Video/Premium_Badges_video.mp4"),
      name: "Premium_Badges_video.mp4",
      description: t("Premium_Badges_des"),
    },
    {
      id: "5",
      title: "Item 5",
      text: t("Unlimited_Stories"),
      index: 4,
      // video: require("../../Assets/Video/Unlimited_Story_video.mp4"),
      name: "Unlimited_Story_video.mp4",
      description: t("Unlimited_Stories_des"),
    },
    {
      id: "6",
      title: "Item 6",
      text: t("Story_Views"),
      index: 5,
      //  video: require("../../Assets/Video/Tokee_Story_Views.mp4"),
      name: "Tokee_Story_Views.mp4",
      description: t("Story_Views_des"),
    },
    {
      id: "7",
      title: "Item 7",
      text: t("View_Story_Likes"),
      index: 6,
      // video: require("../../Assets/Video/Story_Likes.mp4"),
      name: "Story_Likes.mp4",
      description: t("View_Story_Likes_des"),
    },
    {
      id: "8",
      title: "Item 8",
      text: t("Enhancement_To_Story_Caption"),
      index: 7,
      // video: require("../../Assets/Video/Add_Links_to_Your_Story.mp4"),
      name: "Add_Links_to_Your_Story.mp4",
      description: t("Enhancement_To_Story_Caption_des"),
    },
    {
      id: "9",
      title: "Item 9",
      text: t("Pinned_Chat"),
      index: 8,
      //  video: require("../../Assets/Video/Pinned-Chat.mp4"),
      name: "Pinned-Chat.mp4",
      description: t("Pinned_Chat_des"),
    },
    {
      id: "10",
      title: "Item 10",
      text: t("Expanded_Bio"),
      index: 9,
      //   video: require("../../Assets/Video/Bio-Character-Limit(1).mp4"),
      name: "Bio-Character-Limit(1).mp4",
      description: t("Expanded_Bio_des"),
    },
    {
      id: "11",
      title: "Item 11",
      text: t("Profile_Link"),
      index: 10,
      // video: require("../../Assets/Video/Add_Profile_Link_video.mp4"),
      name: "Add_Profile_Link_video.mp4",
      description: t("Profile_Link_des"),
    },
    // {
    //   id: "12",
    //   title: "Item 12",
    //   text: t("Premium_Badges"),
    //   index: 11,
    //   // video: require("../../Assets/Video/Premium_Badges_video.mp4"),
    //   name: "Premium_Badges_video.mp4",
    //   description: t("Premium_Badges_des"),
    // },
    // {
    //   id: "12",
    //   title: "Item 12",
    //   text: t("Infinite_Reactive_Messages"),
    //   index: 11,
    //   // video: require("../../Assets/Video/Tokee_Story_Views.mp4"),
    //   name: "Tokee_Story_Views.mp4",
    //   description: t("Infinite_Reactive_Messages_des"),
    // },

    {
      id: "12",
      title: "Item 12",
      text: t("Increased_Limit_For_Channels"),
      index: 11,
      // video: require("../../Assets/Video/Channel_Creation_Limit.mp4"),
      name: "Channel_Creation_Limit.mp4",
      description: t("Increased_Limit_For_Channels_des"),
    },
  ];

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const viewportWidth = Dimensions.get("window").width;
    const index = Math.round(scrollPosition / viewportWidth);
    console.log("index", index);

    if (index !== currentIndex) {
      // Debounce the update to avoid unnecessary re-renders
      let debounceTimeout;
      debounceTimeout = setTimeout(() => {
        setCurrentIndex(index);
      }, 150); // Adjust timeout as necessary
    }
  };
  useEffect(() => {
    // setCurrentIndex(props.selectedIndex);
    if (props?.selectedIndex !== undefined && ref?.current) {
      if (props.selectedIndex >= 0 && props.selectedIndex < data.length) {
        ref.current.scrollToIndex({
          animated: false,
          index: props.selectedIndex,
        });
        setCurrentIndex(props.selectedIndex);
      }
    }
  }, [props?.selectedIndex, data.length]);

  const getItemLayout = (data, index) => {
    return { length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index };
  };

  const getvideoPath = (item) => {
    let path = filePath + item.name;

    return path;
  };

  const handleVideoEnd = () => {
    setVideoRepet(true);
    console.log("video end");
    // Use a functional update to get the latest value of currentIndex
    setCurrentIndex((prevIndex) => {
      if (prevIndex < data.length - 1) {
        // Scroll to the next item after updating the currentIndex
        const nextIndex = prevIndex + 1;
        ref.current?.scrollToIndex({ index: nextIndex, animated: false });
        return nextIndex;
      }
      return prevIndex;
    });
  };
  const [isLoading, setIsLoading] = useState(true); // Manage loading state

  const handleLoadStart = () => {
    setIsLoading(true); // Show loader when video starts loading
  };

  const handleBuffer = ({ isBuffering }) => {
    setIsLoading(isBuffering); // Show/hide loader based on buffering state
  };

  const handleLoad = () => {
    setIsLoading(false); // Hide loader when video is ready
  };

  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      onRequestClose={() => {
        props.onRequestClose;
      }}
    >
      <View style={styles.modal_view}>
        <View
          style={{
            paddingVertical: 20,
            height: DeviceInfo.hasNotch() == true ? 210 : 180,
          }}
        >
          <TouchableOpacity
            style={[
              styles.cancel_button,
              {
                width: 25,
                left:10,
                height: 25,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: themeModule().premiumBackIcon,
              },
            ]}
            onPress={() => {
              setCurrentIndex(props?.selectedIndex), props.cancel();
            }}
          >
            <Image
              source={require("../../Assets/Icons/back2.png")}
              resizeMode="contain"
              style={{
                height: 12,
                width: 12,
               
                tintColor:
                  globalThis.selectTheme === "christmas"
                    ? COLORS.white
                    : //@ts-ignore
                    globalThis.selectTheme == "third"
                    ? COLORS.dark_pink
                    : COLORS.white,
                //
              }}
            />
          </TouchableOpacity>
          <View style={styles.channelcover}>
          <LinearGradient
                colors={gredient().BackColor}
                start={{ x: 0, y: 0 }} // Start at the top
                end={{ x: 0, y: 1 }}
                style={{
                    height: "100%",
                  width: "100%",

                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
           
              <Image
                    source={
                      premiumBack().Image
                    }
                    style={[
                      styles.channelimage,
                      {

                        height: 150,
                        marginTop: 20,
                      },
                      // { tintColor: iconTheme().iconColor },
                    ]}
                  />
              <Text
                style={{
                  textAlign: "center",
                  color: COLORS.white,
                  fontSize: 18,
                  fontFamily: font.semibold(),
                  position: "absolute",
                  bottom: 60,
                  alignSelf: "center",
                  // marginTop: 10,
                }}
              >
                {t("tokee_premium")}
              </Text>
              <Text
                    style={{
                      textAlign: "center",
                      color: COLORS.white,
                      fontSize: 12,
                      fontFamily: font.regular(),
                     marginTop:0,
                    }}
                  >
                    {t("premium_feature_detail")}
                  </Text>
                  <Lottie
                    source={recordingAnimation}
                    autoPlay
                    loop
                    style={[
                      styles.channelimage,
                      {
                        position: "absolute",
                       
                        left: 0,
                        top: 0,
                        bottom: 0,
                        right: 0,
                      },
                    ]}
                  />
        
            </LinearGradient>
          </View>

          <View
            style={{
              position: "absolute",
              height: DeviceInfo.hasNotch() == true ? 210 : 180,
              width: "100%",
              left: 0,
              top: 0,
              backgroundColor: "#000",
              opacity: 0.65,

              //
            }}
          />
        </View>

        <View
          style={{
            width: "100%",
            height:
              DeviceInfo.hasNotch() == true
                ? Dimensions.get("window").height - 482
                : Dimensions.get("window").height - 408,
            borderRadius: 12,
            alignItems: "center",
            paddingVertical: 2,
            backgroundColor: "#FFFDED",
          }}
        >
          <FlatList
            initialScrollIndex={currentIndex}
            getItemLayout={getItemLayout}
            ref={ref}
            data={data} // Flattened array of data items
            renderItem={({ item, index }) => (
              <View style={styles.slide}>
                <ImageBackground
                  source={require("../../Assets/Image/PremiumBg.png")}
                  resizeMode="cover" // Update the path or use a URL
                  style={{
                    height: "100%",
                    width: "100%",
                    marginTop: 0,
                    position: "absolute",
                    bottom: 0,
                    zIndex: 0,
                  }}
                >
                  <Video
                    //  key={currentIndex}
                    source={{ uri: getvideoPath(item) }}
                    // source={getvideoPath(item)} // Directly access the video property
                    muted={false}
                    repeat={videoRepet}
                    resizeMode="contain"
                    volume={1.0}
                    rate={1.0}
                    onLoadStart={handleLoadStart} // Triggered when the video starts loading
                    //   onBuffer={handleBuffer}       // Triggered during buffering
                    onLoad={handleLoad}
                    onEnd={handleVideoEnd}
                    paused={index !== currentIndex} // Compare item index with currentIndex
                    style={{
                      height:
                        DeviceInfo.hasNotch() == true
                          ? Dimensions.get("window").height - 482
                          : Dimensions.get("window").height - 408,
                      width: "100%",
                      borderRadius: 12,
                    }}
                  />
                </ImageBackground>
                {isLoading && (
                  <View style={{ height: 100, width: 100 }}>
                    <ActivityIndicator
                      size="large"
                      color={themeModule().premiumBackIcon}
                    />
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false, listener: handleScroll }
            )}
            pagingEnabled
          />
        </View>

        <View style={{ height: 220 }}>
          <Text
            style={[
              styles.fontNameText,
              {
                textAlign: "center",
                marginHorizontal: 20,
                marginTop: 10,
                fontWeight: "600",
              },
            ]}
          >
            {data[currentIndex].text}
          </Text>
          <View style={{ height: 80 }}>
            <Text
              style={[
                styles.fontNameText,
                {
                  textAlign: "center",
                  marginHorizontal: 14,
                  marginTop: 0,
                  color: "#6B6C67",
                },
              ]}
            >
              {data[currentIndex].description}
            </Text>
          </View>

          <View style={styles.dotContainer}>
            {data.map((_, index) => (
              <View
                key={index}
                // onPress={() => scrollToIndex(index)}
              >
                <View
                  style={[
                    styles.dot,
                    currentIndex === index && styles.activeDot,
                  ]}
                />
              </View>
            ))}
          </View>
          {props.paymentCycle != "Annual" && props.paymentCycleCheck && (
            <View
              style={{
                marginVertical: 0,
                flexDirection: "column",
                paddingHorizontal: 30,
                justifyContent: "space-between",
                //  position: "absolute",
                width: "100%",
                //  paddingVertical: 10,
                //bottom:  30,
                // backgroundColor:"red",
                height: Platform.OS === "ios" ? 50 : 50,
                // backgroundColor:"red",
                // bottom:20
              }}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={() => props.UpdateTransactionApi("Data")}
              >
                <Text style={styles.buttonTextW}>
                  {props.paymentCycle == "Monthly"
                    ? Platform.OS == "ios"
                      ? t("Upgrade_for_Per_Year")
                      : "Upgrade for" +
                        " " +
                        props.plan[1].fomattedAmount +
                        " " +
                        "Per Year"
                    : props.selectedPlan == 0
                    ? Platform.OS == "ios"
                      ? t("Subscribe_for_Per_Year")
                      : "Subscribe for" +
                        " " +
                        props.plan[1].fomattedAmount +
                        " " +
                        "Per Year"
                    : Platform.OS == "ios"
                    ? t("Subscribe_for_Per_Months")
                    : "Subscribe for" +
                      " " +
                      props.plan[0].fomattedAmount +
                      " " +
                      "Per Month"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
