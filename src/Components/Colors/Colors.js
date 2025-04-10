export const COLORS = {
  yellow: "#F4EB8A",
  purple: "#9C31A3",
  black: "#0f0f0f",
  primary_blue_light: "#FCF1FF",
  primary_blue: "#5652EF",
  light_blue: "#ABA8F7",
  grey: "#a69c9c",
  white: "#ffffff",
  light_purple: "#F0E0F1",
  light_yellow: "#CD98D1",
  light_black: "#404249",
  yellow_light: "#F6EB7A",
  secondry_blue: "#E6E5FD",
  light_pink: "#FFC8E6",
  light_green: "#63E798",
  dark_pink: "#CF1886",
  primary_green: "#C6D9D0",
  primary_light_green: "#437971",
  christmas_red: "#B92519",
  christmas_yellow: "#FFF9D8",
  newYear_yellow: "#FFEF92",
  newYear_light_yellow: "#FDCC46",
  newYear_theme: "#E88E34",
  lightgrey: "#DEDBDA",
};

export const themeModule = () => {
  return {
    theme_background:
      globalThis.selectTheme === "mexicoTheme"
        ? "#D9D29A"
        : globalThis.selectTheme === "usindepTheme"
        ? "#BC003C"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#D1EFED"
        : globalThis.selectTheme === "newYearTheme"
        ? "#372F4C"
        : globalThis.selectTheme === "newYear"
        ? COLORS.newYear_theme
        : globalThis.selectTheme === "christmas"
        ? COLORS.christmas_red
        : globalThis.selectTheme === "third"
        ? COLORS.light_pink
        : globalThis.selectTheme === "second"
        ? COLORS.primary_blue_light
        : COLORS.yellow,

    chatTop:
      globalThis.selectTheme === "newYear"
        ? "#FFF9D8;"
        : globalThis.selectTheme === "christmas"
        ? "#FFFEF6"
        : globalThis.selectTheme === "third"
        ? COLORS.light_pink
        : globalThis.selectTheme === "second"
        ? COLORS.primary_blue_light
        : COLORS.yellow,
  };
};

