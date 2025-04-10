import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const premiumLimitSlice = createSlice({
  name: "premiumLimit",
  initialState: {
    storyCaptionFree: 50,
    storyCaptionPremium: 200,
    nonPremiumStoryLimit: 30,
    premiumProfileLinkLimit: 10,
    nonPremiumBioCharacterLimit: 75,
    premiumBioCharacterLimit: 150,
    joinGroupLimitFree: 50,
    joinGroupLimitPremium: 500,
    pinChatLimitFree: 5,
    pinChatLimitPremium: 20,
    joinChannelLimitFree: 50,
    joinChannelLimitPremium: 500,
  },
  reducers: {
    setStoryCaptionFree: (state, action) => {
        state.storyCaptionFree = action.payload;
      },
      setStoryCaptionPremium: (state, action) => {
        state.storyCaptionPremium = action.payload;
      },
      setNonPremiumStoryLimit: (state, action) => {
        state.nonPremiumStoryLimit = action.payload;
      },
      setPremiumProfileLinkLimit: (state, action) => {
        state.premiumProfileLinkLimit = action.payload;
      },
      setNonPremiumBioCharacterLimit: (state, action) => {
        state.nonPremiumBioCharacterLimit = action.payload;
      },
      setPremiumBioCharacterLimit: (state, action) => {
        state.premiumBioCharacterLimit = action.payload;
      },
   
  
      setJoinGroupLimitFree: (state, action) => {
        state.joinGroupLimitFree = action.payload;
      },
      setJoinGroupLimitPremium: (state, action) => {
        state.joinGroupLimitPremium = action.payload;
      },
      setPinChatLimitFree: (state, action) => {
        state.pinChatLimitFree = action.payload;
      },
      setPinChatLimitPremium: (state, action) => {
        state.pinChatLimitPremium = action.payload;
      },
      setJoinChannelLimitFree: (state, action) => {
        state.joinChannelLimitFree = action.payload;
      },
      setJoinChannelLimitPremium: (state, action) => {
        state.joinChannelLimitPremium = action.payload;
      },
   
  }
});

export const { 
    setStoryCaptionFree,
    setStoryCaptionPremium,
    setNonPremiumStoryLimit,
    setPremiumProfileLinkLimit,
    setNonPremiumBioCharacterLimit,
    setPremiumBioCharacterLimit,
    setJoinGroupLimitFree,
    setJoinGroupLimitPremium,
    setPinChatLimitFree,
    setPinChatLimitPremium,
    setJoinChannelLimitFree,
    setJoinChannelLimitPremium,
     } = premiumLimitSlice.actions;
export default premiumLimitSlice.reducer


