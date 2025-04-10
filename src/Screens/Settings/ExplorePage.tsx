import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  FlatList,
  Image,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Modal,
  Animated,
  Alert,
} from "react-native";
import Share from "react-native-share";
import Swiper from 'react-native-deck-swiper';
import MainComponent from "../../Components/MainComponent/MainComponent";
import axios from "axios";

import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
import { useTranslation } from "react-i18next";
import DeviceInfo from "react-native-device-info";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import {
  Base_Url,
  earned_diamonds,
  friend_suggesstion,
  sendfriendrequest,
  update_diamond_purchase,
} from "../../Constant/Api";
import renderIf from "../../Components/renderIf";
import { useDispatch, useSelector } from "react-redux";
import { setmyrequestdata } from "../../Redux/ChatHistory";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { ErrorAlertModel } from "../Modals/ErrorAlertModel";
import { ConfirmAlertModel } from "../Modals/ConfirmAlertModel";
import { DiamondTopupModel } from "../Modals/DiamondTopUpModel";
import { IncompleteProfileModel } from "../Modals/IncompleteProfileMOdel";
const isDarkMode = true;

export default function ExplorePage({ navigation, route }: any) {
  const { t } = useTranslation();
  const [errorAlertModel, setErrorAlertModel] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
  const navigationn = useNavigation();
  const windowHeight = Dimensions.get("window").height;
  const [friendSugesstionData, setFriendSugesstionData] = useState([]);
  const [sendrequestloading, setsendrequestloading] = useState(false);
  const [requestsent, setRequestsent] = useState(false);
  const [clickedItemIndex, setClickedItemIndex] = useState(-1);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false);
  const myrequestdata = useSelector(
    (state: any) => state.chatHistory.myrequestdata
  );
  const [topUpMOdel, setTopUpModel] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dispatch = useDispatch();
  console.log(
    "globalThis.isUserProfileComplete",
    globalThis.isUserProfileComplete
  );

  useEffect(() => {
    const isComplete = globalThis.isUserProfileComplete; // Cache value
    if (isComplete == false || isComplete == 0) {
      globalThis.errorMessage = t("Oops") + ", " + t("Please_complete_profile");
      setErrorAlertModel(true);
    } else if (globalThis.age < 17) {
      globalThis.errorMessage = t("Oops") + ", " + t("not_eligible");
      setShowAgeError(true);
    } else {
     // AllSuggestions();
    }
  }, []);

  const windowWidth = Dimensions.get("window").width;

  function UpdatePurchaseApiCalling(id) {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    const cred =
      globalThis.creditedDiamonds < 10
        ? globalThis.purchasedDiamonds - 10
        : globalThis.creditedDiamonds - 10;
    const data = {
      purchase_diamonds: globalThis.purchasedDiamonds,
      credited_diamonds: cred,
      consumed_diamonds: 10,
      friend_request_id: id,
    };
    console.log("data data::", data);
    PostApiCall(
      update_diamond_purchase,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        if (ResponseData.status == true) {
          globalThis.purchasedDiamonds = ResponseData.data.purchase_diamonds;
          globalThis.creditedDiamonds = ResponseData.data.credited_diamonds;
          globalThis.DiamondBalance =
            ResponseData.data.purchase_diamonds +
            ResponseData.data.credited_diamonds + ResponseData.data.earned_diamonds;
          console.log("update diamond api ::", ResponseData);
        }
        if (ErrorStr) {
          console.log("eror in update purchase api",ErrorStr)
        }
      }
    );
  }

  function ToUpdate(item, index) {
    setSelectedFriend(item);
    setSelectedIndex(index);

    if (globalThis.creditedDiamonds == 0 && globalThis.purchasedDiamonds == 0) {
      setTopUpModel(true);
    } else {
      setConfirmAlertModel(true);
    }
  }
  const SendFriendRequest = async (item, index) => {
    setClickedItemIndex(index);
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
          request_user_id: item?.id,
        },
      })
        .then((response) => {
          console.log("responsesfdsfdsfdsfsdf", response.data.data);
          if (response.data.status == true) {
            setsendrequestloading(false);
            setRequestsent(true);
            const newobject = {
              to_user: {
                id: item?.id,
              },
            };
            const newdataaa = [...myrequestdata, newobject];
            console.log("newdataaa", newdataaa);
            dispatch(setmyrequestdata(newdataaa));
            UpdatePurchaseApiCalling(response.data.data.friend_request_id);
          } else {
            setsendrequestloading(false);
          }
        })
        .catch((error) => {
          console.log("error in catch 1 ", error.response);
          setsendrequestloading(false);
        });
    } catch (error) {
      console.log("error in catch 2", error);
      setsendrequestloading(false);
    }
  };

  // function AllSuggestions() {
  //   console.log("all suggest called", globalThis.Authtoken);
  //   const headers = {
  //     "Content-Type": "application/json",
  //     Accept: "application/json",
  //     Authorization: "Bearer " + globalThis.Authtoken,
  //     localization: globalThis.selectLanguage,
  //   };
  //   GetApiCall(
  //     friend_suggesstion,
  //     headers,
  //     navigation,
  //     (ResponseData, ErrorStr) => {
  //       // setloaderMoedl(false);
  //       console.log(">>>> ====", ResponseData.data);

  //       setFriendSugesstionData(ResponseData.data);
  //       if (ErrorStr) {
  //         console.log("in friend suggestio api erorr ",ErrorStr)
  //       }
  //     }
  //   );
  // }
  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
      // backgroundColor: "#fff",
    },
    container: {
      flex: 1,
      justifyContent: 'center', // Center the Swiper vertically
      alignItems: 'center',     // Center the Swiper horizontally
      backgroundColor: '#f0f0f0',
    },
    card: {
      width: windowWidth - 50,
      height: windowHeight - 250, // Use 60% of the window height for consistency
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
      backgroundColor: '#fff',
      marginTop:-50,
      marginLeft:-10
      // alignItems: 'center',
      // justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '60%', // Adjust image height for better layout
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    cardFooter: {
      height: '30%', // Remaining 20% of the card for footer
      justifyContent: 'center',
      alignItems: 'center',
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
    },
    likeButton: {
      position: 'absolute',
      bottom: 50,
      backgroundColor: '#ff6b6b',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 30,
    },
    likeText: {
      fontSize: 18,
      color: '#fff',
      fontWeight: 'bold',
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    chatContainer: {
      backgroundColor: "#fff",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      marginBottom: 94,
      height: "100%",
    },
  });

  const buttonPress = () => {
    Keyboard.dismiss();
    navigationn.goBack();
  };


  function EarnedApiCalling() {
    console.log("api called")
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };
    const data = {
      diamonds:50
    }
    PostApiCall(
      earned_diamonds,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        if (ResponseData.status == true) {
          globalThis.purchasedDiamonds = ResponseData.data.purchase_diamonds;
          globalThis.creditedDiamonds = ResponseData.data.credited_diamonds;
          globalThis.DiamondBalance =
            ResponseData.data.purchase_diamonds +
            ResponseData.data.credited_diamonds + ResponseData.data.earned_diamonds;
          console.log("update diamond api ::", ResponseData);
        }

        if (ErrorStr) {
          console.log("eror str",ErrorStr)
        }
      }
    );
  }
  const shareToFacebook = async () => {
    const shareOptions = {
      title: "Share via",
      message: "Explore Tokee's new Feature!",
      url:
        Platform.OS === "ios"
          ? "https://apps.apple.com/fj/app/tokee-messenger/id1641356322"
          : "https://play.google.com/store/apps/details?id=com.deucetek.tokee", // Content URL
    };
  
    try {
      console.log("in try")
      const result = await Share.open(shareOptions); // Opens the native share sheet
      EarnedApiCalling();
      console.log("Shared successfully:", result);
    } catch (error) {
      console.log("in catch")
      if (error.message !== 'User did not share') {
        console.error("Error sharing:", error);
      }
    }
  };



 // Handle Like
 const onLike = (index) => {
  Alert.alert('Liked', `${friendSugesstionData[index].first_name} has been liked!`);
};
  const Inviteuser = () => {
    const shareOptions = {
      title: "Title",
      message: "Explore Tokee's new Feature!", 
      subject: "Subject",
      
    };
    Share.share(shareOptions);
  };
  globalThis.confirmText =
    "By Sending request 10 diamonds will be lost from your wallet.";
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <ConfirmAlertModel
        visible={confirmAlertModel}
        onRequestClose={() => setConfirmAlertModel(false)}
        confirmText={globalThis.confirmText}
        cancel={() => setConfirmAlertModel(false)}
        confirmButton={() => {
          setConfirmAlertModel(false);
          SendFriendRequest(selectedFriend, selectedIndex);
        }}
      />

      <IncompleteProfileModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => {
          setErrorAlertModel(false);
          navigation.pop();
        }}
        confirmButton={() => {
          setErrorAlertModel(false);
          navigation.navigate("TokeeMatchOnBoard");
        }}
      />

      <ErrorAlertModel
        visible={showAgeError}
        onRequestClose={() => setShowAgeError(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => {
          setShowAgeError(false);
          navigation.pop();
        }}
      />

      <DiamondTopupModel
        visible={topUpMOdel}
        cancel={() => {
          setTopUpModel(false);
        }}
        errorText={t("You don't have enough diamonds,please top-up")}
        firstText={t("Oops")}
        onRequestClose={() => {
          setTopUpModel(false);
        }}
        confirmButton={() => {
          setTopUpModel(false);
          navigation.navigate("DiamondPurcahse");
        }}
      />
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}
        <TopBar
          showTitle={true}
          shareIcon={true}
          title={t("Explore_Page")}
          checked={globalThis.selectTheme}
          clickShareIcon={shareToFacebook}
        />
        {/* /////////////////////// **********   TopBar Text    ********** //////////////////// */}
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")} </Text>
            </TouchableOpacity>
          </View>
        </View>
        {globalThis.selectTheme === "christmas" ||
        globalThis.selectTheme === "newYear" ||
        globalThis.selectTheme === "newYearTheme" ||
        globalThis.selectTheme === "mongoliaTheme" ||
        globalThis.selectTheme === "indiaTheme" ||
        globalThis.selectTheme === "englandTheme" ||
        globalThis.selectTheme === "americaTheme" ||
        globalThis.selectTheme === "mexicoTheme" ||
        globalThis.selectTheme === "usindepTheme" ? (
          <ImageBackground
            source={settingTop().BackGroundImage}
            resizeMode="cover" // Update the path or use a URL
            style={{
              height: "100%",
              width: windowWidth,
              marginTop: 0,
              position: "absolute",
              bottom: 0,
              zIndex: 0,
              top: chatTop().top,
            }}
          ></ImageBackground>
        ) : null}
      </View>
      <View style={styles.chatContainer}>
      <View style={styles.container}>
      <Swiper
        cards={friendSugesstionData}
        renderCard={(profile,cardIndex) => {
          if (!profile) {
            return (
              <View style={styles.card}>
                <Text>No Profile Found</Text>
              </View>
            );
          }

          return (
            <View style={styles.card}>
              <Image
                source={{ uri: profile.profile_image }}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.cardFooter}>
                <Text style={styles.name}>{profile.first_name || 'Unknown'}</Text>
                <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: 15,
                }}
              >
                {sendrequestloading && cardIndex == clickedItemIndex ? (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: iconTheme().iconColorNew,
                      padding: 8,
                      flexDirection: "row",
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontFamily: font.bold(),
                        marginRight: 5,
                      }}
                    >
                      {t("Sending_Request")}
                    </Text>
                    <ActivityIndicator size="small" color={"#ffff"} />
                  </View>
                ) : (
                  <>
                    {requestsent && cardIndex == clickedItemIndex ? (
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#d3d3d3",
                          padding: 8,
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "#a9a9a9",
                            fontFamily: font.bold(),
                          }}
                        >
                          {t("Friend_Request_Sent")}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          ToUpdate(profile, cardIndex);
                        }}
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: iconTheme().iconColorNew,
                          padding: 8,
                          borderRadius: 5,
                          marginTop: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontFamily: font.bold(),
                          }}
                        >
                          {t("add_friend")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
              </View>
            </View>
          );
        }}
        // onSwipedRight={(cardIndex) => onLike(cardIndex)} // Like when swiped right
        stackSize={3}
        backgroundColor="#f0f0f0"
        cardIndex={0}
      />
    </View>
      </View>
    </MainComponent>
  );
}
