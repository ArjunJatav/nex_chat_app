// CustomBannerView.m
#import "CustomBannerView.h"

@implementation CustomBannerView

- (instancetype)initWithTitle:(NSString *)title body:(NSString *)body {
    self = [super initWithFrame:CGRectMake(0, 0, UIScreen.mainScreen.bounds.size.width, 80)]; // Customize the frame as needed
    if (self) {
        // Customize the appearance of the banner view
        self.backgroundColor = [UIColor colorWithRed:255.0/255.0 green:222.0/255.0 blue:93.0/255.0 alpha:1.0];
        
        // Add title label
        UILabel *titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(20, 28, self.bounds.size.width - 40, 20)];
        titleLabel.text = title;
        titleLabel.font = [UIFont boldSystemFontOfSize:16.0];
        [self addSubview:titleLabel];
        
        // Add body label
        UILabel *bodyLabel = [[UILabel alloc] initWithFrame:CGRectMake(20, 50, self.bounds.size.width - 40, 20)];
        bodyLabel.text = body;
        bodyLabel.numberOfLines = 2;
        bodyLabel.font = [UIFont systemFontOfSize:14.0];
        [self addSubview:bodyLabel];
    }
    return self;
}

@end
