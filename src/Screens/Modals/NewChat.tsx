import React, { useContext, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import ThemeContext from "../../Components/ThemeContext/ThemeContext";

export default function NewChat({ navigation }: any) {
  const windowHeight = Dimensions.get("window").height;
  const { colorTheme } = useContext(ThemeContext);
  const [fistHide, setFistHide] = useState(true);
  const [secondHide, setsecondHide] = useState(false);
  const [thirdHide, setthirdHide] = useState(false);
  const [forthHide, setforthHide] = useState(false);
  const [value, setvalue] = useState("Second");
  const buttonPress = () => {
    navigation.navigate("AfterLogin");
  };

  const handler = () => {
    setFistHide(false);
    setsecondHide(true);
    setvalue("Third");
    setthirdHide(false);
  };
  const handler2nd = () => {
    setFistHide(false);
    setsecondHide(false);
    setthirdHide(true);
    setvalue("Forth");
  };

  const handler3rd = () => {
    setFistHide(false);
    setsecondHide(false);
    setthirdHide(false);
    setforthHide(true);
    setvalue("Fifth");
  };
  const handler4th = () => {
    setFistHide(false);
    setsecondHide(false);
    setthirdHide(false);
    setforthHide(false);
    setvalue("end");
  };
  const modelPress = () => {
    if (value == "Third") {
      handler2nd();
    } else if (value == "Forth") {
      handler3rd();
    } else if (value == "Fifth") {
      buttonPress();
    } else if (value == "Second") {
      handler();
    } else if (value == "end") {
      navigation.navigate("BottomBar");
    } else {
      setFistHide(false);
      setsecondHide(false);
      setthirdHide(false);
    }
  };

  const styles = StyleSheet.create({
    mainContainer: {
      height: "100%",
      width: "100%",
      backgroundColor: "blue",
    },
  });

  return <View></View>;
}
