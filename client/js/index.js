﻿var app = {
	//////////////////////////////////////////
	//// CONSTRUCTOR
	//////////////////////////////////////////
    init: function() {
		// Load HTML parts
		this.pageWelcome = $("#page_welcome").html();
		this.pageLogin = $("#page_login").html();
		this.pageRegister = $("#page_register").html();
		this.pageMain = $("#page_main").html();
		this.pageThanks = $("#page_thanks").html();
		
		$("#page_welcome").remove();
		$("#page_login").remove();
		$("#page_register").remove();
		$("#page_main").remove();
		$("#page_thanks").remove();
		
		$(document).on('touchmove', function(e) {
			e.preventDefault();
		});
		
		if(typeof(Storage)!=="undefined") {
			var macid = localStorage.getItem("macid");
		
			if (macid == null || macid == "") {
				app.showWelcomePage();
			} else {
				this.macid = macid;
				app.showMainPage();
			}
		} else {
			app.showWelcomePage();
		}
	},
	
	//////////////////////////////////////////
	//// DISPLAY PAGE FUNCTIONS
	//////////////////////////////////////////
	
	showWelcomePage: function() {
		// Change HTML content
		$("#main").html(app.pageWelcome);
		
		// Display number of uncommitted entries on button
		// Check if local storage is supported
		var nr = 0;
		if(typeof(Storage)!=="undefined") {
			var entries = JSON.parse(localStorage.getItem("entries"));
			if (entries !== null) {
				nr = entries.length;
			} 
		} else {
			alert("Advarsel: dette device understøtter ikke Web Storage, så hvis data ikke kan afleveres til serveren, går de tabt.");
		}
		$("#commit_button").html("Indsend (" + nr + ")");
		
		// Setup event listeners
		$("#login_button").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showLoginPage();
		});
		$("#reg_button").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showRegisterPage();
		});
		$("#commit_button").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.commitEntriesFromLocalStorage(function() {
				// Display number of uncommitted entries on button
				var nr = 0;
				if(typeof(Storage)!=="undefined") {
					var entries = JSON.parse(localStorage.getItem("entries"));
					if (entries !== null) {
						nr = entries.length;
					} 
				}
				$("#commit_button").html("Indsend (" + nr + ")");
			});
		});		
	},
	
	showRegisterPage: function() {
		// Change HTML content
		$("#main").html(app.pageRegister);

		// Custom validation of email repeat
		$("#mail_repeat").on("change", function() {
			if ($(this).val() !== $("#mail").first().val()) {
				document.getElementById("mail_repeat").setCustomValidity("Emails er ikke ens");
			} else {
				document.getElementById("mail_repeat").setCustomValidity("");
			}
		});

		// Setup form register submit button
		$("#form_register").submit(function(event) {
			event.preventDefault();
			
			var serializedData = $(this).serializeArray();
			
			// Disable inputs, during ajax request
			var $inputs = $(this).find("input");
			$inputs.prop("disabled", true);

			// Post data to server
			$.ajax({
				url: config.serverlocation,
				type: "POST",
				data: serializedData,
				dataType: "json"
			})
			.done(function (response, textStatus, jqXHR){
				var resp = JSON.parse(JSON.stringify(response));
				if (resp.result == "ok") {
					app.macid = resp.macid;
					app.saveMacidToLocalStorage(app.macid);
					alert("Registreringen lykkedes!\r\nID'et til denne opsætning er \r\n" + app.macid + "\r\nSkriv den ned, så du har den til næste gange du skal logge denne maskine ind.");
					app.showMainPage();
				} else if (resp.result == "error") {
					if (resp.msg = "error_machine_already_exists") {
						alert("Fejl! Den maskine er allerede oprettet.");
					} else {
						alert("Der skete en fejl. Prøv igen!");
					}
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown){
				alert("Der skete en fejl. Prøv igen! Dette skyldes formentlig manglende internetforbindelse eller at serveren ikke kører.");
			})
			.always(function () {
				$inputs.prop("disabled", false);
			});
		});
	},
	
	showLoginPage: function() {
		// Change HTML content
		$("#main").html(app.pageLogin);

		// Setup form register submit button
		$("#form_login").submit(function(event) {
			event.preventDefault();
			
			// Get macid
			var macid = $("#macid").val();
			
			// Disable inputs, during ajax request
			var $inputs = $(this).find("input");
			$inputs.prop("disabled", true);         

			// Post data to server
			$.ajax({
				url: config.serverlocation,
				type: "POST",
				data: {action: "login", macid: macid},
				dataType: "json"
			})
			.done(function (response, textStatus, jqXHR){
				var resp = JSON.parse(JSON.stringify(response));
				if (resp.result == "ok") {
					app.macid = macid;
					app.saveMacidToLocalStorage(macid);
					app.showMainPage();
				} else if (resp.result == "error") {
					if (resp.msg = "error_wrong_id") {
						alert("Fejl! Ukendt ID.");
					} else {
						alert("Der skete en fejl. Prøv igen!");
					}
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown){
				alert("Der skete en fejl. Prøv igen! Dette skyldes formentlig manglende internetforbindelse eller at serveren ikke kører.");
			})
			.always(function () {
				$inputs.prop("disabled", false);
			});
		});
	},
	
	showMainPage: function() {
		// Clear timer and event handlers
		app.clearClickHandlers();
		clearTimeout(app.timer);
		
		// Change HTML content
		$("#main").html(app.pageMain);
		
		// Hide bottom images
		$(".img_choice").hide();
		
		// Set text
		$("#table_text").html("<h1>Tilfreds med betjeningen?</h1>");
		
		// Setup event listeners
		// Note: inverse numbers: Very Happy Smiley: 5 points, ...		
		$("#smiley1").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showWhatPage(1);
		});
		$("#smiley2").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showWhatPage(2);
		});
		$("#smiley3").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showWhatPage(3);
		});
		$("#smiley4").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showWhatPage(4);
		});
		$("#smiley5").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showWhatPage(5);
		});
	},
	
	showWhatPage: function(nSmiley) {
		app.clearClickHandlers();
		clearTimeout(app.timer);

		// Change HTML content
		$(".main").html(app.pageMain);
		
		// Setup event listeners
		$("#choice1").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showResultPage(nSmiley, 1);
		});
		$("#choice2").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showResultPage(nSmiley, 2);
		});
		$("#choice3").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showResultPage(nSmiley, 3);
		});		
		
		// Text
		if (nSmiley > 3) {
			$("#table_text").html("<h1>Hvad var godt?</h1>");
		} else {
			$("#table_text").html("<h1>Hvad var dårligt?</h1>");
		}
		
		// Show selected smiley, hide others
		$(".img_smiley").each(function(index) {
			if (index == 4 - (nSmiley - 1))
				$(this).addClass("img_smiley_selected");
			else
				$(this).addClass("img_smiley_hide");
		});

		// timeout => change page
		app.timer = setTimeout(function(){
			app.showMainPage();
		}, 10000);
	},
	
	showResultPage: function(nSmiley, nWhat) {
		app.clearClickHandlers();
		clearTimeout(app.timer);
		
		$("#main").html(app.pageThanks);

		var d = new Date();
		var datetime = d.getTime();
		
		// Post data to server
		app.sendResultToServer(app.macid, nSmiley, nWhat, datetime, function() {
			app.timer = setTimeout(function(){
				app.showMainPage();
			}, 4000);
		});
	},
	
	
	//////////////////////////////////////////
	//// HELPER FUNCTIONS
	//////////////////////////////////////////
	
	// send a single result to the server
	sendResultToServer: function(macid, smiley, what, datetime, callback) {
		$.ajax({
			url: config.serverlocation,
			type: "POST",
			data: {action: "result", macid: macid, smiley: smiley, what: what, datetime: datetime},
			dataType: "json"
		})
		.done(function (response, textStatus, jqXHR){
			var resp = JSON.parse(JSON.stringify(response));
			if (resp.result != "ok") {
				app.saveEntryToLocalStorage(macid, smiley, what, datetime);
			}
			callback();
		})
		.fail(function (jqXHR, textStatus, errorThrown){
			app.saveEntryToLocalStorage(macid, smiley, what, datetime);
			callback();
		});
	},

	// Commit single entry, recursive until empty list
	commitListRecurse: function(list, callback) {
		if (list.length > 0) {
			var ent = list.pop();
			
			app.sendResultToServer(ent.macid, ent.smiley, ent.what, ent.datetime, function() {
				app.commitListRecurse(list, callback);
			});
		} else {
			callback();
		}
	},
	
	// Commit the entries that have not been sent because of connectivity issues
	commitEntriesFromLocalStorage: function(callback) {
		if(typeof(Storage)!=="undefined") {
			// Get local storage entries
			var entries = JSON.parse(localStorage.getItem("entries"));
			// Clear local storage entries
			localStorage.setItem("entries", JSON.stringify([]));
			
			if (entries !== null) {
				app.commitListRecurse(entries, callback);
			} else {
				callback();
			}
		}
	},
	
	// Save an entry to local storage
	saveEntryToLocalStorage: function(macid, smiley, what, datetime) {
		if(typeof(Storage)!=="undefined") {
			var ent = {
				macid: macid,
				smiley: smiley,
				what: what,
				datetime: datetime
			}
		
			var entries = JSON.parse(localStorage.getItem("entries"));
		
			if (entries == null) {
				entries = [];
			} 
			entries.push(ent);

			localStorage.setItem("entries", JSON.stringify(entries));
		}
	},

	// Logout: remove macid from localStorage
	logout: function() {
		localStorage.removeItem("macid");
	},
	
	// Save macid to localStorage
	saveMacidToLocalStorage: function(macid) {
		if(typeof(Storage)!=="undefined") {
			localStorage.setItem("macid", macid);
		}
	},
	
	// Removes all on "click touchstart" event handlers
	clearClickHandlers: function() {
		$("#smiley1 #smiley2 #smiley3 #smiley4 #smiley5 #choice1 #choice2 #choice3").off();
	}
};
