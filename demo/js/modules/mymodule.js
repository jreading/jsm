define(['js/Module'],function(Module) {

	jsmbp.MyModule = jsmbp.Module.extend({

		options: {
			//options here
		},
	
		/**
		 * Construct the module with the supplied options.
		 *
		 * @param {object literal} opts A list of options to override the default options.
		 * @param {HTMLElement} element The element to couple with the module instance.
		 */
		init: function(opts, element) {
			this._super(opts, element);
			this._build();
		},
	
		_build: function() {
			this.publish('MyModuleBuilt',this.element);
			this.subscribe('click',this.doThatThing,'.othermodule', $(this.element));
			this.subscribe('activetransitioncomplete',this.doThatOtherThing,'.othermodule');
			
			this.log('Build complete.', this.options);
		},
		doThatThing: function(args) {
			console.log("yeah, that thing happend",args)
		},
		doThatOtherThing: function(args) {
			console.log("yeah, that other thing happend",args)
		}
	});
	
	jsmbp.plugin('mymodule', jsmbp.MyModule, '.mymodule');
	return jsmbp.MyModule;
});

