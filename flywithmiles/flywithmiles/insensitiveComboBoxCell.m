//
//  insensitiveComboBoxCell.m
//  flywithmiles
//
//  Created by Emmanuel Crouvisier on 1/14/15.
//  Copyright (c) 2015 Jonathan Chum. All rights reserved.
//

#import "insensitiveComboBoxCell.h"

@implementation insensitiveComboBoxCell : NSComboBoxCell

- (NSString *)completedString:(NSString *)substring
{
    if ([self usesDataSource])
    {
        return [super completedString:substring];
    }
    else	// basically do what complete should do -- be case insensitive.
    {
        NSArray *currentList = [self objectValues];
        NSEnumerator *theEnum = [currentList objectEnumerator];
        id eachString;
        int maxLength = 0;
        NSString *bestMatch = @"";
        
        while (nil != (eachString = [theEnum nextObject]) )
        {
            NSString *commonPrefix = [eachString commonPrefixWithString:substring options:NSCaseInsensitiveSearch];
            if ([commonPrefix length] >= [substring length] && [commonPrefix length] > maxLength)
            {
                maxLength = [commonPrefix length];
                // bestMatch = eachString;
                
                // Build match string based on what user has typed so far, to show changes in capitalization.
                bestMatch = eachString;
//                bestMatch = [NSString stringWithFormat:@"%@%@",substring, [eachString substringFromIndex:[substring length]]];
            }
        }
        return bestMatch;
    }
}

@end