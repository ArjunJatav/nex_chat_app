import { Mixpanel } from "mixpanel-react-native";

const trackAutomaticEvents = false;
export const mixpanel = new Mixpanel(
  `${globalThis.mixpanelToken}`,
  trackAutomaticEvents
);

// ***********  LIVE URL   *********** //
 export const Base_Url = "https://tokeecorp.com/backend/public/api/V1/";
 export const Base_Url2 = "https://tokeecorp.com/backend/public/api/V2/";
 export const chatBaseUrl = "https://chat.tokeecorp.com:8002";
 export const socketUrl = "https://chat.tokeecorp.com:8002";
 export const groupCallApi = "https://tokeecorp.com/backend/public/api/V3/user/calls/initiate";
//////   https://chat.tokeecorp.com/

// // // ***********  TESTING  URL   *********** //
// export const Base_Url = "https://tokee.betademo.net/backend/public/api/V1/";
// export const Base_Url2 = "https://tokee.betademo.net/backend/public/api/V2/";
// export const chatBaseUrl = "https://tokee-chat.betademo.net";
// export const socketUrl = "http://tokee-chat.betademo.net:8002";
// export const groupCallApi = "https://tokee.betademo.net/backend/public/api/V3/user/calls/initiate";
export const video_url = "https://tokeecorp.com/backend/public/uploads/premium-feature-videos.zip";

// export const Base_Url = "https://stg-backend.tokeecorp.com/api/V1/";
// export const chatBaseUrl = "https://stg-chat.tokeecorp.com";

// ***********  LOGIN PAGE  *********** //
export const Get_Otp = "user/get-otp";
export const Verify_Otp = "user/verify-otp";
export const too_many_otp_request = "public/send-error-log-email";
export const check_force_update = "user/check-force-update";

// ***********  SETTING PAGE  *********** //
export const update_profile = "user/update-profile";
export const enable_notifications = "user/settings/update";
export const get_profile = "user/get-profile";
export const delete_account = "user/delete-account";
export const loguot = "user/logout";
export const terms_and_condition = "public/cms-page/terms-and-conditions";
export const privacy_policy = "public/cms-page/privacy-policy";
export const notifications_list = "user/notifications";
export const theme_purchase = "user/purchase/store";
export const theme_purchase_list = "user/purchase/list";
export const settings_notifications = "user/settings";
export const feedback = "user/contact-us";
export const avatarApikey = "0998e80adac54a1db5c0622e3f6207a2";
export const premium_feature = "user/premium-features";

// ***********  CHATTING PAGE  *********** //
export const get_by_phone_number = "user/users/get-by-phone-number";
export const get_all_contact = "user/users/get-all-contact";
export const verify_user_by_phone_number =
  "user/users/verify-user-by-phone-number";

// ***********  CHANNELS API PAGE  *********** //

export const mute_channel_api = "/api/channel/update-notification-status";
export const joinChannel = "/api/channel/join-channel";
export const exitChannelApi = "/api/channel/exit-channel";
export const createChannelApi = "/api/channel/create-channel";
export const updateChannelApi = "/api/channel/update";

// ***********  STORY PAGE  *********** //
export const add_story = "user/stories/post";
export const get_user_story = "user/stories";
export const delete_story = "user/stories/delete/";
export const get_by_User_story = "user/stories/get-by-user";
export const view_story = "user/stories/make-viewed/";
export const get_story_viewers = "user/stories/get-story-viewers/";
export const get_active_story = "user/stories/get-active-story-friends";
export const get_story_count = "user/stories/get-story-count";
export const get_by_User_allposts = "user/posts/get-by-user";
export const delete_multiple_posts = "user/posts/delete-multiple";

// https://tokee.betademo.net/backend/public/api/V1/user/posts
// ***********  CALL API PAGE  *********** //
export const initiate_call = "user/calls/initiate";
export const update_call_status = "user/calls/update-status";
export const call_history = "user/calls";
export const get_active_call = "user/calls/get-active-call";
export const delete_calllog = "user/calls/delete";
export const delete_all_calllog = "user/calls/delete-all";

// ***********  CHAT API PAGE  *********** //

