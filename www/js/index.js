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
        this.bindEvents();

		this.serverlocation = "http://localhost/";
		
		// Setup HTML pages to insert in header and body
		this.divLoginBody = $("#div_login_body").html();
		this.divLoginHeader = $("#div_login_header").html();
		this.divMainBody = $("#div_main_body").html();
		this.divWhatBody = $("#div_what_body").html();
		this.divThanksBody = $("#div_thanks_body").html();
		
		app.showLoginPage();
    },
	showLoginPage: function() {
		// Change HTML content
		$(".main").html(this.divLoginBody);
		$(".header").html(this.divLoginHeader);
		
		var request;
		
		// Setup form login submit button
		$("#form_login").submit(function(event) {
			// prevent default posting of form
			event.preventDefault();

			alert("login submit");
			
			// abort any pending request
			if (request) {
				request.abort();
			}
			// setup some local variables
			var $form = $(this);
			// let's select and cache all the fields
			var $inputs = $form.find("input, select, button, textarea");
			// serialize the data in the form
			var serializedData = $form.serialize();

			// let's disable the inputs for the duration of the ajax request
			$inputs.prop("disabled", true);

			// fire off the request to /form.php
			request = $.ajax({
				url: app.serverlocation + "login_machine.php",
				type: "post",
				data: serializedData
			});

			// callback handler that will be called on success
			request.done(function (response, textStatus, jqXHR){
				// log a message to the console
				alert("it worked");
				alert("Hooray, it worked!");
				//app.showMainPage();
			});

			// callback handler that will be called on failure
			request.fail(function (jqXHR, textStatus, errorThrown){
				// log the error to the console

				alert(
					"The following error occured: "+
					textStatus, errorThrown
				);
			});

			// callback handler that will be called regardless
			// if the request failed or succeeded
			request.always(function () {
				// reenable the inputs
				$inputs.prop("disabled", false);
			});
		});
		
		// Setup form login submit button
		$("#form_register").submit(function(event) {
			event.preventDefault();
		
			$.post(this.serverlocation + "register_machine.php",
				{contact: "", mail: "", magafd: "", forvalt: "", placering: "", navn: "" },
				function( data ) {
					// save machine ID
					
					alert(data);
				});
			app.showMainPage();
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
	},
	registerResult: function(nSmiley, nWhat) {
		$(".header").html("");
		$(".main").html(this.divThanksBody);
		
		$.get(this.serverlocation + "register_event.php?nSmiley=" + nSmiley + "&nChoice=" + nWhat, function( data ) {});
		setTimeout(function(){
			app.showMainPage();
		}, 3000);
	},
	
	//// CORDOVA
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
