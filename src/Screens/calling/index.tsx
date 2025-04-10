import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
  Animated,
  AppState,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
//internal imports
import RNCallKeep from "react-native-callkeep";
import { images } from "../../utils/constants/assets";
import { colors } from "../../utils/constants/colors";
import { fonts } from "../../utils/constants/fonts";
import { STRING_CONSTANTS } from "../../utils/constants/stringConstants";
import { emptyFunction } from "../../utils/globalFunctions";
import { globalStyles } from "../../utils/globalStyles";
import { Agora } from "../agora";
import { StoreType } from "../../types";

import {
  resetVoipReducer,
  updateAgoraData,
  updateCallData,
  updateCallState,
} from "../../reducers/VoipReducer";
import {
  resetCallerIdReducer,
  updateCallerId,
} from "../../reducers/callerIDReducers";
import { resetDataReducer } from "../../reducers/dataReducer";

import { TouchableWithoutFeedback } from "react-native";
import {
  Base_Url,
  Base_Url2,
  generateAgoraTokenApi,
  get_call_active_member,
  groupCallApi,
  update_call_status,
} from "../../Constant/Api";
import useAppState from "../../hooks/useAppState";
import withCallTimer from "../../hooks/withCallTimer";
import { socket } from "../../socket";
import { getActiveMembersOnCall, stopSound } from "../../utils/callKitCustom";
import { PlaySound, StopIncomingSound } from "../agora/agoraHandler";
import AudioCallOptions from "./components/AudioCallOptions";
import BackgroundAudioCall from "./components/BackgroundAudioCall";
import BackgroundVideoCall from "./components/BackgroundVideoCall";
import CallDuration from "./components/CallDuration";
import CallProfile from "./components/CallProfile";
import Video from "./components/Video";
import { AppBaseModal } from "../../Components/Calling/AppBaseModal";
import { AppText } from "../../Components/Calling/AppText";
import { AppImageIcon } from "../../Components/Calling/AppImageIcon";
import ProfileList from "./components/AudioNewFile";
import { clearProfiles } from "../../reducers/ProfileCallingReducer";
import { FlatList } from "react-native";
import CheckBox from "@react-native-community/checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uuidv4 } from "react-native-compressor";
import { setUniqueFriendsData } from "../../reducers/friendListSlice";
import { COLORS, iconTheme, themeModule } from "../../Components/Colors/Colors";
import { showToast } from "../../Components/CustomToast/Action";
import { dimensConstants } from "../../utils/constants/dimensConstant";
//import CallDetectorManager from 'react-native-call-detection';

