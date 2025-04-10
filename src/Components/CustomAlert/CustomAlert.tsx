import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import renderIf from "./Renderif";
import { font } from "../Fonts/Font";
import { COLORS } from "../Colors/Colors";
import { t } from "i18next";

export const CustomAlert = (props: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        {renderIf(
          props.type == "1",

          <View
            style={{
              height: 60,
              width: 60,
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#4EA752",
              borderRadius: 30,
            }}
          >
            <Image
              source={require("../../Assets/Icons/plus.png")}
              style={{ height: 50, width: 50 }}
              resizeMode="contain"
            />
          </View>
        )}

        {renderIf(
          props.type == "2",
          <View
            style={{
              height: 60,
              width: 60,
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#ffd11a",
              borderRadius: 30,
            }}
          >
            <Image
              source={require("../../Assets/Icons/plus.png")}
              style={{ height: 50, width: 50 }}
              resizeMode="contain"
            />
          </View>
        )}

        {renderIf(
          props.type == "3",

          <View
            style={{
              height: 60,
              width: 60,
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "red",
              borderRadius: 30,
            }}
          >
            <Image
              source={require("../../Assets/Icons/plus.png")}
              style={{ height: 40, width: 40 }}
              resizeMode="contain"
            />
          </View>
        )}

        {renderIf(
          props.type == "4",
          <View
            style={{
              height: 60,
              width: 60,
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#4EA752",
              borderRadius: 30,
            }}
          >
            <Image
              source={require("../../Assets/Icons/plus.png")}
              style={{ height: 50, width: 50 }}
              resizeMode="contain"
            />
          </View>
        )}

        {renderIf(
          props.type == "1",
          <Text
            style={[
              styles.alertTitle,
              { marginTop: 22, fontWeight: "bold", fontSize: 22 },
            ]}
          >
            Success!
          </Text>
        )}
        {renderIf(
          props.type == "2",
          <Text
            style={[
              styles.alertTitle,
              { marginTop: 22, fontWeight: "bold", fontSize: 22 },
            ]}
          >
           {t("validation_failed")}
          </Text>
        )}

        {renderIf(
          props.type == "3",
          <Text
            style={[
              styles.alertTitle,
              { marginTop: 22, fontWeight: "bold", fontSize: 22 },
            ]}
          >
            Error!
          </Text>
        )}

        {renderIf(
          props.type == "4",
          <Text
            style={[
              styles.alertTitle,
              { marginTop: 22, fontWeight: "bold", fontSize: 22 },
            ]}
          >
            Confirm!
          </Text>
        )}

        <Text style={[styles.alertTitle, { marginTop: 14, fontSize: 17 }]}>
          {props.message}
        </Text>
        {renderIf(
          props.enum == "single",
          <TouchableOpacity
            style={{
              marginBottom: 20,
              backgroundColor: "#4EA752",
              alignItems: "center",
              justifyContent: "center",
              height: 40,
              paddingHorizontal: 28,
              marginTop: 20,
            }}
            onPress={() =>
              props.popAction == true
                ? props.popNavAction()
                : props.okFunction()
            }
          >
            <Text style={{ fontWeight: "700", color: "#fff", fontSize: 16 }}>
              Ok
            </Text>
          </TouchableOpacity>
        )}

        {renderIf(
          props.enum != "single",
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              paddingHorizontal: 10,
              paddingVertical: 2,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#ffd11a",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                paddingHorizontal: 28,
                marginHorizontal: 10,
              }}
              onPress={() => props.cancelFunction()}
            >
              <Text style={{ fontWeight: "700", color: "#fff", fontSize: 16 }}>
                No
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#4EA752",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                paddingHorizontal: 28,
                marginHorizontal: 10,
              }}
              onPress={() => props.okFunction()}
            >
              <Text style={{ fontWeight: "700", color: "#fff", fontSize: 16 }}>
                Yes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  appNameText: {
    color: COLORS.black,
    fontSize: 18,
    alignSelf: "center",
    fontFamily: font.bold(),
    fontWeight: "bold",
  },
  alertBox: {
    backgroundColor: "#fff",
    width: "80%",
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertTitle: {
    color: "#000",
    fontSize: 16,
    fontFamily: font.regular(),
    marginTop: 6,
  },
});
