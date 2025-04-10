import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Contacts from "react-native-contacts";
import {
  COLORS,
  searchBar,
  setWallpaper,
  textTheme,
} from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";

import DeviceInfo from "react-native-device-info";
import SearchBar from "../../Components/SearchBar/SearchBar";
import { t } from "i18next";
import ToShowContactName from "../calling/components/ContactShow";


 // eslint-disable-next-line
export const LocalContactModel = (props: any) => {
  const [contactsInTokee, setTokeeContacts] = useState([]);
  const [ContactAllList, getContactAllList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestContactsPermission();
    setLoading(true);
  }, []);

  const requestContactsPermission = async () => {
    try {
      setLoading(true);
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: "Contacts",
          message: "This app would like to view your contacts.",
          buttonPositive: "Please accept bare mortal",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const uniquePhoneNumbers = new Set();
        setLoading(true);
        Contacts.getAll()
          .then((contacts) => {
            const contactArr = [];
            contacts.forEach((item) => {
              item.phoneNumbers.forEach((contactPhone) => {
                const phoneNumber = contactPhone.number;
                // Check if the phone number is not in the Set, and if not, add it to the array and the Set
                if (!uniquePhoneNumbers.has(phoneNumber)) {
                  uniquePhoneNumbers.add(phoneNumber);
                  const trimNumber = phoneNumber.toString();
                  const result = trimNumber.replace(/[()\- *#]/g, "");
                  const contactDict = {
                    country_code: "",
                    phone_number: result,
                    contact_name: ToShowContactName(item),
                  };
                   // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                  contactArr.push(contactDict);
                }
              });
            });

            const sortedContacts = contactArr.sort((a, b) => {
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              const nameA = a.contact_name ? a.contact_name.toLowerCase() : '';
              // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
              const nameB = b.contact_name ? b.contact_name.toLowerCase() : '';
              if (nameA < nameB) return -1;
              if (nameA > nameB) return 1;
              return 0;
            });
            
            setTokeeContacts(sortedContacts); 
            getContactAllList(sortedContacts);
            setLoading(false);
          })

          .catch(() => {
            setLoading(false);
          });
      } else {
        setLoading(true);
        const uniquePhoneNumbers = new Set();
        Contacts.getAll().then((contacts) => {
          const contactArr = [];
          contacts.forEach((item) => {
            item.phoneNumbers.forEach((contactPhone) => {
              const phoneNumber = contactPhone.number;
              // Check if the phone number is not in the Set, and if not, add it to the array and the Set
              if (!uniquePhoneNumbers.has(phoneNumber)) {
                uniquePhoneNumbers.add(phoneNumber);
                const trimNumber = phoneNumber.toString();
                const result = trimNumber.replace(/[()\- *#]/g, "");

                const contactDict = {
                  country_code: "",
                  phone_number: result,
                  contact_name: ToShowContactName(item),

                };
 // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                contactArr.push(contactDict);
              }
            });
          });
            // Sort the contacts array alphabetically by contact_name
      const sortedContacts = contactArr.sort((a, b) => {
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        const nameA = a.contact_name ? a.contact_name.toLowerCase() : '';
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        const nameB = b.contact_name ? b.contact_name.toLowerCase() : '';
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
         
          setTokeeContacts(sortedContacts); 
          getContactAllList(sortedContacts);
          setLoading(false);
        });
      }
    } catch (error) {
      setLoading(false);
    }
  };

  //**********    Method for Searchable Data from list    ********** ///
  const searchableData = (text: string) => {
    setSearchValue(text);
    if (text !== "") {
       // eslint-disable-next-line
      let filter = ContactAllList.filter((x: any) =>
        x.contact_name.toLowerCase().includes(text.toLowerCase().trim())
      );
      setTokeeContacts(filter);
    } else {
      setTokeeContacts(ContactAllList);
    }
  };

  const clickCross = () => {
    setSearchValue("");
    setTokeeContacts(ContactAllList);
  };

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
      alignItems: "center",
      fontSize: 17,
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
      padding: 10,
      backgroundColor: searchBar().back_ground,
      right: 15,
      top: 15,
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
    },
    name1Text: {
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
      paddingLeft: 10,
    },
    numberText: {
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
      paddingLeft: 10,
      color: COLORS.grey,
    },
    naContainer: {
      justifyContent: "center",
      marginLeft: 10,
      width: "70%",
      flexDirection: "column",
    },
    timeContainer: {
      margin: 0,
      width: "65%",
      flexDirection: "row",
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
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
  

  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      onRequestClose={props.onRequestClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}
        onPress={props.cancel}
      >
        <View style={[styles.modal_view, { height: "75%" }]}>
          <View style={{ width: "80%", marginTop: 10, marginLeft: 5 }}>
            <SearchBar
              search={searchableData}
              value={searchValue}
              clickCross={clickCross}
              placeHolder= {t("search")}  
            />
          </View>

          <TouchableOpacity
            style={[styles.cancel_button]}
            onPress={props.cancel}
          >
            <Image
              source={require("../../Assets/Icons/Cross.png")}
              style={{
                height: 20,
                width: 20,
                tintColor: setWallpaper().iconColor,
                //
              }}
            />
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color={textTheme().textColor} />
          ) : (
            <>
              <View style={{ marginTop: "5%" }}>
                <FlatList
                  data={contactsInTokee}
                   // eslint-disable-next-line
                  renderItem={({ item, index }: any) => {

                    return (
                      <View style={styles.recentStatusContainer}>
                        <View style={styles.Container} key={index}>
                          <TouchableOpacity style={styles.recentStory}>
                            <Image
                              source={{
                                uri: "https://tokeecorp.com/backend/public/images/user-avatar.png",
                              }}
                              style={styles.circleImageLayout}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.naContainer}
                          onPress={() => {
                            props.sendContactData({
                              contactName: item.contact_name,
                              contactNumber: item.phone_number,
                            });
                          }}
                        >
                          <Text style={styles.name1Text}>
                            {
                              item.contact_name
                            }
                          </Text>
                          <View style={styles.timeContainer}>
                            <Text style={styles.numberText}>
                              {
                                item.phone_number
                              }
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                  ListFooterComponent={() => {
                    return <View style={{ height: 150 }}></View>;
                  }}
                />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
