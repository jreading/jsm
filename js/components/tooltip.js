/*
 * Hotspots/Tooltips
 *
 * Hotspots correspond to tooltips via their "tooltip" data point.
 * Performing event on a hotspot controls the behavior of associated tooltips.
 *
 * options:
 * - string tooltip      : Selector for the tooltip overlay, eg "#more_info".
 *                         default - the next sibling with class ".tooltip".
 * - boolean singleview  : When singleview is turned on, opening any tooltip
 *                         will close all other currently open tooltips.
 *                         if singleview is disabled, each tooltip will be
 *                         assigned an incrementing z-index to ensure that the
 *                         most recently opened tooltip always stacks on top of
 *                         any neighboring tooltips it may overlap with.
 *                         default - "true"
 * - string event        : Event names to bind the tooltip toggling to,
 *                         e.g. - "click", "mouseenter mouseleave", etc..
 *                         default - "click"
 * - bool csstransitions : Whether to use CSS transitions.
 *                         default - "true"
 * - string transition   : Method of transition to use, currently support:
 *                         "fade" only, with plans to add "slide" and maybe
 *                         others if design calls for it.
 *                         default - "fade"
 * - float duration      : Length of jquery animations in seconds.
 *                         To mess with CSS transition speed, do it in CSS.
 *                         default - 0.4
 * - string position     : If set, the module will attempt to automatically
 *                         position the tooltip when it opens based on the
 *                         location of the originating event's target.
 *                         Currently accepts:
 *                         - "true" : detach the content and re-attach it to the
 *                                    wrapper, but do no positioning.
 *                         - "top"  : pin it to the top of the target.
 *                         - "bottom" : pin it to the bottom of the target.
 *                         - "bottom-left" : pin to the bottom-left of target.
 *                         - "false": do not perform any automatic positioning.
 *                         This should be avoided if possible, it is more
 *                         performant to use CSS if you can get away with it.
 *                         todo: maybe add more presets such as "right"
 *                               "left", "top-left", etc... pending designs.
 *                         default - "top"
 * - string offset       : A selector for a nearby ancestor to offset the
 *                         tooltip from, rather than the hotspot. The code will
 *                         detach the tooltip and append it to the main content
 *                         wrapper for the site, and then offset it from there to
 *                         align (according to the "position" option) with the
 *                         element matching the selector.
 *                         This option requires "position" be set automatically.
 *                         default - "false"
 * - string url          : Retrieve the tooltip's contents from a remote URL
 *                         when the tooltip is first opened.
 *                         default - "false"
 *
 * requires:
 * - lg.js
 * - tooltip.css
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.Tooltip = lg.Component.extend({
	options: {
		tooltip: false,
		singleview: true,
		event: 'click',
		csstransitions: head.csstransitions,
		transition: 'fade',
		duration: .4,
		position: 'top',
		offset: false,
		url: false
	},
	init: function(options, element) {
		this._super(options, element);

		// The element we plugged-in from is the hotspot.
		this.hotspot = this.element;

		// Couple this hotspot to its tooltip.
		this.tip = this.options.tooltip ?
			$(this.options.tooltip) :
			this.hotspot.next('.tooltip');

		// Store a handle to the tooltip element in the hotspot element.
		//if(this.tip) this.tip.data('tooltip',this);

		var style = { display:'block' };
		// Prepare the tooltip for display by replacing invisibility
		// from the stylesheet with the particular type of hiding required,
		// depending on the "csstransitions" and "transition" options.
		this.tip.addClass(this.options.transition);

		if (!this.options.csstransitions) {
			switch (this.options.transition) {
				case 'slide':
					style.height = 0;
					break;
				default: // fade
					style.opacity = 0;
			}
		}
		this.tip.css(style).hide();

		this.hotspot.bind(this.options.event, $.proxy(this.toggle, this));
		
		// Prevent clicks from doing anything, unless click is a handled event.
		
		if (this.options.event.indexOf('click') == -1 && $(this.hotspot).get(0).tagName.toLowerCase() == "a") {
			this.hotspot.click(function(e){ e.preventDefault() });
		}
		// If hovering away from the element ought to close the tooltip,
		// then bind to the tooltip itself as well as to the hotspot.
		if (this.options.event.indexOf('mouseleave') >= 0) {
			this.tip.bind(this.options.event, $.proxy(this.toggle, this));
		}

		this.tip.find('.close').bind('click', $.proxy(this.close, this));

		// If auto-positioning is enabled, change the tooltip's ancestry
		// by detaching it and appending to the main wrapper column of the site.
		// Store the current offset as the target for positioning.
		if (this.options.position) {
			this.anchor = $('body > div.wrapper').eq(0);
			// In general we want to anchor our tooltips to the main content wrapper,
			// but some pages such as iframes do not have this element.
			if (this.anchor.length <= 0) {
				this.anchor = $('body > *').filter(':first');
			}
			this.target = this.options.offset ?
				this.hotspot.closest(this.options.offset) :
				this.hotspot;
			this.tip.detach().appendTo(this.anchor);
		}

		// Modal tooltips will be positioned relative to the screen.
		if (this.tip.hasClass('modal')) {
			this.tip.detach().appendTo($('body'));
			this.tip.height($(document).height());
		}

		this.log('tooltip init', this.options, this.hotspot, this.tip);
	},
	// Attempt to automatically position the element.
	position: function(position) {
		// Temporarily show because we need to know the dimensions.
		this.tip.show();
		var style = {};
		switch (position) {
			case 'bottom-left':
				style = {
					top:  ( this.target.offset().top +
					        this.target.height() ) + 'px',
					left: ( this.target.offset().left -
					        this.anchor.offset().left -
							this.tip.width() ) + 'px'
				}
				break;
			case 'bottom':
				style = {
					top:  ( this.target.offset().top + this.target.height() ) + 'px',
					left: ( this.target.offset().left -
					        this.anchor.offset().left +
							Math.round(this.target.outerWidth(true) / 2) -
							Math.round(this.tip.width() / 2) ) + 'px'
				}
				break;
			case 'top':
				style = {
					top:  ( this.target.offset().top - this.anchor.offset().top -
							this.tip.outerHeight() ) + 'px',
					left: ( this.target.offset().left -
					        this.anchor.offset().left +
							Math.round(this.target.outerWidth(true) / 2) -
							Math.round(this.tip.width() / 2) ) + 'px'
				}
				break;
			default:
				this.log('Invalid position provided: ' + position);

		}
		// Quickly hide again, no browser will display this because the toggle
		// executes essentially concurrently and no redraw is registered.
		this.tip.hide();

		this.log('autoposition ' + position, this.target, style);
		this.tip.css(style);
	},
	// boolean - Determine if the tooltip is closed.
	isClosed: function() {
		return ! this.isOpen();
	},
	// boolean - Determine if the tooltip is open.
	isOpen: function() {
		return this.tip.hasClass('open');
	},
	// Toggle the tooltip between its open and closed states.
	toggle: function(e) {
		if (typeof e != 'undefined'){ e.preventDefault(); e.stopPropagation() }

		// Bind based on the event type.  It's necesary to strictly bind the
		// open/close method to enter/leave events because otherwise the wiring
		// will get crossed eventually with an effluvium of mouse events.
		if (/(mouseenter|mouseleave|mouseover|mouseout)/.test(this.options.event)) {
			if (e.type == 'mouseenter' || e.type == 'mouseover') {
				// cancel the timeout if we mouse back over before it fires.
				if (!this.options.csstransitions) {
					clearTimeout(this.timeout);
				}	
				this.open();
			}
			else {
				if (!this.options.csstransitions) {
					// delay hover-based close events by 400ms.
					this.timeout = setTimeout($.proxy(function(){
						this.close();
					}, this), 400);
				} else {
					this.close();
				}
			}
		}
		// Otherwise, toggle based on the current state of the tooltip..
		else {
			if (this.isClosed()) {
				this.open();
			}
			else {
				this.close();
			}
		}
	},
	// Open the associated tooltip.
	open: function(e) {
		
		if (typeof e != 'undefined'){ e.preventDefault(); e.stopPropagation(); }

		if (this.tip.hasClass('modal')) {
			this.payload = this.tip.find('.payload'),
		    offset = Math.floor($(window).scrollTop() + ($(window).height()/2) - (this.payload.height()/2)),
		    offset = offset < 0 ? 0 : offset;
			this.payload.css('margin-top', offset);
		}

		// Request the tooltip content asynchronously from the specified URL.
		if (this.options.url) {
			$.ajax({
				type: 'get',
				url: this.options.url,
				success: $.proxy(function(data) {
					if (this.tip.hasClass('modal')) {
						if ($('html').hasClass('ie') && data.indexOf('iframe')) {
							window.open(data.split('src="')[1].split("\"")[0], 'win');
							this.close();
						} else {
							this.payload.append(data);
						}
					} else {
						this.tip.html(data);
					}
				}, this),
				error: function(xhr) {
					// throw up our hands!  todo: maybe something more helpful..
				}
			});
			// Clear the flag so we only do this one time.
			this.options.url = false;
		}

		// Perform automatic positioning.
		if (this.options.position) {
			this.position(this.options.position);
		}

		// If we're in "singleview", then close
		// any open tooltips as we open this one.
		if (this.options.singleview) {
			this.broadcast('tooltipper', 'close');
		}
		// Otherwise, bump the z-index to ensure the one we clicked is on top.
		else {
			this.tip.css('z-index', ++lg.Tooltip.z);
		}
		// Add images to be lazy-loaded.
		lg.addImages(this.tip);

		// Now open it up, baby!
		this.tip.show();
		if (this.options.csstransitions) {
			this.tip.addClass('open');
			this.log('opening via css ' + this.options.transition);
		}
		else {
			this.tip.addClass('open');
			switch (this.options.transition) {
				case 'slide':
					//todo: fix, probably broken
					this.log('opening via jquery slide', this.options.duration*1000);
					this.tip.animate({ height:'auto' }, this.options.duration*1000);
					break;
				default: // fade
					this.log('opening via jquery fade');
					this.tip.animate({ opacity:1 }, this.options.duration*1000);
			}
		}
	},
	// Close this tooltip.
	close: function(e) {
		if (typeof e != 'undefined'){ e.preventDefault(); e.stopPropagation() }

		if (this.isClosed()){ return }
		// if (mouse is currently over the hotspot or the tooltip){ return }

		//reset any forms
		this.broadcast('aform', 'resetForm', $('.aform', this.tip));
		
		// Close it.
		if (this.options.csstransitions) {
			this.tip.bind(transitionEnd, $.proxy(function(){
				if (this.isClosed()) {
					this.tip.hide();
				}
				this.tip.unbind(transitionEnd);
			}, this));
			this.tip.removeClass('open');
		}
		else {
			var cback = $.proxy(function(){ this.tip.removeClass('open'); }, this);
			this.log('closing via jquery ' + this.options.transition, this);
			switch (this.options.transition) {
				case 'slide':
					this.tip.animate({ height:0 }, this.options.duration*1000, cback);
					break;
				default: // fade
					this.tip.animate({ opacity:0 }, this.options.duration*1000, cback);
			}
		}
	}
});

// Initialize the z-index for all tooltips from the stylesheet.
lg.Tooltip.z = $('.tooltip').filter(':first').css('z-index');

lg.plugin('tooltipper', lg.Tooltip, '.hotspot');