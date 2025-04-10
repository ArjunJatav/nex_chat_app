import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  Text,
  Image,
} from "react-native";
import { dimensions } from "../../../utils/globalFunctions";
import { globalStyles } from "../../../utils/globalStyles";
import { RtcSurfaceView, RtcTextureView } from "react-native-agora";
import { useSelector, useDispatch } from "react-redux";
import { StoreType } from "../../../types";
import { stopSound } from "../../../utils/callKitCustom";
import { images } from "../../../utils/constants/assets";
import { colors } from "../../../utils/constants/colors";
import CallBar from "./CallBar";
import CallProfile from "./CallProfile";
import { AppImageIcon } from "../../../Components/Calling/AppImageIcon";
import KeepAwake from "react-native-keep-awake";

interface VideoProps {
  sessionId: string;
  token: string;
  isJoined: boolean;
  endCall: () => void;
  toggleMuteAudio: () => void;
  toggleSpeaker: () => void;
  switchCamera: () => void;
  onAddVideoUserPress: () => void;
  isCameraOn: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  callDurationRef?: any;
  flipCamera?: () => void;
  minimizeCall: () => void;
}

const Video = (props: VideoProps) => {
  const dispatch = useDispatch();

  const guestUserUids = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_data?.guestVideoUids || []
  );

  console.log(
    "guestUserUids sittu====================================",
    guestUserUids
  );

  const profiles = useSelector((state) => state?.profileSlice?.profiles || []);

  console.log(
    "guestUserUids sittu====================================",
    profiles
  );

  const isCallInitialized = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_data?.isCallInitalized
  );

  const callState = useSelector(
    (state: StoreType) => state?.VoipReducer?.call_state || {}
  );

  const agoraData = useSelector(
    (state: StoreType) => state?.VoipReducer?.agora_data || null
  );

  const userData = useSelector(
    (state: StoreType) => state?.UserReducer?.user || null
  );

  const [isVideoFlipped, setIsVideoFlipped] = useState(false);

  // Ensure no duplicate UIDs

  const uniqueGuestUserUids = Array.from(new Set(guestUserUids));

  console.log(
    "uniqueGuestUserUids====================================",
    uniqueGuestUserUids
  );

  useEffect(() => {
    KeepAwake.activate();
    return () => KeepAwake.deactivate();
  }, []);

  useEffect(() => {
    if (callState.state !== "outgoing") {
      stopSound();
    }
  }, [callState.state]);

  const flipCamera = () => {
    props?.flipCamera();
  };

  const toggleUserVid = () => {
    if (uniqueGuestUserUids.length == 1) {
      setIsVideoFlipped(!isVideoFlipped);
    } else {
      console.log("toggleUserVid not work====================================");
    }
  };

  // const renderVideoFeed = (uid: number) => (
  //   <View
  //     style={{
  //       width: dimensions().screen_width / 2,
  //       height: dimensions().screen_height / 3,
  //       justifyContent: "center",
  //       alignItems: "center",
  //     }}
  //   >
  //     {Platform.OS === "android" ? (
  //       <RtcTextureView key={uid} canvas={{ uid }} style={globalStyles.wh100} />
  //     ) : (
  //       <RtcSurfaceView key={uid} canvas={{ uid }} style={globalStyles.wh100} />
  //     )}
  //   </View>
  // );

  // const renderVideoFeed = (user) => (
  //   <View
  //     style={{
  //       width: dimensions().screen_width / 2,
  //       height: dimensions().screen_height / 3,
  //       justifyContent: "center",
  //       alignItems: "center",
  //       borderWidth: .5,
  //       borderColor: "#ccc", // Add a border for consistency
  //      // borderRadius: 10, // Optional: Rounded corners for consistency
  //       overflow: "hidden", // Ensures content respects the border radius,

  //     }}
  //   >
  //     {!user.isCameraOn ? ( // Camera is ON when isCameraOn is false
  //       Platform.OS === "android" ? (
  //         <RtcTextureView
  //           key={user.id}
  //           canvas={{ uid: user.id }}
  //           style={globalStyles.wh100}
  //         />
  //       ) : (
  //         <RtcSurfaceView
  //           key={user.id}
  //           canvas={{ uid: user.id }}
  //           style={globalStyles.wh100}
  //         />
  //       )
  //     ) : (
  //       <View style={[globalStyles.wh100, { justifyContent: "center", alignItems: "center" ,

  //       }]}>
  //         <CallProfile
  //           showPulse={true}
  //           profileImage={user.profile_image}
  //         />
  //       </View>
  //     )}
  //   </View>
  // );

  const renderVideoFeed = (user) => (
    console.log("user===", user),
    (
      <View
        style={{
          width: dimensions().screen_width / 2, // Adjust to two columns
          height: dimensions().screen_height / uniqueGuestUserUids?.length, // Adjust height dynamically based on your requirement
          justifyContent: "center",
          alignItems: "center",
          // borderWidth: 0.5,
          borderColor: "#ccc", // Add a border for consistency
          // overflow: "hidden", // Ensures content respects the border radiuss,
          margin: 1,
          // borderRadius:8
        }}
      >
        {!user.isCameraOn ? (
          Platform.OS === "android" ? (
            <RtcTextureView
              key={user.id}
              canvas={{ uid: user.id }}
              style={globalStyles.wh100}
            />
          ) : (
            <RtcSurfaceView
              key={user.id}
              canvas={{ uid: user.id }}
              style={globalStyles.wh100}
            />
          )
        ) : (
          <View
            style={[
              globalStyles.wh100,
              {
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 0.5,
                borderColor: "#ccc",
                borderRadius: 8,
              },
            ]}
          >
            <CallProfile showPulse={false} profileImage={user.profile_image} />
            <Text
              style={{
                color: colors.white,
                fontSize: 16,
                // textAlign: "center",
                marginTop: -90,
              }}
            >
              {user?.first_name}
            </Text>
          </View>
        )}

        {user?.mute && (
          <View style={{ position: "absolute", left: 10, top: 10 }}>
            <Image
              source={images.mic_off}
              style={{ height: 20, width: 20 }}
              tintColor={"blue"}
            />
          </View>
        )}
      </View>
    )
  );

  return (
    <>
      {uniqueGuestUserUids.length > 1 ? (
        <View style={[globalStyles.flex1]}>
          <AppImageIcon
            onPress={props?.minimizeCall}
            wrapperStyle={styles.backBtn}
            image={images.back_arrow}
            iconStyle={{ tintColor: colors.white }}
          />
          <View
            style={{
              width: dimensions().screen_width,
              height: dimensions().screen_height,
            }}
          >
            {uniqueGuestUserUids.length > 0 ? (
              <FlatList
                data={profiles} // Use profiles as your data source
                renderItem={({ item }) => renderVideoFeed(item)}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{
                  paddingBottom: 130, // Optional: to provide some space at the bottom
                }}
                style={{ marginTop: 190, flex: 1 }}
              />
            ) : (
              <View
                style={{
                  width: dimensions().screen_width,
                  height: dimensions().screen_height,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CallProfile
                  showPulse={true}
                  profileImage={
                    Number(agoraData?.sender) === Number(userData?.id)
                      ? agoraData?.receiver_image
                      : agoraData?.sender_image
                  }
                />
              </View>
            )}
          </View>

          {/* Local User Video Feed */}
          <View style={styles.publisherStyle}>
            <TouchableOpacity
              onPress={toggleUserVid}
              style={{
                width: 116,
                height: 169,
                overflow: "hidden",
                borderRadius: 12,
                backgroundColor: colors.black,
                borderWidth: !isVideoFlipped && props?.isCameraOn ? 1 : 0,
                borderColor: "grey",
              }}
            >
              {!isVideoFlipped ? (
                isCallInitialized &&
                (props?.isCameraOn ? (
                  <View
                    style={{
                      width: 116,
                      height: 169,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CallProfile
                      small={true}
                      showPulse={true}
                      profileImage={
                        Number(agoraData?.sender) === Number(userData?.id)
                          ? agoraData?.sender_image
                          : agoraData?.receiver_image
                      }
                    />
                  </View>
                ) : (
                  <>
                    {Platform.OS === "android" ? (
                      <RtcTextureView
                        key={"333"}
                        canvas={{ uid: 0 }}
                        style={globalStyles.wh100}
                      />
                    ) : (
                      <RtcSurfaceView
                        key={"333"}
                        canvas={{ uid: 0 }}
                        style={globalStyles.wh100}
                      />
                    )}
                  </>
                ))
              ) : uniqueGuestUserUids.length > 0 ? (
                renderVideoFeed(uniqueGuestUserUids[0])
              ) : (
                <View
                  style={{
                    width: 116,
                    height: 169,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CallProfile
                    small={true}
                    showPulse={true}
                    profileImage={
                      Number(agoraData?.sender) === Number(userData?.id)
                        ? agoraData?.sender_image
                        : agoraData?.receiver_image
                    }
                  />
                </View>
              )}
            </TouchableOpacity>
            <AppImageIcon
              onPress={flipCamera}
              wrapperStyle={styles.flipIcon}
              image={images.flip_camera}
            />
          </View>

          <CallBar
            isVideo={true}
            containerStyle={styles.callBar}
            isVideoEnabled={props?.isCameraOn}
            isAudioEnabled={!props?.isMuted}
            isSpeakerEnabled={props?.isSpeakerOn}
            onIcon2Press={props?.switchCamera}
            onIcon3Press={props?.toggleMuteAudio}
            onIcon4Press={props?.toggleSpeaker}
            onEndCallPress={props?.endCall}
            callDurationRef={props?.callDurationRef}
            onAddUserPress={props?.onAddVideoUserPress}
          />
        </View>
      ) : (
        <View style={[globalStyles.flex1]}>
          <AppImageIcon
            onPress={props?.minimizeCall}
            wrapperStyle={styles.backBtn}
            image={images.back_arrow}
            iconStyle={{ tintColor: colors.white }}
          />
          <View
            style={{
              width: dimensions().screen_width,
              height: dimensions().screen_height,
            }}
          >
            {!isVideoFlipped ? (
              uniqueGuestUserUids[0] !== 0 ? (
                <RtcSurfaceView
                  key={"444"}
                  canvas={{ uid: uniqueGuestUserUids[0] }}
                  style={{
                    width: dimensions().screen_width,
                    height: dimensions().screen_height,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: dimensions().screen_width,
                    height: dimensions().screen_height,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CallProfile
                    showPulse={true}
                    profileImage={
                      Number(agoraData?.sender) === Number(userData?.id)
                        ? agoraData?.receiver_image
                        : agoraData?.sender_image
                    }
                  />
                </View>
              )
            ) : (
              isCallInitialized &&
              (props?.isCameraOn ? (
                <View
                  style={{
                    width: dimensions().screen_width,
                    height: dimensions().screen_height,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CallProfile
                    showPulse={true}
                    profileImage={
                      Number(agoraData?.sender) === Number(userData?.id)
                        ? agoraData?.receiver_image
                        : agoraData?.sender_image
                    }
                  />
                </View>
              ) : (
                <RtcSurfaceView
                  key={"111"}
                  canvas={{ uid: 0 }}
                  style={{
                    width: dimensions().screen_width,
                    height: dimensions().screen_height,
                  }}
                />
              ))
            )}
          </View>

          <View style={styles.publisherStyle}>
            <TouchableOpacity
              onPress={() => {
                toggleUserVid();
              }}
              style={{
                width: 116,
                height: 169,
                overflow: "hidden",
                borderRadius: 12,
                backgroundColor: colors.black,
                borderWidth: !isVideoFlipped && props?.isCameraOn ? 1 : 0,
                borderColor: "grey",
              }}
            >
              {!isVideoFlipped ? (
                isCallInitialized &&
                (props?.isCameraOn ? (
                  <View
                    style={{
                      width: 116,
                      height: 169,
                      overflow: "hidden",
                      borderRadius: 12,
                      backgroundColor: colors.black,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CallProfile
                      small={true}
                      showPulse={true}
                      profileImage={
                        Number(agoraData?.sender) === Number(userData?.id)
                          ? agoraData?.sender_image
                          : agoraData?.receiver_image
                      }
                    />
                  </View>
                ) : (
                  <>
                    {Platform.OS === "android" ? (
                      <RtcTextureView
                        key={"333"}
                        canvas={{ uid: 0 }}
                        style={globalStyles.wh100}
                      />
                    ) : (
                      <RtcSurfaceView
                        key={"333"}
                        canvas={{ uid: 0 }}
                        style={globalStyles.wh100}
                      />
                    )}
                  </>
                ))
              ) : uniqueGuestUserUids[0] !== 0 ? (
                <>
                  {Platform.OS === "android" ? (
                    <RtcTextureView
                      key={"222"}
                      canvas={{ uid: uniqueGuestUserUids[0] }}
                      style={globalStyles.wh100}
                    />
                  ) : (
                    <RtcSurfaceView
                      key={"222"}
                      canvas={{ uid: uniqueGuestUserUids[0] }}
                      style={globalStyles.wh100}
                    />
                  )}
                </>
              ) : (
                <View
                  style={{
                    width: 116,
                    height: 169,
                    overflow: "hidden",
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CallProfile
                    small={true}
                    showPulse={true}
                    profileImage={
                      Number(agoraData?.sender) === Number(userData?.id)
                        ? agoraData?.sender_image
                        : agoraData?.receiver_image
                    }
                  />
                </View>
              )}
            </TouchableOpacity>
            <AppImageIcon
              onPress={flipCamera}
              wrapperStyle={styles.flipIcon}
              image={images.flip_camera}
            />
          </View>
          <CallBar
            isVideo={true}
            containerStyle={styles.callBar}
            isVideoEnabled={props?.isCameraOn}
            isAudioEnabled={!props?.isMuted}
            isSpeakerEnabled={props?.isSpeakerOn}
            onIcon2Press={props?.switchCamera}
            onIcon3Press={props?.toggleMuteAudio}
            onIcon4Press={props?.toggleSpeaker}
            onEndCallPress={props?.endCall}
            callDurationRef={props?.callDurationRef}
            onAddUserPress={props?.onAddVideoUserPress}
          />
        </View>
      )}
    </>
  );
};

export default Video;

const styles = StyleSheet.create({
  publisherStyle: {
    width: 116,
    height: 169,
    position: "absolute",
    borderRadius: 12,
    top: 10,
    right: 16,
    zIndex: 200,
  },
  flipIcon: {
    backgroundColor: colors.black,
    height: 32,
    width: 32,
    borderRadius: 100,
    alignSelf: "center",
    position: "absolute",
    bottom: -20,
  },
  callBar: {
    position: "absolute",
    zIndex: 101,
    bottom: 20,
  },
  backBtn: {
    height: 48,
    width: 48,
    backgroundColor: colors.black,
    borderRadius: 24,
    position: "absolute",
    top: 47,
    left: 28,
    zIndex: 99,
  },
});
