import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appConstants } from "../utils/constants/appConstants";

// Define the initial state
const initialState = {
    [appConstants.call_duration]: {},
};

// Create a slice using createSlice
const callDurationSlice = createSlice({
    name: "callDuration", // Slice name
    initialState,
    reducers: {
        // Reducer for updating call duration
        // eslint-disable-next-line
        updateCallDuration: (state, action: PayloadAction<{ [key: string]: any }>) => {
            state[appConstants.call_duration] = action.payload;
        },

        // Reducer for resetting the state
        resetVoipReducer: () => initialState,
    },
});

// Export actions and reducer
export const { updateCallDuration, resetVoipReducer } = callDurationSlice.actions;
export default callDurationSlice.reducer;
