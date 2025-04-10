
// import { Alert } from "react-native";
import RNFS from "react-native-fs";
import { Alert, Platform } from "react-native";
import { updateLocalPathInChannelMessages, updateLocalPathInChatMessages } from "../../sqliteStore";
import { updateMediaLoader } from "../../reducers/getAppStateReducers";
import { store } from "../../store";

export default async function MediaDownload(roomType:any,props : any, roomId : any, MediaUpdated : any, newMessage : any) {
  console.log("props.messageIdprops.messageId",props)
  let pathObj = {};

  store.dispatch(updateMediaLoader({
    messageId: props.messageId,
    //@ts-expect-error
    isMediaLoader: true,
  }));
  let mainDirectory = "";
  if (Platform.OS === "android") {
    mainDirectory = `file://${RNFS.DocumentDirectoryPath}/TokeeMedia`;
  } else {
    mainDirectory = `${RNFS.DocumentDirectoryPath}/TokeeMedia`;
  }

  let subDirectory = "";
  switch (props.messageType) {
    case "image":
      subDirectory = `${mainDirectory}/Images`;
      break;
    case "video":
      subDirectory = `${mainDirectory}/Videos`;
      break;
    case "document":
      subDirectory = `${mainDirectory}/Documents`;
      break;
    default:
      subDirectory = `${mainDirectory}/Others`;
      break;
  }

  // Ensure main directory exists
  const mainDirectoryExists = await RNFS.exists(mainDirectory);
  if (!mainDirectoryExists) {
    await RNFS.mkdir(mainDirectory);
  }

  // Ensure subdirectory exists
  const subDirectoryExists = await RNFS.exists(subDirectory);
  if (!subDirectoryExists) {
    await RNFS.mkdir(subDirectory);
  }

  // Use a for loop with await to ensure sequential downloads
  for (let index = 0; index < props.attachment.length; index++) {
    const attach = props.attachment[index];
    const file = attach;
    let mediaName = attach.split("/").pop();
    let mediaId = mediaName.split(".").slice(0, -1).join(".");

    // Use index to ensure the filename is unique
    const filename = props.messageType === "image"
      ? `${mediaId}.jpg`
      : props.messageType === "video"
      ? `${mediaName}`
      : props.messageType === "document"
      ? `${mediaName}`
      : `${mediaName}`;

      console.log("medianme ====",mediaName)
    
    const encoded = encodeURIComponent(filename);
    let destinationPath = `${subDirectory}/${encoded}`;
    
    // Check if the destination path already exists in pathObj
    if (Object.values(pathObj).includes(destinationPath)) {
      continue; // Skip the current iteration
    }


    if (destinationPath.includes(".mp3") && Platform.OS == "ios") {
      console.log("inside this if")
      destinationPath = destinationPath.replace(".mp3", ".m4a");
    }
    console.log("destinationPath>>>>>>>>>> ====",destinationPath)
    try {
      
      const downloadResult = await RNFS.downloadFile({
        fromUrl: file, // URL of the file to be downloaded
        toFile: destinationPath,
        background: true,
      }).promise;

      if (downloadResult.statusCode === 200) {
        store.dispatch(updateMediaLoader({
          messageId: props.messageId,
          //@ts-expect-error
          isMediaLoader: false,
        }));
      

        // Verify if the file exists at the destination path
        const fileExists = await RNFS.exists(destinationPath);
        if (fileExists) {          
          console.log("props in medi adownload",roomType)
          console.log("chatttttttttt",roomType)
          // Update local path in chat messages only if it's not already updated
          if (roomType == "chat") {
           
            updateLocalPathInChatMessages(props.messageId, destinationPath, (res) => {
              if (res) {
                console.log("local path is updated");
              } else {
                console.log("local path can't be updated");
              }
            });
          }else{
            console.log("dfdfdfdfdfdfdfdfdfdf")
            updateLocalPathInChannelMessages(props.messageId, destinationPath, (res) => {
              if (res) {
                console.log("local path is updated");
              } else {
                console.log("local path can't be updated");
              }
            });
          }
          

          // Accumulate paths in pathObj
          pathObj[index] = destinationPath;

          // Check if all downloads are complete
          if (Object.keys(pathObj).length === props.attachment.length) {
            // Convert pathObj to an array of paths
            const pathsArray = Object.keys(pathObj).sort().map((key) => pathObj[key]);
          
            if (newMessage) {
              MediaUpdated(props.messageId, pathsArray, newMessage);
            } else {
              MediaUpdated(props.messageId, pathsArray);
            }
            console.log("wqqwqwqqwqwq")
          }
        } else {
          console.log("File does not exist at the destination path:", destinationPath);
        }
      } else {
        Alert.alert("Media not available.","Ask sender to send it again.");
        store.dispatch(updateMediaLoader({
          messageId: props.messageId,
          //@ts-expect-error
          isMediaLoader: false,
        }));
      
      }
    } catch (err) {
      Alert.alert("Media not available.","Ask sender to send it again.")
      store.dispatch(updateMediaLoader({
        messageId: props.messageId,
        //@ts-expect-error
        isMediaLoader: false,
      }));
    
    }
  }
}

