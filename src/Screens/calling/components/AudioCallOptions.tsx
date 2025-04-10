import React from 'react';
import { StyleSheet, View } from 'react-native';

import { images } from '../../../utils/constants/assets';
import { colors } from '../../../utils/constants/colors';
import { AppImageIcon } from '../../../Components/Calling/AppImageIcon';
// eslint-disable-next-line
const AudioCallOptions = (props: any) => {
    return (
        <View style={[{ flexDirection: 'row', marginHorizontal: 43, justifyContent: 'space-between' }, props?.containerStyle]}>
            <AppImageIcon
                onPress={props.toggleMuteAudio}
                wrapperStyle={styles.wrapper}
                image={props?.isMuted ? images.mic_off : images.mic_on}
            />
            <AppImageIcon
                onPress={props?.pressChat}
                wrapperStyle={styles.wrapper}
                image={images.add_video}
                iconStyle={{ tintColor: 'white' }}
            />
            <AppImageIcon
                onPress={props.toggleSpeaker}
                wrapperStyle={styles.wrapper}
                image={props?.isSpeakerOn ? images.speaker_on : images.speaker_off}
            />
        </View>
    )
}
export default AudioCallOptions;
const styles = StyleSheet.create({
    wrapper: {
        height: 72,
        width: 72,
        borderRadius: 36,
        borderWidth: 1,
        borderColor: colors.white,
    }
})