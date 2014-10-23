//
//  AppDelegate.swift
//  awardbrowserapp
//
//  Created by Justin Bachus on 9/29/14.
//  Copyright (c) 2014 Book it with Miles. All rights reserved.
//

import Cocoa
import AppKit

struct fares {
    static var savedLegs: [Dictionary <String, String>] = []
    static var jsonString: String? = ""
    static var json: JSON? = nil
}


class AppDelegate: NSObject, NSApplicationDelegate, NSTableViewDataSource, NSTableViewDelegate {
                            
    @IBOutlet var window: NSWindow?
    @IBOutlet weak var dataSource: NSComboBox!
    @IBOutlet weak var date: NSDatePicker!
    @IBOutlet weak var passengers: NSComboBox!
    @IBOutlet weak var datePickerCell: NSDatePickerCell!
    @IBOutlet weak var statusLabel: NSTextField!
    @IBOutlet weak var fromAirportComboBox: NSComboBox!
    @IBOutlet weak var toAirportComboxBox: NSComboBox!
    @IBOutlet weak var resultsTableView: NSTableView!
    @IBOutlet weak var statusLabelCell: NSTextFieldCell!
    
    var dataArray: [Dictionary <String, String>] = []
    var savedLegs: [Dictionary <String, String>] = []

    func applicationDidFinishLaunching(aNotification: NSNotification?) {
        self.dataArray = []
        
        let currentDate = NSDate()
        self.datePickerCell.dateValue = currentDate // set date picker to today's date'
        
        self.passengers.selectItemAtIndex(0) // set passengers to 1

        // Load airports into combo boxes
        let path = NSBundle.mainBundle().pathForResource("airports", ofType: "json")
        let data = NSData(contentsOfFile: path!)!
        let json = JSON(data: data)
        
        for (key: String, subJson: JSON) in json {
            self.fromAirportComboBox.addItemWithObjectValue(subJson["location_name"].stringValue);
            self.toAirportComboxBox.addItemWithObjectValue(subJson["location_name"].stringValue);
        }
    }
    
    func applicationWillTerminate(aNotification: NSNotification?) {
        // Insert code here to tear down your application
    }
    
    func log(logMessage: String, functionName: String = __FUNCTION__) {
        println("\(functionName): \(logMessage)")
    }

    @IBAction func searchButton(sender: AnyObject) {
        self.statusLabel.stringValue = "Searching... plese wait"

        let dateFormatter = NSDateFormatter()
        dateFormatter.dateFormat = "MM-dd-yyyy" // superset of OP's format
        let dateStr = dateFormatter.stringFromDate(self.date.dateValue)
        
        log(self.fromAirportComboBox.stringValue + " -> " + self.toAirportComboxBox.stringValue)
        log(dateStr)

        let path = NSBundle.mainBundle().pathForResource("airports", ofType: "json")
        let jsonData = NSData(contentsOfFile: path!)!
        let jsonAirports = JSON(data: jsonData)
        
        var fromAirportCode = jsonAirports[self.fromAirportComboBox.indexOfSelectedItem]["airport_code"].stringValue
        var toAirportCode = jsonAirports[self.toAirportComboxBox.indexOfSelectedItem]["airport_code"].stringValue
        
        var passengers = self.passengers.stringValue
 
        // call external task
        var task = NSTask();
        task.launchPath = "awardbrowserapp.app/Contents/Resources/casperjs/bin/casperjs"
        task.arguments = ["awardbrowserapp.app/Contents/Resources/alaska.js",
        "--origin=" + fromAirportCode, "--destination=" + toAirportCode, "--depart_date=" + dateStr, "--passengers=" + passengers]
        
        /*
        var jsonResult: NSDictionary = NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.MutableContainers, error: nil) as NSDictionary
        println(jsonResult)
        */
        
        let pipe = NSPipe()
        task.standardOutput = pipe
        
        task.launch()
        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        
        fares.jsonString = NSString(data: data, encoding: NSUTF8StringEncoding)!
        // DEBUG
        // println(fares.jsonString)
        
        let json = JSON(data: data, options: NSJSONReadingOptions.MutableContainers, error: nil)
        println(json)
        
        fares.json = json
        
        // DEBUG
        // println(json)

        // TODO backend flatten out JSON object without json[0]
        // TODO backend merge fare availability with fares: [legs]
        self.dataArray = [] // empty out array from prior search
        for (key, fare) in json { // a route may contain multiple legs
            
            var fareCount:Int = 0
            for (legKey, legValue) in fare {
                var from = legValue["depart"].string!
                var fromTime = legValue["depart_datetime"].string!
                var to = legValue["arrival"].string!
                var toTime = legValue["arrival_datetime"].string!
                var save = "Save"
                var airline = legValue["operated"].string!
                var flight = legValue["flight_number"].string!
                var availability = legValue["availability"].string!
                
                if (fareCount > 0) {
                    from = "  ->" + from
                    save = ""
                }
                
                // println(json[0]["awards"][key]["mileage"].string!)
                    
                self.dataArray.append(["save": save, "from": from, "fromTime": fromTime, "to" : to, "toTime" : toTime, "airline" : airline, "flight" : flight, "availability" : availability, "fareId" : key, "legId" : legKey]);
                
                ++fareCount
            }
        }
        
        // refresh table
        self.resultsTableView.reloadData();
        self.statusLabel.stringValue = ""
    }
    
