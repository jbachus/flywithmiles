//
//  insensitiveComboBoxCell.h
//  flywithmiles
//
//  Created by Emmanuel Crouvisier on 1/14/15.
//  Copyright (c) 2015 Jonathan Chum. All rights reserved.
//

#import <Cocoa/Cocoa.h>


@interface insensitiveComboBoxCell : NSComboBoxCell
- (NSString *)completedString:(NSString *)substring;
@end

