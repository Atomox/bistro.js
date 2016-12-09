const mysql = require('mysql');


var db = (function dbConn(){

	function getConnection() {
		var freezer = mysql.createConnection({
			host: 'localhost',
			user: 'bistro',
			password: 'bistro1',
			database: 'bistro'
		});

		return freezer;
	}


	/**
	 * Open a connection to the DB.
	 * 
	 * @return {connection}
	 *   A DB object we can act upon.
	 */
	function connect(){
		console.log('Getting connection.');
		var freezer = getConnection();
		freezer.connect();
		return freezer;
	}


	/**
	 * Perform the passed SELECT statement.
	 * 
	 * @param  {string} query
	 *   A string query, which should be a select.
	 * 
	 * @return {result}
	 *   The result object with all fields returned.
	 */
	function select(query_string) {
		
		// Connect
		var freezer = connect();

		return new Promise(function dbExecute(resolve, reject) {
			freezer.query(query_string, function dbExecuteReturn (err, rows, fields) {
				if (err) { 
					// freezer.end();
					reject(err); 
				}
				console.log('We made it!  |  ' + fields);
				// freezer.end();
				resolve(rows, fields);
			});
		});
	}

	return {
		select: select
	}
})();

module.exports = {
	select: db.select
};