    func numberOfRowsInTableView(aTableView: NSTableView!) -> Int
    {
        let numberOfRows:Int = getDataArray().count
        return numberOfRows
    }
    
    func tableView(tableView: NSTableView!, objectValueForTableColumn tableColumn: NSTableColumn!, row: Int) -> AnyObject!
    {
        var newString: (AnyObject?) = getDataArray().objectAtIndex(row).objectForKey(tableColumn.identifier)
        
        return newString;
    }

    func getDataArray()-> NSArray {
        // println(self.dataArray);
        return self.dataArray;
    }
    
    func getLegsArray() -> NSArray! {
        // println("getLegsArray")
        return self.savedLegs;
    }

    @IBAction func saveFareToDraft(sender: AnyObject) {
        let rowIndex:Int = self.resultsTableView.clickedRow;

       // let rowClick: AnyObject? = self.resultsTableView.rowViewAtRow(rowIndex, makeIfNecessary: true)
        // rowClick:backgroundColor = NSColor(red: 0.1, green: 0.1, blue: 0.9, alpha: 1.0)
       // println(rowClick)
        
        println(self.resultsTableView.rowViewAtRow(5, makeIfNecessary: true))
        
        // println(self.dataArray[rowIndex])
        
        // let json = JSON(data: fares.jsonString, error: nil)
        // let json = JSON(object: fares.jsonString!)
        
        // let json = JSON.init(data: fares.jsonString, options: NSJSONReadingOptions.MutableContainers, error: nil)
        var fareId: String! = self.dataArray[rowIndex]["fareId"]
        var legId: String! = self.dataArray[rowIndex]["legId"]

        /*
        println(fareId)
        println(legId)
        println(fares.json?[0]["route"][fareId.toInt()!+1][legId.toInt()!+1])
        */
        
        let leg: JSON! = fares.json?[0]["route"][fareId.toInt()!+1][legId.toInt()!+1]
        
        var from: String = leg["depart"].string!
        var fromTime: String = leg["depart_datetime"].string!
        var to: String = leg["arrival"].string!
        var toTime: String = leg["arrival_datetime"].string!
        var airline: String = leg["operated"].string!
        var flight: String = leg["flight_number"].string!
        var availability: String = "todo"
        
        // println(json[0]["awards"][key]["mileage"].string!)
        
        fares.savedLegs.append([
            "savedTabRemove": "Move",
            "savedTabFrom": from,
            "savedTabFromTime": fromTime,
            "savedTabTo" : to,
            "savedTabToTime" : toTime,
            "savedTabAirline" : airline,
            "savedTabFlight" : flight,
            "savedTabAvailability" : availability
            ]);
        
        self.statusLabel.stringValue = from + " - " + to + " copied to saved tab."
        
        // println(fares.savedLegs)
    }
}

