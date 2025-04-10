import { isAndroid } from "../globalFunctions";

const primary_font = "Cabin-";

export const fonts = {
  primary_regular_font: isAndroid()
    ? `${primary_font}Regular`
    : `${primary_font}Regular`,
  primary_semi_bold_font: isAndroid()
    ? `${primary_font}SemiBold`
    : `${primary_font}SemiBold`,
  primary_bold_font: isAndroid()
    ? `${primary_font}Bold`
    : `${primary_font}Bold`,
  primary_medium_font: isAndroid()
    ? `${primary_font}Medium`
    : `${primary_font}Medium`,
};

export const fontSize = {
  title_size: 20,
  secondary_title_size: 18,
  big_title: 36,
  subtitle_size: 14,
  header_title_size: 28,
  form_title_size: 24,
  form_sub_title_size: 20,
  input_title_size: 18,
  input_content_size: 16,
  input_error_size: 12,
  input_line_height: 18,
  app_version_size: 12,
  button_text_size: 14,
  availability_chip_text_size: 14,
  car_list_title: 16,
  car_list_subtitle: 14,
  settings_text_item: 18,
  tab_bar_title_text: 12,
  toast_text: 16,
  subscription: {
    title_size: 18,
    subtitle_size: 12,
    status_size: 16,
  },
};
