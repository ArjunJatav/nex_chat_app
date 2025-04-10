package com.tokee;

import android.app.Activity;
import android.view.View;
import android.view.inputmethod.InputMethodManager;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import io.stipop.Stipop;

public class StipopModule extends ReactContextBaseJavaModule {

    public StipopModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "StipopModule";
    }

    @ReactMethod
    public void connect(String userID) {
        StipopClass.getInstance().connect(getReactApplicationContext(), userID);
    }

    @ReactMethod
    public void show(Boolean isKeyboardVisible, Boolean isStipopShowing, Callback callback){
        // Show the Stipop
        Stipop.Companion.show();

        // Check if keyboard is visible
        if (isKeyboardVisible) {
            // Check if Stipop is showing
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
    }

    // Method to hide the keyboard
    private void hideKeyboard(Activity activity) {
        if (activity != null) {
        
            InputMethodManager imm = (InputMethodManager) activity.getSystemService(Activity.INPUT_METHOD_SERVICE);
           imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0);

        }
    }

    @ReactMethod
    public void addListener(String eventName) {
    }

    @ReactMethod
    public void removeListeners(Integer count) {
    }
}
