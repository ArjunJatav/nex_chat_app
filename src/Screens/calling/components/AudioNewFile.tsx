import React, { useState, useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { updateCallState } from "../../../reducers/VoipReducer";
import { images } from "../../../utils/constants/assets";
import { colors } from "../../../utils/constants/colors";
import AudioCallBar from "./AudioGroupCallBar";
import { AppImageIcon } from "../../../Components/Calling/AppImageIcon";
import { dimensions } from "../../../utils/globalFunctions";

const ProfileList = (props) => {
  const dispatch = useDispatch();
  const [randomImageMap, setRandomImageMap] = useState({});
  const [colorMap, setColorMap] = useState({});

  const userData = { id: `${globalThis.sender_id}` };

  const profiles = useSelector((state) => state?.profileSlice?.profiles || []);

  const agoraData = useSelector((state) => {
    return state?.VoipReducer?.agora_data || {};
  });

  const callState = useSelector((state) => {
    return state?.VoipReducer?.call_state || {};
  });

    const guestUserUids = useSelector(
      (state) => state?.VoipReducer?.call_data?.guestVideoUids || []
    );

  const defaultAvatar =
    "https://tokeecorp.com/backend/public/images/user-avatar.png";

  // List of random images
  const imagess = [
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728041883750_85A6388D-252E-40EB-ABFC-EA9B93159DDB.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728042001501_0F192FE6-98B7-4A67-9773-0B0AE6CFE4B3.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728042035217_9F56010B-9D52-4616-9F0E-64372397B2C6.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728042069659_0143D848-66FD-43FB-BA85-F2759B772F60.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728042189029_BAFAFB31-42B8-49BB-8AE0-F44C0A6691D2.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728042224211_EBECF201-EC5F-4D66-B175-E9EC80FEDDE9.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728042252026_7A272E63-92F6-4968-A19A-7DE9B99DDDC0.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728042404325_4F108A60-59DB-4C32-9015-6DED22AAA002.jpg",
    "https://tokee-chat-staging.s3.us-east-2.amazonaws.com/Profile/1728042447516_40157888-A937-466A-962D-C6A58DFC74B7.jpg",
  ];

  // Function to generate random gradient colors
  const generateRandomGradient = () => {
    const colors = [
      ["#FF9093", "#812D2E"], // England Theme
      ["#FF88A2", "#892A3D"], // America Theme
      ["#FFA793", "#B5442C"], // India Theme
      ["#7890FF", "#253379"], // US Independence Theme
      ["#BBFFE8", "#35735D"], // Mexico Theme
      ["#FFB6A7", "#8E3F31"], // Mongolia Theme
      ["#FFC68F", "#302943"], // New Year Theme
      ["#FFC68F", "#C9762C"], // New Year
      ["#BDFFE8", "#387E6E"], // Christmas
      ["#FFC0E4", "#AE407E"], // Third Theme
      ["#7890FF", "#253379"], // Second Theme
      ["#D2B4DE", "#912B99"], // Default Theme
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };



  const minimizeCall = () => {
    dispatch(updateCallState({ isBackground: true }));
  };

  const myProfile = {
    id: globalThis.sender_id,
    first_name: globalThis.displayName + "(You)",
    profile_image: globalThis.image,
  };

  const updatedProfiles = [myProfile, ...profiles];

  // Assign random images and colors only once
  useEffect(() => {
    const newImageMap = { ...randomImageMap };
    const newColorMap = { ...colorMap };

    updatedProfiles.forEach((profile) => {
      if (!newImageMap[profile.id] && profile.profile_image === defaultAvatar) {
        newImageMap[profile.id] =
          imagess[Math.floor(Math.random() * imagess.length)];
      }
      if (!newColorMap[profile.id]) {
        newColorMap[profile.id] = generateRandomGradient();
      }
    });

    setRandomImageMap(newImageMap);
    setColorMap(newColorMap);
  }, [guestUserUids]);

  const renderItem = ({ item }) => {
    const imageUri =
      item.profile_image === defaultAvatar
        ? randomImageMap[item.id]
        : item.profile_image;
    const gradientColors = colorMap[item.id] || ["#D2B4DE", "#D2B4DE"];

    return (
      <LinearGradient colors={gradientColors} style={styles.box}>
        <Image source={{ uri: imageUri }} style={styles.image}/>
        <Text style={styles.name}>{item.first_name}</Text>
        {item?.mute && <Image source={images.mic_off} style={styles.micIcon}/>}
      </LinearGradient>
    );
  };

  // const renderItem = ({ item, index }) => {
  //   const imageUri = item.profile_image === defaultAvatar ? randomImageMap[item.id] : item.profile_image;
  //   const gradientColors = colorMap[item.id] || ["#FFFFFF", "#FFFFFF"];

  //   return (
  //     <LinearGradient colors={gradientColors} style={styles.gridBox}>
  //       <Image source={{ uri: imageUri }} style={styles.image} />
  //       <Text style={styles.name}>{item.first_name}</Text>
  //     </LinearGradient>
  //   );
  // };


  return (
    <View style={styles.container}>
      {!agoraData?.is_video && (
        <View style={styles.upperArea}>
          <AppImageIcon
            onPress={minimizeCall}
            wrapperStyle={styles.backBtn}
            image={callState.state === "active" ? images.back_arrow : null}
            iconStyle={{ tintColor: colors.white }}
          />

          <Text
            style={{
              color: "white",
              width: "80%",
              fontSize: 16,
              fontWeight: "700",
            }}
            numberOfLines={1}
          >
            {agoraData?.sender == userData?.id
              ? agoraData?.receiver_name
              : agoraData?.sender_name}
          </Text>
        </View>
      )}

      <FlatList
        data={updatedProfiles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        style={{ marginTop: 100 }}
        //ListHeaderComponent={() => renderItem({ item: updatedProfiles[0], index: 0 })} // Ensure my profile is full width
      />

      <AudioCallBar
        containerStyle={styles.callBar}
        isAudioEnabled={!props?.isMuted}
        isSpeakerEnabled={props?.isSpeakerOn}
        onIcon3Press={props?.toggleMuteAudio}
        onIcon4Press={props?.toggleSpeaker}
        onEndCallPress={props?.endCall}
        onAddUserPress={props?.addUserPress}
        callDurationRef={props?.callDurationRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  box: {
    flex: 1,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    padding: 15,
    elevation: 3, // Shadow effect for Android
    shadowColor: "#000", // Shadow effect for iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover'
  },
  name: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  micIcon: {
    position: "absolute",
    left: 10,
    top: 10,
    height: 20,
    width: 20,
    tintColor: "blue",
  },
  callBar: {
    position: "absolute",
    zIndex: 101,
    top: dimensions().screen_height - 150,
  },
  upperArea: {
    height: 50,
    justifyContent: "space-between",
    position: "absolute",
    paddingLeft: 10,
    zIndex: 9999,
    top: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: Platform.OS == "ios" ? 40 : 5,

    alignSelf: "center",
  },
  backBtn: {
    height: 48,
    width: 48,
    backgroundColor: colors.black,
    borderRadius: 24,
    // marginBottom: hp(1),
  },

  fullRowBox: {
    width: "100%", 
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    padding: 20,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  gridBox: {
    flex: 1,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    padding: 15,
    elevation: 3, 
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  largeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

});

export default ProfileList;
