import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import React, { forwardRef, useMemo, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import { TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { LoaderModel } from "../Screens/Modals/LoaderModel";
import { onCallPress, stopSound } from "../utils/callKitCustom";
import { CheckIsRoomBlocked } from "../sqliteStore";
import { useFocusEffect } from "@react-navigation/native";
import { iconTheme } from "./Colors/Colors";
import FastImage from "react-native-fast-image";
import { setBottomSheetStory } from "../reducers/friendListSlice";
import ExpendableScreen from "./SlideButton/ExpendableScreen";
import { Base_Url, sendfriendrequest } from "../Constant/Api";
import axios from "axios";
export type Ref = BottomSheetModal;

const CustomBottomSheetModal = forwardRef<Ref>(
  ({ navigation, newChattingPress, fromScreen}: any, ref) => {
    const [isRoomBlocked, setIsRoomBlocked] = React.useState(true);
    const [reportModal, setReportModal] = React.useState(false);
    const [reason, setReason] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [coverImageLoad, setCoverImageLoad] = React.useState(false);

    const dispatch = useDispatch();
    const profileData = useSelector(
      (state: any) => state?.message?.profileData
    );
    const callState = useSelector(
      (state: any) => state?.VoipReducer?.call_state
    );

    const bottomsheetFrom = useSelector(
      (state) => state?.friendListSlice.bottomSheetStory
    );

    const snapPoints = useMemo(() => ["100%"], []);

    const [isFriendalready,setisFriendalready] = useState(false)
    const [sendrequestloading,setsendrequestloading] = useState(false)
    const [requestsent,setRequestsent] = useState(false)

    React.useEffect(() => {
      if (callState.state != "outgoing") {
        stopSound();
      }
    }, [callState.state]);

    // React.useEffect(() => {

    // }, []);
console.log(fromScreen);


    const checkIsFriendAlready = async() => {
      const allFriendsfromstorage = await AsyncStorage.getItem(
        "tokeeContactListTemp"
      );

      if(allFriendsfromstorage){
        const allFriendsfromstorageparsedata = JSON.parse(
          //@ts-ignore
          allFriendsfromstorage
        );

        if(allFriendsfromstorageparsedata && allFriendsfromstorageparsedata?.length){
          const exists = allFriendsfromstorageparsedata?.some(item => item.chat_user_id === profileData?.chat_user_id);
          setisFriendalready(exists);
          console.log("allFriendsfromstorage",exists)
        }
      }
    };


    const SendFriendRequest = async() => {
      setsendrequestloading(true)
      console.log("profileData?.id",profileData?.id)
      // return
      const url = Base_Url + sendfriendrequest;
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
          data: {
            request_user_id: profileData?.id,
          },
        })
          .then((response) => {
            console.log("response",response)
            if (response.data.status == true) {
              setsendrequestloading(false)
              setRequestsent(true)
            } else {
              setsendrequestloading(false)
            }
          })
          .catch((error) => {
            console.log("error",error)
            setsendrequestloading(false)
          });
      } catch (error) {
        console.log("error",error)
        setsendrequestloading(false)
      }
    }

    useFocusEffect(
      React.useCallback(() => {
        checkIsFriendAlready()
        const userid = profileData?.chat_user_id;
        if (userid) {
          CheckIsRoomBlocked(userid, (isBlocked: any) => {
            setIsRoomBlocked(isBlocked);
          });
        }
      }, [profileData])
    );

    const messagePress = () => {
      console.log("hjdhjdsh");
      ref.current.close();
      newChattingPress({
        profileImage: profileData?.profile_image,
        contactName: profileData?.display_name,
        chatId: profileData?.chat_user_id, // Modify according to your data structure
        FriendNumber: profileData?.phone_number || "", // Modify according to your data structure
      });
    };



      // eslint-disable-next-line
   const postsViewScreen = () => {
    ref?.current?.close();
    navigation.navigate("FriendStoryViewScreen", {
      userId: profileData?.chat_user_id,
      userImage: profileData?.profile_image,
      userName:  profileData?.display_name ||  profileData?.first_name,
      fromScreen:"BottomSheet",
    });
  };
   const myAllPostsViewScreen = () => {
    ref?.current?.close();
    navigation.navigate("MyStatusViewScreen", { index: 0 ,fromScreen :fromScreen, userId: profileData?.chat_user_id,});
  };

    /////////////////////////////////////////////////////////////////

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleComponent={null}
        onDismiss={() => {
          bottomsheetFrom == "open from story"
            ? dispatch(setBottomSheetStory("close for story"))
            : null;
        }}
      >
        <StatusBar translucent backgroundColor="transparent" />
        <FastImage
          style={{ flex: 1 }}
          source={{ uri: profileData?.cover_image }}
          onLoadStart={() => {
            setCoverImageLoad(true);
          }}
          onLoadEnd={() => {
            setCoverImageLoad(false);
          }}
        >
          {coverImageLoad == true && (
            <View
              style={{ justifyContent: "center", alignSelf: "center", flex: 1 }}
            >
              <ActivityIndicator
                animating={true}
                color={iconTheme().iconColor}
                size={"large"}
              />
            </View>
          )}

          <Modal
            transparent
            visible={reportModal}
            supportedOrientations={["portrait", "landscape"]}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                  overflow: "hidden",
                  padding: 12,
                  width: "90%",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 8,
                    opacity: 0.9,
                  }}
                >
                  {"Report User?"}
                </Text>
                <Text
                  style={{
                    opacity: 0.8,
                    fontSize: 14,
                  }}
                >
                  This message will be forwarded to Tokee(Admin).
                </Text>
                <TextInput
                  maxLength={150}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(text) => setReason(text)}
                  value={reason}
                  style={{
                    borderWidth: 1,
                    borderColor: "#000000",
                    marginTop: 10,
                    padding: 6,
                    fontSize: 14,
                    height: 80,
                    borderRadius: 5,
                  }}
                  multiline={true}
                  placeholder="Reason for reporting"
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <TouchableOpacity
                    style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                  >
                    <Text style={{}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: "#7FD25A",
                      borderRadius: 4,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: "white" }}>{"Report"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <LoaderModel visible={loading} />
          </Modal>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",

              position: "absolute",
              top: 50,
              width: "100%",
              paddingHorizontal: 10,
              zIndex: 999,
            }}
          >
            <TouchableOpacity //@ts-ignore
              onPress={() => {
                bottomsheetFrom == "open from story"
                  ? dispatch(setBottomSheetStory("close for story"))
                  : null;
                ref.current.close();
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 35,
                width: 35,
                backgroundColor: "rgba(0,0,0,0.8)",
                borderRadius: 5,
              }}
            >
              <Image
                source={require("../Assets/Icons/Cross.png")}
                style={{ height: 20, width: 20, tintColor: "#fff" }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={{ zIndex: 100, flex: 1 }}>
            <ExpendableScreen
              messagePress={() => messagePress()}
              audeoCallPress={() =>
                onCallPress({
                  call_type: "audio",
                  contact_image: profileData?.profile_image
                    ? profileData?.profile_image
                    : profileData.roomimage,
                  contact_name: profileData?.name
                    ? profileData?.name
                    : profileData?.display_name,
                  contact_chat_id: profileData?.chat_user_id,
                  contact_id: profileData?.id,
                })
              }
              videoCallPress={() =>
                onCallPress({
                  call_type: "video",
                  contact_image: profileData?.profile_image
                    ? profileData?.profile_image
                    : profileData.roomimage,
                  contact_name: profileData?.name
                    ? profileData?.name
                    : profileData?.display_name,
                  contact_chat_id: profileData?.chat_user_id,
                  contact_id: profileData?.id,
                })
              }
              isRoomBlocked={isRoomBlocked}
              postsViewScreen={fromScreen != "settingScreen" ?postsViewScreen  : myAllPostsViewScreen}
              fromScreen={fromScreen}

            />
          </View>
          {profileData?.sticker_position &&
            profileData?.sticker_position?.map((item: any, index: any) => (
              <Image
                key={index}
                source={{
                  //@ts-ignore
                  uri: item.uri,
                }}
                style={{
                  width: 100,
                  height: 100,
                  // zIndex:0,
                  resizeMode: "stretch",
                  position: "absolute",
                  left: item.position.x,
                  top: item.position.y,
                  transform: [
                    { scale: item.scale == null ? 0 : item.scale },
                    {
                      rotate:
                        item.rotation == null
                          ? `${0}deg`
                          : `${item.rotation}deg`,
                    },
                  ],
                }}
              />
            ))}
          {profileData?.Image_text &&
            profileData?.Image_text?.map((item: any, index: any) => (
              <View
                style={{
                  position: "absolute",
                  left: item.position.x,
                  top: item.position.y,
                  // zIndex: ,
                  transform: [
                    { scale: item.scale == null ? 0 : item.scale },
                    {
                      rotate:
                        item.rotation == null
                          ? `${0}deg`
                          : `${item.rotation}deg`,
                    },
                  ],
                }}
              >
                <Text
                  style={{
                    color: item.color,
                    fontSize: 20,
                    padding: 5,
                    borderRadius: 8,
                  }}
                >
                  {item.text}
                </Text>
              </View>
            ))}
        </FastImage>
      </BottomSheetModal>
    );
  }
);

