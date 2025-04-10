import axios from "axios";
import { t } from "i18next";
import React, { useContext, useEffect, useState } from "react";
import CryptoJS from "react-native-crypto-js";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { useDispatch, useSelector } from "react-redux";
import { badword } from "../../../Components/BadWord/Bad_words";
import {
  COLORS,
  appBarText,
  searchBar,
  textTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { font } from "../../../Components/Fonts/Font";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import TopBar from "../../../Components/TopBar/TopBar";
import renderIf from "../../../Components/renderIf";
import {
  addMemberApi,
  chatBaseUrl,
  groupEditApi,
  groupUpdateApi,
} from "../../../Constant/Api";
import { EncryptionKey, translationKey } from "../../../Constant/Key";
import { chatTop } from "../../../Navigation/Icons";
import { setroominfo } from "../../../Redux/ChatHistory";
import { socket } from "../../../socket";
import { updateroominfo } from "../../../sqliteStore";
import { LoaderModel } from "../../Modals/LoaderModel";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encryptMessage } from "../../../utils/CryptoHelper";
import { getRemainingSuspensionDays, updateViolationAttempt } from "../../agora/agoraHandler";
import WarningModal from "../../Modals/WarningModal";
import {
  setUserBanned,
  setUserSuspendedDays,
} from "../../../reducers/userBanSlice";

const isDarkMode = true;
const data = [
  { id: 1, name: "Eun Kyung", contact: "+91-9065812452", isChecked: false },
];
const windowWidth = Dimensions.get("window").width;
let banType = "Warning";
let banMessage = "";
let banTitle = "";

