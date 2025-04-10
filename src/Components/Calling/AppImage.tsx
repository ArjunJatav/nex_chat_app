import React from "react";
import { GestureResponderEvent, ImageProps, StyleProp, View, ViewStyle,Image, ImageStyle } from "react-native";
import { emptyFunction, getImageSource } from "../../utils/globalFunctions";


export const AppImage = ({
	onPress = emptyFunction,
	wrapperStyle = {},
	imageStyle = {},
	image,
	disabled = false,
	...props
}: AppImageProps) => {
	return (
		image ?
			<View style={[{ aspectRatio: 16/9, width: "100%", }, wrapperStyle]}>
				<Image style={[{ width: "100%", height: "100%", }, imageStyle]} resizeMode={"cover"} {...props} source={getImageSource(image)} />
			</View>
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

export interface AppImageProps extends ImageProps {
	onPress?: null | ((event: GestureResponderEvent) => void),
	wrapperStyle?: StyleProp<ViewStyle>,
	imageStyle?: StyleProp<ImageStyle>,
	image?: string,
	disabled?: boolean,
}