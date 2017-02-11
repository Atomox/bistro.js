var assert = require('assert');

var prepcook = prepcook || require('../server');

describe('Bistro.js', function() {

	describe('Route', function() {
		it ('Should match a path that matches completely.');
		it ('Should match a path that is less than the passed path, if no deeper path is available.');
		it ('Should pass extra path vars as arguments if it matches a shallowers path level than one passed.');
		it ('Should match wildcard levels in path.');
	});

	describe('Serve', function() {

		it ('Should be able to serve a css file with proper headers..');
		it ('Should be able to serve a physical file.');
		it ('Should be able to serve a virtual path.');
		it ('Should serve a file the same each time.');
	});

	describe('Access', function() {

		it ('Should grant access to valid GET requests.');
		it ('Should deny access to valid POST requests from anonymous users.');
		it ('Should grant access to valid POST requests to authorized users.');
	});
});