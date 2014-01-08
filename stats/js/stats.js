// GET parameters
// from: https://gist.github.com/varemenos/2531765
function getUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && unescape(result[1]) || ""; 
}

// Returns date as danish date, e.g. 13. Dec. 2013
function getDanishDate(date) {
	var months  = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
	return date.getDate() + ". " + months[date.getMonth()] + ". " + date.getFullYear();
} 

// Returns the first day of the week defined by the (year, week) input
// from: http://stackoverflow.com/questions/7580824/how-to-convert-a-week-number-to-a-date-in-javascript
function firstDayOfWeek(year, week) {
    var d = new Date(year, 0, 1), offset = d.getTimezoneOffset();
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
	var w = week;
	if (year == d.getFullYear()) {
		w = w - 1;
	}
    d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000 * w);
    d.setTime(d.getTime() + (d.getTimezoneOffset() - offset) * 60 * 1000);
    d.setDate(d.getDate() - 3);
    return d;
}

var app = {
	//////////////////////////////////////////
	//// CONSTRUCTOR
	//////////////////////////////////////////
    init: function() {
		// Constants
		this.aDay = 1000 * 60 * 60 * 24;
		this.smileyText = ["Meget utilfreds", "Utilfreds", "Hverken/eller", "Tilfreds", "Meget tilfreds"];

		// Get macid from param "macid", if empty return empty page
		this.macid = getUrlVar("macid");
		if (this.macid == "") {
			$("body").html("");
			return;
		}
		
		// Set now and a week ago to week/year if set, else to now and a week ago.
		this.week = getUrlVar("week");
		this.year = getUrlVar("year");
		if (app.week != "" && app.year != "") {
			if (app.week < 1 || app.week > 52) {
				$("body").html("");
				return;
			}
			this.oneWeekAgo = firstDayOfWeek(app.year, app.week);
			this.now = new Date(app.oneWeekAgo.getTime() + 7 * app.aDay);
			$("#week_text").html(" (uge " + app.week + ", " + app.year + ")");
		} else {
			this.now = new Date();
			this.oneWeekAgo = new Date(app.now.getTime() - 7 * app.aDay);
		}
		
		// Summary, table and pie chart
		app.getDataWhat(function() {
			// Values for summary
			var number_of_respondents = 0;
			var cumulative_satisfaction = 0;		// contains sum of values (5,4,3,2,1) of smileys
			var number_of_satisfied = 0;
			var number_of_dissatisfied = 0;

			// Fill table with values, and find values for summary
			for (var i = 0; i < 5; i++) {
				var r_column = 0;
				for (var j = 0; j < 3; j++) {
					number_of_respondents += app.data[j][i];
					cumulative_satisfaction += app.data[j][i] * (5 - i);
					if (i == 0) {
						number_of_satisfied += app.data[j][i];
					} else if (i == 4) {
						number_of_dissatisfied += app.data[j][i];
					}
						
					$("#entry_"+j+i).html(app.data[j][i]);
					
					r_column += app.data[j][i];
				}
				$("#entry_3"+i).html(r_column);
			}

			var satisfaction_general = 0.0;
			
			// Fill summary
			if (number_of_respondents > 0) {
				$("#satis_happy").html((100.0 * (number_of_satisfied / number_of_respondents)).toFixed(2));
				$("#satis_unhappy").html((100.0 * (number_of_dissatisfied / number_of_respondents)).toFixed(2));
				satisfaction_general = (20.0 * (cumulative_satisfaction / number_of_respondents)).toFixed(2);
				$("#satis_general").html(satisfaction_general);
				
				// Compare with past
				app.getDataWhatPast(function() {
					var number_of_respondents_past = 0;
					var cumulative_satisfaction_past = 0;		// contains sum of value (5,4,3,2,1) of smileys
				
					for (var i = 0; i < 5; i++) {
						var r_column_past = 0;
						for (var j = 0; j < 3; j++) {
							number_of_respondents_past += app.datapast[j][i];
							cumulative_satisfaction_past += app.datapast[j][i] * (5 - i);
							r_column_past += app.datapast[j][i];
						}
					}
					
					var satisfaction_general_past = 0;
					if (number_of_respondents_past > 0) {
						// For each entry show comparison with past
						for (var i = 0; i < 5; i++) {
							for (var j = 0; j < 3; j++) {
								var comp = (100.0 * (app.data[j][i] / number_of_respondents - app.datapast[j][i] / number_of_respondents_past)).toFixed(2);
								if (comp > 0.0) {
									$("#entry_"+j+i).append("<br/>(+" + comp + " %)");
								} else if (comp < 0.0) {
									$("#entry_"+j+i).append("<br/>(" + comp + " %)");
								}
							}
						}

						satisfaction_general_past = (20.0 * (cumulative_satisfaction_past / number_of_respondents_past)).toFixed(2);
					}

					// Compare general satisfaction with past
					var satisfaction_general_compare = (satisfaction_general - satisfaction_general_past).toFixed(2);
					if (satisfaction_general_compare > 0.0) {
						$("#satis_general_past").html("(<span class=\"color_green\">+" + satisfaction_general_compare + " % </span> over gennemsnittet)");
					} else if (satisfaction_general_compare < 0.0) {
						$("#satis_general_past").html("(<span class=\"color_red\">" + satisfaction_general_compare + " % </span> under gennemsnittet)");
					}
				});
			}
			// Fill summary and table
			$("#number_of_respondents").html(number_of_respondents);
			$("#entry_35").html(number_of_respondents);
			$("#date_start").html(getDanishDate(app.oneWeekAgo));
			$("#date_end").html(getDanishDate((new Date(app.now.getTime() - app.aDay))));
						
			
			// Fill pie chart
			var testdata = app.returnWhatDataWeekly(number_of_respondents);
			nv.addGraph(function() {
				var width = 600;
				var height = 600;

				var chart = nv.models.pieChart();
				chart.x(function(d) { return d.key });
				chart.y(function(d) { return d.val });
				chart.showLabels(true);
				chart.showLegend(false);
				chart.width(width);
				chart.height(height);
				chart.color(['#008800', '#00ff00', '#aaaaaa', '#ff0000', '#880000']);
				chart.tooltipContent(function(key, y, e, graph) { return y + " %" });
				chart.margin({top: -50, right: 50, bottom: 50, left: 50});
				
				d3.select("#pie svg").datum(testdata).transition().duration(1200).attr('width', width).attr('height', height).call(chart);
				return chart;
			});	
		});
		
		// Graph: development over time
		app.getDataOverTime(function() {
			var testdata = app.returnGraphDataPerDay();
			
			nv.addGraph(function() {
				var chart = nv.models.lineChart();
				chart.forceY( [1,5]);
 
				chart.xAxis.axisLabel('').tickFormat(function(d) { return d3.time.format('%d/%m-%Y')(new Date(d)); });
				chart.yAxis.tickValues([1,2,3,4,5]).axisLabel('')
					.tickFormat(function(d, i){
						var dd = parseFloat(d).toFixed(2);
						if (dd >= 4.5)
							return app.smileyText[4] + " (" + dd + ")";
						else if (dd < 4.5 && d >= 3.5)
							return app.smileyText[3] + " (" + dd + ")";
						else if (dd < 3.5 && d >= 2.5)
							return app.smileyText[2] + " (" + dd + ")";
						else if (dd < 2.5 && d >= 1.5)
							return app.smileyText[1] + " (" + dd + ")";
						else
							return app.smileyText[0] + " (" + dd + ")";
					});
				chart.margin({top: 50, right: 50, bottom: 50, left: 150});
 
				d3.select('#chart svg').datum(testdata).transition().duration(500).call(chart);
				nv.utils.windowResize(function() { d3.select('#chart svg').call(chart); });
				return chart;
			});
		});
	},
	// Get data for "piechart" and "table"
	getDataWhat: function(callback){
		var input_data = {"action": "dataWhat", "macid": app.macid, "today": app.now.getTime()};
		$.ajax({url: config.serverlocation, 
			   type: "GET",
			   data: input_data,
			   dataType: "text"
		})
		.done(function(response, textStatus, jqXHR) {
			app.data = JSON.parse(response);
		})
		.always(function() {
			callback();
		});
	},
	// Get data for past
	getDataWhatPast: function(callback){
		var input_data = {"action": "dataWhatPast", "macid": app.macid, "end": app.oneWeekAgo.getTime()};
		$.ajax({url: config.serverlocation, 
			   type: "GET",
			   data: input_data,
			   dataType: "text"
		})
		.done(function(response, textStatus, jqXHR) {
			app.datapast = JSON.parse(response);
		})
		.always(function() {
			callback();
		});
	},
	// Get data for "graph: development over time"
	getDataOverTime: function(callback){
		var input_data = {"action": "dataPerDay", "macid": app.macid};
		$.ajax({url: config.serverlocation, 
			   type: "GET",
			   data: input_data,
			   dataType: "text"
		})
		.done(function(response, textStatus, jqXHR) {
			app.dataovertime = JSON.parse(response);
		})
		.always(function() {
			callback();
		});
	},
	// Return data formatted for "piechart" and "table"
	returnWhatDataWeekly: function(numberOfEntries) {
		var data = new Array();
		for (var i = 0; i < app.data[0].length; i++) {
			var text = app.smileyText[4-i];
			var value = 0;
			for (var j = 0; j < app.data.length; j++) {
				value += app.data[j][i];
			}
			value = value / numberOfEntries * 100.0;
			data.push({key: text, val: value});
		}
		return data;
	},
	// Return data formatted for "graph: development over time"
	returnGraphDataPerDay: function() {
		var data = new Array();
		for (var i = 0; i < app.dataovertime.length; i++) {
			data.push([((new Date(app.dataovertime[i].Date)).getTime()), app.dataovertime[i].AvgSmiley]);
		}
		return [ 
		{	"key" : "Tilfredshed" , 
			"bar": false,
			"values" : data
		}].map(function(series) {
			series.values = series.values.map(function(d) { return {x: d[0], y: d[1] } });
			return series;
		}); 
	}
};
