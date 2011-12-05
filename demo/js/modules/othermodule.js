define(['js/Module'],function(Module) {

	jsmbp.OtherModule = jsmbp.Module.extend({

		options: {
			//options here
			actionevent: 'mouseover'
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
	
		_build: function(){
			this.log('Build complete.', this.options);
			$(this.element).bind(this.options.actionevent,$.proxy(function(){
				this.toggleHeight();
			},this));
			this.subscribe('transitionend webkitTransitionEnd',this.showMessage,'.mymodule', [this, 'My Module is finshed transitioning!']);
			this.subscribe('MyModuleBuilt',this.showMessage,'.mymodule', [this, 'My Module is built!']);
			}, 
		showMessage: function(args) {
			$(args[0].element).append('<div id="msg2">'+args[1]+'</div>');
		},
		toggleHeight: function() {
			if (!$(this.element).hasClass('tall')) {
				$(this.element).addClass('tall');
			} else {
				$(this.element).removeClass('tall');
			}
			console.log("My Module finished transitioning now...")
		}
	});
	
	jsmbp.plugin('othermodule', jsmbp.OtherModule, '.othermodule');
	return jsmbp.OtherModule;
});