export const archieveChatApi = "/api/group/update-archive-status";
export const reportUserApi = "user/users/report";
export const setpin = "user/set-chat-pin";
export const getGlobalGroup = "/api/group/get-global-rooms?name=";
export const getGlobalGroupV2 = "/api/group/v2/get-global-rooms?name=";
export const getGlobalGroupV3 = "/api/group/v3/get-global-rooms?name=";
export const getOtp = "user/get-otp";
export const verify_otp = "user/verify-otp";
export const privacyApi = "public/cms-page/privacy-policy";
export const termsApi = "public/cms-page/terms-and-conditions";
export const aboutApi = "public/cms-page/about-us";
export const notifications_clear = "user/notifications/clear";
export const get_wallet = "user/wallet/get-balance";
export const uniqueDisplayNameApi = "user/check-unique-display-name";
export const contactApi = "user/contact-us";
export const logoutApi = "user/logout";
export const friendSearchApi = "user/users/search?";
export const search_with_number = "user/users/get-by-phone-number";
export const add_friend = "user/followers/add-by-unique-id";
export const search_user = "user/users/search?search_srting=";
export const friendListApi = "user/followers";
export const updateImageApi = "user/update-profile-image";
export const userDetailApi = "user/followers/get-details";
export const get_by_unique_id = "user/users/get-by-unique-id";
export const get_by_id = "user/users/get-by-id";
export const get_list_notification_setting = "user/settings";
export const update_notification_setting = "user/settings/update";
export const post_stories = "user/stories/post";
export const get_stories_list = "user/stories/get-active-story-friends";
export const my_story = "user/stories";
export const get_story_by_userId = "user/stories/get-by-user";
export const clear_notification = "user/notifications/clear";
export const alreadyExistApi = "user/check-already-register";
export const typeWithProduct = "user/products/type-with-products";
export const productCategoryApi = "user/products/categories-with-product";
export const searchProductApi = "user/products/search";
export const productDetailApi = "user/products/details/";
export const place_order = "user/orders/place";
export const my_order_list = "user/orders";
export const archieveApi = "user/stories/archieve";
export const like_story = "user/stories/make-like-dislike/";
export const repost_story = "user/stories/re-post";
export const story_viewer = "user/stories/get-story-viewers/";
export const countryApi = "public/countries";
export const stateApi = "public/states";
export const cityApi = "public/cities";
export const categoryDetail = "user/products/category-details/";
export const myEmoticonOrSticker = "user/orders/get-my-emoticons-or-stickers";
export const deleteAccountApi = "user/delete-account";
export const allPurchaseProduct = "user/orders/get-my-all-purchased-products";
export const callHistoryApi = "user/calls";
export const UpdateLastSeenApi = "/api/user/update-last-seen";
export const getlastSeenApi = "/api/user/get-last-seen";
export const getWallpaer = "user/orders/get-my-wallpapers";
export const setWallpaerApi = "/api/user/update-chat-background";

// export const blockApi = "/api/group/update-member-to-group";
export const blockApi = "/api/user/block";
export const addMemberApi = "/api/group/update-member-to-group";
export const deletechatApi = "/api/chat/delete-all-chat";
export const groupDetailApi = "/api/group/get-group-details";
export const getRoomMembersApi = "/api/group/get-room-members";
export const groupEditApi = "/api/group/update-group";
export const groupUpdateApi = "/api/group/update-all-members";
export const muteChatApi = "/api/group/update-notification-status";
export const getAllMyGroup = "/api/group/get-user-groups";
export const reportChatApi = "/api/chat/report-chat";
export const exitgroupApi = "/api/group/exit-from-group";
export const allgroupApi = "/api/group/get-user-groups?userId";
export const stickerApi = "user/orders/get-my-emoticons-or-stickers";
export const chatUserDetailApi = "/api/group/get-user-details?friendId=";
export const alldataapi = "/api/user/get-user-data?userId=";
export const alldataapiV2 = "/api/user/v3/get-user-data?userId=";
export const alldataapiV3 = "/api/user/v5/get-user-data?userId=";
export const alldataapiV4 = "/api/user/v5/get-user-data?userId=";
export const killmode_status = "user/calls/get-active-call?";

