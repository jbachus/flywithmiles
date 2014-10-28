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
  
  casper.on("resource.error", function(msg, trace) {
    this.echo("=========================");
    this.echo("resource.ERROR:");
    this.echo (JSON.stringify(msg));
    this.echo(backtrace);
    this.echo("=========================");
  });
  
}

casper.onResourceError = function(resourceError) {
    casper.reason = resourceError.errorString;
    casper.reason_url = resourceError.url;
};

casper.options.waitTimeout = 25000;

casper.start('https://www.britishairways.com/travel/redeem/execclub/_gf/en_us', function() { });

casper.waitForSelector("#execLoginrForm", function() {
  this.fill('form[name="form1"]', {
      'membershipNumber' : 'jchum@primoplace.com',
      'password': 'Pnko1b9r'
  }, true);
});

// #plan_trip appears after the page is fully authenticated
casper.waitForSelector("#StandardRedemptionTab", function() { });
      
casper.thenOpen('https://www.britishairways.com/travel/redeem/execclub/_gf/en_us', {
    method: 'post',
    data:   {
      'eId' : '100002',
      'pageid' : 'PLANREDEMPTIONJOURNEY',
      'tab_selected' : 'redeem',
      'redemption_type' : 'STD_RED',
      'WebApplicationID' : 'BOD',
      'Output' : '',
      'hdnAgencyCode' : '',
      'departurePoint' : origin,
      'destinationPoint' : destination,
      'departInputDate' : depart_date.replace(/-/g, "/"), // Love date formatting to fit with these damn engines!
      'oneWay' : 'true',
      'CabinCode' : 'M',
      'RestrictionType' : 'Restricted',
      'NumberOfAdults' : passenger,
      'NumberOfChildren' : '0',
      'NumberOfInfants' : '0',
      'submit' : 'Get flights'
    }
});

casper.waitForSelector("#progressBar", function() { });
   
casper.then(function() {
    
  this.page.injectJs('jquery.min.js');
  
  var data = this.evaluate(function() {
    // data = $('html').html(); 
    // return data;
    
    var routes = [];
    $('#directflightList0 .compact .flightListTable').map(function() {
      var legs = [];
      legs.push({
         depart: $(this).find('.departure .airportCodeLink').text(),
         depart_datetime : $(this).find('.departure .departtime').text() + ' ' + $(this).find('.departure .departdate').text(),
         arrival:  $(this).find('.arrival .airportCodeLink').text(),
         arrival_datetime: $(this).find('.arrival .arrivaltime').text() + ' ' + $(this).find('.arrival .arrivaldate').text(),
         flight_time: $(this).find('.journeyTime').text(),
         // aircraft: $(this).find('.flightPopUp').text(),
         operated: $(this).find('input[name="MainLineCarrierCode"]')[0].value,
         flight_number: $(this).find('.flightPopUp').text(),
         availability: "" //todo
      });
      
      routes.push(legs);
    });
    
    $('#indirectflightList0 .flightListTable').map(function() {
      
      var legs = [];
      $(this).find('tr[id]').not(':hidden').map(function () {
        legs.push({
          depart: $(this).find('.departure .airportCodeLink').text(),
          depart_datetime :  $(this).find('.departure .departtime').text() + ' ' + $(this).find('.departure .departdate').text(),
          arrival:   $(this).find('.arrival .airportCodeLink').text(),
          arrival_datetime:  $(this).find('.arrival .arrivaltime').text() + ' ' + $(this).find('.arrival .arrivaldate').text(),
          flight_time:  $(this).find('.journeyTime').text(),
          // aircraft: $(this).find('.flightPopUp').text(),
          operated:  ($(this).find('input[name="MainLineCarrierCode"]')[0] != undefined) ? $(this).find('input[name="MainLineCarrierCode"]')[0].value : '',
          flight_number:  $(this).find('.flightPopUp').text(),
          availability: "" // todo
        });        
      });
      
      routes.push(legs);
    });
    
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