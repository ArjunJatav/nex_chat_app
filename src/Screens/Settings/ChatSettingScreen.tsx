import React, { useState } from "react";
import {  Platform, View } from "react-native";
import MainComponent from "../../Components/MainComponent/MainComponent";
import { themeModule } from "../../Components/Colors/Colors";
import { LoaderModel } from "../Modals/LoaderModel";
import CustomStatusBar from "../../Components/CustomStatusBar/CustomStatusBar";
import TopBar from "../../Components/TopBar/TopBar";
const isDarkMode = true;

 // eslint-disable-next-line
export default function ChatSettingScreen({ navigation }: any) {
    const [loaderModel, setloaderModel] = useState(false);


    return(
        <MainComponent
      statusBar="#000"
      statusBarColr="#000"
      safeAreaColr={themeModule().theme_background}
    >
<LoaderModel
        visible={loaderModel}
        onRequestClose={() => setloaderModel(false)}
        cancel={() => setloaderModel(false)}
      />
       <View
        style={{
          position: "relative",
          backgroundColor: themeModule().theme_background,
        }}
      >
        {/* // **********  Status Bar    ********** // */}
        {Platform.OS == "android" ? (
          <CustomStatusBar
            barStyle={isDarkMode ? "dark-content" : "dark-content"}
            backgroundColor={themeModule().theme_background}
          />
        ) : null}

<TopBar
          showTitleForBack={true}
          title={"Chat Setting Screen"}
          backArrow={true}
          navState={navigation}
          checked={
            globalThis.selectTheme
          }
         
        />
        </View>
    </MainComponent>
    )
}