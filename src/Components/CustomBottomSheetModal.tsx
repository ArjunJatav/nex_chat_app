import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Alert,
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
import { t } from "i18next";
import { font } from "./Fonts/Font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Base_Url, get_story_count, sendfriendrequest } from "../Constant/Api";
import { setmyrequestdata } from "../Redux/ChatHistory";
import { setBottomSheetStory, setStorylist } from "../reducers/friendListSlice";
import ExpendableScreen from "./SlideButton/ExpendableScreen";
import { GetApiCall } from "./ApiServices/GetApi";
import { StatusType } from "../Screens/Modals/StatusType";
import PremiumAlert from "./CustomAlert/PremiumAlert";
import { setChannelSliceData, setProfileData } from "../Redux/MessageSlice";
import { ChannelTypeModal } from "../Screens/Modals/ChannelTypeModal";
import renderIf from "./renderIf";
import { ErrorAlertModel } from "../Screens/Modals/ErrorAlertModel";
export type Ref = BottomSheetModal;

const CustomBottomSheetModal = forwardRef<Ref>(
  ({ navigation, newChattingPress, fromScreen,openChannelModal }: any, ref) => {
    const [isRoomBlocked, setIsRoomBlocked] = React.useState(true);
    const [reportModal, setReportModal] = React.useState(false);
    const [reason, setReason] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [coverImageLoad, setCoverImageLoad] = React.useState(false);
    const [isStatusModal, setStatusModal] = useState(false);
    const [showPremiumAlert, setShowPremiumAlert] = useState(false);
    const [premiumheading,setpremiumheading] = useState("")
    const [premiumsubheading,setpremiumsubheading] = useState("")
    const [errorAlertModel, setErrorAlertModel] = useState(false);
    const [showAcceptCancelButton, setShowAcceptCancelButtons] =
    React.useState(false);

    const dispatch = useDispatch();
    const profileData = useSelector(
      (state: any) => state?.message?.profileData
    );

    const callState = useSelector(
      (state: any) => state?.VoipReducer?.call_state
    );
    
    const bottomsheetFrom = useSelector(
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      (state) => state?.friendListSlice.bottomSheetStory
    );
    const userPremium = useSelector(
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"

      (state) => state?.friendListSlice.userPremium
    );

    const handleClose = () => {
      if (ref.current) {
        ref.current.close(); // Safely access the `close` method
      } else {
        console.log("BottomSheet ref is null");
      }
    };

    const snapPoints = useMemo(() => ["100%"], []);
    const publicSelected = true;
    const [isFriendalready, setisFriendalready] = useState(false);
    const [sendrequestloading, setsendrequestloading] = useState(false);
    const [requestsent, setRequestsent] = useState(false);
    const myrequestdata = useSelector(
      (state: any) => state.chatHistory.myrequestdata
    );

    const otherrequestdata = useSelector(
      (state: any) => state.chatHistory.otherrequestdata
    );

  

    React.useEffect(() => {
      if (callState.state != "outgoing") {
        stopSound();
      }
    }, [callState.state]);

    // React.useEffect(() => {

    // }, []);

    const checkIsFriendAlready = async () => {
      const allFriendsfromstorage = await AsyncStorage.getItem(
        "tokeeContactListTemp"
      );

      if (allFriendsfromstorage) {
        const allFriendsfromstorageparsedata = JSON.parse(
          //@ts-ignore
          allFriendsfromstorage
        );

        if (
          allFriendsfromstorageparsedata &&
          allFriendsfromstorageparsedata?.length
        ) {
          const exists = allFriendsfromstorageparsedata?.some(
            (item) => item.chat_user_id === profileData?.chat_user_id
          );
          setisFriendalready(exists);
          const existsinpending = myrequestdata?.some(
            (item) => item?.to_user?.id == profileData?.id
          );
          if (existsinpending) {
            setRequestsent(true);
          }
        }

        const existsInOtherRequests = otherrequestdata?.some(
          (item) => item?.from_user?.id === profileData?.id
        );
        if (existsInOtherRequests) {
          setShowAcceptCancelButtons(true);
        } else {
          setShowAcceptCancelButtons(false);
        }
      }else{
        const existsInOtherRequests = otherrequestdata?.some(
          (item) => item?.from_user?.id === profileData?.id
        );
        if (existsInOtherRequests) {
          setShowAcceptCancelButtons(true);
        } else {
          setShowAcceptCancelButtons(false);
        }
      }
    };


  


    const SendFriendRequest = async () => {
      setsendrequestloading(true);
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
            console.log("responsesfdsfdsfdsfsdf", response);
            if (response.data.status == true) {
              setsendrequestloading(false);
              setRequestsent(true);
              const newobject = {
                to_user: {
                  id: profileData?.id,
                },
              };
              const newdataaa = [...myrequestdata, newobject];
              console.log("newdataaa", newdataaa);
              dispatch(setmyrequestdata(newdataaa));
            } else {
              setsendrequestloading(false);
            }
          })
          .catch((error) => {
            console.log("error", error);
            setsendrequestloading(false);
          });
      } catch (error) {
        console.log("error", error);
        setsendrequestloading(false);
      }
    };

    useFocusEffect(
      React.useCallback(() => {
        
        if (profileData) {
          checkIsFriendAlready();
          const userid = profileData?.chat_user_id;
          if (userid) {
            CheckIsRoomBlocked(userid, (isBlocked: any) => {
              setIsRoomBlocked(isBlocked);
            });
          }
        }
      }, [profileData])
    );

    const messagePress = () => {
      console.log("hjdhjdsh",profileData?.premium);
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
       handleClose();
      dispatch(setStorylist([]));
      dispatch(setProfileData({}));
      dispatch(setChannelSliceData([]));
      newChattingPress({
        profileImage: profileData?.profile_image,
        contactName: profileData?.display_name,
        chatId: profileData?.chat_user_id, // Modify according to your data structure
        FriendNumber: profileData?.phone_number || "", // Modify according to your data structure
        isUserPremium:profileData?.premium,
        isDiamonds:profileData?.is_diamonds || 0
      });
    };

    /////////////////////////////////////////////////////////////////

    // eslint-disable-next-line

    const postsViewScreen = (index) => {
      console.log("story index",index)
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
       handleClose();
      dispatch(setStorylist([]));
      dispatch(setProfileData({}));
      dispatch(setChannelSliceData([]));
      navigation.navigate("FriendStoryViewScreen", {
        userId: profileData?.chat_user_id,

        userImage: profileData?.profile_image,

        userName: profileData?.display_name || profileData?.first_name,

        fromScreen: "BottomSheet",
        bottomIndex:index
      });
    };


    const onChannelClick = (item)=>{
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
       handleClose();
      dispatch(setStorylist([]));
      dispatch(setProfileData({}));
      dispatch(setChannelSliceData([]));
      navigation.navigate("ChannelChatting", { channelId: item._id||item.channelId,deepLinking: true })
    }
    const myAllPostsViewScreen = (index) => {
      console.log("index:",index)
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
       handleClose();
      dispatch(setStorylist([]));
      dispatch(setProfileData({}));
      dispatch(setChannelSliceData([]));
      navigation.navigate("MyStatusViewScreen", {
        index: index,
        fromScreen: fromScreen,
        userId: profileData?.chat_user_id,
      });
    };

    // const navigationToAddStory = () => {

    //    handleClose();

    //   navigation.navigate("MyStatusScreen");

    // };


  

    const headers = {
      Accept: "application/json",

      "Content-Type": "application/x-www-form-urlencoded",

      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"

      "Content-Type": "multipart/form-data",

      Authorization: "Bearer " + globalThis.Authtoken,

      localization: globalThis.selectLanguage,
    };

    function navigationToAddStory() {
      GetApiCall(
        get_story_count,

        headers,

        navigation,

        (ResponseData, ErrorStr) => {
          countApiSuccess(ResponseData, ErrorStr);
        }
      );
    }

    // eslint-disable-next-line

    const countApiSuccess = (ResponseData: any, ErrorStr: any) => {
      if (ErrorStr) {
        // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
        globalThis.errorMessage = ErrorStr;
        setErrorAlertModel(true)
        // setloaderMoedl(false);
      } else {
        if (userPremium) {
          setStatusModal(true);
        } else {
          if (
            ResponseData?.data?.total_stories == 30 ||
            ResponseData?.data?.total_stories > 30
          ) {
            setpremiumheading(t("You_can_add_a_maximum_o_stories"))
            setpremiumsubheading(t("Upgrade_to_Premium_for_unlimited_stories"))
            setShowPremiumAlert(true);

            // Alert.alert("Oops!", "You have exceed your stories limit.");
          } else {
            setStatusModal(true);
          }
        }
      }
    };

    // eslint-disable-next-line

    function StatusTypeSelected(value: any) {
      setStatusModal(false);

      if (value == "text") {
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
         handleClose();
        dispatch(setStorylist([]));
        dispatch(setProfileData({}));
        dispatch(setChannelSliceData([]));
        navigation.navigate("AddTextStatusScreen");
      } else {
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
         handleClose();
        dispatch(setStorylist([]));
        dispatch(setProfileData({}));
        dispatch(setChannelSliceData([]));
        navigation.navigate("AddCameraStoryScreen");
      }
    }

    

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

        <StatusType
          visible={isStatusModal}
          onRequestClose={() => setStatusModal(false)}
          onNextClick={StatusTypeSelected}
        />
         <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />

        
     


        <PremiumAlert
          visible={showPremiumAlert}
          onRequestClose={() => setShowPremiumAlert(false)}
          cancel={() => setShowPremiumAlert(false)}
          Heading={premiumheading}
          SubHeading={premiumsubheading}
          FirstButton={"Ok"}
          SecondButton={"Go To Premium"}
          firstButtonClick={() => setShowPremiumAlert(false)}
          secondButtonClick={() => {setShowPremiumAlert(false); setisFriendalready(false);
            setsendrequestloading(false);
            setRequestsent(false);
             // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
             handleClose();
            dispatch(setStorylist([]));
            dispatch(setProfileData({}));
            dispatch(setChannelSliceData([]));
            navigation.navigate("PremiumFeaturesScreen")}}
        />
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
                setisFriendalready(false);
                setsendrequestloading(false);
                setRequestsent(false);
                 // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                 handleClose();
                dispatch(setStorylist([]));
                dispatch(setProfileData({}));
                dispatch(setChannelSliceData([]));
              }}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 35,
                width: 35,
                backgroundColor: "rgba(20, 20, 20, 0.8)",
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
             // channelCreateClick={onChannelClickBack}
              channelCreateClick={()=>{
                handleClose();
                openChannelModal()
               
              }
                
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
              isFriendalready={isFriendalready}
              sendrequestloading={sendrequestloading}
              requestsent={requestsent}
              SendFriendRequest={SendFriendRequest}
              postsViewScreen={
                fromScreen != "settingScreen"
                  ? postsViewScreen
                  : myAllPostsViewScreen
              }
              fromScreen={fromScreen}
              navigationToAddStory={navigationToAddStory}
              setShowPremiumAlert={setShowPremiumAlert}
              setpremiumheading={setpremiumheading}
              setpremiumsubheading={setpremiumsubheading}
              channelClick={onChannelClick}
              showRequestBothButton={showAcceptCancelButton}
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
