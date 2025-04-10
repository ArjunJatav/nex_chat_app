#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import "RNCallKeep.h"
#import "CustomBannerView.h"


@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Tokee";
  [FIRApp configure];

    [RNCallKeep setup:@{
     @"appName": @"Tokee",
     @"maximumCallGroups": @1,
     @"maximumCallsPerCallGroup": @1,
     @"supportsVideo": @YES,
     @"includesCallInRecents" : @NO
   }];
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
      if (!error) {
          NSLog(@"User authorization granted!");
      }
  }];
  [application registerForRemoteNotifications];
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

-(BOOL)application:(UIApplication* )application continueUserActivity:(NSUserActivity* )userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler{
  
  return [RNCallKeep application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

-(void)applicationWillTerminate:(UIApplication *)application{
  
  [RNCallKeep endCallWithUUID:@"b8236c1b-9f68-4b6e-a8ce-803aec634c98" reason:6];
}

-(void)applicationDidEnterBackground:(UIApplication *)application{
   [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
 }

-(void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler{
  // Silent Push Notification processing
  NSDictionary *aps = userInfo[@"aps"];
  if (aps && [aps[@"content-available"] integerValue] == 1) {
    
    UIApplicationState state = [[UIApplication sharedApplication] applicationState];
    NSString *uuidval = userInfo[@"uuid"];
    NSString *callerName = userInfo[@"sender_name"];
    NSString * status = userInfo[@"status"];
    NSString * videoStatus = userInfo[@"is_video"];
    
    BOOL isVideo = NO;
    if( [videoStatus isEqualToString:@"1"]){
      isVideo = YES;
      
    }
    
    if([status isEqualToString:@"incoming"]){
      
      [RNCallKeep reportNewIncomingCall: uuidval
                                 handle: callerName
                             handleType: @"generic"
                               hasVideo: isVideo
                    localizedCallerName: callerName
                        supportsHolding: NO
                           supportsDTMF: NO
                       supportsGrouping: NO
                     supportsUngrouping: NO
                            fromPushKit: YES
                                payload: userInfo
                  withCompletionHandler: nil];
      
      
    }
    else if([status isEqualToString:@"missed"]){
      
      [RNCallKeep endCallWithUUID: uuidval reason:6];
      
      
    }
    else if([status isEqualToString:@"ended"]){
      
      [RNCallKeep endCallWithUUID:uuidval reason:6];
      
    }
  
  }


  // Ending a background operation
  completionHandler(UIBackgroundFetchResultNewData);
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Stop the sound when the app is opened
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(60 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
      [center removeAllPendingNotificationRequests];
  });

  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
}

-(void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken{
  
  
}

-(void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler{
  
  UNNotificationContent *content = response.notification.request.content;
  
  // --- Retrieve information from your voip push payload
  NSString *JsonString = content.userInfo[@"data"];
  NSData *jsonData = [JsonString dataUsingEncoding:NSUTF8StringEncoding];

  NSError *error = nil;
  NSDictionary *dictionary = [NSJSONSerialization JSONObjectWithData:jsonData
                                                             options:kNilOptions
                                                               error:&error];

  if (error) {
      NSLog(@"Error parsing JSON string: %@", error.localizedDescription);
  } else {
    NSLog(@"Parsed Dictionary: %@", dictionary);
    if(dictionary.count > 0){
      
      // NSString *handle = [dictionary valueForKey:@"caller"];
      NSString *uuid = @"b8236c1b-9f68-4b6e-a8ce-803aec634c98";
      // NSString *isVideo = [dictionary valueForKey:@"isVideo"];
      NSString *callerName = [dictionary valueForKey:@"sender_name"];
      NSString * status = [dictionary valueForKey: @"status"];
      if([status isEqualToString:@"incoming"]){
        
        
      }
    }
    
  }
}


- (void)showCustomBannerForNotification:(UNNotification *)notification {
    // Extract information from the notification
    NSString *title = notification.request.content.title;
    NSString *body = notification.request.content.body;
    
    // Create and show the custom banner view
    CustomBannerView *customBannerView = [[CustomBannerView alloc] initWithTitle:title body:body];
    
    // Get the root view controller to add the banner view
    UIViewController *rootViewController = self.window.rootViewController;
    
    // Add the custom banner view
    [rootViewController.view addSubview:customBannerView];
    
    // Animate the banner view (you can customize the animation)
    [UIView animateWithDuration:0.5 delay:0 options:UIViewAnimationOptionCurveEaseInOut animations:^{
        customBannerView.frame = CGRectMake(0, 0, customBannerView.bounds.size.width, customBannerView.bounds.size.height);
    } completion:^(BOOL finished) {
        // Optional: Remove the banner view after a certain duration
        [UIView animateWithDuration:0.5 delay:3.0 options:UIViewAnimationOptionCurveEaseInOut animations:^{
            customBannerView.alpha = 0.0;
        } completion:^(BOOL finished) {
            [customBannerView removeFromSuperview];
        }];
    }];
}


// Implement the delegate method to handle notification interactions when the app is in the foreground.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
  
  UNNotificationContent *content = notification.request.content;
  
  NSLog(@"Received Notification %@",content.userInfo);
  
  // --- Retrieve information from your voip push payload
  NSString *JsonString = content.userInfo[@"data"];
  if (JsonString != nil)
  {
    
    NSData *jsonData = [JsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;
    NSDictionary *dictionary = [NSJSONSerialization JSONObjectWithData:jsonData
                                                               options:kNilOptions
                                                                 error:&error];

    if (error) {
        NSLog(@"Error parsing JSON string: %@", error.localizedDescription);
    } else {
        NSLog(@"Parsed Dictionary: %@", dictionary);
      
      if(dictionary.count > 0){
        
        // NSString *handle = [dictionary valueForKey:@"caller"];
         NSString *uuid = @"b8236c1b-9f68-4b6e-a8ce-803aec634c98";
         NSString *callerName = [dictionary valueForKey:@"sender_name"];
         NSString * status = [dictionary valueForKey: @"status"];
         if([status isEqualToString:@"incoming"]){
           
   
           
         }
        
      }
        
  }
  
  }else{
    //completionHandler(UIUserNotificati); // No system banner
    completionHandler(UNNotificationPresentationOptionNone); // No system banner
        
        // Example: Show a custom banner view
        [self showCustomBannerForNotification:notification];
    
  }
  

}

- (void)showAlertWithTitle:(NSString *)title message:(NSString *)message {
  
   UIViewController *rootViewController = [self topViewController];

    UIAlertController *alertController = [UIAlertController alertControllerWithTitle:title
                                                                             message:message
                                                                      preferredStyle:UIAlertControllerStyleAlert];

    UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"OK"
                                                       style:UIAlertActionStyleDefault
                                                     handler:^(UIAlertAction *action) {
                                                         // Handle OK button tap if needed
                                                     }];

    [alertController addAction:okAction];

    // Present the alert
     [rootViewController presentViewController:alertController animated:YES completion:nil];
}

- (UIViewController *)topViewController {
    UIViewController *topViewController = self.window.rootViewController;

    while (topViewController.presentedViewController) {
        topViewController = topViewController.presentedViewController;
    }

    if ([topViewController isKindOfClass:[UINavigationController class]]) {
        return [(UINavigationController *)topViewController topViewController];
    }

    if ([topViewController isKindOfClass:[UITabBarController class]]) {
        return [(UITabBarController *)topViewController selectedViewController];
    }

    return topViewController;
}


- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
