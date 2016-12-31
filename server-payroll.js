
var myPayroll = ( function settingsFactory() {

	var db_credentials = {
		host: 'localhost',
		user: 'bistro',
		password: 'bistro1',
		database: 'bistro'
	};

	// An array of modules (staff) actively on our CMS roster for use.
	// If it's not here, it's not included.
	/**
		@TODO
		  Ultimately, we wanna be able to add to this without rebooting server.js,
		  and we want all stuff to be stored as code, for less headaches when
		  multiple people want to update across environments.

		  This is just an up-and-running start.
	 */
	var staff_roster = [
		'my_first_module',
		'lorem_ipsum_timeout_example',
		'test_db'
	];

	var locker_room_path = 'staff/modules';

	return {
		module_path: locker_room_path,
		module_roster: staff_roster,
		db_credentials: db_credentials
	};
})();

module.exports = {
	module_path: myPayroll.module_path,
	module_roster: myPayroll.module_roster,
	db_credentials: myPayroll.db_credentials
};