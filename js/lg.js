var pagePath = $('html').attr('id').split('-page')[0];

var transitionEnd = 'transitionend webkitTransitionEnd';

// Global namespace for site-wide functions.
var lg = {
	//global vars from html data attributes
	navCategory: $('html').data('nav-category'),
	locale: '/' + $('html').data('countrycode'),
	compareLoc: $('html').data('compareloc'),
	compareCategory: $('html').data('compare-category'),
		
	// Suite of functions for lazy-loading images that are
	// below the fold or inserted to the page via ajax.

	// Determine if an element is positioned vertically within the viewport
	checkVisible: function(elem) {
		var docViewTop = $(window).scrollTop(),
		    docViewBottom = docViewTop + $(window).height(),
		    elemTop = elem.offset().top,
		    elemBottom = elemTop + elem.height();
		return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
	},
	// add images to the queue to be lazy-loaded.. i think this does not work :(
	addImages: function(container) {
		//console.log('Adding images to be lazy loaded..', container.find(lg.lazySelector).length);
		this.images = this.images.add(container.find(lg.lazySelector));
		this.needsLoad = true;
	},
	// Lazy-load eligible images within the viewport
	loadImages: function() {
		var c = 0;
		this.images.each(function(){
			$img = $(this);
			if (lg.checkVisible($img) && $img.css('visibility') != 'hidden' && $img.is(':visible')) {
				c++;
				$img.load(function() {
					$(this).parent().removeClass('loader');
				});
				$img.attr('src', $img.data('src'));

				lg.images = lg.images.not($img);
			}
		});
		this.needsLoad = false;
	},
	// Quickly set a variable to check a fraction of a second later -
	// on an interval - so loading images doesn't result in choppy scrolling.
	onScroll: function(){
		lg.needsLoad = true;
	},
	// Load new images initially, and if the viewport was scrolled.
	needsLoad: true,
	// Determine if the viewport has been scrolled since we last checked,
	// and if so then try lazy-loading some images.
	checkScroll: function(){
		if (lg.needsLoad){ lg.loadImages(); }
	},
	// CSS selector to match the as-yet-unloaded lazy-load images.
	lazySelector: 'img[src$="b.gif"]',
	// Initialize the page:
	// - set up lazy-loading
	init: function() {

		this.images = $(lg.lazySelector);

		// see why this interval encapsulation is necessary:
		// http://ejohn.org/blog/learning-from-twitter/
		// load visible images on pageload.
		this.interval = setInterval(lg.checkScroll, 500);

		// lazy loader for images runs on a timer if scroll happens
		// load images when they scroll into the viewport.
		$(window).bind('scroll', lg.onScroll);

		// build nav, the timeout is needed for rendering issue in FireFox
		// where box model values are computed prior to applying the font.
		setTimeout(lg.buildNav,100);

		//Load msgs JSON
		$.getJSON(lg.locale + '/js/msg.json', function(data) {
			lg.msgs = data;
			lg.updateCompareButton();
		});
		
		//build footer
		lg.buildFooter();

		lg.attachTriggers();

		lg.placeholderFix();

		$('.back').bind('click',function(e){
			e.preventDefault();
			lg.smoothScroll();
		});
	},
	// handle click for compare buttons
	onCompareClick:function(){

		var cat = lg.compare.pageCategory();
		var cparts = $(this).attr('class').split(/\s+/); // Grab the parts
		var cid = cparts[0] == 'compare' ? cparts[1] : cparts[0]; // Grab the compare id
		if(lg.compare.isin(cid,cat)) { // The id is in the set, the button should be unchecked, and the id removed
			lg.compare.remove(cid,cat);
		} else { // The id is not in the set, the button should be checked, and the id added
			if(lg.compare.count(cat) < 8) {
				lg.compare.add(cid,cat);
			} else {
				lg.showError('comparelimit');
			}
		}
		lg.updateCompareButton();
	},
	// Update the HTML for a compare button to match it's cookie state
	updateCompareButton: function(els) {
		if (!lg.msgs["compare"]) {
			//wait til msgs are loaded
			setTimeout(lg.updateCompareButton,200);
			return;
		}
		var num = lg.compare.count(lg.compare.pageCategory());
		$('.compare-btn span').text(num);
		$('span.btn.button span').text(num);
		$('input.compare, .btn-compare').each(function(idx,el){
			$(el).unbind('click').bind('click',lg.onCompareClick)
			var cb = $(el).siblings('span.btn'); // Grab the compare button
			var cparts = $(el).attr('class').split(/\s+/); // Grab the parts
			var cat = lg.compare.pageCategory();
			var cid = cparts[0]=='compare' ? cparts[1] : cparts[0]; // Grab the compare id
			var num = lg.compare.count(cat);

			if(cid && cid!='') {
				if(lg.compare.isin(cid,cat)) {
					cb.addClass('small white button',true);
					cb.html(lg.msgs["compare"]["label"] + ' (<span>'+ num + '</span>)'); // If there was a product id, use it as a class to select all similar checkboxes
					$(el).attr('checked','checked');
					cb.bind('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						window.location = lg.compareLoc + '?category='+cat;
					});
				} else {
					cb.removeClass('small white button',true);
					cb.html(lg.msgs["compare"]["add"]);
					$(el).removeAttr('checked');
					cb.unbind('click');
				}
			} else {
				if(cb.hasClass('button')){
					cb.html(lg.msgs["compare"]["add"]);
				} else {
					cb.html(lg.msgs["compare"]["label"] + ' (<span>'+ num + '</span>)');
				}
			}
		});
	},
	// storage for the language-specific messages.
	msgs: {},
	// Displays a 480 x 200 modal window with the provided message.
	showError: function(code) {
		// only set the modal if we need it, and only one time per page.
		if (typeof lg.modal === 'undefined') {
			lg.modal = $('#message-modal');
			lg.modalHeader = lg.modal.find('.header'),
			lg.modalBody = lg.modal.find('.body');
			lg.modal.find('.close, .cancel').bind('click',function(e) {
				e.preventDefault();
				lg.modal.removeClass('active');
			});
		}

		// callback to actually display the modal,
		// takes "msg" as input which has "header" and "footer" as keys.
		var popModal = function(msg) {
			lg.modalHeader.text(msg.header);
			lg.modalBody.text(msg.body);
			lg.modal.addClass('active').css({
				top: $(document).scrollTop() + ($(window).height()/2) - 200,
				left: ($('.wrapper').width()/2) - (lg.modal.width()/2)
			});
		};

		// get language-specific messages if they're not set yet.
		// there's no real error-checking that "code" exists so be careful!
		if ( !lg.msgs[code] ){
			$.getJSON(lg.locale + '/js/msg.json', function(data) {
				lg.msgs = data;
				popModal( lg.msgs[code] );
			});
		}
		else {
			popModal( lg.msgs[code] );
		}
	},
	placeholderFix: function() {
		// Polyfill for input field placeholder attribute.
		var i = document.createElement('input');
		$('input[placeholder]').each(function(){
			if(!('placeholder' in i)){
				$(this).val($(this).attr('placeholder'));
				$(this).bind('focus',function(){
					$(this).val() == $(this).attr('placeholder') ? $(this).val('') : null;
				}).bind('blur',function(){
					$(this).val() == '' ? $(this).val($(this).attr('placeholder')) : null;
				});
			} else {
				$(this).bind('keydown',function(){
					$(this).addClass('no-bg');
				}).bind('blur',function(){
					$(this).val() == '' ? $(this).removeClass('no-bg') : null;
				});
			}
		});

		$('.btn-search').bind('click',function(){
			$(this).parent().submit();
		});
	},
	buildNav: function() {
		//nav code
		navWidth = 0;

		setTimeout(function(){
			var list = $('nav ul.primary'),
			    items = list.find('li.primary');
			items.each(function(){
				navWidth += $(this).outerWidth();
			});

			// extra spacing to distribute amongst the header nav items, cause we can't use tables ok!
			var toDistribute = list.parent('nav').width() - navWidth,
			    toEach = Math.floor(toDistribute / (items.length - 1)),
				extra = toDistribute % (items.length - 1);
			// give an even amount in the form of right margin to each colum
			// (except for the last one, which should stay flush with the right gutter),
			// without exceeding the total sum (thus floor is used).
			items.filter(':not(:last)').css('margin-right', toEach + 'px')
			// then distribute the remainder as left margin to the first couple columns,
			// skipping the first column in order to keep it flush with the gutter
			     .filter(':not(:first)')
				 .filter(':nth-child(-n+' + extra + ')').css('margin-left', '1px');

			list.css({'visibility':'visible'});

			$('.nav-dd').each(function(){
				ddWidth = 0;
				navDd   = $(this);
				navLi   = navDd.parent();
				tallest = 0;
				tallest2 = 0;
				$('li.columnC ',this).each(function(){
					$('ul li:first-child',this).css({'border-top':'0px'});
				});
				$('li.columnC ul li',this).each(function(){
					//bretc - setting this as a consistent value because columnC is getting strange values
					//tallest2 = tallest2 < $(this).innerHeight() ? $(this).innerHeight() : tallest2;
					if(tallest2 < 150){tallest2 = 150;};
				});
				$('li.columnC ul li',navDd).each(function(){$(this).css({'height':tallest2});});
				$('li.columnA, li.columnB, li.columnC ',this).each(function(){
					ddWidth += $(this).outerWidth(true);
					tallest = tallest < $(this).innerHeight() ? $(this).innerHeight() : tallest;
				});
				if ($('li.callout',this).length < 1) { tallest += 24;}
				$('li.columnA, li.columnB, li.columnC',navDd).each(function(){$(this).css({'height':tallest});});
				$('li.callout',navDd).each(function(){$(this).css({'height':tallest+24});});

				pgWidth	 = 960;
				navPos   = navLi.position().left;
				navLoc 	 = Math.ceil((navPos/pgWidth)*100);
				navWidth = ddWidth+5;
				liWidth  = navLi.outerWidth(true);

				if (navWidth >= pgWidth) navWidth = pgWidth;
				navDd.width(navWidth); //set dynamic width
				centerWidth = -(navWidth/2) + (liWidth/2);

				navLi.css({'width':navLi.width()});
				$('a.primary',navLi).css({
					'width':navLi.width(),
					'position' : 'absolute',
					'z-index' : 1101,
					'left' : 0
				});

				if (navLoc < 50) { //left aligned item
					navDd.css({'left':'-1px'});
					if (navWidth > (pgWidth - navPos)) { //center or align page left if overflow
						newPos = centerWidth < -navPos ? -navPos : centerWidth ;
						navDd.css({'left': newPos });
					}
				} else { //right aligned item
					navDd.css({'right':'-1px'});
					if (navWidth > (liWidth + navPos)) { //center or align page right if overflow
						newPos = centerWidth < pgWidth-(navPos + liWidth) ? (navPos + liWidth) - 936 : centerWidth;
						navDd.css({'right': newPos });
					}
				}
				navLi.bind('mouseenter',function(){
					navDd = $('.nav-dd',$(this));
					$('img',this).each(function(){
						img = $(this);
						if (img.attr("src") == "/common/images/b.gif") img.attr("src", img.data("src"));
						img.css({'visibility':'visible'});
					});
					navDd.css({'border':'1px solid #ccc'});
					$('a.primary',this).css({'height':28});
					if (!head.csstransitions){navDd.stop().animate({'max-height':'600px'},'slow');}
					lg.loadImages();
				}).bind('mouseleave',function(e){
					navDd.css({'border-top':'0px','border-bottom':'0px'});
					$('a.primary',this).css({'height':26});
					if (!head.csstransitions){navDd.stop().animate({'max-height':'0px'},'fast');}
				});
			});
			$('div.wrapper').bind('click',function(e){
				if (!$(e.target).closest('nav').length) {
					$('.nav-dd').css({'border-top':'0px','border-bottom':'0px'});
					$('a.primary',$('.nav-dd')).css({'height':26});
					if (!head.csstransitions){$('.nav-dd').stop().animate({'max-height':'0px'},'fast');}
				}
			});
		},200);


		//add selected to top nav
		$('header nav li.primary > a[href*="'+lg.navCategory+'"], header .util-links a[href*="'+lg.navCategory+'"]').addClass('active');

		//add selected to left navs
		$('.subnav li a, .subnav h4 a').each(function(){
			linkPageHref = $(this).attr('href');
			linkPagePath = linkPageHref.substr(linkPageHref.lastIndexOf('/') + 1,linkPageHref.length).split('.')[0];
			if (linkPagePath == pagePath) {
				$(this).addClass('selected');
				$parents = $(this).parents('.subnav li');
				if ($parents.children('ul').length) {
					$parents.addClass('selected-parent').find('> a').addClass('selected-parent');
				}
			}
		});

	},
	buildFooter: function() {
		// Language/country select and map in the footer
		var map = $('#map');
		$('#country').bind('change', function(e){
			map.attr('class', $(this).val());
		});
	},
	attachTriggers: function(){
		//attach component methods to links that use data-method attribute
		$('*[data-trigger]').bind('click',function(e){
			$('#'+$(this).data('trigger')).trigger('click');
		});
	},
	/*
	 * LG Compare Cart
	 * lg.compare
	 *
	 * Methods
	 * - pageCategory()		: Returns the current page's category, from the body tag's 'data-compare-category' attribute
	 * - get(category)		: Returns an array of id's currently up for comparison in the specified category
	 * - add(id,category)	: Adds the specified id to the list of values for comparison in the specified category
	 * - remove(id,category): Removes the specified id from the list of values for comparison in the specified category
	 * - empty(category)	: Removes all id's from the specified category
	 * - count(category)	: Returns the number of id's in the specified category
	 *
	 *
	 */
	compare: {
		CARTS:'LG_COMPARE_CART',

		pageCategory:function(){
			return lg.compareCategory;
		},

		get:function(cart){
			var a=this._cObjGet()[cart];
			if(!a) {
				a=[];
			} else {
				var i=a.length;
				while(i--){
					if(a[i]=='')a.splice(i,1);
				}
			}
			return a;
		},

		add:function(id,cart){
			var a=this.get(cart);
			a.push(id);
			var o=this._cObjGet();
			o[cart]=a;
			this._cObjSet(o);
		},

		remove:function(id,cart){
			var o=this._cObjGet();
			var a=this.get(cart);
			var i=a.length;
			while(i--){
				if(a[i]==id)a.splice(i,1);
			}
			o[cart]=a;
			this._cObjSet(o);
		},

		isin:function(id,cart){
			var o=this._cObjGet();
			var a=this.get(cart);
			var i=a.length;
			while(i--)if(a[i]==id)return true;
			return false;
		},

		empty:function(cart){
			var o=this._cObjGet();
			delete o[cart];
			this._cObjSet(o);
		},

		count:function(cart){
			return this.get(cart).length;
		},

		_cObjGet: function(){
			var o={};
			var s=this._cGet(this.CARTS);
			var a;
			if(s)a=s.split(',');
			else a=[];
			for(var i in a){
				var ln=a[i];
				o[ln.split('=')[0]]=ln.split('=')[1].split('|');
			}
			return o;
		},

		_cObjSet: function(o){
			var a=[];
			for(var idx in o){
				var ln=o[idx];
				a.push(idx+'='+ln.join('|'));
			}
			this._cSet(this.CARTS,a.join(','));
		},

		_cSet: function(name,value,days) {
		    if (days) {
		        var date = new Date();
		        date.setTime(date.getTime()+(days*24*60*60*1000));
		        var expires = "; expires="+date.toGMTString();
		    }
		    else var expires = "";
		    document.cookie = name+"="+value+expires+"; path=/";
		},

		_cGet: function(name) {
		    var nameEQ = name + "=";
		    var ca = document.cookie.split(';');
		    for(var i=0;i < ca.length;i++) {
		        var c = ca[i];
		        while (c.charAt(0)==' ') c = c.substring(1,c.length);
		        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		    }
		    return null;
		},

		_cDel: function (name) {
		    this.set(name,"",-1);
		}
	},


	/**
	 * Suite of variables and functions for hiding and showing overlays
	 * Only a single element on the page can be overlaid at one time.
	 */
	// variable to store the overlay image
	overlay: $('<div class="overlay"></div>'),
	// method to show the overlay over the provided element
	overlayShow: function(element) {
		lg.overlay.css({
			height: element.outerHeight(),
			width: element.outerWidth()
		});
		lg.overlay.prependTo(element);
	},
	// method to remove the overlay.
	overlayHide: function() {
		lg.overlay.detach();
	},
	//reinitialize global handlers
	reInit: function(el){
		lg.attachTriggers();
		lg.placeholderFix();
		lg.addImages(el);
		lg.updateCompareButton();
	},
	smoothScroll: function(el) {
		if (!el) el=$('body');
		$("html:not(:animated),body:not(:animated)").animate({ scrollTop: el.offset().top}, 500 );
	},
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

var siteCat = {
	init: function() {
		//handle event-based tracking
		$('.sc:not(form)').each($.proxy(function(idx,el) {
			$el = $(el);
			this.attachLinkEvents($el);
		},this));

		$('form.sc').each($.proxy(function(idx,el) {
			$el = $(el);
			this.attachFormSubmit($el);
		},this));

	},
	attachLinkEvents: function(el) {
		ev = el.data('sc-event') ? el.data('sc-event') : 'click';
		el.bind(ev,function(e) {
			link = el.data('sc-link') ? el.data('sc-link') : e.target;
			ltv = el.data('sc-linktrackvars') ? el.data('sc-linktrackvars') : 'None';
			type = el.data('sc-type') ? el.data('sc-type') : 'o';
			name = el.data('sc-linkname') ? el.data('sc-linkname') : el.text();

			var s=s_gi('lgelectronics');
			s.linkTrackVars=ltv;
			s.linkTrackEvents='event1';
			s.tl(link,type,name);
		});
	},

	attachFormSubmit: function(el) {
		$(el).bind('submit',function(e){
			s.eVar11 = $('#zip',el).val();
			//add other form constants here
		});
	}
};

$(document).ready(function(){
	lg.init();
	siteCat.init();
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
