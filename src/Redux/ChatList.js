import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const chatListSlice = createSlice({
  name: "chatListsql",
  initialState: {
    chatmessage: "",
    channelmessage: "",
    totalcount: 0,
  },
  reducers: {
    setChatlistmessage(state, action) {
      state.chatmessage = action.payload
    },
    setChannellistmessage(state, action) {
      state.channelmessage = action.payload
    },
    settotalcount(state, action) {
      state.totalcount = action.payload
    }
  }
});

export const { setChatlistmessage,setChannellistmessage,settotalcount } = chatListSlice.actions;
export default chatListSlice.reducer


