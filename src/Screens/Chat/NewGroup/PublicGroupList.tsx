import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
//@ts-ignore
import AWS, { Credentials } from "aws-sdk";
import { decode } from "base64-arraybuffer";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import ImagePicker from "react-native-image-crop-picker";
import { useDispatch } from "react-redux";
import RNFetchBlob from "rn-fetch-blob";
import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import TopBar from "../../../Components/TopBar/TopBar";
import renderIf from "../../../Components/renderIf";
import {
  EncryptionKey,
  accessKeyId,
  secretAccessKey,
} from "../../../Constant/Key";
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
import { socket } from "../../../socket";
import {
  addMembersToRoomMembersSql,
  insertChatList,
  newMessageInsertList,
  removeCount,
} from "../../../sqliteStore";
import { CameraModal } from "../../Modals/CameraModel";
import { LoaderModel } from "../../Modals/LoaderModel";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";

const isDarkMode = true;
const data = [
  { id: 1, name: "Eun Kyung", contact: "+91-9065812452", isChecked: false },
];
export default function CreateGroupScreen({ navigation, route }: any) {
  const dispatch = useDispatch();
  const { colorTheme } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [products, setProducts] = React.useState(data);
  const [checked, setChecked] = useState("first");
  const [isPublic, setIsPublic] = useState("public");
  const [cameraModal, setCameraModal] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);

  const [filePath, setFilePath] = useState("");
  const { t, i18n } = useTranslation();

  // socket.connect;

  React.useEffect(() => {
    socket.on("connect_error", (error: any) => {
      socket.connect;
      // Handle the error (e.g., display an error message)
    });
  }, [socket]);

  const buttonPress = () => {
    navigation.navigate("NewGroupScreen");
  };
  const buttonPress2 = () => {
    if (groupName == "") {
      // Alert.alert("", t("please_provide_group_name"), [{ text: t("ok") }]);
      globalThis.errorMessage = t("please_provide_group_name");
      setErrorAlertModel(true);
    } else {
      if (filePath == "") {
        const imageSend = "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Document/1717401343823_36FA5C33-D2AD-40F0-AC1B-E35C078FCFFE.jpg";
        createGroup(imageSend);
      } else {
        BucketUpload();
      }
    }
  };

  const handleChange = (id: any) => {
    let temp = products.map((product) => {
      if (id === product.id) {
        return { ...product, isChecked: !product.isChecked };
      }
      return product;
    });
    setProducts(temp);
  };

  // **********  Select Image From Lounch Camera  ********** ///
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
            setFilePath(image.path);
            setCameraModal(false);
          }
        })
        .catch((e) => {
          setCameraModal(false);
        });
    }
  };
  // **********  Sendig Data as Parameter  ********** ///
  const imageUpload = new FormData();
  if (filePath !== "") {
    let Imageurlstr = filePath?.replace("file://", "");
    imageUpload.append("profile_image", {
      uri:
        Platform.OS === "android"
          ? "file://" + filePath
          : filePath?.replace("file://", ""),
      type: "image/jpeg", // or photo.type
      name: "userImage.jpg",
    });
  }

  // **********  Request Permission for Open Camera And Galary   ********** ///
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
        console.warn(err);
        return false;
      }
    } else return true;
  };

  // **********  Select Image From ImageLibarary  ********** ///
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
          setFilePath(image.path);
          setCameraModal(false);
        }
      });
    }
  };

  let selected = products.filter((product) => product.isChecked);

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 30 : 20,
    },
    newGroupText: {
      color: appBarText().textColor,
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
      height: DeviceInfo.isTablet() ? 25 : 20,
      width: DeviceInfo.isTablet() ? 25 : 20,
      tintColor: iconTheme().iconColor,
    },
    newChatIcon2: {
      justifyContent: "center",
      alignItems: "center",
      height: DeviceInfo.isTablet() ? 50 : 40,
      width: DeviceInfo.isTablet() ? 50 : 40,
      borderRadius: 50,
    },
    newcrossIcon: {
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
    imageContainer: {
      justifyContent: "center",
      paddingLeft: 10,
      alignItems: "center",
    },
    nameText: {
      fontSize: FontSize.font,
      color: COLORS.black,
      fontFamily: font.semibold(),
      alignItems: "center",
      justifyContent: "center",
    },
    groupText: {
      fontSize: 18,
      color: COLORS.black,
      fontFamily: font.semibold(),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    lenText: {
      fontSize: 10,
      color: COLORS.black,
      fontFamily: font.medium(),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    editText: {
      fontSize: 12,
      color: COLORS.black,
      fontFamily: font.medium(),
      alignItems: "center",
      justifyContent: "center",
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
      fontFamily: font.medium(),
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
    addUser: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colorTheme ? COLORS.primary_blue_light : COLORS.yellow,
      height: DeviceInfo.isTablet() ? 50 : 40,
      width: DeviceInfo.isTablet() ? 50 : 40,
      borderRadius: 50,
    },
  });

  function createGroup(image: any) {
    //@ts-ignore

    setLoading(true);
    const arrayOfChatIds = route.params.selected_data.map(
      (obj: { chat_user_id: any }) => obj.chat_user_id
    );

    const groupParams = {
      roomName: groupName,
      //@ts-ignore
      roomOwnerId: globalThis.chatUserId,
      roomMembers: arrayOfChatIds,
      membersRaw: [
        ...route.params.selected_data,
        {
          //@ts-ignore
          chat_user_id: globalThis.userChatId,
          //@ts-ignore
          contact_name: globalThis.displayName,
          //@ts-ignore
          profile_image: globalThis.image,
          //@ts-ignore
          phone_number: globalThis.phone_number,
        },
      ],
      groupType: "multiple",
      group_image: image,
      group_description: groupDescription,
      allow: checked == "first" ? "public" : "admin",
      isPublic: isPublic == "public",
    };

    //@ts-ignore
    socket.emit("createGroup", groupParams);
    // }
  }

  useEffect(() => {
    const messageSend = CryptoJS.AES.encrypt(
      "This Group is created by " + //@ts-ignore
        globalThis.userName,
      EncryptionKey
    ).toString();
    //@ts-ignore
    const handlenewGroupCreated = async (data: any) => {
      const arrayOfChatIds = route.params.selected_data.map(
        (obj: { chat_user_id: any }) => obj.chat_user_id
      ); //@ts-ignore
      if (data.result.fromUser == globalThis.chatUserId) {
        const mId = Math.floor(Math.random() * 9000) + 1000;

        const paramsOfSend = {
          mId: mId,
          roomId: data.result.roomId, //@ts-ignore
          fromUser: globalThis.userChatId,
          message: messageSend,
          message_type: "notify",
          attachment: [],
          isBroadcastMessage: false,
          isDeletedForAll: false,
          parent_message: {},
          isForwarded: false,
          storyId: "",
          isStoryRemoved: false,
          resId: new Date(data.result.time).getTime(),
          broadcastMessageId: "",
          seenCount: 0,
          deliveredCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          //yash ---work
          members: route.params.selected_data,
        };
        const params = {
          mId: mId,
          isNotificationAllowed: true, //@ts-ignore
          userName: globalThis.displayName, //@ts-ignore
          phoneNumber: globalThis.phone_number, //@ts-ignore
          currentUserPhoneNumber: globalThis.phone_number, //@ts-ignore
          userImage: globalThis.image,
          roomId: data.result.roomId,
          roomName: data.result.roomName,
          roomImage: data.result.roomImage,
          roomType: data.result.roomType, //@ts-ignore
          roomOwnerId: globalThis.userChatId,
          message: messageSend,
          message_type: "notify",
          roomMembers: [],
          isForwarded: false,
          attachment: [], //@ts-ignore
          from: globalThis.userChatId,
          resId: new Date(data.result.time).getTime(),
          status: "",
          parent_message_id: "",
          parent_message: {},
          createdAt: new Date(),
          isDeletedForAll: false,
        };

        //@ts-ignore
        socket.emit("sendmessage", params);

        let createGroup = {
          roomId: data.result.roomId,
          roomName: data.result.roomName,
          roomImage: data.result.roomImage,
          roomType: data.result.roomType,
          friendId: data.result.fromUser,
          fromUser: data.result.fromUser,
          isNotificationAllowed: data.result.isNotificationAllowed,
          allow: data.result.allow,
        };

        newMessageInsertList(createGroup, false, "0");
        insertChatList({ paramsOfSend: paramsOfSend, chatRoom: true });
        let myObj = {
          //@ts-ignore
          chat_user_id: globalThis.userChatId, //@ts-ignore
          contact_name: globalThis.displayName, //@ts-ignore
          profile_image: globalThis.image, //@ts-ignore
          phone_number: globalThis.phone_number,
          isAdmin: data.result.fromUser == globalThis.userChatId ? 1 : 0,
        };
        addMembersToRoomMembersSql(
          [...route.params.selected_data, myObj],
          data.result.roomId
        );

        //@ts-ignore
        socket.emit("joinRoom", {
          roomId: data.result.roomId, //@ts-ignore
          userId: globalThis.chatUserId,
        });
        dispatch(setnewroomID(data.result.roomId));
        dispatch(setnewroomType(data.result.roomType));
        dispatch(
          setroominfo({
            roomImage: data.result.roomImage,
            roomName: data.result.roomName,
          })
        );

        dispatch(
          setMainprovider({
            userImage: data.result.roomImage,
            userName: data.result.roomName,
            room: data.result,
            roomType: data.result.roomType,
            friendId: "",
            lastMessageId: "",
            isBlock: false,
          })
        );

        dispatch(setyesstart(true));
        removeCount(data.result.roomId);

        dispatch(setisnewBlock(false));
        dispatch(setisnewmMute(true));
        dispatch(setisnewArchiveroom(false));
        setLoading(false);
        navigation.navigate("BottomBar", {
          userImage: data.result.roomImage,
          userName: data.result.roomName,
          room: data.result,
          roomType: data.result.roomType,
          friendId: "",
          lastMessageId: "",
          isBlock: false,
          inside: true,
          screenFrom: "chatScreen",
        });
      }
    };

    //@ts-ignore
    socket.on("newGroupCreated", handlenewGroupCreated);
    return () => {
      //@ts-ignore
      socket.off("newGroupCreated", handlenewGroupCreated);
    };
  });

  const BucketUpload = async () => {
    setLoading(true);

    const s3 = new AWS.S3({
      accessKeyId: globalThis.accessKey,
      secretAccessKey: globalThis.awsSecretAccessKey,
      region: "us-east-2",
      //@ts-ignore
      s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com",
    });
    try {
      // Read the image file
      const response = await RNFetchBlob.fs.readFile(filePath, "base64");
      const binaryData = decode(response);
      const pathParts = filePath.split("/");
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
      createGroup(uploadResult.Location);

      //@ts-ignore
    } catch (error) {}
  };
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <CameraModal
        // {...props}
        visible={cameraModal}
        onRequestClose={() => setCameraModal(false)}
        Camera={() => captureImage()}
        select={() => selectImage()}
        cancel={() => setCameraModal(false)}
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
        {/* // **********    View For Show the StatusBar    ********** /// */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        {/* // **********    View For Show the TopBar    ********** /// */}
        <TopBar showTitle={true} title={t("new_group")} checked={
            //@ts-ignore
            globalThis.selectTheme
          }/>

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
              <Text style={styles.cancelText}>{t("create_group")}</Text>
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
                top:  chatTop().top
              }}
            ></ImageBackground>
          ) : null
        }
      </View>

      <View style={styles.chatContainer}>
        <View style={{ flexDirection: "row", marginVertical: 20 }}>
          <View style={{ flexDirection: "column" }}>
            <View style={styles.imageContainer}>
              <TouchableOpacity
                style={styles.addUser}
                onPress={() => setCameraModal(true)}
              >
                {filePath == "" ? (
                  <Image
                    source={require("../../../Assets/Icons/AddGroup.png")}
                    style={styles.newChatIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={{ uri: filePath }}
                    style={styles.newChatIcon2}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: "column", width: "85%" }}>
            <View style={styles.nameTextContainer}>
              <Text style={styles.nameText}>{t("group_name")}</Text>
            </View>
            <View style={styles.nameInputTextContainer}>
              <TextInput
                style={styles.nameInputText}
                placeholder={t("enter_group_name")}
                defaultValue={groupName}
                onChangeText={(text) => setGroupName(text)}
                maxLength={40}
                onSubmitEditing={()=>Keyboard.dismiss()}

              />
            </View>
          </View>
        </View>
        <View style={styles.nameTextContainer}>
          <Text style={styles.nameText}>{t("group_description")}</Text>
        </View>
        <View style={styles.nameInputTextContainer}>
          <TextInput
            style={styles.nameInputText}
            placeholder={t("enter_group_description")}
            defaultValue={groupDescription}
            onChangeText={(text) => setGroupDescription(text)}
            maxLength={80}
          />
        </View>
        <View style={styles.nameTextContainer}>
          <Text style={styles.lenText}>{t("150_characters")}</Text>
        </View>

        <View style={styles.nameTextContainer}>
          <Text style={styles.groupText}>{t("group_type")}</Text>
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
              borderColor: isPublic === "private" ? "green" : "grey",
              padding: 2.5,
            }}
            onPress={() => setIsPublic("private")}
          >
            <View
              style={{
                backgroundColor: isPublic === "private" ? "green" : "white",
                borderColor: isPublic === "private" ? "green" : "red",
                borderRadius: 25,
                height: 15,
                width: 15,
              }}
            ></View>
          </TouchableOpacity>
          <Text style={{ paddingLeft: 10 }}>Make Group Private</Text>
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
              borderColor: isPublic !== "private" ? "green" : "grey",
              padding: 2.5,
            }}
            onPress={() => setIsPublic("public")}
          >
            <View
              style={{
                backgroundColor: isPublic !== "private" ? "green" : "white",
                borderColor: isPublic !== "private" ? "green" : "red",
                borderRadius: 25,
                height: 15,
                width: 15,
              }}
            ></View>
          </TouchableOpacity>
          <Text style={{ paddingLeft: 10 }}>Make Group Public</Text>
        </View>

        <View style={styles.nameTextContainer}>
          <Text style={styles.groupText}>{t("group_type")}</Text>
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
              borderColor: checked === "first" ? "green" : "grey",
              padding: 2.5,
            }}
            onPress={() => setChecked("first")}
          >
            <View
              style={{
                backgroundColor: checked === "first" ? "green" : "white",
                borderColor: checked === "first" ? "green" : "red",
                borderRadius: 25,
                height: 15,
                width: 15,
              }}
            ></View>
          </TouchableOpacity>
          <Text style={{ paddingLeft: 10 }}>
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
              borderColor: checked !== "first" ? "green" : "grey",
              padding: 2.5,
            }}
            onPress={() => setChecked("second")}
          >
            <View
              style={{
                backgroundColor: checked !== "first" ? "green" : "white",
                borderColor: checked !== "first" ? "green" : "red",
                borderRadius: 25,
                height: 15,
                width: 15,
              }}
            ></View>
          </TouchableOpacity>
          <Text style={{ paddingLeft: 10 }}>{t("allow_admin_msg")}</Text>
        </View>

        <View style={styles.nameTextContainer}>
          <Text style={styles.nameText}>{t("group_members")}</Text>
        </View>
        <View style={{ marginBottom: 10, marginTop: 10, marginLeft: 10 }}>
          <FlatList
            horizontal
            data={route.params.selected_data}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.profile1Container2, {}]}
                onPress={() => handleChange(item.id)}
              >
                <View style={{ paddingHorizontal: 10, width: 80 }} key={index}>
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
                  <Text style={{ alignSelf: "center" }} numberOfLines={1}>
                    {item.contact_name}
                  </Text>
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
