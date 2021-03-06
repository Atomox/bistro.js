'use strict';

/**
   

   @TODO

	Epics:

	1. - How do we persist or pass user objects?

		 - Create a user module, server-customer.js

X	2. - Storrage: Let's get our data from a database!
		 
X		 - Flesh out MySQL DB layer. Understand
		   how the hell it will work in an async world. O_O

			- Propose Map() functionality to handle results of a query.
			  In this model, we Map a set of fields to an object structure, 
			  or at least, a flat row structure we can use without iterating
			  ourselves after $result is returned.

			- We'll at least need a data mapper when we get to defining
			  content types, and custom fields.

			@see http://docs.sequelizejs.com/


    3. - Routing: - Find a way to declare and pass globals to modules.

 */



// Require our HTTP and File Systerm libraries.
var http = require("http"),
	fs = require('fs');

// Require our application modules.
var waiter = require('./server-waiter'),
	hostess = require('./server-hostess'),
	busboy = require('./server-busboy'),
	walkin = require('./server-walkin'),
	payroll = require('./server-payroll');

// Our quick debug tool.
const bb = busboy.bb;

/**
   @todo
     Once we impliment uploads, allow a supplimental table
     which can be updated with new hashes as they are created.
 */
// A map of all our files at run-time. This will speed up routing checks for files.
const seating_chart = hostess.mapRoute(__dirname);

// A map of all internal paths, mapped to their callbacks. 
// @see Payroll and the staff directory.
const assigned_seating_chart = hostess.mapVirtualRoute();

// Create & start the server.
http.createServer(onRequest).listen(8888);
console.log('Server has started.');


// Left off on page 15 on 12/12/2015, just before midnight.
function onRequest(request, response) {
	console.log('Request Received: ' + request.url);

	// Route our request.
	var calls = hostess.routeRequest(response, request.url, seating_chart)

	// Once all promises complete, wrap it up.
	Promise.all(calls)
		.then(function thenResponse() {
			console.log('Ending response for ' + request.url);
			response.end();
		})
		.catch(function errPromiseAll(err) { 
			console.log('Error completing all promises.');
			console.log(err);
			response.end(); 
		});

}
