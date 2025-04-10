import { Platform, Vibration } from "react-native";
import Sound from "react-native-sound";
import { Base_Url, Base_Url2, chatBaseUrl, check_file_nudity, create_new_room, get_violation_attempt, update_call_status, update_violation_attempt } from "../../Constant/Api";
import axios from "axios";
import { useSelector } from "react-redux";
import { log } from "react-native-sqlite-storage/lib/sqlite.core";

export const PlaySound = (file, totalDuration = 90000) => {

  if (globalThis.silent == true) {
    Vibration.vibrate([1000, 500, 1000], true);
  } else {
    Vibration.vibrate([1000, 500, 1000], true);
    this.music = new Sound(file, null, (error) => {
      if (error) {
        console.log("Error >>>>>>", error);
      }

      let startTime = new Date().getTime();
      let isPlaying = false;

      const playLoop = () => {
        isPlaying = true;
        this.music.play((success) => {
          if (success) {
            const currentTime = new Date().getTime();
            const elapsedDuration = currentTime - startTime;
            if (elapsedDuration < totalDuration && isPlaying) {
              // Continue playing in a loop until the total duration is reached
              playLoop();
            } else {
              this.music.release();
              isPlaying = false;
            }
          } else {
            console.log("playback failed due to audio decoding errors");
          }
        });
      };

      playLoop();
    });
  }
};

export const StopIncomingSound = () => {
  Vibration.cancel();
  if (this.music != null) {
    console.log("Stopping Sound >>>>>>>>>>>>>>>>>>>>>>>>>")
    this.music.stop();
    this.music == null;
    Vibration.cancel();
  }
};


let isCallInProgress = false; // Flag to prevent duplicate calls

export const startCallStatus = async (type, channel) => {
  if (isCallInProgress) return; // Prevent multiple executions
  isCallInProgress = true; // Set flag before API call


    const url = Base_Url2 + update_call_status;
  try {
    const response = await axios.post(
      url,
      { channel_name: channel, status: type },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + globalThis.token,
        },
      }
    );

    console.log("Response Agora Index End Call:", response.data);
  } catch (error) {
    console.error("API Error:", error);
  } finally {
    setTimeout(() => {
      isCallInProgress = false;
      console.log("API call allowed again");
    }, 6000);
  }
};



export const createRoomRequest = async (roomOwnerId, roomMembers) => {
  try {
 
    const url = chatBaseUrl + create_new_room;

    // Prepare the request body
    const requestBody = {
      roomOwnerId: roomOwnerId,
      roomMembers: roomMembers
    };

    console.log("requestBody",requestBody)

    // const requestBody = {
    //   roomOwnerId: '65a459380cdaf49b6c7306b7',
    //   roomMembers:  [
    //     "65a459380cdaf49b6c7306b7",
    //     "65a198b30cdaf49b6c72a695"
    //   ]
    // };

    // Make the POST request using Axios
    const response = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + globalThis.token,
      }
    });

    // Handle the response data
    console.log('Response:', response.data);
    return response.data;

  } catch (error) {
    // Handle any error that occurs during the request
    console.error('Error creating room:', error);
    throw error; // Optional, rethrow or return error for further handling
  }
};


// createRoomRequest()
//   .then((data) => {
//     console.log('Room Created:', data);
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//   });



export const updateViolationAttempt = async (resion) => {
  const token = globalThis.Authtoken;
  log('token===================',token)
  try {
    const response = await axios.post(Base_Url + update_violation_attempt, 
      {
        resion: resion,  // Send 'resion' as body data (JSON format)
        ignore_notification: 1
      },
      {
        headers: {
          'Accept': 'application/json',
          Authorization: "Bearer " + globalThis.Authtoken, // Use the provided auth token
        }
      }
    );
    
    if (response.data.status === true) {
      return { success: true, data: response.data.data.user};
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return { success: false, message: 'An error occurred while making the request' };
  }
};



export const fetchViolationAttempt = async () => {
  const token = globalThis.Authtoken;
  log('token===================',token)
  try {
    const response = await axios.get(
      Base_Url + get_violation_attempt,
      {
        headers: {
          Accept: 'application/json',
          Authorization: "Bearer " + token,
        },
      }
    );
    console.log('response.data?.data?.user====================================',response.data?.data?.user);
    
    return response.data?.data?.user;
  } catch (error) {
    console.error('Error fetching violation attempt:', error.response?.data || error.message);
    throw error;
  }
};



// Function to check nudity using API
// export const checkImageNudity = async (imageUri) => {
//   try {
//     const formData = new FormData();
//        if (imageUri !== null) {
//         formData.append("file", {
//                 uri:
//                   Platform.OS === "android"
//                     ? imageUri
//                     : imageUri.replace("file://", ""),
//                 type: "image/jpeg", // or photo.type
//                 name: "userImage.jpg",
//               });
//             }

//     const url = Base_Url + check_file_nudity

//     const response = await axios.post(
//       url,
//       formData,
//       {
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );

//     console.log('Response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error uploading file:', error);
//   }

// };



// export const checkImageNudity = async (imageUri) => {
//   try {
//     if (!imageUri) {
//       console.error("No image URI provided");
//       return null;
//     }

//     let formData = new FormData(); // Ensure fresh FormData each time
//     formData.append("file", {
//       uri:
//       Platform.OS === "android"
//         ? imageUri
//         : imageUri.replace("file://", ""),
//       type: "image/jpeg",
//       name: "userImage.jpg",
//     });

//     const url = `${Base_Url}${check_file_nudity}`;
//     console.log("API URL:", url);

//     const response = await axios.post(url, formData, {
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     console.log("API Response:", response.data);
//     return response.data;
//   } catch (error) {
//     alert(error.response?.data || error.message);
//     return null;
//   }
// };



export const checkImageNudity = async (imageUri, retryAttempt = 2) => {
  try {
    if (!imageUri) {
      console.error("No image URI provided");
      return null;
    }

    let formData = new FormData();
    formData.append("file", {
      uri: Platform.OS === "android" ? imageUri : imageUri.replace("file://", ""),
      type: "image/jpeg",
      name: "userImage.jpg",
    });

    const url = `${Base_Url}${check_file_nudity}`;
    console.log("API URL:", url);

    const response = await axios.post(url, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.message);

    // Retry once if it's a network error and no previous retry attempt was made
    if (retryAttempt > 0 && error.message === "Network Error") {
      console.log("Retrying API call...");
      return await checkImageNudity(imageUri, retryAttempt - 1);
    }

    alert(error.response?.data || error.message);
    return null;
  }
};



export const getRemainingSuspensionDays = (OldDate) => {
  if (!OldDate) return 0;
      // Create a Date object for the OldDate
      let oldDate = new Date(OldDate);
    
      // Get the current date
      let currentDate = new Date();
      
      // Calculate the difference in milliseconds
      let diffInMilliseconds = oldDate - currentDate;
  
      // Convert milliseconds to days (1 day = 86400000 milliseconds)
      let diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
  
      // Return the difference in days rounded down to the nearest whole number
      return Math.floor(diffInDays) + 1;
};







