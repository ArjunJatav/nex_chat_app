import axios from "axios";
import { Base_Url } from "../../Constant/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showToast } from "../CustomToast/Action";
import { t } from "i18next";

let isSessionExpired = false;

export const GetApiCall = async (
  apiUrl: string,
  headerData,
  navigation,
  successCallback: (ResponseData, ErrorStr) => void
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
      .catch(async (error) => {
        console.log("api error>>>>>", error.response.data.message);
        if (error.response.status == 401) {
          if (!isSessionExpired) {
            isSessionExpired = true; // Prevent multiple calls
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

            setTimeout(() => {
              isSessionExpired = false; // Reset after some time
            }, 5000);
          }
        } else {
          successCallback(null, t("serverError"));
        }
      });
  } catch (error) {
    successCallback(null, error.message);
  }
};
