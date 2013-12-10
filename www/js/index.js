/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        // Setup Cordova events
		this.bindEvents();

		// Setup app parameters
		this.serverlocation = "http://localhost/";
		
		// Setup HTML pages to insert in header and body
		this.divWelcomeHeader = $("#div_welcome_header").html();
		this.divLoginBody = $("#div_login_body").html();
		this.divLoginHeader = $("#div_login_header").html();
		this.divRegisterBody = $("#div_register_body").html();
		this.divRegisterHeader = $("#div_register_header").html();
		this.divMainBody = $("#div_main_body").html();
		this.divWhatBody = $("#div_what_body").html();
		this.divThanksBody = $("#div_thanks_body").html();
		
		app.showWelcomePage();
    },
	showWelcomePage: function() {
		$(".main").html("");
		$(".header").html(this.divWelcomeHeader);

		// Display number of uncommitted entries on button
		var nr = 0;
		if(typeof(Storage)!=="undefined") {
			// GET FROM LOCALSTORAGE
			var entries = JSON.parse(localStorage.getItem("entries"));
			if (entries !== null) {
				nr = entries.length;
			} 
		}
		$("#commit_button").html("Indsend (" + nr + ")");
		
		$("#login_button").on("click", function() {
			app.showLoginPage();
		});
		$("#reg_button").on("click", function() {
			app.showRegisterPage();
		});
		$("#commit_button").on("click", function() {
			app.commitEntriesFromLocalStorage(function() {
				// Display number of uncommitted entries on button
				var nr = 0;
				if(typeof(Storage)!=="undefined") {
					// GET FROM LOCALSTORAGE
					var entries = JSON.parse(localStorage.getItem("entries"));
					if (entries !== null) {
						nr = entries.length;
					} 
				}
				$("#commit_button").html("Indsend (" + nr + ")");
			});
			app.showAlert("Done");
		});		
	},
	showRegisterPage: function() {
		$(".main").html(this.divRegisterBody);
		$(".header").html(this.divRegisterHeader);

		// Setup form register submit button
		var request;
		$("#form_register").submit(function(event) {
			event.preventDefault();
			
			if (request) {	// abort any pending request
				request.abort();
			}

			var serializedData = $(this).serialize();
			var $inputs = $(this).find("input");
			
			$inputs.prop("disabled", true);         // disable inputs, during ajax request

			// post data to server
			request = $.ajax({
				url: app.serverlocation + "smiley/",
				type: "GET",
				data: serializedData
			})
			.done(function (response, textStatus, jqXHR){
				var resp = $.parseJSON(response);
				if (resp.result == "ok") {
					app.macid = resp.macid;
					app.showMainPage();
				} else {
					alert("Der skete en fejl: " + resp.result + ". Prøv igen!");
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown){
				alert("Der skete en fejl. Prøv igen! Dette skyldes formentlig manglende internetforbindelse eller at serveren ikke kører.");
			})
			.always(function () {
				$inputs.prop("disabled", false);
			});
			app.showMainPage();
		});
	},
	showLoginPage: function() {
		// Change HTML content
		$(".main").html(this.divLoginBody);
		$(".header").html(this.divLoginHeader);
		
		// Setup form login submit button
		var request;
		$("#form_login").submit(function(event) {
			event.preventDefault();
			
			if (request) {	// abort any pending request
				request.abort();
			}

			var serializedData = $(this).serialize();
			var $inputs = $(this).find("input");
			
			$inputs.prop("disabled", true);         // disable inputs, during ajax request

			// post data to server
			request = $.ajax({
				url: app.serverlocation + "smiley/",
				type: "GET",
				data: serializedData
			})
			.done(function (response, textStatus, jqXHR){
				var resp = $.parseJSON(response);
				if (resp.result == "ok") {
					app.macid = $("#macid").val();
					app.showMainPage();
				} else {
					alert("Der skete en fejl: " + resp.result + ". Prøv igen!");
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
		// Change HTML content
		$(".header").html("");
		$(".main").html(this.divMainBody);
		
		// Setup event listeners
		$("#smiley1").on("click", function() {
			app.showWhatPage(1);
		});
		$("#smiley2").on("click", function() {
			app.showWhatPage(2);
		});
		$("#smiley3").on("click", function() {
			app.showWhatPage(3);
		});
		$("#smiley4").on("click", function() {
			app.showWhatPage(4);
		});
		$("#smiley5").on("click", function() {
			app.showWhatPage(5);
		});
	},
	showWhatPage: function(nSmiley) {
		// Change HTML content
		$(".header").html("");
		$(".main").html(this.divWhatBody);
		
		// Setup event listeners
		$("#choice1").on("click", function() {
			app.registerResult(nSmiley, 1);
		});
		$("#choice2").on("click", function() {
			app.registerResult(nSmiley, 2);
		});
		$("#choice3").on("click", function() {
			app.registerResult(nSmiley, 3);
		});		
		
		// Text
		if (nSmiley < 3) {
			$("#what_div").html("<h1>Hvad var godt?</h1>");
		} else {
			$("#what_div").html("<h1>Hvad var dårligt?</h1>");
		}
		
		// Show selected smiley, hide others
		$(".img_smiley").each(function(index) {
			if (index == nSmiley - 1)
				$(this).addClass("img_smiley_selected");
			else
				$(this).addClass("img_smiley_hide");
		});
	},
	registerResult: function(nSmiley, nWhat) {
		$(".header").html("");
		$(".main").html(this.divThanksBody);

		var d = new Date();
		var datetime = d.getTime();
		
		// post data to server
		app.sendResultToServer(app.macid, nSmiley, nWhat, datetime);
		/*$.ajax({
			url: app.serverlocation + "smiley/",
			type: "POST",
			data: {action: "result", macid: app.macid, smiley: nSmiley, what: nWhat, datetime: datetime},
			dataType: "json"
		})
		.done(function (response, textStatus, jqXHR){
			var resp = $.parseJSON(response);
			if (resp.result != "ok") {
				app.saveEntryToLocalStorage(app.macid, nSmiley, nWhat, datetime);
			}
		})
		.fail(function (jqXHR, textStatus, errorThrown){
			app.saveEntryToLocalStorage(app.macid, nSmiley, nWhat, datetime);
		});*/
		
		setTimeout(function(){
			app.showMainPage();
		}, 3000);
	},
	
	
	//////////////////////////////////////////
	//// HELPER FUNCTIONS
	//////////////////////////////////////////
	
	// send a single result to the server
	sendResultToServer: function(macid, smiley, what, datetime) {
		$.ajax({
			url: app.serverlocation + "smiley/",
			type: "POST",
			data: {action: "result", macid: macid, smiley: smiley, what: what, datetime: datetime},
			dataType: "json"
		})
		.done(function (response, textStatus, jqXHR){
			var resp = $.parseJSON(response);
			if (resp.result != "ok") {
				app.saveEntryToLocalStorage(macid, smiley, what, datetime);
			}
		})
		.fail(function (jqXHR, textStatus, errorThrown){
			app.saveEntryToLocalStorage(macid, smiley, what, datetime);
		});
	},
	
	// Commit the entries that have not been sent because of connectivity issues
	commitEntriesFromLocalStorage: function(callback) {
		// Get local storage entries
		var entries = JSON.parse(localStorage.getItem("entries"));
		// Backup results
		localStorage.setItem("backup_entries", JSON.stringify(entries));
		// Clear local storage entries
		localStorage.setItem("entries", JSON.stringify([]));
		
		if (entries !== null) {
			var index;
			var ent;
			for (index = 0; index < entries.length; index++) {
				ent = entries[index];
				
				sendResultToServer(ent.macid, ent.smiley, ent.what, ent.datetime);
			}
		}
		
		callback();
	},
	
	// Save an entry to local storage
	saveEntryToLocalStorage: function(macid, smiley, what, datetime) {
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
	},
	
	// Native alerts
	showAlert: function (message, title) {
		if (navigator.notification) {
			navigator.notification.alert(message, null, title, 'OK');
		} else {
			alert(title ? (title + ": " + message) : message);
		}
	},
	
	
	
	//////////////////////////////////////////
	//// CORDOVA
	//////////////////////////////////////////
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};
