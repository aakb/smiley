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
    var pageChoiceDiv   = $("#page_choice");
    var pageThanksDiv   = $("#page_thanks");

    // Get the content of containers.
    this.pageWelcome = pageWelcomeDiv.html();
    this.pageLogin = pageLoginDiv.html();
    this.pageRegister = pageRegisterDiv.html();
    this.pageMain = pageMainDiv.html();
    this.pageChoice = pageChoiceDiv.html();
    this.pageThanks = pageThanksDiv.html();

    // Remove the containers.
    pageWelcomeDiv.remove();
    pageLoginDiv.remove();
    pageRegisterDiv.remove();
    pageMainDiv.remove();
    pageChoiceDiv.remove();
    pageThanksDiv.remove();

    // Avoid touchmove events (scrolling).
    $(document).on('touchmove', function(e) {
      e.preventDefault();
    });

    // Auto login (go to main page) if macid is stored in local storage, otherwise go to welcome page.
    if(typeof(Storage) !== "undefined") {
      var macid = localStorage.getItem("macid");

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
      if(typeof(Storage) !== "undefined") {
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
          if (resp.msg == "error_machine_already_exists") {
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
          if (resp.msg == "error_wrong_id") {
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

    // Setup the event listeners.
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

  /**
   * Shows the what page, registers event listeners and timer.
   * @param nSmiley The selected smiley from main page.
   */
  showWhatPage: function(nSmiley) {
    // Clear timers and event handlers.
    app.clearClickHandlers();
    clearTimeout(app.timer);

    // Change the HTML content.
    $(".main").html(app.pageChoice);

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

    // Change the text according to the selected smiley.
    if (nSmiley > 3) {
      $("#table_text").html("<h1>Hvad var godt?</h1>");
    } else {
      $("#table_text").html("<h1>Hvad var dårligt?</h1>");
    }

    // Show the selected smiley and hide the others.
    $(".img_smiley").each(function(index) {
      if (index == 4 - (nSmiley - 1)) {
        $(this).addClass("img_smiley_selected");
      }
      else {
        $(this).addClass("img_smiley_hide");
      }
    });

    // Set timeout for page. If user has not selected a reason for the smiley before the timeout, then load main page again.
    app.timer = setTimeout(function(){
      app.showMainPage();
    }, 10000);
  },

  /**
   * Shows the result page.
   * @param nSmiley the selected smiley.
   * @param nWhat   the reason for the smiley.
   */
  showResultPage: function(nSmiley, nWhat) {
    // Clear event handlers and timer.
    app.clearClickHandlers();
    clearTimeout(app.timer);

    // Set the HTML content.
    $("#main").html(app.pageThanks);

    var datetime = (new Date()).getTime();

    // Post data to server
    app.sendResultToServer(app.macid, nSmiley, nWhat, datetime, function() {
      // Test if the connection to the server is up
      app.ping(
        // If the connection is up, commit from local storage.
        function() {
          app.commitEntriesFromLocalStorage(function() {
          app.timer = setTimeout(function(){
            app.showMainPage();
          }, 4000);
        });},
        // If the connections is not up, go to main page.
        function() {
          app.timer = setTimeout(function(){
            app.showMainPage();
          }, 4000);
        }
      );
    });
  },

  /**
   * Sends a single result to the server.
   * @param macid the macid of the machine.
   * @param smiley the selected smiley.
   * @param what the selected reason for the smiley.
   * @param datetime the time of the result.
   * @param callback the function to call when the function is done.
   */
  sendResultToServer: function(macid, smiley, what, datetime, callback) {
    // Send the result to the server.
    $.ajax({
      url: config.serverlocation,
      type: "POST",
      data: {action: "result", macid: macid, smiley: smiley, what: what, datetime: datetime},
      dataType: "json"
    })
    .done(function (response, textStatus, jqXHR) {
      var resp = JSON.parse(JSON.stringify(response));

      if (resp.result != "ok") {
        // If an error occurred, save the entry to local storage.
        app.saveEntryToLocalStorage(macid, smiley, what, datetime);
      }
      callback();
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      // When the commit fails, save to local storage.
      app.saveEntryToLocalStorage(macid, smiley, what, datetime);
      callback();
    });
  },

  /**
   * Recursively commit the list.
   * @param list the list of results to commit.
   * @param callback the function to call when the list is empty.
   */
  // Commit single entry, recursive until empty list
  commitListRecurse: function(list, callback) {
    // The stop condition is an empty list.
    if (list.length > 0) {
      // Pop top element of list.
      var ent = list.pop();

      // Commit the entry and then recursively commit the rest of the list.
      app.sendResultToServer(ent.macid, ent.smiley, ent.what, ent.datetime, function() {
        app.commitListRecurse(list, callback);
      });
    } else {
      callback();
    }
  },

  /**
   * Commit the results that have not been sent.
   * @param callback the function to call when the list is empty.
   */
  commitEntriesFromLocalStorage: function(callback) {
    if(typeof(Storage) !== "undefined") {
      // Get local storage entries
      var entries = JSON.parse(localStorage.getItem("entries"));

      // Clear local storage entries
      localStorage.setItem("entries", JSON.stringify([]));

      // Recursively commit the list
      if (entries !== null) {
        app.commitListRecurse(entries, callback);
      } else {
        callback();
      }
    }
  },

  /**
   * Save a result to local storage.
   * @param macid the macid of the machine.
   * @param smiley the selected smiley.
   * @param what the reason for the selected smiley.
   * @param datetime the time of the result.
   */
  // Save an entry to local storage
  saveEntryToLocalStorage: function(macid, smiley, what, datetime) {
    if(typeof(Storage) !== "undefined") {
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

  /**
   * Ping the server.
   * @param success the function to call if the server answers.
   * @param failure the function to call if the ping failed.
   */
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

  /**
   * Removes the macid from local storage.
   */
  logout: function() {
    if(typeof(Storage) !== "undefined") {
      localStorage.removeItem("macid");
    }
  },

  /**
   * Save the macid to local storage.
   * @param macid
   */
  saveMacidToLocalStorage: function(macid) {
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem("macid", macid);
    }
  },

  /**
   * Clear the event handlers for the smileys and the whats.
   */
  clearClickHandlers: function() {
    $("#smiley1 #smiley2 #smiley3 #smiley4 #smiley5 #choice1 #choice2 #choice3").off();
  }
};
