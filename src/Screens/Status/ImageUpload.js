import CameraRoll from "@react-native-community/cameraroll";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { decode } from "base64-arraybuffer";
import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  PanResponder,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { ColorMatrix } from "react-native-color-matrix-image-filters";
import { Image as ImageCompress } from "react-native-compressor";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ImagePicker from "react-native-image-crop-picker";
import ViewShot from "react-native-view-shot";
import RNFetchBlob from "rn-fetch-blob";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { COLORS, textTheme, themeModule } from "../../Components/Colors/Colors";
import SearchBar from "../../Components/SearchBar/SearchBar";
import ColorPicker from "../../Components/dargText/ColorPicker";
import DraggableImage from "../../Components/dargText/DraggableImage";
import DraggableText from "../../Components/dargText/DraggableText";
import FontPicker from "../../Components/dargText/FontPicker";
import MainImage from "../../Components/dargText/MainImage";
import { filters } from "../../Components/dargText/filter";
import {
  Base_Url,
  add_story,
  storyDelete_files,
  story_files,
} from "../../Constant/Api";
import { accessKeyId, secretAccessKey } from "../../Constant/Key";
import { LoaderModel } from "../Modals/LoaderModel";
import { font } from "../../Components/Fonts/Font";
import { useSelector } from "react-redux";
import MentionList from "../../Components/dargText/MentionList";

var selectedTag = {};

