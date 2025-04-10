import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VoipReducer } from "./types";

// Define the initial state
const initialState: VoipReducer = {
    call_state: {
         // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
        state: '',
        isBackground: false,
    },
    call_data: {
        session: '',
        token: '',
        isVideo: false,
        image: '',
        caller: '',
        guestVideoUid: 0,
        isCallInitalized: false,
        isCallDisconnected: false,
    },
    agora_data: {
        uid: "",
        app_id: "",
        channel_name: "",
        is_video: false,
        jwt: "",
        token: "",
        sender: "",
        receiver: "",
        userStatus: "",
        receiver_image: "",
        receiver_name: "",
        sender_image: "",
        sender_name: "",
    },
};

// Create a slice using createSlice
const voipSlice = createSlice({
    name: "voip", // Slice name
    initialState,
    reducers: {
        // Reducer for updating call data
        // eslint-disable-next-line
        updateCallData: (state, action: PayloadAction<{ [key: string]: any }>) => {
            state.call_data = {
                ...state.call_data,
                ...action.payload,
            };
        },
        
        // Reducer for updating call state
        // eslint-disable-next-line
        updateCallState: (state, action: PayloadAction<{ [key: string]: any }>) => {
            state.call_state = {
                ...state.call_state,
                ...action.payload,
            };
        },
        
        // Reducer for updating agora data
        // eslint-disable-next-line
        updateAgoraData: (state, action: PayloadAction<{ [key: string]: any }>) => {
            state.agora_data = {
                ...state.agora_data,
                ...action.payload,
            };
        },

        // Reducer for resetting the state
        resetVoipReducer: () => initialState,
    },
});

// Export actions and reducer
export const {
    updateCallData,
    updateCallState,
    updateAgoraData,
    resetVoipReducer,
} = voipSlice.actions;

export default voipSlice.reducer;
