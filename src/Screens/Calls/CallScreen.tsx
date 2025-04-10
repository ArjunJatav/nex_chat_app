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
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNCallKeep from "react-native-callkeep";
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
import { callTop, noDataImage } from "../../Navigation/Icons";
import { CheckIsRoomBlocked, CheckIsRoomsBlocked } from "../../sqliteStore";
import { onCallPress } from "../../utils/callKitCustom";
import { LoaderModel } from "../Modals/LoaderModel";
const isDarkMode = true;
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const data: any[] | (() => any[]) = [];
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
  const callState = useSelector(
    (state: any) => state?.VoipReducer?.call_state
  );

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

  const buttonPress = () => {
    navigation.navigate("NewChatScreen", { data: "NewCall" });
  };

  React.useEffect(() => {
    // Call the method to show all calls when the component mounts
    handler1();
  }, []);

  const enableNotification = (resp: any) => {
    setTimeout(() => {
      if (Platform.OS === "android" && resp === true) {
        Alert.alert(
          `"Tokee" would like to send you Call and Video Notifications`,
          "Notifications may include alerts and sounds. Please allow app to Display pop-up windows access. These can be configured in Settings.",
          [
            { text: "Cancel" },
            {
              text: "Set",
              onPress: () => Linking.openSettings(),
              style: "destructive",
            },
          ],
          { cancelable: true }
        );
      }
    }, 4000);
  };

  useEffect(() => {
    const options = {
      ios: {
        appName: "Tokee",
        maximumCallGroups: "1",
        maximumCallsPerCallGroup: "1",
        includesCallsInRecents: false,
      },
      android: {
        alertTitle: "Permissions Required",
        alertDescription:
          "This application needs to access your phone calling accounts to make calls",
        cancelButton: "Cancel",
        okButton: "ok",
      },
    };
    //@ts-ignore
    if(Platform.OS == "android"){
      //@ts-ignore
      RNCallKeep.setup(options).then((resp) => {
        enableNotification(resp);
      });
    }
  
  });

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          Alert.alert(
            "No Internet",
            "No Internet, Please check your Internet Connection."
          );

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
  const getCallHistory = () => {
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
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
    } else {
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
      fontFamily: font.bold(),
      color: COLORS.black,
      height: 11,
      width: 11,
      marginLeft: 10,
      marginRight: 5,
    },
    missIcon: {
      marginTop: 5,
      fontFamily: font.bold(),
      color: COLORS.black,
      height: 11,
      marginLeft: 10,
      width: 11,
      tintColor: "red",
      marginRight: 5,
    },
    incommingIcon: {
      marginTop: 5,
      fontFamily: font.bold(),
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
      marginTop: 10,
      flexDirection: "row",
      height: 60,
      width: "100%",
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
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

  const apiSuccess =  (ResponseData: any, ErrorStr: any) => {
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      //@ts-ignore
      Authorization: "Bearer " + globalThis.token, //@ts-ignore
      localization: globalThis.selectLanguage,
    };
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
    } else {
      setSelectedProducts([]);
      setSelectPressed(false);
      setloaderMoedl(false);
      GetApiCall(
        call_history,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          getApiSuccessResponse(ResponseData, ErrorStr);
          setloaderMoedl(false);
        }
      );
    }
  };

  function onClearAllClick() {
    Alert.alert("Confirm", "Are you sure you want to clear all call logs?", [
      {
        text: "No",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => DeleteAllCallLog(),
      },
    ]);
  }

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
                onPress={() => setSelectPressed(!selectPressed)}
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
              <TouchableOpacity onPress={ToDeleteCallLog}>
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
                  placeHolder= {t("search")}  
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
                    style={{ flexDirection: "row", marginTop: 10 }}
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
                            <Image
                              source={{
                                uri: item.call_members[0]?.thumbnail
                                  ? item.call_members[0]?.thumbnail
                                  : item.call_members[0]?.image,
                              }}
                              style={styles.circleImageLayout}
                              resizeMode="cover"
                            />
                          </View>

                          <View
                            style={[
                              styles.nameContainer,
                              { width: selectPressed == false ? "70%" : "60%" },
                            ]}
                          >
                            <Text style={styles.name2Text} numberOfLines={1}>
                              {item.call_members[0]?.name}
                            </Text>

                            <View style={styles.missContainer}>
                              {item.call_type === "missed" ? (
                                <View style={{ flexDirection: "row" }}>
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
                                <View style={{ flexDirection: "row" }}>
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
                                <View style={{ flexDirection: "row" }}>
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
                          {item.is_video === 1 && !item?.call_members[0]?.is_block ? (
                            <TouchableOpacity
                              style={styles.editProfile}
                              onPress={() =>
                                onCallPress({
                                  call_type: "video",
                                  contact_image: item?.call_members[0]?.image,
                                  contact_name: item?.call_members[0]?.name,
                                  contact_chat_id: item?.call_members[0]?._id,
                                  contact_id: item?.call_members[0]?.id,
                                })
                              }
                              disabled={
                                callState?.state === "active" ? true : false
                              }
                            >
                              <View>
                                <Image
                                  source={require("../../Assets/Icons/Video.png")}
                                  style={styles.videoIcon}
                                />
                              </View>
                            </TouchableOpacity>
                          ) : !item?.call_members[0]?.is_block ? (
                            <TouchableOpacity
                              style={styles.editProfile}
                              onPress={() =>
                                onCallPress({
                                  call_type: "audio",
                                  contact_image: item?.call_members[0]?.image,
                                  contact_name: item.call_members[0].name,
                                  contact_chat_id: item?.call_members[0]?._id,
                                  contact_id: item?.call_members[0]?.id,
                                })
                              }
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
                                  <Image
                                     source={{
                                      uri: item.call_members[0]?.thumbnail
                                        ? item.call_members[0]?.thumbnail
                                        : item.call_members[0]?.image,
                                    }}
                                    style={styles.circleImageLayout}
                                    resizeMode="cover"
                                  />
                                </View>
                              ) : null}

                              {item.call_type === "missed" ? (
                                <View style={styles.nameContainer}>
                                  <Text style={styles.name2Text}>
                                    {item.call_members[0]?.name}
                                  </Text>

                                  <View style={styles.missContainer}>
                                    {item.call_type === "missed" ? (
                                      <View style={{ flexDirection: "row" }}>
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
                                  {item.is_video === 1 && !item?.call_members[0]?.is_block ? (
                                    <TouchableOpacity
                                      style={styles.editProfile}
                                      onPress={() =>
                                        onCallPress({
                                          call_type: "video",
                                          contact_image:
                                            item?.call_members[0]?.image,
                                          contact_name:
                                            item?.call_members[0]?.name,
                                          contact_chat_id:
                                            item?.call_members[0]?._id,
                                          contact_id: item?.call_members[0]?.id,
                                        })
                                      }
                                      disabled={
                                        callState?.state === "active" ? true : false
                                      }
                                    >
                                      <View>
                                        <Image
                                          source={require("../../Assets/Icons/Video.png")}
                                          style={styles.videoIcon}
                                        />
                                      </View>
                                    </TouchableOpacity>
                                  ) : !item?.call_members[0]?.is_block ? (
                                    <TouchableOpacity
                                      style={styles.editProfile}
                                      onPress={() =>
                                        onCallPress({
                                          call_type: "audio",
                                          contact_image:
                                            item?.call_members[0]?.image,
                                          contact_name:
                                            item?.call_members[0]?.name,
                                          contact_chat_id:
                                            item?.call_members[0]?._id,
                                          contact_id: item?.call_members[0]?.id,
                                        })
                                      }
                                      disabled={
                                        callState?.state === "active" ? true : false
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
      </View>
    </MainComponent>
  );
}
