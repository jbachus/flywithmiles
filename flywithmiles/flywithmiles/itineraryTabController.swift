//
//  itineraryTabController.swift
//  flywithmiles
//
//  Created by Jonathan Chum on 12/13/14.
//  Copyright (c) 2014 Jonathan Chum. All rights reserved.
//

import Foundation
import Cocoa

class itineraryTabController: NSViewController, NSTableViewDataSource, NSTableViewDelegate {
    
    @IBOutlet weak var itineraryTableView: NSTableView!
    func applicationDidFinishLaunching(aNotification: NSNotification?) {
        println("test")
    }
    
    func numberOfRowsInTableView(aTableView: NSTableView!) -> Int
    {
        let numberOfRows:Int = getDataArray().count
        return numberOfRows
    }
    
    func tableView(tableView: NSTableView!, objectValueForTableColumn tableColumn: NSTableColumn!, row: Int) -> AnyObject!
    {
        var newString: (AnyObject?) = getDataArray().objectAtIndex(row).objectForKey(tableColumn.identifier)
        
        self.itineraryTableView.reloadData();
        
        return newString;
    }
    
    func getDataArray()-> NSArray {
        // println(self.dataArray);
        // let app = AppDelegate();
        // let appDelegate = NSApplication.sharedApplication().delegate as AppDelegate
        // var legs = appDelegate.getLegsArray()
        // var legs =  appDelegate.savedLegs
        // println("DEBUG")
        // println(fares.savedLegs)
        return fares.itineraryLegs
    }
}
