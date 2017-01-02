var waiter = waiter || require('../../../server-waiter'), 
    walkin = walkin || require('../../../server-walkin');

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
			callback: lorem_ipsum_static,

			/**  
			 
			   @TODO

				Make this a global variable, instead of a string

			 */

			arguments: ['GLOBAL_RESPONSE']
		},
		{
			path: 'examples/lorem_ipsum/db',
			title: 'Lorem Ipsum',
			access: 'access content',
			callback: lorem_ipsum_database_callback,
			arguments: ['GLOBAL_RESPONSE']
		},
	];

	/**
	  @TODO
		Testing out our first function. Hook this up.
	 */
	function lorem_ipsum_timeout_front_page(response, data) {

		// Print a valid header.
		response.writeHead(200, {"Content-Type": "text/html"});

		// Attach css.
		waiter.includeFile('css', '../../server-tablecloth.css', response);

		// Debugger to the screen.
//		bb(request, response);

		return new Promise(
			function(resolve, reject) {

				var calls = waiter.serve(response, data);
			
				Promise.all(calls)
				.then (function() {
					resolve();
				});
			}
		);
		
		console.log('All iteration started.');
	}


	function lorem_ipsum_static(response) {
		return lorem_ipsum_timeout_front_page(response, content_store());
	}

	function lorem_ipsum_database_callback(response) {

		// Query the database.
		var query = walkin.select('SELECT * FROM lorem l');

		// Process the results.
		var handleResults = query.then(function acceptDbResult(rows, fields) {
			console.log(rows);

			var my_data = [];
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].body) {
					my_data[i] = rows[i].body;
				}
			}

			return lorem_ipsum_timeout_front_page(response, my_data);
		});

		return handleResults;
	}



	// private.
	var content_store = function content_store() {
		var lorem = [
			'Fixie wayfarers lomo, normcore wolf chicharrones kitsch stumptown intelligentsia occupy. Tbh prism kogi lyft, schlitz pop-up man bun activated charcoal offal art party. Irony retro ennui, everyday carry hexagon umami mumblecore. Stumptown drinking vinegar blog, salvia yr pop-up man bun ramps ethical ugh thundercats PBR&B green juice organic roof party. Skateboard gochujang next level poutine put a bird on it, shabby chic bitters cardigan. Portland cold-pressed mixtape, sartorial cardigan everyday carry selfies. Pour-over fixie pug letterpress church-key ethical.',
			'Chambray vexillologist hell of leggings, mumblecore food truck cardigan YOLO listicle. Deep v cardigan put a bird on it gentrify, copper mug mustache iceland yuccie quinoa retro butcher leggings meh master cleanse. Pour-over direct trade hell of brooklyn actually, cornhole blog. Aesthetic selvage portland, whatever raw denim tilde intelligentsia williamsburg. Banjo beard activated charcoal venmo, enamel pin single-origin coffee synth jean shorts bushwick. Art party schlitz listicle live-edge, ethical bespoke stumptown gastropub DIY twee hoodie vice franzen occupy VHS. Farm-to-table salvia succulents vaporware thundercats.',
			'Roof party enamel pin kitsch echo park gentrify shabby chic. Hot chicken cronut single-origin coffee, 8-bit you probably haven\'t heard of them hell of gentrify four dollar toast pabst migas. Affogato tumeric mumblecore marfa migas, lyft authentic skateboard. Prism shabby chic iPhone XOXO, PBR&B pickled banh mi butcher ugh subway tile man bun vinyl bespoke kombucha DIY. Prism XOXO disrupt bespoke, forage trust fund deep v yuccie polaroid fixie. Affogato selfies cornhole tilde lumbersexual locavore shoreditch, roof party drinking vinegar occupy brunch squid. Fixie lyft flexitarian, flannel glossier chia post-ironic ennui offal.',
			'Stumptown ugh kale chips slow-carb, pour-over direct trade listicle try-hard church-key irony banjo brunch you probably haven\'t heard of them semiotics selvage. Salvia jianbing kale chips semiotics godard beard. Venmo post-ironic meh blue bottle migas helvetica art party banh mi. Salvia pug fam, YOLO jean shorts scenester squid trust fund gastropub tumblr 3 wolf moon iPhone woke hot chicken tote bag. Intelligentsia disrupt shabby chic plaid lyft cold-pressed cred, leggings truffaut. Affogato shabby chic banjo kitsch. Chia you probably haven\'t heard of them locavore mustache.'
		];

		return lorem;
	}

	return {
		paths: paths
	};
}) ();

module.exports = {
	paths: lorem_ipsum_module.paths
};