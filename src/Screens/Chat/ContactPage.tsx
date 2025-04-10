import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import auth from "@react-native-firebase/auth";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import AWS, { Credentials } from "aws-sdk";
import axios from "axios";
import { decode } from "base64-arraybuffer";
import { t } from "i18next";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; 
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import ImagePicker from "react-native-image-crop-picker";
import { useDispatch, useSelector } from "react-redux";
import RNFetchBlob from "rn-fetch-blob";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  iconTheme,
  searchBar,
} from "../../Components/Colors/Colors";
import { showToast } from "../../Components/CustomToast/Action";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import ConfirmPinModal from "../../Components/chatLockModal/ConfirmPin";
import PinModal from "../../Components/chatLockModal/GeneratePinModal";
import OtpVerificationModal from "../../Components/chatLockModal/OtpVerificationModal";
import UnlockChatPinModal from "../../Components/chatLockModal/UnlockChat";
import renderIf from "../../Components/renderIf";
import ImageViewer from "react-native-image-zoom-viewer";

import {
  addMemberApi,
  archieveChatApi,
  blockApi,
  chatBaseUrl,
  chatUserDetailApi,
  deleteGroup,
  deletechatApi,
  exitgroupApi,
  getRoomMembersApi,
  get_by_ChatId,
  groupDetailApi,
  groupEditApi,
  muteChatApi,
  reportUserApi,
  setpin,
} from "../../Constant/Api";
import {
  EncryptionKey,
  accessKeyId,
  secretAccessKey,
} from "../../Constant/Key";
import {
  setisLock,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setMainprovider,
  setnewroomID,
  setnewroomType,
  setroominfo,
  setyesstart,
} from "../../Redux/ChatHistory";
import { socket } from "../../socket";
import {
  DeleteTheGroup,
  addMembersToRoomMembersSql,
  addMembersToRoomMembersSqlnew,
  archiveRoom,
  blockRoom,
  deleteRoomId,
  getMembersFromRoomMembersSql,
  lockChat,
  muteroom,
  removeAllMembersFromRoomMembersSql,
  updateUserAdminStatus,
  updateblockuser,
  updateroominfo,
} from "../../sqliteStore";
import { LoaderModel } from "../Modals/LoaderModel";
import { ReportUserModel } from "../Modals/ReportUserModel";
import { SetProfileModal } from "../Modals/SetProfileModel";
import { setProfileData } from "../../Redux/MessageSlice";
import CustomBottomSheetModal from "../../Components/CustomBottomSheetModal";
import { updateAppState, updatedmembersall } from "../../reducers/getAppStateReducers";
const isDarkMode = true;
var isDeviceVerified = false;
export default function ContactPageScreen({ props, navigation, route }: any) {
  const dispatch = useDispatch();
  const { colorTheme } = useContext(ThemeContext);
  const isNotch = DeviceInfo.hasNotch();
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;
  const [cameraModal, setCameraModal] = useState(false);
  const [reportUser, setReportUser] = useState(false);
  const [filePath, setFilePath] = useState("");
  const roominfo = useSelector((state: any) => state.chatHistory.roominfo);
  const newroomID = useSelector((state: any) => state.chatHistory.newroomID);
  const isnewblock = useSelector((state: any) => state.chatHistory.isnewblock);
  const isnewmute = useSelector((state: any) => state.chatHistory.isnewmute);
  const isLock = useSelector((state: any) => state.chatHistory.isLock);
  const isnewarchiveroom = useSelector(
    (state: any) => state.chatHistory.isnewarchiveroom
  );
  const newroomType = useSelector(
    (state: any) => state.chatHistory.newroomType
  );

  const mainprovider = useSelector(
    (state: any) => state.chatHistory.mainprovider
  );
  const [loading, setLoading] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [makeAdminModel, setMakeAdminModel] = useState(false);
  const [clickedUser, setClickedUser] = useState({});
  const [groupDetailData, setGroupDetailData] = useState<any>([]);
  const [TotalMembersCount, setTotalMembersCount] = useState<any>(0);
  const [currentUserData, setCurrentUserData] = useState<any>([]);
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const [isPublic, setIsPublic] = useState(0);
  const [allow, setAllow] = useState("public");
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [arrayOfUSERs, setarrayOfUSERs] = useState([]);
  const [userstatus, setuserstatus] = useState("");
  ////////////////lock chat state/////////////////////
  const [generatePin, setGeneratePin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [unlockPin, setUnlockPin] = useState("");
  const [verifyPin, setVerifyPin] = useState("");
  const [lockValue, setLockValue] = useState(isLock);
  const [chatLockNumber, setChatLockNumber] = useState("");
  const [confirm, setConfirm] = useState();
  const [otp, setOtp] = useState("");
  const [isGeneratePinModalVisible, setGeneratePinModalVisible] =
    useState(false);
  const [isConfirmPinModalVisible, setConfirmPinModalVisible] = useState(false);
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const isFocused = useIsFocused();
  const [reportUserID, setReportUserID] = useState("");
  const [adminCount, setAdminCount] = useState(0);
  // const [userListFromScreen, setUserListFromScreen] = useState(route.params.fromScreen);
  const [isLoading, setIsLoading] = useState(false);
  const bottomSheetRef = useRef(null); 
  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  const handlePresentModalPress = () => bottomSheetRef.current?.present();
  const membersupdated = useSelector(
   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.getAppStateReducers?.membersupdated
  );
  const mId = Math.floor(Math.random() * 9000) + 1000;
  useEffect(() => {
    setGroupImage(roominfo.roomImage);
  }, [roominfo]);

  useEffect(() => {
    getChatLockdata();
  }, [isFocused]);

  const getChatLockdata = async () => {
    const chatLockPin = JSON.parse(
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      await AsyncStorage.getItem("lockChatPinCode")
    );
    const chatLockusernumber = await AsyncStorage.getItem("chatlockusernumber");
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    setChatLockNumber(chatLockusernumber);
    setVerifyPin(chatLockPin);
  };

  ////////////////lock chat functions/////////////////////

  useEffect(() => {
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        isDeviceVerified = true;
      }
    });
  }, []);

  const makeAdminButtonPress = (userDetails: any, roomId: any) => {
    if (userDetails.userId) {
      socket.emit("updateAdmin", {
        userId: userDetails.userId, 
        adminId: globalThis.chatUserId,
        roomId: roomId,
        operation: "add",
      });
      updateUserAdminStatus(userDetails.userId, roomId, 1);
      const remaningMembers: object[] = [] as object[];
      groupDetailData.forEach((d: any) => {
        if (d.userId != globalThis.userChatId) {
          remaningMembers.push({
            chat_user_id: d.userId,
            contact_name: d.userName || d.name || d.roomName,
            profile_image: d.image,
            phone_number: d.phone_number,
            isAdmin: userDetails.userId == d.userId ? true : d.isAdmin,
          });
        }
      });

      remaningMembers.push({
        chat_user_id: globalThis.chatUserId, 
        contact_name: globalThis.displayName, 
        profile_image: globalThis.image, 
        phone_number: globalThis.phone_number,
        isAdmin: true,
      });

      const chatIds: string[] = [] as string[]; 
      groupDetailData.forEach((d) => {
        chatIds.push(d.userId);
      });

      socket.emit("updateGroupDetails", {
        new_group_name: roominfo.roomName,
        new_group_description: userstatus,
        new_group_allow: currentUserData?.allow,
        new_group_image: groupImage,
        remaningMembers: remaningMembers,
        membersList: chatIds,
        roomId: newroomID,
        isPublic: currentUserData?.isPublic,
      });
    }
  };

  const removeAdminButtonPress = (userDetails: any, roomId: any) => {
    if (userDetails.userId) {
      socket.emit("updateAdmin", {
        userId: userDetails.userId, 
        adminId: globalThis.chatUserId,
        roomId: roomId,
        operation: "remove",
      });
      updateUserAdminStatus(userDetails.userId, roomId, 0);
      const remaningMembers: object[] = [] as object[];
      groupDetailData.forEach((d: any) => {
        if (d.userId != globalThis.userChatId) {
          remaningMembers.push({
            chat_user_id: d.userId,
            contact_name: d.userName || d.name || d.roomName,
            profile_image: d.image,
            phone_number: d.phone_number,
            isAdmin: userDetails.userId == d.userId ? false : d.isAdmin,
          });
        }
      });

      remaningMembers.push({
        chat_user_id: globalThis.chatUserId, 
        contact_name: globalThis.displayName, 
        profile_image: globalThis.image, 
        phone_number: globalThis.phone_number,
        isAdmin: true,
      });

      const chatIds: string[] = [] as string[]; 
      groupDetailData.forEach((d) => {
        chatIds.push(d.userId);
      });
      socket.emit("updateGroupDetails", {
        new_group_name: roominfo.roomName,
        new_group_description: userstatus,
        new_group_allow: currentUserData?.allow,
        new_group_image: groupImage,
        remaningMembers: remaningMembers,
        membersList: chatIds,
        roomId: newroomID,
        isPublic: currentUserData?.isPublic,
      });
    }
  };

  async function signIn() {
    const number = chatLockNumber;
    try {
      const confirmation = await auth().signInWithPhoneNumber(
        number.toString()
      );
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setConfirm(confirmation);
    } catch (error) {}
  }

  const handleGeneratePinEntered = (generatePin: string[]) => {
    const filteredArray = generatePin.filter((value) => value !== "");
    setGeneratePin(filteredArray.join("")); // Update the pin state
  };

  const handleConfirmPinEntered = (confirmpin: string[]) => {
    const filteredArray = confirmpin.filter((value) => value !== "");
    setConfirmPin(filteredArray.join("")); // Update the pin state
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
        setOtp("");
        Alert.alert(t("error"), t("enter_a_valid_6_digit_OTP"));
        Alert.alert(t("error"), t("enter_a_valid_6_digit_OTP"));
      }
    } catch (error) {
      if (error.code === "auth/invalid-verification-code") {
        Alert.alert("", t("invalid_OTP_Please_try_again"));
      } else if (error.code === "auth/code-expired") {
        Alert.alert("", t("OTP_has_expired_please_request_a_new_one"));
      } else {
        if (isDeviceVerified == true && Platform.OS == "android") {
          isDeviceVerified = false;
          setOtpModalVisible(false);
          setGeneratePinModalVisible(true);
        } else {
          Alert.alert(t("error"), "Enter a valid 6-digit OTP.");
        }
      }
    }
  };

  const generatePinSubmit = () => {
    if (generatePin.length === 4) {
      setGeneratePinModalVisible(false);
      setConfirmPinModalVisible(true);
    } else {
      Alert.alert(t("error"), t("enter_a_valid_4_digit_PIN"));
    }
  };

  const confirmPinSubmit = async () => {
    if (generatePin == confirmPin) {
      setPinApi(confirmPin); 
      globalThis.confirmPin = confirmPin;
      await AsyncStorage.setItem("lockChatPinCode", JSON.stringify(confirmPin));
      showToast("Your chat has been locked");
      setConfirmPinModalVisible(false);
      lockChat(newroomID, lockValue, (res: any) => {
        if (res) {
          socket.emit("changeLockStatus", {
            room: newroomID, 
            user: globalThis.chatUserId,
            lock: lockValue,
          });
          dispatch(setisLock(!isLock));
          setloaderMoedl(false);
        } else {
          setloaderMoedl(false);
        }
      });
    } else {
      Alert.alert(t("error"), "Your pin and confirm pin does not match.");
    }
  };

  const unlockPinSubmit = () => {
    if (unlockPin == verifyPin) {
      lockChat(newroomID, lockValue, (res: any) => {
        if (res) {
          socket.emit("changeLockStatus", {
            room: newroomID, 
            user: globalThis.chatUserId,
            lock: lockValue,
          });
          dispatch(setisLock(!isLock));
          showToast(isLock ? "Chat UnLocked" : "Chat Locked");
          setloaderMoedl(false);
        } else {
          setloaderMoedl(false);
        }
        setloaderMoedl(false);
      });
      setPinModalVisible(false);
      setUnlockPin("");
      setConfirmPin("");
    } else {
      setloaderMoedl(false);
      Alert.alert(t("error"), t("enter_a_valid_4_digit_PIN"));
    }
  };

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

  //////////////////launchCamera///////////////////
  const captureImage = async () => {
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
      })
        .then((image) => {
          if (image !== undefined && image !== null) {
            UPdatedImage(image);
            setFilePath(image.path);
            setCameraModal(false);
          }
        })
        .catch((e) => {
          setCameraModal(false);
        });
    }
  };
  ////////////////////launchImageLibrary/////////////////

  const selectImage = async () => {
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
      }).then((image: any) => {
        if (image !== undefined) {
          UPdatedImage(image);
          setFilePath(image.path);
          setCameraModal(false);
        }
      });
    }
  };

  const setPinApi = (chatPin: any) => {
    /////////////////////// ********** Internet Permission   ********** ////////////////////
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);
        setloaderMoedl(false);
        return;
      } else {
        let uploaddata = {
          chat_pin: chatPin,
        };
        PostApiCall(
          setpin,
          uploaddata,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  /////////////////////// ********** Edit Profile Response    ********** ////////////////////
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    // Custom logic to execute on success
    if (ErrorStr) {
      Alert.alert(t(t("error")), ErrorStr, [{ text: t("cancel") }]);
    } else {
    }
  };

  function UPdatedImage(image: any) {
    setGroupImage(image.path);
    BucketUpload(image.path);
  }

  //////////////////Requst method for open camera //////////////////
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission",
            buttonPositive: "ok",
          }
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    } else return true;
  };

  /////////////////////////////////////////////to-store-userdata////////////////////////////////////////////////////////////
  function StoreUserData(data: any) {
    let arr = [];
    // // Loop through the array of objects and extract the values of the "ID" key
    for (let i = 0; i < data.group_members.length; i++) {
      const object = data.group_members[i];
      const USER = object.user;
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      let reArr: any = arr.push(USER);
      setarrayOfUSERs(reArr);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      GroupDetailApiFunc();
    }, [])
  );

  var count = 1;

  useEffect(() => {
    const handleUpdateGroupDetails = (data: any) => {
      if (data.roomId && newroomID && data.roomId == newroomID) {
        setGroupName(data.new_group_name);
        setGroupImage(data.new_group_image);
        setIsPublic(data.isPublic);
        setAllow(data.new_group_allow);
        const newRemaningMembers = data.remaningMembers.map((d: any) => {
          return {
            userId: d.chat_user_id,
            roomName: d.contact_name,
            name: d.contact_name,
            image: d.profile_image,
            phone_number: d.phone_number,
            isAdmin: d.isAdmin,
            userName: d.name,
          };
        });

        const idx2 = data.remaningMembers.filter((f: any) => f.isAdmin == 1);
        setAdminCount(idx2.length);
        setGroupDetailData(newRemaningMembers);
        // removeAllMembersFromRoomMembersSql(data.roomId, () => {
        //   addMembersToRoomMembersSql(data.remaningMembers, data.roomId);
        // });

        addMembersToRoomMembersSqlnew(data.remaningMembers, data.roomId, () => {
          count = count + 1;
          dispatch(updateAppState({ updatemediauseeeffect: count + 1 }));
         
          dispatch(updatedmembersall(membersupdated))
  
        });
        

        updateroominfo(
          data.new_group_name,
          data.new_group_image,
          newroomID,
          data.new_group_allow,
          data?.owner,
          data.isPublic
        );

        const currentUserIdx = data.remaningMembers.findIndex(
          (m: any) => m.chat_user_id == globalThis?.userChatId
        );
        if (currentUserIdx >= 0) {
          dispatch(setisnewBlock(false));
          blockRoom(newroomID, true);
        } else {
          dispatch(setisnewBlock(true));
          blockRoom(newroomID, false);
        }
      }
    };
    socket.on("updateGroupDetails", handleUpdateGroupDetails);

    return () => {
      socket.off("updateGroupDetails", handleUpdateGroupDetails);
    };
  });

  const [offset, setOffset] = useState(0);
  const [loadingmembers, setloadingmembers] = useState(false);
  const limit = 10;

  const fetchMembers = async () => {

  };


  const [fetchmemberloader,setfetchmemberloader] = useState(true)

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
  
    if (isCloseToBottom) {
      handleLoadMore();
    }
  };


  
  const handleLoadMore = async() => {
    if(!loadingmembers){
      setloadingmembers(true)
    if (offset < TotalMembersCount) {
    await  getMembersFromRoomMembersSql(newroomID, limit, offset, (res, totalCount) => {

      if(res){
        
      // Update total members count
        // setTotalMembersCount(totalCount);
  
        // Check for existing members to avoid duplicates
        const existingIds = new Set(groupDetailData.map(member => member.userId));
        const newMembers = res.filter(member => !existingIds.has(member.userId));
        setOffset(prevOffset => prevOffset + newMembers.length);
        console.log('Current offset:', offset);
        console.log('Fetched members:', res);
        console.log('New members to add:', newMembers);
  
        if (newMembers.length > 0) {
          // Update the offset
          
          // Update the group detail data
          setGroupDetailData(prevData => [...prevData, ...newMembers]);
          setloadingmembers(false)
         
        } else {
          console.log("No new members found!");
        }
      }
  
      });
    } else {
      console.log("No more members to load.");
    }
    }
  };
  
  
  const GroupDetailApiFunc = async () => {
    setloadingmembers(true)
    const urlStr = chatBaseUrl + groupDetailApi + "?roomId=" + newroomID;
    const chatProfileUrl = chatBaseUrl + chatUserDetailApi + route.params.friendId;
  
    try {
      // Fetch initial members
      await getMembersFromRoomMembersSql(newroomID, limit, 0, (res, totalCount) => {
        console.log('Initial members:', res);
        console.log('Total members count:', totalCount);
        setOffset(res.length);
        // Set total members count
        setTotalMembersCount(totalCount);
  
        // Initialize group members
        setGroupDetailData(res);
  
        // Logic for setting current user data and group info
        const idx = res.findIndex(f => f.userId === globalThis.userChatId);
        if (idx >= 0) {
          setCurrentUserData(res[idx]);
          setloadingmembers(false)
          if (newroomType === "single") {
            setGroupName(res[idx].name || res[idx].phone_number);
            setIsPublic(res[idx].isPublic);
            setAllow(res[idx].allow);
          } else {
            setGroupName(res[idx].groupName);
            setIsPublic(res[idx].isPublic);
            setAllow(res[idx].allow);
          }
          setGroupImage(res[idx].roomImage);

        }
  
        // Count admins
        const adminCount = res.filter(f => f.isAdmin === 1).length;
        setAdminCount(adminCount);
      });
  
      // Fetch additional group details
      await axios({
        method: "get",
        url: newroomType === "single" ? chatProfileUrl : urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
          localization: globalThis.selectLanguage,
        },
      }).then(response => {
        if (response.data.status) {
          setuserstatus(response?.data?.data?.bio);
        } else {
          Alert.alert(response.data.message);
        }
      });
    } catch (error) {
      console.error("Error fetching group details:", error);
      setloaderMoedl(false);
    }
  };
  
  
  
  

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
    },

    nText: {
      color: COLORS.black,
      fontSize: FontSize.font,
      fontFamily: font.bold(),
      marginBottom: 10,
    },
    statusText: {
      color: COLORS.black,
      fontSize: DeviceInfo.isTablet() ? 20 : 12,
      fontFamily: font.medium(),
    },
    sText: {
      color: iconTheme().iconColor,
      fontSize: DeviceInfo.isTablet() ? 22 : 14,
      fontFamily: font.bold(),
      marginLeft: 10,
    },
    reportText: {
      color: "red",
      fontSize: DeviceInfo.isTablet() ? 22 : 14,
      fontFamily: font.bold(),
      marginLeft: 10,
    },

    themeTopContainer: {
      height: DeviceInfo.hasNotch() == true ? "35%" : "35%",
      width: "100%",
    },

    themeContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height:
        DeviceInfo.hasNotch() == true ? windowHeight - 10 : windowHeight - 10,
    },
    chooseContainer: {
      justifyContent: "center",
      margin: 5,
      marginTop: 10,
      flexDirection: "column",
    },
    Container: {
      alignItems: "center",
      margin: 5,
      marginTop: 20,
      flexDirection: "row",
    },
    reportContainer: {
      alignItems: "center",
      margin: 5,
      marginTop: 20,
      flexDirection: "row",
    },
    circleImageLayout: {
      width: DeviceInfo.isTablet() ? 32 : 25,
      height: DeviceInfo.isTablet() ? 32 : 25,
      tintColor: iconTheme().iconColor,
    },

    reportImageLayout: {
      width: DeviceInfo.isTablet() ? 32 : 25,
      height: DeviceInfo.isTablet() ? 32 : 25,
      tintColor: "red",
    },
    plusImageContainer: {
      position: "absolute",
      top: Platform.OS == "ios" ? 50 : 45,
      borderRadius: 20,
      height: 25,
      width: 25,
    },

    plusImageContainer1: {
      position: "absolute",
      top: DeviceInfo.hasNotch() == true ? 60 : 60,
      right: 20,
      borderRadius: 20,
      height: DeviceInfo.isTablet() ? 32 : 25,
      width: DeviceInfo.isTablet() ? 40 : 40,
      alignItems: "center",
      justifyContent: "center",
    },
    contactContainer: {
      position: "absolute",
      flexDirection: "row",
      bottom: 5,
      height: 100,
      width: "100%",
    },

    backArrowContainer: {
      position: "absolute",
      left: 10,
      borderRadius: 5,
      width: "100%",
      alignItems: "center",
      justifyContent: "space-around",
      flexDirection: "row",
      backgroundColor:
        globalThis.selectTheme === "newYearTheme"
          ? "#CE9D59" 
          : globalThis.selectTheme === "newYear" || 
            globalThis.selectTheme === "mongoliaTheme"
          ? COLORS.black 
          : globalThis.selectTheme === "christmas"
          ? COLORS.primary_light_green 
          : globalThis.selectTheme == "third"
          ? COLORS.light_green 
          : globalThis.selectTheme == "second"
          ? COLORS.primary_blue
          : COLORS.purple,
    },
    EditTExt: {
      position: "absolute",
      right: 10,
      borderRadius: 5,
      width: "100%",
      alignItems: "center",
      justifyContent: "space-around",
      flexDirection: "row",
      backgroundColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
    },
    contact2Container: {
      position: "absolute",
      borderRadius: 5,
      width: "100%",
      alignItems: "center",
      justifyContent: "space-around",
      flexDirection: "row",
    },
    backIcon: {
      height: 25,
      width: 25,
      tintColor: colorTheme ? COLORS.white : COLORS.white,
    },
    nameInviteContainer: {
      justifyContent: "center",
      width: "100%",
      flexDirection: "column",
    },
    name1conText: {
      fontSize: DeviceInfo.isTablet() ? 25 : 18,
      fontFamily: font.bold(),
      color: COLORS.white,
      left: 15,
    },
    name2conText: {
      fontSize: DeviceInfo.isTablet() ? 22 : 15,
      fontFamily: font.medium(),
      color: COLORS.white,
    },
    profile2Container: {
      marginTop: 10,
      flexDirection: "row",
      height: 60,
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
      alignItems: "center",
    },
    Container2: {
      justifyContent: "center",
      marginLeft: 0,
      width: "15%",
    },
    circleImageLayout1: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    naContainer: {
      marginLeft: 5,
      justifyContent: "center",
      width: "55%",
    },
    nameconText: {
      fontSize: DeviceInfo.isTablet() ? 18 : 15,
      fontFamily: font.medium(),
    },
    namecoText: {
      marginTop: 2,
      fontSize: DeviceInfo.isTablet() ? 16 : 12,
      fontFamily: font.regular(),
    },
    editProfile2: {
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "auto",
    },
    editProfile3: {
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "auto",
    },
    adminText: {
      fontSize: 14,
      fontFamily: font.medium(),
      color: iconTheme().iconColor,
    },
    container: {
      flex: 1,
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover", // or 'contain' based on your preference
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust the opacity (last value) as needed
    },
  });

  const BlockChatApiCalling = async (opt: any) => {
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
          to: route.params.friendId,
          opt: opt,
          roomId: newroomID,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            updateblockuser(
              {
                
                fromuser: globalThis.chatUserId,
                touser: route.params.friendId,
              },
              "insert",
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

            
            socket.emit("leaveRoom", {
              roomId: newroomID, 
              userId: globalThis.userChatId,
            });

            socket.emit("blockusers", {
              touser: route.params.friendId, 
              fromuser: globalThis.chatUserId,
              isBlock: opt == "block",
            });
            blockRoom(newroomID, isnewblock);
            dispatch(setisnewBlock(!isnewblock));
            setloaderMoedl(false);
          } else {
            Alert.alert(response.data.message);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
        });
    } catch (error: any) {
      setloaderMoedl(false);
      // Alert.alert(error);
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
          userId: globalThis.userChatId,
          roomId: newroomID,
          isNotificationAllowed: !isnewmute,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            setloaderMoedl(false);
            dispatch(setisnewmMute(!isnewmute));
            showToast(isnewmute ? "Chat muted" : "Chat unmuted");
            muteroom(newroomID, isnewmute);
          } else {
            Alert.alert(response.data.message);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
          Alert.alert(error);
        });
    } catch (error: any) {
      setloaderMoedl(false);
      Alert.alert(error);
    }
  };

  const ArchieveChatApiCalling = async () => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + archieveChatApi;
    try {
      await axios({
        method: "PATCH",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userId: globalThis.userChatId,
          roomId: newroomID,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            setloaderMoedl(false);

            dispatch(setisnewArchiveroom(!isnewarchiveroom));
            // showToast(isnewarchiveroom  ? "Chat Hide" : "Chat Unhide")
            archiveRoom(newroomID, !isnewarchiveroom);
          } else {
            setloaderMoedl(false);
            Alert.alert(response.data.message);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
          Alert.alert(error);
        });
    } catch (error: any) {
      setloaderMoedl(false);
      Alert.alert(error);
    }
  };

  const deleteAlert = () => {
    Alert.alert(
      t("confirm"),
      `${
        newroomType == "single"
          ? t("do_you_want_to_delete_this_chat")
          : newroomType == "multiple"
          ? t("do_you_want_to_delete_this_group_all_chats")
          : t("do_you_want_to_delete_this_broadcast_all_chats")
      }.`,
      [{ text: t("cancel") }, { text: t("yes"), onPress: () => deleteChat() }]
    );
  };

  const exitAlert = () => {
    Alert.alert(t("confirm"), t("do_you_want_exit_this_group"), [
      { text: t("cancel") },
      { text: t("yes"), onPress: () => exitgroupChat() },
    ]);
  };

  const exitNotify = () => {
    // const finalString =
    //   globalThis.phone_number + " has left this conversation.";
  
    const finalString = globalThis.displayName + " has left this conversation.";

    const paramsOfSendlive = {
      isNotificationAllowed: true,
      userName: globalThis.phone_number,
      userImage: globalThis.image,
      roomId: newroomID,
      roomName: groupDetailData[0]?.groupName,
      roomImage: groupDetailData[0]?.roomImage,
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
      phoneNumber: Number(
        globalThis.phone_number.substr(-10)
      ),
      currentUserPhoneNumber: globalThis.phone_number,
      shouldDisappear: 0,
      disappearTime:  0,
    };

    socket.emit("sendmessage", paramsOfSendlive);
  };

  const removeImage = async () => {
    setloaderMoedl(true);
    try {
      await GroupEditApi(
        "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Document/1717401343823_36FA5C33-D2AD-40F0-AC1B-E35C078FCFFE.jpg"
      );
    } catch (error) {
      setloaderMoedl(false);
    }
  };

  const exitgroupChat = async () => {
    setloaderMoedl(true);
    const urlStr = chatBaseUrl + exitgroupApi;
    try {
      exitNotify();
      const response = await axios({
        method: "DELETE",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          userId: globalThis.userChatId,
          roomId: newroomID,
        },
      });

      if (response.data.status === true) {
        socket.emit("leaveRoom", {
          roomId: newroomID, 
          userId: globalThis.userChatId,
        });

        const remaningMembers: object[] = [] as object[];
        groupDetailData.forEach((d: any) => {
          
          if (d.userId != globalThis.userChatId) {
            remaningMembers.push({
              chat_user_id: d.userId,
              contact_name: d.userName || d.name || d.roomName,
              profile_image: d.image,
              phone_number: d.phone_number,
              isAdmin: d.isAdmin,
            });
          }
        });
        const chatIds: string[] = [] as string[]; 
        groupDetailData.forEach((d) => {
          chatIds.push(d.userId);
        });
        socket.emit("updateGroupDetails", {
          new_group_name: roominfo.roomName,
          new_group_description: userstatus,
          new_group_allow: currentUserData?.allow,
          new_group_image: groupImage,
          remaningMembers: remaningMembers,
          membersList: chatIds,
          roomId: newroomID,
          isPublic: currentUserData?.isPublic,
        });

        setloaderMoedl(false);
        blockRoom(newroomID, isnewblock);
        dispatch(setisnewBlock(!isnewblock));
      } else {
        setloaderMoedl(false);
      }
    } catch (error) {
      setloaderMoedl(false);
    }
  };

  const deleteChat = async () => {
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
          userId: globalThis.userChatId,
          roomId: newroomID,
        },
      });

      if (response.data.status === true) {
        setloaderMoedl(false);
        deleteRoomId(newroomID);
        showToast("Chat Deleted");
        navigation.navigate("ChatScreen");
      } else {
        setloaderMoedl(false);
        Alert.alert(response.data.message);
      }
    } catch (error: any) {
      setloaderMoedl(false);
      Alert.alert(error);
    }
  };

  const BucketUpload = async (newwwwdata: any) => {
    setloaderMoedl(true);
    const s3 = new AWS.S3({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: "us-east-2",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com",
    });
    try {
      // Read the image file
      const response = await RNFetchBlob.fs.readFile(newwwwdata, "base64");
      const binaryData = decode(response);
      const pathParts = newwwwdata.split("/");
      const fileName = Date.now() + "_" + pathParts[pathParts.length - 1];
      const folderName = "Profile/";
      const contentDeposition = `inline;filename="${fileName}"`;

      // Set S3 parameters
      const params = {
        Bucket: "tokee-chat-staging",
        Key: folderName + fileName, // Update with the desired S3 key
        Body: binaryData,
        ContentDisposition: contentDeposition,
        ContentType: "image/jpeg", // Adjust the content type based on your file type
      };

      // Upload the image to S3
      const uploadResult = await s3.upload(params).promise();
      setGroupImage(uploadResult.Location);
      GroupEditApi(uploadResult.Location);
      setloaderMoedl(false);
    } catch (error) {
      setloaderMoedl(false);
    }
  };

  ////////////////////////////////////////group-edit-api///////////////////////////////////////////////////////
  const GroupEditApi = async (imagee: any) => {
    const urlStr = chatBaseUrl + groupEditApi;
    try {
      await axios({
        method: "PATCH",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          room_id: newroomID,
          new_group_image: imagee == "" ? groupImage : imagee,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            const remaningMembers = groupDetailData.map((m: any) => {
              return {
                chat_user_id: m.userId,
                contact_name: m.userName ?? m.name ?? m.phone_number,
                profile_image: m.image,
                phone_number: m.phone_number,
                allow: m.allow,
                isAdmin: m.isAdmin,
              };
            });
            const chatIds = groupDetailData.map((m: any) => m.userId);

            socket.emit("updateGroupDetails", {
              new_group_name: response.data.data.name,
              new_group_description: userstatus,
              new_group_allow: currentUserData?.allow,
              new_group_image: response.data.data.image,
              remaningMembers: remaningMembers,
              membersList: chatIds,
              roomId: newroomID,
              isPublic: response.data.data.isPublic,
            });
            setGroupImage(response.data.data.image);
            updateroominfo(
              response.data.data.name,
              response.data.data.image,
              newroomID,
              currentUserData?.allow, 
              globalThis.chatUserId,
              response.data.data.isPublic
            );
            dispatch(
              setroominfo({
                roomImage: response.data.data.image,
                roomName: response.data.data.name,
              })
            );
            setloaderMoedl(false);
          } else {
            setloaderMoedl(false);
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            showToast("Session Expired.");
          }
          setloaderMoedl(false);
        });
    } catch (error) {
      setAlertVisible(true);
      setloaderMoedl(false);
    }
  };


  const sendMemberNotify = (username: any, type: any) => {
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
      message: CryptoJS.AES.encrypt(finalString, EncryptionKey).toString(),
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
      phoneNumber: Number(
        globalThis.phone_number.substr(-10)
      ),
      currentUserPhoneNumber: globalThis.phone_number,
      shouldDisappear: 0,
      disappearTime:  0,
    };

    

    socket.emit("sendmessage", paramsOfSendlive);
  };

  const removeMember = async (roomID: any, UserID: any, username: any) => {
    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const bodydata = JSON.stringify({
      userId: globalThis.userChatId,
      roomId: roomID,
      members: [UserID],
      operation: "REMOVE",
      removeBy: isPublic == 1 ? "admin" : "",
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
      const chatIds = groupDetailData.map((m: any) => m.userId);

      let remaningMembers = groupDetailData.filter(
        (m: any) => m.userId != UserID
      );
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
        new_group_description: userstatus,
        new_group_allow: currentUserData?.allow,
        new_group_image: groupImage,
        remaningMembers: remaningMembers,
        membersList: chatIds,
        roomId: newroomID, 
        owner: data.data?.owner,
        isPublic: data.data.isPublic ? 1 : 0,
      });

      setGroupDetailData((prevMembers: any) => {
        return prevMembers.filter((m: any) => m.userId != UserID);
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const DeleteGroupApi = async () => {
    setLoading(true);
    const urlStr = chatBaseUrl + deleteGroup;

    try {
      const response = await axios({
        method: "DELETE",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
        },
        data: {
          roomId: newroomID,
        },
      });
      if (response.data.status === true) {
        DeleteTheGroup(newroomID);
        navigation.pop(2);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  ///////////////////////// **********   Headers for api ********** ///////////////////////////////
  let headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken, 
    localization: globalThis.selectLanguage,
  };

  const ReportuserChat = (reason: string) => {
    ////i///////////////////////// ********** InterNet Permission    ********** ///////////////////////////////////

    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        return;
      } else {
        let data = {
          reported_user_id:
            reportUserID != "" ? reportUserID : mainprovider.friendId,
          report_reason: reason,
        };
        PostApiCall(
          reportUserApi,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccessVerify(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  //////////////////////////// **********  Method for return the api Response   ********** ///////////////////////////////////////////
  const apiSuccessVerify = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("ok") }]);
      // setReportUser(false);
    } else {
      setReportUser(false);
      setReportUserID("");
      Alert.alert(t("success"), ResponseData.message, [{ text: t("done") }]);
    }
  };

  const lockChatfunction = (lock: number) => {
    setLockValue(lock);
    if (verifyPin == null || verifyPin == undefined || verifyPin == "0") {
      setGeneratePinModalVisible(true);
    } else {
      setPinModalVisible(true);
    }
  };

  ///////////////////////////get user data api for bottomsheet//////
  const getProfileApi = async (chatid: any, username: any, userimage: any) => {
    setIsLoading(true);
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken, 
      localization: globalThis.selectLanguage,
    };
    let data = {
      chat_user_id: chatid,
    };

    PostApiCall(
      get_by_ChatId,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        setIsLoading(false);
        getapiSuccess(ResponseData, ErrorStr, username, userimage);
      }
    );
  };

  const getapiSuccess = (
    ResponseData: any,
    ErrorStr: any,
    username: any,
    userimage: any
  ) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setIsLoading(false);
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
          profile_image: userimage,
        })
      );

      handlePresentModalPress();
      setIsLoading(false);
    }
  };

  const newChattingPress = ({
    profileImage,
    contactName,
    chatId,
    FriendNumber,
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
    dispatch(setnewroomID(""));
    navigation.push("ChattingScreen", {
      friendId: chatId,
      userName: contactName,
      userImage: profileImage,
      roomType: "single",
      inside: false,
      screenFrom: "Dashboard",
      FriendNumber: FriendNumber,
    });
  };

  const [isModalVisible, setModalVisible] = useState(false);


  const handleImagePress = () => {
    setModalVisible(true); // Show the modal when the image is clicked
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Hide the modal
  };
  

  return (
    <View style={{ flex: 1 }}>
      <Modal
        visible={isModalVisible}
        // transparent={true}
        onRequestClose={handleCloseModal}
        presentationStyle='overFullScreen'
      >
        <View
                style={{
                  flex: 1,
                  backgroundColor: "#000",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >

            <TouchableOpacity
              style={{
                position: "absolute",
                left: 3,
                zIndex: 20,
                top: isNotch ? 60 : 60,
              }}
              onPress={() => {
                handleCloseModal();
              }}
            >
              <Image
                source={require("../../Assets/Icons/Back_Arrow.png")}
                style={{
                  height: 25,
                  width: 25,
                  marginLeft: 10,
                  tintColor: iconTheme().iconColorNew,
                }}
              />
            </TouchableOpacity>
                <ImageViewer
                  renderIndicator={() => null}
                  style={{
                    height: windowHeight,
                    width: windowWidth - 20,
                  }}
                  imageUrls={[{
                    url:  roominfo.aliasImage || (groupImage == null ? roominfo.roomImage : groupImage)
                  }]}
                  loadingRender={() => <ActivityIndicator size="large" />}
                  onSwipeDown={handleCloseModal} // Optionally allow swipe down to close
                />
        </View>
      </Modal>

      {Platform.OS == "ios" ? null : (
        <StatusBar
          barStyle={isDarkMode ? "dark-content" : "dark-content"}
          backgroundColor={"rgba(52, 52, 52, 0.0)"}
        />
      )}

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

      <SetProfileModal
        visible={cameraModal}
        onRequestClose={() => setCameraModal(false)}
        Camera={() => captureImage()}
        select={() => selectImage()}
        cancel={() => setCameraModal(false)}
      />

      <ReportUserModel
        visible={reportUser}
        onRequestClose={() => setReportUser(false)}
        cancel={() => setReportUser(false)}
        report_user={ReportuserChat}
      />
      <CustomBottomSheetModal
        ref={bottomSheetRef}
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        navigation={navigation}
        newChattingPress={newChattingPress}
      />

      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
      <View>
        <View style={styles.themeTopContainer}>
          <TouchableOpacity onPress={handleImagePress} style={styles.container}>
            <Image
              source={{
                uri:
                  roominfo.aliasImage ||
                  (groupImage == null ? roominfo.roomImage : groupImage),
              }}
              style={styles.image}
            />
            <View style={styles.overlay} />
          </TouchableOpacity>

          <View style={styles.plusImageContainer}>
            <TouchableOpacity
              style={styles.backArrowContainer}
              onPress={() => {
                navigation.pop();
              }}
            >
              <Image
                source={require("../../Assets/Icons/Back.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {newroomType !== "single" && 
            (currentUserData?.owner == globalThis.userChatId ||
              currentUserData?.isAdmin == true) &&
            newroomType !== "broadcast" && (
              <View style={styles.plusImageContainer1}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("EditGroupScreen", {
                      groupName: groupName,
                      groupImage: groupImage,
                      groupDetailData,
                      userstatus,
                      allow: allow,
                      isPublic: isPublic,
                    });
                  }}
                >
                  <Text
                    style={{
                      color: appBarText().textColor,
                      fontSize: FontSize.font,
                      fontFamily: font.medium(),
                    }}
                  >
                    {t("edit")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {newroomType == "broadcast" && (
            <View style={styles.plusImageContainer1}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("EditBroadcastScreen", {
                    groupName: groupName,
                    groupImage: groupImage,
                    groupDetailData,
                    userstatus,
                  });
                }}
              >
                <Text
                  style={{
                    color: appBarText().textColor,
                    fontSize: FontSize.font,
                    fontFamily: font.medium(),
                  }}
                >
                  {t("edit")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.contactContainer}>
            <Text style={styles.name1conText}>
              {roominfo.aliasName
                ? roominfo.aliasName
                : roominfo.contactName
                ? roominfo.contactName
                : typeof roominfo.roomName == "number"
                ? "+" + roominfo.roomName
                : roominfo.roomName}
            </Text>
          </View>
        </View>

        <View style={styles.themeContainer}>
          <ScrollView
          onScroll={(e) => {
            if(fetchmemberloader){
                handleScroll(e)
              }
          }}
          scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={{
              height: "auto",
            }}
          >
            {route?.params?.fromScreen != "SideManu" && (
              <>
                {newroomType == "single" && (
                  <View style={styles.chooseContainer}>
                    <Text style={styles.nText}>{t("status")}</Text>
                    <Text style={styles.statusText}>
                      {userstatus ? userstatus : "--"}
                    </Text>
                  </View>
                )}

                {newroomType == "multiple" && (
                  <View style={styles.chooseContainer}>
                    <Text style={styles.nText}>{t("group_description")}</Text>
                    <Text style={styles.statusText}>
                      {userstatus ? userstatus : t("no_description")}
                    </Text>
                  </View>
                )}

                {newroomType == "multiple" && (
                  <View style={styles.chooseContainer}>
                    <Text style={styles.nText}>{t("group_type")}</Text>
                    <Text style={styles.statusText}>
                      {currentUserData?.allow == "public"
                        ? t("user_admin_messages_allowed")
                        : t("admin_messages_allowed")}
                    </Text>
                  </View>
                )}
                {newroomType !== "broadcast" && (
                  <TouchableOpacity
                    onPress={() => mutechatfunct()}
                    style={styles.Container}
                  >
                    <Image
                      source={require("../../Assets/Icons/Mute.png")}
                      style={{
                        width: 25,
                        height: 25,
                        tintColor: iconTheme().iconColor,
                        marginLeft: 4,
                      }}
                      resizeMode="contain"
                    />
                    <Text style={styles.sText}>
                      {isnewmute == 0 ? t("unmuteChat") : t("muteChat")}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  onPress={() => lockChatfunction(!isLock)}
                  style={styles.Container}
                >
                  <Image
                    source={require("../../Assets/Icons/Lock.png")}
                    style={styles.circleImageLayout}
                    resizeMode="contain"
                  />
                  <Text style={styles.sText}>
                    {isLock == 0 ? t("lockChat") : t("unlockChat")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => ArchieveChatApiCalling()}
                  style={styles.Container}
                >
                  <Image
                    source={require("../../Assets/Icons/Hide.png")}
                    style={styles.circleImageLayout}
                    resizeMode="contain"
                  />
                  <Text style={styles.sText}>
                    {isnewarchiveroom ? t("unhideChat") : t("hideChat")}
                  </Text>
                </TouchableOpacity>

                {newroomType == "single" && (
                  <React.Fragment>
                    <TouchableOpacity
                      onPress={() => {
                        const opt = isnewblock ? "unblock" : "block";
                        BlockChatApiCalling(opt);
                      }}
                      style={styles.Container}
                    >
                      <Image
                        source={require("../../Assets/Icons/Block.png")}
                        style={styles.circleImageLayout}
                        resizeMode="contain"
                      />
                      <Text style={styles.sText}>
                        {isnewblock ? t("unblockChat") : t("blockChat")}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                )}

                {
                  
                  newroomType !== "single" &&
                    newroomType !== "broadcast" && 
                    (currentUserData?.owner == globalThis.userChatId ||
                      currentUserData?.isAdmin == true) && (
                      <TouchableOpacity
                        style={styles.Container}
                        onPress={() => setCameraModal(true)}
                      >
                        <Image
                          source={require("../../Assets/Icons/Set_Profile.png")}
                          style={styles.circleImageLayout}
                          resizeMode="contain"
                        />
                        <Text style={styles.sText}>{t("setGroupImage")}</Text>
                      </TouchableOpacity>
                    )
                }
                {
                 
                  newroomType !== "single" &&
                    newroomType !== "broadcast" && 
                    (currentUserData?.owner == globalThis.userChatId ||
                      currentUserData?.isAdmin == true) &&
                    roominfo.roomImage !==
                      "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Document/1717401343823_36FA5C33-D2AD-40F0-AC1B-E35C078FCFFE.jpg" && (
                      <TouchableOpacity
                        style={styles.Container}
                        onPress={removeImage}
                      >
                        <Image
                          source={require("../../Assets/Icons/delete_image.png")}
                          style={{
                            width: 22,
                            height: 25,
                            tintColor: iconTheme().iconColor,
                          }}
                          resizeMode="contain"
                        />
                        <Text style={styles.sText}>{"Remove Image"}</Text>
                      </TouchableOpacity>
                    )
                }

                {newroomType == "single" && (
                  <TouchableOpacity
                    style={styles.reportContainer}
                    onPress={() => setReportUser(true)}
                  >
                    <Image
                      source={require("../../Assets/Icons/Report.png")}
                      style={styles.reportImageLayout}
                      resizeMode="contain"
                    />
                    <Text style={styles.reportText}>{t("Report_User")}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => deleteAlert()}
                  style={styles.reportContainer}
                >
                  <Image
                    source={require("../../Assets/Icons/delete_chat.png")}
                    style={{ width: 22, height: 22, tintColor: "red" }}
                    resizeMode="contain"
                  />
                  <Text style={styles.reportText}>{t("deleteChat")}</Text>
                </TouchableOpacity>
                {((newroomType !== "single" && 
                  currentUserData?.owner !== globalThis.userChatId &&
                  currentUserData?.isAdmin !== 1 &&
                  isnewblock == 0) ||
                  (adminCount > 1 &&
                    // isPublic == 0 &&
                    currentUserData?.isAdmin == 1)) && (
                  <TouchableOpacity
                    onPress={() => exitAlert()}
                    style={styles.reportContainer}
                  >
                    <Image
                      source={require("../../Assets/Icons/exit_group.png")}
                      style={styles.reportImageLayout}
                      resizeMode="contain"
                    />
                    <Text style={styles.reportText}>{t("exitGroup")}</Text>
                  </TouchableOpacity>
                )}

                {newroomType !== "single" &&
                  (globalThis.userChatId == currentUserData?.owner ||
                    currentUserData?.isAdmin == 1) && isPublic == 0 &&
                  newroomType != "broadcast" && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Confirm",
                          "Are you sure you want to detele this group permanently",
                          [
                            {
                              text: "Cancel",
                              onPress: () => console.log("No Pressed"),
                              style: "cancel",
                            },
                            {
                              text: "Yes",
                              onPress: () => DeleteGroupApi(),
                            },
                          ]
                        );
                      }}
                      style={styles.reportContainer}
                    >
                      <Image
                        source={require("../../Assets/Icons/Delete.png")}
                        style={styles.reportImageLayout}
                        resizeMode="contain"
                      />
                      <Text style={styles.reportText}>{t("deleteGroup")}</Text>
                    </TouchableOpacity>
                  )}

              {newroomType !== "single" &&
                  (globalThis.userChatId == currentUserData?.owner &&
                    currentUserData?.isAdmin == 1) && isPublic == 1 &&
                  newroomType != "broadcast" && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Confirm",
                          "Are you sure you want to detele this group permanently",
                          [
                            {
                              text: "Cancel",
                              onPress: () => console.log("No Pressed"),
                              style: "cancel",
                            },
                            {
                              text: "Yes",
                              onPress: () => DeleteGroupApi(),
                            },
                          ]
                        );
                      }}
                      style={styles.reportContainer}
                    >
                      <Image
                        source={require("../../Assets/Icons/Delete.png")}
                        style={styles.reportImageLayout}
                        resizeMode="contain"
                      />
                      <Text style={styles.reportText}>{t("deleteGroup")}</Text>
                    </TouchableOpacity>
                  )}
              </>
            )}

            {newroomType !== "single" && (
              <View>
                <View style={styles.chooseContainer}>
                  <Text style={styles.nText}>
                    {TotalMembersCount} {t("members")}
                  </Text>
                </View>

                {renderIf(
                  groupDetailData?.length === 0,
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "20%",
                    }}
                  >
                    <ActivityIndicator
                      size="large"
                      color={iconTheme().iconColorNew}
                    />
                    <Text style={{ marginTop: 10 }}>
                      Fetching members. Please wait...
                    </Text>
                  </View>
                )}
                <FlatList
                  nestedScrollEnabled={true}
                  scrollEnabled={false}
                  onEndReachedThreshold={0.5}
                  data={groupDetailData.sort(
                    (a: any, b: any) => b.isAdmin - a.isAdmin
                  )}
                  renderItem={({ item, index }: any) => {
                    console.log("item",item);
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.profile2Container, {}]}
                      >
                        {renderIf(
                          makeAdminModel == true &&
                          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            item.userId == clickedUser.userId,
                          <TouchableOpacity
                            style={{
                              height: 30,
                              backgroundColor: "#FAF9F6",
                              position: "absolute",
                              right: 30,
                              top: 0,
                              zIndex: 100,
                              justifyContent: "center",
                              borderWidth: 0.5,
                              borderColor: "#000",
                              padding: 5,
                            }}
                            onPress={() =>
                              makeAdminButtonPress(
                                { userId: item.userId, isAdmin: item.isAdmin },
                                item.roomId
                              )
                            }
                          >
                            <Text style={{ color: "#000" }}>
                              {
                               // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                clickedUser && clickedUser?.isAdmin == 0
                                  ? t("make_admin")
                                  : t("remove_admin")
                              }
                            </Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          onPress={() => {
                            if (
                              item.userId != globalThis.globalThis.chatUserId
                            ) {
                              getProfileApi(
                                item.userId,
                                item.userName,
                                item.image ||
                                  "https://tokeecorp.com/backend/public/images/user-avatar.png"
                              );
                            }
                          }}
                          style={styles.Container2}
                        >
                          {item?.owner !== item?.userId &&
                            currentUserData?.isAdmin == 1 &&
                            item?.userId != currentUserData?.owner && 
                            item?.userId != globalThis?.chatUserId &&
                            newroomType !== "single" && (
                              <TouchableOpacity
                                style={{
                                  position: "absolute",
                                  right: 0,
                                  top: -5,
                                  zIndex: 10,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  height: 22,
                                  width: 22,
                                  borderRadius: 50,
                                  backgroundColor: searchBar().back_ground,
                                }}
                                onPress={() => {
                                  Alert.alert(
                                    "Confirm?",
                                    isPublic
                                      ? "After being removed, this individual is no longer eligible for rejoining this group."
                                      : `Do you want to remove this member from ${
                                          newroomType != "broadcast"
                                            ? "group"
                                            : "broadcast"
                                        }?`,
                                    [
                                      {
                                        text: "Cancel",
                                        onPress: () =>
                                          console.log("No Pressed"),
                                        style: "cancel",
                                      },
                                      {
                                        text: "Yes",
                                        onPress: () =>
                                          removeMember(
                                            newroomID,
                                            item.userId,
                                            item.userName ||
                                              item.name ||
                                              item.roomName
                                          ),
                                      },
                                    ]
                                  );
                                }}
                              >
                                <Image
                                  source={require("../../Assets/Icons/Cross.png")}
                                  style={{
                                    height: 10,
                                    width: 10,
                                    tintColor: iconTheme().iconColor,
                                  }}
                                />
                              </TouchableOpacity>
                            )}
                          <Image
                            source={
                              item.image
                                ? { uri: item.image }
                                : {
                                    uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                                  }
                            }
                            style={styles.circleImageLayout1}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            if (
                              item.userId != globalThis.globalThis.chatUserId
                            ) {
                              getProfileApi(
                                item.userId,
                                item.userName,
                                item.image ||
                                  "https://tokeecorp.com/backend/public/images/user-avatar.png"
                              );
                            }
                          }}
                          style={[
                            styles.naContainer,
                            {
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                            },
                          ]}
                        >
                          <Text style={styles.nameconText}>
                            {
                              item.userId == globalThis.chatUserId
                                ? t("you")
                                : item.name || item.userName || item.roomName
                            }
                          </Text>
                          { item?.premium == "1"  &&
          <Image
                source={require("../../Assets/Icons/bx_star_dark.png")}
                style={{height:15, width:15,marginTop:2, tintColor:iconTheme().iconColorNew}}
              />
              }
                          {
                            item.userId != globalThis.chatUserId && (
                              <TouchableOpacity
                                onPress={() => {
                                  setReportUserID(item.userId);
                                  setReportUser(true);
                                }}
                              >
                                <Image
                                  source={require("../../Assets/Icons/Report.png")}
                                  style={{
                                    height: 20,
                                    width: 20,
                                    marginHorizontal: 5,
                                  }}
                                  resizeMode="contain"
                                />
                              </TouchableOpacity>
                            )
                          }
                        </TouchableOpacity>

                        {newroomType !== "single" &&
                          item.isAdmin == 1 &&
                          item.userId != item?.owner &&
                          item.userId != globalThis.chatUserId &&
                          item.userId != currentUserData?.owner &&
                          newroomType != "broadcast" &&
                          currentUserData?.isAdmin == true && (
                            <View style={styles.editProfile2}>
                              <Text
                                style={styles.adminText}
                                onPress={() => {
                                  setClickedUser({
                                    userId: item.userId,
                                    isAdmin: item.isAdmin,
                                    user: item,
                                  });
                                  removeAdminButtonPress(
                                    {
                                      userId: item.userId,
                                      isAdmin: item.isAdmin,
                                    },
                                    newroomID
                                  );
                                }}
                              >
                                {t("remove_admin")}
                              </Text>
                            </View>
                          )}
                        {newroomType !== "single" &&
                          item.isAdmin == "0" &&
                          item.userId != item?.owner &&
                          item.userId != globalThis.chatUserId &&
                          newroomType != "broadcast" &&
                          currentUserData?.isAdmin == true && (
                            <View style={styles.editProfile2}>
                              <Text
                                style={styles.adminText}
                                onPress={() => {
                                  setClickedUser({
                                    userId: item.userId,
                                    isAdmin: item.isAdmin,
                                    user: item,
                                  });
                                  makeAdminButtonPress(
                                    {
                                      userId: item.userId,
                                      isAdmin: item.isAdmin,
                                    },
                                    newroomID
                                  );
                                }}
                              >
                                {t("make_admin")}
                              </Text>
                            </View>
                          )}

                        {newroomType !== "single" &&
                          item.userId == currentUserData?.owner && (
                            <View style={styles.editProfile3}>
                              <Text style={styles.adminText}>{t("owner")}</Text>
                            </View>
                          )}
                        {newroomType !== "single" &&
                          item.userId !== currentUserData?.owner &&
                          item.isAdmin == true &&
                          item.userId == globalThis.chatUserId &&
                          currentUserData?.isAdmin == true && (
                            <View style={[styles.editProfile3, {}]}>
                              <Text style={styles.adminText}>{t("admin")}</Text>
                            </View>
                          )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            <View style={{ height: 400 }}></View>
            <LoaderModel visible={loading} />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
