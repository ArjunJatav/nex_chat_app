package com.tokee;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

public class NotificationActionReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("NotificationActionReceiver", "Answer button clicked");

        String action = intent.getAction();

        if ("ACTION_ANSWER".equals(action)) {
            Log.d("NotificationActionReceiver", "Answer button clicked");
            // Here you can call a method to open the call screen or handle the action
            Toast.makeText(context, "Call Answered", Toast.LENGTH_SHORT).show();
            // You can add custom logic like sending event to React Native here
        } else if ("ACTION_CANCEL".equals(action)) {
            Log.d("NotificationActionReceiver", "Cancel button clicked");
            Toast.makeText(context, "Call Cancelled", Toast.LENGTH_SHORT).show();
            // Handle the cancel action, for example dismissing the call or notification
        }
    }
}
