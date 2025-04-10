// Import necessary libraries
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { appConstants } from "../utils/constants/appConstants";

// Define the initial state
const initialState = {
  [appConstants.caller]: {
    id: "",
    callerUUID: "",
    fromPush: false,
    fullView: true,
    call_id: "",
    groupCall: false,
    memberGroupCall: false
  },
};

// Create a slice using createSlice
const callerIdSlice = createSlice({
  name: "callerId", // Slice name
  initialState,
  reducers: {
    // Reducer for updating callerId with partial updates
    updateCallerId: (
      state,
      action: PayloadAction<Partial<typeof initialState[typeof appConstants.caller]>>
    ) => {
      Object.assign(state[appConstants.caller], action.payload); // Ensures only updated keys change
    },
    // Reducer for resetting the state to initial
    resetCallerIdReducer: () => initialState,
  },
});

// Export actions and reducer
export const { updateCallerId, resetCallerIdReducer } = callerIdSlice.actions;
export default callerIdSlice.reducer;
