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

if (casper.cli.has("username")) {
  var username = casper.cli.raw.get("username");
}

if (casper.cli.has("password")) {
  var password = casper.cli.raw.get("password");
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
var dayDate = moment(ISODate).format("DD"); // BUG some reason shows prior day?
var monthYearDate = moment(ISODate).format("YYYYMM");

// console.log(monthYearDate);

casper.start('https://www.airfrance.us/cgi-bin/AF/US/en/local/process/awardbooking/SearchAction.do', function() { });

casper.waitForSelector("#label_identifiant", function() {
  this.fill('form[name="LOGIN"]', {
      'login' : username, // '2117638315',
      'password': password, // '0502'
  }, false);
  
  this.click('a[id="idValidate"]');
});

casper.thenOpen('https://www.airfrance.us/cgi-bin/AF/US/en/local/process/awardbooking/SearchAction.do');

casper.waitForSelector("#awardPageContent", function() {
  this.fill('form[name="awardSearchForm"]', {
      'departure': origin,
      'arrival' : destination,
      'calendarSearch' : '',
      'dayDate' : dayDate,
      'monthYearDate' : monthYearDate,
      'outboundFlex': '0',
      'nbPassenger' : passenger
  }, true);
});

casper.waitForText("Select your departing flight", function() {
  var data = this.evaluate(function() {
    
    var routes = [];
    jQuery('table.upsell table.upsellRow').map(function() {
      
      var legs = [];
      var availability = [];
      
      if (jQuery('td:eq(4) input', this).length > 0) {
        availability.push('Economy');
      }
      
      if (jQuery('td:eq(5) input', this).length > 0) {
        availability.push('Premium Economy');
      }
      
      if (jQuery('td:eq(6) input', this).length > 0) {
        availability.push('Business');
      }
      
      jQuery('tbody tr', this).map(function() {
        legs.push({
          depart: jQuery(this).find('.departureCol3').contents().filter(function() {
            return this.nodeType == 3;
          }).text().replace(',','').trim(),
          depart_datetime: jQuery(this).find('.departureCol3 span').text(),
          arrival: jQuery(this).find('.arrivalCol3').contents().filter(function() {
            return this.nodeType == 3;
          }).text().replace(',','').trim(),
          arrival_datetime: jQuery(this).find('.arrivalCol3 b').text(),
          operated: jQuery(this).find('.flightCol3').text().trim().slice(0,2),
          flight_number: jQuery(this).find('.flightCol3').text().trim(),
          availability: availability.join()
        });
      });
      routes.push(legs);
      
    });

    return routes;
  });
      
  this.echo(JSON.stringify(data));

  /*
  try {
    fs.write("response-af.html", data, 'w');
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
    fs.write("log-af.html", html, 'w');
  } catch (e) {
    console.log(e);
  }

}, 15000);

casper.run();
