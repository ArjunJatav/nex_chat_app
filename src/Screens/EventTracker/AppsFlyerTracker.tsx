import appsFlyer from 'react-native-appsflyer';

export const AppsFlyerTracker = (eventName, eventValues, userId) => {
  // Set a global user ID if provided


  
  if (userId != null) {
    appsFlyer?.setCustomerUserId(userId);
  }

  // Log the event with AppsFlyer
  appsFlyer?.logEvent(
    eventName,
    eventValues,
    (res) => {
      console.log(`Event "${eventName}" tracked successfully:`, res);
    },
    (err) => {
      console.error(`Error tracking event "${eventName}":`, err);
    }
  );
};