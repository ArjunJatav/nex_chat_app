import React from "react";
import { Image, Platform, TouchableOpacity, StyleSheet, View } from "react-native";
import { Composer, InputToolbar, Send } from "react-native-gifted-chat";
import { COLORS, iconTheme } from "../../../Components/Colors/Colors";
import { font } from "../../../Components/Fonts/Font";

const RenderInputToolbar = React.memo(({ props }:any) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={styles.toolbar}
      renderComposer={() => (
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={props.onPressActionButton} style={styles.iconButton}>
            <Image
              source={require("../../../Assets/Icons/plus.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Composer
            {...props}
            placeholder={"Type here..."}
            textInputStyle={styles.textInput}
          />
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={require("../../../Assets/Icons/faceImg.png")}
              style={[styles.icon,{height: 28,
                width: 28}]}
              resizeMode="contain"
            />
          </TouchableOpacity>
            <Send containerStyle={{flexDirection:"row",alignItems:"center"}} {...props}>
                <Image
                    source={require("../../../Assets/Icons/Send_message.png")}
                    style={[styles.icon,{  height: 22,
                        width: 22,}]}
                    resizeMode="contain"
                />
            </Send> 
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#fff',
    paddingVertical:5
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    // borderRadius: 20,
    height: 50,
    // backgroundColor: 'yellow', // Optional background color
    paddingHorizontal: 10,
    paddingBottom:0,
    marginBottom:0
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    borderRadius: 50,
    color: COLORS.black,
    fontFamily: font.regular(),
    borderWidth: 1,
    borderColor: iconTheme().iconColorNew,
    paddingLeft: 15,
    minHeight: Platform.OS === "android" ? 40 : 34,
    maxHeight: Platform.OS === "android" ? 45 : 55,
    backgroundColor: "#F8F8F8",
    // lineHeight: 20,
    marginLeft:5
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:"row",
    marginHorizontal: 5, // Space between icons
    // backgroundColor:"red",
    // padding: 5,
  },
  icon: {
    height: 20,
    width: 20,
    tintColor: iconTheme().iconColorNew,
  },
});

export default RenderInputToolbar;
