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
	theme = theme || require('./staff/themes/my_first_theme/my_first_theme'),
    prepcook = prepcook || require('prepcook.js');



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
					// Serve 404.
					virtual_path = theme.theme[404];
					menu_path_info = {
						theme: false,
						arguments: null,
						callback: false,

							/**
							 
								@TODO

								  We need to pass includes to be available when we bind the scope to the template,
								  so includes work for themeplates without a theme wrapper around them.


							 */



						template: virtual_path.template,
						includes: virtual_path.includes
					}
				}
				else {
					// If we have found a virtual path match,
					// set it as our menu item.
					menu_item = virtual_path.match;
					menu_item_depth = virtual_path.length;
					menu_path_info = menu_item.data;
				}

				var args = [];

				if (typeof menu_path_info.theme === 'undefined') {
					menu_path_info.theme = true;
				}

				console.log('Seating a virtual path: ');
				console.log(' - - - - - - - - - ');
				console.log(menu_path_info);
				console.log(' - - - - - - - - - ');
				

				// If menu item has a callback, check for args. Then call the callback, passing args if available.
				// check for placeholder args, like GLOBAL_RESPONSE, which should but supplimented with the response object.
				if (menu_path_info.callback || menu_path_info.template) {

					console.log('Seated path Callback found. Executing...');

					// Prepare any args declared in the path item, and prepare to pass them to the path callback.
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
						var template_data = getTemplate(menu_path_info.template);
						calls.push(template_data);
					}


					var theme_template = new Promise(function(resolve, reject) {
						if (menu_path_info.theme && theme.theme) {
							theme_path_info = theme.theme.master;
							var theme_template_data = getTemplate(theme_path_info.template);
							var theme_template_vars = (typeof theme_path_info.callback === 'function') 
								? theme_path_info.callback()
								: Promise.resolve({});

							var theme_template_includes = false;
							if (typeof theme_path_info.includes !== 'undefined') {
								theme_template_includes = Promise.resolve(theme_path_info.includes);
							}
							else {
								theme_template_includes = Promise.resolve();
							}
							
							Promise.all([theme_template_data, theme_template_vars, theme_template_includes])
								.then(function(theme_data) {

									console.log(' >>> A <<<');
									resolve({
										tpl: theme_data[0],
										vars: theme_data[1],
										includes: theme_data[2]
									});
								})
								.catch(function(err){
									console.log('Problem fetching theme master template.');
									reject(err);
								});
						}
						else {
							resolve(false);
						}
					});
					calls.push(theme_template);
					

					// Execute the callback with our processed args.
					var internal_response = (typeof menu_path_info.callback === 'function') 
						? menu_path_info.callback.apply (null, args)
						: Promise.resolve({});

					// Merge or push any promises to the promise array.
					if (Array.isArray(internal_response)) {
						calls = calls.concat(internal_response, calls);
					}
					else {
						calls.push(internal_response);
					}


					// Prep module response for templating.
					if (menu_path_info.template) {
						var module_response = new Promise(function(resolve, reject) {
							internal_response.then(function captureModuleTemplateResponse (modResp) {
								resolve(modResp);
							})
							.catch(function(err) {
								console.warn('Error retrieving data from path callback promise.', err);
								reject(err);
							});
						});


						// Process the template.
						var template_complete = new Promise(function(resolve, reject) {

							Promise.all([module_response, template_data, theme_template]).then(function (module_data) {
								var mod_data = module_data[0];
								var tpl = module_data[1];

								var my_scope,
									my_template;

								try {
									if (typeof module_data[2] === 'object') {
										console.log('Theme detected... Wrapping template...');
										my_template = module_data[2].tpl;
										my_scope = module_data[2].vars;
										my_includes = module_data[2].includes;

										// Bind any includes, like css or js.
										if (typeof my_includes !== 'undefined') {
											if (typeof my_includes.css !== 'undefined') {
												for (css in my_includes.css) {
													my_scope = prepcook.bindInclude(my_scope, css, 'css', my_includes.css[css].path);
												}
											}
										}

										// Bind the template and data at the request path as a sub template
										// of the master theme template.
										my_scope = prepcook.bindSubTemplate(my_scope, 'content', tpl, mod_data);
									}
									else {



										
										/**
										    

										    @TODO

												We need to bind #includes for templates without a theme wrapper.
												
										 */


										console.log('No theme... Serving template solo...');
										my_template = tpl;
										my_scope = mod_data;
									}

									// Attach our template loader function to the Prepcook vars.
									my_scope = prepcook.config(my_scope, '#template', getTemplateByName);
								}
								catch(err) {
									console.log('Error prepping template: ', err);
								}

								/**

								   
								   @END @TODO


								 */
								console.log(' >>>>>>>>>>>>>> ', my_scope);

								// Evaluate the template, and output it.
								var processed_template = prepcook.processTemplate(my_scope, my_template);

								var output_template = processed_template
									.then(function (parsed_tpl) {
										response.write(parsed_tpl);
										resolve(true);
									})
									.catch(function (err){
										console.error('An error occured in ' + e.fileName + ' on line ' + e.lineNumber + ' during template parsing.', err);
										resolve(false);
									});
							});
						})
						.catch(function(err) {
							console.log(err);
						});

						calls.push(module_response);
						calls.push(template_complete);
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
	
	function getTemplateByName(name, as_object) {
		/**
		   @todo

		     If we want to check multiple paths for our template,
		     check each location, using a separate promise.
		 */
		var path = '';
		
		// Search the current theme for this template name.
		if (typeof theme.theme === 'object' && theme.theme !== null) {
			for(t in theme.theme) {
				if (t == name && theme.theme[t].template) {
					path = theme.theme[t].template;
				}
			}
		}

		// If not found, check all enabled modules for this template.
		if (path == '') {
			for (t in payroll.module_roster) {
				var my_module = sutil.module_require(payroll.module_roster[t]);

				if (my_module && my_module.theme) {
					for (u in my_module.theme) {
						if (u == name && my_module.theme[u].template) {
							path = my_module.theme[u].template;
						}
					}
				}
			}
		}

		if (as_object === true) {
			return new Promise(function(resolve, reject) {
				getTemplate(path).then(function(tpl) {
					resolve({
						template: tpl,
					});
				})
				.catch(function(err) {
					reject(err);
				});
			});
		}

		return getTemplate(path);
	}

	function getTemplate(path) {


		// Return the getFile promise, which will be the contents of the template file.
		return new Promise(function(resolve, reject) {

			if (path.length <= 0) {
				reject('Could not find template with name ' + name);
			}

			var template_response = getFile(path);
			var template_data = template_response
				.then(function(data) { 
					console.log('Template loaded...');
					resolve(data.toString());
				})
				.catch(function(err) {
					console.log('Error fetching template: ' + err);
					reject(err);
				});
		});
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