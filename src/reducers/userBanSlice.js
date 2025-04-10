import { createSlice } from '@reduxjs/toolkit';

const userBanSlice = createSlice({
  name: 'userBan',
  initialState: {
    isUserBanned: false,
    suspendedDays: 0, 
  },
  reducers: {
    setUserBanned : (state, action) => {
        state.isUserBanned = action.payload;
      },

      setUserSuspendedDays: (state, action) => {
        state.suspendedDays = action.payload;
    },
  },
});  

export const {setUserBanned, setUserSuspendedDays} = userBanSlice.actions;
export default userBanSlice.reducer;
