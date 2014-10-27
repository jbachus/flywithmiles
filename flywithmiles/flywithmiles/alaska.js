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
	casper.echo("Required arguments missing: --origin=xxx --destination=xxx --passenger=x \n Additional options: --enable_debug --verbose");
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
    'ShoppingRequestModel.AdultCount' : passenger + ' Adult',
    'ShoppingRequestModel.ChildrenCount' : '0 Children',
    'ShoppingRequestModel.AwardOption' : 'MilesOnly',
    'ShoppingRequestModel.FareType' : 'NoUpgradePreference',
    'ShoppingRequestModel.CabinType' : 'Coach',
    'IsRoundTrip' : 'false',
    'IsOneWay' : 'true',
    'IsMultiCity' : 'false',
    'IsAwardReservation' : 'true',
    'AdultCount' : passenger + ' Adult',
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
  var data = this.evaluate(function() {
    // data = jQuery('html').html(); 

    var routes = [];    
    var parseFares = function() {
      $('#MatrixTable0 tr.Option').map(function() {
                
        var legs = [];
        var availability = [];
        
        if ($('td.CoachAwardColumn .PriceCell input', this).length > 0) {
          availability.push('Coach Lowest');
        }

        if ($('td.CoachFullFlexColumn .PriceCell input', this).length > 0) {
          availability.push('Coach Refundable');
        }

        if ($('td.PremiumEconomyColumn .PriceCell input', this).length > 0) {
          availability.push('Premium Economy');
        }
        
        if ($('td.BusinessAwardColumn .PriceCell input', this).length > 0) {
          availability.push('Business');
        }
        
        if ($('td.FirstAwardColumn .PriceCell input', this).length > 0) {
          availability.push('First');
        }
        
        if ($('td.FirstFullFlexColumn .PriceCell input', this).length > 0) {
          availability.push('First Refundable');
        }
        
        // should be flat, no legs
        $('.AwardFlightCell > ul > li div.SegmentDiv ', this).map(function() {
          legs.push({
            depart: $(this).find('div:eq(3)').text(),
            depart_datetime: $(this).find('div:eq(4)').text(),
            arrival: $(this).find('div:eq(5)').text(),
            arrival_datetime: $(this).find('div:eq(6)').text(),
            operated: $(this).find('.FlightCarrierImage img').attr('title'),
            flight_number: $(this).find('div:eq(1)').contents().get(0).nodeValue,
            availability: availability.join()
           });
        });
        routes.push(legs);
      });
    };
    
    parseFares();
            
    return routes;
  });
  
  this.echo (JSON.stringify(data));
  
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