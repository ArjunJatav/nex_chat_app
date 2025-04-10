import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GiftedChat } from "react-native-gifted-chat";

const ChatHistory = createSlice({
  name: "chatHistory",
  initialState: {
    message: [],
    localmessage: [],
    mainprovider: {},
    onlinestatus: "",
    intervalIds: [],
    loadinterval: false,
    yesstart: false,
    chatlistinterval: null,
    newroomID: "",
    newfriendId: "",
    newroomType: "",
    roominfo: {},
    lastseennew: "",
    isnewblock: false,
    isnewmute: false,
    isnewarchiveroom: false,
    syncloader: false,
    isLock: false,
    messages: [],
    seenMesssages: {},
    deleteRoom: {},
    hideRoom: {},
    syncchatlist: false,
    syncchatpn: false,
    myrequestdata:[],
    otherrequestdata:[],

  },
  reducers: {
    setChatHistory(state, action) {
      const newMessages = action.payload.filter((message) => {
        return !state.message.some(
          (existingMessage) => existingMessage?.resId === message?.resId
        );
      });

      // Append the new messages to the existing chatGptchat array
      state.message = [...state.message, ...newMessages];
    },
    setroominfo(state, action) {
      state.roominfo = action.payload;
    },
    setisLock(state, action) {
      state.isLock = action.payload;
    },
    setnewroomType(state, action) {
      state.newroomType = action.payload;
    },
    setnewfriendId(state, action) {
      state.newfriendId = action.payload;
    },
    setLocalMessage(state, action) {
      state.localmessage = [];
    },
    setMainprovider(state, action) {
      state.mainprovider = action.payload;
    },
    setonlinestatus: (state, action) => {
      state.onlinestatus = action.payload;
    },
    setintervalIds: (state, action) => {
      state.intervalIds = action.payload;
    },
    setloadinterval: (state, action) => {
      state.loadinterval = action.payload;
    },
    setyesstart: (state, action) => {
      state.yesstart = action.payload;
    },
    setchatlistinterval: (state, action) => {
      state.chatlistinterval = action.payload;
    },
    setnewroomID: (state, action) => {
      state.newroomID = action.payload;
    },
    setlastseennew: (state, action) => {
      state.lastseennew = action.payload;
    },
    setisnewBlock: (state, action) => {
      state.isnewblock = action.payload;
    },
    setisnewmMute: (state, action) => {
      state.isnewmute = action.payload;
    },
    setisnewArchiveroom: (state, action) => {
      state.isnewarchiveroom = action.payload;
    },
    setsyncloader: (state, action) => {
      state.syncloader = action.payload;
    },
    setsyncchatlist: (state, action) => {
      state.syncchatlist = action.payload;
    },
    setsyncchatpn: (state, action) => {
      state.syncchatpn = action.payload;
    },
    setMessages: (state, action) => {
      const newMessages = action.payload.filter((message) => {
        return !state.messages.some(
          (existingMessage) => existingMessage?.resId === message?.resId
        );
      });

      // Append the new messages to the existing messages array
      state.messages = GiftedChat.append(state.messages, newMessages);
    },
    setclearmessages: (state, action) => {
      state.messages = action.payload;
    },
    setmessagesupdate: (state, action) => {
      state.messages = action.payload;
    },

    setUnreadCount: (state, action) => {
      state.seenMesssages = action.payload;
    },

    setHideRoom: (state, action) => {
      state.hideRoom = action.payload;
    },

    setDeleteRoom: (state, action) => {
      state.deleteRoom = action.payload;
    },
    setmyrequestdata: (state, action) => {
      state.myrequestdata = action.payload;
    },
    setotherrequestdata: (state, action) => {
      state.otherrequestdata = action.payload;
    },
  },
});

export const {
  setisLock,
  setMessages,
  setclearmessages,
  setmessagesupdate,
  setsyncloader,
  setsyncchatlist,
  setsyncchatpn,
  setChatHistory,
  setisnewBlock,
  setisnewArchiveroom,
  setisnewmMute,
  setLocalMessage,
  setMainprovider,
  setonlinestatus,
  setintervalIds,
  setloadinterval,
  setyesstart,
  setchatlistinterval,
  setnewroomID,
  setnewfriendId,
  setnewroomType,
  setroominfo,
  setlastseennew,
  setUnreadCount,
  setHideRoom,
  setDeleteRoom,
  setmyrequestdata,
  setotherrequestdata
} = ChatHistory.actions;
export default ChatHistory.reducer;
