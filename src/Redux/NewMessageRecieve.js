import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const NewMessageRecieve = createSlice({
  name: "messageRecieve",
  initialState: {
    message: "message receive",
  },
  reducers: {
    setMessageRecieve(state, action) {
      state.message = action.payload;
    },
  },
});

export const { setMessageRecieve } = NewMessageRecieve.actions;
export default NewMessageRecieve.reducer;
