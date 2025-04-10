import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const rootReducer = createSlice({
  name: "Root",
  initialState: {
    root: "show Bottomtab",
    joinRoom: "",
    typing: {},
  },
  reducers: {
    setRoot(state, action) {
      state.root = action.payload;
    },
    setJoinRoom(state, action) {
      state.joinRoom = action.payload;
    },
    setTyping(state, action) {
      const { roomId, status } = action.payload;
      if (!state.typing[roomId]) {
        state.typing[roomId] = []; // Initialize typing status array for a new room if it doesn't exist
      } else if (state.typing[roomId].includes(status)) {
        return; // Exit early if the status already exists in the array for the room
      }
      state.typing[roomId].push(status); // Store typing status for the room
    },

    clearTyping(state, action) {
      const roomId = action.payload;
      if (state.typing[roomId]) {
        state.typing[roomId] = []; // Clear typing status for the room
      }
    },
  },
});

export const { setRoot, setJoinRoom, setTyping, clearTyping } =
  rootReducer.actions;
export default rootReducer.reducer;
