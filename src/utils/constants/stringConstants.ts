import Config from "react-native-config";
import { appConstants } from "./appConstants";

export const STRING_CONSTANTS = {
  app_name: Config.APP_NAME,
  ok_text: "ok",
  subscribe: "Subscribe",
  refresh: "Refresh",
  flatlist_default_no_data_text: "Nothing here!",
  ideal_candidate: "Your ideal candidate is:",
  preview_profile: "Preview profile",
  value_not_available: "NA",
  connection: {
    connection_offline: "Your connection seems offline",
    connection_online: "You are back online",
    connection_offline_description:
      "Cannot proceed with the operation.\nPlease check your internet connection.",
  },

  // App Version
  app_version_prefix: "v",
  // Network
  something_went_wrong: "Something went wrong!!",
  // Auth
  title_welcome: "Welcome to ",
  title_welcome_back: "Welcome back, ",
  exclamation_remark: "!",
  secondary_title_welcome_to_app: `${Config.APP_NAME}!`,

  label_sign_in_email: "Enter your email below to sign back in.",
  label_sign_in_password: "Let’s get your password.",
  sub_label_reset_password: "Enter your email below to reset your password.",
  sub_label_log_out: "Are you sure you want to log out?",
  sub_label_change_password:
    "Please enter the below information to change your password.",

  placeholder_current_password: "Enter current password",
  placeholder_new_password: "Enter new password",
  label_forgot_password: "Forgot password",
  label_reset_password: "Reset password",
  label_continue: "Continue",
  label_sign_in: "Sign in",
  label_accept_continue: "Accept & agree",

  // Settings
  label_change_password: "Change password",
  label_terms: "Terms & conditions",
  label_privacy: "Privacy policy",
  label_faq: "FAQs",
  label_log_out: "Sign out?",
  enter_password: "Enter your password",

  // Tabs
  label_dashboard: "Browse",
  label_bookings: "Bookings",
  label_settings: "Settings",

  // Student Card
  label_class: "Class",
  label_section: "Section",
  label_campus: "Campus",
  label_student_id: "Student ID",

  // Filter
  label_filter: "Filter",
  label_reset: "Reset",
  label_apply_filter: "Apply filter",
  label_cancel: "Cancel",

  calendar: {
    validations: {
      start_date: "On which date you wanna start?",
      end_date: "Till which date you want?",
      old_date: "You can't select previous date.",
      slots_full: "No slots are available for selected date",
      slots_range_na: "Slot range not available",
    },
    label_today: "Today",
    label_date: "Date",
    label_schedule: "Schedule",
    months_name: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    months_name_short: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    week_name: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    week_name_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },

  google_autocomplete: {
    placeholder: "Search",
  },

  shake_feedback_types: [
    "UI Issue",
    "Functional Issue",
    "Suggestion",
    "Question",
  ],

  email_validations: {
    invalid: "Invalid email entered",
  },

  generic_validations: {
    empty: "Please provide the input",
  },

  invalid_email: "Enter valid email address",

  old_new_same: "New password cannot be same as old password",

  // onboarding strings
  title_1: "Welcome to Rockt!",
  desc_1:
    "Are you looking for work? Or workers?\nYou've come to the right place.",
  title_2: "The landscape is\nchanging",
  desc_2:
    "Rockt will revolutionize the way we find work, and create an agile workforce, changing it up from the palm of your hand.",
  title_3: "You need Rockt!",
  desc_3:
    "Set up your profile to find work, a volunteer role, or even someone to fill a short-term shift! Rockt jobs – for rapid uplift!",

  //signup
  signup_title: "Welcome to Rockt",
  signup_desc: "Let’s get you signed up! Add an email & password.",
  already_account: "Already have an account?",
  login_instead: "Login instead",
  terms_title: "terms",
  privacy_title: "privacy policy",
  sign_up: "Sign up",
  email_label: "Email address",
  email_placeholder: "Add your email address",
  enter_email: "Enter your email",
  create_password: "Create password",
  old_password: "Old password",
  new_password: "New password",
  password: "Password",
  contact_placeholder: "Add your contact number",
  contact_number: "Contact number",
  account_created:
    "Your account has been created, press complete profile to get started with a few basic details.",
  complete_profile: "Complete profile",

  //phone number verify
  phone_verify_title: "Enter the code we’ve sent to your phone.",
  phone_verify_desc: (number: string) =>
    `Please enter the 6-digit code we’ve sent to your mobile number, ${
      number || ""
    }`,

  //select user type
  select_user_type_title: "I’m using Rockt as a ...",
  select_user_type_desc:
    "Set up your account according to whether you are seeking work, or looking for workers.",
  job_poster_title: "Job poster",
  job_poster_desc: "Create & post job listings for your business.",
  job_seeker_title: "Job seeker",
  job_seeker_desc: "Create your profile & search for jobs best suited to you.",

  //login
  login_title: "Welcome back!",
  login_desc: "Login with your email & password",
  reset_password: "Reset password",
  login: "Login",
  create_new_account: "Create a new account?",

  //forgot password
  forgot_password_title: "Forgot your password?",
  forgot_password_desc:
    "Enter your email & hit the reset password button below to receive further instructions.",
  send_instructions: "Send instructions",

  //reset password
  reset_password_title: "Create your new password",
  reset_password_desc:
    "Your new password should be different than past passwords including 8 characters and at least 1 number.",

  //check email
  check_email_title: "Check your mail",
  check_email_desc: (email: string) =>
    `We’ve sent clear reset password instructions to your email on ${
      email || ""
    }.`,
  open_mail: "Open mail",
  skip_for_later: "Skip, I’ll do this later",
  no_email_help_text:
    "Didn’t receive any email? check your spam or try another email address.",

  //legals
  done_text: "Done",
  terms_of_use: "Terms of use",
  privacy_policy: "Privacy policy",
  get_started: "Get started",
  field_required: (key: string) => `${key} is required.`,
  email_required: "Please enter valid email address",
  all_setup: "You’re all setup!",
  profile_information: "Profile information",
  business_information: "Business information",
  subscription_payment: "Subscription & payment",
  change_password: "Change password",
  update_pin: "Update PIN",
  pin_required: "Please enter valid pin",
  terms_policy: "Terms & privacy",
  faq: "FAQ's",
  contact_admin: "Contact admin",
  delete_account: "Delete account",
  verified: "verified",
  select_country_code: "Select country code",
  skip: "Skip",
  set_pin: "Set a pin?",
  set_pin_desc:
    "Set a 4 digit pin to secure & prevent others from logging onto your account.",
  set_pin_btn: "Set my profile pin",
  verification_number: "Verification number",
  verification_code_placeholder: "Add 6 digit verification code",
  signout_desc: "Sign out of Rockt",
  next: "Next",
  complete: "Complete",
  complete_your_profile: "Complete your profile",
  complete_jp_profile_desc:
    "Let’s get some details about your business before creating a job post.",
  complete_your_profile_desc:
    "Welcome to Rockt! to get started please complete your profile.",
  lets_get_some_images: "Let’s get some images",
  lets_get_some_images_desc:
    "Add some images which best represent your business, this will be showcased within your business profile.",
  lets_get_some_images_desc_1: "Add images that best represent your business",
  business_location: "Business location",
  business_location_desc:
    "Tell us where you’re based, let’s get your\nbusiness location.",
  upload_business_logo: "Upload a logo or image",
  upload_business_logo_1: "Upload a logo or image",
  business_name: "Business name",
  business_name_placeholder: "Add business name",
  ABN_number: "ABN number  *optional*",
  ABN_number_placeholder: "Enter your ABN",
  business_website: "Website *optional*",
  business_video_label: "Video Link *optional*",
  business_website_placeholder: "Link your website",
  business_video_placeholder: "Link a business video",
  business_address_placeholder: "Enter business address",
  business_address: "Business address",
  business_tip: "Tip: Use images which highlight your logo",
  business_img_desc: "Tap to upload / remove images in the order you’d like.",
  business_description: "Description",
  business_description_desc: "Add a business description",
  business_description_title: "Business description",

  //Media Picker
  permission_required_text: "Permission required!",
  permission_required_text1: "Permission required",
  settings_text: "Settings",
  cancel_text: "Cancel",
  gallery_permission_text: "To access gallery please provide the permission",
  camera_permission_text: "To access camera please provide the permission",
  loc_permission_text:
    "To access your location please go to settings and adjust accordingly",
  notification_permission_text:
    "To get notifications please provide the permission",
  no_camera_text: "Camera cannot be accessed on this device",
  no_loc_text: "Location cannot be accessed on this device",
  no_gallery_text: "Gallery cannot be accessed on this device",
  no_notification_text: "Notifications is not supported on this device",
  upload_media: "Upload media",
  pick_gallery: "Choose from gallery",
  video_gallery: "Video gallery",
  // eslint-disable-next-line
  pick_camera: (type: any) => `Take a ${type}`,
  pick_doc: "Pick document",

  phone_number_invalid: "The phone number entered is not valid",
  invalid_abn: "Please enter a vaild ABN",
  abn_number: "ABN number",
  business_name_required: "Please enter a valid business name",
  business_logo_required: "Please enter a valid business logo",
  save_new_password: "Save new password",
  business_logo: "Business logo",
  business_image: "Business image",
  remove_business_logo: "Remove logo or image",
  confirm_changes: "Confirm changes",
  first_name: "First name",
  first_name_placeholder: "Add your first name",
  last_name: "Last name",
  last_name_placeholder: "Add your last name",
  update_profile_information: "Update profile information",
  password_error:
    "Password should contain minimum 8 characters with at least 1 number.",
  search_address_label: "Search address",
  explore_the_app: "Explore the app",
  all_setup_done: "You’re all setup!",
  all_setup_done_desc:
    "Your account setup has now been completed, press create a listing to add your first listing or start exploring Rockt.",
  all_setup_done_desc_1:
    "Congratulations! Your profile is complete.  Choose one of the options below to either post a job, or explore Rockt.",
  create_listing: "Create a listing",
  use_current_location: "Use current location",
  upload_profile_image: "Upload profile image",
  remove_profile_image: "Remove profile image",
  description_placeholder: "Tell us about yourself",
  description_label: "Description",
  social_link_label: "Social link *optional*",
  social_link_placeholder: "Add your social media account link here",
  website_link_label: "Website *optional*",
  website_link_placeholder: "Link your website",
  fully_vax: "Full vax",
  partial_vax: "Partial vax",
  non_vax: "Non-vax",
  vaccination_status_title: "Covid 19 vaccination status *optional*",
  select_gender_title: "Select gender",
  mobile_number: "Mobile number",
  mobile_placeholder: "Add your mobile number",
  dob_label: "Date of birth",
  dob_placeholder: "Select date of birth",
  dob_picker_title: "Add your date of birth",
  edit_profile: "Edit profile",
  save_profile: "Save profile",

  //gender
  male: "Male",
  female: "Female",
  other: "Other",

  //select language
  select_language_title: "Select a languages spoken",
  select_language_desc:
    "Select all your spoken languages for potential references.",

  confirm_text: "Confirm",
  update_language: "Update languages",

  // Create job Screen
  create_a_job: "Create a new job",
  create_a_job_1: "Create a job",
  create_job_desc:
    "You're nearly there!  Simply enter the details below to define the role you are advertising.",
  create_job_desc_1:
    "Get started with Rockt & see potential candidates by creating a job.",
  listing_details: "Listing details",
  job_information: "Job information",
  step_2_title: "The role",
  step_2_desc: "Tell us what you're looking for in the ideal candidate.",
  renumeration_and_duration: "Remuneration & duration",
  listing_desc: "Job title & description",
  information_desc: "Role, qualifications & location",
  renumeration_desc: "Position remuneration & further details",
  start: "Start",
  completed: "Completed",
  add_listing_details: "Add listing details",
  job_listing_desc:
    "Tell us some basic details about your job listing to get started.",
  job_title: "Job title",
  job_images_desc:
    "Add some images for your job listings that best demonstrate your job requirements.",
  images_tips: "Tip: Use images which highlight the job requirements",
  complete_listing_details: "Complete listing details",
  select_a_job_category: "Select a job category",
  select_a_job_qualifications: "Select a job qualifications",
  job_category_desc:
    "Does your job fall under a specific industry? tell us which category is most suitable for your listing!",
  job_qualifications_desc:
    "Does your job require specific qualifications? search below & select or skip to continue.",
  search_job_category: "Search job categories",
  search_job_qualification: "Search job qualification",
  job_location: "Job location",
  job_location_desc: "Tell us where your job is located?",
  search_job_location: "Search job location",
  add_renumeration_duration: "Add remuneration & duration",
  add_renumeration_desc: "Tell us further details about your job.",
  full_time: "Full-Time",
  casual: "Casual",
  contract: "Contract",
  business_video: "Business video",
  job_duration: "Job duration",
  set_start_date: "Set start date",
  set_end_date: "Set end date",
  working_hours: "Working hours",
  set_start_time: "Set start time",
  set_end_time: "Set end time",
  renumeration_pay: "Remuneration",
  hourly: "Hourly",
  is_accomodation: "Is accommodation available?",
  is_role_permanent: "Is this role permanent / ongoing?",
  duration_negatiable: "Duration negotiable?",
  duration_negatiable1: "Duration negotiable",
  hours_negatiable: "Are the hours negotiable?",
  hours_negatiable1: "Hours negotiable",
  include_super: "Does this include super?",
  pay_negotiable: "Is pay negotiable?",
  salary_negotiable: "Salary negotiable",
  position_available: "Positions available",
  select_pay_period: "Select pay period",
  dialy: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  save_as_draft: "Save as draft",
  draft_desc:
    "Need more time? save your listing as a draft & come back to it later!",
  dont_save: "Don’t save",
  save_draft: "Save draft",
  category_required: "Category is required!",
  qualifications_required: "Qualifications is required!",
  address_required: "Address is required!",
  set_working_hours: "Set working hours",
  set_job_duration_start: "Set job duration (start)",
  set_job_duration_end: "Set job duration (end)",
  profile_image: "Profile image",
  gender: "Gender",
  languages: "Languages",
  my_location: "My location",
  confirm_location: "Confirm location",
  video_and_images: "Video & images",
  work_preferences: "Paperwork",
  switch_to_private: "Switch to private",
  switch_to_private_desc: "Your profile is public & open to employers",
  switch_to_public: "Switch to public",
  switch_to_public_desc: "Your profile is hidden & not being displayed",
  add_your_dob: "Add your date of birth",
  complete_your_profile_desc_job_seeker:
    "Let’s get some details about you for your\npotential employers.",

  your_location: "Your location",
  your_location_desc:
    "Tell us where you’re based & how far you can travel, we won’t share your address.",
  upload_video: "Introduce yourself by video",
  upload_video_desc:
    "Videos are a great way for employers to learn more about you. Tell us about yourself in a short, sharp video.",
  video_tip:
    "Tell us about your name, work experience and what you like doing?  Or tap on ‘skip’ below to keep moving.",
  remove_video: "Remove video intro",
  upload_intro_video:
    "Tap here to either record a new video or upload it from your phone or tablet.",
  add_images_title: "Upload images",
  add_images_desc:
    "Select images of yourself at work or at home to build your profile for potential employers.",
  upload_image: "Upload now",
  upload_images_tip: "Tap each box to add or remove pics.",
  add_experience_title: "Add your experience",
  add_experience_desc:
    "Detail your past and current work experience/job history below. (This will help employers match more easily. You can add a full CV soon).",
  experinace_tips:
    " If you are looking for a volunteer role please tell us about your past roles here.",
  experience: "Experience",
  prev_job_name_placeholder: "Add your prior job title",
  prev_job_name_label: "Job name",
  prev_job_location_label: "Previous job location",
  prev_job_location_placeholder: "Job location",
  prev_job_desc_label: "Role descriptions",
  prev_job_desc_placeholder: "Tell us what your responsibilities were?",
  add_experiences: "Add experiences",
  set_start_end_date_title: (value: "start" | "end") => `Set ${value} date`,
  add_another: "Add another",
  add: "Add",
  start_availability: "When can you start",
  employment_type_label: "What type of employment are you looking for?",
  add_resume_title: "Upload resume (max. 1)",
  add_certificates_title: "Upload your certifications (max. 5)",
  location_empty_error: "Please choose your location",
  introductory_video: "Introductory video",
  photos: "Photos",
  search_languages: "Search languages",
  no_language_select_err: "Please select a language",
  job_category_empty_err: "Please select a job category",
  save_changes: "Save changes",
  save_changes_desc: (email: string) =>
    `To confirm these changes re-enter your password. Please verify your email the mail we’ve sent to ${email} if you haven’t already done so.`,
  enter_your_password: "Enter your password",
  employment_type: "Employment type",
  resume: "Resume",
  availability_date_placeholder: "Choose your preferred start date here",
  max_limit_certificate_allowed: "Max 5 certificates allowed",
  max_limit_resume_allowed: "Max 1 resume allowed",
  add_work_preferences_title: "Paperwork",
  add_work_preferences_desc:
    "Add some oomph to your profile by uploading your CV and any qualifications you have below. \n(Docs include working visas).",
  work_preferences_tips:
    "Save your documents in the ‘file’ section of your phone or tablet to upload to Rockt.  Tap on each box below to upload.",
  update_work_preferences: "Update paperwork",
  update_job_categories: "Update job categories",
  update_experiences: "Update experience",
  changes_saved: "Changes saved",
  video_image_management: "Video & image management",
  intro_video: "Intro video",
  start_date: "Start date",
  end_date: "End date",
  dashboard_bottom_text:
    "Scroll horizontally to browse, swipe up to match!\n Swipe down to remove this option.",
  prefer_to_scroll: "Prefer to scroll?",
  select_job_category_desc:
    "Tell us what categories your interested in working within, select upto 3.",
  changes_save_success: "Changes saved successfully",
  all_setup_done_job_seeker: "Your Rockt profile is complete.",
  start_exploring: "Begin the job hunt now!",
  start_time: "Start time",
  end_time: "End time",
  preview_job_listing: "Preview job listing",
  my_listings: "My listings",
  all: "All",
  open: "Open",
  closed: "Closed",
  edit_job: "Edit job",
  open_job: "Open job",
  delete_job: "Delete job",
  switch_jobs: "Switch jobs",
  view_all_jobs: "View all jobs",
  max_job_category_err: "Max upto 3 job category can be selected",
  continue_with: (count?: number) => `Continue with (${count || 0}/3)`,
  listing_preview: "Listing preview",
  listing_preview_desc:
    "This is what job seekers will see when they are searching for roles.",
  post_job_listing: "Post job listing",
  remove_experience: "Remove experience",
  draft: "Draft",
  switch: "Switch",
  selected: "Selected",
  job_images_tip: "Tip: Use images which highlight the job requirements",
  job_end_before_start_err: "Start date cannot be after end date",
  end_before_start_time_err: "Start time cannot be after end time",
  amount_error: `Amount should be less than ${appConstants.max_amount}`,
  certificate: "Certificate",
  availability: "Availability",
  vaccination_status: "Vaccination status",
  language_spoken: "Languages spoken",
  looking_for: "Looking for",
  contact: "Contact",
  present: "Present",
  pay_rate: "Pay rate",
  accommadation: "Accommodation",
  download_completed: "Download completed",
  download_failed: "Download failed",
  flag_screen_title: "Help us understand the problem, tell us what went wrong?",
  flag_screen_desc: "Select a reason & add some optional details.",
  submit_flag: "Submit flag",
  flag_explicit: "Sexually explicit",
  flag_violent: "Violent imagery",
  flag_spam: "Spam or scam",
  flag_dont_belong: "Doesn’t belong on Rockt",
  flag_offensive: "I find this offensive",
  flag_other: "Other (add a reason)",
  flag_desc_placeholder: "Tell us what went wrong...",
  update_job: "Update job",
  update_job_desc:
    "Update the created role by selecting any of the below sections to edit.",
  preview_changes: "Preview changes",
  preview: "Preview",
  update: "Update",
  save: "Save",
  edit_job_desc:
    "Got changes? No worries add the updated details below & hit save.",
  update_listing_details: "Update listing details",
  update_renumeration_and_duration: "Update remuneration & duration",
  discard_changes_title: "Discard changes?",
  discard_changes_desc: "You’ve made some changes which haven’t been saved.",
  go_back: "Go back",
  discard_changes: "Discard changes",
  user_flag_success: "User flagged successfully",
  job_flag_success: "Job flagged successfully",
  flag_option_empty_err: "Please select an option",
  flag_reason_empty_err: "Please add a reason",
  update_my_location: "Update my location",
  post_updated_job_lisiting: "Post updated job listing",
  update_work_preference_title: "Update paperwork",
  connect: "Connect",
  keep_swiping: "Keep swiping",
  its_match: "It’s a match!",
  complete_profile_desc:
    "Welcome to Rockt! to get started please complete your profile.",
  chat: "Chat",
  message_name: (name: string) => `Message ${name}`,
  match_success_desc: (name: string) =>
    `Congrats on matching with ${name}, send a message to find out more!`,
  changes_save_desc_profile_info:
    "We’ve saved the changes made to your profile information",
  changes_save_desc_business_info:
    "We’ve saved the changes made to your business information",
  changes_save_desc_location: "We’ve saved the changes made to your location",
  changes_save_desc_video_image:
    "We’ve saved the changes made to your video & images",
  changes_save_desc_job_categories:
    "We’ve saved the changes made to your job categories",
  changes_save_desc_experiences:
    "We’ve saved the changes made to your experiences",
  changes_save_desc_work_preferences:
    "We’ve saved the changes made to your paperwork",
  subscription_title: "Unlock Rockt",
  subscription_desc: "Choose how you use Rockt according to your needs.",
  restore_purchases: "Restore purchases",
  unlimited_jobs_title: "Unlimited jobs",
  unlimited_jobs_desc:
    "Have multiple open listings, create as many jobs as you’d like.",
  unlimited_likes_title: "Unlimited likes",
  unlimted_matches_title: "Unlimited matches",
  unlimited_likes_desc:
    "Keep swiping with no breaks! Search for employees easily.",
  subscription_management: "Subscription management",
  update_subscription: "Update subscription",
  payment_history: "Payment history",
  manage_subscription: "Manage subscription",
  terms_and_privacy: "Terms & privacy",
  contact_name: "Contact name",
  contact_name_placeholder: "Whose your best contact?",
  full_name: "Full name",
  full_name_placeholder: "Add your full name",
  view_job: "View job",
  back_to_my_listing: "Back to my listings",
  complete_profile_title: "Complete profile",
  update_susbcription_title: (type: "Monthly" | "Yearly") =>
    `Change to Rockt (${type})`,
  maybe_later: "Maybe later",
  purchase_success: "Your purchase was successful.",
  you_are_all_set: "You’re all Set",
  listing_created: "Listing created",
  subscription_required: "Subscription required",
  subscription_required_desc:
    "Creating a job listing requires an active subscription",
  notifications: "Notifications",
  read_all: "Read all",
  reset: "Reset",
  filter_title: "Filtering & more",
  filter_desc:
    "Select viewing preferences & filtering options.\nDrag the circle below to expand your search area.",
  my_search_locations: "My search location(s)",
  update_location: "Update location",
  see_results: "See results",
  available_immediately: "Available immediately",
  my_matches: "My matches",
  send_job_offer: "Send job offer",
  visit_profile: "Visit profile",
  unmatch_with: (name: string) => `Unmatch with ${name}`,
  chat_tip:
    "Tip: When you’re ready to hire hit the briefcase on the bottom left.",

  info_tip_chat:
    "Tip: You can view more details about the candidate by tapping their name above.",
  info_listing_icon_a: "You can manage your listings by tapping the",
  info_listing_icon_b: "icon",
  ok_got_it: "Ok, Got it",
  type_placeholder: "Type...",
  proposal_sent_title: (name: string) => `You’ve sent a proposal to \n${name}`,
  proposal_sent_desc: (name: string) =>
    `We’ll notify you once ${name}\nResponds.`,
  offer_accepted: "Offer accepted",
  offer_accepted_desc: (name: string) =>
    `Congrats your offer has been accepted by ${name} get chatting to finalise employment.`,
  offer_rejected: "Offer rejected",
  offer_rejected_desc: "Sorry, it looks like your offer was rejected",
  js_offer_title: (name: string) => `${name} has sent across \na job proposal`,
  js_offer_desc: (name: string) =>
    `By accepting you agree do ${name} job offer. *Note* False acceptances will affect your rating.`,
  js_accept_offer_title: (name: string) =>
    `Congrats! You’ve accepted \n${name} job offer!`,
  js_accept_offer_desc:
    "Now that you’ve both accepted. Get chatting on finalising your job offer.",
  js_reject_offer_title: "Declined role proposal",
  js_reject_offer_desc: (name: string) => `You’ve declined ${name} offer.`,
  reject: "Reject",
  rejected: "Rejected",
  accept: "Accept",
  accepted_offer: "Accepted offer",
  send_offer_title: "Send a hire request!",
  send_offer_desc: (name: string) =>
    `Ready to hire ${name}? Send him a hire request to prompt him to accept your offer.`,
  send: "Send",
  hire_step_1: "Send a “Ready to hire” request",
  hire_step_2:
    "We’ll notify your potential employee you’re ready to hire, they’ll either reject or accept your offer.",
  hire_step_3: "If your employee accepts we’ll mark the position as fulfilled.",
  okay_got_it: "Okay, got it!",
  ready_to_hire: "Ready to hire?",
  unmatch: "Unmatch",
  unmatch_title: "Confirm unmatch",
  unmatch_desc: (name: string) =>
    `Unmatch with ${name}? neither of you will be able to send new messages to each other.`,
  time_ago: (count: number, type: string) =>
    `${count} ${type}${count > 1 ? "s" : ""} ago`,
  job_delete_success: "Job deleted successfully",
  close_job: "Close job",
  fitler_lang_title: "Select languages",
  filter_lang_desc: "Update your preferences for employee\nlanguages spoken.",
  save_preferences: "Save preferences",
  user_unmatch_success: "User unmatched successfully",
  yesterday: "Yesterday",
  unmatched: "Unmatched",
  today: "Today",
  hire_request_sent: "Hire request sent!",
  hire_req_sent_desc: (name: string) =>
    `We’ll notify you once ${name} responds to your request.`,
  update_location_title: "Update location",
  update_location_desc: "Update your location to find",
  update_location_desc_2:
    "Got Changes? No worries add the updated details below & hit save.",
  rating_title: (isJobSeeker: boolean) =>
    `How was your experience with ${
      isJobSeeker ? "Job provider" : "Job seeker"
    }`,
  rating_desc: "Add a star rating & tell us how it went.",
  rating_desc_placeholder: "Tell us how it went...",
  rating_desc_label: "Description *optional*",
  submit: "Submit",
  incoming_call: (type: "audio" | "video") => `Incoming ${type} call...`,
  calling: "Calling...",
  userBusy: "User is busy on another call.",
  call_ended: "Call ended",
  call_declined: "Call declined",
  view_rating: "View ratings",
  rating_submit_successs: "Rating submitted successfully",
  audio_call: "Audio call",
  video_call: "Video call",
  delete_account_title: "Delete account?",
  delete_account_desc:
    "We’re sorry to see you go! Please enter your\npassword to delete your account.",
  account_delete_success: "Account deleted successfully",
  stay_on_rockt: "Stay on Rockt",
  enter_pin_title: "Enter pin?",
  enter_pin_desc: "Type in your 4 - digit pin to update it",
  confirm_new_pin_title: "Confirm new pin",
  confirm_new_pin_desc: "Re-enter new pin to save changes",
  set_new_pin: "Set new pin",
  pin_update_success: "We’ve saved the changes made to your pin",
  login_with_pin: "Login with pin",
  login_with_pin_desc:
    "Log back in with your pin code below, or login with\nyour password by pressing login with password.",
  delete_acc_confirm_title: "Are you sure?",
  delete_acc_confirm_desc:
    "We’ll remove & delete all data associated with your account.",
  delete_acc_btn_title: "Delete account",
  login_with_password: "Login with password",
  password_login_title: "Password login",
  password_login_desc: "Login with your password",
  enter_password_text: "Enter password",
  flag_user: "Flag user",
  update_positions_available: "Update positions available",
  close_job_btn: "Close job",
  jobs_fulfilled_title: "All roles fulfilled!",
  jobs_fulfilled_desc:
    "Congrats on fulfilling all your roles for this job.\n\nWould you like to keep your listing open?",
  job_close_success: "Job closed successfully",
  faq_header: "Frequently asked questions",
  read_less: "Read less",
  read_more: "Read more",
  are_you_fully_vacc: "Are you fully vaccinated?",
  no_msg_title: "No messages",
  no_msg_desc:
    "Tap a match to start a conversation, or explore potential matches!",
  explore_matches: "Explore matches",
  no_notification_title: "No notifications",
  no_notification_desc:
    "We’ll notify you once something interesting happens, check back here later!",
  no_job_title: "Looks like you don’t have any jobs here yet.",
  no_job_desc: "Tap ‘Create a job’ below to create your first job.",
  create_job: "Create job",
  fully_vaccinated: "Fully vaccinated",
  error: "Error",
  sounds_good: "Sounds good!",
  boost_for: (price: string) => `Boost for ${price ? price : ""}`,
  boost_desc2: "Your boost will remain for",
  boost_js_title_active: "You have an active boost",
  boost_js_desc_active:
    "Your profile is currently being showcased at the top of the list to job providers.",
  boost_js_title: "Boost your profile today!",
  boost_js_desc:
    "Have your profile showcased at the top of the list & get more likes.",
  boost_job_title: "Boost your job today!",
  boost_job_desc:
    "Need your job to stand out in the crowd?  Boost for a week in your search area using the\nbutton below.",
  boost_job_desc2:
    "Have your job showcased at the top of the list & get more likes.",
  dont_boost_now: "Don’t boost now",
  boost_job_title2: "Boost your job!",
  boost_job_desc3:
    "Make sure your job stays at the top of Rockt's listings in your area for one week, through our boost option.",
  boost_job_desc4:
    "Make sure your job post stands out.  Pay to have your listing at the top of the listings for seven days.",
  boost_job_title_active: "Your job is being boosted!",
  boost_job_desc_active: "You are being shown at the top of the list!",
  jobs: "Jobs",
  manage_your_roles: "Manage your roles",
  see_all_candidates: "See all candidates",
  see_all_candidates_desc: "View all available job seekers in your search area",
  relevant: "Relevant",
  relevant_desc: "Roles related to my profile within my search area.",
  view_all: "View all jobs",
  view_all_desc: "See all jobs in my search area",
  select_role_label: "Select role",
  select_role_placeholder: "Select a role",
  add_search_areas_title: "Add search areas",
  add_search_areas_desc:
    "Define your search areas.  You can search in three areas at the one time.",
  use_my_current_location: "Use my current location",
  add_search_area: "Add search area",
  add_location_title: "Set your search area for jobs",
  add_location_desc:
    "You can begin the search from where you are now, or if you know the area your preferred workplace is based, enter the address below.",
  add_location_tips: "Slide the circle below to expand your search area.",
  skip_video_note:
    "If you don't feel comfortable uploading a video of yourself, feel free to skip this page using the skip button below.",
  add_location: "Confirm location",
  radius_req_err: "Please select radius",
  delete_location_confirm_title: "Are you sure?",
  delete_location_confirm_desc: "We will remove this location.",
  delete_location: "Delete location",
  loc_alread_exist: "Your current location is already present in the list",
  loc_alread_exist_list: "This location is already added in the list",
  newly_added: "Newly Added",
  empty_cards_title: "We’re about to launch",
  empty_cards_desc:
    "Our ground crew are just about to launch Rockt in your area – circle back soon for more jobs that suit your search criteria.",
  empty_cards_title1: "You’re out of profiles!",
  empty_cards_desc1: "Check back here later to find new profiles!",
  update_filter: "Update filter",
  work_history: "Work history",
  currently_in_role: "Currently in role?",
  address_note: "(Your address will remain private).",
  current_job_error: "Only one job can be current job!",
  show_and_tell: "Show and tell?",
  sharing_news:
    "Great news on the job! Click on the link below to share the news on your social media.",
  busy_text: "Other user is busy, please try again later",
  sign_out: "Sign out",
  no_mathces: "No matches",
  no_mathces_desc:
    "We’ll showcase all your matches here, to get started create a job & start swiping on your dashboard.",
  no_mathces_button: "Start swiping",

  no_candidates_heading: "You’re all caught up for now.",
  no_candidate_desc:
    "There are no new profiles to view at this\ntime, check back later for updates.",
  boot_job: "Boost job",
  Share: "Share",
  view_all_candidates_long_desc: "View all job seekers in your region",
  Edit: "Edit",
  View: "View",
  Boost: "Boost",
  Delete: "Delete",
  Open: "Open",
  Close: "Close",
};
