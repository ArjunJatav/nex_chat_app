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

////////


// props.checked === "englandTheme"
// ? "#5770A8"
// : props.checked === "americaTheme"
// ? "#0F3343"
// : props.checked === "indiaTheme"
// ? COLORS.primary_light_green
// : props.checked === "usindepTheme"
// ? "#1A255B"
// : props.checked === "mexicoTheme"
// ? "#003422"
// : props.checked === "mongoliaTheme"
// ? "#07050C"
// : props.checked === "newYearTheme"
// ? "#CE9D59" //@ts-ignore
// : props.checked === "newYear"
// ? COLORS.black
// : //@ts-ignore
// props.checked === "christmas"
// ? COLORS.primary_light_green




const themeColors = {
  americaTheme: {
    theme_background: "#A30025",
    premiumScreen: "#FBE3A7",
    premiumBackIcon: "#0F3343",
    chatTop: "#A30025",
  },
  englandTheme: {
    theme_background: "#DC4C4D",
    premiumScreen: "#EDF3FF",
    premiumBackIcon: "#2D4C92",
    chatTop: "#DC4C4D",
  },
  indiaTheme: {
    theme_background: "#D55434",
    premiumScreen: "#F5D7C9",
    premiumBackIcon: COLORS.primary_light_green,
    chatTop: "#D55434",
  },
  mexicoTheme: {
    theme_background: "#D9D29A",
    premiumScreen: "#D9D29A",
    premiumBackIcon: "#002000",
    chatTop: "#D9D29A",
  },
  usindepTheme: {
    theme_background: "#BC003C",
    premiumScreen: "#C6D9D0",
    premiumBackIcon: "#1A255B",
    chatTop: "#BC003C",
  },
  mongoliaTheme: {
    theme_background: "#D1EFED",
    premiumScreen: "#D1EFED",
    premiumBackIcon: "#8D3E2D",
    chatTop: "#D1EFED",
  },
  newYearTheme: {
    theme_background: "#372F4C",
    premiumScreen: "#FBEDC8",
    premiumBackIcon: "#372F4C",
    chatTop: "#372F4C",
  },
  newYear: {
    theme_background: COLORS.newYear_theme,
    premiumScreen: "#FBEDC8",
    premiumBackIcon: "#07050C",
    chatTop: "#FFF9D8",
  },
  christmas: {
    theme_background: COLORS.christmas_red,
    premiumScreen: "#C6D9D0",
    premiumBackIcon:COLORS.primary_light_green,
    chatTop: "#FFFEF6",
  },
  third: {
    theme_background: COLORS.light_pink,
    premiumScreen: COLORS.light_pink,
    premiumBackIcon: COLORS.light_green,
    chatTop: COLORS.light_pink,
  },
  second: {
    theme_background: COLORS.primary_blue_light,
    premiumScreen: COLORS.primary_blue_light,
    premiumBackIcon:COLORS.primary_blue,
    chatTop: COLORS.primary_blue_light,
  },
  default: {
    theme_background: COLORS.yellow,
    premiumScreen: COLORS.yellow,
    premiumBackIcon:COLORS.purple,
    chatTop: COLORS.yellow,
  },
};

export const themeModule = () => {
  const selectedTheme =
    themeColors[globalThis.selectTheme] || themeColors.default;

  return {
    theme_background: selectedTheme.theme_background,
    chatTop: selectedTheme.chatTop || themeColors.default.chatTop,
    premiumScreen:selectedTheme.premiumScreen || themeColors.default.premiumScreen,
    premiumBackIcon:selectedTheme.premiumBackIcon || themeColors.default.premiumBackIcon
  };
};

