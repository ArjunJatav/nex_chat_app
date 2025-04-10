import axios from "axios";
import React, { useContext, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  COLORS,
  appBarText,
  searchBar,
  textTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { font } from "../../../Components/Fonts/Font";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import TopBar from "../../../Components/TopBar/TopBar";
import { chatBaseUrl, groupEditApi } from "../../../Constant/Api";
import { chatTop } from "../../../Navigation/Icons";
import { setroominfo } from "../../../Redux/ChatHistory";
import { updateroominfo } from "../../../sqliteStore";
import { useTranslation } from "react-i18next";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";

const isDarkMode = true;
const data = [
  { id: 1, name: "Eun Kyung", contact: "+91-9065812452", isChecked: false },
  { id: 2, name: "Eun Kyung", contact: "+91-9065812452", isChecked: false },
];
export default function EditBroadcastScreen({ navigation, route }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [checked, setChecked] = useState(false);
  const [groupName, setGroupName] = useState(route.params.groupName);
  const [groupImage, setGroupImage] = useState(route.params.groupImage);
  const newroomID = useSelector((state: any) => state.chatHistory.newroomID);
  const [products, setProducts] = React.useState(data);
  const [grpmembers, setgrpmembers] = useState<any>(
    route.params.groupDetailData
  );
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [errorAlertModel, setErrorAlertModel] = useState(false);


  const buttonPress = () => {
    navigation.navigate("BottomBar");
  };
  const buttonPress2 = () => {
    
    let chatIds = grpmembers.map((data: any) => data.phone_number);
    const new_grpmembers = grpmembers.filter(//@ts-ignore
      (member:any) => member.userId != globalThis.userChatId
    );
    navigation.navigate("AddMembersScreen", {
      groupName: groupName,
      groupImage: groupImage,
      groupMembers: new_grpmembers,
      grouptyp: "broadcast",
      groupAllow: "public",
      roomId: newroomID,
      isPublic: false,
    });
  };

  const handleChange = (id: any) => {
    //@ts-ignore
    const userIndex = grpmembers.findIndex((data) => data.user._id === id);

    if (userIndex !== -1) {
      const updatedGrpmembers = [
        ...grpmembers.slice(0, userIndex),
        ...grpmembers.slice(userIndex + 1),
      ];

      setgrpmembers(updatedGrpmembers);
    } else {
      console.log(`User with ID ${id} not found in grpmembers`);
    }
  };
  const GroupEditApi = async () => {
    if (groupName?.toLowerCase()?.includes("tokee")) {
      // Alert.alert(
      //   t("error"),
      //   t("you_cn_use_tokee_name_for_broadcast"),
      //   [{ text: t("ok") }]
      // );
      globalThis.errorMessage =  t("you_cn_use_tokee_name_for_broadcast");
      setErrorAlertModel(true);
      return; // Exit early if "toke" is found
    }
    const urlStr = chatBaseUrl + groupEditApi;
    try {
      await axios({
        method: "PATCH",
        url: urlStr,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          room_id: newroomID,
          new_group_name: groupName,
          new_group_image: groupImage,
        },
      })
        .then((response) => {
          if (response.data.status == true) {
            updateroominfo(
              response.data.data.name,
              response.data.data.image,
              newroomID,
              "public", //@ts-ignore
              globalThis.chatUserId,
              response.data.data.isPublic
            );
            dispatch(
              setroominfo({
                roomImage: response.data.data.image,
                roomName: response.data.data.name,
              })
            );
            navigation.pop();
          } else {
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
          }
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  let selected = products.filter((product) => product.isChecked);
  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: 20,
    },
    newGroupText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginTop: 15,
      fontSize: 15,
      fontFamily: font.bold(),
    },
    enterText: {
      color: COLORS.black,
      justifyContent: "center",
      height: 45,
      marginLeft: 10,
      fontSize: 15,
      width: "85%",
      fontFamily: font.bold(),
    },
    seachContainer: {
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
      marginTop: 15,
      height: 45,
      borderRadius: 20,
      fontFamily: font.bold(),
      backgroundColor: "#F0E0F1",
      flexDirection: "row",
      width: "100%",
    },
    cancelText: {
      color: appBarText().textColor,
      fontSize: 15,
      fontFamily: font.medium(),
    },
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    newChatIcon: {
      height: 10,
      width: 10,
      tintColor: textTheme().textColor,
    },
    plusIcon: {
      height: 20,
      width: 20,
      tintColor: textTheme().textColor,
      marginBottom: 10,
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
      height: "90%",
    },
    nameTextContainer: {
      alignItems: "flex-start",
      paddingLeft: 10,
    },
    nameText: {
      marginTop: 10,
      fontSize: 18,
      color: COLORS.black,
      fontFamily: font.semibold(),
    },
    profile1Container2: {
      marginTop: 10,
      flexDirection: "column",
      justifyContent: "center",
      height: 80,
    },
    nameContainer: {
      marginLeft: 20,
      justifyContent: "center",
      margin: 0,
      marginBottom: 10,
      width: "50%",
    },
    nameInputText: {
      fontSize: 16,
      padding: 0,
      marginTop: 10,
      color: COLORS.black,
      fontFamily: font.regular(),
    },
    circleImageLayout: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    nameInputTextContainer: {
      marginRight: 10,
      marginLeft: 10,
      borderBottomWidth: 0.5,
      marginTop: 0,
      paddingBottom: 5,
      color: COLORS.black,
      fontFamily: font.bold(),
      borderBottomColor: "#F6EBF3",
    },
    addMemberContainer: {
      backgroundColor: searchBar().back_ground,
      width: "20%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      marginTop: 5,
      height: 85,
    },
    addText: {
      color: textTheme().textColor,
      fontSize: 12,
      fontFamily: font.semibold(),
    },
  });

  return (
    <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
      <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >

<ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        {/* // **********    View For Show the TopBar    ********** /// */}
        <TopBar showTitle={true} title={t("edit_broadcast")} checked={
            //@ts-ignore
            globalThis.selectTheme
          }/>

        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => GroupEditApi()}
            >
              <Text style={styles.cancelText}>{t("save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
       
    {
            //@ts-ignore
            globalThis.selectTheme === "christmas" || //@ts-ignore
            globalThis.selectTheme === "newYear" || //@ts-ignore
            globalThis.selectTheme === "newYearTheme" || //@ts-ignore
            globalThis.selectTheme === "mongoliaTheme" || //@ts-ignore
            globalThis.selectTheme === "indiaTheme" ||
            globalThis.selectTheme === "englandTheme" ||
            globalThis.selectTheme === "americaTheme" ||
            globalThis.selectTheme === "mexicoTheme" || //@ts-ignore
            globalThis.selectTheme === "usindepTheme" ? (
            <ImageBackground
              source={chatTop().BackGroundImage}
              resizeMode="cover" // Update the path or use a URL
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
      </View>

      <View style={styles.chatContainer}>
        <View style={styles.nameTextContainer}>
          <Text style={styles.nameText}>{t("broadcast_name")}</Text>
        </View>
        <View style={styles.nameInputTextContainer}>
          <TextInput
            style={styles.nameInputText}
            placeholder={route.params.groupName}
            placeholderTextColor={COLORS.black}
            defaultValue={groupName}
            onChangeText={(text) => setGroupName(text)}
            maxLength={40}
            onSubmitEditing={()=>Keyboard.dismiss()}

          />
        </View>
        <View style={styles.nameTextContainer}>
          <Text style={styles.nameText}>{t("broadcast_members")}</Text>
        </View>
        <View
          style={{
            marginHorizontal: 10,
            marginVertical: 10,
            flexDirection: "row",
          }}
        >
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={route.params.groupDetailData}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.profile1Container2,
                  { marginHorizontal: 4, justifyContent: "center" },
                ]}
              >
                {item.owner !== item.userId && (
                  <>
                    <View style={{ paddingHorizontal: 10 }} key={index}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.circleImageLayout}
                        resizeMode="cover"
                      />
                    </View>

                    <View
                      style={{
                        justifyContent: "center",
                        alignSelf: "center",
                        flexDirection: "column",
                        marginTop: 5,
                      }}
                    >
                      <Text numberOfLines={1}>
                        {item.name || item.userName}
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={() => buttonPress2()}
            activeOpacity={0.7}
            style={styles.addMemberContainer}
          >
            <Image
              source={require("../../../Assets/Icons/plus.png")}
              style={styles.plusIcon}
            />
            <Text style={styles.addText}>{t("addMembers")}</Text>
           
          </TouchableOpacity>
        </View>
      </View>
    </MainComponent>
  );
}
