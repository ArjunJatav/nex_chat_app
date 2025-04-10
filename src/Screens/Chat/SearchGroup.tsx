import axios from "axios";
import { t } from "i18next";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { useDispatch, useSelector } from "react-redux";
import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import {
  PanGestureHandler,
  GestureHandlerRootView,
  FlatList,
} from 'react-native-gesture-handler';
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { showToast } from "../../Components/CustomToast/Action";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import renderIf from "../../Components/renderIf";
import {
  addMemberApi,
  chatBaseUrl,
  getChannelData,
  getChannels,
  getGlobalGroupV2,
  getGlobalGroupV3,
  get_by_ChatId,
  get_by_User_allposts,
  joinChannel,
} from "../../Constant/Api";
import { EncryptionKey } from "../../Constant/Key";
import { chatTop } from "../../Navigation/Icons";
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
import { socket } from "../../socket";
import {
  UpdateProfileImage,
  getChannelInfo,
  getChannelInfoById,
  getPublicRoomCount,
  increaseSubscribers,
  insertChannelInfo,
  insertChannelMessagesAll,
  newMessageInsertList,
  searchRooms,
} from "../../sqliteStore";
import { LoaderModel } from "../Modals/LoaderModel";
import SearchBarSubmit from "../../Components/SearchBar/SearchBarSubmit";
import { fontSize } from "../../utils/constants/fonts";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { setChannelObj, setChannelSliceData, setProfileData } from "../../Redux/MessageSlice";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
import { setStorylist } from "../../reducers/friendListSlice";
import { IMessage } from "react-native-gifted-chat";
import { ChannelTypeModal } from "../Modals/ChannelTypeModal";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { Mixpanel } from "mixpanel-react-native";
import { AppsFlyerTracker } from "../EventTracker/AppsFlyerTracker";
import { encryptMessage } from "../../utils/CryptoHelper";

