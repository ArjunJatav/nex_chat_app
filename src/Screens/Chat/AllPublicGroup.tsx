import axios from "axios";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { showToast } from "../../Components/CustomToast/Action";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import {
  addMemberApi,
  chatBaseUrl,
  getChannelData,
  getGlobalGroupV3,
  joinChannel,
} from "../../Constant/Api";
import { EncryptionKey } from "../../Constant/Key";
import { chatTop } from "../../Navigation/Icons";
import { socket } from "../../socket";
import {
  getChannelInfo,
  getChannelInfoById,
  getPublicRoomCount,
  increaseSubscribers,
  insertChannelInfo,
  insertChannelMessagesAll,
  newMessageInsertList,
} from "../../sqliteStore";
import { LoaderModel } from "../Modals/LoaderModel";
import { useDispatch, useSelector } from "react-redux";
import {
  setMainprovider,
  setisLock,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setnewroomID,
  setnewroomType,
  setroominfo,
  setyesstart,
} from "../../Redux/ChatHistory";
import renderIf from "../../Components/renderIf";
import SearchBarSubmit from "../../Components/SearchBar/SearchBarSubmit";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import { setChannelObj } from "../../Redux/MessageSlice";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { Mixpanel } from "mixpanel-react-native";
import { AppsFlyerTracker } from "../EventTracker/AppsFlyerTracker";
import { encryptMessage } from "../../utils/CryptoHelper";

let skip = 0;
const limit = 10;

export default function AllPublicGroup({ navigation, route }: any) {
  const dispatch = useDispatch();
  const [loaderModel, setloaderModel] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const isDarkMode = true;
  const windowWidth = Dimensions.get("window").width;
  const [searchValue, setSearchValue] = useState("");
  const [apiData, setApiData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );

  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [groupJoinAlert, setgroupJoinAlert] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);

  const joinChannelLimitFree = useSelector(
    (state) => state?.premiumLimitSlice?.joinChannelLimitFree
  );
  const joinChannelLimitPremium = useSelector(
    (state) => state?.premiumLimitSlice?.joinChannelLimitPremium
  );
  const joinGroupLimitFree = useSelector(
    (state) => state?.premiumLimitSlice?.joinGroupLimitFree
  );
  const joinGroupLimitPremium = useSelector(
    (state) => state?.premiumLimitSlice?.joinGroupLimitPremium
  );


  console.log("tabIndextabIndextabIndex",globalThis.mixpanelToken);
const trackAutomaticEvents = false;
const mixpanel = new Mixpanel(
  `${globalThis.mixpanelToken}`,
  trackAutomaticEvents
);

const handleButtonPress = (string) => {
  console.log("string",string);
  handleCallEvent(string);
  // Track button click event
  mixpanel.track("Group Searching", {
    GroupName: string,
  });
};

