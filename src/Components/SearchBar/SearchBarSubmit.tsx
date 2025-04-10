import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, searchBar } from "../Colors/Colors";
import { font } from "../Fonts/Font";
import ThemeContext from "../ThemeContext/ThemeContext";

export default function SearchBarSubmit({ search, value, clickCross, placeHolder,searchsubmit }: any) {
  const { colorTheme } = useContext(ThemeContext);
  const [searchValue, setvalue] = useState(value);
  const { t, i18n } = useTranslation();

  const styles = StyleSheet.create({
    seachContainer: {
      marginTop: 0,
      borderRadius: 20,
      fontFamily: font.bold(),
      backgroundColor: searchBar().back_ground,
      flexDirection: "row",
      width: "100%",
    },
    searchIcon: {
      borderRadius: 20,
      borderWidth: 1,
      marginLeft: 10,
      height: 45,
      justifyContent: "center",
      alignItems: "center",
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
    crossedIcon: {
      borderRadius: 20,
      borderWidth: 1,
      marginLeft: 10,
      height: 45,
      justifyContent: "center",
      alignItems: "center",
      borderColor: "transparent",
      flexDirection: "row",
      width: "10%",
    },
    searchfIcon: {
      height: 20,
      width: 20,
      tintColor: searchBar().iconColor,
    },
    crossIcon: {
      height: 15,
      width: 15,
      tintColor: searchBar().iconColor,
    },
    searchText: {
      flexDirection: "column",
      justifyContent: "center",
      width: "70%",
    },
    enterText: {
      color: COLORS.black,
      marginLeft: 10,
      fontSize: 15,
      width: "100%",
      fontFamily: font.regular(),
    },
  });
  return (
    <View style={styles.seachContainer}>
      <View style={styles.searchIcon}>
        <Image
          source={require("../../Assets/Icons/Search.png")}
          style={styles.searchfIcon}
        />
      </View>
      <View style={styles.searchText}>
        <TextInput
          value={value}
          onChangeText={search}
          style={styles.enterText}
       
          placeholderTextColor={  searchBar().placeHolder
          }
          placeholder={placeHolder }
          returnKeyType='search'
          onSubmitEditing={(text)=>searchsubmit(value)}

        />
      </View>
      {value == "" ? null : (
        <TouchableOpacity
          style={styles.crossedIcon}
          onPress={() => clickCross()}
        >
          <Image
            source={require("../../Assets/Icons/Cross.png")}
            style={styles.crossIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
