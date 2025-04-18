import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { TouchableOpacity } from "react-native";
import { View, Text, StyleSheet, Dimensions, Modal } from "react-native";
import RNFS from "react-native-fs";
import {
  checkPinStatus,
  getMembersFromRoomMembersSqlforSidebar,
  getRoomMedia,
  pinchatroom,
  CheckIsRoomBlocked,
} from "../../sqliteStore";
import FileViewer from "react-native-file-viewer";

import { ImagePreviewModel } from "../Modals/ImagePreviewModal";
import { LoaderModel } from "../Modals/LoaderModel";
import renderIf from "../../Components/renderIf";
import DeviceInfo from "react-native-device-info";
import { COLORS, iconTheme, themeModule } from "../../Components/Colors/Colors";
import { onCallPress, onGroupCallPress } from "../../utils/callKitCustom";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { t } from "i18next";
import { font } from "../../Components/Fonts/Font";
import NetInfo from "@react-native-community/netinfo";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { reportUserApi } from "../../Constant/Api";
import { ReportUserModel } from "../Modals/ReportUserModel";
import WebView from "react-native-webview";
import ImageViewer from "react-native-image-zoom-viewer";
import { blurImage, blurVideo } from "../../Constant/Key";
import { showToast } from "../../Components/CustomToast/Action";
import { pin, unpin } from "../../reducers/pinSlice";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import { SuccessModel } from "../Modals/SuccessModel";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { NoInternetModal } from "../Modals/NoInternetModel";
import CheckBox from "@react-native-community/checkbox";