export default function EditGroupScreen({ props, navigation, route }: any) {
  const windowHeight = Dimensions.get("window").height;
  const dispatch = useDispatch();
  const { colorTheme } = useContext(ThemeContext);
  const newroomID = useSelector((state: any) => state.chatHistory.newroomID);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = React.useState(data);
  const [checked, setChecked] = useState("second");
  const [groupName, setGroupName] = useState(route.params.groupName);
  const [groupImage, setGroupImage] = useState(route.params.groupImage);
  const [grouptyp, setgrouptyp] = useState(route.params.allow);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [grpmembers, setgrpmembers] = useState<any>(
    route.params.groupDetailData
  );
  const [groupdescription, setGroupDescription] = useState(
    route.params.userstatus ? route.params.userstatus : t("no_description")
  );
  const newroomType = useSelector(
    (state: any) => state.chatHistory.newroomType
  );
  const [isPublic, setIsPublic] = useState(
    route.params.isPublic ? "public" : "private"
  );

  React.useEffect(() => {
    socket.on("connect_error", (error: any) => {
      socket.connect;

      // Handle the error (e.g., display an error message)
    });
  }, [socket]);

  const buttonPress = () => {
    navigation.pop();
  };

  const sendMemberNotify = (username: any, type: any) => {
    const mId = Math.floor(Math.random() * 9000) + 1000;
    let finalString = "";
    if (type == "add") {
    } else if (type == "remove") {
      let removeMemberString = `Admin Removed ${username}`;
      finalString = removeMemberString;
    }

    const paramsOfSendlive = {
      isNotificationAllowed: true,
      userName: globalThis.displayName,
      userImage: globalThis.image,
      roomId: newroomID,
      roomName: groupName,
      roomImage: groupImage,
      roomType: newroomType,
      roomOwnerId: globalThis.userChatId,
      message: encryptMessage(newroomID, finalString), //CryptoJS.AES.encrypt(finalString, EncryptionKey).toString(),
      message_type: newroomType == "broadcast" ? "broadcast_notify" : "notify",
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

    console.log("sdfsdsfsdfdsf", paramsOfSendlive);

    socket.emit("sendmessage", paramsOfSendlive);
  };

  const removeMember = async (roomID: any, UserID: any, username: any) => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const bodydata = JSON.stringify({
      //@ts-ignore
      userId: globalThis.userChatId,
      roomId: roomID,
      members: [UserID],
      operation: "REMOVE",
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: bodydata,
    };
    const response = await fetch(chatBaseUrl + addMemberApi, requestOptions);
    const data = await response.json();
    if (data.status === true) {
      sendMemberNotify(username, "remove");
      const chatIds = grpmembers.map((m) => m.userId);

      let remaningMembers = grpmembers.filter((m: any) => m.userId != UserID);
      remaningMembers = remaningMembers.map((m: any) => {
        return {
          chat_user_id: m.userId,
          contact_name: m.userName ?? m.name ?? "Tokee User",
          profile_image: m.image,
          phone_number: m.phone_number,
          isAdmin: m.isAdmin,
        };
      });

      socket.emit("updateGroupDetails", {
        new_group_name: groupName,
        new_group_description: groupdescription,
        new_group_allow: grouptyp,
        new_group_image: groupImage,
        remaningMembers: remaningMembers,
        membersList: chatIds,
        roomId: newroomID, //@ts-ignore
        owner: route.params.owner,
        isPublic: data.data.isPublic ? 1 : 0,
      });

      setgrpmembers((prevMembers: any) => {
        return prevMembers.filter((m: any) => m.userId != UserID);
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const buttonPress2 = () => {
    //@ts-ignore
    // const new_grpmembers = grpmembers.filter(
    //   //@ts-ignore
    //   (member) =>
    //   //@ts-ignore
    //     member.userId != globalThis.userChatId && member.owner != member.userId
    // );
    // console.log("new_grpmembers",new_grpmembers)
    console.log("grpmembersgrpmembers", grpmembers);
    navigation.navigate("AddMembersScreen", {
      groupName: groupName,
      groupImage: groupImage,
      grouptyp: "multiple",
      groupAllow: grouptyp,
      groupdescription: groupdescription,
      groupMembers: grpmembers,
      roomId: newroomID,
      isPublic: isPublic,
      owner: route.params.owner,
    });
  };

  const handleChange = (id: any) => {
    //@ts-ignore
    const userIndex = grpmembers.findIndex((data) => data.user._id === id);

    if (userIndex !== -1) {
      const updatedGrpmembers = [
        ...grpmembers.slice(0, userIndex),
        ...grpmembers.slice(userIndex + 1),
      ];

      setgrpmembers(updatedGrpmembers);
    } else {
    }
  };

  ////////////////////////////////////////group-edit-api///////////////////////////////////////////////////////
  const GroupEditApi = async () => {
    const urlStr = chatBaseUrl + groupEditApi;
    try {
      setLoading(true);
      await axios({
        method: "PATCH",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          new_group_name: groupName,
          room_id: newroomID,
          new_group_description: groupdescription,
          allow: grouptyp,
          new_group_image: groupImage,
          isPublic: isPublic === "public" ? 1 : 0,
        },
      })
        .then((response) => {
          setLoading(false);
          if (response.data.status == true) {
            let chatIds = grpmembers.map((data: any) => data.userId);

            const remaningMembers = grpmembers.map((member: any) => {
              return {
                chat_user_id: member.userId,
                contact_name:
                  member.userName ?? member.name ?? member.phone_number,
                profile_image: member.image,
                phone_number: member.phone_number,
                isAdmin: member.isAdmin,
              };
            });
            socket.emit("updateGroupDetails", {
              new_group_name: response.data.data.name,
              new_group_description: groupdescription,
              new_group_allow: grouptyp,
              new_group_image: groupImage,
              remaningMembers: remaningMembers,
              membersList: chatIds,
              roomId: newroomID, //@ts-ignore
              owner: route.params.owner,
              isPublic: isPublic === "public" ? 1 : 0,
            });

            updateroominfo(
              response.data.data.name,
              response.data.data.image,
              newroomID,
              grouptyp, //@ts-ignore
              route.params.owner,
              isPublic === "public" ? 1 : 0
            );
            dispatch(
              setroominfo({
                roomImage: response.data.data.image,
                roomName: response.data.data.name,
              })
            );
            navigation.pop(3);
          } else {
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
          }
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  let selected = products.filter((product) => product.isChecked);

  async function TranslateWord(text: any) {
    if (text?.toLowerCase()?.includes("tokee")) {
      // Alert.alert(
      //   "Alert!",
      //   "You can't use 'Tokee' in the group name.",
      //   [{ text: t("ok") }]
      // );
      globalThis.errorMessage = "You can't use 'Tokee' in the group name.";
      setErrorAlertModel(true);
      return; // Exit early if "toke" is found
    }
    const urlStr =
      "https://www.googleapis.com/language/translate/v2?key=" +
      translationKey +
      "&target=" +
      "en" +
      "&q=" +
      text.replace(/[^a-zA-Z0-9 ]/g, "");
    setLoading(true);
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
          setLoading(false);
          var textEnteredByUser =
            response.data.data.translations[0].translatedText;
          const userInput = textEnteredByUser.toLowerCase();

          // Split the input sentence into words
          const inputWords = userInput.split(" ");
          const checkBadWord = await AsyncStorage.getItem("BadWords");

          let badWordsInArr: string[] = [];
          if (checkBadWord) {
            badWordsInArr = JSON.parse(checkBadWord);
          } else {
            badWordsInArr = badword[0].words;
          }
          // Check if any of the input words match any word in the array
          const match = inputWords.some((word: any) =>
            badWordsInArr.includes(word)
          );

          if (match) {
            if (grouptyp == "public") {
              // const resion = text; // You can replace this with any other value
              const resion = `The user attempted to edit the group name to an inappropriate name: "${text}".`;

              const result = await updateViolationAttempt(resion); // Call the custom function

              if (result.success) {
                        const remainingDays = getRemainingSuspensionDays(result?.data?.suspended_remove_date);
            
                          if (result.data.violation_attempt == 1) {
                            banType = "Warning";
                            setWarningModalVisible(true);
                          } else if (result.data.violation_attempt > 1 && result.data.violation_attempt <= 4) {
                            banType = "Ban";
                            dispatch(setUserSuspendedDays(remainingDays));
                            setWarningModalVisible(true);
                            dispatch(setUserBanned(result.data.is_ban));
                          } else if (result.data.violation_attempt == 5) {
                            banMessage = `Your account has been suspended for ${remainingDays} days due to repeated violations of our community guidelines. Please adhere to our policies to avoid permanent suspension.`;
                            banTitle = "Account Suspended!";
                            dispatch(setUserSuspendedDays(remainingDays));
                            setWarningModalVisible(true);
                            dispatch(setUserBanned(result.data.is_ban));
                          }else if (result.data.violation_attempt > 5) {
                            banMessage = `Your account has been permanently suspended due to multiple violations of our community guidelines. This decision is final, and you will no longer be able to access your account.`;
                            banTitle = "Account Permanently Suspended!";
                            setWarningModalVisible(true);
                            dispatch(setUserBanned(true)); // Ensure the user is marked as permanently banned
                          } else {
                            globalThis.errorMessage =
                            "This group name has an inappropriate content which is prohibited to use.";
                          setErrorAlertModel(true);
                          }
                        } else {
                          globalThis.errorMessage =
                          "This group name has an inappropriate content which is prohibited to use.";
                        setErrorAlertModel(true);
                        }

              // Alert.alert(
              //   "Alert!",
              //   t(
              //     "This group name has an inappropriate content which is prohibited to use."
              //   ),
              //   [{ text: t("ok") }]
              // );
            } else {
              GroupEditApi();
            }
          } else {
            GroupEditApi();
          }
        })
        .catch((error) => {
          setLoading(false);
          console.log("sdfdsfdsfdsf", error);
          // Alert.alert(error);
          globalThis.errorMessage = error;
          setErrorAlertModel(true);
        });
    } catch (error: any) {
      setLoading(false);
      console.log("sdfdsfdsfdsf", error);
      // Alert.alert(error);
      globalThis.errorMessage = error;
      setErrorAlertModel(true);
    }
  }

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

    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },

    newChatIcon: {
      height: 10,
      width: 10,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    statusText: {
      color: COLORS.black,
      fontSize: 12,
      fontFamily: font.medium(),
    },
    nText: {
      marginTop: 10,
      color: COLORS.black,
      fontSize: 15,
      fontFamily: font.semibold(),
      marginBottom: 10,
    },
    chooseContainer: {
      justifyContent: "center",
      margin: 5,
      marginTop: 10,
      flexDirection: "column",
    },

    plusIcon: {
      height: 20,
      width: 20,
      tintColor: textTheme().textColor,
      marginBottom: 10,
    },

    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: Platform.OS == "ios" ? "90%" : "auto",
    },

    nameTextContainer: {
      alignItems: "flex-start",
      paddingLeft: 10,
    },

    nameText: {
      marginTop: 10,
      fontSize: 17,
      color: COLORS.black,
      fontFamily: font.semibold(),
    },

    profile1Container2: {
      marginTop: 10,
      flexDirection: "column",
      justifyContent: "center",
      height: 80,
    },

    nameContainer: {
      marginLeft: 20,
      justifyContent: "center",
      margin: 0,
      marginBottom: 10,
      width: "50%",
    },
    nameInputText: {
      fontSize: 16,
      padding: 0,
      marginTop: 10,
      color: COLORS.black,
      fontFamily: font.regular(),
    },

    circleImageLayout: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    nameInputTextContainer: {
      marginRight: 10,
      marginLeft: 10,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },
    addMemberContainer: {
      backgroundColor: searchBar().back_ground,
      width: "20%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      marginTop: 5,
      height: 95,
    },
    addText: {
      color: textTheme().textColor,
      fontSize: 12,
      fontFamily: font.semibold(),
    },
  });

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
        <ErrorAlertModel
          visible={errorAlertModel}
          onRequestClose={() => setErrorAlertModel(false)}
          errorText={globalThis.errorMessage}
          cancelButton={() => setErrorAlertModel(false)}
        />

        <WarningModal
          visible={warningModalVisible}
          type={banType}
          onClose={() => {
            if (banTitle === "Account Suspended!" || banTitle === "Account Permanently Suspended!") {
            
              setWarningModalVisible(false);
              banType = "Warning";
              banMessage = "";
              banTitle = "";
            
              
              dispatch(setUserSuspendedDays(0));
              navigation.push("Login");
            } else {
              setWarningModalVisible(false);
            }
          }}
          message={banMessage}
          title={banTitle}
        />
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        {/* // **********    View For Show the TopBar    ********** /// */}
        <TopBar
          showTitle={true}
          title={t("edit_Group")}
          checked={
            //@ts-ignore
            globalThis.selectTheme
          }
        />

        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>

            {grpmembers.length > 0 && (
              <TouchableOpacity
                onPress={() => TranslateWord(groupName)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>{t("save")}</Text>
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
          globalThis.selectTheme === "indiaTheme" ||
          globalThis.selectTheme === "englandTheme" ||
          globalThis.selectTheme === "americaTheme" ||
          globalThis.selectTheme === "mexicoTheme" || //@ts-ignore
          globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={chatTop().BackGroundImage}
              resizeMode="contain" // Update the path or use a URL
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            height: "auto",
            maxHeight: DeviceInfo.hasNotch() ? null : windowHeight - 190,
          }}
        >
          <View style={styles.nameTextContainer}>
            <Text style={styles.nameText}>{t("group_name")}</Text>
          </View>
          <View style={styles.nameInputTextContainer}>
            <TextInput
              style={styles.nameInputText}
              placeholder={route.params.group_name}
              placeholderTextColor={COLORS.black}
              defaultValue={groupName}
              maxLength={40}
              onChangeText={(text) => setGroupName(text)}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
          <View style={styles.nameTextContainer}>
            <Text style={styles.nText}>{t("group_description")}</Text>
          </View>

          <View style={styles.nameInputTextContainer}>
            <TextInput
              style={styles.nameInputText}
              placeholder={""}
              placeholderTextColor={COLORS.black}
              defaultValue={groupdescription}
              onChangeText={(text) => setGroupDescription(text)}
              maxLength={80}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>

          <View style={styles.nameTextContainer}>
            <Text style={styles.nText}>{t("group_type")}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 25,
                borderWidth: 2,
                borderColor: grouptyp === "public" ? "green" : "grey",
                padding: 2.5,
              }}
              onPress={() => setgrouptyp("public")}
            >
              <View
                style={{
                  backgroundColor: grouptyp === "public" ? "green" : "white",
                  borderColor: grouptyp === "public" ? "green" : "red",
                  borderRadius: 25,
                  height: 15,
                  width: 15,
                }}
              ></View>
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10, fontFamily: font.regular() }}>
              {t("allow_user_and_admin_msg")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 25,
                borderWidth: 2,
                borderColor: grouptyp !== "public" ? "green" : "grey",
                padding: 2.5,
              }}
              onPress={() => setgrouptyp("admin")}
            >
              <View
                style={{
                  backgroundColor: grouptyp !== "public" ? "green" : "white",
                  borderColor: grouptyp !== "public" ? "green" : "red",
                  borderRadius: 25,
                  height: 15,
                  width: 15,
                }}
              ></View>
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10, fontFamily: font.regular() }}>
              {t("allow_admin_msg")}
            </Text>
          </View>

          <View style={styles.nameTextContainer}>
            <Text style={styles.nText}>{t("allow_global")}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 25,
                borderWidth: 2,
                borderColor: isPublic === "private" ? "grey" : "grey",
                padding: 2.5,
              }}
              disabled
              // onPress={() => setIsPublic("private")}
            >
              <View
                style={{
                  backgroundColor: isPublic === "private" ? "grey" : "white",
                  borderColor: isPublic === "private" ? "grey" : "red",
                  borderRadius: 25,
                  height: 15,
                  width: 15,
                }}
              ></View>
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10, fontFamily: font.regular() }}>
              {t("private_group")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 25,
                borderWidth: 2,
                borderColor: isPublic !== "private" ? "grey" : "grey",
                padding: 2.5,
              }}
              disabled
              // onPress={() => setIsPublic("public")}
            >
              <View
                style={{
                  backgroundColor: isPublic !== "private" ? "grey" : "white",
                  borderColor: isPublic !== "private" ? "grey" : "red",
                  borderRadius: 25,
                  height: 15,
                  width: 15,
                }}
              ></View>
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10, fontFamily: font.regular() }}>
              {t("public_group")}
            </Text>
          </View>

          {renderIf(
            route.params.isPublic !== 1,
            <>
              <View style={styles.nameTextContainer}>
                <Text style={styles.nameText}>{t("group_members")}</Text>
              </View>
              <View
                style={{
                  marginHorizontal: 10,
                  marginVertical: 10,
                  flexDirection: "row",
                }}
              >
                <FlatList
                  horizontal
                  data={grpmembers}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => {
                    if (item.userId == globalThis.chatUserId) {
                      return null; // Skip rendering this item
                    }
                    return (
                      <TouchableOpacity
                        style={[styles.profile1Container2, { marginRight: 10 }]}
                      >
                        {route.params.owner !== item.userId && (
                          <>
                            <View
                              style={{
                                paddingHorizontal: 10,
                                width: 80,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <View
                                style={{ paddingHorizontal: 10 }}
                                key={index}
                              >
                                {item.userId != globalThis.chatUserId && (
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
                                    onPress={() => {
                                      removeMember(
                                        item.roomId,
                                        item.userId,
                                        item.userName ||
                                          item.name ||
                                          item.roomName
                                      );
                                    }}
                                  >
                                    <Image
                                      source={require("../../../Assets/Icons/Cross.png")}
                                      style={styles.newChatIcon}
                                    />
                                  </TouchableOpacity>
                                )}

                                <Image
                                  source={{ uri: item.image }}
                                  style={styles.circleImageLayout}
                                  resizeMode="cover"
                                />
                              </View>

                              <View
                                style={{
                                  justifyContent: "center",
                                  alignSelf: "center",
                                  flexDirection: "column",
                                  marginTop: 5,
                                }}
                              >
                                <Text numberOfLines={1}>
                                  {item.name ||
                                    item.userName ||
                                    item.phone_number}
                                </Text>
                              </View>
                            </View>
                          </>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
                <TouchableOpacity
                  onPress={() => buttonPress2()}
                  activeOpacity={0.7}
                  style={styles.addMemberContainer}
                >
                  <Image
                    source={require("../../../Assets/Icons/plus.png")}
                    style={styles.plusIcon}
                  />
                  <Text style={styles.addText}>{t("add")}</Text>
                  <Text style={styles.addText}>{t("members")}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>
      <LoaderModel visible={loading} />
    </MainComponent>
  );
}
