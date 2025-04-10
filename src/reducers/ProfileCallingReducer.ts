import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profiles",
  initialState: {
    profiles: [], // Store multiple profiles
  },
  reducers: {
    addProfile: (state, action) => {
      // Add or update a profile
      const index = state.profiles.findIndex(
        (profile) => profile.id === action.payload.id
      );
      if (index === -1) {
        state.profiles.push(action.payload);
      } else {
        state.profiles[index] = action.payload;
      }
    },
    removeProfile: (state, action) => {
      // Remove a profile by UID
      state.profiles = state.profiles.filter(
        (profile) => profile.id !== action.payload
      );
    },
    updateMuteState: (state, action) => {
      // Update the mute key for a specific profile by ID
      const { id, mute } = action.payload;
      const profile = state.profiles.find((profile) => profile.id === id);
      if (profile) {
        profile.mute = mute; // Add or update the mute key
      }
    },

    updateCameraMuteState: (state, action) => {
      // Update the mute key for a specific profile by ID
      const { id, isCameraOn } = action.payload;
      const profile = state.profiles.find((profile) => profile.id === id);
      if (profile) {
        profile.isCameraOn = isCameraOn; // Add or update the mute key
      }
    },

    clearProfiles: (state) => {
      // Clear all data
      state.profiles = [];
    },
  },
});

export const { addProfile, removeProfile, updateMuteState, updateCameraMuteState, clearProfiles } = profileSlice.actions;

export default profileSlice.reducer;
