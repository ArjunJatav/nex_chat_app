import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Contacts from "react-native-contacts"; //@ts-ignore
import CryptoJS from "react-native-crypto-js";
import { useDispatch, useSelector } from "react-redux";
import { PostApiCall } from "../../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { font } from "../../../Components/Fonts/Font";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import SearchBar from "../../../Components/SearchBar/SearchBar";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import TopBar from "../../../Components/TopBar/TopBar";
import {
  chatBaseUrl,
  get_by_phone_number,
  groupEditApi,
  groupUpdateApi,
} from "../../../Constant/Api";
import { EncryptionKey } from "../../../Constant/Key";
import { chatTop } from "../../../Navigation/Icons";
import { socket } from "../../../socket";
import {
  addMembersToRoomMembersSql,
  addMembersToRoomMembersSqlnew,
  insertContact,
  insertContactIOS,
  removeAllMembersFromRoomMembersSql,
} from "../../../sqliteStore";
import { ContactLoaderModel } from "../../Modals/ContactLoaderModel";
import ToShowContactName from "../../calling/components/ContactShow";
import {
  updateAppState,
  updatedmembersall,
} from "../../../reducers/getAppStateReducers";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
import { encryptMessage } from "../../../utils/CryptoHelper";

const isDarkMode = true;
const data = [
  { id: 1, name: "Kyung", contact: "+91-9065812452", isChecked: false },
];
export default function AddMembersScreen({ navigation, route }: any) {
  const dispatch = useDispatch();
  const windowWidth = Dimensions.get("window").width;
  const { colorTheme } = useContext(ThemeContext);
  const [selected, setSelected] = React.useState([]);
  const [searchValue, setSearchValue] = useState("");
  const windowHeight = Dimensions.get("window").height;
  const [contactsInTokee, setTokeeContacts] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [allContactList, setALLContactList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [conatctLoaderModel, setContactLoaderModel] = useState(true);
  const [errorAlertModel, setErrorAlertModel] = useState(false);

  const [allContactsInTokee, setallContactsInTokes] = useState([]);

  const [contactInviteList, setContactInviteList] = useState([]);

  const membersupdated = useSelector(
    //@ts-ignore
    (state) => state?.getAppStateReducers?.membersupdated
  );

  const buttonPress = () => {
    navigation.pop();
  };
  const sendMemberNotify = (membersArray: any, type: any) => {
    console.log("dddddddddddddddddddddddddddddddd", membersArray);
    const mId = Math.floor(Math.random() * 9000) + 1000;
    let finalString = "";
    if (membersArray.length <= 0) {
      return;
    }

    if (type == "add") {
      let addMemberString = `Admin Added `;
      if (membersArray.length == 1) {
        addMemberString += membersArray[0].name;
      } else {
        addMemberString += membersArray[0].name + ", ";
        membersArray
          .slice(1)
          .forEach((member: any) => (addMemberString += member.name + ", "));
        addMemberString = addMemberString.slice(0, -2);
      }

      finalString = addMemberString;
    } else if (type == "remove") {
      let removeMemberString = `Admin Removed `;
      if (membersArray.length == 1) {
        removeMemberString += membersArray[0].userName || membersArray[0].name;
      } else {
        removeMemberString +=
          membersArray[0].userName || membersArray[0].name + ", ";
        membersArray
          .slice(1)
          .forEach(
            (member: any) =>
              (removeMemberString += member.userName || member.name + ", ")
          );
        removeMemberString = removeMemberString.slice(0, -2);
      }
      finalString = removeMemberString;
    }

    const paramsOfSendlive = {
      isNotificationAllowed: true, //@ts-ignore
      userName: globalThis.displayName, //@ts-ignore
      userImage: globalThis.image,
      roomId: route.params?.roomId,
      roomName: route.params?.groupName,
      roomImage: route.params?.groupImage,
      roomType: route.params?.grouptyp, //@ts-ignore
      roomOwnerId: globalThis.userChatId,
      message: encryptMessage(route.params?.roomId,  finalString),//CryptoJS.AES.encrypt(finalString, EncryptionKey).toString(),
      message_type:
        route.params?.grouptyp == "broadcast" ? "broadcast_notify" : "notify",
      roomMembers: [],
      isForwarded: false,
      attachment: [], //@ts-ignore
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

  var count = 1;

  const UpdateGroupApiCalling = async (grpMembers: any) => {
    let chatIds = grpMembers.map((data: any) => data.id); //@ts-ignore
    chatIds.push(globalThis.userChatId);
    console.log("globalThis.userChatId >>>>>", globalThis.userChatId);
    chatIds = chatIds.filter(function (item, pos) {
      return chatIds.indexOf(item) == pos;
    });
    console.log("chat ids >>>>>", chatIds);

    setLoading(true);
    const members = grpMembers.map((m: any) => {
      return {
        chat_user_id: m.id,
        contact_name: m.contact_name,
        profile_image: m.profile_image,
        phone_number: m.contact,
        name: m.userName || m.contact_name,
        isAdmin: m.id == globalThis.userChatId ? true : m.isAdmin, //@ts-ignore
        userName: m.userName || m.contact_name,
      };
    });
    console.log("route.params.groupMembers", route.params.groupMembers);
    let removedMembers = route.params.groupMembers.filter(
      (obj2: any) =>
        !members.some((obj1: any) => obj1["chat_user_id"] == obj2["userId"])
    );
    removedMembers = removedMembers.filter(
      //@ts-ignore
      (m) => m.userId != globalThis.chatUserId
    );
    sendMemberNotify(removedMembers, "remove");
    const urlStr = chatBaseUrl + groupUpdateApi;

    console.log("sendddddtoooo", {
      userId: globalThis.userChatId,
      roomId: route.params.roomId,
      members: [...chatIds],
    });
    try {
      await axios({
        method: "post",
        url: urlStr,
        headers: {
          Accept: "application/json",
        },
        data: {
          //@ts-ignore
          userId: globalThis.userChatId,
          roomId: route.params.roomId,
          //@ts-ignore
          members: [...chatIds],
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            // removeAllMembersFromRoomMembersSql(route.params.roomId, () => {
            //   addMembersToRoomMembersSql(members, route.params.roomId);
            // });
            console.log("membersupdated", membersupdated);

            addMembersToRoomMembersSqlnew(members, route.params.roomId, () => {
              count = count + 1;
              dispatch(updateAppState({ updatemediauseeeffect: count + 1 }));
              const myObj = {
                chat_user_id: globalThis.userChatId,
                contact_name: globalThis.displayName,
                isAdmin: 1,
                name: globalThis.displayName,
                phone_number: globalThis.phone_number,
                profile_image: globalThis.image,
                userName: globalThis.displayName,
              };
              dispatch(updatedmembersall(membersupdated));
            });

            let membersIds = route.params.groupMembers.map(
              (m: any) => m.userId
            ); //@ts-ignore
            membersIds.push(globalThis.userChatId);

            let newMembers = members.filter(
              (m: any) => !membersIds.includes(m.userId)
            );

            const temp = newMembers.map((m: any) => m.chat_user_id);
            membersIds = [...membersIds, ...temp];
            console.log("members:::", members);
            const myObj = {
              chat_user_id: globalThis.chatUserId,
              contact_name: globalThis.userName,
              isAdmin: 1,
              name: globalThis.userName,
              phone_number: globalThis.phone_number,
              profile_image:globalThis.image,
              userName: globalThis.userName,
            };
            const arr = [...members,myObj]
            socket.emit("updateGroupDetails", {
              new_group_name: route.params.groupName,
              new_group_description: route.params.groupdescription,
              new_group_allow: route.params.groupAllow,
              new_group_image: route.params.groupImage,
              remaningMembers: arr,
              membersList: membersIds,
              roomId: route.params.roomId, //@ts-ignore
              owner: route.params.owner,
            });
            let newAddedMembers = members.filter(
              (obj1: any) =>
                !route.params.groupMembers.some(
                  (obj2: any) => obj2["userId"] == obj1["chat_user_id"]
                )
            );

            newAddedMembers = newAddedMembers.filter(
              //@ts-ignore
              (m) => m["chat_user_id"] != globalThis.userChatId
            );
            sendMemberNotify(newAddedMembers, "add");
            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch((error) => {
          setLoading(false);
        });
    } catch (error) {
      console.log("Error is : ", error);
      setLoading(false);
    }
  };

  const buttonPress2 = () => {
    setLoading(true);
    UpdateGroupApiCalling(selected);
    navigation.pop(2);
  };

  // **********   Headers for api ********** ///
  let headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    //@ts-ignore
    "Content-Type": "multipart/form-data",
    //@ts-ignore
    Authorization: "Bearer " + globalThis.Authtoken, //@ts-ignore
    localization: globalThis.selectLanguage,
  };

  const callState = useSelector(
    (state: any) => state?.VoipReducer?.call_state || {}
  );
  //@ts-ignore
  const getContactAllList = async (selected_products) => {
    // setIsLoading(true);

    // Retrieve from AsyncStorage
    const storedTokeeContactListTempString = await AsyncStorage.getItem(
      "tokeeContactListTemp"
    );
    const storedContactListTempString = await AsyncStorage.getItem(
      "contactListTemp"
    );

    // Convert JSON string back to array

    const storedTokeeContactListTemp = JSON.parse(
      //@ts-ignore
      storedTokeeContactListTempString
    );
    //@ts-ignore
    const storedContactListTemp = JSON.parse(storedContactListTempString);

    // Update the state with retrieved values
    if (storedTokeeContactListTemp || storedContactListTemp !== null) {
      const chatIds = selected_products.map((m: any) => m.id);
      const temp = storedTokeeContactListTemp.map((m: any) => {
        if (chatIds.includes(m.chat_user_id)) {
          return { ...m, isChecked: true };
        } else {
          return { ...m, isChecked: false };
        }
      });
      setTokeeContacts(temp || []);

      setContactList(storedContactListTemp || []);
      //  setIsLoading(false);
    }
    await AsyncStorage.setItem(
      "tokeeContactListTemp",
      //@ts-ignore
      JSON.stringify(tokeeContactListTemp)
    );
    //@ts-ignore
    await AsyncStorage.setItem(
      "contactListTemp", //@ts-ignore
      JSON.stringify(contactListTemp)
    );
  };

  useEffect(() => {
    let selected_products = route.params.groupMembers.map((member: any) => {
      return {
        contact_name: member.userName || member.name,
        profile_image: member.image,
        id: member.userId,
        contact: String(member.phone_number).substr(-10),
        isChecked: true,
        isAdmin: member.userId == member.owner ? true : member.isAdmin,
        owner: member.owner,
        name: member.name,
        userName: member.userName || member.name,
      };
    });

    setSelected(selected_products);
    getContactUploadStatus(selected_products);
  }, []);
  // console.log("selected_products",route.params.groupMembers)
  //@ts-ignore
  const getContactUploadStatus = async (selected_products) => {
    setTokeeContacts([]);
    setContactLoaderModel(true);
    let Status = await AsyncStorage.getItem("isContactUploaded");
    if (Status == null) {
      requestContactsPermission();
    } else {
      setContactLoaderModel(false);
      getContactAllList(selected_products);
    }
  };

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
        Contacts.getAll()
          .then((contacts) => {
            setContactLoaderModel(true);
            //@ts-ignore
            var contactArr: Array = [];
            contacts.forEach((item) => {
              item.phoneNumbers.forEach((contactPhone) => {
                const phoneNumber = contactPhone.number;
                // Check if the phone number is not in the Set, and if not, add it to the array and the Set
                if (!uniquePhoneNumbers.has(phoneNumber)) {
                  uniquePhoneNumbers.add(phoneNumber);
                  var trimNumber = phoneNumber.toString();
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

            let data = {
              //@ts-ignore
              user_contacts: JSON.stringify(contactArr),
            };

            PostApiCall(
              get_by_phone_number,
              data,
              headers,
              navigation,
              (ResponseData, ErrorStr) => {
                apiSuccess(ResponseData, ErrorStr);
              }
            );
          })
          .catch((e) => {
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
          .then((contacts) => {
            //@ts-ignore
            var contactArr: any = [];
            contacts.forEach((item) => {
              item.phoneNumbers.forEach((contactPhone) => {
                const phoneNumber = contactPhone.number;
                // Check if the phone number is not in the Set, and if not, add it to the array and the Set
                if (!uniquePhoneNumbers.has(phoneNumber)) {
                  uniquePhoneNumbers.add(phoneNumber);
                  var trimNumber = phoneNumber.toString();
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
            let data = {
              //@ts-ignore
              user_contacts: JSON.stringify(contactArr),
            };

            PostApiCall(
              get_by_phone_number,
              data,
              headers,
              navigation,
              (ResponseData, ErrorStr) => {
                apiSuccess(ResponseData, ErrorStr);
              }
            );
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

  // **********  Method for return the api Response   ********** ///
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      globalThis.errorMessage = ErrorStr;
      setContactLoaderModel(false);
      setErrorAlertModel(true);
    } else {
      await AsyncStorage.setItem("isContactUploaded", "true");
      //@ts-ignore
      var tokeeContactListTemp = [];
      //@ts-ignore
      let contactListTemp = [];

      //@ts-ignore
      ResponseData.data.forEach((element) => {
        if (element.is_register == true) {
          tokeeContactListTemp.push(element);
        } else {
          contactListTemp.push(element);
        }
      });

      setALLContactList(ResponseData.data);
      //@ts-ignore
      const chatIds = selected.map((m) => m.id); //@ts-ignore
      const temp = tokeeContactListTemp.map((m) => {
        if (chatIds.includes(m.chat_user_id)) {
          return { ...m, isChecked: true };
        } else {
          return { ...m, isChecked: false };
        }
      }); //@ts-ignore
      setTokeeContacts(temp);
      //@ts-ignore
      setallContactsInTokes(tokeeContactListTemp);
      //@ts-ignore
      setContactList(contactListTemp);
      //@ts-ignore
      setContactInviteList(contactListTemp);
      //@ts-ignore

      setContactLoaderModel(false);
      //@ts-ignore
      const tokeeContactListTempString = JSON.stringify(tokeeContactListTemp);
      //@ts-ignore
      const contactListTempString = JSON.stringify(contactListTemp);
      await AsyncStorage.setItem(
        "tokeeContactListTemp",
        tokeeContactListTempString
      );
      await AsyncStorage.setItem("contactListTemp", contactListTempString);
      // setIsUIUpdated(!isUIUpdated);
      setContactLoaderModel(false);
    }
  };

  // **********    Method for Select the Data from the list   ********** ///
  const handleChange = (userId: any) => {
    let selected_product = contactsInTokee.filter(
      (product: any) => userId == product.chat_user_id
    );
    let new_selected_product = {
      //@ts-ignore
      contact: selected_product[0].phone_number, //@ts-ignore
      contact_name: selected_product[0].contact_name, //@ts-ignore
      id: selected_product[0].chat_user_id, //@ts-ignore
      profile_image: selected_product[0].profile_image, //@ts-ignore
      name: selected_product[0].name, //@ts-ignore
      userName: selected_product[0].name,
      isAdmin: false,
    };

    let temp = contactsInTokee.filter(
      //@ts-ignore
      (product: any) => phone_number !== product.phone_number
    ); //@ts-ignore
    const idx = contactsInTokee.findIndex((m) => m.chat_user_id == userId);
    if (idx) {
      //@ts-ignore
      contactsInTokee[idx].isChecked = true;
    } //@ts-ignore
    const isAlreadyAvail = selected.find((m) => m.id == userId);
    if (isAlreadyAvail) {
      return;
    }
    // setTokeeContacts(temp);
    if (
      selected_product.length > 0
      // selected.find((m) => m.contact != phone_number)
    ) {
      //@ts-ignore
      setSelected((selected) => [...selected, new_selected_product]);
    }
  };
  const handleChange2 = (userId: any) => {
    let selected_product = selected.filter(
      (product: any) => userId == product.id
    );
    let new_selected_product = {
      //@ts-ignore
      chat_user_id: selected_product[0].id, //@ts-ignore
      contact_name: selected_product[0].contact_name, //@ts-ignore
      profile_image: selected_product[0].profile_image, //@ts-ignore
      phone_number: selected_product[0].contact, //@ts-ignore
      name: selected_product[0].name,
    };

    let temp = selected.filter((product: any) => userId !== product.id);
    //@ts-ignore
    const idx = contactsInTokee.findIndex((s) => s.chat_user_id == userId);
    if (idx >= 0) {
      //@ts-ignore
      contactsInTokee[idx].isChecked = false;
    }
    setSelected(temp);
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: 20,
    },
    newGroupText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginTop: 15,
      fontSize: 15,
      fontFamily: font.bold(),
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
    seachContainer: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginTop: 15,
      height: 45,
      borderRadius: 20,
      fontFamily: font.bold(),
      backgroundColor: "#F0E0F1",
      flexDirection: "row",
      width: "100%",
    },

    cancelText: {
      color: appBarText().textColor,
      fontSize: 15,
      fontFamily: font.medium(),
    },
    noDataText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.black,
      fontSize: 15,
      fontFamily: font.bold(),
    },
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
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
      height: 10,
      width: 10,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    newCallIcon: {
      height: 22,
      width: 22,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginRight: 10,
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
      height: "90%",
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
    nameText: {
      fontSize: 12,
      fontFamily: font.bold(),
      color: COLORS.black,
      marginBottom: 5,
    },
    profile1Container: {
      paddingVertical: Platform.OS == "ios" ? 10 : 5,
      flexDirection: "row",
      // height: 60,
      borderBottomWidth: 1,
      borderBottomColor: "#EAEAEA",
    },
    profile1Container2: {
      marginTop: 10,
      flexDirection: "row",
      height: 60,
      justifyContent: "flex-start",
    },
    nameContainer: {
      marginLeft: 20,
      justifyContent: "center",
      margin: 0,
      marginBottom: 10,
      width: "50%",
    },
    Container: {
      justifyContent: "center",
      width: "15%",
    },
    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    nameInviteContainer: {
      justifyContent: "center",
      margin: 0,
      width: "65%",
      flexDirection: "column",
    },
    editProfile: {
      marginLeft: 10,
      flexDirection: "row",
      width: "20%",
      justifyContent: "center",
      alignItems: "center",
    },
    name1conText: {
      marginBottom: 0,
      fontSize: 14,
      fontFamily: font.semibold(),
      color: COLORS.black,
      paddingLeft: 10,
      height: 24,
    },
    name2conText: {
      fontSize: 14,
      fontFamily: font.regular(),
      color: COLORS.black,
      paddingLeft: 10,
      height: 24,
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
  });

  //**********    Method for Searchable Data from list    ********** ///
  const searchableData = (text: string) => {
    setSearchValue(text);
    if (text !== "") {
      let filter = contactsInTokee.filter((x) =>
        //@ts-ignore
        x.contact_name.toLowerCase().includes(text.toLowerCase())
      );

      setTokeeContacts(filter);
    } else {
      // getContactAllList();
    }
  };

  function clearInput() {
    setSearchValue("");
    searchableData("");
    //getContactAllList();
  }

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        <ContactLoaderModel visible={conatctLoaderModel} />
        <ErrorAlertModel
          visible={errorAlertModel}
          onRequestClose={() => setErrorAlertModel(false)}
          errorText={globalThis.errorMessage}
          cancelButton={() => setErrorAlertModel(false)}
        />
        <View>
          {Platform.OS == "android" ? (
            <CustomStatusBar
              barStyle={isDarkMode ? "dark-content" : "dark-content"}
              backgroundColor={themeModule().theme_background}
            />
          ) : null}
        </View>

        {/* topbar */}

        <TopBar showTitle={true} title={t("addMembers")} />

        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => buttonPress2()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("save")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* // **********    TopBar   ********** /// */}

        {
          //@ts-ignore
          globalThis.selectTheme === "christmas" || //@ts-ignore
          globalThis.selectTheme === "newYear" || //@ts-ignore
          globalThis.selectTheme === "newYearTheme" || //@ts-ignore
          globalThis.selectTheme === "mongoliaTheme" || //@ts-ignore
          globalThis.selectTheme === "indiaTheme" ||
          globalThis.selectTheme === "englandTheme" ||
          globalThis.selectTheme === "americaTheme" ||
          globalThis.selectTheme === "mexicoTheme" || //@ts-ignore
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
          ) : null
        }
      </View>
      <View style={styles.chatContainer}>
        {/* // **********    View For SearchBar     ********** /// */}
        <SearchBar
          search={searchableData}
          value={searchValue}
          clickCross={clearInput}
          placeHolder={t("search")}
        />

        <View style={{ marginBottom: 10, height: 80 }}>
          {/* // **********    FlatList for Show the Selected Data     ********** /// */}

          <FlatList
            horizontal
            data={selected}
            renderItem={({ item, index }: any) => {
              if (item.id != globalThis.userChatId && item.id != item.owner) {
                return (
                  // Add return here
                  <TouchableOpacity
                    style={[styles.profile1Container2]}
                    onPress={() => handleChange2(item.id)}
                  >
                    <View
                      style={{ paddingHorizontal: 10, width: 80 }}
                      key={index}
                    >
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          right: 10,
                          zIndex: 10,
                          justifyContent: "center",
                          alignItems: "center",
                          height: 20,
                          width: 20,
                          borderRadius: 50,
                          backgroundColor: COLORS.light_pink,
                        }}
                        onPress={() => handleChange2(item.id)}
                      >
                        <Image
                          source={require("../../../Assets/Icons/Cross.png")}
                          style={styles.newChatIcon}
                        />
                      </TouchableOpacity>
                      <Image
                        source={
                          item.profile_image
                            ? { uri: item.profile_image }
                            : require("../../../Assets/Image/girl_profile.png")
                        }
                        style={styles.circleImageLayout}
                        resizeMode="cover"
                      />
                      <Text numberOfLines={1}>{item.contact_name}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }
              return null; // Return null for items that don't match the condition
            }}
          />
        </View>

        {/* // **********    View for FlatList      ********** /// */}
        <View style={{ marginBottom: 10, height: windowHeight }}>
          <ScrollView nestedScrollEnabled={true}>
            <FlatList
              data={contactsInTokee}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              renderItem={({ item, index }: any) => (
                <TouchableOpacity
                  style={[styles.profile1Container]}
                  onPress={() => {
                    handleChange(item.chat_user_id);
                  }}
                >
                  <View style={styles.Container} key={index}>
                    <Image
                      source={
                        item.profile_image
                          ? { uri: item.profile_image }
                          : require("../../../Assets/Image/girl_profile.png")
                      }
                      style={styles.circleImageLayout}
                      resizeMode="cover"
                    />
                  </View>

                  {/* // **********   View for Name and Cintect number Show    ********** /// */}
                  <View style={styles.nameInviteContainer}>
                    <Text style={styles.name1conText}>{item.contact_name}</Text>
                    <Text style={styles.name2conText}>
                      +{item.phone_number}
                    </Text>
                  </View>

                  {/* // **********   View for RedioButton    ********** /// */}
                  <View style={styles.editProfile}>
                    <View
                      style={{
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor: item.isChecked ? "green" : "grey",
                        padding: 2,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: item.isChecked ? "green" : "white",
                          borderColor: item.isChecked ? "grey" : "red",
                          borderRadius: 25,
                          height: 20,
                          width: 20,
                        }}
                      ></View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListFooterComponent={() => {
                return <View style={{ height: 500 }}></View>;
              }}
            />
          </ScrollView>
        </View>
      </View>
    </MainComponent>
  );
}
