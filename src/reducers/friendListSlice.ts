import { createSlice } from '@reduxjs/toolkit';

const friendListSlice = createSlice({
  name: 'friendList',
  initialState: {
    friends: [],
    bottomSheetStory:'',
    userPremium : false,
    storyList: [],
    userGalleryVideos:[],
    enableNotification:true,
    stealthMode:true,
    showLastSeen:true,
    dimonds:0,
    uniqueFriendsData: []
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

    setUserGalleryVideos : (state, action) => {
      state.userGalleryVideos = action.payload;
    },

    setEnableNotification : (state, action) => {
      state.enableNotification = action.payload;
    },

    setStealthMode : (state, action) => {
      state.stealthMode = action.payload;
    },

    setShowLastSeen : (state, action) => {
      state.showLastSeen = action.payload;
    },

    setDaimonds : (state, action) => {
      state.dimonds = action.payload;
    },

    setUniqueFriendsData: (state, action) => {
      state.uniqueFriendsData = action.payload;
    },
 
  },
});

export const { setFriends,setBottomSheetStory,setPremium,setStorylist,setUserGalleryVideos,setEnableNotification,setStealthMode,setShowLastSeen,setDaimonds,setUniqueFriendsData} = friendListSlice.actions;

export default friendListSlice.reducer;
