import React, { useContext } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, searchBar } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";

import { t } from "i18next";
import DeviceInfo from "react-native-device-info";
import { StoryTimeConverter3 } from "../../Components/DateTimeFormat/TimeConverter";

// eslint-disable-next-line
export const StoryListModel = (props: any) => {
  const { colorTheme } = useContext(ThemeContext);

  const styles = StyleSheet.create({
    modal_view: {
      width: "100%",
      bottom: 0,
      left: 0,
      right: 0,
      position: "absolute",
      backgroundColor: "#fff",
      //  backgroundColor:"green",
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
    button: {
      height: 50,
      marginTop: 10,
      width: "100%",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
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
    Upload_buttonText: {
      fontSize: 15,
      fontFamily: font.regular(),
      marginTop: 5,
      color: colorTheme ? COLORS.primary_blue : COLORS.purple,
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
      marginTop: 10,
      flexDirection: "row",
      width: "100%",
      alignItems:"center"
    },
    Container: {
      width: "10%",
    },
    recentStory: {
      width: "100%",
      //  height: "100%",
      borderRadius: 30,
      backgroundColor: COLORS.lightgrey,
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
      color:COLORS.black
    },
    naContainer: {
      justifyContent: "center",
      width: "80%",
      flexDirection: "column",
    },
    timeContainer: {
      margin: 0,
      width: "80%",
      flexDirection: "row",
      fontSize: DeviceInfo.isTablet() ? 20 : 14,
      fontFamily: font.semibold(),
      paddingLeft: 10,
      
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

  // const duplicatedData = [...props.storyViewList, ...props.storyViewList];

  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      onRequestClose={props.onRequestClose}
    >
      <View
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}
        // onPress={props.cancel}
      >
        <View style={[styles.modal_view, { height: 400 }]}>
          <View
            style={{
              height: 40,
              flexDirection: "row",
              marginHorizontal: 16,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Image
              source={require("../../Assets/Icons/Eye.png")}
              style={{ marginRight: 2, marginTop: 1.5, height: 20, width: 20 }}
            />

            <Text
              style={{
                color: COLORS.black,
                fontSize: 14,
                fontFamily: font.bold(),
              }}
            >
              {
                //@ts-ignore
                props.storyViewList.length
              }
            </Text>
            <Image
              source={require("../../Assets/Image//like.png")}
              style={{
                marginRight: 2,
                marginTop: 1.5,
                height: 20,
                width: 20,
                tintColor: "red",
                marginLeft: 20,
              }}
              resizeMode="contain"
            />

            <Text
              style={{
                color: COLORS.black,
                fontSize: 14,
                fontFamily: font.semibold(),
                // lineHeight: 18,
                // height: 18,
              }}
            >
              {
                //@ts-ignore
                props.likedCount
              }
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.cancel_button]}
            onPress={props.cancel}
          >
            <Image
              source={require("../../Assets/Icons/Cross.png")}
              style={{
                height: 15,
                width: 15,
                tintColor: colorTheme ? COLORS.primary_blue : COLORS.purple,
                //
              }}
            />
          </TouchableOpacity>

          <View
            style={{
              height: 40,
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              justifyContent: "space-between",
              marginHorizontal: 16,
            }}
          >
            <Text
              style={{
                color: COLORS.black,
                fontSize: 15,
                fontFamily: font.bold(),
              }}
            >
              {t("viewedBy")}
            </Text>

            <Text
              style={{
                color: COLORS.black,
                fontSize: 15,
                fontFamily: font.bold(),
              }}
            >
              {t("Liked")}
            </Text>
          </View>
          <View style={{ marginTop: 10, marginHorizontal: 16, flex: 1 }}>
            <FlatList
              data={props.storyViewList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                return (
                  <View style={styles.recentStatusContainer}>
                    <View style={styles.Container} key={index}>
                      <TouchableOpacity style={styles.recentStory}>
                        {item.user.profile_image && ( // Conditional rendering based on userImage availability
                          <Image
                            source={{
                              uri: item.user.profile_image,
                            }}
                            style={styles.circleImageLayout}
                            resizeMode="cover"
                          />
                        )}
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.naContainer,
                        { width: item.is_like == 1 ? "80%" : "90%",paddingLeft:10 },
                      ]}
                    >
                      <Text style={styles.name1Text}>
                        {item.user.first_name}
                      </Text>
                      <View style={styles.timeContainer}>
                        <StoryTimeConverter3
                          formattedTime={item.view_date_time}
                        />
                      </View>
                    </TouchableOpacity>

                    {item.is_like == 1 ? (
                      <View style={{ width: "10%", alignItems: "center" }}>
                        <Image
                          source={require("../../Assets/Image/like.png")}
                          style={{
                            height: 30,
                            width: 30,
                          }}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              }}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{
                paddingBottom: Platform.OS === "ios" ? 100 : 200,
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
