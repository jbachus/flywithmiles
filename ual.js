var casper = require('casper').create({
	clientScripts:  [
		'includes/jquery.min.js'
	],
	pageSettings: {
		loadImages:  false,
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11'
	},

});

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

casper.options.waitTimeout = 20000;

casper.start();

casper.thenOpen('http://www.united.com/web/en-US/Default.aspx', function() {
  this.fill('form[name="aspnetForm"]', {
      'ctl00$ContentInfo$Booking1$SearchType' : 'rdoSearchType1',
      'ctl00$ContentInfo$Booking1$Origin$txtOrigin' : origin,
      'ctl00$ContentInfo$Booking1$Destination$txtDestination' : destination,
      'ctl00$ContentInfo$Booking1$DepDateTime$Depdate$txtDptDate' : depart_date,
      'ctl00$ContentInfo$Booking1$SearchBy$SearchBy' : 'rdosearchby3'
  });

  this.click('#ctl00_ContentInfo_Booking1_btnSearchFlight');
});

casper.waitForUrl('http://www.united.com/web/en-US/apps/booking/flight/searchResultAward1.asp', function() {

  var js = this.evaluate(function() {
 		data = $('#rewardSegments').html(); 
    
    var fare = []; 
    $('tr#ctl00_ContentInfo_resultsReward_showSegmentsReward1_ShowSegment_ctl00_trNonStop,' +
    'tr#ctl00_ContentInfo_resultsReward_showSegmentsReward1_ShowSegment_ctl00_trPartnerStops,' +
    'tr#ctl00_ContentInfo_resultsReward_showSegmentsReward1_ShowSegment_ctl00_trFlightsWithStops', data)
    .nextUntil('tr[id]').map(function() 
    {     
      var awards = [];
      var routes = [];
      $(this).find('.tdSegmentBlock > table > tbody > tr').map(function() {
        if (!$(this).find('td').hasClass('tdStopMsg') && !$(this).find('td').hasClass('tdEquipMsg')) 
        {
          routes.push({
             depart: $(this).find('.tdDepart div:eq(3)').text(),
             depart_datetime: $(this).find('.tdDepart div:eq(1)').text() + ' ' + $(this).find('.tdDepart div:eq(2)').text(),
             arrival: $(this).find('.tdArrive div:eq(3)').text(),
             arrival_datetime: $(this).find('.tdArrive div:eq(1)').text() + $(this).find('.tdDepart div:eq(2)').text(),
             flight_time: $(this).find('.tdTrvlTime > span:eq(0)').text().replace(/Flight Time:/g, "").replace(/Travel Time:/g, ""),
             aircraft: $(this).find('.tdSegmentDtl div:eq(2) > b').text(),
             operated: $(this).find('.tdSegmentDtl div:eq(1)').text(),
             flight_number: $(this).find('.tdSegmentDtl div:eq(0)').text().replace(/Flight\: /g, "")
          });
        }
      });
  
      if ($(this).find('.tdRewardPrice:eq(0) .divMileage').text()) {
        awards.push({
            award: 'Saver Award',
            mileage: $(this).find('.tdRewardPrice:eq(0) .divMileage').text()
          });
      } 
  
      if ($(this).find('.tdRewardPrice:eq(1) .divMileage').text()) {
        awards.push({
            award: 'Standard Award',
            mileage: $(this).find('.tdRewardPrice:eq(1) .divMileage').text()
          });
      } 
  
      if ($(this).find('.tdRewardPrice:eq(2) .divMileage').text()) {
        awards.push({
            award: 'First/Business Saver Award',
            mileage: $(this).find('.tdRewardPrice:eq(2) .divMileage').text()
          });
      } 
  
      if ($(this).find('.tdRewardPrice:eq(3) .divMileage').text()) {
        awards.push({
            award: 'First/Business Standard Award',
            mileage: $(this).find('.tdRewardPrice:eq(3) .divMileage').text()
          });
      }
  
      fare.push({
        awards: awards,
        route: routes
      });

    });
    
    return fare;
 	});	
    
  this.echo (JSON.stringify(js));
}, function() {
  
  this.echo (JSON.stringify({error: 'No awards founds'}));
  
});

casper.run();