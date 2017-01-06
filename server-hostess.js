// Contrib
fs = require('fs');

// Custom
var sutil = require('./includes/server-utils'),
/**
   @TODO
     Let's find a *safer* way to provide this to our module.
 */
	payroll = payroll || require('./server-payroll'),
	paths = paths || require('./includes/server-paths.js'),
    chef = chef || require('./server-chef.js');



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

		/**
		   @todo

		     Ultimately, this needs to work in parts:

		     1. Find the path.
		     2. Authenticate the request (access check)
		     3. Prepare request routing.
		     4. Return ultimate success or failure (or forbidden)

		 */
		// Set a default access check
		var menu_item = {
			access: 'access content',
		};
		
		var calls = [];

		try {

			// Check for a real file before a virtual path.
			if (fileExists(path, seating_chart) === true) {
				var serve_physical_file = getFile(path);

				var write_physical_file = serveFileAsResponse(serve_physical_file, response, extension);

				// Add our promises to our response array, so we don't terminate too early.
				calls = calls.concat([serve_physical_file, write_physical_file]);
			}
			// If the file wasn't real, check for a virtual route.
			else {		

				console.log('Checking for a virtual path: ' + path);

				// Look for a map to a virtual path callback.
				// If found, we'll get a menu item result.
				var virtual_path = resolveVirtualPath(path);

				if (virtual_path === false) {
					throw new Error('Virtual path could not be resolved.');
				}

				// If we have found a virtual path match,
				// set it as our menu item.
				menu_item = virtual_path.match;
				menu_item_depth = virtual_path.length;
				menu_path_info = menu_item.data;
				var args = [];

				console.log('Seating a virtual path: ');
				console.log(' - - - - - - - - - ');
				console.log(menu_path_info);
				console.log(' - - - - - - - - - ');
				

				// If menu item has a callback, check for args. Then call the callback, passing args if available.
				// check for placeholder args, like GLOBAL_RESPONSE, which should but supplimented with the response object.
				if (menu_path_info.callback) {

					console.log('Seated path Callback found. Executing...');

					if (menu_path_info.arguments) {
						args = prepare_args(menu_path_info.arguments, {
							response: response,
							path: path
						});
					}

					// Make sure we have access, or REJECT.	
					if (menu_path_info.access 
						&& !hostess.accessCheck('anonymous', menu_path_info.access)) {
						response.writeHead(403, {"Content-Type": "text/plain"});
						response.write('403 | Forbidden');
						throw new Error('Permission denied.');
					}
			
					// If we have an associated template, fetch it.
					if (menu_path_info.template) {
						var template_response = getTemplate(menu_path_info.template);
						var template_data = template_response
							.then(function(data) { 
								console.log('Template loaded...');
								return data.toString();
							})
							.catch(function(err) {
								console.log('Error fetching template: ' . err);
							});
						calls = calls.concat([template_response, template_data]);
					}

					// Execute the callback with our processed args.
					var internal_response = menu_path_info.callback.apply (null, args);

					// Prep module response for templating.
					if (menu_path_info.template) {
						var module_response = internal_response
							.then(function captureModuleTemplateResponse (modResp) {
								/**
								   @TODO
								     Process response.
								 */

								return modResp;
							});


						// Process the template.
						var template_complete = Promise.all([module_response,template_data])
							.then(function (module_data) {
								var mod_data = module_data[0];
								var tpl = module_data[1];

								// Evaluate the template, and output it.
								var processed_template = chef.processTemplate(mod_data, tpl);								
								var output_template = processed_template
									.then(function (parsed_tpl) {
										response.write(parsed_tpl);
									});

								calls = calls.concat([processed_template, output_template]);
							});

						calls = calls.concat([module_response,template_complete]);
					}

					// Merge or push any promises to the promise array.
					if (Array.isArray(internal_response)) {
						// Push our promise(s) onto the return array.
						calls = calls.concat(internal_response);
					}
					else {
						calls.push(internal_response);
					}
				}
			}
		}
		catch (Error) {
			console.log('A hostess exception occured.');
			console.log(Error);
		}

		return calls;
	}


	/**
	 * Given an args array from a path definition, finalize the args we should pass to the path callback.
	 * 
	 * @param  {array} args
	 *   The args requested to pass to our path callback.
	 * @param  {object} global_available_vars
	 *   The list of all available "global" variables we can make available as args to our path callback.
	 * 
	 * @return {array}
	 *   A list of args we should pass to our path callback, in the order they should be passed.
	 */
	function prepare_args(args, global_available_vars) {

		var final_args = [];

		if (args && Array.isArray(args)) {
			for (var i = 0; i < args.length; i++) {
				var myArg = args[i];

				if (myArg == 'GLOBAL_RESPONSE') {
					myArg = global_available_vars.response;
				}

				final_args.push(myArg);
			}
		}

		return final_args;
	}


	function reservationType (path) {
		var extension = path.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/);
		console.log(path + ' is of type ' + extension + '.');
		return extension;
	}


	/**


	    @TODO
			SEATING CHART should be removed form here.


	 */
	function getTemplate(path, seating_chart) {

		/**
		   @todo

		     If we want to check multiple paths for our template,
		     check each location, using a separate promise.
		 */

		// Return the getFile promise, which will be the contents of the template file.
		return getFile(path);
/**
		return new Promise(function (resolve, reject){

			// Attempt to load a template.
			if (fileExists(path, seating_chart) === false) {
				console.log('Template file, ' + path + ', does not exist.');
				reject('Template file does not exist.');
			}

			console.log(path + 'was found. Fetching...');

			// Return the getFile promise, which will be the contents of the template file.
			return getFile(path);
		});
*/
	}


	/**
	 * Check if a file was in our seating chart.
	 * 
	 * @param {string} path
	 *   A path relative to our docroot.
	 * @param  {[type]} seating_chart
	 *   A hash map of our file system, relative to our docroot.
	 * 
	 * @return {boolean}
	 *   TRUE if a path could be found. Otherwise FALSE.
	 *
	 * @TODO
	 * @note
	 *   This only checks if the file existed at the time the server was started.
	 *   It does not account for any files added since spin-up of our node script.
	 */
	function fileExists(path, seating_chart) {

		// Hash our path, and check the seating chart.
		// If the file was not in our file hash map, don't try to load it.
		var my_path_hash = sutil.hash(path);

		// Don't try to serve a file not on our seating chart.
		if (seating_chart.indexOf(my_path_hash) >= 0) {
			return true;
		}

		return false;
	}


	/**
	 * Attempt to load a file from the file system.
	 * 
	 * @param {string} path
	 *   A path, relative to our docroot.
	 * 
	 * @return {Promise}
	 *   A promise, which resolves with the data from the file.
	 */
	function getFile(path) {
		return new Promise(
			function(resolve, reject) {

				// Set an absolute path.
				path = __dirname + '/' + path;

				console.log('File resolves to: ' + path);

				// First check for a real path.
				// Serve the file, if found.
				fs.readFile(path, function (err, data) {
			        if (err) { reject('Error reading file: ' + err); }
					resolve(data);
				});
			}
		);
	}


	/**
	 * Take a promise from a file load,
	 * and serve the data as the complete response.
	 * 
	 * @param  {Promise} file_loaded
	 *   A promise of a file loaded, with the data of the file passed.
	 * @param {obj} response
	 *   The response object for the server request.
	 * @param {string} extension
	 *   The file extension which should be used to set the
	 *   response headers.
	 * 
	 * @return {Promise}
	 *   A promise which will complete by writing the file contents
	 *   to the response.
	 */
	function serveFileAsResponse(file_loaded, response, extension) {
		file_loaded
			.then(function writeFileToResponse (data, extension) {

				console.log('Serving ' + extension + '.');
				
				// Write our header before we present the file.
				writeHeader(response, extension);

				// Write the data.
				response.write(data);

				resolve(true);
			})
			.catch(function serveFileCatch(err) {
				console.log('Error serving physical file. Message: ' . err);
			});
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
	 */
	function virtualSeatingChart() {
		payroll.module_roster.forEach(function(module_name) {
			var my_module = sutil.module_require(module_name);

			if (my_module && my_module.paths) {
				// Add all paths in this module to our paths module.
				parseVirtualPaths(my_module.paths);
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
	function parseVirtualPaths(path_list) {
		if (path_list instanceof Object) {
			path_list.forEach(function(p) {
				if (p.path) {
					paths.addInternalPath(p.path, p);
				}
			}); 
		}
	}


	/**
	 
       @TODO

         Given a URL, to to match it against our virtual seating chart.




	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
	function resolveVirtualPath(url) {
		if (!paths) {
			throw new Error('Paths module not enabled.');
		}

		return paths.getPath(url);
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