import React, { useContext, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  Text,
  View,
  Image
} from "react-native";
import MainComponent from "../../Components/MainComponent/MainComponent";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import { COLORS, themeModule } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
import { StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { settingTop } from "../../Navigation/Icons";
import { FlatList } from "react-native";
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
      width: viewportWidth * 0.8,
     // justifyContent: "center",
      // alignItems: "center",
      backgroundColor: "#ccc",
      borderRadius: 8,
      padding: 20,
      marginHorizontal: 10,
      height: Dimensions.get("window").height - 250,
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
      borderWidth: 15,
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
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
      ],
    },
    {
      id: "2",
      title: "Item 2",
      text: "Text 2",
      blocks: [
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
      ],
    },
    {
      id: "3",
      title: "Item 3",
      text: "Text 3",
      blocks: [
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
        {
          icon: require('../../Assets/Icons/Status_MG_active.png'),
          name: "Double Limits",
          description:
            "Up to 1000 channels, 20 flders, 10 pins, 20 public links, 4 accouns and more...",
        },
      ],
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {item?.blocks?.map((res)=>(
        <View style={{backgroundColor:"red",padding:10,marginBottom:20,flexDirection:"row",   shadowColor: 'yellow',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 7.3,
          shadowRadius: 10,
          // Android shadow property
          elevation: 10,}}>

          {/* icon */}
          <View style={{width:"10%",alignItems:"center",justifyContent:"center"}}>
         <Image source={res.icon} style={{height:30,width:30}} resizeMode="contain"/>
          </View>

          {/* name & des */}
          <View style={{width:"90%",paddingLeft:10,flexDirection:"column"}}>
          <Text>{res.name}</Text>
          <Text>{res.description}</Text>
            </View>

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
