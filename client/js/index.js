/**
 * App class.
 * @type {{init: init, showWelcomePage: showWelcomePage, showRegisterPage: showRegisterPage, showLoginPage: showLoginPage, showMainPage: showMainPage, showWhatPage: showWhatPage, showResultPage: showResultPage, sendResultToServer: sendResultToServer, commitListRecurse: commitListRecurse, commitEntriesFromLocalStorage: commitEntriesFromLocalStorage, saveEntryToLocalStorage: saveEntryToLocalStorage, ping: ping, logout: logout, saveMacidToLocalStorage: saveMacidToLocalStorage, clearClickHandlers: clearClickHandlers}}
 */
var app = {
  /**
   * Initialization of the app.
   */
  init: function() {
    // Find container divs.
    var pageWelcomeDiv  = $("#page_welcome");
    var pageLoginDiv    = $("#page_login");
    var pageRegisterDiv = $("#page_register");
    var pageMainDiv     = $("#page_main");
    var pageThanksDiv   = $("#page_thanks");

    // Get the content of containers.
    this.pageWelcome = pageWelcomeDiv.html();
    this.pageLogin = pageLoginDiv.html();
    this.pageRegister = pageRegisterDiv.html();
    this.pageMain = pageMainDiv.html();
    this.pageThanks = pageThanksDiv.html();

    // Remove the containers.
    pageWelcomeDiv.remove();
    pageLoginDiv.remove();
    pageRegisterDiv.remove();
    pageMainDiv.remove();
    pageThanksDiv.remove();

    // Avoid touchmove events (scrolling).
		$(document).on('touchmove', function(e) {
			e.preventDefault();
		});

    // Auto login (go to main page) if macid is stored in local storage, otherwise go to welcome page.
		if(typeof(Storage)!=="undefined") {
			var macid = localStorage.getItem("macid");

      //
			if (macid == null || macid == "") {
				app.showWelcomePage();
			}
      else {
				this.macid = macid;
				app.showMainPage();
			}
		}
    else {
			app.showWelcomePage();
		}
	},

  /**
   * Shows the welcome page and sets up event listeners.
   */
	showWelcomePage: function() {
		// Change the HTML content.
		$("#main").html(app.pageWelcome);

    // Find the commit_button.
    var commitButton = $("#commit_button");

    // Displays the number of uncommitted entries on button.
    var updateButtonText = function(button) {
      var nr = 0;
      if(typeof(Storage)!=="undefined") {
        var entries = JSON.parse(localStorage.getItem("entries"));
        if (entries !== null) {
          nr = entries.length;
        }
      }
      else {
        alert("Advarsel: dette device understøtter ikke Web Storage, så hvis data ikke kan afleveres til serveren, går de tabt. Dette skyldes at browseren ikke er opdateret.");
      }

      button.html("Indsend (" + nr + ")");
    }

    // Update the text on commit_button.
    updateButtonText(commitButton);

		// Setup event listeners.
		$("#login_button").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showLoginPage();
		});
		$("#reg_button").on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();
			app.showRegisterPage();
		});
    commitButton.on("touchstart click", function(e) {
			e.stopPropagation(); e.preventDefault();

      // Try to commit the entries stored locally.
      app.commitEntriesFromLocalStorage(function() {
        updateButtonText(commitButton);
			});
		});		
	},

  /**
   * Shows the register page and sets up event listeners.
   */
	showRegisterPage: function() {
		// Change the HTML content.
		$("#main").html(app.pageRegister);

		// Setup custom validation for the email_repeat input.
		$("#mail_repeat").on("change", function() {
			if ($(this).val() !== $("#mail").first().val()) {
				document.getElementById("mail_repeat").setCustomValidity("Emails er ikke ens");
			}
      else {
				document.getElementById("mail_repeat").setCustomValidity("");
			}
		});

		// Setup form register submit button
		$("#form_register").submit(function(event) {
			event.preventDefault();

      // Serialize the input data from form.
			var serializedData = $(this).serializeArray();
			
			// Disable inputs during the ajax request.
			var $inputs = $(this).find("input");
			$inputs.prop("disabled", true);

			// Post the data to the server.
			$.ajax({
				url: config.serverlocation,
				type: "POST",
				data: serializedData,
				dataType: "json"
			})
			.done(function (response, textStatus, jqXHR) {
        var resp = JSON.parse(JSON.stringify(response));

				if (resp.result == "ok") {
					// Set the app.macid and save to local storage for auto-login.
          app.macid = resp.macid;
					app.saveMacidToLocalStorage(app.macid);

          // Show alert to user of success and with the macid of the registered machine.
					alert("Registreringen lykkedes!\r\nmacid til denne opsætning er \r\n" + app.macid + "\r\nSkriv den ned, så du har den til næste gange du skal logge denne maskine ind. De indtastede informationer og også sendt til den registrerede email-adresse.");

          // Go to main page.
          app.showMainPage();
				} else if (resp.result == "error") {
					if (resp.msg = "error_machine_already_exists") {
						alert("Fejl! Den maskine er allerede oprettet.");
					}
          else {
						alert("Der skete en fejl. Prøv igen!");
					}
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown){
				alert("Der skete en fejl. Prøv igen! Dette skyldes formentlig manglende internetforbindelse eller at serveren ikke kører. " + errorThrown);
			})
			.always(function () {
        // Reenable the inputs.
				$inputs.prop("disabled", false);
			});
		});
	},

  /**
   * Shows the login page and sets event listeners.
   */
	showLoginPage: function() {
		// Change HTML content
		$("#main").html(app.pageLogin);

		// Setup form register submit button
		$("#form_login").submit(function(event) {
			event.preventDefault();
			
			// Get the macid from the input.
			var macid = $("#macid").val();
			
			// Disable inputs during the ajax request.
			var $inputs = $(this).find("input");
			$inputs.prop("disabled", true);         

			// Post the login data to the server.
			$.ajax({
				url: config.serverlocation,
				type: "POST",
				data: {action: "login", macid: macid},
				dataType: "json"
			})
			.done(function (response, textStatus, jqXHR){
				var resp = JSON.parse(JSON.stringify(response));
				if (resp.result == "ok") {
          // Set the app.macid and save to local storage for auto-login.
 					app.macid = macid;
					app.saveMacidToLocalStorage(macid);

          // Go to the main page.
					app.showMainPage();
				}
        else if (resp.result == "error") {
					if (resp.msg = "error_wrong_id") {
						alert("Fejl! Ukendt ID.");
					}
          else {
						alert("Der skete en fejl. Prøv igen!");
					}
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown){
				alert("Der skete en fejl. Prøv igen! Dette skyldes formentlig manglende internetforbindelse eller at serveren ikke kører.");
			})
			.always(function () {
        // Reenable the inputs.
				$inputs.prop("disabled", false);
			});
		});
	},

  /**
   * Shows the main page and registers event listeners.
   */
	showMainPage: function() {
		// Clear timers and event handlers.
		app.clearClickHandlers();
		clearTimeout(app.timer);
		
		// Change the HTML content.
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

		var datetime = (new Date()).getTime();
		
		// Post data to server
		app.sendResultToServer(app.macid, nSmiley, nWhat, datetime, function() {
            app.ping(
                function() {
                    app.commitEntriesFromLocalStorage(function() {
                    app.timer = setTimeout(function(){
                        app.showMainPage();
                    }, 4000);
                });},
                function() {
                    app.timer = setTimeout(function(){
                        app.showMainPage();
                    }, 4000);
                }
            );
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

    // Ping server
    ping: function(success, failure) {
        $.ajax({
            url: config.serverlocation + "/ping",
            type: "GET"
        })
        .done(function (response, textStatus, jqXHR) {
            success();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            failure();
        });
    },

	// Logout: remove macid from localStorage
	logout: function() {
        if(typeof(Storage)!=="undefined") {
		    localStorage.removeItem("macid");
        }
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
