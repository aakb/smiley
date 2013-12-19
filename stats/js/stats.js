function getUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && unescape(result[1]) || ""; 
}

var app = {
	//////////////////////////////////////////
	//// CONSTRUCTOR
	//////////////////////////////////////////
    init: function() {
		this.macid = getUrlVar("macid");
	
		this.aDay = 1000 * 60 * 60 * 24;

		app.getDataWhat(function() {
			
		});
		
		app.getDataPerDay(function() {
			var testdata = app.returnGraphDataPerDay();
			
			nv.addGraph(function() {
				var chart = nv.models.lineChart();
				chart.forceY( [1,5]);
 
				chart.xAxis.axisLabel('').tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); });
				chart.yAxis.tickValues([1,2,3,4,5]).axisLabel('')
				.tickFormat(function(d, i){
					if (d >= 4.5)
						return "Meget glad(" + d + ")";
					else if (d < 4.5 && d >= 3.5)
						return "Glad(" + d + ")";
					else if (d < 3.5 && d >= 2.5)
						return "Hverken/Eller(" + d + ")";
					else if (d < 2.5 && d >= 1.5)
						return "Sur(" + d + ")";
					else
						return "Meget sur(" + d + ")";
				});
				chart.margin({top: 50, right: 150, bottom: 50, left: 150});
 
				d3.select('#chart svg').datum(testdata).transition().duration(500).call(chart);
				nv.utils.windowResize(function() { d3.select('#chart svg').call(chart) });
				return chart;
			});
		});
		
		app.getDataAverageSmileyFromPeriod(function() {
			var testdata = app.returnPieDataWeekly();
			
			nv.addGraph(function() {
				var width = 500,
					height = 500;

				var chart = nv.models.pieChart()
					.x(function(d) { return d.key })
					.y(function(d) { return d.val })
					.showLabels(true)
					.labelThreshold(.05)
					.color(d3.scale.category10().range())
					.width(width)
					.height(height);
				chart.color(['#880000', '#ff0000', '#aaaaaa', '#00ff00', '#008800']);
		
				d3.select("#pie svg").datum(testdata)
					.transition().duration(1200)
					.attr('width', width)
					.attr('height', height)
					.call(chart);
				return chart;
			});	
		}, new Date((new Date()).getTime() - 7 * app.aDay), new Date());
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
	getDataPerDay: function(callback){
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
	getDataAverageSmileyFromPeriod: function(callback, firstdate, lastdate){
		var t_start = firstdate.getTime();
		var t_end   = lastdate.getTime();
		
		var da = {"action": "datapie", "macid": app.macid, "start": t_start, "end": t_end};
		
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
	returnPieDataWeekly: function() {
		var d = new Array();
		for (var i = 0; i < app.data.length; i++) {
			var tx = "";
			var opi = app.data[i][0];
			if (opi == 1)
				tx = "Meget sur";
			else if (opi == 2)
				tx = "Sur";
			else if (opi == 3)
				tx = "Hverken sur eller glad";
			else if (opi == 4)
				tx = "Glad";
			else if (opi == 5)
				tx = "Meget Glad";
			
			d.push({key: tx, val: app.data[i][1]});
		}
		return d;
	},
	// Return data formatted for "graph per day"
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
