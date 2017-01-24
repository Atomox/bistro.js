var sutil = sutil || require('./includes/server-utils'),
	parsetree = parsetree || require('./includes/server-parse-tree'),
	stack = stack || require('./includes/server-stack');


var chef = (function chefFactory() {
const BISTRO_FAILURE = '__FAILURE';

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
			try {

				// Old way:
				/**
				var parsed_tpl = parse(template, data, [
						{left: '{{', right: '}}', callback: processControlBlock}
					]
				);
				*/

				// New way:
				var parse_tree = parseTree(template);
				var parsed_tpl = resolveParseTree(parse_tree, data);

				resolve(parsed_tpl);
			}
			catch(Error){
				reject(Error);	
			}
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

		// Initialize scope stacks.
		initializeScope(vars);

		console.log('Parsing template with delimeters: ');
		console.log(delim_lft_rt_callback);

		var left = '',
			right = template,
			current_segment = null,
			blockProcessCallback = null;

		// Process the template until it's been consumed, and no outstanding segments remain.
		while (right.length > 0 || current_segment !== null) {

			// Process any outstanding segments.
			if (current_segment !== null) {
				current_segment = blockProcessCallback(current_segment,vars);
				left += (typeof current_segment == 'string') ? current_segment : '';
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

					console.log('Looping.... ' + z);
					console.log(zObj);

					// Get everything up to our opening paren, and add to complete.
					// If no seperator is found, we're done.
					var temp = sutil.splitOnce(right,zObj.left);				
					
					if (tmp_l === null || temp[0].length < tmp_l.length) {
						tmp_l = temp[0];
						tmp_r = (temp[1]) ? temp[1] : '';
						blockProcessCallback = zObj.callback;
						last_delimeter_right = zObj.right;
					}
				}

				left += tmp_l;
				right = tmp_r;



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
	 * @todo 
	 *   Rewrite Parse using Tree.
	 */
	function parseTree (template) {
		
		var right = template,
			tree = new parsetree.Tree('root', null),
			parents = new stack.Stack();

			// Push the root element onto the array.
			parents.push(tree.getRoot());

		while (right.length > 0) {

			// Get next segment. {{SOME_SEGMENT}}
			var tmp = parseNextSegment (right, '{{', '}}');

			if (tmp.left.length > 0) {
				tree.add('constant', parents.peek().id, parents.peek(), tmp.left);
			}

			// The command segment to analyze.
			var segment = tmp.segment;

			// The unprocessed remainder of the template.
			right = (tmp.right.length > 0) ? tmp.right : null;

			// Lexical analysis:
			while (command = parseReserveWord(segment)) {

				if (command.term && command.type) {
					var my_leaf = null;
					switch(command.type) {
						case 'block':
							// Add the block_word to the tree, and the parent to the stack.
							my_leaf = tree.add(command.word, parents.peek().id, parents.peek(), segment);
							parents.push(my_leaf);							
							break;
					
						case 'block_terminus':
							// Pop the parent off, add this as a parent.
							parents.pop();
							my_leaf = tree.add(command.word, parents.peek().id, parents.peek(), segment);
							parents.push(my_leaf);
							break;

						case 'terminus':
							// If the block_terminus pairs with the parent type,
							// pop the next element off the stack, and make it the parent.
							parents.pop();
							break;

						case 'reserve':
							// add reserve words to tree.
							/**
							   @TODO
							 */
							break;

						case 'variable':
							// add variable
							/**
							   @TODO
							 */
							break;
					}
				}

				/**
				   @TODO

				     As written, parseReserveWord does not return a remainder.
				     This means only 1 reserve word per {}.

				     Ultimately, we'll loop here.
				 */
				// Process the remainder.
				segment = (command.remainder) ? command.remainder : null;
			}
		}
	}


	/**
	 *
	 * @param  {Tree} tree
	 *   A parse tree, ready for contextual evaluation.
	 * @param  {object} data
	 *   The data object, as passed along with the original template.
	 * 
	 * @return {string}
	 *   The final template, translated into normal HTML.
	 */
	function resolveParseTree (tree, data) {
		/**
		 

			@TODO

			  Evaluate the tree.

			  From left-to-right, do a depth-first evaluation.

			  	- Keep track of the context of the data.

		 */
	}



	function parseReserveWord (segment) {

		// Get the very next reserve word.
		var reserve_words = ['#each', '#if', '#else', '/each', '/if'];
		var reserve_word_types = {
			'#each': 'block',
			'#if': 'block',
			'#else': 'block_terminus',
			'/each': 'terminus',
			'/if': 'terminus'
		}

		// Find the first occuring word, and pivot on it.
		if (first = sutil.firstOccuring(reserve_words, segment)) {
			var temp = sutil.splitOnce (segment, first);

			if (!reserve_word_types[first]) {
				throw new Error('Lexical Analysis for term "' + first + '" failed.');
			}

			return {
				type: reserve_word_types[first], 
				word: first,
				segment: temp[1] ? temp[1] : '' 
			}			
		}
		
		return false;
	}


	function parseNextSegment (segment, delimeter_left, delimeter_right) {

		// Get everything up to our opening paren, and add to complete.
		// If no seperator is found, we're done.
		var temp = sutil.splitOnce(segment,delimeter_left);				
		
		var left = temp[0],
			segment = '',
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

		return {
			left: left,
			segment: segment,
			right: right
		};
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

		console.log(' <<< Process Control Block >>> ');
		console.log(vars);
		console.log(segment);
		
		return (segment.length > 0) 
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
			: '';
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
		var function_list = {
			each: reserveWord_each,
			if: reserveWord_if,
			else: '',  
			switch: '',  
			case: '',  
			break: '',  
			var: ''
		};

		// Split by the first word.
		var temp = sutil.splitOnce(segment, ' ');

		var reserve = temp[0],
			args = (temp[1]) ? temp[1] : null;

		if (function_list[reserve]) {
			segment = function_list[reserve](args, vars);
		}
		else {
			throw new Error('Could not eval: ' + segment);
		}

		/**
		 * @todo 
		 *   if loop, add a map from param to subparams.
		 */
		
		return '<<<<<' + segment + '>>>>>';
	}


	function reserveWord_each(args, vars) {
		addScope('each', args, vars);
		return '<<<< foreach(' + args + ') >>>>';
	}

	function reserveWord_if(args, vars) {

		/**
		   @TODO
		     Split args, and eval one at a time.
		 */
		var var_value = evalScope(args, vars);
		if (var_value !== BISTRO_FAILURE && var_value) {
			return 'if(true)';
		}

		return '<<<< if (true === false) >>>>';
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

					var var_value = evalScope(params[0], vars);
					if (var_value !== BISTRO_FAILURE) {
						maps_to = var_value;
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


	/**
	 * Initialize scope storrage within our current vars object.
	 * This should be done before any parsing or object resolution is run.
	 * 
	 * @param {object} vars
	 *   (PASSED BY REFERENCE) The vars object being passed around,
	 *   where we store not only variables but scope.
	 */
	function initializeScope(vars) {

		if (!vars['__scope']) {
			vars['__scope'] = {
				each: []
			};
		}
		if (!vars['__stack']) {
			vars['__stack'] = {
			
/**
 * if
 *   each 
 *   	if
 *   		each
 *     			if
 *     			/if
 *        	/each
 *      /if
 *      else
 *      	each
 *       		if
 *
 * 				elseif
 *     				each
 * 				else
 *
 * 				/if
 * 			/each
 * 		/if
 *   /each
 * /if
 *
 * stack:
 * 1.	  if => data => ''
 *
 * 2.	  each => data => ''
 * 	  
 * 
 */


			}
		}
	}


	/**
	 * Push a scope variable reference to the scope stack.
	 * 
	 * @param {string} op
	 *   The reserve word defining the scope.
	 * @param {string} context_var
	 *   The string name in context.
	 * @param {object} vars
	 *   (PASSED BY REFERENCE) The vars object being passed around,
	 *   where we store not only variables but scope.
	 */
	function addScope(op, context_var, vars) {
		vars['__scope'][op].push(context_var.trim());
	}


	/**
	 * Given a variable name, determine the value based upon the currently defined scope.
	 * 
	 * @param  {[type]} val  [description]
	 * @param {object} vars
	 *   (PASSED BY REFERENCE) The vars object being passed around,
	 *   where we store not only variables but scope.
	 *   
	 * @return {[type]}      [description]
	 */
	function evalScope(val, vars) {

		console.log('');
		console.log(' -> Eval scope for: ' + val);


		// Check the current scope for relevant context.
		// In scope, this value is probably attached to a parent element.
		// 
		//   E.G. __scope.each.0.people might have .name, so when .name is requested,
		//   look through the scope for any objects with .name as a child.
		if (vars['__scope']['each']) {


			console.log(' -> Eval scope in each...');


			for (var i = vars['__scope']['each'].length - 1; i >= 0; i--) {
				var tmp = vars['__scope']['each'][i];

				console.log('   -> Eval scope in each: ' + i);
				console.log(vars[tmp]);

				if (vars[tmp] && typeof vars[tmp] === 'object' && vars[tmp][0][val]) {
					console.log('Found ' + val + ' in scope...');
					return vars[tmp][0][val];
				}
			}
		}

		// Simple, base scope reference.
		if (vars[val]) {
			return vars[val];
		}

		return BISTRO_FAILURE;
	}

	
	return {
		processTemplate: processTemplate
	};
})();

module.exports = {
	processTemplate: chef.processTemplate
};