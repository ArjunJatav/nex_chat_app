import DeviceInfo from "react-native-device-info";
import { COLORS } from "../Components/Colors/Colors";
import { Platform } from "react-native";


const themeIconPaths = {
  indiaTheme: {
    ChatIcon: require("../Assets/Icons/Chat-active_INdia.png"),
    CallIcon: require("../Assets/Icons/Calls-activeIndia.png"),
    StatusIcon: require("../Assets/Icons/IndiaExplore.png"),
    SettingIcon: require("../Assets/Icons/Settings-activeIndia.png"),
  },
  americaTheme: {
    ChatIcon: require("../Assets/Icons/Chat-active.png"),
    CallIcon: require("../Assets/Icons/Calls-active.png"),
    StatusIcon: require("../Assets/Icons/AmericaeXPLORE.png"),
    SettingIcon: require("../Assets/Icons/Settings-active.png"),
  },
  englandTheme: {
    ChatIcon: require("../Assets/Icons/Chat-activeEngland.png"),
    CallIcon: require("../Assets/Icons/Calls-activeEnglang.png"),
    StatusIcon: require("../Assets/Icons/EnglandExplore.png"),
    SettingIcon: require("../Assets/Icons/Settings-activeEngland.png"),
  },
  mongoliaTheme: {
    ChatIcon: require("../Assets/Icons/Chat_MG_active.png"),
    CallIcon: require("../Assets/Icons/Call_MG_active.png"),
    StatusIcon: require("../Assets/Icons/MongoliaExplore.png"),
    SettingIcon: require("../Assets/Icons/Setting_MG_active.png"),
  },
  usindepTheme: {
    ChatIcon: require("../Assets/Icons/us_chat_Active.png"),
    CallIcon: require("../Assets/Icons/Call_us_active.png"),
    StatusIcon: require("../Assets/Icons/USIndependenceday.png"),
    SettingIcon: require("../Assets/Icons/Setting_us_active.png"),
  },
  mexicoTheme: {
    ChatIcon: require("../Assets/Icons/Chat_mexico.png"),
    CallIcon: require("../Assets/Icons/Call_MG_active.png"),
    StatusIcon: require("../Assets/Icons/MexicoExplore.png"),
    SettingIcon: require("../Assets/Icons/Setting_mexico.png"),
  },
  newYearTheme: {
    ChatIcon: require("../Assets/Icons/Chats_NY_active.png"),
    CallIcon: require("../Assets/Icons/Calls_NY_active.png"),
    StatusIcon: require("../Assets/Icons/NewYearExplore.png"),
    SettingIcon: require("../Assets/Icons/Settings_NY_active.png"),
  },
  newYear: {
    ChatIcon: require("../Assets/Icons/chat_newYear.png"),
    CallIcon: require("../Assets/Icons/call_newYear.png"),
    StatusIcon: require("../Assets/Icons/HallowenExplore.png"),
    SettingIcon: require("../Assets/Icons/setting_newYear.png"),
  },
  christmas: {
    ChatIcon: require("../Assets/Icons/chat_icon_christmas.png"),
    CallIcon: require("../Assets/Icons/call_icon_christmas.png"),
    StatusIcon: require("../Assets/Icons/ChristmasExplore.png"),
    SettingIcon: require("../Assets/Icons/setting_icon_christmas.png"),
  },
  third: {
    ChatIcon: require("../Assets/Icons/ChatBottom.png"),
    CallIcon: require("../Assets/Icons/CallBottom.png"),
    StatusIcon: require("../Assets/Icons/explore.png"),
    SettingIcon: require("../Assets/Icons/SettingBottom.png"),
  },
  second: {
    ChatIcon: require("../Assets/Icons/ChatBottom.png"),
    CallIcon: require("../Assets/Icons/CallBottom.png"),
    StatusIcon: require("../Assets/Icons/explore.png"),
    SettingIcon: require("../Assets/Icons/SettingBottom.png"),
  },
  default: {
    ChatIcon: require("../Assets/Icons/ChatBottom.png"),
    CallIcon: require("../Assets/Icons/CallBottom.png"),
    StatusIcon: require("../Assets/Icons/explore.png"),
    SettingIcon: require("../Assets/Icons/SettingBottom.png"),
  },
};

export const bottomTab = () => {
  const selectedTheme = themeIconPaths[globalThis.selectTheme] || themeIconPaths.default;

  return {
    ChatIcon: selectedTheme.ChatIcon,
    CallIcon: selectedTheme.CallIcon,
    StatusIcon: selectedTheme.StatusIcon,
    SettingIcon: selectedTheme.SettingIcon,
  };
};


