define(['widget'],function(widget) {

	var mymodule = widget.extend({
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
			
			$(this.element).bind('mouseenter',$.proxy(function(){
				this.toggleAnimation('active');
				this.doThatThing();
			},this)).bind('mouseleave',$.proxy(function(){
				this.toggleAnimation('active');
			},this));

			this.log('My Module build complete.', $(this.element).data());
		},
		doThatThing: function(args) {
			this.publish('doThatThing');
		}
	});

	return mymodule;
});

