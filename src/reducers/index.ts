import { combineReducers } from "redux";

import CallDurationReducer from "./CallDurationReducer";
import VoipReducer from "./VoipReducer";
import dataReducer from "./dataReducer";
import callerIDReducers from "./callerIDReducers";
import getAppStateReducers from "./getAppStateReducers";
import friendListSlice from "./friendListSlice";
import pinSlice from "./pinSlice";
import profileSlice from "./ProfileCallingReducer"
import userBanSlice from "./userBanSlice";

const rootReducer = combineReducers({
  VoipReducer: VoipReducer,
  CallDurationReducer: CallDurationReducer,
  dataReducer: dataReducer,
  callerIDReducers: callerIDReducers,
  getAppStateReducers: getAppStateReducers,
  friendListSlice:friendListSlice,
  pinSlice :pinSlice,
  profileSlice:profileSlice,
  userBanSlice: userBanSlice,
});

export default rootReducer;
