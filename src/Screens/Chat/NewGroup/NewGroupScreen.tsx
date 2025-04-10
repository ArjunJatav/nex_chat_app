import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Contacts from "react-native-contacts";
import DeviceInfo from "react-native-device-info";
import { GetApiCall } from "../../../Components/ApiServices/GetApi";
import { PostApiCall } from "../../../Components/ApiServices/PostApi";
import {
  COLORS,
  appBarText,
  iconTheme,
  searchBar,
  textTheme,
  themeModule,
} from "../../../Components/Colors/Colors";
import CustomStatusBar from "../../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../../Components/Fonts/Font";
import MainComponent from "../../../Components/MainComponent/MainComponent";
import SearchBar from "../../../Components/SearchBar/SearchBar";
import ThemeContext from "../../../Components/ThemeContext/ThemeContext";
import TopBar from "../../../Components/TopBar/TopBar";
import renderIf from "../../../Components/renderIf";
import { get_all_contact, get_by_phone_number } from "../../../Constant/Api";
import { chatTop } from "../../../Navigation/Icons";
import { insertContact, insertContactIOS } from "../../../sqliteStore";
import { ContactLoaderModel } from "../../Modals/ContactLoaderModel";
import { LoaderModel } from "../../Modals/LoaderModel";
import ToShowContactName from "../../calling/components/ContactShow";
import { ErrorAlertModel } from "../../Modals/ErrorAlertModel";

