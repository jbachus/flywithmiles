//
//  AppDelegate.swift
//  awardbrowserapp
//
//  Created by Justin Bachus on 9/29/14.
//  Copyright (c) 2014 Book it with Miles. All rights reserved.
//

import Cocoa
import CoreData

struct fares {
    static var savedLegs: [Dictionary <String, String>] = []
    static var jsonString: String? = ""
    static var json: JSON? = nil
}

class AppDelegate: NSObject, NSApplicationDelegate, NSTableViewDataSource, NSTableViewDelegate {
                            
    @IBOutlet var window: NSWindow?
    @IBOutlet weak var fromAirport: NSTextField!
    @IBOutlet weak var toAirport: NSTextField!
    @IBOutlet weak var dataSource: NSComboBox!
    @IBOutlet weak var programFilter: NSComboBox!
    @IBOutlet weak var date: NSDatePicker!
    @IBOutlet weak var passengers: NSComboBox!
    
    @IBOutlet weak var resultsTableView: NSTableView!
    
    var dataArray: [Dictionary <String, String>] = []
    var savedLegs: [Dictionary <String, String>] = []
    // var jsonArray: JSON?
    
    func applicationDidFinishLaunching(aNotification: NSNotification?) {
        // Insert code here to initialize your application
        self.dataArray = []
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
        /*
        var jsonResult: NSDictionary = NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.MutableContainers, error: nil) as NSDictionary
        println(jsonResult)
        */
        
        let pipe = NSPipe()
        task.standardOutput = pipe
        
        task.launch()
        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        
        // DEBUG
        fares.jsonString = NSString(data: data, encoding: NSUTF8StringEncoding)!
        // println(fares.jsonString)
        
        let json = JSON(data: data, options: NSJSONReadingOptions.MutableContainers, error: nil)
        
        fares.json = json
        
        // DEBUG
        // println(json)

        // TODO backend flatten out JSON object without json[0]
        // TODO backend merge fare availability with fares: [legs]
        self.dataArray = [] // empty out array from prior search
        for (key, fare) in json[0]["route"] { // a route may contain multiple legs
            
            var fareCount:Int = 0
            for (legKey, legValue) in fare {
                var from = legValue["depart"].string!
                var fromTime = legValue["depart_datetime"].string!
                var to = legValue["arrival"].string!
                var toTime = legValue["arrival_datetime"].string!
                var save = "Save"
                var airline = legValue["operated"].string!
                var flight = legValue["flight_number"].string!
                var availability = "todo"
                
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

        
        // println(fares.savedLegs)
    }
}

