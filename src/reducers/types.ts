export type User = {
  business_address: string;
  business_video: string;
  // eslint-disable-next-line
  contact_name: any;
  is_email_verified: JSX.Element;
  address: string;
  available_after: string;
  available_immediately: boolean;
  bio: string;
  business_abn: string;
  business_logo: string;
  business_name: string;
  // eslint-disable-next-line
  certification: any;
  contact_number: string;
  coordinates: [number, number];
  default_job: string;
  // eslint-disable-next-line
  eligibility: any;
  email: string;
  // eslint-disable-next-line
  expiry_time_millis: any;
  first_name: string;
  gender: string;
  id: string;
  introductory_video: string;
  is_boosted: boolean;
  is_higher_tip_accepted: boolean;
  is_pin_set: boolean;
  is_privacy_policy_accepted: boolean;
  is_private: boolean;
  is_subscription_active: boolean;
  is_terms_condition_accepted: boolean;
  is_profile_completed: boolean;
  is_tip_accepted: boolean;
  // eslint-disable-next-line
  job_type: any[];
  // eslint-disable-next-line
  languages_known: any[];
  last_name: string;
  locations: string[];
  make_profile_private: boolean;
  mobile_number: string;
  // eslint-disable-next-line
  other_photos: any[];
  profile_image: string;
  radius: number;
  // eslint-disable-next-line
  resume: any;
  // eslint-disable-next-line
  roles: any[];
  social_link: string;
  unread_notification: number;
  user_dob: string;
  user_type: string;
  vaccination_status: string;
  waypoint_place_id: string;
  website: string;
  subscription_id: string;
};
export type UIReducer = {
  enable_loader: boolean;
};

export type UserReducer = {
  // eslint-disable-next-line
  token: any;
  user: User;
  // eslint-disable-next-line
  on_subscribe_navigate_to: any;
  unread_notification_count: number;
  unread_messages: boolean;
  pin?: string;
  boost_job_id: null | string;
};

export type UserProfile = {
  roles: string[];
  languages_known: string[];
  // eslint-disable-next-line
  experiences: any[];
  // eslint-disable-next-line
  preferences: any;
};

export type ProfileReducer = {
  user: UserProfile;
};

type callDataType = {
  session: string;
  token: string;
  isVideo: boolean;
  image: string;
  caller: string;
  // eslint-disable-next-line
  guestVideoUid: any;
  isCallInitalized: boolean;
  isCallDisconnected: boolean;
};

type agoraDataType = {
  uid: string;
  app_id: string;
  channel_name: string;
  is_video: boolean;
  jwt: string;
  token: string;
  sender: string;
  receiver: string;
  userStatus: string;
  receiver_image: string;
  receiver_name: string;
  sender_image: string;
  sender_name: string;
};

type callStateType = {
  state: 'incoming' | 'outgoing' | 'active' | 'ended' | 'declined' | 'busy';
  isBackground: boolean;
};

export type VoipReducer = {
  call_data: callDataType;
  call_state: callStateType;
  agora_data: agoraDataType;
};

export type IapReducer = {
  // eslint-disable-next-line
  available_products: any[];
  // eslint-disable-next-line
  available_subscriptions: any[];
};

export type CallDurationReducer = {
  call_duration: number;
};
export type callerIDReducers = {
  id: string;
  callUUID: string
};

export type getAppStateReducers = {
  app_state:boolean;
}