const themIconColors = {
  americaTheme: {
    iconColor: "#0F3343",
    textColorForNew: "#0F3343",
    iconColorNew: "#0F3343",
    text_color: "#0F3343",
  },
  englandTheme: {
    iconColor: "#2D4C92",
    textColorForNew: "#2D4C92",
    iconColorNew: "#2D4C92",
    text_color: "#2D4C92",
  },
  indiaTheme: {
    iconColor: "#D55434",
    textColorForNew: "#BE473C",
    iconColorNew: "#D55434",
    text_color:COLORS.black,
  },
  mexicoTheme: {
    iconColor: "#076D4A",
    textColorForNew: "#076D4A",
    iconColorNew: "#5C5300",
    text_color: "#5C5300",
  },
  usindepTheme: {
    iconColor: "#1A255B",
    textColorForNew: "#BC003C",
    iconColorNew: "#1A255B",
    text_color: "#1A255B",
  },
  mongoliaTheme: {
    iconColor: "#8D3E2D",
    textColorForNew: "#8D3E2D",
    iconColorNew: "#8D3E2D",
    text_color: "#8D3E2D",
  },
  newYearTheme: {
    iconColor: "#CE9D59",
    textColorForNew: "#CE9D59",
    iconColorNew: "#CE9D59",
    text_color: "#CE9D59",
  },
  newYear: {
    iconColor: COLORS.newYear_theme,
    textColorForNew: COLORS.newYear_theme,
    iconColorNew: COLORS.newYear_theme,
    text_color: COLORS.newYear_theme,
  },
  christmas: {
    iconColor: COLORS.primary_light_green,
    textColorForNew: COLORS.primary_light_green,
    iconColorNew: COLORS.primary_light_green,
    text_color: COLORS.primary_light_green,
  },
  third: {
    iconColor: COLORS.dark_pink,
    textColorForNew: COLORS.dark_pink,
    iconColorNew: COLORS.dark_pink,
    text_color: COLORS.dark_pink,
  },
  second: {
    iconColor: COLORS.primary_blue,
    textColorForNew: COLORS.primary_blue,
    iconColorNew: COLORS.primary_blue,
    text_color: COLORS.primary_blue,
  },
  default: {
    iconColor: COLORS.purple,
    textColorForNew: COLORS.purple,
    iconColorNew: COLORS.purple,
    text_color: COLORS.purple,
  },
};

export const iconTheme = () => {
  const selectedTheme =
    themIconColors[globalThis.selectTheme] || themIconColors.default;

  return {
    iconColor: selectedTheme.iconColor,
    textColorForNew: selectedTheme.textColorForNew,
    iconColorNew: selectedTheme.iconColorNew,
    text_color: selectedTheme.text_color,
  };
};

const themeBackgrounds = {
  englandTheme: "#2D4C92",
  americaTheme: "#0F3343",
  indiaTheme: "#fff",
  usindepTheme: "#1A255B",
  mongoliaTheme: "#8D3E2D",
  mexicoTheme: "#F6F9EC",
  newYearTheme: "#FFEDBF",
  newYear: "#FFF9D8",
  christmas: "#F2E6D9",
  third: COLORS.light_pink,
  second: COLORS.primary_blue_light,
  default: COLORS.yellow,
};

const textColors = {
  englandTheme: "#2D4C92",
  americaTheme: "#0F3343",
  indiaTheme: "#BE473C",
  usindepTheme: "#1A255B",
  mongoliaTheme: "#8D3E2D",
  mexicoTheme: "#003422",
  newYearTheme: COLORS.white,
  newYear: COLORS.white,
  christmas: COLORS.white,
  default: COLORS.black,
};

const loginButtons = {
  englandTheme: "#DC4C4D",
  americaTheme: "#C91228",
  indiaTheme: "#BE473C",
  usindepTheme: "#BC003C",
  mexicoTheme: "#076D4A",
  mongoliaTheme: "#8D3E2D",
  newYearTheme: "#FFEDBF",
  newYear: "#FDCC46",
  christmas: "#F2E6D9",
  third: COLORS.dark_pink,
  second: COLORS.primary_blue,
  default: COLORS.purple,
};

export const loginthemeModule = () => {
  const theme_background =
    themeBackgrounds[globalThis.selectTheme] || themeBackgrounds.default;
  const textColor = textColors[globalThis.selectTheme] || textColors.default;
  const loginButton =
    loginButtons[globalThis.selectTheme] || loginButtons.default;

  return {
    theme_background,
    textColor,
    loginButton,
  };
};

const themeIconColors = {
  usindepTheme: "#FFFFFF",
  mexicoTheme: "#003422",
  mongoliaTheme: "#8D3E2D",
  newYearTheme: COLORS.white,
  newYear: COLORS.white,
  christmas: COLORS.white,
  third: COLORS.dark_pink,
  second: COLORS.primary_blue,
  englandTheme: "#FFFFFF",
  americaTheme: "#FFFFFF",
  indiaTheme: "#FFFFFF",
  default: COLORS.purple,
};

export const appBarIconTheme = () => {
  const selectedTheme =
    themeIconColors[globalThis.selectTheme] || themeIconColors.default;

  return {
    iconColor: selectedTheme,
  };
};