export const updateToken = "user/update-device-token";
export const story_files = "user/stories/upload-file";
export const storyDelete_files = "user/stories/delete-file/";
export const deleteGroup = "/api/group/public/delete";
export const scanQrCodeApi = "user/users/get-by-unique-id";
export const channel_message = "user/users/get-by-unique-id";
export const channel_BETA_Api =
  "/api/group/admin/get-message/661e1c4db71dcd286960690e";
export const channel_Live_Api =
  "/api/group/admin/get-message/6630898516ded3da04f3c280";
  export const channel_Id = "6630898516ded3da04f3c280"
export const get_by_ChatId = "user/users/get-by-chat-id";

export const uploadContacts = "user/users/upload-user-contact";
export const getFriends = "user/users/get-all-friends?";
export const checkIfAllContactsSynced = "user/users/chat-all-contact-sync";
export const deleteAllContacts = "user/users/delete-all-sync-contact";
export const nonTokeeUsers = "user/users/get-all-contact?";
export const checkNewlyAddedContacts = "user/users/insert-contact";
export const addFriends = "user/users/insert-friends";

export const getTwilioSettings = "user/twilioenable";
export const twilioSendOtp = "https://verify.twilio.com/v2/Services/";
export const check_login_attempt = "user/check-login-attempt";
export const sendfriendrequest = "user/friend-requests/send-request";
export const friendrequestlist = "user/friend-requests/list";
export const acceptfriendrequest ="user/friend-requests/accepte-reject-request";
export const rejectfriendrequest = "user/friend-requests/cancel-request";
export const insertFriend = "user/users/insert-friend";
export const getChannels = "/api/channel/get-channels-list";
export const getsubscription = "user/purchase/get-active-subscription";
export const updateSubscriptionStatus = "user/purchase/subscription-store";
export const removefriendApi = "user/friend-requests/remove-friend";
export const twiliolookup = "user/twilio/lookups";
export const getSingleChat = "/chat/get-chat/";
export const getChannelData = "/api/channel/get-channel-details?channelId="
export const reactionapi = "/api/chat/reaction/react";
export const reportchannel = "/api/channel/report-channel";
export const getSettingKey = "public/get-settings-by-key?key=";

//--------------new sync api-----------------------------------

export const newRoomSyncApi = "/api/group/v1/sync?userId=";
export const newChannelApi = "/api/channel/v1/sync?userId=";
export const newChannelChatSyncApi = "/api/chat/v1/channel/sync";
export const newRoomChatSyncApi = "/api/chat/v1/sync"

// ***********TOKEE-MATCH-API***********//
export const getCountriesApi = "public/countries";
export const get_diamond_balance = "user/wallet/get-balance";
export const friend_suggesstion = "user/get-friend-suggestion";
export const update_diamond_purchase = "user/diamonds/update-balance";
export const getContinentsApi = "public/continents";
export const getLanguagesApi = "public/languages";
export const transactionApi = "user/transactons";
export const diamond_purchase = "user/diamonds/purchase";
export const user_control = "user/update-user-friend-suggestion-control";
export const banner_image = "user/banners";
export const update_friend_preferences = "user/update-friend-preferences";
export const CTA_api = "user/ctas";
export const earned_diamonds = "user/diamonds/earned-balance";
export const callid_ofuser = "user/users/get-userids-by-chat-ids";
export const revert_card = 'user/friend-requests/revert-metch-request';
export const upploadTokeePreferenceImage = "user/upload-preference-images";
export const deletePreferenceImage = "user/delete-preference-images";

// ********************bad-words-api************************************
export const getBadWordsApi = "public/get-bed-words";

export const generateAgoraTokenApi = "user/generate-agora-token";
export const get_call_active_member = "user/calls/get-active-members";
export const create_new_room = "/api/group/get-room";
export const update_violation_attempt = "user/update-violation-attempt";
export const get_violation_attempt = "user/get-violation-attempt";
export const check_account_suspend = "user/check-account-suspend";
export const check_file_nudity = "public/aws-check-file-nudity";




// export const twilioVerificationOtp = "https://verify.twilio.com/v2/Services/"

// export const twilioVerificationOtp = "https://verify.twilio.com/v2/Services/"  ye h channel list ki api

// https://chat.tokeecorp.com/api/channel/get-channels-list
