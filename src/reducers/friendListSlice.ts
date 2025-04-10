import { createSlice } from '@reduxjs/toolkit';

const friendListSlice = createSlice({
  name: 'friendList',
  initialState: {
    friends: [],
    bottomSheetStory:'',
    userPremium : false,
    storyList: [],
  },
  reducers: {
    setFriends: (state, action) => {
      state.friends = action.payload;
    },

    setStorylist: (state, action) => {
      state.storyList = action.payload;
    },

    setBottomSheetStory: (state, action) => {
      state.bottomSheetStory = action.payload;
    },
    setPremium : (state, action) => {
      state.userPremium = action.payload;
    },
  },
});

export const { setFriends,setBottomSheetStory,setPremium,setStorylist} = friendListSlice.actions;

export default friendListSlice.reducer;
