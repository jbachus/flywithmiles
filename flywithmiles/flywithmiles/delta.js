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
  loadImages: false,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11'
};

if (!casper.cli.has("origin") || !casper.cli.has("destination") || !casper.cli.has("depart_date")) {
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
  casper.on('error', function(msg, backtrace) {
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

var dateObject = new Date(depart_date);
var ISODate = dateObject.toISOString();
var depart_date = moment(ISODate).format("MM-DD-YYYY");

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

/*
casper.start('http://www.delta.com/awards/home.do?EventId=ENTER_APPLICATION', function() { });

casper.waitForSelector('#FlightSearch', function() {
  
  ths.fill('form[id="FlightSearch"]', {
    'departureCity[0]' : 'ATL',
    'destinationCity[0]' : 'JFK',
    'departureDate[0]' : '11/24/2014'
  }, true);
});
 */
casper.start();
casper.thenOpen('https://www.delta.com/air-shopping/findFlights.action', {
  method: 'post',
  data: {
             'searchType' : 'simple',
             'bookingPostVerify' : 'RTR_YES',
             'bundled' : 'off',
             'deltaOnly' : 'off',
             'dl' : 'y',
             'departureTime' : 'AT',
             'returnTime' : 'AT',
             'directServiceOnly' : 'off',
             'dispatchMethod' : 'findFlights',
             'fareBundle' : 'B5-Coach',
             'flexMainRTRTravelDate' : 'off',
             'MUUpgrade' : 'on',
             'showMUUpgrade' : 'on',
             'preferItinId' : '',
             'medallionTraveler' : '0',
             'displayPreferredOnly' : '0',
             'calendarSearch' : 'false',
             'pricingSearch' : 'true',
             'directServiceOnly' : 'off',
             'hiddenFieldsId' : '',
             'iamtravelling' : 'true',
             'awardTravel' : 'true',
             'tripType' : 'ONE_WAY',
             'originCity' : 'JFK',
             'destinationCity' : 'SFO',
             'departureDate' : '1/15/2015',
             'returnDate' : '',
             'is_Flex_Search' : 'false',
             'action' : 'findFlights',
             'pageName' : 'advanceSearchPage',
             'datesFlexible' : 'false',
             'flexDays' : '3',
             'cabinFareClass' : 'economyBasic',
             'is_award_travel' : 'true',
             'paxCount' : '1',
             '__checkbox_smTravelling' : 'true',
             '__checkbox_upgradeRequest' : 'true'
  }
});

// expand to show all award fares
casper.waitForSelector("#_compareFareClass_tmplHolder", function() {
  this.click('#showAll');
  // this.wait(250);     
});

// Wait for AJAX request to finish
casper.waitForResource("ResummarizeFlightResultsDWR.pageResults.dwr", function() {
  // casper.then(function() {
  // if times out, write response to log file
  
  var data = this.evaluate(function() {
    // var routes = jQuery('html').html(); 
    
    // Convenience function for simulating a mouse click
    // jQuery click embedded on Delta does not work to expand details, work around below
    var clickElement = function(el) {
      if (typeof(el) === 'object') {
        var ev = document.createEvent("MouseEvent");
        ev.initMouseEvent(
          "click",
          true /* bubble */ ,
          true /* cancelable */ ,
          window, null,
          0, 0, 0, 0, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/ , null
        );
        el.dispatchEvent(ev);
      }
    };

    // loop through and expand all legs
    var i = 0;
    $('.detailLinkHldr a').map(function() {
      clickElement($('.detailLinkHldr a')[i]);
      i++;
    });

    var routes = [];
    var parseFares = function() {
    
    $('.tableHeaderHolderFare').map(function() { 

      var legs = [];
      var availability = [];

        /*
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
        */
        
        $(this).find('.fareRowDetailsContainer').map(function() {
          if ($('.alertMsgWrapper', this).length == 0) {
                
              legs.push({
                depart: $(this).find('.detailsRow p:eq(0) .detailsOrigin.airportInfo').text(),
                depart_datetime: $(this).find('.detailsRow p:eq(0)').contents().filter(function() {
                return this.nodeType == 3;
              }).text().replace('()', '').trim(),
                arrival: $(this).find('.detailsRow p:eq(1) .detailsDestination.airportInfo').text(),
                arrival_datetime: $(this).find('.detailsRow p:eq(1)').contents().filter(function() {
                return this.nodeType == 3;
              }).text().replace('()', '').trim(),
                operated: $(this).find('.detailsRow p:eq(2) span:eq(1)').text().trim().slice(0,2),
                flight_number: $(this).find('.detailsRow p:eq(2) span:eq(1)').text(),
                availability: availability.join()
              });
      
            };
        
         });
         routes.push(legs);  
         
        });
      };

    parseFares();
                              
    return routes;
  });
    
  this.echo(JSON.stringify(data));

  try {
    fs.write("response-delta.html", data, 'w');
  } catch(e) {
      console.log(e);
  }
  
}, function() {

  // if times out, write response to log file
  var html = this.evaluate(function() {
    data = jQuery('html').html();
    return data;
  });

  try {
    fs.write("log-delta.html", html, 'w');
  } catch (e) {
    console.log(e);
  }

}, 15000);

casper.run();
