import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  Text,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import "../../Assets/Language/i18n";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { textTheme } from "../../Components/Colors/Colors";
import {
  Base_Url,
  alldataapiV3,
  chatBaseUrl,
  check_force_update,
  getTwilioSettings,
  uploadContacts,
} from "../../Constant/Api";
import { splashBackgroundImage } from "../../Navigation/Icons";
import {
  addColumnIfNotExists,
  backupChatData,
  clearChatRooms,
  createTableUser,
  getUnseenMessageCount,
  insertContact,
  insertContactIOS,
  insertDataFromCSVToTable,
  insertDataIntoTables,
  insertRoomSql,
  updateUnseenMessageCount,
} from "../../sqliteStore";
import Contacts from "react-native-contacts";
import { font } from "../../Components/Fonts/Font";
import BackgroundTimer from "react-native-background-timer";
import RNFetchBlob from "rn-fetch-blob";
import ToShowContactName from "../calling/components/ContactShow";
import RNFS from 'react-native-fs';
import { unzip } from "react-native-zip-archive";
let isContactUploadRequired = false;

// eslint-disable-next-line
export default function SplashScreen({ navigation }: any) {
  // eslint-disable-next-line
  const [currentLanguage, setLanguage] = useState("");
  const { t, i18n } = useTranslation();
  const [showSyncModel, setShowSyncModel] = useState(false);
  const [syncModelMessage, setSyncModelMessage] = useState("Please wait ...");

  useEffect(() => {
    Navigation();
    GetTwilioStatus();
  }, []);

  const Navigation = async () => {
    const isLocalpathAdded = await AsyncStorage.getItem("localpath");
    const token = await AsyncStorage.getItem("authToken");
    const userImage = await AsyncStorage.getItem("userImage");
    const userName = await AsyncStorage.getItem("userName");
    const chatUserID = await AsyncStorage.getItem("chatUserID");
    const phone_number = await AsyncStorage.getItem("phone_number");
    const themeUse = await AsyncStorage.getItem("selectTheme");
    const selectlanguage = await AsyncStorage.getItem("selectLanguage");
    const chatFontsize = await AsyncStorage.getItem("chatFontsize");
    const selectFontStyle = await AsyncStorage.getItem("selectFontStyle");
    const allmediavalue = await AsyncStorage.getItem("allMediaDownload");
    const stealthModeValue = await AsyncStorage.getItem("stealthMode");
    if (selectFontStyle == null) {
      AsyncStorage.setItem("fontStyleSet", "Simple");
    }
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason" 
    if (allmediavalue == true || allmediavalue == "true") {
      globalThis.allMediaDownload = true;
    } else {
      globalThis.allMediaDownload = false;
    }

    globalThis.Authtoken = token;
    globalThis.token = token;
    globalThis.chatUserId = chatUserID;
    globalThis.phone_number = phone_number;
    globalThis.userChatId = chatUserID;
    globalThis.userImage = userImage;
    globalThis.userName = userName;
    globalThis.displayName = userName;
    globalThis.chatFontsize = chatFontsize == null ? 16 : Number(chatFontsize);
    globalThis.image = userImage;
    globalThis.selectTheme = themeUse == null ? "first" : themeUse;
    globalThis.stealthModeValue = stealthModeValue == null || undefined? "false" : stealthModeValue ;
    console.log("globalThis.stealthModeValue",globalThis.stealthModeValue);
    

    globalThis.checkBoxPressed =
      selectFontStyle == null ? "Simple" : selectFontStyle;
    if (selectlanguage != undefined) {
      changeLanguage(selectlanguage);
      globalThis.selectLanguage = selectlanguage;
    } else {
      changeLanguage("en");
      globalThis.selectLanguage = "en";
    }

     const isSyncStarted = await AsyncStorage.getItem("isSyncStarted");
  //  const isSyncStarted = true;
    
    if (isSyncStarted) {
      const synctype =  await AsyncStorage.getItem("synctype");
      isContactUploadRequired = true;
      setTimeout(() => {
        console.log("ddddddddddddd",isSyncStarted)
        setShowSyncModel(true);
        setSyncModelMessage(t("please_wait_we_are_syncing_your_chat_data"));
        console.log("synctype",synctype)
        if(synctype == "skip"){
          setTimeout(() => {

            dropChatTablesonSyncSkipped();
          }, 1500);

        }else{
          // from restore
          syncfunction()

        }
    
      }, 1500);
    } else {
      if (token != undefined) {
        if (isLocalpathAdded == null || isLocalpathAdded == undefined) {
          addColumnIfNotExists(
            "Chatmessages",
            "localPath",
            "VARCHAR",
            "[]",
            () => {}
          );

          AsyncStorage.setItem("localpath", "yes");
        }
        //isTableAltered
          console.log("yessssssssss")
        checkForceUpdate();
      } else {
        navigation.navigate("Login");
      }
    }
  };

  const syncfunction = () => {

    dropChatTablesonSyncRestarted();
    // setShowSyncModel(true);
    // setSyncModelMessage("Syncing chat data ...");
    // if(shouldbackup){
    //   createTableUser()
    // }

    // setTimeout(() => {
    //   syncData(globalThis.userChatId,shouldbackup,chatbackupurl,mediabackupurl);
    // }, 1000);
  };


  // const backupChatData = async () => {
  //   try {
  //     // Replace this with actual code to backup your chat data
  //     // const data = await fetchChatData(); // Fetch data from old table
  //     // await AsyncStorage.setItem("chatBackup", JSON.stringify(data)); // Store backup
  //   } catch (error) {
  //     console.error("Failed to backup chat data:", error);
  //   }
  // };


  const tables = [
    "rooms",
    "table_user",
    "allUsers",
    "wokiibotchat",
    "roombackground",
    "RoomSql",
    "RoomMembers",
    "Chatmessages",
    "PendingMessages",
    "ContactTable",
    "blockusers",
  ];

  // useEffect(()=> {
  //   backupChatData(tables, async(dataBackup) => {
  //     // Handle the backed-up data
  //     console.log('Backed-up data:', dataBackup);
  //     await clearChatRooms(); // Step 2: Drop old table(s)
  //     setSyncModelMessage("Syncing data modules ...");
  //     setTimeout(() => {
  //       reCreateChatTables(dataBackup);
  //     }, 700);
  //   });
  // },[])

  const dropChatTablesonSyncRestarted = async () => {
    await AsyncStorage.setItem("isSyncStarted", "yes");
    await clearChatRooms();
    setSyncModelMessage("Syncing data modules ...");
    setTimeout(() => {
      reCreateChatTablesonSyncRestart();
    }, 700);
  };

  const dropChatTablesonSyncSkipped = async () => {
    await AsyncStorage.setItem("isSyncStarted", "yes");
    await clearChatRooms();
    setSyncModelMessage("Syncing data modules ...");
    setTimeout(() => {
      reCreateChatTablesonSyncSkip();
    }, 700);
  };

  const reCreateChatTablesonSyncSkip = async () => {
    await createTableUser();
    setSyncModelMessage("Syncing chat data ...");
    const chatbackupurl = await AsyncStorage.getItem("chat_backup_url"); 
    const mediabackupurl = await AsyncStorage.getItem("chat_media_backup_url"); 
    //call Sync Api for last 3 months data
     syncData(globalThis.userChatId,false,chatbackupurl,mediabackupurl);
    // syncData(globalThis.userChatId);
  
  };


  
  const dropChatTables = async () => {
    await AsyncStorage.setItem("isSyncStarted", "yes");
    await backupChatData(tables, async(dataBackup) => {
      // Handle the backed-up data
      console.log('Backed-up data:', dataBackup);
      await clearChatRooms(); // Step 2: Drop old table(s)
      setSyncModelMessage("Syncing data modules ...");
      setTimeout(() => {
        reCreateChatTables(dataBackup);
      }, 700);
    });

  };

  const reCreateChatTablesonSyncRestart = async () => {
    await createTableUser();
    setSyncModelMessage("Syncing chat data ...");
    const chatbackupurl = await AsyncStorage.getItem("chat_backup_url"); 
    const mediabackupurl = await AsyncStorage.getItem("chat_media_backup_url"); 
    // calling from restore
    syncData(globalThis.userChatId,true,chatbackupurl,mediabackupurl);
  
  };


  const reCreateChatTables = async (dataBackup) => {
    await createTableUser();
    setSyncModelMessage("Syncing chat data ...");
    setTimeout(() => {
      console.log("alll data inserttt",dataBackup)
      insertDataIntoTables(dataBackup)
      setShowSyncModel(false);
      setTimeout(async () => {
        {
          await AsyncStorage.removeItem("isSyncStarted");
          await AsyncStorage.setItem(
            "lastsynctime",
            `${Date.now()}`
          );
          globalThis.Authtoken != undefined
            ? navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "BottomBar",
                  },
                ],
              })
            : navigation.navigate("Login");
        }
      }, 2000);
      // // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      // syncData(globalThis.userChatId);
    }, 700);
  };

  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: t("tokee_would_like_to_access_your_contact"),
          message: t("this_permission_is_requried_for_app_to_funcation_well "),
          buttonPositive: "Ok",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const uniquePhoneNumbers = new Set();
        // setLoading(true);
        Contacts.getAll()
          .then(async (contacts) => {
            // eslint-disable-next-line
            var contactArr: any = [];
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
                  contactArr.push(contactDict);
                }
              });
            });
            insertContact(contactArr);
            const data = {
              user_contacts: JSON.stringify(contactArr),
            };
            await AsyncStorage.setItem(
              "allcontacts",
              JSON.stringify(contactArr)
            );
            syncContacts(data);
          })

          .catch((e) => {
            console.log("", e);
            // setLoading(false);
          });
      } else {
        if (Platform.OS === "android") {
          setShowSyncModel(false);
          Alert.alert(
            t("contact_permission_denied "),
            t("this_permission_is_requried_for_app_to_funcation_well "),
            [
              {
                text: "Ok",
              },
            ],
            { cancelable: true }
          );

          return;
        }
        //setLoading(true);
        const uniquePhoneNumbers = new Set();
        Contacts.getAll()
          .then(async (contacts) => {
            // eslint-disable-next-line
            var contactArr: any = [];
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

                  contactArr.push(contactDict);
                }
              });
            });
            insertContactIOS(contactArr);
            const data = {
              user_contacts: JSON.stringify(contactArr),
            };
            await AsyncStorage.setItem(
              "allcontacts",
              JSON.stringify(contactArr)
            );
            syncContacts(data);
          })
          .catch((err) => {
            if (err.message == "denied") {
              Alert.alert(
                t("contact_permission_denied "),
                t("this_permission_is_requried_for_app_to_funcation_well "),
                [
                  {
                    text: "Ok",
                  },
                ],
                { cancelable: true }
              );
            }
            setShowSyncModel(false);
          });
      }
    } catch (error) {
      //setLoading(false);
      setShowSyncModel(false);
      if (error.message == "denied") {
        Alert.alert(
          t("tokee_would_like_to_access_your_contact"),
          t("this_permission_is_requried_for_app_to_funcation_well "),
          [
            {
              text: "Ok",
            },
          ],
          { cancelable: true }
        );
      }
    }
  };

  // eslint-disable-next-line
  const syncContacts = async (data: any) => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    PostApiCall(
      uploadContacts,
      data,
      headers,
      navigation,
      (ResponseData, ErrorStr) => {
        // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        contactApiResponse(ResponseData, ErrorStr);
      }
    );
  };

  const contactApiResponse = async () => {
    setShowSyncModel(false);
    setTimeout(async () => {
      {
        await AsyncStorage.setItem("isAllContactUploaded", "true");
        await AsyncStorage.removeItem("isSyncStarted");
        globalThis.Authtoken != undefined
          ? navigation.reset({
              index: 0,
              routes: [
                {
                  name: "BottomBar",
                },
              ],
            })
          : navigation.navigate("Login");
      }
    }, 2000);
  };

  const syncDataModule = (api: string, type: string) => {
    console.log("api : ", api);
    
    return new Promise((resolve, reject) => {
      axios({
        method: "get",
        url: api,
        headers: {
          "Content-Type": "application/json",
          api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
        },
      })
        .then(async (response) => {
          if (response.data.status == true) {
            const res = {};
            res[type] = response.data.data;
            if (type == "rooms" && response.data.data.length == 0) {
              globalThis.isNewAccount = true;
            } else if (type == "rooms" && response.data.data.length > 0) {
              globalThis.isNewAccount = false;
            }
            await insertRoomSql(res, globalThis.userChatId, (status) => {
              if (status == true) {
                BackgroundTimer.setTimeout(() => {
                  axios({
                    method: "get",
                    url: `${chatBaseUrl}/api/user/rooms/last-message/${globalThis.userChatId}`,
                    headers: {
                      "Content-Type": "application/json",
                      api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
                    },
                  })
                    .then((response) => {
                      if (response.data.status) {
                        response?.data.data?.map(async (room) => {
                          await AsyncStorage.setItem(
                            "lastsynctime",
                            `${Date.now()}`
                          );
                          getUnseenMessageCount(
                            room.roomId,
                            room.message_time,
                            (unseenMessageCount) => {
                              updateUnseenMessageCount(
                                room.roomId,
                                unseenMessageCount
                              );
                            }
                          );
                        });
                      }
                    })
                    .catch((err) => {
                      console.log("errror: ", err);
                    });
                }, 200);
              }
            });

            resolve(response.data);
          } else {
            reject(response.data);
          }
        })
        .catch((error) => {          
          reject(new Error(error).message);
        });
    });
  };

  const downloadAndProcessCSV = async (url, fileName) => {
    const tempDir = RNFS.DocumentDirectoryPath;
    const filePath = `${tempDir}/${fileName}`;
          if(fileName == "chatMessages.csv"){
            try {
              // Download the file
              const response = await RNFetchBlob.config({
                  fileCache: true,
                  appendExt: 'csv',
              }).fetch('GET', url);

              if (response.info().status === 200) {
                  // Save downloaded file to temporary directory
                  await RNFS.writeFile(filePath, response.data);
                  // Read the CSV data from the file
                  const csvData = await RNFS.readFile(response.data, 'utf8');

                  // Split the CSV data into rows
                  const rows = csvData.split('\n'); // Handle both Unix and Windows line endings
                  // Process CSV data (example: insert into database)
                  insertDataFromCSVToTable(rows, async(result) => {
                    await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
                      console.log("Inserted data:", result);
                  });

                  // Cleanup: Delete the downloaded file
                  await RNFS.unlink(filePath);
              } else {
                  throw new Error(`Failed to download file. Status code: ${response.info().status}`);
              }
          } catch (error) {
              console.error('Error handling file:', error);
              throw error;
          }
          }
          if(fileName == "TokeeMedia"){
            try {
              // Download the file
              const response = await RNFetchBlob.config({
                  fileCache: true,
                  appendExt: 'zip',
              }).fetch('GET', url);

              if (response.info().status === 200) {

                 try{
                  const unzipResult = unzip(response.data,filePath);
                   // Handle success or error
                      if (await unzipResult) {
                        // Handle unzipped files in targetPath
                      } else {
                        console.log('Unzip failed!');
                      }
                  
                 }
                 catch(errr){
                  console.log('Unzip failed!',errr);
                 }

              } else {
                  throw new Error(`Failed to download file. Status code: ${response.info().status}`);
              }
          } catch (error) {
              console.error('Error handling file:', error);
              throw error;
          }
          }
    
};

  const downloadAndProcessFiles = async (chatUrl, mediaUrl) => {
    try {
        // Download and process chat file
        if (chatUrl) {
            await downloadAndProcessCSV(chatUrl, `chatMessages.csv`);
        }

        // Download and process media file (if mediaUrl is provided)
        if (mediaUrl) {
            await downloadAndProcessCSV(mediaUrl, `TokeeMedia`);
        }
    } catch (error) {
        console.error('Error downloading and processing files:', error);
    }
  };

  const syncData = async (USERID:any,shouldbackup:any,chatbackupurl,mediabackupurl) => {
    console.log("dsfsdfdsfdsfdsf")
    if(shouldbackup){
      await downloadAndProcessFiles(chatbackupurl,mediabackupurl)
    }

    const  backuparray = [
      `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&requestFor=room`,
      `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&requestFor=block`,
    ];

    const  withoutbackuparray = [
      `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&requestFor=room`,
      `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&requestFor=chat`,
      `${chatBaseUrl}${alldataapiV3}${globalThis.userChatId}&requestFor=block`,
    ];

    console.log("globalThis.userChatId",globalThis.userChatId);
    

   const apis = shouldbackup ? backuparray : withoutbackuparray;


    Promise.all(apis.map((a) => syncDataModule(a, a.split("=").pop() + "s")))
      .then(async () => {
        if (isContactUploadRequired == true) {
          await requestContactsPermission();
        } else {
          setShowSyncModel(false);
          // setTimeout(async () => {
          //   {
          //     await AsyncStorage.removeItem("isSyncStarted");
          //     globalThis.Authtoken != undefined
          //       ? navigation.reset({
          //           index: 0,
          //           routes: [
          //             {
          //               name: "BottomBar",
          //             },
          //           ],
          //         })
          //       : navigation.navigate("Login");
          //   }
          // }, 2000);
          BackgroundTimer.setTimeout(() => {
            axios({
              method: "get",
              url: `https://chat.tokeecorp.com:8002/api/user/rooms/last-message/${globalThis.userChatId}`,
              headers: {
                "Content-Type": "application/json",
                api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
              },
            })
              .then(async(response) => {
                if (response.data.status) {
                  await AsyncStorage.removeItem("isSyncStarted");
                globalThis.Authtoken != undefined
                ? navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: "BottomBar",
                      },
                    ],
                  })
                : navigation.navigate("Login");

                  response?.data.data?.map((room) => {
                    getUnseenMessageCount(
                      room.roomId,
                      room.message_time,
                      (unseenMessageCount) => {
                        updateUnseenMessageCount(room.roomId, unseenMessageCount);
                      }
                    );
                  });
                }
              })
              .catch((err) => {
                console.log("errror: ", err);
              });
          }, 200);
        }
      })
      .catch((err) => {
        console.log(">>>error>>>", err);
      });
  };

  const GetTwilioStatus = async () => {
    const token = await AsyncStorage.getItem("authToken");
    if(!token){
      console.log("dsfdsfdsfdsfdsf")
      const urlStr = Base_Url + getTwilioSettings;
  
      try {
        await axios({
          method: "get",
          url: urlStr,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (response.data.status == true) {
              globalThis.isTwilioEnabled = response.data.data.is_twilio_enabled;
              globalThis.isTwilioService_id =
                response.data.data.twilio_services_id;
              globalThis.isTwillioLookupEnabled =
                response.data.data.twilio_enabled_phone_lookup;
              const token =
                response.data.data.twilio_account_sid +
                ":" +
                response.data.data.twilio_auth_token;
              globalThis.isTwilioAuthToken = RNFetchBlob.base64.encode(token);
            }
          })
          .catch((error) => {
            console.log("", error);
          });
      } catch (error) {
        console.log("", error);
      }
    }
    
  };
  

  const checkForceUpdate = () => {
    // ********** InterNet Permission    ********** ///
    const data = {
      platform: Platform.OS == "android" ? "android" : "ios",
      app_version: DeviceInfo.getVersion(),
    };
    // **********   Headers for api ********** ///
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"));
        return;
      } else {
        PostApiCall(
          check_force_update,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  // eslint-disable-next-line
  const apiSuccess = (ResponseData: any, ErrorStr: any) => {
    console.log("ResponseData",ResponseData)
    if (ErrorStr) {
      if (ErrorStr == t("sessionExpired")) {
        Alert.alert("", ErrorStr, [
          {
            text: "Ok",
            onPress: () => {
              globalThis.Authtoken = undefined;
              UserLoggedOut();
              navigation.navigate("Login");
            },
          },
        ]);
      } else if (ErrorStr == t("serverError")) {
        Alert.alert("", t("serverError"), [
          {
            text: "Ok",
            onPress: () => {},
          },
        ]);
      } else {
        Alert.alert("Update Available!", ErrorStr, [
          {
            text: "Ok",
            onPress: () => {
              appStore();
            },
          },
        ]);
      }
      // Navigate to another screen or handle the error in some way
    } else {
      if (ResponseData.status == true) {
        if (ResponseData.data.is_logoout == 1) {
          setTimeout(() => {
            setShowSyncModel(true);
            setSyncModelMessage(t("please_wait_we_are_syncing_your_chat_data"));
            setTimeout(() => {
              dropChatTables();
            }, 700);
          }, 700);
        } else {
          setTimeout(() => {
            {
              globalThis.Authtoken != undefined
                ? navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: "BottomBar",
                      },
                    ],
                  })
                : navigation.navigate("Login");
            }
          }, 3000);
        }
      } else {
        setTimeout(() => {
          {
            globalThis.Authtoken != undefined
              ? navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: "BottomBar",
                    },
                  ],
                })
              : navigation.navigate("Login");
          }
        }, 3000);
      }
    }
  };

  const UserLoggedOut = async () => {
    globalThis.Authtoken = undefined;
    globalThis.chatUserId = undefined;
    globalThis.userImage = undefined;
    globalThis.userName = undefined;
    globalThis.Authtoken = undefined;
    globalThis.token = undefined;
    globalThis.chatUserId = undefined;
    globalThis.userChatId = undefined;
    globalThis.userImage = undefined;
    globalThis.image = undefined;
    globalThis.userName = undefined;
    globalThis.displayName = undefined;
    globalThis.phone_number = undefined;
    globalThis.sender_id = undefined;

    //isSyncStarted
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userImage");
    await AsyncStorage.removeItem("userName");
    await AsyncStorage.removeItem("chatUserID");
    //  await AsyncStorage.removeItem("isContactUploaded");
    await AsyncStorage.removeItem("phone_number");
    await AsyncStorage.removeItem("lockChatPinCode");
    await AsyncStorage.removeItem("chatlockusernumber");
  };

  const appStore = () => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        return;
      } else {
        Platform.OS === "ios"
          ? Linking.canOpenURL(
              "https://apps.apple.com/fj/app/tokee-messenger/id1641356322"
            ).then((supported) => {
              if (supported) {
                Linking.openURL(
                  "https://apps.apple.com/fj/app/tokee-messenger/id1641356322"
                );
              }
            })
          : Linking.canOpenURL(
              "https://play.google.com/store/apps/details?id=com.deucetek.tokee"
            ).then((supported) => {
              if (supported) {
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.deucetek.tokee"
                );
              }
            });
      }
    });
  };

  // eslint-disable-next-line
  const changeLanguage = async (selectlanguage: any) => {
    await AsyncStorage.setItem("selectLanguage", selectlanguage);
    i18n
      .changeLanguage(selectlanguage)
      .then(() => setLanguage(selectlanguage))
      .catch((err) => console.log(err));
  };

  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ImageBackground
        source={splashBackgroundImage().splash}
        resizeMode="cover"
        style={{
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Modal
          style={{ width: "100%", height: "100%" }}
          visible={showSyncModel}
          transparent={true}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(52, 52, 52, 0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                borderRadius: 10,
                backgroundColor: "white",
                padding: 25,
                maxWidth: 250,
              }}
            >
              <ActivityIndicator size="large" color={textTheme().textColor} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: font.bold(),
                  color: textTheme().textColor,
                  marginBottom: 10,
                  marginTop: 10,
                }}
              >
                {syncModelMessage}
              </Text>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}
