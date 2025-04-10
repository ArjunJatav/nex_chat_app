import axios from "axios";
import { Base_Url } from "../../Constant/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "../CustomToast/Action";
import { t } from "i18next";

export const GetApiCall = async (
  apiUrl: String,
  headerData: any,
  navigation: any,
  successCallback: (ResponseData: any, ErrorStr: any) => void
) => {
  const urlStr = Base_Url + apiUrl;
  try {
   await axios({
      method: "Get",
      url: urlStr,
      headers: headerData,
    })
      .then((response) => {
        if (response.data.status == true) {
          successCallback(response.data, null);
        } else {
          successCallback(null, response.data.message);
        }
      })
      .catch(async (error: any) => {
        if (error.response.status == 401) {
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("userImage");
          await AsyncStorage.removeItem("userName");
          await AsyncStorage.removeItem("chatUserID");
          await AsyncStorage.removeItem("isContactUploaded");
          await AsyncStorage.removeItem("lockChatPinCode");
          await AsyncStorage.removeItem("chatlockusernumber");
          await AsyncStorage.removeItem("isAllContactUploaded");
          await AsyncStorage.removeItem("tokeeContactListTemp");

          showToast(t("sessionExpired"));
          navigation.push("Login");
        } else {
          successCallback(null, t("serverError"));
        }
      });
  } catch (error: any) {
    successCallback(null, error.message);
  }
};
