import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAppStateReducers } from "./types";
import { appConstants } from "../utils/constants/appConstants";

const initialState: getAppStateReducers = {
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    app_state: {
        isAppActive: false,
        updatemediauseeeffect:"",
        updateMediaFunction:0,
        
    },
    membersupdated:false,
    [appConstants.media_loader]: {}  
};

const appStateSlice = createSlice({
    name: "appState", // Slice name
    initialState,
    reducers: {
        // Reducer for updating call state
        // eslint-disable-next-line
        updateAppState: (state, action: PayloadAction<{ [key: string]: any }>) => {
            state.app_state = {
                // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                ...state.app_state,
                ...action.payload,
            };
        },

        updateMediaLoader: (state, action: PayloadAction<{ [key: string]: { isMediaLoader: boolean } }>) => {
            const { messageId, isMediaLoader } = action.payload;
            state[appConstants.media_loader][messageId] = { isMediaLoader,messageId };
        },

        updatedmembersall(state) {
            // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
            state.membersupdated = !state.membersupdated;
        },

        
    },
});

// Export actions and reducer
export const {
    updateAppState,updateMediaLoader,updatedmembersall
} = appStateSlice.actions;

export default appStateSlice.reducer;