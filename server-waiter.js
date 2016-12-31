
/**
 * Serve the actual content.
 */
var serveContent = (function serverFactory() {

	// public.
	function serveContent(response, content) {
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

					if (content[i]) {
						// Get our content.
						var myContent = generateContent('p', content[i], ['content-' + i, 'content']);

						console.log('Fetching content for promise ' + self_id);

						// Write it to the response after a small wait time,
						// and resolve our promise.
						setTimeout(function myCallback(err) {
							response.write(myContent);
							resolve(i);
							}, wait);						
					}
				}
			);
			i++;
		} while(i < content.length);

		return calls;
	}

	function serveIncludeFile(type, path, response) {
		if (type == 'css') {
			response.write('<link type="text/css" href="' + path + '" media="screen" rel="stylesheet">');
		}
	}

	// private.
	function generateContent(type, content, classes) {
		
		if (content) {
			return wrapContent(content, 'p', classes);
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