const themeTextColors = {
  englandTheme: "#2D4C92",
  americaTheme: "#0F3343",
  indiaTheme: "#BE473C",
  usindepTheme: "#1A255B",
  mexicoTheme: "#076D4A",
  mongoliaTheme: "#8D3E2D",
  newYearTheme: "#CE9D59",
  newYear: COLORS.newYear_theme,
  christmas: COLORS.primary_light_green,
  third: COLORS.dark_pink,
  second: COLORS.primary_blue,
  default: COLORS.purple,
};

export const textTheme = () => {
  const selectedTheme =
    themeTextColors[globalThis.selectTheme] || themeTextColors.default;

  return {
    textColor: selectedTheme,
  };
};


const themeColors1 = {
  englandTheme: ["#FF9093", "#812D2E"],
  americaTheme: ["#FF88A2", "#892A3D"],
  indiaTheme: ["#FFA793", "#B5442C"],
  usindepTheme:["#7890FF", "#253379"],
  mexicoTheme: ["#BBFFE8", "#35735D"],
  mongoliaTheme:["#FFB6A7", "#8E3F31"],
  newYearTheme: ["#FFC68F", "#302943"],
  newYear: ["#FFC68F", "#C9762C"],
  christmas: ["#BDFFE8", "#387E6E"],
  third:["#FFC0E4", "#AE407E"],
  second:  ["#7890FF", "#253379"],
  default: ["#D2B4DE", "#912B99"],
};

export const gredient = () => {
  const selectedTheme =
    themeColors1[globalThis.selectTheme] || themeColors1.default;

  return {
    BackColor: selectedTheme,
  };
};


const AlertColor = {
  englandTheme: ["#FF9093", "#812D2E"],
  americaTheme: ["#FF88A2", "#892A3D"],
  indiaTheme: ["#FFA793", "#B5442C"],
  usindepTheme:["#97a7f0", "#697cdb"],
  mexicoTheme: ["#BBFFE8", "#35735D"],
  mongoliaTheme:["#FFB6A7", "#8E3F31"],
  newYearTheme: ["#c7c3bf", "#dba779"],
  newYear: ["#c7c3bf", "#dba779"],
  christmas: ["#BDFFE8", "#387E6E"],
  third:["#FFC0E4", "#AE407E"],
  second:  ["#bdc5f0", "#6378e0"],
  default: ["#D2B4DE", "#b65cbd"],
};

export const CustomModel = () => {
  const selectedTheme =
  AlertColor[globalThis.selectTheme] || AlertColor.default;

  return {
    BackColor: selectedTheme,
  };
};

const appBarTextColors = {
  americaTheme: {
    textColor: "#fff",
    signUpText: "#0F3343",
  },
  englandTheme: {
    textColor: "#fff",
    signUpText: "#2D4C92",
  },
  indiaTheme: {
    textColor: "#fff",
    signUpText: "#5B0000",
  },
  usindepTheme: {
    textColor: "#FFFFFF",
    signUpText: "#1A255B",
  },
  mongoliaTheme: {
    textColor: "#8D3E2D",
    signUpText: "#8D3E2D",
  },
  mexicoTheme: {
    textColor: "#003422",
    signUpText: "#003422",
  },
  newYearTheme: {
    textColor: COLORS.white,
    signUpText: COLORS.white,
  },
  newYear: {
    textColor: COLORS.white,
    signUpText: COLORS.white,
  },
  christmas: {
    textColor: COLORS.white,
    signUpText: COLORS.white,
  },
  third: {
    textColor: COLORS.dark_pink,
    signUpText: COLORS.dark_pink,
  },
  second: {
    textColor: COLORS.primary_blue,
    signUpText: COLORS.primary_blue,
  },
  default: {
    textColor: COLORS.purple,
    signUpText: COLORS.purple,
  },
};

export const appBarText = () => {
  const selectedTheme =
    appBarTextColors[globalThis.selectTheme] || appBarTextColors.default;

  return {
    textColor: selectedTheme.textColor,
    signUpText: selectedTheme.signUpText,
  };
};

