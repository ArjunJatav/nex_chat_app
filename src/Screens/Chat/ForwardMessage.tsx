import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import MainComponent from "../../Components/MainComponent/MainComponent";
import SearchBar from "../../Components/SearchBar/SearchBar";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";
import TopBar from "../../Components/TopBar/TopBar";
import { useTranslation } from "react-i18next";
import Contacts from "react-native-contacts"; 
import CryptoJS from "react-native-crypto-js";
import DeviceInfo from "react-native-device-info";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  iconTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import { get_all_contact, get_by_phone_number } from "../../Constant/Api";
import { EncryptionKey } from "../../Constant/Key";
import { chatTop } from "../../Navigation/Icons";
import { socket } from "../../socket";
import {
  CheckIsRoomsBlockedforfriendlist,
  getRoomIdFromRes,
  insertChatList,
} from "../../sqliteStore";
import { ContactLoaderModel } from "../Modals/ContactLoaderModel";
import ToShowContactName from "../calling/components/ContactShow";

const isDarkMode = true;
const windowWidth = Dimensions.get("window").width;
 // eslint-disable-next-line
const data: any[] | (() => any[]) = [];

 // eslint-disable-next-line
export default function ForwardMessageScreen({ navigation, route }: any) {
  React.useEffect(() => {
     // eslint-disable-next-line
    socket.on("connect_error", (error: any) => {
      socket.connect;
      // Handle the error (e.g., display an error message)
    });
  }, [socket]);

  const { colorTheme } = useContext(ThemeContext);
  const [products, setProducts] = React.useState(data);
  const [searchValue, setSearchValue] = useState("");
  const windowHeight = Dimensions.get("window").height;

  const { t } = useTranslation();
  const [conatctLoaderModel, setContactLoaderModel] = useState(true);

  // **********   Method for Navigation ********** ///
  const buttonPress = () => {
    navigation.pop();
  };

  // **********   Headers for api ********** ///
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + globalThis.Authtoken, 
    localization: globalThis.selectLanguage,
  };

  useEffect(() => {
    getContactUploadStatus();
  }, []);

  const getContactUploadStatus = async () => {
    setContactLoaderModel(true);
    const Status = await AsyncStorage.getItem("isContactUploaded");
    if (Status == null) {
      requestContactsPermission();
    } else {
      setContactLoaderModel(false);
      getContactAllList();
    }
  };

  const getContactAllList = async () => {
    // Retrieve from AsyncStorage
    const storedTokeeContactListTempString = await AsyncStorage.getItem(
      "tokeeContactListTemp"
    );


    // Convert JSON string back to array
    const storedTokeeContactListTemp = JSON.parse(
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      storedTokeeContactListTempString
    );
    // Update the state with retrieved values
    if (storedTokeeContactListTemp !== null) {
      
       // eslint-disable-next-line
      const modifiedProducts: any = (storedTokeeContactListTemp || []).map(
         // eslint-disable-next-line
        (item: any) => ({
          ...item,
          type: "user",
        })
      );

      // Use setProducts to update the state with the modified array
       // eslint-disable-next-line
      CheckIsRoomsBlockedforfriendlist(modifiedProducts, (data: any) => {
        setProducts(data);
      });
    }

    await AsyncStorage.setItem(
      "tokeeContactListTemp",
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      JSON.stringify(tokeeContactListTemp)
    );
    
    await AsyncStorage.setItem(
      "contactListTemp",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      JSON.stringify(contactListTemp)
    );
  };

  // **********   Getting contact List from Device ********** ///
  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: "Contacts",
          message: "This app would like to view your contacts.",
          buttonPositive: "Please accept bare mortal",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const uniquePhoneNumbers = new Set();
        Contacts.getAll()
          .then((contacts) => {
            setContactLoaderModel(true);
           
            const contactArr = [];
            contacts.forEach((item) => {
              item.phoneNumbers.forEach((contactPhone) => {
                const phoneNumber = contactPhone.number;
                // Check if the phone number is not in the Set, and if not, add it to the array and the Set
                if (!uniquePhoneNumbers.has(phoneNumber)) {
                  uniquePhoneNumbers.add(phoneNumber);
                  const trimNumber = phoneNumber.toString();
                  const result = trimNumber.replace(/[()\- *#]/g, "");
                  const contactDict = {
                    country_code: "",
                    phone_number: result,
                    contact_name: ToShowContactName(item),
                  };
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  contactArr.push(contactDict);
                }
              });
            });

            const data = {
              
              user_contacts: JSON.stringify(contactArr),
            };

            PostApiCall(
              get_by_phone_number,
              data,
              headers,
              navigation,
              (ResponseData, ErrorStr) => {
                apiSuccess(ResponseData, ErrorStr);
              }
            );
          })
          .catch(() => {
            setContactLoaderModel(false);
          });
      } else {
        setContactLoaderModel(true);
        const uniquePhoneNumbers = new Set();
        Contacts.getAll().then((contacts) => {
         
          const contactArr = [];
          contacts.forEach((item) => {
            item.phoneNumbers.forEach((contactPhone) => {
              const phoneNumber = contactPhone.number;
              // Check if the phone number is not in the Set, and if not, add it to the array and the Set
              if (!uniquePhoneNumbers.has(phoneNumber)) {
                uniquePhoneNumbers.add(phoneNumber);
                const trimNumber = phoneNumber.toString();
                const result = trimNumber.replace(/[()\- *#]/g, "");

                const contactDict = {
                  country_code: "",
                  phone_number: result,
                  contact_name: ToShowContactName(item),
                };
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                contactArr.push(contactDict);
              }
            });
          });
          const data = {
           
            user_contacts: JSON.stringify(contactArr),
          };

          PostApiCall(
            get_by_phone_number,
            data,
            headers,
            navigation,
            (ResponseData, ErrorStr) => {
              apiSuccess(ResponseData, ErrorStr);
            }
          );
        });
      }
    } catch (error) {
      setContactLoaderModel(false);
    }
  };

  // **********  Method for return the api Response   ********** ///
   // eslint-disable-next-line
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setContactLoaderModel(false);
    } else {
      GetApiCall(
        get_all_contact,
        headers,
        navigation,
        (ResponseData, ErrorStr) => {
          GetContactApiSuccess(ResponseData, ErrorStr);
        }
      );
    }
  };

   // eslint-disable-next-line
  const GetContactApiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setContactLoaderModel(false);
    } else {
      await AsyncStorage.setItem("isContactUploaded", "true");
     
      const tokeeContactListTemp = [];
     
      const contactListTemp = [];

      
      ResponseData.data.forEach((element) => {
        if (element.is_register == true) {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          tokeeContactListTemp.push(element);
        } else {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          contactListTemp.push(element);
        }
      });
      
       // eslint-disable-next-line
      const modifiedProducts: any = (tokeeContactListTemp || []).map(
        (item) => ({
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          ...item,
          type: "user",
        })
      );
     
      CheckIsRoomsBlockedforfriendlist(modifiedProducts, (data) => {
        setProducts(data);
      });
      setContactLoaderModel(false);
     
      const tokeeContactListTempString = JSON.stringify(tokeeContactListTemp);
      
      const contactListTempString = JSON.stringify(contactListTemp);
      await AsyncStorage.setItem(
        "tokeeContactListTemp",
        tokeeContactListTempString
      );
      await AsyncStorage.setItem("contactListTemp", contactListTempString);
      setContactLoaderModel(false);
    }
  };

  // **********    Method for Navigation with Selected Data send to another screen   ********** ///
  const buttonPress2 = () => {
    if (selected.length > 0) {
      handleButtonPress();
    } else {
      Alert.alert("Member is  Requried !", "Please Select atleast 1 member.");
    }
  };

  // **********    Method for Select the Data from the list   ********** ///
   // eslint-disable-next-line
  const handleChange = (contact_name: any) => {
    const temp = products.map((product) => {
     
      if (contact_name === product.contact_name) {
        return { ...product, isChecked: !product.isChecked };
      }
      return product;
    });
     // eslint-disable-next-line
    CheckIsRoomsBlockedforfriendlist(temp, (data: any) => {
      setProducts(data);
    });
  };

  // **********    Method for Selected List   ********** ///
  const selected = products.filter((product) => product.isChecked);
  const chatMessageTime = Date.now();
  const handleButtonPress = async () => {
    const myMessage = CryptoJS.AES.encrypt(
      route.params.rcvmsg.text,
      EncryptionKey
    ).toString();
    const paramsOfSend = {
      
      fromUser: globalThis.userChatId, 
      userName: globalThis.displayName, 
      currentUserPhoneNumber: globalThis.phone_number,
      message: myMessage,
      message_type: route.params.rcvmsg?.messageType,
      localPath:route.params.rcvmsg?.localPaths,
      attachment: route.params.rcvmsg.attachment,
      isBroadcastMessage: false,
      isDeletedForAll: false,
      parent_message: {}, 
      
      isForwarded:
       
        route.params.rcvmsg.user?._id == globalThis.userChatId ? false : true,
      storyId: "",
      isStoryRemoved: false,
      resId: chatMessageTime,
      broadcastMessageId: "",
      seenCount: 0,
      deliveredCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };


   
    // Get details of checked users
    // Log or use the details as needed
    const newArray = selected.map((d) => ({
      id: d._id || d.chat_user_id,
      type: d.type,
      mId: 0,
      roomId: d.roomId || "",
      phoneNumber: d.phone_number,
    }));

    const outArr = await Promise.all(
      newArray.map(async (member) => {
        const obj = {};

        const mId = Math.floor(Math.random() * 9000) + 1000;
       
        obj["mId"] = mId; 
        obj["id"] = member.id; 
        obj["type"] = member.type; 
        obj["phoneNumber"] = member.phoneNumber;

        if (!member.roomId) {
          
          getRoomIdFromRes(
            String(member.phoneNumber), 
            String(globalThis.phone_number), 
            (res) => {
              if (!res) {
                // Room Not Found!
               null;
              } else {
                // Room Found!
                obj["roomId"] = res.roomId;
                insertChatList({
                  paramsOfSend: {
                    ...paramsOfSend,
                    mId: mId,
                    roomId: res.roomId,
                  },
                  // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  chatRoom: false,
                });
              }
            }
          );
        } else {
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          obj["roomId"] = res.roomId;
          insertChatList({
            paramsOfSend: { ...paramsOfSend, mId: mId, roomId: member.roomId },
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            chatRoom: false,
          });
        }
        return obj;
      })
    );
    console.log("sending in emit of forward msg",{
      sender_id: globalThis.userChatId,
      message_ids: [route.params.messageId],
      forward_details: outArr,
      resId: chatMessageTime, 
      userName: globalThis.displayName,
    })
    const params = {
      sender_id: globalThis.userChatId,
      message_ids: [route.params.messageId],
      forward_details: outArr,
      resId: chatMessageTime, 
      userName: globalThis.displayName,
    };
    socket.emit("forwardMessage", params);
    navigation.pop(1);
  };

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: 20,
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
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },
    NoDataContainer: {
      marginTop: 100,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
    },
    nameText: {
      fontSize: 12,
      fontFamily: font.bold(),
      color: COLORS.black,
      marginBottom: 5,
    },
    profile1Container: {
      marginTop: 10,
      flexDirection: "row",
      height: 60,
      borderBottomWidth: 0.5,
      borderBottomColor: "#F6EBF3",
    },
    profile1Container2: {
      marginTop: 10,
      flexDirection: "row",
      height: 70,
    },
    nameContainer: {
      marginLeft: 20,
      justifyContent: "center",
      margin: 0,
      marginBottom: 10,
      width: "50%",
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
  });

  //**********    Method for Searchable Data from list    ********** ///
  const searchableData = (text: string) => {
    setSearchValue(text);
    if (text !== "") {
      const filter = products.filter((x) =>
        x.contact_name.toLowerCase().includes(text.toLowerCase())
      );
       // eslint-disable-next-line
      CheckIsRoomsBlockedforfriendlist(filter, (data: any) => {
        setProducts(data);
      });
    } else {
      getContactAllList();
    }
  };

  function clearInput() {
    setSearchValue("");
    searchableData("");
  }
  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        <ContactLoaderModel visible={conatctLoaderModel} />
        {/* // **********    View For Show the StatusBar    ********** /// */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        {/* // **********    View For Show the TopBar    ********** /// */}
        <TopBar
          showTitle={true}
          title={""}
          checked={
            globalThis.selectTheme
          }
        />

        {/* // **********    View For Show the Screen Container     ********** /// */}
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            {/* // **********    View For Cancel Button     ********** /// */}
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>

            {/* // **********    View For Next Button     ********** /// */}
            <TouchableOpacity
              onPress={() => buttonPress2()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("done")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* // **********    TopBar   ********** /// */}

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
        {/* // **********    View For SearchBar     ********** /// */}
        <SearchBar
          search={searchableData}
          value={searchValue}
          clickCross={clearInput}
          placeHolder= {t("search")}  
        />

        <View style={{ marginBottom: 10 }}>
          {/* // **********    FlatList for Show the Selected Data     ********** /// */}

          <FlatList
            horizontal
            data={selected}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.profile1Container2]}
                onPress={() => handleChange(item.contact_name)}
              >
                <View style={{ paddingHorizontal: 10, width: 80 }} key={index}>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: 10,
                      zIndex: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      height: 20,
                      width: 20,
                      borderRadius: 50,
                      backgroundColor: COLORS.light_pink,
                    }}
                    onPress={() => handleChange(item.contact_name)}
                  >
                    <Image
                      source={require("../../Assets/Icons/Cross.png")}
                      style={styles.newChatIcon}
                    />
                  </TouchableOpacity>
                  <Image
                    source={
                      item.profile_image
                        ? 
                          { uri: item.profile_image }
                        : require("../../Assets/Image/girl_profile.png")
                    }
                    style={styles.circleImageLayout}
                    resizeMode="cover"
                  />

                  <Text numberOfLines={1}>
                    {
                      item.contact_name
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* // **********    View for FlatList      ********** /// */}
        <View style={{ marginBottom: 10, height: windowHeight }}>
          <ScrollView nestedScrollEnabled={true}>
            <FlatList
              data={products}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.profile1Container,
                    {
                      marginBottom: index == products.length - 1 ? 500 : 0,
                      opacity: item.isBlocked ? 0.2 : 1,
                    },
                  ]}
                  disabled={item.isBlocked}
                  onPress={() => {
                    handleChange(item.contact_name);
                  }}
                >
                  <View style={styles.Container} key={index}>
                    <Image
                      source={
                        item.profile_image
                          ? { uri: item.profile_image }
                          : require("../../Assets/Image/girl_profile.png")
                      }
                      style={styles.circleImageLayout}
                      resizeMode="cover"
                    />
                  </View>

                  {/* // **********   View for Name and Cintect number Show    ********** /// */}
                  <View style={styles.nameInviteContainer}>
                    <Text style={styles.name1conText}>{item.contact_name}</Text>
                    <Text style={styles.name2conText}>{item.phone_number}</Text>
                  </View>

                  {/* // **********   View for RedioButton    ********** /// */}
                  <View style={styles.editProfile}>
                    <View
                      style={{
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor: item.isChecked ? "green" : "grey",
                        padding: 2,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: item.isChecked ? "green" : "white",
                          borderColor: item.isChecked ? "grey" : "red",
                          borderRadius: 25,
                          height: 20,
                          width: 20,
                        }}
                      ></View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        </View>
      </View>

    
    </MainComponent>
  );
}
