package com.tokee;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class NotificationActionService extends Service {

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.hasExtra("action")) {
            String action = intent.getStringExtra("action");
            System.out.println("Action received: " + action);

            // Send the action to React Native using LocalBroadcastManager
            Intent broadcastIntent = new Intent("NotificationAction");
            broadcastIntent.putExtra("action", action);
            LocalBroadcastManager.getInstance(this).sendBroadcast(broadcastIntent);
//            ReactContext reactContext = getReactInstanceManager().getCurrentReactContext();
//
//            reactContext
//                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                    .emit("notificationEvent", params);
        }

        // Stop the service once the action is processed
        stopSelf();
        return START_NOT_STICKY;
    }
}
