define(['js/Module'],function(Module) {

	var MyModule = Module.extend({
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
			
			$(this.element).bind('mouseenter',function(){
				$(this).addClass('active');
			}).bind('mouseleave',function(){
				$(this).removeClass('active');
			});
			
			this.subscribe('click',this.doThatThing,'.othermodule', [this, 'Other Module was clicked!']);
			this.subscribe('transitionend webkitTransitionEnd',this.doThatOtherThing,'.othermodule',[this, 'Other Module is finshed transitioning!']);
			
			this.log('My Module build complete.', $(this.element).data());
		},
		doThatThing: function(args) {
			$(args[0].element).append('<div id="msg1">'+args[1]+'</div>');
		},
		doThatOtherThing: function(args) {
			$(args[0].element).append('<div id="msg1">'+args[1]+'</div>');
		}
	});
	
	JsMBP.plugin('mymodule', MyModule, '.mymodule');

	return MyModule;
});

