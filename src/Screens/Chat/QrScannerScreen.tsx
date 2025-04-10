import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Share,
  StyleSheet,
  View,
} from "react-native";

import DeviceInfo from "react-native-device-info";
import { Base_Url2, blockApi, chatBaseUrl, insertFriend, scanQrCodeApi } from "../../Constant/Api";
import { t } from "i18next";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import { COLORS, themeModule } from "../../Components/Colors/Colors";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { useDispatch } from "react-redux";
import {
  setMainprovider,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setnewroomType,
  setroominfo,
  setyesstart,
} from "../../Redux/ChatHistory";
import { showToast } from "../../Components/CustomToast/Action";
import { LoaderModel } from "../Modals/LoaderModel";
import axios from "axios";
import { blockRoom, getRoomIdFromRes, getRoomIdFromResforbarcode, updateblockuser } from "../../sqliteStore";
import { socket } from "../../socket";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { Mixpanel } from "mixpanel-react-native";
import { AppsFlyerTracker } from "../EventTracker/AppsFlyerTracker";

const isDarkMode = true;

 // eslint-disable-next-line
export default function QrScannerScreen({ navigation }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const windowHeight = Dimensions.get("window").height;
  const [loaderModel, setloaderModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);

  const dispatch = useDispatch();


  const trackAutomaticEvents = false;
  const mixpanel = new Mixpanel(
    `${globalThis.mixpanelToken}`,
    trackAutomaticEvents
  );



  const handleButtonPress = (eventName) => {
    handleCallEvent("Add Friend by QR Screen",eventName)
    // Track button click event with Mixpanel
    mixpanel.track("Add Friend by QR Screen", {
      type: eventName,
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
  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },

    cancelText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },

    chatTopContainer: {
      backgroundColor: themeModule().theme_background,
      paddingBottom: 20,
    },
    nameInputTextContainer: {
      marginRight: 16,
      marginLeft: 16,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },
    chatContainer: {
      backgroundColor: "black",
      height: windowHeight,
    },
    content: {
      color: "black",
      fontSize: 18,
      fontFamily: font.regular(),
      marginHorizontal: 10,
      marginTop: 20,
    },
  });


  const BlockChatApiCallingfromFriendlist = async (chat_user_id,phone_number,roomId,opt,action) => {
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
                  // Room Blocked
                } else {
                  console.log(
                    "while adding entry to block user status is false"
                  );
                }
              }
            );

            if(action == "remove"){
              socket.emit("joinRoom", {
                roomId: roomId,
                userId: globalThis.userChatId,
              })
            }
            else{
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
            blockRoom(roomId,opt == "block" ? false : true);
          } else {
            // Alert.alert(response.data.message);
            globalThis.errorMessage = response.data.message;
            setErrorAlertModel(true);
          }
        })
        .catch((error) => {
          // setloaderMoedl(false);
        });
    } catch (error: any) {
      // setloaderMoedl(false);
    }
  };





  // **********   Headers for api ********** ///
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken, 
    localization: globalThis.selectLanguage,
  };

   // eslint-disable-next-line
  const onSuccess = async (scanData: any) => {
    setloaderModel(true);
    try {
      setloaderModel(true);
      const numToBeConverted = scanData.data;
      const data = numToBeConverted.substring(0, 5);
      const value = numToBeConverted.substring(6, numToBeConverted.length);
      if (data === "TOKEE" && value != "") {
        const dataParams = {
          unique_id: value,
        };
        PostApiCall(
          scanQrCodeApi,
          dataParams,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            console.log("qr scannnn",ResponseData)
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      } else {
        
        // Alert.alert(t("error"), t("invalid_qr_code"), [{ text: t("cancel") }]);
        setloaderModel(false);
        globalThis.errorMessage = t("invalid_qr_code");
        setErrorAlertModel(true);
      }
    } catch (error) {
      // Alert.alert(t("error"), t("invalid_qr_code"), [{ text: t("cancel") }]);
      globalThis.errorMessage = t("invalid_qr_code");
      setErrorAlertModel(true);
      setloaderModel(false);
    }
  };

  // **********  Method for return the api Response   ********** ///
   // eslint-disable-next-line
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [
        { text: t("cancel") },
        { text: t("inviteUser"), onPress: () => Inviteuser() },
      ]);
      setloaderModel(false);
    } else {
      handleButtonPress("QrCode Scaned");
      const user = ResponseData.data.user;
      const userImage = user.profile_image;
      const userName = user.first_name;
      const chatId = user.chat_user_id;
      const phoneNumber = user.phone_number;
      const country_code = user.country_code;
      const data_usernew = {
        country_code: country_code || "",
        phone_number: phoneNumber?.slice(country_code?.length) || "",
      };

      if (
        userImage != "" &&
        chatId != "" &&
        userName != "" &&
        phoneNumber != ""
      ) {
        chatId == 
        globalThis.userChatId
          ? showToast(t("you_cant_scan_yourself"))
          : addFriendfunction(data_usernew);
          getRoomIdFromResforbarcode(
            String(user.phone_number), //@ts-ignore
            String(globalThis.phone_number),
            async (res: any,status:any) => {
              if (status) {
                console.log("res.roomId",res.roomId)
              await BlockChatApiCallingfromFriendlist(user.chat_user_id,user.phone_number,res.roomId,"unblock","remove")
              blockRoom(res.roomId,true,()=> {
                newChattingPress({
                  profileImage: user.profile_image,
                  contactName: user.first_name,
                  chatId: user.chat_user_id,
                  FriendNumber: user.phone_number,
                });
              })
              }
              else{
                newChattingPress({
                  profileImage: user.profile_image,
                  contactName: user.first_name,
                  chatId: user.chat_user_id,
                  FriendNumber: user.phone_number,
                });
              }
            }
          );
           
        setloaderModel(false);
      }
    }
  };

  const addFriendfunction = async(data_usernew:any)=> {
    console.log("data_usernew",data_usernew)
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
        data: data_usernew,
      })
        .then((response) => {
          console.log("add friend successfully",response)
        })
        .catch((error) => {
        });
    } catch (error) {
    }
  }

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

  const message_data =
    "Lets chat on  Tokee, Join me at - https://play.google.com/store/apps/details?id=com.deucetek.tokee";
  const message_link =
    "Lets chat on IOS  Tokee, Join me at - https://apps.apple.com/fj/app/tokee-messenger/id1641356322";

  const shareOptions = {
    title: "Title",
    message: Platform.OS === "ios" ? message_link : message_data, // Note that according to the documentation at least one of "message" or "url" fields is required
    subject: "Subject",
  };

  const Inviteuser = () => {
    Share.share(shareOptions);
    handleButtonPress("Invite User");
  };

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <LoaderModel
        visible={loaderModel}
        onRequestClose={() => setloaderModel(false)}
        cancel={() => setloaderModel(false)}
      />
      <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {/* // **********  Status Bar    ********** // */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        {/* // ********** Title Text   ********** // */}
        <TopBar
          showTitleForBack={true}
          title={t("add_friend_by_qr")}
          backArrow={true}
          navState={navigation}
          checked={
            globalThis.selectTheme
          }
        />
      </View>
      {/* // ********** View for Profile View    ********** // */}
      <View style={styles.chatContainer}>
        <QRCodeScanner
          //cameraContainerStyle=
          cameraStyle={{ height: windowHeight }}
          onRead={(scanData) => onSuccess(scanData)}
          cameraContainerStyle={{ height: windowHeight }}
          reactivate={true}
          reactivateTimeout={5000}
          showMarker={true}
          flashMode={RNCamera.Constants.FlashMode.auto}
        />
      </View>
    </MainComponent>
  );
}
