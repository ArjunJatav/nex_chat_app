import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StatusBar, SafeAreaView } from "react-native";
const CustomStatusBar = ({ backgroundColor, ...props }) => {
 
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ height: StatusBar.currentHeight || top,backgroundColor: backgroundColor }}>
      <SafeAreaView style={{backgroundColor: backgroundColor }}>
        <StatusBar translucent    backgroundColor="transparent" {...props} />
      </SafeAreaView>
    </View>
  );
};
export default CustomStatusBar;
