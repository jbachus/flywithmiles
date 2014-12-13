//
//  PreferencesController.swift
//  flywithmiles
//
//  Created by Jonathan Chum on 12/11/14.
//  Copyright (c) 2014 Jonathan Chum. All rights reserved.
//

import Foundation
import Cocoa

class PreferencesController: NSViewController {

    @IBOutlet weak var airfranceUsername: NSTextField!
    @IBOutlet weak var airfrancePassword: NSTextField!
    
    @IBOutlet weak var britishairwaysUsername: NSTextField!
    @IBOutlet weak var britishairwaysPassword: NSTextField!
    
    let service = "Flywithmiles"
    let userAccount = "FlyWithMilesUser"
    let key = "preferences"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        let (dictionary, error) = Locksmith.loadData(forKey: key, inService: service, forUserAccount: userAccount)
        
        if let dictionary = dictionary {
            println("Dictionary: \(dictionary)")
        }
        
        if let error = error {
            println("Error: \(error)")
        }
        
        if (dictionary?["airfranceUsername"] != nil) {
            self.airfranceUsername.stringValue = dictionary!["airfranceUsername"] as NSString
        }
        
        if (dictionary?["airfrancePassword"] != nil) {
            self.airfrancePassword.stringValue = dictionary!["airfrancePassword"] as NSString
        }
        
        if (dictionary?["britishairwaysUsername"] != nil) {
            self.britishairwaysUsername.stringValue = dictionary!["britishairwaysUsername"] as NSString
        }
        
        if (dictionary?["britishairwaysPassword"] != nil) {
            self.britishairwaysPassword.stringValue = dictionary!["britishairwaysPassword"] as NSString
        }
    }
    
    @IBAction func savePreferences(sender: AnyObject) {
        Locksmith.deleteData(forKey: key, inService: service, forUserAccount: userAccount)
        
        Locksmith.saveData([
            "airfranceUsername": self.airfranceUsername.stringValue,
            "airfrancePassword" : self.airfrancePassword.stringValue,
            "britishairwaysUsername": self.britishairwaysUsername.stringValue,
            "britishairwaysPassword" : self.britishairwaysPassword.stringValue
        ], forKey: key, inService: service, forUserAccount: userAccount)
    }
    
}

extension String {
    public var dataValue: NSData {
        return dataUsingEncoding(NSUTF8StringEncoding, allowLossyConversion: false)!
    }
}

extension NSData {
    public var stringValue: String {
        return NSString(data: self, encoding: NSUTF8StringEncoding)!
    }
}