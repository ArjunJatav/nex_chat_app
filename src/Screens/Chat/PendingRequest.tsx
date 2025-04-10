import { t } from "i18next";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  iconTheme,
  searchBar,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { chatTop, settingTop } from "../../Navigation/Icons";
import axios from "axios";
import {
  Base_Url,
  acceptfriendrequest,
  blockApi,
  chatBaseUrl,
  friendrequestlist,
  get_by_ChatId,
  rejectfriendrequest,
} from "../../Constant/Api";
import { Image } from "react-native";
import { Text } from "react-native";
import { LoaderModel } from "../Modals/LoaderModel";
import { colors } from "../../utils/constants/colors";
import PagerView from "react-native-pager-view";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { setmyrequestdata, setotherrequestdata } from "../../Redux/ChatHistory";
import {
  blockRoom,
  getRoomIdFromRes,
  updateblockuser,
} from "../../sqliteStore";
import { socket } from "../../socket";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import { setProfileData } from "../../Redux/MessageSlice";
import { PostApiCall } from "../../Components/ApiServices/PostApi";

const isDarkMode = true;

const PendingRequest = ({ navigation }: any) => {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const dispatch = useDispatch();
  const myrequestdata = useSelector(
    (state: any) => state.chatHistory.myrequestdata
  );
  const otherrequestdata = useSelector(
    (state: any) => state.chatHistory.otherrequestdata
  );
  const [loaderModel, setloaderMoedl] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const pagerAllMediaRef = useRef(null);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmParams, setConfirmParams] = useState(null);
  // console.log("filteredData",filteredData)

    const bottomSheetRef = useRef(null); //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    const handlePresentModalPress = useCallback(() => {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      bottomSheetRef.current?.present(), [];
    });

  useEffect(() => {
    getPendinglist();
  }, []);

  const getPendinglist = async () => {
    setloaderMoedl(true);
    const url = Base_Url + friendrequestlist;
    try {
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          //@ts-ignore
          Authorization: "Bearer " + globalThis.token,
        },
      })
        .then((response) => {
          setloaderMoedl(false);
          console.log("pending list api response", response.data.data);
          if (response.data.status == true) {
            dispatch(setmyrequestdata(response?.data?.data?.my_requests));
            dispatch(
              setotherrequestdata(response?.data?.data?.otner_request_me)
            );
          } else {
            console.log("pending request in else part", response);
            setloaderMoedl(false);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
        });
    } catch (error) {
      setloaderMoedl(false);
    }
  };

  const RjectRequest = async (id, type) => {
    console.log("type", id, type);
    //  setloaderMoedl(true);
    const url = Base_Url + rejectfriendrequest;
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          //@ts-ignore
          Authorization: "Bearer " + globalThis.token,
        },
        data: {
          friend_request_id: id,
          status: type,
        },
      })
        .then((response) => {
          console.log("response", response);
          if (response.data.status == true) {
            setloaderMoedl(true);
            getPendinglist();
          } else {
            console.log("response ELSE", response);
            // setloaderMoedl(false)
            setloaderMoedl(true);
            getPendinglist();
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
          console.log("error", error);
        });
    } catch (error) {
      setloaderMoedl(false);
      console.log("error", error);
    }
  };

  const BlockChatApiCallingfromFriendlist = async (
    chat_user_id,
    phone_number,
    roomId,
    opt,
    action
  ) => {
    console.log("ddddddddddd", chat_user_id, phone_number, roomId, opt, action);
    // setloaderMoedl(true);
    const urlStr = chatBaseUrl + blockApi;
    try {
      await axios({
        method: "post",
        url: urlStr,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${globalThis.token}`,
        },
        data: {
          from: globalThis.chatUserId,
          to: chat_user_id,
          opt: opt,
          roomId: roomId,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            updateblockuser(
              {
                fromuser: globalThis.chatUserId,
                touser: chat_user_id,
              },
              action,
              ({ status, res }) => {
                if (status) {
                  console.log("Room Blocked");
                  // Room Blocked
                } else {
                  console.log(
                    "while adding entry to block user status is false"
                  );
                }
              }
            );

            if (action == "remove") {
              socket.emit("joinRoom", {
                roomId: roomId,
                userId: globalThis.userChatId,
              });
            } else {
              //@ts-ignore
              socket.emit("leaveRoom", {
                roomId: roomId, //@ts-ignore
                userId: globalThis.userChatId,
              });
            }

            socket.emit("blockusers", {
              touser: chat_user_id,
              fromuser: globalThis.chatUserId,
              isBlock: opt == "block",
            });
            blockRoom(roomId, true, () => {
              console.log("yes unblock");
            });
          } else {
            //  Alert.alert(response.data.message);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
        });
    } catch (error: any) {
      setloaderMoedl(false);
    }
  };

  const acceptRequest = async (id, type, phonenumber, chat_user_id) => {
    setloaderMoedl(true);
    const url = Base_Url + acceptfriendrequest;
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          //@ts-ignore
          Authorization: "Bearer " + globalThis.token,
        },
        data: {
          friend_request_id: id,
          status: type,
        },
      })
        .then(async (response) => {
          if (type == "Accept" && chat_user_id) {
            await getRoomIdFromRes(
              String(phonenumber.replace("+", "")), //@ts-ignore
              String(globalThis.phone_number),
              async (res: any) => {
                if (res) {
                  console.log(
                    "res.roomId",
                    chat_user_id,
                    phonenumber.replace("+", ""),
                    res.roomId,
                    "unblock",
                    "remove"
                  );
                  await BlockChatApiCallingfromFriendlist(
                    chat_user_id,
                    phonenumber.replace("+", ""),
                    res.roomId,
                    "unblock",
                    "remove"
                  );

                  // if (response.data.status == true) {
                  //   getPendinglist();
                  // }
                }
              }
            );
          } else {
            getPendinglist();
            setloaderMoedl(true);
          }
          if (response.data) {
            console.log(
              "response data part===================================="
            );
            setloaderMoedl(false);
            getPendinglist();
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
          console.log("error", error);
        });
    } catch (error) {
      setloaderMoedl(false);
      console.log("error", error);
    }
  };

    const getProfileApi = async (chatid, username, userimage) => {
      setloaderMoedl(true);
      return new Promise((resolve, reject) => {
        dispatch(
          setProfileData({
            Image_text: "",
            sticker_position: "",
            display_name: username,
            profile_image: userimage,
            chat_user_id: chatid,
            userProfile: userimage,
          })
        );
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
          get_by_ChatId,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            if (ErrorStr) {
              reject(ErrorStr);
            } else {
              getapiSuccess(ResponseData, ErrorStr, username, userimage);
              resolve(ResponseData);
            }
          }
        );
      });
    };

      const getapiSuccess = (
        // eslint-disable-next-line
        ResponseData: any,
        // eslint-disable-next-line
        ErrorStr: any,
        // eslint-disable-next-line
        username: any,
        // eslint-disable-next-line
        userimage: any
      ) => {
        if (ErrorStr) {
          // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
          setloaderMoedl(false);
 

          // Navigate to another screen or handle the error in some way
        } else {
          const userData = ResponseData.data.user;
          const imageText = JSON.parse(userData.Image_text);
          const stickerPosition = JSON.parse(userData.sticker_position);
          dispatch(
            setProfileData({
              ...userData,
              Image_text: imageText,
              sticker_position: stickerPosition,
              display_name: username,
              profile_image: ResponseData?.data?.user?.profile_image,
              userProfile: ResponseData?.data?.user?.profile_image,
            })
          );
    
          handlePresentModalPress();
          setloaderMoedl(false);
        }
      };
    

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },
    nameInviteContainer: {
      justifyContent: "center",
      margin: 0,
      // width: "85%",
      flexDirection: "column",
    },
    name1conText: {
      marginBottom: 0,
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.semibold(),
      color: COLORS.black,
      paddingLeft: 10,
    },
    name2conText: {
      marginTop: 2,
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.regular(),
      color: COLORS.black,
      paddingLeft: 10,
    },

    chatTopContainer: {
      backgroundColor: themeModule().theme_background,
      paddingBottom: 20,
    },

    chatContainer: {
      backgroundColor: "white",
      borderWidth: 10,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },

    modalText: {
      color: COLORS.black,
      fontSize: 20,
      alignSelf: "center",
      fontFamily: font.semibold(),
    },
    textInput: {
      backgroundColor: searchBar().back_ground,
      borderWidth: 1,
      borderRadius: 10,
      marginHorizontal: 10,
      fontSize: FontSize.font,
      paddingLeft: 10,
      opacity: 0.8,
      marginTop: 20,
      color: COLORS.black,
      height: 48,
      fontFamily: font.semibold(),
    },
    feedbackTextInput: {
      height: 150,
      backgroundColor: searchBar().back_ground,
      borderWidth: 1,
      borderRadius: 10,
      marginHorizontal: 10,
      paddingLeft: 10,
      opacity: 0.8,
      marginTop: 20,
      color: "#fff",
    },
    submiBtn: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: "#3aff13",
      width: "45%",
      justifyContent: "center",
      alignItems: "center",
    },
    button: {
      height: 50,
      marginTop: 50,
      borderRadius: 10,
      marginHorizontal: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().iconColor,
    },
    buttonText: {
      fontSize: FontSize.font,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    profile1Container: {
      // marginTop: 10,
      paddingVertical: Platform.OS == "ios" ? 10 : 5,
      flexDirection: "row",
      // height: 60,
      borderBottomWidth: 1,
      borderBottomColor: "#EAEAEA",
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
    NoDataContainer: {
      height: windowHeight - 250,
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
  });

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

  // showConfirmAlert function to open alert with message and action type
  const showConfirmAlert = ({ message, action, params }) => {
    setConfirmMessage(message);
    setConfirmAction(action);
    setConfirmParams(params);
    setConfirmAlertModel(true);
  };

  // Example functions to handle each request type
  const handleAcceptRequest = (item) => {
    showConfirmAlert({
      message: t("Are_you_sure_you_want_to_accept_this_request"),
      action: "acceptRequest",
      params: {
        id: item.id,
        type: "Accept",
        phone: item?.from_user?.phone_number,
        chatId: item?.from_user?.chat_user_id,
      },
    });
  };

  const handleRejectRequest = (item) => {
    showConfirmAlert({
      message: t("Are_you_sure_you_want_to_reject_this_request"),
      action: "rejectRequest",
      params: {
        id: item.id,
        type: "Reject",
        phone: item?.from_user?.phone_number,
        chatId: item?.from_user?.chat_user_id,
      },
    });
  };

  const handleCancelRequest = (item) => {
    showConfirmAlert({
      message: t("Are_you_sure_you_wanttocancel_this_request"),
      action: "cancelRequest",
      params: { id: item.id, type: "Reject" },
    });
  };

  // confirmActionPressed to handle each action based on action type
  const confirmActionPressed = () => {
    if (!confirmAction || !confirmParams) return;

    switch (confirmAction) {
      case "acceptRequest":
        acceptRequest(
          confirmParams.id,
          confirmParams.type,
          confirmParams.phone,
          confirmParams.chatId
        );
        break;
      case "rejectRequest":
        acceptRequest(
          confirmParams.id,
          confirmParams.type,
          confirmParams.phone,
          confirmParams.chatId
        );
        break;
      case "cancelRequest":
        RjectRequest(confirmParams.id, confirmParams.type);
        break;
      default:
        console.warn("No action found for:", confirmAction);
    }

    setConfirmAlertModel(false); // Close the alert
    setConfirmParams(null); // Clear params
  };

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      {/* // **********  Status Bar    ********** // */}
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
          confirmText={confirmMessage}
          cancel={() => setConfirmAlertModel(false)}
          confirmButton={confirmActionPressed}
        />
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        <TopBar
          showTitleForBack={true}
          title={t("Friend_Requests")}
          backArrow={true}
          checked={globalThis.selectTheme}
          navState={navigation}
        />

        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
        globalThis.selectTheme === "indiaTheme" ||
        globalThis.selectTheme === "englandTheme" ||
        globalThis.selectTheme === "americaTheme" ||
        globalThis.selectTheme === "mexicoTheme" ||
        globalThis.selectTheme === "usindepTheme" ? (
          <ImageBackground
            source={settingTop().BackGroundImage}
            resizeMode="cover"
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
        ) : null}
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>

      <View style={styles.chatContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
          behavior={Platform.OS == "android" ? "height" : "padding"}
          enabled
        >
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab == 0 && styles.activeTab]}
              onPress={() => handleTabPress(0)}
            >
              <Text
                style={{
                  color: colors.black,
                  fontSize: activeTab === 0 ? 15 : 13,
                  fontFamily: font.semibold(),
                }}
              >
                {t("Received")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab == 1 && styles.activeTab]}
              onPress={() => handleTabPress(1)}
            >
              <Text
                style={{
                  color: colors.black,
                  fontSize: activeTab === 1 ? 15 : 13,
                  fontFamily: font.semibold(),
                }}
              >
                {t("sent")}
              </Text>
            </TouchableOpacity>
          </View>
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
              data={otherrequestdata}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              renderItem={({ item, index }: any) => (
                <TouchableOpacity key={index} style={styles.profile1Container}
                onPress={()=>getProfileApi(item.from_user.chat_user_id, item.from_user.first_name, item.from_user.profile_image)}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      width: "15%",
                    }}
                  >
                    <View
                      style={{
                        width: DeviceInfo.isTablet() ? 60 : 50,
                        height: DeviceInfo.isTablet() ? 60 : 50,
                        borderRadius: DeviceInfo.isTablet() ? 30 : 25,
                        borderColor: textTheme().textColor,
                        borderWidth: 0.8,
                        justifyContent: "center", // Center image in the container
                        alignItems: "center",
                        overflow: "hidden",
                        // padding: 10,
                      }}
                    >
                      <Image
                        source={{ uri: item?.from_user?.profile_image }}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                  <View style={{}}>
                    <View style={styles.nameInviteContainer}>
                      <Text style={styles.name1conText}>
                        {item?.from_user?.first_name}
                      </Text>
                      {item.is_diamonds ? (
                        <Image
                          source={require("../../Assets/Icons/diamond.png")}
                          style={{
                            height: 15,
                            width: 15,
                            marginTop: Platform.OS == "android" ? 10 : 2,
                            marginLeft: Platform.OS === "ios" ? 5 : 5,
                            tintColor: iconTheme().iconColorNew,
                          }}
                        />
                      ) : null}
                      <Text style={[styles.name2conText]} numberOfLines={1}>
                        {moment(item.created_at).format("DD MMMM, h:mm A")}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginLeft: "auto", flexDirection: "row" }}>
                    <TouchableOpacity
                      onPress={() => {
                        // Alert.alert(
                        //   t("Confirm_Request"),
                        //   t("Are_you_sure_you_want_to_accept_this_request"),
                        //   [
                        //     { text: t("cancel") },
                        //     {
                        //       text: t("yes"),
                        //       onPress: () => acceptRequest(item.id, "Accept",item?.from_user?.phone_number,item?.from_user?.chat_user_id),
                        //       style: "destructive",
                        //     },
                        //   ],
                        //   { cancelable: true }
                        // );
                        // Accept Request
                        handleAcceptRequest(item);
                      }}
                      style={{
                        width: DeviceInfo.isTablet() ? 60 : 35,
                        height: DeviceInfo.isTablet() ? 60 : 35,
                        borderRadius: 50,
                        borderColor: textTheme().textColor,
                        borderWidth: 0.8,
                        padding: 6,
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/correct_sign.png")}
                        style={{
                          width: "100%",
                          height: "100%",
                          tintColor: iconTheme().iconColor,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        // Alert.alert(
                        //   t("Reject_Request"),
                        //   t("Are_you_sure_you_want_to_reject_this_request"),
                        //   [
                        //     { text: t("cancel") },
                        //     {
                        //       text: t("yes"),
                        //       onPress: () => acceptRequest(item.id, "Reject",item?.from_user?.phone_number,item?.from_user?.chat_user_id),
                        //       style: "destructive",
                        //     },
                        //   ],
                        //   { cancelable: true }
                        // );
                        // Reject Request
                        handleRejectRequest(item);
                      }}
                      style={{
                        marginLeft: 10,
                        width: DeviceInfo.isTablet() ? 60 : 35,
                        height: DeviceInfo.isTablet() ? 60 : 35,
                        borderRadius: 50,
                        borderColor: textTheme().textColor,
                        borderWidth: 0.8,
                        padding: 10,
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/Cross.png")}
                        style={{
                          width: "100%",
                          height: "100%",
                          tintColor: iconTheme().iconColor,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.NoDataContainer}>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={styles.noCalls}>
                      {t("No_Pending_Request")}
                    </Text>
                    {/* <Text style={styles.noDataText}>
                        {t("allVideoAndAudioCallDisplay")}
                      </Text> */}
                  </View>
                </View>
              )}
            />
            <FlatList
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              data={myrequestdata}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              renderItem={({ item, index }: any) => (
                
                
                <TouchableOpacity key={index} style={styles.profile1Container}
                onPress={()=> getProfileApi(item.to_user.chat_user_id, item.to_user.first_name, item.to_user.profile_image)}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      width: "15%",
                    }}
                  >
                    <View
                      style={{
                        width: DeviceInfo.isTablet() ? 60 : 50,
                        height: DeviceInfo.isTablet() ? 60 : 50,
                        borderRadius: DeviceInfo.isTablet() ? 30 : 25,
                        borderColor: textTheme().textColor,
                        borderWidth: 0.8,
                        justifyContent: "center", // Center image in the container
                        alignItems: "center",
                        overflow: "hidden",
                        // padding: 10,
                      }}
                    >
                      <Image
                        source={{ uri: item.to_user.profile_image }}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                        resizeMode="cover"
                      />
                    </View>
                  </View>

                  <View style={{}}>
                    <View style={styles.nameInviteContainer}>
                      <View style={{ flexDirection: "row" }}>
                        <Text style={styles.name1conText}>
                          {item.to_user?.first_name}
                        </Text>
                        {item.is_diamonds ? (
                          <Image
                            source={require("../../Assets/Icons/diamond.png")}
                            style={{
                              height: 15,
                              width: 15,
                              marginTop: Platform.OS == "android" ? 10 : 2,
                              marginLeft: Platform.OS === "ios" ? 5 : 5,
                              tintColor: iconTheme().iconColorNew,
                            }}
                          />
                        ) : null}
                      </View>

                      <Text style={[styles.name2conText]} numberOfLines={1}>
                        {moment(item.created_at).format("DD MMMM, h:mm A")}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginLeft: "auto", flexDirection: "row" }}>
                    <TouchableOpacity
                      onPress={() => {
                        // Alert.alert(
                        //   t("Cancel_Request"),
                        //   t("Are_you_sure_you_wanttocancel_this_request"),
                        //   [
                        //     { text: t("cancel") },
                        //     {
                        //       text: t("yes"),
                        //       onPress: () => RjectRequest(item.id, "Reject"),
                        //       style: "destructive",
                        //     },
                        //   ],
                        //   { cancelable: true }
                        // );
                        // Cancel Request
                        handleCancelRequest(item);
                      }}
                      style={{
                        marginLeft: 10,
                        width: DeviceInfo.isTablet() ? 60 : 35,
                        height: DeviceInfo.isTablet() ? 60 : 35,
                        borderRadius: 50,
                        borderColor: textTheme().textColor,
                        borderWidth: 0.8,
                        padding: 10,
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/Cross.png")}
                        style={{
                          width: "100%",
                          height: "100%",
                          tintColor: iconTheme().iconColor,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.NoDataContainer}>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={styles.noCalls}>
                      {t("No_Pending_Request")}
                    </Text>
                    {/* <Text style={styles.noDataText}>
                        {t("allVideoAndAudioCallDisplay")}
                      </Text> */}
                  </View>
                </View>
              )}
            />
          </PagerView>
        </KeyboardAvoidingView>
      </View>
      <CustomBottomSheetModal
          ref={bottomSheetRef}
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          navigation={navigation}
         
        />
    </MainComponent>
  );
};
export default PendingRequest;
