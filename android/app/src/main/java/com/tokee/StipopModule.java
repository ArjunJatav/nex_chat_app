package com.tokee;

import android.app.Activity;
import android.view.inputmethod.InputMethodManager;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import io.stipop.Stipop;

public class StipopModule extends ReactContextBaseJavaModule {

    private static final String TAG = "StipopModule";

    public StipopModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "StipopModule";
    }

    @ReactMethod
    public void connect(String userID) {
        try {
            StipopClass.getInstance().connect(getReactApplicationContext(), userID);
        } catch (Exception e) {
            Log.e(TAG, "Error connecting to Stipop", e);
        }
    }

    @ReactMethod
    public void show(Boolean isKeyboardVisible, Boolean isStipopShowing, Callback callback) {
        try {
            // Show the Stipop
            Stipop.Companion.show();

            // Check if keyboard is visible
            if (isKeyboardVisible) {
                if (isStipopShowing) {
                    // Hide the keyboard
                    hideKeyboard(getCurrentActivity());

                    // Invoke the callback with false to indicate that Stipop is hidden
                    callback.invoke(false);
                } else {
                    // Stipop is not showing, invoke the callback with true
                    callback.invoke(true);
                }
            } else {
                // Keyboard is not visible, invoke the callback with true
                callback.invoke(true);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error showing Stipop", e);
            if (callback != null) {
                callback.invoke(false);
            }
        }
    }

    // Method to hide the keyboard
    private void hideKeyboard(Activity activity) {
        if (activity != null) {
            InputMethodManager imm = (InputMethodManager) activity.getSystemService(Activity.INPUT_METHOD_SERVICE);
            if (imm != null) {
                imm.hideSoftInputFromWindow(activity.getWindow().getDecorView().getWindowToken(), 0);
            } else {
                Log.e(TAG, "InputMethodManager is null");
            }
        } else {
            Log.e(TAG, "Activity is null when trying to hide keyboard");
        }
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Implementation for adding listeners
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Implementation for removing listeners
    }
}
