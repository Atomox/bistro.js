// Contrib
fs = require('fs');

// Custom
sutil = require('./includes/server-utils');


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

		console.log('Searching for hash: ' + my_path_hash);

		if (seating_chart.indexOf(my_path_hash)) {
			// First check for a real path.
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

			// How do we get a global list of allowed paths?
			success = false;
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

	return {
		accessCheck: accessCheck,
		routeRequest: seatCustomer,
		mapRoute: seatingChart
	};
})();

module.exports = {
	access: hostess
};