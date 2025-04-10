import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appConstants } from "../utils/constants/appConstants";

// Define the initial state
const initialState = {
    [appConstants.update_data]: {},
};

// Create a slice using createSlice
const dataSlice = createSlice({
    name: "data", // Slice name
    initialState,
    reducers: {
        // Reducer for updating data
        // eslint-disable-next-line
        updateDataAgora: (state, action: PayloadAction<{ [key: string]: any }>) => {
            state[appConstants.update_data] = action.payload;
        },

        // Reducer for resetting the state
        resetDataReducer: () => initialState,
    },
});

// Export actions and reducer
export const { updateDataAgora, resetDataReducer } = dataSlice.actions;
export default dataSlice.reducer;
