define(['js/Class'],function(Class){
	/**
	* Module
	*
	* Our module class that extends the base class "Class"
	*/
	var Module = Class.extend({
		options: {
			debug: false
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
			this.log('component init', this.options, this.element);
		},
		/**
		* publish
		*
		* Used to publish custom events.
		*/
		publish: function(ev) {
			$(this.element).trigger(ev);
		},
		/**
		* subscribe
		*
		* Used to subscribe to events from other modules.
		*/
		subscribe: function(ev, callback, element, args) {
			$el = !element ? $('html') : $(element);
			$el.unbind(ev).bind(ev, function(e){
				callback(args);
			});
		},
		/**
		* AddAnimation
		*
		* Used to add animations css or jQuery fallback animation.
		*/
		addAnimation: function(css, callback, el, args) {
			this.log(typeof css == "string");

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
				window.console.log(arguments);
			}
		}
	});
	return Module;
});