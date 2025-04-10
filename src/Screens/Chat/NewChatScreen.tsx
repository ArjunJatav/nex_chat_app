import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  SectionList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Contacts from "react-native-contacts";
import DeviceInfo from "react-native-device-info";
import { useDispatch, useSelector } from "react-redux";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  iconTheme,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { showToast } from "../../Components/CustomToast/Action";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import SearchBar from "../../Components/SearchBar/SearchBar";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import {
  Base_Url,
  Base_Url2,
  checkIfAllContactsSynced,
  checkNewlyAddedContacts,
  deleteAllContacts,
  insertFriend,
  nonTokeeUsers,
  uploadContacts,
  verify_user_by_phone_number,
} from "../../Constant/Api";
import { callTop, chatTop } from "../../Navigation/Icons";
import {
  setMainprovider,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setnewroomType,
  setroominfo,
  setyesstart,
} from "../../Redux/ChatHistory";

import {
  CheckIsRoomsBlockedforfriendlist,
  insertContact,
  insertContactIOS,
} from "../../sqliteStore";
import { onCallPress } from "../../utils/callKitCustom";
import { AddUsereModel } from "../Modals/AddUserModel";
import { ContactLoaderModel } from "../Modals/ContactLoaderModel";
import { GroupTypeModal } from "../Modals/GroupTypeModal";
import { InviteUsereModel } from "../Modals/InviteUserModel";
import axios from "axios";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { setProfileData } from "../../Redux/MessageSlice";
import ToShowContactName from "../calling/components/ContactShow";
const isDarkMode = true;
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height; 
let contactUploadStatus = null;
 // eslint-disable-next-line
