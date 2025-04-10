import React, { createRef, useCallback, useState } from "react";
import { Keyboard, View } from "react-native";
import { COLORS, chatTop, iconTheme } from "../../../Components/Colors/Colors";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { Text } from "react-native";
import { font } from "../../../Components/Fonts/Font";
import { useDispatch, useSelector } from "react-redux";
import { setnewroomID } from "../../../Redux/ChatHistory";
import { setProfileData } from "../../../Redux/MessageSlice";
import DeviceInfo from "react-native-device-info";
import { FontSize } from "../../../Components/DeviceSpecs/DeviceStyles";
import { TextInput } from "react-native";
import { t } from "i18next";

const ChatHeader = React.memo(({ props, navigation,chatheaderdata }:any) => {
    const dispatch = useDispatch();
    const newroomID = useSelector((state: any) => state.chatHistory.newroomID);
    const isnewblock = useSelector((state: any) => state.chatHistory.isnewblock);
    const roominfo = useSelector((state: any) => state.chatHistory.roominfo);
    const onlinestatus = useSelector((state: any) => state.chatHistory.onlinestatus);
    const newroomType = useSelector((state: any) => state.chatHistory.newroomType);
    const textInputRef = createRef(); //@ts-ignore
    const [searchTerm, setSearchTerm] = useState(false);
    const [ismultidelete, setismultidelete] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<any>([]);
    const [othermessagearray, setothermessagearray] = useState<any>([]);
    const [isStipopShowing, setIsStipopShowing] = useState(false);
    const [whotype, setWhotype] = useState("");
    const [searchTermtext, setSearchTermtext] = useState("");
    const [highlightedIndices, setHighlightedIndices] = useState([]);
    

    const inputtextchange = useCallback((e) => {
        return(
            setSearchTermtext(e)
        )
    },[searchTermtext,setSearchTermtext])

    const buttonPress = () => {
        if (newroomID) {
          if (!isnewblock) {
            // setstopgifsend(false);
            navigation.navigate("ContactPageScreen", {
              isMute: chatheaderdata.params.isMute,
              isHide: chatheaderdata.params.isHide,
              isLockchat: chatheaderdata.params.isLock,
              isBlock: chatheaderdata.params.isBlock,
              friendId: chatheaderdata.params.friendId,
              aliasName: chatheaderdata.params.aliasName,
              aliasImage: chatheaderdata.params.aliasImage,
              isLock: chatheaderdata.params.isLock,
              fromScreen: "ChattingScreen",
            });
          }
        } else {
          dispatch(setProfileData(roominfo));
          navigation.navigate("UserProfile", {
            roomname: roominfo.roomName,
            roomimage: roominfo.roomImage,
            friendId: chatheaderdata.params.friendId,
          });
        }
    };

    return(
        <View style={styles.chatTopContainer}>
            <View style={styles.groupContainer}>
            {!searchTerm ? (
                <View style={styles.profile1Container}>
                {ismultidelete ? (
                    <View
                    style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flex: 1,
                        paddingHorizontal: 10,
                    }}
                    >
                    <TouchableOpacity
                        style={{ width: "33.33%" }}
                        onPress={() => {
                        setismultidelete(!ismultidelete);
                        if (selectedMessageId && selectedMessageId.length > 0) {
                            setSelectedMessageId([]);
                            setothermessagearray([]);
                        }
                        }}
                    >
                        <Image
                        source={require("../../../Assets/Icons/Cross.png")}
                        style={{
                            height: 22,
                            width: 22,
                            tintColor: COLORS.black,
                        }}
                        />
                    </TouchableOpacity>
                    <Text
                        style={{
                        width: "33.33%",
                        fontSize: 17,
                        fontFamily: font.bold(),
                        color: iconTheme().iconColorNew,
                        }}
                    >
                        Delete
                    </Text>

                    <TouchableOpacity
                        onPress={() => {
                        if (selectedMessageId && selectedMessageId.length > 0) {
                            setSelectedMessageId([]);
                            setothermessagearray([]);
                        }
                        }}
                    >
                        <Text
                        style={{
                            color: COLORS.black,
                            fontSize: 16,
                        }}
                        >
                        Reselect
                        </Text>
                    </TouchableOpacity>
                    </View>
                ) : (
                    <>
                    <TouchableOpacity
                        style={styles.Container1}
                        onPress={() => {
                        // if (isStipopShowing) {
                        //     switch (Platform.OS) {
                        //     case "android":
                        //         textInputRef.current.focus();
                        //         StipopModule.show(
                        //         isKeyboardVisible,
                        //         isStipopShowing,
                        //         (resultBool) => {
                        //             setIsStipopShowing(resultBool);
                        //         }
                        //         );
                        //         break;

                        //     case "ios":
                        //         StipopModule.show(
                        //         isKeyboardVisible,
                        //         isStipopShowing,
                        //         (error, resultBool) => {
                        //             setIsStipopShowing(resultBool);
                        //         }
                        //         );
                        //         break;
                        //     }
                        // }
                        dispatch(setnewroomID(""));
                        navigation.navigate("ChatScreen");
                        }}
                    >
                        <Image
                        source={require("../../../Assets/Icons/Back_Arrow.png")}
                        style={styles.backIcon}
                        resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.Container}
                        onPress={() => buttonPress()}
                    >
                        <Image
                        source={{
                            uri: roominfo.aliasImage || roominfo.roomImage,
                        }}
                        style={styles.circleImageLayout}
                        resizeMode="cover"
                        />
                        {/* <View style={styles.plusImageContainer}>
                        <Image
                            source={require("../../../Assets/Icons/Chat_top.png")}
                            style={styles.plusImage1Layout}
                            resizeMode="contain"
                        />
                        </View> */}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.nameInviteContainer}
                        onPress={() => buttonPress()}
                    >
                        <Text style={styles.name1conText}>
                        {roominfo.aliasName
                            ? roominfo.aliasName
                            : roominfo.contactName
                            ? roominfo.contactName
                            : typeof roominfo.roomName == "number"
                            ? "+" + roominfo.roomName
                            : roominfo.roomName}
                        </Text>
                        {(onlinestatus || whotype) &&
                        isnewblock == false &&
                        newroomType == "single" && (
                            <Text style={styles.name2conText}>
                            {whotype
                                ? newroomType == "single"
                                ? "typing..."
                                : whotype
                                : onlinestatus}
                            </Text>
                        )}
                    </TouchableOpacity>
                    <View style={styles.editProfile}>
                        <TouchableOpacity
                        onPress={() => setSearchTerm(!searchTerm)}
                        >
                        <Image
                            source={require("../../../Assets/Icons/Search.png")}
                            style={{
                            ...styles.newChatIcon,
                            width: 20,
                            height: 20,
                            }}
                            resizeMode="contain"
                        />
                        </TouchableOpacity>

                        {/* <TouchableOpacity onPress={openDrawer}> */}
                        <Image
                            source={require("../../../Assets/Icons/menu.png")}
                            style={{
                            ...styles.newChatIcon,
                            width: 20,
                            height: 20,
                            marginRight: 0,
                            }}
                            resizeMode="contain"
                        />
                        {/* </TouchableOpacity> */}
                    </View>
                    </>
                )}
                </View>
            ) : (
                <View
                style={{ ...styles.profile1Container, flex: 1, width: "100%" }}
                >
                <View
                    style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    }}
                >
                    <View style={{ width: "100%" }}>
                    <View style={{ justifyContent: "center" }}>
                        <View
                        style={{
                            flexDirection: "row",
                            backgroundColor: "#fff",
                            alignItems: "center",
                        }}
                        >
                        <Image
                            source={require("../../../Assets/Icons/Search.png")}
                            style={{
                            tintColor: iconTheme().iconColorNew,
                            height: 20,
                            width: 20,
                            alignSelf: "center",
                            marginLeft: 10,
                            }}
                        />
                        <TextInput
                            multiline={false}
                            autoFocus={true}
                            style={{
                            flex: 1,
                            height: 40,
                            backgroundColor: "#fff",
                            borderColor: "gray",
                            borderWidth: 0,
                            padding: 10,
                            fontSize: 16,
                            color: "#292423",
                            fontFamily: font.regular(),
                            }}
                            placeholder={t("search_messages")}
                            value={searchTermtext}
                            onSubmitEditing={() => Keyboard.dismiss()}
                            onChangeText={inputtextchange}
                        />
                        <Text
                            style={{
                            marginHorizontal: 15,
                            fontFamily: font.regular(),
                            }}
                        >
                            {highlightedIndices.length}
                        </Text>
                        <TouchableOpacity
                            style={{
                            borderWidth: 1,
                            borderColor: iconTheme().iconColorNew,
                            padding: 3,
                            borderRadius: 50,
                            transform: [{ rotate: "90deg" }],
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                            }}
                            onPress={() => {
                            // scrollToNextHighlightedMessage();
                            }}
                        >
                            <Image
                            source={require("../../../Assets/Icons/Back.png")}
                            style={{
                                height: 20,
                                width: 20,
                                tintColor: iconTheme().iconColorNew,
                                resizeMode: "contain",
                            }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                            borderWidth: 1,
                            borderColor: iconTheme().iconColorNew,
                            padding: 3,
                            borderRadius: 50,
                            transform: [{ rotate: "-90deg" }],
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                            }}
                            onPress={() => {
                            // scrollToPreviousHighlightedMessage();
                            }}
                        >
                            <Image
                            source={require("../../../Assets/Icons/Back.png")}
                            style={{
                                height: 20,
                                width: 20,
                                tintColor: iconTheme().iconColorNew,
                                resizeMode: "contain",
                            }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                            }}
                            onPress={() => {
                            setSearchTerm(!searchTerm)
                                // setSearchTermtext(""),
                                // setHighlightedIndices([]),
                                // setCurrentHighlightedIndex(-1);
                            }}
                        >
                            <Image
                            source={require("../../../Assets/Icons/Cross.png")}
                            style={{
                                height: 20,
                                width: 20,
                                tintColor: iconTheme().iconColorNew,
                                resizeMode: "contain",
                            }}
                            />
                        </TouchableOpacity>
                        </View>
                    </View>
                    </View>
                </View>
                </View>
            )}
            </View>
      </View>
    )   
})
export default ChatHeader;

