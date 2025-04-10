import auth from "@react-native-firebase/auth";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SectionList,
  RefreshControl,
  Pressable,
  Share,
} from "react-native";
import {
  COLORS,
  appBarText,
  iconTheme,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import moment from "moment";
import { useTranslation } from "react-i18next";
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import FastImage from "react-native-fast-image";
import Silent from "react-native-silent";
import { useDispatch, useSelector } from "react-redux";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import ConfirmPinModal from "../../Components/chatLockModal/ConfirmPin";
import PinModal from "../../Components/chatLockModal/GeneratePinModal";
import OtpVerificationModal from "../../Components/chatLockModal/OtpVerificationModal";
import UnlockChatPinModal from "../../Components/chatLockModal/UnlockChat";
import renderIf from "../../Components/renderIf";
import Contacts from "react-native-contacts";
import NetInfo from "@react-native-community/netinfo";
import {
  Base_Url,
  Base_Url2,
  addFriends,
  archieveChatApi,
  blockApi,
  channel_Live_Api,
  chatBaseUrl,
  checkIfAllContactsSynced,
  deleteAllContacts,
  deletechatApi,
  exitgroupApi,
  friendrequestlist,
  get_active_story,
  get_by_ChatId,
  get_by_User_allposts,
  get_profile,
  get_story_count,
  get_user_story,
  insertFriend,
  muteChatApi,
  nonTokeeUsers,
  setpin,
  updateToken,
  uploadContacts,
  verify_user_by_phone_number,
} from "../../Constant/Api";
import { EncryptionKey } from "../../Constant/Key";
import {
  bottomIcon,
  bottomTab,
  chatTop,
  noDataImage,
} from "../../Navigation/Icons";
import {
  setMainprovider,
  setchatlistinterval,
  setintervalIds,
  setisLock,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setlastseennew,
  setmyrequestdata,
  setnewroomID,
  setnewroomType,
  setonlinestatus,
  setotherrequestdata,
  setroominfo,
  setyesstart,
} from "../../Redux/ChatHistory";
import { setChatlistmessage } from "../../Redux/ChatList";
import { setTyping } from "../../Redux/rootReducer";
import { socket } from "../../socket";
import PagerView from "react-native-pager-view";

import {
  CheckIsRoomsBlockedforfriendlist,
  UpdateProfileImage,
  addMembersToRoomMembersSql,
  addMembersToRoomMembersSqlnew,
  archiveRoom,
  blockRoom,
  createRoomIfNotExist,
  deleteRoomId,
  deletechatroom,
  getCurrentMemberData,
  getOtherPersonLastMessage,
  getTableData,
  insertChatList,
  insertContact,
  insertContactIOS,
  muteroom,
  newMessageInsertList,
  pinchatroom,
  removeCount,
  updateChatHistory,
  updateRoomUnseenCount,
  updateblockuser,
  updatedeleteforall,
  updateroominfo,
} from "../../sqliteStore";
import { GroupTypeModal } from "../Modals/GroupTypeModal";
import { LoaderModel } from "../Modals/LoaderModel";
import { SetAliasModel } from "../Modals/SetAliasModel";
import { StatusType } from "../Modals/StatusType";
import ChatItem from "./ChatItem";
import { SafeAreaView } from "react-native";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import { setProfileData } from "../../Redux/MessageSlice";
import ToShowContactName from "../calling/components/ContactShow";
import { showToast } from "../../Components/CustomToast/Action";
import { setFriends, setPremium, setStorylist } from "../../reducers/friendListSlice";

import {
  updateAppState,
  updatedmembersall,
} from "../../reducers/getAppStateReducers";
import { AddFriendModal } from "../Modals/AddFriendModel";
import { AddUsereModel } from "../Modals/AddUserModel";
import { ContactLoaderModel } from "../Modals/ContactLoaderModel";
import { pin, setPinCount, unpin } from "../../reducers/pinSlice";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";
const isDarkMode = true;
let isDeviceVerified = false;
let premiumAlertHeading = "";
let premiumAlertSubHeading = "";
let premiumAlertFirstButtonText = "";
let premiumAlertSecondButtonText = "";


// eslint-disable-next-line
export default function ChatScreen({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const { t } = useTranslation();
  const [isGroupTypeModal, setGroupTypeModal] = useState(false);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [userImage, setuserImage] = useState(globalThis.userImage);
  const isNotch = DeviceInfo.hasNotch();
  const [keyBoardMargin, setkeyBoardMargin] = useState(
    isNotch == true ? 50 : 0
  );
  const intervalIds = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.intervalIds
  );
  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );
  const chatlistinterval = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.chatlistinterval
  );
  // eslint-disable-next-line
  const [tableData, setTableData] = useState<any>([]);
  const dispatch = useDispatch();
  const chatListsql = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatListsql.chatmessage
  );
  const PinChat = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.pinSlice?.pinCount
  );


  const [chatModal, setChatModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isUserBlock, setUserBlock] = useState(false);
  const [isChannelView, setIsChannelView] = useState(false);
  const [aboutroom, setAboutroom] = useState({});
  const [mutestatus, setmutestatus] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [aliasModel, setAliasModel] = useState(false);
  const updateChatList = false;
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [unlockPin, setUnlockPin] = useState("");
  const [lockHistory, setLockHistory] = useState({});
  const [chatLockNumber, setChatLockNumber] = useState("");
  const [confirm, setConfirm] = useState();
  const [otp, setOtp] = useState("");
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [contactsInTokee, setTokeeContacts] = useState([]);
  const [isGeneratePinModalVisible, setGeneratePinModalVisible] =
    useState(false);
  const [isConfirmPinModalVisible, setConfirmPinModalVisible] = useState(false);
  const [generatePin, setGeneratePin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [fistHide, setFistHide] = useState(true);
  // eslint-disable-next-line
  const syncloader = useSelector((state: any) => state.chatHistory.syncloader);
  const syncchatlist = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.syncchatlist
  );
  const [showSyncModel, setShowSyncModel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingchat = false;
  // eslint-disable-next-line
  const deleteRoom = useSelector((state: any) => state.chatHistory.deleteRoom);
  // eslint-disable-next-line
  const hideRoom = useSelector((state: any) => state.chatHistory.hideRoom);
  const androidVersion = DeviceInfo.getSystemVersion();
  const [firstarchive, setfirstarchive] = useState(false);
  const [addUserModel, setAddUserModel] = useState(false);
  const [addUserModelphone, setAddUserModelphone] = useState(false);
  const [conatctLoaderModel, setContactLoaderModel] = useState(true);
  const bottomSheetRef = useRef(null); //@ts-ignore
  const handlePresentModalPress = useCallback(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    bottomSheetRef.current?.present(), [];
  });
  const mainprovider = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.mainprovider
  );
  const myrequestdata =  useSelector(
    (state: any) => state.chatHistory.myrequestdata
  )
  const otherrequestdata = useSelector(
      (state: any) => state.chatHistory.otherrequestdata
  )
  const getIsEnabled = () => {
    // eslint-disable-next-line
    Silent.isEnabled().then((value: any) => {});
  };
  const [content, setContent] = useState([]);
  const [getActiveStory, setActiveStory] = useState([]);
  const [isStatusModal, setStatusModal] = useState(false);
  const [publicGroupAsDefault, setPublicGroupDefault] = useState(true);
  const [themecolor, setthemecolor] = useState(themeModule().theme_background);
  // eslint-disable-next-line
  const roominfo = useSelector((state: any) => state.chatHistory.roominfo);
  const [noFriendsView, setNoFriendsView] = useState(false);
  // eslint-disable-next-line
  const [noChatLoader, setNoChatLoader] = useState(false);

  const pagerChatListRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const membersupdated = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.getAppStateReducers?.membersupdated
  );

  React.useEffect(() => {
    getIsEnabled();

    // eslint-disable-next-line
    const listener = Silent.addListener((status: any) => {
      globalThis.silent = status.status;
      globalThis.deviceMode = status;
    });
    () => {
      if (listener) {
        Silent.removeListener(listener);
      }
    };
  }, []);

  const onRefresh = () => {
    getAllFriendsListFromServer();
    setRefreshing(false);
  };

  const onRefreshchat = () => {
    setfirstarchive(!firstarchive);
  };
  useEffect(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (androidVersion > 12 && Platform.OS === "android") {
      askNewPermission();
    } else {
      askPermission();
    }
  }, []);

  //////////////////profile api//////////////////////
  const getUserProfileApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(get_profile, headers, navigation, (ResponseData, ErrorStr) => {
      profileApiSuccess(ResponseData, ErrorStr);
    });
  };

  // eslint-disable-next-line
  const profileApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      dispatch(setPremium(ResponseData?.data?.premium == 1 ? true : false));
      globalThis.isUserPremium =
        ResponseData?.data?.premium == 1 ? true : false;
    }
  };
  //////////////////////////////////////////////////// 

  // eslint-disable-next-line
  const onPageSelected = (event: any) => {
    const position = event?.nativeEvent?.position;

    if (position !== undefined) {
      if (position !== currentPage) {
        setCurrentPage(position);
        setFistHide(position === 0 ? true : false);
      }
    }
  };

  const handler1 = () => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (pagerChatListRef?.current?.setPage && currentPage !== 0) {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      pagerChatListRef.current.setPage(0);
    }
  };

  const handler2 = () => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (pagerChatListRef?.current?.setPage && currentPage !== 1) {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      pagerChatListRef.current.setPage(1);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line
    socket.on("connect_error", (error: any) => {
      socket.connect;
    });
  }, [socket]);

  useEffect(() => {
    setTimeout(() => {
      if (globalThis.fcmtoken) {
        updateDeviceApi();
      }
    }, 1500);
  }, []);

  React.useEffect(() => {
    getTokeeUserList();
  }, []);

  const getTokeeUserList = async () => {
    const storedTokeeContactListTempString = await AsyncStorage.getItem(
      "tokeeContactListTemp"
    );
  };

  const updateDeviceApi = async () => {
    const urlStr = Base_Url + updateToken;
    try {
      axios({
        method: "post",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
          localization: globalThis.selectLanguage,
        },
        data: {
          device_type: Platform.OS,
          device_token: globalThis.fcmtoken,
        },
      })
        .then(() => {
          null;
        })
        .catch(() => {
          null;
        });
    } catch (error) {
      null;
    }
  };

  const askPermission = async () => {
    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (result !== "granted") {
        return;
      }
    }
  };

  const askNewPermission = async () => {
    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );

      if (result !== "granted") {
        return;
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setnewroomID(""));
      dispatch(setProfileData({}));
      if (intervalIds && intervalIds.length > 0) {
        // eslint-disable-next-line
        intervalIds.forEach((intervalId: any) => {
          clearInterval(intervalId);
        });
        dispatch(setintervalIds([]));
      }
    }, [intervalIds])
  );

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setonlinestatus(""));
      dispatch(setyesstart(false));
      clearInterval(chatlistinterval);
      dispatch(setchatlistinterval(null));
      dispatch(setlastseennew(""));
    }, [])
  );

  useEffect(() => {
    getChatLockdata();
  }, []);

  useEffect(() => {
    compareNewUsersWithMyContacts();
  }, []);

  const compareNewUsersWithMyContacts = async () => {
    const myContacts = await AsyncStorage.getItem("newcontacts");
    const myContactsJSON = JSON.parse(
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      myContacts
    );
    const newFriends = [];
    for (let i = 0; i < myContactsJSON.length; i++) {
      const userObject = myContactsJSON[i];
      const status = await isNewUserInMyContacts(userObject);
      if (status != null) {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        newFriends.push(status);
      }
    }
    if (newFriends.length > 0) {
      const data = {
        friends: JSON.stringify(newFriends),
      };
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer " + globalThis.Authtoken,
        localization: globalThis.selectLanguage,
      };

      console.log("yes new friend add")

      PostApiCall(
        addFriends,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          AddFriendApiResponse(ResponseData, ErrorStr);
        }
      );
    }
  };

  // eslint-disable-next-line
  const AddFriendApiResponse = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      setloaderMoedl(false);
    } else {
      await AsyncStorage.removeItem("newcontacts");
      getAllFriendsListFromServer();
    }
  };

  // eslint-disable-next-line
  const isNewUserInMyContacts = async (contact: any) => {
    const countryCode = contact.country_code;
    const PhoneNumber = contact.phone_number;
    let trimPhoneNumber = "";
    if (countryCode) {
      trimPhoneNumber = PhoneNumber.replace(countryCode, "");
    }
    const myContacts = await AsyncStorage.getItem("allcontacts");
    const myContactsJSON = JSON.parse(
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      myContacts
    );

    for (let i = 0; i < myContactsJSON.length; i++) {
      const userObject = myContactsJSON[i];
      if (
        userObject.phone_number == PhoneNumber ||
        userObject.phone_number == trimPhoneNumber
      ) {
        contact.contact_name = userObject.contact_name;
        return contact;
      }
    }

    return null;
  };

  const getChatLockdata = async () => {
    const chatLockPin = JSON.parse(
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      await AsyncStorage.getItem("lockChatPinCode")
    );
    const chatLockusernumber = await AsyncStorage.getItem("chatlockusernumber");
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    setChatLockNumber(chatLockusernumber);
    globalThis.confirmPin = chatLockPin;
  };

  const ArchieveChatApiCalling = async () => {
    const urlStr = chatBaseUrl + archieveChatApi;
    try {
      await axios({
        method: "PATCH",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userId: globalThis.chatUserId,
          roomId: selectedRoomId,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            setChatModal(false);
            setfirstarchive(false);
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            archiveRoom(selectedRoomId, !aboutroom?.archive);
            // eslint-disable-next-line
            getTableData("rooms", (data: any) => {
              setTableData(data);
            });
          } else {
            Alert.alert(response.data.message);
          }
        })
        .catch((error) => {
          Alert.alert(error);
        });
      // eslint-disable-next-line
    } catch (error: any) {
      Alert.alert(error);
    }
  };

  const BlockChatApiCalling = async (opt, aboutroom) => {
    setloaderMoedl(true);
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
          to: aboutroom.friendId,
          opt: opt,
          roomId: aboutroom.roomId,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            socket.emit("blockusers", {
              touser: aboutroom.friendId,
              fromuser: globalThis.chatUserId,
              isBlock: opt == "block",
            });
            blockRoom(selectedRoomId, isUserBlock);
            updateblockuser(
              { fromuser: globalThis.chatUserId, touser: aboutroom.friendId },
              opt == "block" ? "insert" : "remove",
              // eslint-disable-next-line
              ({ status, res }: any) => {
                if (status) {
                  // Room Blocked
                } else {
                  console.log(
                    "while adding entry to block user status is false"
                  );
                }
              }
            );
            // eslint-disable-next-line
            getTableData("rooms", (data: any) => {
              setTableData(data);
            });
          } else {
            Alert.alert(response.data.message);
          }
          setTimeout(() => {
            setloaderMoedl(false);
            setChatModal(false);
          }, 500);
        })
        .catch((error) => {
          setTimeout(() => {
            setloaderMoedl(false);
            setChatModal(false);
          }, 500);
          Alert.alert(error);
        });
      // eslint-disable-next-line
    } catch (error: any) {
      setTimeout(() => {
        setloaderMoedl(false);
        setChatModal(false);
      }, 500);
      Alert.alert(error);
    }
  };

  const mutechatfunct = async () => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + muteChatApi;
    try {
      await axios({
        method: "PATCH",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userId: globalThis.chatUserId,
          roomId: selectedRoomId,
          isNotificationAllowed: !mutestatus,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            muteroom(selectedRoomId, mutestatus);
            showToast(mutestatus ? "Chat muted" : "Chat unmuted");
            // eslint-disable-next-line
            getTableData("rooms", (data: any) => {
              setTableData(data);
            });
          } else {
            Alert.alert(response.data.message);
          }
          setTimeout(() => {
            setloaderMoedl(false);
            setChatModal(false);
          }, 500);
        })
        .catch((error) => {
          setTimeout(() => {
            setloaderMoedl(false);
            setChatModal(false);
          }, 500);
          Alert.alert(error);
        });
      // eslint-disable-next-line
    } catch (error: any) {
      setTimeout(() => {
        setloaderMoedl(false);
        setChatModal(false);
      }, 500);
      Alert.alert(error);
    }
  };

  const deleteChat = async (roomdelete) => {
    setloaderMoedl(true);
    getCurrentMemberData(
      globalThis.chatUserId,
      selectedRoomId,
      async (userData) => {
        setloaderMoedl(true);
        const urlStr = chatBaseUrl + deletechatApi;
        try {
          const response = await axios({
            method: "DELETE",
            url: urlStr,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              userId: globalThis.chatUserId,
              roomId: selectedRoomId,
              isChatListDelete: roomdelete == "Deleteroom" ? true : false,
              fromJoinDate: userData ? userData.joinedOn : Date.now(),
            },
          });

          if (response.data.status === true) {
            await deleteRoomId(selectedRoomId);
            if (roomdelete == "Deleteroom") {
              await deletechatroom(selectedRoomId, 1);
            }
            // eslint-disable-next-line
            getTableData("rooms", (data: any) => {
              setTableData(data);
            });
            // Room successfully deleted from API, now delete it from SQLite
          } else {
            Alert.alert(response.data.message);
          }
          setTimeout(() => {
            setloaderMoedl(false);
            setChatModal(false);
          }, 500);
          // eslint-disable-next-line
        } catch (error: any) {
          setTimeout(() => {
            setloaderMoedl(false);
            setChatModal(false);
          }, 500);
          // Alert.alert(error);
        }
      }
    );
  };
  const mId = Math.floor(Math.random() * 9000) + 1000;
  const exitNotify = (aboutroom) => {
    const finalString = globalThis.displayName + " has left this conversation.";

    const paramsOfSendlive = {
      isNotificationAllowed: true,
      userName: globalThis.phone_number,
      userImage: globalThis.image,
      roomId: aboutroom.roomId,
      roomName: aboutroom?.roomName,
      roomImage: aboutroom?.roomImage,
      roomType: "multiple",
      roomOwnerId: globalThis.userChatId,
      message: CryptoJS.AES.encrypt(finalString, EncryptionKey).toString(),
      message_type: "notify",
      roomMembers: [],
      isForwarded: false,
      attachment: [],
      from: globalThis.userChatId,
      resId: Date.now(),
      status: "",
      parent_message_id: "",
      createdAt: new Date(),
      isDeletedForAll: false,
      mId: mId,
      phoneNumber: Number(globalThis.phone_number.substr(-10)),
      currentUserPhoneNumber: globalThis.phone_number,
      shouldDisappear: 0,
      disappearTime: 0,
    };

    socket.emit("sendmessage", paramsOfSendlive);
  };

  const exitgroupChat = async () => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + exitgroupApi;
    try {
      exitNotify(aboutroom);
      const response = await axios({
        method: "DELETE",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userId: globalThis.chatUserId,
          roomId: selectedRoomId,
        },
      });

      if (response.data.status === true) {
        blockRoom(selectedRoomId, isUserBlock);
        // eslint-disable-next-line
        getTableData("rooms", (data: any) => {
          setTableData(data);
        });
        socket.emit("leaveRoom", {
          roomId: selectedRoomId,
          userId: globalThis.chatUserId,
        });

        socket.emit("updateGroupDetails", {
          new_group_name: roominfo.roomName, // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          new_group_description: userstatus, // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          new_group_allow: currentUserData?.allow, // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          new_group_image: groupImage, // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          remaningMembers: remaningMembers, // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          membersList: chatIds,
          roomId: selectedRoomId, // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          isPublic: currentUserData.isPublic,
        });

        // Room successfully deleted from API, now delete it from SQLite
      } else {
        Alert.alert(response.data.message);
      }
      setTimeout(() => {
        setloaderMoedl(false);
        setChatModal(false);
      }, 500);
      // eslint-disable-next-line
    } catch (error: any) {
      setTimeout(() => {
        setloaderMoedl(false);
        setChatModal(false);
      }, 500);
      Alert.alert(error);
    }
  };

  /////////////////////chat lock unlock//////////////////////
  useEffect(() => {
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        isDeviceVerified = true;
      }
    });
  }, []);

  async function signIn() {
    const number = chatLockNumber;
    try {
      const confirmation = await auth().signInWithPhoneNumber(
        number.toString()
      );
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setConfirm(confirmation);
    } catch (error) {
      console.log("error in signIn :====== ", error);
    }
  }

  const closeModal = () => {
    setPinModalVisible(false);
    setUnlockPin("");
    setOtp("");
    setGeneratePin("");
    setConfirmPin("");
  };

  const close = () => {
    setPinModalVisible(false);
    setOtpModalVisible(false);
    setGeneratePinModalVisible(false);
    setConfirmPinModalVisible(false);
    setUnlockPin("");
    setOtp("");
    setGeneratePin("");
    setConfirmPin("");
  };

  const handleGeneratePinEntered = (generatePin: string[]) => {
    const filteredArray = generatePin.filter((value) => value !== "");
    setGeneratePin(filteredArray.join("")); // Update the pin state
  };

  const handleConfirmPinEntered = (confirmpin: string[]) => {
    const filteredArray = confirmpin.filter((value) => value !== "");
    setConfirmPin(filteredArray.join("")); // Update the pin state
  };

  const generatePinSubmit = () => {
    if (generatePin.length === 4) {
      setGeneratePinModalVisible(false);
      setConfirmPinModalVisible(true);
    } else {
      Alert.alert("Error", "Enter a valid 4-digit PIN.");
    }
  };

  const confirmPinSubmit = async () => {
    if (generatePin == confirmPin) {
      globalThis.confirmPin = confirmPin;
      setPinApi(confirmPin);
      await AsyncStorage.setItem("lockChatPinCode", JSON.stringify(confirmPin));
      getChatLockdata();
      setConfirmPinModalVisible(false);
    } else {
      Alert.alert("Error", "Your pin and confirm pin does not match.");
    }
  };

  // eslint-disable-next-line
  const setPinApi = (chatPin: any) => {
    const url = Base_Url + setpin;
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
          localization: globalThis.selectLanguage,
        },
        data: {
          chat_pin: chatPin,
        },
      })
        .then(() => {
          // if (response.data.status == true) {
          // } else {
          // }
        })
        .catch(() => {
          null;
        });
    } catch (error) {
      null;
    }
  };

  const unlockPinSubmit = () => {
    if (unlockPin == globalThis.confirmPin) {
      setPinModalVisible(false);
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      if (lockHistory.roomId) {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        removeCount(lockHistory.roomId);
      }
      socket.emit("joinRoom", {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        roomId: lockHistory.roomId,
        userId: globalThis.userChatId,
      });
      getOtherPersonLastMessage(
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        lockHistory.roomId,
        globalThis.userChatId,
        (isFound: boolean, lastMessageId: string) => {
          if (isFound) {
            socket.emit("seenCountMark", {
              userId: globalThis.userChatId,
              messageId: lastMessageId,
            });
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            updateRoomUnseenCount(lockHistory.roomId, 0);
          }
        }
      );

      dispatch(
        setMainprovider({
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          userImage: lockHistory.roomImage,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          userName: lockHistory.roomName,
          room: lockHistory,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          roomType: lockHistory.roomType,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          friendId: lockHistory.friendId,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          lastMessageId: lockHistory.lastMessageId,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          isBlock: lockHistory.isUserExitedFromGroup,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          userId: lockHistory.friendId, // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          isLock: lockHistory.isLock,
        })
      );
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      dispatch(setisLock(lockHistory.isLock));
      dispatch(setyesstart(true));
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      dispatch(setnewroomID(lockHistory?.roomId));
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      dispatch(setnewroomType(lockHistory.roomType));
      dispatch(
        setroominfo({
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          roomImage: lockHistory.roomImage,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          roomName: lockHistory.contactName || lockHistory.roomName,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          aliasName: lockHistory.aliasName,
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          aliasImage: lockHistory.aliasImage,
        })
      );
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      dispatch(setisnewBlock(lockHistory.isUserExitedFromGroup));
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      dispatch(setisnewmMute(lockHistory.isNotificationAllowed));
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      dispatch(setisnewArchiveroom(lockHistory.archive));
      dispatch(
        setProfileData({
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          chat_user_id: lockHistory.friendId,
        })
      );
      navigation.navigate("ChattingScreen", {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        userImage: lockHistory.roomImage,

        userName:
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          lockHistory.contactName || typeof lockHistory.roomName == "number"
            ? // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              "+" + lockHistory.roomName
            : // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              lockHistory.roomName,
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        aliasName: lockHistory.aliasName,
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        aliasImage: lockHistory.aliasImage,
        room: lockHistory,
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        roomType: lockHistory.roomType,
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        friendId: lockHistory.friendId,
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        lastMessageId: lockHistory.lastMessageId,
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        isBlock: lockHistory.isUserExitedFromGroup,
        inside: true,
        screenFrom: "chatScreen", // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        isLock: lockHistory.isLock,
      });
      setUnlockPin("");
    } else {
      Alert.alert("Error", "Enter a valid 4-digit PIN.");
    }
  };

  const handleUnlockPinEntered = (unlockpin: string[]) => {
    const filteredArray = unlockpin.filter((value) => value !== "");
    setUnlockPin(filteredArray.join("")); // Update the pin state
  };

  const handleVerifyOtp = (otp: string[]) => {
    const filteredArray = otp.filter((value) => value !== "");
    setOtp(filteredArray.join("")); // Update the pin state
  };

  const forgetPin = () => {
    signIn();
    setPinModalVisible(false);
    setOtpModalVisible(true);
  };
  const verifyOtpSubmit = async () => {
    try {
      if (otp.length === 6) {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        const response = await confirm.confirm(otp);
        if (response.user?.uid) {
          setOtpModalVisible(false);
          setGeneratePinModalVisible(true);
        }
      } else {
        Alert.alert("Error", "Enter a valid 6-digit OTP.");
      }
    } catch (error) {
      if (error.code === "auth/invalid-verification-code") {
        Alert.alert("", "Invalid OTP, Please try again");
      } else if (error.code === "auth/code-expired") {
        Alert.alert("", "OTP has expired, please request a new one");
      } else {
        if (isDeviceVerified == true && Platform.OS == "android") {
          isDeviceVerified = false;
          setOtpModalVisible(false);
          setGeneratePinModalVisible(true);
        } else {
          Alert.alert("Error", "Enter a valid 6-digit OTP.");
        }
      }
    }
  };

  //////////////////////////////////////////////////////////
  // eslint-disable-next-line
  const MessageHistory = (item: any) => {
    // navigation.navigate("DemoChat",{
    //   roomId:item?.roomId
    // })
    // return
    setLockHistory(item);
    if (item.isLock == 1) {
      setPinModalVisible(true);
    } else {
      // return
      if (item.roomId) {
        removeCount(item.roomId);
      }

      getOtherPersonLastMessage(
        item.roomId,
        globalThis.userChatId,
        (isFound, lastMessageId) => {
          if (isFound) {
            socket.emit("seenCountMark", {
              userId: globalThis.userChatId,
              messageId: lastMessageId,
            });

            updateRoomUnseenCount(item.roomId, 0);
          }
        }
      );

      dispatch(
        setMainprovider({
          userImage:
            item.aliasImage ||
            item.roomImage ||
            "https://tokeecorp.com/backend/public/images/user-avatar.png",
          userName: item.roomName,
          room: item,
          roomType: item.roomType,
          friendId: item.friendId,
          lastMessageId: item.lastMessageId,
          isBlock: item.isUserExitedFromGroup,
          userId: item.friendId,
          isLock: item.isLock,
        })
      );

      dispatch(setyesstart(true));
      dispatch(setnewroomID(item?.roomId));
      dispatch(setnewroomType(item.roomType));
      dispatch(
        setroominfo({
          roomImage:
            item.aliasImage ||
            item.roomImage ||
            "https://tokeecorp.com/backend/public/images/user-avatar.png",
          roomName: item.contactName || item.roomName,
          aliasName: item.aliasName,
          aliasImage: item.aliasImage,
        })
      );

      dispatch(setisnewBlock(item.isUserExitedFromGroup));
      dispatch(setisnewmMute(item.isNotificationAllowed));
      dispatch(setisnewArchiveroom(item.archive));
      dispatch(setisLock(item.isLock));
      dispatch(
        setProfileData({
          chat_user_id: item.friendId,
        })
      );
      navigation.navigate("ChattingScreen", {
        userImage:
          item.aliasImage ||
          item.roomImage ||
          "https://tokeecorp.com/backend/public/images/user-avatar.png",
        userName:
          item.contactName || typeof item.roomName == "number"
            ? "+" + item.roomName
            : item.roomName,
        aliasName: item.aliasName,
        aliasImage: item.aliasImage,
        room: item,
        roomType: item.roomType,
        friendId: item.friendId,
        lastMessageId: item.lastMessageId,
        isBlock: item.isUserExitedFromGroup,
        inside: true,
        screenFrom: "chatScreen",
        isLock: item.isLock,
      });
    }
  };

  // eslint-disable-next-line
  function OnChat(roomId: any, item: any) {
    setAboutroom(item);
    setSelectedRoomId(roomId);
    setUserBlock(item.isUserExitedFromGroup == "0" ? false : true);
    setmutestatus(item.isNotificationAllowed == "0" ? false : true);
    setChatModal(true);
  }

  // eslint-disable-next-line
  async function OnChatModalTextClick(value: any, aboutroom?: any) {
    setChatModal(false);

    setChatModal(false);
    if (value == "Cancel") {
      setChatModal(false);
    } else if (value == "Mute") {
      mutechatfunct();
    } else if (value == "Archieve") {
      ArchieveChatApiCalling();
    } else if (value == "Block") {
      socket.emit("leaveRoom", {
        roomId: aboutroom?.roomId,
        userId: globalThis.userChatId,
      });
      BlockChatApiCalling("block", aboutroom);
    } else if (value == "Unblock") {
      socket.emit("joinRoom", {
        roomId: aboutroom?.roomId,
        userId: globalThis.userChatId,
      });
      BlockChatApiCalling("unblock", aboutroom);
    } else if (value == "Delete") {
      removeCount(aboutroom?.roomId);
      deleteChat("Delete");
    } else if (value == "Deleteroom") {
      removeCount(aboutroom?.roomId);
      deleteChat("Deleteroom");
    } else if (value == "Exit") {
      socket.emit("leaveRoom", {
        roomId: aboutroom?.roomId,
        userId: globalThis.userChatId,
      });
      exitgroupChat();
    } else if (value == "pin") {

      //by-dinki
        if (!aboutroom?.ispin) {
          if (userPremium) {
            if (PinChat == 20 || PinChat > 20) {
              premiumAlertHeading = "You can pin a maximum of 20 chats.";
              premiumAlertSubHeading = "You cannot pin any more at this time.";
              premiumAlertFirstButtonText = "Ok";
              premiumAlertSecondButtonText = "Cancel";
              setShowPremiumAlert(true);
           // alert("You cannot pin more chats")
            } else {
              await pinchatroom(selectedRoomId, !aboutroom?.ispin);
            // eslint-disable-next-line
            getTableData("RoomSql", (data: any) => {
              setTableData(data);
              if (aboutroom?.ispin) {
                dispatch(unpin())
              } else {
                dispatch(pin())
              }
              showToast(aboutroom?.ispin ? "Chat unpinned" : "Chat pinned");
            });
            }
          } else {
            if (PinChat == 5 || PinChat > 5) {
              premiumAlertHeading = "You can only pin up to 5 chats.";
              premiumAlertSubHeading = "Upgrade to Premium to increase the limit to 20.";
              premiumAlertFirstButtonText = "Ok";
              premiumAlertSecondButtonText = "Go To Premium";
              setShowPremiumAlert(true);
            //  alert("You cannot pin more chats")
            }else{
      await pinchatroom(selectedRoomId, !aboutroom?.ispin);
            // eslint-disable-next-line
            getTableData("RoomSql", (data: any) => {
              setTableData(data);
              if (aboutroom?.ispin) {
                dispatch(unpin())
              } else {
                dispatch(pin())
              }
              showToast(aboutroom?.ispin ? "Chat unpinned" : "Chat pinned");
            });
            }

          }
        } else {

          await pinchatroom(selectedRoomId, !aboutroom?.ispin);
          // eslint-disable-next-line
          getTableData("RoomSql", (data: any) => {
            setTableData(data);
            if (aboutroom?.ispin) {
              dispatch(unpin())
            } else {
              dispatch(pin())
            }
            showToast(aboutroom?.ispin ? "Chat unpinned" : "Chat pinned");
          });
        }
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      if (globalThis.isNewAccount == true) {
        setNoChatLoader(true);
        setTimeout(() => {
          setNoChatLoader(false);
        }, 8000);
      }
      // eslint-disable-next-line
      getTableData("RoomSql", (data: any) => {
        setTableData(data);
        setIsChannelView(true);
      });
    }, [
      syncchatlist,
      chatListsql,
      syncloader,
      updateChatList,
      aliasModel,
      deleteRoom,
      hideRoom,
    ])
  );

  const getPendinglist = async()=> {
    // setloaderMoedl(true)
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
          // setloaderMoedl(false)
          console.log("response",response)
          if (response.data.status == true) {
            dispatch(setmyrequestdata(response?.data?.data?.my_requests));
            dispatch(setotherrequestdata(response?.data?.data?.otner_request_me));
          }
        })
        .catch((error) => {
            // setloaderMoedl(false)
        });
    } catch (error) {
        // setloaderMoedl(false)
    }
}

  useEffect(() => {
    try {
      // eslint-disable-next-line
      getTableData("RoomSql", (data: any) => {
        const pinnedRoomsCount = data.filter((room) => room.ispin === 1).length;
        dispatch(setPinCount(pinnedRoomsCount));
        // console.log("all roomsss",data)
        // eslint-disable-next-line
        data.map((room: any) => {
          if (room.isUserExitedFromGroup == 0) {
            socket.emit("joinRoom", {
              roomId: room.roomId,

              userId: globalThis.userChatId,
            });
          }
        });
      });
      getPendinglist()
    } catch (error) {
      console.log("error : ", error);
    }
  }, []);


  useEffect(() => {
    // eslint-disable-next-line
    const deletemessssggggggg = async (deleteMessage: any) => {
      const data = deleteMessage.result;
      if (data?.isDeletedForAll) {
        const messageSend = CryptoJS.AES.encrypt(
          "This message was deleted.",
          EncryptionKey
        ).toString();

        updatedeleteforall(messageSend, data?._id);
        updateChatHistory([data]);
        // eslint-disable-next-line
        getTableData("RoomSql", (data: any) => {
          setTableData(data);
        });
      }
    };

    socket.on("deleteMessage", deletemessssggggggg);
    return () => {
      socket.off("deleteMessage", deletemessssggggggg);
    };
  });

  React.useEffect(() => {
    // eslint-disable-next-line
    const handlenewMessageResive = async (data: any) => {
      if (data?.result.isNewRoom) {
        let seenCount = 0;
        if (data.result.fromUser != globalThis.userChatId) {
          seenCount = 1;
        }
        newMessageInsertList(
          data?.result,
          false,
          globalThis.phone_number,
          seenCount,
          () => {
            if (data.isArchived == false) {
              dispatch(setChatlistmessage(data.result));
            }
          }
        );
        const members = [
          // friend
          {
            chat_user_id: data.result.friendId,
            contact_name: data.result.roomName,
            profile_image: data.result.roomImage,
            phone_number: Number(data.result.phoneNumber),
          },
          // me
          {
            chat_user_id: globalThis.userChatId,
            contact_name: globalThis.displayName,
            profile_image: globalThis.image,
            phone_number: Number(globalThis.phone_number),
          },
        ];

        addMembersToRoomMembersSql(members, data.result.roomId);
      } else {
        if (data.result.message_type != "single") {
          newMessageInsertList(
            data?.result,
            true,
            globalThis.phone_number,
            0,
            // eslint-disable-next-line
            (res: any) => {
              dispatch(setChatlistmessage(data.result));
            }
          );
        }

        const indexmessage = tableData.findIndex(
          (item) => item.roomId == data.result.roomId
        );

        if (indexmessage !== -1) {
          const dateinsert = new Date(
            data.result.createdAt || data.result.messageTime
          );
          // Create a shallow copy of the object to update
          const updatedObject = {
            ...tableData[indexmessage], // Spread existing object properties
            messageType: data.result.message_type,
            lastMessageType: data.result.message_type,
            lastMessage: data.result.message,
            lastMessageId: data.result._id,
            lastMessageTime: data.result.resId, // Update with new timestamp
            time: `${dateinsert}`,
            unseenMessageCount: tableData[indexmessage].unseenMessageCount + 1, // Example: increment unseenMessageCount
          };

          // Create a new array with updatedObject replacing the old object
          const updatedTableData = [
            ...tableData.slice(0, indexmessage), // Before the updated object
            updatedObject,
            ...tableData.slice(indexmessage + 1), // After the updated object
          ];

          // Update the state with the new array
          setTableData(updatedTableData);
        }
        createRoomIfNotExist(data.result.roomId, data.result, () => {});
      }
      if (globalThis.userChatId == data.result.fromUser) {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        insertChatList({ paramsOfSend: data?.result, chatRoom: false });
      } else {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        insertChatList({ paramsOfSend: data?.result, chatRoom: false });
      }
    };
    socket.on("newMessageResive", handlenewMessageResive);
    return () => {
      socket.off("newMessageResive", handlenewMessageResive);
    };
  });

  let count = 1;

  useEffect(() => {
    const handleUpdateGroupDetails = (data: {
      new_group_name: string;
      new_group_description: string;
      new_group_allow: string;
      new_group_image: string;
      membersList: string[];
      remaningMembers: object[];
      roomId: string;
      owner: string;
      isPublic: boolean;
    }) => {
      addMembersToRoomMembersSqlnew(data.remaningMembers, data.roomId, () => {
        count = count + 1;
        dispatch(updateAppState({ updatemediauseeeffect: count + 1 }));

        dispatch(updatedmembersall(membersupdated));
      });

      updateroominfo(
        data.new_group_name,
        data.new_group_image,
        data.roomId,
        data.new_group_allow,
        data.owner,
        data.isPublic
      );

      const currentUserIdx = data.remaningMembers.findIndex(
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        (m) => m.chat_user_id == globalThis?.userChatId
      );
      if (currentUserIdx >= 0) {
        dispatch(setisnewBlock(false));
        blockRoom(data.roomId, true);
      } else {
        dispatch(setisnewBlock(true));
        blockRoom(data.roomId, false);
      }

      if (mainprovider && mainprovider.roomId == data.roomId) {
        dispatch(
          setMainprovider({ ...mainprovider, allow: data.new_group_allow })
        );
      }
    };
    socket.on("updateGroupDetails", handleUpdateGroupDetails);
    return () => {
      socket.off("updateGroupDetails", handleUpdateGroupDetails);
    };
  });

  useEffect(() => {
    // eslint-disable-next-line
    const handleTyping = (typingData: any) => {
      if (typingData.result.userId !== globalThis.userChatId) {
        const typingStatus = `${typingData.result.name} is typing...`;
        dispatch(
          setTyping({ roomId: typingData.result.roomId, status: typingStatus })
        );
      }
    };

    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
    };
  }, [dispatch]);

  // eslint-disable-next-line
  const newGroupPress = (value: any) => {
    if (value == "public") {
      navigation.navigate("CreateGroupScreen", { groupType: value });
    } else {
      navigation.navigate("NewGroupScreen", { groupType: value });
    }
  };
  const newBroadCastPress = () => {
    navigation.navigate("NewBroadcastScreen");
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      getStoryApi();
      getActiveStoryApi();
      setPublicGroupDefault(true);

      const userIMAGE = globalThis.userImage;
      const uniqueImageUrl = `${userIMAGE}?${new Date().getTime()}`;
      setuserImage(uniqueImageUrl);
      if (globalThis.appOpned == true) {
        globalThis.appOpned = false;
      }
    });
    return unsubscribe2;
  }, []);

  const getStoryApi = async () => {
    // setloaderMoedl(true);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      get_user_story,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        // setloaderMoedl(false);
        userStoryApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // eslint-disable-next-line
  const userStoryApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      setContent(ResponseData.data);
    }
  };

  // **********   Headers for Get Active Story Api  ********** ///cd
  const getActiveStoryApi = async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    GetApiCall(
      get_active_story,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        getActiveStoryApiSuccess(ResponseData, ErrorStr);
      }
    );
  };

  // **********  Method for return the get profilr api Response   ********** ///
  // eslint-disable-next-line
  const getActiveStoryApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      console.log("ResponseData>>>>",ResponseData);
      
      setActiveStory(ResponseData.data);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setkeyBoardMargin(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setkeyBoardMargin(isNotch == true ? 50 : 0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const clickQrCode = () => {
    setAddUserModel(false)
    navigation.navigate("QrScannerScreen");
  };
  const clickPerson = async () => {
    setAddUserModel(true);
  };

  const clickPersonphone = async () => {
    setAddUserModel(false)
    setAddUserModelphone(true);
  };

  const verify_chat = (phoneNumber: string, phoneCountryCode: string) => {
    if (phoneCountryCode + phoneNumber == globalThis.phone_number) {
      setAddUserModelphone(false);
      showToast("You are already logged in with this Number.");
    } else {
      const data_user = {
        country_code: phoneCountryCode,
        phone_number: phoneNumber,
      };

      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          Alert.alert(
            "No Internet",
            "No Internet, Please check your Internet Connection."
          );

          return;
        } else {
          console.log("verifying")
          PostApiCall(
            verify_user_by_phone_number,
            data_user,
            headers,
            navigation,
            (ResponseData, ErrorStr) => {
              apiSuccessVerify(ResponseData, ErrorStr,data_user);
            }
          );
        }
      });
    }
  };

  const Inviteuser = () => {
    Share.share(shareOptions);
  };

  const apiSuccessVerify = (ResponseData: any, ErrorStr: any,data_user:any) => {

    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [
        { text: t("cancel") },
        { text: t("inviteUser"), onPress: () => Inviteuser() },
      ]);

      setAddUserModelphone(false);
      // Navigate to another screen or handle the error in some way
    } else {

      if(data_user && data_user?.country_code && data_user?.phone_number){
        const url = Base_Url2 + insertFriend;
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
            data: data_user,
          })
            .then((response) => {
              console.log("add friend successfully",response)
            })
            .catch((error) => {
            });
        } catch (error) {
        }
      }
      
      console.log("yesssss",ResponseData)
      setContactLoaderModel(false);
      // Custom logic to execute on success
      const user = ResponseData.data.user;
      const userImage = user.profile_image;
  

      if (userImage !== "") {
        newChattingPress({
          profileImage: user.profile_image,
          contactName: user.first_name,
          chatId: user.chat_user_id,
          FriendNumber: user.phone_number,
        });

        setAddUserModelphone(false);
        setContactLoaderModel(false);
      } else {
        setContactLoaderModel(false);
        setAddUserModelphone(false);
        Alert.alert("User does not exist.");
      }
    }
  };

  // **********    Method for Api call   ********** ///

  const styles = StyleSheet.create({
    contectText: {
      color: COLORS.black,
      paddingTop: 20,
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
      paddingBottom: 10,
      backgroundColor: "white",
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: DeviceInfo.isTablet() ? 20 : 20,
      marginTop: DeviceInfo.isTablet() ? 30 : 15,
      paddingBottom: 5,
    },
    newGroupText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    noDataText: {
      color: iconTheme().iconColor,
      fontSize: FontSize.font,
      fontFamily: font.regular(),
      fontWeight: "600",
    },
    chatTopContainer: {
      paddingBottom: 50,
      zIndex: 1001,
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
      alignSelf: "center",
    },
    ChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
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
      height: DeviceInfo.isTablet() ? 25 : 20,
      width: DeviceInfo.isTablet() ? 25 : 20,
      tintColor: "#fff",
      marginRight: 10,
    },
    newChatText: {
      color: "#fff",
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
    },
    chatContainer: {
      backgroundColor: "#fff",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -40,
      height: windowHeight,
      width: windowWidth,
    },
    chatContainer2: {
      width: windowWidth - 7,
      flexGrow: 1,
      marginBottom:
        Platform.OS == "android" ? (isNotch == true ? 10 : 10) : keyBoardMargin,
      marginTop: Platform.OS == "ios" ? 0 : 35,
      backgroundColor: "#fff",
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },
    NoDataContainer: {
      height: windowHeight - windowHeight / 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    backgroundImageContainer: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      flexDirection: "row",
    },
    image: {
      flex: 1,
      paddingTop: 40,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    text: {
      color: COLORS.white,
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "left",
    },
    text_1: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "right",
      fontFamily: font.bold(),
    },
    flat_main_view: {
      justifyContent: "center",
      backgroundColor: "#fff",
      marginTop: 10,
    },
    flat_view: {
      paddingStart: 10,
    },
    chat_view: {
      // flex: 1,
      //height:100,
      paddingVertical: Platform.OS == "ios" ? 10 : 5,
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#EAEAEA",
      backgroundColor: "#fff",
    },
    chat_heading: {
      color: COLORS.black,
      fontSize: 25,
      fontWeight: "bold",
      fontFamily: font.bold(),
    },
    name_text: {
      color: COLORS.black,
      fontFamily: font.semibold(),
      fontSize: FontSize.font,
    },
    massege_text: {
      color: COLORS.black,
      fontSize: 14,
      fontFamily: font.medium(),
    },
    count: {
      backgroundColor: COLORS.yellow_light,
      width: 20,
      borderRadius: 32,
      textAlign: "center",
      color: COLORS.white,
    },
    dot: {
      backgroundColor: COLORS.yellow,
      width: 10,
      height: 10,
      borderRadius: 35,
      left: 42,
      top: 10,
    },
    chatDetailHeader: {
      height: 70,
      width: "100%",
    },
    headerImageContainer: {
      width: "15%",
      justifyContent: "center",
      height: "100%",
    },
    headerBackgroundImage: {
      height: "100%",
      width: "100%",
    },
    userImage: {
      height: 50,
      width: 50,
      borderRadius: 50,
    },
    userStatusContainer: {
      width: "60%",
      justifyContent: "center",
    },
    HeaderUserName: {
      color: "#fff",
      fontSize: 18,
      fontFamily: font.bold(),
      fontWeight: "700",
    },
    headerThreeDotContainer: {
      width: "15%",
      alignItems: "center",
      justifyContent: "center",
    },
    HeaderUserStatus: {
      color: "#fff",
      fontSize: 15,
      fontFamily: font.bold(),
    },
    headerBackButtonContainer: {
      width: "10%",
      alignItems: "center",
      justifyContent: "center",
    },
    chatMainContainer: {
      backgroundColor: "red",
    },
    fileAttachment: {
      height: 22,
      width: 22,
    },
    stickerMainView: {
      backgroundColor: "#fff",
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
    },
    stickerRowView: {
      flexDirection: "row",
      width: "100%",
      flexWrap: "wrap",
      marginTop: 50,
    },
    stickerView: {
      width: "15%",
      padding: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    stickerBottomTab: {
      position: "absolute",
      height: 40,
      backgroundColor: "#ccffcc",
      bottom: Platform.OS == "android" ? 20 : 80,
      flexDirection: "row",
      overflow: "hidden",
      zIndex: 1,
    },
    keyboardTopButtonView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      top: 10,
      alignSelf: "center",
      width: 60,
    },
    keyboardTopButtonIcon: {
      height: 20,
      width: 20,
    },
    buyButton: {
      position: "absolute",
      right: 20,
      bottom: 0,
      backgroundColor: COLORS.yellow,
      padding: 5,
    },
    plusModalContainer: {
      height: 250,
      width: "100%",
      position: "absolute",
      bottom: 85,
      left: 0,
      right: 0,
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "transparent",
      borderRadius: 10,
    },
    plusModalRowContainer: {
      height: "33%",
      flexDirection: "row",
    },
    plusModalImageTextConatiner: {
      width: "33%",
      alignItems: "center",
      justifyContent: "center",
    },
    plusModalButton: {
      alignItems: "center",
      justifyContent: "center",
    },
    plusModalIcon: {
      height: 35,
      width: 35,
    },
    plusModalText: {
      marginTop: 3,
      fontFamily: font.bold(),
      fontSize: 15,
      fontWeight: "bold",
      color: "#000",
    },
    carouselContainer: {
      height: 180,
      width: "100%",
    },
    chatMainBubble: {
      flexDirection: "row",
      maxWidth: "80%",
      marginTop: 5,
      borderWidth: 1,
      borderColor: "transparent",
      borderRadius: 5,
      padding: 6,
    },
    headerSearchContainer: {
      width: "20%",
      justifyContent: "center",
      alignItems: "center",
    },
    searchBox: {
      flexDirection: "row",
      borderRadius: 5,
      shadowColor: "black",
      backgroundColor: "#fff",
      padding: 0,
      shadowOffset: {
        width: 1,
        height: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 8,
      justifyContent: "center",
    },
    mainContainer: {
      flexDirection: "row",
    },
    imageContainer: {
      width: 50,
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    userProfile: {
      height: 50,
      width: 50,
      borderWidth: 1,
      borderRadius: 25,
      borderColor: "transparent",
    },
    textContainer: {
      width: "65%",
      paddingHorizontal: 10,
    },
    friendName: {
      fontSize: 16,
      color: COLORS.black,
      fontFamily: font.regular(),
      textTransform: "capitalize",
    },
    friendTagline: {
      color: "darkgray",
      marginTop: 5,
      fontSize: 15,
    },
    chatModalContainer: {
      position: "absolute",
      bottom: 70,
      left: 10,
      right: 10,
    },
    chatModalTextContainer: {
      flexDirection: "row",
      height: 40,
      backgroundColor: "#fff",
      marginHorizontal: 10,
      alignItems: "center",
      paddingLeft: 10,
    },
    circleImageLayout: {
      width: 22,
      height: 22,
      tintColor: iconTheme().iconColor,
      marginRight: 10,
    },
    circleImageLayout2: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },

    setImageLayout: {
      width: 20,
      height: 20,
      tintColor: iconTheme().iconColor,
      marginRight: 5,
    },
    reportImageLayout: {
      width: 22,
      height: 22,
      tintColor: "red",
      marginRight: 5,
    },
    checkBoxContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "20%",
    },
    myStatusContainer: {
      alignItems: "center",
      justifyContent: "space-between",
      margin: 0,
      flexDirection: "row",
    },
    Container: {
      justifyContent: "center",
      margin: 5,
      marginLeft: 0,
      paddingHorizontal: 2,
      alignItems: "center",
      width: 80,
    },

    nameInviteContainer: {
      justifyContent: "center",
      margin: 0,
      width: "85%",
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

    profile1Container: {
      // marginTop: 10,
      paddingVertical: Platform.OS == "ios" ? 10 : 5,
      flexDirection: "row",
      // height: 60,
      borderBottomWidth: 1,
      borderBottomColor: "#EAEAEA",
    },

    pressedContainer: {
      //shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.9,
      //shadowRadius: 2,
      // elevation: 5,
    },
    myStory: {
      width: 54,
      height: 54,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: iconTheme().iconColor,
      borderStyle: "solid",
    },
    plusImageContainer: {
      position: "absolute",
      right: 5,
      top: 30,
      backgroundColor: iconTheme().iconColor,
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    plusImage1Layout: {
      width: 15,
      height: 15,
      margin: 2,
    },
    name1Text: {
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
      color: textTheme().textColor,
      paddingLeft: 10,
    },
    naContainer: {
      justifyContent: "center",
      margin: 0,
      width: "70%",
      flexDirection: "column",
    },
    name2Text: {
      fontSize: DeviceInfo.isTablet() ? 18 : 12,
      fontFamily: font.semibold(),
      color: COLORS.grey,
      paddingLeft: 0,
      textAlign: "center",
    },
    recentStatusContainer: {
      alignItems: "center",
      justifyContent: "center",
      margin: 0,
    },
    recentStory: {
      width: 54,
      height: 54,
      borderRadius: 27,
      borderWidth: 2,
      borderColor: iconTheme().iconColor,
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
      borderLeftWidth:0
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
    tabCalls: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 0,
      marginBottom: 10,
      height: 40,
    },
  });

  // eslint-disable-next-line
  function formatTimestamp(timestampStr: any) {
    let utc2 = null;
    const dateForCompare = new Date(timestampStr);
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    utc2 = dateForCompare;
    const timestamp = moment(utc2, "yyyy-mm-dd hh:mm:ss");
    const now = moment();

    // Check if the timestamp is from today
    if (timestamp.isSame(now, "day")) {
      // Format as "hh:mm" if it's from today
      return timestamp.format("hh:mm A");
    } else {
      // Check if the timestamp is from yesterday
      const isYesterday = timestamp.isSame(
        now.clone().subtract(1, "days"),
        "day"
      );

      // Display "yesterday" for timestamps from yesterday
      if (isYesterday) {
        return t("yesterday");
      } else {
        // Calculate the difference in days
        const daysAgo = now.diff(timestamp, "days");
        // Display "X days ago" for timestamps older than yesterday
        return `${daysAgo} ${t("days_ago")}`;
      }
    }
  }

  // ********** My Status Button     ********** ///
  const myStstusButton = () => {
    if (content.length > 0) {
      navigation.navigate("MyStatusScreen");
    } else {
      OnStoryUpload();
      // setStatusModal(true);
    }
  };

  // eslint-disable-next-line
  function StatusTypeSelected(value: any) {
    setStatusModal(false);
    if (value == "text") {
      navigation.navigate("AddTextStatusScreen");
    } else {
      navigation.navigate("AddCameraStoryScreen");
    }
  }
  // eslint-disable-next-line
  const storyView = (userId: any, userImage: any, userName: any) => {
    navigation.navigate("FriendStoryViewScreen", {
      userId: userId,
      userImage: userImage,
      userName: userName,
    });
  };

  // eslint-disable-next-line
  function AfterChoosingGroupType(value: any) {
    setGroupTypeModal(false);
    newGroupPress(value);
  }
  useFocusEffect(
    React.useCallback(() => {
      globalThis.isChatDetailOpen = "no";
      setthemecolor(themeModule().theme_background);
    }, [])
  );

  const DATA = [
    {
      title: t(""),
      data: contactsInTokee,
    },
  ];
  const CHATDATA = [
    {
      title: t(""),
      // eslint-disable-next-line
      data: tableData?.sort((a: any, b: any) => {
        if (a.ispin && !b.ispin) {
          return -1; // Place item with ispin first
        } else if (!a.ispin && b.ispin) {
          return 1; // Place item without ispin first
        } else {
          // Sort by archive status if both have ispin or both don't have ispin
          if (a.archive === 0 && b.archive !== 0) {
            return 1; // Place item with archive data first
          } else if (a.archive !== 0 && b.archive === 0) {
            return -1; // Place item with archive data second
          } else {
            // Sort by timestamp if both have archive or both don't have archive
            return (
              new Date(b.lastMessageTime || b.time).valueOf() -
              new Date(a.lastMessageTime || a.time).valueOf()
            );
          }
        }
      }),
    },
  ];

  ///////     ********    getContactAllList           ********** //////
  // eslint-disable-next-line
  function ContactItem({ item, index }: any) {
//  return;
    return (
      <Pressable
        style={styles.profile1Container}
        onPress={() => {
          setloaderMoedl(true);
          getProfileApi(
            item.chat_user_id,
            item.contact_name,
            item.profile_image
          );
          AllPostsListApi( item.chat_user_id,);
        }}
        onPressOut={() => setloaderMoedl(false)}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: "15%",
          }}
          key={index}
        >
          <Image
            source={
              item.thumbnail
                ? { uri: item.thumbnail }
                : item.profile_image
                ? { uri: item.profile_image }
                : {
                    uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                  }
            }
            style={{
              width: DeviceInfo.isTablet() ? 60 : 50,
              height: DeviceInfo.isTablet() ? 60 : 50,
              borderRadius: DeviceInfo.isTablet() ? 30 : 25,
              borderColor: textTheme().textColor,
              borderWidth: 0.8,
            }}
            resizeMode="cover"
          />
        </View>

        <View style={styles.nameInviteContainer}>
        <View style ={{flexDirection:"row", }}>
          <Text style={styles.name1conText}>{item?.contact_name}</Text>
          { item?.premium == "1"  &&
          <Image
                source={require("../../Assets/Icons/bx_star_dark.png")}
                style={{height:15, width:15,marginTop:2, tintColor:iconTheme().iconColorNew}}
              />
              }
              </View>
  
          {/* {item?.tagline ? ( */}
          <Text style={styles.name2conText} numberOfLines={1}>
          {item?.tagline && item?.tagline !== 'null' && item?.tagline !== ''
            ? item?.tagline
            : 'Hey there, I am using Tokee.'}
        </Text>
        </View>
      </Pressable>
    );
  }
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
  };

  useEffect(() => {
    getContactUploadStatus();
    getChannelApi();
  }, []);

  // Code added By Puru
  const getContactUploadStatus = async () => {
    const storedTokeeContactListTempString = await AsyncStorage.getItem(
      "tokeeContactListTemp"
    );

    if (storedTokeeContactListTempString != null) {
      const storedTokeeContactListTemp = JSON.parse(
        storedTokeeContactListTempString
      );
      getAllFriendsListFromServer();
      if (storedTokeeContactListTemp.length > 0) {
        // CheckIsRoomsBlocked
        CheckIsRoomsBlockedforfriendlist(
          storedTokeeContactListTemp || [],
          (data) => {
            console.log("DTATAATATTATATTA",data);
            
            if (data.length == 0) {
              setNoFriendsView(true);
              handler2();
            } else {
              setNoFriendsView(false);
              handler1();
            }
            setTokeeContacts(data);
            dispatch(setFriends(data));
          }
        );
      } else {
        setNoFriendsView(true);
      }
    } else {
      const isContactUploaded = await AsyncStorage.getItem(
        "isAllContactUploaded"
      );
      handler2();
      if (isContactUploaded) {
        setShowSyncModel(true);
        setTimeout(() => {
          setTimeout(() => {
            checkStatusOfAllContactsSync();
          }, 700);
        }, 700);
      } else {
        requestContactsPermission();
      }
    }
  };

  // Code added By Puru
  function getAllFriendsListFromServer() {
    const tempheaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
    };
    const urlStr = "user/users/get-all-friends?search_srting=";
    GetApiCall(urlStr, tempheaders, navigation, (ResponseData, ErrorStr) => {
      
      apiSuccess(ResponseData, ErrorStr);
    });
  }

  function getAllNonTokeeUsersFromServer() {
    const tempheaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
    };

    GetApiCall(
      nonTokeeUsers,
      tempheaders,
      navigation,
      (ResponseData, ErrorStr) => {
        remainingContactsApiSuccess(ResponseData, ErrorStr);
      }
    );
  }

  const remainingContactsApiSuccess = async (
    // eslint-disable-next-line
    ResponseData: any,
    // eslint-disable-next-line
    ErrorStr: any
  ) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      // eslint-disable-next-line
      let contactListTemp: any = [];
      ResponseData.data.forEach((element) => {
        if (element.is_register == false) {
          contactListTemp.push(element);
        }
      });
      const contactList = JSON.stringify(contactListTemp);
      await AsyncStorage.setItem("contactListTemp", contactList);
      getAllFriendsListFromServer();
    }
  };

  //code by dinki
  const getChannelApi = async () => {
    const lastsynctime = await AsyncStorage.getItem("lastChannelSynctime");
    let urlstr = chatBaseUrl + channel_Live_Api;
    if (lastsynctime != undefined && lastsynctime != null) {
      urlstr = urlstr + "?syncTime=" + lastsynctime;
    }

    

    //  let url =
    //      "https://tokee-chat.betademo.net:8002/api/group/admin/get-message/661e1c4db71dcd286960690e";
    try {
      axios({
        method: "get",
        url: urlstr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
        },
      })
        .then(async (response) => {
          if (response.data.status == true) {
            globalThis.newChannelMsg = response.data.data.length;
            if (response.data.data.length > 0) {
              //  globalThis.newChannelMsg = true;
            }
          }
        })
        .catch(() => {
          null;
        });
    } catch (error) {
      null;
    }
  };

  // Code added by Puru
  function removeAllContactsFromServer() {
    const tempheaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
    };

    const urlStr = deleteAllContacts;
    GetApiCall(urlStr, tempheaders, navigation, (ResponseData, ErrorStr) => {
      // DeleteContactApiSuccess(ResponseData, ErrorStr);
    });
  }

  function checkStatusOfAllContactsSync() {
    const urlStr = Base_Url + checkIfAllContactsSynced;
    try {
      axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
          // localization: globalThis.selectLanguage,
        },
      })
        .then((response) => {
          if (response.data.data.is_all_contect_sync == 1) {
            getAllNonTokeeUsersFromServer();
          } else {
            setTimeout(() => {
              checkStatusOfAllContactsSync();
            }, 3000);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    } catch (error) {
      console.log("error", error);
    }
  }

  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: "Contacts",
          message: "This app would like to view your contacts.",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const uniquePhoneNumbers = new Set();
        Contacts.getAll()
          .then((contacts) => {
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            const contactArr: Array = [];
            contacts.forEach((item) => {
              item.phoneNumbers.forEach((contactPhone) => {
                const phoneNumber = contactPhone.number;
                // Check if the phone number is not in the Set, and if not, add it to the array and the Set
                if (!uniquePhoneNumbers.has(phoneNumber)) {
                  uniquePhoneNumbers.add(phoneNumber);
                  const trimNumber = phoneNumber.toString();
                  const result = trimNumber.replace(/[()\- *#]/g, "");
                  const contactDict = {
                    country_code: "",
                    phone_number: result,
                    contact_name: ToShowContactName(item),
                  };
                  contactArr.push(contactDict);
                }
              });
            });
            insertContact(contactArr);

            const data = {
              user_contacts: JSON.stringify(contactArr),
            };

            setTimeout(() => {
              setShowSyncModel(true);
              setTimeout(() => {
                PostApiCall(
                  uploadContacts,
                  data,
                  headers,
                  navigation,
                  (ResponseData, ErrorStr) => {
                    contactApiResponse(ResponseData, ErrorStr);
                  }
                );
              }, 700);
            }, 700);
          })
          .catch(() => {});
      } else {
        if (Platform.OS === "android") {
          Alert.alert(
            t("tokee_would_like_to_access_your_contact"),
            t("please_enable_contacts_permission"),
            [
              {
                text: "Ok",
              },
            ],
            { cancelable: true }
          );

          return;
        }

        const uniquePhoneNumbers = new Set();
        Contacts.getAll()
          .then(async (contacts) => {
            // eslint-disable-next-line
            var contactArr: any = [];
            contacts.forEach((item) => {
              item.phoneNumbers.forEach((contactPhone) => {
                const phoneNumber = contactPhone.number;
                // Check if the phone number is not in the Set, and if not, add it to the array and the Set
                if (!uniquePhoneNumbers.has(phoneNumber)) {
                  uniquePhoneNumbers.add(phoneNumber);
                  const trimNumber = phoneNumber.toString();
                  const result = trimNumber.replace(/[()\- *#]/g, "");
                  const contactDict = {
                    country_code: "",
                    phone_number: result,
                    contact_name: ToShowContactName(item),
                  };
                  contactArr.push(contactDict);
                }
              });
            });
            insertContactIOS(contactArr);
            const data = {
              user_contacts: JSON.stringify(contactArr),
            };
            await AsyncStorage.setItem(
              "allcontacts",
              JSON.stringify(contactArr)
            );
            setTimeout(() => {
              setShowSyncModel(true);
              setTimeout(() => {
                PostApiCall(
                  uploadContacts,
                  data,
                  headers,
                  navigation,
                  (ResponseData, ErrorStr) => {
                    contactApiResponse(ResponseData, ErrorStr);
                  }
                );
              }, 700);
            }, 700);
          })
          .catch((err) => {
            if (err.message == "denied") {
              Alert.alert(
                t("tokee_would_like_to_access_your_contact"),
                t("please_enable_contacts_permission"),
                [
                  {
                    text: "Ok",
                  },
                ],
                { cancelable: true }
              );
            }
          });
      }
    } catch (error) {
      console.error("Permission error: ", error);
    }
  };

  // eslint-disable-next-line
  const contactApiResponse = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setShowSyncModel(false);
    } else {
      await AsyncStorage.setItem("isAllContactUploaded", "true");
      checkStatusOfAllContactsSync();
    }
  };
  // **********  Method for return the api Response   ********** ///
  // eslint-disable-next-line
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      await AsyncStorage.setItem("isContactUploaded", "true");
      // eslint-disable-next-line
      var tokeeContactListTemp: any = [];
      const contactListTemp = [];
      ResponseData.data.forEach((element) => {
        if (element.is_register == true) {
          tokeeContactListTemp.push(element);
        } else {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          contactListTemp.push(element);
        }
      });
      const myFriendsStr = JSON.stringify(tokeeContactListTemp);
      await AsyncStorage.setItem("tokeeContactListTemp", myFriendsStr);
      CheckIsRoomsBlockedforfriendlist(tokeeContactListTemp, async (data) => {
        setTokeeContacts(data);
      });
      tokeeContactListTemp.map((friend) => {
        UpdateProfileImage(
          friend?.chat_user_id,
          friend?.profile_image,
          // eslint-disable-next-line
          (res: any) => {
            if (res) {
          //    console.log("profile image updated");
            } else {
              console.log("can't update profile iamge");
            }
          }
        );
      });

      //@ts-ignore
      setContactList(contactListTemp);
    
      removeAllContactsFromServer();
      if (tokeeContactListTemp.length > 0) {
        setNoFriendsView(false);
        setShowSyncModel(false);
      
      } else {
        setNoFriendsView(true);
      }
    }
  };

  //**********    Method for Searchable Data from list    ********** ///

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

  //by-dinki
  useEffect(() => {
    getUserProfileApi();
  }, []);

  ///////////////get user details///////////////////////////////

  // eslint-disable-next-line
  const getProfileApi = async (chatid: any, username: any, userimage: any) => {
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
  };

  const AllPostsListApi = async (chatid: any, ) => {
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
        getAllPostByuser(ResponseData, ErrorStr,);
      }
    );
  };

   // eslint-disable-next-line
   const getAllPostByuser = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
    } else {
     console.log("ResponseData>>>>>",ResponseData.data);
     dispatch(setStorylist(ResponseData.data))
    }
     
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
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
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
        })
      );

      UpdateProfileImage(
        ResponseData?.data?.user?.chat_user_id,
        ResponseData?.data?.user?.profile_image,
        // eslint-disable-next-line
        (res: any) => {
          if (res) {
         //   console.log("profile image updated");
          } else {
            console.log("can't update profile iamge");
          }
        }
      );
      handlePresentModalPress();
      setloaderMoedl(false);
    }
  };

  //by-dinki
  function OnStoryUpload() {
    GetApiCall(
      get_story_count,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        countApiSuccess(ResponseData, ErrorStr);
      }
    );
  }

  // eslint-disable-next-line
  const countApiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
    } else {
      if (userPremium) {
        setStatusModal(true);
      } else {
        if (
          ResponseData?.data?.total_stories == 30 ||
          ResponseData?.data?.total_stories > 30
        ) {
          premiumAlertHeading = "You can add a maximum of 30 stories.";
          premiumAlertSubHeading = "Upgrade to Premium for unlimited stories. If you prefer to stay on the FREE plan, we will remove your first story to maintain the 30-story limit.";
          premiumAlertFirstButtonText = "Continue with Free Plan";
          premiumAlertSecondButtonText = "Go To Premium";
          setShowPremiumAlert(true);
         // Alert.alert("Oops!", "You have exceed your stories limit.");
        } else {
          setStatusModal(true);
        }
      }
    }
  };
  //////////////////////////////////////////////////////////////

  const renderEmptyComponent = () => {
    if (noFriendsView) {
      return (
        <View
          style={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={noDataImage().Image}
            style={{ marginTop: -30, height: 100, width: 200 }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: COLORS.black,
              fontSize: 18,
              fontFamily: font.bold(),
            }}
          >
            {t("no_friends_yet")}
          </Text>
        </View>
      );
    }

    if (showSyncModel) {
      return (
        <View
          style={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../../Assets/Image/contactLoad.gif")}
            style={{ marginTop: -100, height: 40, width: 40 }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: COLORS.black,
              fontSize: 18,
              fontFamily: font.bold(),
              marginHorizontal: 10,
            }}
          >
            Since it is your first install, please wait for a moment, we are
            syncing your data with our servers. The wait time may vary depending
            on the amount of data your account has. We will refresh your friend
            list automatically.
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderItem = ({ item, index }) => {
    if (item.lastMessage == null && item.isChatListDelete) {
      return null;
    } else {
      return (
        <View>
          {renderIf(
            firstarchive || item.archive == 0,
            <Pressable onPress={() => MessageHistory(item)}>
              <View
                style={[
                  styles.chat_view,
                  index === tableData.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <View
                  style={{
                    flex: 0.6,
                    justifyContent: "center",
                  }}
                >
                  <FastImage
                    source={{
                      uri:
                        item.aliasImage ||
                        item.roomImage ||
                        "https://tokeecorp.com/backend/public/images/user-avatar.png",
                    }}
                    style={{
                      width: 45,
                      height: 45,
                      borderColor: textTheme().textColor,
                      borderWidth: 0.8,
                      borderRadius: 50,
                      position: "absolute",
                    }}
                  />
                </View>

                <View
                  style={{
                    flex: 1.5,
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{flexDirection:"row"}}>
                  <Text style={styles.name_text} numberOfLines={1}>
                    {item.aliasName
                      ? item.aliasName
                      : item.contactName
                      ? item.contactName
                      : typeof item.roomName == "number"
                      ? "+" + item.roomName
                      : item.roomName}
                  </Text>
                   { item?.premium == "1"  && 
          <Image
                source={require("../../Assets/Icons/bx_star_dark.png")}
                style={{height:15, width:15,marginTop:2, tintColor:iconTheme().iconColorNew}}
              />
              } 
              </View>
                  <View>
                    <ChatItem item={item} />
                  </View>
                </View>
                <View
                  style={{
                    flex: 0.6,
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.grey,
                      fontSize: 12,
                      fontFamily: font.medium(),
                    }}
                  >
                    {formatTimestamp(
                      item.lastMessageTime || new Date(item.time).getTime()
                    )}
                  </Text>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {item.isNotificationAllowed == "0" && (
                      <Image
                        style={{
                          height: 22,
                          width: 22,
                          marginRight: 5,
                          tintColor: appBarText().textColor,
                        }}
                        resizeMode="cover"
                        source={require("../../Assets/Icons/Mute.png")}
                      />
                    )}
                    {renderIf(
                      item.unseenMessageCount > 0,
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          backgroundColor: iconTheme().iconColor,
                          borderRadius: 20,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff" }}>
                          {item.unseenMessageCount > 9
                            ? "9+"
                            : item.unseenMessageCount}
                        </Text>
                      </View>
                    )}
                    {item?.ispin == 1 && (
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{
                            color: iconTheme().iconColor,
                            fontSize: 22,
                            marginBottom: 4,
                            paddingLeft: 2,
                          }}
                        >
                          {item?.ispin && "★"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.5}
                  style={{
                    flex: 0.3,
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    paddingHorizontal: 5,
                  }}
                  onPress={() => OnChat(item.roomId, item)}
                >
                  <View>
                    <Image
                      source={require("../../Assets/Icons/3-dot-icon-0.jpeg")}
                      style={{
                        height: 25,
                        width: 20,
                        tintColor: iconTheme().iconColor,
                      }}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </Pressable>
          )}
        </View>
      );
    }
  };

  const renderNoDataView = () => (
    <View
      style={[
        {
          height: windowHeight - 320,
          flexDirection: "column",
          justifyContent: "flex-start",
        },
      ]}
    >
      <View style={{ justifyContent: "flex-start", alignItems: "center" }}>
        <Image
          source={noDataImage().Image}
          style={styles.HomeNoDataImage}
          resizeMode="contain"
        />

        <Text style={[styles.noDataText, { textAlign: "center" }]}>
          {t("start_a_new_chat")}
        </Text>
        {/* )} */}
      </View>
    </View>
  );

  const renderLoadingView = () => (
    <View
      style={[
        styles.NoDataContainer,
        {
          flexDirection: "column",
          height: windowHeight - 320,
          // alignItems: "center",
          justifyContent: "flex-start",
        },
      ]}
    >
      <Image
        source={require("../../Assets/Image/contactLoad.gif")}
        style={{ height: 40, width: 40 }}
        resizeMode="contain"
      />
      <Text style={[styles.noDataText, { textAlign: "center" }]}>
        {t("please_wait_we_are_syncing")}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: themeModule().theme_background }}
      >
        <CustomBottomSheetModal
          ref={bottomSheetRef}
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          navigation={navigation}
          newChattingPress={newChattingPress}
        />

        <PremiumAlert
          visible={showPremiumAlert}
          onRequestClose={() => setShowPremiumAlert(false)}
          cancel={() => setShowPremiumAlert(false)}
          Heading={premiumAlertHeading}
          SubHeading={premiumAlertSubHeading}
          FirstButton={premiumAlertFirstButtonText}
          SecondButton={premiumAlertSecondButtonText}
          firstButtonClick={()=>setShowPremiumAlert(false)}
          secondButtonClick={()=>navigation.navigate("TokeePremium")}
        />
        <PinModal
          isVisible={isGeneratePinModalVisible}
          onClose={close}
          onPinEntered={handleGeneratePinEntered}
          onSubmit={generatePinSubmit}
        />

        <ConfirmPinModal
          isVisible={isConfirmPinModalVisible}
          onClose={close}
          onPinEntered={handleConfirmPinEntered}
          onSubmit={confirmPinSubmit}
        />

        <UnlockChatPinModal
          isVisible={isPinModalVisible}
          onForgotten={forgetPin}
          onPinEntered={handleUnlockPinEntered}
          onSubmit={unlockPinSubmit}
          closePinModal={closeModal}
        />

        <OtpVerificationModal
          isVisible={isOtpModalVisible}
          onClose={close}
          onPinEntered={handleVerifyOtp}
          VerifyOtp={verifyOtpSubmit}
        />
        <GroupTypeModal
          visible={isGroupTypeModal}
          isPublicSelected={publicGroupAsDefault}
          onRequestClose={() => setGroupTypeModal(false)}
          onNextClick={AfterChoosingGroupType}
        />

        <AddFriendModal
          visible={addUserModel}
          isPublicSelected={publicGroupAsDefault}
          onRequestClose={() => setAddUserModel(false)}
          onNextClick={AfterChoosingGroupType}
          clickQrScanner={clickQrCode}
          navState={navigation}
          clickPersonphone={clickPersonphone}
        />


      <AddUsereModel
        // {...props}
        visible={addUserModelphone}
        onRequestClose={() => setAddUserModelphone(false)}
        cancel={() => setAddUserModelphone(false)}
        verify_chat={verify_chat}
      />

        <StatusType
          visible={isStatusModal}
          onRequestClose={() => setStatusModal(false)}
          onNextClick={StatusTypeSelected}
        />
        <View
          style={{
            position: "relative",
            backgroundColor: themecolor,
          }}
        >
          {Platform.OS == "android" ? (
            <CustomStatusBar
              barStyle={isDarkMode ? "dark-content" : "dark-content"}
              backgroundColor={themecolor}
            />
          ) : null}
          <TopBar
            showTitle={true}
            showGlobe={true}
            title={t("chats")}
            showEdit={true}
            QrScanner={true}
            clickQrScanner={clickQrCode}
            clickPerson={clickPerson}
            globeFunction={() => navigation.navigate("SearchGroup")}
            navState={navigation}
            checked={globalThis.selectTheme}
          />

          <View style={styles.chatTopContainer}>
            <View style={styles.groupContainer}>
              <TouchableOpacity
                onPress={() => setGroupTypeModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.newGroupText}>{t("new_group")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => newBroadCastPress()}
                activeOpacity={0.7}
              >
                <Text style={styles.newGroupText}>{t("new_broadcast")}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* // **********    TopBar   ********** /// */}
          {globalThis.selectTheme === "christmas" ||
          globalThis.selectTheme === "newYear" ||
          globalThis.selectTheme === "newYearTheme" ||
          globalThis.selectTheme === "mongoliaTheme" ||
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
              }}
            ></ImageBackground>
          ) : null}
        </View>

        <View style={styles.chatContainer}>
          <View
            style={{
              marginBottom: 10,
              borderBottomWidth: 1.0,
              borderBottomColor: "#FAF7F7",
            }}
          >
            <ScrollView horizontal={true}>
              <TouchableOpacity
                style={styles.myStatusContainer}
                onPress={() => myStstusButton()}
              >
                <View style={styles.Container}>
                  <View>
                    <View style={styles.myStory}>
                      <Image
                        source={{
                          uri: userImage,
                        }}
                        style={styles.circleImageLayout2}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                  {content.length > 0 ? null : (
                    <View style={styles.plusImageContainer}>
                      <Image
                        source={require("../../Assets/Icons/plus.png")}
                        style={styles.plusImage1Layout}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  {content.length > 0 ? (
                    <Text style={[styles.name2Text]}>{t("yourStatus")}</Text>
                  ) : (
                    <Text style={[styles.name2Text]}>{t("addStatus")}</Text>
                  )}
                </View>
              </TouchableOpacity>
              <View style={{ flexDirection: "row" }}>
                {
                  // eslint-disable-next-line
                  getActiveStory.map((item: any, key) => {
                    return (
                      <TouchableOpacity
                        key={key}
                        style={styles.recentStatusContainer}
                        onPress={() =>
                          storyView(item.id, item.profile_image, item.name)
                        }
                      >
                        <View style={styles.Container}>
                          <View style={styles.recentStory}>
                            {item.thumbnail ? (
                              <Image
                                source={{
                                  uri: item.thumbnail,
                                }}
                                style={styles.circleImageLayout2}
                                resizeMode="cover"
                              />
                            ) : item.profile_image ? (
                              <Image
                                source={{
                                  uri: item.profile_image,
                                }}
                                style={styles.circleImageLayout2}
                                resizeMode="cover"
                              />
                            ) : (
                              <Image
                                source={{
                                  uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                                }}
                                style={styles.circleImageLayout2}
                                resizeMode="cover"
                              />
                            )}
                          </View>

                          <Text style={styles.name2Text} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                }
              </View>
            </ScrollView>
          </View>

          <View style={styles.tabCalls}>
            <TouchableOpacity
              style={styles.allCallContainer}
              onPress={() => {
                handler1(), setFistHide(true);
              }}
              activeOpacity={0.3}
            >
              <Text
                style={[
                  styles.allCallText,
                  {
                    color: fistHide
                      ? iconTheme().iconColorNew
                      : colorTheme
                      ? COLORS.grey
                      : COLORS.grey,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t("friends")}
                {/* {t("chats")} */}
              </Text>
            </TouchableOpacity>

            {/* // **********    View For Show MissedCall Container      ********** /// */}
            <TouchableOpacity
              style={styles.missCallContainer}
              onPress={() => {
                handler2(), setFistHide(false);
              }}
              activeOpacity={0.3}
            >
              <Text
                style={[
                  styles.missCallText,
                  {
                    color: fistHide
                      ? colorTheme
                        ? COLORS.grey
                        : COLORS.grey
                      : iconTheme().iconColorNew,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {/* {t("friends")} */}
                {t("chats")}
              </Text>
            </TouchableOpacity>
          </View>

          <PagerView
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={onPageSelected}
            ref={pagerChatListRef}
            useNext={false}
          >
            <View key="FriendList">
              <LoaderModel
                visible={loaderMoedl}
                onRequestClose={() => setloaderMoedl(false)}
                cancel={() => setloaderMoedl(false)}
              />
              {DATA.length > 0 && (
                <SectionList
                  showsVerticalScrollIndicator={false}
                  sections={DATA}
                  onEndReachedThreshold={0.1}
                  keyExtractor={(item, index) => index.toString() + item}
                  renderItem={({ item }) => {
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    if (item.is_register == true) {
                      return <ContactItem item={item} />;
                    } else {
                      return null;
                    }
                  }}
                  renderSectionFooter={renderEmptyComponent}
                  ListFooterComponent={() => {
                    return <View style={{ height: 250 }}></View>;
                  }}
                  ListHeaderComponent={()=> {
                    return(
                    <Pressable
                      style={[styles.profile1Container,{alignItems:"center"}]}
                      onPress={() => {
                        navigation.navigate("PendingRequest");
                      }}
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
                          justifyContent: 'center', // Center image in the container
                          alignItems: 'center',
                          overflow: 'hidden',
                          padding: 10,
                        }}
                        >
                          <Image
                            source={require("../../Assets/Icons/AddGroup.png")}
                              style={{
                                width: '100%',
                                height: '100%',
                              }}
                            resizeMode="cover"
                          />
                        </View>
                      </View>

                      <View style={[styles.nameInviteContainer,{width:"auto"}]}>
                        <Text style={styles.name1conText}>Pending Requests</Text>
                        {/* <Text style={[styles.name2conText]} numberOfLines={1}>
                          {item?.tagline != "null" &&
                          item?.tagline != "" &&
                          item?.tagline != undefined
                            ? item?.tagline
                            : "Hey there, I am using Tokee."}
                        </Text> */}
                      </View>

                      {otherrequestdata?.length > 0 &&
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          backgroundColor: iconTheme().iconColor,
                          borderRadius: 20,
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft:"auto"
                        }}
                      >
                        <Text style={{ color: "#fff" }}>
                          {otherrequestdata?.length > 9
                            ? "9+"
                            : otherrequestdata?.length}
                        </Text>
                    </View>
                      }
                      
                    </Pressable>
                    )
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                />
              )}
            </View>

            <View key="ChatList" style={{ flex: 1 }}>
              <SectionList
                refreshControl={
                  <RefreshControl
                    refreshing={refreshingchat}
                    onRefresh={onRefreshchat}
                    colors={["#007AFF"]} // Adjust the color as needed
                  />
                }
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString() + item}
                sections={CHATDATA}
                renderItem={renderItem}
                ListFooterComponent={() => <View style={{ height: 300 }} />}
                ListHeaderComponent={() => (
                  <View>
                    {isChannelView == true ? (
                      <Pressable
                        onPress={() => {
                          navigation.navigate("ChannelScreen");
                        }}
                        style={[
                          styles.chat_view,
                          { backgroundColor: COLORS.white },
                        ]}
                      >
                        <View style={{ flex: 0.6 }}>
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              width: 45,
                              backgroundColor: themecolor,
                              borderRadius: 25,
                              height: 45,
                            }}
                          >
                            <Image
                              source={bottomTab().ChatIcon}
                              resizeMode="contain"
                              style={{
                                width: 30,
                                height: 30,
                                tintColor: bottomIcon().tintColor,
                              }}
                            />
                          </View>
                          {/* {globalThis.newChannelMsg == true && (
                            <View
                              style={{
                                height: 12,
                                width: 12,
                                borderRadius: 6,
                                position: "absolute",
                                left: 36,
                                top: 4,
                              }}
                            ></View>
                          )} */}
                        </View>
                        <View style={{ flex: 1.5, justifyContent: "center" }}>
                          <View style={{ flexDirection: "row" }}>
                            <Text
                              style={{
                                color: COLORS.black,
                                fontFamily: font.semibold(),
                                fontSize: FontSize.font,
                              }}
                            >
                              Tokee
                            </Text>
                            <ImageBackground
                              source={require("../../Assets/Icons/verified_icon.png")}
                              style={{
                                height: 15,
                                width: 15,
                                alignSelf: "center",
                                justifyContent: "center",
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
                          </View>
                          <Text
                            style={{
                              fontFamily: font.medium(),
                              fontSize: 15,
                            }}
                            numberOfLines={1}
                          >
                            {t("check_new_update")}
                          </Text>
                        </View>
                        {globalThis.newChannelMsg > 0 ? (
                          <View
                            style={{
                              flex: 0.9,
                              justifyContent: "center",
                              alignItems: "flex-start",
                            }}
                          >
                            <View
                              style={{
                                height: 20,
                                width: 20,
                                marginLeft: 45,
                                backgroundColor: iconTheme().iconColor,
                                borderRadius: 20,
                                marginTop: 10,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ color: "#fff" }}>
                                {globalThis.newChannelMsg}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <View
                            style={{
                              flex: 0.9,
                              justifyContent: "center",
                              alignItems: "flex-start",
                            }}
                          ></View>
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                )}
              />
              {tableData?.length === 0 &&
                isChannelView == true &&
                renderNoDataView()}
              {isChannelView == false && renderLoadingView()}
            </View>
          </PagerView>

          <Modal transparent visible={chatModal} animationType="fade">
            <SetAliasModel
              visible={aliasModel}
              data={{
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                aliasName: aboutroom.aliasName,
                aliasImage:
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  aboutroom.aliasImage ||
                  "https://tokeecorp.com/backend/public/images/user-avatar.png",
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                room: aboutroom.roomId,
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                roomImage: aboutroom.roomImage,
              }}
              onRequestClose={() => {
                setAliasModel(false);
                setChatModal(false);
              }}
              cancel={() => setAliasModel(false)}
            />

            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
              onPress={() => OnChatModalTextClick("Cancel")}
            >
              <View style={styles.chatModalContainer}>
                <TouchableOpacity
                  style={[
                    styles.chatModalTextContainer,
                    {
                      alignItems: "center",
                      borderTopRightRadius: 10,
                      borderTopLeftRadius: 10,
                    },
                  ]}
                  onPress={() => OnChatModalTextClick("pin", aboutroom)}
                >
                  <Text
                    style={{
                      color: iconTheme().iconColor,
                      fontSize: 22,
                      width: 22,
                      marginRight: 10,
                    }}
                  >
                    ★
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: font.semibold(),
                      color: "#000",
                    }}
                  >
                    {
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      aboutroom?.ispin ? t("Unpin") : t("Pin")
                    }
                  </Text>
                </TouchableOpacity>
                {renderIf(
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  aboutroom.roomType == "single" ||
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    (aboutroom.roomType == "multiple" &&
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      aboutroom?.isUserExitedFromGroup != "1"),
                  <TouchableOpacity
                    style={[
                      styles.chatModalTextContainer,
                      {
                        borderColor: "#ccc",
                        borderTopWidth: 1,
                      },
                    ]}
                    onPress={() => OnChatModalTextClick("Mute", aboutroom)}
                  >
                    <Image
                      source={require("../../Assets/Icons/Mute.png")}
                      style={styles.circleImageLayout}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: font.semibold(),
                        color: "#000",
                      }}
                    >
                      {mutestatus == true ? t("muteChat") : t("unmuteChat")}
                    </Text>
                  </TouchableOpacity>
                )}
                {renderIf(
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  aboutroom?.isUserExitedFromGroup != "1",
                  <TouchableOpacity
                    style={[
                      styles.chatModalTextContainer,
                      { borderColor: "#ccc", borderTopWidth: 1 },
                    ]}
                    onPress={() => {
                      OnChatModalTextClick("Archieve", aboutroom);
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/Hide.png")}
                      style={styles.circleImageLayout}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: font.semibold(),
                        color: "#000",
                      }}
                    >
                      {
                        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        aboutroom && aboutroom?.archive
                          ? t("unhideChat")
                          : t("hideChat")
                      }
                    </Text>
                  </TouchableOpacity>
                )}
                {renderIf(
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  aboutroom && aboutroom.roomType == "single",
                  <TouchableOpacity
                    style={[
                      styles.chatModalTextContainer,
                      { borderColor: "#ccc", borderTopWidth: 1 },
                    ]}
                    onPress={() => {
                      setAliasModel(true);
                    }}
                  >
                    <Image
                      source={require("../../Assets/Icons/NotePen.png")}
                      style={styles.circleImageLayout}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: font.semibold(),
                        color: "#000",
                      }}
                    >
                      {t("setAlias")}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.chatModalTextContainer,
                    {
                      borderColor: "#ccc",
                      borderTopWidth: 1,
                    },
                  ]}
                  onPress={() => {
                    Alert.alert(
                      t("delete_chat_contents"),
                      t("are_you_sure_you_want_to_detele_chats"),
                      [
                        { text: t("cancel") },
                        {
                          text: t("ok"),
                          onPress: () => {
                            OnChatModalTextClick("Delete", aboutroom);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Image
                    source={require("../../Assets/Icons/Delete.png")}
                    style={styles.circleImageLayout}
                    resizeMode="contain"
                  />

                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: font.semibold(),
                      color: "#000",
                    }}
                  >
                    {t("delete_chat_contents")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chatModalTextContainer,
                    {
                      borderColor: "#ccc",
                      borderTopWidth: 1,

                      borderBottomRightRadius:
                        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        aboutroom?.roomType === "single" ? 0 : 10,

                      borderBottomLeftRadius:
                        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        aboutroom?.roomType === "single" ? 0 : 10,
                    },
                  ]}
                  onPress={() => {
                    Alert.alert(
                      t("delete_chatroom"),
                      t("are_you_sure_you_want_to_detele_chatroom"),
                      [
                        { text: t("cancel") },
                        {
                          text: t("ok"),
                          onPress: () => {
                            OnChatModalTextClick("Deleteroom", aboutroom);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Image
                    source={require("../../Assets/Icons/Delete.png")}
                    style={styles.circleImageLayout}
                    resizeMode="contain"
                  />

                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: font.semibold(),
                      color: "#000",
                    }}
                  >
                    {t("delete_chatroom")}
                  </Text>
                </TouchableOpacity>
                {/* )} */}

                {renderIf(
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  aboutroom?.roomType !== "multiple" &&
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    aboutroom.roomType != "broadcast",
                  <TouchableOpacity
                    style={[
                      styles.chatModalTextContainer,
                      {
                        borderColor: "#ccc",
                        borderTopWidth: 1,
                        borderBottomRightRadius: 10,
                        borderBottomLeftRadius: 10,
                      },
                    ]}
                    onPress={() =>
                      OnChatModalTextClick(
                        isUserBlock == true ? "Unblock" : "Block",
                        aboutroom
                      )
                    }
                  >
                    <Image
                      source={require("../../Assets/Icons/Block.png")}
                      style={styles.circleImageLayout}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: font.semibold(),
                        color: "#000",
                      }}
                    >
                      {isUserBlock == true ? t("unblockUser") : t("blockChat")}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => OnChatModalTextClick("Cancel")}
                  style={[
                    styles.chatModalTextContainer,
                    {
                      backgroundColor: iconTheme().iconColor,
                      marginTop: 15,
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      height: 45,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: COLORS.white,
                      fontFamily: font.bold(),
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {t("cancel")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </SafeAreaView>
    </View>
  );
}
