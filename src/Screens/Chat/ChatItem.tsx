import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import CryptoJS from "react-native-crypto-js";
import { useDispatch, useSelector } from "react-redux";
import { COLORS } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import { EncryptionKey } from "../../Constant/Key";
import { clearTyping, } from "../../Redux/rootReducer";
import { t } from "i18next";
import DeviceInfo from "react-native-device-info";
import { decryptMessage } from "../../utils/CryptoHelper";

const ChatItem = ({ item }:object) => {
  const { typing } = useSelector((state) => state.root);
  const dispatch = useDispatch();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (typing[item?.roomId] && typing[item?.roomId].length > 0) {
        if (typing[item?.roomId][0] !== "") {
          dispatch(clearTyping(item?.roomId));
        }
      }
    }, 2000);

    return () => clearTimeout(timeoutId); // Cleanup the timeout on component unmount or update
  }, [typing]); // Empty dependency array ensures that the effect runs only once on mount

  function MessageDecrypt(message) {
    return (
      <Text style={{fontFamily:font.regular()}}>
        {
          //@ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
          // CryptoJS.AES.decrypt(message, EncryptionKey).toString(
          //   CryptoJS.enc.Utf8
          // )
          decryptMessage(item?.roomId, message)
        }
      </Text>
    );
  }

  function showTypingMessage(str) {
    const sentence = str;
    if (sentence.length > 0) {
      const wordsArray = sentence.toString().split("...");

      if (wordsArray.length > 2) {
        const finalmessage = wordsArray.length - 1 + " members typing..";
        return finalmessage;
      } else {
        return str;
      }
    }
  }

  function createUIComponent() {
    if (typing[item?.roomId] && typing[item?.roomId]?.length !== 0) {
      return (
        <View>
          <Text
            key={item?.roomId}
            style={{
              color: COLORS.light_green,
              fontSize: 14,
              fontFamily: font.medium(),
            }}
          >
            {showTypingMessage(typing[item?.roomId])}
          </Text>
        </View>
      );
    } else {
      return (
        <View>
          {item.isLatestMessageDeleted == 1 ? (
            <Text style={[styles.message_text]} numberOfLines={1}>
              {t("msg_was_delete")}
            </Text>
          ) : (
            <>
               {!item.lastMessageType &&
                <Text
                style={[styles.message_text]}
                  numberOfLines={1}
                >
                { t("messages_and_calls_end-to-end_encrypted")}
                </Text>
              }

              {item.lastMessageType == "text" && (
                <Text style={[styles.message_text]} numberOfLines={1}>
                  {MessageDecrypt(item.lastMessage.trim())}
                </Text>
              )}
              {item.lastMessageType == "story" && (
                <Text style={[styles.message_text]} numberOfLines={1}>
                  {MessageDecrypt(item.lastMessage.trim())}
                </Text>
              )}
              {item.lastMessageType == "notify" && (
                <Text style={[styles.message_text]} numberOfLines={1}>
                  {MessageDecrypt(item.lastMessage.trim())}
                </Text>
              )}
              {item.lastMessageType == "broadcast_notify" && (
                <Text style={[styles.message_text]} numberOfLines={1}>
                  {MessageDecrypt(item.lastMessage.trim())}
                </Text>
              )}
              {item.lastMessageType == "audio" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{
                      height: 15,
                      width: 15,
                      marginRight: 6,
                    }}
                    source={require("../../Assets/Icons/audioimg.png")}
                  />
                  <Text style={[styles.message_text]} numberOfLines={1}>
                    {t("audio")}
                  </Text>
                </View>
              )}
              {item.lastMessageType == "video" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{
                      height: 15,
                      width: 15,
                      marginRight: 6,
                    }}
                    source={require("../../Assets/Icons/videoimg.png")}
                  />
                  <Text style={[styles.message_text]} numberOfLines={1}>
                   {t("video")}
                  </Text>
                </View>
              )}
              {item.lastMessageType == "document" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{
                      height: 15,
                      width: 15,
                      marginRight: 6,
                    }}
                    source={require("../../Assets/Icons/Documentimg.png")}
                  />
                  <Text style={[styles.message_text]} numberOfLines={1}>
                    {t("document")}
                  </Text>
                </View>
              )}
              {item.lastMessageType == "image" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{
                      height: 15,
                      width: 15,
                      marginRight: 6,
                    }}
                    source={require("../../Assets/Icons/Imageimg.png")}
                  />
                  <Text style={[styles.message_text]} numberOfLines={1}>
                   {t("image")}
                  </Text>
                </View>
              )}
              {item.lastMessageType == "sticker" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{
                      height: 15,
                      width: 15,
                      marginRight: 6,
                    }}
                    source={require("../../Assets/Icons/Stickerimg.png")}
                  />
                  <Text style={[styles.message_text]} numberOfLines={1}>
                   {t("Sticker")}
                  </Text>
                </View>
              )}
              {item.lastMessageType == "contact" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{
                      height: 15,
                      width: 15,
                      marginRight: 6,
                    }}
                    source={require("../../Assets/Icons/Contactimg.png")}
                  />
                  <Text style={[styles.message_text]} numberOfLines={1}>
                    {t("contact")}
                  </Text>
                </View>
              )}
              {item.lastMessageType == "location" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{
                      height: 15,
                      width: 15,
                      marginRight: 6,
                    }}
                    source={require("../../Assets/Icons/locationimg.png")}
                  />
                  <Text style={[styles.message_text]} numberOfLines={1}>
                    {t("location")}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      );
    }
  }

  return <View>{createUIComponent()}</View>;
};

const styles = StyleSheet.create({
  message_text: {
    color: COLORS.black,
    fontSize: DeviceInfo.isTablet() ? 18 : 14,
    fontFamily:font.regular(),
  },
});

export default ChatItem;
