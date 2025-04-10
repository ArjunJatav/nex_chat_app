// a hook for detecting if app is in foreground or background
//

import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const useAppState = () => {
  const appState = useRef(AppState.currentState);
  // eslint-disable-next-line
  const [appStateVisible, setAppStateVisible] = useState<any>(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
   

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
   

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return appStateVisible;
};

export default useAppState;