export default function NewChatScreen({ navigation, route }: any) {
  const dispatch = useDispatch();
  const [isGroupTypeModal, setGroupTypeModal] = useState(false);
  const [contactsInTokee, setTokeeContacts] = useState([]);
  const [contactList, setContactList] = useState([]);
  const { t } = useTranslation();
  const { colorTheme } = useContext(ThemeContext);
  const [searchValue, setSearchValue] = useState("");
  const [conatctLoaderModel, setContactLoaderModel] = useState(true);
  const clickAblelData = "";
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUserModel, setInviteUserModel] = useState(false);
  const [isUIUpdated, setIsUIUpdated] = useState(false);
  const [addUserModel, setAddUserModel] = useState(false);

  // **********   Headers for api ********** ///
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken, 
    localization: globalThis.selectLanguage,
  };

  const callState = useSelector(
     // eslint-disable-next-line
    (state: any) => state?.VoipReducer?.call_state 
  );

  const getContactAllList = async () => {
    setIsLoading(true);

    // Retrieve from AsyncStorage
    const storedTokeeContactListTempString = await AsyncStorage.getItem(
      "tokeeContactListTemp"
    );
    const storedContactListTempString = await AsyncStorage.getItem(
      "contactListTemp"
    );

    // Convert JSON string back to array
    const storedTokeeContactListTemp = JSON.parse(
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      storedTokeeContactListTempString
    );
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    const storedContactListTemp = JSON.parse(storedContactListTempString);

    // Update the state with retrieved values
    if (storedTokeeContactListTemp || storedContactListTemp !== null) {
      // CheckIsRoomsBlocked
      CheckIsRoomsBlockedforfriendlist(
        storedTokeeContactListTemp || [],
         // eslint-disable-next-line
        (data: any) => {
          setTokeeContacts(data);
        }
      );

      setContactList(storedContactListTemp || []);
      setIsLoading(false);
    }

    await AsyncStorage.setItem(
      "tokeeContactListTemp",
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      JSON.stringify(tokeeContactListTemp)
    );
    await AsyncStorage.setItem(
      "contactListTemp", 
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      JSON.stringify(contactListTemp)
    );
  };

  useEffect(() => {
    getContactUploadStatus();
  }, []);

  const clickScan = async () => {
    requestContactsPermission();
  };

  const getContactUploadStatus = async () => {
    setTokeeContacts([]);
    setContactLoaderModel(true);
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    contactUploadStatus = await AsyncStorage.getItem("isAllContactUploaded");
    if (contactUploadStatus == null) {
      requestContactsPermission();
    } else {
      setContactLoaderModel(false);
      getContactAllList();
    }
  };

  const clickPerson = async () => {
    setAddUserModel(true);
  };

   // eslint-disable-next-line
  const contactUploadApiResponse = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setContactLoaderModel(false);
    } else {
      await AsyncStorage.setItem("isAllContactUploaded", "true");
      checkStatusOfAllContactsSync();
    }
  };

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
            setContactLoaderModel(false);
            getallContactsfromServer();
          } else {
            checkStatusOfAllContactsSync();
          }

        })
        .catch((error) => {
          alert(error)
        });
    } catch (error) {
      alert(error)
    }
  }

  function getallContactsfromServer() {
    const tempheaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      // localization: globalThis.selectLanguage,
    };

    GetApiCall(
      nonTokeeUsers,
      tempheaders,
      navigation,
      (ResponseData, ErrorStr) => {
        apiSuccess(ResponseData, ErrorStr);
      }
    );
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
          .then(async (contacts) => {
            setContactLoaderModel(true);
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
            if (contactUploadStatus == null) {
              const data = {
                user_contacts: JSON.stringify(contactArr),
              };

              PostApiCall(
                uploadContacts,
                data,
                headers,
                navigation,
                (ResponseData, ErrorStr) => {
                  contactUploadApiResponse(ResponseData, ErrorStr);
                }
              );
            } else {
              const allContacts = await AsyncStorage.getItem("allcontacts");

              // Convert JSON string back to array
              const allContactsJSON = JSON.parse(
                 // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                allContacts
              );
 // eslint-disable-next-line
              const newContacts = contactArr.filter((upcomingContact: any) => {
                // Check if the phone_number of upcomingContact is not present in previousContacts
                return !allContactsJSON.some(
                   // eslint-disable-next-line
                  (previousContact: any) =>
                    previousContact.phone_number ===
                    upcomingContact.phone_number
                );
              });
              if (newContacts.length > 0) {
                const data = {
                  user_contacts: JSON.stringify(newContacts),
                };
                await AsyncStorage.setItem(
                  "allcontacts",
                  JSON.stringify(contactArr)
                );

                syncContacts(data);
              } else {
                setContactLoaderModel(false);
              }
            }
          })
          .catch(() => {
            setContactLoaderModel(false);
          });
      } else {
        if (Platform.OS === "android") {
          setContactLoaderModel(false);
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

        setContactLoaderModel(true);
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
            if (contactUploadStatus == null) {
              const data = {
                user_contacts: JSON.stringify(contactArr),
              };
              setContactLoaderModel(true);

              PostApiCall(
                uploadContacts,
                data,
                headers,
                navigation,
                (ResponseData, ErrorStr) => {
                  contactUploadApiResponse(ResponseData, ErrorStr);
                }
              );
            } else {
              //newcontacts
              const allContacts = await AsyncStorage.getItem("allcontacts");

              // Convert JSON string back to array
              const allContactsJSON = JSON.parse(
                 // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                allContacts
              );

               // eslint-disable-next-line
              const newContacts = contactArr.filter((upcomingContact: any) => {
                // Check if the phone_number of upcomingContact is not present in previousContacts
                return !allContactsJSON.some(
                   // eslint-disable-next-line
                  (previousContact: any) =>
                    previousContact.phone_number ===
                    upcomingContact.phone_number
                );
              });

              if (newContacts.length > 0) {
                const data = {
                  user_contacts: JSON.stringify(newContacts),
                };
                await AsyncStorage.setItem(
                  "allcontacts",
                  JSON.stringify(contactArr)
                );
                syncContacts(data);
              } else {
                setContactLoaderModel(false);
              }
            }
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
            setContactLoaderModel(false);
          });
      }
    } catch (error) {
      setContactLoaderModel(false);
    }
  };

   // eslint-disable-next-line
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
      checkNewlyAddedContacts,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        contactApiResponse(ResponseData, ErrorStr);
      }
    );
  };

   // eslint-disable-next-line
  const contactApiResponse = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setContactLoaderModel(false);
      // Navigate to another screen or handle the error in some way
    } else {
       // eslint-disable-next-line
      var tokeeContacts: any = [];
       // eslint-disable-next-line
      let nonTokeeContacts: any = [];

      ResponseData.data.contacts.forEach((element) => {
        if (element.is_register == true) {
          tokeeContacts.push(element);
        } else {
          nonTokeeContacts.push(element);
        }
      });
 // eslint-disable-next-line
      var AlltokeeContactstoSave: any = [];
       // eslint-disable-next-line
      var AllNontokeeContactstoSave: any = [];
      contactList.forEach((item) => {
        AllNontokeeContactstoSave.push(item);
      });

      contactsInTokee.forEach((item) => {
        AlltokeeContactstoSave.push(item);
      });
      //contactsInTokee

      if (nonTokeeContacts.length > 0) {
         // eslint-disable-next-line
        nonTokeeContacts.forEach((item: any) => {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          setContactList((prevDataArray) => [...prevDataArray, item]);
          AllNontokeeContactstoSave.push(item);
        });
      }

      if (tokeeContacts.length > 0) {
         // eslint-disable-next-line
        tokeeContacts.forEach((item: any) => {
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          setTokeeContacts((prevDataArray) => [...prevDataArray, item]);
          AlltokeeContactstoSave.push(item);
        });
      }


      // setContactList([...contactList,nonTokeeContacts]);

   


      setContactLoaderModel(false);
      const tokeeContactListTempString = JSON.stringify(AlltokeeContactstoSave);
      await AsyncStorage.setItem(
        "tokeeContactListTemp",
        tokeeContactListTempString
      );


      const contactListTempString = JSON.stringify(AllNontokeeContactstoSave);
      await AsyncStorage.setItem("contactListTemp", contactListTempString);

      setIsUIUpdated(!isUIUpdated);
      setContactLoaderModel(false);
    }
  };

  // **********  Method for return the api Response   ********** ///
   // eslint-disable-next-line
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setContactLoaderModel(false);
    } else {
      await AsyncStorage.setItem("isContactUploaded", "true");

      const tokeeContactListTemp = [];

      const contactListTemp = [];


      ResponseData.data.forEach((element) => {
        if (element.is_register == true) {
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          tokeeContactListTemp.push(element);
        } else {
           // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          contactListTemp.push(element);
        }
      });
      CheckIsRoomsBlockedforfriendlist(tokeeContactListTemp, (data) => {
        setTokeeContacts(data);
      });
    
      setContactList(contactListTemp);
      setContactLoaderModel(false);
      const tokeeContactListTempString = JSON.stringify(tokeeContactListTemp);
      const contactListTempString = JSON.stringify(contactListTemp);
      await AsyncStorage.setItem(
        "tokeeContactListTemp",
        tokeeContactListTempString
      );
      await AsyncStorage.setItem("contactListTemp", contactListTempString);
      setIsUIUpdated(!isUIUpdated);
      setContactLoaderModel(false);
      removeAllContactsFromServer();
    }
  };

  function removeAllContactsFromServer() {
    const tempheaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      // localization: globalThis.selectLanguage,
    };

    const urlStr = deleteAllContacts;
    GetApiCall(urlStr, tempheaders, navigation, (ResponseData, ErrorStr) => {
      DeleteContactApiSuccess(ResponseData, ErrorStr);
    });
  }

  
  const DeleteContactApiSuccess = async (
     // eslint-disable-next-line
    ResponseData: any,
     // eslint-disable-next-line
    ErrorStr: any
  ) => {};

  //**********    Method for Searchable Data from list    ********** ///
  const searchableData = (text: string) => {
    setIsLoading(true);
    setSearchValue(text);
    if (text !== "") {
      setIsLoading(true);
      const filter = contactsInTokee.filter((x) =>
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        x.contact_name.toLowerCase().includes(text.toLowerCase().trim())
      );
      const filter2 = contactList.filter((x) =>
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        x.contact_name.toLowerCase().includes(text.toLowerCase().trim())
      );

       // eslint-disable-next-line
      CheckIsRoomsBlockedforfriendlist(filter, (data: any) => {
        setTokeeContacts(data);
      });
      setContactList(filter2);
      setIsLoading(false);
    } else {
      getContactAllList();
    }
  };

  const clickCross = () => {
    setSearchValue("");
    getContactAllList();
  };

  const Inviteuser = () => {
    Share.share(shareOptions);
  };

  const message_data =
    "Lets chat on  Tokee, Join me at - https://play.google.com/store/apps/details?id=com.deucetek.tokee";
  const message_link =
    "Lets chat on IOS  Tokee, Join me at - https://apps.apple.com/fj/app/tokee-messenger/id1641356322";

  const shareOptions = {
    title: "Title",
    message: Platform.OS === "ios" ? message_link : message_data, // Note that according to the documentation at least one of "message" or "url" fields is required
    subject: "Subject",
  };

  const buttonPress = () => {
    navigation.navigate("BottomBar");
  };

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
  const newChattingPress = ({
    profileImage,
    contactName,
    chatId,
    FriendNumber,
     // eslint-disable-next-line
  }: any) => {
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
    dispatch(setProfileData({
      chat_user_id:chatId,
    }));
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


  const DATA = [
    {
      title: t("contacts_on"),
      data: contactsInTokee,
    },
    {
      title: t("invite_contacts"),
      data: contactList,
    },
  ];

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 15,
      marginTop: 20,
      zIndex: 1002,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    newGroupText: {
      color: iconTheme().iconColorNew,
      marginTop: 20,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    enterText: {
      color: COLORS.black,
      justifyContent: "center",
      height: 45,
      marginLeft: 10,
      fontSize: 15,
      width: "85%",
      fontFamily: font.bold(),
    },

    contectText: {
      color: COLORS.black,
      paddingTop: 20,
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
      paddingBottom: 10,
      backgroundColor: "white",
    },
    inviteText: {
      color: COLORS.black,
      marginTop: 5,
      fontSize: 17,
      fontFamily: font.semibold(),
      marginBottom: 10,
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.semibold(),
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
      backgroundColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
      borderRadius: 15,
      borderWidth: 1,
      height: 45,
      alignItems: "center",
      justifyContent: "center",
      width: 140,
      borderColor: "transparent",
      flexDirection: "row",
    },
    newChatIcon: {
      height: DeviceInfo.isTablet() ? 30 : 25,
      width: DeviceInfo.isTablet() ? 30 : 25,
      tintColor: iconTheme().iconColor,
      marginRight: 10,
    },
    newCallIcon: {
      height: 22,
      width: 22,
      tintColor: iconTheme().iconColor,
      marginRight: 10,
    },
    searchfIcon: {
      height: 20,
      width: 20,
      tintColor: "#CD98D1",
    },
    shareIcon: {
      height: DeviceInfo.isTablet() ? 27 : 22,
      width: DeviceInfo.isTablet() ? 27 : 22,
      tintColor: iconTheme().iconColor,
      marginRight: 10,
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
      height: windowHeight,
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },
    NoDataContainer: {
      marginTop: 100,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
    },

    name1Text: {
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.semibold(),
      color: COLORS.black,
      paddingLeft: 10,
      // height: 24,
    },
    name2Text: {
      marginTop: 2,
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.regular(),
      color: COLORS.black,
      paddingLeft: 10,
      // height: 24,
    },
    profile1Container: {
      marginTop: 10,
      flexDirection: "row",
      height: 60,
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
    },

    profile2Container: {
      flexDirection: "row",
      marginTop: 10,
      height: 60,
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
    },
    nameContainer: {
      marginLeft: 20,
      justifyContent: "center",
      margin: 0,
      marginBottom: 10,
      width: "50%",
    },
    naContainer: {
      justifyContent: "center",
      margin: 0,
      width: "70%",
      flexDirection: "column",
    },
    listContainer: {
      justifyContent: "center",
      margin: 5,
      marginTop: 10,
      flexDirection: "column",
    },
    Container: {
      justifyContent: "center",
      alignItems: "center",
      width: "15%",
    },
    Container2: {
      justifyContent: "center",
      alignItems: "center",
      width: "15%",
    },
    circleImageLayout: {
      width: DeviceInfo.isTablet() ? 60 : 50,
      height: DeviceInfo.isTablet() ? 60 : 50,
      borderRadius: DeviceInfo.isTablet() ? 30 : 25,
    },
    nameInviteContainer: {
      justifyContent: "center",
      margin: 0,
      width: "60%",
      flexDirection: "column",
    },
    editProfile: {
      marginLeft: 10,
      flexDirection: "row",
      width: "25%",
      justifyContent: "center",
      alignItems: "flex-end",
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
    searchIcon: {
      borderRadius: 20,
      borderWidth: 1,
      marginLeft: 10,
      height: 45,
      justifyContent: "center",
      alignItems: "center",
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
    searchText: {
      borderRadius: 20,
      alignItems: "flex-start",
      borderColor: "transparent",
      justifyContent: "center",
      width: "90%",
    },
    editProfile2: {
      width: "15%",
      alignItems: "flex-end",
      justifyContent: "center",
    },
    item: {
      backgroundColor: "#f9c2ff",
      padding: 20,
      marginVertical: 8,
    },
    header: {
      fontSize: 32,
      backgroundColor: "#fff",
    },
    title: {
      fontSize: 24,
    },
    footer: {
      padding: 10,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    loadMoreBtn: {
      padding: 10,
      backgroundColor: "#800000",
      borderRadius: 4,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    btnText: {
      color: "white",
      fontSize: 15,
      textAlign: "center",
    },
  });

   // eslint-disable-next-line
  function ContactItem({ item, index }: any) {
    return (
      <TouchableOpacity
        disabled={route.params.data == "NewCall" ? true : false}
        style={styles.profile1Container}
        onPress={() =>
          route.params.data == "NewCall"
            ? null
            : newChattingPress({
                profileImage: item.profile_image,
                contactName: item.contact_name,
                chatId: item.chat_user_id,
                FriendNumber: item.phone_number,
              })
        }
      >
        <View style={styles.Container} key={index}>
          <Image
            source={
              item.thumbnail ? {uri:item.thumbnail} 
                 : item.profile_image ? { uri: item.profile_image }
                : {
                    uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                  }
            }
            style={styles.circleImageLayout}
            resizeMode="cover"
          />
        </View>

        <View style={styles.nameInviteContainer}>
        <View style={{flexDirection:"row"}}>
          <Text style={styles.name1conText}>{item.contact_name}</Text>
          { item?.premium == "1"  && 
          <Image
                source={require("../../Assets/Icons/bx_star_dark.png")}
                style={{height:15, width:15,marginTop:2, tintColor:iconTheme().iconColorNew}}
              />
              } 
              </View>
          <Text style={[styles.name2conText]}>+{item.phone_number}</Text>
        </View>
        {route.params.data == "NewCall" && item.isBlocked == false ? (
          <View
            style={[
              styles.editProfile,
              { justifyContent: "space-between", alignItems: "center" },
            ]}
          >
            <TouchableOpacity
              style={{ justifyContent: "center", alignItems: "center" }}
              onPress={() =>
                onCallPress({
                  call_type: "video",
                  contact_image: item.profile_image,
                  contact_name: item.contact_name,
                  contact_chat_id: item.chat_user_id,
                  contact_id: item.contact_id,
                })
              }
              disabled={
                callState?.state === "active" ? true : false
              }
            >
              <Image
                source={require("../../Assets/Icons/Video.png")}
                style={[styles.newChatIcon]}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                onCallPress({
                  call_type: "audio",
                  contact_image: item.profile_image,
                  contact_name: item.contact_name,
                  contact_chat_id: item.chat_user_id,
                  contact_id: item.contact_id,
                })
              }
              disabled={
                callState?.state === "active" ? true : false
              }
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <Image
                source={require("../../Assets/Icons/CallBottom.png")}
                style={styles.newCallIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }

   // eslint-disable-next-line
  function InviteItem({ item }: any) {
    return (
      <View style={[styles.profile2Container, {}]}>
        <View style={styles.Container2}>
          <Image
            source={
              item.thumbnail
                ? { uri: item.thumbnail } : item.profile_image ? {uri: item.profile_image}
                : {
                    uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                  }
            }
            style={styles.circleImageLayout}
            resizeMode="cover"
          />
        </View>

        <View style={styles.naContainer}>
          <Text style={styles.name1Text}>{item.contact_name}</Text>
          <Text style={[styles.name2Text]}>+{item.phone_number}</Text>
        </View>

        <TouchableOpacity
          style={styles.editProfile2}
          onPress={() => {
            Inviteuser();
          }}
        >
          <Image
            source={require("../../Assets/Icons/Share.png")}
            style={styles.shareIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  }

  // ********** Logout Api Calling method    ********** ///

  // Define the verify_chat function
  const verify_chat = (phoneNumber: string, phoneCountryCode: string) => {
    if (phoneCountryCode + phoneNumber == globalThis.phone_number) {
      setAddUserModel(false);
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

  // **********  Method for return the api Response   ********** ///
   // eslint-disable-next-line
  const apiSuccessVerify = (ResponseData: any, ErrorStr: any,data_user:any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [
        { text: t("cancel") },
        { text: t("inviteUser"), onPress: () => Inviteuser() },
      ]);

      setAddUserModel(false);
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

        setAddUserModel(false);
        setContactLoaderModel(false);
      } else {
        setContactLoaderModel(false);
        setAddUserModel(false);
        Alert.alert("User does not exist.");
      }
    }
  };

   // eslint-disable-next-line
  function AfterChoosingGroupType(value: any) {
    setGroupTypeModal(false);
    newGroupPress(value);
  }

  const clickQrCode = () => {
    // setQrCodeScannerModel(true)
    navigation.navigate("QrScannerScreen");
  };
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <GroupTypeModal
        visible={isGroupTypeModal}
        onRequestClose={() => setGroupTypeModal(false)}
        onNextClick={AfterChoosingGroupType}
      />
      <InviteUsereModel
        visible={inviteUserModel}
        onRequestClose={() => setInviteUserModel(false)}
        cancel={() => setInviteUserModel(false)}
        clickAblelData={clickAblelData}
      />
      <AddUsereModel
        // {...props}
        visible={addUserModel}
        onRequestClose={() => setAddUserModel(false)}
        cancel={() => setAddUserModel(false)}
        verify_chat={verify_chat}
      />
      <ContactLoaderModel visible={conatctLoaderModel} />

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
            route.params.data == "NewCall" ? t("new_call") : t("new_chats")
          }
          filterIcon={true}
          personIcon={true}
          QrScanner={false}
          clickPerson={clickPerson}
          clickScan={clickScan}
          clickQrScanner={clickQrCode}
          checked={
            globalThis.selectTheme
          }
        />
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {
          globalThis.selectTheme === "christmas" ||
          globalThis.selectTheme === "newYear" || 
          globalThis.selectTheme === "newYearTheme" || 
          globalThis.selectTheme === "mongoliaTheme" ||
          globalThis.selectTheme === "mexicoTheme" || 
          globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={
                route.params.data == "NewCall"
                  ? callTop().BackGroundImage
                  : chatTop().BackGroundImage
              }
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
        <SearchBar
          search={searchableData}
          value={searchValue}
          clickCross={clickCross}
          placeHolder= {t("search")}  
        />
        {route.params.data == "NewCall" ? null : (
          <View>
            <TouchableOpacity
              onPress={() => setGroupTypeModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.newGroupText}>{t("new_group")}</Text>
            </TouchableOpacity>
          </View>
        )}
        {route.params.data == "NewCall" ? null : (
          <View>
            <TouchableOpacity
              onPress={() => newBroadCastPress()}
              activeOpacity={0.7}
            >
              <Text style={styles.newGroupText}>{t("new_broadcast")}</Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionList
          showsVerticalScrollIndicator={false}
          sections={DATA}
          onEndReachedThreshold={0.1}
          keyExtractor={(item, index) => index.toString() + item}
          renderItem={({ item }) => {
             // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            if (item.is_register == true) {
              return (
                <ContactItem
                  item={item}
                  conatctLoaderModel={conatctLoaderModel}
                />
              );
              
            } else {
              return <InviteItem item={item} />;
            }
          }}
          renderSectionHeader={({ section }) => (
            <View>
              <Text style={styles.contectText}>{section.title}</Text>
              {isLoading && (
                <ActivityIndicator
                  style={{ marginTop: 10 }}
                  size="large"
                  color={textTheme().textColor}
                />
              )}
            </View>
          )}
          ListFooterComponent={() => {
            return <View style={{ height: 150 }}></View>;
          }}
        />
      </View>
    </MainComponent>
  );
}
