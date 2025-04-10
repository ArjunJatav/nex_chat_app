import React from 'react';
import { Bubble, Time } from 'react-native-gifted-chat';
import { chat, chatOther } from '../../../Components/Colors/Colors';
import { font } from '../../../Components/Fonts/Font';



export const CustomMessageBubble = React.memo((props) => {
    const { currentMessage } = props;
    const bubbleStyle = {
        backgroundColor: currentMessage.user._id === globalThis.chatUserId ? chat().back_ground_color : chatOther().back_ground_color, // Your colors here
        borderRadius: 10,
        padding: 0,
    };

    return (
        <Bubble 
        {...props}
        wrapperStyle={{
            left: bubbleStyle,
            right: bubbleStyle,
        }}
        textStyle={{
            right: {
              //@ts-ignore chatTextColor
              fontSize: globalThis.chatFontsize,
              color: "black",
              fontFamily: font.semibold(), // Change this to set the text color for sent messages
            },
            left: {
              //@ts-ignore
              fontSize: globalThis.chatFontsize,
              color: "black",
              fontFamily: font.semibold(), // Change this to set the text color for received messages
            },
        }}
        renderTime={(timeProps) => (
            <Time
                {...timeProps}
                timeTextStyle={{
                    right: {
                      color: chatOther().chatTextColor,
                      opacity: 0.6,
                      fontFamily: font.semibold(),
                    }, // Change this to set the text color for sent messages' time
                    left: { color: "black", opacity: 0.6, fontFamily: font.semibold() }, // Change this to set the text color for received messages' time
                }}
            />
        )}
        />
    );
});