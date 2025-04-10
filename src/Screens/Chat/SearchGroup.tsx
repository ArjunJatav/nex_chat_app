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
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import { useDispatch, useSelector } from "react-redux";
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
import renderIf from "../../Components/renderIf";
import {
  addMemberApi,
  chatBaseUrl,
  getGlobalGroupV2,
} from "../../Constant/Api";
import { EncryptionKey } from "../../Constant/Key";
import { chatTop } from "../../Navigation/Icons";
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
import { socket } from "../../socket";
import { getPublicRoomCount, newMessageInsertList, searchRooms } from "../../sqliteStore";
import { LoaderModel } from "../Modals/LoaderModel";
import SearchBarSubmit from "../../Components/SearchBar/SearchBarSubmit";
import PremiumAlert from "../../Components/CustomAlert/PremiumAlert";

 // eslint-disable-next-line
export default function SearchGroup({ navigation }: any) {
  const isDarkMode = true;
  const [seeTrending, setSeeTrending] = useState(true);
  const [loaderModel, setloaderModel] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [searchValue, setSearchValue] = useState("");
  const [localData, setLocalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const dispatch = useDispatch();
  const [isUIUpdated, setIsUIUpdated] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);



  //console.log("publicroomcount",publicroomcount); setShowPremiumAlert
  
  useEffect(() => {
    setloaderModel(true);
     // eslint-disable-next-line
    searchRooms("", (data: any) => {
      setLocalData(data);
      getGroup("");
    });
  }, []);

  let cancelTokenSource;

   // eslint-disable-next-line
  const getGroup = async (str: any) => {
    if (str == "") {
      setloaderModel(true);
    }

    if (cancelTokenSource) {
      cancelTokenSource.cancel("Operation canceled due to new request.");
    }

    // Create a new CancelToken source
    cancelTokenSource = axios.CancelToken.source();
    //
    const urlStr =
      chatBaseUrl + getGlobalGroupV2 + str + "&userId=" + globalThis.chatUserId;

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
       // eslint-disable-next-line
        .then((response: any) => {
          if (response.data.status == true) {
            if (str == "") {
               // eslint-disable-next-line
              const updatedArrayy = response.data.data.map((obj: any) => ({
                ...obj,
                shouldJoinPublicGroup: true,
                roomType: "multiple",
              }));
              setFilteredData(updatedArrayy);
              setloaderModel(false);
            } else {
              const filteredLocalData = localData.filter(
                 // eslint-disable-next-line
                (item: any) =>
                  item &&
                  item.roomName &&
                  item.roomName.toLowerCase().includes(str.toLowerCase())
              );
               // eslint-disable-next-line
              const updatedArray = filteredLocalData.map((obj: any) => ({
                ...obj,
                shouldJoinPublicGroup: false,
                //  roomType: "single",
              }));
              const filteredLocalData1 = localData.filter(
                 // eslint-disable-next-line
                (item: any) =>
                  item &&
                  item.name &&
                  item.name.toLowerCase().includes(str.toLowerCase())
              );

               // eslint-disable-next-line
              const updatedArray1 = filteredLocalData1.map((obj: any) => ({
                ...obj,
                shouldJoinPublicGroup: false,
                roomType: "single",
              }));

               // eslint-disable-next-line
              const updatedArray2 = response.data.data.map((obj: any) => ({
                ...obj,
                shouldJoinPublicGroup: true,
                roomType: "multiple",
              }));

              const finalArray = [
                ...updatedArray,
                ...updatedArray1,
                ...updatedArray2,
              ];
              setFilteredData([]);
               // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              setFilteredData(finalArray);
              setSeeTrending(false);
              setloaderModel(false);
              setIsUIUpdated(!isUIUpdated);
            }
          }
        })
        .catch((error) => {
          setloaderModel(false);
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          }

          setloaderModel(false);
          if (error.response.status == 401) {
            showToast("Session Expired.");
            globalThis.token = "";
            navigation.navigate("LoginScreen");
          }

          setloaderModel(false);
        });
    } catch (error) {
      setloaderModel(false);
    }
  };

  function clearInput() {
    setFilteredData([]);
    setSeeTrending(true);
    setSearchValue("");
    getGroup("");
  }

   // eslint-disable-next-line
  const MessageHistory = (item: any) => {
    console.log("itemitemitemitem",item)
    if (item.isLock == 1) {
      // setPinModalVisible(true);
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
      dispatch(
        setnewroomID(item?.roomId?._id ? item.roomId._id : item?.roomId)
      );
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

  const styles = StyleSheet.create({
    chatTopContainer: {
      paddingBottom: 50,
      zIndex: 1001,
    },
    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    nameInviteContainer: {
      justifyContent: "center",

      // width: "65%",
      flexDirection: "column",
    },
    chatContainer: {
      backgroundColor: "#fff",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      marginBottom: 60,
    },
    profile1Container: {
      marginTop: 0,
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
    },
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: DeviceInfo.isTablet() ? 20 : 20,
      marginTop: DeviceInfo.isTablet() ? 30 : 15,
      paddingBottom: 5,
    },
    Container: {
      justifyContent: "center",
      width: "15%",
    },
    name1conText: {
      marginBottom: 0,
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.semibold(),
      color: COLORS.black,
      paddingLeft: 25,
      height: DeviceInfo.isTablet() ? 30 : 24,
      lineHeight: DeviceInfo.isTablet() ? 30 : 24,
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
  });

  const searchDataSubmit = (text: string) => {
    if (text == "") {
      // If search query is empty, show local data
      setSeeTrending(true);
      setFilteredData([]);
      getGroup("");
      setSearchValue("");
    } else {
      if (text.length > 1) {
        // If search query is not empty, filter both local and API data
        setFilteredData([]);
        getGroup(text);
      }
    }
  };

  const searchableData = (text: string) => {
    setSearchValue(text);


  };

   // eslint-disable-next-line
  const JoinPublicGroup = async (item: any,) => {
    getPublicRoomCount(async (publicRoomCount)=> {
      if(publicRoomCount>50)
      {
        setShowPremiumAlert(true);
        

      }else{
        console.log("item.owner : ", item);
        setLoadingStates((prevLoadingStates) => ({
          ...prevLoadingStates,
          [item._id]: true, // assuming item has an id, replace with the unique identifier of your item
        }));
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const bodydata = JSON.stringify({
          userId: globalThis.userChatId,
          roomId: item.roomId._id, 
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
              `${globalThis.displayName} joined the group.`,
              EncryptionKey
            ).toString();
    
            dispatch(setisnewBlock(false));
    
            const paramsOfSendforlive = {
              mId: mId,
              userName: globalThis.displayName,
              phoneNumber: globalThis.phone_number, 
              currentUserPhoneNumber: globalThis.phone_number,
              userImage: globalThis.image,
              roomId: item.roomId._id,
              roomName: item.name,
              roomImage: item.image,
              roomType: "multiple",
              roomOwnerId: globalThis.userChatId,
              message: messageSend,
              message_type: "notify",
              roomMembers: [],
              parent_message_id: "",
              attachment: [],
              from: globalThis.userChatId,
              resId: Date.now(),
              createdAt: new Date(),
            };
            console.log("join public",{
              roomId: item.roomId._id, 
              chat_user_id: globalThis.chatUserId, 
              contact_name: globalThis.displayName, 
              profile_image: globalThis.image,
              isAdmin: 0,
               // eslint-disable-next-line
              membersIds: item.membersId.members.map((m: any) => m.user._id), 
              phone_number: globalThis.phone_number,
            })
            socket.emit("joinGroup", {
              roomId: item.roomId._id, 
              chat_user_id: globalThis.chatUserId, 
              contact_name: globalThis.displayName, 
              profile_image: globalThis.image,
              isAdmin: 0,
               // eslint-disable-next-line
              membersIds: item.membersId.members.map((m: any) => m.user._id), 
              phone_number: globalThis.phone_number,
            });
            socket.emit("joinRoom", {
              roomId: item.roomId._id,
              userId: globalThis.userChatId,
            });
    
            const createGroup = {
              roomId: item.roomId._id,
              roomName: item.name,
              roomImage: item.image,
              roomType: "multiple",
              friendId: "", 
              fromUser: globalThis.userChatId,
              isPublic: 1,
              owner: item.owner,
              allow: item.allow,
            };
            newMessageInsertList(createGroup, false, "0");
            socket.emit("sendmessage", paramsOfSendforlive);
            MessageHistory(item);
            // setFilteredData((prevData) => {
            //   const newData = [...prevData];
            //  
            //   newData[index].shouldJoinPublicGroup = false;
            //   return newData;
            // });
          } catch (err) {
            alert(err)
          }
        } else {
          // throw new Error("Failed to Delete Chat");
        }
      }
    });
    return ;
    
  };


  const OverlappingImages = ({ members, item }: any) => {
    const displayedMembers = members.slice(0, 4);
    const remainingCount = item?.membersId?.membersCount - 4;
    return (
      <View
        style={{
          height: 40,
          marginTop: 3,
          //  backgroundColor:"green",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          marginLeft: 25,
        }}
      >
        {
           // eslint-disable-next-line
        displayedMembers.map((member: any, index: any) => (
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
              style={{ color: iconTheme().iconColor, fontFamily: font.bold() }}
            >
              +{remainingCount > 99 ? 99 : remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
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
          title={t("search")}
          navState={navigation}
          checked={
            globalThis.selectTheme
          }
        />

        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity
              onPress={() => {
                setFilteredData([]);
                navigation.pop();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {
          globalThis.selectTheme === "christmas" || 
          globalThis.selectTheme === "newYear" || 
          globalThis.selectTheme === "newYearTheme" || 
          globalThis.selectTheme === "mongoliaTheme" || 
          globalThis.selectTheme === "mexicoTheme" || 
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
      </View>
      <View style={styles.chatContainer}>
        <View style={{paddingBottom:15}}>
          <SearchBarSubmit
            search={searchableData}
            value={searchValue}
            clickCross={clearInput}
            placeHolder={t("search_contact_and_grop")}
            searchsubmit={searchDataSubmit}
            /// t("search")
          />
        </View>

        <FlatList
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {renderIf(
                seeTrending == true,

                <View
                  style={{
                    backgroundColor: "#F8F8F8",
                    width: "100%",
                    height: 40,
                    flexDirection: "row",
                    // marginTop: 10,
                    paddingHorizontal:5
                  }}
                >
                  <View
                    style={{
                      width: "50%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontSize: 15,
                        fontFamily: font.semibold(),
                      }}
                    >
                      {t("Trending")}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: "50%",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontFamily: font.semibold(),
                        fontSize: 15,
                      }}
                      onPress={() => navigation.navigate("AllPublicGroup")}
                    >
                      {t("Show_All")}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          showsVerticalScrollIndicator={false}
          data={filteredData}
          nestedScrollEnabled={true}
          scrollEnabled={true}
           // eslint-disable-next-line
          renderItem={({ item, index }: any) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.profile1Container,

                {
                  // height: "auto",
                  maxHeight: DeviceInfo.hasNotch() ? null : windowHeight - 190,
                  marginBottom: index == filteredData.length - 1 ? 500 : 0,
                  width: windowWidth,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#dbdbdb",
                  paddingVertical: 8,
                },
              ]}
              onPress={() =>
                item.shouldJoinPublicGroup == true ? null : MessageHistory(item)
              }
            >
              <View style={[styles.Container, {}]} key={index}>
                <Image
                  source={{ uri: item?.image || item?.roomImage }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 10,
                    borderWidth: 0.8,
                    borderColor: iconTheme().iconColor,
                  }}
                  resizeMode="cover"
                />
              </View>

              <View
                style={
                  (styles.nameInviteContainer,
                  {
                    width:
                      item.shouldJoinPublicGroup == true
                        ? windowWidth - 180
                        : windowWidth - 180,
                    //  backgroundColor:"green",
                    paddingLeft: 10,
                  })
                }
              >
                <Text
                  style={[styles.name1conText, { marginRight: 0 }]}
                  numberOfLines={1}
                >
                  {item?.name || item?.roomName}
                </Text>
                {console.log("item>>>>>",item)}
                {renderIf(
                  item?.roomType == "multiple",
                  <Text
                  style={[styles.name1conText, { marginRight: 10 }]}
                  numberOfLines={1}
                >
                  {item?.bio == null && item?.shouldJoinPublicGroup == true ?  t("this_is_a_public_group ") : item?.bio}
                </Text>
                )}
                {renderIf(
                  item?.roomType == "single",
                  <Text
                    style={[styles.name1conText, { marginRight: 10 }]}
                    numberOfLines={1}
                  >
                    {item?.tagline == null
                      ? "Hey there, I am using Tokee."
                      : item?.tagline}
                  </Text>
                )}

                {renderIf(
                  item.shouldJoinPublicGroup == true,
                  <OverlappingImages
                    members={item?.membersId?.members}
                    item={item}
                  />
                )}
              </View>
              {renderIf(
                item.shouldJoinPublicGroup == true,
                <View
                  style={{
                    width: 90,
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {
                    loadingStates[item._id] ? (
                      <ActivityIndicator
                        size="small"
                        color={iconTheme().iconColor}
                      />
                    ) : (
                      <TouchableOpacity
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                        onPress={() => JoinPublicGroup(item, index)}
                        style={{
                          width: 85,
                          // height:40,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: iconTheme().iconColor,
                          padding: 8,
                          // marginTop:3,
                          // marginLeft: 5,

                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontFamily: font.bold(),
                        }}
                      >
                      
                       {t("join")}
                      </Text>
                    </TouchableOpacity>
                  )
                }
                {item.shouldJoinPublicGroup && (
                  <View
                    style={{
                      marginBottom: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: font.medium(),
                        fontSize: 12,
                        flexShrink: 1,
                        flexWrap: "wrap",
                        color: COLORS.black,
                        width: 90,
                      }}
                    >
                      {item?.membersId?.membersCount == 0
                        ? "1 " + t("member")
                        : item?.membersId?.membersCount == 1
                        ? item?.membersId?.membersCount + " " + t("member")
                        : item?.membersId?.membersCount + " " + t("members")}
                    </Text>
                  </View>
                )}
              </View>
              )}
            </TouchableOpacity>
          )}
        />

        {filteredData.length == 0 && !loaderModel && (
          <View>
            <Text style={{ textAlign: "center", marginTop: 100 }}>
             {t("no_group_or_contact_found ")}
            </Text>
          </View>
        )}
      </View>
    </MainComponent>
  );
}
