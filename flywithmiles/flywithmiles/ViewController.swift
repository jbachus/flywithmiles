//
//  ViewController.swift
//  flywithmiles
//
//  Created by Jonathan Chum on 10/26/14.
//  Copyright (c) 2014 Jonathan Chum. All rights reserved.
//

import Cocoa
import AppKit
import Darwin
import Foundation

struct fares {
    static var savedLegs: [Dictionary <String, String>] = []
    static var itineraryLegs: [Dictionary <String, String>] = []
    static var jsonString: String? = ""
    static var json: JSON? = nil
}

class ViewController: NSViewController, NSTableViewDataSource, NSTableViewDelegate  {
    
    // @IBOutlet var window: NSWindow?
    
    @IBOutlet weak var dataSource: NSComboBox!
    @IBOutlet weak var date: NSDatePicker!
    @IBOutlet weak var passengers: NSComboBox!
    @IBOutlet weak var datePickerCell: NSDatePickerCell!
    @IBOutlet weak var statusLabel: NSTextField!
    @IBOutlet weak var fromAirportComboBox: NSComboBox!
    @IBOutlet weak var toAirportComboxBox: NSComboBox!
    @IBOutlet weak var resultsTableView: NSTableView!
    
    @IBOutlet weak var noResults: NSTextField!
    @IBOutlet weak var progressSpinner: NSProgressIndicator!
    @IBOutlet weak var savedTableView: NSTableView!
    @IBOutlet weak var itineraryTableView: NSTableView!
    @IBOutlet weak var statusLabelCell: NSTextFieldCell!
    
    var dataArray: [Dictionary <String, String>] = []
    var savedLegs: [Dictionary <String, String>] = []
    var preferences: NSDictionary?
    
    let service = "Flywithmiles"
    let userAccount = "FlyWithMilesUser"
    let key = "preferences"

    override func viewDidAppear() {
        super.viewDidAppear()
        self.view.window?.title = "Fly With Miles"
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
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
        
        
        /*
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
        */
        
    }

    override var representedObject: AnyObject? {
        didSet {
        // Update the view, if already loaded.
        }
    }

    func log(logMessage: String, functionName: String = __FUNCTION__) {
        println("\(functionName): \(logMessage)")
    }
    
    func receivedData(notif : NSNotification) {
        // Unpack the FileHandle from the notification
        let fh:NSFileHandle = notif.object as NSFileHandle
        // Get the data from the FileHandle
        let data = fh.availableData
        // Only deal with the data if it actually exists
        if data.length > 1 {
            // Since we just got the notification from fh, we must tell it to notify us again when it gets more data
            fh.waitForDataInBackgroundAndNotify()
            // Convert the data into a string
            let string = NSString(data: data, encoding: NSASCIIStringEncoding)
            println(string!)
        }
    }
    
