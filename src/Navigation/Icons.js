import { COLORS } from "../Components/Colors/Colors";

export const bottomTab = () => {
  return {
    ChatIcon:
      globalThis.selectTheme === "mongoliaTheme"
        ? require("../Assets/Icons/Chat_MG_active.png")
        : globalThis.selectTheme === "usindepTheme"
        ? require("../Assets/Icons/us_chat_Active.png")
        : globalThis.selectTheme === "mexicoTheme"
        ? require("../Assets/Icons/Chat_mexico.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Icons/Chats_NY_active.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Icons/chat_newYear.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Icons/chat_icon_christmas.png")
        : globalThis.selectTheme == "third"
        ? require("../Assets/Icons/ChatBottom.png")
        : globalThis.selectTheme == "second"
        ? require("../Assets/Icons/ChatBottom.png")
        : require("../Assets/Icons/ChatBottom.png"),
    CallIcon:
      globalThis.selectTheme === "usindepTheme"
        ? require("../Assets/Icons/Call_us_active.png")
        : globalThis.selectTheme === "mexicoTheme"
        ? require("../Assets/Icons/Call_MG_active.png")
        : globalThis.selectTheme === "mongoliaTheme"
        ? require("../Assets/Icons/Call_MG_active.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Icons/Calls_NY_active.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Icons/call_newYear.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Icons/call_icon_christmas.png")
        : globalThis.selectTheme == "third"
        ? require("../Assets/Icons/CallBottom.png")
        : globalThis.selectTheme == "second"
        ? require("../Assets/Icons/CallBottom.png")
        : require("../Assets/Icons/CallBottom.png"),
    StatusIcon:
      globalThis.selectTheme === "usindepTheme"
        ? require("../Assets/Icons/Shop_us_active.png")
        : globalThis.selectTheme === "mexicoTheme"
        ? require("../Assets/Icons/mexico_shop.png")
        : globalThis.selectTheme === "mongoliaTheme"
        ? require("../Assets/Icons/Status_MG_active.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Icons/Status_NY_active.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Icons/status_newYear.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Icons/status_icon_christmas.png")
        : globalThis.selectTheme == "third"
        ? require("../Assets/Icons/StatusBottom.png")
        : globalThis.selectTheme == "second"
        ? require("../Assets/Icons/StatusBottom.png")
        : require("../Assets/Icons/StatusBottom.png"),
    SettingIcon:
      globalThis.selectTheme === "usindepTheme"
        ? require("../Assets/Icons/Setting_us_active.png")
        : globalThis.selectTheme === "mexicoTheme"
        ? require("../Assets/Icons/Setting_mexico.png")
        : globalThis.selectTheme === "mongoliaTheme"
        ? require("../Assets/Icons/Setting_MG_active.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Icons/Settings_NY_active.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Icons/setting_newYear.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Icons/setting_icon_christmas.png")
        : globalThis.selectTheme == "third"
        ? require("../Assets/Icons/SettingBottom.png")
        : globalThis.selectTheme == "second"
        ? require("../Assets/Icons/SettingBottom.png")
        : require("../Assets/Icons/SettingBottom.png"),
  };
};

