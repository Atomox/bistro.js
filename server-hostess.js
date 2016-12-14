// Contrib
fs = require('fs');

// Custom
sutil = require('./includes/server-utils'),
/**
   @TODO
     Let's find a *safer* way to provide this to our module.
 */
payroll = require('./server-payroll');



var hostess = (function hostessFactory() {

	// public
	/**
	 * Check is a user should be allowed entry for the requested location.
	 *  
	 * @param {obj|string} user
	 *   The user requesting access, or anonymous for unknown user.
	 * @param {string} reservation
	 *   A string representation of the permission a user is requesting access to.
	 * 
	 * @return {boolean}
	 *   TRUE if allowed. Otherwise, FALSE.
	 */
	function accessCheck(user, reservation) {

		/**
		   @todo
		     Break down reservation into [operation permission_location]
		 */
		var reservation = reservation.match(/^(\S+)\s(.*)/).slice(1);
		var location = 'content';
		var operation = 'access';

		if (reservation[0]) {
			operation = reservation[0];
		}
		if (reservation[1]) {
			location = reservation[1];
		}
		
		switch (operation) {
			case 'access':
				return true;
				break;

			default:
				console.log('Unknown permission operation: ' + operation);
				return false;
		}
		console.log('Operation: ' + operation);

		return true;
	}


	/**
	 * Check our path, and server it approprately.
	 * 
	 * @param {object} response
	 *   Response object.
	 * @param {string} path
	 *   The path of the request.
	 * 
	 * @return {boolean}
	 *   TRUE if we ended the response. Otherwise, FALSE if we should continue.
	 */
	function seatCustomer(response, path, seating_chart) {

		var extension = reservationType(path);
		var success = false;

		// Hash our path, and check the seating chart.
		// If the file was not in our file hash map, don't try to load it.
		var my_path_hash = sutil.hash(path);

		/**
		   @todo

		     Ultimately, this needs to work in parts:

		     1. Find the path.
		     2. Authenticate the request (access check)
		     3. Prepare request routing.
		     4. Return ultimate success or failure (or forbidden)

		 */

		// Don't try to serve a file not on our seating chart.
		if (seating_chart.indexOf(my_path_hash) >= 0) {
			// First check for a real path.
			
			/**
			   @todo
			     Access Check real files?
			 */

			// Serve the file.
			fs.readFile(path, function (err, data) {
		        if (err) { console.log(err); return; }
				console.log('Serving ' + extension + '.');
				
				// Write our header before we present the file.
				writeHeader(response, extension);

				// Write the data.
				response.write(data);

				// Indicate success.
				success = true;
			});
		}
		
		// If the file wasn't real, check for a virtual route.
		if (success !== true) {		

			// Get a list of module paths.

			/**
			   
			   @todo

					Begin internal menu routing logic here...

					i.e. /content/1 

					will probably serve the first piece of content in our system.
			 */
		}


		// Make sure we have access, or REJECT.	
		if (!hostess.accessCheck('anonymous', 'access content front')) {
			response.writeHead(403, {"Content-Type": "text/plain"});
			response.write('403 | Forbidden');
			response.end();
			return;
		}


	
		if (success === true) {
			response.end();
		}

		return success;
	}


	function reservationType (path) {
		var extension = path.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/);
		console.log(path + ' is of type ' + extension + '.');
	}


	function writeHeader (response, extension) {
		var mime_type;

		switch (extension) {

			/**
			   @todo
			     Is this right? serving no extension implies a directory,
			     which we'll default to html.
			 */
			case '/':
			case '':
			case null:
				mime_type = 'text/html';
				break;

			case 'text':
				mime_type = 'text/plain';
				break;

			case 'css':
				mime_type = 'text/css';
				break;

			case 'ico':
				mime_type = 'image/x-icon';
				break;

			case 'htm':
			case 'html':
				mime_type = 'text/html';
				break;

			case 'js':
				mime_type = 'application/javascript';
				break;

			case 'jpeg':
			case 'jpg':
				mime_type = 'image/jpeg';
				break;

			case 'gif':
				mime_type = 'image/gif';
				break;

			case 'gif':
				mime_type = 'image/png';
				break;

			default:
				mime_type = 'text/plain';
		}

		// Output our header.
		response.writeHead(200, {'Content-Type': mime_type});
	}


	/**
	 * Recurse through a directory, and all subdirectories,
	 * generating a hash map of all children.
	 * 
	 * @param  {[type]} root_path [description]
	 * @return {[type]}           [description]
	 */
	function seatingChart(root_path) {

		var dir = root_path;
		console.log(root_path + ' | ' + dir);

		// List all files in a directory in Node.js
		// recursively in a synchronous fashion.
     	// @see https://gist.github.com/kethinov/6658166
     	var results = function walkSync(dir, filelist, root_path) {
            var path = path || require('path');
            var fs = fs || require('fs'),
                files = fs.readdirSync(dir);
            filelist = filelist || [];
            files.forEach(function(file) {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    filelist = walkSync(path.join(dir, file), filelist, root_path);
                }
                else {
                	// Create the full path, 
                	// then make it relative to our root. 
                	// Finally, hash it.
                	var my_path = path.join(dir, file);
                	my_path = my_path.replace(root_path, '');
                    filelist.push(sutil.hash(my_path));
                }
            });
            return filelist;
        }(dir, null, root_path);

        return results;
	}


	/**
	 * Assemble a assigned seating chart, of all virtual routes assigned internally.
	 
	   @TODO

	 */
	function virtualSeatingChart() {

		/**
		   @TODO
		     Capture all results.
		 */

		payroll.module_roster.forEach(function(module_name) {
			var my_module = sutil.module_require(module_name);

			if (my_module && my_module.paths) {
				/**

				   @TODO
				     look through and map all module.paths


					HASH The paths.

					    Do we have to store paths more like a tree,
					    or can we still do a hash table?
				 */
				var myPathMap = parseVirtualPaths(my_module.paths);
			}
			else {
				console.log(module_name + '\'s not here, man.');
			}
		});
	}


	/**
	 * Given an array of paths, prepare them in a predictable way, which we may use to convert for using in a map.
	 * 
	 * @param {object} paths
	 *   A list of paths as defined in a module.
	 */
	function parseVirtualPaths(paths) {
		// Every path should end with /*, the wild card.
		console.log(paths);

		if (paths instanceof Object) {
			paths.forEach(function(p) {
				if (p.path) {
					normalize = normalizePath(p.path);
					console.log(p.path);
				}
			}); 
		}
	}


	function normalizePath(path) {
		if (path instanceof String) {
			/**
					  How do we abstract the paths in a way where:
			 */
			
			// content/*
			    // content/1 
			    // content/delicious_walrus
			    // content/hi_dad_soup?
			    
			// taxonomy/*/*
			    // 1/*/3/4/5
			

			// Rules:
			//    arg(0) must always be a string
			//    
			
			// Example: path/two/three/*/five
			// path -> two -> three ->

		}
	}

	return {
		accessCheck: accessCheck,
		routeRequest: seatCustomer,
		mapRoute: seatingChart,
		mapVirtualRoute: virtualSeatingChart
	};
})();

module.exports = {
	accessCheck: hostess.accessCheck,
	routeRequest: hostess.routeRequest,
	mapRoute: hostess.mapRoute,
	mapVirtualRoute: hostess.mapVirtualRoute
};