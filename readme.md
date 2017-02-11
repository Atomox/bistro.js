# Bistro.js


**A simple CMS/Framework built in Node.js. 
Developed along side [prepCook.js](https://github.com/Atomox/prepcook.js).**


## Module-based development

Create your module.

```
var myFirstModule = (function (){

	// Define your paths, and link the to a callback.
	var paths = [
		{
			path: 'my/first/path',
			title: 'My First Module',
			access: 'access content',
			callback: general_content_callback,
			template: 'staff/modules/my_first_module/my_first_module.tpl',
		},
	];

	// Your callback returns a Promise.
	function general_content_callback() {
		return new Promise(
			function(resolve, reject) {
				resolve(your_data_here);
			}
		);
	}

	return {
		paths: paths
	};
})();

module.exports = {
	paths: myFirstModule.paths
};
```

Enable it in `payroll.js`:
```	
var staff_roster = [
	'my_first_module',
	'lorem_ipsum_example',
	'winterfell_burns'
];
```

## Real and virtual path routing

## Leverege smart template by integrating [prepCook.js](https://github.com/Atomox/prepcook.js), or plug in Handlebars, or other template languages.

## Independence from other heavy libraries.


## TODO
1. Database schema building.
2. Database query building.
3. Fields and Object Types.
4. Users sessions.
5. Tests.