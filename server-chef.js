var sutil = sutil || require('./includes/server-utils');

var chef = (function chefFactory() {

	/**
	 * Given a template and some contextual data, parse, evaluate,
	 * and return our final template for display to the user.
	 * 
	 * @param  {Object} data
	 *   A set of data we should pass to the callback for contextual evaluating of any matched blocks.
	 * @param  {string} template
	 *   A string of data we should parse.
	 *   
	 * @return {string}
	 *   A promise, which will resolve with the template, with all blocks evaluated.
	 */
	function processTemplate(data, template) {

		return new Promise(function (resolve, reject){
			// Return the getFile promise, which will be the contents of the template file.
			resolve(parse(template, data, '{{', '}}', processControlBlock));
		});
	}


	/**
	 * Parse a given string for blocks of code to pass to a callback for evaluation.
	 * 
	 * @param  {string} template
	 *   A string of data we should parse.
	 * @param  {Object} vars
	 *   A set of data we should pass to the callback for contextual evaluating of any matched blocks.
	 * @param  {string} delimeter_left
	 *   A delimeter denoting the start of a code block.
	 * @param  {string} delimeter_right
	 *   A delimeter denoting the end of a code block.
	 * @param  {[type]} blockProcessCallback
	 *   A callback function we should pass any blocks we find to. Should expect (string, vars),
	 *   and replace any control blocks with evaluated strings.
	 * 
	 * @return {string}
	 *   The template, with all blocks evaluated.
	 */
	function parse (template, vars, delimeter_left, delimeter_right, blockProcessCallback) {

		console.log('Parsing template with delimeters: ' + delimeter_left + ' ' + delimeter_right);

		var left_pattern = new RegExp(delimeter_left + "[\s\S]*?"),
			right_pattern = new RegExp(delimeter_right + "[\s\S]*?");

		var left = '',
			right = template,
			current_segment = null;

		// Process the template until it's been consumed, and no outstanding segments remain.
		while (right.length > 0 || current_segment !== null) {

			// Process any outstanding segments.
			if (current_segment !== null) {
				left += blockProcessCallback(current_segment,vars);
				current_segment = null;
			}
			// If no current segment, look for next one.
			else {
				// Get everything up to our opening paren, and add to complete.
				// If no seperator is found, we're done.
				var temp = sutil.splitOnce(right,delimeter_left);
				left += temp[0];
				right = (temp[1]) ? temp[1] : '';

				// If we found a start, right should be a block code segment.
				// Split again by end delimeter.
				if (right.length > 0) {
					// Get everything up to our first closing paren,
					// and make it our current_segment.
					// Add remainder as the remaining right.
					temp = sutil.splitOnce(right,delimeter_right);
					current_segment = temp[0];
					right = (temp[1]) ? temp[1] : '';
				}
			}
		}

		return left;
	}


	/**
	 * Callback for first pass of parsing templates. 
	 *
	 * This function should be passed the complete set of {{ }} code in templates,
	 * minus the wrapping Control Block delimeters.
	 *
	 * These control blocks are the scripts we should evaluate. There can be multiple commands within this block.
	 * 
	 * @param  {string} segment
	 *   A string of code which we should parse for commands.
	 * @param  {Object} vars
	 *   An object containing all vars tis template might reference.
	 *   
	 * @return {string}
	 *   The segment, with all commands parsed and evaluated.
	 */
	function processControlBlock (segment, vars) {
		return parse(segment, vars, '[', ']', processCommandBlock);
	}


	/**
	 * A callback which converts commands/filters into values,
	 * based upon the vars.
	 *
	 * Define all syntax/commands for our template language here.
	 * 
	 * @param  {string} segment
	 *   A single command string, which should contain a single command.
	 * @param  {Object} vars
	 *   An object containing all vars tis template might reference.
	 *  
	 * @return {string}
	 *   The segment, with the command evaluated.
	 */
	function processCommandBlock (segment, vars) {

		console.log(' <<< Process Command Block >>> ');
		console.log(vars);
		console.log(segment);

		// This should be either a function or a pattern...
		var params = segment.split('|');
		var maps_to = '';

		if (params[1]) {
			switch (params[1]) {

				case 'int':
				case 'text':
				case 'array':
				case 'list':
				case 'string':

					if (vars[params[0]]) {
						maps_to = vars[params[0]];
					}
					else {
						throw new Error('Bad template variable reference: ' + params[0]);
					}
					break;

				case 'function':
				case 'callback':
					/**
					 
					  @todo

					 */
					break;
			}
		}
		return maps_to;
	}

	
	return {
		processTemplate: processTemplate
	};
})();

module.exports = {
	processTemplate: chef.processTemplate
};