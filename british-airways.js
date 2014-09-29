var fs = require('fs');
var system = require('system');
var casper = require('casper').create({
	/*
  clientScripts:  [
		'includes/jquery.min.js'
	],
  */
  
	pageSettings: {
		loadImages:  false,
    loadPlugins: false,
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11'
	},
});

casper.onResourceRequested = function (request) {
    system.stderr.writeLine('= onResourceRequested()');
    system.stderr.writeLine('  request: ' + JSON.stringify(request, undefined, 4));
};
 
casper.onResourceReceived = function(response) {
    system.stderr.writeLine('= onResourceReceived()' );
    system.stderr.writeLine('  id: ' + response.id + ', stage: "' + response.stage + '", response: ' + JSON.stringify(response));
};
 
casper.onLoadStarted = function() {
    system.stderr.writeLine('= onLoadStarted()');
    var currentUrl = page.evaluate(function() {
        return window.location.href;
    });
    system.stderr.writeLine('  leaving url: ' + currentUrl);
};
 
casper.onLoadFinished = function(status) {
    system.stderr.writeLine('= onLoadFinished()');
    system.stderr.writeLine('  status: ' + status);
};
 
casper.onNavigationRequested = function(url, type, willNavigate, main) {
    system.stderr.writeLine('= onNavigationRequested');
    system.stderr.writeLine('  destination_url: ' + url);
    system.stderr.writeLine('  type (cause): ' + type);
    system.stderr.writeLine('  will navigate: ' + willNavigate);
    system.stderr.writeLine('  from page\'s main frame: ' + main);
};
 
casper.onResourceError = function(resourceError) {
    system.stderr.writeLine('= onResourceError()');
    system.stderr.writeLine('  - unable to load url: "' + resourceError.url + '"');
    system.stderr.writeLine('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
};
 
casper.onError = function(msg, trace) {
    system.stderr.writeLine('= onError()');
    var msgStack = ['  ERROR: ' + msg];
    if (trace) {
        msgStack.push('  TRACE:');
        trace.forEach(function(t) {
            msgStack.push('    -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    system.stderr.writeLine(msgStack.join('\n'));
};


if (!casper.cli.has("origin") || ! casper.cli.has("destination") || ! casper.cli.has("depart_date")) {
	casper.echo("Required arguments missing: --origin=xxx --destination=xxx \n Additional options: --debug --verbose");
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

casper.options.waitTimeout = 60000;

casper.start('https://www.britishairways.com/travel/redeem/execclub/_gf/en_us', function() { });

casper.waitForSelector("#execLoginrForm", function() {
  this.fill('form[name="form1"]', {
      'membershipNumber' : 'jchum@primoplace.com',
      'password': 'Pnko1b9r'
  }, true);
});

// #plan_trip appears after the page is fully authenticated
casper.waitForSelector("#plan_trip", function() { });

casper.thenOpen('https://www.britishairways.com/travel/redeem/execclub/_gf/en_us?eId=106019&tab_selected=redeem&redemption_type=STD_RED', function() { });
      
casper.waitForSelector("#plan_redeem_trip", function() { });   
      
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
      'departurePoint' : 'JFK',
      'destinationPoint' : 'LHR',
      'departInputDate' : '09/30/2014',
      'oneWay' : 'true',
      'CabinCode' : 'M',
      'RestrictionType' : 'Restricted',
      'NumberOfAdults' : '1',
      'NumberOfChildren' : '0',
      'NumberOfInfants' : '0',
      'submit' : 'Get flights'
    }
});

casper.thenOpen('https://www.britishairways.com/travel/redeem/execclub/_gf/en_us?eId=100028', {
    method: 'post',
    data:   {
      'stopoverOptions' : 'No',
      'display' : 'Continue',
      'tab_selected' : 'redeem',
      'upgradeType' : 'null',
      'departurePoint' : 'JFK',
      'destinationPoint' : 'LHR',
      'departInputDate' : '09/30/2014',
      'departureStopoverPoint' : '',
      'stopOverDepartInputDate' : '',
      'upgradeType': null
    }
});
   
casper.then(function() {
    
  this.page.injectJs('includes/jquery.min.js');
  var js = this.evaluate(function() {
    // data = $('html').html(); 
    // return data;
    
    var fares = [];
    $('#directflightList0 .compact .flightListTable').map(function() {
      var routes = [];
      routes.push({
         depart: $(this).find('.departure .airportCodeLink').text(),
         depart_datetime : $(this).find('.departure .departtime').text() + ' ' + $(this).find('.departure .departdate').text(),
         arrival:  $(this).find('.arrival .airportCodeLink').text(),
         arrival_datetime: $(this).find('.arrival .arrivaltime').text() + ' ' + $(this).find('.arrival .arrivaldate').text(),
         flight_time: $(this).find('.journeyTime').text(),
         // aircraft: $(this).find('.flightPopUp').text(),
         operated: $(this).find('input[name="MainLineCarrierCode"]')[0].value,
         flight_number: $(this).find('.flightPopUp').text()
      });
      
      fares.push(routes);
    });
    
    $('#indirectflightList0 .flightListTable').map(function() {
      
      var routes = [];
      $(this).find('tr[id]').not(':hidden').map(function () {
        routes.push({
          depart: $(this).find('.departure .airportCodeLink').text(),
          depart_datetime :  $(this).find('.departure .departtime').text() + ' ' + $(this).find('.departure .departdate').text(),
          arrival:   $(this).find('.arrival .airportCodeLink').text(),
          arrival_datetime:  $(this).find('.arrival .arrivaltime').text() + ' ' + $(this).find('.arrival .arrivaldate').text(),
          flight_time:  $(this).find('.journeyTime').text(),
          // aircraft: $(this).find('.flightPopUp').text(),
          operated:  ($(this).find('input[name="MainLineCarrierCode"]')[0] != undefined) ? $(this).find('input[name="MainLineCarrierCode"]')[0].value : '',
          flight_number:  $(this).find('.flightPopUp').text()
        });        
      });
      
      fares.push(routes);
    });
    
    return JSON.stringify(fares);
    
  });
  
  try {
    fs.write("output.html", js, 'w');
  } catch(e) {
      console.log(e);
  }
  
  // this.echo (js);
});

/*
casper.waitFor(function check() {
    // this.page.injectJs('includes/jquery.min.js');
  
    return this.evaluate(function() {
       return $('#outFlightListHeadingContainer').length > 0;
    });
}, function then() {
    
  var js = this.evaluate(function() {
    data = $('html').html(); 
    return data;
  });
  
  this.echo (js);
  
}, function timeout() { 
    this.echo (JSON.stringify({error: 'Timed out fetching dialog award details'}));
}, 50000);
*/


casper.run();