let groupCallType = "";
export default function SideMenu(
  // eslint-disable-next-line
  props: any,
  navigation: { navigate: (arg0: string) => void }
) {
  const windowHeight = Dimensions.get("window").height;
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const [sharedPhotoVideo, setSharedPhotoVideo] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [clickedItem, setClickedItem] = useState("");
  const [sharedDocument, setSharedDocument] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [photoVideoList, setPhotoVideoList] = useState([]);
  const [myimages, setmyimages] = useState(false);
  const [mylocaldata, setmylocaldata] = useState({});
  const userPremium = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.friendListSlice.userPremium
  );

  const maxSelection = groupCallType === "audio" ? 9 : 9; // Adjust limit based on call type
  const [searchQuery, setSearchQuery] = useState("");

  console.log(
    "participants====================================",
    globalThis.userChatId
  );
  const calluserIds = participants
    .map((participant) => participant.userId) // Extract userIds
    .filter((userId) => userId !== globalThis.userChatId); // Exclude globalThis.userChatId

  const PinChat = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.pinSlice?.pinCount
  );

  // eslint-disable-next-line
  const callState = useSelector((state: any) => state?.VoipReducer?.call_state);
  const [muteFilled, setMuteFilled] = useState(false);
  // eslint-disable-next-line
  const newroomID = useSelector((state: any) => state.chatHistory.newroomID);
  const [isroompin, setisroompin] = useState(false);
  const [issettingopen, setissettingopen] = useState(
    props.roomType == "single" ? true : false
  );
  // eslint-disable-next-line
  const isnewblock = useSelector((state: any) => state.chatHistory.isnewblock);
  const [reportUser, setReportUser] = useState(false);
  const [reportUserID, setReportUserID] = useState("");
  const [membercount, setmemberCount] = useState();
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [callMemberModal, setCallMemberModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const connectstate = useSelector(
    // eslint-disable-next-line
    (state: any) => state?.getAppStateReducers?.app_state
  );
  const membersupdated = useSelector(
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    (state) => state?.getAppStateReducers?.membersupdated
  );

  const [isRoomBlocked, setIsRoomBlocked] = React.useState(false);
  const mainprovider = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatHistory.mainprovider
  );

  const pinChatLimitFree = useSelector(
    (state: any) => state?.premiumLimitSlice?.pinChatLimitFree
  );
  const pinChatLimitPremium = useSelector(
    (state: any) => state?.premiumLimitSlice?.pinChatLimitPremium
  );
  const nonPremiumStoryLimit = useSelector(
    (state: any) => state?.premiumLimitSlice?.nonPremiumStoryLimit
  );

  // eslint-disable-next-line
  const profileData = useSelector((state: any) => state?.message?.profileData);
  // eslint-disable-next-line
  const blockupdate = useSelector((state: any) => state?.message?.blockupdate);

  const [callblock, setcallblock] = useState(isnewblock);
  useEffect(() => {
    setMuteFilled(props.isnewmute);
    ToGetImages();
  }, [props.roomId, connectstate]);

  useEffect(() => {
    if (props.roomType == "multiple" || props.roomType == "broadcast") {
      toGetParticipants();
    }
  }, [membersupdated]);

  //******   Function Calling for GetImages From Sql    *******//
  function ToGetImages() {
    // eslint-disable-next-line
    getRoomMedia(props.roomId, "image", (data: any) => {
      if (data.length > 0) {
        const temp = [];
        const sortedArray = data
          // eslint-disable-next-line
          .map((item: any) => ({
            ...item,
            attachment: JSON.parse(item.attachment),
          }))
          // eslint-disable-next-line
          .sort((a: any, b: any) => b.createdAt - a.createdAt);

        sortedArray.map((item) => {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          temp.push(item.attachment);
        });

        // Set the sorted and merged array
        setSharedPhotoVideo(sortedArray);

        // Call the next function to get documents
        ToGetDocuments();
        toGetPhotoVideoList(sortedArray);

        ToGetVideos(data);
      } else {
        globalThis.newMessagerecive = globalThis.newMessagerecive + 1;
        toGetPhotoVideoList([]);
        ToGetVideos([]);
      }
    });
  }

  const filteredParticipants = participants.filter((user) =>
    user.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      if (selectedUserIds.length < maxSelection) {
        setSelectedUserIds([...selectedUserIds, userId]);
      } else {
        Alert.alert(
          "Selection Limit Reached",
          `You can select up to ${maxSelection} users for a ${groupCallType} call.`
        );
      }
    }
  };

  const handleModalClose = (selectedIds) => {
    onGroupCallPress({
      call_type: groupCallType,
      contact_image: props.roomImage,
      contact_name: props.roomName,
      contact_chat_id: selectedIds,
      typeOfCall: "GroupCall",
    });
    console.log("Selected User IDs:", selectedIds);
    setCallMemberModal(false);
  };

  const renderItem = ({ item }) => {
    if (item.userId == globalThis.userChatId) return null; // Don't render the current user

    const isSelected = selectedUserIds.includes(item.userId);
    const isMaxReached = selectedUserIds.length >= maxSelection;

    return (
      <TouchableOpacity
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
            toggleSelection(item.userId);
          }
        }}
      >
        {/* Profile Image */}
        <Image
          source={
            item.image
              ? { uri: item.image }
              : {
                  uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                }
          }
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
          resizeMode="contain"
        />

        {/* Name */}
        <Text style={{ flex: 1, fontSize: 16, color: "#000" }}>
          {item.userName}
        </Text>

        {/* Custom Checkbox */}
        <Pressable
          style={{
            width: 24,
            height: 24,
            borderRadius: 12, // Circular shape
            borderWidth: 2,
            borderColor: isMaxReached && !isSelected ? "#ccc" : "#25D366", // Gray when disabled
            backgroundColor: isSelected ? "#25D366" : "transparent",
            opacity: isMaxReached && !isSelected ? 0.5 : 1, // Reduce opacity for disabled checkboxes
          }}
          onPress={() => {
            if (!isMaxReached || isSelected) {
              toggleSelection(item.userId);
            }
          }}
        />
      </TouchableOpacity>
    );
  };

  const checkUrl = async (url, type) => {
    const mediaName = url.split("/").pop();
    const mediaId = mediaName.split(".").slice(0, -1).join(".");

    const filename = type == "image" ? `${mediaId}.jpg` : `${mediaId}.mp4`;
    const encoded = encodeURIComponent(filename);

    let subDirectory = "";
    switch (type) {
      case "image":
        subDirectory = "Images";
        break;
      case "video":
        subDirectory = "Videos";
        break;
      case "document":
        subDirectory = "Documents";
        break;
      default:
        subDirectory = "Others";
        break;
    }

    let destinationPath = "";
    if (Platform.OS === "android") {
      destinationPath = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`;
    } else {
      destinationPath = `${RNFS.DocumentDirectoryPath}/TokeeMedia/${subDirectory}/${encoded}`;
    }

    const fileExists = await RNFS.exists(destinationPath);

    return fileExists ? destinationPath : false;
  };

  const processObjects = async (objects) => {
    const processedObjects = await Promise.all(
      objects.map(async (obj) => {
        const newUrl = await checkUrl(obj.url, obj.type);
        return {
          ...obj,
          url: newUrl ? newUrl : obj.type == "image" ? blurImage : blurVideo,
        };
      })
    );
    return processedObjects;
  };

  // eslint-disable-next-line
  function ToGetVideos(photoData: any) {
    // eslint-disable-next-line
    getRoomMedia(props.roomId, "video", (data: any) => {
      // Merge photoData and video data
      const mergedArray = [...photoData, ...data];

      // Parse attachments and sort by createdAt
      const temp = [];
      const sortedArray = mergedArray
        .map((item) => ({
          ...item,
          attachment: JSON.parse(item.attachment),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      sortedArray.map((item) => {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        temp.push(item.attachment);
      });

      // Set the sorted and merged array

      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setSharedPhotoVideo(sortedArray);

      ToGetDocuments();
      toGetPhotoVideoList(sortedArray);
    });
  }

  //******   Function Calling for Combined Photos and Video  From Sql    *******//
  // eslint-disable-next-line
  async function toGetPhotoVideoList(dataArray: any) {
    const routeData = dataArray;
    const combinedData = [];

    if (routeData != null && routeData != undefined) {
      const sortedData = routeData.sort(
        // eslint-disable-next-line
        (a: any, b: any) => b.createdAt - a.createdAt
      );
      // eslint-disable-next-line
      sortedData.forEach((item: any) => {
        // Combine item.attachment and item.localPath into a single array
        const combinedAttachments = [];
        if (item.attachment && Array.isArray(item.attachment)) {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          combinedAttachments.push(...item.attachment);
        }
        if (item.localPath && Array.isArray(item.localpath)) {
          // Corrected to "localPath"
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          combinedAttachments.push(...item.localpath);
        }

        // Process the combined array
        combinedAttachments.forEach((url) => {
          const type = item.message_type;
          if (type === "video" || type === "image") {
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            combinedData.push({
              url,
              createdAt: item.createdAt,
              type,
              serverUrl: url,
            });
          }
        });
      });

      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      combinedData.sort((a, b) => b.createdAt - a.createdAt);

      const processedObjects = await processObjects(combinedData);
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setPhotoVideoList(processedObjects);
    }
  }

  //******   Function Calling for getDocuments  From Sql    *******//
  function ToGetDocuments() {
    // eslint-disable-next-line
    getRoomMedia(props.roomId, "document", (data: any) => {
      ToGetAudioFiles(data);
    });
  }

  function OnMute() {
    setMuteFilled(!muteFilled);
    props.onMuteclick();
  }

  //******   Function Calling for getAudioFile  From Sql    *******//
  // eslint-disable-next-line
  function ToGetAudioFiles(docData: any) {
    // eslint-disable-next-line
    getRoomMedia(props.roomId, "audio", (data: any) => {
      const mergedArray = [...docData, ...data];
      const sortedArray = mergedArray.sort((a, b) => b.createdAt - a.createdAt);

      const mergedArrayAsString = sortedArray.map((item) => ({
        ...item,
        attachment: JSON.parse(item.attachment), // Convert array to string
      }));
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setSharedDocument(mergedArrayAsString);
    });
  }

  function toGetParticipants() {
    console.log(
      "props.roomId====================================",
      props.roomId
    );

    if (props.roomId) {
      getMembersFromRoomMembersSqlforSidebar(
        props.roomId,
        16,
        0,
        (res, totalCount) => {
          console.log("Members fetched:", totalCount);

          setmemberCount(totalCount);
          const currentUser = res.find(
            (member) => member.userId === globalThis.userChatId
          );
          props.setCurrentUserData(currentUser);

          console.log("sdfsdfdsf", currentUser);
          if (currentUser) {
            currentUser.userName = `${currentUser.userName} (me)`;
          }

          const sortedParticipants = res
            .filter((member) => member.userId !== globalThis.userChatId) // Exclude current user
            .slice(0, 15) // Limit to first 15 participants
            .sort((a, b) => a.userName.localeCompare(b.userName)); // Sort by userName

          if (currentUser) {
            sortedParticipants.unshift(currentUser); // Add current user at the beginning
          }

          setParticipants(sortedParticipants);
        }
      );
    }
  }

  useEffect(() => {
    if (newroomID) {
      // eslint-disable-next-line
      checkPinStatus(newroomID, (ispinnnn: any) => {
        setisroompin(ispinnnn);
      });
    }
  }, [newroomID]);

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken,
    localization: globalThis.selectLanguage,
  };

  //******   Function Calling for reportUser From Sql    *******//
  const ReportuserChat = (reason: string) => {
    ////i///////////////////////// ********** InterNet Permission    ********** ///////////////////////////////////

    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true);
        return;
      } else {
        const data = {
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
  // eslint-disable-next-line
  const apiSuccessVerify = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("ok") }]);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
    } else {
      globalThis.successMessage = ResponseData.message;
      setReportUser(false);
      setReportUserID("");
      setSuccessAlertModel(true);
      // Alert.alert(t("success"), ResponseData.message, [{ text: t("done") }]);
    }
  };

  const handleDocumentPress = async (path) => {
    if (Platform.OS == "android") {
      setloaderMoedl(true);
    }
    // Show loader

    const mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
    const subDirectory = `${mainDirectory}/Documents`;

    try {
      const mainDirectoryExists = await RNFS.exists(mainDirectory);
      if (!mainDirectoryExists) {
        await RNFS.mkdir(mainDirectory);
      }

      const subDirectoryExists = await RNFS.exists(subDirectory);
      if (!subDirectoryExists) {
        await RNFS.mkdir(subDirectory);
      }

      const mediaName = path[0].split("/").pop();
      const mediaId = mediaName.split(".").slice(0, -1).join(".");

      let filename = `${mediaName}`;

      let encoded = encodeURIComponent(filename);
      let destinationPath = `${subDirectory}/${encoded}`;

      // Ensure the loader runs for at least 1 second
      const delay = new Promise((resolve) => setTimeout(resolve, 1000));

      // Rename file if it already exists
      let fileExists = await RNFS.exists(destinationPath);
      let counter = 1;
      while (fileExists) {
        filename = `${mediaId}(${counter}).pdf`;
        encoded = encodeURIComponent(filename);
        destinationPath = `${subDirectory}/${encoded}`;
        fileExists = await RNFS.exists(destinationPath);
        counter++;
      }

      // Copy file to the destination directory
      await RNFS.copyFile(path[0], destinationPath);

      // Ensure the file exists before trying to open it
      const fileExistsAfterCopy = await RNFS.exists(destinationPath);
      if (!fileExistsAfterCopy) {
        throw new Error("File not found after copy");
      }

      // Wait for both delay and file opening operation to complete
      await Promise.all([delay]);

      // Open the file after the delay
      FileViewer.open(destinationPath)
        .then(() => {
          console.log("File opened successfully");
        })
        .catch((error) => {
          console.error("Error opening file with FileViewer:", error);
        });
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      if (Platform.OS == "android") {
        setloaderMoedl(false);
      }
      // setloaderMoedl(false); // Hide loader after operations complete
    }
  };
  const dispatch = useDispatch();

  //to-pin-chat-by-dinki
  async function ToPinChat() {
    if (!isroompin) {
      if (userPremium) {
        if (PinChat == pinChatLimitPremium || PinChat > pinChatLimitPremium) {
          props.premiumAlertHeading("You can pin a maximum of 20 chats.");
          props.premiumAlertSubHeading("You cannot pin any more at this time.");
          props.premiumAlertFirstButtonText("Ok");
          props.premiumAlertSecondButtonText("Cancel");
          props.setShowPremiumAlert(true);
          // alert("You cannot pin more chats");
        } else {
          // eslint-disable-next-line

          await pinchatroom(newroomID, !isroompin);
          setisroompin(!isroompin); /// Chat pinned & Chat unpinned
          dispatch(pin());

          showToast(isroompin ? t("chat_unpinned") : t("chat_pinned"));
        }
      } else {
        if (PinChat == pinChatLimitFree || PinChat > pinChatLimitFree) {
          props.premiumAlertHeading(t("You_can_only_pin_upto_chats"));
          props.premiumAlertSubHeading(
            t("Upgrade_to_Premiumto_increase_the_limit")
          );
          props.premiumAlertFirstButtonText("Ok");
          props.premiumAlertSecondButtonText("Go To Premium");
          props.setShowPremiumAlert(true);
          // alert("You cannot pin more chats");
        } else {
          pinchatroom(newroomID, !isroompin);
          setisroompin(!isroompin); /// Chat pinned & Chat unpinned
          dispatch(pin());
          showToast(isroompin ? t("chat_unpinned") : t("chat_pinned"));
        }
      }
    } else {
      pinchatroom(newroomID, !isroompin);
      setisroompin(!isroompin); /// Chat pinned & Chat unpinned
      dispatch(unpin());
      showToast(isroompin ? t("chat_unpinned") : t("chat_pinned"));
    }
  }

  function ToOpenPreview(item) {
    props.onRequestClose();
    console.log("item in open preview ====", item);
    setClickedItem(item);
    setShowPreview(true);
  }

  React.useEffect(() => {
    if (profileData) {
      CheckIsRoomBlocked(profileData?.chat_user_id, (isBlocked) => {
        setIsRoomBlocked(isBlocked);
      });
    }
  }, [profileData, blockupdate]);

  useEffect(() => {
    if (isRoomBlocked || isnewblock) {
      setcallblock(true);
    } else {
      setcallblock(false);
    }
  }, [isnewblock, profileData, isRoomBlocked]);

  return (
    <View style={{ flex: 1 }}>
      {showPreview ? (
        <ImagePreviewModel
          visible={showPreview}
          onRequestClose={() => setShowPreview(false)}
          file={clickedItem}
        />
      ) : null}

      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
      <ReportUserModel
        visible={reportUser}
        onRequestClose={() => setReportUser(false)}
        cancel={() => setReportUser(false)}
        report_user={ReportuserChat}
      />

      <ConfirmAlertModel
        visible={confirmAlertModel}
        onRequestClose={() => setConfirmAlertModel(false)}
        confirmText={globalThis.confirmAlertText}
        cancel={() => setConfirmAlertModel(false)}
        confirmButton={() => {
          setConfirmAlertModel(false), props.deleteChat();
        }}
      />
      <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={globalThis.successMessage}
        doneButton={() => {
          setSuccessAlertModel(false);
        }}
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

      <Modal
        visible={myimages}
        supportedOrientations={["portrait", "landscape"]}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#000",
            justifyContent: "center",
            //  alignItems: "center",
            position: "relative",
            zIndex: 900000,
          }}
        >
          <TouchableOpacity
            style={{
              left: 10,
              position: "absolute",
              borderRadius: 5,
              zIndex: 900000,
              top: Platform.OS === "ios" ? 60 : 20,
              width: 25,
              height: 25,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              setmyimages(false);
            }}
          >
            <Image
              source={require("../../Assets/Icons/Back_Arrow.png")}
              style={{
                resizeMode: "contain",
                height: 25,
                width: 25,
                marginLeft: 10,
                tintColor: iconTheme().iconColorNew,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {mylocaldata && (
            <View>
              {
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                mylocaldata?.type === "image" ? (
                  <View
                    style={{
                      height: windowHeight,
                      width: windowWidth - 20,
                    }}
                  >
                    <ImageViewer
                      saveToLocalByLongPress={false}
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      renderIndicator={() => null}
                      style={{
                        height: windowHeight,
                        width: windowWidth - 20,
                      }}
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      imageUrls={mylocaldata?.attachment?.map((url) => ({
                        url,
                      }))}
                      loadingRender={() => <ActivityIndicator size={"large"} />}
                    />
                  </View>
                ) : // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                mylocaldata?.type === "video" ? (
                  <View></View>
                ) : // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                mylocaldata?.type === "audio" ? (
                  <View
                    style={{
                      height: 64,
                      width: 320,
                      alignSelf: "center",
                      marginTop: Dimensions.get("window").height * 0.4,
                    }}
                  >
                    <WebView
                      style={{
                        backgroundColor: "#fff",
                        marginBottom: 5,
                        marginLeft: -280,
                        marginRight: -350,
                      }}
                      scrollEnabled={false}
                      useWebKit={false}
                      mediaPlaybackRequiresUserAction={false} // Allow autoplay
                      messagingEnabled={true}
                      allowsAirPlayForMediaPlayback={true}
                      automaticallyAdjustContentInsets={false}
                      source={{
                        html: `
      <html>
        <style>
          body { background-color: #fff; }
          audio {
            margin-left: 29%;
            width: 330px;
            height: 100%; /* Make the audio fill its container */
          }
          audio::-webkit-media-controls-panel {
            background-color: #fff;
          }
        </style>
        <body>
          <audio controls="controls" autoplay="autoplay">
            <source src="${
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              mylocaldata?.attachment
            }" type="audio/mpeg" />
          </audio>
        </body>
      </html>
    `,
                      }}
                    />
                  </View>
                ) : null
              }
            </View>
          )}
        </View>
      </Modal>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <View
          style={{
            height: "100%",
            top: 0,
            backgroundColor: "#fff",
            zIndex: 100,
          }}
        >
          <ScrollView>
            <View
              style={[
                styles.chatRoomTextContainer,
                { backgroundColor: themeModule().theme_background },
              ]}
            >
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <View
                  style={[
                    styles.headingContainer,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      flex: 1,
                      paddingRight: 10,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chatRoomText,
                      {
                        color: iconTheme().text_color,
                        fontFamily: font.semibold(),
                      },
                    ]}
                  >
                    {t("Chatroom_Archives")}
                  </Text>
                </View>
                {renderIf(
                  props.roomType == "single" || props.allowGroupCall == 0,

                  <View style={styles.callIconsContainer}>
                    <TouchableOpacity
                      disabled={
                        callState?.state == "active"
                          ? true
                          : callblock == false
                          ? false
                          : true
                      }
                      //    disabled={isnewblock == true}
                      style={[
                        styles.audioCallContainer,
                        { marginRight: 5, marginLeft: 5 },
                      ]}
                      onPress={() => {
                        if (props.roomType == "single") {
                          onCallPress({
                            call_type: "audio",
                            contact_image: props.roomImage,
                            contact_name: props.roomName,
                            contact_chat_id: props.chatId,
                            contact_id: props.contactId,
                          });
                        } else if (
                          membercount <= 9 &&
                          props.allowGroupCall == 0
                        ) {
                          (groupCallType = "audio"),
                            onGroupCallPress({
                              call_type: "audio",
                              contact_image: props.roomImage,
                              contact_name: props.roomName,
                              contact_chat_id: calluserIds,
                              typeOfCall: "GroupCall",
                            });
                        } else if (
                          membercount > 9 &&
                          props.allowGroupCall == 0
                        ) {
                          (groupCallType = "audio"), setCallMemberModal(true);
                        }
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/CallBottom.png")}
                        style={{
                          height: DeviceInfo.isTablet() ? 32 : 21,
                          width: "100%",
                          tintColor:
                            callblock == true
                              ? COLORS.grey
                              : iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={
                        callState?.state == "active"
                          ? true
                          : callblock == false
                          ? false
                          : true
                      }
                      //   disabled={isnewblock == true}
                      style={styles.audioCallContainer}
                      // onPress={() =>
                      //   onCallPress({
                      //     call_type: "video",
                      //     contact_image: props.roomImage,
                      //     contact_name: props.roomName,
                      //     contact_chat_id: props.chatId,
                      //     contact_id: props.contactId,
                      //   })
                      // }

                      onPress={() => {
                        if (props.roomType == "single") {
                          onCallPress({
                            call_type: "video",
                            contact_image: props.roomImage,
                            contact_name: props.roomName,
                            contact_chat_id: props.chatId,
                            contact_id: props.contactId,
                          });
                        } else if (
                          membercount <= 9 &&
                          props.allowGroupCall == 0
                        ) {
                          (groupCallType = "video"),
                            onGroupCallPress({
                              call_type: "video",
                              contact_image: props.roomImage,
                              contact_name: props.roomName,
                              contact_chat_id: calluserIds,
                              typeOfCall: "GroupCall",
                            });
                        } else if (
                          membercount > 9 &&
                          props.allowGroupCall == 0
                        ) {
                          (groupCallType = "video"), setCallMemberModal(true);
                        }
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/videonewicon.png")}
                        style={{
                          height: DeviceInfo.isTablet() ? 32 : 15,
                          width: "100%",
                          tintColor:
                            callblock == true
                              ? COLORS.grey
                              : iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.audioCallContainer,
                  { marginRight: 10, marginLeft: 5 },
                ]}
                onPress={() => {
                  props.onRequestClose();
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../../Assets/Icons/Cross.png")}
                  style={{
                    height: 19,
                    width: 19,
                    tintColor: iconTheme().text_color,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* photo-and-video-view */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                marginTop: 10,
                height: 44,
                alignItems: "center",
                // borderTopWidth: 1,
                // borderTopColor: "light-grey",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  props.OnNextClickMenu(sharedPhotoVideo, sharedDocument, 0);
                }}
                activeOpacity={0.8}
                style={styles.photoVideoViewContainer}
              >
                <View style={styles.imageTextContainer}>
                  <Image
                    source={require("../../Assets/Icons/Set_Profile.png")}
                    style={{
                      height: 20,
                      width: 20,
                      tintColor: iconTheme().text_color,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.photoVideoText,
                      {
                        color: iconTheme().text_color,
                        fontFamily: font.semibold(),
                      },
                    ]}
                  >
                    {" "}
                    {t("Photos/Videos")}
                  </Text>
                </View>

                <View style={[styles.nextContainer, { width: 40 }]}>
                  <Image
                    source={require("../../Assets/Icons/back2.png")}
                    style={{
                      height: 12,
                      width: 12,
                      alignSelf: "center",
                      transform: [{ rotateY: "180deg" }],
                      tintColor: iconTheme().text_color,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            </View>

            {renderIf(
              photoVideoList.length > 0,
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",

                  paddingHorizontal: 5,
                }}
              >
                <FlatList
                  horizontal
                  data={photoVideoList.slice(0, 3)} // Limit to first three items
                  scrollEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  // eslint-disable-next-line
                  renderItem={({ item }: any) => (
                    <View
                      style={{
                        width: windowWidth / 4.3,
                        height: 120,
                        margin: 5,
                        alignSelf: "center",
                      }}
                    >
                      {item.type === "video" ? (
                        <TouchableOpacity
                          style={{ flexDirection: "column", flex: 1 }}
                          onPress={() => {
                            if (item.url == blurVideo) {
                              null;
                            } else {
                              props.onRequestClose();
                              props.onVideoClick(item.url);
                            }
                          }}
                        >
                          <Image
                            source={
                              item?.url == blurVideo
                                ? {
                                    uri: item.url,
                                  }
                                : {
                                    uri: "https://www.pngall.com/wp-content/uploads/9/White-Play-Silhoutte-PNG-File-Download-Free.png",
                                  }
                            }
                            style={{
                              flex: 1,
                              height: 100,
                              width: windowWidth / 4.3,
                              marginBottom: 5,
                              marginRight: 10,
                            }}
                            resizeMode="contain"
                          />
                          <Text
                            style={{ color: COLORS.gray, textAlign: "center" }}
                          >
                            {moment(item?.createdAt).format("MMM DD,YYYY")}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{ flexDirection: "column", flex: 1 }}
                          onPress={() => {
                            if (item?.url == blurImage) {
                              null;
                            } else {
                              setmylocaldata({
                                attachment: [item?.url],
                                type: "image",
                              });
                              setTimeout(() => {
                                props.onRequestClose();
                                setmyimages(true);
                              }, 500);
                            }
                          }}
                        >
                          <Image
                            source={
                              item.url !== blurImage
                                ? { uri: item.url }
                                : { uri: blurImage }
                            }
                            style={{
                              flex: 1,
                              height: 100,
                              borderRadius: 5,
                              marginBottom: 5,
                              width: "100%",
                            }}
                            resizeMode="cover"
                          />
                          <Text
                            style={{ color: COLORS.grey, textAlign: "center" }}
                          >
                            {moment(item?.createdAt).format("MMM DD,YYYY")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              </View>
            )}

            {/*file-view */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                marginTop: props.roomType == "single" ? 10 : 0,
                height: 44,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  props.OnNextClickMenu(sharedPhotoVideo, sharedDocument, 1);
                }}
                activeOpacity={0.8}
                style={styles.photoVideoViewContainer}
              >
                <View style={styles.imageTextContainer}>
                  <Image
                    source={require("../../Assets/Icons/audiofile.png")}
                    style={{
                      height: 20,
                      width: 20,
                      tintColor: iconTheme().text_color,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.photoVideoText,
                      {
                        color: iconTheme().text_color,
                        fontFamily: font.semibold(),
                      },
                    ]}
                  >
                    {" "}
                    {t("Audio/Files")}{" "}
                  </Text>
                </View>

                <View style={[styles.nextContainer, { width: 40 }]}>
                  <Image
                    source={require("../../Assets/Icons/back2.png")}
                    style={{
                      height: 12,
                      width: 12,
                      alignSelf: "center",
                      transform: [{ rotateY: "180deg" }],
                      tintColor: iconTheme().text_color,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            </View>

            {renderIf(
              sharedDocument.length > 0,
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  paddingBottom: 5,

                  // backgroundColor:"yellow",
                  marginHorizontal: 5,
                }}
              >
                <FlatList
                  horizontal
                  scrollEnabled={false}
                  data={sharedDocument.slice(0, 3)}
                  showsHorizontalScrollIndicator={false}
                  // eslint-disable-next-line
                  renderItem={({ item, index }: any) => (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        paddingHorizontal: 2,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "column",
                          // height: 135,
                          width: windowWidth / 4.1,
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            item?.localPath?.length > 0
                              ? item.message_type == "audio"
                                ? ToOpenPreview({
                                    attachment: item,
                                    type: "audio",
                                  })
                                : handleDocumentPress(item?.localPath)
                              : null;
                          }}
                          style={[
                            styles.documentIconView,
                            {
                              borderColor:
                                item.message_type == "audio"
                                  ? "blue"
                                  : "#C40807",
                              marginLeft: 5,
                            },
                          ]}
                        >
                          {item.message_type == "audio" ? (
                            <Image
                              source={require("../../Assets/Icons/AudioSideMenu.png")}
                              style={{
                                height: 90,
                                width: 80,
                              }}
                              resizeMode="contain"
                            />
                          ) : (
                            <Image
                              source={require("../../Assets/Icons/pdfview.png")}
                              style={{
                                height: 90,
                                width: 80,
                              }}
                              resizeMode="contain"
                            />
                          )}
                        </TouchableOpacity>
                        <View style={styles.dateContainer}>
                          <Text
                            style={[
                              styles.dateText,
                              {
                                color: COLORS.grey,
                                marginTop: 5,
                                textAlign: "center",
                              },
                            ]}
                          >
                            {moment(item?.createdAt).format("MMM DD,YYYY")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}

            {/* participants-view */}

            {renderIf(
              (!issettingopen && props.roomType == "multiple") ||
                (props.roomType == "broadcast" &&
                  !props.isUserBlock &&
                  !issettingopen),
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  marginTop: props.roomType == "single" ? 10 : 0,
                  height: 44,
                  alignItems: "center",
                }}
              >
                <View style={styles.fileViewContainer}>
                  <View style={styles.imageTextContainer}>
                    <Image
                      source={require("../../Assets/Icons/AddGroup.png")}
                      style={{
                        height: 20,
                        width: 20,
                        tintColor: iconTheme().text_color,
                      }}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        styles.photoVideoText,
                        { color: iconTheme().text_color },
                      ]}
                    >
                      {" "}
                      {
                        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"

                        membercount > 0
                          ? `${t("Participants")} (${membercount})`
                          : t("Participants")
                      }
                    </Text>
                  </View>

                  {renderIf(
                    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                    membercount > 15,
                    <TouchableOpacity
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        // paddingHorizontal: 10,
                        borderRadius: 5,
                        flexDirection: "row",
                        marginTop: 0,
                        justifyContent: "flex-end",
                      }}
                      onPress={() => {
                        if (props.roomType !== "single") {
                          props.getParticipantList();
                          props.getParticipantListFrom("SideManu");
                        }
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: iconTheme().text_color,
                        }}
                      >
                        {t("viewAll")}
                      </Text>

                      <Image
                        source={require("../../Assets/Icons/back2.png")}
                        style={{
                          height: 12,
                          width: 12,
                          alignSelf: "center",
                          transform: [{ rotateY: "180deg" }],
                          tintColor: iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {renderIf(
              props?.roomType == "single" || issettingopen,
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  marginTop: props?.roomType == "single" ? 10 : 0,
                  height: 44,
                  alignItems: "center",
                }}
              >
                <View style={styles.fileViewContainer}>
                  <View style={styles.imageTextContainer}>
                    <Image
                      source={require("../../Assets/Icons/SettingBottom.png")}
                      style={{
                        height: 20,
                        width: 20,
                        tintColor: iconTheme().text_color,
                      }}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        styles.photoVideoText,
                        {
                          color: iconTheme().text_color,
                          fontSize: 17,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {" "}
                      {t("settings")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {renderIf(
              issettingopen,
              <View
                style={{
                  width: "100%",
                  marginHorizontal: 10,
                  paddingBottom: 20,
                }}
              >
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "transparent",
                    borderRadius: 10,
                  }}
                >
                  {newroomID && (
                    <TouchableOpacity
                      onPress={() => {
                        globalThis.confirmAlertText =
                          props.roomType == "single"
                            ? t("do_you_want_to_delete_this_chat")
                            : props.roomType == "multiple"
                            ? t("do_you_want_to_delete_this_group_all_chats")
                            : t(
                                "do_you_want_to_delete_this_broadcast_all_chats"
                              );

                        setConfirmAlertModel(true);
                        // Alert.alert(
                        //   t("confirm"),
                        //   `${
                        //     props.roomType == "single"
                        //       ? t("do_you_want_to_delete_this_chat")
                        //       : props.roomType == "multiple"
                        //       ? t("do_you_want_to_delete_this_group_all_chats")
                        //       : t(
                        //           "do_you_want_to_delete_this_broadcast_all_chats"
                        //         )
                        //   }.`,
                        //   [
                        //     { text: t("cancel") },
                        //     {
                        //       text: t("yes"),
                        //       onPress: () => props.deleteChat(),
                        //     },
                        //   ]
                        // );
                      }}
                      style={{
                        height: 40,
                        justifyContent: "flex-start",
                        paddingLeft: 5,
                        flexDirection: "row",
                        // backgroundColor:"red",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/delete_chat.png")}
                        style={{
                          height: 18,
                          width: 18,
                          marginRight: 5,
                          tintColor: iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                      <Text
                        style={{
                          fontFamily: font.semibold(),
                          color: iconTheme().text_color,
                          fontSize: 15,
                          fontWeight: "600",
                        }}
                      >
                        {t("deleteChat")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {props?.roomType == "single" && (
                    <TouchableOpacity
                      onPress={() => setReportUser(true)}
                      style={{
                        height: 40,
                        justifyContent: "flex-start",
                        paddingLeft: 5,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={require("../../Assets/Icons/Report.png")}
                        style={{
                          height: 20,
                          width: 20,
                          marginRight: 5,
                          tintColor: iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                      <Text
                        style={{
                          fontFamily: font.semibold(),
                          color: iconTheme().text_color,
                          fontSize: 15,
                          fontWeight: "600",
                        }}
                      >
                        {t("Report_User")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {props.roomType == "single" && newroomID && (
                    <TouchableOpacity
                      style={{
                        height: 40,
                        justifyContent: "flex-start",
                        paddingLeft: 5,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      onPress={() =>
                        props.UserActivity(
                          isnewblock == true ? "unblock" : "block"
                        )
                      }
                    >
                      <Image
                        source={require("../../Assets/Icons/Block.png")}
                        style={{
                          height: 20,
                          width: 20,
                          marginRight: 5,
                          tintColor: iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                      <Text
                        style={{
                          fontFamily: font.semibold(),
                          color: iconTheme().text_color,
                          fontSize: 15,
                          fontWeight: "600",
                        }}
                      >
                        {isnewblock == true
                          ? t("User_Unblocked")
                          : t("blockChat")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {renderIf(
              membercount === 0,
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 100,
                }}
              >
                <ActivityIndicator
                  size="large"
                  color={iconTheme().text_color}
                />
                <Text style={{ marginTop: 10 }}>
                  {t("Fetching_members_Pleasewait")}{" "}
                </Text>
              </View>
            )}

            {renderIf(
              // !issettingopen && participants.length > 0 && !props.isUserBlock,
              //       ***  REMOVED FOR GET PARTICIPANT LIST BY ARJUN ***     //
              !issettingopen && participants?.length > 0,
              <View
                style={{
                  width: "100%",
                  marginHorizontal: 10,
                  paddingBottom: 20,
                  // borderBottomWidth: 1,
                  // borderColor: "#ccc",
                }}
              >
                <FlatList
                  data={participants}
                  // eslint-disable-next-line
                  renderItem={({ item, index }: any) => (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        marginTop: 12,
                        alignItems: "center",
                        paddingHorizontal: 5,
                        marginBottom:
                          index == participants.length - 1 ? 100 : 0,
                      }}
                      onPress={() => {
                        console.log("tppptptptptppt", item.userId);
                        // if (item.userId === globalThis.userChatId) {
                        //   props?.navigation.navigate("EditProfileScreen");
                        // } else {
                        props?.getProfileApi(
                          item.userId,
                          item.userName,
                          item.image
                        );
                        // }
                      }}
                    >
                      <View style={{ width: "18%" }}>
                        <Image
                          source={
                            item.image
                              ? { uri: item.image }
                              : {
                                  uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                                }
                          }
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: "darkgray",
                          }}
                          resizeMode="contain"
                        />
                      </View>
                      <Text
                        style={{
                          color: iconTheme().text_color,
                          // marginTop: 10,
                          marginHorizontal: 2,
                        }}
                        numberOfLines={1}
                      >
                        {item.userName || item.name || item.roomName}
                      </Text>
                      {item?.premium == "1" && (
                        <Image
                          source={require("../../Assets/Image/PremiumBadge.png")}
                          style={{
                            height: 15,
                            width: 15,
                            tintColor: iconTheme().text_color,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.footerContainer,
              { backgroundColor: themeModule().theme_background },
            ]}
          >
            {props?.roomType == "single" ? (
              <View style={styles.exitGroupButton}></View>
            ) : (
              <TouchableOpacity
                style={styles.exitGroupButton}
                onPress={() =>
                  props?.isUserBlock ? null : props?.OnExitGroupClick()
                }
                disabled={props?.isUserBlock == true}
              >
                {props?.isUserBlock != true && (
                  <Image
                    source={
                      props.roomType == "multiple"
                        ? require("../../Assets/Icons/exit_group.png")
                        : require("../../Assets/Icons/Delete.png")
                    }
                    style={{
                      height: 25,
                      width: 25,
                      tintColor:
                        props?.isUserBlock == true
                          ? COLORS.grey
                          : iconTheme().text_color,
                    }}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            )}
            {newroomID && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  style={styles.exitGroupButton}
                  onPress={() => ToPinChat()}
                >
                  <Image
                    source={
                      isroompin
                        ? require("../../Assets/Image/Filled_Pin_icon.png")
                        : require("../../Assets/Icons/Pinned_Chat.png")
                    }
                    style={{
                      height: 28,
                      width: 28,
                      tintColor: iconTheme().text_color,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                {props?.isUserBlock != true && (
                  <TouchableOpacity
                    style={[styles.exitGroupButton]}
                    onPress={() => (props?.isUserBlock ? null : OnMute())}
                  >
                    {muteFilled ? (
                      <Image
                        source={require("../../Assets/Icons/sidemute1.png")}
                        style={{
                          height: "100%",
                          width: 20,
                          tintColor: iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Image
                        // source={require("../../Assets/Icons/notification.png")}
                        source={require("../../Assets/Icons/sidemute2.png")}
                        style={{
                          height: "100%",
                          width: 20,
                          tintColor: iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                )}
                {props?.roomType !== "single" && (
                  <TouchableOpacity
                    style={styles.exitGroupButton}
                    onPress={() => {
                      if (props?.roomType !== "single") {
                        setissettingopen(!issettingopen);
                      }
                    }}
                  >
                    {issettingopen && props?.roomType !== "single" ? (
                      <Image
                        source={require("../../Assets/Icons/AddGroup.png")}
                        style={{
                          height: 25,
                          width: 25,
                          tintColor: iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Image
                        source={require("../../Assets/Icons/SettingBottom.png")}
                        style={{
                          height: 25,
                          width: 25,
                          tintColor: iconTheme().text_color,
                        }}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
      <Modal
        visible={callMemberModal}
        animationType="slide"
        transparent
        onRequestClose={() => setCallMemberModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: "90%",
              //height:'100%',
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5, // Android shadow
              minHeight: 300,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 15,
              }}
            >
              <TouchableOpacity
                disabled={true}
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Select Members
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={() => {
                  setCallMemberModal(false);
                  setSelectedUserIds([]);
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../../Assets/Icons/Cross.png")}
                  style={{
                    height: 19,
                    width: 19,
                    tintColor: iconTheme().text_color,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Search Box */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 8,
                paddingHorizontal: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#ddd",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3, // Android shadow
              }}
            >
              <TextInput
                placeholder="Search members..."
                placeholderTextColor="#777"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  flex: 1,
                  height: 40,
                  fontSize: 16,
                  color: "#000",
                }}
              />
            </View>

            {/* Members List */}
            <FlatList
              data={filteredParticipants}
              renderItem={renderItem}
              keyExtractor={(item) => item.userId}
              style={{ maxHeight: 300 }}
              ListEmptyComponent={() => (
                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <Text style={{ fontSize: 16, color: "#888" }}>
                  No Matching member Found.
                  </Text>
                </View>
              )}
            />

            {/* Add to Call Button */}

            {selectedUserIds?.length > 0 && (
              <TouchableOpacity
                style={{
                  marginTop: 12,
                  backgroundColor: themeModule().theme_background,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5, // Android shadow
                }}
                onPress={() => handleModalClose(selectedUserIds)}
              >
                <Text
                  style={{
                    color: iconTheme().iconColor,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Add to Call
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgrey",
    justifyContent: "center",
    alignItems: "center",
  },
  chatRoomText: {
    color: iconTheme().text_color,
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "700",
  },
  photoVideoViewContainer: {
    width: "90%",
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-between",
    marginLeft: 15,
  },
  imageTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextContainer: {
    height: 44,
    justifyContent: "center",
  },
  fileViewContainer: {
    width: "90%",
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-between",
    marginLeft: 15,
  },
  chatRoomTextContainer: {
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    paddingTop: DeviceInfo.hasNotch() ? 60 : 40,
    flexDirection: "row",
  },
  headingContainer: {
    alignItems: "center",
    padding: 5,
  },
  callIconsContainer: {
    flexDirection: "row",
  },
  audioCallContainer: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 20,
  },
  photoVideoText: {
    color: iconTheme().text_color,
    fontSize: 15,
    fontWeight: "600",
  },
  dateContainer: {
    // marginLeft: 15,
    // marginTop: 8,
  },
  dateText: {
    color: iconTheme().text_color,
    fontSize: 12,
  },
  documentIconView: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  noMediaText: {
    fontSize: 13,
  },
  footerContainer: {
    backgroundColor: "#e8e8e8",
    height: DeviceInfo.hasNotch() ? 70 : 50,
    position: "absolute",
    bottom: DeviceInfo.hasNotch() ? 0 : 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
  exitGroupButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    marginTop: 100,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "darkgray",
    marginRight: 10,
  },
  userName: {
    flex: 1,
    fontSize: 16,
  },
  openButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  openButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#28A745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