export const loginthemeModule = () => {
  return {
    theme_background:
      globalThis.selectTheme === "usindepTheme"
        ? "#1A255B"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "mexicoTheme"
        ? "#F6F9EC"
        : globalThis.selectTheme === "newYearTheme"
        ? "#FFEDBF"
        : globalThis.selectTheme === "newYear"
        ? "#FFF9D8"
        : globalThis.selectTheme === "christmas"
        ? "#F2E6D9"
        : globalThis.selectTheme === "third"
        ? COLORS.light_pink
        : globalThis.selectTheme === "second"
        ? COLORS.primary_blue_light
        : COLORS.yellow,

    textColor:
      globalThis.selectTheme === "usindepTheme"
        ? "#1A255B"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "mexicoTheme"
        ? "#003422"
        : globalThis.selectTheme === "newYearTheme"
        ? COLORS.white
        : globalThis.selectTheme === "newYear"
        ? COLORS.white
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : COLORS.black,
    loginButton:
      globalThis.selectTheme === "usindepTheme"
        ? "#BC003C"
        : globalThis.selectTheme === "mexicoTheme"
        ? "#076D4A"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#FFEDBF"
        : globalThis.selectTheme === "newYear"
        ? "#FDCC46"
        : globalThis.selectTheme === "christmas"
        ? "#F2E6D9"
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};

export const iconTheme = () => {
  return {
    iconColor:
      globalThis.selectTheme === "mexicoTheme"
        ? "#076D4A"
        : globalThis.selectTheme === "usindepTheme"
        ? "#1A255B"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#CE9D59"
        : globalThis.selectTheme === "newYear"
        ? COLORS.newYear_theme
        : globalThis.selectTheme === "christmas"
        ? COLORS.primary_light_green
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
    textColorForNew:
      globalThis.selectTheme === "mexicoTheme"
        ? "#076D4A"
        : globalThis.selectTheme === "usindepTheme"
        ? "#BC003C"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#CE9D59"
        : globalThis.selectTheme === "newYear"
        ? COLORS.newYear_theme
        : globalThis.selectTheme === "christmas"
        ? COLORS.primary_light_green
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
    iconColorNew:
      globalThis.selectTheme === "mexicoTheme"
        ? "#5C5300"
        : globalThis.selectTheme === "usindepTheme"
        ? "#BC003C"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#CE9D59"
        : globalThis.selectTheme === "newYear"
        ? COLORS.newYear_theme
        : globalThis.selectTheme === "christmas"
        ? COLORS.primary_light_green
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};

export const appBarIconTheme = () => {
  return {
    iconColor:
      globalThis.selectTheme === "usindepTheme"
        ? "#FFFFFF"
        : globalThis.selectTheme === "mexicoTheme"
        ? "#003422"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? COLORS.white
        : globalThis.selectTheme === "newYear"
        ? COLORS.white
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};

export const textTheme = () => {
  return {
    textColor:
      globalThis.selectTheme === "usindepTheme"
        ? "#1A255B"
        : globalThis.selectTheme === "mexicoTheme"
        ? "#076D4A"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#CE9D59"
        : globalThis.selectTheme === "newYear"
        ? COLORS.newYear_theme
        : globalThis.selectTheme === "christmas"
        ? COLORS.primary_light_green
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};

export const appBarText = () => {
  return {
    textColor:
      globalThis.selectTheme === "usindepTheme"
        ? "#FFFFFF"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "mexicoTheme"
        ? "#003422"
        : globalThis.selectTheme === "newYearTheme"
        ? COLORS.white
        : globalThis.selectTheme === "newYear"
        ? COLORS.white
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,

    signUpText:
      globalThis.selectTheme === "usindepTheme"
        ? "#1A255B"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "mexicoTheme"
        ? "#003422"
        : globalThis.selectTheme === "newYearTheme"
        ? COLORS.white
        : globalThis.selectTheme === "newYear"
        ? COLORS.white
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};

export const searchBar = () => {
  return {
    iconColor:
      globalThis.selectTheme === "mexicoTheme"
        ? "#5C5300"
        : globalThis.selectTheme === "usindepTheme"
        ? "#BC003C"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#CE9D59"
        : globalThis.selectTheme === "newYear"
        ? COLORS.newYear_theme
        : globalThis.selectTheme === "christmas"
        ? COLORS.primary_light_green
        : globalThis.selectTheme == "third"
        ? "#ED89C0"
        : globalThis.selectTheme == "second"
        ? "#ABA8F7"
        : "#CD98D1",

    placeHolder:
      globalThis.selectTheme === "mexicoTheme"
        ? "#5C5300"
        : globalThis.selectTheme === "usindepTheme"
        ? "#BC003C"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#CE9D59"
        : globalThis.selectTheme === "newYear"
        ? COLORS.newYear_theme
        : globalThis.selectTheme === "christmas"
        ? COLORS.primary_light_green
        : globalThis.selectTheme == "third"
        ? "#ED89C0"
        : globalThis.selectTheme == "second"
        ? "#ABA8F7"
        : "#CD98D1",

    back_ground:
      globalThis.selectTheme === "mexicoTheme"
        ? "#F6F2CD"
        : globalThis.selectTheme === "usindepTheme"
        ? "#FBD8D4"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#FDF1E9"
        : globalThis.selectTheme === "newYearTheme"
        ? "#FFF9D8"
        : globalThis.selectTheme === "newYear"
        ? "#FFF9D8"
        : globalThis.selectTheme === "christmas"
        ? "#FFF9D8"
        : "#F0E0F1",
  };
};

export const chat = () => {
  return {
    back_ground_color:
      globalThis.selectTheme === "mexicoTheme"
        ? "#5C5300"
        : globalThis.selectTheme === "usindepTheme"
        ? "#BC003C"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#F7CFB5"
        : globalThis.selectTheme === "newYearTheme"
        ? "#FBEDC8"
        : globalThis.selectTheme === "newYear"
        ? "#FFEF92"
        : globalThis.selectTheme === "christmas"
        ? "#C6D9D0"
        : globalThis.selectTheme == "third"
        ? "#ED89C0"
        : globalThis.selectTheme == "second"
        ? "#E6E5FD"
        : "#F6EB7A",
  };
};

export const chatOther = () => {
  return {
    back_ground_color:
      globalThis.selectTheme === "mexicoTheme"
        ? "#F6F9EC"
        : globalThis.selectTheme === "usindepTheme"
        ? "#FFFEF6"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#FDF1E9"
        : globalThis.selectTheme === "newYearTheme"
        ? COLORS.white
        : globalThis.selectTheme === "newYear"
        ? "#FFF9D8"
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : globalThis.selectTheme == "third"
        ? "#FFC8E6"
        : globalThis.selectTheme == "second"
        ? "#FCF1FF"
        : COLORS.white,

    chatTextColor:
      globalThis.selectTheme === "mexicoTheme"
        ? COLORS.white
        : globalThis.selectTheme === "usindepTheme"
        ? COLORS.white
        : globalThis.selectTheme === "mongoliaTheme"
        ? COLORS.black
        : globalThis.selectTheme === "newYearTheme"
        ? COLORS.black
        : globalThis.selectTheme === "newYear"
        ? COLORS.black
        : globalThis.selectTheme === "christmas"
        ? COLORS.black
        : globalThis.selectTheme == "third"
        ? COLORS.black
        : globalThis.selectTheme == "second"
        ? COLORS.black
        : COLORS.black,
  };
};

export const chatImage = () => {
  return {
    Image:
      globalThis.selectTheme === "mexicoTheme"
        ? require("../../Assets/Image/mexico_Chat_Back.png")
        : globalThis.selectTheme === "usindepTheme"
        ? require("../../Assets/Image/us_back_chat.png")
        : globalThis.selectTheme === "mongoliaTheme"
        ? require("../../Assets/Image/Mongolia_chat_Back.png")
        : globalThis.selectTheme === "newYearTheme"
        ? require("../../Assets/Image/newYearChatImage.png")
        : globalThis.selectTheme === "newYear"
        ? require("../../Assets/Image/newyeartheme.png")
        : globalThis.selectTheme === "christmas"
        ? require("../../Assets/Image/cristmaschattheme.png")
        : globalThis.selectTheme == "third"
        ? require("../../Assets/Image/OldThemeChatBack.png")
        : globalThis.selectTheme == "second"
        ? require("../../Assets/Image/chat_backgroung_blueTheme.png")
        : require("../../Assets/Image/OldThemeChatBack.png"),
  };
};

export const chatTop = () => {
  return {
    back_ground:
      globalThis.selectTheme === "usindepTheme"
        ? COLORS.white
        : globalThis.selectTheme === "mexicoTheme"
        ? COLORS.white
        : globalThis.selectTheme === "mongoliaTheme"
        ? COLORS.white
        : globalThis.selectTheme === "newYearTheme"
        ? "#FBEDC8"
        : globalThis.selectTheme === "newYear"
        ? "#FFF9D8"
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : globalThis.selectTheme === "third"
        ? COLORS.light_pink
        : globalThis.selectTheme === "second"
        ? COLORS.primary_blue_light
        : COLORS.yellow,
  };
};

export const afterLogin = () => {
  return {
    back_ground:
      globalThis.selectTheme === "usindepTheme"
        ? COLORS.white
        : globalThis.selectTheme === "mexicoTheme"
        ? "#EA9344"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#F7CFB5"
        : globalThis.selectTheme === "newYearTheme"
        ? "#FBEDC8"
        : globalThis.selectTheme === "newYear"
        ? "#FFF9D8"
        : globalThis.selectTheme === "christmas"
        ? "#C6D9D0"
        : globalThis.selectTheme === "third"
        ? COLORS.light_pink
        : globalThis.selectTheme === "second"
        ? COLORS.white
        : COLORS.yellow,
  };
};

export const chatContainer = () => {
  return {
    back_ground:
      //@ts-ignore
      globalThis.selectTheme == "usindepTheme"
        ? "#1A255B"
        : globalThis.selectTheme === "newYear"
        ? "#FFF9D8"
        : globalThis.selectTheme === "christmas"
        ? "#C6D9D0"
        : globalThis.selectTheme === "third"
        ? COLORS.white
        : globalThis.selectTheme === "second"
        ? COLORS.white
        : "#F0E0F1",
  };
};
export const setWallpaper = () => {
  return {
    iconColor:
      globalThis.selectTheme === "mexicoTheme"
        ? "#076D4A"
        : globalThis.selectTheme === "usindepTheme"
        ? "#1A255B"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#372F4C"
        : globalThis.selectTheme === "newYear"
        ? "#E88E34"
        : globalThis.selectTheme === "christmas"
        ? "#437971"
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};
export const QrTokee = () => {
  return {
    iconColor:
      globalThis.selectTheme === "mexicoTheme"
        ? "#076D4A"
        : globalThis.selectTheme === "usindepTheme"
        ? COLORS.white
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#CE9D59"
        : globalThis.selectTheme === "newYear"
        ? COLORS.white
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
        qrbackgroundColor:
        globalThis.selectTheme === "mexicoTheme"
        ? "#076D4A"
        : globalThis.selectTheme === "usindepTheme"
        ? "#1A255B"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#8D3E2D"
        : globalThis.selectTheme === "newYearTheme"
        ? "#CE9D59"
        : globalThis.selectTheme === "newYear"
        ? "#FFF9D8"
        : globalThis.selectTheme === "christmas"
        ?  "#437971"
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : "#f5d74a",
        qrbackgroundiconColor:
        globalThis.selectTheme === "mexicoTheme"
        ? "#fff"
        : globalThis.selectTheme === "usindepTheme"
        ? "#fff"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#fff"
        : globalThis.selectTheme === "newYearTheme"
        ? "#fff"
        : globalThis.selectTheme === "newYear"
        ? "#fff"
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : globalThis.selectTheme == "third"
        ? "#fff"
        : globalThis.selectTheme == "second"
        ? "#fff"
        : COLORS.purple,
        qrbackgroundtextColor:
        globalThis.selectTheme === "mexicoTheme"
        ? "#fff"
        : globalThis.selectTheme === "usindepTheme"
        ? "#fff"
        : globalThis.selectTheme === "mongoliaTheme"
        ? "#fff"
        : globalThis.selectTheme === "newYearTheme"
        ? "#fff"
        : globalThis.selectTheme === "newYear"
        ? "#fff"
        : globalThis.selectTheme === "christmas"
        ? "#fff"
        : globalThis.selectTheme == "third"
        ? "#fff"
        : globalThis.selectTheme == "second"
        ? "#fff"
        : "#000",
  };
};
