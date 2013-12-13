var app = {
	//////////////////////////////////////////
	//// CONSTRUCTOR
	//////////////////////////////////////////
    init: function() {
		app.getData();
		this.serverlocation = "http://localhost/smiley/";
	
		app.displayPie("pie", 18.373, 18.686, 2.867, 23.991, 9.592);
		app.displayChart("chart", "#00af00", 0, 2, 1, 5, 4, 3, 5);
	},
	getData: function(){
/*		var end = new Date();
		var start = new Date(end.getTime() - 1000 * 60 * 60 * 24 * 7); 
	
		var data = {"action": "data", "macid": "2afaj1", "start": start.getTime(), "end": end.getTime()};
		console.log(data);
		
		$.ajax({
			url: app.serverlocation,
			type: "POST",
			data: data,
			dataType: "json"
		})
		.done(function (response, textStatus, jqXHR){
			var resp = JSON.parse(JSON.stringify(response));
			console.log(resp);
		})
		.fail(function (jqXHR, textStatus, errorThrown){
			console.log(textStatus + " - " + errorThrown);
		});*/
	},
	displayPie: function(element, s1, s2, s3, s4, s5) {
		var paper = Raphael(element);
		paper.piechart(
			120,	// pie center x coordinate
			120,	// pie center y coordinate
			120,		// pie radius
			[s1,s2,s3,s4,s5], // values
			{	// options
				sort: false,
				legend: ["Meget glad", "Glad", "Hverken glad eller sur", "Sur", "Meget sur"],
				colors: ["#00ff00", "#00aa00", "#666666", "#aa0000", "#ff0000"]
			}
		);
	},
	
	// Note: Reinvoke on same element to draw an extra line
	displayChart: function(element, linecolor, d1, d2, d3, d4, d5, d6, d7) {
		var paper = Raphael(element);
		// first line
		paper.linechart(0, 0, 500, 200,
			[10, 11, 12, 13, 14, 15, 16],
			[d1, d2, d3, d4, d5, d6, d7],
			{
				axis: "0 0 1 1",
				axisxstep: 6,
				axisystep: 5,
				smooth: true,
				colors: [linecolor]
			}
		);
		
		$("svg>text>tspan").each(function() {
			
		});
	}
};