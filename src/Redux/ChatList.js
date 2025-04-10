import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const chatListSlice = createSlice({
  name: "chatListsql",
  initialState: {
    chatmessage: ""
  },
  reducers: {
    setChatlistmessage(state, action) {
      state.chatmessage = action.payload
    }
  }
});

export const { setChatlistmessage } = chatListSlice.actions;
export default chatListSlice.reducer