////////////////////////////////////////////////////
let allData = {};
interface CallingProps {
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
}
const Calling = ({ startTimer, stopTimer }: CallingProps) => {
  const [visible, setVisible] = useState(false);
  const [friendModalvisible, setFriendModalvisible] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedFriendsChatId, setSelectedFriendsChatId] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedFriendsData, setSelectedFriendsData] = useState([]);

  console.log("selectedFriendsData===========", selectedFriendsData);

  const CLEANUP_INTERVAL = 5000; // Check every 5 seconds
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const callRef = useRef(null);
  const appStateVisible = useAppState();
  //hooks
  const dispatch = useDispatch();
  // eslint-disable-next-line
  const agoraRef = useRef<any>(null);
  //redux states

  const memberGroupCall = useSelector((state) => {
    return state?.callerIDReducers?.userData?.memberGroupCall;
  });

  const uniqueFriendsData = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.uniqueFriendsData
  );
  console.log(
    "uniqueFriendsData====================================",
    memberGroupCall
  );
  ////////get calling data////////////////////////////////////////////////////////////////////////////

  const callState = useSelector((state: StoreType) => {
    return state?.VoipReducer?.call_state || {};
  });
  const callData = useSelector((state: StoreType) => {
    return state?.VoipReducer?.call_data || {};
  });
  const agoraData = useSelector((state: StoreType) => {
    return state?.VoipReducer?.agora_data || {};
  });

  const generateAgoraToken = async (channelName, uid) => {
    let url = Base_Url + generateAgoraTokenApi;

    let bodyData = {
      channel_name: channelName,
      uid: uid,
    };

    try {
      const response = await axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
        data: bodyData,
      });

      console.log("Token API response: ", response.data.token);

      return response.data.token; // Return the token
    } catch (error) {
      console.error("Error generating token: ", error);
      throw error;
    }
  };


  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  console.log("agoraDatatt====================================", agoraData);

  const call_id = useSelector((state: StoreType) => {
    return state?.callerIDReducers?.userData?.call_id;
  });

  console.log("index tsx call_id====================================", call_id);

  const friendsData = useSelector((state) => state?.friendListSlice?.friends);

  const MAX_USERS = 9;
  const guestUserUids = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_data?.guestVideoUids || []
  );

  const profiles = useSelector((state) => state?.profileSlice?.profiles || []);

  console.log("profiles===========", profiles);

  const uniqueGuestUserUids = Array.from(new Set(guestUserUids));

  console.log("uniqueGuestUserUids===========", uniqueGuestUserUids);

  const userData = { id: `${globalThis.sender_id}` };

  const userPushData = useSelector((state: StoreType) => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    return state.callerIDReducers.userData || {};
  });

  const filterAndSetUniqueFriends = () => {
    const filteredFriends = friendsData.filter((friend) => {
      const isExcludedByGuestUser = uniqueGuestUserUids.includes(
        friend.contact_id
      );
      const isExcludedBySelection = selectedFriendsData.some(
        (selected) => selected.contact_id === friend.contact_id
      );

      if (isExcludedByGuestUser || isExcludedBySelection) {
        console.log("Excluding contact_id:", friend.contact_id); // Debugging log
      }

      return !isExcludedByGuestUser && !isExcludedBySelection; // Keep only non-excluded friends
    });

    console.log("Filtered Friends:", filteredFriends); // Debug log
    // Dispatch the filtered list to Redux
    dispatch(setUniqueFriendsData(filteredFriends));
  };

  globalThis.callStatus = agoraData?.channel_name;
  const remainingSlots = MAX_USERS - uniqueGuestUserUids.length;

  const data = useSelector((state) => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    return state.dataReducer.data;
  });
  allData = data;

  useEffect(() => {
    if (Platform.OS == "android") {
      getPermission();
    }
  }, []);

  useEffect(() => {
    socket.on("callEvents", async (data: any) => {
      console.log(
        "socket data in index====================================",
        data.data
      );
      const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
      const loginToken = await AsyncStorage.getItem("authToken");
      const dataAgora = data.data;

      if (dataAgora?.status == "addUser") {
        dispatch(updateCallerId({ memberGroupCall: true }));
        const activeMembersResponse = await getActiveMembersOnCall(call_id);
        console.log(
          "Active Members Response:",
          activeMembersResponse.data.member
        );

        const formattedNames = activeMembersResponse.data.member.join(" & "); // This will join the names with " & "

        console.log("Formatted Names:", formattedNames);

        const updateReciver = {
          receiver_name: formattedNames,
        };

        const updateSender = {
          sender_name: formattedNames,
        };

        if (agoraData?.sender == userData?.id) {
          dispatch(updateAgoraData(updateReciver));
        } else {
          dispatch(updateAgoraData(updateSender));
        }
      }

      if (
        dataAgora.status == "incoming" &&
        callState.state != "active" &&
        loginToken != null &&
        Platform.OS == "android" &&
        AppState.currentState == "active"
      ) {
        PlaySound(
          "https://wokii.io/backend/public/uploads/ringtone/ringtone.mp3"
        );
        globalThis.statusCheck = "active";
        globalThis.activeChannel = dataAgora?.channel_name;
        if (dataAgora?.groupCall == true) {
          dispatch(updateCallerId({ groupCall: true }));
        }

        globalThis.wayOfCall = undefined;
        globalThis.callStatus = dataAgora?.channel_name;

        const token = await generateAgoraToken(
          dataAgora?.channel_name,
          senderData?.sender_id
        );
        dispatch(updateCallerId({ call_id: dataAgora?.call_id }));
        const agoraData = {
          uid: dataAgora?.uid,
          app_id: dataAgora?.app_id,
          channel_name: dataAgora?.channel_name,
          is_video: dataAgora?.is_video,
          token: token,
          receiver: `${senderData.sender_id}`,
          sender: dataAgora?.sender,
          userStatus:
            dataAgora?.sender_name +
            " " +
            "called" +
            " " +
            dataAgora?.receiver_name,
          receiver_image: dataAgora?.receiver_image,
          receiver_name: dataAgora?.receiver_name,
          sender_image: dataAgora?.sender_image,
          sender_name: dataAgora?.sender_name,
          isVideo: dataAgora?.isVideo,
          caller: dataAgora?.sender,
          uid_2: `${senderData.sender_id}`,
          uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
          status: dataAgora?.status,
        };

        dispatch(updateAgoraData(agoraData));
        dispatch(
          updateCallData({
            isVideo: dataAgora?.isVideo,
            session: dataAgora?.isVideo
              ? "agora_session.video"
              : "agora_session.audio",
            //guestVideoUid: 155,
          })
        );
        dispatch(
          updateCallState({
            state: "incoming",
            isBackground: false,
            isVideo: dataAgora?.isVideo,
          })
        );
        setTimeout(() => {
          globalThis.statusCheck = "active";
        }, 2500);
      }

      if (dataAgora.status == "answer") {
        dispatch(updateCallerId({ id: `${senderData.sender_id}` }));
        stopSound();
        globalThis.callStatus = dataAgora?.channel_name;
        globalThis.statusCheck = "active";
        globalThis.activeChannel = dataAgora?.channel_name;
        dispatch(updateCallState({ state: "active" }));
      }
    });
  }, []);

  const getPermission = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  const hideBusy = () => {
    globalThis.statusCheck = undefined;
    leaveCall();
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCall("missed", allData?.channel_name);
    StopIncomingSound();
    setTimeout(() => {
      dispatch(resetDataReducer());
      dispatch(resetVoipReducer());
      stopSound();
    }, 1000);
  };

  useEffect(() => {
    if (callState.state === "ended") {
      globalThis.statusCheck = undefined;
      setFriendModalvisible(false);
    }
  }, [callState.state]);

  // end call if user is busy on another call
  useEffect(() => {
    if (callState.state == "busy") {
      setTimeout(() => {
        stopSound();
        hideBusy();
        StopIncomingSound();
      }, 5000);
    }
  }, [callState.state]);

  useEffect(() => {
    if (callState.state === "incoming") {
      Vibration.vibrate([1000, 500, 1000], true);
    }
    if (callState.state === "active" || callState.state === "declined") {
      Vibration.cancel();
    }
  }, [callState]);

  useEffect(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (callState.state == "") {
      globalThis.statusCheck = undefined;
    }
  }, [callState.state]);

  useEffect(() => {
    if (callState.state != "outgoing") {
      stopSound();
    }
  }, [callState.state]);

  // end call after 1 minutes if user not picked-up
  useEffect(() => {
    if (callState.state === "outgoing") {
      // Set up the timeout only when callState.state is 'outgoing'
      const timeoutId = setTimeout(() => {
        try {
          endCall();
          stopSound();
          StopIncomingSound();
          globalThis.statusCheck = undefined;
        } catch (error) {
          console.error("Error in setTimeout function:", error);
        }
      }, 90000);

      // Clean up the timeout when the component unmounts or when the call state changes
      return () => clearTimeout(timeoutId);
    }
  }, [callState.state]);

  const friendModal = () => {
    setFriendModalvisible(false);
    setVisible(true);
    setSelectedFriends([]);
    setSelectedFriendsChatId([]);
    setTimeout(() => {
      setVisible(true);
    }, 500);
  };

  useEffect(() => {
    if (callState.state === "incoming") {
      // Set up the timeout only when callState.state is 'outgoing'
      const timeoutId = setTimeout(() => {
        try {
          globalThis.statusCheck = undefined;
          endCall();
          StopIncomingSound();
        } catch (error) {
          console.error("Error in setTimeout function:", error);
        }
      }, 90000);

      // Clean up the timeout when the component unmounts or when the call state changes
      return () => clearTimeout(timeoutId);
    }
  }, [callState.state]);

  const startCall = async (type: string, channel: string) => {
    const url: string = Base_Url2 + update_call_status;
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
        data: {
          channel_name: channel,
          status: type,
        },
      })
        .then((response) => {
          console.log("response===========", response.data);
        })
        .catch((error) => {
          alert(error);
        });
    } catch (error) {
      alert(error);
    }
  };

  const defaultAvatar =
    "https://tokeecorp.com/backend/public/images/user-avatar.png";

  const imagess = [
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739796875560_1739796871443.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739796994362_1739796983177.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797046221_1739797039370.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797091786_1739797084582.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797127854_1739797120576.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797177163_1739797172456.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797278426_1739797253465.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797388061_1739797362230.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1739797436193_1739797429552.jpg",
  ];

  const getProfileImage = (agoraData, userData) => {
    const imageUrl =
      agoraData?.sender == userData?.id
        ? agoraData?.receiver_image
        : agoraData?.sender_image;

    return imageUrl === defaultAvatar
      ? imagess[Math.floor(Math.random() * imagess.length)]
      : imageUrl;
  };

  const startCallVideo = async (type: string, channel: string) => {
    const url: string = Base_Url + update_call_status;
    try {
      axios({
        method: "post",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
        data: {
          channel_name: channel,
          status: type,
        },
      })
        .then((response) => {
          console.log("response===========", response.data);
        })
        .catch((error) => {
          alert(error);
        });
    } catch (error) {
      alert(error);
    }
  };

  const addVideo = () => {
    const agoraData = {
      uid: "44",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      app_id: allData?.app_id,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: allData?.channel_name,
      is_video: true,
      jwt: "",
      token: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver: allData?.receiver,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender: allData?.sender,
      userStatus: " ",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_image: allData?.receiver_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_name: allData?.receiver_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_image: allData?.sender_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_name: allData?.sender_name,
      token_2: "",
      isVideo: true,
      image:
        "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      caller: allData?.sender_name,
      uid_2: "84",
      roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
      uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      status: "active",
      request: "request",

      from: globalThis.userChatId,
    };

    socket.emit("callEvents", {
      toUserId: globalThis.FriendChatId,
      data: agoraData,
    });
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCallVideo("request", allData?.channel_name);
  };

  const renderSearchBox = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingHorizontal: 12,
          paddingVertical: 0,
          marginHorizontal: 12,
          marginBottom: 10,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3, // Android shadow
          height: 50,
        }}
      >
        <TextInput
          placeholder="Search friends..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          style={{
            flex: 1,
            fontSize: 16,
            color: "#000",
          }}
        />
      </View>
    );
  };

  const renderFriendItem = ({ item }) => {
    const isSelected = selectedFriends.includes(item.contact_id);
    const isMaxReached =
      selectedFriends.length + uniqueGuestUserUids.length >= MAX_USERS;

    return (
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginHorizontal: 12,
          borderRadius: 10,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3, // Android shadow
          marginBottom: 10,
        }}
        onPress={() => {
          if (!isMaxReached || isSelected) {
            toggleFriendSelection(item.contact_id, item.chat_user_id, item);
          }
        }}
      >
        {/* Profile Image */}
        <Image
          source={{ uri: item.profile_image }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
        />

        {/* Name */}
        <Text style={{ flex: 1, fontSize: 16, color: "#000" }}>
          {item.name || item.contact_name}
        </Text>

        {/* Custom Checkbox */}
        <Pressable
          style={{
            width: 24,
            height: 24,
            borderRadius: 12, // Circular shape
            borderWidth: 2,
            borderColor: isMaxReached && !isSelected ? "#ccc" : "#25D366", // Disable color if max reached
            backgroundColor: isSelected ? "#25D366" : "transparent",
            opacity: isMaxReached && !isSelected ? 0.5 : 1, // Reduce opacity for disabled checkboxes
          }}
          onPress={() => {
            if (!isMaxReached || isSelected) {
              toggleFriendSelection(item.contact_id, item.chat_user_id, item);
            }
          }}
        />
      </Pressable>
    );
  };

  const filteredFriends = uniqueFriendsData.filter((friend) =>
    friend.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedFriends = filteredFriends.sort((a, b) =>
    a.name?.toLowerCase().localeCompare(b.name?.toLowerCase())
  );

  const toggleFriendSelection = (friendId, chatId, item) => {
    setSelectedFriends((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(friendId);
      return isAlreadySelected
        ? prevSelected.filter((id) => id !== friendId) // Remove if selected
        : prevSelected.length + uniqueGuestUserUids.length < MAX_USERS
        ? [...prevSelected, friendId] // Add if under limit
        : prevSelected;
    });

    setSelectedFriendsChatId((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(chatId);
      return isAlreadySelected
        ? prevSelected.filter((id) => id !== chatId)
        : prevSelected.length + uniqueGuestUserUids.length < MAX_USERS
        ? [...prevSelected, chatId]
        : prevSelected;
    });

    setSelectedFriendsData((prevSelected) => {
      const existingIndex = prevSelected.findIndex(
        (f) => f.chat_user_id === item.chat_user_id
      );

      if (existingIndex !== -1) {
        return prevSelected; // Do nothing if already exists
      } else if (prevSelected.length + uniqueGuestUserUids.length < MAX_USERS) {
        return [...prevSelected, { ...item, addedAt: Date.now() }];
      } else {
        return prevSelected; // Keep the existing state if the limit is reached
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedFriendsData((prevSelected) => {
        const now = Date.now();
        return prevSelected.filter((f) => now - f.addedAt < 90000); // Keep only items added within last 90 sec
      });
    }, CLEANUP_INTERVAL);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // const initiateCall = async () => {
  //   const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
  //   let contactNum = JSON.parse(await AsyncStorage.getItem("userContactNumber") );
  //   let uUID = uuidv4().toUpperCase().toString();

  //   dispatch(updateCallerId({ memberGroupCall: true }));

  //   // run map of selectedFriendsData and add a key AlreadyCalled boolean as true and date & time... on UI render check if this key is true check box and entire row should be disabled.

  //   const sendAddUserData = {
  //     status: "addUser",
  //     addUserName: `${selectedFriendsData?.contact_name}`,
  //   };

  //   const chatIds = profiles
  //     .map((profile) => profile.chat_user_id)
  //     .filter((id) => id !== undefined);

  //   const firstNamesString = profiles
  //     .map((profile) => profile.first_name)
  //     .filter((name) => name !== undefined)
  //     .join(" & ");

  //   socket.emit("callEvents", {
  //     toUserId: chatIds,
  //     data: sendAddUserData,
  //   });

  //   setFriendModalvisible(false);
  //   setVisible(true);
  //   const url = groupCallApi;
  //   const payload = {
  //     call_id: call_id,
  //     uid: `${globalThis.sender_id}`,
  //     uid_2: "84",
  //     app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
  //     contactNum: `${contactNum}`,
  //     chatId: senderData?.userChatId,
  //     uuid: uUID,
  //     channel_name: allData?.channel_name,
  //     jwt: "",
  //     token: "",
  //     is_video: agoraData?.is_video,
  //     status: "incoming",
  //     sender_image: globalThis.userImage,
  //     sender_name: senderData?.userName + " " + "&" + " " + firstNamesString,
  //     sender: `${senderData?.sender_id}`,
  //     members: selectedFriends,
  //     isNormalGroupCall: true,
  //   };

  // setTimeout(async () => {

  //   try {
  //     const response = await axios.post(url, payload, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: "Bearer " + globalThis.token,
  //       },
  //     });

  //     if (response.data.status == true) {
  //       showToast(
  //         `Member${
  //           selectedFriends.length > 1 ? "s" : ""
  //         } added to the call. Awaiting their acceptance.`
  //       );
  //       console.log("Call initiated successfully:", response.data);
  //       setSelectedFriends([]);
  //       setSelectedFriendsChatId([]);

  //       const activeMembersResponse = await getActiveMembersOnCall(call_id);
  //       console.log(
  //         "Active Members Response:",
  //         activeMembersResponse.data.member
  //       );

  //       const formattedNames = activeMembersResponse.data.member.join(" & "); // This will join the names with " & "

  //       console.log("Formatted Names:", formattedNames);

  //       const updateReciver = {
  //         receiver_name: formattedNames,
  //       };

  //       const updateSender = {
  //         sender_name: formattedNames,
  //       };

  //       if (agoraData?.sender == userData?.id) {
  //         dispatch(updateAgoraData(updateReciver));
  //       } else {
  //         dispatch(updateAgoraData(updateSender));
  //       }

  //       const agoraDataa = {
  //         call_id: call_id,
  //         uid: `${senderData?.sender_id}`,
  //         app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
  //         channel_name: agoraData?.channel_name,
  //         is_video: agoraData?.is_video,
  //         token: "",
  //         sender: `${senderData?.sender_id}`,
  //         receiver: "84",
  //         userStatus: "",
  //         receiver_image: "",
  //         receiver_name: "",
  //         sender_image: senderData?.userImage,
  //         sender_name: senderData?.userName + " " + "&" + " " + formattedNames,
  //         status: "incoming",
  //         isVideo: agoraData?.isVideo,
  //         caller: senderData?.userName,
  //         uid_2: "88",
  //         uuid: uUID,
  //         chatId: senderData?.userChatId,
  //         callByAdd: true
  //       };

  //       socket.emit("callEvents", {
  //         toUserId: selectedFriendsChatId,
  //         data: agoraDataa,
  //       });
  //     } else {
  //       setSelectedFriends([]);
  //       setSelectedFriendsChatId([]);
  //       console.error("Error initiating call:", response.data);
  //       Alert.alert("Error", "Failed to initiate call. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("API Error:", error);
  //     alert(error);
  //   }

  // }, 2000);

  //   // run a timer in end for 90 seconds and update the friends array back again with key AlreadyCalled to false if the UniquechatId array doesn't contain the row with AlreadyCalled as true & date time value > 90 seconds
  // };

  const initiateCall = async () => {
    setFriendModalvisible(false);
    const senderData = JSON.parse(await AsyncStorage.getItem("sender_Data"));
    let contactNum = JSON.parse(
      await AsyncStorage.getItem("userContactNumber")
    );
    let uUID = uuidv4().toUpperCase().toString();
    dispatch(updateCallerId({ memberGroupCall: true }));

    // run map of selectedFriendsData and add a key AlreadyCalled boolean as true and date & time... on UI render check if this key is true check box and entire row should be disabled.

    const chatIds = profiles
      .map((profile) => profile.chat_user_id)
      .filter((id) => id !== undefined);

    const firstNamesString = selectedFriendsData
      .map((profile) => profile.name)
      .filter((name) => name !== undefined && name !== null && name !== "")
      .join(" & ");

    const updateReciver = {
      receiver_name: agoraData?.receiver_name + " & " + firstNamesString,
    };

    const updateSender = {
      sender_name: agoraData?.sender_name + " & " + firstNamesString,
    };

    if (agoraData?.sender == userData?.id) {
      dispatch(updateAgoraData(updateReciver));
    } else {
      dispatch(updateAgoraData(updateSender));
    }

    const agoraDataa = {
      call_id: call_id,
      uid: `${senderData?.sender_id}`,
      app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
      channel_name: agoraData?.channel_name,
      is_video: agoraData?.is_video,
      token: "",
      sender: `${senderData?.sender_id}`,
      receiver: "84",
      userStatus: "",
      receiver_image: "",
      receiver_name: "group call",
      sender_image: senderData?.userImage,
      sender_name: senderData?.userName + " " + "&" + " " + firstNamesString,
      status: "incoming",
      isVideo: agoraData?.isVideo,
      caller: senderData?.userName,
      uid_2: "88",
      uuid: uUID,
      chatId: senderData?.userChatId,
      callByAdd: true,
    };

    socket.emit("callEvents", {
      toUserId: selectedFriendsChatId,
      data: agoraDataa,
    });

    const sendAddUserData = {
      status: "addUser",
      addUserName: firstNamesString,
    };

    setTimeout(() => {
      socket.emit("callEvents", {
        toUserId: chatIds,
        data: sendAddUserData,
      });
    }, 5000);

    setVisible(true);
    setTimeout(() => {
      setVisible(true);
    }, 500);

    const url = groupCallApi;
    const payload = {
      call_id: call_id,
      notification_type: "calls",
      uid: `${globalThis.sender_id}`,
      uid_2: "84",
      app_id: "3fe7a6177c5a49998f7cb2c273b97f03",
      contactNum: `${contactNum}`,
      chatId: senderData?.userChatId,
      uuid: uUID,
      channel_name: allData?.channel_name,
      jwt: "",
      token: "",
      is_video: agoraData?.is_video,
      status: "incoming",
      sender_image: globalThis.userImage,
      sender_name: senderData?.userName + " " + "&" + " " + firstNamesString,
      sender: `${senderData?.sender_id}`,
      members: selectedFriends,
      isNormalGroupCall: true,
    };

    setTimeout(async () => {
      try {
        const response = await axios.post(url, payload, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + globalThis.token,
          },
        });

        if (response.data.status == true) {
          showToast(
            `Member${
              selectedFriends.length > 1 ? "s" : ""
            } added to the call. Awaiting their acceptance.`
          );
          console.log("Call initiated successfully:", response.data);
          socket.emit("callEvents", {
            toUserId: chatIds,
            data: sendAddUserData,
          });

          const activeMembersResponse = await getActiveMembersOnCall(call_id);
          console.log(
            "Active Members Response:",
            activeMembersResponse.data.member
          );

          const formattedNames = activeMembersResponse.data.member.join(" & "); // This will join the names with " & "

          console.log("Formatted Names:", formattedNames);

          const updateReciver = {
            receiver_name: formattedNames,
          };

          const updateSender = {
            sender_name: formattedNames,
          };

          if (agoraData?.sender == userData?.id) {
            dispatch(updateAgoraData(updateReciver));
          } else {
            dispatch(updateAgoraData(updateSender));
          }

          setSelectedFriends([]);
          setSelectedFriendsChatId([]);
        } else {
          setSelectedFriends([]);
          setSelectedFriendsChatId([]);
          console.log("Error initiating call:", response.data);
          //Alert.alert("Error api", response.data);
        }
      } catch (error) {
        console.error("API Error:", error);
        //alert(error);
      }
    }, 1500);

    // run a timer in end for 90 seconds and update the friends array back again with key AlreadyCalled to false if the UniquechatId array doesn't contain the row with AlreadyCalled as true & date time value > 90 seconds
  };

  const answerCall = () => {
    Vibration.cancel();
    StopIncomingSound();
    globalThis.statusCheck = "active";
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (globalThis.activeChannel = allData?.channel_name),
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      (globalThis.callStatus = allData?.channel_name);
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    dispatch(updateCallerId({ fromPush: false }));
    dispatch(updateCallState({ state: "active" }));
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    dispatch(updateCallerId({ id: `${globalThis.sender_id}`, callUUID: "" }));
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    globalThis.FriendChatId = allData?.chatId;
    const agoraData = {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: allData?.channel_name,
      status: "answer",
    };

    socket.emit("callEvents", {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      toUserId: allData?.chatId,
      data: agoraData,
    });
    joinVideoCall();
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCall("active", allData?.channel_name);
    setTimeout(() => {
      StopIncomingSound();
    }, 500);
  };

  const endCall = () => {
    stopSound();
    //  StopIncomingSound();
    dispatch(clearProfiles());
    if (callState.state === "outgoing") {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      startCall("missed", allData?.channel_name);
    } else {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      // startCall("ended", allData?.channel_name);
    }
    dispatch(updateCallState({ state: "ended" }));
    globalThis.statusCheck = undefined;
    globalThis.callStatus = undefined;
    globalThis.activeChannel = undefined;
    RNCallKeep.endAllCalls();

    globalThis.isCallIntiate = false;
    globalThis.callStateUpdate = true;
    const agoraData = {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: allData?.channel_name,
      status: "ended",
    };

    leaveCall();
    // socket.emit("callEvents", {
    //   toUserId: globalThis.FriendChatId,
    //   data: agoraData,
    // });

    setTimeout(() => {
      dispatch(resetDataReducer());
      dispatch(resetVoipReducer());
      dispatch(resetCallerIdReducer());
      stopSound();
    }, 700);

    globalThis.wayOfCall = undefined;

    setTimeout(() => {
      RNCallKeep.removeEventListener("endCall");
      stopSound();
    }, 1000);
  };

  const addUserCall = () => {
    filterAndSetUniqueFriends();
    //  setVisible(false);
    setFriendModalvisible(true);
  };

  const rejectCall = () => {
    globalThis.statusCheck = undefined;
    globalThis.callStatus = undefined;
    globalThis.activeChannel = undefined;
    StopIncomingSound();
    RNCallKeep.endCall("b8236c1b-9f68-4b6e-a8ce-803aec634c98");
    RNCallKeep.endAllCalls();
    globalThis.isCallIntiate = false;
    globalThis.callStateUpdate = true;
    const agoraData = {
      uid: "44",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      app_id: allData?.app_id,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      channel_name: allData?.channel_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      is_video: allData?.is_video,
      jwt: "",
      token: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver: allData?.receiver,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender: allData?.sender,
      userStatus: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_image: allData?.receiver_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      receiver_name: allData.receiver_name,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_image: allData?.sender_image,
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      sender_name: allData?.sender_name,
      token_2: "",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      isVideo: allData?.isVideo,
      image:
        "https://rockt.s3.amazonaws.com/user/profile_image/media__1696395460355-1696395496182.jpeg",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      caller: allData?.sender_name,
      uid_2: "84",
      roomId: "8daedecf-a5b6-4040-baf1-c5f17c3e27f1",
      uuid: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      id: "b8236c1b-9f68-4b6e-a8ce-803aec634c98",
      status: "declined",
    };

    socket.emit("callEvents", {
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      toUserId: allData?.chatId,
      data: agoraData,
    });

    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    startCall("declined", allData?.channel_name);

    RNCallKeep.endCall("b8236c1b-9f68-4b6e-a8ce-803aec634c98");
    agoraRef?.current?.turnOffCamera();
    agoraRef?.current?.muteAudio();

    setTimeout(() => {
      dispatch(resetDataReducer());
      dispatch(resetVoipReducer());
      dispatch(resetCallerIdReducer());
      globalThis.statusCheck = undefined;
      globalThis.callStatus = undefined;
      globalThis.activeChannel = undefined;
    }, 500);
  };
  const minimizeCall = () => {
    dispatch(updateCallState({ isBackground: true }));
  };

  const getDesc = () => {
    if (callState.state === "incoming")
      return STRING_CONSTANTS.incoming_call(
        agoraData.is_video ? "video" : "audio"
      );
    else if (callState.state === "outgoing") return STRING_CONSTANTS.calling;
    else if (callState.state === "active") return STRING_CONSTANTS.calling;
    else if (callState.state === "busy") return STRING_CONSTANTS.userBusy;
    else if (callState.state === "ended") return STRING_CONSTANTS.call_ended;
    else if (callState.state === "declined")
      return STRING_CONSTANTS.call_declined;
  };
  // if call is video call enable spaeaker by default
  useEffect(() => {
    if (callState.state == "active" && Platform.OS == "ios") {
      joinVideoCall();
    }

    if (callState.state === "active" && agoraData.is_video) {
      setTimeout(() => {
        agoraRef?.current?.changeAudioRoute(true);
        setIsSpeakerOn(true);
      }, 2000);
    }
  }, [callState]);

  // if app is killed end the call
  useEffect(() => {
    if (appStateVisible === "inactive" && callState.state === "outgoing") {
      endCall();
    }
  }, [appStateVisible]);

  const Footer = () => {
    if (callState.state === "incoming")
      return (
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 40,
            justifyContent: "space-between",
          }}
        >
          <AppImageIcon
            onPress={rejectCall}
            wrapperStyle={styles.endCall}
            image={images.reject_call}
          />
          <AppImageIcon
            onPress={answerCall}
            wrapperStyle={styles.endCall}
            image={images.accept_call}
          />
        </View>
      );
    else if (callState.state === "outgoing")
      return (
        <AppImageIcon
          onPress={endCall}
          wrapperStyle={styles.endCall}
          image={images.reject_call}
        />
      );
    else if (callState.state === "busy")
      return (
        <AppImageIcon
          onPress={hideBusy}
          wrapperStyle={styles.endCall}
          image={images.reject_call}
        />
      );
    else if (callState.state === "active")
      return (
        <View>
          <AudioCallOptions
            toggleMuteAudio={() => setIsMute(!isMute)}
            toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
            isMuted={isMute}
            pressChat={() => addUserCall()}
            pressVideo={() => addVideo()}
            isSpeakerOn={isSpeakerOn}
          />
          <AppImageIcon
            onPress={endCall}
            wrapperStyle={styles.endCall}
            image={images.end_call}
          />
        </View>
      );
    else if (callState.state === "ended")
      return (
        <AppImageIcon
          onPress={() => closeCallScreen()}
          wrapperStyle={styles.endCall}
          image={images.reject_call}
        />
      );
    else if (callState.state === "declined")
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 80,
          }}
        ></View>
      );
    else {
      return (
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 80,
            justifyContent: "space-between",
          }}
        >
          <AppImageIcon
            onPress={rejectCall}
            wrapperStyle={styles.endCall}
            image={images.reject_call}
          />
          <AppImageIcon
            onPress={answerCall}
            wrapperStyle={styles.endCall}
            image={images.accept_call}
          />
        </View>
      );
    }
  };

  useEffect(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    if (callState.state === "") {
      setVisible(false);
      setFriendModalvisible(false);
    } else {
      setVisible(true);
    }
  }, [callState]);

  const joinVideoCall = () => {
    agoraRef?.current?.joinCall();
  };
  const muteAudio = () => {
    agoraRef?.current?.muteAudio();
  };
  const unmuteAudio = () => {
    agoraRef?.current?.unMuteAudio();
  };

  const closeCallScreen = () => {
    dispatch(updateCallState({ state: "" }));
    dispatch(updateCallData({ isCallDisconnected: false }));
    stopTimer();
    dispatch(resetDataReducer());
    dispatch(resetVoipReducer());
    dispatch(resetCallerIdReducer());
  };

  useEffect(() => {
    if (isMute) {
      muteAudio();
    } else {
      unmuteAudio();
    }
  }, [isMute]);

  useEffect(() => {
    agoraRef?.current?.changeAudioRoute(isSpeakerOn);
  }, [isSpeakerOn]);

  useEffect(() => {
    if (isCameraOn) {
      agoraRef?.current?.turnOffCamera();
    } else {
      agoraRef?.current?.turnOnCamera();
    }
  }, [isCameraOn]);

  const leaveCall = () => {
    agoraRef?.current?.leaveCall();
    stopTimer();
  };

  return (
    <>
      {callState.isBackground ? (
        agoraData?.is_video ? (
          <BackgroundVideoCall
            endCall={endCall}
            toggleMuteAudio={() => setIsMute(!isMute)}
            toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
            isMuted={isMute}
            isSpeakerOn={isSpeakerOn}
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            callDurationRef={callRef}
            isCameraOn={isCameraOn}
          />
        ) : (
          <BackgroundAudioCall
            endCall={endCall}
            toggleMuteAudio={() => setIsMute(!isMute)}
            toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
            isMuted={isMute}
            isSpeakerOn={isSpeakerOn}
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            callDurationRef={callRef}
          />
        )
      ) : (
        <>
          {callState.state !== "incoming" ? (
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            <>
              <AppBaseModal
                visible={visible}
                onDismiss={emptyFunction}
                backgroundOverlay={{ justifyContent: "flex-end" }}
                animationType="fade"
              >
                {friendModalvisible ? (
                  <View
                    style={[
                      styles.modalContent,
                      { paddingTop: Platform.OS == "ios" ? 50 : 10 },
                    ]}
                  >
                    {/* Search Bar */}

                    {renderSearchBox()}
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      data={sortedFriends}
                      keyExtractor={(item) => item.chat_user_id}
                      renderItem={renderFriendItem}
                      contentContainerStyle={styles.friendList}
                      ListEmptyComponent={() => (
                        <View style={{ alignItems: "center", marginTop: 20 }}>
                          <Text style={{ fontSize: 16, color: "#888" }}>
                            No Matching Friend Found.
                          </Text>
                        </View>
                      )}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={friendModal}
                      >
                        <Text style={styles.doneButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      {selectedFriends?.length > 0 && (
                        <TouchableOpacity
                          style={styles.doneButton}
                          onPress={initiateCall}
                        >
                          <Text style={styles.doneButtonText}>Add to call</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : (
                  <ImageBackground
                    style={globalStyles.wh100}
                    source={images.call_bg}
                  >
                    {!agoraData?.is_video && profiles.length < 2 && (
                      <View style={styles.upperArea}>
                        <AppImageIcon
                          onPress={minimizeCall}
                          wrapperStyle={styles.backBtn}
                          image={
                            callState.state === "active"
                              ? images.back_arrow
                              : null
                          }
                          iconStyle={{ tintColor: colors.white }}
                        />
                      </View>
                    )}

                    {profiles.length < 2 &&
                      (callState?.state !== "active" ||
                        !agoraData?.is_video ||
                        callData?.isCallDisconnected) && (
                        <View style={{ flex: 6, alignItems: "center" }}>
                          {/* Sized Box */}
                          {agoraData?.is_video ? (
                            <View style={{ height: hp(20) }} />
                          ) : null}

                          <AppText style={styles.name} numberOfLines={1}>
                            {agoraData?.sender == userData?.id
                              ? agoraData?.receiver_name
                              : agoraData?.sender_name}
                          </AppText>

                          {callState?.state === "active" ? (
                            <>
                              <CallDuration />
                            </>
                          ) : (
                            <>
                              <AppText style={styles.duration}>
                                {getDesc()}
                              </AppText>
                              <AppText
                                style={[
                                  styles.duration,
                                  { paddingHorizontal: 10, marginBottom: 0 },
                                ]}
                              >
                                Good internet connection is highly recommended
                                since bad internet connection will result in a
                                poor calling experience.
                              </AppText>
                            </>
                          )}

                          <CallProfile
                            showPulse={
                              callState.state === "outgoing" ||
                              callState.state === "active"
                            }
                            profileImage={
                              agoraData?.sender == userData?.id
                                ? agoraData?.receiver_image
                                : agoraData?.sender_image
                            }
                          />
                        </View>
                      )}

                    {callState?.state === "active" &&
                      agoraData?.is_video &&
                      !callData?.isCallDisconnected && (
                        <Video
                          endCall={endCall}
                          toggleMuteAudio={() => setIsMute(!isMute)}
                          toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
                          switchCamera={() => setIsCameraOn(!isCameraOn)}
                          flipCamera={() => agoraRef?.current?.flipCamera()}
                          onAddVideoUserPress={addUserCall}
                          isCameraOn={isCameraOn}
                          isMuted={isMute}
                          isSpeakerOn={isSpeakerOn}
                          callDurationRef={callRef}
                          minimizeCall={minimizeCall}
                          sessionId={""}
                          token={""}
                          isJoined={false}
                        />
                      )}
                    {profiles.length < 2
                      ? (callState?.state !== "active" ||
                          !agoraData?.is_video ||
                          callData?.isCallDisconnected) && (
                          <View style={{ flex: 3.5 }}>
                            <Footer />
                          </View>
                        )
                      : !agoraData?.is_video && (
                          <ProfileList
                            isMuted={isMute}
                            isSpeakerOn={isSpeakerOn}
                            toggleMuteAudio={() => setIsMute(!isMute)}
                            toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
                            endCall={endCall}
                            addUserPress={addUserCall}
                            callDurationRef={callRef}
                          />
                        )}
                  </ImageBackground>
                )}
              </AppBaseModal>

              {/* <AppBaseModal
                visible={friendModalvisible}
                onDismiss={friendModal}
                backgroundOverlay={{ justifyContent: "flex-end" }}
                animationType="fade"
              >
          
              </AppBaseModal> */}
            </>
          ) : (
            <TouchableWithoutFeedback
              onPress={() => {
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                dispatch(updateCallerId({ fullView: true }));
              }}
            >
              {userPushData.fullView == false ? (
                <View
                  style={{
                    width: "98%",
                    backgroundColor: "#fff",
                    position: "absolute",
                    borderRadius: 15,
                    zIndex: 20,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: -2, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    top: 30,
                    right: "1%",
                    left: "1%",
                    paddingVertical: 10,
                    paddingBottom: 15,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          marginHorizontal: 10,
                          marginTop: 10,
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#000",
                        }}
                      >
                        {agoraData?.sender_name}
                      </Text>
                      <Text
                        style={{
                          marginHorizontal: 10,
                          color: "#000",
                          fontSize: 14,
                        }}
                      >
                        Incoming call via Tokee
                      </Text>
                    </View>
                    <Image
                      source={{ uri: agoraData?.sender_image }}
                      style={{
                        height: 50,
                        width: 50,
                        // alignSelf: "center",
                        resizeMode: "contain",
                        margin: 10,
                        borderRadius: 50,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      // width: "95%",
                      justifyContent: "space-between",
                      alignItems: "center",

                      alignSelf: "center",
                    }}
                  >
                    <TouchableWithoutFeedback onPress={() => rejectCall()}>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#A01517",
                          height: 50,
                          width: "45%",
                          marginHorizontal: 10,
                          borderWidth: 1,
                          borderColor: "transparent",
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          DECLINE
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={answerCall}>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#1C5B23",
                          height: 50,
                          width: "45%",
                          marginHorizontal: 10,
                          borderWidth: 1,
                          borderColor: "transparent",
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          ANSWER
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              ) : (
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                <AppBaseModal
                  visible={visible}
                  onDismiss={emptyFunction}
                  backgroundOverlay={{ justifyContent: "flex-end" }}
                  animationType="fade"
                >
                  <ImageBackground
                    style={[globalStyles.wh100]}
                    //  source={images.gudda}
                    blurRadius={10}
                    source={
                      getProfileImage(agoraData, userData) ==
                      "https://cdn-icons-png.freepik.com/256/10210/10210774.png?semt=ais_hybrid"
                        ? images.call_bg
                        : { uri: getProfileImage(agoraData, userData) }
                    }
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        left: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        padding: 20,
                        paddingTop: 40,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Image
                          source={require("../../Assets/Logo/Tokee_Logo.png")}
                          style={{
                            height: 15, // Increase size
                            width: 15,
                            marginRight: 10, // Add spacing
                            borderRadius: 5,
                          }}
                          resizeMode="contain"
                        />
                        <Text
                          style={{
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          TOKEE {agoraData?.is_video ? "VIDEO" : "AUDIO"} CALL
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 20,
                          marginVertical: 5,
                        }}
                        numberOfLines={1}
                      >
                        {agoraData?.sender == userData?.id
                          ? agoraData?.receiver_name
                          : agoraData?.sender_name}
                      </Text>
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 12,
                          // marginVertical: 5,
                        }}
                      >
                        INCOMING
                      </Text>
                      {/* <Text style={{ color: "#ffffff", fontSize: 12 }}>
                        Good internet connection is highly recommended since bad
                        internet connection will result in a poor calling
                        experience.
                      </Text> */}
                    </View>
                    {!agoraData?.is_video && (
                      <View style={styles.upperArea}>
                        <AppImageIcon
                          onPress={minimizeCall}
                          wrapperStyle={styles.backBtn}
                          image={
                            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            callState.state === "active"
                              ? images.back_arrow
                              : null
                          }
                          iconStyle={{ tintColor: colors.white }}
                        />
                      </View>
                    )}

                    {
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      (callState?.state !== "active" ||
                        !agoraData?.is_video ||
                        callData?.isCallDisconnected) && (
                        <View style={{ flex: 6, alignItems: "center" }}>
                          {/* Sized Box */}
                          {agoraData?.is_video ? (
                            <View style={{ height: hp(20) }} />
                          ) : null}
                          {callState.state !== "incoming" && (
                            <AppText style={styles.name}>
                              {agoraData?.sender == userData?.id
                                ? agoraData?.receiver_name
                                : agoraData?.sender_name}
                            </AppText>
                          )}

                          {
                            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                            callState?.state === "active" ? (
                              <>
                                <CallDuration />
                              </>
                            ) : (
                              <>
                                {/* <AppText style={styles.duration}>
                                  {getDesc()}
                                </AppText> */}
                                {/* <AppText
                                  style={[
                                    styles.duration,
                                    { paddingHorizontal: 10, marginBottom: 0 },
                                  ]}
                                >
                                  Good internet connection is highly recommended
                                  since bad internet connection will result in a
                                  poor calling experience.
                                </AppText> */}
                              </>
                            )
                          }

                          {callState.state !== "incoming" && (
                            <CallProfile
                              showPulse={
                                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                callState.state === "outgoing" ||
                                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                callState.state === "active"
                              }
                              profileImage={
                                agoraData?.sender == userData?.id
                                  ? agoraData?.receiver_image
                                  : agoraData?.sender_image
                              }
                            />
                          )}

                          {callState.state === "incoming" &&
                            getProfileImage(agoraData, userData) ==
                              "https://cdn-icons-png.freepik.com/256/10210/10210774.png?semt=ais_hybrid" && (
                              <View
                                style={{ flex: 6, alignItems: "center" }}
                              ></View>
                            )}

                          {callState.state === "incoming" &&
                            getProfileImage(agoraData, userData) !==
                              "https://cdn-icons-png.freepik.com/256/10210/10210774.png?semt=ais_hybrid" && (
                              <ImageBackground
                                // source={images.gudda}
                                source={
                                  getProfileImage(agoraData, userData) ==
                                  "https://cdn-icons-png.freepik.com/256/10210/10210774.png?semt=ais_hybrid"
                                    ? images.call_bg
                                    : {
                                        uri: getProfileImage(
                                          agoraData,
                                          userData
                                        ),
                                      }
                                }
                                style={{
                                  alignSelf: "center",
                                  height: hp("76%"),
                                  width: wp("95%"),
                                  overflow: "hidden",
                                }}
                                resizeMode="cover"
                              >
                                {/* Overlaying gradient effect to simulate blur on the edges */}
                                <View style={styles.blurEffectTop} />
                                <View style={styles.blurEffectBottom} />
                                <View style={styles.blurEffectLeft} />
                                <View style={styles.blurEffectRight} />
                              </ImageBackground>
                            )}

                          {callState.state === "incoming" &&
                            getProfileImage(agoraData, userData) ==
                              "https://cdn-icons-png.freepik.com/256/10210/10210774.png?semt=ais_hybrid" && (
                              <CallProfile
                                showPulse={
                                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                  callState.state === "outgoing" ||
                                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                                  callState.state === "active"
                                }
                                profileImage={
                                  agoraData?.sender == userData?.id
                                    ? agoraData?.receiver_image
                                    : agoraData?.sender_image
                                }
                              />
                            )}
                        </View>
                      )
                    }
                    {
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      callState?.state === "active" &&
                        agoraData?.is_video &&
                        !callData?.isCallDisconnected && (
                          <Video
                            endCall={endCall}
                            toggleMuteAudio={() => setIsMute(!isMute)}
                            toggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
                            switchCamera={() => setIsCameraOn(!isCameraOn)}
                            flipCamera={() => agoraRef?.current?.flipCamera()}
                            isCameraOn={isCameraOn}
                            isMuted={isMute}
                            isSpeakerOn={isSpeakerOn}
                            callDurationRef={callRef}
                            minimizeCall={minimizeCall}
                            sessionId={""}
                            token={""}
                            isJoined={false}
                          />
                        )
                    }
                    {
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      (callState?.state !== "active" ||
                        !agoraData?.is_video ||
                        callData?.isCallDisconnected) && (
                        <View style={{ flex: 3.5 }}>
                          {/* <Footer /> */}
                          <View
                            style={{
                              flexDirection: "row",
                              marginHorizontal: 40,
                              justifyContent: "space-between",
                            }}
                          >
                            {/* Accept Call */}

                            {/* Reject Call */}
                            <Animated.View
                              style={{ transform: [{ scale: bounceAnim }] }}
                            >
                              <TouchableOpacity
                                onPress={rejectCall}
                                style={{
                                  // backgroundColor: "red",
                                  //  padding: 15,
                                  // borderRadius: 50,
                                  // marginHorizontal: 20,

                                  alignSelf: "center",
                                  marginTop: 68,
                                }}
                              >
                                <Image
                                  source={images.reject_call}
                                  style={{
                                    minHeight:
                                      dimensConstants.app_image_icon.height,
                                    minWidth:
                                      dimensConstants.app_image_icon.width,
                                    alignSelf: "center",
                                    // tintColor: "#fff",
                                  }}
                                />
                              </TouchableOpacity>
                            </Animated.View>

                            <Animated.View
                              style={{ transform: [{ scale: bounceAnim }] }}
                            >
                              <TouchableOpacity
                                onPress={answerCall}
                                style={{
                                  //  backgroundColor: "green",
                                  // padding: 15,
                                  //  borderRadius: 50,
                                  // marginHorizontal: 20,

                                  alignSelf: "center",
                                  marginTop: 68,
                                }}
                              >
                                <Image
                                  source={images.accept_call}
                                  style={{
                                    minHeight:
                                      dimensConstants.app_image_icon.height,
                                    minWidth:
                                      dimensConstants.app_image_icon.width,
                                    alignSelf: "center",
                                  }}
                                />
                              </TouchableOpacity>
                            </Animated.View>
                          </View>
                        </View>
                      )
                    }
                  </ImageBackground>
                </AppBaseModal>
              )}
            </TouchableWithoutFeedback>
          )}
        </>
      )}

      <Agora
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        startTimer={startTimer}
        stopTimer={stopTimer}
        isVideoCall={agoraData?.is_video}
        ref={agoraRef}
      />
    </>
  );
};

const styles = StyleSheet.create({
  upperArea: {
    flex: 2.5,
    justifyContent: "center",
    paddingLeft: 28,
  },
  backBtn: {
    height: 48,
    width: 48,
    backgroundColor: colors.black,
    borderRadius: 24,
    marginBottom: hp(1),
  },
  name: {
    fontSize: 20,
    lineHeight: 34,
    color: colors.white,
    fontFamily: fonts.primary_bold_font,
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.whiteOpacity(0.56),
    fontFamily: fonts.primary_semi_bold_font,
    marginBottom: 44,
  },
  endCall: {
    height: 56,
    width: 56,
    alignSelf: "center",
    marginTop: 68,
  },
  endCallMe: {
    height: 56,
    width: 56,
    alignSelf: "center",
    marginTop: 20,
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  friendList: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
  },
  doneButton: {
    //backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,

    backgroundColor: themeModule().theme_background,
  },
  doneButtonText: {
    // color: "#fff",
    fontSize: 16,
    color: iconTheme().iconColor,
    fontWeight: "700",
  },
  blurEffectTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 20, // Adjust the blur height
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent black to create the effect
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 2, // To ensure the blur effect overlays the image
  },
  blurEffectBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20, // Adjust the blur height
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 2,
  },
  blurEffectLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 20, // Adjust the blur width
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    zIndex: 2,
  },
  blurEffectRight: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 20, // Adjust the blur width
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 2,
  },
});

export default withCallTimer(Calling);
