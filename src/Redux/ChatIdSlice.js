import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const chatIdSlice = createSlice({
  name: "chatid",
  initialState: {
    chatid: "",
  
  },
  reducers: {
    setChatid(state, action) {
      state.chatid = action.payload
    },
  }
});

export const { setChatid } = chatIdSlice.actions;
export default chatIdSlice.reducer