const styles = StyleSheet.create({
    chatTopContainer: {
        backgroundColor: chatTop().back_ground,
        paddingBottom: 60,
    },
    groupContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    profile1Container: {
        marginTop: 20,
        flexDirection: "row",
        height: 50,
        width: "100%",
    },
    Container1: {
        justifyContent: "center",
        width: "10%",
    },
    backIcon: {
        height: 22,
        width: 22,
        tintColor: COLORS.black,
    },
    Container: {
        justifyContent: "center",
        width: "10%",
    },
    circleImageLayout: {
        width: 45,
        height: 45,
        borderRadius: 23,
    },
    plusImageContainer: {
        position: "absolute",
        right: DeviceInfo.isTablet() == true ? 40 : 0,
        bottom: 48,
        borderRadius: 20,
        height: 20,
        width: 20,
    },
    plusImage1Layout: {
        width: 20,
        height: 20,
        tintColor: iconTheme().iconColorNew,
    },
    nameInviteContainer: {
        justifyContent: "center",
        marginLeft: 10,
        width: "42%",
        flexDirection: "column",
    },
    name1conText: {
        fontSize: FontSize.font,
        fontFamily: font.bold(),
        color: iconTheme().iconColorNew,
        paddingLeft: 10,
    },
    name2conText: {
        fontSize: DeviceInfo.isTablet() ? 16 : 10,
        fontFamily: font.medium(),
        color: COLORS.black,
        paddingLeft: 10,
    },
    editProfile: {
        //marginLeft: 10,
        marginRight: 10,
        flexDirection: "row",
        width: "30%",
        justifyContent: "flex-end",
        alignItems: "center",
        //backgroundColor:'red'
    },
    newChatIcon: {
        height: DeviceInfo.isTablet() ? 32 : 25,
        width: DeviceInfo.isTablet() ? 32 : 25,
        tintColor: iconTheme().iconColorNew,
        marginRight: 20,
    },
});
