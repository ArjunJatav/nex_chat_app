import {
  View,
  Text,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "./Styles";
import DeviceInfo from "react-native-device-info";
import axios from "axios";
import RNFetchBlob from "rn-fetch-blob";
import {
  brdmcheColors,
  browsColors,
  clothesColors,
  eyesColor,
  hairColor,
  lipsColor,
  skinColors,
} from "../../Components/AvatarColors/AvatarColors";
import renderIf from "../../Components/renderIf";
import { Base_Url, avatarApikey, update_profile } from "../../Constant/Api";
import { useTranslation } from "react-i18next";
import { LoaderModel } from "../Modals/LoaderModel";
import TopBar from "../../Components/TopBar/TopBar";

export default function AvatarScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [avatar, setAvatar] = useState(route?.params?.avatarImage);
  const [faceId, setFaceId] = useState(route?.params?.faceId);
  const [loadingg, setLoadingg] = useState(true);
  const [loaderModel, setloaderMoedl] = useState(false);
  const [localImagePath, setLocalImagePath] = useState(null);
  const firstCategory = data.length > 0 ? "hair" : null;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [avatarParts, setAvatarParts] = useState({});
  const [avatarColor, setAvatarColor] = useState({});
  const { t, i18n } = useTranslation();

  // Function to handle selecting a category
  const selectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  useEffect(() => {
    getParts();
  }, []);

  useEffect(() => {
    // Once data is fetched, set the default category to 'hair'
    if (data.length > 0) {
      setSelectedCategory("hair");
    }
  }, [data]);

  const saveImageToLocalFile = async () => {
    setloaderMoedl(true);
    const imageUrl = avatar;
    const timestamp = new Date().getTime(); // Get current timestamp
    const randomString = Math.random().toString(36).substring(7); // Generate random string
    const filename = `${timestamp}_${randomString}.jpg`; // Create unique filename
    const imagePath = `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`;

    try {
      await RNFetchBlob.config({
        path: imagePath,
      }).fetch("GET", imageUrl);
      UpdateImageApi(imagePath);
      setLocalImagePath(imagePath);
    } catch (error) {
      setloaderMoedl(false);
      console.error("Error saving image:", error);
    }
  };

  function UpdateImageApi(img) {
    const urlStr = Base_Url + update_profile;
    setloaderMoedl(true);
    const data = new FormData();
    data.append("profile_image", {
      uri: Platform.OS === "android" ? `file://${img}` : img,
      type: "image/jpeg", // or photo.type
      name: "userImage.jpg",
    });
    data.append("first_name", route.params.userName);
    data.append("tagline", route.params.userTagline);

    try {
      axios({
        method: "post",
        url: urlStr,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + globalThis.Authtoken,
        },
        data: data,
      })
        .then((response) => {
          setloaderMoedl(false);
          if (response.data.status == true) {
            Alert.alert(t("success"), response.data.message, [
              {
                text: t("ok"),
                onPress: () => navigation.navigate("BottomBar"),
              },
            ]);
            globalThis.image = response.data.data;
          } else {
            let messaqe = response.data.message;
            Alert.alert(t("error"), messaqe, [{ text: t("cancel") }]);
          }
        })
        .catch((error) => {
          setloaderMoedl(false);
          alert(error);
        });
    } catch (error) {
      setloaderMoedl(false);
      alert(error);
    }
  }

  const stickerData = [
    {
      face_id: faceId,
      sticker: "tears_of_happiness",
    },
    {
      face_id: faceId,
      sticker: "important_person",
    },
    {
      face_id: faceId,
      sticker: "love_glasses",
    },
    {
      face_id: faceId,
      sticker: "love_you_cake",
    },
    {
      face_id: faceId,
      sticker: "selfie_time",
    },

    // Add more sticker objects for each sticker name
  ];

  const getParts = async () => {
    const urlStr =
      "https://public-api.mirror-ai.net/v2/get_all_parts?face_id=" +
      `${faceId}`;
    try {
      setLoading(true);
      await axios({
        method: "get",
        maxBodyLength: Infinity,
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
          "X-Token": `${globalThis.mirrorApiKey}`,
        },
      })
        .then((response) => {
          setLoading(false);
          if (response.data.ok == true) {
            setData(response.data.tabs);
            setSelectedCategory(data.length > 0 ? "hair" : null);
          }
        })
        .catch((error) => {
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  const applyColor = async (item) => {
    setLoadingg(true);
    switch (selectedCategory) {
      case "hair":
        setAvatarColor((prevState) => ({ ...prevState, hair: item.id }));
        break;

      case "eye":
        setAvatarColor((prevState) => ({ ...prevState, eyes: item.id }));

        break;

      case "brow":
        setAvatarColor((prevState) => ({ ...prevState, brows: item.id }));
        break;
      case "mouth":
        setAvatarColor((prevState) => ({ ...prevState, lips: item.id }));
        break;

      case "oval":
        setAvatarColor((prevState) => ({ ...prevState, skin: item.id }));
        break;
      case "brdmche":
        setAvatarColor((prevState) => ({ ...prevState, brdmche: item.id }));
        break;

      case "clothes":
        setAvatarColor((prevState) => ({ ...prevState, clothes: item.id }));
        break;

      case "skin":
        setAvatarColor((prevState) => ({ ...prevState, skin: item.id }));
        break;
    }
  };

  const applyParts = async (item) => {
    setLoadingg(true);
    switch (selectedCategory) {
      case "hair":
        setAvatarParts((prevState) => ({ ...prevState, hair: item.id }));
        break;
      case "glasses":
        setAvatarParts((prevState) => ({ ...prevState, glasses: item.id }));
        break;
      case "nose":
        setAvatarParts((prevState) => ({ ...prevState, nose: item.id }));
        break;
      case "eye":
        setAvatarParts((prevState) => ({ ...prevState, eye: item.id }));
        break;
      case "eyemakeup":
        setAvatarParts((prevState) => ({ ...prevState, eyemakeup: item.id }));
        break;
      case "hat":
        setAvatarParts((prevState) => ({ ...prevState, hat: item.id }));
        break;
      case "brow":
        setAvatarParts((prevState) => ({ ...prevState, brow: item.id }));
        break;
      case "mouth":
        setAvatarParts((prevState) => ({ ...prevState, mouth: item.id }));
        break;
      case "earring":
        setAvatarParts((prevState) => ({ ...prevState, earring: item.id }));
        break;
      case "oval":
        setAvatarParts((prevState) => ({ ...prevState, oval: item.id }));
        break;
      case "brdmche":
        setAvatarParts((prevState) => ({ ...prevState, brdmche: item.id }));
        break;
    }

    const applyPartsdata = { ...avatarParts };
  };

  useEffect(() => {
    // Perform the API call only when avatarParts change
    const applyPartsToAvatar = async () => {
      setLoadingg(true);
      const requestBody = {
        face_id: faceId,
        parts: JSON.stringify(avatarParts),
        colors: JSON.stringify(avatarColor),
        clothes: '{"outer.jacket": 4001, "shoes.shoes": 2001,"clothes":28}',
        preview: 1,
      };

      try {
        const response = await axios.post(
          "https://public-api.mirror-ai.net/v2/apply_parts",
          requestBody,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-Token": globalThis.mirrorApiKey,
            },
          }
        );
        setAvatar(response.data.face.url);
        setLoadingg(false);
      } catch (error) {
        setLoadingg(false);
      }
    };

    applyPartsToAvatar(); // Call the function to apply parts whenever avatarParts change
  }, [avatarParts, avatarColor]); // Run this effect whenever avatarParts change

  return (
    <View style={styles.container}>
      {renderIf(
        DeviceInfo.hasNotch() == true,
        <View
          style={{
            width: "100%",
            height: 24,
          }}
        ></View>
      )}
      <View style={{ marginTop: 20 }}>
        <TopBar
          showTitleForBack={true}
          title="Create Your Avatar"
          backArrow={true}
          navState={navigation}
          checked={
            //@ts-ignore
            globalThis.selectTheme
          }
          Avatar={true}
          onPress={() => saveImageToLocalFile()}
        />
      </View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 10,
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 95,
          }}
        >
          {loadingg && <ActivityIndicator size="large" color="green" />}
        </View>

        <Image
          source={{ uri: avatar }}
          style={{
            height: 200,
            width: 200,
            opacity: loadingg ? 0.2 : 1,
            resizeMode: "contain",
          }}
          onLoad={() => setLoadingg(false)} // Set loading to false when image successfully loaded
          onError={() => setLoadingg(true)} // Set loading to true when image failed to load
          resizeMode="contain"
        />

        {/* tintColor:`#${131}` */}
      </View>
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data &&
            data.map((category, index) => (
              <View key={index}>
                {category.name ? (
                  <TouchableOpacity
                    key={category.name}
                    onPress={() => selectCategory(category.name)}
                    style={[
                      styles.categoryContainer,
                      selectedCategory === category.name &&
                        styles.selectedCategory,
                      {
                        backgroundColor: "lightgray",
                        borderRadius: 10,
                        marginHorizontal: 5,
                      },
                    ]}
                  >
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </TouchableOpacity>
                ) : null}
                {category.material === "clothes" ? (
                  <TouchableOpacity
                    key={category.name}
                    onPress={() => selectCategory(category.material)}
                    style={[
                      styles.categoryContainer,
                      selectedCategory === category.material &&
                        styles.selectedCategory,
                      {
                        backgroundColor: "lightgray",
                        borderRadius: 10,
                        marginHorizontal: 5,
                      },
                    ]}
                  >
                    <Text style={styles.categoryText}>{category.material}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          {/* Render TouchableOpacity after the last index */}
        </ScrollView>
      </View>

      {selectedCategory === "hair" ? (
        <View
          style={{
            // height: 40,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 10,
            paddingHorizontal: 10,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data &&
              hairColor?.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => applyColor(color)}
                  style={{
                    marginHorizontal: 2,
                    borderRadius: 50,
                    backgroundColor: color.color,
                    height: 30,
                    width: 30,
                  }}
                ></TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      ) : selectedCategory === "eye" ? (
        <View
          style={{
            // height: 40,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 10,
            paddingHorizontal: 10,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data &&
              eyesColor?.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => applyColor(color)}
                  style={{
                    marginHorizontal: 2,
                    borderRadius: 50,
                    backgroundColor: color.color,
                    height: 30,
                    width: 30,
                    borderWidth: 0.5,
                  }}
                ></TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      ) : selectedCategory === "brdmche" ? (
        <View
          style={{
            // height: 40,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 10,
            paddingHorizontal: 10,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data &&
              brdmcheColors?.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => applyColor(color)}
                  style={{
                    marginHorizontal: 2,
                    borderRadius: 50,
                    backgroundColor: color.color,
                    height: 30,
                    width: 30,
                  }}
                ></TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      ) : selectedCategory === "brow" ? (
        <View
          style={{
            // height: 40,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 10,
            paddingHorizontal: 10,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data &&
              browsColors?.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => applyColor(color)}
                  style={{
                    marginHorizontal: 2,
                    borderRadius: 50,
                    backgroundColor: color.color,
                    height: 30,
                    width: 30,
                  }}
                ></TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      ) : selectedCategory === "mouth" ? (
        <View
          style={{
            // height: 40,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 10,
            paddingHorizontal: 10,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data &&
              lipsColor?.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => applyColor(color)}
                  style={{
                    marginHorizontal: 2,
                    borderRadius: 50,
                    backgroundColor: color.color,
                    height: 30,
                    width: 30,
                  }}
                ></TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      ) : selectedCategory === "oval" ? (
        <View
          style={{
            // height: 40,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 10,
            paddingHorizontal: 10,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data &&
              skinColors?.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => applyColor(color)}
                  style={{
                    marginHorizontal: 2,
                    borderRadius: 50,
                    backgroundColor: color.color,
                    height: 30,
                    width: 30,
                  }}
                ></TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Render the selected category */}
      {selectedCategory && (
        <View style={styles.templateContainer}>
          {selectedCategory === "clothes" ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={clothesColors}
              numColumns={4} // Set number of columns as per your requirement
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => applyColor(item)}
                  style={{
                    width: "25%",
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: "lightgray",
                    borderWidth: 0.5,
                  }}
                >
                  <Image
                    source={require("../../Assets/Image/tshirt.png")}
                    style={[styles.image, { tintColor: item.color }]}
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={
                data.find((category) => category.name === selectedCategory)
                  ?.templates || [] // Add error handling here
              }
              numColumns={4} // Set number of columns as per your requirement
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => applyParts(item)}
                  style={{
                    width: "25%",
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: "lightgray",
                    borderWidth: 0.5,
                  }}
                >
                  <Image source={{ uri: item.url }} style={[styles.image]} />
                </TouchableOpacity>
              )}
            />
          )}
          {/* Render a FlatList for the templates within the selected category */}
        </View>
      )}

      <LoaderModel
        visible={loaderModel}
        onRequestClose={() => setloaderMoedl(false)}
        cancel={() => setloaderMoedl(false)}
      />
    </View>
  );
}
