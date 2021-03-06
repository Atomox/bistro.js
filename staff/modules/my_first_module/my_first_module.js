var myFirstModule = (function (){

	/**
	   @TODO

	     Ultimately, can we make an interface for this? More like a class with abstract values.
	     However, since classes in JS are a lie, is there another way to do this?

	 */
	var paths = [
		{
			path: 'first',
			title: 'My First Module',
			access: 'access content',
			callback: general_content_callback,
			template: 'staff/modules/my_first_module/my_first_module.tpl',
		},
		{
			path: 'second',
			title: 'My First Module',
			access: 'access content',
			callback: general_content_callback,
			template: 'staff/modules/my_first_module/my_second_module.tpl',
		},
		{
			path: 'simple',
			title: 'My Simple Template',
			access: 'access content',
			callback: general_content_callback,
			template: 'staff/modules/my_first_module/my_simple_template.tpl',
		},
		{
			path: 'content/*',
			id: 1,
			title: 'General Content',
			access: 'access content',
			
			/** 
			  @TODO 
			    Obviously this isn't a real callback.
			 	Do we pass an actual function, or some representation?
			 	As these get bigger, they could span multiple files,
			 	so let's think this through. Probably the actual function,
			 	but @TODO.
			 */
			callback: 'hello', 
			type: 'normal'
		},
		{
			path: 'albums/*',
			id: 1,
			title: 'Album',
			access: 'access content',
			callback: 'Album'
		},
		{
			path: 'albums/*/set/*',
			id: 1,
			title: 'Album Set',
			access: 'access content',
			callback: 'Album Set'
		},
		{
			path: 'albums/*/*',
			id: [2,3],
			title: 'Album/Photo',
			callback: 'album photo'
		},
		{
			path: 'photos/*',
			id: 1,
			title: 'Individual Photo',
			callback: 'Photo' 
		}
	];


	/**
	 * Examples:
	 */
	var myPaths = [
	    'albums/my_first_album/photos/my_first_photo',
	    'albums/my_first_album/photos/my_second_photo',
	    'albums/my_third/photos/my_first_photo',
	    'sets/123',
	    'sets/123/234',
	    'sets/123/my_first_photo'
	];


	/**
	  @TODO
		Testing out our first function. Hook this up.
	 */
	function general_content_callback() {
		return new Promise(
			function(resolve, reject) {
				resolve({
					message: {
						title: "Hi Dad Soup"
					},
					body: "ERAUQS SI DLRO WEHT",
					people: [
						{first: 'Alan', last: 'Alda', salary: 123456},
						{first: 'Ben', last: 'Bova', salary: 234.56},
						{first: 'Carl', last: 'Sagan'},
						{first: 'Denis', last: 'Hopper', salary: 4223.1}
					],
					foo: {
						bar: {
							baz: 123
						}
					},
					basic_list: [
						'abc',
						'123',
						'xyz'
					]
				});
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