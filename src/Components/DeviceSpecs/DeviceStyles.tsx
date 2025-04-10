import DeviceInfo from "react-native-device-info";

export const FontSize = {
  font: DeviceInfo.isTablet() ? 25 : 16,
  titleFont: DeviceInfo.isTablet() ? 34 : 24,
  iconSize: DeviceInfo.isTablet() ? 35 : 25,
  bottomTabFont: DeviceInfo.isTablet() ? 18 : 14,
};

export const IconSize = {
  bottomTabIcon: DeviceInfo.isTablet() ? 25 : 20,
};
