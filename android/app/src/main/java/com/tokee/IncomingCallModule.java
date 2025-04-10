package com.tokee;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

import com.deucetek.tokee.MainActivity;
import com.deucetek.tokee.R;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class IncomingCallModule extends ReactContextBaseJavaModule {

    private static final String CHANNEL_ID = "call_channel";

    public IncomingCallModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "IncomingCall";
    }

    @ReactMethod
    public void showIncomingCallNotification(ReadableMap notificationData) {
        Context context = getReactApplicationContext();
        if (context == null) {
            // Handle the error (e.g., log it or notify the user)
            return;
        }

        String title;
        String message;
        String extraData;

        // Check for null notificationData
        if (notificationData == null) {
            title = "Incoming Call";
            message = "Tap to respond";
            extraData = "IncomingCall";
        } else {
            title = notificationData.hasKey("title") ? notificationData.getString("title") : "Incoming Call";
            message = notificationData.hasKey("message") ? notificationData.getString("message") : "Tap to respond";
            extraData = notificationData.hasKey("extraData") ? notificationData.getString("extraData") : "IncomingCall";
        }

        // Create an intent that will open MainActivity

        Intent intent = new Intent(context, MainActivity.class);
intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
intent.putExtra("notificationData", extraData);

// Clear previous pending intents and create a new one
PendingIntent pendingIntent;
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
} else {
    pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_UPDATE_CURRENT);
}




        // Intent intent = new Intent(context, MainActivity.class);
        // intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        // intent.putExtra("notificationData", extraData);

        // // Create PendingIntent
        // PendingIntent pendingIntent;
        // if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        //     pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);
        // } else {
        //     pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        // }

        // Get NotificationManager
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager == null) {
            // Handle the error
            return;
        }

        // Create notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Incoming Calls", NotificationManager.IMPORTANCE_HIGH);
            notificationManager.createNotificationChannel(channel);
        }

        // Build the notification
        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.test)
                .setContentTitle(title)
                .setContentText(message)
                .setSubText("Tap to respond")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .setFullScreenIntent(pendingIntent, true)
                .setSound(null) // Set to a valid sound URI if needed
                .setTimeoutAfter(60000); // Auto remove the notification when tapped

        // Show the notification
        notificationManager.notify(1, notificationBuilder.build());
    }

    @ReactMethod
    public void removeIncomingCallNotification() {
        Context context = getReactApplicationContext();
        if (context == null) {
            // Handle the error
            return;
        }
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager == null) {
            // Handle the error
            return;
        }
        notificationManager.cancel(1); // Use the same ID used when showing the notification
    }
}
