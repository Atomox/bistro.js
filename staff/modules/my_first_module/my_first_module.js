var myFirstModule = (function (){

	/**
	   @TODO

	     Ultimately, can we make an interface for this? More like a class with abstract values.
	     However, since classes in JS are a lie, is there another way to do this?

	 */
	var paths = [
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
		}
	];


	/**
	  @TODO
		Testing out our first function. Hook this up.
	 */
	function general_content_callback() {
		return "Hello World";	
	}

	return {
		paths: paths
	};
})();

module.exports = {
	paths: myFirstModule.paths
};