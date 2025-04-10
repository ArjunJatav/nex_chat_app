How to set up Tokee Code

Prerequisite - Setup react native environment in your system. Below mentioned are essential things required to run the apps in your system 

Install brew.
Install watchman. 
Install node (version used for development 21.5.0 ).
Install yarn.
Install react native CLI.
Install cocoapods.
Install Java (openjdk version 17.0.7)

You can take help from the link below for the above.

https://reactnative.dev/docs/set-up-your-environment

https://rlogicaltech.medium.com/how-to-install-react-native-on-mac-step-by-step-guide-1ac822aedd4f


IDE’s required for Projects : ( Along with version used for development )
Visual Studio (latest version)
Android Studio (17.0.6)
Xcode  (15.3)

Note: Try to use the latest versions of the IDE’s but if you face any problem can go for a specific version as mentioned above.

Steps to setup and run code : 

Step 1: Take a fresh clone from git. This code will not contain node modules and pod files.

Step 2: Open the source code from the root into Visual studio.

Step 3: Delete yarn.lock file. Open the terminal and enter the below command 
           
Yarn install

This command will install the node modules inside the source code.
 


For IOS Setup:

Step 4: From the folder structure, go to iOS folder then delete Podfile.lock

Step 5: From terminal go to iOS directory and install pods by entering 

pod install

For m1 chip

arch -x86_64 pod install


For Android Setup and running app:

Step 6: Open the android folder of the source code into android studio and build gradle files. Or run 

“React-native run-android”

Above command will build gradle files for you.


For running iOS app : 

Simply open the workspace in xcode and run the app or from the terminal type 

“React-native run-ios”

This will start a metro in the terminal and you see logs over there.



While creating Android build : 

Go to Tokee-app >> android >> app

Here u will get the key store file for android to create release apk and bundle for app upload.






Below mentioned are the credentials for the same 

MYAPP_UPLOAD_STORE_FILE=key.jks
MYAPP_UPLOAD_KEY_ALIAS=key
MYAPP_UPLOAD_STORE_PASSWORD=1234TcTech@
MYAPP_UPLOAD_KEY_PASSWORD=1234TcTech@

While creating android apk, you will get compile error CameraRollModule.java - just comment the below line at 2 places and and rebuild the project

retriever.release()

  
