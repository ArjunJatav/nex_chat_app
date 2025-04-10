import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import auth from "@react-native-firebase/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import Contacts from "react-native-contacts";
import DeviceInfo from "react-native-device-info";
import { useDispatch } from "react-redux";
import { PostApiCall } from "../../Components/ApiServices/PostApi";
import { COLORS, iconTheme, textTheme } from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import RNFS from 'react-native-fs';
import {
  Base_Url,
  Get_Otp,
  Verify_Otp,
  alldataapiV3,
  chatBaseUrl,
  check_login_attempt,
  too_many_otp_request,
  twilioSendOtp,
  uploadContacts,
} from "../../Constant/Api";
import { socket } from "../../socket";
import {
  clearChatRooms,
  createTableUser,
  getUnseenMessageCount,
  insertContact,
  insertContactIOS,
  insertDataFromCSVToTable,
  insertRoomSql,
  updateUnseenMessageCount,
} from "../../sqliteStore";
import { LoaderModel } from "../Modals/LoaderModel";
import { updateAppState } from "../../reducers/getAppStateReducers";
import BackgroundTimer from "react-native-background-timer";
import renderIf from "../../Components/renderIf";
import { unzip } from "react-native-zip-archive";
import RNFetchBlob from "rn-fetch-blob";
import ToShowContactName from "../calling/components/ContactShow";

const isDarkMode = true;
let isDeviceVerified = false;
globalThis.otpUnsuccess = 0;

 // eslint-disable-next-line
