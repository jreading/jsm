define(['js/Class'],function(Class){
	/**
	* Module
	*
	* Our module class that extends the base class "Class"
	*/
	var Module = Class.extend({
		options: {},
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
			this.options = $.extend({
				debug: false
			}, this.options, options, this.element.data());
			
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
		subscribe: function(ev, callback, el, args) {
			$el = !el ? $('html') : $(el);
			$el.unbind(ev).bind(ev, function(e){
				callback(args);
			});
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


