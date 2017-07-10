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
						path: '/staff/themes/my_first_theme/css/style.css'
					}
				}
			}
		},
		404: {
			type: '404',
			template: 'staff/themes/my_first_theme/templates/404.tpl',
			includes: {
				css: {
					'my_first_theme': {
						path: '/staff/themes/my_first_theme/css/style.css'
					}
				}
			}
		},
		header: {
			type: 'header',
			template: 'staff/themes/my_first_theme/templates/header.tpl'
		},
		footer: {
			type: 'footer',
			template: 'staff/themes/my_first_theme/templates/footer.tpl'
		},
		header__menu: {
			type: 'header',
			template: 'staff/themes/my_first_theme/templates/header--menu.tpl'
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
						copyright: '&#169; 2017, Ben Helmer.',
						legal: 'built with Bistro.js and Prepcook.js'
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