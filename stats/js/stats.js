// GET parameters
// from: https://gist.github.com/varemenos/2531765
function getUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && unescape(result[1]) || ""; 
}

// returns date as danish date, e.g. 13. Dec. 2013
function getDanishDate(date) {
	var months  = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
	return date.getDate() + ". " + months[date.getMonth()] + ". " + date.getFullYear();
} 

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
		
		
		// Populate summary, table and pie chart
		app.getDataWhat(function() {
			console.log(app.data);

			// Find values for summary
			var number_of_responds = 0;
			var cumulative_satisfaction = 0;
			var number_of_satisfied = 0;
			var number_of_dissatisfied = 0;

			for (var i = 0; i < 5; i++) {
				var r_column = 0;
				for (var j = 0; j < 3; j++) {
					number_of_responds += app.data[0][j][i];
					cumulative_satisfaction += app.data[0][j][i] * (5 - i);
					if (i == 0) {
						number_of_satisfied += app.data[0][j][i];
					} else if (i == 4) {
						number_of_dissatisfied += app.data[0][j][i];
					}
						
					$("#entry_"+j+i).html(app.data[0][j][i]);
					
					r_column += app.data[0][j][i];
				}
				$("#entry_3"+i).html(r_column);
			}

			// Fill summary
			if (number_of_responds > 0) {
				$("#satis_happy").html((100.0 * (number_of_satisfied / number_of_responds)).toFixed(2));
				$("#satis_unhappy").html((100.0 * (number_of_dissatisfied / number_of_responds)).toFixed(2));
				$("#satis_general").html((20.0 * (cumulative_satisfaction / number_of_responds)).toFixed(2));
			}
			$("#number_of_responds").html(number_of_responds);
			$("#entry_35").html(number_of_responds);
			$("#date_start").html(getDanishDate(app.oneWeekAgo));
			$("#date_end").html(getDanishDate(app.now));
			
			// Fill pie chart
			var testdata = app.returnWhatDataWeekly(number_of_responds);
			nv.addGraph(function() {
				var width = 600,
					height = 600;

				var chart = nv.models.pieChart()
					.x(function(d) { return d.key })
					.y(function(d) { return d.val })
					.showLabels(true)
					.width(width)
					.height(height);
				chart.color(['#008800', '#00ff00', '#aaaaaa', '#ff0000', '#880000']);
				chart.tooltipContent(function(key, y, e, graph) { return y + " %" })
				chart.margin({top: 50, right: 50, bottom: 50, left: 50});
				
				d3.select("#pie svg").datum(testdata)
					.transition().duration(1200)
					.attr('width', width)
					.attr('height', height)
					.call(chart);
				return chart;
			});	
		});
		
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
				chart.margin({top: 50, right: 150, bottom: 50, left: 150});
 
				d3.select('#chart svg').datum(testdata).transition().duration(500).call(chart);
				nv.utils.windowResize(function() { d3.select('#chart svg').call(chart) });
				return chart;
			});
		});
	},
	getDataWhat: function(callback){
		var da = {"action": "dataWhat", "macid": app.macid, "today": app.now.getTime()};
		$.ajax({url: config.serverlocation, 
			   type: "GET",
			   data: da,
			   dataType: "text"
		})
		.done(function(response, textStatus, jqXHR) {
			console.log(response);
			app.data = JSON.parse(response);
		})
		.always(function() {
			callback();
		});
	},
	
	getDataOverTime: function(callback){
		var da = {"action": "dataPerDay", "macid": app.macid};
		$.ajax({url: config.serverlocation, 
			   type: "GET",
			   data: da,
			   dataType: "text"
		})
		.done(function(response, textStatus, jqXHR) {
			app.data = JSON.parse(response);
		})
		.always(function() {
			callback();
		});
	},
	// return data formatted for "piechart: smiley distribution this week"
	returnWhatDataWeekly: function(numberOfEntries) {
		var d = new Array();
		for (var i = 0; i < app.data[0][0].length; i++) {
			var tx = app.smileyText[4-i];
			var val = 0;
			for (var j = 0; j < app.data[0].length; j++) {
				val += app.data[0][j][i];
			}
			val = val / numberOfEntries * 100.0;
			d.push({key: tx, val: val});
		}
		return d;
	},
	// Return data formatted for "graph: development over time"
	returnGraphDataPerDay: function() {
		var d = new Array();
		for (var i = 0; i < app.data.length; i++) {
			d.push([((new Date(app.data[i].Date)).getTime()), app.data[i].AvgSmiley]);
		}
		return [ 
		{	"key" : "Tilfredshed" , 
			"bar": false,
			"values" : d
		}].map(function(series) {
			series.values = series.values.map(function(d) { return {x: d[0], y: d[1] } });
			return series;
		}); 
	}
};
