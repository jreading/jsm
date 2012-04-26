define(['js/Module'],function(Module) {

	var OtherModule = Module.extend({
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
			$(this.element).unbind(this.options.actionevent).bind(this.options.actionevent,$.proxy(function(){
				this.toggleHeight();
			},this));
			this.subscribe('transitionend webkitTransitionEnd',this.showMessage,'.othermodule', [this, 'My Other Module is finshed transitioning!']);
			this.subscribe('doThatThing',this.showMessage,'.mymodule', [this, 'My Module that thing!']);
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
		}
	});
	/**
	* TODO: Need a way to not call this if it's being extended from another Module
	*/
	JsMBP.plugin('othermodule', OtherModule, '.othermodule');

	return OtherModule;
});

