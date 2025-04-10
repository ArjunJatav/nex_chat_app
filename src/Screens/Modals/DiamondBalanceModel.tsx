import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, iconTheme } from "../../Components/Colors/Colors";
import { font } from "../../Components/Fonts/Font";
import { useTranslation } from "react-i18next";
import { GetApiCall } from "../../Components/ApiServices/GetApi";
import { transactionApi } from "../../Constant/Api";
import renderIf from "../../Components/renderIf";

export const DiamondBalanceModal = (props, navigation) => {
  const { t } = useTranslation();
  const [transactionData, setTransactionData] = useState([]);

  const formatDate = (isoString) => {
    console.log("iso string >>>", isoString);

    // Parse the input date string into a Date object
    const dateObj = new Date(isoString);

    // Add 5 hours to the date
    dateObj.setHours(dateObj.getHours() + 5);

    // Format the updated date using toLocaleString
    const formattedDate = dateObj
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");

    console.log("formatted date:", formattedDate);

    return formattedDate;
  };

  useEffect(() => {
    TransactionApiCallling();
  }, []);

  function TransactionApiCallling() {
    const url =
      transactionApi + "?purchase_type=DIAMONDS" + "&transaction_type=Credit";
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + globalThis.Authtoken,
      localization: globalThis.selectLanguage,
    };

    GetApiCall(url, headers, navigation, (ResponseData, ErrorStr) => {
      console.log("api response :;", ResponseData);
      setTransactionData(ResponseData.data.data);
    });
  }
  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      visible={props.visible}
      transparent={true}
      onRequestClose={props.onRequestClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(52, 52, 52, 0.1)" }}
        onPress={() => {
          props.onRequestClose();
        }}
      ></TouchableOpacity>

      <View style={[styles.modal_view, { height: 500 }]}>
        <Text style={styles.heading}>{t("My_diamond_balance")}</Text>
        <View style={styles.mainContainer}>
        <View style={[styles.oneContainer,{width:"50%"}]}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#000",
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: COLORS.black,
                  fontFamily: font.bold(),
                }}
              >
                {t("Type")}
              </Text>
            </View>
          </View>
          <View style={[styles.twoContainer,{width:"50%"}]}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#000",
                alignSelf:"flex-end",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                 color: COLORS.black,
                  fontFamily: font.bold(),
                }}
              >
                {t("Diamonds")}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.oneContainer}>
            <Text
              style={{
                fontSize: 18,
               // color: COLORS.black,
                fontFamily: font.bold(),
              }}
            >
              {t("Free")}
            </Text>
          </View>
          <View style={styles.twoContainer}>
            <Text
              style={{
                fontSize: 15,
                // color: COLORS.black,
                fontFamily: font.bold(),
              }}
            >
              {globalThis.creditedDiamonds}
            </Text>
          </View>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.oneContainer}>
            <Text
              style={{
                fontSize: 18,
               // color: COLORS.black,
                fontFamily: font.bold(),
              }}
            >
              {t("Purchased")}
            </Text>
          </View>
          <View style={[styles.twoContainer, { flexDirection: "row" }]}>
            {renderIf(
              globalThis.purchasedDiamonds != 0,
              <Text
                style={{
                  fontSize: 15,
                  // color: COLORS.black,
                  fontFamily: font.bold(),
                }}
              >
                {globalThis.purchasedDiamonds}
              </Text>
            )}
            {renderIf(
              globalThis.purchasedDiamonds == 0,
              <TouchableOpacity
                style={{ alignItems: "center", justifyContent: "center" }}
                onPress={props.popupPressed}
              >
                <Text style={{ fontSize: 14, color: iconTheme().iconColorNew }}>
                  {t("Topup")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.oneContainer}>
            <Text
              style={{
                fontSize: 18,
                //color: COLORS.black,
                fontFamily: font.bold(),
              }}
            >
              {t("earned_by_social_sharing")}
            </Text>
          </View>
          <View style={styles.twoContainer}>
            <Text
              style={{
                fontSize: 15,
                // color: COLORS.black,
                fontFamily: font.bold(),
              }}
            >
              {globalThis.earnedDiamonds}
            </Text>
          </View>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.oneContainer}>
            <Text
              style={{
                fontSize: 18,
                //color: COLORS.black,
                fontFamily: font.bold(),
              }}
            >
              {t("total")}
            </Text>
          </View>
          <View style={styles.twoContainer}>
            <Text
              style={{
                fontSize: 15,
                // color: COLORS.black,
                fontFamily: font.bold(),
              }}
            >
              {globalThis.DiamondBalance}
            </Text>
          </View>
        </View>

        {renderIf(
          transactionData.length > 0,

          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ fontSize: 18, color: "#000", fontWeight: "800" }}>
              {t("Purchased_History")}
            </Text>
          </View>
        )}

        <FlatList
          data={transactionData}
          renderItem={({ item }) => {
            return (
              <View style={styles.mainContainer}>
                <View style={styles.oneContainer}>
                  <Text>
                    {t("Diamonds_Consumed")}
                    {" :"}
                    {
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      item.diamonds_quantity
                    }
                  </Text>
                  <Text style={{ marginTop: 5 }}>
                    {
                      // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
                      formatDate(item.transactons_date)
                    }
                  </Text>
                </View>
                <View style={styles.twoContainer}></View>
              </View>
            );
          }}
        />
      </View>
    </Modal>
  );
};
export const styles = StyleSheet.create({
  modal: {
    width: "100%",
    marginLeft: 0,
    marginBottom: 0,
  },
  modal_view: {
    width: "100%",
    bottom: 0,
    left: 0,
    right: 0,
    position: "absolute",
    backgroundColor: "#fff",
    borderTopEndRadius: 12,
    borderTopStartRadius: 12,
    elevation: 6,
    shadowColor: COLORS.black,
    shadowOpacity: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 3.5,
  },
  mainContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
  },
  oneContainer: {
    width: "80%",
    justifyContent: "center",
    // backgroundColor:"red"
  },
  twoContainer: {
    width: "20%",
    //  backgroundColor:"blue",
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    color: "#000",
    fontSize: 18,
    alignSelf: "center",
    marginTop: 10,
    fontWeight: "700",
  },
});
