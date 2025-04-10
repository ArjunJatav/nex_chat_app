import React, { useContext } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import ThemeContext from "../ThemeContext/ThemeContext";
import { StatusBarColor } from "../../Navigation/Icons";
interface CommonContainerProps {
  children: React.ReactNode;
  statusBar: any;
  statusBarColr: any;
  safeAreaColr: any;
}

const MainComponent: React.FC<CommonContainerProps> = ({
  children,
  safeAreaColr,
  
}) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: safeAreaColr }}>
       <StatusBar
        barStyle={StatusBarColor().barStyle} // Light icons (time, battery, Wi-Fi)
        backgroundColor="#000"    // Status bar background color
      />
      <View style={styles.container}>
        <View>{children}</View>
      </View>
    </SafeAreaView>
  );
};
export default MainComponent;
const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    backgroundColor: "#fff",
  },
});
