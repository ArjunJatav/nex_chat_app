package com.deucetek.tokee;

import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {

    private static final String TAG = "MainActivity";

    @Override
    protected String getMainComponentName() {
        return "Tokee";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
        Log.d(TAG, "onCreate called");

        // Handle notification tap when app is launched from killed state
        handleIntent(getIntent());
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Log.d(TAG, "onNewIntent called");
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent != null) {
            if (intent.hasExtra("notificationData")) {
                String notificationData = intent.getStringExtra("notificationData");
                Log.d(TAG, "Received notification data: " + notificationData);
                sendEventToJS(notificationData);
            } else {
                Log.d(TAG, "No notificationData found in intent");
            }

            if (intent.hasExtra("action")) {
                String action = intent.getStringExtra("action");
                Log.d(TAG, "Received action: " + action);
                handleAction(action);
            }
        }
    }

    private void handleAction(String action) {
        switch (action) {
            case "ANSWER_CALL":
                Log.d(TAG, "Answer button clicked");
                // Handle answer call logic
                break;
            case "CANCEL_CALL":
                Log.d(TAG, "Cancel button clicked");
                // Handle cancel call logic
                break;
            default:
                Log.d(TAG, "Unknown action received");
                break;
        }
    }

    public void sendEventToJS(String eventData) {
        ReactContext reactContext = getReactInstanceManager().getCurrentReactContext();
        if (reactContext != null) {
            Log.d(TAG, "Sending event to JS: " + eventData);

            new CountDownTimer(1000, 1000) {
                public void onTick(long millisUntilFinished) {
                    Log.d("CountDown", "Seconds remaining: " + millisUntilFinished / 1000);
                }

                public void onFinish() {
                    Log.d("CountDown", "Countdown finished!");
                    WritableMap params = Arguments.createMap();
                    params.putString("event", eventData);
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("notificationEvent", params);
                }
            }.start();
        } else {
            Log.e(TAG, "React context is null, unable to send event to JS");
        }
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
                this,
                getMainComponentName(),
                DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "onStart called");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume called");
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause called");
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "onStop called");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy called");
    }
}
