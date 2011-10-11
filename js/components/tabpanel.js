/*
 * TabPanel
 *
 * The TabPanel component is used for rendering header tabs and content panels,
 * which may exist in the markup or may be loaded upon request via XHR.
 *
 * options:
 * - boolean csstransitions : Whether to use CSS transitions or jQuery timer animations.
 * - string transition      : Specify the transition used on tab changes.
 *                            May be "slide", "fade", "none", defaults to "slide"
 *                            todo: think "fade" does not work or at least is untested..
 * - boolean debug          : whether to output verbose debug logging to the console.
 *
 * requires:
 * - lg.js
 * - tabpanel.css
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.TabPanel = lg.Component.extend({
	options: {
		csstransitions: head.csstransitions,
		transition: 'slide'
	},

	/**
	 * init: constructs and initializes the object
	 */
	init: function(options, element) {
		this._super(options, element);

		if (this.options.csstransitions) {
			this.element.addClass(this.options.transition);
		}

		this.tabContainer   = this.element.find('.tablist');
		this.tabs           = this.element.find('.tab');
		this.panelContainer = this.element.find('.panels');
		this.panels         = this.element.find('.panel');

		this.currentTab   = this.tabs.filter('.tab.active');
		this.currentPanel = this.panels.filter('.panel:eq('+this.currentTab.index()+')');

		var newLeft = '-' + (this.currentPanel.offset().left - this.currentPanel.parent().offset().left) + 'px';
		this.currentPanel.parent().css({'left': newLeft});
		if (this.options.transition != 'none') {
			this.panelContainer.css({'height':this.currentPanel.height()});
		}

		// Clicks on the tabs will switch panels.
		this.tabContainer.delegate('a', 'click', $.proxy(function(e){
			e.preventDefault();
			var which = $(e.target).attr('id').replace('_tab', '');
			this.change(which);
		}, this));

		// Allow hash value to override the active tab in markup.
		// todo: if we ever need to use hash for anything besides tabpanels, you'll probably want to namespace this..
		if (location.hash.length > 0) {
			var desire = $(location.hash + '_tab');
			if (desire.length) {
				this.tabs.removeClass('active');
				desire.addClass('active');
			}
		}

		// Finally, update the page to that which is initially set as active.
		var activeTab = this.tabs.filter('.active');
		if (activeTab.length > 0) {
			this.change(activeTab.attr('id').replace('_tab', ''));
		}

		this.log(this.options, this.tabContainer, this.tabs, this.panelContainer, this.panels);
	},

	/**
	 * Change to the specified tab, "which" will be something like "reviews".
	 * Elements with id "{which}_panel" and "{which}_tab" should exist.
	 *
	 * @param {String} which Indicates which panel to switch to.
	 */
	change: function(which) {
		var newPanel = $('#' + which + '_panel'),
			newTab   = $('#' + which + '_tab'),
			oldPanel = this.currentPanel;

		if (this.options.transition == 'none') {
			this.panels.not(this.currentPanel).hide();
		}
		if (oldPanel.is(newPanel)){ return /* nothing to do */ }

		// Close any opened tooltips when we switch panels.
		this.broadcast('tooltipper', 'close');

		this.log('switching to: ' + which + ', ' +
		         'from: ' + this.currentTab.attr('id').replace('_tab', ''));

		// A lambda to transition to the content for the selected tab.
		// Will either be called immediately if the panel content exists,
		// or in the callback from the XHR which gets the new content.
		var transitionCallback = $.proxy(function() {
			this.panelContainer.addClass('animate');

			this.currentTab.removeClass('active');

			newTab.addClass('active');

			// updated the selected panel
			switch (this.options.transition) {
				case 'none':
					this.panels.hide();
					this.panels.css({'height' : 'auto', 'min-height' : '0px'});
					this.panelContainer.css({'height':'auto', 'min-height':'0px'});
					newPanel.show();
					break;
				case 'fade':
					this.currentPanel.fadeOut(70, function(){
						newPanel.fadeIn(240);
						newPanel.css({'height' : 'auto', 'min-height' : '0px'});
					});
					this.panels.css({'height' : 'auto', 'min-height' : '0px'});
					this.panelContainer.css({'height':'auto', 'min-height':'0px'});
					break;
				default: // "slide"
					var newLeft = '-' + (newPanel.offset().left -
							this.panelContainer.offset().left) + 'px';

					this.panels.css({'height':'auto', 'min-height':'0px'});
					this.panelContainer.css({'height':'auto', 'min-height':'0px'});

					var newHeight = newPanel.height();

					// "Slide" to the new active panel.
					// The other panels  are constrained in height so they do
					// not contribute to the height of the panel container.
					// The new panel becomes "auto" so it can shrink and
					// grow fluidly as the client height changes.

					this.panels.css('height', newHeight);


					// Pare down the DOM after each transition by emptying all
					// the sibling panels that can re-load themselves by XHR.
					var tidyUp = function() {}
					if (newPanel.data('url')) {
						tidyUp = function() {
							newPanel.siblings('.panel').each(function(){
								if ($(this).data('url')) {
									$(this).children().remove();
								}
							});
						}
					}

					if (this.options.csstransitions) {
						this.panelContainer.bind(transitionEnd, $.proxy(function(e) {
							if (e.originalEvent.propertyName == "min-height") {
								newPanel.css('height', 'auto');
								this.panelContainer.css({'height' : 'auto'});
								this.panelContainer.unbind(transitionEnd);
								tidyUp();
							}
						}, this));
						this.panelContainer.css({'left': newLeft, 'height' : newHeight, 'min-height' : newHeight});
					}
					else {
						this.panelContainer.animate({ left:newLeft }, $.proxy(function() {
							newPanel.animate({ height:newHeight }, $.proxy(function(){
								newPanel.css('height', 'auto');
								this.panelContainer.css({'height' : 'auto'});
								tidyUp();
							},this));
						},this));
						this.panelContainer.css({'left': newLeft, 'height' : newHeight, 'min-height' : newHeight});
						this.log('new height:', newHeight, newPanel);
					}
					break;
			}

			// Update the object pointers.
			this.currentPanel = newPanel;
			this.currentTab = newTab;
		}, this);

		// Check if the new panel needs to be pulled in via XHR.

		if (newPanel.data('url')) {
			// show the overlay..
			lg.overlayShow(this.panelContainer);

			$.ajax({
				type: 'get',
				url: newPanel.data('url'),
				success: $.proxy(function(data) {
					// hack for local machines to display the overlay
					// when the data loads so fast it's not observable.
					// todo:  remove this setTimeout on live
					setTimeout($.proxy(function(){
						// Remove the overlay.
						lg.overlayHide()

						// Gently slip the new data in.
						newPanel.html(data);

						// Initialize all the plugin hooks in the new content.
						this.callback(newPanel);

						// Animate over to the new page.
						transitionCallback();

						this.log('loaded new panel via XHR', newPanel.data('url'));
					// todo: remove this also, when you do the todo above.
					}, this), 300);
				}, this),
				error: function() {
					lg.showError('ajaxerror');
				}
			});
		}
		else {
			transitionCallback();
		}
	}
});

lg.plugin('tabPanel', lg.TabPanel, '.tabpanel');

