import React, { useContext, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import { COLORS, iconTheme, themeModule } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
import { StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { FlatList } from "react-native";
import { font } from "../../Components/Fonts/Font";
import Video from "react-native-video";
const isDarkMode = true;

export default function TokeePremium({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const { width: viewportWidth } = Dimensions.get("window");
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = new Animated.Value(0);

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },
    chatTopContainer: {
      backgroundColor: colorTheme ? COLORS.primary_blue_light : COLORS.yellow,
      paddingBottom: 20,
    },
    slide: {
      width: viewportWidth * 1.0,
       justifyContent: "center",
       alignItems: "center",
     backgroundColor: "#ccc",
      borderRadius: 8,
     // padding: 20,
    paddingHorizontal: 2,
      height: Dimensions.get("window").height - 180,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
    },
    dotContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 10,
      marginBottom: 150,
    },
    dot: {
      height: 10,
      width: 10,
      borderRadius: 5,
      backgroundColor: "#888",
      marginHorizontal: 8,
    },
    activeDot: {
      backgroundColor: "#000",
    },
    chatContainer: {
      backgroundColor: "white",
     // borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: Dimensions.get("window").height,
    },
  });

  const data = [
    {
      id: "1",
      title: "Item 1",
      text: "Text 1",
      blocks: [
        {
       //   video: require("../../Assets/Video/Opened_Your_Story.mp4"),
          name: "Slider 1",
          description: "Under Development",
        },
     
      ],
    },
    {
      id: "2",
      title: "Item 2",
      text: "Text 2",
      blocks: [
        {
       //   video: require("../../Assets/Video/Pinned-Chat.mp4"),
          name: "Slider 2",
          description: "Under Development",
        },
       
      ],
    },
    {
      id: "3",
      title: "Item 3",
      text: "Text 3",
      blocks: [
        {
       //   video: require("../../Assets/Video/Premium_Badges_video.mp4"),
          name: "Slider 3",
          description: "Under Development",
        },
       
      ],
    },
    {
      id: "4",
      title: "Item 4",
      text: "Text 4",
      blocks: [
        {
       //   video: require("../../Assets/Video/Stealth_Mode_video.mp4"),
          name: "Slider 3",
          description: "Under Development",
        },
       
      ],
    },
    {
      id: "5",
      title: "Item 5",
      text: "Text 5",
      blocks: [
        {
      //    video: require("../../Assets/Video/Tokee_Last_Seen_Times.mp4"),
          name: "Slider 3",
          description: "Under Development",
        },
       
      ],
    },
    {
      id: "6",
      title: "Item 6",
      text: "Text 6",
      blocks: [
        {
       //   video: require("../../Assets/Video/Tokee_Story_Views.mp4"),
          name: "Slider 3",
          description: "Under Development",
        },
       
      ],
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {item?.blocks?.map((res, index) => (
        <View
          key={index}
          style={{
            padding: 0,
            marginBottom: 0,
           // flexDirection: 'row',
            // borderRadius: 5,
           backgroundColor:"red",
            height: Dimensions.get("window").height,
            width: Dimensions.get("window").width,
            flex: 1,
          }}
        >
          <Video
            source={res.video} // Dynamically using the video from blocks
            muted={false}
            repeat={false}
            resizeMode="contain"
            volume={1.0}
            rate={1.0}
            autoplay={true}
            style={{
              height: '100%',
              width: '100%',
              //borderRadius: 5,
            }}
          />
        </View>
      ))}
    </View>
  );

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (viewportWidth * 0.8));
    setCurrentIndex(index);
  };

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={colorTheme ? COLORS.primary_blue_light : COLORS.yellow}
    >
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {/* // **********  Status Bar    ********** // */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        <TopBar
          showTitleForBack={true}
          title="Tokee Premium"
          backArrow={true}
          navState={navigation}
          checked={globalThis.selectTheme}
        />

        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
        globalThis.selectTheme === "mexicoTheme" ||
        globalThis.selectTheme === "indiaTheme" ||
        globalThis.selectTheme === "englandTheme" ||
        globalThis.selectTheme === "americaTheme" ||
        globalThis.selectTheme === "usindepTheme" ? (
          <ImageBackground
            source={settingTop().BackGroundImage}
            resizeMode="cover" // Update the path or use a URL
            style={{
              height: "100%",
              width: Dimensions.get("window").width,
              marginTop: 0,
              position: "absolute",
              bottom: 0,
              zIndex: 0,
              top:  chatTop().top
            }}
          ></ImageBackground>
        ) : null}
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>
      <View style={styles.chatContainer}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false, listener: handleScroll }
          )}
          pagingEnabled
        />

        <View style={styles.dotContainer}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      </View>
    </MainComponent>
  );
}
