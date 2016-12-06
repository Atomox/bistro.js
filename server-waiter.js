
/**
 * Serve the actual content.
 */
var serveContent = (function serverFactory() {

	// public.
	function serveContent(response) {
		var i = 0;

		// All promises we're making, to be returned.
		var calls = [];

		// Start a bunch of calls.
		do {
			var wait = Math.random() * 3000 + 1000;
			if (i == 0) { wait = 0; }

			calls[i] = new Promise(
				function(resolve, reject) {

					// Pull our ID into the local scope, so it doesn't get lost.
					var self_id = i;

					// Get our content.
					var myContent = generateContent('p', self_id, ['content-' + i, 'content']);

					console.log('Fetching content for promise ' + self_id);

					// Write it to the response after a small wait time,
					// and resolve our promise.
					setTimeout(function myCallback(err) {
						response.write(myContent);
						resolve(i);
						}, wait);
				}
			);
			i++;
		} while(i < 4);

		return calls;
	}

	function serveIncludeFile(type, path, response) {
		if (type == 'css') {
			response.write('<link type="text/css" href="' + path + '" media="screen" rel="stylesheet">');
		}
	}

	// private.
	function generateContent(type, index, classes) {
		
		var data = content_store();
		var size = content_store().length;
		
		if (data[index]) {
			return wrapContent(data[index], 'p', classes);
		}

		return false;
	}

	// private.
	function wrapContent(data, tag, classes) {
		
		my_tag = 'div';
		my_class = '';

		if (typeof classes == 'object' && classes !== null) {
			my_class = classes.join(' ');
		}

		switch(tag) {
			case 'p':
				my_tag = 'p';
				break;

			default:
				my_tag = 'div';
		}

		var result = '<' + my_tag + ' class="' + my_class + '">' + data + '</' + my_tag + '>';
		return result;
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
		serve: serveContent,
		includeFile: serveIncludeFile
	};
})();


// Export our module.
module.exports = {
	serve: serveContent.serve,
	includeFile: serveContent.includeFile
};