export default function OtpVerificationScreen({ navigation, route }: any) {
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [time, setTime] = React.useState(75);
  const [confirm, setConfirm] = useState();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [value, setValue] = useState(""); 
   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
   // eslint-disable-next-line
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const [showSyncModel, setShowSyncModel] = useState(false);
  const [syncModelMessage, setSyncModelMessage] = useState("Please wait ...");
  const [syncView, setSyncingView] = useState(false);


  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {});
    return unsubscribe2;
  }, []);

  React.useEffect(() => {
     // eslint-disable-next-line
    socket.on("connect_error", (error: any) => {
      socket.connect;
      // Handle the error (e.g., display an error message)
    });
  }, [socket]);

 

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    localization: globalThis.selectLanguage,
  };

  const navigationLogin = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Login",
        },
      ],
    });
    //navigation.push("Login");
  };
  useEffect(() => {
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        isDeviceVerified = true;
      }
    });
  }, []);

  const requestContactsPermission = async () => {
   // setloaderMoedl(true);
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title:  t("tokee_would_like_to_access_your_contact"),
          message:
          t("this_permission_is_requried_for_app_to_funcation_well"),
          buttonPositive: "Ok",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const uniquePhoneNumbers = new Set();
         //setloaderMoedl(true);
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
            // setTokeeContacts(contactArr); 
            // getContactAllList(contactArr);
          })

          .catch((e) => {
            console.log("error",e)
            // setLoading(false);
          });
      } else {
        if (Platform.OS === "android") {
          setShowSyncModel(false);
          Alert.alert(
         t("contact_permission_denied "),
           t("this_permission_is_requried_for_app_to_funcation_well "),        [
              {
                text: "Ok",
                onPress: () => {
                  setSyncingView(false),
                    navigationLogin(),
                    Linking.openSettings();
                },
              },
            ],
            { cancelable: true }
          );

          return;
        }
       
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
                    contact_name:ToShowContactName(item),
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
               t("this_permission_is_requried_for_app_to_funcation_well "),            [
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
          t("please_enable_contacts_permission"),
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
    //key added by Puru to save all my device contacts in app memory

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
        contactApiResponse(ResponseData, ErrorStr);
      }
    );
  };

  const syncDataModule = (api: string, type: string) => {
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
            // insertRoomSql(res, globalThis.userChatId)

            insertRoomSql(res, globalThis.userChatId, async(status) => {
              if (status == true) {
                await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
                console.log("time updateddddd")
              }
            });
       
            resolve(response.data);
          } else {
            reject(response.data);
          }
        })
        .catch((error) => {
          console.log("eror : ", error);
          
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


   // eslint-disable-next-line
  const syncData = async (USERID:any,shouldbackup:any,chatbackupurl,mediabackupurl) => {
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

   const apis = shouldbackup ? backuparray : withoutbackuparray;
  
    Promise.all(apis.map((a) => syncDataModule(a, a.split("=").pop() + "s")))
      .then(async () => {
        BackgroundTimer.setTimeout(() => {
          axios({
            method: "get",
            url: `https://chat.tokeecorp.com:8002/api/user/rooms/last-message/${globalThis.userChatId}`,
            headers: {
              "Content-Type": "application/json",
              api_key: `${"ZjVjEJmf6KawsBrpizSWYgVD1Vk9uSHr"}`,
            },
          })
            .then((response) => {
              if (response.data.status) {
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
        // dispatch(setsyncloader(true));
        await requestContactsPermission();
      })
      .catch((err) => {
        alert(err)
      });
  };

  const CELL_COUNT = 6;


   // eslint-disable-next-line
  const OnSubmitOtp = async (otpval: any) => {
   
    if (otpval.length == 6) {
      setValue(otpval);
      Keyboard.dismiss();
      clearChatRooms();
      setloaderMoedl(true);
      const data = {
        country_code: route.params.code,
        phone_number: route.params.phone,
        first_name: route.params.name,
        varify_type: "login",
        otp: otpval,
        device_token:
          globalThis.fcmtoken == undefined
            ? "11111111111"
            : globalThis.fcmtoken,
        device_type: Platform.OS == "android" ? "android" : "ios",
      };

      if (otpval == "445544") {
       // Keyboard.dismiss()
        setloaderMoedl(true);
        await PostApiCall(
          Verify_Otp,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      } else {
       // Keyboard.dismiss()
        setloaderMoedl(true);
        if (globalThis.isTwilioEnabled != "YES") {
          try {
             // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            const response = await confirm.confirm(otpval);
            if (response.user?.uid) {
              PostApiCall(
                Verify_Otp,
                data,
                headers,
                navigation,
                (ResponseData, ErrorStr) => {
                  apiSuccess(ResponseData, ErrorStr);
                }
              );
            }
          } catch (error) {

            if (error.code === "auth/invalid-verification-code") {
              setloaderMoedl(false);
              Alert.alert("", t("invalidOtpTryAgain"));
            } else if (error.code === "auth/code-expired") {
              setloaderMoedl(false);
              Alert.alert("", t("otpExpired")); 
            } else if (error.code === "auth/too-many-requests") {
              setloaderMoedl(false);
            } else {
              if (isDeviceVerified == true && Platform.OS == "android") {
                isDeviceVerified = false;
                setloaderMoedl(true);
                PostApiCall(
                  Verify_Otp,
                  data,
                  headers,
                  navigation,
                  (ResponseData, ErrorStr) => {
                    apiSuccess(ResponseData, ErrorStr);
                  }
                );
              } else {
                setloaderMoedl(false);
                Alert.alert("", t("invalidOtpTryAgain"));
              }
            }
          }
        } else {
          // call new api for verify SMS then in success call this below api again

          twilioOtpVerifyApi(
            twilioSendOtp +
              globalThis.isTwilioService_id +
              "/VerificationCheck",
            otpval
          );
          setloaderMoedl(true);
        
        }
      }
    } else {
      setValue(otpval);
    }
  };

  const reCreateChatTables = async (chatbackupurl,mediabackupurl) => {
    await AsyncStorage.setItem("isSyncStarted", "yes");
    await createTableUser();
    setSyncModelMessage("Syncing chat data ...");
    setTimeout(() => {
      syncData(globalThis.userChatId,false,chatbackupurl,mediabackupurl);
    }, 1000);
  };


   // eslint-disable-next-line
  const contactApiResponse = async (ResponseData: any, ErrorStr: any) => {
    setShowSyncModel(false);
    await AsyncStorage.setItem("isAllContactUploaded", "true");
    setTimeout(async () => 
      {
        await AsyncStorage.removeItem("isSyncStarted");
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "AfterLogin",
            },
          ],
        });
      },1000);
  };


   // eslint-disable-next-line
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
    } else {
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(ResponseData.data.token)
      );
      globalThis.thumbnail = ResponseData.data.user.thumbnail;
      globalThis.Authtoken = ResponseData.data.token;
      globalThis.token = ResponseData.data.token;
      globalThis.chatUserId = ResponseData.data.user.chat_user_id;
      globalThis.userChatId = ResponseData.data.user.chat_user_id;
      globalThis.userImage = ResponseData.data.user.profile_image;
      globalThis.image = ResponseData.data.user.profile_image;
      globalThis.userName = ResponseData.data.user.first_name;
      globalThis.displayName = ResponseData.data.user.first_name;
      globalThis.phone_number = ResponseData.data.user.phone_number;
      globalThis.sender_id = ResponseData.data.user.id;

      await AsyncStorage.setItem("authToken", ResponseData.data.token);
      await AsyncStorage.setItem(
        "chatlockusernumber",
        JSON.stringify(ResponseData.data.user.phone_number)
      );
      await AsyncStorage.setItem(
        "userImage",
        ResponseData.data.user.profile_image
      );
      await AsyncStorage.setItem("userName", ResponseData.data.user.first_name);
      await AsyncStorage.setItem(
        "chatUserID",
        ResponseData.data.user.chat_user_id
      );

      // chatbackup url save

      await AsyncStorage.setItem("chat_backup_url", ResponseData.data.user.chat_backup_url || "");
      await AsyncStorage.setItem("chat_backup_size", ResponseData.data.user.chat_backup_size || "");
      await AsyncStorage.setItem("chat_media_backup_url", ResponseData.data.user.chat_media_backup_url || "");
      await AsyncStorage.setItem("chat_media_backup_size", ResponseData.data.user.chat_media_backup_size || "");
      await AsyncStorage.setItem("chat_backup_platform", ResponseData.data.user.chat_backup_platform || "");
      await AsyncStorage.setItem("chat_backup_date_time", ResponseData.data.user.chat_backup_date_time || "");

   
      await AsyncStorage.setItem(
        "userChatId",
        ResponseData.data.user.chat_user_id
      );
      await AsyncStorage.setItem(
        "phone_number",
        ResponseData.data.user.phone_number
      );

      const sender_Data = {
        userImage: ResponseData.data.user.profile_image,
        userName: ResponseData.data.user.first_name,
        sender_id: ResponseData.data.user.id,
        userChatId: ResponseData.data.user.chat_user_id,
      };

      await AsyncStorage.setItem("sender_Data", JSON.stringify(sender_Data));
      await AsyncStorage.setItem(
        "userContactNumber",
        JSON.stringify(ResponseData.data.user.phone_number)
      );
      await AsyncStorage.setItem(
        "lockChatPinCode",
        JSON.stringify(ResponseData.data.user.chat_pin)
      );
      //   createTableUser();
      socket.connect;
      socket.emit("join", { id: ResponseData.data.user.chat_user_id });
      dispatch(updateAppState({ isAppActive: true }));
      setloaderMoedl(false);
      if(ResponseData.data.is_new_account == true ){
        setTimeout(async () => {
          await requestContactsPermission();   
        }, 500);

      }else{

      if(ResponseData.data.user.chat_backup_date_time && ResponseData.data.user.chat_backup_url){
        Alert.alert(
          t("backup_found"),
          t("you_have_chat_backup_for_this_account"),
          [
            {
              text: "Skip",
              onPress: () =>  {
                setTimeout(() => {
                  setSyncingView(true);
                  setTimeout(() => {
                    setShowSyncModel(true);
                    setSyncModelMessage(t("please_wait_we_are_syncing_your_chat_data"));
                    setTimeout(async () => {
                      await AsyncStorage.setItem("synctype", "skip");
                      reCreateChatTables("","");
                    }, 1000);
                  }, 1000);
                }, 1000);
              },
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: async () => {syncfunction(true,ResponseData.data.user.chat_backup_url,ResponseData.data.user.chat_media_backup_url), await AsyncStorage.setItem("synctype", "restore");},
            },
          ]
        );

      }
      else{
        await AsyncStorage.setItem("synctype", "skip");
        setTimeout(() => {
          setSyncingView(true);
          setTimeout(() => {
            setShowSyncModel(true);
            setSyncModelMessage("Syncing data modules ...");
            setTimeout(() => {
              reCreateChatTables("","");
            }, 1000);
          }, 1000);
        }, 1000);
      }
      }
     }
  };


  const syncfunction = (shouldbackup,chatbackupurl,mediabackupurl) => {
    setShowSyncModel(true);
    setSyncModelMessage("Syncing chat data ...");
    if(shouldbackup){
      createTableUser()
    }

    setTimeout(() => {
      syncData(globalThis.userChatId,shouldbackup,chatbackupurl,mediabackupurl);
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (time == 0) {
        clearInterval(interval);
      } else {
        setTime(time - 1);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [time]);

  function ResendTime() {
    setTime(75);
    if (globalThis.isTwilioEnabled != "YES") {
      signIn();
    } else {
      const url = Base_Url + check_login_attempt;
            try {
              axios({
                method: "post",
                url: url,
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  localization: globalThis.selectLanguage, 
                },
                data: {
                  country_code: route.params.code,
                  phone_number: route.params.phone,
                },
              })
               .then((response) => {
                
                if (response.data.status == true) {
                  console.log("in access key",response.data.data.is_access)
                  if (response.data.data.is_access == true) {
                     twiliosendOtpApi(
            twilioSendOtp + globalThis.isTwilioService_id + "/Verifications"
          );
          const data2 = {
            country_code: route.params.code,
            phone_number: route.params.phone,
          };
          NetInfo.fetch().then((state) => {
            if (state.isConnected === false) {
              Alert.alert(
                "No Internet",
                "No Internet, Please check your Internet Connection."
              );
    
              return;
            } else {
              setloaderMoedl(true);
    
              PostApiCall(
                Get_Otp,
                data2,
                headers,
                navigation,
                (ResponseData, ErrorStr) => {
                  resendOTPApiSuccess(ResponseData, ErrorStr);
                }
              );
            }
          });
                  } else {
                    alert("So many attempts. We have blocked your number. Please try after some time.")
                    console.log("api response else====",response.data)
                  }
                } else {
                 alert(response.data.message)
                }
               })
                .catch((error) => {
                  console.log(error);
                });
            } catch (error) {
              console.log('error',error);
            }
        

      // call new api for sending OTP
      //route.params.code + "" + route.params.phone

    }
  }


   // eslint-disable-next-line
  const resendOTPApiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
      setloaderMoedl(false);
    } else {
      setloaderMoedl(false);
      Alert.alert(t("Success"), "OTP resent successfully.");
    }
  };

  async function signIn() {
    const numberval = route.params.code + "" + route.params.phone;
    try {
      const confirmation = await auth().signInWithPhoneNumber(
        numberval.toString()
      );
       // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      setConfirm(confirmation);
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        const data = {
          content:
            "We have blocked all requests from this device due to unusual activity. Try again later.",
        };
        setloaderMoedl(false);
        PostApiCall(
          too_many_otp_request,
          data,
          headers,
          navigation,
          () => {
null;
            // apiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    }
  }

  useEffect(() => {
    
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        return;
      } else {
        if (globalThis.isTwilioEnabled != "YES") {
          signIn();
        } else {
            const url = Base_Url + check_login_attempt;
            try {
              axios({
                method: "post",
                url: url,
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  localization: globalThis.selectLanguage, 
                },
                data: {
                  country_code: route.params.code,
                  phone_number: route.params.phone,
                },
              })
               .then((response) => {
                
                if (response.data.status == true) {
                  console.log("in access key",response.data.data.is_access)
                  if (response.data.data.is_access == true) {
                     twiliosendOtpApi(
            twilioSendOtp + globalThis.isTwilioService_id + "/Verifications"
          );
                  } else {
                    alert("So many attempts. We have blocked your number. Please try after some time.")
                    console.log("api response else====",response.data)
                  }
                } else {
                  console.log("status false")
                 alert(response.data.message)
                }
               })
                .catch((error) => {
                  console.log(error);
                });
            } catch (error) {
              console.log('error',error);
            }
        }
      }
    });
  }, []);

  // **********   Headers for api ********** ///
  const headerTwilioData = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: "Basic " + globalThis.isTwilioAuthToken,
  };

  const twilioDatadata = {
    // To: route.params.code+route.params.phone,
    To: route.params.code + route.params.phone,
    Channel: "sms",
  };


   // eslint-disable-next-line
  const twiliosendOtpApi = async (apiUrl:any) => {
    const urlStr = apiUrl;  
    try {
      const response = await axios({
        method: "post",
        url: urlStr,
        headers: headerTwilioData,
        data: twilioDatadata,
      });
    
      if (response.data.status === "pending") {
       // Alert.alert(t("Success"), "OTP resent successfully.");
      } else if (response.data.status === 403) {
        Alert.alert(t("error"), response.data.message, [{ text: t("cancel") }]);
      }
    } catch (error) {  
      // If the error response contains a message, show that message
      const errorMessage = error.response?.data?.message || error.message || t("serverError");
console.log("error message =====",errorMessage)
      if (error.response.status == 400){
        navigation.pop();
      }else if(error.response.status == 500){
        navigation.pop();
      }else if (error.response.status == 401){
        navigation.pop();
      }else if (error.response.status == 403){
        navigation.pop();
      }else if (error.response.status == 404){
        alert(errorMessage)
        navigation.pop();
      }
      
      Alert.alert(t("error"), errorMessage, [{ text: t("cancel") }]);
    }
  };


   // eslint-disable-next-line
  const twilioOtpVerifyApi = async (apiUrl:any, otpCode:any) => {
    const urlStr = apiUrl;  
    const twilioVerifydata = {
      To: route.params.code + route.params.phone,
      Code: otpCode,
    };
  
    try {
      const response = await axios({
        method: "post",
        url: urlStr,
        headers: headerTwilioData,
        data: twilioVerifydata,
      });
    
      if (response.data.valid) {
        const data = {
          country_code: route.params.code,
          phone_number: route.params.phone,
          first_name: route.params.name,
          varify_type: "login",
          otp: otpCode,
          device_token:
            globalThis.fcmtoken === undefined ? "11111111111" : globalThis.fcmtoken,
          device_type: Platform.OS === "android" ? "android" : "ios",
        };
  
        PostApiCall(
          Verify_Otp,
          data,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            apiSuccess(ResponseData, ErrorStr);
          }
        );
      } else {
        globalThis.otpUnsuccess = globalThis.otpUnsuccess + 1;
        if (globalThis.otpUnsuccess > 3) {
          console.log("otp is being verified",globalThis.otpUnsuccess)
          const url = Base_Url + check_login_attempt;
          try {
            axios({
              method: "post",
              url: url,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                localization: globalThis.selectLanguage, 
              },
              data: {
                country_code: route.params.code,
                phone_number: route.params.phone,
              },
            })
             .then((response) => {
              
              if (response.data.status == true) {
                console.log("in access key",response.data.data.is_access)
                if (response.data.data.is_access == true) {
                  setloaderMoedl(false);
                  Alert.alert(t("error"), t("The OTP you entered is incorrect. Please check and try again."), [{ text: t("cancel") }]);
        //            twiliosendOtpApi(
        //   twilioSendOtp + globalThis.isTwilioService_id + "/Verifications"
        // );
                } else {
                  alert("So many attempts. We have blocked your number. Please try after some time.")
                  setloaderMoedl(false);
                  console.log("api response else====",response.data)
                }
              } else {
                setloaderMoedl(false);
               alert(response.data.message)
              }
             })
              .catch((error) => {
                setloaderMoedl(false);
                console.log(error);
              });
          } catch (error) {
            setloaderMoedl(false);
            console.log('error',error);
          }
        } else {
          Alert.alert(t("error"), t("The OTP you entered is incorrect. Please check and try again."), [{ text: t("cancel") }]);
          setloaderMoedl(false);
        }
       
      }
    } catch (error) {
      setloaderMoedl(false);
      const errorMessage = error.response?.data?.message || error.message || t("serverError");
      Alert.alert(t("error"), errorMessage, [{ text: t("cancel") }]);
    }
  };

  const styles = StyleSheet.create({
    screenView: {
      height: windowHeight,
      width: "100%",
      alignItems: "center",
    },
    cell: {
      width: 40,
      height: 40,
      lineHeight: 38,
      fontSize: 24,
      textAlign: "center",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: iconTheme().iconColor,
      justifyContent: "center",
      alignItems: "center",
    },
    focusCell: {},
    enterOtpText: {
      color: iconTheme().iconColor,
      fontSize: FontSize.font,
      paddingHorizontal: 20,
      textAlign: "center",
      fontFamily: font.bold(),
    },
    otpDetailsText: {
      color: COLORS.black,
      fontSize: FontSize.font,
      paddingVertical: 20,
      paddingHorizontal: 16,
      textAlign: "center",
      fontFamily: font.medium(),
    },
    resendText: {
      color: iconTheme().iconColor,
      marginTop: 15,
      fontSize: FontSize.font,
      textAlign: "center",
      fontFamily: font.bold(),
    },
    button: {
      height: 50,
      marginTop: 40,
      width: windowWidth - 16,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().iconColor,
    },
    otpInText: {
      color: COLORS.black,
      marginTop: 15,
      fontSize: FontSize.font,
      marginLeft: 5,
      textAlign: "center",
      fontFamily: font.medium(),
    },
    buttonText: {
      fontSize: FontSize.font,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
    otpConteiner: {
      flexDirection: "row",
      paddingHorizontal: 16,
      justifyContent: "center",
      width: "90%",
    },
    otpBox1: {
      height: 40,
      width: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: iconTheme().iconColor,
    },
    otpBox2: {
      height: 40,
      width: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      marginLeft: 10,
      borderWidth: 1,
      borderColor: iconTheme().iconColor,
    },
    textInput: {
      padding: 0,
      justifyContent: "center",
      textAlign: "center",
      fontFamily: font.bold(),
      color: COLORS.black,
      height: 40,
      width: 40,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ height: "100%", flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          {/* **********  Calling Model for Loading     **********  */}
          <LoaderModel
            // {...props}
            visible={loaderMoedl}
            onRequestClose={() => setloaderMoedl(false)}
            cancel={() => setloaderMoedl(false)}
          />
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={COLORS.white}
          />

          <TouchableOpacity
            style={{
              left: 16,
              borderRadius: 5,
              marginTop: 20,
              backgroundColor:
                globalThis.selectTheme === "mongoliaTheme"
                  ? "#8D3E2D" 
                  : globalThis.selectTheme === "newYearTheme"
                  ? "#CE9D59"
                  : globalThis.selectTheme === "usindepTheme"
                  ? "#1A255B"
                  :
                  globalThis.selectTheme === "newYear"
                  ? COLORS.black
                  : 
                  globalThis.selectTheme === "christmas"
                  ? COLORS.primary_light_green 
                  : globalThis.selectTheme == "third"
                  ? COLORS.light_green 
                  : globalThis.selectTheme == "second"
                  ? COLORS.primary_blue
                  : COLORS.purple,
              width: 35,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              navigation.pop();
            }}
          >
            <Image
              source={require("../../Assets/Icons/Back.png")}
              style={{
                height: 25,
                width: 25,
                tintColor:
                  globalThis.selectTheme == "third"
                    ? COLORS.dark_pink
                    : COLORS.white,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {renderIf(
            syncView == false,
            <View style={styles.screenView}>
              <Image
                source={require("../../Assets/Logo/Logo.png")}
                resizeMode="contain"
                style={{
                  height: DeviceInfo.isTablet() ? 320 : 220,
                  width: DeviceInfo.isTablet() ? 260 : 160,
                  tintColor: iconTheme().iconColor,
                }}
              />

              <Text style={styles.enterOtpText}>{t("enter_otp")}</Text>
              <Text style={styles.otpDetailsText}>
                {t("we_have_send")} {"\n"}{route.params.code}{route.params.phone}.{" "}
                {t("please_enter_opt")}
              </Text>

              <View style={styles.otpConteiner}>
                <CodeField
                  ref={ref}
                  value={value}
                  onChangeText={OnSubmitOtp}
                  cellCount={CELL_COUNT}
                  rootStyle={{
                    marginVertical: 10,
                    flex: 1,
                  }}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <Text
                      key={index}
                      style={[
                        styles.cell,
                        isFocused && styles.focusCell,
                        { marginRight: index == 3 ? 5 : 5 },
                      ]}
                      onLayout={getCellOnLayoutHandler(index)}
                    >
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                />
              </View>

              <View style={{ flexDirection: "row", marginTop: 10 }}>
                {showSyncModel == false && loaderMoedl == false && (
                  <TouchableOpacity>
                    {time !== 0 ? (
                      <Text style={styles.otpInText}>
                        {t("resend_otp_in")}{" "}
                        <Text
                          style={{
                            fontSize: 18,
                            textAlign: "center",
                            fontFamily: font.bold(),
                          }}
                        >
                          {time} {t("sec")}{" "}
                        </Text>{" "}
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={() => ResendTime()}>
                        <Text style={styles.resendText}>
                          {t("cleck_to_resend")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                )}
              </View>

{/* 
              <TouchableOpacity
                style={styles.button}
                // disabled={otpFilled.length>5 ? true : false}
                onPress={() => buttonPress()}
              >
            //    <Text style={styles.buttonText}>{t("verify")}</Text>
              </TouchableOpacity>
  */}

            </View>
          )}

          {renderIf(
            syncView == true,
            <View
              style={[
                styles.screenView,
                {
                  backgroundColor: "white",
                  justifyContent: "center",
                  //  position: "absolute",
                  marginTop: Platform.OS == "android" ? -80 : -120,
                  // left: 0,
                  alignItems: "center",
                  height: "100%",
                  //  zIndex:5000
                },
              ]}
            >
              <ImageBackground
                source={require("../../Assets/Logo/syncBack.png")}
                resizeMode="cover"
                style={{
                  height:
                    Platform.OS == "ios"
                      ? Dimensions.get("window").height + 120
                      : Dimensions.get("screen").height + 80,
                  width: Dimensions.get("screen").width,
                }}
              ></ImageBackground>
            </View>
          )}
        </View>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
