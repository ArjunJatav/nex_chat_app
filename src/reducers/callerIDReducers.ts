// Import necessary libraries
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appConstants } from "../utils/constants/appConstants";

// Define the initial state
const initialState = {
  [appConstants.caller]: {
    id: "",
    callerUUID: "",
    fromPush: false,
    fullView: false,
  },
};

// Create a slice using createSlice
const callerIdSlice = createSlice({
  name: "callerId", // Slice name
  initialState,
  reducers: {
    // Reducer for updating callerId
    updateCallerId: (
      state,
      action: PayloadAction<{
        id: string;
        callerUUID: string;
        fromPush: boolean;
        fullView: boolean;
      }>
    ) => {
      const { id, callerUUID, fromPush, fullView } = action.payload;
      state[appConstants.caller] = { id, callerUUID, fromPush, fullView };
    },
    resetCallerIdReducer: () => initialState,
  },
});

// Export actions and reducer
export const { updateCallerId, resetCallerIdReducer } = callerIdSlice.actions;
export default callerIdSlice.reducer;
