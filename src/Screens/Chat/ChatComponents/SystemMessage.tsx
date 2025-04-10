import React from "react"
import { View } from "react-native"
import { chatTop, iconTheme } from "../../../Components/Colors/Colors"
import { Image } from "react-native"
import { Text } from "react-native"
import { font } from "../../../Components/Fonts/Font"
import { SystemMessage } from "react-native-gifted-chat"

const SystemMessages = React.memo(({props}:any) =>{
    const {currentMessage} = props;
    return (
        <View>
        {currentMessage.messageType == "systemmessage" ? (
          <View
            style={{
              backgroundColor: chatTop().back_ground,
              borderRadius: 13,
              flexDirection: "row",
              alignSelf: "center",
              marginHorizontal: 30,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                backgroundColor: iconTheme().iconColorNew,
                width: 32,
                borderRadius: 13,
                borderBottomRightRadius: 0,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                style={{ height: 25, width: 25 }}
                resizeMode="center"
                source={require("../../../Assets/Icons/msgicon.png")}
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                color: iconTheme().iconColorNew,
                fontFamily: font.semibold(),
                paddingHorizontal: 10,
                paddingVertical: 10,
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              {currentMessage.text}
            </Text>
          </View>
        ) : (
          <SystemMessage
            {...props}
            containerStyle={{
              marginBottom: 15,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: chatTop().back_ground,
              alignSelf: "center",
              borderRadius: 2,
              borderBottomRightRadius: 10,
              borderTopLeftRadius: 10,
              marginHorizontal: 10,
            }}
            textStyle={{
              color: iconTheme().iconColorNew,
              fontFamily: font.semibold(),
              paddingVertical: 10,
              paddingHorizontal: 10,
              borderRadius: 10,
            }}
          />
        )}
      </View>
    )
})

export default SystemMessages