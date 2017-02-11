var walkin = walkin || require('../../../server-walkin');

var myDbTestModule = (function (){

	var paths = [
		{
			path: 'walkin/test',
			title: 'Database Test Sandbox',
			access: 'access content',
			callback: test_database_callback, 
			type: 'normal'
		},
		{
			path: 'walkin/test/content',
			title: 'Database Test Sandbox',
			access: 'access content',
			callback: test_database_content_callback, 
			template: 'staff/modules/test_db/walkin_test.tpl',
			type: 'normal'
		},
	];


	function test_database_callback() {

		var query = walkin.select('SELECT 1 + 1 AS two');

		return query.then(function acceptDbResult(rows, fields) {
			console.log('We have results!');
			console.log(' - - - - - - - - -');
			console.log(fields);
			console.log(' - - - - - - - - -');
			console.log(rows);
		});
	}


	function test_database_content_callback() {
		
		// Query the database.
		var query = walkin.select('SELECT * FROM lorem l');

		// Process the results.
		var handleResults = query.then(function acceptDbResult(rows, fields) {

			return new Promise(function(resolve, reject) {

				var results = {
					title: 'Test the DB',
					rows: rows
				}	

				resolve(results);
			});
		});

		// Return the processing results promise,
		// so the system doesn't terminate prematurely.
		return handleResults;
	}

	return {
		paths: paths
	};
})();

module.exports = {
	paths: myDbTestModule.paths
};