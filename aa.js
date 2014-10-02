var fs = require('fs');
var system = require('system');
var moment = require('moment');

var casper = require('casper').create();


/*	clientScripts:  [
		'includes/jquery.min.js'
	],
  */
	casper.options.pageSettings = {
		loadImages:  false,
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11'
	};

// addDebugEvents(casper, system);

function addDebugEvents(page, system) {
  page.options.onResourceError = function (resourceError) {
      page.reason = resourceError.errorString;
      page.reason_url = resourceError.url;
  };

  page.options.onResourceRequested = function (request) {
      system.stderr.writeLine('= onResourceRequested()');
      system.stderr.writeLine('  request: ' + JSON.stringify(request, undefined, 4));
  };

  page.options.onResourceReceived = function (response) {
      system.stderr.writeLine('= onResourceReceived()');
      system.stderr.writeLine('  id: ' + response.id + ', stage: "' + response.stage + '", response: ' + JSON.stringify(response));
  };

  page.options.onLoadStarted = function () {
      system.stderr.writeLine('= onLoadStarted()');
      var currentUrl = page.evaluate(function () {
          return window.location.href;
      });
      system.stderr.writeLine('  leaving url: ' + currentUrl);
  };

  page.options.onLoadFinished = function (status) {
      system.stderr.writeLine('= onLoadFinished()');
      system.stderr.writeLine('  status: ' + status);
  };
}

if (!casper.cli.has("origin") || ! casper.cli.has("destination") || ! casper.cli.has("depart_date")) {
	casper.echo("Required arguments missing: --origin=xxx --destination=xxx --passenger=x \n Additional options: --debug --verbose");
	casper.exit();
}

if (casper.cli.has("origin")) {
	var origin = casper.cli.raw.get("origin");
}

if (casper.cli.has("destination")) {
	var destination = casper.cli.raw.get("destination");
}

if (casper.cli.has("depart_date")) {
	var depart_date = casper.cli.raw.get("depart_date");
}

if (casper.cli.has("passenger")) {
	var passenger = casper.cli.raw.get("passenger");
}

if (casper.cli.has("verbose")) {
 	casper.options.verbose = true;
 	casper.options.logLevel = 'debug';
}

if (casper.cli.has("debug")) {
  casper.on('remote.message', function(msg, backtrace) {
    this.echo("=========================");
    this.echo("ERROR:");
    this.echo(msg);
    this.echo(backtrace);
    this.echo("=========================");
  });
}

casper.options.waitTimeout = 25000;

casper.start();

console.log(moment(depart_date).format("M"));

casper.thenOpen('http://www.aa.com/reservation/awardFlightSearchOptionsSubmit.do', {
    method: 'post',

    data:   {
    'flightSearch' : 'award',
    'dateChanged' : 'false',
    'netSaaversTripType' : '',
    'searchMode' : 'award',
    'aairpassSearchType' : 'false',
    'tripType' : 'oneWay',
    'currentCodeForm' : '',
    'originAirport' : origin,
    'destinationAirport' : destination,
    'defaultTravelDay' : '-1000',
    'defaultTravelMonth' : '-1000',
    'defaultSearchTime' : '040001',
    'multiCitySearchParam[0].originAirport' : origin,
    'multiCitySearchParam[0].destinationAirport' : destination,
    'multiCitySearchParam[0].flightDateParams.travelMonth' : moment(depart_date).format("M"),
    'multiCitySearchParam[0].flightDateParams.travelDay' : moment(depart_date).format("DD"),
    'multiCitySearchParam[0].flightDateParams.searchTime' : '040001',
    'multiCitySearchParam[1].originAirport' : '',
    'multiCitySearchParam[1].destinationAirport' : '',
    'multiCitySearchParam[1].flightDateParams.travelMonth' : '-1000',
    'multiCitySearchParam[1].flightDateParams.travelDay' : '-1000',
    'multiCitySearchParam[1].flightDateParams.searchTime' : '040001',
    'multiCitySearchParam[2].originAirport' : '',
    'multiCitySearchParam[2].destinationAirport' : '',
    'multiCitySearchParam[2].flightDateParams.travelMonth' : '-1000',
    'multiCitySearchParam[2].flightDateParams.travelDay' : '-1000',
    'multiCitySearchParam[2].flightDateParams.searchTime' : '040001',
    'multiCitySearchParam[3].originAirport' : '',
    'multiCitySearchParam[3].destinationAirport' : '',
    'multiCitySearchParam[3].flightDateParams.travelMonth' : '-1000',
    'multiCitySearchParam[3].flightDateParams.travelDay' : '-1000',
    'multiCitySearchParam[3].flightDateParams.searchTime' : '040001',
    'currentCalForm' : 'dep',
    'awardDatesFlexible' : 'true',
    'flightParams.flightDateParams.travelMonth' : moment(depart_date).format("M"),
    'flightParams.flightDateParams.travelDay' : moment(depart_date).format("DD"),
    'flightParams.flightDateParams.searchTime' : '040001',
    'returnDate.travelMonth' : '-1000',
    'returnDate.travelDay' : '-1000',
    'returnDate.searchTime' : '040001',
    'adultPassengerCount' : '1',
    'seniorPassengerCount' : '0',
    'youngAdultPassengerCount' : '0',
    'childPassengerCount' : '0',
    'infantPassengerCount' : '0',
    'awardCabinClass' : 'E',
    'awardType' : 'M',
    'awardCarrierPreference' : 'AAPartners',
    'passengerCount' : '1',
    '_button_success' : 'Continue',
    'searchCategory' : 'award'
  }
});

