/**
   @TODO
     Let's find a *safer* way to provide this to our module.
 */
var payroll = payroll || require('../server-payroll');
var path = path || require('path');

var server_utils = (function utils() {

	/**
	 * Our basic hash algorythm, which we use for hashing things, like a hasher.
	 * 
	 * @param  {string} str
	 *   The thing we're hashing
	 * 
	 * @return {string}
	 *   Our hashed string.
	 */
	function hashCode(str) {
	  var hash = 0, i, chr, len;
	  if (str.length === 0) return hash;
	  for (i = 0, len = str.length; i < len; i++) {
	    chr   = str.charCodeAt(i);
	    hash  = ((hash << 5) - hash) + chr;
	    hash |= 0; // Convert to 32bit integer
	  }
	  return hash;
	}


	/**
	 * Split a string into 2 pieces, left of first delimeter, and right of first delimeter.
	 * 
	 * @param  {string} str
	 *   A string to split.
	 * @param  {string} delimeter
	 *   A delimter to split around.
	 *   
	 * @return {array}
	 *   An array of up to 2 results, where [0] is the left side of the string at the first delimeter occurance,
	 *   and [1] is the right side of the first occurance of delimeter, unless unfound, or delimeter is at the end.
	 */
	function splitOnce(str,delimeter) {

		if (typeof str !== 'string' 
			|| typeof delimeter !== 'string') {
			throw new Error('splitOnce() expects string value.');
		}

		var pos = str.indexOf(delimeter),
			results = [];

		// If there is no delimeter, return the entire array as results[0].
		if (pos == -1) {
			return [str];
		}
		results[0] = str.substring(0, pos);
		
		// Only have a second have if we found a pos
		if (pos < str.length-delimeter.length) {
			results[1] = str.substring(pos+delimeter.length);
		}

		return results;
	}


	/**
	 * Require and return a module, if it exists.
	 * 
	 * @param {string} module_name
	 *   The module name we're loading.
	 * 
	 * @return {module|boolean}
	 *   An "instance" of the module, otherwise FALSE.
	 */
	function moduleRequire(module_name) {
		/**
		   @todo

		     Probably want some validation and security here.
		 */

		// Get the relative path we would use for a require.
		var my_module_path = path.join(payroll.module_path, '/', module_name, '/', module_name);

		console.log(my_module_path);

		/**
		    @TODO
		      Obviously, this needs to execute from root,
		      so we don't have to worry about relative paths. 

		    @TODO
		      When the path is not found, this throws an error.
		      Instead of catching exceptions, can we confirm this file exists first?
		      Is it possible to use the hashtable of real files to confirm this?

		      Perhaps we need a separate File API, which abstracts all this functionality.
		 */
		var my_module = require('../' + my_module_path);

		// Check the full path, and see if it exists.
		if ( my_module ) {
			console.log('Loaded module, ' + module_name + '.js');
			return my_module;
		}
		else {
			console.log('Could not load module, ' + module_name);
		}

		return false;
	}


	return {
		hash: hashCode,
		module_require: moduleRequire,
		splitOnce: splitOnce
	};
})();

module.exports = {
	hash: server_utils.hash,
	splitOnce: server_utils.splitOnce,
	module_require: server_utils.module_require
};
