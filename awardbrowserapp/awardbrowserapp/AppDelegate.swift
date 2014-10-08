//
//  AppDelegate.swift
//  awardbrowserapp
//
//  Created by Justin Bachus on 9/29/14.
//  Copyright (c) 2014 Book it with Miles. All rights reserved.
//

import Cocoa

class AppDelegate: NSObject, NSApplicationDelegate {
                            
    @IBOutlet var window: NSWindow?
    @IBOutlet weak var fromAirport: NSTextField!
    @IBOutlet weak var toAirport: NSTextField!
    @IBOutlet weak var dataSource: NSComboBox!
    @IBOutlet weak var programFilter: NSComboBox!
    @IBOutlet weak var date: NSDatePicker!
    @IBOutlet weak var passengers: NSComboBox!
    
    func applicationDidFinishLaunching(aNotification: NSNotification?) {
        // Insert code here to initialize your application
    }

    func applicationWillTerminate(aNotification: NSNotification?) {
        // Insert code here to tear down your application
    }
    
    func log(logMessage: String, functionName: String = __FUNCTION__) {
        println("\(functionName): \(logMessage)")
    }

    @IBAction func searchButton(sender: AnyObject) {
        log(self.fromAirport.stringValue + " -> " + self.toAirport.stringValue)
        log(self.date.stringValue) // todo, format to mm/dd/yyyy
        
        // make exec call here
        var task = NSTask();
        task.launchPath = "awardbrowserapp.app/Contents/Resources/casperjs/bin/casperjs"
        
        // --origin=SFO --destination=JFK --depart_date=10/15/14 --verbose=true --enable_debug=true
        task.arguments = ["awardbrowserapp.app/Contents/Resources/alaska.js",
        "--origin=" + self.fromAirport.stringValue, "--destination=" + self.toAirport.stringValue, "--depart_date=" + "10/15/2014"]
        task.launch()
    }

}

