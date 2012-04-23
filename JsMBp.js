define(['js!libs/jquery.min.js'],function() {
	//add to global namespace
	jsmbp = {

		init: function(){

			//initialize all plugins saved into jsmbp.RegisteredModules
			//jsLint hates this...
			for (var prop in jsmbp.RegisteredModules) {
				$(jsmbp.RegisteredModules[prop][1]).each(function(idx,el) {
					jsmbp.plugin(jsmbp.RegisteredModules[prop][0], jsmbp[prop], el);
				});
			}
		},
		/**
		* jQuery plugin bridge.
		* http://alexsexton.com/?p=51
		* modified by jsmbp
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
	
				if (instance && options === undefined) {
					return instance;
				} else { 
					return retval; 
				}
			};
			$.fn[name].apply($(selector));
		},
		RegisteredModules: {}
	};
	return jsmbp;
});