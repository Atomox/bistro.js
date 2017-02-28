var myFirstModule = (function (){

	/**
	   @TODO

	     Ultimately, can we make an interface for this? More like a class with abstract values.
	     However, since classes in JS are a lie, is there another way to do this?

	 */
	var theme = {
		master: {
			type: 'master',
			title: 'My First Theme',
			callback: master_template_callback,
			template: 'staff/themes/my_first_theme/templates/master.tpl',
			includes: {
				css: {
					'my_first_theme': {
						path: 'staff/themes/my_first_theme/css/style.css'
					}
				}
			}
		},
		header: {
			type: 'header',
			template: 'staff/themes/my_first_theme/templates/header.tpl'
		}
	};


	/**
	 * Return data used for the master theme template. 
	 */
	function master_template_callback() {
		return new Promise(
			function(resolve, reject) {
				resolve({
					header: {
						title: 'Hi Dad Soup',
						subtitle: 'A Goofie Movie Retrospective',
						menu: [
							{
								title: 'Link 1',
								path: 'first'
							},
							{
								title: 'Link 2',
								path: 'second'
							},
							{
								title: 'Database',
								path: 'walkin/test/content',
							}
						]
					},
					footer: {
						copyright: '(c) 2017',
						legal: 'some fine print'
					}
				});
			}
		);
	}

	return {
		theme: theme
	};
})();

module.exports = {
	theme: myFirstModule.theme
};