casper.waitForSelector("#submitDates", function() { 
  this.click('a[id="ctnButton"]');
});

// TODO if timesout, return output to a file to debug
casper.waitForSelector("#flightListContainer", function() { 
//   casper.then(function() {
  var js = this.evaluate(function() {
    // data = jQuery('html').html(); 
    
    fare = [];
    routes = [];
    awards = [];
    
    var parseFares = function(award_type) {
      jQuery('#flightListContainer .aa_flightListContainer:not(.inactive)').map(function() { // Select fares that are not grey'd out
    
        awards.push({
          award: award_type,
          mileage: jQuery(this).find('.aa_flightList_col-1 div p').text()
        });
       
        // Routes may have more then one leg
        var legs = [];
        jQuery('.ca_flightSlice', this).map(function() {
          legs.push({
            depart: jQuery(this).find('.aa_flightList_col-3 p span:eq(0)').text(),
            depart_datetime: jQuery(this).find('.aa_flightList_col-3 p strong:eq(0)').text(),
            arrival: jQuery(this).find('.aa_flightList_col-4 p span:eq(0)').text(),
            arrival_datetime: jQuery(this).find('.aa_flightList_col-4 p strong:eq(0)').text(),
            // AA flight tie shows the entire time for flight, not each leg
            // flight_time: jQuery(this).find('.ca_flightDetails table tr td:contains("Total travel time")').text().replace('Total travel time:', '').trim(),
            operated: jQuery(this).find('.ca_flightDetails table caption').text().replace('Operated by', '').trim(),
            flight_number: jQuery(this).find('.aa_flightList_col-2 p:eq(0)').text()
           });
        });
        
        routes.push(legs);
      });
    }
    
    // Parse Economy MileSAAver
    jQuery('.caEconomy-Mile-SAAver div').click();
    jQuery('#pgNt li').map(function() { // loop through pagination
      jQuery(this).click();
      parseFares('Economy MileSAAver');
    });
    
    // Parse Economy AAnytime
    jQuery('.caEconomy-AAnytime div').click();
    jQuery('#pgNt li').map(function() { // loop through pagination
      jQuery(this).click();
      parseFares('Economy AAnytime');
    });
    
    // Parse Business/First MileSAAver*
    jQuery('.caBusiness-MileSAAver div').click();
    jQuery('#pgNt li').map(function() { // loop through pagination
      jQuery(this).click();
      parseFares('Business/First MileSAAver*');
    });
    
    // Parse Business/First AAnytime*
    jQuery('.caBusiness-AAnytime div').click();
    jQuery('#pgNt li').map(function() { // loop through pagination
      jQuery(this).click();
      parseFares('Business/First AAnytime*');
    });
    
    // Parse First MileSAAver
    jQuery('.caFirst-MileSAAver div').click();
    jQuery('#pgNt li').map(function() { // loop through pagination
      jQuery(this).click();
      parseFares('First MileSAAver');
    });
    
    // Parse First Annytime
    jQuery('.caFirst-AAnytime div').click();
    jQuery('#pgNt li').map(function() { // loop through pagination
      jQuery(this).click();
      parseFares('First AAnytime');
    });
    
    fare.push({
      awards: awards,
      route: routes
    });
    
    console.log(fare);
    
    return fare;
  });
  
  /*
  try {
    fs.write("output-aa.html", js, 'w');
  } catch(e) {
      console.log(e);
  }
  */
  
  this.echo (JSON.stringify(js));
  
});

casper.run();