    @IBAction func searchButton(sender: AnyObject) {
        
        let (dictionary, error) = Locksmith.loadData(forKey: key, inService: service, forUserAccount: userAccount)
        self.preferences = dictionary
        
        let dateFormatter = NSDateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd" // superset of OP's format
        let dateStr = dateFormatter.stringFromDate(self.date.dateValue)
        
        log(self.fromAirportComboBox.stringValue + " -> " + self.toAirportComboxBox.stringValue)
        log(dateStr)
        
        let path = NSBundle.mainBundle().pathForResource("airports", ofType: "json")
        let jsonData = NSData(contentsOfFile: path!)!
        let jsonAirports = JSON(data: jsonData)
        
        var fromAirportCode = ""
        var toAirportCode = ""
        
        if (self.fromAirportComboBox.indexOfSelectedItem == -1) {
            self.statusLabel.stringValue = "Please select an airport to fly from."
            return
        }
        
        if (self.toAirportComboxBox.indexOfSelectedItem == -1) {
            self.statusLabel.stringValue = "Please select an airport to fly to."
            return
        }
        
        if var fromAirportCode = jsonAirports[self.fromAirportComboBox.indexOfSelectedItem]["airport_code"].string {
           
        } else {
            self.statusLabel.stringValue = "From airport is invalid or not found."
            return
        }
        fromAirportCode = jsonAirports[self.fromAirportComboBox.indexOfSelectedItem]["airport_code"].stringValue
        
        if var toAirportCode = jsonAirports[self.toAirportComboxBox.indexOfSelectedItem]["airport_code"].string {
            
        } else {
           self.statusLabel.stringValue = "To airport is invalid or not found."
           return
        }
        toAirportCode = jsonAirports[self.toAirportComboxBox.indexOfSelectedItem]["airport_code"].stringValue
        
        var passengers = self.passengers.stringValue
        
        var script = ""
        switch self.dataSource.indexOfSelectedItem {
        case 0:
            script = "airfrance"
        case 1:
            script = "alaska"
        case 2:
            script = "american-airlines"
        case 3:
            script = "ba"
        case 4:
            script = "delta"
        case 5:
            script = "ual"
        default:
            self.statusLabel.stringValue = "Please select a data source."
            return
        }
        
        // call external task
        var task = NSTask();
        let casperJSPath = NSBundle.mainBundle().pathForResource("casperjs", ofType: "", inDirectory: "casperjs/bin")
        task.launchPath = casperJSPath!
        println("==CASPERJSPATH==")
        println(casperJSPath)
        
        let scriptPath = NSBundle.mainBundle().pathForResource(script, ofType: "js")
        println("==SCRIPT PATH==")
        println(scriptPath)
        
        task.arguments = [scriptPath!,
            "--origin=" + fromAirportCode, "--destination=" + toAirportCode, "--depart_date=" + dateStr, "--passenger=" + passengers, "--ssl-protocol=tlsv1", "--ignore-ssl-errors=yes"]
        
        if (script == "airfrance") {
            if ((self.preferences?["airfranceUsername"] != nil) && (self.preferences?["airfrancePassword"] != nil))
            {
            var username = self.preferences!["airfranceUsername"] as NSString
            var password = self.preferences!["airfrancePassword"] as NSString
            
                if (username != "" && password != "") {
                    task.arguments.append("--username=" + username);
                    task.arguments.append("--password=" + password);
                } else {
                    println("username or password missing")
                    self.performSegueWithIdentifier("showPrefs", sender: self)
                }
                
            } else {
                println("username or password missing")
                self.performSegueWithIdentifier("showPrefs", sender: self)
            }
        } else if (script == "ba") {
            if ((self.preferences?["britishairwaysUsername"] != nil) && (self.preferences?["britishairwaysPassword"] != nil))
            {
                var username = self.preferences!["britishairwaysUsername"] as NSString
                var password = self.preferences!["britishairwaysPassword"] as NSString
                
                if (username != "" && password != "") {
                    task.arguments.append("--username=" + username);
                    task.arguments.append("--password=" + password);
                } else {
                    println("username or password missing")
                    self.performSegueWithIdentifier("showPrefs", sender: self)
                }
                
            } else {
                println("username or password missing")
                self.performSegueWithIdentifier("showPrefs", sender: self)
            }
        }
        
        println(task.arguments)
        
        /*
        var jsonResult: NSDictionary = NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.MutableContainers, error: nil) as NSDictionary
        println(jsonResult)
        */
        
        let pipe = NSPipe()
        task.standardOutput = pipe
        let fh = pipe.fileHandleForReading
        fh.waitForDataInBackgroundAndNotify()
        
        // Set up the observer function
        let notificationCenter = NSNotificationCenter.defaultCenter()
        notificationCenter.addObserver(self, selector: "receivedData:", name: NSFileHandleDataAvailableNotification, object: nil)
        
        // You can also set a function to fire after the task terminates
        task.terminationHandler = {task -> Void in
            // Handle the task ending here
        }

        self.statusLabel.stringValue = "Searching... plese wait"
        progressSpinner.startAnimation(self)
        
        task.launch()
        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        
        fares.jsonString = NSString(data: data, encoding: NSUTF8StringEncoding)!
        
        // DEBUG
        println(fares.jsonString)
        
        let json = JSON(data: data, options: NSJSONReadingOptions.MutableContainers, error: nil)
        // println(json)
        statusLabel.stringValue=""
        
        if (json.arrayValue.count==0) {
            statusLabel.stringValue = "No results found"
        }
        
        fares.json = json
        
        // DEBUG
        // println(json)
        
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
                
                self.dataArray.append(["save": save, "from": from, "fromTime": fromTime, "to" : to, "toTime" : toTime, "airline" : airline, "flight" : flight, "availability" : availability, "fareId" : key, "legId" : legKey]);
                
                ++fareCount
            }
        }
        
        // refresh table

        
        self.resultsTableView.reloadData();
        progressSpinner.stopAnimation(self)
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
        
        let leg: JSON! = fares.json?[fareId.toInt()!+1][legId.toInt()!+1]
        
        var from: String = leg["depart"].string!
        var fromTime: String = leg["depart_datetime"].string!
        var to: String = leg["arrival"].string!
        var toTime: String = leg["arrival_datetime"].string!
        var airline: String = leg["operated"].string!
        var flight: String = leg["flight_number"].string!
        var availability: String = leg["availability"].string!
        
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
    
    @IBAction func saveToItinerary(sender: AnyObject) {
 
        
        let rowIndex:Int = self.savedTableView.clickedRow;
        
        // let rowClick: AnyObject? = self.resultsTableView.rowViewAtRow(rowIndex, makeIfNecessary: true)
        // rowClick:backgroundColor = NSColor(red: 0.1, green: 0.1, blue: 0.9, alpha: 1.0)
        // println(rowClick)
        
        println(self.savedTableView.rowViewAtRow(5, makeIfNecessary: true))
        
        // println(self.dataArray[rowIndex])
        
        // let json = JSON(data: fares.jsonString, error: nil)
        // let json = JSON(object: fares.jsonString!)
        
        // let json = JSON.init(data: fares.jsonString, options: NSJSONReadingOptions.MutableContainers, error: nil)
        var fareId: String! = self.dataArray[rowIndex]["fareId"]
        var legId: String! = self.dataArray[rowIndex]["legId"]
        
        let leg: JSON! = fares.json?[fareId.toInt()!+1][legId.toInt()!+1]
        
        var from: String = leg["depart"].string!
        var fromTime: String = leg["depart_datetime"].string!
        var to: String = leg["arrival"].string!
        var toTime: String = leg["arrival_datetime"].string!
        var airline: String = leg["operated"].string!
        var flight: String = leg["flight_number"].string!
        var availability: String = leg["availability"].string!
        
        // println(json[0]["awards"][key]["mileage"].string!)
        
        fares.itineraryLegs.append([
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
        
    }


}

