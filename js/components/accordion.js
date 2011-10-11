/*
 * Accordion
 *
 *
 * options:
 * - boolean animation          : 
 * - boolean csstransitions 	: whether to use CSS transitions or jQuery timer animations.
 * - int selected				: which item to open on init.
 *
 * requires:
 * - lg.js
 * - accordion.css
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */

/** options -
 *    selected: one-based index of the selected accordion item to open on component build.
 */
lg.Accordion = lg.Component.extend({

	options: {
		transitions: head.csstransitions,
		animation: true,
		selected: 1
	},

	/**
	 * Construct the accordion with the supplied options.
	 *
	 * @param {object literal} opts A list of options to override the default options.
	 * @param {HTMLElement} element The element to couple with the Accordion object.
	 */
	init: function(opts, element) {

		this._super(opts, element);

		this._build();
	},

	/**
	 * Build the accordion by binding appropriate events and setting start state.
	 * This function is separate from the main initialization function in case
	 * an existing accordion needs to be re-built for whatever reason?
	 */
	_build: function(){

		$('.accordion-content > div').each(function(){
			$('> ul:not(".legend")',this).addClass('first');
		});
		this.element.children('.accordion-item').each($.proxy(function(idx,el) {
			$(el).children('label').unbind('click').bind('click',$.proxy(function(e){
				this.toggleItem(e.target)
			},this));
			$('ul.first, ul.legend',el).each(function(){
				$('> li:even',this).addClass('even');
			});
		},this));

		$('.accordion-expand-all').unbind('click').bind('click',$.proxy(function() {
			this.expandAll();
		},this));

		$('#expand, #collapse',this.element).hide();

		$('#expand',this.element).show();

		this.selected = this.options.selected - 1;
	    this.selectedItem = this.element.children('.accordion-item').eq(this.selected);
		
		if (this.options.selected !== false && this.element.is(":visible")) {
			var nestedAccordions = this.element.parentsUntil(null, '.accordion');
			var initDelay = nestedAccordions.length ? nestedAccordions.length * 1000 : 0;
		    
			setTimeout(
				$.proxy(function(){
					this.toggleItem(this.selectedItem);
				}, this),
				initDelay
			);
		} else if(this.options.selected !== false && !this.element.is(":visible")) {
			this.loadInterval = setInterval($.proxy(function(){
				this.log("checking visibility...");
				if (this.element.is(":visible")) {
					this.toggleItem(this.selectedItem);
					clearInterval(this.loadInterval);
				}
			},this),200);
		}

		this.log('Accordion build complete.', this.options);
	},

	/**
	 * Toggle open/closed the accordion-content adjacent to the provided label.
	 *
	 * @param {HTMLLabelElement} el A label tag with adjacent ".accordion-content" and ancestral ".accordion-item".
	 */
	toggleItem: function(el) {
		$item = $(el).closest('.accordion-item');
		if ($item.hasClass('active')) {
			this.closeItem($item);
		} else {
			this.openItem($item);
		}
	},

	/**
	 * Opens the accordion-content adjacent to the provided label.
	 *
	 * @param {HTMLLabelElement} el A label tag with adjacent ".accordion-content" and ancestral ".accordion-item".
	 */
	openItem: function(el) {
		$item = $(el).closest('.accordion-item');
		$content = $item.children('.accordion-content');
		$item.addClass('active');

		this.element.removeClass('animate');
		$content.css('max-height', 'none');
		var newHeight = $content.outerHeight(true);
		$content.css('max-height', '0px');
		this.element.addClass('animate');
		
		var contentHeight = $content.height();

		if ($content.parents('.accordion-content').length && $content.parents('.accordion-content').parent('.accordion-item').hasClass("active")){ //$content is nested
			parentHeight = $content.parents('.accordion-content').outerHeight(true) + newHeight;
			$content.parents('.accordion-content').css({'max-height': parentHeight})
		}
		
		if (this.options.animation === false) {
			$content.css('max-height', 'none');
		}
		else if (this.options.transitions) {
			$content.css('max-height', newHeight);
		}
		else {
			$content.animate({'max-height':newHeight}, 'slow');
		}
	},

	/**
	 * Close the accordion-content adjacent to the provided label.
	 *
	 * @param {HTMLLabelElement} el A label tag with adjacent ".accordion-content".
	 */
	closeItem: function (el) {
		$item = $(el);
		$content = $item.children('.accordion-content');
		var oldHeight = $content.outerHeight(true);
		$item.removeClass('active');
		if (this.options.transitions || this.options.animation === false) {
			$content.css('max-height', '0px');
		} else {
			$content.css('max-height', oldHeight);
			$content.animate({'max-height':'0px'}, 'slow');
		}
	},

	/**
	 * Toggle open or closed all accordion items.
	 */
	expandAll: function() {
		$el = $('.accordion-expand-all',this.element);
		if (!$el.hasClass('active')) {
			$el.addClass('active');
			this.openItem(this.element.find('.accordion-item:not(.active)'));
			$('#collapse',this.element).show();
			$('#expand',this.element).hide();
		} else {
			$el.removeClass('active');
			this.closeItem(this.element.find('.accordion-item.active'));
			$('#collapse',this.element).hide();
			$('#expand',this.element).show();
		}
	},

	/**
	 * Close all accordion items.
	 */
	closeAll: function() {
		$el = $('.accordion-expand-all',this.element);
		$el.removeClass('active');
		this.closeItem(this.element.find('.accordion-item.active'));
		$('#collapse',this.element).hide();
		$('#expand',this.element).show();
	}
});

lg.plugin('accordion', lg.Accordion, '.accordion');

