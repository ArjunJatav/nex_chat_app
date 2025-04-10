import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//@ts-ignore
import { useTranslation } from "react-i18next"; //@ts-ignore
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import { useDispatch } from "react-redux";
import {
  COLORS,
  appBarText,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import TopBar from "../../../Components/TopBar/TopBar";
import { EncryptionKey } from "../../../Constant/Key";
import { chatTop } from "../../../Navigation/Icons";
import {
  setMainprovider,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setnewroomID,
  setnewroomType,
  setroominfo,
  setyesstart,
} from "../../../Redux/ChatHistory";
import { setChatlistmessage } from "../../../Redux/ChatList";
import { socket } from "../../../socket";
import {
  addMembersToRoomMembersSql,
  insertChatList,
  newMessageInsertList,
  removeCount,
} from "../../../sqliteStore";
import { LoaderModel } from "../../Modals/LoaderModel";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
import { Mixpanel } from "mixpanel-react-native";
import { AppsFlyerTracker } from "../../EventTracker/AppsFlyerTracker";

const isDarkMode = true;
const data = [
  { id: 1, name: "Eun Kyung", contact: "+91-9065812452", isChecked: false },
];
export default function CreateBroadcastScreen({ navigation, route }: any) {
  const dispatch = useDispatch();
  const { colorTheme } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [checked, setChecked] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [products, setProducts] = React.useState(data);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [errorAlertModel, setErrorAlertModel] = useState(false);

  const images = [
    'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739796875560_1739796871443.jpg',
    'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739796994362_1739796983177.jpg',
    'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797046221_1739797039370.jpg',
    'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797091786_1739797084582.jpg',
    'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797127854_1739797120576.jpg',
    'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797177163_1739797172456.jpg',
    'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797278426_1739797253465.jpg',
   'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797388061_1739797362230.jpg',
     'https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797436193_1739797429552.jpg'
  ];
  const [currentImage, setCurrentImage] = useState(images[0]);


  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    console.log("random index:",randomIndex)
    return images[randomIndex];
  };
  React.useEffect(() => {
    setCurrentImage(getRandomImage());
    socket.on("connect_error", (error: any) => {
      socket.connect;

      // Handle the error (e.g., display an error message)
    });
  }, [socket]);

  const buttonPress = () => {
    navigation.navigate("NewBroadcastScreen");
  };

  const trackAutomaticEvents = false;
  const mixpanel = new Mixpanel(
    `${globalThis.mixpanelToken}`,
    trackAutomaticEvents
  );
  console.log("globalThis.mixpanelToken",globalThis.mixpanelToken);
    const createBroadcastEvent = (string) => {
      console.log("string",string,);
      handleCallEvent("Create Broadcast",string)
      // Track button click event
      mixpanel.track("Create Broadcast", {
        type:"Broadcast",
        BroadcastName: string,
      });
    };


    const handleCallEvent = (eventTrack,eventName1) => {
      const eventName = eventTrack;
      const eventValues = {
        af_content_id: eventName1,
        af_customer_user_id: globalThis.chatUserId,
        af_quantity: 1,
      };
    
      AppsFlyerTracker(eventName, eventValues, globalThis.chatUserId); // Pass user ID if you want to set it globally
    };
  const buttonPress2 = async () => {
    if (groupName == "") {
     // Alert.alert("", t("Please provide Broadcast name"), [{ text: t("ok") }]);
      globalThis.errorMessage = t("Please provide Broadcast name");
      setErrorAlertModel(true);
    } else {

      await ToMakeBroadcast();
    }
  };

  async function ToMakeBroadcast() {
    if (groupName?.toLowerCase()?.includes("tokee")) {
      // Alert.alert(
      //  t("error"),
      //  t("you_cn_use_tokee_name_for_broadcast"),
      //   [{ text: t("ok") }]
      // );
      globalThis.errorMessage =  t("you_cn_use_tokee_name_for_broadcast");
      setErrorAlertModel(true);
      return; // Exit early if "toke" is found
    }
    try {
      setLoading(true);
      const arrayOfChatIds = await Promise.all(
        route.params.selected_data.map(
          (obj: { chat_user_id: any }) => obj.chat_user_id
        )
      );
      const imageSend = currentImage;
      const groupParams = {
        roomName: groupName,
        //@ts-ignore
        roomOwnerId: globalThis.chatUserId,
        roomMembers: arrayOfChatIds,
        groupType: "broadcast",
        group_image: imageSend,
        group_description: "",
        allow: "admin",
        membersRaw: route.params.selected_data,
      };
      createBroadcastEvent(groupName);
      //@ts-ignore
      socket.emit("createBroadcast", groupParams);
      return;
    } catch (error) {
      console.log(">>>>>>>>>>ToMakeBroadcast", error);
    }
  }

  useEffect(() => {
    const messageSend = CryptoJS.AES.encrypt(
      "You Created a Broadcast List with " + //@ts-ignore
        route.params.selected_data.length +
        " members.",
      EncryptionKey
    ).toString();

    //@ts-ignore
    const handlenewGroupCreated = async (data: any) => {
      try {
        //@ts-ignore
        if (data.result.fromUser == globalThis.chatUserId) {
          let createGroup = {
            roomId: data.result.roomId,
            roomName: data.result.roomName,
            roomImage: data.result.roomImage,
            roomType: data.result.roomType,
            fromUser: data.result.fromUser,
            friendId: data.result.fromUser,
            isNotificationAllowed: data.result.isNotificationAllowed,
            allow: data.result.allow,
          };

          newMessageInsertList(
            {
              isNotificationAllowed: true,
              roomId: data?.result.roomId,
              roomName: data?.result.roomName,
              roomImage: data?.result.roomImage,
              roomType: data?.result.roomType,
              isArchived: false,
              message: messageSend,
              message_type: "broadcast_notify",
              unseenMessageCount: 0,
              messageTime: new Date(data.result.time).getTime(),
              _id: new Date(data.result.time).getTime(), //@ts-ignore
              fromUser: globalThis.chatUserId,
            },
            false,
            "0"
          );
          let myObj = {
            //@ts-ignore
            chat_user_id: globalThis.userChatId, //@ts-ignore
            contact_name: globalThis.displayName, //@ts-ignore
            profile_image: globalThis.image, //@ts-ignore
            phone_number: globalThis.phone_number,
          };
          addMembersToRoomMembersSql(
            [...data.result.membersRaw, myObj],
            data.result.roomId
          );

          const mId = Math.floor(Math.random() * 9000) + 1000;
          const resId = new Date(data.result.time).getTime();

          const paramsOfSend = {
            mId: mId,
            roomId: data.result.roomId, //@ts-ignore
            fromUser: globalThis.chatUserId,
            message: messageSend,
            message_type: "broadcast_notify",
            attachment: [],
            isBroadcastMessage: false,
            isDeletedForAll: false,
            parent_message: {},
            isForwarded: false,
            storyId: "",
            isStoryRemoved: false,
            resId: resId,
            broadcastMessageId: "",
            seenCount: 0,
            deliveredCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            userName: globalThis.displayName, //@ts-ignore
            currentUserPhoneNumber: globalThis.phone_number,

            phoneNumber: Number(
              globalThis.phone_number.substr(-10)
            ), 
            disappearTime: 0,
            shouldDisappear: 0,
            unreadCount: 0,
          };

          const params = {
            mId: mId,
            resId: resId, //@ts-ignore
            userName: globalThis.userName, //@ts-ignore
            phoneNumber: Number(
              //@ts-ignore
              globalThis.phone_number.substr(-10)
            ), //@ts-ignore
            currentUserPhoneNumber: globalThis.phone_number, //@ts-ignore
            userImage: globalThis.image,
            roomId: data.result.roomId,
            roomName: data.result.roomName,
            roomImage: data.result.roomImage,
            roomType: data.result.roomType, //@ts-ignore
            roomOwnerId: globalThis.chatUserId,
            roomMembers: [],
            parent_message_id: "",
            parent_message: {},
            message: messageSend,
            message_type: "broadcast_notify",
            attachment: [],
            isNotificationAllowed: true,
            archive: false,
            from: globalThis.userChatId,
            createdAt: new Date(),
            isForwarded: false,
            status: "",
            isDeletedForAll: false,
            shouldDisappear: 0,
            disappearTime: 0,
          };

          socket.emit("sendmessage", params);
          //   // ################################## ADDING MESSAGE TO LOCAL DB #########################################
          //@ts-ignore
          // insertChatList({ paramsOfSend: paramsOfSend });
       

          //   //@ts-ignore
          socket.emit("joinRoom", {
            roomId: data.result.roomId,
            //@ts-ignore
            userId: globalThis.chatUserId,
          });
          try {
            // dispatch(setnewroomID(data.result.roomId));
            // dispatch(setnewroomType(data.result.roomType));
            // dispatch(
            //   setroominfo({
            //     roomImage: data.result.roomImage,
            //     roomName: data.result.roomName,
            //   })
            // );
          } catch (err) {
            console.log("err -> ", err);
          }

          // dispatch(
          //   setMainprovider({
          //     userImage: data.result.roomImage,
          //     userName: data.result.roomName,
          //     room: data.result,
          //     roomType: data.result.roomType,
          //     friendId: "",
          //     lastMessageId: "",
          //     isBlock: false,
          //   })
          // );

          dispatch(setyesstart(true));
          removeCount(data.result.roomId);
          dispatch(setChatlistmessage(data.result));
          // dispatch(setisnewBlock(false));
          // dispatch(setisnewmMute(true));
          // dispatch(setisnewArchiveroom(false));
          setLoading(false);
          // navigation.navigate("ChattingScreen", {
          //   userImage: data.result.roomImage,
          //   userName: data.result.roomName,
          //   room: data.result,
          //   roomType: data.result.roomType,
          //   friendId: "",
          //   lastMessageId: "",
          //   isBlock: false,
          //   inside: true,
          //   screenFrom: "chatScreen",
          // });
          navigation.navigate("BottomBar", {

          });
        }
      } catch (err) {
        console.log(">>>>>>>>broadcast ON error: ", err);
      }
    };
    //@ts-ignore
    socket.on("newBroadcastCreated", handlenewGroupCreated);
    return () => {
      //@ts-ignore
      socket.off("newBroadcastCreated", handlenewGroupCreated);
    };
  }, []);

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 30 : 20,
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
      fontSize: FontSize.font,
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

    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: "90%",
    },

    nameTextContainer: {
      alignItems: "flex-start",
      paddingLeft: 10,
    },

    nameText: {
      marginTop: 10,
      fontSize: DeviceInfo.isTablet() ? 22 : 18,
      color: COLORS.black,
      fontFamily: font.medium(),
    },

    profile1Container2: {
      marginTop: 10,
      flexDirection: "column",
      justifyContent: "center",
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
      fontFamily: font.semibold(),
    },

    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
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
        {/* // **********    View For Show the StatusBar    ********** /// */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        {/* // **********    View For Show the TopBar    ********** /// */}
        <TopBar
          showTitle={true}
          title={t("new_broadcast")}
          checked={
            //@ts-ignore
            globalThis.selectTheme
          }
        />
        {/* // **********    View For Show the Screen Container     ********** /// */}

        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => buttonPress2()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("create_broadcast")}</Text>
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
          globalThis.selectTheme === "mexicoTheme" || //@ts-ignore
          globalThis.selectTheme === "indiaTheme" ||
          globalThis.selectTheme === "englandTheme" ||
          globalThis.selectTheme === "americaTheme" ||
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
                top:  chatTop().top
              }}
            ></ImageBackground>
          ) : null
        }
      </View>

      <View style={styles.chatContainer}>
        <View style={styles.nameTextContainer}>
          <Text style={styles.nameText}>{t("broadcast_name")}</Text>
        </View>
        <View style={styles.nameInputTextContainer}>
          <TextInput
            style={styles.nameInputText}
            placeholder={t("enter_broadcast_name")}
            defaultValue={groupName}
            onChangeText={(text) => setGroupName(text)}
            maxLength={40}
            onSubmitEditing={()=>Keyboard.dismiss()}

          />
        </View>
        <View style={styles.nameTextContainer}>
          <Text style={styles.nameText}>{t("broadcast_members")}</Text>
        </View>
        <View style={{ marginBottom: 10, marginTop: 10, marginLeft: 10 }}>
          <FlatList
            horizontal
            data={route.params.selected_data}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={[styles.profile1Container2, {}]}>
                <View
                  style={{
                    paddingHorizontal: 10,
                    width: 80,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  key={index}
                >
                  <Image
                    source={
                      //@ts-ignore
                      item.profile_image
                        ? //@ts-ignore
                          { uri: item.profile_image }
                        : require("../../../Assets/Image/girl_profile.png")
                    }
                    style={styles.circleImageLayout}
                    resizeMode="cover"
                  />
                  <Text numberOfLines={1}>{item.contact_name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
      <LoaderModel visible={loading} />
    </MainComponent>
  );
}