const handleCallEvent = (groupName) => {
  const eventName = 'Group Searching';
  const eventValues = {
    af_content_id: groupName,
    af_customer_user_id: globalThis.chatUserId,
    af_quantity: 1,
  };

  AppsFlyerTracker(eventName, eventValues, globalThis.chatUserId); // Pass user ID if you want to set it globally
};

  useEffect(() => {
    skip = 0;
    setloaderModel(true);
    if (route?.params?.dataFor == "group") {
      getGroup(searchValue, "group");
    } else {
      getGroup(searchValue, "channel");
    }
  }, []);

  let cancelTokenSource;
  const getGroup = async (str: string, type: string) => {
    if (str == "") {
      //   setloaderModel(true);
    }
    if (type == "group" && str != "" ) {
      handleButtonPress(str);
      
    }
    setLoader(true);

    if (cancelTokenSource) {
      cancelTokenSource.cancel("Operation canceled due to new request.");
    }

    // Create a new CancelToken source
    cancelTokenSource = axios.CancelToken.source();
    //
    const urlStr =
      chatBaseUrl +
      getGlobalGroupV3 +
      str +
      "&userId=" +
      globalThis.chatUserId +
      "&all=" +
      true +
      "&type=" +
      type +
      "&limit=" +
      limit +
      "&skip=" +
      skip;

    console.log("url str===", urlStr);
    try {
      await axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cancelToken: cancelTokenSource.token,
      })
        .then((response) => {
          if (response.data.status == true) {
            if (response.data.data.length > 0) {
              if (skip == 0) {
                setApiData([]);
                const updatedArray = response.data.data.map((obj) => ({
                  ...obj,
                  roomType: "multiple",
                  shouldJoinPublicGroup:
                    obj.owner == globalThis.chatUserId ? false : true,
                  fromApi: true,
                }));
                console.log("updatedArrayyupdatedArrayy", updatedArray);
                setApiData(updatedArray);
              } else {
                const updatedArray = response.data.data.map((obj) => ({
                  ...obj,
                  roomType: "multiple",
                  shouldJoinPublicGroup:
                    obj.owner == globalThis.chatUserId ? false : true,
                  fromApi: true,
                }));
                setApiData((prevData) => [...prevData, ...updatedArray]);
              }
            } else {
              setHasMore(false);
              if (skip == 0 && response.data.data.length == 0) {
                setApiData([]);
              }
            }

            //  setApiData(updatedArray);
            setloaderModel(false);
            setLoader(false);
          }
        })
        .catch((error) => {
          setloaderModel(false);
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          }
          setLoader(false);

          setloaderModel(false);
          if (error.response.status == 401) {
            showToast("Session Expired.");

            globalThis.token = "";
            navigation.navigate("LoginScreen");
          }
          setloaderModel(false);
          setLoader(false);
        });
    } catch (error) {
      setloaderModel(false);
    }
  };

  function clearInput() {
    setSearchValue("");
    skip = 0;
    setHasMore(true);
    if (route?.params?.dataFor == "group") {
      getGroup("", "group");
    } else {
      getGroup("", "channel");
    }
  }

  const searchDataSubmit = (text: string) => {
    if (text == "") {
      skip = 0;
      setHasMore(true);
      if (route?.params?.dataFor == "group") {
        getGroup("", "group");
      } else {
        getGroup("", "channel");
      }
    } else {
      if (text?.length > 0) {
        skip = 0;
        setApiData([]);
        setHasMore(true);
        setloaderModel(true);
        if (route?.params?.dataFor == "group") {
          getGroup(text, "group");
        } else {
          getGroup(text, "channel");
        }
      }
    }
  };

  const searchableData = (text: string) => {
    setSearchValue(text);
  };

  const MessageHistory = (item) => {
    if (item.isLock == 1) {
      console.log("lock");
    } else {
      dispatch(
        setMainprovider({
          userImage: item?.image || item?.roomImage,
          userName: item?.name || item?.roomName,
          room: item,
          roomType: item.roomType,
          friendId: item.friendId,
          lastMessageId: item.lastMessageId,
          isBlock: item.isUserExitedFromGroup,
          userId: item.friendId,
          isLock: item.isLock,
          isFromPublicPage: true,
        })
      );

      dispatch(setyesstart(true));
      dispatch(setnewroomID(item?.roomId?._id));
      dispatch(setnewroomType(item.roomType));
      dispatch(
        setroominfo({
          roomImage: item?.image || item?.roomImage,
          roomName: item?.name || item?.roomName,
          aliasName: item?.name || item?.roomName,
          aliasImage: item?.image || item?.roomImage,
        })
      );

      dispatch(setisnewBlock(false));
      dispatch(setisnewmMute(item.isNotificationAllowed));
      dispatch(setisnewArchiveroom(item.archive));
      dispatch(setisLock(item.isLock));

      navigation.navigate("ChattingScreen", {
        userImage: item?.image || item?.roomImage,
        userName: item?.name || item?.roomName,
        aliasName: item?.name || item?.roomName,
        aliasImage: item?.image || item?.roomImage,
        room: item,
        roomType: item.roomType,
        friendId: item.friendId,
        lastMessageId: item.lastMessageId,
        isBlock: item.isUserExitedFromGroup,
        inside: true,
        screenFrom: "chatScreen",
        isLock: item.isLock,
        shouldJoinPublicGroup: false,
        isFromPublicPage: true,
        isPublic: item.isPublic || 1,
      });
    }
  };

  const JoinPublicGroup = async (item) => {
    setgroupJoinAlert(true);
    getPublicRoomCount(async (publicRoomCount) => {
      if (publicRoomCount > joinGroupLimitFree && !userPremium) {
        setShowPremiumAlert(true);
        console.log("countttttttt", publicRoomCount);
      } else {
        if (publicRoomCount < joinGroupLimitPremium) {
          setLoadingStates((prevLoadingStates) => ({
            ...prevLoadingStates,
            [item._id]: true, // assuming item has an id, replace with the unique identifier of your item
          }));
          setLoading(true);
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          const bodydata = JSON.stringify({
            userId: globalThis.userChatId,
            roomId: item.roomId._id,
            members: [globalThis.userChatId],
            operation: "ADD",
          });
          const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: bodydata,
          };
          const response = await fetch(
            chatBaseUrl + addMemberApi,
            requestOptions
          );
          const data = await response.json();

          if (data.status === true) {
            try {
              const mId = Math.floor(Math.random() * 9000) + 1000;
              const messageSend = encryptMessage(item.roomId._id,`${globalThis.displayName} joined the group.` )
              
              // CryptoJS.AES.encrypt(
              //   `${globalThis.displayName} joined the group.`,
              //   EncryptionKey
              // ).toString();

              dispatch(setisnewBlock(false));

              const paramsOfSendforlive = {
                mId: mId,

                userName: globalThis.displayName,
                phoneNumber: globalThis.phone_number,
                currentUserPhoneNumber: globalThis.phone_number,

                userImage: globalThis.image,
                roomId: item.roomId._id,
                roomName: item.name,
                roomImage: item.image,
                roomType: "multiple",

                roomOwnerId: globalThis.userChatId,
                message: messageSend,
                message_type: "notify",
                roomMembers: [],
                parent_message_id: "",
                attachment: [],

                from: globalThis.userChatId,
                resId: Date.now(),
                createdAt: new Date(),
              };
              console.log("join public", {
                roomId: item.roomId._id,
                chat_user_id: globalThis.chatUserId,
                contact_name: globalThis.displayName,
                profile_image: globalThis.image,
                isAdmin: 0,
                // membersIds: data.data.members.map((m: any) => m.user),
                membersIds: item.membersId.members.map((m) => m.user._id),
                phone_number: globalThis.phone_number,
              });

              socket.emit("joinGroup", {
                roomId: item.roomId._id,
                chat_user_id: globalThis.chatUserId,
                contact_name: globalThis.displayName,
                profile_image: globalThis.image,
                isAdmin: 0,
                // membersIds: data.data.members.map((m: any) => m.user),
                membersIds: item.membersId.members.map((m) => m.user._id),
                phone_number: globalThis.phone_number,
              });

              socket.emit("joinRoom", {
                roomId: item.roomId._id,
                userId: globalThis.userChatId,
              });

              const createGroup = {
                roomId: item.roomId._id,
                roomName: item.name,
                roomImage: item.image,
                roomType: "multiple",
                friendId: "",
                fromUser: globalThis.userChatId,
                isPublic: 1,
                owner: item.owner,
                allow: item.allow,
              };

              newMessageInsertList(createGroup, false, "0");
              socket.emit("sendmessage", paramsOfSendforlive);

              // const getRoomMembersUrl =
              //   chatBaseUrl + getRoomMembersApi + "?roomId=" + item.roomId._id;

              MessageHistory(item);
              setLoading(false);
            } catch (err) {
              console.log("errr", err);
            }
          } else {
            setLoading(false);
            // throw new Error("Failed to Delete Chat");
          }
        } else {
          // Alert.alert(
          //   t("error"), // The title of the alert
          //   t("The_group_join_limit"), // The message body
          //   [{ text: t("OK") }] // Button options
          // );
          globalThis.errorMessage = t("The_group_join_limit");
          setErrorAlertModel(true);
        }
      }
    });
  };

  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 50,
      zIndex: 1001,
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: DeviceInfo.isTablet() ? 20 : 20,
      marginTop: DeviceInfo.isTablet() ? 30 : 15,
      paddingBottom: 5,
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    chatContainer: {
      backgroundColor: "#fff",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      marginBottom: 94,
      height: "100%",
    },
    loader: {
      paddingVertical: 20,
      borderTopWidth: 1,
      borderColor: "#CED0CE",
    },
  });

  const OverlappingImages = ({ members, members_length }: object) => {
    const displayedMembers = members?.slice(0, 4);
    const remainingCount = members_length - 4;
    return (
      <View
        style={{
          height: 50,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginLeft:
            members?.length === 1
              ? 5
              : members?.length === 2
              ? 10
              : members?.length === 3
              ? 30
              : 40,
        }}
      >
        {displayedMembers?.map((member, index) => (
          <Image
            key={index}
            source={{
              uri:
                member?.user?.image == null
                  ? "https://wokii.io/backend/public/images/user-avatar.png"
                  : member?.user?.image,
            }}
            style={{
              height: 30,
              width: 30,
              borderRadius: 15,
              left: index * -10, // Adjust the left position to create overlap
            }}
            resizeMode="cover"
          />
        ))}
        {remainingCount > 0 && (
          <View
            style={[
              {
                left: displayedMembers.length * -10,
                height: 30,
                width: 30,
                borderRadius: 15,
                backgroundColor: themeModule().theme_background,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text
              style={{
                color: iconTheme().iconColor,
                fontFamily: font.medium(),
              }}
            >
              +{remainingCount > 99 ? "99" : remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
  };



  const AllChaneelDataApi = async (channelId, item) => {
    const urlStr = chatBaseUrl + getChannelData + channelId;
    try {
      await axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            console.log("response?.data?.data", response?.data?.data);
            // setLinkChannelData(response.data.data.channel);
            // setLinkChannelChat(response?.data?.data?.chats);
            if (response?.data?.data?.chats?.length > 0) {
              const processMessages = async () => {
                try {
                  const success = await new Promise((resolve) =>
                    insertChannelMessagesAll(
                      response?.data?.data?.chats,
                      response.data.data.channel?.owner,
                      (success) => {
                        resolve(success);
                      }
                    )
                  );

                  if (success) {
                    const channelLinkToSend =
                      "https://tokeecorp.com/backend/public/deepLink-forward?type=channel&id=" +
                      item?._id;
                    const obj = {
                      ownerId: item?.owner,
                      channelName: item?.name,
                      channelDescription: item.description,
                      image: item?.image,
                      type: "public",
                      link: channelLinkToSend,
                      subs: item?.membersCount + 1,
                      notifiAllow: true,
                      channelId: item?._id,
                      lastMessage: "",
                      lastMessageId: item._id + 1,
                      lastMessageType: "notify",
                      lastMessageTime: Date.now(),
                      isExclusive: item?.isExclusive ? 1 : 0,
                      isPaid: item?.isPaid ? 1 : 0,
                      isHide:0
                    };
                    insertChannelInfo(obj, (res) => {
                      if (res === true) {
                        increaseSubscribers(item._id, (result) => {
                          if (result === true) {
                            getChannelInfoById(item?._id, (result) => {
                              dispatch(setChannelObj(result));
                              navigation.navigate("ChannelChatting", {
                                channelData: result,
                                deepLinking: false,
                                channelId: item._id,
                              });
                            });
                          }
                        });
                      }
                    });
                  } else {
                    console.error("Failed to insert messages");
                  }
                } catch (error) {
                  console.error("Processing error:", error);
                }
              };
              processMessages();
            }
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          alert(error);
        });
      // eslint-disable-next-line
    } catch (error: any) {
      alert(error);
    }
  };

  async function JoinPublicChannel(item) {
    setLoadingStates((prevLoadingStates) => ({
      ...prevLoadingStates,
      [item._id]: true, // assuming item has an id, replace with the unique identifier of your item
    }));
    setLoading(true);
    setgroupJoinAlert(false);

    getChannelInfo(async (channels, count) => {
      const joinedChannelLength = channels.length - count;
      // console.log("joinedChannelLength", joinedChannelLength);
      if (joinedChannelLength > joinChannelLimitFree && !userPremium) {
        setShowPremiumAlert(true);
        console.log("NON PREMIUM ", joinedChannelLength);
      } else {
        if (joinedChannelLength < joinChannelLimitPremium) {
          console.log(" PREMIUM ", joinedChannelLength);
          setLoadingStates((prevLoadingStates) => ({
            ...prevLoadingStates,
            [item._id]: true, // assuming item has an id, replace with the unique identifier of your item
          }));
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          const bodydata = JSON.stringify({
            userId: globalThis.userChatId,
            channelId: item._id,
          });
          const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: bodydata,
          };
          const response = await fetch(
            chatBaseUrl + joinChannel,
            requestOptions
          );

          const data = await response.json();
          if (data.status === true) {
            try {
              console.log("join api response:", data);
              // const mId = Math.floor(Math.random() * 9000) + 1000;

              // const dateinsert = new Date(
              //   data.result.createdAt || data.result.messageTime
              // );
              socket.emit("joinChannel", {
                roomId: item._id,
                userId: globalThis.chatUserId,
              });
              AllChaneelDataApi(item._id, item);
            } catch (error) {
              console.log("errrr", error);
            }
          }
        } else {
          // Alert.alert(
          //   t("error"), // The title of the alert
          //   t("The_group_join_limit"), // The message body
          //   [{ text: t("OK") }] // Button options
          // );
          globalThis.errorMessage = t("The_group_join_limit");
          setErrorAlertModel(true);
        }
      }
      /// setChannelData(channels);
    });
  }

  const loadData = async () => {
    if (!hasMore && loader) return;
    if (apiData.length > 6) {
      skip = skip + limit;
      setLoader(true);
      if (route?.params?.dataFor == "group") {
        getGroup(searchValue, "group");
      } else {
        getGroup(searchValue, "channel");
      }
    }
  };

  const premiumAlertHeading = t("You_have_exceed_the_Limit");
  const premiumAlertSubHeading = groupJoinAlert
    ? t("You_can_Join_Maximum_of_50_Public_Groups_only")
    : t("The_group_join_limit_50");
  const premiumAlertSecondButtonText = "Go To Premium";

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <LoaderModel visible={loaderModel} />
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
      <PremiumAlert
        visible={showPremiumAlert}
        onRequestClose={() => setShowPremiumAlert(false)}
        cancel={() => setShowPremiumAlert(false)}
        Heading={premiumAlertHeading}
        SubHeading={premiumAlertSubHeading}
        FirstButton={""}
        SecondButton={premiumAlertSecondButtonText}
        firstButtonClick={() => setShowPremiumAlert(false)}
        secondButtonClick={() => {
          if (premiumAlertSecondButtonText == "Cancel") {
            setShowPremiumAlert(false);
          } else {
            setShowPremiumAlert(false);
            navigation.navigate("PremiumFeaturesScreen");
          }
        }}
      />
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        <TopBar
          showTitle={true}
          title={
            route?.params?.dataFor == "group"
              ? t("public_groups")
              : t("Public_Channels")
          }
          navState={navigation}
          checked={globalThis.selectTheme}
        />

        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity
              onPress={() => navigation.pop()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>

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
            source={chatTop().BackGroundImage}
            resizeMode="cover" // Update the path or use a URL
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

        <View style={styles.chatContainer}>
          <View style={{ paddingBottom: 15 }}>
            <SearchBarSubmit
              search={searchableData}
              value={searchValue}
              clickCross={clearInput}
              placeHolder={
                route?.params?.dataFor === "group"
                  ? t("search_group")
                  : t("search_channel")
              }
              searchsubmit={searchDataSubmit}
              // focus={searchBarFocus}
              // blur={!searchBarFocus}
            />
          </View>
          {apiData.length == 0 && !loaderModel && (
            <View>
              <Text style={{ textAlign: "center", marginTop: 100 }}>
                {route?.params?.dataFor == "group"
                  ? t("No_Groups_Found")
                  : t("No_Channel_Found")}
              </Text>
            </View>
          )}
          <View style={{ backgroundColor: "#fff" }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={apiData}
              onEndReached={loadData}
              onEndReachedThreshold={0.5}
              numColumns={2}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    console.log("jdjhdghj")
                    // if (!item?.membersId) {
                      console.log("in if")
                      if (route?.params?.dataFor == "group") {

                        item.shouldJoinPublicGroup == true
                    ? null
                    : MessageHistory(item);
                      }
                      else if (item._id || item.channelId) {
                        navigation.navigate("ChannelChatting", {
                          channelId: item._id || item.channelId,
                          deepLinking: true,
                        });
                      }
                    // }
                  }}
                  style={{
                    width: "48%",
                    justifyContent: "center",
                    alignItems: "center",
                    // height: route?.params?.dataFor == "group" ? 225 : 200,
                    borderRadius: 8,
                    paddingBottom: 10,
                    marginRight: 10,
                    marginTop: 50,
                    borderWidth: 0.8,
                    borderColor: iconTheme().iconColor,
                    //    backgroundColor:"green"
                  }}
                >
                  {console.log("itemitem", item)}
                  <View
                    style={{
                      backgroundColor: iconTheme().iconColor,

                      borderRadius: 35,
                      height: 70,
                      width: 70,
                      top: -35,
                      justifyContent: "center",
                      alignItems: "center",
                      position: "absolute",
                    }}
                  >
                    <Image
                      source={{ uri: item?.image }}
                      style={{
                        height: 70,
                        width: 70,
                        borderRadius: 35,
                        borderWidth: 0.8,
                        borderColor: iconTheme().iconColor,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  {/* Render the properties of the item object */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        marginTop: route?.params?.dataFor == "group" ? 35 : 40,
                        // height: 20,
                        color: COLORS.black,
                        lineHeight: DeviceInfo.isTablet() ? 20 : 20,
                        textAlign: "center",
                        fontFamily: font.bold(),
                        fontSize: DeviceInfo.isTablet() ? 18 : 16,
                        marginHorizontal:
                          item?.isExclusive === 1 || item?.isExclusive == true
                            ? 2
                            : 10,
                        // marginLeft:50,
                        // backgroundColor:"red"
                      }}
                    >
                      {item.name}
                    </Text>
                    {(item?.isExclusive === 1 || item?.isExclusive == true) && (
                      <ImageBackground
                        source={require("../../Assets/Icons/verified_icon.png")}
                        style={{
                          marginTop:
                            route?.params?.dataFor == "group" ? 28 : 40,
                          height: 15,
                          width: 15,
                          alignSelf: "center",
                          justifyContent: "center",
                          // marginLeft:5
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
                    style={{
                      height: 40,
                      paddingHorizontal: 5,
                      textAlign: "center",
                      marginHorizontal: 5,
                      fontFamily: font.regular(),
                      color: COLORS.black,
                      // backgroundColor:"red"
                    }}
                    numberOfLines={2}
                  >
                    {route?.params?.dataFor == "group"
                      ? item?.roomId?.bio === null
                        ? t("this_is_a_public_group")
                        : item?.roomId?.bio
                      : item?.description
                      ? item?.description
                      : t("This_is_Public_Channel")}
                  </Text>
                  {renderIf(
                    route?.params?.dataFor == "group",
                    <OverlappingImages
                      members={item?.membersId?.members}
                      members_length={item?.membersId?.membersCount}
                    />
                  )}

                  {route?.params?.dataFor == "group" ? (
                    <Text style={{ marginTop: 8, fontFamily: font.regular() }}>
                      {item?.membersId?.membersCount == 0
                        ? "1 " + t("member")
                        : item?.membersId?.membersCount == 1
                        ? item?.membersId?.membersCount + " " + t("member")
                        : item?.membersId?.membersCount + " " + t("members")}
                    </Text>
                  ) : (
                    <Text style={{ marginTop: 0, fontFamily: font.regular() }}>
                      {item?.membersCount == 0
                        ? "1 " + t("Subscriber")
                        : item?.membersCount == 1
                        ? item?.membersCount + 1 + " " + t("Subscriber")
                        : item?.membersCount + 1 + " " + t("subscribers")}
                    </Text>
                  )}

                  {/* Render other properties as needed */}
                  {renderIf(
                    item.shouldJoinPublicGroup == true,
                    <>
                      {loadingStates[item._id] && isLoading == true ? (
                        <ActivityIndicator
                          size="small"
                          color={iconTheme().iconColor}
                        />
                      ) : (
                        <TouchableOpacity
                          style={{
                            height: 35,
                            marginTop: 5,
                            width: 100,
                            borderRadius: 5,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: iconTheme().iconColor,
                          }}
                          onPress={() =>
                            route?.params?.dataFor == "group"
                              ? JoinPublicGroup(item, index)
                              : JoinPublicChannel(item, index)
                          }
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              alignItems: "center",
                              justifyContent: "center",
                              color: COLORS.white,
                              fontFamily: font.bold(),
                            }}
                          >
                            {" "}
                            {t("join")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {renderIf(
                    item.shouldJoinPublicGroup == false && item.fromApi == true,

                    <View
                      style={{
                        height: 35,
                        marginTop: 5,
                        width: 100,
                        borderRadius: 5,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: iconTheme().iconColor,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontFamily: font.bold(),
                        }}
                      >
                        {t("Open")}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListFooterComponent={() => {
                return (
                  <View
                    style={{
                      height: Platform.OS == "ios" ? 480 : 650,
                      marginBottom: 100,
                    }}
                  >
                    {renderIf(
                      hasMore && apiData.length > 0,
                      <ActivityIndicator
                        animating={loader}
                        size="large"
                      ></ActivityIndicator>
                    )}
                  </View>
                );
              }}
            />
          </View>
        </View>
      </View>
    </MainComponent>
  );
}
