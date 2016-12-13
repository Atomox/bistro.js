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
		module_require: moduleRequire
	};
})();

module.exports = {
	hash: server_utils.hash,
	module_require: server_utils.module_require
};
