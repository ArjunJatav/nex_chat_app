import { Dimensions } from "react-native";
import { dimensions } from "../globalFunctions";

const { width } = Dimensions.get("window");

export const dimensConstants = {
  standard: {
    padding: 10,
    margin_vertical: 10,
    margin_horizontal: 24,
    margin_secondary: 20,
  },

  // Header
  header_height: 64,
  // Cards
  standard_card_height: 175,
  // Button
  border_radius: 10,
  button_height: 46,

  // App Image Icon
  app_image_icon: {
    wrapper_width: 60,
    height: 25,
    width: 25,
  },
  // App Input Form Element Length
  app_input: {
    border: {
      radius: 4,
      width: 1,
    },
  },
  // Toast
  toast_min_height: 40,
  toast_max_height: 140,
  // Subscription
  subscription: {
    card_radius: 11,
  },
  standard_margin_vertical: 20,
  touch_active_opacity: 0.7,
  half_width_btn: (dimensions().screen_width - 56) / 2,
  screen_width: width,
};
