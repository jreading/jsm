define(['libs/Module'],function(Module) {

	jsmbp.MyModule = jsmbp.Module.extend({

		options: {
			//options here
		},
	
		/**
		 * Construct the module with the supplied options.
		 *
		 * @param {object literal} opts A list of options to override the default options.
		 * @param {HTMLElement} element The element to couple with the Accordion object.
		 */
		init: function(opts, element) {
			this._super(opts, element);
			this._build();
		},
	
		_build: function(){
			this.log('Build complete.', this.options);
		}
	});
	
	jsmbp.plugin('mymodule', jsmbp.MyModule, 'body');
	return jsmbp.MyModule;
});

