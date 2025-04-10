import {UIReducer, UserReducer, ProfileReducer, VoipReducer, IapReducer,CallDurationReducer,callerIDReducers } from "./reducers/types";


export type StoreType = {
	UIReducer: UIReducer;
	UserReducer: UserReducer;
	ProfileReducer : ProfileReducer;
	IapReducer: IapReducer;
	VoipReducer: VoipReducer;
	CallDurationReducer:CallDurationReducer;
	callerIDReducers:callerIDReducers;
	
};