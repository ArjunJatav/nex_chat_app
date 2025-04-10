import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Video from "react-native-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "react-native";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { COLORS} from "../../Components/Colors/Colors";
const isDarkMode = true;

 // eslint-disable-next-line
export const VideoListScreen = ({ route, navigation }:any) => {
  const data = route.params?.videos;

  const insets = useSafeAreaInsets();

   // eslint-disable-next-line
  const renderVideoItem = ({ item }: any) => {
    return (
      <View
        style={{
          width: "46%",
          height: 200,
          alignSelf: "center",
          justifyContent: "center",
          margin: 5,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("VideoPlayScreen", { videoUrl: item });
          }}
          style={{ flexDirection: "column", flex: 1 }}
        >
          <Video
            source={{ uri: item }}
            style={{ width: "100%", height: "100%", borderRadius: 10 }}
            resizeMode="cover"
            controls={false}
            paused={true}
            // onLoadStart={() => setIsLoading(true)}
            // onLoad={() => setIsLoading(false)}
          />

          <View
            style={{
              width: 60,
              height: 60,
              position: "absolute",
              top: "35%",
              zIndex: 9999,
              borderRadius: 30,
              justifyContent: "center",
              alignSelf: "center",
            }}
          >
            <Image
              source={{
                uri: "https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png",
              }}
              style={{ flex: 1, height: 100, tintColor: "green" }}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <CustomStatusBar
        barStyle={isDarkMode ? "dark-content" : "dark-content"}
        backgroundColor={COLORS.white}
      />
      <TouchableOpacity
        style={{
          left: 16,
          borderRadius: 5,
          marginTop: 20,
          backgroundColor:
            globalThis.selectTheme === "mongoliaTheme"
              ? "#8D3E2D" 
              : globalThis.selectTheme === "newYearTheme"
              ? "#CE9D59"
              : 
              globalThis.selectTheme === "newYear"
              ? COLORS.black
              : 
              globalThis.selectTheme === "christmas"
              ? COLORS.primary_light_green 
              : globalThis.selectTheme == "third"
              ? COLORS.light_green 
              : globalThis.selectTheme == "second"
              ? COLORS.primary_blue
              : COLORS.purple,
          width: 30,
          height: 30,
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => {
          navigation.pop();
        }}
      >
        <Image
          source={require("../../Assets/Icons/Back.png")}
          style={{
            height: 25,
            width: 25,
            tintColor:
              globalThis.selectTheme == "third"
                ? COLORS.dark_pink
                : COLORS.white,
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <FlatList
        data={data}
        // horizontal
        style={{ marginTop: 0, flex: 1 }}
        renderItem={renderVideoItem}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom, marginTop: 30 }}
        numColumns={2} // Adjust to show three items per row

        // Add padding for safe area
      />
    </View>
  );
};