const isDarkMode = true;
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const data: any[] | (() => any[]) = [];
export default function NewGroupScreen({ navigation, route }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const [products, setProducts] = React.useState(data);
  const [oldProducts, setOldProducts] = React.useState(data);
  const [searchValue, setSearchValue] = useState("");
  const [uniquePhoneNumbers, setUniquePhoneNumbers] = useState(new Set());
  const windowHeight = Dimensions.get("window").height;
  const [contactsInTokee, setTokeeContacts] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [allContactList, setALLContactList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [conatctLoaderModel, setContactLoaderModel] = useState(true);
  const [groupType, setGroupType] = useState(route?.params?.groupType);
  const [previousProducts, setPreviousProducts] = React.useState(data);
  const [groupTitle, setGroupTitle] = useState(route?.params?.groupTitle);
  const [selected, setSelected] = React.useState(data);

  const [errorAlertModel, setErrorAlertModel] = useState(false);

  // **********   Method for Navigation ********** ///
  const buttonPress = () => {
    navigation.pop();
  };

  function NavigateSelectedData(value: any) {
    if (value.length > 0) {
      for (let index = 0; index < products.length; index++) {
        let temp = products[index];
        products[index].isChecked = false;
        for (let ycoor = 0; ycoor < value.length; ycoor++) {
          let temp2 = value[ycoor];
          if (temp.chat_user_id == temp2.chat_user_id) {
            products[index].isChecked = true;
          }
        }
      }

      setSelected(value);
    } else {
      setSelected([]);

      for (let index = 0; index < products.length; index++) {
        const reValue = (products[index].isChecked = false);
      }
    }
  }
  // **********   Headers for api ********** ///
  let headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    //@ts-ignore
    "Content-Type": "multipart/form-data",
    //@ts-ignore
    Authorization: "Bearer " + globalThis.Authtoken,
    "localization":globalThis.selectLanguage,
  };

  useEffect(() => {
    const unsubscribe2 = navigation.addListener("focus", () => {
      // ********** InterNet Permission    ********** ///
      if (route.params?.addedData !== undefined) {
      }
    });
    return unsubscribe2;
  }, []);

  useEffect(() => {
    getContactUploadStatus();
  }, []);

  const getContactUploadStatus = async () => {
    setTokeeContacts([]);
    setContactLoaderModel(true);
    let Status = await AsyncStorage.getItem("isContactUploaded");
    if (Status == null) {
      requestContactsPermission();
    } else {
      setContactLoaderModel(false);
      getContactAllList();
    }
  };

  const getContactAllList = async () => {
    // Retrieve from AsyncStorage
    const storedTokeeContactListTempString = await AsyncStorage.getItem(
      "tokeeContactListTemp"
    );
    const storedContactListTempString = await AsyncStorage.getItem(
      "contactListTemp"
    );

    // Convert JSON string back to array
    const storedTokeeContactListTemp = JSON.parse(
      //@ts-ignore
      storedTokeeContactListTempString
    );

    // Update the state with retrieved values
    if (storedTokeeContactListTemp !== null) {
      setProducts(storedTokeeContactListTemp || []);
      setOldProducts(storedTokeeContactListTemp);
      // setIsLoading(false);
    }

    await AsyncStorage.setItem(
      "tokeeContactListTemp",
      //@ts-ignore
      JSON.stringify(tokeeContactListTemp)
    );
    //@ts-ignore
    await AsyncStorage.setItem(
      "contactListTemp",
      //@ts-ignore
      JSON.stringify(contactListTemp)
    );
  };

  // **********   Getting contact List from Device ********** ///
  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: t("tokee_would_like_to_access_your_contact"),
          message: t("this_permission_is_requried_for_app_to_funcation_well "),
          buttonPositive: "Ok",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const uniquePhoneNumbers = new Set();
        Contacts.getAll()
          .then((contacts) => {
            setContactLoaderModel(true);
            //@ts-ignore
            var contactArr: Array = [];

            contacts.forEach((item) => {
              item.phoneNumbers.forEach((contactPhone) => {
                const phoneNumber = contactPhone.number;
                // Check if the phone number is not in the Set, and if not, add it to the array and the Set
                if (!uniquePhoneNumbers.has(phoneNumber)) {
                  uniquePhoneNumbers.add(phoneNumber);
                  var trimNumber = phoneNumber.toString();
                  const result = trimNumber.replace(/[()\- *#]/g, "");
                  const contactDict = {
                    country_code: "",
                    phone_number: result,
                    contact_name: ToShowContactName(item),
                  };
                  contactArr.push(contactDict);
                }
              });
            });
            insertContact(contactArr);

            let data = {
              //@ts-ignore
              user_contacts: JSON.stringify(contactArr),
            };

            PostApiCall(
              get_by_phone_number,
              data,
              headers,
              navigation,
              (ResponseData, ErrorStr) => {
                apiSuccess(ResponseData, ErrorStr);
              }
            );
          })
          .catch((e) => {
            setContactLoaderModel(false);
          });
      } else {
        if (Platform.OS === "android") {
          setContactLoaderModel(false);
          Alert.alert(
            t("tokee_would_like_to_access_your_contact"),
            t("please_enable_contacts_permission"),
            [
              {
                text: "Ok",
              },
            ],
            { cancelable: true }
          );

          return;
        } else {
        }

        setContactLoaderModel(true);
        const uniquePhoneNumbers = new Set();

        Contacts.getAll()
          .then((contacts) => {
            //@ts-ignore
            var contactArr: any = [];
            contacts.forEach((item) => {
              item.phoneNumbers.forEach((contactPhone) => {
                const phoneNumber = contactPhone.number;
                // Check if the phone number is not in the Set, and if not, add it to the array and the Set
                if (!uniquePhoneNumbers.has(phoneNumber)) {
                  uniquePhoneNumbers.add(phoneNumber);
                  var trimNumber = phoneNumber.toString();
                  const result = trimNumber.replace(/[()\- *#]/g, "");

                  const contactDict = {
                    country_code: "",
                    phone_number: result,
                    contact_name: ToShowContactName(item),

                  };

                  contactArr.push(contactDict);
                }
              });
            });
            insertContactIOS(contactArr);
            let data = {
              //@ts-ignore
              user_contacts: JSON.stringify(contactArr),
            };

            PostApiCall(
              get_by_phone_number,
              data,
              headers,
              navigation,
              (ResponseData, ErrorStr) => {
                apiSuccess(ResponseData, ErrorStr);
              }
            );
          })
          .catch((err) => {
            if (err.message == "denied") {
              setContactLoaderModel(false);
              Alert.alert(
                t("tokee_would_like_to_access_your_contact"),
                t("please_enable_contacts_permission"),
                [
                  {
                    text: "Ok",
                  },
                ],
                { cancelable: true }
              );
            }
          });
      }
    } catch (error) {
      setContactLoaderModel(false);
    }
  };

  // **********  Method for return the api Response   ********** ///
  const apiSuccess = async (ResponseData: any, ErrorStr: any) => {
    if (ErrorStr) {
     // Alert.alert(t("error"), ErrorStr, [{ text: t("cancel") }]); 

      setContactLoaderModel(false);
      globalThis.errorMessage = ErrorStr;
      setErrorAlertModel(true);
    } else {
      await AsyncStorage.setItem("isContactUploaded", "true");
      //@ts-ignore
      var tokeeContactListTemp = [];
      //@ts-ignore
      let contactListTemp = [];

      //@ts-ignore
      ResponseData.data.forEach((element) => {
        if (element.is_register == true) {
          tokeeContactListTemp.push(element);
        } else {
          contactListTemp.push(element);
        }
      });

      //@ts-ignore
      setProducts(tokeeContactListTemp);
      //@ts-ignore
      setOldProducts(tokeeContactListTemp);

      setContactLoaderModel(false);
      //@ts-ignore
      const tokeeContactListTempString = JSON.stringify(tokeeContactListTemp);
      //@ts-ignore
      const contactListTempString = JSON.stringify(contactListTemp);
      await AsyncStorage.setItem(
        "tokeeContactListTemp",
        tokeeContactListTempString
      );
      await AsyncStorage.setItem("contactListTemp", contactListTempString);
      setContactLoaderModel(false);
    }
  };

  // **********    Method for Navigation with Selected Data send to another screen   ********** ///
  const buttonPress2 = () => {
    if (selected.length > 0) {
      navigation.navigate("CreateGroupScreen", {
        selected_data: selected,
        groupType: groupType,
        groupTitle:
          route?.params?.groupTitle == undefined
            ? ""
            : route?.params?.groupTitle,
        groupDesc:
          route?.params?.groupDesc == undefined ? "" : route?.params?.groupDesc,
        navigationFunction: NavigateSelectedData,
      });
    } else {
      // Alert.alert(
      //   t("groupMemberRequired")
      // );
      globalThis.errorMessage = t("groupMemberRequired");
      setErrorAlertModel(true);
    }
  };

  // **********    Method for Select the Data from the list   ********** ///

  const crossBtnClicked = (phone_number: any) => {
    const index = selected.findIndex((f) => f.phone_number == phone_number);
    selected.splice(index, 1);
    if (selected.length > 0) {
      let temp = selected;
      //  temp = { ...temp, contact_name: temp.name };
      setSelected([]);
      setSelected(temp);
      let temp2 = products.map((product) => {
        //@ts-ignore
        if (phone_number === product.phone_number) {
          return { ...product, isChecked: !product.isChecked };
        }
        return product;
      });

      setProducts(temp2);
    } else {
      let temp2 = products.map((product) => {
        //@ts-ignore
        if (phone_number === product.phone_number) {
          return { ...product, isChecked: false };
        }
        return product;
      });
      setProducts(temp2);
    }
  };

  const handleChange = (phone_number: any) => {
    let temp = products.map((product) => {
      //@ts-ignore
      if (phone_number === product.phone_number) {
        return { ...product, isChecked: !product.isChecked };
      }
      return product;
    });

    setProducts(temp);

    let filter = temp.filter((x) => phone_number === x.phone_number);
    let filter_second = selected?.filter(
      (x) => phone_number === x.phone_number
    );
    var tempArray = [];
    var NewtempArray = [];
    if (filter_second.length > 0) {
      const index = selected.map((i) => i).indexOf(filter_second[0]);
      selected.splice(index, 1);
    } else {
      tempArray.push(filter[0]);
    }

    for (var i = 0; i < selected.length; i++) {
      let test = selected[i];
      NewtempArray.push({ ...test, contact_name: test.name });
    }

    for (var i = 0; i < tempArray.length; i++) {
      let test = tempArray[i];
      NewtempArray.push({ ...test, contact_name: test.name });
    }

    setSelected(NewtempArray);
  };

  // **********    Method for Selected List   ********** ///

  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginTop: 20,
    },
    newGroupText: {
      color: appBarText().textColor,
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

    cancelText: {
      color: appBarText().textColor,
      fontSize: FontSize.font,
      fontFamily: font.medium(),
    },
    noDataText: {
      color: colorTheme ? COLORS.primary_blue : COLORS.black,
      fontSize: 15,
      fontFamily: font.bold(),
    },
    chatTopContainer: {
      paddingBottom: 30,
      marginBottom: 10,
      zIndex: 1001,
    },
    newChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      borderColor: "#fff",
      borderRadius: 15,
    },
    ChatButton: {
      backgroundColor: "#fff",
      height: 60,
      width: 155,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 50,
      borderColor: "#fff",
      borderRadius: 15,
    },
    newChatIcon: {
      height: 10,
      width: 10,
      tintColor: iconTheme().iconColor,
    },
    chatContainer: {
      backgroundColor: "white",
      borderWidth: 15,
      borderColor: "transparent",
      borderTopEndRadius: 25,
      borderTopStartRadius: 25,
      marginTop: -30,
    },
    HomeNoDataImage: {
      marginTop: 10,
      height: 100,
      width: 200,
    },
    NoDataContainer: {
      marginTop: 100,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
    },

    nameText: {
      fontSize: 12,
      fontFamily: font.bold(),
      color: COLORS.black,
      marginBottom: 5,
    },
    profile1Container: {
      paddingVertical: Platform.OS == "ios" ? 10 : 5,
      flexDirection: "row",
      // height: 60,
      borderBottomWidth: 1,
      borderBottomColor: "#EAEAEA",

    },
    profile1Container2: {
      marginTop: 10,
      flexDirection: "row",
      height: 70,
    },

    nameContainer: {
      marginLeft: 20,
      justifyContent: "center",
      margin: 0,
      marginBottom: 10,
      width: "50%",
    },

    Container: {
      justifyContent: "center",
      width: "15%",
    },

    circleImageLayout: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    nameInviteContainer: {
      justifyContent: "center",
      margin: 0,
      width: "65%",
      flexDirection: "column",
    },
    editProfile: {
      marginLeft: 10,
      flexDirection: "row",
      width: "20%",
      justifyContent: "center",
      alignItems: "center",
    },
    name1conText: {
      marginBottom: 0,
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.semibold(),
      color: COLORS.black,
      paddingLeft: 10,
      height: DeviceInfo.isTablet() ? 30 : 24,
    },
    name2conText: {
      fontSize: DeviceInfo.isTablet() ? 18 : 14,
      fontFamily: font.regular(),
      color: COLORS.black,
      paddingLeft: 10,
      height: DeviceInfo.isTablet() ? 30 : 24,
    },
    searchIcon: {
      borderRadius: 20,
      borderWidth: 1,
      marginLeft: 10,
      height: 45,
      justifyContent: "center",
      alignItems: "center",
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
    searchText: {
      borderRadius: 20,
      alignItems: "flex-start",
      borderColor: "transparent",
      justifyContent: "center",
      width: "90%",
    },
  });

  //**********    Method for Searchable Data from list    ********** ///
  const searchableData = (text: string) => {
    setSearchValue(text);
    if (text !== "") {
      let filter = products.filter((x) =>
        //@ts-ignore
        x.contact_name.toLowerCase().includes(text.toLowerCase())
      );

      setProducts(filter);
    } else {
      getContactAllList();
    }
  };

  function clearInput() {
    setSearchValue("");
    searchableData("");
  }
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
        <ContactLoaderModel visible={conatctLoaderModel} />

        <ErrorAlertModel
        visible={errorAlertModel}
        onRequestClose={() => setErrorAlertModel(false)}
        errorText={globalThis.errorMessage}
        cancelButton={() => setErrorAlertModel(false)}
      />
        {/* // **********    View For Show the StatusBar    ********** /// */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

        {/* // **********    View For Show the TopBar    ********** /// */}
        <TopBar showTitle={true} title={t("new_group")}  checked={
            //@ts-ignore
            globalThis.selectTheme
          }/>

        {/* // **********    View For Show the Screen Container     ********** /// */}
        <View style={styles.chatTopContainer}>
          <View style={styles.groupContainer}>
            {/* // **********    View For Cancel Button     ********** /// */}
            <TouchableOpacity onPress={() => buttonPress()} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>

            {/* // **********    View For Next Button     ********** /// */}
            <TouchableOpacity
              onPress={() => buttonPress2()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t("next")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* // **********    TopBar   ********** /// */}
      
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
        {/* // **********    View For SearchBar     ********** /// */}
        <SearchBar
          search={searchableData}
          value={searchValue}
          clickCross={clearInput}
          placeHolder= {t("search")}  
        />

        <View style={{ marginBottom: 10 }}>
          {/* // **********    FlatList for Show the Selected Data     ********** /// */}

          <FlatList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            horizontal
            data={selected}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.profile1Container2]}
                //@ts-ignore
                onPress={() => handleChange(item.phone_number)}
              >
                <View style={{ paddingHorizontal: 10, width: 80 }} key={index}>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: 10,
                      zIndex: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      height: 20,
                      width: 20,
                      borderRadius: 50,
                      backgroundColor: searchBar().back_ground,
                    }}
                    onPress={() => crossBtnClicked(item.phone_number)}
                  >
                    <Image
                      source={require("../../../Assets/Icons/Cross.png")}
                      style={styles.newChatIcon}
                    />
                  </TouchableOpacity>
                  <Image
                   
                      //@ts-ignore
                      source={
                        item.thumbnail ? {uri : item.thumbnail}
                          : item.profile_image ?  { uri: item.profile_image }
                          : require("../../../Assets/Image/girl_profile.png")
                      }
                    
                    style={styles.circleImageLayout}
                    resizeMode="cover"
                  />

                  <Text numberOfLines={1} style={{fontFamily: font.regular(),}}>
                    {
                      //@ts-ignore
                      item.contact_name
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* // **********    View for FlatList      ********** /// */}
        <View style={{ marginBottom: 10, height: windowHeight }}>
          <ScrollView nestedScrollEnabled={true}>
            <FlatList
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              data={products}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.profile1Container,
                    { marginBottom: index == products.length - 1 ? 500 : 0 },
                  ]}
                  onPress={() => handleChange(item.phone_number)}
                >
                  <View style={styles.Container} key={index}>
                    <Image
                      source={
                        item.thumbnail ? {uri : item.thumbnail}
                          : item.profile_image ?  { uri: item.profile_image }
                          : require("../../../Assets/Image/girl_profile.png")
                      }
                      style={styles.circleImageLayout}
                      resizeMode="cover"
                    />
                  </View>

                  {/* // **********   View for Name and Cintect number Show    ********** /// */}
                  <View style={styles.nameInviteContainer}>
                    <Text style={styles.name1conText}>{item.name}</Text>
                    <Text style={styles.name2conText}>+{item.phone_number}</Text>
                  </View>

                  {/* // **********   View for RedioButton    ********** /// */}
                  <View style={styles.editProfile}>
                    <View
                      style={{
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor: item.isChecked ? "#19B043" : "grey",
                        padding: 2,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: item.isChecked ? "#19B043" : "white",
                          borderColor: item.isChecked ? "grey" : "red",
                          borderRadius: 25,
                          height: 20,
                          width: 20,
                        }}
                      ></View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        </View>
      </View>

      <LoaderModel visible={loading} />
    </MainComponent>
  );
}
