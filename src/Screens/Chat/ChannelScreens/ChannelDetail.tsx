import React, { useEffect, useState } from "react";
import { View, Platform, Image, ImageBackground, Linking } from "react-native";
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
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import { font } from "../../../Components/Fonts/Font";
import { bottomIcon, bottomTab } from "../../../Navigation/Icons";

const ChannelDetail = ({ navigation, route }) => {
  const isDarkMode = true;
  console.log("route", route.params);
  const [allimages, setallimages] = useState([]);
  const [allvideo, setallvideo] = useState([]);
  const [mediacount, setmediacount] = useState(0);

  const imgRegex = /<img\s+[^>]*src="([^"]*)"/gi;
  const videoRegex = /<video\s+[^>]*src="([^"]*)"/gi;

  useEffect(() => {
    if (route.params?.decryptData) {
      let totalImgCount = 0;
      let totalVideoCount = 0;
      let allImgUrls = [];
      let allVideoUrls = [];

      route.params.decryptData.forEach((messageObj) => {
        const { message } = messageObj;

        // Count <img> tags and extract URLs
        const imgMatches = message.match(imgRegex) || [];
        totalImgCount += imgMatches.length;
        allImgUrls = allImgUrls.concat(
          imgMatches.map((match) => match.match(/src="([^"]*)"/)[1])
        );

        // Count <video> tags and extract URLs
        const videoMatches = message.match(videoRegex) || [];
        totalVideoCount += videoMatches.length;
        allVideoUrls = allVideoUrls.concat(
          videoMatches.map((match) => match.match(/src="([^"]*)"/)[1])
        );
      });

      setmediacount(totalImgCount + totalVideoCount);
      setallimages(allImgUrls || []);
      setallvideo(allVideoUrls || []);
    }
  }, [route.params?.decryptData]);

  return (
    <MainComponent statusBar="#000" statusBarColr="#000" safeAreaColr={"#ffff"}>
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
            backgroundColor={"#ffff"}
          />
        ) : null}

        {/* // ********** Title Text   ********** // */}
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
            <Text style={[styles.toptext]}>{t("channel_info")}</Text>
            <View style={{ width: WINDOW_WIDTH / 3 }}></View>
          </View>
          <View>
            <View
              style={[
                styles.channelcover,
                {
                  borderBlockColor: iconTheme().iconColorNew,
                  backgroundColor: themeModule().theme_background,
                },
              ]}
            >
              <Image
                source={bottomTab().ChatIcon}
                style={[styles.channelimage]}
              />
            </View>
            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: COLORS.black,
                  fontSize: 28,
                  fontWeight: "900",
                  fontFamily: font.semibold(),
                  marginRight: 2,
                }}
              >
                Tokee
              </Text>
              <ImageBackground
                source={require("../../../Assets/Icons/verified_icon.png")}
                style={{
                  height: 15,
                  width: 15,
                  alignSelf: "center",
                  justifyContent: "center",
                  marginLeft: 5,
                }}
                resizeMode="contain"
              >
                <Image
                  source={require("../../../Assets/Icons/correct_sign.png")}
                  style={{
                    height: 10,
                    width: 10,
                    alignSelf: "center",
                    tintColor: COLORS.white,
                  }}
                  resizeMode="contain"
                />
              </ImageBackground>
            </View>
            <Text
              style={{
                textAlign: "center",
                color: COLORS.black,
                fontSize: 18,
                fontFamily: font.medium(),
              }}
            >
              {t("official_account")}
            </Text>
            <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
              <View style={styles.boxwork}>
                <View>
                  <Text style={styles.innertext}>
                    {t("Hi_Welcometo_this_officalTokee_Chat")}
                  </Text>
                  <Text style={styles.innertext}>
                    {t("This_is_where_you_can_get_tips")}
                  </Text>
                  <Text style={[styles.innertext, { marginTop: 10 }]}>
                    {t("Official_chats_from_Tokee_will")}
                  </Text>
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "#EAEAEA",
                      marginTop: 10,
                      paddingVertical: 10,
                    }}
                  >
                    <Text
                      style={[
                        styles.innertext,
                        { color: iconTheme().iconColorNew },
                      ]}
                      onPress={() => {
                        Linking.openURL("https://tokee.app").catch((err) =>
                          console.error("Couldn't load page", err)
                        );
                      }}
                    >
                      https://tokee.app
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.boxwork, { marginTop: 10 }]}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("ChannelMedia", {
                      allimages: allimages,
                      allvideo: allvideo,
                    });
                  }}
                  style={styles.outertab}
                >
                  <View style={styles.tabsview}>
                    <View>
                      <Image
                        style={[
                          styles.tabimg,
                          { tintColor: iconTheme().iconColorNew },
                        ]}
                        source={require("../../../Assets/Icons/Set_Profile.png")}
                      />
                    </View>
                    <Text style={styles.innertext}>{t("Media_Files")}</Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={[styles.innertext, { marginRight: 10 }]}>
                      {mediacount}
                    </Text>
                    <Image
                      style={styles.arrowchavron}
                      source={require("../../../Assets/Icons/back2.png")}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </MainComponent>
  );
};

const styles = StyleSheet.create({
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

export default ChannelDetail;
