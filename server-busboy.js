// Require node.js utility.
var util = require('util');

var busBoy = (function busboyFactory() {

	/**
	 * Given a value, print it in a nice way.
	 */
	function printDebugger(cart, response) {

		var my_output = '';

		if (cart === null) {
			return;
		}

		switch(typeof cart){

			case 'object':
				my_output = stringify(cart);
				break;

			case 'boolean':
			case "number":
			case "string":
			case "symbol":
			case Implementation-dependent:
				my_output = cart;
				break;

			case "function":
				my_output = '(function)' + cart.name;
				break;

		}

		response.write('<pre class="busboy">');
		response.write(my_output);
		response.write('</pre>');

		return;
	}


	/**
	 * toString() for circular object.
	 * 
	 * @param {object} myObject
	 *   An object to recurse.
	 * 
	 * @return {string}
	 *
	 * @see 
	 *   http://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json/11616993#11616993
	 */
	function stringify(myObject) {
		return stringify_native(myObject);

		var cache = [];
		var result = JSON.stringify(myObject, function busboyStrifyRecurse(key, value) {
		    if (typeof value === 'object' && value !== null) {
		        if (cache.indexOf(value) !== -1) {
		            // Circular reference found, discard key
		            return;
		        }
		        // Store value in our collection
		        cache.push(value);
		    }
		    return value;
		});
		cache = null; // Enable garbage collection
		return result;
	}


	function stringify_native (myObject) {
		return util.inspect(myObject, { showHidden: true, depth: 8 });
	}


	function prettifyObjectString(myObject) {

		return myObject;
	}
	
	return {
		bb: printDebugger
	};
})();

module.exports = {
	bb: busBoy.bb
};