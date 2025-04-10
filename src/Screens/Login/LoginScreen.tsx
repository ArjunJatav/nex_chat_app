import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
// import {
//   AccessToken,
//   AuthenticationToken,
//   GraphRequest,
//   GraphRequestManager,
//   LoginManager,
// } from "react-native-fbsdk-next";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import PhoneInput from "react-native-phone-number-input";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  loginthemeModule,
  textTheme,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import {
  alldataapiV3,
  alreadyExistApi,
  Base_Url,
  chatBaseUrl,
  Get_Otp,
  newChannelApi,
  newChannelChatSyncApi,
  newRoomChatSyncApi,
  newRoomSyncApi,
  twiliolookup,
  uploadContacts,
} from "../../Constant/Api";
import { logoIcon } from "../../Navigation/Icons";
import { LoaderModel } from "../Modals/LoaderModel";
import axios from "axios";
import { CaptchaModelShow } from "../Modals/CaptchaModel";
import { accessKeyId, secretAccessKey } from "../../Constant/Key";
import crashlytics from "@react-native-firebase/crashlytics";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
import renderIf from "../../Components/renderIf";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import appleAuth from "@invertase/react-native-apple-authentication";
import { updateAppState } from "../../reducers/getAppStateReducers";
import { socket } from "../../socket";
import {
  createTableUser,
  getUnseenChannelMessageCount,
  getUnseenMessageCount,
  insertChannelInfo,
  insertChannelMessage,
  insertContact,
  insertContactIOS,
  insertDataFromCSVToTable,
  insertRoomSql,
  insertRoomSql3,
  updateChannelUnseenMessageCount,
  updateUnseenMessageCount,
} from "../../sqliteStore";
import { useDispatch, useSelector } from "react-redux";
import { Mixpanel } from "mixpanel-react-native";
import BackgroundTimer from "react-native-background-timer";
import RNFS from "react-native-fs";
import { unzip } from "react-native-zip-archive";
import { setsyncchatlist } from "../../Redux/ChatHistory";
import RNFetchBlob from "rn-fetch-blob";
import Contacts from "react-native-contacts";
import ToShowContactName from "../calling/components/ContactShow";
import { ContactAlertModel } from "../Modals/ContactPermissionModal";
const isDarkMode = false;
let setRoomId = "";
let setChannelId = "";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// eslint-disable-next-line
export default function LoginScreen({ navigation }: any) {
  const [phoneNumber, setphoneNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneCountryCode, phoneCountryCodeSetter] = useState("+1");
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const phoneInput = useRef(null);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [captchaModel, setCaptchaModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);

  const [loginType, setLoginType] = useState("");
  const [email, setEmail] = useState("");
  const [textPart, setTextPart] = useState("default");
  const [userSocialName, setUserSocialName] = useState("");
  const [userSocialId, setuserSocialId] = useState("");
  const [showSyncModel, setShowSyncModel] = useState(false);
  const [syncModelMessage, setSyncModelMessage] = useState("Please wait ...");
  const [syncView, setSyncingView] = useState(false);
  const [contactPermissionDenied, setContactPermissionDenied] = useState(false);
  const [contactModal, setContactModal] = useState(false);

  const dispatch = useDispatch();

  const syncchatlist = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.syncchatlist
  );

  const { t } = useTranslation();

  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  // BottomSheet ref
  const bottomSheetRef = useRef(null);
  const snapPoints = ["45%", "80%"]; // BottomSheet height

  // Function to toggle BottomSheet visibility
  const handleLoginPress = () => {
    setBottomSheetVisible(true);
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0); // Open BottomSheet to the first snap point
    }, 100); // 100ms delay
  };

  const handleClose = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    } else {
      console.error("BottomSheet ref is null when trying to close");
    }
  };

  console.log("globalThis.selectTheme", globalThis.selectTheme);
  const closeBottomSheet = () => {
    setBottomSheetVisible(false);
   // bottomSheetRef.current?.close();
   handleClose();
  };

  // **********   Headers for api ********** ///
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          // Exit the app when the back button is pressed
          BackHandler.exitApp();
          return true; // Prevent default behavior (go back)
        }
      );

      // Cleanup the event listener when the component is unmounted
      return () => {
        backHandler.remove();
      };
    }, [])
  );

  GoogleSignin.configure({
    offlineAccess: true,
    webClientId:
      "463664671853-v9evlpmjtmpq8pkm1k2dkqjgut757grd.apps.googleusercontent.com",
    scopes: ["https://www.googleapis.com/auth/userinfo.profile"],
  });

  const googleSignOut = async () => {
    try {
      await GoogleSignin.revokeAccess(); // This will revoke access to the user's Google account
      await GoogleSignin.signOut(); // This will sign the user out

      // Additional code if needed after signing out
    } catch (error) {
      console.log("Google Sign-Out Error", error);
    }
  };

  const googleLoginFunction = async () => {
    // It will prompt Google Sign-In Widget
    try {
      await GoogleSignin.hasPlayServices({
        // Check if device has Google Play Services installed
        // Always resolves to true on iOS
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();

      console.log("userInfo============", userInfo);

      let socialId = userInfo?.data?.user.id;
      let loginType = "google";
      setLoginType(loginType);
      let firstName = userInfo?.data?.user.givenName || "";
      let lastName = userInfo?.data?.user.familyName || "";
      const fullName =
        firstName && lastName
          ? `${firstName} ${lastName}` // Both are available
          : firstName || lastName; // One of them is available
      let emailId = userInfo?.data?.user.email || "";
      let phoneNumber = userInfo?.data?.user.phoneNumber || ""; // Check for phone number or set it to an empty string if unavailable
      console.log("fullName====================================", fullName);

      setEmail(emailId);
      setUserSocialName(fullName);
      setTextPart(loginType);

      // Call the API with the available details
      alreadyExistApiCall(socialId, loginType, emailId, phoneNumber, fullName);
    } catch (error) {
      console.log("error====================================", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("User Cancelled the Login Flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Signing In");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Play Services Not Available or Outdated");
      } else {
        Alert.alert(error.message);
      }
    }
  };

  const onAppleButtonPress = async () => {
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      // Note: it appears putting FULL_NAME first is important, see issue #293
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );
    // use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      // user is authenticated
      let appleId = appleAuthRequestResponse.user;
      var emailId = appleAuthRequestResponse.email;
      if (emailId == undefined || emailId == null) {
        emailId = "";
      }
      var firstName = appleAuthRequestResponse.fullName.givenName;
      if (firstName == undefined || firstName == null) {
        firstName = "";
      }

      var lastName = appleAuthRequestResponse.fullName.familyName;
      if (lastName == undefined || lastName == null) {
        lastName = "";
      }

      let phoneNumber = appleAuthRequestResponse?.phoneNumber || "";
      var fullName = firstName + " " + lastName;
      setEmail(emailId);
      setUserSocialName(fullName);
      setTextPart("apple");
      setuserSocialId(appleId);
      setLoginType("apple");
      alreadyExistApiCall(appleId, "apple", emailId, phoneNumber, fullName);
      // SignUpApiCalling(emailId, "apple", appleId, firstName, lastName)
    }
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      TakeData();
    });
    return unsubscribe2;
  }, []);

  // const getInfoFromToken = (token) => {
  //   const PROFILE_REQUEST_PARAMS = {
  //     fields: {
  //       string: "id,name,first_name,last_name,email",
  //     },
  //   };

  //   const profileRequest = new GraphRequest(
  //     "/me",
  //     { token, parameters: PROFILE_REQUEST_PARAMS },
  //     (error, result) => {
  //       console.log("result >>>>>>> result", result.id);
  //       console.log("result >>>>>>> result", result);

  //       if (error) {
  //         console.error("Error fetching profile:", error);
  //         return;
  //       }

  //       const socialId = result?.id || null; // Use null if ID is not available
  //       const firstName = result?.first_name || "";
  //       const lastName = result?.last_name || "";
  //       const emailId = result?.email || ""; // Default to empty string if email is undefined
  //       const fullName = `${firstName} ${lastName}`.trim(); // Trim whitespace in case names are missing
  //       const loginType = "facebook";
  //       const phoneNumber = ""; // Set phoneNumber to null if it's not obtained

  //       alreadyExistApiCall(
  //         socialId,
  //         loginType,
  //         emailId,
  //         phoneNumber,
  //         fullName
  //       );

  //       LoginManager.logOut(); // Ensure the user is logged out
  //     }
  //   );

  //   new GraphRequestManager().addRequest(profileRequest).start();
  // };

  // const signInwithFacebook = async () => {
  //   try {
  //     // if (Platform.OS === "android") {
  //     //   LoginManager.setLoginBehavior("web_only");
  //     // }
  //     const result = await LoginManager.logInWithPermissions([
  //       "public_profile",
  //       "email",
  //     ]);

  //     if (Platform.OS === "ios") {
  //       const result = await AuthenticationToken.getAuthenticationTokenIOS();

  //       getInfoFromToken(result?.authenticationToken);
  //     } else {
  //       const result = await AccessToken.getCurrentAccessToken();
  //       console.log("facebook result=================", result);

  //       getInfoFromToken(result?.accessToken);
  //     }
  //   } catch (error) {
  //     console.log("catch>>>>>>>>>>>>>", error);
  //   }
  // };

  const reCreateChatTables = async (chatbackupurl, mediabackupurl) => {
    await AsyncStorage.setItem("isSyncStarted", "yes");
    await createTableUser();
    setSyncModelMessage("Syncing chat data ...");
    setTimeout(() => {
      syncData(globalThis.userChatId, false, chatbackupurl, mediabackupurl);
    }, 1000);
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
            console.log("response.data.data", response.data);
            if (type == "rooms" && response?.data?.data?.length == 0) {
              globalThis.isNewAccount = true;
            } else if (type == "rooms" && response?.data?.data?.length > 0) {
              globalThis.isNewAccount = false;
            } else if (type == "channels" && response?.data?.data?.length > 0) {
              console.log("sync api channel data", response.data.data);
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
              (console.log(">>>>>chhchchc", response.data.data),
              type == "channel-chats" && response.data.data.length > 0)
            ) {
              console.log("channel chat api response", response.data.data);
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

            if (type == "deletedChannels") {
              console.log("deletedChannels", response.data.data);
            }
            // else {
            insertRoomSql(res, globalThis.userChatId, async (status) => {
              if (status == true) {
                await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
                console.log("time updateddddd");
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
                        console.log("response?.data", response?.data);
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
            console.log("response.data.data", response.data);

            if (type === "rooms" && response?.data?.data?.length > 0) {
              globalThis.isNewAccount = res.rooms.length === 0;

              // If there are rooms, handle their data
              if (res.rooms.length > 0) {
                const roomIdsSet = new Set();

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
              console.log("sync api channel data", response.data.data);
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
                  ownerId: channel?.owner,
                  channelName: channel?.name,
                  channelDescription: channel?.description,
                  image: channel?.image,
                  type: channel?.isPublic ? "public" : "private",
                  link: channelLinkToSend,
                  subs: channel?.membersCount + 1,
                  notifiAllow: channel?.isNotificationAllowed,
                  channelId: channel?._id,
                  lastMessage: channel?.lastMessage?.message,
                  lastMessageId: channel?.lastMessage?._id,
                  lastMessageType: channel?.lastMessage?.messageType,
                  lastMessageTime: unixTimestampInMillis,
                  time: channel?.lastMessage?.createdAt,
                  isExclusive: channel.isExclusive,
                  isPaid: channel?.isPaid,
                  isHide: channel?.isHide,
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
                            console.log(
                              "Channel sync response:",
                              response.data.data
                            );

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
                console.log("Last sync time updated");

                if (type === "rooms") {
                  BackgroundTimer.setTimeout(() => {
                    console.log("Starting room sync...");

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
                          console.log("chat sync response:", ress);

                          insertRoomSql3(
                            ress,
                            globalThis.userChatId,
                            async (status) => {
                              if (status) {
                                console.log(
                                  "chat sync sucess:========",
                                  status
                                );
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
                        console.log("response?.data", response?.data);
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

  function proceedWithContactPermissioSelected() {
    setShowSyncModel(false);
    setContactPermissionDenied(true);
  }

  const syncContacts = async (data: any) => {
    //key added by Puru to save all my device contacts in app memory

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
        contactApiResponse(ResponseData, ErrorStr);
      }
    );
  };

  const contactApiResponse = async (ResponseData: any, ErrorStr: any) => {
    setShowSyncModel(false);
    await AsyncStorage.setItem("isAllContactUploaded", "true");
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

  const requestContactsPermission = async () => {
    // setloaderMoedl(true);
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
        //setloaderMoedl(true);
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
            // setTokeeContacts(contactArr);
            // getContactAllList(contactArr);
          })

          .catch((e) => {
            console.log("error", e);
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
              // Show confirmation alert if all fields are valid
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

              // Alert.alert(
              //   t("contact_permission_denied "),
              //   t("this_permission_is_requried_for_app_to_funcation_well "),
              //   [
              //     {
              //       text: "Ok",
              //     },
              //   ],
              //   { cancelable: true }
              // );
            }
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
            console.log("Inserted data:", result);
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

    console.log("withoutbackuparray", withoutbackuparray);
    const apis = shouldbackup ? backuparray : withoutbackuparray;
    {
      shouldbackup
        ? Promise.all(
            apis.map((a) => syncDataModule2(a, a.split("=").pop() + "s"))
          )
            .then(async () => {
              BackgroundTimer.setTimeout(() => {
                const urlStr =
                  chatBaseUrl +
                  "/api/user/channel/last-message/" +
                  globalThis.userChatId;
                console.log("in time out called ", urlStr);
                axios({
                  method: "get",
                  url: urlStr,
                  headers: {
                    "Content-Type": "application/json",
                    api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
                  },
                })
                  .then((response) => {
                    if (response.data.status) {
                      response?.data.data?.map((room) => {
                        getUnseenChannelMessageCount(
                          room.channelId,
                          room.message_time,
                          (unseenMessageCount) => {
                            updateChannelUnseenMessageCount(
                              room.channelId,
                              unseenMessageCount
                            );
                          }
                        );
                      });
                    }
                  })
                  .catch((err) => {
                    console.log("errror: ", err);
                  });
              }, 500);
              // dispatch(setsyncloader(true));
              //  await requestContactsPermission();
              if (Platform.OS == "ios") {
                setShowSyncModel(false);
                globalThis.contactMessage =
                  "To provide the best experience, we need full access to your entire contacts list. If you grant full access, we can sync your contacts seamlessly.";
                setContactModal(true);
              } else {
                // Request Permissions
                await requestContactsPermission().catch((err) =>
                  console.error("Error requesting contacts permission:", err)
                );
              }
            })
            .catch((err) => {
              alert(err);
            })
        : Promise.all(
            apis.map((a) => syncDataModule(a, a.split("=").pop() + "s"))
          )
            .then(async () => {
              try {
                // Ensure global variables are initialized
                // Sync Room Data
                // BackgroundTimer.setTimeout(() => {
                //   console.log("Starting room sync...");

                //   axios
                //     .get(`https://tokee-chat.betademo.net/api/chat/v1/sync`, {
                //       params: {
                //         userId: globalThis.userChatId,
                //         roomIds: setRoomId,
                //       },
                //       headers: {
                //         "Content-Type": "application/json",
                //         api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
                //       },
                //     })
                //     .then((syncResponse) => {
                //       if (syncResponse.data.status) {
                //         const ress = { chats: syncResponse.data.data || [] };
                //         console.log("Room sync response:", ress);

                //         insertRoomSql3(
                //           ress,
                //           globalThis.userChatId,
                //           async (status) => {
                //             if (status) {
                //               alert("Chat insert success");
                //               await AsyncStorage.setItem(
                //                 "lastsynctime",
                //                 `${Date.now()}`
                //               ).catch((err) =>
                //                 console.error(
                //                   "Error saving sync time to AsyncStorage:",
                //                   err
                //                 )
                //               );
                //             }
                //           }
                //         );
                //       } else {
                //         console.warn("Room sync response status is false");
                //       }
                //     })
                //     .catch((err) => {
                //       console.error(
                //         "Error syncing room IDs:",
                //         err.response || err.message || err
                //       );
                //     });
                // }, 500);

                // Sync Channel Data
                // BackgroundTimer.setTimeout(() => {
                //   console.log("Starting channel sync...");

                //   axios
                //     .get(`${chatBaseUrl}/api/chat/v1/channel/sync`, {
                //       params: {
                //         userId: globalThis.userChatId,
                //         channelIds: setChannelId,
                //       },
                //       headers: {
                //         "Content-Type": "application/json",
                //         api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
                //       },
                //     })
                //     .then((response) => {
                //       if (response.data.status) {
                //         console.log(
                //           "Channel sync response:",
                //           response.data.data
                //         );

                //         response.data.data.forEach((res) => {
                //           const obj = {
                //             lastMessageId: res._id,
                //             localPath: [],
                //             attachment: res.attachment,
                //             channelId: res.channelId,
                //             fromUser: res.from._id,
                //             userName: res.from.name,
                //             currentUserPhoneNumber: res.from.phone_number,
                //             message: res.message,
                //             parent_message: {},
                //             isForwarded: res.isForwarded,
                //             createdAt: res.createdAt,
                //             updatedAt: res.updatedAt,
                //             lastMessageType: res.message_type,
                //             reactions: res.reactions?.reactions || [],
                //             isDeletedForAll: res?.isDeletedForAll,
                //           };

                //           insertChannelMessage(obj, (success) => {
                //             console.log(
                //               "Channel message insert success:",
                //               success
                //             );
                //           });
                //         });
                //       } else {
                //         console.warn("Channel sync response status is false");
                //       }
                //     })
                //     .catch((err) => {
                //       console.log(
                //         "Error syncing channel data:",
                //         err.response || err.message || err
                //       );
                //     });
                // }, 1000); // Staggering timeouts to avoid race conditions

                // Fetch Last Messages
                BackgroundTimer.setTimeout(() => {
                  console.log("Fetching last messages...");

                  axios
                    .get(
                      `${chatBaseUrl}/api/user/channel/last-message/${globalThis.userChatId}`,
                      {
                        headers: {
                          "Content-Type": "application/json",
                          api_key: "ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr",
                        },
                      }
                    )
                    .then((response) => {
                      if (response.data.status) {
                        response.data.data.forEach((room) => {
                          getUnseenChannelMessageCount(
                            room.channelId,
                            room.message_time,
                            (unseenMessageCount) => {
                              updateChannelUnseenMessageCount(
                                room.channelId,
                                unseenMessageCount
                              );
                            }
                          );
                        });
                      } else {
                        console.warn("Last messages response status is false");
                      }
                    })
                    .catch((err) => {
                      console.error(
                        "Error fetching last messages:",
                        err.response || err.message || err
                      );
                    });
                }, 1500); // Further staggering to avoid overlaps

                // Request Permissions
                if (Platform.OS == "ios") {
                  setShowSyncModel(false);
                  globalThis.contactMessage =
                    "To provide the best experience, we need full access to your entire contacts list. If you grant full access, we can sync your contacts seamlessly.";
                  setContactModal(true);
                } else {
                  // Request Permissions
                  await requestContactsPermission().catch((err) =>
                    console.error("Error requesting contacts permission:", err)
                  );
                }
              } catch (mainError) {
                console.error("Main sync process error:", mainError);
              }
            })
            .catch((err) => {
              alert(`Error in Promise.all: ${err.message || err}`);
            });
    }
  };

  const syncfunction = (shouldbackup, chatbackupurl, mediabackupurl) => {
    setShowSyncModel(true);
    setSyncModelMessage("Syncing chat data ...");
    if (shouldbackup) {
      createTableUser();
    }

    setTimeout(() => {
      syncData(
        globalThis.userChatId,
        shouldbackup,
        chatbackupurl,
        mediabackupurl
      );
    }, 1000);
  };

  const alreadyExistApiCall = async (
    socialId,
    loginType,
    emailID,
    phoneNumber,
    fullName
  ) => {
    const urlStr = Base_Url + alreadyExistApi;

    console.log({
      social_login_type: loginType,
      social_login_id: socialId,
      device_token: global.fcmtoken,
      email: emailID,
      phone_number: phoneNumber,
      country_code: "",
      device_type: Platform.OS === "android" ? "android" : "ios",
      voipToken: globalThis.voiptoken === undefined ? "" : globalThis.voiptoken,
    });

    try {
      const response = await axios({
        method: "post",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          social_login_type: loginType,
          social_login_id: socialId,
          device_token: global.fcmtoken,
          email: emailID,
          phone_number: phoneNumber,
          country_code: "",
          device_type: Platform.OS === "android" ? "android" : "ios",
          voipToken:
            globalThis.voiptoken === undefined ? "" : globalThis.voiptoken,
        },
      });
      googleSignOut();
      console.log("google response.data========", response.data);

      if (response.data.status === true) {
        if (response.data.data.is_already_registered == 0) {
          console.log("is_already_registered 00000000");

          navigation.navigate("NumberSocialLogin", {
            signupType: loginType,
            socialId,
            userName: fullName,
            email: emailID || "",
          });
        } else {
          globalThis.thumbnail = response?.data.data?.user?.thumbnail;
          globalThis.Authtoken = response?.data.data.token;
          globalThis.token = response?.data.data.token;
          globalThis.chatUserId = response?.data.data.user.chat_user_id;
          globalThis.userChatId = response?.data.data.user.chat_user_id;
          globalThis.userImage = response?.data.data.user.profile_image;
          globalThis.image = response?.data.data.user.profile_image;
          globalThis.userName = response?.data.data.user.first_name;
          globalThis.displayName = response?.data.data.user.first_name;
          globalThis.phone_number = response?.data.data.user.phone_number;
          globalThis.sender_id = response?.data.data.user.id;
          console.log("is_already_registered 111111111");
          const safeSetItem = async (key, value) => {
            if (value === null || value === undefined) {
              await AsyncStorage.removeItem(key);
            } else {
              await AsyncStorage.setItem(key, value);
            }
          };
          console.log("is_already_registered 2222222");
          await safeSetItem(
            "userData",
            JSON.stringify(response.data.data.token)
          );
          await safeSetItem("authToken", response.data.data.token);
          await safeSetItem(
            "chatlockusernumber",
            JSON.stringify(response.data.data.user.phone_number)
          );
          await safeSetItem("userImage", response.data.data.user.profile_image);
          await safeSetItem("userName", response.data.data.user.first_name);
          await safeSetItem("chatUserID", response.data.data.user.chat_user_id);

          await safeSetItem(
            "chat_backup_url",
            response.data.data.user.chat_backup_url || ""
          );
          await safeSetItem(
            "chat_backup_size",
            response.data.data.user.chat_backup_size || ""
          );
          await safeSetItem(
            "chat_media_backup_url",
            response.data.data.user.chat_media_backup_url || ""
          );
          await safeSetItem(
            "chat_media_backup_size",
            response.data.data.user.chat_media_backup_size || ""
          );
          await safeSetItem(
            "chat_backup_platform",
            response.data.data.user.chat_backup_platform || ""
          );
          await safeSetItem(
            "chat_backup_date_time",
            response.data.data.user.chat_backup_date_time || ""
          );

          await safeSetItem("userChatId", response.data.data.user.chat_user_id);
          await safeSetItem(
            "phone_number",
            response.data.data.user.phone_number
          );
          console.log("is_already_registered 3333333");
          const sender_Data = {
            userImage: response.data.data.user.profile_image,
            userName: response.data.data.user.first_name,
            sender_id: response.data.data.user.id,
            userChatId: response.data.data.user.chat_user_id,
          };
          console.log("is_already_registered 444444");
          await safeSetItem("sender_Data", JSON.stringify(sender_Data));
          await safeSetItem(
            "userContactNumber",
            JSON.stringify(response.data.data.user.phone_number)
          );
          await safeSetItem(
            "lockChatPinCode",
            JSON.stringify(response.data.data.user.chat_pin)
          );

          createTableUser();
          socket.connect();
          socket.emit("join", { id: response.data.data.user.chat_user_id });
          dispatch(updateAppState({ isAppActive: true }));
          setloaderMoedl(false);

        
      
          const trackAutomaticEvents = false;
          const mixpanel = new Mixpanel(
            `${globalThis.mixpanelToken}`,
            trackAutomaticEvents
          );
          mixpanel.identify(response?.data?.data?.user?.chat_user_id);
          mixpanel.getPeople().set("$name", response.data.data.user.first_name);
          console.log("is_already_registered", response.data.data);

          if (
            response.data.data.user.chat_backup_date_time &&
            response.data.data.user.chat_backup_url
          ) {
            Alert.alert(
              t("backup_found"),
              t("you_have_chat_backup_for_this_account"),
              [
                {
                  text: "Skip",
                  onPress: () => {
                    setTimeout(() => {
                      setSyncingView(true);
                      setTimeout(() => {
                        setShowSyncModel(true);
                        setSyncModelMessage(
                          t("please_wait_we_are_syncing_your_chat_data")
                        );
                        setTimeout(async () => {
                          await AsyncStorage.setItem("synctype", "skip");
                          reCreateChatTables("", "");
                        }, 1000);
                      }, 1000);
                    }, 1000);
                  },
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: async () => {
                    syncfunction(
                      true,
                      response.data.data.user.chat_backup_url,
                      response.data.data.user.chat_media_backup_url
                    ),
                      await AsyncStorage.setItem("synctype", "restore");
                  },
                },
              ]
            );
          } else {
            await AsyncStorage.setItem("synctype", "skip");
            setTimeout(() => {
              setSyncingView(true);
              setTimeout(() => {
                setShowSyncModel(true);
                setSyncModelMessage("Syncing data modules ...");
                setTimeout(() => {
                  reCreateChatTables("", "");
                }, 1000);
              }, 1000);
            }, 1000);
          }
        }
      }else{
        setloaderMoedl(false);
        globalThis.errorMessage = response.data.message;
        setErrorAlertModel(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const TakeData = async () => {
    const name = await AsyncStorage.getItem("filledName");
    const number = await AsyncStorage.getItem("filledNumber");
    if (name !== null) {
      setUserName(name);
    }
    if (number !== null) {
      setphoneNumber(number);
    }
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          // Alert.alert(
          //   "No Internet",
          //   "No Internet, Please check your Internet Connection."
          // );

          return;
        } else {
          setphoneNumber("");
          setUserName("");
        }
      });
    });
    return unsubscribe2;
  }, []);

  // **********   Login Button Method  ********** ///
  const LoginButtonPress = () => {
    // console.log(data)
    if (userName?.toLowerCase()?.includes("tokee")) {
      globalThis.errorMessage = t("you_cn_use_tokee_name");
      setErrorAlertModel(true);
      // Alert.alert(
      //   t("error"),
      //   t("you_cn_use_tokee_name"),
      //   [{ text: t("ok") }]
      // );
      return; // Exit early if "toke" is found
    }
    if (userName == "") {
      globalThis.errorMessage =
        "Name Field Required, " + t("Please_provide_name");
      setErrorAlertModel(true);
      // Alert.alert("Name Field Required", t("Please_provide_name"), [
      //   { text: t("ok") },
      // ]);
      //  Alert.alert( t('Please_provide_name'),);
    } else if (phoneNumber == "") {
      globalThis.errorMessage =
        "Phone Number Required, " + t("please_provide_phone_number");
      setErrorAlertModel(true);
      // Alert.alert("Phone Number Required", t("please_provide_phone_number"), [
      //   { text: t("ok") },
      // ]);
    } else if (phoneCountryCode == "") {
      // Alert.alert("Invalid!", "Select different Country.");
      globalThis.errorMessage = "Invalid, " + "Select different Country.";
      setErrorAlertModel(true);
    } else if (phoneNumber.length < 7) {
      // Alert.alert("", t("valid_phone"), [{ text: t("ok") }]);
      globalThis.errorMessage = "Invalid, " + t("valid_phone");
      setErrorAlertModel(true);
    } else {
      // ********** InterNet Permission    ********** ///
      NetInfo.fetch().then((state) => {
        if (state.isConnected === false) {
          // Alert.alert(
          //   "No Internet",
          //   "No Internet, Please check your Internet Connection."
          // );
          setNoInternetModel(true);
          return;
        } else {
          //  setCaptchaModel(true);
          NavigateOTPScreen();
        }
      });
    }
  };

  const lookupPhoneNumber = async (phoneNumb) => {
    // const url = `https://lookups.twilio.com/v2/PhoneNumbers/${phoneNumb}`;

    const url = Base_Url + twiliolookup;
    try {
      const response = await axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          phone_number: phoneNumb,
        },
      });

      if (!response.data.valid) {
        setloaderMoedl(false);
        globalThis.errorMessage =
          "Invalid Number, " + "Please check your mobile number";
        setErrorAlertModel(true);
        // Alert.alert("Invalid Number", "Please check your mobile number", [
        //   { text: "OK" },
        // ]);
      } else {
        setloaderMoedl(false);
        const data = {
          country_code: phoneCountryCode,
          phone_number: phoneNumber,
        };
        // sendOTP(phoneCountryCode+phoneNumber)
        // return
        PostApiCall(
          Get_Otp,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      }
      // Handle the successful response here
    } catch (error) {
      setloaderMoedl(false);
      let errorMessage = "An error occurred";

      if (error.response) {
        console.log("error.response", error.response);
        switch (error.response.status) {
          case 400:
            errorMessage = "Bad Request";
            break;
          case 401:
            errorMessage = "Unauthorized";
            break;
          case 403:
            errorMessage = "Forbidden";
            break;
          case 404:
            errorMessage = "Not Found";
            break;
          case 429:
            errorMessage = "Too Many Requests";
            break;
          case 500:
            errorMessage = "Internal Server Error";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server";
      } else {
        console.log("error.response2", error.response);
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }

      // Alert.alert("Error", errorMessage, [{ text: "OK" }]);
      globalThis.errorMessage = errorMessage;
      setErrorAlertModel(true);
    }
  };
  // **********   Method for Navigation for Further screen  ********** ///
  // eslint-disable-next-line
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    console.log("firebaseotp", ResponseData, ErrorStr);
    if (ErrorStr) {
      setUserName("");
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      globalThis.errorMessage = ErrorStr;
      setloaderMoedl(false);
      setErrorAlertModel(true);

      // Navigate to another screen or handle the error in some way
    } else {
      setloaderMoedl(false);
      // setCaptchaModel(true);
      let code = phoneCountryCode.toString();
      let phone = phoneNumber.toString();
      let name = userName.toString();

      SaveData();
      navigation.push("OtpVerificationScreen", {
        code: code,
        phone: phone,
        name: name,
        phoneCountryCode: phoneCountryCode,
      });
    }
  };

  const CustomHandle = () => (
    <View style={styles.handleContainer}>
      {/* You can also add a visual indicator (e.g., a small bar) */}
      <TouchableWithoutFeedback onPress={() => closeBottomSheet()}>
        <Image
          source={require("../../Assets/Icons/bottomdown.png")}
          resizeMode="contain"
          style={{
            height: 20,
            width: 20,
            //  transform: [{ rotate: "-90deg" }],
            tintColor: loginthemeModule().loginButton,
          }}
        />
      </TouchableWithoutFeedback>
    </View>
  );

  const handleOutsideClick = () => {
    setBottomSheetVisible(false); // Close BottomSheet
  };

  const styles = StyleSheet.create({
    logoView: {
      height: DeviceInfo.isTablet() == true ? 320 : 220,
      alignItems: "center",
      justifyContent: "center",
    },

    mainContainer: {
      height: "100%",
      width: "100%",
    },
    logoImage: {
      height: DeviceInfo.isTablet() == true ? 250 : 150,
      width: DeviceInfo.isTablet() == true ? 250 : 150,
      tintColor: logoIcon().tintColor,
      marginTop: 90,
    },
    button: {
      height: 50,
    //  marginTop: 30,
      width: "90%",
      borderRadius: 10,

      justifyContent: "center",
      alignItems: "center",
      backgroundColor: loginthemeModule().loginButton,
      //  backgroundColor: "#FFF",
      alignSelf: "center",
      flexDirection: "row",
    },

    Loginbutton: {
      height: 50,
      marginTop: 20,
      width: "90%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: loginthemeModule().loginButton,
      //backgroundColor: "#FFF",
      alignSelf: "center",
      // flexDirection: "row",
    },
    formContainer: {
      height: "100%",
      // backgroundColor:
      //   globalThis.selectTheme === "newYearTheme"
      //     ? "#3B344E"
      //     : globalThis.selectTheme === "newYear"
      //     ? "#E88E34"
      //     : globalThis.selectTheme === "christmas"
      //     ? "#B92519"
      //     : "#fff",
      borderWidth: 0,
      borderTopEndRadius: 30,
      borderTopStartRadius: 30,
      borderColor: "transparent",
      bottom: 0,
      marginBottom: 0,
      width: windowWidth,
    },
    textInput: {
      paddingVertical: 0,
      fontFamily: font.semibold(),
      color: loginthemeModule().textColor,
      backgroundColor:
        globalThis.selectTheme === "newYearTheme"
          ? "#3B344E"
          : globalThis.selectTheme === "newYear"
          ? "#E88E34"
          : globalThis.selectTheme === "christmas"
          ? "#B92519"
          : "#fff",
      alignItems: "center",
      fontSize: DeviceInfo.isTablet() == true ? 27 : 17,
    },
    phoneContainer: {
      marginTop: 10,
      width: "100%",
      backgroundColor:
        globalThis.selectTheme === "newYearTheme"
          ? "#3B344E"
          : globalThis.selectTheme === "newYear"
          ? "#E88E34"
          : globalThis.selectTheme === "christmas"
          ? "#B92519"
          : "#fff",
      fontFamily: font.semibold(),
      borderBottomWidth: 1,
      borderBottomColor: "#F6EBF3",
    },
    signUpTextContainer: {
      height: 60,
      alignItems: "flex-start",
      paddingLeft: DeviceInfo.isTablet() == true ? 32 : 16,
    },
    nameTextContainer: {
      height: 50,
      alignItems: "flex-start",
      paddingLeft: DeviceInfo.isTablet() == true ? 32 : 16,
    },
    phTextContainer: {
      alignItems: "flex-start",
      paddingLeft: DeviceInfo.isTablet() == true ? 32 : 16,
      paddingRight: 16,
      fontFamily: font.semibold(),
      position: "relative",
      zIndex: 1,
    },
    nameInputTextContainer: {
      marginRight: 16,
      marginLeft: DeviceInfo.isTablet() == true ? 32 : 16,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },

    signUpText: {
      marginTop: 20,
      fontSize: DeviceInfo.isTablet() == true ? 32 : 24,
      fontWeight: "900",
      color: appBarText().signUpText,
      fontFamily: font.semibold(),
    },
    nameText: {
      marginTop: 20,
      fontSize: FontSize.font,
      color: loginthemeModule().textColor,
      fontWeight: "600",
      fontFamily: font.regular(),
    },
    detailsText: {
      fontSize: DeviceInfo.isTablet() == true ? 24 : 15,
      color: loginthemeModule().textColor,
      fontFamily: font.medium(),
      marginTop: 8,
    },
    buttonText: {
      fontSize: FontSize.font,
      color:
        globalThis.selectTheme === "newYearTheme"
          ? COLORS.black
          : globalThis.selectTheme === "newYear"
          ? COLORS.black
          : globalThis.selectTheme === "christmas"
          ? COLORS.primary_light_green
          : COLORS.white,
      fontFamily: font.bold(),
    },
    nameInputText: {
      fontSize: FontSize.font,
      padding: 0,
      marginTop: 10,
      color: loginthemeModule().textColor,
      fontFamily: font.regular(),
    },

    overlay: {
      flex: 1,
      backgroundColor: "#ffffff", // Semi-transparent background for overlay
      paddingTop: 5,
      padding: 20,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderBottomWidth: 0, // Ensures no bottom border
      borderColor: loginthemeModule().loginButton, // Dynamic border color
    },

    logo: {
      width: 100, // Adjust to your logo size
      height: 50, // Adjust to your logo size
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#ffffff",
    },
    subtitle: {
      fontSize: 14,
      color: "#ffffff",
      marginBottom: 20,
      //textAlign: 'center',
      fontWeight: "800",
    },
    loginButton: {
      backgroundColor: "#f2f2f2",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: "100%",
      marginBottom: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    loginText: {
      fontSize: 16,
    },
    orText: {
      fontSize: 12,
      color: "#ffffff",
      marginHorizontal: 15,

      textAlign: "center",
    },
    textWrapper: {
      width: "88%",
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
    },
    leftLine: {
      flex: 1,
      height: 0.5,
      backgroundColor: "lightgray",
      marginRight: 0,
    },
    text: {
      fontSize: 18,
      fontWeight: "bold",
    },
    rightLine: {
      flex: 1,
      height: 0.5,
      backgroundColor: "lightgray",
      marginLeft: 0,
    },
    labelText: {
      marginTop: 0,
      fontSize: DeviceInfo.isTablet() == true ? 32 : 24,
      fontWeight: "900",
      color: appBarText().signUpText,
      fontFamily: font.semibold(),
    },
    screenView: {
      height: windowHeight,
      width: "100%",
      alignItems: "center",
    },
    handleContainer: {
      width: "100%",
      height: 30,
      backgroundColor: "#ffffff",
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderWidth: 0, // Ensures no bottom border
      borderColor: loginthemeModule().loginButton,
      borderBottomColor: "#ffffff", // Dynamic border color
    },
    backgroundImage: {
      flex: 1,
    },
  });

  const SaveData = async () => {
    await AsyncStorage.setItem("filledName", userName);
    await AsyncStorage.setItem("filledNumber", phoneNumber.toString());
    setloaderMoedl(false);
  };

  const NavigateOTPScreen = async () => {
    setloaderMoedl(true);
    if (globalThis.isTwillioLookupEnabled == "YES") {
      lookupPhoneNumber(phoneCountryCode + phoneNumber);
    } else {
      const data = {
        country_code: phoneCountryCode,
        phone_number: phoneNumber,
      };

      PostApiCall(
        Get_Otp,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          apiSuccess(ResponseData, ErrorStr);
        }
      );
    }
  };

  console.log(
    "logoIcon().logoPng====================================",
    logoIcon().logoPng
  );

  return (
    <View
      style={{
        backgroundColor: "transparent",
        height: "100%",
        width: "100%",
      }}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />

      <NoInternetModal
        visible={noInternetModel}
        onRequestClose={() => setNoInternetModel(false)}
        headingTaxt={t("noInternet")}
        NoInternetText={t("please_check_internet")}
        cancelButton={() => setNoInternetModel(false)}
      />
      <ContactAlertModel
        visible={contactModal}
        onRequestClose={() => setContactModal(false)}
        errorText={globalThis.contactMessage}
        contactOkButton={() => {
          setContactModal(false);
          requestContactsPermission();
        }}
      />
      <ImageBackground
        source={require("../../Assets/Image/loginBackground.png")}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <ScrollView
          style={{
            height: "100%",
            // backgroundColor: loginthemeModule().theme_background,
            // paddingBottom: 300,
          }}
          contentContainerStyle={{ flexGrow: 1 }}
          automaticallyAdjustContentInsets={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.mainContainer,
              {
                //backgroundColor: loginthemeModule().theme_background,
              },
            ]}
          >
            {/* **********   Logo View   **********  */}
            {/* <ImageBackground
              source={
                globalThis.selectTheme === "indiaTheme"
                  ? require("../../Assets/Icons/India_login_top.png")
                  : globalThis.selectTheme === "englandTheme"
                  ? require("../../Assets/Icons/England_login_top.png")
                  : globalThis.selectTheme === "newYear"
                  ? require("../../Assets/Icons/NewYearBird.png")
                  : globalThis.selectTheme === "mexicoTheme"
                  ? require("../../Assets/Icons/mexico_login_back.png")
                  : globalThis.selectTheme === "usindepTheme"
                  ? require("../../Assets/Icons/login_us_back.png")
                  : undefined
              }
              resizeMode={"contain"} // Update the path or use a URL
              style={{ height: "auto", width: windowWidth, marginTop: 0 }}
            >
              <View style={styles.logoView}>
                <Image
                  source={logoIcon().logoPng}
                  resizeMode="contain"
                  style={styles.logoImage}
                />
              </View>
            </ImageBackground> */}
            {/* **********   View for Sign Data   **********  */}

            {/* <ScrollView > */}

            <View
              style={[
                styles.formContainer,
                { justifyContent: "flex-end", alignItems: "center" },
              ]}
            >
              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                  paddingBottom: 80,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderTopEndRadius: 30,
                  borderTopStartRadius: 30,
                }}
              >
                <View
                  style={{ width: "90%", alignSelf: "center", marginTop: 20 }}
                >
                  <Text style={styles.title}>{t("loin_method")}</Text>
                  <Text style={styles.subtitle}>{t("method_sub_text")}</Text>
                </View>

                {renderIf(
                  Platform.OS === "ios",
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                      // setCaptchaModel(true)
                      onAppleButtonPress()
                    }
                  >
                    <Image
                      source={require("../../Assets/Image/apple.png")}
                      resizeMode="contain"
                      style={{
                        height: 30,
                        width: 40,
                        tintColor:
                          globalThis.selectTheme === "newYearTheme"
                            ? COLORS.black
                            : globalThis.selectTheme === "newYear"
                            ? COLORS.black
                            : globalThis.selectTheme === "christmas"
                            ? COLORS.primary_light_green
                            : COLORS.white,
                      }}
                    />
                    {/* <Text style={styles.buttonText}> {t("submit")}</Text> */}
                    <Text
                      style={{
                        color:
                          globalThis.selectTheme === "newYearTheme"
                            ? COLORS.black
                            : globalThis.selectTheme === "newYear"
                            ? COLORS.black
                            : globalThis.selectTheme === "christmas"
                            ? COLORS.primary_light_green
                            : COLORS.white,
                        fontSize: FontSize.font,
                        fontFamily: font.bold(),
                      }}
                    >
                      {t("continue_apple_login")}
                    </Text>
                  </TouchableOpacity>
                )}

<TouchableOpacity
                    style={[styles.button,{marginTop:20}]}
                    onPress={() =>
                      // setCaptchaModel(true)
                      googleLoginFunction()
                    }
                  >
                    <Image
                      source={require("../../Assets/Image/google.png")}
                      resizeMode="contain"
                      style={{
                        height: 25,
                        width: 30,
                      }}
                    />
                    {/* <Text style={styles.buttonText}> {t("submit")}</Text> */}
                    <Text
                      style={{
                        color:
                          globalThis.selectTheme === "newYearTheme"
                            ? COLORS.black
                            : globalThis.selectTheme === "newYear"
                            ? COLORS.black
                            : globalThis.selectTheme === "christmas"
                            ? COLORS.primary_light_green
                            : COLORS.white,
                        fontSize: FontSize.font,
                        fontFamily: font.bold(),
                      }}
                    >
                      {t("continue_google_login")}
                    </Text>
                  </TouchableOpacity>

                {/* <TouchableOpacity
                  style={[styles.button, { marginTop: 30 }]}
                  onPress={() =>
                  
                    signInwithFacebook()
                  }
                >
                  <Image
                    source={require("../../Assets/Image/facebook.png")}
                    resizeMode="contain"
                    style={{
                      height: 30,
                      width: 40,
                    }}
                  />
                
                  <Text
                    style={{
                      color:
                        globalThis.selectTheme === "newYearTheme"
                          ? COLORS.black
                          : globalThis.selectTheme === "newYear"
                          ? COLORS.black
                          : globalThis.selectTheme === "christmas"
                          ? COLORS.primary_light_green
                          : COLORS.white,
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    Continue with Facebook
                  </Text>
                </TouchableOpacity> */}

                {/* <Text
                  style={{
                    alignSelf: "center",
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: "600",
                    marginTop: 20,
                  }}
                >
                  {t("allready_member")}
                </Text> */}

                {/* <TouchableOpacity
                  style={styles.Loginbutton}
                  onPress={handleLoginPress}
                >
             
                  <Text
                    style={[
                      styles.buttonText,
                      { fontSize: FontSize.font, fontFamily: font.bold() },
                    ]}
                  >
                    {t("login_new")}
                  </Text>
                </TouchableOpacity> */}

                <View style={styles.textWrapper}>
                  <View style={styles.leftLine} />
                  <Text style={styles.orText}>{t("or_text")}</Text>
                  <View style={styles.rightLine} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      height: 50,
                      // marginTop: 30,
                      backgroundColor: loginthemeModule().loginButton,
                    },
                  ]}
                  onPress={() => {
                    closeBottomSheet();
                    navigation.navigate("NumberLoginScreen");
                  }}
                >
                  {/* <Text style={styles.buttonText}> {t("submit")}</Text> */}
                  <Text style={[styles.buttonText]}>{t("number_login")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>

      {captchaModel && (
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          }}
        >
          <CaptchaModelShow
            // visible={captchaModel}
            // onRequestClose={() => setCaptchaModel(false)}

            cancel={() => setCaptchaModel(false)}
            captchaVerified={() => NavigateOTPScreen()}
          />
        </View>
      )}

      {isBottomSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          index={isBottomSheetVisible ? 0 : -1} // 0 to show, -1 to hide
          snapPoints={snapPoints}
          onClose={() => setBottomSheetVisible(false)}
          enablePanDownToClose={true}
          handleComponent={null}
          backgroundStyle={{
            backgroundColor: "transparent", // Transparent background
          }}
          handleStyle={{
            borderBottomWidth: 0, // Ensure no bottom border
            elevation: 0, // Remove shadow on Android
            backgroundColor: "transparent", // Transparent background for handle
          }}
        >
          <View style={styles.overlay}>
            {/* Slide up animation */}
            <View style={{ alignSelf: "center", marginBottom: 5 }}>
              <TouchableWithoutFeedback onPress={() => closeBottomSheet()}>
                <Image
                  source={require("../../Assets/Icons/bottomdown.png")}
                  resizeMode="contain"
                  style={{
                    height: 20,
                    width: 20,
                    //  transform: [{ rotate: "-90deg" }],
                    tintColor: loginthemeModule().loginButton,
                  }}
                />
              </TouchableWithoutFeedback>
            </View>

            <Text style={styles.title}>{t("loin_method")}</Text>
            <Text style={styles.subtitle}>{t("method_sub_text")}</Text>

            {renderIf(
              Platform.OS === "ios",
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    height: 50,
                    marginTop: 5,
                  },
                ]}
                onPress={
                  () => onAppleButtonPress()
                  // LoginButtonPress()
                }
              >
                <Image
                  source={require("../../Assets/Image/apple.png")}
                  resizeMode="contain"
                  style={{
                    height: 30,
                    width: 40,
                    tintColor:
                      globalThis.selectTheme === "newYearTheme"
                        ? COLORS.black
                        : globalThis.selectTheme === "newYear"
                        ? COLORS.black
                        : globalThis.selectTheme === "christmas"
                        ? COLORS.primary_light_green
                        : COLORS.white,
                  }}
                />
                {/* <Text style={styles.buttonText}> {t("submit")}</Text> */}
                <Text
                  style={{
                    color:
                      globalThis.selectTheme === "newYearTheme"
                        ? COLORS.black
                        : globalThis.selectTheme === "newYear"
                        ? COLORS.black
                        : globalThis.selectTheme === "christmas"
                        ? COLORS.primary_light_green
                        : COLORS.white,
                    fontSize: FontSize.font,
                    fontFamily: font.bold(),
                  }}
                >
                  {t("apple_login")}
                </Text>
              </TouchableOpacity>
            )}

            {renderIf(
              Platform.OS === "android",
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    height: 50,
                    marginTop: 5,
                  },
                ]}
                onPress={() =>
                  // setCaptchaModel(true)
                  googleLoginFunction()
                }
              >
                <Image
                  source={require("../../Assets/Image/google.png")}
                  resizeMode="contain"
                  style={{
                    height: 25,
                    width: 30,
                  }}
                />
                {/* <Text style={styles.buttonText}> {t("submit")}</Text> */}
                <Text
                  style={{
                    color:
                      globalThis.selectTheme === "newYearTheme"
                        ? COLORS.black
                        : globalThis.selectTheme === "newYear"
                        ? COLORS.black
                        : globalThis.selectTheme === "christmas"
                        ? COLORS.primary_light_green
                        : COLORS.white,
                    fontSize: FontSize.font,
                    fontFamily: font.bold(),
                  }}
                >
                  {t("google_login")}
                </Text>
              </TouchableOpacity>
            )}

            {/* <TouchableOpacity
              style={[styles.button, { marginTop: 30 }]}
              onPress={() =>
             
                signInwithFacebook()
              }
            >
              <Image
                source={require("../../Assets/Image/facebook.png")}
                resizeMode="contain"
                style={{
                  height: 30,
                  width: 40,
                }}
              />
            
              <Text
                style={{
                  color:
                    globalThis.selectTheme === "newYearTheme"
                      ? COLORS.black
                      : globalThis.selectTheme === "newYear"
                      ? COLORS.black
                      : globalThis.selectTheme === "christmas"
                      ? COLORS.primary_light_green
                      : COLORS.white,
                  fontWeight: "bold",
                  fontSize: 20,
                }}
              >
                Continue with Facebook
              </Text>
            </TouchableOpacity> */}

            <View style={styles.textWrapper}>
              <View style={styles.leftLine} />
              <Text style={styles.orText}>{t("or_text")}</Text>
              <View style={styles.rightLine} />
            </View>

            {/* <TouchableOpacity
              style={[
                styles.button,
                {
                  height: 50,
                  marginTop: 0,
                  backgroundColor: loginthemeModule().loginButton,
                },
              ]}
              onPress={() => {
                closeBottomSheet();
                navigation.navigate("NumberLoginScreen");
              }}
            >
            
              <Text style={[styles.buttonText]}>{t("number_login")}</Text>
            </TouchableOpacity> */}
          </View>
        </BottomSheet>
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

      {renderIf(
        syncView == true,
        <View
          style={[
            styles.screenView,
            {
              backgroundColor: "white",
              justifyContent: "center",
              //  position: "absolute",
              marginTop: Platform.OS == "android" ? -80 : -120,
              // left: 0,
              alignItems: "center",
              height: "100%",
              //  zIndex:5000
            },
          ]}
        >
          <ImageBackground
            source={require("../../Assets/Logo/syncBack.png")}
            resizeMode="cover"
            style={{
              height:
                Platform.OS == "ios"
                  ? Dimensions.get("window").height + 120
                  : Dimensions.get("screen").height + 80,
              width: Dimensions.get("screen").width,
              justifyContent: "center",
              alignItems: "center",
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
                <Text style={styles.labelText}>
                  {t("contact_permission_denied ")}
                </Text>
                <Text style={styles.labelText}>
                  {t("please_enable_contacts_permission")}
                </Text>
              </View>
            )}
          </ImageBackground>
        </View>
      )}
    </View>
  );
}
