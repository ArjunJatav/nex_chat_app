//
//  PushNotificationManager.m
//  tokee
//
//  Created by eBizneeds on 16/12/24.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <UserNotifications/UserNotifications.h>

@interface PushNotificationManager : NSObject <RCTBridgeModule, UNUserNotificationCenterDelegate>
@end

@implementation PushNotificationManager

// This is required for React Native to recognize the module
RCT_EXPORT_MODULE();

// Expose a method to React Native
RCT_EXPORT_METHOD(requestNotificationPermission:(RCTResponseSenderBlock)callback)
{
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
  
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                         completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (!error) {
            if (granted) {
                callback(@[[NSNull null], @"Permission granted"]);
            } else {
                callback(@[[NSNull null], @"Permission denied"]);
            }
        } else {
            callback(@[error.localizedDescription, [NSNull null]]);
        }
    }];
}

@end


