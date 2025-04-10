import { Platform } from "react-native";
import { FontFamily } from "./SetFontFamily";

const Fonts = {
  Dancing: {
    medium: Platform.OS == "ios" ? "Dancing Script" : "Dancing_Script_copy",
    bold: Platform.OS == "ios" ? "Dancing Script" : "Dancing_Script_copy",
    regular: Platform.OS == "ios" ? "Dancing Script" : "Dancing_Script_copy",
    semibold: Platform.OS == "ios" ? "Dancing Script" : "Dancing_Script_copy",
  },
  StackeBoarder: {
    medium: Platform.OS == "ios" ? "SKATEBOARDER" : "Skateboarder-mL439",
    bold: Platform.OS == "ios" ? "SKATEBOARDER" : "Skateboarder-mL439",
    regular: Platform.OS == "ios" ? "SKATEBOARDER" : "Skateboarder-mL439",
    semibold: Platform.OS == "ios" ? "SKATEBOARDER" : "Skateboarder-mL439",
  },
  Simple: {
    medium: "Sarabun-Medium",
    bold: "Sarabun-Bold",
    regular: "Sarabun-Light",
    semibold: "Sarabun-SemiBold",
  },
  FeltCondolences: {
    medium:
      Platform.OS == "ios" ? "Felt Condolences_" : "FeltCondolences-3zV06",
    bold: Platform.OS == "ios" ? "Felt Condolences_" : "FeltCondolences-3zV06",
    regular:
      Platform.OS == "ios" ? "Felt Condolences_" : "FeltCondolences-3zV06",
    semibold:
      Platform.OS == "ios" ? "Felt Condolences_" : "FeltCondolences-3zV06",
  },
};

export const font = {
  medium: () =>
    FontFamily().style == "Simple"
      ? "Sarabun-Medium"
      : FontFamily().style == "Dancing Script"
      ? Fonts.Dancing.medium
      : FontFamily().style == "Skateboarder"
      ? Fonts.StackeBoarder.medium
      : FontFamily().style == "FeltCondolences"
      ? Fonts.FeltCondolences.medium
      : "Sarabun-Medium",
  bold: () =>
    FontFamily().style == "Simple"
      ? "Sarabun-Bold"
      : FontFamily().style == "Dancing Script"
      ? Fonts.Dancing.bold
      : FontFamily().style == "Skateboarder"
      ? Fonts.StackeBoarder.bold
      : FontFamily().style == "FeltCondolences"
      ? Fonts.FeltCondolences.bold
      : "Sarabun-Bold",
  regular: () =>
    FontFamily().style == "Simple"
      ? "Sarabun-Light"
      : FontFamily().style == "Dancing Script"
      ? Fonts.Dancing.regular
      : FontFamily().style == "Skateboarder"
      ? Fonts.StackeBoarder.regular
      : FontFamily().style == "FeltCondolences"
      ? Fonts.FeltCondolences.regular
      : "Sarabun-Light",
  semibold: () =>
    FontFamily().style == "Simple"
      ? "Sarabun-SemiBold"
      : FontFamily().style == "Dancing Script"
      ? Fonts.Dancing.semibold
      : FontFamily().style == "Skateboarder"
      ? Fonts.StackeBoarder.semibold
      : FontFamily().style == "FeltCondolences"
      ? Fonts.FeltCondolences.semibold
      : "Sarabun-SemiBold",
};
