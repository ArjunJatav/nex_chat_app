import React, { useContext } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import ThemeContext from "../ThemeContext/ThemeContext";
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
