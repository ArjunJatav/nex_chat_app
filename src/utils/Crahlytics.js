import crashlytics from "@react-native-firebase/crashlytics";
import React, { useEffect } from "react";
import { Button, View } from "react-native";

async function onSignIn(user) {
  crashlytics().log("User signed in.");
  await Promise.all([
    crashlytics().setUserId(user.uid),
    crashlytics().setAttribute("credits", String(user.credits)),
    crashlytics().setAttributes({
      role: "admin",
      followers: "13",
      email: user.email,
      username: user.username,
    }),
  ]);
}

export default function App() {
  useEffect(() => {
    crashlytics().log("App mounted.");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        title="Sign In"
        onPress={() =>
          onSignIn({
            uid: "Aa0Bb1Cc2Dd3Ee4Ff5Gg6Hh7Ii8Jj9",
            username: "Joaquin Phoenix",
            email: "phoenix@example.com",
            credits: 42,
          })
        }
      />
      <Button title="Test Crash" onPress={() => crashlytics().crash()} />
    </View>
  );
}