export const bottomText = () => {
  return {
    textColor:
    globalThis.selectTheme === "usindepTheme"
        ? "#A30025"
        : globalThis.selectTheme === "mexicoTheme"
        ? "#002000" :
      globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#F0973F"
        : globalThis.selectTheme === "newYear"
        ? COLORS.newYear_theme
        : globalThis.selectTheme === "christmas"
        ? COLORS.christmas_red
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};

export const bottomIcon = () => {
  return {
    tintColor:
    globalThis.selectTheme === "usindepTheme"
    ? undefined
    : globalThis.selectTheme === "mexicoTheme"
    ?  undefined :
      globalThis.selectTheme === "mongoliaTheme"
        ? undefined
        : globalThis.selectTheme === "newYearTheme"
        ? undefined
        : globalThis.selectTheme === "newYear"
        ? undefined
        : globalThis.selectTheme === "christmas"
        ? undefined
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};

export const logoIcon = () => {
  return {
    logoPng:
      globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Logo/Logo.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Logo/Logo.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Logo/CristmasLogo.png")
        : globalThis.selectTheme == "third"
        ? require("../Assets/Logo/Logo.png")
        : globalThis.selectTheme == "second"
        ? require("../Assets/Logo/Logo.png")
        : require("../Assets/Logo/Logo.png"),

    logoSplash:
      globalThis.selectTheme === "newYear"
        ? undefined
        : globalThis.selectTheme === "christmas"
        ? undefined
        : globalThis.selectTheme == "third"
        ? require("../Assets/Logo/Logo.png")
        : globalThis.selectTheme == "second"
        ? require("../Assets/Logo/Logo.png")
        : require("../Assets/Logo/Logo.png"),

    tintColor:
    globalThis.selectTheme == "usindepTheme"
        ?COLORS.white:
      globalThis.selectTheme === "mexicoTheme"
        ? "#076D4A"
        : globalThis.selectTheme === "mongoliaTheme"
        ? COLORS.white
        : globalThis.selectTheme === "newYearTheme"
        ? "#F0973F"
        : globalThis.selectTheme === "newYear"
        ? "#E88E34"
        : globalThis.selectTheme === "christmas"
        ? undefined
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};

export const splashBackgroundImage = () => {
  return {
    splash:
      globalThis.selectTheme == "usindepTheme"
        ? require("../Assets/Logo/Us_Independ_Splash.png"):
      globalThis.selectTheme == "mongoliaTheme"
        ? require("../Assets/Logo/Mongolia_theme_splash.png")
        : globalThis.selectTheme == "mexicoTheme"
        ? require("../Assets/Logo/Mexico_Theme_Splash.png")
        : globalThis.selectTheme == "newYearTheme"
        ? require("../Assets/Logo/NewYearSplash.png")
        : globalThis.selectTheme == "newYear"
        ? require("../Assets/Logo/HelloweenSplash.png")
        : globalThis.selectTheme == "christmas"
        ? require("../Assets/Logo/ChristmasSplash.png")
        : globalThis.selectTheme == "third"
        ? require("../Assets/Logo/PinkthemeSplash.png")
        : globalThis.selectTheme == "second"
        ? require("../Assets/Logo/BluethemeSplash.png")
        : require("../Assets/Logo/PurplethemeSplash.png"),
  };
};

export const settingTop = () => {
  return {
    BackGroundImage:
      globalThis.selectTheme == "usindepTheme"
        ? require("../Assets/Icons/us_top_back.png") :
      globalThis.selectTheme == "mexicoTheme"
        ? require("../Assets/Icons/top_mexico.png")
        : globalThis.selectTheme == "mongoliaTheme"
        ? require("../Assets/Icons/mongoliaTheme_top.png")
        : globalThis.selectTheme == "newYearTheme"
        ? require("../Assets/Icons/SettingPageNewYearTheme.png")
        : globalThis.selectTheme == "newYear"
        ? require("../Assets/Icons/NewYearSetting.png")
        : globalThis.selectTheme == "christmas"
        ? require("../Assets/Icons/SettingChristmas.png")
        : globalThis.selectTheme == "third"
        ? undefined
        : globalThis.selectTheme == "second"
        ? undefined
        : undefined,
  };
};

///StatusPageNewYear.png
export const statusTop = () => {
  return {
    BackGroundImage:
    globalThis.selectTheme == "usindepTheme"
        ? require("../Assets/Icons/us_top_back.png") :
      globalThis.selectTheme == "mexicoTheme"
        ? require("../Assets/Icons/top_mexico.png")
        : globalThis.selectTheme == "mongoliaTheme"
        ? require("../Assets/Icons/mongoliaTheme_top.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Icons/StatusPageNewYear.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Icons/StatusNewYear.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Icons/StatusChristmas.png")
        : globalThis.selectTheme == "third"
        ? undefined
        : globalThis.selectTheme == "second"
        ? undefined
        : undefined,
  };
};

export const callTop = () => {
  return {
    BackGroundImage:
    globalThis.selectTheme == "usindepTheme"
        ? require("../Assets/Icons/us_top_back.png") :
      globalThis.selectTheme == "mexicoTheme"
        ? require("../Assets/Icons/top_mexico.png")
        : globalThis.selectTheme == "mongoliaTheme"
        ? require("../Assets/Icons/mongoliaTheme_top.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Icons/CallPageNewYear.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Icons/CallNewYear.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Icons/CallChristmas.png")
        : globalThis.selectTheme == "third"
        ? undefined
        : globalThis.selectTheme == "second"
        ? undefined
        : undefined,
  };
};
////chatNewYearPage.png
export const chatTop = () => {
  return {
    BackGroundImage:
    globalThis.selectTheme == "usindepTheme"
        ? require("../Assets/Icons/us_top_back.png") :
      globalThis.selectTheme == "mongoliaTheme"
        ? require("../Assets/Icons/mongoliaTheme_top.png")
        : globalThis.selectTheme == "mexicoTheme"
        ? require("../Assets/Icons/top_mexico.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Icons/chatNewYearPage.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Icons/ChatNewYear.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Icons/ChatChristmas.png")
        : globalThis.selectTheme == "third"
        ? undefined
        : globalThis.selectTheme == "second"
        ? undefined
        : undefined,
  };
};

export const noDataImage = () => {
  return {
    Image: 
    globalThis.selectTheme == "usindepTheme"
    ? require("../Assets/Image/us_noData_theme.png") :
    globalThis.selectTheme == "mexicoTheme"
    ? require("../Assets/Image/mexico_No_Data.png") :
      globalThis.selectTheme == "mongoliaTheme"
        ? require("../Assets/Image/mongolia_noData.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../Assets/Image/newyear.png")
        : globalThis.selectTheme === "newYear"
        ? require("../Assets/Image/hallowee.png")
        : globalThis.selectTheme === "christmas"
        ? require("../Assets/Image/christmas.png")
        : globalThis.selectTheme == "third"
        ? require("../Assets/Image/normal.png")
        : globalThis.selectTheme == "second"
        ? require("../Assets/Image/normal.png")
        : require("../Assets/Image/normal.png"),
  };
};
