const mysql = require('mysql');

/**
   @TODO
     Let's find a *safer* way to provide this to our module.
 */
payroll = require('./server-payroll');



var db = (function dbConn() {

	function getConnection() {
		var freezer = mysql.createConnection(payroll.db_credentials);

		return freezer;
	}


	/**
	 * Open a connection to the DB.
	 * 
	 * @return {connection}
	 *   A DB object we can act upon.
	 */
	function connect() {

		/**
		   @todo When we care about performance, look into Connection Pools. See:

		   @see https://codeforgeek.com/2015/01/nodejs-mysql-tutorial/
		 */

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