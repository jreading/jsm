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
		toggleAnimation: function(css, callback, element) {

			$el = !element ? this.element : $(element);

			//$el.off(this.transitionEnd);
			$el.on(this.transitionEnd, function() {
				$el.off(this.transitionEnd);
				if (callback) callback();
			});
			if (typeof css == "string") {
				$el.hasClass(css) ? $el.removeClass(css) : $el.addClass(css);
			} else {
				$el.css(css);
			}
			/// TODO: break out class for jQuery animate
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