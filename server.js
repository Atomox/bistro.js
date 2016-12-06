'use strict';

/**
   

   @TODO

	Epics:

	1. - How do we persist or pass user objects?

		 - Create a user module, server-customer.js

	2. - Storrage: Let's get our data from a database!


	3. - Routing: Let's serve pages in a directory structure!

	   - Hook_menu?

	   - On startup, build a hash map of all subdirectories.

 */



// Require our HTTP and File Systerm libraries.
var http = require("http"),
	fs = require('fs');

// Require our application modules.
var waiter = require('./server-waiter'),
	hostess = require('./server-hostess'),
	busboy = require('./server-busboy');


// Our quick debug tool.
const bb = busboy.busboy.bb;

// A map of all our files at run-time. This will speed up routing checks for files.
const seating_chart = hostess.access.mapRoute(__dirname);


// Create & start the server.
http.createServer(onRequest).listen(8888);
console.log('Server has started.');


// Left off on page 15 on 12/12/2015, just before midnight.
function onRequest(request, response) {
	console.log('Request Received: ' + request.url);

	/**
	   @todo
	     Can we merge this into the routeRequest()?
	 */
	// Make sure we have access, or REJECT.	
	if (!hostess.access.accessCheck('anonymous', 'access content front')) {
		response.writeHead(403, {"Content-Type": "text/plain"});
		response.write('403 | Forbidden');
		response.end();
		return;
	}

	// Route the request.
	if (hostess.access.routeRequest(response, request.url, seating_chart) === true) {
		return;
	}


	if (request.url == '/') {
		// Print a valid header.
		response.writeHead(200, {"Content-Type": "text/html"});

		// Debugger to the screen.
		bb(request, response);

		var calls = waiter.serverFactory.serve(response);
		console.log('All iteration started.');

		// Once all promises complete, wrap it up.
		Promise.all(calls)
			.then(function thenResponse() {
				console.log('Ending response.');
				response.end()
			})
			.catch(function errPromiseAll(){ 
				response.write('Error completing all promises');
				response.end(); });
	}
	else {
		response.end();
	}
}
