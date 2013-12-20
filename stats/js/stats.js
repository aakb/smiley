// GET parameters
function getUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && unescape(result[1]) || ""; 
}

// returns date as danish date, e.g. 13. Dec. 2013
function getDanishDate(date) {
	//var weekday = ["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"];
	var months  = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
	
	return date.getDate() + ". " + months[date.getMonth()] + ". " + date.getFullYear();
} 

var app = {
	//////////////////////////////////////////
	//// CONSTRUCTOR
	//////////////////////////////////////////
    init: function() {
		this.macid = getUrlVar("macid");
	
		this.aDay = 1000 * 60 * 60 * 24;
		this.now = new Date();
		this.oneWeekAgo = new Date(app.now.getTime() - 7 * app.aDay);
		this.smileyText = ["Meget utilfreds", "Utilfreds", "Hverken/eller", "Tilfreds", "Meget tilfreds"];
		
		// Populate summary, table and pie chart
		app.getDataWhat(function() {
			// Find values for summary
			var number_of_responds = 0;
			var cumulative_satisfaction = 0;
			var number_of_satisfied = 0;
			var number_of_dissatisfied = 0;

			for (var i = 0; i < 5; i++) {
				var r_column = 0;
				for (var j = 0; j < 3; j++) {
					number_of_responds += app.data[0][j][i];
					cumulative_satisfaction += app.data[0][j][i] * (i+1);
					if (i == 4)
						number_of_satisfied += app.data[0][j][i];
					else if (i == 0)
						number_of_dissatisfied += app.data[0][j][i];
						
					$("#entry_"+j+i).html(app.data[0][j][i]);
					
					r_column += app.data[0][j][i];
				}
				$("#entry_3"+i).html(r_column);
			}

			// Fill summary
			$("#satis_happy").html((100.0 * (number_of_satisfied / number_of_responds)).toFixed(2));
			$("#satis_unhappy").html((100.0 * (number_of_dissatisfied / number_of_responds)).toFixed(2));
			$("#number_of_responds").html(number_of_responds);
			$("#satis_general").html((20.0 * (cumulative_satisfaction / number_of_responds)).toFixed(2));
			$("#date_start").html(getDanishDate(app.oneWeekAgo));
			$("#date_end").html(getDanishDate(app.now));
			$("#entry_35").html(number_of_responds);
			
			// Fill pie chart
			var testdata = app.returnWhatDataWeekly(number_of_responds);
			nv.addGraph(function() {
				var width = 500,
					height = 500;

				var chart = nv.models.pieChart()
					.x(function(d) { return d.key })
					.y(function(d) { return d.val })
					.showLabels(false)
					.width(width)
					.height(height);
				chart.color(['#880000', '#ff0000', '#aaaaaa', '#00ff00', '#008800']);
				chart.tooltipContent(function(key, y, e, graph) { return y + " %" })
				
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
 
				chart.xAxis.axisLabel('').tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); });
				chart.yAxis.tickValues([1,2,3,4,5]).axisLabel('')
					.tickFormat(function(d, i){
						if (d >= 4.5)
							return app.smileyText[4] + " (" + d + ")";
						else if (d < 4.5 && d >= 3.5)
							return app.smileyText[3] + " (" + d + ")";
						else if (d < 3.5 && d >= 2.5)
							return app.smileyText[2] + " (" + d + ")";
						else if (d < 2.5 && d >= 1.5)
							return app.smileyText[1] + " (" + d + ")";
						else
							return app.smileyText[0] + " (" + d + ")";
					});
				chart.margin({top: 50, right: 150, bottom: 50, left: 150});
 
				d3.select('#chart svg').datum(testdata).transition().duration(500).call(chart);
				nv.utils.windowResize(function() { d3.select('#chart svg').call(chart) });
				return chart;
			});
		});
	},
	getDataWhat: function(callback){
		var today = new Date();
		var t_today = today.getTime();
		
		var da = {"action": "dataWhat", "macid": app.macid, "today": t_today};
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
		var end = new Date();
		var start = new Date(0);
		
		var t_end   = end.getTime();
		var t_start = start.getTime();
		
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
			var tx = app.smileyText[i];
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
