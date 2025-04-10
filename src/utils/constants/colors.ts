const base_theme_color = '#1F882F';
const secondary_base_theme_color = '#000000';
const white = '#FFFFFF';
const error = '#EB5757';

const INACTIVE_COLOR = '#949494';

const blackAlpha = (value: number = 1) => `rgba(0, 0, 0, ${value})`;

export const colors = {
  // Theme Colors used for App
  primary_theme: base_theme_color,
  secondary_theme: base_theme_color,

  // Background Color
  primary_background_color: '#F9F9F9',
  secondary_background_color: base_theme_color,

  // Text Title Colors
  title_text_theme: blackAlpha(0.87),
  secondary_title_text_theme: base_theme_color,
  subtitle_text_theme: blackAlpha(0.87),

  // Settings Item
  settings_separator: '#CFCFCF',

  // Tabs
  active_tab_color: blackAlpha(1),
  inactive_tab_color: '#707070',
  shadow_color: '#EB5581',
  red_color: 'red',
  greyed_color: 'EEEFF1',

  // Car Card
  car: {
    features_chips_card: blackAlpha(0.05),
  },

  // Calendar
  calendar: {
    selected_background: blackAlpha(1),
    text_color: blackAlpha(1),
    selected_text_color: white,
    period_mid_color: '#BBBBBB',
    inactive_date_color: INACTIVE_COLOR,
  },

  // Input Text
  input_content: blackAlpha(0.87),
  input_box_border_inactive: '#DADADA',
  input_box_border_active: base_theme_color,
  input_box_border_error: error,
  input_placeholder: blackAlpha(0.6),
  input_error: error,
  title_color: '#020921',
  desc_color: '#9EA0A9',

  // Button
  button_background_color: blackAlpha(1),
  button_inactive_background_color: '#949494',

  // Status Bar
  light_status_bar: white,

  // Clickable Text Color
  primary_action_text_theme: blackAlpha(0.87),
  secondary_action_text_theme: secondary_base_theme_color,

  // Button Text Color
  primary_action_button_text_theme: base_theme_color,
  secondary_action_button_text_theme: base_theme_color,

  // Button Background Color
  primary_action_button_background_theme: base_theme_color,
  secondary_action_button_background_theme: secondary_base_theme_color,

  // Button Border Color
  primary_action_button_stroke_theme: 'transparent',
  secondary_action_button_stroke_theme: base_theme_color,

  // Translucent
  modal_background: 'rgba(0,0,0,0.4)',
  dot_background: '#E05CB4',
  text_color: '#152250',

  // Student Card
  student_name_color: secondary_base_theme_color,
  student_id_color: 'orange',
  card_background_color: 'white',
  indicator_color: '#E0E0E3',

  rockt_orange: '#FB9947',
  pink: '#E64094',
  white: '#FFFFFF',
  background_color: '#F9F9F9',
  tabs_background_color: '#EFEFEF',
  green_color: '#27AE60',
  text_dark: '#020921',
  whiteOpacity: (opacity: number) => `rgba(255,255,255,${opacity})`,
  black_rgba: (alpha) => `rgba(41, 43, 52, ${alpha})`,
  black: 'black',
  input_bg_rgba: (alpha) => `rgba(242, 242, 242, ${alpha})`,
  subheading_color: '#5A5C66',
  dashboard_background_color: '#F5F5F5',
  gray: '#77767E',
  picker_item: '#9A99A2',
  picker_item_selected: '#232326',
  picker_indicator: '#E6E4EA',
  center_border: '#CECECE',
  navy: '#061959',
  transparent: 'transparent',
  gray6: '#F2F2F2',
  gray1: '#333333',
  input_bg: '#F7F7F7',
  chat_bg: '#FEFEFE',
  active_green: '#219653',
  app_brown:'#B96053',
  map_circle_gradient:
    'linear-gradient(180deg, rgba(251, 153, 71, 0.12) 0%, rgba(230, 64, 148, 0.12) 100%)',
};

export const buttonGradient = [colors.rockt_orange, colors.pink];
export const whiteBorderButtonGradient = [colors.white, colors.white];
export const gradientColors = {
  button_border_color: ['#FB9947', '#E64094'],
  green_color: ['#FB9947', '#E64094'],
  button_color: ['#FB9947', '#E64094'],
  white_color: ['#FFFFFF', '#FFFFFF'],
  input_focus_color: [colors.desc_color, colors.desc_color],
  login: ['#B96053', '#B75D5A', '#B96053'],
  pin_bg: [
    colors.primary_background_color,
    colors.primary_background_color,
    colors.primary_background_color,
  ],
  toggle_bg: [colors.tabs_background_color, colors.tabs_background_color],
};
