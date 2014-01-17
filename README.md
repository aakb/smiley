#Smiley
This project consists of a client to gather information and a statistics page to view statistics for each machine.

##Setup
Create your own "config/settings.php" file (from "config/default.settings.php") with database settings
Create your own "config/config.js" file (from "config/default.config.js") with serverlocation

The web client is located in client/
The statistics page is located in stats/

The SQL to setup the DB is here: "database/init_database.sql"

##Client
First off, register the machine. When a machine is registered, a mail is sent to the contact with the registered information and the macid (which is used to identify the machine afterwards).
The machine needs to be online for registration and login.

The client will auto-login (go to the smiley page) after registration.

To logout:
> http://path_to_server/client/logout

If there are connection issues when the client is running, the gathered information will be saved on the device.
The client will try to deliver this information when new information is gathered.
It is possible to manually deliver this locally stored information by going to the home screen (logout) and press the "Indsend(X)" button. Make sure the device has internet access.
The X denotes the amount of information that has not been delivered.

##Statistics
A cron job should be set up to send weekly statistics mails.
To send weekly mails from the cli, call the index.php script with the parameter weeklyMails:
> index.php weeklyMails

Statistics can be accessed through a link for a specified macid (which is delivered to the contact at registration):
> http://path_to_server/stats/?macid=XXXXX&week=W&year=YYYY  (will show statistics for the specified week and year)

or
> http://path_to_server/stats/?macid=XXXXX    (will show statistics for the last week from now)

To get all data from the database in XML format:
http://path_to_server/xmldata.php
