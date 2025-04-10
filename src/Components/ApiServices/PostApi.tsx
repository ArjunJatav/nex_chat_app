import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { t } from "i18next";
import { Base_Url } from "../../Constant/Api";
import { showToast } from "../CustomToast/Action";

let isSessionExpired = false;

export const PostApiCall = async (
  apiUrl: string,
  apiData,
  headerData,
  navigation,
  successCallback: (ResponseData, ErrorStr) => void
) => {
  const urlStr = Base_Url + apiUrl;
  console.log("api url >>", apiUrl);
  try {
    await axios({
      method: "post",
      url: urlStr,
      headers: headerData,
      data: apiData,
    })
      .then((response) => {
        console.log("in response", response.data);
        if (response.data.status == true) {
          successCallback(response.data, null);
        } else {
          // const errorMessage = response.data.message
          // successCallback(null, errorMessage);

          if (apiUrl == "user/check-force-update") {
            successCallback(null, response.data);
          } else {
            const errorMessage = response.data.message;
            successCallback(null, errorMessage);
            //console.log("api error status false>",response.data)
          }
        }
      })
      .catch(async (error) => {
        console.log("api error>", error.response.data);
        if (error.response.status === 401) {
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

            successCallback(null, t("sessionExpired"));
          }
        } else {
          successCallback(null, t("serverError"));
        }
      });
  } catch (error) {
    console.log("errrrrr", error);
  }
};