const bottomTextColors = {
  englandTheme: "#CB365E",
  americaTheme: "#A30025",
  indiaTheme: "#002000",
  usindepTheme: "#A30025",
  mexicoTheme: "#002000",
  mongoliaTheme: "#8D3E2D",
  newYearTheme: "#F0973F",
  newYear: COLORS.newYear_theme,
  christmas: COLORS.christmas_red,
  third: COLORS.dark_pink,
  second: COLORS.primary_blue,
  default: COLORS.purple,
};

export const bottomText = () => {
  const textColor = bottomTextColors[globalThis.selectTheme] || bottomTextColors.default;

  return {
    textColor,
  };
};


const barStyles = {
  lightThemes: ["englandTheme", "americaTheme", "indiaTheme", "usindepTheme", "newYearTheme", "christmas"],
  darkThemes: ["mexicoTheme", "mongoliaTheme", "third", "second", "default"],
};

export const StatusBarColor = () => {
  const theme = globalThis.selectTheme;
  const barStyle = barStyles.lightThemes.includes(theme)
    ? "light-content"
    : "dark-content";

  return { barStyle };
};

const bottomIconTintColors = {
  third: COLORS.dark_pink,
  second: COLORS.primary_blue,
  first: COLORS.purple,
};


export const bottomIcon = () => {
  const tintColor = bottomIconTintColors[globalThis.selectTheme] || undefined;

  return {
    tintColor,
  };
};

const logoImages = {
  newYearTheme: require("../Assets/Logo/Logo.png"),
  newYear: require("../Assets/Logo/Logo.png"),
  christmas: require("../Assets/Logo/CristmasLogo.png"),
  third: require("../Assets/Logo/Logo.png"),
  second: require("../Assets/Logo/Logo.png"),
  first: require("../Assets/Logo/Logo.png"),
  default:require("../Assets/Logo/Logo.png")
 
};

const splashLogos = {
  third: require("../Assets/Logo/Logo.png"),
  second: require("../Assets/Logo/Logo.png"),
  first: require("../Assets/Logo/Logo.png"),
};

const tintColors = {
  englandTheme: "#FFF",
  americaTheme: "#FBE3A7",
  indiaTheme: "#D55434",
  usindepTheme: COLORS.white,
  mexicoTheme: "#076D4A",
  mongoliaTheme: COLORS.white,
  newYearTheme: "#F0973F",
  newYear: "#E88E34",
  christmas: undefined,
  third: COLORS.dark_pink,
  second: COLORS.primary_blue,
  first: COLORS.purple,
};

export const logoIcon = () => {
  const logoPng = logoImages[globalThis.selectTheme] || logoImages.default;
  const logoSplash = splashLogos[globalThis.selectTheme] || splashLogos.default;
  const tintColor = tintColors[globalThis.selectTheme] || tintColors.default;

  return {
    logoPng,
    logoSplash: logoSplash !== undefined ? logoSplash : undefined,
    tintColor,
  };
};



const splashImages = {
  indiaTheme: require("../Assets/Logo/India_Splash_Image.png"),
  americaTheme: require("../Assets/Logo/America_Splash_Image.png"),
  englandTheme: require("../Assets/Logo/England_splash_image.png"),
  usindepTheme: require("../Assets/Logo/Us_Independ_Splash.png"),
  mongoliaTheme: require("../Assets/Logo/Mongolia_theme_splash.png"),
  mexicoTheme: require("../Assets/Logo/Mexico_Theme_Splash.png"),
  newYearTheme: require("../Assets/Logo/NewYearSplash.png"),
  newYear: require("../Assets/Logo/HelloweenSplash.png"),
  christmas: require("../Assets/Logo/ChristmasSplash.png"),
  third: require("../Assets/Logo/PinkthemeSplash.png"),
  second: require("../Assets/Logo/BluethemeSplash.png"),
  first: require("../Assets/Logo/PurplethemeSplash.png"),
};

export const splashBackgroundImage = () => {
  const selectedSplash = splashImages[globalThis.selectTheme] || splashImages.default;

  return {
    splash: selectedSplash,
  };
};


