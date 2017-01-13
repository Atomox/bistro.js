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

		return new Promise(function (resolve, reject) {
			resolve(parse(template, data, [
					{left: '{{', right: '}}', callback: processControlBlock}
				]
			));
		});
	}


	/**
	 * Parse a given string for blocks of code to pass to a callback for evaluation.
	 * 
	 * @param  {string} template
	 *   A string of data we should parse.
	 * @param  {Object} vars
	 *   A set of data we should pass to the callback for contextual evaluating of any matched blocks.
	 * @param {array(object)} delim_lft_rt_callback
	 *   An array of 1 or more objects with three attributes:
	 *   | @param  {string} delimeter_left
	 *   |   A delimeter denoting the start of a code block.
	 *   | @param  {string} delimeter_right
	 *   |   A delimeter denoting the end of a code block.
	 *   | @param  {[type]} callback
	 *   |   A callback function we should pass any blocks we find to. Should expect (string, vars),
	 *   |   and replace any control blocks with evaluated strings.
	 * 
	 * @return {string}
	 *   The template, with all blocks evaluated.
	 */
	function parse (template, vars, delim_lft_rt_callback) {

		console.log('Parsing template with delimeters: ' + delimeter_left + ' ' + delimeter_right);

		var left = '',
			right = template,
			current_segment = null,
			blockProcessCallback = null;

		// Process the template until it's been consumed, and no outstanding segments remain.
		while (right.length > 0 || current_segment !== null) {

			// Process any outstanding segments.
			if (current_segment !== null) {
				current_segment = blockProcessCallback(current_segment,vars);
				left += (typeof current_segment.data == 'string') ? current_segment.data : '';
				current_segment = null;
			}
			// If no current segment, look for next one.
			else {
				
				var first = null, tmp_l = null, tmp_r = null,
					tmp_callback = null, last_delimeter_right = null;

				// In case we have multiple delimeter pairs,
				// look for whichever occurs first, and use that one.
				for (var z = 0; z < delim_lft_rt_callback.length; z++) {
					var zObj = delim_lft_rt_callback[z];

					// Get everything up to our opening paren, and add to complete.
					// If no seperator is found, we're done.
					var temp = sutil.splitOnce(right,zObj.left);				
					if (temp[0].length < tmp_l.length || tmp_l === null) {
						tmp_l = temp[0];
						tmp_r = (temp[1]) ? temp[1] : '';
						blockProcessCallback = zObj.callback;
						last_delimeter_right = zObj.right;
					}
				}

				left += temp_l;
				right = temp_r;

				// If we found a start, right should be a block code segment.
				// Split again by end delimeter.
				if (right.length > 0) {
					// Get everything up to our first closing paren,
					// and make it our current_segment.
					// Add remainder as the remaining right.
					temp = sutil.splitOnce(right,last_delimeter_right);
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

		// Look for the skip_mode string. Disgard everything until we find it.
		// Until we do, don't parse anything.
		var temp = sutil.splitOnce(segment,skip_until);
		segment = (temp[1] || temp[1] === '') ? temp[1] : false;
		
		return {
			mode: null,
			data: (segment.length > 0) 
				? parse(segment, vars, [
						{
							left: '[',
							right: ']', 
							callback: processCommandBlock
						},
						{
							left: '#', 
							right: "\n",
							callback: processReserveWords
						}
						// @TODO
						//   How do we detect closing tags, like /if?
					]) 
				: ''
		}
	}


	function processReserveWords (segment, vars) {

		console.log(' <<< Process Reserve Words >>> ');
		console.log(vars);
		console.log(segment);

		// Parse for block functions. These should be the very first words in the segment,
		// since detecting a # is what got us here.
		// 
		// I.E. 
		//   #each people AS key => value
		//   
		//   Would be passed as:
		//   
		//   each people AS key => value
		//   
		var function_list = [
			'each',  
			'if',  
			'else',  
			'switch',  
			'case',  
			'break',  
			'var'  
		];

		/**
		 * 
		 */
		
		return '<<<<<' + segment + '>>>>>';
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