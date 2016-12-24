var waiter = waiter || require('../../../server-waiter');

var lorem_ipsum_module = (function lorem_ipsum_example_factory() {

	/**
	   @TODO

	     Ultimately, can we make an interface for this? More like a class with abstract values.
	     However, since classes in JS are a lie, is there another way to do this?

	 */
	var paths = [
		{
			path: 'examples/lorem_ipsum',
			title: 'Lorem Ipsum',
			access: 'access content',
			callback: lorem_ipsum_timeout_front_page,
			  

			/**  
			 
			   @TODO

				Make this a global variable, instead of a string

			 */

			arguments: ['GLOBAL_RESPONSE']
		}
	];

	/**
	  @TODO
		Testing out our first function. Hook this up.
	 */
	function lorem_ipsum_timeout_front_page(response) {

		// Print a valid header.
		response.writeHead(200, {"Content-Type": "text/html"});

		// Debugger to the screen.
//		bb(request, response);

		return new Promise(
			function(resolve, reject) {

				var calls = waiter.serve(response);
			
				Promise.all(calls)
				.then (function() {
					resolve();
				});
			}
		);
		
		console.log('All iteration started.');

	}

	return {
		paths: paths
	};
}) ();

module.exports = {
	paths: lorem_ipsum_module.paths
};