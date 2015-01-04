//
//  CaseInsensitiveComboxBox.swift
//  flywithmiles
//
//  Created by Justin Bachus on 1/3/15.
//  Copyright (c) 2015 Jonathan Chum. All rights reserved.
//

import Cocoa

class CaseInsensitiveComboxBox: NSComboBox {

    override func drawRect(dirtyRect: NSRect) {
        super.drawRect(dirtyRect)

        // Drawing code here.
    }
    
    override func textDidChange(notification: NSNotification) {
        self.stringValue = self.stringValue.uppercaseString
    }
    
}
