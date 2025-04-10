import AWS from "aws-sdk";
import { decode } from "base64-arraybuffer";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { useTranslation } from "react-i18next";
import NetInfo from "@react-native-community/netinfo";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { update_profile } from "../../Constant/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConfirmAlertModel } from "./ConfirmAlertModel";
import { SuccessModel } from "./SuccessModel";
import { ErrorAlertModel } from "./ErrorAlertModel";
import { NoInternetModal } from "./NoInternetModel";

// eslint-disable-next-line
export const UpdateNameModel = (props: any) => {
  const { t } = useTranslation();
  const roomData = props.data;
  const [username, setusername] = useState(roomData.username);
  const [aboutus, setaboutus] = useState(roomData.aboutus);
  const [cameraModel, setCameraModal] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const [successAlertModel, setSuccessAlertModel] = useState(false);
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [noInternetModel, setNoInternetModel] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    setusername(roomData.username);
    setaboutus(roomData.aboutus);
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
  }, [roomData]);

  const styles = StyleSheet.create({
    modal_view: {
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
      position: "absolute",
      backgroundColor: "#fff",
      borderTopEndRadius: 24,
      borderTopStartRadius: 24,
      elevation: 6,
      shadowColor: COLORS.black,
      shadowOpacity: 5,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowRadius: 3.5,
      paddingBottom: 40,
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
     //marginBottom:50,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,
    },

    removeAlias: {
      height: 50,
      marginTop: 30,
      width: "48%",
      marginHorizontal: "1%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().textColorForNew,
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
      zIndex: 50,
    },
    profile_image: {
      position: "absolute",
      borderRadius: 25,
      left: 20,
      backgroundColor: "lightgray",
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

  const updateuserinfo = () => {
    if (username?.toLowerCase()?.includes("tokee")) {
      // Alert.alert("Alert!", "You can't use 'Tokee' as your name.", [
      //   { text: t("ok") },
      // ]);
      globalThis.errorMessage = "You can't use 'Tokee' as your name.";

      setErrorAlertModel(true);
      return; // Exit early if "toke" is found
    }
    if (username == "" || username == null) {
      globalThis.errorMessage = "Name Field is Required.";

      setErrorAlertModel(true);
      // Alert.alert("Alert!", "Name Field is Required.", [{ text: t("ok") }]);
      // globalThis.errorMessage = "You can't use 'Tokee' as your name.";

      // setErrorAlertModel(true);
      return;
    }
    setConfirmAlertModel(true)
    // Alert.alert(t("confirm"), t("do_you_want_to_update_your_profile"), [
    //   { text: t("cancel") },
    //   { text: t("yes"), onPress: () => editProfileApi() },
    // ]);
    // eslint-disable-next-line
    // changeAliasName(props.data.room, username, aboutus, (res: any) => {
    //   if (res) {
    //     socket.emit("changeAliasName", {
    //       name: username,
    //       image: aboutus,
    //       room: props.data.room,
    //       user: globalThis.chatUserId,
    //     });
    //     setTimeout(() => {
    //       setloaderMoedl(false);
    //     }, 200);
    //     props.onRequestClose();
    //   } else {
    //     setloaderMoedl(false);
    //   }
    // });
  };

  const uploaddata = new FormData();
  uploaddata.append("first_name", username != null ? username : "");
  uploaddata.append("tagline", aboutus != null ? aboutus : "");

  const editProfileApi = () => {
    // console.log("uploaddata>>>>", uploaddata);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    // setloaderMoedl(true);
    /////////////////////// ********** Internet Permission   ********** ////////////////////
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        // Alert.alert(t("noInternet"), t("please_check_internet"), [
        //   { text: t("ok") },
        // ]);
        setNoInternetModel(true)

        setloaderMoedl(false);
        return;
      } else {
        PostApiCall(
          update_profile,
          uploaddata,
          headers,
          props.navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    // Custom logic to execute on success
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      // setloaderMoedl(false);

      globalThis.errorMessage = ErrorStr;
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      setErrorAlertModel(true);
    } else {
      globalThis.displayName = ResponseData.data.first_name;
      globalThis.successMessage = ResponseData.message;
      props.setUserDisplayName(ResponseData.data.first_name);
      props.setUserTagline(ResponseData.data.tagline);
      await AsyncStorage.setItem("userName", ResponseData.data.first_name);
      /// await AsyncStorage.getItem("userName");
      // Alert.alert(t("success"), ResponseData.message, [
      //   {
      //     text: t("ok"),
      //     onPress: () => {
      //       props.cancel(), props.navigation.navigate("BottomBar");
      //     },
      //   },
      // ]);
      setloaderMoedl(false);
      setSuccessAlertModel(true)
    }
  };

  const charLimit = globalThis.isUserPremium
    ? Number(globalThis.bioCharacterLimitsForPremiumUsers)
    : Number(globalThis.bioCharacterLimitsForFreeUsers);

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
       <ConfirmAlertModel
        visible={confirmAlertModel}
        onRequestClose={() => setConfirmAlertModel(false)}
        confirmText={t("do_you_want_to_update_your_profile")}
        cancel={() => setConfirmAlertModel(false)}
        confirmButton={() =>{ setConfirmAlertModel(false),editProfileApi()}}
      />
       <SuccessModel
        visible={successAlertModel}
        onRequestClose={() => setSuccessAlertModel(false)}
        succesText={globalThis.successMessage}
        doneButton={() => {setSuccessAlertModel(false),props.navigation.navigate("BottomBar")}}
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
      <View style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}>
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
        <TouchableOpacity
          style={[styles.cancel_button]}
          onPress={() => {
            props.cancel();
          }}
        >
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
          style={{ flexDirection: "row", marginTop: 50, paddingHorizontal: 20 }}
        >
          <Text
            style={{
              color: COLORS.black,
              fontSize: 15,
              fontFamily: font.semibold(),
            }}
          >
            {t("Name")}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 0,
            marginHorizontal: 20,
            borderBottomColor: "grey",
            borderBottomWidth: 0.2,
          }}
        >
          <TextInput
            style={styles.nameInputText}
            maxLength={30}
            placeholder={"eg. Joon Koong"}
            defaultValue={username}
            onChangeText={(text) => setusername(text)}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

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
            {t("Bio")}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 0,
            marginHorizontal: 20,
            borderBottomColor: "grey",
            borderBottomWidth: 0.2,
          }}
        >
          <TextInput
            style={styles.nameInputText}
            maxLength={charLimit ? charLimit : 75}
            placeholder={t("Enter bio")}
            defaultValue={aboutus}
            multiline={true}
            onChangeText={(text) => {
              // Store the current length of the text
              const previousLength = aboutus?.length || 0;
            
              // If the user is not premium and is adding more text beyond the charLimit
              if (!globalThis.isUserPremium && text.length > charLimit && text.length > previousLength) {
                console.log("yessss moreee text");
                text = text.slice(0, charLimit); // Prevent more characters from being added
              }
            
              // Show alert only when the text reaches exactly charLimit
              if (text.length === charLimit && text.length > previousLength) {
                if (!globalThis.isUserPremium) {
                  console.log("Alert should be shown");
                  props.setShowBio(true);
                  props.cancel();
                  props.setShowPremiumAlert(true);
                }
              }
            
              // Update the state with the new text
              setaboutus(text);
            }}
            
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
        <Text
          style={{
            alignSelf: "flex-end",
            marginTop: 5,
            fontSize: 14,
            color: COLORS.black,
            fontFamily: font.bold(),
            marginHorizontal: 20,
          }}
        >
          {t("characters_left")}:{" "}
          {charLimit - aboutus?.length || 0} / {charLimit}
        </Text>

        <View
          style={{ flexDirection: "row", marginTop: 0, marginHorizontal: 20 }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if(!globalThis.isUserPremium && aboutus?.length > charLimit){
                  props.setShowBio(true);
                  props.cancel();
                  props.setShowPremiumAlert(true);
              }
              else{
                updateuserinfo();
              }
              
            }}
          >
            <Text style={styles.buttonText}>{t("Save")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