export default CustomBottomSheetModal;
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  containerHeadline: {
    fontSize: 24,
    fontWeight: "600",
    padding: 20,
  },
  container: {
    flex: 1,
    position: "relative",
  },

  overlay: {
    position: "absolute",
    margin: 10,
    alignSelf: "center",
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999999,
    paddingVertical: 15,
  },
  overlayImage: {
    width: 100,
    height: 100,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "#EFEFEF",
  },
  userDisplayName: {
    color: "#666666",
    marginTop: 4,
    textTransform: "capitalize",
    textAlign: "center",
  },
  scrollContainer: {
    position: "absolute",
    top: 100,
    paddingHorizontal: 15,
    zIndex: 55,
    right: 0,
  },
  textContainer: {
    paddingVertical: 15,
    zIndex: 50,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "800",
    color: "white",
  },
  cameraContainer: {
    position: "absolute",
    bottom: -10,
    right: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "lightgray",
    marginTop: 15,
    paddingHorizontal: "10%",
  },
  buttonBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginRight: 2,
    paddingHorizontal: 10,
  },
  icon: {
    height: 30,
    width: 30,
    tintColor: "#000",
  },
  input: {
    backgroundColor: "transparent",
    color: "white",
    fontSize: 25,
    textAlignVertical: "center",
    zIndex: 30,
  },
  textt: {
    color: "#000",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
  },
});
