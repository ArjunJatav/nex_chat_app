import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    message: "Initial message",
    profileData: {},
    blockupdate: "",
    channelSliceData: [],
    channelObj: {},
    myProfileData: {},
    diamondBalanceObj: {},
  },

  reducers: {
    setMessage(state, action) {
      state.message = action.payload;
    },

    setProfileData(state, action) {
      state.profileData = action.payload;
    },

    setupdateblock(state, action) {
      state.blockupdate = action.payload;
    },
    setChannelSliceData(state, action) {
      state.channelSliceData = action.payload;
    },
    setChannelObj(state, action) {
      state.channelObj = action.payload;
    },
    setMyProfleData(state, action) {
      state.myProfileData = action.payload;
    },
    setDiamondBalanceObj(state, action) {
      state.diamondBalanceObj = action.payload;
    },
  },
});

export const {
  setMessage,
  setProfileData,
  setupdateblock,
  setChannelSliceData,
  setChannelObj,
  setMyProfleData,
  setDiamondBalanceObj,
} = messageSlice.actions;
export default messageSlice.reducer;
