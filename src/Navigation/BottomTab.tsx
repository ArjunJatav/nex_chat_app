import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import FlashMessage from "react-native-flash-message";
import { useSelector } from "react-redux";
import { iconTheme } from "../Components/Colors/Colors";
import { FontSize, IconSize } from "../Components/DeviceSpecs/DeviceStyles";
import { font } from "../Components/Fonts/Font";
import ThemeContext from "../Components/ThemeContext/ThemeContext";
import CallScreen from "../Screens/Calls/CallScreen";
import ChatScreen from "../Screens/Chat/ChatScreen";
import SettingScreen from "../Screens/Settings/SettingScreen";
import ShopScreen from "../Screens/Settings/ShopScreen";
import { bottomIcon, bottomTab, bottomText } from "./Icons";
const Tab = createBottomTabNavigator();

const BottomTab: React.FC = (navigation: any) => {
  const windowWidth = Dimensions.get("window").width;
  const { root } = useSelector((state: any) => state.root);
  const { t, i18n } = useTranslation();
  const totalcount = useSelector(
    // eslint-disable-next-line
    (state: any) => state.chatListsql.totalcount
  );
  console.log("globalThis.selectTheme", globalThis.selectTheme);
  return (
    <View
      style={{ flex: 1, justifyContent: "center", backgroundColor: "white" }}
    >
      <Tab.Navigator
        screenOptions={() => ({
          tabBarStyle: {
            marginTop: 10,
            marginBottom:
              DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
                ? 25
                : 10,
            marginHorizontal: 10,
            padding: 10,
            height:
              DeviceInfo.hasNotch() == true || DeviceInfo.isTablet() == true
                ? 80
                : 60,
            paddingBottom: 0,
            borderRadius: 10,
            backgroundColor: "#fff",
            shadowColor: "#000",
            shadowOffset: { width: -2, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            borderTopColor: "#deddd9",
            elevation: 10,
            display: root == "hide header" ? "none" : "flex",
          },
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tab.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            headerShown: false,
            tabBarLabel: () => {
              return null;
            },
            tabBarIcon: ({ focused }) => {
              return focused ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 35,
                    padding: 0,
                    width: windowWidth / 5,
                    position: "relative",
                  }}
                >
                  {totalcount > 0 && (
                    <View
                      style={{
                        right: 5,
                        top: 0,
                        position: "absolute",
                        borderRadius: 20,
                        width: 20,
                        height: 20,
                        backgroundColor: iconTheme().iconColor,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        {totalcount > 9 ? "9+" : totalcount}
                      </Text>
                    </View>
                  )}

                  <Image
                    style={{
                      height: IconSize.bottomTabIcon,
                      width: IconSize.bottomTabIcon,
                      tintColor: bottomIcon().tintColor,
                    }}
                    resizeMode="contain"
                    source={bottomTab().ChatIcon}
                  />
                  <Text
                    style={{
                      color: bottomText().textColor,
                      marginTop: 2,
                      fontFamily: font.semibold(),
                      fontSize: FontSize.bottomTabFont,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t("home")}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 35,
                    padding: 0,
                    width: windowWidth / 5,
                  }}
                >
                  {totalcount > 0 && (
                    <View
                      style={{
                        right: 5,
                        top: 0,
                        position: "absolute",
                        borderRadius: 20,
                        width: 20,
                        height: 20,
                        backgroundColor: iconTheme().iconColor,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        {totalcount > 9 ? "9+" : totalcount}
                      </Text>
                    </View>
                  )}
                  <Image
                    style={{
                      height: IconSize.bottomTabIcon,
                      width: IconSize.bottomTabIcon,
                    }}
                    resizeMode="contain"
                    source={bottomTab().ChatIcon}
                  />
                  <Text
                    style={{
                      color: "#000",
                      marginTop: 2,
                      fontFamily: font.semibold(),
                      fontSize: FontSize.bottomTabFont,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t("home")}
                  </Text>
                </View>
              );
            },
          }}
        />
        <Tab.Screen
          name="CallScreen"
          component={CallScreen}
          options={{
            headerShown: false,
            tabBarLabel: () => {
              return null;
            },
            tabBarIcon: ({ focused }) => {
              return focused ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 35,
                    padding: 0,
                    width: windowWidth / 4,
                  }}
                >
                  <Image
                    style={{
                      height: IconSize.bottomTabIcon,
                      width: IconSize.bottomTabIcon,
                      tintColor: bottomIcon().tintColor,
                    }}
                    resizeMode="contain"
                    source={bottomTab().CallIcon}
                  />
                  <Text
                    style={{
                      color: bottomText().textColor,
                      marginTop: 2,
                      fontFamily: font.semibold(),
                      fontSize: FontSize.bottomTabFont,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t("calls")}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 35,
                    padding: 0,
                    width: windowWidth / 4,
                  }}
                >
                  <Image
                    style={{
                      height: IconSize.bottomTabIcon,
                      width: IconSize.bottomTabIcon,
                    }}
                    resizeMode="contain"
                    source={bottomTab().CallIcon}
                  />
                  <Text
                    style={{
                      color: "#000",
                      marginTop: 2,
                      fontFamily: font.semibold(),
                      fontSize: FontSize.bottomTabFont,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t("calls")}
                  </Text>
                </View>
              );
            },
          }}
        />
        <Tab.Screen
          name="ShopScreen"
          component={ShopScreen}
          options={{
            headerShown: false,
            tabBarLabel: () => {
              return null;
            },
            tabBarIcon: ({ focused }) => {
              return focused ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 35,
                    padding: 0,
                    width: windowWidth / 4,
                  }}
                >
                  <Image
                    style={{
                      height: IconSize.bottomTabIcon,
                      width: IconSize.bottomTabIcon,
                      tintColor: bottomIcon().tintColor,
                    }}
                    resizeMode="contain"
                    source={bottomTab().StatusIcon}
                  />
                  <Text
                    style={{
                      color: bottomText().textColor,
                      marginTop: 2,
                      fontFamily: font.semibold(),
                      fontSize: FontSize.bottomTabFont,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t("explore")}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 35,
                    padding: 0,
                    width: windowWidth / 4,
                  }}
                >
                  <Image
                    style={{
                      height: IconSize.bottomTabIcon,
                      width: IconSize.bottomTabIcon,
                    }}
                    resizeMode="contain"
                    source={bottomTab().StatusIcon}
                  />
                  <Text
                    style={{
                      color: "#000",
                      marginTop: 2,
                      fontFamily: font.semibold(),
                      fontSize: FontSize.bottomTabFont,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t("explore")}
                  </Text>
                </View>
              );
            },
          }}
        />
        <Tab.Screen
          name="SetingsScreen"
          component={SettingScreen}
          options={{
            headerShown: false,
            tabBarLabel: () => {
              return null;
            },
            tabBarIcon: ({ focused }) => {
              return focused ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 35,
                    padding: 0,
                    width: windowWidth / 5,
                  }}
                >
                  <Image
                    style={{
                      height: IconSize.bottomTabIcon,
                      width: IconSize.bottomTabIcon,
                      tintColor: bottomIcon().tintColor,
                    }}
                    resizeMode="contain"
                    source={bottomTab().SettingIcon}
                  />
                  <Text
                    style={{
                      color: bottomText().textColor,
                      marginTop: 2,
                      fontFamily: font.semibold(),
                      fontSize: FontSize.bottomTabFont,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t("settings")}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    borderRadius: 35,
                    padding: 0,
                    width: windowWidth / 5,
                  }}
                >
                  <Image
                    style={{
                      height: IconSize.bottomTabIcon,
                      width: IconSize.bottomTabIcon,
                    }}
                    resizeMode="contain"
                    source={bottomTab().SettingIcon}
                  />
                  <Text
                    style={{
                      color: "#000",
                      marginTop: 2,
                      fontFamily: font.semibold(),
                      fontSize: FontSize.bottomTabFont,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t("settings")}
                  </Text>
                </View>
              );
            },
          }}
        />
      </Tab.Navigator>
      <FlashMessage
        style={{
          backgroundColor: iconTheme().iconColor,
          marginTop: DeviceInfo.hasNotch() == true ? 10 : 20,
        }}
        titleStyle={{ color: "#fff" }}
        textStyle={{ color: "#fff" }}
        position="top"
      />
    </View>
  );
};

export default BottomTab;

const styles = StyleSheet.create({});
