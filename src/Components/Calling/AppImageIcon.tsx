import React from "react";
import { GestureResponderEvent, ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import { ImageStyle } from "react-native";
import { Image, Pressable } from "react-native";
import { globalStyles } from "../../utils/globalStyles";
import { emptyFunction } from "../../utils/globalFunctions";


export const AppImageIcon = ({
	onPress = emptyFunction,
	wrapperStyle = {},
	iconStyle = {},
	image,
	disabled = false
}: AppImageProps) => {
	return (
		image ? <Pressable onPress={onPress} style={({ pressed }) => [globalStyles.iconWrapper, wrapperStyle, { opacity: pressed ? 0.4 : 1 }]} disabled={disabled}>
			<Image source={image} style={[globalStyles.iconStyle, iconStyle]} resizeMode={"contain"} />
		</Pressable >
			: null
	);
};

/**
 *
 * @param props
 *
 * @param onPress : For Handling Button Press
 * @param image : Image Icon to be shown
 * @param wrapperStyle : For Wrapper Style of Image Surrounding
 * @param iconStyle : For Icon Style of Image
 */

export interface AppImageProps {
	onPress?: null | ((event: GestureResponderEvent) => void),
	wrapperStyle?: StyleProp<ViewStyle>,
	iconStyle?: StyleProp<ImageStyle>,
	image?: ImageSourcePropType,
	disabled?: boolean
}