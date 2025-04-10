import AWS from "aws-sdk";
import { decode } from "base64-arraybuffer";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardEvent,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import RNFetchBlob from "rn-fetch-blob";
import { COLORS, iconTheme, searchBar } from "../../Components/Colors/Colors";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import { accessKeyId, secretAccessKey } from "../../Constant/Key";
import { socket } from "../../socket";
import { changeAliasName } from "../../sqliteStore";
import { LoaderModel } from "./LoaderModel";
import { SetProfileModal } from "./SetProfileModel";

 // eslint-disable-next-line
export const SetAliasModel = (props: any) => {
  const roomData = props.data;
  const [aliasname, setAliasname] = useState(roomData.aliasName);
  const [aliasimage, setAliasimage] = useState(roomData.aliasImage);
  const [cameraModel, setCameraModal] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    function onKeyboardDidShow(e: KeyboardEvent) {
      // Remove type here if not using TypeScript
      setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardDidHide() {
      setKeyboardHeight(0);
    }
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      onKeyboardDidShow
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardDidHide
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    modal_view: {
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
      position: "absolute",
      backgroundColor: "#fff",
      borderTopEndRadius: 12,
      borderTopStartRadius: 12,
      elevation: 6,
      shadowColor: COLORS.black,
      shadowOpacity: 5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 3.5,
    },
    buttonText: {
      fontSize: 18,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    removeButton: {
      fontSize: 20,
      color: "red",
      fontFamily: font.bold(),
    },
    button: {
      height: 50,
      marginTop: 30,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew
    },

    removeAlias: {
      height: 50,
      marginTop: 30,
      width: "48%",
      marginHorizontal: "1%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew
    },

    removeAlias2: {
      height: 50,
      marginTop: 30,
      width: "48%",
      marginHorizontal: "1%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "red",
    },
    nameText: {
      fontSize: 18,
      color: COLORS.black,
      fontWeight: "600",
      fontFamily: font.regular(),
    },
    modal: {
      width: "100%",
      marginLeft: 0,
      marginBottom: 0,
    },

    textInput: {
      paddingVertical: 0,
      fontFamily: font.semibold(),
      backgroundColor: "#fff",
      alignItems: "center",
      fontSize: 17,
    },

    cancel_button: {
      position: "absolute",
      borderRadius: 20,
      padding: 7,
      backgroundColor: searchBar().back_ground,
      right: 20,
      top: 20,
    },
    profile_image: {
      position: "absolute",
      borderRadius: 25,
      left: 20,
      backgroundColor:"lightgray"
    },
    questionIcon: {
      height: 18,
      width: 18,
      marginLeft: 10,
      marginTop: 5,
      tintColor: iconTheme().iconColor,
    },
    nameInputText: {
      fontSize: FontSize.font,
      padding: 0,
      marginTop: 10,
      color: COLORS.black,
      fontFamily: font.regular(),
      width: "100%",
    },
    phoneContainer: {
      marginTop: 14,
      width: "100%",
      height: 40,
      fontFamily: font.semibold(),
      borderBottomWidth: 1,
      borderBottomColor: "#F6EBF3",
    },
  });

  //////////////////launchCamera///////////////////
  const captureImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
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
          }
        })
        .catch(() => {
          setCameraModal(false);
        });
    }
  };
  ////////////////////launchImageLibrary/////////////////

  const selectImage = async () => {
    const isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        compressImageQuality: 0.2,
        cropperCircleOverlay: true,
         // eslint-disable-next-line
      }).then((image: any) => {
        if (image !== undefined) {
          UPdatedImage(image);
          setCameraModal(false);
        }
      });
    }
  };

   // eslint-disable-next-line
  function UPdatedImage(image: any) {
    BucketUpload(image.path);
    setAliasimage(image.path);
    setCameraModal(false);
  }

  /////////////////////////BUCKET UPLOAD?????????????????????/////////
   // eslint-disable-next-line
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
      setTimeout(() => {
        setloaderMoedl(false);
      }, 200);
      setAliasimage(uploadResult.Location);
    } catch (error) {
      setloaderMoedl(false);
    }
  };

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
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const updateAlias = () => {
    setloaderMoedl(true);
     // eslint-disable-next-line
    changeAliasName(props.data.room, aliasname, aliasimage, (res: any) => {
      if (res) {
        socket.emit("changeAliasName", {
          name: aliasname,
          image: aliasimage,
          room: props.data.room,
          user: globalThis.chatUserId,
        });
        setTimeout(() => {
          setloaderMoedl(false);
        }, 200);
        props.onRequestClose();
      } else {
        setloaderMoedl(false);
      }
    });
  };

  const removeAlias = () => {
    setloaderMoedl(true);
     // eslint-disable-next-line
    changeAliasName(props.data.room, "", "", (res: any) => {
      if (res) {
        socket.emit("changeAliasName", {
          name: "",
          image: "",
          room: props.data.room, 
          user: globalThis.chatUserId,
        });
        setloaderMoedl(false);
        props.onRequestClose();
      } else {
        setloaderMoedl(false);
      }
    });
  };

  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      onRequestClose={() => {
        props.onRequestClose;
      }}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}>
        <SetProfileModal
          visible={cameraModel}
          onRequestClose={() => setCameraModal(false)}
          Camera={() => captureImage()}
          select={() => selectImage()}
          cancel={() => setCameraModal(false)}
        />

        <LoaderModel
          visible={loaderMoedl}
          onRequestClose={() => setloaderMoedl(false)}
          cancel={() => setloaderMoedl(false)}
        />
      </View>
      <View
        style={[
          styles.modal_view,
          { height: Platform.OS === "ios" ? 380 + keyboardHeight : 380 },
        ]}
      >
        <Text
          style={{
            alignSelf: "flex-start",
            fontSize: 18,
            paddingHorizontal: 20,
            marginTop: 20,
            color: COLORS.black,
            fontFamily: font.bold(),
          }}
        >
          {roomData.aliasName || roomData.aliasImage
            ? "Update Alias"
            : "Set Alias"}
        </Text>
        <TouchableOpacity style={[styles.cancel_button]} onPress={props.cancel}>
          <Image
            source={require("../../Assets/Icons/Cross.png")}
            style={{
              height: 15,
              width: 15,
              tintColor: iconTheme().iconColor,
              //
            }}
          />
        </TouchableOpacity>
        <View
          style={{
            marginVertical: 30,
            flexDirection: "column",
            paddingHorizontal: 30,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={[styles.profile_image]}
            onPress={() => setCameraModal(true)}
          >
            <Image
              source={{ uri: aliasimage || roomData.roomImage }}
              style={{
                height: 50,
                width: 50,
                borderRadius: 25,
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setCameraModal(true)}
          style={{ flexDirection: "row", marginTop: 25, paddingHorizontal: 20 }}
        >
          <Text
            style={{
              color: COLORS.black,
              fontSize: 14,
              marginTop: 5,
              fontFamily: font.semibold(),
            }}
          >
            Edit Photo
          </Text>
          <Image
            source={require("../../Assets/Icons/NotePen.png")}
            style={styles.questionIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View
          style={{ flexDirection: "row", marginTop: 20, paddingHorizontal: 20 }}
        >
          <Text
            style={{
              color: COLORS.black,
              fontSize: 15,
              fontFamily: font.semibold(),
            }}
          >
            Alias Name
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 15,
            marginHorizontal: 20,
            borderBottomColor: "grey",
            borderBottomWidth: 0.2,
          }}
        >
          <TextInput
            style={styles.nameInputText}
            maxLength={30}
            placeholder={"eg. Joon Koong"}
            defaultValue={aliasname}
            onChangeText={(text) => setAliasname(text)}
            onSubmitEditing={()=>Keyboard.dismiss()}

          />
        </View>
        <View
          style={{ flexDirection: "row", marginTop: 0, marginHorizontal: 20, }}
        >
          {roomData.aliasName || roomData.aliasImage ? (
            <>
              <TouchableOpacity
                style={styles.removeAlias}
                onPress={() => {
                  updateAlias();
                }}
              >
                <Text style={styles.buttonText}> Update </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeAlias2}
                onPress={() => {
                  removeAlias();
                }}
              >
                <Text style={styles.buttonText}> Remove </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                updateAlias();
              }}
            >
              <Text style={styles.buttonText}> Set Alias </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
