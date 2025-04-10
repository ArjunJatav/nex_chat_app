import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  Text,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import "../../Assets/Language/i18n";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { appBarText, textTheme } from "../../Components/Colors/Colors";
import {
  Base_Url,
  alldataapiV3,
  chatBaseUrl,
  check_force_update,
  getBadWordsApi,
  getSingleChat,
  getTwilioSettings,
  newChannelApi,
  newChannelChatSyncApi,
  newRoomChatSyncApi,
  newRoomSyncApi,
  uploadContacts,
} from "../../Constant/Api";
import { splashBackgroundImage } from "../../Navigation/Icons";
import {
  addColumnIfNotExists,
  backupChatData,
  clearChatRooms,
  createTableUser,
  getOtherPersonLastMessage,
  getTableDataByRoomId,
  getUnseenMessageCount,
  insertChannelInfo,
  insertChannelMessage,
  insertContact,
  insertContactIOS,
  insertDataFromCSVToTable,
  insertDataIntoTables,
  insertRoomSql,
  insertRoomSql3,
  removeCount,
  updateRoomUnseenCount,
  updateUnseenMessageCount,
} from "../../sqliteStore";
import Contacts from "react-native-contacts";
import { font } from "../../Components/Fonts/Font";
import BackgroundTimer from "react-native-background-timer";
import RNFetchBlob from "rn-fetch-blob";
import ToShowContactName from "../calling/components/ContactShow";
import RNFS from "react-native-fs";
import { unzip } from "react-native-zip-archive";
import messaging from "@react-native-firebase/messaging";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import {
  setisLock,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setMainprovider,
  setnewroomID,
  setnewroomType,
  setroominfo,
  setsyncchatlist,
  setyesstart,
} from "../../Redux/ChatHistory";
import { setProfileData } from "../../Redux/MessageSlice";
import notifee, { EventType } from "@notifee/react-native";
import _BackgroundTimer from "react-native-background-timer";
import renderIf from "../../Components/renderIf";
import { NoInternetModal } from "../Modals/NoInternetModel";
import { Mixpanel } from "mixpanel-react-native";
import appsFlyer from "react-native-appsflyer";
let isContactUploadRequired = false;
let route = "BottomBar";
let pushRoomId: any = "";
let setRoomId: any = "";
let setChannelId: any = "";
// eslint-disable-next-line
var isPagePush = false;
export default function SplashScreen({ navigation }: any) {
  // eslint-disable-next-line
  const [currentLanguage, setLanguage] = useState("");
  const { t, i18n } = useTranslation();
  const [showSyncModel, setShowSyncModel] = useState(false);
  const [syncModelMessage, setSyncModelMessage] = useState("Please wait ...");
  const [lockHistory, setLockHistory] = useState({});
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const syncchatlist = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.syncchatlist
  );
  const [noInternetModel, setNoInternetModel] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    Navigation();
    GetTwilioStatus();
  }, []);

  // useEffect(() => {
  /////////       AppFlyer Event Tracker    //////
  const appFlyerInstilization = async (
    APPS_FLYER_DEV_KEY,
    APPS_FLYER_APP_ID
  ) => {
    const options = {
      devKey: APPS_FLYER_DEV_KEY,
      isDebug: true, // Optional: Enables debug logs
      appId: APPS_FLYER_APP_ID, // Required for iOS
    };

    // Set customer unique ID
    // appsFlyer.setCustomerUserId(globalThis.chatUserId);
    //   mixpanel.getPeople().set("$name", ResponseData.data.user.first_name);

    appsFlyer.initSdk(
      options,
      (result) => {
        appsFlyer.getAppsFlyerUID((installId) => {
          console.log("Install ID:", installId); // Should log the Install ID
        });
      },
      (error) => {
        console.error("AppsFlyer SDK initialization error:", error);
      }
    );
  };

  const Navigation = async () => {
    const isLocalpathAdded = await AsyncStorage.getItem("localpath");
    const token = await AsyncStorage.getItem("authToken");
    const userImage = await AsyncStorage.getItem("userImage");
    const userName = await AsyncStorage.getItem("userName");
    const chatUserID = await AsyncStorage.getItem("chatUserID");
    const phone_number = await AsyncStorage.getItem("phone_number");
    const themeUse = await AsyncStorage.getItem("selectTheme");
    const selectlanguage = await AsyncStorage.getItem("selectLanguage");
    const chatFontsize = await AsyncStorage.getItem("chatFontsize");
    const selectFontStyle = await AsyncStorage.getItem("selectFontStyle");
    const allmediavalue = await AsyncStorage.getItem("allMediaDownload");
    const stealthModeValue = await AsyncStorage.getItem("stealthMode");
    const FriendMatchPopup = await AsyncStorage.getItem("FriendMatchPopup");
    const isExploreValue = await AsyncStorage.getItem("explorePage");
   
    globalThis.ExplorePageValue = isExploreValue;
    if (selectFontStyle == null) {
      AsyncStorage.setItem("fontStyleSet", "Simple");
    }
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (allmediavalue == true || allmediavalue == "true") {
      globalThis.allMediaDownload = true;
    } else {
      globalThis.allMediaDownload = false;
    }
    if (FriendMatchPopup == "yes") {
      globalThis.DonotshowPopup = true;
    } else {
      globalThis.DonotshowPopup = false;
    }
    globalThis.Authtoken = token;
    globalThis.token = token;
    globalThis.chatUserId = chatUserID;
    globalThis.phone_number = phone_number;
    globalThis.userChatId = chatUserID;
    globalThis.userImage = userImage;
    globalThis.userName = userName;
    globalThis.displayName = userName;
    globalThis.chatFontsize = chatFontsize == null ? 16 : Number(chatFontsize);
    globalThis.image = userImage;
    globalThis.selectTheme = themeUse == null ? "first" : themeUse;
    globalThis.stealthModeValue =
      stealthModeValue == null || undefined ? "false" : stealthModeValue;
 

    globalThis.checkBoxPressed =
      selectFontStyle == null ? "Simple" : selectFontStyle;
    if (selectlanguage != undefined) {
      changeLanguage(selectlanguage);
      globalThis.selectLanguage = selectlanguage;
    } else {
      changeLanguage("en");
      globalThis.selectLanguage = "en";
    }

    const isSyncStarted = await AsyncStorage.getItem("isSyncStarted");
   

    //  const isSyncStarted = true;

    if (isSyncStarted) {
      const synctype = await AsyncStorage.getItem("synctype");
      isContactUploadRequired = true;
      setTimeout(() => {
        setShowSyncModel(true);
        setSyncModelMessage(t("please_wait_we_are_syncing_your_chat_data"));
       
        if (synctype == "skip") {
          setTimeout(() => {
            dropChatTablesonSyncSkipped();
          }, 1500);
        } else {
          // from restore
          syncfunction();
        }
      }, 1500);
    } else {
      if (token != undefined) {
        if (isLocalpathAdded == null || isLocalpathAdded == undefined) {
          addColumnIfNotExists(
            "Chatmessages",
            "localPath",
            "VARCHAR",
            "[]",
            () => {}
          );

          AsyncStorage.setItem("localpath", "yes");
        }
        //isTableAltered
        // console.log("yessssssssss");
        checkForceUpdate();
      } else {
        navigation.navigate("Login");
      }
    }
  };

  const syncSingleData = async (roomId) => {
    try {
      // Retrieve last synchronization time from AsyncStorage
      let lastSyncTime = await AsyncStorage.getItem("lastsynctime");

      // Check if lastSyncTime and userChatId are available
      if (lastSyncTime && globalThis.userChatId) {
        // Construct API URL
        const apiSync = `${chatBaseUrl}/api${getSingleChat}${roomId}?lastSync=${lastSyncTime}&userId=${globalThis.userChatId}`;
        await syncDataModule(apiSync, apiSync.split("=").pop() + "s");
      }
    } catch (error) {
      console.error("Error in syncSingleData:", error);
    }
  };

  const MessageHistoryForAppOpen = (item: any) => {
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
      dispatch(setnewroomID(item?.roomId));
      dispatch(setisnewBlock(item.isUserExitedFromGroup));
      dispatch(setisnewmMute(item.isNotificationAllowed));
      dispatch(setisnewArchiveroom(item.archive));
      dispatch(setisLock(item.isLock));
      dispatch(
        setProfileData({
          chat_user_id: item.friendId,
        })
      );
      if (isPagePush == false) {
        isPagePush = true;
        setTimeout(() => {
          isPagePush = false;
        }, 5000);

        setTimeout(() => {
          navigation.push("ChattingScreen", {
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
            screenFrom: "push",
            isLock: item.isLock,
            isUserPremium: item.premium,
          });
        }, 100);
      }
    }
  };

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
      dispatch(setnewroomID(item?.roomId));
      dispatch(setisnewBlock(item.isUserExitedFromGroup));
      dispatch(setisnewmMute(item.isNotificationAllowed));
      dispatch(setisnewArchiveroom(item.archive));
      dispatch(setisLock(item.isLock));
      dispatch(
        setProfileData({
          chat_user_id: item.friendId,
        })
      );
      if (isPagePush == false) {
        isPagePush = true;
        setTimeout(() => {
          isPagePush = false;
        }, 10000);

        setTimeout(() => {
          navigation.push("ChattingScreen", {
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
            screenFrom: "push",
            isLock: item.isLock,
            isUserPremium: item.premium,
          });
        }, 9000);
      }
    }
  };

  const MessageHistoryForground = (item: any) => {
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
      dispatch(setnewroomID(item?.roomId));
      dispatch(setisnewBlock(item.isUserExitedFromGroup));
      dispatch(setisnewmMute(item.isNotificationAllowed));
      dispatch(setisnewArchiveroom(item.archive));
      dispatch(setisLock(item.isLock));
      dispatch(
        setProfileData({
          chat_user_id: item.friendId,
        })
      );
      if (isPagePush == false) {
        isPagePush = true;
        setTimeout(() => {
          isPagePush = false;
        }, 5000);

        navigation.push("ChattingScreen", {
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
          screenFrom: "push",
          isLock: item.isLock,
          isUserPremium: item.premium,
        });
      }
    }
  };

  const syncfunction = () => {
    dropChatTablesonSyncRestarted();
    // setShowSyncModel(true);
    // setSyncModelMessage("Syncing chat data ...");
    // if(shouldbackup){
    //   createTableUser()
    // }

    // setTimeout(() => {
    //   syncData(globalThis.userChatId,shouldbackup,chatbackupurl,mediabackupurl);
    // }, 1000);
  };

  ///////////////////////////push notification click code///////////////////////////////

  messaging()
    .getInitialNotification()
    .then(async (remoteMessage) => {
      if (remoteMessage?.data?.roomId) {
        syncSingleData(remoteMessage?.data?.roomId);
        route = "ChattingScreen";
        pushRoomId = remoteMessage?.data?.roomId || "";
        //syncSingleData(remoteMessage?.data?.roomId);
      } else if (remoteMessage?.data?.notification_type == "calls") {
        // navigation.navigate("CallScreen");
        route = "CallScreen";
      } else if (remoteMessage?.notification?.title == "Friend Request") {
        // navigation.navigate("PendingRequest");
        route = "PendingRequest";
      } else if (
        remoteMessage?.notification?.title == "Rejected Friend Request"
      ) {
        route = "PendingRequest";
      }
    });

  let isBackgroundRegistered = false;

  useEffect(() => {
    registerBackgroundListener();
  }, []);

  function registerBackgroundListener() {
    if (!isBackgroundRegistered) {
      messaging().onNotificationOpenedApp((remoteMessage) => {
        // if(navigationRef?.current?.navigate != null){
        if (remoteMessage?.data?.roomId) {
          getTableDataByRoomId(remoteMessage?.data?.roomId, (data: any) => {
            MessageHistoryForground(data[0]);
          });
        } else if (remoteMessage?.data?.notification_type == "calls") {
          navigation.navigate("CallScreen");
        } else if (remoteMessage?.notification?.title == "Friend Request") {
          navigation.navigate("PendingRequest");
        } else if (
          remoteMessage?.notification?.title == "Rejected Friend Request"
        ) {
          navigation.navigate("PendingRequest");
        }
      });
      isBackgroundRegistered = true;
    }
  }

  let isForegroungRegistered = false;

  useEffect(() => {
    registerForegroundListener();
  }, []);

  function registerForegroundListener() {
    if (!isForegroungRegistered) {
      notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          if (detail?.notification?.data?.data?.roomId) {
            getTableDataByRoomId(
               // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              detail?.notification?.data?.data?.roomId,
              (data: any) => {
                //  MessageHistory(data[0]);
                MessageHistoryForAppOpen(data[0]);
              }
            );
          } else if (detail?.notification?.data?.notification_type == "calls") {
            route = "CallScreen";
            navigation.navigate("CallScreen");
          } else if (
             // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            detail?.notification?.data?.notification?.title == "Friend Request"
          ) {
            route = "PendingRequest";
            navigation.navigate("PendingRequest");
          } else if (
             // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            detail?.notification?.data?.notification?.title ==
            "Rejected Friend Request"
          ) {
            route = "PendingRequest";
            navigation.navigate("PendingRequest");
          } else if (
             // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            detail?.notification?.data?.notification?.title ==
            "Accepted Friend Request"
          ) {
            route = "PendingRequest";
            navigation.navigate("PendingRequest");
          }
        }
      });
    }
    isForegroungRegistered = true;
  }

  //////////////////////////////////////////////////////////////////////////////////////

  // const backupChatData = async () => {
  //   try {
  //     // Replace this with actual code to backup your chat data
  //     // const data = await fetchChatData(); // Fetch data from old table
  //     // await AsyncStorage.setItem("chatBackup", JSON.stringify(data)); // Store backup
  //   } catch (error) {
  //     console.error("Failed to backup chat data:", error);
  //   }
  // };

  const tables = [
    "rooms",
    "table_user",
    "allUsers",
    "wokiibotchat",
    "roombackground",
    "RoomSql",
    "RoomMembers",
    "Chatmessages",
    "PendingMessages",
    "ContactTable",
    "blockusers",
  ];

  // useEffect(()=> {
  //   backupChatData(tables, async(dataBackup) => {
  //     // Handle the backed-up data
  //     console.log('Backed-up data:', dataBackup);
  //     await clearChatRooms(); // Step 2: Drop old table(s)
  //     setSyncModelMessage("Syncing data modules ...");
  //     setTimeout(() => {
  //       reCreateChatTables(dataBackup);
  //     }, 700);
  //   });
  // },[])

  const dropChatTablesonSyncRestarted = async () => {
    await AsyncStorage.setItem("isSyncStarted", "yes");
    await clearChatRooms();
    setSyncModelMessage("Syncing data modules ...");
    setTimeout(() => {
      reCreateChatTablesonSyncRestart();
    }, 700);
  };

  const dropChatTablesonSyncSkipped = async () => {
    await AsyncStorage.setItem("isSyncStarted", "yes");
    await clearChatRooms();
    setSyncModelMessage("Syncing data modules ...");
    setTimeout(() => {
      reCreateChatTablesonSyncSkip();
    }, 700);
  };

  const reCreateChatTablesonSyncSkip = async () => {
    await createTableUser();
    setSyncModelMessage("Syncing chat data ...");
    const chatbackupurl = await AsyncStorage.getItem("chat_backup_url");
    const mediabackupurl = await AsyncStorage.getItem("chat_media_backup_url");
    //call Sync Api for last 3 months data
    syncData(globalThis.userChatId, false, chatbackupurl, mediabackupurl);
    // syncData(globalThis.userChatId);
  };

  const dropChatTables = async () => {
    await AsyncStorage.setItem("isSyncStarted", "yes");
    await backupChatData(tables, async (dataBackup) => {
   
      await clearChatRooms(); // Step 2: Drop old table(s)
      setSyncModelMessage("Syncing data modules ...");
      setTimeout(() => {
        reCreateChatTables(dataBackup);
      }, 700);
    });
  };

  const reCreateChatTablesonSyncRestart = async () => {
    await createTableUser();
    setSyncModelMessage("Syncing chat data ...");
    const chatbackupurl = await AsyncStorage.getItem("chat_backup_url");
    const mediabackupurl = await AsyncStorage.getItem("chat_media_backup_url");
    // calling from restore
    syncData(globalThis.userChatId, true, chatbackupurl, mediabackupurl);
  };

  const reCreateChatTables = async (dataBackup) => {
    await createTableUser();
    setSyncModelMessage("Syncing chat data ...");
    setTimeout(() => {

      insertDataIntoTables(dataBackup);
      setShowSyncModel(false);
      setTimeout(async () => {
        {
          await AsyncStorage.removeItem("isSyncStarted");
          await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
          globalThis.Authtoken != undefined
            ? navigation.reset({
                index: 0,
                routes: [
                  {
                    name: route,
                  },
                ],
              })
            : navigation.navigate("Login");
        }
      }, 2000);
      // // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      // syncData(globalThis.userChatId);
    }, 700);
  };

  function proceedWithContactPermissioSelected() {
    setShowSyncModel(false);
    setContactPermissionDenied(true);
  }

  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: t("tokee_would_like_to_access_your_contact"),
          message: t("this_permission_is_requried_for_app_to_funcation_well "),
          buttonPositive: "Ok",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const uniquePhoneNumbers = new Set();
        // setLoading(true);
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
            insertContact(contactArr);
            const data = {
              user_contacts: JSON.stringify(contactArr),
            };
            await AsyncStorage.setItem(
              "allcontacts",
              JSON.stringify(contactArr)
            );
            syncContacts(data);
          })

          .catch((e) => {
            console.log("", e);
            // setLoading(false);
          });
      } else {
        if (Platform.OS === "android") {
          Alert.alert(
            t("contact_permission_denied "),
            t("this_permission_is_requried_for_app_to_funcation_well "),
            [
              {
                text: t("no"),
                onPress: () => proceedWithContactPermissioSelected(),
              },
              { text: t("yes"), onPress: () => byPassContactPermission() },
            ]
          );

          return;
        }
        //setLoading(true);
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
            syncContacts(data);
          })
          .catch((err) => {
            if (err.message == "denied") {
              Alert.alert(
                t("contact_permission_denied "),
                t("this_permission_is_requried_for_app_to_funcation_well "),
                [
                  {
                    text: t("no"),
                    onPress: () => proceedWithContactPermissioSelected(),
                  },
                  { text: t("yes"), onPress: () => byPassContactPermission() },
                ]
              );
            }
            //  setShowSyncModel(false);
          });
      }
    } catch (error) {
      //setLoading(false);
      setShowSyncModel(false);
      if (error.message == "denied") {
        Alert.alert(
          t("contact_permission_denied "),
          t("this_permission_is_requried_for_app_to_funcation_well "),
          [
            {
              text: t("no"),
              onPress: () => proceedWithContactPermissioSelected(),
            },
            { text: t("yes"), onPress: () => byPassContactPermission() },
          ]
        );
      }
    }
  };

  const byPassContactPermission = async () => {
    setShowSyncModel(false);
    setTimeout(async () => {
      await AsyncStorage.removeItem("isSyncStarted");
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "AfterLogin",
          },
        ],
      });
    }, 1000);
  };

  // eslint-disable-next-line
  const syncContacts = async (data: any) => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    PostApiCall(
      uploadContacts,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        contactApiResponse(ResponseData, ErrorStr);
      }
    );
  };

  const contactApiResponse = async () => {
    setShowSyncModel(false);
    setTimeout(async () => {
      {
        await AsyncStorage.setItem("isAllContactUploaded", "true");
        await AsyncStorage.removeItem("isSyncStarted");
        globalThis.Authtoken != undefined
          ? navigation.reset({
              index: 0,
              routes: [
                {
                  name: route,
                },
              ],
            })
          : navigation.navigate("Login");
      }
    }, 2000);
  };

  const syncDataModule = (api, type) => {
    return new Promise((resolve, reject) => {
      axios({
        method: "get",
        // url: `https://tokee-chat.betademo.net/api/group/v1/sync?userId=${globalThis.userChatId}`,
        url: api,
        headers: {
          "Content-Type": "application/json",
          api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
        },
      })
        .then(async (response) => {
     

          if (response.data.status === true) {
            const res = {};
            res[type] = response?.data?.data || [];
  

            if (type === "rooms") {
               // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              globalThis.isNewAccount = res.rooms.length === 0;

              // If there are rooms, handle their data
               // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              if (res.rooms.length > 0) {
                const roomIdsSet = new Set();
 // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                res.rooms.forEach((room) => {
                  // Exclude rooms where type !== "single" and isRemoved === true
                  if (room.type !== "single" && room.isRemoved === true) {
                    return; // Skip this room
                  }

                  // Collect unique room IDs
                  roomIdsSet.add(room.roomId);
                });

                // Generate a comma-separated string of room IDs
                const roomIdsString = Array.from(roomIdsSet).join(",");
                setRoomId = roomIdsString || "";
              }
            } else if (type == "channels" && response?.data?.data?.length > 0) {

              const channelIds = response.data.data

                .map((channel) => channel.channelId)
                .join(",");

              setChannelId = channelIds || "";

              // Track successful insertions
              let successfulInserts = 0;

              response.data.data.forEach((channel) => {
                const dateObject = new Date(channel?.lastMessage?.createdAt);
                const unixTimestampInMillis = dateObject.getTime();
                let channelLinkToSend =
                  "https://tokeecorp.com/backend/public/deepLink-forward?type=channel&id=" +
                  channel?._id;

               

                const paramsOfSend = {
                  ownerId: channel?.owner || "",
                  channelName: channel?.name || "Unnamed Channel",
                  channelDescription: channel?.description || "",
                  image: channel?.image || "default_image_url_here", // Provide a default URL or value
                  type: channel?.isPublic ? "public" : "private",
                  link: channelLinkToSend || "",
                  subs: (channel?.membersCount || 0) + 1,
                  notifiAllow: channel?.isNotificationAllowed ?? 1, // Default to 1 if undefined
                  channelId: channel?.channelId || "",
                  lastMessage: channel?.lastMessage?.message || "",
                  lastMessageId: channel?.lastMessage?._id || "",
                  lastMessageType: channel?.lastMessage?.messageType || "text", // Assume "text" as default
                  lastMessageTime: unixTimestampInMillis || 0,
                  time:
                    channel?.lastMessage?.createdAt || new Date().toISOString(),
                  isExclusive: channel?.isExclusive || 0,
                  isPaid: channel?.isPaid || 0,
                  isHide: channel?.isHide || 0,
                };

                insertChannelInfo(paramsOfSend, (success) => {
                  if (success) {
                    console.log(
                      `Channel ${channel.name} inserted successfully.`
                    );
                    successfulInserts++;

                    // If all channels are successfully inserted, call the API

                    BackgroundTimer.setTimeout(() => {
                      console.log("Starting channel sync...");

                      axios
                        .get(`${chatBaseUrl}${newChannelChatSyncApi}`, {
                          params: {
                            userId: globalThis.userChatId,
                            channelIds: setChannelId,
                          },
                          headers: {
                            "Content-Type": "application/json",
                            api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
                          },
                        })
                        .then((response) => {
                          if (response.data.status) {

                            response.data.data.forEach((res) => {
                              const obj = {
                                lastMessageId: res._id,
                                localPath: [],
                                attachment: res.attachment,
                                channelId: res.channelId,
                                fromUser: res.from._id,
                                userName: res.from.name,
                                currentUserPhoneNumber: res.from.phone_number,
                                message: res.message,
                                parent_message: {},
                                isForwarded: res.isForwarded,
                                createdAt: res.createdAt,
                                updatedAt: res.updatedAt,
                                lastMessageType: res.message_type,
                                reactions: res.reactions?.reactions || [],
                                isDeletedForAll: res?.isDeletedForAll,
                              };

                              insertChannelMessage(obj, (success) => {
                                console.log(
                                  "Channel message insert success:",
                                  success
                                );
                              });
                            });
                          } else {
                            console.warn(
                              "Channel sync response status is false"
                            );
                          }
                        })
                        .catch((err) => {
                          console.error(
                            "Error syncing channel data:",
                            err.response || err.message || err
                          );
                        });
                    }, 1000); // Staggering timeouts to avoid race conditions
                  } else {
                    console.error(`Failed to insert channel ${channel.name}.`);
                  }
                });
              });
            }

            // Insert room data into the database
            insertRoomSql3(res, globalThis.userChatId, async (status) => {
              if (status == true) {
                await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);

                if (type === "rooms") {
                  BackgroundTimer.setTimeout(() => {

                    axios
                      .get(`${chatBaseUrl}${newRoomChatSyncApi}`, {
                        params: {
                          userId: globalThis.userChatId,
                          roomIds: setRoomId,
                        },
                        headers: {
                          "Content-Type": "application/json",
                          api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
                        },
                      })
                      .then((syncResponse) => {
                        if (syncResponse.data.status) {
                          const ress = { chats: syncResponse.data.data || [] };

                          insertRoomSql3(
                            ress,
                            globalThis.userChatId,
                            async (status) => {
                              if (status) {
                                
                                await AsyncStorage.setItem(
                                  "lastsynctime",
                                  `${Date.now()}`
                                ).catch((err) =>
                                  console.error(
                                    "Error saving sync time to AsyncStorage:",
                                    err
                                  )
                                );
                              }
                            }
                          );
                        } else {
                          console.warn("Room sync response status is false");
                        }
                      })
                      .catch((err) => {
                        console.error(
                          "Error syncing room IDs:",
                          err.response || err.message || err
                        );
                      });
                  }, 500);
                }

                BackgroundTimer.setTimeout(() => {
                  axios({
                    method: "get",
                    url: `${chatBaseUrl}/api/user/rooms/last-message/${globalThis.userChatId}`,
                    headers: {
                      "Content-Type": "application/json",
                      api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
                    },
                  })
                    .then((response) => {
                      if (response.data.status) {
                        response?.data.data?.map(async (room) => {
                          getUnseenMessageCount(
                            room.roomId,
                            room.message_time,
                            (unseenMessageCount) => {
                              updateUnseenMessageCount(
                                room.roomId,
                                unseenMessageCount,
                                () => {
                                  dispatch(setsyncchatlist(!syncchatlist));
                                }
                              );
                            }
                          );
                        });
                      }
                    })
                    .catch((err) => {
                      console.log("errror: ", err);
                    });
                }, 200);
              }
            });

            resolve(response.data);
          } else {
            reject(response.data);
          }
        })
        .catch((error) => {
          reject(new Error(error).message);
        });
    });
  };

  const syncDataModule2 = (api: string, type: string) => {
    return new Promise((resolve, reject) => {
      axios({
        method: "get",
        url: api,
        headers: {
          "Content-Type": "application/json",
          api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
        },
      })
        .then(async (response) => {
          if (response.data.status == true) {
            const res = {};
            res[type] = response?.data?.data;
            if (type == "rooms" && response?.data?.data?.length == 0) {
              globalThis.isNewAccount = true;
            } else if (type == "rooms" && response?.data?.data?.length > 0) {
              globalThis.isNewAccount = false;
            } else if (type == "channels" && response?.data?.data?.length > 0) {
              response.data.data.forEach((channel) => {
                //const itsTime = new Date(Number(channel.lastMessage.createdAt))
                const dateObject = new Date(channel?.lastMessage?.createdAt);
                const unixTimestampInMillis = dateObject.getTime();
                let channelLinkToSend =
                  "https://tokeecorp.com/backend/public/deepLink-forward?type=channel&id=" +
                  channel?._id;

               

                const paramsOfSend = {
                  ownerId: channel?.owner,
                  channelName: channel?.name,
                  channelDescription: channel?.description,
                  image: channel?.image,
                  type: channel?.isPublic ? "public" : "private", // Assuming type can be derived from isPublic
                  link: channelLinkToSend, // Add link if available
                  subs: channel?.membersCount + 1,
                  notifiAllow: channel?.isNotificationAllowed, // Default or based on other conditions
                  channelId: channel?._id,
                  lastMessage: channel?.lastMessage?.message,
                  lastMessageId: channel?.lastMessage?._id,
                  lastMessageType: channel?.lastMessage?.messageType,
                  lastMessageTime: unixTimestampInMillis,
                  //  createdAt:unixTimestampInSeconds,
                  time: channel?.lastMessage?.createdAt, // Or any other relevant time
                  isExclusive: channel.isExclusive,
                  isPaid: channel?.isPaid,
                  isHide: channel?.isHide,
                };

              

                insertChannelInfo(paramsOfSend, (success) => {
                  if (success) {
                    console.log(
                      `Channel ${channel.name} inserted successfully.`
                    );
                  } else {
                    console.error(`Failed to insert channel ${channel.name}.`);
                  }
                });
              });
            } else if (
          
              type == "channel-chats" && response.data.data.length > 0
            ) {
              response.data.data.forEach((res) => {
                let obj = {
                  lastMessageId: res._id,
                  localPath: [],
                  attachment: res.attachment,
                  channelId: res.channelId,
                  fromUser: res.from._id,
                  userName: res.from.name,
                  currentUserPhoneNumber: res.from.phone_number,
                  message: res.message,
                  parent_message: {},
                  isForwarded: res.isForwarded,
                  createdAt: res.createdAt,
                  updatedAt: res.updatedAt,
                  lastMessageType: res.message_type,
                  reactions: res.reactions?.reactions || [],
                  isDeletedForAll: res?.isDeletedForAll,
                };

                insertChannelMessage(obj, (success) => {});
              });
            }

            // else {
            insertRoomSql(res, globalThis.userChatId, async (status) => {
              if (status == true) {
                await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
                BackgroundTimer.setTimeout(() => {
                  axios({
                    method: "get",
                    url: `${chatBaseUrl}/api/user/rooms/last-message/${globalThis.userChatId}`,
                    headers: {
                      "Content-Type": "application/json",
                      api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
                    },
                  })
                    .then((response) => {
                      if (response.data.status) {
                        response?.data.data?.map(async (room) => {
                          getUnseenMessageCount(
                            room.roomId,
                            room.message_time,
                            (unseenMessageCount) => {
                              updateUnseenMessageCount(
                                room.roomId,
                                unseenMessageCount,
                                () => {
                                  dispatch(setsyncchatlist(!syncchatlist));
                                }
                              );
                            }
                          );
                        });
                      }
                    })
                    .catch((err) => {
                      console.log("errror: ", err);
                    });
                }, 200);
              }
            });
            // }
            // insertRoomSql(res, globalThis.userChatId)

            resolve(response.data);
          } else {
            reject(response.data);
          }
        })
        .catch((error) => {
          reject(new Error(error).message);
        });
    });
  };

  const downloadAndProcessCSV = async (url, fileName) => {
    const tempDir = RNFS.DocumentDirectoryPath;
    const filePath = `${tempDir}/${fileName}`;
    if (fileName == "chatMessages.csv") {
      try {
        // Download the file
        const response = await RNFetchBlob.config({
          fileCache: true,
          appendExt: "csv",
        }).fetch("GET", url);

        if (response.info().status === 200) {
          // Save downloaded file to temporary directory
          await RNFS.writeFile(filePath, response.data);
          // Read the CSV data from the file
          const csvData = await RNFS.readFile(response.data, "utf8");

          // Split the CSV data into rows
          const rows = csvData.split("\n"); // Handle both Unix and Windows line endings
          // Process CSV data (example: insert into database)
          insertDataFromCSVToTable(rows, async (result) => {
            await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
          });

          // Cleanup: Delete the downloaded file
          await RNFS.unlink(filePath);
        } else {
          throw new Error(
            `Failed to download file. Status code: ${response.info().status}`
          );
        }
      } catch (error) {
        console.error("Error handling file:", error);
        throw error;
      }
    }
    if (fileName == "TokeeMedia") {
      try {
        // Download the file
        const response = await RNFetchBlob.config({
          fileCache: true,
          appendExt: "zip",
        }).fetch("GET", url);

        if (response.info().status === 200) {
          try {
            const unzipResult = unzip(response.data, filePath);
            // Handle success or error
            if (await unzipResult) {
              // Handle unzipped files in targetPath
            } else {
              console.log("Unzip failed!");
            }
          } catch (errr) {
            console.log("Unzip failed!", errr);
          }
        } else {
          throw new Error(
            `Failed to download file. Status code: ${response.info().status}`
          );
        }
      } catch (error) {
        console.error("Error handling file:", error);
        throw error;
      }
    }
  };

  const downloadAndProcessFiles = async (chatUrl, mediaUrl) => {
    try {
      // Download and process chat file
      if (chatUrl) {
        await downloadAndProcessCSV(chatUrl, `chatMessages.csv`);
      }

      // Download and process media file (if mediaUrl is provided)
      if (mediaUrl) {
        await downloadAndProcessCSV(mediaUrl, `TokeeMedia`);
      }
    } catch (error) {
      console.error("Error downloading and processing files:", error);
    }
  };

  const syncData = async (
    USERID: any,
    shouldbackup: any,
    chatbackupurl,
    mediabackupurl
  ) => {
    if (shouldbackup) {
      await downloadAndProcessFiles(chatbackupurl, mediabackupurl);
    }

    const backuparray = [
      `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&requestFor=room`,
      `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&requestFor=block`,
    ];

    const withoutbackuparray = [
      `${chatBaseUrl}${newRoomSyncApi}${globalThis.userChatId}&requestFor=room`,
      `${chatBaseUrl}${newChannelApi}${globalThis.userChatId}&requestFor=channel`,
      `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&requestFor=block`,
    ];

    const apis = shouldbackup ? backuparray : withoutbackuparray;

    {
      shouldbackup
        ? Promise.all(
            apis.map((a) => syncDataModule2(a, a.split("=").pop() + "s"))
          )
            .then(async () => {
              if (isContactUploadRequired == true) {
                await requestContactsPermission();
              } else {
                setShowSyncModel(false);
              }
            })
            .catch((err) => {
              console.log(">>>error>>>", err);
            })
        : Promise.all(
            apis.map((a) => syncDataModule(a, a.split("=").pop() + "s"))
          )
            .then(async () => {
              if (isContactUploadRequired == true) {
                await requestContactsPermission();
              } else {
                setShowSyncModel(false);
              }
            })
            .catch((err) => {
              console.log(">>>error>>>", err);
            });
    }
  };


  const getBadWordsApiCalling = async ()=>{
    const urlStr = Base_Url + getBadWordsApi;

    try {
      await axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then(async (response) => {
          if (response.data.status == true) {
//console.log("BAD WORDS >>",response.data.data.words)
const badWordsInString =  JSON.stringify(response.data.data.words)
try {
  await AsyncStorage.setItem("BadWords",badWordsInString);
} catch (error) {
  console.log("error in set bad words",error)
}
            
          }
        })
        .catch((error) => {
          console.log("", error);
        });
    } catch (error) {
      console.log("", error);
    }
  }
  const GetTwilioStatus = async () => {
    const token = await AsyncStorage.getItem("authToken");
    const mixpanelToken = globalThis.mixpanelToken;

    // if (!token && mixpanelToken == undefined ) {

    const urlStr = Base_Url + getTwilioSettings;

    try {
      await axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then((response) => {
          if (response.data.status == true) {

            globalThis.mixpanelToken = response.data.data.mixpanel_project_key;
            // Set up an instance of Mixpanel
            const trackAutomaticEvents = false;
            const mixpanel = new Mixpanel(
              `${response.data.data.mixpanel_project_key}`,
              trackAutomaticEvents
            );
            mixpanel.init();

            appFlyerInstilization(
              response.data.data.apps_flyer_dev_key,
              response.data.data.apps_flyer_app_id
            );

            globalThis.isTwilioEnabled = response.data.data.is_twilio_enabled;
            globalThis.isTwilioService_id =
              response.data.data.twilio_services_id;
            globalThis.isTwillioLookupEnabled =
              response.data.data.twilio_enabled_phone_lookup;
            const token =
              response.data.data.twilio_account_sid +
              ":" +
              response.data.data.twilio_auth_token;
            globalThis.isTwilioAuthToken = RNFetchBlob.base64.encode(token);
            getBadWordsApiCalling()
          }
        })
        .catch((error) => {
          console.log("", error);
        });
    } catch (error) {
      console.log("", error);
    }
    // }
  };

  const checkForceUpdate = () => {
    // ********** InterNet Permission    ********** ///
    const data = {
      platform: Platform.OS == "android" ? "android" : "ios",
      app_version: DeviceInfo.getVersion(),
    };
    // **********   Headers for api ********** ///
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        setNoInternetModel(true);
        // Alert.alert(t("noInternet"), t("please_check_internet"));
        return;
      } else {
        PostApiCall(
          check_force_update,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  // eslint-disable-next-line
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      if (ErrorStr == t("sessionExpired")) {
        Alert.alert("", ErrorStr, [
          {
            text: "Ok",
            onPress: () => {
              globalThis.Authtoken = undefined;
              UserLoggedOut();
              navigation.navigate("Login");
            },
          },
        ]);
      } else if (ErrorStr == t("serverError")) {
        Alert.alert("", t("serverError"), [
          {
            text: "Ok",
            onPress: () => {},
          },
        ]);
      } else {
        navigation.navigate("ForceUpdateScreen",{ResponseData:ErrorStr,})
        // Alert.alert("Update Available!", ErrorStr, [
        //   {
        //     text: "Ok",
        //     onPress: () => {
        //       appStore();
        //     },
        //   },
        // ]);
      }
      // Navigate to another screen or handle the error in some way
    } else {
      if (ResponseData.status == true) {
        if (ResponseData.data.is_logoout == 1) {
          setTimeout(() => {
            setShowSyncModel(true);
            setSyncModelMessage(t("please_wait_we_are_syncing_your_chat_data"));
            setTimeout(() => {
              dropChatTables();
            }, 700);
          }, 700);
        } else {
          setTimeout(() => {
            if (route == "ChattingScreen") {
              // syncSingleData(pushRoomId);
              getTableDataByRoomId(pushRoomId, (data: any) => {
                MessageHistory(data[0]);
              });
            } else {
              globalThis.Authtoken != undefined
                ? navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: route,
                      },
                    ],
                  })
                : navigation.navigate("Login");
            }
          }, 3000);
        }
      } else {
        setTimeout(() => {
          if (route == "ChattingScreen") {
            // syncSingleData(pushRoomId);
            getTableDataByRoomId(pushRoomId, (data: any) => {
              MessageHistory(data[0]);
            });
          } else {
            globalThis.Authtoken != undefined
              ? navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: route,
                    },
                  ],
                })
              : navigation.navigate("Login");
          }
        }, 3000);
      }
    }
  };
  const UserLoggedOut = async () => {
    globalThis.Authtoken = undefined;
    globalThis.chatUserId = undefined;
    globalThis.userImage = undefined;
    globalThis.userName = undefined;
    globalThis.Authtoken = undefined;
    globalThis.token = undefined;
    globalThis.chatUserId = undefined;
    globalThis.userChatId = undefined;
    globalThis.userImage = undefined;
    globalThis.image = undefined;
    globalThis.userName = undefined;
    globalThis.displayName = undefined;
    globalThis.phone_number = undefined;
    globalThis.sender_id = undefined;

    //isSyncStarted
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userImage");
    await AsyncStorage.removeItem("userName");
    await AsyncStorage.removeItem("chatUserID");
    //  await AsyncStorage.removeItem("isContactUploaded");
    await AsyncStorage.removeItem("phone_number");
    await AsyncStorage.removeItem("lockChatPinCode");
    await AsyncStorage.removeItem("chatlockusernumber");
  };

  const appStore = () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
        return;
      } else {
        Platform.OS === "ios"
          ? Linking.canOpenURL(
              "https://apps.apple.com/fj/app/tokee-messenger/id1641356322"
            ).then((supported) => {
              if (supported) {
                Linking.openURL(
                  "https://apps.apple.com/fj/app/tokee-messenger/id1641356322"
                );
              }
            })
          : Linking.canOpenURL(
              "https://play.google.com/store/apps/details?id=com.deucetek.tokee"
            ).then((supported) => {
              if (supported) {
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.deucetek.tokee"
                );
              }
            });
      }
    });
  };

  // eslint-disable-next-line
  const changeLanguage = async (selectlanguage: any) => {
    await AsyncStorage.setItem("selectLanguage", selectlanguage);
    i18n
      .changeLanguage(selectlanguage)
      .then(() => setLanguage(selectlanguage))
      .catch((err) => console.log(err));
  };

  const [contactPermissionDenied, setContactPermissionDenied] = useState(false);

  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <NoInternetModal
        visible={noInternetModel}
        onRequestClose={() => setNoInternetModel(false)}
        headingTaxt={t("noInternet")}
        NoInternetText={t("please_check_internet")}
        cancelButton={() => setNoInternetModel(false)}
      />
      <ImageBackground
        source={splashBackgroundImage().splash}
        resizeMode="cover"
        style={{
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {renderIf(
          contactPermissionDenied == true,
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginTop: -60,
            }}
          >
            <Text
              style={{
                marginTop: 0,
                fontSize: DeviceInfo.isTablet() == true ? 32 : 24,
                fontWeight: "900",
                color: appBarText().signUpText,
                fontFamily: font.semibold(),
              }}
            >
              {t("contact_permission_denied ")}
            </Text>
            <Text
              style={{
                marginTop: 0,
                fontSize: DeviceInfo.isTablet() == true ? 32 : 24,
                fontWeight: "900",
                color: appBarText().signUpText,
                fontFamily: font.semibold(),
              }}
            >
              {t("please_enable_contacts_permission")}
            </Text>
          </View>
        )}
        <Modal
          style={{ width: "100%", height: "100%" }}
          visible={showSyncModel}
          transparent={true}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(52, 52, 52, 0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                borderRadius: 10,
                backgroundColor: "white",
                padding: 25,
                maxWidth: 250,
              }}
            >
              <ActivityIndicator size="large" color={textTheme().textColor} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: font.bold(),
                  color: textTheme().textColor,
                  marginBottom: 10,
                  marginTop: 10,
                }}
              >
                {syncModelMessage}
              </Text>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}
