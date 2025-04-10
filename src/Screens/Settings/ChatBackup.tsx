import { t } from "i18next";
import React, {  useEffect, useState } from "react";
import {  zip } from "react-native-zip-archive";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  iconTheme,
  searchBar,
  themeModule,
} from "../../Components/Colors/Colors";
import RNFS from "react-native-fs";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { Base_Url } from "../../Constant/Api";
import { chatTop, settingTop } from "../../Navigation/Icons";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SQLite from "react-native-sqlite-storage";
import {
  backupFailure,
  backupSuccess,
  backupmediaSuccess,
  setChatUploadProgress,
  setLoaderprocess,
  setMediaUploadProgress,
  setbackupsuccessfull,
  startBackup,
  toggleSwitch,
} from "../../Redux/backupSlice";
import { accessKeyId, secretAccessKey } from "../../Constant/Key";
import axios from "axios";
import moment from "moment";

const isDarkMode = true;

 // eslint-disable-next-line
export default function ChatBackup({ navigation }: any) {
  if (typeof Buffer === "undefined")
   // eslint-disable-next-line
    globalThis.Buffer = require("buffer").Buffer;
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [uploadshow, setUploadshow] = useState(false);
  const {
    isBackupInProgress,
    fileSize,
    backupsuccessfull,
    isEnabled,
    ChatUploadProgress,
    MediaUploadProgress,
     // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
  } = useSelector((state) => state.backup);
  const dispatch = useDispatch();

  const [localloading, setlocalloading] = useState(false);
  const [medialocalloading, setmedialocalloading] = useState(false);
 // eslint-disable-next-line
  const [localchatsize, setlocalchatsize] = useState<any>(0);
   // eslint-disable-next-line
  const [localmediasize, setlocalmediasize] = useState<any>(0);
   // eslint-disable-next-line
  const [locallastbackuptime, setlocallastbackuptime] = useState<any>(t("Never"));

  useEffect(() => {
    getbackuplocalinfo();
    // takeLocalBackUp()
  }, []);

  const getbackuplocalinfo = async () => {
    setlocalchatsize((await AsyncStorage.getItem("chat_backup_size")) || 0);
    setlocalmediasize(
      (await AsyncStorage.getItem("chat_media_backup_size")) || 0
    );
    setlocallastbackuptime(
      (await AsyncStorage.getItem("chat_backup_date_time")) || t("Never")
    );
  };

  const takeLocalBackUp = async () => {
    setlocalloading(true);
    try {
      const databasePath = `/data/data/com.deucetek.tokee/databases/chatDB`;
      const db = await SQLite.openDatabase({
        name: "chatDB",
        location: databasePath,
      });
      const exportToCSV = async () => {
        return new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM Chatmessages",
              [],
              async (_, result) => {
                const rowCount = result.rows.length;
                let csvData =
                  "id, mId, roomId, fromUser, userName, phoneNumber, message, message_type, attachment, localPath, isBroadcastMessage, isDeletedForAll, parent_message, isForwarded, storyId, isStoryRemoved, resId, broadcastMessageId, seenCount, deliveredCount, unreadCount, status, createdAt, updatedAt, shouldDisappear, disappearTime, disappearMsgTime\n"; // CSV header
                for (let i = 0; i < rowCount; i++) {
                  const row = result.rows.item(i);
                  const rowCsv = [
                    row.id,
                    row.mId,
                    row.roomId,
                    row.fromUser,
                    escapeCsvField(row.userName),
                    row.phoneNumber,
                    row.message,
                    row.message_type,
                    row.attachment,
                    row.localPath,
                    row.isBroadcastMessage,
                    row.isDeletedForAll,
                    row.parent_message || JSON.stringify({}),
                    row.isForwarded,
                    row.storyId || "",
                    row.isStoryRemoved,
                    row.resId,
                    row.broadcastMessageId || "",
                    row.seenCount,
                    row.deliveredCount,
                    row.unreadCount,
                    row.status,
                    row.createdAt,
                    row.updatedAt,
                    row.shouldDisappear,
                    row.disappearTime || 0,
                    row.disappearMsgTime || 0,
                  ]
                    .map((value) => {
                      if (value === null || value === undefined) {
                        return ""; // Replace null or undefined values with an empty string
                      } else if (
                        typeof value === "string" &&
                        value.includes(",")
                      ) {
                        // Escape double quotes and wrap in double quotes if value contains comma
                        return `"${value.replace(/"/g, '""')}"`;
                      }
                      return value;
                    })
                    .join(",");

                  csvData += rowCsv + "\n";
                }
                const filePath = `${RNFS.DocumentDirectoryPath}/chatMessages.csv`;

                await RNFS.writeFile(filePath, csvData, "utf8");
                const fileStats = await RNFS.stat(filePath);

                // Set last backup date and time
                const currentDate = new Date();
                const formattedDateTime = currentDate.toLocaleString();
                // Store backup status in AsyncStorage

                if (isEnabled) {
                  await mediaBackup();
                }
                setTimeout(() => {
                  setlocalloading(false);
                  // await AsyncStorage.setItem('backupDateTime', formattedDateTime);
                  setlocalchatsize(fileStats.size);
                
                  dispatch(
                    backupSuccess({
                      dateTime: formattedDateTime,
                      fileSize: fileStats.size,
                    })
                  );
                  setUploadshow(true);
                  // await uploadToS3(senddateformate,fileStats.size)
                  // resolve();
                }, 2000);
              },
              (error) => {
                console.error("Error selecting from SQLite:", error);
                dispatch(backupFailure("Error selecting from SQLite"));
                reject(error);
              }
            );
          });
        });
      };
      const escapeCsvField = (value) => {
        if (value === null || value === undefined) {
          return "";
        } else if (typeof value === "string") {
          return `"${value.replace(/[\n\r]+/g, " ")}"`;
        }
        return value;
      };

      // Execute exportToCSV function
      await exportToCSV();
    } catch (error) {
      setlocalloading(false);
      console.error("no such file found", error);
    }
  };

  const mediaBackup = async () => {
    setmedialocalloading(true);
    try {
      const mediafilePath = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
      const zipmediaFilePath = `${RNFS.DocumentDirectoryPath}/TokeeMedia${globalThis.userChatId}.zip`;
      await zip(mediafilePath, zipmediaFilePath)
        .then((path) => {
          console.log(`zip completed at ${path}`);
        })
        .catch((error) => {
          // setmedialocalloading(false)
          dispatch(backupFailure("Error selecting from SQLite"));
          console.error(error);
        });

      const mediafileStats = await RNFS.stat(zipmediaFilePath);
      setTimeout(() => {
        setmedialocalloading(false);
        setlocalmediasize(mediafileStats.size);
        dispatch(backupmediaSuccess({ MediafileSize: mediafileStats.size }));
      }, 2000);
    } catch (error) {
      setmedialocalloading(false);
    }
  };

  const handleExportChat = async () => {
    dispatch(startBackup());
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/chatMessages.csv`;
      const mediafilePath = `${RNFS.DocumentDirectoryPath}/TokeeMedia${globalThis.userChatId}.zip`;

      // Get file stats to retrieve size
      const fileStats = await RNFS.stat(filePath);
      // const zipfileStats = await RNFS.stat(zipmediaFilePath);
      let zipfileStats;

      try {
        zipfileStats = await RNFS.stat(mediafilePath);
      } catch (error) {
        console.error("Error getting zip file stats:", error);
        zipfileStats = { size: 0 }; // Set default size to 0 or handle the error based on your requirement
      }

      // Set last backup date and time
      const currentDate = new Date();
      const formattedDateTime = currentDate.toISOString();

      await uploadToS3(formattedDateTime, fileStats.size, zipfileStats.size);
      // resolve();
    } catch (error) {
      dispatch(
        backupFailure(
          "Failed to export Chatmessages data. Please try again later."
        )
      );
    }
  };

  const uploadToS3 = async (senddateformate, fileSize, MediafileSize) => {
     // eslint-disable-next-line
    const AWS = require("aws-sdk");


    const filePath = `${RNFS.DocumentDirectoryPath}/chatMessages.csv`;
    const mediafilePath = `${RNFS.DocumentDirectoryPath}/TokeeMedia${globalThis.userChatId}.zip`;

    try {
      const bucket = new AWS.S3({
        bucketName: "tokee-chat-staging",
        region: "us-east-2",
        accessKeyId: globalThis.accessKey,
        secretAccessKey: globalThis.awsSecretAccessKey,
        s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/",
      });

      const folderName = "Backup/";

      const fileContent = await RNFS.readFile(filePath, "utf8");
      // Upload chat backup
      const chatParams = {
        Bucket: "tokee-chat-staging",
        Key: folderName + `chatMessages${globalThis.userChatId}.csv`,
        Body: fileContent,
        ContentType: "application/csv",
      };

      let chatData, mediaData;

      try {
        const chatFileStats = await RNFS.stat(filePath);
        const chatTotalBytes = chatFileStats.size;

        chatData = await bucket
          .upload(chatParams)
          .on("httpUploadProgress", function (progress) {
            const uploadedBytes = progress.loaded;
            const percentage = Math.round(
              (uploadedBytes / chatTotalBytes) * 100
            );
            dispatch(setChatUploadProgress(percentage));
          })
          .promise();

        // Clean up: Delete the local chat zip file after upload
        await RNFS.unlink(filePath);

        // Upload media backup if isEnabled is true

        if (isEnabled) {
          const fileBase64 = await RNFS.readFile(mediafilePath, "base64");

          const bufferData = Buffer.from(fileBase64, "base64");
          const mediaParams = {
            Bucket: "tokee-chat-staging",
            Key: folderName + `TokeeMedia${globalThis.userChatId}.zip`,
            Body: bufferData,
            ContentType: "application/zip",
          };

          const mediaFileStats = await RNFS.stat(mediafilePath);
          const mediaTotalBytes = mediaFileStats.size;

          mediaData = await bucket
            .upload(mediaParams)
            .on("httpUploadProgress", function (progress) {
              const uploadedBytes = progress.loaded;
              const percentage = Math.round(
                (uploadedBytes / mediaTotalBytes) * 100
              );
              dispatch(setMediaUploadProgress(percentage));
            })
            .promise();

          // Clean up: Delete the local media zip file after upload
          await RNFS.unlink(mediafilePath);
        }
      } catch (uploadError) {
        dispatch(backupFailure("Failed to upload backup data to S3."));
        console.error("Error uploading to S3:", uploadError);
        throw uploadError;
      }

      // Call updateBackupInfo after both uploads are successful
      const parsedDate = moment(senddateformate);
      const formattedDate = parsedDate.format("MM/DD/YYYY, h:mm A");
      await updateBackupInfo({
        chat_backup_url: chatData.Location,
        chat_backup_size: fileSize,
        chat_media_backup_url: isEnabled ? mediaData.Location : "",
        chat_media_backup_size: isEnabled ? MediafileSize : "",
        chat_backup_platform: Platform.OS,
        chat_backup_date_time: formattedDate,
      });

      return chatData.Location;
    } catch (error) {
      dispatch(
        backupFailure(
          "Failed to export Chatmessages data. Please try again later."
        )
      );
      console.error("Error during backup process:", error);
      throw error;
    }
  };

  const updateBackupInfo = async (backupdata) => {
    const urlStr = Base_Url + "user/update-chat-backup";
    try {
      await axios({
        method: "post",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
        data: backupdata,
      })
        .then(async (response) => {
          if (response.data.status == true) {

            // Store backup status in AsyncStorage
            await AsyncStorage.setItem(
              "chat_backup_size",
              localchatsize.toString()
            );
            await AsyncStorage.setItem(
              "chat_media_backup_size",
              localmediasize.toString()
            );
            await AsyncStorage.setItem(
              "chat_backup_date_time",
              backupdata.chat_backup_date_time.toString()
            );
            await AsyncStorage.setItem("chat_backup_platform", Platform.OS);
            // await AsyncStorage.setItem('backupDateTime', formattedDateTime);
            await AsyncStorage.setItem("isBackupInProgress", "false");

            setlocallastbackuptime(backupdata.chat_backup_date_time);
           // setLastBackupDateTimeapi(backupdata.chat_backup_date_time);
            dispatch(
              backupSuccess({
                dateTime: backupdata.chat_backup_date_time,
                fileSize: fileSize,
              })
            );
            dispatch(setbackupsuccessfull(true));
            dispatch(setLoaderprocess(0));
            dispatch(setChatUploadProgress(0));
            dispatch(setMediaUploadProgress(0));
          } 
        })
        .catch((error) => {
          console.error("chat backup unsuccessfully update", error);
        });
    } catch (error) {
      console.error("chat backup unsuccessfully update", error);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "-";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };



  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },

    chatTopContainer: {
      backgroundColor: themeModule().theme_background,
      paddingBottom: 20,
    },

    chatContainer: {
      backgroundColor: "white",
      borderWidth: 10,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: windowHeight,
    },

    modalText: {
      color: COLORS.black,
      fontSize: 20,
      alignSelf: "center",
      fontFamily: font.semibold(),
    },
    textInput: {
      backgroundColor: searchBar().back_ground,
      borderWidth: 1,
      borderRadius: 10,
      marginHorizontal: 10,
      fontSize: FontSize.font,
      paddingLeft: 10,
      opacity: 0.8,
      marginTop: 20,
      color: COLORS.black,
      height: 48,
      fontFamily: font.semibold(),
    },
    feedbackTextInput: {
      height: 150,
      backgroundColor: searchBar().back_ground,
      borderWidth: 1,
      borderRadius: 10,
      marginHorizontal: 10,
      paddingLeft: 10,
      opacity: 0.8,
      marginTop: 20,
      color: "#fff",
    },
    submiBtn: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: "#3aff13",
      width: "45%",
      justifyContent: "center",
      alignItems: "center",
    },
    button: {
      height: 50,
      marginTop: 50,
      borderRadius: 10,
      marginHorizontal: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: iconTheme().iconColor,
    },
    buttonText: {
      fontSize: FontSize.font,
      color: COLORS.white,
      fontFamily: font.bold(),
    },
  });

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      {/* // **********  Status Bar    ********** // */}
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
          showTitleForBack={true}
          title={t("chat_backup")}
          backArrow={true}
          checked={
            globalThis.selectTheme
          }
          navState={navigation}
        />

        {
          globalThis.selectTheme === "christmas" || 
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
              resizeMode="cover"
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
        <View style={styles.chatTopContainer}></View>

        <View style={styles.groupContainer}></View>
      </View>
      {/* // ********** View for Profile View    ********** // */}

      <View style={styles.chatContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
          behavior={Platform.OS == "android" ? "height" : "padding"}
          enabled
        >
          <ScrollView
            style={{
              height: "auto",
            }}
          >
            <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Image
                  style={{
                    width: 50,
                    height: 50,
                    tintColor: iconTheme().iconColor,
                    marginRight: 20,
                  }}
                  resizeMode="contain"
                  source={require("../../Assets/Icons/backupimage.png")}
                />
                <View style={{ flex: 1 }}>
                
                 
                  <Text style={{ marginTop: 10, fontFamily: font.semibold() }}>
                    {t("last_backup_upload")}: {locallastbackuptime}
                  </Text>
                  {/* <Text>Size: {formatBytes(fileSize)}</Text> */}
                  <Text style={{ fontFamily: font.semibold() }}>
                    {t("chat_backup_size")}{" "}
                    {formatBytes(parseInt(localchatsize))}
                  </Text>
                  {parseInt(localmediasize) > 0 ? (
                    <Text style={{ fontFamily: font.semibold() }}>
                      {t("media_backup_size")} {formatBytes(parseInt(localmediasize))}
                    </Text>
                  ) : (
                    isEnabled && (
                      <Text style={{ fontFamily: font.semibold() }}>
                     {t("media_backup_size")}{" "}
                        {formatBytes(parseInt(localmediasize))}
                      </Text>
                    )
                  )}
                  <Text style={{ fontFamily: font.semibold() }}>
                    {t("total_backup_size")}{" "}
                    {formatBytes(
                      parseInt(localchatsize) + parseInt(localmediasize)
                    )}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  marginTop: 15,
                  color: COLORS.black,
                  fontSize: 14,
                  //  alignSelf: "center",
                  fontFamily: font.semibold(),
                  flex: 1,
                }}
              >
                {t("back_up_your_chat_history_and_media")}{" "}
              </Text>
             
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: 16,
                    //  alignSelf: "center",
                    fontFamily: font.semibold(),
                  }}
                >
                  {t("Include_media")}
                </Text>
                <Switch
                  trackColor={{ false: "#767577", true: iconTheme().iconColor }}
                  thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(e) => {
                  
                    setUploadshow(false);
                    dispatch(toggleSwitch(e));
                  }}
                  value={isEnabled}
                  disabled={isBackupInProgress || localloading}
                />
              </View>
              {localloading && !backupsuccessfull && !isBackupInProgress && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                    {t("chat_backup_in_progress")}
                  </Text>
                  <ActivityIndicator animating size="small" color={"#7FD25A"} />
                </View>
              )}

              {uploadshow && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                    {t("chat_backup")}
                  </Text>
                  <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                    {t("done")}
                  </Text>
                </View>
              )}
              {isEnabled && uploadshow && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                    {t("media_backup")}
                  </Text>
                  <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                    {t("done")}
                  </Text>
                </View>
              )}

              {isBackupInProgress && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                    {t("backup_uploading")}
                  </Text>
                  <ActivityIndicator animating size="small" color={"#7FD25A"} />
                </View>
              )}
              {backupsuccessfull && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                    {t("backup_Upload")}
                  </Text>
                  <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                    {t("done")}
                  </Text>
                </View>
              )}

              {medialocalloading &&
                !backupsuccessfull &&
                !isBackupInProgress && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ fontSize: 16, fontFamily: font.semibold() }}>
                      {t("media_backup_in_progress")}
                    </Text>
                    <ActivityIndicator
                      animating
                      size="small"
                      color={"#7FD25A"}
                    />
                  </View>
                )}

              {uploadshow && !backupsuccessfull && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 15, fontFamily: font.semibold() }}>
                    {t("afetr_chat_back_up")}
                  </Text>
                  {/* <ActivityIndicator animating size="small" color={"#7FD25A"} /> */}
                </View>
              )}

              {isBackupInProgress && (
                <>
                  {!isEnabled ? (
                    <View
                      style={{
                        width: "100%",
                        height: 7,
                        backgroundColor: "#e0e0e0",
                        borderRadius: 10,
                        overflow: "hidden",
                        marginBottom: 10,
                        marginTop: 20,
                      }}
                    >
                      <View
                        style={{
                          width: `${
                            ChatUploadProgress > 100 ? 100 : ChatUploadProgress
                          }%`,
                          height: "100%",
                          backgroundColor: iconTheme().iconColor,
                        }}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <View
                        style={{
                          width: "50%",
                          height: 7,
                          backgroundColor: "#e0e0e0",
                          borderRadius: 10,
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          overflow: "hidden",
                          marginBottom: 10,
                          marginTop: 20,
                        }}
                      >
                        <View
                          style={{
                            width: `${
                              ChatUploadProgress > 100
                                ? 100
                                : ChatUploadProgress
                            }%`,
                            height: "100%",
                            backgroundColor: iconTheme().iconColor,
                          }}
                        />
                      </View>
                      <View
                        style={{
                          width: "50%",
                          height: 7,
                          backgroundColor: "#e0e0e0",
                          borderRadius: 10,
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          overflow: "hidden",
                          marginBottom: 10,
                          marginTop: 20,
                        }}
                      >
                        <View
                          style={{
                            width: `${
                              MediaUploadProgress > 100
                                ? 100
                                : MediaUploadProgress
                            }%`,
                            height: "100%",
                            backgroundColor: iconTheme().iconColor,
                          }}
                        />
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            {!backupsuccessfull ? (
              <TouchableOpacity
                disabled={
                  localloading || medialocalloading || isBackupInProgress
                    ? true
                    : false
                }
                style={[
                  styles.button,
                  {
                    opacity:
                      localloading || medialocalloading || isBackupInProgress
                        ? 0.5
                        : 1,
                  },
                ]}
                onPress={() => {
                  if (!isBackupInProgress && !uploadshow) {
                    takeLocalBackUp();
                  } else {
                    handleExportChat();
                  }
                }}
              >
                {isBackupInProgress ? (
                  <Text style={styles.buttonText}>{t("uploading")}</Text>
                ) : (
                  <Text style={styles.buttonText}>
                    {" "}
                    {!isBackupInProgress && !uploadshow
                      ? t("backup_now")
                      : t("upload_backup")}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  height: 50,
                  marginTop: 50,
                  // borderRadius: 10,
                  marginHorizontal: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  // backgroundColor: "#7FD25A",
                }}
              >
                {/* <Text style={{ fontSize: 16, fontFamily: font.semibold(), textAlign: "center" }}>Backup Uploaded Successfully.</Text> */}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </MainComponent>
  );
}
