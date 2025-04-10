import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pinCount: 0,
};

const pinSlice = createSlice({
  name: 'pin',
  initialState,
  reducers: {
    pin: (state) => {
      state.pinCount += 1;
    },
    unpin: (state) => {
      state.pinCount -= 1;
    },
    setPinCount: (state, action) => {
      state.pinCount = action.payload;
    },
  },
});

export const { pin, unpin, setPinCount } = pinSlice.actions;
export default pinSlice.reducer;
