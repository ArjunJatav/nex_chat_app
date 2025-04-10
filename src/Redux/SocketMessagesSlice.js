import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const socketmessageSlice = createSlice({
  name: "socketmessage",
  initialState: {
    message: "sokcket message>>>>>>>>",
  },
  reducers: {
    setSocketMessage(state, action) {
      state.message = action.payload;
    },
  },
});

export const { setSocketMessage } = socketmessageSlice.actions;
export default socketmessageSlice.reducer;