// eslint-disable-next-line
export default function SearchGroup({ navigation }: any) {
  const isDarkMode = true;
  const bottomSheetRef = useRef(null);
  const [seeTrending, setSeeTrending] = useState(true);
  const [loaderModel, setloaderModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [searchValue, setSearchValue] = useState("");
  const [localData, setLocalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [channelFinalData, setChannelFinalData] = useState([]);
  const dispatch = useDispatch();
  const [isUIUpdated, setIsUIUpdated] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [searchBarFocus, setSearchBarFocus] = useState(false);
  const [contactTabClicked, setContactClicked] = useState(false);
  const [GroupTabClicked, setGroupTabClicked] = useState(true);
  const [friendData, setFriendData] = useState([]);
  const [AllfriendData, setAllFriendData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [isChannelTypeModal, setChannelTypeModal] = useState(false);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [groupJoinAlert, setgroupJoinAlert] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);


  const joinChannelLimitFree = useSelector(
    (state:any) => state?.premiumLimitSlice?.joinChannelLimitFree
  );
  const joinChannelLimitPremium = useSelector(
    (state:any) => state?.premiumLimitSlice?.joinChannelLimitPremium
  );
  const joinGroupLimitFree = useSelector(
    (state:any) => state?.premiumLimitSlice?.joinGroupLimitFree
  );
  const joinGroupLimitPremium = useSelector(
    (state:any) => state?.premiumLimitSlice?.joinGroupLimitPremium
  );

  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );

  const [tabIndex, setTabIndex] = useState(0); // 0 = Groups, 1 = Channels, 2 = Contacts
  const [isSwiping, setIsSwiping] = useState(false); // State to track swiping

  const handleSwipe = ({ nativeEvent }) => {
    // Prevent further swipes if already in the middle of a swipe
    if (isSwiping) return;

    if (nativeEvent.translationX > 50) {
      // Swipe Right (Previous Tab)
      if (tabIndex > 0) {
        setIsSwiping(true); // Start swiping
        const newTabIndex = tabIndex - 1;
        setTabIndex(newTabIndex);
        handleTabChange(newTabIndex); // Use the updated value directly
        setTimeout(() => setIsSwiping(false), 300); // Delay to allow the swipe transition
      }
    } else if (nativeEvent.translationX < -50) {
      // Swipe Left (Next Tab)
      if (tabIndex < 2) {
        setIsSwiping(true); // Start swiping
        const newTabIndex = tabIndex + 1;
        setTabIndex(newTabIndex);
        handleTabChange(newTabIndex); // Use the updated value directly
        setTimeout(() => setIsSwiping(false), 300); // Delay to allow the swipe transition
      }
    }
  };

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

  // Function to handle tab switching based on index
const handleTabChange = (index) => {
  if (index === 0) {
    setContactClicked(false);
    setGroupTabClicked(true);
    if (searchValue !== "") {
      console.log("searchValue",searchValue);
      
      getGroup(searchValue, "group");

    } else {
      getGroup(searchValue, "group");
    }
  } else if (index === 1) {
    if (searchValue === "") {
      ChannelTabClicked("");
    } else {
      ChannelTabClicked(searchValue);
    }
    setGroupTabClicked(false);
    setContactClicked(false);
  } else if (index === 2) {
    if (searchValue === "") {
      GetFriends();
    } else {
      const filteredLocalData = friendData.filter(
        (item) =>
          item &&
          item.contact_name &&
          item.contact_name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setAllFriendData(filteredLocalData);
      setFriendData(filteredLocalData);
    }
    setGroupTabClicked(false);
    setContactClicked(true);
  }
};

  const renderContent = () => {
    if (tabIndex === 0) {
      return GroupTabClicked ? filteredData : channelFinalData;
    } else if (tabIndex === 1) {
      return channelFinalData;
    } else if (tabIndex === 2) {
      return friendData;
    }
  };

  useEffect(() => {
    if (contactTabClicked) {
      GetFriends();
    } else if (GroupTabClicked) {
      searchRooms("", (data: any) => {
        
        setLocalData(data);
        getGroup("", "group");
      });
    } else {
      getChannelInfo((res) => {
        setChannelData(res);
      });
    }

    //  setloaderModel(true);

    // eslint-disable-next-line
  }, [GroupTabClicked]);

  async function GetFriends() {
    const tempheaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
    };

    const urlStr = "user/users/get-all-friends?search_srting=";
    GetApiCall(urlStr, tempheaders, navigation, (ResponseData, ErrorStr) => {
      setAllFriendData(ResponseData.data);
      setFriendData(ResponseData.data);
    });
  }
  let cancelTokenSource;



  function AfterChoosingChannelType(value) {
    setChannelTypeModal(false);

    if (value == "public") {
    navigation.navigate("NewChannelScreen", { type: "public" });
    } else {
      navigation.navigate("NewChannelScreen", { type: "private" });
    }

    //newGroupPress(value);
  }

  
  // eslint-disable-next-line
  const getGroup = async (str: any, type: String) => {
    if (str == "") {
      setloaderModel(true);
    };

    if (type == "group" && str != "" ) {
      handleButtonPress(str);
      
    }

    //console.log("typetypetypetypetypetypetypetypetype",type, "strstr",str);
    
    //;
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
      "&type=" +
      type +
      "&userId=" +
      globalThis.chatUserId;

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
        // eslint-disable-next-line
        .then((response: any) => {
       
          if (response.data.status == true) {
            if (str == "") {
              if (type == "group") {
               
                // eslint-disable-next-line
                const updatedArrayy = response.data.data.map((obj: any) => ({
                  ...obj,
                  shouldJoinPublicGroup: obj.owner == globalThis.chatUserId ? false : true,
                  roomType: "multiple",
                  fromApi : true
                }));
                // console.log("updatedArrayyupdatedArrayy",updatedArrayy)
                setFilteredData(updatedArrayy);
                setloaderModel(false);
              } else {
               
                setloaderModel(false);
console.log("response.data.data.response.data.data.response.data.data.",response.data.data)
                const channelApiData = response.data.data.map((obj: any) => ({
                  ...obj,
                  shouldJoinPublicGroup: obj.owner == globalThis.chatUserId ? false : true,
                  fromApi : true
                }));

                const channelLocalData = channelData.map((obj: any) => ({
                  ...obj,
                  shouldJoinPublicGroup: false,
                }));

                const finalArray = [...channelApiData];
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                setChannelFinalData(finalArray);
              }
            } else {
              if (type == "group") {
                
                const updatedArray1 = localData.filter(room => 
                   //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  room.roomType === "multiple" && 
                   //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  room.roomName && 
                   //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  room.roomName.toLowerCase().includes(str.toLowerCase())
                );
                const updatedArray2 = response.data.data.map((obj: any) => ({
                  ...obj,
                  shouldJoinPublicGroup: true,
                  roomType: "multiple",
                }));

                const finalArray = [
                  //  ...updatedArray,
                   ...updatedArray1,
                  ...updatedArray2,
                ];
           
                setFilteredData([]);
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                setFilteredData(finalArray);
                setSeeTrending(false);
                setloaderModel(false);
              } else {
                const filteredLocalData = channelData.filter(
                  // eslint-disable-next-line
                  (item: any) =>
                    item &&
                    item.channelName &&
                    item.channelName.toLowerCase().includes(str.toLowerCase())
                );

                // eslint-disable-next-line
                const updatedArray = filteredLocalData.map((obj: any) => ({
                  ...obj,
                  shouldJoinPublicGroup: false,
                  //  roomType: "single",
                }));

                const updatedArray2 = response.data.data.map((obj: any) => ({
                  ...obj,
                  shouldJoinPublicGroup: true,
                }));
               

                const finalArray = [
                  ...updatedArray,
                  //  ...updatedArray1,
                  ...updatedArray2,
                ];

                
                setChannelFinalData([]);
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                setChannelFinalData(finalArray);
              }
              // eslint-disable-next-line

              setIsUIUpdated(!isUIUpdated);
            }
          }
        })
        .catch((error) => {
          setloaderModel(false);
          console.log("In catch error >>>>",error)
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          }

          setloaderModel(false);
          if (error.response.status == 401) {
            showToast("Session Expired.");
            globalThis.token = "";
            navigation.navigate("LoginScreen");
          }

          setloaderModel(false);
        });
    } catch (error) {
      setloaderModel(false);
    }
  };

  function clearInput() {
    setFilteredData([]);
    setSeeTrending(true);
    setSearchValue("");
    if (GroupTabClicked) {
      getGroup("", "group");
    } else if (contactTabClicked) {
      GetFriends();
    } else {
      getGroup("", "channel");
    }
  }

  // eslint-disable-next-line
  const MessageHistory = (item: any) => {
    if (item.isLock == 1) {
      // setPinModalVisible(true);
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
      dispatch(
        setnewroomID(item?.roomId?._id ? item.roomId._id : item?.roomId)
      );
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

  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 50,
      zIndex: 1001,
    },
    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    nameInviteContainer: {
      // justifyContent: "center",
      // paddingRight:50,
      // width: "65%",
      // flexDirection: "column",
    },
    chatContainer: {
      backgroundColor: "#fff",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      marginBottom: 60,
    },
    profile1Container: {
      marginTop: 0,
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
      // justifyContent:"space-between",
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: DeviceInfo.isTablet() ? 20 : 20,
      marginTop: DeviceInfo.isTablet() ? 30 : 15,
      paddingBottom: 5,
    },
    Container: {
      justifyContent: "center",
      width: "15%",
    },
    name1conText: {
      marginBottom: 0,
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      lineHeight: DeviceInfo.isTablet() ? 20 : 16,
      fontFamily: font.semibold(),
      color: COLORS.black,
      // paddingLeft: 25,
      // height: DeviceInfo.isTablet() ? 30 : 24,
      // lineHeight: DeviceInfo.isTablet() ? 30 : 24,
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    searchTabContainer: {
      flexDirection: "row",
      // backgroundColor:"red"
    },
    contactTabContainer: {
      width: "33.3%",
      // backgroundColor:"green",
      justifyContent: "center",
      alignItems: "center",
      height: 35,
    },
    contactTabText: {
      fontSize: fontSize.input_content_size,
      color: "#000",
    },
  });

  const searchDataSubmit = (text: string) => {
    if (text == "") {
      // If search query is empty, show local data
      setSeeTrending(true);
      setFilteredData([]);
      setSearchValue("");
      if (GroupTabClicked) {
        getGroup("", "group");
      } else if (contactTabClicked) {
        GetFriends();
      } else {
        getGroup("", "channel");
      }
    } else {
      if (text.length > 1) {
        if (GroupTabClicked) {
          setFilteredData([]);
          getGroup(text, "group");
        } else if (contactTabClicked) {
          const filteredLocalData = AllfriendData.filter(
            // eslint-disable-next-line
            (item: any) =>
              item &&
              item.contact_name &&
              item.contact_name.toLowerCase().includes(text.toLowerCase())
          );
         setFriendData(filteredLocalData);
          
        } else {
          // setGroupTabClicked(false);
          // setContactClicked(false);
          setChannelFinalData([]);
          getGroup(text, "channel");
        }
        // If search query is not empty, filter both local and API data
      }
    }
  };

  const searchableData = (text: string) => {
    setSearchValue(text);
  };
  const publicSelected = true;
  const [LinkChannelData, setLinkChannelData] = useState("");
  const [LinkChannelChat, setLinkChannelChat] = useState([]);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const AllChaneelDataApi = async (channelId,item) => {
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
            // console.log("response?.data?.data",response?.data?.data)
            setLinkChannelData(response.data.data.channel);
            setLinkChannelChat(response?.data?.data?.chats)
            if (response?.data?.data?.chats?.length > 0) {
              const processMessages = async () => {
                console.log("insertChannelMessagesAll length",response?.data?.data?.chats.length)
                try {
                  const success = await new Promise((resolve) => 
                    insertChannelMessagesAll(response?.data?.data?.chats, response.data.data.channel?.owner, (success) => {
                      resolve(success);
                    })
                  );
              
                  if (success) {
                
                    let channelLinkToSend = "https://tokeecorp.com/backend/public/deepLink-forward?type=channel&id=" + item?._id;
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
                              setTimeout(() => {
                                dispatch(setChannelObj(result));
                              }, 900);
                              navigation.navigate("ChannelChatting", {
                                channelData: result,
                                deepLinking: false,
                                channelId: item._id
                              });
                            });
                          }
                        });
                      }
                    });
                  } else {
                    console.error('Failed to insert messages');
                  }
                } catch (error) {
                  console.error('Processing error:', error);
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

  async function JoinPublicChannel(item: any) {
 
    setgroupJoinAlert(false);

    getChannelInfo(async (channels, count) => {
      let joinedChannelLength = channels.length - count;
     
      if (joinedChannelLength > joinChannelLimitFree && !userPremium) {
        setShowPremiumAlert(true);
      
      } else {
        if (joinedChannelLength < joinChannelLimitPremium) {
          
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
             
              const mId = Math.floor(Math.random() * 9000) + 1000;

              // const dateinsert = new Date(
              //   data.result.createdAt || data.result.messageTime
              // );
              socket.emit("joinChannel", {
                roomId: item._id,
                userId: globalThis.chatUserId,
              });

              AllChaneelDataApi(item._id,item)
            } catch (err) {
              console.log("errr in joining",err)
            }
          }
        } else {
          // Alert.alert(
          //   t("error"), // The title of the alert
          //   t(
          //     "The_Channel_join_limit_has_been_reached"
          //   ), // The message body
          //   [{ text: t("OK") }] // Button options
          // );
          globalThis.errorMessage =t(
            "The_Channel_join_limit_has_been_reached"
          );
          setErrorAlertModel(true);
        }
      }
      /// setChannelData(channels);
    });
  }
  // eslint-disable-next-line
  const JoinPublicGroup = async (item: any) => {
    setgroupJoinAlert(true);
    getPublicRoomCount(async (publicRoomCount) => {
   
      if (publicRoomCount > joinGroupLimitFree && !userPremium) {
        setShowPremiumAlert(true);
      } else {
        if (publicRoomCount < joinGroupLimitPremium) {
          
          setLoadingStates((prevLoadingStates) => ({
            ...prevLoadingStates,
            [item._id]: true, // assuming item has an id, replace with the unique identifier of your item
          }));
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
              const messageSend =  encryptMessage(item.roomId._id,  `${globalThis.displayName} joined the group.`);
              
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
              
              socket.emit("joinGroup", {
                roomId: item.roomId._id,
                chat_user_id: globalThis.chatUserId,
                contact_name: globalThis.displayName,
                profile_image: globalThis.image,
                isAdmin: 0,
                // eslint-disable-next-line
                membersIds: item.membersId.members.map((m: any) => m.user._id),
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
              MessageHistory(item);
              // setFilteredData((prevData) => {
              //   const newData = [...prevData];
              //
              //   newData[index].shouldJoinPublicGroup = false;
              //   return newData;
              // });
            } catch (err) {
              alert(err);
            }
          } else {
            // throw new Error("Failed to Delete Chat");
          }
        } else {
          // Alert.alert(
          //   t("error"), // The title of the alert
          //   t(
          //     "The_group_join_limit"
          //   ), // The message body
          //   [{ text: t("OK") }] // Button options
          // );
          globalThis.errorMessage =t(
            "The_group_join_limit"
          );
          setErrorAlertModel(true);
        }
      }
    });
    return;
  };

  const OverlappingImages = ({ members, item }: any) => {
    const displayedMembers = members?.slice(0, 4);
    const remainingCount = item?.membersId?.membersCount - 4;
    return (
      <View
        style={{
          height: 40,
          // marginTop: 3,
          //  backgroundColor:"green",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          // marginLeft: 25,
        }}
      >
        {
          // eslint-disable-next-line
          displayedMembers?.map((member: any, index: any) => (
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
          ))
        }
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
              style={{ color: iconTheme().iconColor, fontFamily: font.bold() }}
            >
              +{remainingCount > 99 ? 99 : remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const handleApiCalls = async (chatid: any, username: any, userimage: any) => {
    // setloaderMoedl(true); // Start loader
  
    try {
      // Use Promise.all to wait for all API calls to complete
      await Promise.all([
        getProfileApi(chatid, username, userimage),
        AllPostsListApi(chatid),
        AllChaneelListApi(chatid),
      ]);
      console.log("All API calls completed successfully.");
    } catch (error) {
      console.error("Error in one of the API calls:", error);
      // Alert.alert("Error", "An error occurred while fetching data.");
      globalThis.errorMessage ="An error occurred while fetching data.";
      setErrorAlertModel(true);
    } finally {
      // setloaderMoedl(false); // Stop loader after all API calls are done
    }
  };

  // eslint-disable-next-line
  const getProfileApi = async (chatid: any, username: any, userimage: any) => {
      if(chatid && username && userimage){
      
        dispatch(
          setProfileData({
            Image_text: "",
            sticker_position: "",
            display_name: username,
            profile_image: userimage,
            chat_user_id: chatid,
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
            getapiSuccess(ResponseData, ErrorStr, username, userimage);
          }
        );
      }
    
    
  };

  const getAllPostByuser = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      // setloaderMoedl(false);
      globalThis.errorMessage =ErrorStr;
      setErrorAlertModel(true);
    } else {
     
      dispatch(setStorylist(ResponseData.data));
    }
  };

  const AllPostsListApi = async (chatid: any) => {
    return new Promise((resolve, reject) => {
      dispatch(
        setProfileData({
          Image_text: "",
          sticker_position: "",
          chat_user_id: chatid,
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
        get_by_User_allposts,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          if (ErrorStr) {
            reject(ErrorStr);
          } else {
            getAllPostByuser(ResponseData, ErrorStr);
            resolve(ResponseData);
          }
        }
      );
    });
  };

  const AllChaneelListApi = async (chatid: any) => {
    const urlStr = chatBaseUrl + getChannels + "?userId=" + chatid;
  
    return new Promise((resolve, reject) => {
      axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.data.status === true) {
           
            
            dispatch(setChannelSliceData(response.data.data));
            resolve(response.data.data);
          } else {

            globalThis.errorMessage =response.data.message;
            setErrorAlertModel(true);
            // Alert.alert(response.data.message);
            reject(response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error in AllChaneelListApi:", error);
          reject(error);
        });
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
     
      setLoading(false);
      globalThis.errorMessage =ErrorStr;
      setErrorAlertModel(true);
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
          userProfile:ResponseData?.data?.user?.profile_image
        })
      );

      UpdateProfileImage(
        ResponseData?.data?.user?.chat_user_id,
        ResponseData?.data?.user?.profile_image,
        // eslint-disable-next-line
        (res: any) => {
          // if (res) {
          //   //   console.log("profile image updated");
          // } else {
          //   console.log("can't update profile iamge");
          // }
        }
      );
      handlePresentModalPress();
      setLoading(false);
    }
  };

  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  const handlePresentModalPress = useCallback(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    bottomSheetRef.current?.present(), [];
  });

  function ChannelTabClicked(val) {
    setContactClicked(false);
    setGroupTabClicked(false);
    getChannelInfo((res) => {
      setChannelData(res);

      getGroup(val, "channel");
    });
  }

  const newChattingPress = ({
    profileImage,
    contactName,
    chatId,
    FriendNumber,
  }: // eslint-disable-next-line
  any) => {
    dispatch(
      setMainprovider({
        friendId: chatId,
        userName: contactName,
        userImage: profileImage,
        roomType: "single",
        FriendNumber: FriendNumber,
      })
    );
    dispatch(setyesstart(true));
    dispatch(setnewroomType("single"));
    dispatch(
      setroominfo({
        roomImage: profileImage,
        roomName: contactName,
      })
    );
    dispatch(setisnewBlock(false));
    dispatch(setisnewmMute(true));
    dispatch(setisnewArchiveroom(false));
    navigation.navigate("ChattingScreen", {
      friendId: chatId,
      userName: contactName,
      userImage: profileImage,
      roomType: "single",
      inside: false,
      screenFrom: "Dashboard",
      FriendNumber: FriendNumber,
    });
  };

  let premiumAlertHeading = t("You_have_exceed_the_Limit");
  let premiumAlertSubHeading = groupJoinAlert
    ? t("You_can_Join_Maximum_of_50_Public_Groups_only")
    : t("The_group_join_limit_50");
  let premiumAlertSecondButtonText = "Go To Premium";



  const dataSource = contactTabClicked
    ? friendData
    : GroupTabClicked
    ? filteredData
    : channelFinalData;


    
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <CustomBottomSheetModal
        ref={bottomSheetRef}
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        navigation={navigation}
        newChattingPress={newChattingPress}
        openChannelModal={()=>{
          setChannelTypeModal(true);
        }}
      />
      <LoaderModel visible={loaderModel} />
      <ChannelTypeModal
          visible={isChannelTypeModal}
      isPublicSelected={publicSelected}
          onRequestClose={() => setChannelTypeModal(false)}
          onNextClick={AfterChoosingChannelType}
        />

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
          title={t("search")}
          navState={navigation}
          checked={globalThis.selectTheme}
        />

        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity
              onPress={() => {
                setFilteredData([]);
                navigation.pop();
              }}
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
              top:  chatTop().top
            }}
          ></ImageBackground>
        ) : null}
      </View>
      <View style={styles.chatContainer}>
        <View style={{ paddingBottom: 15 }}>
          <SearchBarSubmit
            search={searchableData}
            value={searchValue}
            clickCross={clearInput}
            placeHolder={t("search")}
            searchsubmit={searchDataSubmit}
          />
        </View>
        {/* {renderIf(
          !searchBarFocus, */}
           <GestureHandlerRootView style={{  }}>
           <PanGestureHandler onGestureEvent={handleSwipe}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          initialNumToRender={10}

          ListHeaderComponent={() => (
            <>
              <View style={styles.searchTabContainer}>
                <TouchableOpacity
                  style={[
                    styles.contactTabContainer,
                    {
                      borderBottomWidth: GroupTabClicked ? 2 : 0,
                      borderBottomColor: GroupTabClicked ? "#000" : "#fff",
                    },
                  ]}
                  onPress={() => {
                    setContactClicked(false);
                    setGroupTabClicked(true);
                    if (searchValue != "") {
                      getGroup(searchValue, "group");
                    } else {
                      getGroup(searchValue, "group");
                    }
                  }}
                >
                  <Text style={[styles.contactTabText,{fontFamily:font.semibold()}]}>{t("Groups")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.contactTabContainer,
                    {
                      borderBottomWidth:
                        !GroupTabClicked && !contactTabClicked ? 2 : 0,
                      borderBottomColor:
                        !GroupTabClicked && !contactTabClicked
                          ? "#000"
                          : "#fff",
                    },
                  ]}
                  onPress={() => {
                    if (searchValue == "") {
                      ChannelTabClicked("");
                    } else {
                      ChannelTabClicked(searchValue);
                      // getGroup(searchValue,"channel")
                    }
                  }}
                >
                  <Text style={[styles.contactTabText,{fontFamily:font.semibold()}]}>{t("channels")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.contactTabContainer,
                    {
                      borderBottomWidth: contactTabClicked ? 2 : 0,
                      borderBottomColor: contactTabClicked ? "#000" : "#fff",
                    },
                  ]}
                  onPress={() => {
                 
                    if (searchValue == "") {
                      GetFriends();
                    } else {
                      const filteredLocalData = friendData.filter(
                        // eslint-disable-next-line
                        (item: any) =>
                          item &&
                          item.contact_name &&
                          item.contact_name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                      );
                     
                      setAllFriendData(filteredLocalData);
                      setFriendData(filteredLocalData);
                    }

                    setGroupTabClicked(false);
                    setContactClicked(true);
                  }}
                >
                  <Text style={[styles.contactTabText,{fontFamily:font.semibold()}]}>{t("contacts")}</Text>
                </TouchableOpacity>
              </View>
              {renderIf(
                seeTrending == true && !contactTabClicked,

                <View
                  style={{
                    backgroundColor: "#F8F8F8",
                    width: "100%",
                    height: 40,
                    flexDirection: "row",
                    marginTop: 10,
                    paddingHorizontal: 5,
                  }}
                >
                  <View
                    style={{
                      width: "50%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontSize: 15,
                        fontFamily: font.semibold(),
                      }}
                    >
                      {t("Trending")}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: "50%",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontFamily: font.semibold(),
                        fontSize: 15,
                      }}
                      onPress={() =>
                        GroupTabClicked
                          ? navigation.navigate("AllPublicGroup", {
                              dataFor: "group",
                            })
                          : navigation.navigate("AllPublicGroup", {
                              dataFor: "channel",
                            })
                      }
                    >
                      {t("Show_All")}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          showsVerticalScrollIndicator={false}
          data={
            contactTabClicked
              ? friendData
              : GroupTabClicked
              ? filteredData
              : channelFinalData
          }
          nestedScrollEnabled={true}
          scrollEnabled={true}
          // eslint-disable-next-line
          renderItem={({ item, index }: any) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.profile1Container,

                {
                  // height: "auto",
                  // maxHeight: DeviceInfo.hasNotch() ? null : windowHeight - 190,
                  marginBottom: index == dataSource.length - 1 ? 500 : 0,
                  // width: windowWidth,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#dbdbdb",
                  paddingVertical: 8,
                  marginTop: contactTabClicked ? 10 : 0,
                  alignItems:"center",
                  width:"100%",
                  justifyContent:"space-between"
                },
              ]}
              onPress={() => {
          
                if (GroupTabClicked) {
                  item.shouldJoinPublicGroup == true
                    ? null
                    : MessageHistory(item);
                } else if (item?.chat_user_id) {
                  handleApiCalls(item.chat_user_id,
                    item.contact_name,
                    item.profile_image)
                }
                else if(item._id || item.channelId){
                  
                  navigation.navigate("ChannelChatting", { channelId: item._id||item.channelId,deepLinking: true })
                }
              }}
              activeOpacity={0.8}
            >
            <Image
              source={{
                uri: contactTabClicked
                  ? item.profile_image
                  : GroupTabClicked
                  ? item?.image || item?.roomImage
                  : item.channelImage || item.image,
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                borderWidth: 0.8,
                borderColor: iconTheme().iconColor,
                // flex:1,
              }}
              resizeMode="cover"
            />

              <View
                style={
                  (styles.nameInviteContainer,
                  {
                
                    paddingLeft: 10,
                    paddingRight: 18,
                    flex:2,
                    // paddingLeft: 10,
                    flexDirection:"row",
                   // alignItems:"center",
                  })
                }
              >
               
              <View style={{flex:1,position:"relative"}}>
                  <View style={{ flexDirection: "row", alignItems: "center",}}>
                  <Text
                    style={[styles.name1conText, { marginRight: 0, fontFamily: font.bold(),fontSize: DeviceInfo.isTablet() ? 18 : 16,
                      lineHeight: DeviceInfo.isTablet() ? 20 : 20, }]}
                    numberOfLines={1}
                  >
                    {contactTabClicked
                      ? item.contact_name
                      : item?.name || item?.roomName || item.channelName}{" "}
                  </Text>
                  {(item?.isExclusive === 1 || item?.isExclusive == true ) && (
                    <ImageBackground
                      source={require("../../Assets/Icons/verified_icon.png")}
                      style={{
                        height: 15,
                        width: 15,
                        alignSelf: "center",
                        justifyContent: "center",
                        marginLeft:5
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
                  {renderIf(
                    contactTabClicked,
                    <Text
                      style={[styles.name1conText, { }]}
                      numberOfLines={1}
                    >
                      {item?.tagline
                        ? item?.tagline
                        : "Hey there, I am using Tokee."}
                    </Text>
                  )}
                  {renderIf(
                    !GroupTabClicked && !contactTabClicked,
                    <Text
                      style={[styles.name1conText, {  }]}
                      numberOfLines={1}
                    >
                     
                      {item?.description
                        ? item?.description 
                        :item?.channelType == "private" ? t("This_is_Private_Channel") : t("This_is_Public_Channel")}
                    </Text>
                  )}
                  {renderIf(
                    item?.roomType == "multiple",
                    <Text
                      style={[styles.name1conText, {  }]}
                      numberOfLines={1}
                    >
                      {item?.bio == null && item?.fromApi == true
                        ? t("this_is_a_public_group")
                        : item?.bio}
                    </Text>
                  )}
                  {renderIf(
                    item?.roomType == "single",
                    <Text
                      style={[styles.name1conText, {  }]}
                      numberOfLines={1}
                    >
                      {item?.tagline == null || item?.tagline == undefined || item?.tagline == "null" || item?.tagline == ""
                        ? "Hey there, I am using Tokee."
                        : item?.tagline}
                    </Text>
                  )}

                  {renderIf(
                    item?.membersId?.members.length > 0 && item.fromApi == true,
                    <OverlappingImages
                      members={item?.membersId?.members}
                      item={item}
                    />
                  )}
                </View>
              </View>
              {renderIf(
                item.shouldJoinPublicGroup == true,
                <View
                  style={{
                    // width: "25%",
                    flex:1,
                    flexDirection: "column",
                    justifyContent: "space-between",
                    marginLeft:"auto",
                    // backgroundColor:"red"
                  }}
                >
                  {loadingStates[item._id] ? (
                    <ActivityIndicator
                      size="small"
                      color={iconTheme().iconColor}
                    />
                  ) : (
                    <TouchableOpacity
                      
                      onPress={() =>
                        GroupTabClicked
                          ? JoinPublicGroup(item)
                          : JoinPublicChannel(item)
                      }
                      style={{
                        width: "100%",
                        // height:40,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: iconTheme().iconColor,
                        padding: 8,
                        // marginTop:3,
                        // marginLeft: 5,

                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontFamily: font.bold(),
                        }}
                      >
                        {t("join")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {item.shouldJoinPublicGroup && (
                    <View
                      style={{
                        // marginBottom: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: font.medium(),
                          fontSize: 12,
                          // flexShrink: 1,
                          flexWrap: "wrap",
                          color: COLORS.black,
                          textAlign:"center",
                          width:"100%",
                        }}
                      >
                        {GroupTabClicked
                          ? item?.membersId?.membersCount == 0
                            ? "1 " + t("member")
                            : item?.membersId?.membersCount == 1
                            ? item?.membersId?.membersCount + " " + t("member")
                            : item?.membersId?.membersCount + " " + t("members")
                          : item.membersCount == 0
                          ? "1 " + t("Subscriber")
                          : item.membersCount == 1
                          ? item.membersCount+1 + " " + t("Subscriber")
                          : item.membersCount+1 + " " + t("subscribers")}
                      </Text>
                    </View>
                  )}
                </View>
              )}


              {renderIf(
                item.shouldJoinPublicGroup == false && item.fromApi == true,

                <View
                  style={{
                    // width: "25%",
                    flex:1,
                    flexDirection: "column",
                    justifyContent: "space-between",
                    marginLeft:"auto",
                    // backgroundColor:"red"
                  }}
                >
                  <View
                      
                     
                      style={{
                        width: "100%",
                        // height:40,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: iconTheme().iconColor,
                        padding: 8,
                        // marginTop:3,
                        // marginLeft: 5,

                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontFamily: font.bold(),
                        }}
                      >
                        {t("open")}
                      </Text>
                    </View>

                    <View
                      style={{
                        // marginBottom: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: font.medium(),
                          fontSize: 12,
                          // flexShrink: 1,
                          flexWrap: "wrap",
                          color: COLORS.black,
                          textAlign:"center",
                          width:"100%",
                        }}
                      >
                        {GroupTabClicked
                          ? item?.membersId?.membersCount == 0
                            ? "1 " + t("member")
                            : item?.membersId?.membersCount == 1
                            ? item?.membersId?.membersCount + " " + t("member")
                            : item?.membersId?.membersCount + " " + t("members")
                          : item.membersCount == 0
                          ? "1 " + t("Subscriber")
                          : item.membersCount == 1
                          ? item.membersCount+1 + " " + t("Subscriber")
                          : item.membersCount+1 + " " + t("subscribers")}
                      </Text>
                    </View>
                </View>
              )}
            </TouchableOpacity>
          )}
        />

</PanGestureHandler>
</GestureHandlerRootView>

        {GroupTabClicked ? (
          <>
            {filteredData.length == 0 && !loaderModel && (
              <View>
                <Text style={{ textAlign: "center", marginTop: 100 }}>
                  {t("no_groups_found")}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {contactTabClicked ? (
              <>
                {friendData.length == 0  && (
                  <View>
                    <Text style={{ textAlign: "center", marginTop: 100 }}>
                      {t("no_contact_found ")}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {channelFinalData.length == 0 && !loaderModel && (
                  <View>
                    <Text style={{ textAlign: "center", marginTop: 100 }}>
                      {t("no_channel_found ")}
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </View>
    </MainComponent>
  );
}
