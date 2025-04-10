import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Platform,
  Image,
  FlatList,
  Pressable,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import {
  COLORS,
  iconTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { t } from "i18next";
import { TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import { font } from "../../../Components/Fonts/Font";
import { bottomIcon,  } from "../../../Navigation/Icons";
import { colors } from "../../../utils/constants/colors";
import PagerView from "react-native-pager-view";
import Video from "react-native-video";
import ImageViewer from "react-native-image-zoom-viewer";
import DeviceInfo from "react-native-device-info";

const ChannelMedia = ({ navigation, route }) => {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  console.log("route?.params?.allimages", route?.params?.allimages);
  const isDarkMode = true;
  const [activeTab, setActiveTab] = useState(0);
  const pagerAllMediaRef = useRef(null);
  const handleTabPress = (tabIndex: any) => {
    setActiveTab(tabIndex);
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    pagerAllMediaRef?.current?.setPage(tabIndex);
  };
  const onPageSelected = (event: any) => {
    setActiveTab(event.nativeEvent.position);
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    pagerAllMediaRef?.current?.setPage(event.nativeEvent.position);
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [singleimage, setsingleimage] = useState("");
  const [singlevideo, setsinglevideo] = useState("");
  const handleImagePress = () => {
    setModalVisible(true); // Show the modal when the image is clicked
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Hide the modal
  };
  const isNotch = DeviceInfo.hasNotch();
  return (
    <MainComponent statusBar="#000" statusBarColr="#000" safeAreaColr={"#fff"}>
      <Modal
        visible={isModalVisible}
        // transparent={true}
        onRequestClose={handleCloseModal}
        presentationStyle="overFullScreen"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              left: 3,
              zIndex: 20,
              top: isNotch ? 60 : 60,
            }}
            onPress={() => {
              handleCloseModal();
            }}
          >
            <Image
              source={require("../../../Assets/Icons/Back_Arrow.png")}
              style={{
                height: 25,
                width: 25,
                marginLeft: 10,
                tintColor: iconTheme().iconColorNew,
              }}
            />
          </TouchableOpacity>
          {singleimage ? (
            <ImageViewer
              renderIndicator={() => null}
              style={{
                height: windowHeight,
                width: windowWidth - 20,
              }}
              imageUrls={[
                {
                  url: singleimage,
                },
              ]}
              loadingRender={() => <ActivityIndicator size="large" />}
              onSwipeDown={handleCloseModal} // Optionally allow swipe down to close
            />
          ) : (
            <Video
              source={{ uri: singlevideo }}
              style={styles.image}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <View
        style={{
          position: "relative",
          // backgroundColor: themeModule().theme_background,
        }}
      >
        {/* // **********  Status Bar    ********** // */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={"#fff"}
          />
        ) : null}

        <View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 20,
              alignItems: "center",
            }}
          >
            <View style={{ width: WINDOW_WIDTH / 3, flexDirection: "row" }}>
              <TouchableOpacity
                style={[
                  styles.backArrowContainer,
                  {
                    width: 25,
                    height: 25,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                    themeModule().premiumBackIcon,
                  },
                ]}
                onPress={() => {
                  navigation.pop();
                }}
              >
                <Image
                  source={require("../../../Assets/Icons/back2.png")}
                  style={[
                    styles.backIcon,
                    { width: "100%", height: 13, resizeMode: "contain" },
                  ]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.toptext]}>{t("All_Media")}</Text>
            <View style={{ width: WINDOW_WIDTH / 3 }}></View>
          </View>

          <View style={{ flexDirection: "column", justifyContent: "center" }}>
            <View style={styles.tabButtons}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab == 0 && {
                    borderBottomWidth: 2,
                    borderBottomColor: iconTheme().iconColorNew,
                  },
                ]}
                onPress={() => handleTabPress(0)}
              >
                <Text
                  style={{
                    color: colors.black,
                    fontSize: activeTab === 0 ? 15 : 13,
                  }}
                >
                 {t("image")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab == 1 && {
                    borderBottomWidth: 2,
                    borderBottomColor: iconTheme().iconColorNew,
                  },
                ]}
                onPress={() => handleTabPress(1)}
              >
                <Text
                  style={{
                    color: colors.black,
                    fontSize: activeTab === 1 ? 15 : 13,
                  }}
                >
                  {t("video")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: "100%" }}>
              <PagerView
                style={{ flex: 1 }}
                initialPage={activeTab}
                onPageSelected={onPageSelected}
                ref={pagerAllMediaRef}
                useNext={false}
              >
                <FlatList
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  data={route?.params?.allimages}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  numColumns={3}
                  contentContainerStyle={styles.contentContainer}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        handleImagePress();
                        setsinglevideo("");
                        setsingleimage(item);
                      }}
                      style={[
                        styles.pressable,
                        { width: (windowWidth - itemGap * 5) / 3 },
                      ]} // Adjust width to fit 3 items with gaps
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: item }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      </View>
                    </Pressable>
                  )}
                  ListEmptyComponent={() => (
                    <View style={styles.NoDataContainer}>
                      <View style={styles.emptyContainer}>
                        <Text style={styles.noCalls}>{t("No_Image_Found")}</Text>
                      </View>
                    </View>
                  )}
                />

                <FlatList
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  data={route?.params?.allvideo}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  numColumns={3}
                  contentContainerStyle={styles.contentContainer}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        handleImagePress();
                        setsingleimage("");
                        setsinglevideo(item);
                      }}
                      style={[
                        styles.pressable,
                        { width: (windowWidth - itemGap * 5) / 3 },
                      ]} // Adjust width to fit 3 items with gaps
                    >
                      <View style={styles.imageContainer}>
                        <Video
                          source={{ uri: item }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      </View>
                    </Pressable>
                  )}
                  ListEmptyComponent={() => (
                    <View style={styles.NoDataContainer}>
                      <View style={styles.emptyContainer}>
                        <Text style={styles.noCalls}>{t("No_Video_Found")}</Text>
                      </View>
                    </View>
                  )}
                />
              </PagerView>
            </View>
          </View>
        </View>
      </View>
    </MainComponent>
  );
};
const itemGap = 5;
const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 10, // Padding above and below the content
    paddingHorizontal: itemGap, // Padding on the sides of the container
    // backgroundColor: 'red',
  },
  pressable: {
    justifyContent: "center",
    alignItems: "center",
    margin: itemGap / 2, // Half of the itemGap to evenly space items
  },
  imageContainer: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  //   NoDataContainer: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //   },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  //   noCalls: {
  //     fontSize: 16,
  //     color: 'black',
  //   },
  NoDataContainer: {
    height: WINDOW_HEIGHT - 250,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  noCalls: {
    color: COLORS.black,
    fontSize: 18,
    fontFamily: font.bold(),
  },
  noDataText: {
    color: COLORS.grey,
    fontSize: 15,
    fontFamily: font.regular(),
  },
  tabButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    // top: 100,
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 30,
    zIndex: 999,
  },
  tabButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: "32%",
    borderBottomWidth: 2,
    borderBottomColor: colors.white,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: iconTheme().iconColorNew,
  },
  outertab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  arrowchavron: {
    width: 12,
    height: 12,
    resizeMode: "contain",
    transform: [{ scaleX: -1 }],
  },
  tabimg: {
    width: 23,
    height: 23,
    resizeMode: "contain",
    marginRight: 10,
  },
  tabsview: {
    flexDirection: "row",
    alignItems: "center",
  },
  innertext: {
    fontFamily: font.semibold(),
    color: COLORS.black,
  },
  boxwork: {
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    marginVertical: 5,
    marginLeft: 2,
    marginRight: 0,
    // marginHorizontal:"auto",
    padding: 10,
    // height: 55,
    borderRadius: 10,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#FFF",
    shadowColor: COLORS.lightgrey,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    //shadowRadius: 5,
    elevation: 5,
  },
  channelimage: {
    tintColor: bottomIcon().tintColor,
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  channelcover: {
    borderBlockColor: bottomIcon().tintColor,
    backgroundColor: themeModule().theme_background,
    borderWidth: 2,
    borderRadius: 100,
    width: 120,
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    alignSelf: "center",
  },
  toptext: {
    color: COLORS.black,
    width: WINDOW_WIDTH / 3,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: font.semibold(),
  },
  backArrowContainer: {
    marginLeft: 10,
    // width:"auto",
    // position: "absolute",
    // flexDirection:"row",
    // alignItems:"center",
    // left: 10,
    borderRadius: 5,
  },
  backIcon: {
    height: 25,
    width: 25,
    //@ts-ignore
    tintColor:
      globalThis.selectTheme === "christmas"
        ? COLORS.white
        : //@ts-ignore
        globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : COLORS.white,
  },
});

export default ChannelMedia;