export const ImageUploadGallery = ({ route, navigation }) => {
  const [textInputs, setTextInputs] = useState([]);
  const [textInputValue, setTextInputValue] = useState("");
  const [activeTextId, setActiveTextId] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const ref = useRef();
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [editedText, setEditedText] = useState(""); // State to track edited text value
  const [chooseColor, setColor] = useState(false);
  const [showDelete, setShowDelete] = useState("");
  const [filterView, setFilterView] = useState(false);
  const [filterButton, setFilterButton] = useState(true);
  const [fontF, setFont] = useState("IBMPlexSans-Bold");
  const [fontView, setFontView] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState([]); // List of images
  const [activeImageId, setActiveImageId] = useState(null); // ID of the currently active image
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageDelete, setShowImageDelete] = useState("");
  const [postButton, setPostButton] = useState(true);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const ITEM_WIDTH = (Dimensions.get("window").width - 40) / 5; // Width of each filter item
  const flatListRef = useRef(null);
  const [loaderMoedl, setloaderMoedl] = useState(false);
  const [gifStyle, setGifStyle] = useState([]);
  const [gif, setGif] = useState([]);
  const [imageModal, setImageModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [count, setCount] = useState(1);
  const [imageDrag, setImageDrag] = useState(false);
  const [bigButton, setBigButton] = useState(false);
  const [textBigButton, setTextBigButton] = useState(false);
  const [deleteActiveId, setDeleteActiveId] = useState("");
  const [showText, setShowText] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleteImagePath, setDeleteImagePath] = useState("");
  const [mainImageStyle, setMainImageStyle] = useState({
    scale: 1,
    rotation: 0,
  });

  const [buttonSize] = useState(new Animated.Value(50));
  const [mainImage, setMainImage] = useState(route?.params?.path);
  const [text, setText] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [showCaption, setShowCaption] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showCaptionTextView, setShowCaptionTextView] = useState(false);
  const [menstion, setMenstion] = useState([]);
  const textCaptionRef = useRef(null);
  const friendsData = useSelector((state) => state.friendListSlice.friends);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [mentions, setMentions] = useState([]); // To store mentions wisth their chat_user_id

  const userPremium = useSelector(
    (state) => state?.friendListSlice.userPremium
  );

  var selectedTag = {};

  useEffect(() => {
    setMainImage(route?.params?.path);
  }, [route?.params?.path]);

  useEffect(() => {
    Animated.timing(
      buttonSize, // The value to drive
      {
        toValue: bigButton == true || textBigButton == true ? 80 : 50, // Target value based on state
        duration: 300, // Duration in milliseconds
        useNativeDriver: false, // Make sure to set useNativeDriver to false for resizeMode to work
      }
    ).start(); // Start the animation
  }, [bigButton, textBigButton]);

  const key =
    "https://api.giphy.com/v1/stickers/trending?api_key=eHLYkE77kt386j79DTy0JVTQDraSgBob&limit=500&offset=0";

  const gifSearch =
    "https://api.giphy.com/v1/stickers/search?api_key=eHLYkE77kt386j79DTy0JVTQDraSgBob&";

  const [prevStyles, setPrevStyles] = useState({
    position: { x: 100, y: 400 },
    scale: 1,
    rotation: 0,
  });

  useEffect(() => {
    gifApiCall();
  }, []);

  const gifApiCall = async () => {
    const res = await fetch(key);
    const json = await res.json();
    setGif(json.data);
  };

  const gifSearchApiCall = async (str) => {
    const res = await fetch(gifSearch + "q=" + str);
    const json = await res.json();
    setGif(json.data);
    // setGif(json.data);
  };

  //////////////////////////////////////////////mention friends/////////////////////////


  const handleInputChange = (inputText) => {
    setText(inputText);
    if (!userPremium) {
      // If not premium, do not filter or suggest mentions
      setFilteredFriends([]);
      return;
    }

    // Find the last occurrence of '@' in the input text
    const lastAtIndex = inputText.lastIndexOf("@");

    // Track mentioned users in a set
    const mentionedUsers = new Set();
    inputText.split(/\s+/).forEach((word) => {
      if (word.startsWith("@")) {
        mentionedUsers.add(word.slice(1).toLowerCase()); // Add display name to set without '@' and in lowercase
      }
    });

    // Check if '@' is found and handle accordingly
    if (lastAtIndex !== -1) {
      const searchText = inputText.slice(lastAtIndex + 1).toLowerCase();

      // If '@' is followed by nothing or non-space characters
      if (searchText === "" || searchText.search(/\s/) === -1) {
        if (searchText === "") {
          // Show all friends if only "@" is entered, excluding already mentioned
          const filteredFriends = friendsData.filter(
            (friend) =>
              !mentionedUsers.has(friend.display_name.toLowerCase()) &&
              !mentionedUsers.has(friend.name.toLowerCase())
          );
          setFilteredFriends(filteredFriends);
        } else {
          // Show matching friends based on input, excluding already mentioned
          const matchingFriends = friendsData.filter(
            (friend) =>
              (friend.name.toLowerCase().includes(searchText) ||
                friend.display_name.toLowerCase().includes(searchText)) &&
              !mentionedUsers.has(friend.display_name.toLowerCase()) &&
              !mentionedUsers.has(friend.name.toLowerCase())
          );
          setFilteredFriends(matchingFriends);
        }
      } else {
        setFilteredFriends([]);
      }
    } else {
      setFilteredFriends([]);
    }
  };

  const handleFriendPress = (friend) => {
    const mentionText = `@${friend.display_name} `;
    selectedTag = friend;

    setText((prevText) => {
      // Split the text into words
      const textArray = prevText.trim().split(" ");

      // Remove the last word only if it's not empty
      if (textArray[textArray.length - 1] !== "") {
        textArray.pop();
      }

      // Join the array back into a string and add the mention text
      return textArray.join(" ") + " " + mentionText;
    });

    setMentions((prevMentions) => [
      ...prevMentions,
      { name: friend.display_name, chat_user_id: friend.chat_user_id },
    ]);

    setFilteredFriends([]);
  };

  ///////////////////////25huly/////////////////////////////////////////
  // const renderTextWithMentions = (inputText) => {
  //   const urlRegex =
  //     /((https?|ftp|file|mailto|tel|data|ws|wss):\/\/[^\s]+|www\.[^\s]+)/g;
  //   const mentionRegex = new RegExp(
  //     `(${friendsData.map((friend) => `@${friend.name}`).join("|")})`,
  //     "g"
  //   );

  //   const combinedRegex = new RegExp(
  //     `(${urlRegex.source})|(${mentionRegex.source})`,
  //     "g"
  //   );
  //   const parts = inputText.match(combinedRegex) || [];

  //   let lastIndex = 0;
  //   const elements = [];
  //   const mentionedUsers = new Set();

  //   parts.forEach((part, index) => {
  //     console.log('part parts====================================',parts);

  //     const partIndex = inputText.indexOf(part, lastIndex);

  //     if (partIndex > lastIndex) {
  //       elements.push(
  //         <Text key={`${lastIndex}-text`}>
  //           {inputText.slice(lastIndex, partIndex) + " "}
  //         </Text>
  //       );
  //     }

  //     if (urlRegex.test(part)) {
  //       elements.push(
  //         <Text
  //           key={`${index}-url`}
  //           style={{ color: "blue", textDecorationLine: "underline" }}
  //         >
  //           {part}
  //         </Text>
  //       );
  //     } else if (friendsData.some((friend) => `@${friend.name}` === part)) {
  //       console.log('part====================================',part);
  //       const displayName = part.slice(1); // Remove '@' to get display name
  //       console.log('displayName====================================',!mentionedUsers.has(displayName)
  //       );
  //       if (!mentionedUsers.has(displayName)) {
  //         elements.push(
  //           <Text
  //             key={`${index}-mention`}
  //             style={{ color: "blue", fontWeight: "bold" }}
  //           >
  //             {part}
  //           </Text>
  //         );
  //         mentionedUsers.add(displayName);
  //       }
  //     }

  //     lastIndex = partIndex + part.length;
  //   });

  //   if (lastIndex < inputText.length) {
  //     elements.push(
  //       <Text key={`${lastIndex}-end`}>{inputText.slice(lastIndex)}</Text>
  //     );
  //   }

  //   console.log('elements====================================',elements);

  //   return elements;
  // };
  ///////////////////////////////////////////////////////////////////////
  const renderTextWithMentions = (inputText) => {
    if (!userPremium) {
      // If the user is not premium, return plain text
      return <Text>{inputText}</Text>;
    }

    // Regular expressions for URLs and mentions
    const urlRegex =
      /((https?|ftp|file|mailto|tel|data|ws|wss):\/\/[^\s]+|www\.[^\s]+)/g;
    const mentionRegex = new RegExp(
      `(${mentions.map((mention) => `@${mention.name}`).join("|")})`,
      "g"
    );

    // Combine both regex patterns
    const combinedRegex = new RegExp(
      `(${urlRegex.source})|(${mentionRegex.source})`,
      "g"
    );
    const parts = inputText.match(combinedRegex) || [];

    let lastIndex = 0;
    const elements = [];
    const mentionedUsers = new Set();

    parts.forEach((part, index) => {
      const partIndex = inputText.indexOf(part, lastIndex);

      // Push preceding text as a regular Text element
      if (partIndex > lastIndex) {
        elements.push(
          <Text key={`${lastIndex}-text`}>
            {inputText.slice(lastIndex, partIndex)}
          </Text>
        );
      }

      if (urlRegex.test(part)) {
        // URL part
        elements.push(
          <Text
            key={`${index}-url`}
            style={{ color: "blue", textDecorationLine: "underline" }}
          >
            {part}{" "}
          </Text>
        );
      } else {
        // Mention part or regular text
        const mentionName = part.slice(1); // Remove '@' to get the mention name
        const isMentioned = mentions.some(
          (mention) => mention.name.toLowerCase() === mentionName.toLowerCase()
        );

        if (isMentioned) {
          if (!mentionedUsers.has(mentionName)) {
            elements.push(
              <Text
                key={`${index}-mention`}
                style={{ color: "blue", fontWeight: "bold" }}
              >
                {part}{" "}
              </Text>
            );
            mentionedUsers.add(mentionName);
          }
        } else {
          elements.push(<Text key={`${index}-regular`}>{part} </Text>);
        }
      }

      lastIndex = partIndex + part.length;
    });

    // Append any remaining text after the last match
    if (lastIndex < inputText.length) {
      elements.push(
        <Text key={`${lastIndex}-end`}>{inputText.slice(lastIndex)}</Text>
      );
    }

    return elements;
  };

  const updateMentionsFromText = (input) => {
    console.log("Inside update mentions >>>>> ", input);
    // Regular expression to match mentions starting with '@' followed by letters, digits, underscores, or spaces
    const mentionRegex = /@([a-zA-Z\d_]+)/g;
    const extractedMentions = [];
    let match;

    // Extract all mentions using the regular expression
    while ((match = mentionRegex.exec(input)) !== null) {
      const mentionName = match[1].trim();
      if (mentionName.length > 0) {
        // Find a friend with the exact display_name
        const friend = friendsData.find(
          (f) => f.display_name.toLowerCase() === mentionName.toLowerCase()
        );
        if (friend) {
          extractedMentions.push({
            name: friend.display_name,
            chat_user_id: friend.chat_user_id,
          });
        }
      }
    }

    // Compare extracted mentions with the current mentions
    const updatedMentions = mentions.filter((mention) =>
      extractedMentions.some(
        (newMention) => newMention.chat_user_id === mention.chat_user_id
      )
    );

    // Add any new valid mentions
    extractedMentions.forEach((newMention) => {
      if (
        !updatedMentions.some(
          (mention) => mention.chat_user_id === newMention.chat_user_id
        )
      ) {
        // updatedMentions.push(newMention);
      }
    });

    setMentions(updatedMentions);
  };

  

  

  /////////////////////////////////////////////////////////////////////////

  // const updateMentionsFromText = (input) => {
  //   // Regular expression to match mentions starting with '@' followed by letters, spaces, or digits
  //   console.log("Inside update mentions >>>>> ",input)
  //   const mentionRegex = /@([a-zA-Z\d\s]+)/g;

  //   // Extract all mentions using the regular expression
  //   const extractedMentions = [];
  //   let match;

  //   while ((match = mentionRegex.exec(input)) !== null) {
  //     const mentionName = match[1].trim(); // Trim spaces around the mention
  //     if (mentionName.length > 0) {
  //       // Find a friend with the exact name
  //       // const friend = friendsData.find(
  //       //   (f) => f.name.toLowerCase() === mentionName.toLowerCase()
  //       // );
  //       const friend = friendsData.filter(
  //         (f) => f.name.toLowerCase() === mentionName.toLowerCase()
  //       );

  //       console.log("friend count >>>>>>>",friend)
  //       if (friend.length > 0) {
  //         friend.forEach((friendsub) => {

  //           if(selectedTag.chat_user_id == friendsub.chat_user_id){
  //             extractedMentions.push({
  //               name: friendsub.name,
  //               chat_user_id: friendsub.chat_user_id,
  //             });
  //             menstion.push({
  //               name: friendsub.name,
  //               chat_user_id: friendsub.chat_user_id,
  //             })
  //           }

  //         })

  //       }else{
  //         console.log("inside else condition",friend)
  //         var count = (input.match(/@/g) || []).length;
  //         if(selectedTag != {} && filteredFriends?.length>0 ){
  //           console.log("inside hellllllllllll")
  //           let temp = []
  //           var i = 0
  //           mentions?.forEach((part, index) => {
  //                console.log("index >>>>>>>>",i)
  //                if(i == count - 1){

  //                }else{
  //                 temp.push(part)
  //                }
  //                i = i + 1

  //           })
  //           console.log("temp >>>>>",temp)
  //           setMentions(temp)
  //           selectedTag = {}

  //         }
  //         console.log("count  >>>>>>>>>",count)
  //       }
  //     }
  //   }

  //   // // Compare extracted mentions with the current mentions
  //   // const updatedMentions = mentions.filter((mention) =>
  //   //   extractedMentions.some(
  //   //     (newMention) => newMention.chat_user_id === mention.chat_user_id
  //   //   )
  //   // );

  //   // // Add any new valid mentions
  //   // extractedMentions.forEach((newMention) => {
  //   //   if (
  //   //     !updatedMentions.some(
  //   //       (mention) => mention.chat_user_id === newMention.chat_user_id
  //   //     )
  //   //   ) {
  //   //     updatedMentions.push(newMention);
  //   //   }
  //   // });

  //  // setMentions(extractedMentions);
  // };

  useEffect(() => {
    updateMentionsFromText(text);
  }, [text]);

  const handleSubmit = () => {
    // Handle your text submission logic here
    // console.log("Text submitted:", text);
    setShowCaption(false); // Close caption input
    Keyboard.dismiss(); // Dismiss keyboard
    setShowCaptionTextView(true);
  };

  /////////////////////////////////////////////////////////////////////////////////////

  const mainImageUpdatedStyle = (styles) => {
    const transform = styles.transform || [];
    let rotation = 0;
    let scale = 1;
    transform.forEach((item) => {
      if (item.rotate) {
        rotation = parseFloat(item.rotate.replace("deg", "")); // Extract rotation value and convert to float
      }
      if (item.scale) {
        scale = item.scale; // Extract scale value
      }
    });

    setMainImageStyle({
      rotation: rotation,
      scale: scale,
    });
  };

  const onSavePrevStyles = (event, styles) => {
    // Extract rotation and scale from the transform property
    const transform = styles.transform || [];
    let rotation = 0;
    let scale = 1;
    transform.forEach((item) => {
      if (item.rotate) {
        rotation = parseFloat(item.rotate.replace("deg", "")); // Extract rotation value and convert to float
      }
      if (item.scale) {
        scale = item.scale; // Extract scale value
      }
    });

    // Update prevStyles with position, rotation, and scale
    setPrevStyles({
      position: { x: styles.left, y: styles.top },
      rotation: rotation,
      scale: scale,
    });
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission",
            buttonPositive: "ok",
          }
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const selectImage = async () => {
    setBigButton(false);
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        multiple: false,
        cropping: false,
        mediaType: "photo",
        cropperCircleOverlay: false,
        compressImageQuality: 0.2,
      }).then((image) => {
        if (image !== undefined) {
          BucketUpload([image]);
          Keyboard.dismiss();
        }
      });
    }
  };

  const BucketUpload = async (image) => {
    const AWS = require("aws-sdk"); // Make sure to import the AWS SDK
    const bucket = new AWS.S3({
      bucketName: "tokee-chat-staging",
      region: "us-east-2",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/",
    });

    const folderName = "Profile/";
    let newAttachmentUrls = "";

    // Use Promise.all to wait for all uploads to complete
    await Promise.all(
      image.map(async (file, index) => {
        const pathParts = file.path.split("/");
        const fileName = Date.now() + "_" + pathParts[pathParts.length - 1];
        const fileNameWithoutExtension = fileName.split(".")[0];
        const fPath = file.path;
        const base64 = await RNFetchBlob.fs.readFile(fPath, "base64");
        const arrayBuffer = decode(base64);
        const contentDeposition = `inline;filename="${fileName}"`;

        const params = {
          Bucket: "tokee-chat-staging",
          Key: folderName + fileName,
          Body: arrayBuffer,
          ContentDisposition: contentDeposition,
          ContentType: file.ContentType,
        };

        try {
          const data = await bucket
            .upload(params)
            .on("httpUploadProgress", (progress) => {
              const { loaded, total } = progress;
              const percentage = (loaded / total) * 100;
              if (percentage === 100) {
                // Handle completion
              }
            })
            .promise();
          const newImage = {
            id: Date.now(),
            uri: data.Location,
            position: { x: 100, y: 100 },
            scale: 1,
            rotation: 0, // Initial position
            zIndex: 1,
            // Other properties as needed...
          };
          setImages([...images, newImage]);
        } catch (err) {}
      })
    );
  };

  const onSaveImageStyles = (event, styles, imageId, uri) => {
    const transform = styles.transform || [];
    let rotation = 0;
    let scale = 1;
    transform.forEach((item) => {
      if (item.rotate) {
        rotation = parseFloat(item.rotate.replace("deg", "")); // Extract rotation value and convert to float
      }
      if (item.scale) {
        scale = item.scale; // Extract scale value
      }
    });

    setGifStyle({
      ...gifStyle,
      position: { x: styles.left, y: styles.top },
      rotation: rotation,
      scale: scale,
    });
  };

  useEffect(() => {
    getPhotos();
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      const offset = (selectedFilterIndex - 2) * ITEM_WIDTH;
      flatListRef.current.scrollToOffset({ offset, animated: true });
    }
  }, [selectedFilterIndex]);

  useEffect(() => {
    if (selectedFilterIndex !== null && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: selectedFilterIndex,
        viewPosition: 0.5, // 0.5 centers the item
      });
    }
  }, [selectedFilterIndex]);

  const updateImagePosition = (id, newPosition, value) => {
    setImageDrag(true);
    const deleteThresholdX = 0.2; // 20% of the screen width
    const deleteThresholdY = 0.8; // 80% of the screen height

    const { width: windowWidth, height: windowHeight } =
      Dimensions.get("window");
    const bottomThreshold = windowHeight * 0.8 - 50;
    const leftThreshold = windowWidth * deleteThresholdX;
    const rightThreshold = windowWidth * (1 - deleteThresholdX); // right side threshold

    (newPosition?.left > leftThreshold &&
      newPosition?.top > windowHeight * deleteThresholdY) ||
      (newPosition?.left < rightThreshold &&
        newPosition?.top > windowHeight * deleteThresholdY &&
        imageDrag === true);

    if (
      (newPosition?.left > leftThreshold &&
        newPosition?.top > bottomThreshold) || // Checking if image is in the delete button area
      (newPosition?.left < rightThreshold &&
        newPosition?.top > bottomThreshold &&
        imageDrag === true)
    ) {
      setShowText(false);
      setBigButton(true);
    } else {
      setBigButton(false);
    }

    setCount(count + 1);
    const transform = newPosition.transform || [];
    let rotation = 0;
    let scale = 1;
    transform.forEach((item) => {
      if (item.rotate) {
        rotation = parseFloat(item.rotate.replace("deg", "")); // Extract rotation value and convert to float
      }
      if (item.scale) {
        scale = item.scale; // Extract scale value
      }
    });

    setImages((prevImages) =>
      prevImages.map((image, index) =>
        image.id === id
          ? {
              ...image,
              position: { x: newPosition?.left, y: newPosition?.top },
              rotation: rotation,
              scale: scale,
              zIndex: index + count,
            }
          : image
      )
    );
  };

  const updateTextPosition = (id, newPosition) => {
    setImageDrag(true);
    const deleteThresholdX = 0.2; // 20% of the screen width
    const deleteThresholdY = 0.8; // 80% of the screen height

    const { width: windowWidth, height: windowHeight } =
      Dimensions.get("window");
    const bottomThreshold = windowHeight * 0.8 - 50;
    const leftThreshold = windowWidth * deleteThresholdX;
    const rightThreshold = windowWidth * (1 - deleteThresholdX); // right side threshold
    if (
      (newPosition?.left > leftThreshold &&
        newPosition?.top > bottomThreshold) || // Checking if image is in the delete button area
      (newPosition?.left < rightThreshold &&
        newPosition?.top > bottomThreshold &&
        imageDrag === true)
    ) {
      setShowText(true);
      setTextBigButton(true);
    } else {
      setTextBigButton(false);
    }
    const transform = newPosition.transform || [];
    let rotation = 0;
    let scale = 1;
    transform.forEach((item) => {
      if (item.rotate) {
        rotation = parseFloat(item.rotate.replace("deg", "")); // Extract rotation value and convert to float
      }
      if (item.scale) {
        scale = item.scale; // Extract scale value
      }
    });

    setTextInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.id === id
          ? {
              ...input,
              position: { x: newPosition?.left, y: newPosition?.top },
              rotation: rotation,
              scale: scale,
            }
          : input
      )
    );
  };

  const addImage = async (uri) => {
    setBigButton(false);
    setTextBigButton(false);
    if (isAddingImage) {
      return;
    }
    uploadStoryFilesApi(uri);
    setModalVisible(false);
    setImageModal(false);
  };

  const addImageAndroid = async (uri) => {
    setFilterView(false);
    // Check if the function is already executing
    if (isAddingImage) {
      return;
    }

    // Set the flag to true to indicate that the function is executing
    setIsAddingImage(true);
    const AWS = require("aws-sdk"); // Make sure to import the AWS SDK
    const pathParts = uri.split("/");
    const fileName = Date.now() + "_" + pathParts[pathParts.length - 1];
    const base64 = await RNFetchBlob.fs.readFile(uri, "base64");

    const arrayBuffer = decode(base64);
    const contentDeposition = `inline;filename="${fileName}"`;
    const bucket = new AWS.S3({
      bucketName: "tokee-chat-staging",
      region: "us-east-2",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      s3Url: "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/",
    });
    const folderName = "Profile/";
    let newAttachmentUrls = [];
    const params = {
      Bucket: "tokee-chat-staging",
      Key: folderName + fileName,
      Body: arrayBuffer,
      ContentDisposition: contentDeposition,
      ContentType: "image/jpeg",
    };
    try {
      // Upload the file
      const response = await bucket.upload(params).promise();
      setModalVisible(false);
      setImageModal(false);
      const newImage = {
        id: Date.now(),
        uri: response.Location,
        position: { x: 100, y: 100 },
        scale: 1,
        rotation: 0, // Initial position
        zIndex: 1,
        // Other properties as needed...
      };
      setImages([...images, newImage]);
    } catch (error) {
      setIsAddingImage(false);
      return null;
    } finally {
      // Reset the flag to indicate that the function has finished executing
      setIsAddingImage(false);
    }
  };

  const addGif = (uri) => {
    setFilterView(false);
    setBigButton(false);
    setTextBigButton(false);
    setModalVisible(false);
    setImageModal(false);

    const newImage = {
      id: Date.now(),
      uri: uri,
      position: { x: 100, y: 100 },
      scale: 1,
      rotation: 0, // Initial position
      zIndex: 1,
      // Other properties as needed...
    };
    setImages([...images, newImage]);
  };

  const uploadStoryFilesApi = async (path) => {
    NetInfo.fetch().then((state) => {
      if (state.isInternetReachable === false) {
        setloaderMoedl(false);
      } else {
        setIsAddingImage(true);
        let url = Base_Url + story_files;
        const data = new FormData();

        if (path !== null) {
          data.append("file", {
            uri: Platform.OS === "android" ? path : path.replace("file://", ""),
            type: "image/jpeg", // or photo.type
            name: "userImage.jpg",
          });
        }
        try {
          axios({
            method: "post",
            url: url,
            headers: {
              Accept: "application/json",
              "Content-Type": "multipart/form-data",
              Authorization: "Bearer " + globalThis.Authtoken,
              localization: globalThis.selectLanguage,
            },
            data: data,
          })
            .then((response) => {
              if (response.data.status == true) {
                const newImage = {
                  id: response.data.data.file_id,
                  uri: response.data.data.file_path,
                  position: { x: 100, y: 100 },
                  scale: 1,
                  rotation: 0, // Initial position
                  // Other properties as needed...
                };
                setImages([...images, newImage]);
                setIsAddingImage(false);
              } else {
                setloaderMoedl(false);
                setIsAddingImage(false);
              }
            })
            .catch((error) => {
              setloaderMoedl(false);
              setIsAddingImage(false);
              Alert.alert(error);
            });
        } catch (error) {
          setloaderMoedl(false);
          setIsAddingImage(false);
        }
      }
    });
  };

  const deleteStoryFilesApi = async (id) => {
    // ********** InterNet Permission    ********** ///
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        Alert.alert(t("noInternet"), t("please_check_internet"), [
          { text: t("ok") },
        ]);

        return;
      } else {
        let headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          // @ts-ignore
          Authorization: "Bearer " + globalThis.Authtoken,
          localization: globalThis.selectLanguage,
        };

        GetApiCall(
          storyDelete_files + id,
          headers,
          navigation,
          (ResponseData, ErrorStr) => {
            deleteApiSuccess(ResponseData, ErrorStr);
          }
        );
      }
    });
  };

  // **********  Method for return the get  api Response   ********** ///
  const deleteApiSuccess = (ResponseData, ErrorStr) => {
    if (ErrorStr) {
      Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]);
    } else {
      console.log("image delete sucessfully");
    }
  };

  // Function to delete an image
  const deleteImage = (id) => {
    // Remove the image with the specified ID from the list
    setImages(images.filter((image) => image.id !== id));
    deleteStoryFilesApi(id);
  };

  // **********  Add Story Api ********** ///

  const addStoryApi = async (path) => {
    setloaderMoedl(true);
    const result = await ImageCompress.compress(path, {
      compressionMethod: "auto",
    });
    NetInfo.fetch().then((state) => {
      if (state.isInternetReachable === false) {
        setloaderMoedl(false);
      } else {
        let url = Base_Url + add_story;
        const data = new FormData();

        if (result !== null) {
          data.append("file", {
            uri:
              Platform.OS === "android"
                ? result
                : result.replace("file://", ""),
            type: "image/jpeg", // or photo.type
            name: "userImage.jpg",
          });
          data.append("file_type", "image");
          data.append("sticker_postion", JSON.stringify(images));
          data.append("image_text", JSON.stringify(textInputs));
          data.append("background_color", selectedFilterIndex);
          data.append("rotation", mainImageStyle.rotation);
          data.append("scale", mainImageStyle.scale);
          data.append("caption", text);
          data.append("mention", JSON.stringify(mentions));
        }

        setloaderMoedl(true);
        setTimeout(() => {
          try {
            axios({
              method: "post",
              url: url,
              headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer " + globalThis.Authtoken,
                localization: globalThis.selectLanguage,
              },
              data: data,
            })
              .then((response) => {
                if (response.data.status == true) {
                  Alert.alert(t("success"), t("story_has_posted"), [
                    {
                      text: t("ok"),
                      onPress: () => {
                        setMainImage("");
                        setImages([]);
                        setTextInputs([]);
                        setTimeout(() => {
                          navigation.navigate("BottomBar", {
                            screen: "chatScreen",
                          });
                        }, 300);
                      },
                    },
                  ]);
                  setloaderMoedl(false);
                } else {
                  setloaderMoedl(false);
                }
              })
              .catch((error) => {
                if (axios.isAxiosError(error)) {
                  try {
                    axios({
                      method: "post",
                      url: url,
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                        Authorization: "Bearer " + globalThis.Authtoken,
                        localization: globalThis.selectLanguage,
                      },
                      data: data,
                    })
                      .then((response) => {
                        if (response.data.status == true) {
                          Alert.alert(t("success"), t("story_has_posted"), [
                            {
                              text: t("ok"),
                              onPress: () =>
                                navigation.navigate("BottomBar", {
                                  screen: "chatScreen",
                                }),
                            },
                          ]);
                          setloaderMoedl(false);
                        } else {
                          setloaderMoedl(false);
                        }
                      })
                      .catch((error) => {
                        setloaderMoedl(false);
                      });
                  } catch (retryError) {
                    console.error("Retry failed:", retryError.message);
                    // Handle retry failure
                  }
                } else {
                  setloaderMoedl(false);
                }
              });
          } catch (error) {
            setloaderMoedl(false);
          }
        }, 1000);
      }
    });
  };

  const screenShot = () => {
    setFilterView(false);
    setPostButton(false);
    setTimeout(() => {
      ref.current.capture().then((uri) => {
        addStoryApi(route.params.path);
      });
    }, 700);
  };

  const textInputRef = useRef(null);

  const getPhotos = () => {
    //  setData([])
    data.slice();
    CameraRoll.getPhotos({
      first: 500,
      assetType: "Photos",
    })
      .then((res) => {
        setData(res.edges);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  function GalleryView(item, index) {
    return (
      <TouchableOpacity
        style={{
          width: "33%",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          addGif(item?.images?.original.url);
        }}
      >
        <Image
          style={{
            width: "100%",
            height: 150,
          }}
          resizeMode="contain"
          onError={(error) => console.log("error in uploading imageeee", error)}
          source={{ uri: item?.images?.original.url }}
        />
      </TouchableOpacity>
    );
  }

  function ImageGalleryView(item, index) {
    return (
      <TouchableOpacity
        style={{
          width: "33%",
          backgroundColor: "lightgray",
          borderWidth: 0.5,
          borderColor: "#fff",
        }}
        onPress={() => {
          isAddingImage
            ? null
            : Platform.OS === "ios"
            ? addImage(item?.node?.image?.uri)
            : addImageAndroid(item?.node?.image?.uri);
        }}
      >
        <Image
          style={{
            width: 200,
            height: 150,
            resizeMode: "cover",
          }}
          onError={(error) => console.log("error in uploading imageeee", error)}
          source={{ uri: item?.node?.image?.uri }}
        />
      </TouchableOpacity>
    );
  }

  const onStartDrag = (id) => {
    setDeleteActiveId(id);
    setShowDelete("");
    setShowCaptionTextView(false);
  };

  const onStartImageDrag = (id) => {
    setActiveImageId(id);
    setShowImageDelete("");
    setShowCaptionTextView(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (event, gestureState) => {
        // Detect left or right swipe
        const isSwipingLeft = gestureState.dx < -50;
        const isSwipingRight = gestureState.dx > 50;
        if (isSwipingLeft) {
          setSelectedFilterIndex((prevIndex) =>
            Math.min(prevIndex + 1, filters.length - 1)
          );
        } else if (isSwipingRight) {
          setSelectedFilterIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        }
      },
    })
  ).current;

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const onFontChange = (font) => {
    setFont(font);
  };

  const handleSetActiveText = (id) => {
    setFilterButton(false);
    setActiveTextId(id);
    setEditedText(textInputs.find((input) => input.id === id)?.text || "");
    setFilterView(false);
  };

  // Function to handle submitting text
  const handleSubmitText = () => {
    Keyboard.dismiss;
    if (textInputValue.trim() !== "") {
      setFontView(false);
      setColor(false);
      setShowDelete(false);
      setTextInputs((prevInputs) => [
        ...prevInputs,
        {
          id: Date.now(),
          text: textInputValue,
          position: { x: 100, y: 400 },
          color: selectedColor,
          rotation: 0,
          scale: 1,
          font: fontF,
          filter: selectedFilterIndex,
        },
      ]);
      setTextInputValue("");
      setShowInput(false); // Hide the text input after submitting
    } else {
      setShowInput(false);
      setColor(false);
      setFontView(false);
    }
  };

  // Function to handle editing existing text
  const handleEditText = () => {
    Keyboard.dismiss;
    if (activeTextId !== null && editedText.trim() !== "") {
      setActiveTextId(activeTextId);
      setColor(false);
      setFontView(false);
      setShowDelete(false);
      setTextInputs((prevInputs) =>
        prevInputs.map((input) =>
          input.id === activeTextId
            ? {
                ...input,
                text: editedText,
                color: selectedColor,
                font: fontF,
                filter: selectedFilterIndex,
                position: {
                  x: prevStyles?.position.x,
                  y: prevStyles?.position.y,
                },
                rotation: prevStyles?.rotation,
                scale: prevStyles?.scale,
              }
            : input
        )
      );
      setEditedText(""); // Reset edited text value
      setActiveTextId(null); // Reset active text ID
    } else {
      setTextInputs([]);
      setActiveTextId(null);
      setColor(false);
      setFontView(false);
    }
  };

  const handleDeleteText = (id) => {
    setTextInputs((prevInputs) =>
      prevInputs.filter((input) => input.id !== id)
    );
  };

  function clearInput() {
    setSearchValue("");
    searchableData("");
  }

  const searchableData = (text) => {
    setSearchValue(text);
    if (text !== "") {
      if (text.length > 2) {
        gifSearchApiCall(text);
      }
    } else {
      gifApiCall();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000000" }}>
      <LoaderModel
        visible={loaderMoedl}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />

      <ViewShot
        style={{ flex: 1 }}
        ref={ref}
        options={{ format: "jpg", quality: 0.9 }}
      >
        <ColorMatrix
          matrix={filters[selectedFilterIndex].matrix}
          style={styles.imageContainer}
        >
          <View
            //source={require("../../Assets/Image/whiteBackground.jpeg")}
            style={styles.background}
          >
            <Modal
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(false);
              }}
            >
              <View
                style={{
                  paddingBottom: 160,
                  backgroundColor: "rgba(0,0,0,1)",
                }}
              >
                <View
                  style={{
                    height: 50,
                    justifyContent: "center",
                    backgroundColor: "transparent",
                    marginTop: Platform.OS === "ios" ? 60 : 15,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      left: 20,
                      zIndex: 1,
                      backgroundColor: textTheme().textColor,
                      borderRadius: 5,
                    }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Image
                      source={require("../../Assets/Icons/Back.png")}
                      style={{
                        height: 25,
                        width: 25,
                        //@ts-ignore
                        tintColor: COLORS.white,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ marginHorizontal: 15 }}>
                  <SearchBar
                    search={searchableData}
                    value={searchValue}
                    clickCross={clearInput}
                    placeHolder={t("search")}
                  />
                </View>

                <Text
                  style={{
                    color: "#fff",
                    fontSize: 17,
                    marginTop: 20,
                    marginHorizontal: 15,
                    fontWeight: "600",
                  }}
                >
                  Powered by GIPHY
                </Text>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={gif}
                  numColumns={3}
                  renderItem={({ item, index }) => GalleryView(item, index)}
                />
              </View>
            </Modal>

            <Modal
              transparent={false}
              visible={imageModal}
              onRequestClose={() => {
                setImageModal(false);
              }}
            >
              <View style={{ paddingBottom: 80 }}>
                <View
                  style={{
                    height: 60,
                    justifyContent: "center",
                    backgroundColor: themeModule().theme_background,
                    marginTop: Platform.OS === "ios" ? 60 : 20,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      left: 20,
                      zIndex: 1,
                      backgroundColor: textTheme().textColor,
                      borderRadius: 5,
                    }}
                    onPress={() => setImageModal(false)}
                  >
                    <Image
                      source={require("../../Assets/Icons/Back.png")}
                      style={{
                        height: 25,
                        width: 25,
                        //@ts-ignore
                        tintColor: COLORS.white,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={data}
                  numColumns={3}
                  renderItem={({ item, index }) =>
                    ImageGalleryView(item, index)
                  }
                />
              </View>
            </Modal>

            <View style={styles.container}>
              <TouchableOpacity
                activeOpacity={1}
                style={{ flex: 1 }}
                onPress={() => {
                  showInput
                    ? handleSubmitText()
                    : activeTextId !== null
                    ? handleEditText()
                    : setShowDelete(false);
                }}
              >
                <ColorMatrix
                  matrix={filters[selectedFilterIndex].matrix}
                  style={styles.imageContainer}
                >
                  <MainImage
                    source={mainImage}
                    onChange={(event, styles) => mainImageUpdatedStyle(styles)}
                  />
                </ColorMatrix>
                {textInputs.map(
                  (input) =>
                    activeTextId !== input.id && (
                      <DraggableText
                        font={input.font}
                        id={input.id}
                        key={input.id}
                        text={input.text}
                        position={input.position}
                        color={input.color}
                        rotation={input.rotation}
                        scale={input.scale}
                        onEdit={(style) => {
                          handleSetActiveText(input.id);
                          setFontView(true);
                        }}
                        onEnd={(event, styles) => {
                          setShowCaptionTextView(true);
                          setImageDrag(false);
                          const deleteThresholdX = 0.2; // 20% of the screen width
                          const deleteThresholdY = 0.8; // 80% of the screen height
                          const { width: windowWidth, height: windowHeight } =
                            Dimensions.get("window");
                          const leftThreshold = windowWidth * deleteThresholdX;
                          const rightThreshold =
                            windowWidth * (1 - deleteThresholdX); // right side threshold
                          const bottomThreshold = windowHeight * 0.8 - 50;
                          if (
                            (styles?.left > leftThreshold &&
                              styles?.top > bottomThreshold) || // Checking if image is in the delete button area
                            (styles?.left < rightThreshold &&
                              styles?.top > bottomThreshold)
                          ) {
                            setTextInputs((prevInputs) =>
                              prevInputs.filter((text) => text.id !== input.id)
                            );
                            setTextBigButton(false);
                            setImageDrag(false);
                          }
                          setTextBigButton(false);

                          onSavePrevStyles(event, styles);
                        }}
                        onLongPressText={() => setShowDelete(input.id)}
                        showDelete={showDelete}
                        deleteText={() => handleDeleteText(input.id)}
                        activeTextId={activeTextId}
                        onStart={() => onStartDrag(input.id)}
                        selectedImage={selectedImage}
                        prevStyles={prevStyles}
                        onChange={(event, styles) => {
                          setDeleteText(input.text);
                          updateTextPosition(input.id, styles);
                          setShowCaptionTextView(false);
                        }}
                        bigButton={textBigButton}
                        deleteActiveId={deleteActiveId}
                      />
                    )
                )}

                {images.map((image) => (
                  <DraggableImage
                    key={image.id}
                    id={image.id}
                    source={image.uri}
                    position={image.position}
                    showImageDelete={showImageDelete}
                    onEdit={() => setActiveImageId(image.id)}
                    onLongPressImage={() => setShowImageDelete(image.id)}
                    activeImageId={activeImageId}
                    onStart={() => onStartImageDrag(image.id)}
                    deleteImage={() => deleteImage(image.id)}
                    onEnd={(event, styles) => {
                      setShowCaptionTextView(true);
                      setImageDrag(false);
                      const deleteThresholdX = 0.2; // 20% of the screen width
                      const deleteThresholdY = 0.8; // 80% of the screen height
                      const { width: windowWidth, height: windowHeight } =
                        Dimensions.get("window");
                      const leftThreshold = windowWidth * deleteThresholdX;
                      const rightThreshold =
                        windowWidth * (1 - deleteThresholdX); // right side threshold
                      const bottomThreshold = windowHeight * 0.8 - 50;

                      if (
                        (styles?.left > leftThreshold &&
                          styles?.top > bottomThreshold) || // Checking if image is in the delete button area
                        (styles?.left < rightThreshold &&
                          styles?.top > bottomThreshold)
                      ) {
                        setImages(
                          images.filter((photo) => photo.id !== image.id)
                        );
                        setBigButton(false);
                        setImageDrag(false);
                      }
                      setBigButton(false);
                    }}
                    onChange={(event, styles) => {
                      setDeleteImagePath(image.uri);
                      updateImagePosition(image.id, styles, "onChange");
                      setShowCaptionTextView(false);
                    }}
                    zIndex={image.zIndex}
                    bigButton={bigButton}
                    // Other props as needed...
                  />
                ))}

                {postButton && !showCaption ? (
                  <View
                    style={{
                      position: "absolute",
                      top: 50,
                      justifyContent: "space-between",
                      right: 0,
                      zIndex: 115150,
                    }}
                  >
                    {activeTextId !== null || showInput === true ? null : (
                      <TouchableOpacity
                        onPress={() => {
                          showInput
                            ? handleSubmitText()
                            : activeTextId !== null;
                          setFontView(true)
                            ? handleEditText()
                            : setShowInput(true);
                          setFontView(true);
                          setFilterView(false);
                        }}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "rgba(0,0,0,0.3)",
                          borderRadius: 50,
                          height: 45,
                          width: 45,
                          marginVertical: 10,
                          zIndex: 150,
                        }}
                      >
                        <Image
                          source={require("../../Assets/Image/newFaceText.png")}
                          style={{
                            height: 25,
                            width: 25,
                            resizeMode: "contain",
                            tintColor: "white",
                          }}
                        />
                      </TouchableOpacity>
                    )}

                    {activeTextId !== null || showInput === true ? null : (
                      <TouchableOpacity
                        onPress={() => {
                          setFilterView(!filterView);
                        }}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "rgba(0,0,0,0.3)",
                          borderRadius: 50,
                          height: 45,
                          width: 45,
                          marginHorizontal: 20,
                          marginVertical: 10,
                          zIndex: 150,
                        }}
                      >
                        <Image
                          source={require("../../Assets/Image/newFaceFilter.png")}
                          style={{
                            height: 29,
                            width: 29,
                            resizeMode: "cover",
                          }}
                        />
                      </TouchableOpacity>
                    )}

                    {activeTextId !== null || showInput === true ? null : (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            Platform.OS === "ios"
                              ? selectImage()
                              : setImageModal(true);
                            setFilterView(false);
                          }}
                          style={{
                            alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.3)",
                            borderRadius: 50,
                            height: 45,
                            width: 45,
                            marginVertical: 10,
                            zIndex: 150,
                          }}
                        >
                          <Image
                            source={require("../../Assets/Image/gallery.png")}
                            style={{
                              height: 25,
                              width: 25,
                              resizeMode: "contain",
                              tintColor: "white",
                            }}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setModalVisible(true);
                            setFilterView(false);
                          }}
                          style={{
                            alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.3)",
                            borderRadius: 50,
                            height: 45,
                            width: 45,
                            marginVertical: 10,
                            zIndex: 150,
                          }}
                        >
                          <Image
                            source={require("../../Assets/Image/giphy.png")}
                            style={{
                              height: 25,
                              width: 25,
                              resizeMode: "contain",
                              tintColor: "white",
                            }}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ) : null}

                {filterView && (
                  <View
                    style={{
                      position: "absolute",
                      zIndex: 1,
                      bottom: 20,
                      left: 0,
                    }}
                  >
                    <FlatList
                      ref={flatListRef}
                      showsHorizontalScrollIndicator={false}
                      horizontal
                      data={filters}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          onPress={() => {
                            selectedFilterIndex === index
                              ? setFilterView(false)
                              : setSelectedFilterIndex(index);
                          }}
                          style={{
                            marginHorizontal: 10,
                            borderWidth: 4,
                            borderColor:
                              selectedFilterIndex === index ? "green" : "#fff",
                            borderRadius: 42,
                            height: selectedFilterIndex === index ? 84 : 52,
                            width: selectedFilterIndex === index ? 84 : 52,
                            alignSelf: "center",
                          }}
                        >
                          <ColorMatrix matrix={item.matrix}>
                            <Image
                              style={{
                                height: selectedFilterIndex === index ? 76 : 44,
                                width: selectedFilterIndex === index ? 76 : 44,
                                borderRadius:
                                  selectedFilterIndex === index ? 38 : 22,
                                overflow: "hidden",
                              }}
                              resizeMode="cover"
                              source={{ uri: route.params.path }}
                            />
                          </ColorMatrix>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </TouchableOpacity>
              <Modal
                visible={isAlertVisible}
                transparent={true}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: "100%",
                }}
                animationType="fade"
              ></Modal>
              {activeTextId !== null || showInput || showCaption ? (
                <TouchableOpacity
                  activeOpacity={1}
                  style={{
                    flex: 1,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  onPress={() => {
                    showInput
                      ? handleSubmitText()
                      : activeTextId !== null
                      ? handleEditText()
                      : showCaption
                      ? handleSubmit()
                      : setShowDelete(false);
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignContent: "center",
                      flex: 1,
                      paddingHorizontal: 20,
                      backgroundColor: "rgba(0,0,0,0.6)",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: 50,
                        justifyContent: "space-between",
                        right: 0,
                      }}
                    >
                      {showCaption ? null : (
                        <TouchableOpacity
                          onPress={() => {
                            showInput
                              ? handleSubmitText()
                              : activeTextId !== null
                              ? handleEditText()
                              : setShowInput(true);
                            setFilterView(false);
                          }}
                          style={{
                            alignSelf: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.3)",
                            borderRadius: 50,
                            height: 45,
                            width: 45,
                            marginVertical: 10,
                            zIndex: 150,
                          }}
                        >
                          <Image
                            source={require("../../Assets/Image/newFaceText.png")}
                            style={{
                              height: 25,
                              width: 25,
                              resizeMode: "contain",
                              tintColor: "white",
                            }}
                          />
                        </TouchableOpacity>
                      )}
                      {activeTextId !== null || showInput === false ? (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              setColor(!chooseColor);
                              setFilterView(false);
                              setFontView(false);
                            }}
                            style={{
                              alignSelf: "center",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "rgba(0,0,0,0.3)",
                              borderRadius: 50,
                              height: 45,
                              width: 45,
                              marginHorizontal: 20,
                              marginVertical: 10,
                              zIndex: 150,
                            }}
                          >
                            <Image
                              source={require("../../Assets/Image/newFaceColor.png")}
                              style={{
                                height: 29,
                                width: 29,
                                resizeMode: "cover",
                              }}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setColor(false);
                              setFontView(!fontView);
                            }}
                            style={{
                              alignSelf: "center",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "rgba(0,0,0,0.3)",
                              borderRadius: 50,
                              height: 45,
                              width: 45,
                              marginHorizontal: 20,
                              marginVertical: 10,
                              zIndex: 150,
                            }}
                          >
                            <Image
                              source={require("../../Assets/Image/font.png")}
                              style={{
                                height: 25,
                                width: 25,
                                resizeMode: "contain",
                              }}
                            />
                          </TouchableOpacity>
                        </>
                      ) : null}
                    </View>
                    <View style={{}}>
                      {activeTextId !== null && (
                        <TextInput
                          maxLength={200}
                          ref={textInputRef}
                          style={[
                            styles.input,
                            {
                              textAlignVertical: "top",
                              textAlign: "center",
                              color: selectedColor,
                              fontFamily: fontF,
                            },
                          ]}
                          value={editedText}
                          onChangeText={setEditedText}
                          autoFocus={true}
                          onSubmitEditing={() => Keyboard.dismiss()}
                        />
                      )}
                      {showInput && (
                        <TextInput
                          maxLength={200}
                          ref={textInputRef}
                          style={[
                            styles.input,
                            {
                              textAlignVertical: "top",
                              textAlign: "center",
                              color: selectedColor,
                              fontFamily: fontF,
                              minHeight: 50,
                            },
                          ]}
                          value={textInputValue}
                          onChangeText={(text) => setTextInputValue(text)}
                          multiline={true}
                          autoFocus={true}
                          onSubmitEditing={() => Keyboard.dismiss()}
                        />
                      )}
                    </View>

                    {filteredFriends.length > 0 && (
                      <MentionList 
                      filteredFriends={filteredFriends}
                      handleFriendPress={handleFriendPress}
                      />
                      // <FlatList
                      //   data={filteredFriends}
                      //   keyExtractor={(item) => item.chat_user_id}
                      //   keyboardShouldPersistTaps="handled"
                      //   renderItem={({ item }) => (
                      //     <TouchableOpacity
                      //       style={styles.friendItem}
                      //       onPress={() => handleFriendPress(item)}
                      //     >
                      //       <Image
                      //         source={{ uri: item.profile_image }}
                      //         style={styles.friendImage}
                      //       />
                      //       <Text style={{ fontSize: 16, color: "#fff" }}>
                      //         {item.name}
                      //       </Text>
                      //     </TouchableOpacity>
                      //   )}
                      //   style={styles.mentionList}
                      // />
                    )}

                    {showCaption && (
                      <TextInput
                        ref={textCaptionRef}
                        style={[
                          styles.textInput,
                          {
                            maxHeight: Math.min(inputHeight, 200),
                            textAlignVertical: "top",
                            textAlign: "center",
                            color: "#fff",
                            fontFamily: "YourFont", // Replace with your font
                            minHeight: 50,
                          },
                        ]}
                        multiline={true}
                        onChangeText={handleInputChange}
                        value={text}
                        // selection={{ start: text.length, end: text.length }}
                        onContentSizeChange={(e) =>
                          setInputHeight(e.nativeEvent.contentSize.height)
                        }
                        placeholderTextColor="#fff"
                        placeholder="Add a caption..."
                        // onSubmitEditing={handleSubmit} // Submit on return key
                        autoFocus={true}
                        maxLength={userPremium ? 200 : 50}
                        // onBlur={handleSubmit} // Submit on blur (keyboard dismissal)
                      />
                    )}

                    <View>
                      {chooseColor && !showCaption && (
                        <ColorPicker
                          selectedColor={selectedColor}
                          onColorChange={handleColorChange}
                        />
                      )}
                    </View>

                    <View>
                      {fontView && !showCaption && (
                        <FontPicker
                          selectedFont={fontF}
                          onFontChange={onFontChange}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ) : null}
              {/* </Modal> */}
            </View>
          </View>
        </ColorMatrix>
      </ViewShot>

      <View>
        {showCaptionTextView == true &&
        text?.length > 0 &&
        !filterView &&
        activeTextId == null &&
        !showInput ? (
          <ScrollView
            style={[styles.textView, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                setShowCaptionTextView(false), setShowCaption(!showCaption);
              }}
            >
              <Text style={styles.text}>
                {expanded
                  ? renderTextWithMentions(text)
                  : renderTextWithMentions(text.slice(0, 150))}
              </Text>
            </TouchableWithoutFeedback>
            {text.length > 150 && (
              <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Text style={styles.showMoreText}>
                  {expanded ? "Show Less" : "Show More"}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : null}
      </View>
{/* 
      {filterView ||
      activeTextId !== null ||
      showInput ||
      showCaption ?  ( */}


        <View
          style={{
            justifyContent: "space-between",
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            flexDirection: "row",
            backgroundColor: "rgba(0,0,0,0.5)",
            height: 80,
            //  paddingVertical: 10,
          }}
        >
          {text.length > 0 && showCaption == false ? (
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                left: 30,
              }}
              onPress={() => {
                setShowCaption(true), setShowCaptionTextView(false);
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontFamily: font.bold(),
                }}
              >
                {t("Edit caption")}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                left: 30,
              }}
              onPress={() => {
                setShowCaption(true);
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontFamily: font.bold(),
                }}
              >
                {t("Add a caption")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              right: 30,
            }}
            onPress={() => screenShot()}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "bold",
                fontFamily: font.bold(),
              }}
            >
              {t("post")}
            </Text>
          </TouchableOpacity>
        </View>

      {/* ):null} */}

      {filterView || activeTextId !== null || showInput ? null : (
        <View
          style={{
            justifyContent: "space-between",
            position: "absolute",
            bottom: 50,
            right: 0,
            left: 0,
          }}
        >
          {imageDrag ? (
            <TouchableOpacity
              onPress={() =>
                console.log("new delete icon press==================")
              }
              style={{
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Animated.Image
                source={require("../../Assets/Image/newStoryDelete.png")}
                style={{
                  height: buttonSize,
                  width: buttonSize,
                  resizeMode: "contain",
                  tintColor: "red",
                }}
              />

              <>
                {bigButton == true && showText == false ? (
                  <Image
                    style={{
                      width: 60,
                      height: 60,
                      resizeMode: "contain",
                      position: "absolute",
                    }}
                    onError={(error) =>
                      console.log("error in uploading imageeee", error)
                    }
                    source={{ uri: deleteImagePath }}
                  />
                ) : null}

                {textBigButton == true && showText == true ? (
                  <View style={{ position: "absolute", height: 40, width: 40 }}>
                    <Text
                      style={{
                        color: "red",
                        fontSize: 8,
                        fontWeight: "bold",
                        maxWidth: 40,
                        textAlign: "center",
                      }}
                    >
                      {deleteText}
                    </Text>
                  </View>
                ) : null}
              </>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",

          position: "absolute",
          top: 50,
          //  width: "100%",
          paddingHorizontal: 10,
          zIndex: 999,
        }}
      >
        <TouchableOpacity //@ts-ignore
          onPress={() => {
            setTextInputs([]),
              setImages([]),
              navigation.push("AddCameraStoryScreen");
          }}
          style={{
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 50,
            height: 45,
            width: 45,
            marginVertical: 10,
            zIndex: 150,
          }}
        >
          <Image
            source={require("../../Assets/Icons/Cross.png")}
            style={{ height: 25, width: 25, tintColor: "#fff" }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  image: {
    flex: 1,
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  input: {
    backgroundColor: "transparent",
    color: "white",
    fontSize: 25,
    textAlignVertical: "center",
    zIndex: 30,
  },
  filterText: {
    // Your filter button text styles
  },
  selectedFilterText: {
    // Your selected filter button text styles
    fontWeight: "bold",
  },
  imageContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    backgroundColor: "red",
  },
  thumbnail: {
    width: 100,
    height: 100,
    margin: 5,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  background: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' or 'contain' as needed
  },
  textView: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    // backgroundColor: "#0C0C0C",
    padding: 10,
    paddingHorizontal: 15,
    // borderRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    right: 0,
    left: 0,
  },
  text: {
    color: "#fff",
    textAlign: "justify",
    fontWeight: "600",
    fontSize: 14,
  },
  showMoreText: {
    color: "lightgray",
    // marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  inputContainer: {
    // alignItems: 'center',
    backgroundColor: "#0C0C0C",
    borderRadius: 15,
  },
  captionText: {
    color: "#fff",
    marginBottom: 10,
    fontSize: 15,
    marginLeft: 20,
  },
  friendContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
    backgroundColor: "#0C0C0C",
    zIndex: 99999999999,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendText: {
    fontSize: 16,
    color: "#fff",
  },
  mentionContainer: {
    maxHeight: 300,
    width: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  textInput: {
    alignSelf: "center",
    backgroundColor: "#0C0C0C",
    padding: 10,
    paddingLeft: 15,
    color: "#fff",
    textAlign: "justify",
    width: "95%",
    borderRadius: 20,
    zIndex: 55555,
  },
  mentionList: {
    maxHeight: 200,
    marginTop: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedFriends: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  mention: {
    color: "blue",
  },
  plainText: {
    color: "#fff",
  },
  link: {
    color: "green",
    textDecorationLine: "underline",
  },
});

export default ImageUploadGallery;
