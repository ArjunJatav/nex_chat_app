import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
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
import SearchBar from "../../../Components/SearchBar/SearchBar";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import TopBar from "../../../Components/TopBar/TopBar";
import { chatTop } from "../../../Navigation/Icons";
import axios from "axios";
import {chatBaseUrl, getChannels, get_by_ChatId, get_by_User_allposts } from "../../../Constant/Api";
import { UpdateProfileImage, addMembersToChannelRoomMembersSql, getMembersFromChannelRoomMembersSql, getMyChannelInfo, insertToChannelRoomMembersSql } from "../../../sqliteStore";
import { useDispatch, useSelector } from "react-redux";
import { RefreshControl } from "react-native";
import { setChannelSliceData, setProfileData } from "../../../Redux/MessageSlice";
import { PostApiCall } from "../../../Components/ApiServices/PostApi";
import { setStorylist } from "../../../reducers/friendListSlice";
import CustomBottomSheetModal from "../../../Components/CustomBottomSheetModal";
import { setMainprovider, setisnewArchiveroom, setisnewBlock, setisnewmMute, setnewroomType, setroominfo, setyesstart } from "../../../Redux/ChatHistory";
import { LoaderModel } from "../../Modals/LoaderModel";
import { ChannelTypeModal } from "../../Modals/ChannelTypeModal";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";
const isDarkMode = true;
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const data: any[] | (() => any[]) = [];
export default function ChannelMembers({ navigation, route }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const [products, setProducts] = React.useState(data);
  const [originalProducts, setoriginalProducts] = React.useState(data);
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [isChannelTypeModal, setChannelTypeModal] = useState(false);
  const dispatch = useDispatch();
  const limit = 90000000000;
  const bottomSheetRef = useRef(null); //@ts-ignore
  const handlePresentModalPress = useCallback(() => {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    bottomSheetRef.current?.present(), [];
  });
  const [errorAlertModel, setErrorAlertModel] = useState(false);

  const publicSelected = true;
  const channelInfo = useSelector(
    // eslint-disable-next-line
    (state: any) => state?.message?.channelObj
  );

  // **********   Method for Navigation ********** ///
  const buttonPress = () => {
    navigation.pop();
  };

  useEffect(() => {
    if (route?.params?.channelId) {
      getMembersFromChannelRoomMembersSql(
        route?.params?.channelId,
        limit,
        0,
        (res, totalCount) => {
          console.log("alllllll mbemberssss", res, totalCount);
          setProducts(res);
          setoriginalProducts(res);
          if (res.length == 0) {
            fetchMembers(route?.params?.channelId);
          }
        }
      );
    }
  }, [route?.params?.channelId]);

  const fetchMembers = async (channelId) => {
    // console.log("uyrllllll",`${chatBaseUrl}/api/channel/members/${channelId}/${globalThis.chatUserId}`)
    try {
      const response = await axios({
        method: "get",
        url: `${chatBaseUrl}/api/channel/members/${channelId}/${globalThis.chatUserId}`,
        headers: {
          "Content-Type": "application/json",
          api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
        },
      });

      if (response.data.status) {
        insertToChannelRoomMembersSql(
          response?.data?.data?.members,
          channelId,
          () => {
            console.log("yessssss");
          }
        );
        console.log("Response:", response?.data?.data?.members);
        setProducts(response?.data?.data?.members);
        setoriginalProducts(response?.data?.data?.members);
      } else {
        console.log("Request was not successful.");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  // **********    Method for Selected List   ********** ///
  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: 20,
    },
    newGroupText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
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
    noDataText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.black,
      fontSize: 15,
      fontFamily: font.bold(),
    },
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    newChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      borderColor: "#fff",
      borderRadius: 15,
    },
    ChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
      borderColor: "#fff",
      borderRadius: 15,
    },
    newChatIcon: {
      height: 10,
      width: 10,
      tintColor: iconTheme().iconColor,
    },
    newCallIcon: {
      height: 22,
      width: 22,
      tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginRight: 10,
    },
    searchfIcon: {
      height: 20,
      width: 20,
      tintColor: "#CD98D1",
    },
    newChatText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: font.bold(),
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

    profile1Container: {
      paddingVertical: Platform.OS == "ios" ? 10 : 5,
      flexDirection: "row",
      // height: 60,
      borderBottomWidth: 1,
      borderBottomColor: "#EAEAEA",
    },
    profile1Container2: {
      marginTop: 10,
      flexDirection: "row",
      height: 70,
      justifyContent: "flex-start",
    },
    Container: {
      justifyContent: "center",
      width: "15%",
    },
    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    nameInviteContainer: {
      justifyContent: "center",
      margin: 0,
      width: "65%",
      flexDirection: "column",
    },
    editProfile: {
      marginLeft: 10,
      flexDirection: "row",
      width: "20%",
      justifyContent: "center",
      alignItems: "center",
    },
    name1conText: {
      marginBottom: 0,
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.semibold(),
      color: COLORS.black,
      paddingLeft: 10,
      height: DeviceInfo.isTablet() ? 30 : 24,
    },
    name2conText: {
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.regular(),
      color: COLORS.black,
      paddingLeft: 10,
      height: DeviceInfo.isTablet() ? 30 : 24,
    },
    searchIcon: {
      borderRadius: 20,
      borderWidth: 1,
      marginLeft: 10,
      height: 45,
      justifyContent: "center",
      alignItems: "center",
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
    searchText: {
      borderRadius: 20,
      alignItems: "flex-start",
      borderColor: "transparent",
      justifyContent: "center",
      width: "90%",
    },
    NoDataContainer: {
      height: windowHeight - 250,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    noCalls: {
      color: COLORS.black,
      fontSize: 18,
      fontFamily: font.bold(),
    },
  });

  //**********    Method for Searchable Data from list    ********** ///
  const searchableData = (text: string) => {
    setSearchValue(text);

    if (text !== "") {
      const filteredProducts = originalProducts.filter((product) =>
        product.name.toLowerCase().includes(text.toLowerCase())
      );
      setProducts(filteredProducts);
    } else {
      // When the search text is cleared, reset to the original product list
      setProducts(originalProducts);
    }
  };

  function clearInput() {
    setSearchValue("");
    searchableData("");
  }


  const getAllPostByuser = (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      globalThis.errorMessage =ErrorStr;
      setErrorAlertModel(true);
    } else {
  
      dispatch(setStorylist(ResponseData.data));
    }
  };

  const getapiSuccess = (
    // eslint-disable-next-line
    ResponseData: any,
    // eslint-disable-next-line
    ErrorStr: any,
    // eslint-disable-next-line
    username: any,
    // eslint-disable-next-line
    userimage: any
  ) => {
    if (ErrorStr) {
      // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
      globalThis.errorMessage =ErrorStr;
      setErrorAlertModel(true);
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
          profile_image: ResponseData?.data?.user?.profile_image,
          userProfile: ResponseData?.data?.user?.profile_image,
        })
      );

      UpdateProfileImage(
        ResponseData?.data?.user?.chat_user_id,
        ResponseData?.data?.user?.profile_image,
        // eslint-disable-next-line
        (res: any) => {
          if (res) {
            //   console.log("profile image updated");
          } else {
            console.log("can't update profile iamge");
          }
        }
      );
      handlePresentModalPress();
      setloaderMoedl(false);
    }
  };

  const getProfileApi = async (chatid: any, username: any, userimage: any) => {
    return new Promise((resolve, reject) => {
      dispatch(
        setProfileData({
          Image_text: "",
          sticker_position: "",
          display_name: username,
          profile_image: userimage,
          chat_user_id: chatid,
          userProfile: userimage,
        })
      );
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + globalThis.Authtoken,
        localization: globalThis.selectLanguage,
      };
      const data = {
        chat_user_id: chatid,
      };

      PostApiCall(
        get_by_ChatId,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          if (ErrorStr) {
            reject(ErrorStr);
          } else {
            getapiSuccess(ResponseData, ErrorStr, username, userimage);
            resolve(ResponseData);
          }
        }
      );
    });
  };

  const AllPostsListApi = async (chatid: any) => {
    return new Promise((resolve, reject) => {
      dispatch(
        setProfileData({
          Image_text: "",
          sticker_position: "",
          chat_user_id: chatid,
        })
      );
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + globalThis.Authtoken,
        localization: globalThis.selectLanguage,
      };
      const data = {
        chat_user_id: chatid,
      };

      PostApiCall(
        get_by_User_allposts,
        data,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          if (ErrorStr) {
            reject(ErrorStr);
          } else {
            getAllPostByuser(ResponseData, ErrorStr);
            resolve(ResponseData);
          }
        }
      );
    });
  };

  const AllChaneelListApi = async (chatid: any) => {
    if(chatid == globalThis.chatUserId){
      getMyChannelInfo((channels, count) => {
        const reversedData = channels.reverse();
        console.log("reversedData",reversedData)
        dispatch(setChannelSliceData(reversedData))
      });
    }
    else{
      const urlStr = chatBaseUrl + getChannels + "?userId=" + chatid;

      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          url: urlStr,
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (response.data.status === true) {
              console.log("response.data.data >>>> ", response.data.data);
  
              dispatch(setChannelSliceData(response.data.data));
              resolve(response.data.data);
            } else {
             // Alert.alert(response.data.message);
              globalThis.errorMessage =response.data.message;
              setErrorAlertModel(true);
              reject(response.data.message);
            }
          })
          .catch((error) => {
            console.error("Error in AllChaneelListApi:", error);
            reject(error);
          });
      });
    }
   
  };



  const handleApiCalls = async (chatid: any, username: any, userimage: any) => {
    // console.log("chatidchatid",chatid)
    // setloaderMoedl(true); // Start loader

    try {
      // Use Promise.all to wait for all API calls to complete
      await Promise.all([
        getProfileApi(chatid, username, userimage),
        AllPostsListApi(chatid),
        AllChaneelListApi(chatid),
      ]);
      console.log("All API calls completed successfully.");
    } catch (error) {
      setloaderMoedl(false);
      console.error("Error in one of the API calls:", error);
      // Alert.alert("Error", "An error occurred while fetching data.");
      globalThis.errorMessage ="An error occurred while fetching data.";
      setErrorAlertModel(true);
    } finally {
      setloaderMoedl(false); // Stop loader after all API calls are done
    }
  };

  const newChattingPress = ({
    profileImage,
    contactName,
    chatId,
    FriendNumber,
    isUserPremium,
  }: // eslint-disable-next-line
  any) => {
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

    // console.log("newChattingPress>>>>", FriendNumber);

    navigation.navigate("ChattingScreen", {
      friendId: chatId,
      userName: contactName,
      userImage: profileImage,
      roomType: "single",
      inside: true,
      screenFrom: "Dashboard",
      FriendNumber: FriendNumber,
      isUserPremium: isUserPremium,
    });
  };



  function AfterChoosingChannelType(value) {
    setChannelTypeModal(false);

    if (value == "public") {
    navigation.navigate("NewChannelScreen", { type: "public" });
    } else {
      navigation.navigate("NewChannelScreen", { type: "private" });
    }

    //newGroupPress(value);
  }


  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
        <LoaderModel
          visible={loaderMoedl}
          onRequestClose={() => setloaderMoedl(false)}
          cancel={() => setloaderMoedl(false)}
        />
         <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
      <CustomBottomSheetModal
          ref={bottomSheetRef}
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          navigation={navigation}
          newChattingPress={newChattingPress}
          openChannelModal={()=>{
            setChannelTypeModal(true);
          }}
        />
         <ChannelTypeModal
          visible={isChannelTypeModal}
      isPublicSelected={publicSelected}
          onRequestClose={() => setChannelTypeModal(false)}
          onNextClick={AfterChoosingChannelType}
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
        <TopBar
          showTitleForBack={true}
          title={channelInfo?.channelName}
          checked={
            //@ts-ignore
            globalThis.selectTheme
          }
          backArrow={true}
          navState={navigation}
        />
        {/* // **********    View For Show the Screen Container     ********** /// */}
        <View style={styles.chatTopContainer}>
          {/* <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("Back")} </Text>
            </TouchableOpacity>

          </View> */}
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
        {/* // **********    View For SearchBar     ********** /// */}
        <SearchBar
          search={searchableData}
          value={searchValue}
          clickCross={clearInput}
          placeHolder={t("search")}
        />

        {/* // **********    View for FlatList      ********** /// */}
        <View style={{ marginBottom: 20, height: windowHeight }}>
          <Text
            style={{
              fontSize: DeviceInfo.isTablet() ? 18 : 20,
              fontFamily: font.semibold(),
              color: COLORS.black,
              marginVertical: 10,
            }}
          >
            {t("subscribers")}
          </Text>
          <ScrollView nestedScrollEnabled={true}>
            <FlatList
              data={products}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    fetchMembers(route?.params?.channelId);
                  }}
                />
              }
              ListHeaderComponent={() => (
                <TouchableOpacity
                  style={[
                    styles.profile1Container,
                    { marginBottom:0 },
                  ]}
                  onPress={() => {
                    setloaderMoedl(true);
                    handleApiCalls(
                      globalThis.chatUserId,
                      globalThis.userName,
                      globalThis.userImage
                    );
                  }}
                >
                  <View style={styles.Container}>
                    <Image
                      source={{ uri: globalThis.userImage }}
                      style={styles.circleImageLayout}
                      resizeMode="cover"
                    />
                  </View>

                  {/* // **********   View for Name and Cintect number Show    ********** /// */}
                  <View style={styles.nameInviteContainer}>
                    <Text style={styles.name1conText}>You ({t("owner")})</Text>
                  </View>
                </TouchableOpacity>
              )}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.profile1Container,
                    { marginBottom: index == products.length - 1 ? 500 : 0 },
                  ]}
                  onPress={() => {
                    // console.log("item",item)
                    setloaderMoedl(true);
                    handleApiCalls(
                      item?.userId || item?._id,
                      item?.name,
                      item?.image
                    );
                  }}
                >
                  <View style={styles.Container} key={index}>
                    <Image
                      source={{ uri: item.image || "https://tokeecorp.com/backend/public/images/user-avatar.png" }}
                      style={styles.circleImageLayout}
                      resizeMode="cover"
                    />
                  </View>

                  {/* // **********   View for Name and Cintect number Show    ********** /// */}
                  <View style={styles.nameInviteContainer}>
                    <Text style={styles.name1conText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.NoDataContainer}>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={styles.noCalls}>{t("No_subscribers_yet")}</Text>
                    {/* <Text style={styles.noDataText}>
                    {t("allVideoAndAudioCallDisplay")}
                  </Text> */}
                  </View>
                </View>
              )}
            />
          </ScrollView>
        </View>
      </View>
    </MainComponent>
  );
}
