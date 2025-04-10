import { t } from "i18next";
import React, {  useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity
} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  COLORS,
  iconTheme,
  searchBar,
  textTheme,
  themeModule,
} from "../../Components/Colors/Colors";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import { FontSize } from "../../Components/DeviceSpecs/DeviceStyles";
import { font } from "../../Components/Fonts/Font";
import MainComponent from "../../Components/MainComponent/MainComponent";
import TopBar from "../../Components/TopBar/TopBar";
import { settingTop } from "../../Navigation/Icons";
import axios from "axios";
import { Base_Url, acceptfriendrequest, friendrequestlist, rejectfriendrequest } from "../../Constant/Api";
import { Image } from "react-native";
import { Text } from "react-native";
import { LoaderModel } from "../Modals/LoaderModel";
import { colors } from "../../utils/constants/colors";
import PagerView from "react-native-pager-view";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { setmyrequestdata, setotherrequestdata } from "../../Redux/ChatHistory";

const isDarkMode = true;

const PendingRequest = ({ navigation }: any) => {
    const windowWidth = Dimensions.get("window").width;
    const windowHeight = Dimensions.get("window").height;
    const dispatch =  useDispatch();
    const myrequestdata =  useSelector(
        (state: any) => state.chatHistory.myrequestdata
    )
    const otherrequestdata = useSelector(
        (state: any) => state.chatHistory.otherrequestdata
    )
    const [loaderModel, setloaderMoedl] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const pagerAllMediaRef = useRef(null);

    // console.log("filteredData",filteredData)

    const getPendinglist = async()=> {
        setloaderMoedl(true)
        const url = Base_Url + friendrequestlist;
        try {
          axios({
            method: "get",
            url: url,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              //@ts-ignore
              Authorization: "Bearer " + globalThis.token,
            },
          })
            .then((response) => {
              setloaderMoedl(false)
              console.log("response",response)
              if (response.data.status == true) {
                dispatch(setmyrequestdata(response?.data?.data?.my_requests));
                dispatch(setotherrequestdata(response?.data?.data?.otner_request_me));
              }
            })
            .catch((error) => {
                setloaderMoedl(false)
            });
        } catch (error) {
            setloaderMoedl(false)
        }
    }

    const RjectRequest = async(id,type)=> {
        setloaderMoedl(true)
        const url = Base_Url + rejectfriendrequest;
        try {
          axios({
            method: "post",
            url: url,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              //@ts-ignore
              Authorization: "Bearer " + globalThis.token,
            },
            data: {
                friend_request_id: id,
                status: type,
            },
          })
            .then((response) => {
              console.log("response",response)
              if (response.data.status == true) {
                getPendinglist()
              }
              else{
                // setloaderMoedl(false)
                getPendinglist()
              }
            })
            .catch((error) => {
                setloaderMoedl(false)
                console.log("error",error)
            });
        } catch (error) {
            setloaderMoedl(false)
            console.log("error",error)
        }
    }

    const acceptRequest = async(id,type)=> {
        setloaderMoedl(true)
        const url = Base_Url + acceptfriendrequest;
        try {
          axios({
            method: "post",
            url: url,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              //@ts-ignore
              Authorization: "Bearer " + globalThis.token,
            },
            data: {
                friend_request_id: id,
                status: type,
            },
          })
            .then((response) => {
              console.log("response",response)
              if (response.data.status == true) {
                getPendinglist()
              }
              else{
                // setloaderMoedl(false)
                getPendinglist()
              }
            })
            .catch((error) => {
                setloaderMoedl(false)
                console.log("error",error)
            });
        } catch (error) {
            setloaderMoedl(false)
            console.log("error",error)
        }
    }

    useEffect(()=> {
       getPendinglist()
    },[])

    const styles = StyleSheet.create({
    groupContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 10,
        marginTop: DeviceInfo.isTablet() ? 40 : 20,
    },
    nameInviteContainer: {
        justifyContent: "center",
        margin: 0,
        // width: "85%",
        flexDirection: "column",
      },
      name1conText: {
        marginBottom: 0,
        fontSize: DeviceInfo.isTablet() ? 18 : 14,
        fontFamily: font.semibold(),
        color: COLORS.black,
        paddingLeft: 10,
      },
      name2conText: {
        marginTop: 2,
        fontSize: DeviceInfo.isTablet() ? 18 : 14,
        fontFamily: font.regular(),
        color: COLORS.black,
        paddingLeft: 10,
      },

    chatTopContainer: {
        backgroundColor: themeModule().theme_background,
        paddingBottom: 20,
    },

    chatContainer: {
        backgroundColor: "white",
        borderWidth: 10,
        borderColor: "transparent",
        borderTopEndRadius: 25,
        borderTopStartRadius: 25,
        marginTop: -30,
        height: windowHeight,
    },

    modalText: {
        color: COLORS.black,
        fontSize: 20,
        alignSelf: "center",
        fontFamily: font.semibold(),
    },
    textInput: {
        backgroundColor: searchBar().back_ground,
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 10,
        fontSize: FontSize.font,
        paddingLeft: 10,
        opacity: 0.8,
        marginTop: 20,
        color: COLORS.black,
        height: 48,
        fontFamily: font.semibold(),
    },
    feedbackTextInput: {
        height: 150,
        backgroundColor: searchBar().back_ground,
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 10,
        paddingLeft: 10,
        opacity: 0.8,
        marginTop: 20,
        color: "#fff",
    },
    submiBtn: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#3aff13",
        width: "45%",
        justifyContent: "center",
        alignItems: "center",
    },
    button: {
        height: 50,
        marginTop: 50,
        borderRadius: 10,
        marginHorizontal: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: iconTheme().iconColor,
    },
    buttonText: {
        fontSize: FontSize.font,
        color: COLORS.white,
        fontFamily: font.bold(),
    },
    profile1Container:{
        // marginTop: 10,
        paddingVertical: Platform.OS == "ios" ? 10 : 5,
        flexDirection: "row",
        // height: 60,
        borderBottomWidth: 1,
        borderBottomColor: "#EAEAEA",
    },
    tabButtons: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        // top: 100,
        width: "100%",
        paddingHorizontal: 10,
        marginBottom:20,
        zIndex: 999,
      },
      tabButton: {
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        width: "32%",
        borderBottomWidth: 2,
        borderBottomColor: colors.white,
      },
      activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: iconTheme().iconColorNew,
      },
      NoDataContainer: {
        height: windowHeight - 250,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      noCalls: {
        color: COLORS.black,
        fontSize: 18,
        fontFamily: font.bold(),
      },
      noDataText: {
        color: COLORS.grey,
        fontSize: 15,
        fontFamily: font.regular(),
      }
    });


    const handleTabPress = (tabIndex:any) => {
        setActiveTab(tabIndex); 
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        pagerAllMediaRef?.current?.setPage(tabIndex); 
      };

      const onPageSelected = (event:any) => {
        setActiveTab(event.nativeEvent.position);
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        pagerAllMediaRef?.current?.setPage(event.nativeEvent.position); 
      };


      
    return(
        <MainComponent
        statusBar="#000"
        statusBarColr="#000"
        safeAreaColr={themeModule().theme_background}
      >
        {/* // **********  Status Bar    ********** // */}
        <View
          style={{
            position: "relative",
            backgroundColor: themeModule().theme_background,
          }}
        >
         <LoaderModel visible={loaderModel} />
          {Platform.OS == "android" ? (
            <CustomStatusBar
              barStyle={isDarkMode ? "dark-content" : "dark-content"}
              backgroundColor={themeModule().theme_background}
            />
          ) : null}
          <TopBar
            showTitleForBack={true}
            title={t("Pending Requests")}
            backArrow={true}
            checked={
              globalThis.selectTheme
            }
            navState={navigation}
          />
  
          {
            globalThis.selectTheme === "christmas" || 
            globalThis.selectTheme === "newYear" || 
            globalThis.selectTheme === "newYearTheme" || 
            globalThis.selectTheme === "mongoliaTheme" || 
            globalThis.selectTheme === "mexicoTheme" || 
            globalThis.selectTheme === "usindepTheme" ? (
              <ImageBackground
                source={settingTop().BackGroundImage}
                resizeMode="cover"
                style={{
                  height: "100%",
                  width: windowWidth,
                  marginTop: 0,
                  position: "absolute",
                  bottom: 0,
                  zIndex: 0,
                }}
              ></ImageBackground>
            ) : null
          }
          <View style={styles.chatTopContainer}></View>
  
          <View style={styles.groupContainer}></View>
        </View>



  
        <View style={styles.chatContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}
            behavior={Platform.OS == "android" ? "height" : "padding"}
            enabled
          >

            <View style={styles.tabButtons}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab == 0 && styles.activeTab]}
                onPress={() => handleTabPress(0)}
              >
                <Text
                  style={{
                    color: colors.black,
                    fontSize: activeTab === 0 ? 15 : 13,
                  }}
                >
                Received
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab == 1 && styles.activeTab]}
                onPress={() => handleTabPress(1)}
              >
                <Text
                  style={{
                    color: colors.black,
                    fontSize: activeTab === 1 ? 15 : 13,
                  }}
                >
                  Sent
                </Text>
              </TouchableOpacity>
            </View>
            <PagerView
              style={{ flex: 1 }}
              initialPage={activeTab}
              onPageSelected={onPageSelected}
              ref={pagerAllMediaRef}
              useNext={false}
            >
            <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                data={otherrequestdata}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                renderItem={({ item, index }: any) => (
                    <View
                    style={styles.profile1Container}
                >
                    <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        width: "15%",
                    }}
                    >
                    <View 
                    style={{
                        width: DeviceInfo.isTablet() ? 60 : 50,
                        height: DeviceInfo.isTablet() ? 60 : 50,
                        borderRadius: DeviceInfo.isTablet() ? 30 : 25,
                        borderColor: textTheme().textColor,
                        borderWidth: 0.8,
                        justifyContent: 'center', // Center image in the container
                        alignItems: 'center',
                        overflow: 'hidden',
                        // padding: 10,
                    }}
                    >
                        <Image
                        source={{uri:item.to_user.profile_image}}
                            style={{
                            width: '100%',
                            height: '100%',
                            }}
                        resizeMode="cover"
                        />
                    </View>
                    </View>
                    <View style={{}}>
                        <View style={styles.nameInviteContainer}>
                        <Text style={styles.name1conText}>{item.to_user?.first_name}</Text>
                        {/* <Text style={[styles.name2conText]} numberOfLines={1}>
                            {"Incomming Friend Request"}
                        </Text> */}
                        </View>
                    </View> 

                    <View style={{marginLeft:"auto",flexDirection:"row",}}>
                        <TouchableOpacity 
                        onPress={()=> {
                            acceptRequest(item.id,"Accept")
                        }}
                        style={{
                            width: DeviceInfo.isTablet() ? 60 : 35,
                            height: DeviceInfo.isTablet() ? 60 : 35,
                            borderRadius: 50,
                            borderColor: textTheme().textColor,
                            borderWidth: 0.8,
                            padding: 6,
                        }}>
                        <Image
                        source={require("../../Assets/Icons/correct_sign.png")}
                            style={{
                            width: '100%',
                            height: '100%',
                            tintColor: iconTheme().iconColor
                            }}
                        resizeMode="cover"
                        />

                        </TouchableOpacity>
                        <TouchableOpacity 
                        onPress={()=> {
                            acceptRequest(item.id,"Reject")
                        }}
                        style={{
                            marginLeft:10,
                            width: DeviceInfo.isTablet() ? 60 : 35,
                            height: DeviceInfo.isTablet() ? 60 : 35,
                            borderRadius: 50,
                            borderColor: textTheme().textColor,
                            borderWidth: 0.8,
                            padding: 10,
                        }}>
                        <Image
                        source={require("../../Assets/Icons/Cross.png")}
                            style={{
                            width: '100%',
                            height: '100%',
                            tintColor: iconTheme().iconColor
                            }}
                        resizeMode="cover"
                        />

                        </TouchableOpacity>
                    </View>       
                    
                </View>
                )}
                ListEmptyComponent={()=>
                    <View style={styles.NoDataContainer}>
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <Text style={styles.noCalls}>No Pending Request</Text>
                      {/* <Text style={styles.noDataText}>
                        {t("allVideoAndAudioCallDisplay")}
                      </Text> */}
                    </View>
                  </View>
                }
                
            />
            <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                data={myrequestdata}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                renderItem={({ item, index }: any) => (
                    <View
                    style={styles.profile1Container}
                >
                    <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        width: "15%",
                    }}
                    >
                    <View 
                    style={{
                        width: DeviceInfo.isTablet() ? 60 : 50,
                        height: DeviceInfo.isTablet() ? 60 : 50,
                        borderRadius: DeviceInfo.isTablet() ? 30 : 25,
                        borderColor: textTheme().textColor,
                        borderWidth: 0.8,
                        justifyContent: 'center', // Center image in the container
                        alignItems: 'center',
                        overflow: 'hidden',
                        // padding: 10,
                    }}
                    >
                        <Image
                        source={{uri:item.to_user.profile_image}}
                            style={{
                            width: '100%',
                            height: '100%',
                            }}
                        resizeMode="cover"
                        />
                    </View>
                    </View>
                    <View style={{}}>
                        <View style={styles.nameInviteContainer}>
                        <Text style={styles.name1conText}>{item.to_user?.first_name}</Text>
                        <Text style={[styles.name2conText]} numberOfLines={1}>
                            {moment(item.created_at).format(
                                "DD MMMM, h:mm A"
                            )}
                        </Text>
                        </View>
                    </View> 

                    <View style={{marginLeft:"auto",flexDirection:"row",}}>
                        <TouchableOpacity 
                        onPress={()=> {
                            RjectRequest(item.id,"Reject")
                        }}
                        style={{
                            marginLeft:10,
                            width: DeviceInfo.isTablet() ? 60 : 35,
                            height: DeviceInfo.isTablet() ? 60 : 35,
                            borderRadius: 50,
                            borderColor: textTheme().textColor,
                            borderWidth: 0.8,
                            padding: 10,
                        }}>
                        <Image
                        source={require("../../Assets/Icons/Cross.png")}
                            style={{
                            width: '100%',
                            height: '100%',
                            tintColor: iconTheme().iconColor
                            }}
                        resizeMode="cover"
                        />

                        </TouchableOpacity>
                    </View>       
                    
                </View>
                )}
                ListEmptyComponent={()=>
                    <View style={styles.NoDataContainer}>
                    <View
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <Text style={styles.noCalls}>No Pending Request</Text>
                      {/* <Text style={styles.noDataText}>
                        {t("allVideoAndAudioCallDisplay")}
                      </Text> */}
                    </View>
                  </View>
                }
            />
            
            </PagerView>
          </KeyboardAvoidingView>
        </View>
      </MainComponent>
    )
}
export default PendingRequest;