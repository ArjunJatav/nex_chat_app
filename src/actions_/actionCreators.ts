import { UserResponse } from "../containers/auth/collection";
import { ACTION_CONSTANTS } from "../utils/constants/actionConstants";
import { appConstants } from "../utils/constants/appConstants";

export const actionCreators = {
  showLoader: {
    [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.SHOW_LOADER,
    [appConstants.enable_loader]: true,
  },
  hideLoader: {
    [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.HIDE_LOADER,
    [appConstants.enable_loader]: false,
  },
  appLoaded: {
    [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.APP_LOADED,
  },
  logoutSuccess: {
    [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.LOGOUT_SUCCESS,
  },
  updateUser: function (userData: UserResponse) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.UPDATE_USER,
      [appConstants.user_data]: userData,
    };
  },
  fetchedUserDetail: function (userData?: UserResponse) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.UPDATE_USER,
      [appConstants.user_data]: userData,
    };
  },
  // eslint-disable-next-line
  updatePersistedData: function (payload: any) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.UPDATE_PERSISTED_DATA,
      payload,
    };
  },
  // eslint-disable-next-line
  loginSuccess: function (userData: any, tokenData: any) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.LOGIN_SUCCESS,
      [appConstants.user_data]: userData,
      [appConstants.token_data]: tokenData,
    };
  },
  acceptedTerms: function () {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.ACCEPTED_TERMS,
    };
  },
  acceptedPrivacy: function () {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.ACCEPTED_PRIVACY,
    };
  },
  errorHandler: function (errorMessage: string) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.ERROR_HANDLER,
      [appConstants.error_message]: errorMessage,
    };
  },
  // eslint-disable-next-line
  exceptionHandler: function (exception: any) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.EXCEPTION_HANDLER,
      [appConstants.exception_object]: exception,
    };
  },
  // eslint-disable-next-line
  createJobDetails: function (data: any) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.JOB_CREATE_DETAIL,
      [appConstants.data]: data,
    };
  },
  // eslint-disable-next-line
  createProfileDetails: function (data: any) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.CREATE_PROFILE_DATA,
      [appConstants.data]: data,
    };
  },
  clearCreateProfileDetails: function () {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.CREATE_PROFILE_DATA,
      [appConstants.data]: {
        roles: [],
        languages_known: [],
        experiences: [],
        preferences: {},
      },
    };
  },
  onSubscribeNavigateTo: function (payload: string) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.ON_SUBSCRIBE_NAVIGATE_TO,
      [appConstants.on_subscribe_navigate_to]: payload,
    };
  },
  updateUnreadNotificationCount: function (payload: number) {
    return {
      [ACTION_CONSTANTS.TYPE]: ACTION_CONSTANTS.UNREAD_NOTIFICATION_COUNT,
      [appConstants.unread_notification_count]: payload,
    };
  },
  unread_messages: function (payload: boolean) {
    return {
      type: ACTION_CONSTANTS.UNREAD_MESSAGES,
      [appConstants.unread_messages]: payload,
    };
  },
  updatePin: function (payload: string) {
    return {
      type: ACTION_CONSTANTS.UPDATE_PIN,
      [appConstants.unread_messages]: payload,
    };
  },
  // eslint-disable-next-line
  updateCallData: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.UPDATE_CALL_DATA,
      [appConstants.data]: payload,
    };
  },
  // eslint-disable-next-line
  updateAgoraData: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.UPDATE_AGORA_DATA,
      [appConstants.data]: payload,
    };
  },
  // eslint-disable-next-line
  updateCallState: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.UPDATE_CALL_STATE,
      [appConstants.data]: payload,
    };
  },
  // eslint-disable-next-line
  saveJobId: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.SAVE_JOB_ID,
      [appConstants.data]: payload,
    };
  },
  removeJobId: function () {
    return {
      type: ACTION_CONSTANTS.REMOVE_JOB_ID,
    };
  },
  
  // eslint-disable-next-line
  updateCallDuration: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.CALL_DURATION,
      [appConstants.data]: payload,
    };
  },
  // eslint-disable-next-line
  saveChatId: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.CHATID,
      [appConstants.data]: payload,
    };
  },

  // eslint-disable-next-line
  updateUseEffect: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.UPDATE,
      [appConstants.data]: payload,
    };
  },

  // eslint-disable-next-line
  rootFlow: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.ROOT,
      [appConstants.data]: payload,
    };
  },

  // eslint-disable-next-line
  updateData: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.DATA,
      [appConstants.data]: payload,
    };
  },

  // eslint-disable-next-line
  updateCallerId: function (payload: any) {
    return {
      type: ACTION_CONSTANTS.CALLERID,
      [appConstants.data]: payload,
    };
  },
};

export const resetVoipReducer = () => ({
  type: ACTION_CONSTANTS.RESET_VOIP_REDUCER,
});
