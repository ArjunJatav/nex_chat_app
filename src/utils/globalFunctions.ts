import {
  Dimensions,
  ImageRequireSource,
  ImageSourcePropType,
  Linking,
  Platform,
} from "react-native";
import { hasNotch } from "react-native-device-info";
import { images } from "./constants/assets";

enum PLATFORMS {
  IOS = "ios",
  ANDROID = "android",
}

export const isAndroid = () => {
  return Platform.OS === PLATFORMS.ANDROID;
};

export const isIos = () => {
  return Platform.OS === PLATFORMS.IOS;
};

export const dimensions = () => ({
  screen_width: Dimensions.get("screen").width,
  screen_height: Dimensions.get("screen").height,
  window_width: Dimensions.get("window").width,
  window_height: Dimensions.get("window").height,
});

export const elevationShadowStyle = (
  // eslint-disable-next-line
  elevation?: any,
  shadowColor = "#EB5581",
  offsetWidth = 0,
  offsetHeight = 0.5,
  opacity = 1
) => {
  return {
    elevation,
    shadowColor: shadowColor,
    shadowOffset: {
      width: offsetWidth,
      height: offsetHeight || 0.5 * elevation,
    },
    shadowOpacity: opacity,
    shadowRadius: elevation * 0.5,
  };
  /**  Optmization Util  */
};

export const emptyFunction = () => {};

// eslint-disable-next-line
export const objToFormData = (rawData: any) => {
  const formData: FormData = new FormData();
  if (rawData && rawData != null && typeof rawData === "object") {
    // eslint-disable-next-line
    Object.keys(rawData).map((key: any) => {
      formData.append(key, rawData[key]);
    });
  }
  return formData;
};

// eslint-disable-next-line
export const isNotEmpty = (data: any) => {
  return (
    data !== null &&
    data !== undefined &&
    data !== "" &&
    (typeof data === "object" ? Object.keys(data).length > 0 : true)
  );
};

// eslint-disable-next-line
export const isNotEmptyText = (text: any) => {
  return text ? true : false;
};

// eslint-disable-next-line
export const logOnConsole = (...arg: any) => {
  if (__DEV__) {
    console.log(arg);
  }
};

export const checkNotch = hasNotch();
export const handleNotchDimens = () => (hasNotch() ? 40 : 25);
export const getImageSource = (
  url: string | ImageRequireSource
): ImageSourcePropType => {
  const temp =
    // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
    url && typeof url === "string" ? { uri: url } : url ? url : images.tickIcon;

  return temp;
};
// eslint-disable-next-line
export const convertHexToRGBA = (hexCode: any, opacity: number) => {
  let hex = hexCode.replace("#", "");

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r},${g},${b},${opacity / 100})`;
};

export const CapitalizeStr = (str: string) => {
  return str?.charAt(0)?.toUpperCase() + str?.slice(1);
};

export const getNumberWithIsd = (mobileNum: string) => {
  if (!mobileNum) {
    return;
  }
};

export const handleCancelSubscription = async (skuId: string) => {
  const managePaymentIOS13Url = "https://apps.apple.com/account/subscriptions";
  const managePaymentIOSUrl =
    "https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions";

  const majorVersionIOS = parseInt(String(Platform.Version), 13);
  let url: string = "";
  if (isIos())
    url = majorVersionIOS > 12 ? managePaymentIOS13Url : managePaymentIOSUrl;
  else
    (url = `https://play.google.com/store/account/subscriptions?package=au.com.rockt.mobile.app&sku=${skuId}`),
      console.log(url);
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error("Failed to open URL:", error);
        // Handle the error appropriately, e.g., show a notification to the user
      }
};

export const formatElapsedTime = (duration: number) => {
  const elapsedTimeInSeconds = Math.round(duration / 1000);
  const minutes = Math.floor(elapsedTimeInSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsedTimeInSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};
