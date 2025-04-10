import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';


import { StoreType } from '../../../types';
import { colors } from '../../../utils/constants/colors';
import { fonts } from '../../../utils/constants/fonts';
import { updateCallState } from '../../../reducers/VoipReducer';
import { AppText } from '../../../Components/Calling/AppText';
const BackgroundCall = () =>{
    const {top} = useSafeAreaInsets();
    const dispatch = useDispatch();
    const callState = useSelector((state: StoreType) => state?.VoipReducer?.call_state || {});
    return (
        callState.isBackground?
        <TouchableOpacity activeOpacity={0.7} style={[styles.call,{paddingTop:top||10}]} onPress={()=>dispatch(
        updateCallState({isBackground:false}))}>
            <AppText style={styles.ongoingCallText}>{"Ongoing Call"}</AppText>
            <AppText style={styles.timeText}>{"0:12"}</AppText>
        </TouchableOpacity>:null
    );
}
export default BackgroundCall;
const styles = StyleSheet.create({
    call:{
        width:'100%',
        backgroundColor:colors.rockt_orange,
        position:'absolute',
        top:0,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingHorizontal:16,
        paddingBottom:10,
    },
    ongoingCallText:{
        fontSize:16,
        lineHeight:24,
        color:colors.white,
        fontFamily:fonts.primary_bold_font,
    },
    timeText:{
        fontSize:14,
        lineHeight:20,
        color:colors.primary_background_color,
        fontFamily:fonts.primary_regular_font,
    },
});