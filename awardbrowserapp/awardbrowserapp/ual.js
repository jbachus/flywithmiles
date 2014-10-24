var fs = require('fs');
var utils = require('utils');
var system = require('system');
var moment = require('moment');

var casper = require('casper').create();

casper.options.pageSettings = {
	loadImages:  false,
  clientScripts:  [
  	'jquery.min.js'
  ],
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

var passenger = 1
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

casper.thenOpen('http://www.united.com/web/en-US/Default.aspx', function() {
  this.fill('form[name="aspnetForm"]', {
      'ctl00$ContentInfo$Booking1$SearchType' : 'rdoSearchType1',
      'ctl00$ContentInfo$Booking1$Origin$txtOrigin' : origin,
      'ctl00$ContentInfo$Booking1$Destination$txtDestination' : destination,
      'ctl00$ContentInfo$Booking1$DepDateTime$Depdate$txtDptDate' : depart_date,
      'ctl00$ContentInfo$Booking1$SearchBy$SearchBy' : 'rdosearchby3',
      'ctl00$ContentInfo$Booking1$Adult$cboAdult' : passenger
  });

  this.click('#ctl00_ContentInfo_Booking1_btnSearchFlight');
});

casper.waitForUrl('http://www.united.com/web/en-US/apps/booking/flight/searchResultAward1.asp', function() {

  var data = this.evaluate(function() {

    var routes = [];
    $('[id*="trNonStop"], [id*="trPartnerStops"], [id*="trFlightsWithStops"]').nextUntil("[id]").map(function() 
    {           
      var availability = [];
      var legs = [];
      
      if ($(this).find('.tdRewardPrice:eq(0) .divMileage').text()) {
        availability.push('Saver Award');
      } 
  
      if ($(this).find('.tdRewardPrice:eq(1) .divMileage').text()) {
        availability.push('Standard Award');
      } 
  
      if ($(this).find('.tdRewardPrice:eq(2) .divMileage').text()) {
        availability.push('First/Business Saver Award');
      } 
  
      if ($(this).find('.tdRewardPrice:eq(3) .divMileage').text()) {
        availability.push('First/Business Standard Award');
      }      
      
      $(this).find('.tdSegmentBlock > table > tbody > tr').map(function() {
        if (!$(this).find('td').hasClass('tdStopMsg') && !$(this).find('td').hasClass('tdEquipMsg')) 
        {
          var operated = "United";
          if ($(this).find('.tdSegmentDtl div:eq(1)').text() != "") {
            operated = $(this).find('.tdSegmentDtl div:eq(1)').text();
          }
          
          legs.push({
             depart: $(this).find('.tdDepart div:eq(3)').text(),
             depart_datetime: $(this).find('.tdDepart div:eq(1)').text(), // + ' ' + $(this).find('.tdDepart div:eq(2)').text(),
             arrival: $(this).find('.tdArrive div:eq(3)').text(),
             arrival_datetime: $(this).find('.tdArrive div:eq(1)').text(), // + $(this).find('.tdDepart div:eq(2)').text(),
             flight_time: $(this).find('.tdTrvlTime > span:eq(0)').text().replace(/Flight Time:/g, "").replace(/Travel Time:/g, ""), // BUG: Needs additional handling for direct flights
             aircraft: $(this).find('.tdSegmentDtl div:eq(2) > b').text(),
             operated: operated,
             flight_number: $(this).find('.tdSegmentDtl div:eq(0)').text().replace(/Flight\: /g, ""),
             availability: availability.join()
          });
        }
      });
      routes.push(legs);
    });
    
    return routes;
 	});	
    
  this.echo (JSON.stringify(data));
  
}, function() {
  
  // if times out, write response to log file
  var html = this.evaluate(function() {
    data = jQuery('html').html(); 
    return data;
  });
  
  try {
    fs.write("log-ual.html", html, 'w');
  } catch(e) {
      console.log(e);
  }
  
}, 15000);

casper.run();