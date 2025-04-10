import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import messageReducer from './Redux/MessageSlice';
import ChatIdSlice from "./Redux/ChatIdSlice";
import chatListsql from "./Redux/ChatList";
import MessageSlice from "./Redux/MessageSlice";
import SocketMessagesSlice from "./Redux/SocketMessagesSlice";
import rootReducer from "./Redux/rootReducer";

// redux persist work below
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";
import ChatHistory from "./Redux/ChatHistory";
import NewMessageRecieve from "./Redux/NewMessageRecieve";
import CallDurationReducer from "./reducers/CallDurationReducer";
import VoipReducer from "./reducers/VoipReducer";
import callerIDReducers from "./reducers/callerIDReducers";
import dataReducer from "./reducers/dataReducer";
import getAppStateReducers from "./reducers/getAppStateReducers";
import backupSlice from "./Redux/backupSlice";
import { sqlSlice } from "./Redux/SqlStorage";
import friendListSlice from "./reducers/friendListSlice";
import pinSlice from "./reducers/pinSlice";
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["bookmarks"],
};
const combiningAlllRed = combineReducers({
  chatid: persistReducer(persistConfig, ChatIdSlice),
});
export const store = configureStore({
  reducer: {
    combiningAlllRed,
    root: rootReducer,
    socketmessage: SocketMessagesSlice,
    message: MessageSlice,
    chatHistory: ChatHistory,
    NewMessageRecieve: NewMessageRecieve,
    chatListsql: chatListsql,
    backup: backupSlice,
    sqlSlice: sqlSlice,
    friendListSlice:friendListSlice,
    pinSlice:pinSlice,
    /////////calling reducers///////////////
    VoipReducer: VoipReducer,
    CallDurationReducer: CallDurationReducer,
    dataReducer: dataReducer,
    callerIDReducers: callerIDReducers,
    getAppStateReducers: getAppStateReducers,
  },
});

export const persistor = persistStore(store);
