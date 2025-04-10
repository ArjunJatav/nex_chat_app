import React from "react";
import { Text, TextProps } from "react-native";
import { colors } from "../../utils/constants/colors";


export const AppText =
    ({ style, ...props }: Readonly<TextProps>) => {
        return (<Text style={[{ color: colors.title_color }, style]} {...props} allowFontScaling={false} >{props.children}</Text>);
    }
