var fs = require('fs');
var utils = require('utils');
var system = require('system');
var moment = require('moment');

var casper = require('casper').create();
/*
clientScripts:  [
	'includes/jquery.min.js'
],
*/

casper.options.pageSettings = {
	loadImages:  false,
	userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11'
};

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

if (casper.cli.has("enable_debug")) {
  casper.on('remote.message', function(msg) {
    this.echo("=========================");
    this.echo("ERROR:");
    this.echo(msg);
    this.echo(backtrace);
    this.echo("=========================");
  });
  casper.on('error', function(msg,backtrace) {
    this.echo("=========================");
    this.echo("ERROR:");
    this.echo(msg);
    this.echo(backtrace);
    this.echo("=========================");
  });
 
  casper.on("page.error", function(msg, backtrace) {
    this.echo("=========================");
    this.echo("PAGE.ERROR:");
    this.echo(msg);
    this.echo(backtrace);
    this.echo("=========================");
  });
}

casper.options.waitTimeout = 25000;

casper.start();

// console.log(moment(depart_date).format("M"));

/*
casper.start('http://www.alaskaair.com/', function() { });

casper.waitForSelector("#flight", function() {
  this.fill('form[id="frmShopping"]', {
      'ShoppingRequestModel.IsAwardReservation' : 'true',
      'ShoppingRequestModel.DepartureCity1': 'SFO',
      'ShoppingRequestModel.ArrivalCity1' : 'JFK',
      'ShoppingRequestModel.DepartureDate1' : '10/15/2014'
  }, true);
});
*/


casper.thenOpen('https://www.alaskaair.com/Shopping/Flights/Shop', {
    method: 'post',
    data:   {
    'flightType' : '2',
    'ShoppingRequestModel.IsAwardReservation' : 'true',
    'ShoppingRequestModel.IsAwardReservation' : 'false',
    'ShoppingRequestModel.DepartureCity1' : origin,
    'ShoppingRequestModel.IncludeNearbyDepartureAirports' : 'false',
    'ShoppingRequestModel.ArrivalCity1' : destination,
    'ShoppingRequestModel.IncludeNearbyArrivalAirports' : 'false',
    'ShoppingRequestModel.DepartureDate1' : depart_date,
    'ShoppingRequestModel.DepartureTime1' : 'Anytime',
    'ShoppingRequestModel.ShopLowFareCalendar' : 'false',
    'ShoppingRequestModel.ShopAwardCalendar' : 'false',
    'ShoppingRequestModel.ReturnDate' : depart_date,
    'ShoppingRequestModel.ReturnTime' : 'Anytime',
    'ShoppingRequestModel.AdultCount' : '1 Adult',
    'ShoppingRequestModel.ChildrenCount' : '0 Children',
    'ShoppingRequestModel.AwardOption' : 'MilesOnly',
    'ShoppingRequestModel.FareType' : 'NoUpgradePreference',
    'ShoppingRequestModel.CabinType' : 'Coach',
    'IsRoundTrip' : 'false',
    'IsOneWay' : 'true',
    'IsMultiCity' : 'false',
    'IsAwardReservation' : 'true',
    'AdultCount' : '1 Adult',
    'ChildrenCount' : '0 Children',
    'UMNRAnswer' : '',
    'DepartureCity1' : origin,
    'DepartureCity2' : '',
    'DepartureCity3' : '',
    'DepartureCity4' : '',
    'ArrivalCity1' : destination,
    'ArrivalCity2' : '',
    'ArrivalCity3' : '',
    'ArrivalCity4' : '',
    'DepartureDate1' : depart_date,
    'DepartureDate2' : '',
    'DepartureDate3' : '',
    'DepartureDate4' : '',
    'DepartureTime1' : 'Anytime',
    'DepartureTime2' : '',
    'DepartureTime3' : '',
    'DepartureTime4' : '',
    'ReturnDate' : depart_date,
    'ReturnTime' : 'Anytime',
    'DiscountCode' : '',
    'IncludeNearbyDepartureAirports' : 'false',
    'IncludeNearbyArrivalAirports' : 'false',
    'ShopAwardCalendar' : 'false',
    'ShopLowFareCalendar' : 'false',
    'CabinType' : 'Coach',
    'FareType' : 'NoUpgradePreference',
    'AwardOption' : 'MilesOnly',
    'DiscountCode' : '',
    'ContractFareType' : '',
    'ShowOnlyContractFares' : 'false'  
  }
});

casper.waitForSelector("#ShoppingForm", function() { 
  // casper.then(function() {
  // if times out, write response to log file
  var js = this.evaluate(function() {
    // data = jQuery('html').html(); 
    
    fare = [];
    routes = [];
    awards = [];
    
    var parseFares = function(award_type, css_class) {
      $('#MatrixTable0 tr.Option.AS').map(function() {
        
        if ($('td.' + css_class + ' .PriceCell input', this).length === 0) {
          return;
        }
        
        awards.push({
          award: award_type,
          mileage: $('td.' + css_class + ' .Price', this).text().replace(/k(.)*/g, "") // TODO bug
        });
        
        var legs = [];
        $('.AwardFlightCell > ul > li div.SegmentDiv ', this).map(function() {
          legs.push({
            depart: $(this).find('div:eq(3)').text(),
            depart_datetime: $(this).find('div:eq(4)').text(),
            arrival: $(this).find('div:eq(5)').text(),
            arrival_datetime: $(this).find('div:eq(6)').text(),
            // AA flight tie shows the entire time for flight, not each leg
            // flight_time: jQuery(this).find('.ca_flightDetails table tr td:contains("Total travel time")').text().replace('Total travel time:', '').trim(),
            operated: $(this).find('.FlightCarrierImage img').attr('title'),
            flight_number: $(this).find('div:eq(1)').text()
           });
        });
        routes.push(legs);
      });
    };
    
    parseFares('Coach Lowest', '.CoachAwardColumn');
    parseFares('Coach Refundable', '.CoachFullFlexColumn');
    parseFares('Premium Economy', '.PremiumEconomyColumn');
    parseFares('Business', '.BusinessAwardColumn');
    parseFares('First', '.FirstAwardColumn');
    parseFares('First Refundable', '.FirstFullFlexColumn');
    
    fare.push({
      awards: awards,
      route: routes
    });
        
    return fare;
  });
  
  this.echo (JSON.stringify(js));
  
  /*
  try {
    fs.write("response-alaska-air.html", html, 'w');
  } catch(e) {
      console.log(e);
  }
  */
}, function() {
  
  // if times out, write response to log file
  var html = this.evaluate(function() {
    data = jQuery('html').html(); 
    return data;
  });
  
  try {
    fs.write("log-alaska-air.html", html, 'w');
  } catch(e) {
      console.log(e);
  }
  
}, 15000);

casper.run();