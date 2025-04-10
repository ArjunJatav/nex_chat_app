import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { t } from "i18next";
import { Base_Url } from "../../Constant/Api";
import { showToast } from "../CustomToast/Action";

export const PostApiCall = async (
  apiUrl: String,
  apiData: any,
  headerData: any,
  navigation: any,
  successCallback: (ResponseData: any, ErrorStr: any) => void
) => {

  const urlStr = Base_Url + apiUrl;
  try {
    await axios({
      method: "post",
      url: urlStr,
      headers: headerData,
      data: apiData,
    })
      .then((response) => {
        if (response.data.status == true) {
          successCallback(response.data, null);
        } else {
          successCallback(null, response.data.message);
        }
      })
      .catch(async (error) => {
        if (error.response.status === 401) {
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
          successCallback(null, t("sessionExpired"));
        } else {
          successCallback(null, t("serverError"));
        }
      });
  } catch (error) {
    console.log("errrrrr", error);
  }
};
