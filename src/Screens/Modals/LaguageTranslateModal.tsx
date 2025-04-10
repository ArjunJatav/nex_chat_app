import axios from "axios";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  searchBar,
} from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import { translationKey } from "../../Constant/Key";
export default function LaguageTranslateModal({
  visible: visible,
  onRequestClose: onRequestClose,
  translateMessage: translateMessage,
  cancel: cancel,
  TranslatedLangugae: TranslatedLangugae,
}) {
  const languageList = [
    { id: 1, flag: "🇺🇸", lang: "English", langinst: "en", language: "English" },
    {
      id: 21,
      flag: "🇬🇪",
      lang: "ქართველი",
      langinst: "ka",
      language: "Georgian",
    },
    { id: 2, flag: "🇯🇵", lang: "日本語", langinst: "ja", language: "Japanese" },
    { id: 4, flag: "🇮🇳", lang: "हिंदी", langinst: "hi", language: "Hindi" },
    { id: 5, flag: "🇩🇪", lang: "German", langinst: "de", language: "German" },
    {
      id: 6,
      flag: "🇪🇸",
      lang: "Espagnol",
      langinst: "es",
      language: "Spanish",
    },
    { id: 7, flag: "🇫🇷", lang: "Français", langinst: "fr", language: "French" },
    { id: 8, flag: "🇷🇺", lang: "русский", langinst: "ru", language: "Russian" },
    { id: 9, flag: "🇲🇾", lang: "Melayu", langinst: "my", language: "Malay" },
    {
      id: 11,
      flag: "🇮🇩",
      lang: "Bahasa",
      langinst: "id",
      language: "Indonesian",
    },
    { id: 12, flag: "🇹🇷", lang: "Türk", langinst: "tr", language: "Turkish" },
    {
      id: 13,
      flag: "🇨🇳",
      lang: "华语 简",
      langinst: "zh",
      language: "Chinese",
    },
    {
      id: 22,
      flag: "🇭🇰",
      lang: "華語 繁",
      langinst: "zh_HK",
      language: "Chinese Traditional",
    },
    {
      id: 14,
      flag: "🇻🇳",
      lang: "Tiếng Việt",
      langinst: "vi",
      language: "Vietnamese",
    },
    {
      id: 15,
      flag: "🇳🇱",
      lang: "Nederlands",
      langinst: "nl",
      language: "Dutch",
    },
    { id: 16, flag: "🇰🇷", lang: "한국어", langinst: "ko", language: "Korean" },
    {
      id: 17,
      flag: "🇵🇹",
      lang: "português",
      langinst: "pt",
      language: "Portuguese",
    },
    { id: 19, flag: "🇧🇩", lang: "বাংলা", langinst: "bn", language: "Bengali" },
    {
      id: 20,
      flag: "🇰🇪",
      lang: "kiswahili",
      langinst: "sw",
      language: "Swahili",
    },
  ];

  async function LanguageSelect(language) {

    if (translateMessage.text.length > 1000) {
      Alert.alert(
        "Text translate Limit Exceeded",
        "The text you want to translate is too long. Please shorten it and try again."
      );
      return;
    }

    const urlStr =
      "https://www.googleapis.com/language/translate/v2?key=" +
      translationKey +
      "&target=" +
      language +
      "&q=" +
      translateMessage.text;
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
          TranslatedLangugae(
            translateMessage,
            response.data.data.translations[0].translatedText
          );
          cancel();
        })
        .catch((error) => {
          Alert.alert(error);
        });
    } catch (error) {
      Alert.alert(error);
    }
  }

  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={visible}
      transparent={true}
      onRequestClose={() => {
        onRequestClose;
      }}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.4)" }}
        onPress={cancel}
      >
        <View style={[styles.modal_view, { height: "55%" }]}>
          <Text
            style={{
              position: "absolute",
              borderRadius: 20,
              left: 20,
              top: 25,
              fontFamily: font.bold(),
              color: "#000",
            }}
          >
            Choose Language
          </Text>
          <TouchableOpacity style={[styles.cancel_button]} onPress={cancel}>
            <Image
              source={require("../../Assets/Icons/Cross.png")}
              style={{
                height: 20,
                width: 20,
                tintColor: "#000",
                //
              }}
            />
          </TouchableOpacity>

          <View style={{ marginTop: "15%" }}>
            <FlatList
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={{ paddingBottom: 50 }}
              data={languageList}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    style={[styles.recentStatusContainer]}
                    activeOpacity={0.7}
                    onPress={() => LanguageSelect(item.langinst)}
                  >
                    <View style={[styles.Container]} key={index}>
                      <View style={styles.recentStory}>
                        <Text
                          style={[styles.circleImageLayout, { fontSize: 35 }]}
                        >
                          {item.flag}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.naContainer}>
                      <Text style={styles.name1Text}>{item.lang}</Text>
                    </View>
                    <View style={styles.emptyContainer}></View>
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={() => {
                return <View style={{ height: 50 }}></View>;
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modal_view: {
    width: "100%",
    bottom: 0,
    left: 0,
    right: 0,
    position: "absolute",
    backgroundColor: "#fff",
    borderTopEndRadius: 12,
    borderTopStartRadius: 12,
    elevation: 6,
    shadowColor: COLORS.black,
    shadowOpacity: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 3.5,
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: font.regular(),
  },

  nameText: {
    fontSize: 18,
    color: COLORS.black,
    fontWeight: "600",
    fontFamily: font.regular(),
  },
  modal: {
    width: "100%",
    marginLeft: 0,
    marginBottom: 0,
  },

  textInput: {
    paddingVertical: 0,
    fontFamily: font.semibold(),
    backgroundColor: "#fff",
    //  backgroundColor:"red",
    alignItems: "center",
    fontSize: 17,
    //  height: 40
  },
  upload_button: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 10,
    width: "47%",
    height: 100,
    backgroundColor: "#FCF1FF",
  },
  cancel_button: {
    position: "absolute",
    borderRadius: 20,
    padding: 7,
    backgroundColor: searchBar().back_ground,
    right: 20,
    top: 20,
  },
  phoneContainer: {
    marginTop: 14,
    width: "100%",
    height: 40,
    fontFamily: font.semibold(),
    borderBottomWidth: 1,
    borderBottomColor: "#F6EBF3",
  },

  recentStatusContainer: {
    justifyContent: "center",
    margin: 0,
    flexDirection: "row",
    width: "100%",
  },
  Container: {
    margin: 5,
    marginLeft: 0,
    width: "10%",
  },
  recentStory: {
    width: 45,
    height: 45,
    borderRadius: 30,
  },
  circleImageLayout: {
    width: 40,
    height: 40,
    borderRadius: 25,
    color: COLORS.black,
  },
  name1Text: {
    fontSize: DeviceInfo.isTablet() ? 20 : 14,
    fontFamily: font.semibold(),
    paddingLeft: 10,
    color: COLORS.black,
  },
  naContainer: {
    justifyContent: "center",
    width: "70%",
    flexDirection: "column",
  },
  timeContainer: {
    margin: 0,
    width: "65%",
    flexDirection: "row",
  },
  emptyContainer: {
    borderRadius: 15,
    borderWidth: 1,
    height: 45,
    borderColor: "transparent",
    flexDirection: "row",
    width: "10%",
  },
});