const themeSearchBarColors = {
  americaTheme: {
    iconColor: "#0F3343",
    placeHolder: "#0F3343",
    back_ground: "#B9C9CA",
    model_ground: "#B9C9CA",
  },
  englandTheme: {
    iconColor: "#5770A8",
    placeHolder: "#5770A8",
    back_ground: "#E1E4E8",
    model_ground: "#E1E4E8",
  },
  indiaTheme: {
    iconColor: "#976D00",
    placeHolder: "#976D00",
    back_ground: "#FEF2D0",
    model_ground: "#FEF2D0",
  },
  mexicoTheme: {
    iconColor: "#5C5300",
    placeHolder: "#5C5300",
    back_ground: "#F6F2CD",
    model_ground: "#F6F2CD",
  },
  usindepTheme: {
    iconColor: "#BC003C",
    placeHolder: "#BC003C",
    back_ground: "#FBD8D4",
    model_ground: "#FBD8D4",
  },
  mongoliaTheme: {
    iconColor: "#8D3E2D",
    placeHolder: "#8D3E2D",
    back_ground: "#FDF1E9",
    model_ground: "#FDF1E9",
  },
  newYearTheme: {
    iconColor: "#CE9D59",
    placeHolder: "#CE9D59",
    back_ground: "#FFF9D8",
    model_ground: "#FFF9D8",
  },
  newYear: {
    iconColor: COLORS.newYear_theme,
    placeHolder: COLORS.newYear_theme,
    back_ground: "#FFF9D8",
    model_ground: "#FFF9D8",
  },
  christmas: {
    iconColor: COLORS.primary_light_green,
    placeHolder: COLORS.primary_light_green,
    back_ground: "#FFF9D8",
    model_ground: "#FFF9D8",
  },
  third: {
    iconColor: "#ED89C0",
    placeHolder: "#ED89C0",
    back_ground: "#F0E0F1",
    model_ground: "#F0E0F1",
  },
  second: {
    iconColor: "#ABA8F7",
    placeHolder: "#ABA8F7",
    back_ground: "#F0E0F1",
    model_ground: "#F0E0F1",
  },
  default: {
    iconColor: "#CD98D1",
    placeHolder: "#CD98D1",
    back_ground: "#F0E0F1",
    model_ground: "#F0E0F1",
  },
};

export const searchBar = () => {
  const selectedTheme =
    themeSearchBarColors[globalThis.selectTheme] ||
    themeSearchBarColors.default;

  return {
    iconColor: selectedTheme.iconColor,
    placeHolder: selectedTheme.placeHolder,
    back_ground: selectedTheme.back_ground,
    model_ground: selectedTheme.model_ground,
  };
};

const themeWallpaperColors = {
  americaTheme: "#0F3343",
  indiaTheme: "#976D00",
  englandTheme: "#5770A8",
  mexicoTheme: "#076D4A",
  usindepTheme: "#1A255B",
  mongoliaTheme: "#8D3E2D",
  newYearTheme: "#372F4C",
  newYear: "#E88E34",
  christmas: "#437971",
  third: COLORS.dark_pink,
  second: COLORS.primary_blue,
  default: COLORS.purple,
};

export const setWallpaper = () => {
  const selectedTheme =
    themeWallpaperColors[globalThis.selectTheme] ||
    themeWallpaperColors.default;

  return {
    iconColor: selectedTheme,
  };
};

const backgroundColors = {
  americaTheme: "#FFF9D8",
  indiaTheme: "#FFF9D8",
  englandTheme: "#C0C9DE",
  usindepTheme: COLORS.white,
  mexicoTheme: "#EA9344",
  mongoliaTheme: "#F7CFB5",
  newYearTheme: "#FBEDC8",
  newYear: "#FFF9D8",
  christmas: "#C6D9D0",
  third: COLORS.light_pink,
  second: COLORS.white,
  default: COLORS.yellow,
};

export const afterLogin = () => {
  const back_ground =
    backgroundColors[globalThis.selectTheme] || backgroundColors.default;

  return {
    back_ground,
  };
};

const chatTopBackgrounds = {
  americaTheme: "#FFFEFF",
  indiaTheme: "#FFFEFF",
  englandTheme: "#FFFEFF",
  usindepTheme: COLORS.white,
  mexicoTheme: COLORS.white,
  mongoliaTheme: COLORS.white,
  newYearTheme: "#FBEDC8",
  newYear: "#FFF9D8",
  christmas: COLORS.white,
  third: COLORS.light_pink,
  second: COLORS.primary_blue_light,
  default: COLORS.yellow,
};

export const chatTop = () => {
  const back_ground =
    chatTopBackgrounds[globalThis.selectTheme] || chatTopBackgrounds.default;

  return {
    back_ground,
  };
};

