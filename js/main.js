// Global namespace for site-wide functions.
var jsmbp = {
	/**
	 * jQuery plugin bridge.
	 * http://alexsexton.com/?p=51
	 * modified by Big Red Tech <bigred.tech@icrossing.com>
	 *
	 */
	plugin:  function(name, object, selector) {
		$.fn[name] = function(options) {
			var args = Array.prototype.slice.call(arguments,1);
			var instance;
			var retval = this.each(function() {
				instance = $.data(this, name);
				if (instance) {
					if (typeof(options) == 'string') {
						if(instance[options])instance[options].apply(instance,args);
					} else {
						instance.init(options);
					}
				} else {
					instance = $.data(this, name, new object(options, this));
				}
			});

			if (instance && options == undefined) {
				return instance;
			} else { 
				return retval; 
			}
		}
		lg.RegisteredComponents[name] = selector;
		
		$(document).ready(function(){
			$.fn[name].apply($(selector));
		});
	},
	RegisteredComponents: {}
};

$(document).ready(function(){
	lg.init();
});

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/blog/simple-javascript-inheritance/
 * Inspired by base2 and Prototype
 * MIT Licensed.
 */
(function(){
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	Class = function(){};

	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function" &&
			typeof _super[name] == "function" && fnTest.test(prop[name]) ?
			(function(name, fn){
				return function() {
					var tmp = this._super;

					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];

					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(name, prop[name]) :
			prop[name];
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;

		return Class;
	};
})();

/**
 * Component
 *
 * A derived class of the standard Class to be used as the parent class
 * for component widgets, such as Accordions, Tooltips, Carousels, etc..
 */
lg.Component = Class.extend({
	options: {},
	/**
	 * init
	 *
	 * Construct the object with the options and couple it with the element.
	 *
	 * @param {object literal} options An array of options.
	 * @param {HTMLElement} element A DOM element.
	 */
	init: function(options, element) {
		// Couple the JS object to the DOM element.
		this.element = $(element);

		// Extend the default options with the js object literal passed into
		// the constructor, then again with html data attribs from the element.
		this.options = $.extend({
			debug: false
		}, this.options, options, this.element.data());

		this.log('component init', this.options, this.element);
	},

	/**
	 * log
	 *
	 * Output to the console,
	 * if it exists and debugging is enabled in the sub-class.
	 *
	 * Accepts any number of arguments, any type.
	 */
	log: function() {
		if (this.options.debug && window.console && window.console.log) {
			window.console.log(arguments);
		}
	},

	/**
	 * broadcast
	 *
	 * Broadcast method calls to other components on the page.
	 * This can be useful if your carousel wants to close tooltips
	 * when it changes pages, for example.
	 * @usage this.broadcast('tooltipper', 'close');
	 *
	 * @param {String} component The component's name.
	 * @param {String} method    The component's method to call.
	 * @param {jQuery} elements  A set of element to execute the method for
	 *                           optional - defaults to all instances of the component on the page.
	 */
	broadcast: function(component, method, elements) {
		if (lg.RegisteredComponents[component]) {
			var elements = elements || $('body').find(lg.RegisteredComponents[component]);
			elements.not(this.element).each(function(idx,el){
				$(el).data(component)[method]();
			});
		} else {
			this.log('broadcast failed: component plugin does not exist', component, name);
		}
	},
	/**
	 * callback
	 *
	 * Callback is used to activate plugins or call
	 * global lg methods on ajax loaded content or hidden
	 * elements.
	 * @usage this.callback('.wrapper');
	 *
	 * @param {jQuery} elements  A set of elements to execute the method on
	 */
	callback: function(el) {
		lg.reInit(el);
	    for (var prop in lg.RegisteredComponents) {
	    	$(el).find(lg.RegisteredComponents[prop]).each(function(idx,el) {
	    		$.fn[prop].apply($(el));
	    	});
	    }
		this.log('callback', el);
	}
});

// Ensure that no stray console.log calls break functionality by defining an
// empty console object and log function in browsers where they do not exist.
if (typeof console == "undefined" || typeof console.log == "undefined") {
	var console = { log: function() {} };
	window.console = { log: function() {} };
}
