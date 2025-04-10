import axios from "axios";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
//@ts-ignore
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { showToast } from "../../Components/CustomToast/Action";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import {
  addMemberApi,
  chatBaseUrl,
  getGlobalGroup,
  getGlobalGroupV2,
  getRoomMembersApi,
} from "../../Constant/Api";
import { EncryptionKey } from "../../Constant/Key";
import { chatTop } from "../../Navigation/Icons";
import { socket } from "../../socket";
import { getPublicRoomCount, newMessageInsertList } from "../../sqliteStore";
import { LoaderModel } from "../Modals/LoaderModel";
import { useDispatch } from "react-redux";
import {
  setMainprovider,
  setisLock,
  setisnewArchiveroom,
  setisnewBlock,
  setisnewmMute,
  setnewroomID,
  setnewroomType,
  setroominfo,
  setyesstart,
} from "../../Redux/ChatHistory";
import renderIf from "../../Components/renderIf";
import SearchBarSubmit from "../../Components/SearchBar/SearchBarSubmit";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";

var skip = 0;
var limit = 10;

export default function AllPublicGroup({ navigation }: any) {
  const dispatch = useDispatch();
  const [loaderModel, setloaderModel] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const isDarkMode = true;
  const windowWidth = Dimensions.get("window").width;
  const [searchValue, setSearchValue] = useState("");
  const [apiData, setApiData] = useState([]);

  const [loader, setLoader] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

  useEffect(() => {
    skip = 0;
    setloaderModel(true);
    getGroup(searchValue);
  }, []);

  let cancelTokenSource;
  const getGroup = async (str: any) => {
    if (str == "") {
      //   setloaderModel(true);
    }
    setLoader(true);

    if (cancelTokenSource) {
      cancelTokenSource.cancel("Operation canceled due to new request.");
    }

    // Create a new CancelToken source
    cancelTokenSource = axios.CancelToken.source();
    //
    const urlStr =
      //@ts-ignore
      chatBaseUrl +
      getGlobalGroupV2 +
      str +
      "&userId=" + //@ts-ignore
      globalThis.chatUserId +
      "&all=" +
      true +
      "&limit=" +
      limit +
      "&skip=" +
      skip;

    try {
      await axios({
        method: "get",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cancelToken: cancelTokenSource.token,
      })
        .then((response) => {
          if (response.data.status == true) {
            if (response.data.data.length > 0) {
              if (skip == 0) {
                setApiData([]);
                let updatedArray = response.data.data.map((obj: any) => ({
                  ...obj,
                  roomType: "multiple",
                }));
                setApiData(updatedArray);
              } else {
                let updatedArray = response.data.data.map((obj: any) => ({
                  ...obj,
                  roomType: "multiple",
                })); //@ts-ignore
                setApiData((prevData) => [...prevData, ...updatedArray]);
              }
            } else {
              setHasMore(false);
              if (skip == 0 && response.data.data.length == 0) {
                setApiData([]);
              }
            }

            //  setApiData(updatedArray);
            setloaderModel(false);
            setLoader(false);
          }
        })
        .catch((error) => {
          setloaderModel(false);
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          }
          setLoader(false);

          setloaderModel(false);
          if (error.response.status == 401) {
            showToast("Session Expired.");
            //@ts-ignore
            globalThis.token = "";
            navigation.navigate("LoginScreen");
          }
          setloaderModel(false);
          setLoader(false);
        });
    } catch (error) {
      setloaderModel(false);
    }
  };

  function clearInput() {
    setSearchValue("");
    skip = 0;
    setHasMore(true);
    getGroup("");
  }

  const searchDataSubmit = (text: string) => {
    if (text == "") {
      skip = 0;
      setHasMore(true);
      getGroup("");
    } else {
      if (text.length > 0) {
        skip = 0;
        setApiData([]);
        setHasMore(true);
        setloaderModel(true);
        getGroup(text);
      }
    }
  };

  const searchableData = (text: string) => {
    setSearchValue(text);
  };

  const MessageHistory = (item: any) => {
    if (item.isLock == 1) {
    } else {
      dispatch(
        setMainprovider({
          userImage: item?.image || item?.roomImage,
          userName: item?.name || item?.roomName,
          room: item,
          roomType: item.roomType,
          friendId: item.friendId,
          lastMessageId: item.lastMessageId,
          isBlock: item.isUserExitedFromGroup,
          userId: item.friendId,
          isLock: item.isLock,
          isFromPublicPage: true,
        })
      );

      dispatch(setyesstart(true));
      dispatch(setnewroomID(item?.roomId?._id));
      dispatch(setnewroomType(item.roomType));
      dispatch(
        setroominfo({
          roomImage: item?.image || item?.roomImage,
          roomName: item?.name || item?.roomName,
          aliasName: item?.name || item?.roomName,
          aliasImage: item?.image || item?.roomImage,
        })
      );

      dispatch(setisnewBlock(false));
      dispatch(setisnewmMute(item.isNotificationAllowed));
      dispatch(setisnewArchiveroom(item.archive));
      dispatch(setisLock(item.isLock));

      navigation.navigate("ChattingScreen", {
        userImage: item?.image || item?.roomImage,
        userName: item?.name || item?.roomName,
        aliasName: item?.name || item?.roomName,
        aliasImage: item?.image || item?.roomImage,
        room: item,
        roomType: item.roomType,
        friendId: item.friendId,
        lastMessageId: item.lastMessageId,
        isBlock: item.isUserExitedFromGroup,
        inside: true,
        screenFrom: "chatScreen",
        isLock: item.isLock,
        shouldJoinPublicGroup: false,
        isFromPublicPage: true,
        isPublic: item.isPublic || 1,
      });
    }
  };

  const JoinPublicGroup = async (item: any, index: number) => {
    getPublicRoomCount(async (publicRoomCount)=> {
      if(publicRoomCount>50)
        {
         setShowPremiumAlert(true);
          console.log("countttttttt",publicRoomCount)
        }else{

          setLoadingStates((prevLoadingStates) => ({
            ...prevLoadingStates,
            [item._id]: true, // assuming item has an id, replace with the unique identifier of your item
          }));
          setLoading(true);
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          const bodydata = JSON.stringify({
            //@ts-ignore
            userId: globalThis.userChatId,
            roomId: item.roomId._id, //@ts-ignore
            members: [globalThis.userChatId],
            operation: "ADD",
          });
          const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: bodydata,
          };
          const response = await fetch(chatBaseUrl + addMemberApi, requestOptions);
          const data = await response.json();
      
          if (data.status === true) {
            try {
              const mId = Math.floor(Math.random() * 9000) + 1000;
              const messageSend = CryptoJS.AES.encrypt(
                //@ts-ignore
                `${globalThis.displayName} joined the group.`,
                EncryptionKey
              ).toString();
      
              dispatch(setisnewBlock(false));
      
              const paramsOfSendforlive = {
                mId: mId,
                //@ts-ignore
                userName: globalThis.displayName, //@ts-ignore
                phoneNumber: globalThis.phone_number, //@ts-ignore
                currentUserPhoneNumber: globalThis.phone_number,
                //@ts-ignore
                userImage: globalThis.image,
                roomId: item.roomId._id,
                roomName: item.name,
                roomImage: item.image,
                roomType: "multiple",
                //@ts-ignore
                roomOwnerId: globalThis.userChatId,
                message: messageSend,
                message_type: "notify",
                roomMembers: [],
                parent_message_id: "",
                attachment: [],
                //@ts-ignore
                from: globalThis.userChatId,
                resId: Date.now(),
                createdAt: new Date(),
              };
              console.log("join public",{
                roomId: item.roomId._id, //@ts-ignore
                chat_user_id: globalThis.chatUserId, //@ts-ignore
                contact_name: globalThis.displayName, //@ts-ignore
                profile_image: globalThis.image,
                isAdmin: 0,
                // membersIds: data.data.members.map((m: any) => m.user), //@ts-ignore
                membersIds: item.membersId.members.map((m: any) => m.user._id),
                phone_number: globalThis.phone_number,
              })
      
              socket.emit("joinGroup", {
                roomId: item.roomId._id, //@ts-ignore
                chat_user_id: globalThis.chatUserId, //@ts-ignore
                contact_name: globalThis.displayName, //@ts-ignore
                profile_image: globalThis.image,
                isAdmin: 0,
                // membersIds: data.data.members.map((m: any) => m.user), //@ts-ignore
                membersIds: item.membersId.members.map((m: any) => m.user._id),
                phone_number: globalThis.phone_number,
              });
      
              //@ts-ignore
              socket.emit("joinRoom", {
                roomId: item.roomId._id, //@ts-ignore
                userId: globalThis.userChatId,
              });
      
              let createGroup = {
                roomId: item.roomId._id,
                roomName: item.name,
                roomImage: item.image,
                roomType: "multiple",
                friendId: "", //@ts-ignore
                fromUser: globalThis.userChatId,
                isPublic: 1,
                owner: item.owner,
                allow: item.allow,
              };
      
              newMessageInsertList(createGroup, false, "0");
              socket.emit("sendmessage", paramsOfSendforlive);
      
              const getRoomMembersUrl =
                chatBaseUrl + getRoomMembersApi + "?roomId=" + item.roomId._id;
      
              MessageHistory(item);
              setLoading(false);
            } catch (err) {}
          } else {
            setLoading(false);
            // throw new Error("Failed to Delete Chat");
          }

        }

      
    });


  };

  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 50,
      zIndex: 1001,
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: DeviceInfo.isTablet() ? 20 : 20,
      marginTop: DeviceInfo.isTablet() ? 30 : 15,
      paddingBottom: 5,
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
    loader: {
      paddingVertical: 20,
      borderTopWidth: 1,
      borderColor: "#CED0CE",
    },
  });

  const OverlappingImages = ({ members, members_length }: any) => {
    const displayedMembers = members.slice(0, 4);
    const remainingCount = members_length - 4;
    return (
      <View
        style={{
          height: 50,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginLeft:
            members.length === 1
              ? 5
              : members.length === 2
              ? 10
              : members.length === 3
              ? 30
              : 40,
        }}
      >
        {displayedMembers.map((member: any, index: any) => (
          <Image
            key={index}
            source={{
              uri:
                member?.user?.image == null
                  ? "https://wokii.io/backend/public/images/user-avatar.png"
                  : member?.user?.image,
            }}
            style={{
              height: 30,
              width: 30,
              borderRadius: 15,
              left: index * -10, // Adjust the left position to create overlap
            }}
            resizeMode="cover"
          />
        ))}
        {remainingCount > 0 && (
          <View
            style={[
              {
                left: displayedMembers.length * -10,
                height: 30,
                width: 30,
                borderRadius: 15,
                backgroundColor: themeModule().theme_background,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text
              style={{
                color: iconTheme().iconColor,
                fontFamily: font.medium(),
              }}
            >
              +{remainingCount > 99 ? "99" : remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const loadData = async () => {
    if (!hasMore && loader) return;
    if (apiData.length > 6) {
      skip = skip + limit;
      setLoader(true);
      getGroup(searchValue);
    }
  };


  let premiumAlertHeading = "You can join maximum of 50 Public Groups.";
  let  premiumAlertSubHeading = "You cannot join any more at this time.";
   let premiumAlertFirstButtonText = "Ok";
  let  premiumAlertSecondButtonText = "Go To Premium";
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <LoaderModel visible={loaderModel} />
      <PremiumAlert
          visible={showPremiumAlert}
          onRequestClose={() => setShowPremiumAlert(false)}
          cancel={() => setShowPremiumAlert(false)}
          Heading={premiumAlertHeading}
          SubHeading={premiumAlertSubHeading}
          FirstButton={premiumAlertFirstButtonText}
          SecondButton={premiumAlertSecondButtonText}
          firstButtonClick={()=>setShowPremiumAlert(false)}
          secondButtonClick={()=>navigation.navigate("TokeePremium")}
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
          title={t("public_groups")}
          navState={navigation}
          checked={
            //@ts-ignore
            globalThis.selectTheme
          }
        />

        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity
              onPress={() => navigation.pop()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {
          //@ts-ignore
          globalThis.selectTheme === "christmas" || //@ts-ignore
          globalThis.selectTheme === "newYear" || //@ts-ignore
          globalThis.selectTheme === "newYearTheme" || //@ts-ignore
          globalThis.selectTheme === "mongoliaTheme" || //@ts-ignore
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
              }}
            ></ImageBackground>
          ) : null
        }

        <View style={styles.chatContainer}>
          <View style={{paddingBottom:15}}>
          <SearchBarSubmit
            search={searchableData}
            value={searchValue}
            clickCross={clearInput}
            placeHolder={t("search_group")}
            searchsubmit={searchDataSubmit}
          />
          </View>
          {apiData.length == 0 && !loaderModel && (
            <View>
              <Text style={{ textAlign: "center", marginTop: 100 }}>
                No Groups Found
              </Text>
            </View>
          )}
          <View style={{ backgroundColor: "#fff" }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={apiData}
              onEndReached={loadData}
              onEndReachedThreshold={0.5}
              numColumns={2}
              renderItem={({ item, index }: any) => (
                <View
                  style={{
                    width: "48%",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 225,
                    borderRadius: 8,
                    marginRight: 10,
                    marginTop: 50,
                    borderWidth: 0.8,
                    borderColor: iconTheme().iconColor,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: iconTheme().iconColor,

                      borderRadius: 35,
                      height: 70,
                      width: 70,
                      top: -35,
                      justifyContent: "center",
                      alignItems: "center",
                      position: "absolute",
                    }}
                  >
                    <Image
                      source={{ uri: item?.image }}
                      style={{
                        height: 70,
                        width: 70,
                        borderRadius: 35,
                        borderWidth: 0.8,
                        borderColor: iconTheme().iconColor,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  {/* Render the properties of the item object */}
                  <Text
                    numberOfLines={1}
                    style={{
                      marginTop: 28,
                      height: 20,
                      textAlign: "center",
                      marginHorizontal: 10,
                      fontFamily: font.semibold(),
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      height: 40,
                      textAlign: "center",
                      marginHorizontal: 5,
                      fontFamily: font.regular(),
                      color: COLORS.black,
                    }}
                    numberOfLines={2}
                  >
                    {item.roomId.bio === null
                      ? t("this_is_a_public_group ")
                      : item.roomId.bio}
                  </Text>
                  <OverlappingImages
                    members={item?.membersId?.members}
                    members_length={item?.membersId?.membersCount}
                  />

                  <Text style={{ marginTop: 8, fontFamily: font.regular() }}>
                    {item?.membersId?.membersCount == 0
                      ? "1 " + t("member")
                      : item?.membersId?.membersCount == 1
                      ? item?.membersId?.membersCount + " " + t("member")
                      : item?.membersId?.membersCount + " " + t("members")}
                  </Text>
                  {/* Render other properties as needed */}

                  {
                    //@ts-ignore
                    loadingStates[item._id] && isLoading == true ? (
                      <ActivityIndicator
                        size="small"
                        color={iconTheme().iconColor}
                      />
                    ) : (
                      <TouchableOpacity
                        style={{
                          height: 35,
                          marginTop: 5,
                          width: 100,
                          borderRadius: 5,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: iconTheme().iconColor,
                        }}
                        onPress={() => JoinPublicGroup(item, index)}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            alignItems: "center",
                            justifyContent: "center",
                            color: COLORS.white,
                            fontFamily: font.bold(),
                          }}
                        >
                          {" "}
                          {t("join")}
                        </Text>
                      </TouchableOpacity>
                    )
                  }
                </View>
              )}
              ListFooterComponent={() => {
                return (
                  <View
                    style={{
                      height: Platform.OS == "ios" ? 480 : 650,
                      marginBottom: 100,
                    }}
                  >
                    {renderIf(
                      hasMore && apiData.length > 0,
                      <ActivityIndicator
                        animating={loader}
                        size="large"
                      ></ActivityIndicator>
                    )}
                  </View>
                );
              }}
            />
          </View>
        </View>
      </View>
    </MainComponent>
  );
}
