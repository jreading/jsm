define(['rclass'],function(rclass){

	/**
	* Module
	*
	* Our module class that extends the base class "Class"
	*/
	var widget = rclass.extend({
		options: {
			debug: false,
			transitionEnd: 'transitionEnd oTransitionEnd msTransitionEnd transitionend webkitTransitionEnd',
			blnTransition: $('html').hasClass('csstransitions')
		},
		/**
		* init
		*
		* Construct the object with the options and couple it with the element.
		*
		* @param {object literal} options An array of options.
		* @param {HTMLElement} element A DOM element.
		*/
		init: function(options, element){
			this.element = $(element);
			// extend default options with options args, and data attr options
			this.options = $.extend(this.options, options, this.element.data());
			this.log('widget init', this.options, this.element);
		},
		/**
		* log
		*
		* Output to the console,
		* if it exists and debugging is enabled in the sub-class.
		*
		* Accepts any number of arguments, any type.
		*/
		log: function(){
			if (this.options.debug && window.console && window.console.log) {
				console.log.apply(console, arguments);
			}
		}
	});
	return widget;
});