const chatBackgroundColors = {
  americaTheme: "#C91228",
  indiaTheme: "#D55434",
  englandTheme: "#C91228",
  mexicoTheme: "#5C5300",
  usindepTheme: "#BC003C",
  mongoliaTheme: "#F7CFB5",
  newYearTheme: "#FBEDC8",
  newYear: "#FFEF92",
  christmas: "#C6D9D0",
  third: "#ED89C0",
  second: "#E6E5FD",
  default: "#F6EB7A",
};

export const chat = () => {
  const back_ground_color =
    chatBackgroundColors[globalThis.selectTheme] ||
    chatBackgroundColors.default;

  return {
    back_ground_color,
  };
};

const chatContainerBackgrounds = {
  americaTheme: "#0F3343",
  indiaTheme: "#FDD672",
  englandTheme: "#5770A8",
  usindepTheme: "#1A255B",
  newYear: "#FFF9D8",
  christmas: "#C6D9D0",
  third: COLORS.white,
  second: COLORS.white,
  default: "#F0E0F1",
};

export const chatContainer = () => {
  const back_ground =
    chatContainerBackgrounds[globalThis.selectTheme] ||
    chatContainerBackgrounds.default;

  return {
    back_ground,
  };
};

const backgroundColorDs = {
  americaTheme: "#FFFEFF",
  indiaTheme: "#FFFEFF",
  englandTheme: "#FFFEFF",
  mexicoTheme: "#F6F9EC",
  usindepTheme: "#FFFEF6",
  mongoliaTheme: "#FDF1E9",
  newYearTheme: COLORS.white,
  newYear: "#FFF9D8",
  christmas: COLORS.white,
  third: "#FFC8E6",
  second: "#FCF1FF",
  default: COLORS.white,
};

const chatTextColors = {
  americaTheme: "#1F2024",
  indiaTheme: "#1F2024",
  englandTheme: "#1F2024",
  mexicoTheme: COLORS.white,
  usindepTheme: COLORS.white,
  mongoliaTheme: COLORS.black,
  newYearTheme: COLORS.black,
  newYear: COLORS.black,
  christmas: COLORS.black,
  third: COLORS.black,
  second: COLORS.black,
  default: COLORS.black,
};

export const chatOther = () => {
  const back_ground_color =
    backgroundColorDs[globalThis.selectTheme] || backgroundColorDs.default;
  const chatTextColor =
    chatTextColors[globalThis.selectTheme] || chatTextColors.default;

  return {
    back_ground_color,
    chatTextColor,
  };
};

const imagePaths = {
  americaTheme: require("../../Assets/Image/America_chat_back.png"),
  indiaTheme: require("../../Assets/Image/India_chat_background.png"),
  englandTheme: require("../../Assets/Image/England_chat_back.png"),
  mexicoTheme: require("../../Assets/Image/mexico_Chat_Back.png"),
  usindepTheme: require("../../Assets/Image/us_back_chat.png"),
  mongoliaTheme: require("../../Assets/Image/Mongolia_chat_Back.png"),
  newYearTheme: require("../../Assets/Image/newYearChatImage.png"),
  newYear: require("../../Assets/Image/newyeartheme.png"),
  christmas: require("../../Assets/Image/cristmaschattheme.png"),
  third: require("../../Assets/Image/OldThemeChatBack.png"),
  second: require("../../Assets/Image/OldThemeChatBack.png"),
  default: require("../../Assets/Image/OldThemeChatBack.png"),
};

export const chatImage = () => {
  const Image = imagePaths[globalThis.selectTheme] || imagePaths.default;
  return { Image };
};



const headerGet = {
  mongoliaTheme: require("../../Assets/Image/MongoliaHeader.png"),
  mexicoTheme: require("../../Assets/Image/Mexicoheader.png"),
  americaTheme: require("../../Assets/Image/AmericaHeader.png"),
  englandTheme: require("../../Assets/Image/EnglandHeader.png"),
  indiaTheme: require("../../Assets/Image/IndiaHeader.png"),
  usindepTheme: require("../../Assets/Image/USndependenceDayHeader.png"),
  christmas: require("../../Assets/Image/ChristmasHeader.png"),
  newYear: require("../../Assets/Image/HallowenHeader.png"),
  newYearTheme: require("../../Assets/Image/HallowenHeader.png"),
  second: require("../../Assets/Image/USndependenceDayHeader.png"),
  default: require("../../Assets/Image/bg_remove.png"),
};

export const premiumBack = () => {
  const Image = headerGet[globalThis.selectTheme] || headerGet.default;
  return { Image };
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
        ? "#437971"
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