const settingImage = {
  indiaTheme: require("../Assets/Icons/IndiaThemeTop.png"),
  americaTheme: require("../Assets/Icons/americaThemeTop.png"),
  englandTheme: require("../Assets/Icons/EnglandThemeTop.png"),
  usindepTheme: require("../Assets/Icons/us_top_back.png"),
  mexicoTheme: require("../Assets/Icons/top_mexico.png"),
  mongoliaTheme: require("../Assets/Icons/mongoliaTheme_top.png"),
  newYearTheme: require("../Assets/Icons/SettingPageNewYearTheme.png"),
  newYear: require("../Assets/Icons/NewYearSetting.png"),
  christmas: require("../Assets/Icons/SettingChristmas.png"),
  third: undefined,
  second: undefined,
  first: undefined,
};




export const settingTop = () => {
  return {
    BackGroundImage: settingImage[globalThis.selectTheme],
  };
};

const chatImage = {
  indiaTheme: require("../Assets/Icons/IndiaThemeTop.png"),
  americaTheme: require("../Assets/Icons/americaThemeTop.png"),
  englandTheme: require("../Assets/Icons/EnglandThemeTop.png"),
  usindepTheme: require("../Assets/Icons/us_top_back.png"),
  mexicoTheme: require("../Assets/Icons/top_mexico.png"),
  mongoliaTheme: require("../Assets/Icons/mongoliaTheme_top.png"),
  newYearTheme: require("../Assets/Icons/chatNewYearPage.png"),
  newYear: require("../Assets/Icons/ChatNewYear.png"),
  christmas: require("../Assets/Icons/ChatChristmas.png"),
  third: undefined,
  second: undefined,
  first: undefined,
};
export const chatTop = () => {
  // Calculate top margin based on the platform and notch presence
  const topPosition = Platform.OS === 'ios' 
    ? (DeviceInfo.hasNotch() ? -60 : -40)
    : (DeviceInfo.hasNotch() ? 0 : -40);

  return {
    BackGroundImage: chatImage[globalThis.selectTheme],
    top: topPosition,  // Return dynamic top position here
  };
};


const callImage = {
  indiaTheme: require("../Assets/Icons/IndiaThemeTop.png"),
  americaTheme: require("../Assets/Icons/americaThemeTop.png"),
  englandTheme: require("../Assets/Icons/EnglandThemeTop.png"),
  usindepTheme: require("../Assets/Icons/us_top_back.png"),
  mexicoTheme: require("../Assets/Icons/top_mexico.png"),
  mongoliaTheme: require("../Assets/Icons/mongoliaTheme_top.png"),
  newYearTheme: require("../Assets/Icons/CallPageNewYear.png"),
  newYear: require("../Assets/Icons/CallNewYear.png"),
  christmas: require("../Assets/Icons/CallChristmas.png"),
  third: undefined,
  second: undefined,
  first: undefined,
};



export const callTop = () => {
  return {
    BackGroundImage: callImage[globalThis.selectTheme],
  };
};


const statusImage = {
  indiaTheme: require("../Assets/Icons/IndiaThemeTop.png"),
  americaTheme: require("../Assets/Icons/americaThemeTop.png"),
  englandTheme: require("../Assets/Icons/EnglandThemeTop.png"),
  usindepTheme: require("../Assets/Icons/us_top_back.png"),
  mexicoTheme: require("../Assets/Icons/top_mexico.png"),
  mongoliaTheme: require("../Assets/Icons/mongoliaTheme_top.png"),
  newYearTheme: require("../Assets/Icons/StatusPageNewYear.png"),
  newYear: require("../Assets/Icons/StatusNewYear.png"),
  christmas: require("../Assets/Icons/StatusChristmas.png"),
  third: undefined,
  second: undefined,
  first: undefined,
};
export const statusTop = () => {
  return {
    BackGroundImage: statusImage[globalThis.selectTheme],
  };
};


const noDataImages = {
  indiaTheme:require("../Assets/Image/IndiaNoDataIcon.png"),
  americaTheme:require("../Assets/Image/AmericaNoData.png"),
  englandTheme:require("../Assets/Image/EnglandNoData.png"),
  usindepTheme: require("../Assets/Image/us_noData_theme.png"),
  mexicoTheme: require("../Assets/Image/mexico_No_Data.png"),
  mongoliaTheme: require("../Assets/Image/mongolia_noData.png"),
  newYearTheme: require("../Assets/Image/newyear.png"),
  newYear: require("../Assets/Image/hallowee.png"),
  christmas: require("../Assets/Image/christmas.png"),
  third: require("../Assets/Image/normal.png"),
  second: require("../Assets/Image/normal.png"),
  first: require("../Assets/Image/normal.png"),
};

export const noDataImage = () => {
  const selectedImage = noDataImages[globalThis.selectTheme] || noDataImages.default;

  return {
    Image: selectedImage,
  };
};
