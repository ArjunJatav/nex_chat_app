import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const messageSlice = createSlice({
  name: "message",
  initialState: {
    message: "Initial message",
    profileData: {},
    blockupdate: "",
  },
  
  reducers: {
    setMessage(state, action) {
      state.message = action.payload
    },

    setProfileData(state, action) {
      state.profileData = action.payload
    },
    
    setupdateblock(state, action) {
      state.blockupdate = action.payload
    },
  }
});

export const { setMessage,setProfileData ,setupdateblock} = messageSlice.actions;
export default messageSlice.reducer