/*
 * Grid filter module.
 *
 * May exist de-coupled from the grid, in which case form submissions
 * will post to a new page, asynchronously.
 *
 * options:
 * - string event  : set to "change" to cause the change event on any
 *                   contained inputs to trigger the form's submission.
 * - boolean debug : same as for all the other components.
 *
 * requires:
 * - lg.js
 * - filter.css
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.Filter = lg.Component.extend({
	options: {
		event: false
	},
	/*
	 * Initialize/construct the filter form.
	 */
	init: function(options, element) {

		this._super(options, element);

		// DRY
		this.submit = this.element.find('button[type=submit]');
		this.form = this.element.is('form') ?
						this.element :
						this.element.find('form');
		
		// Debugging.
		this.log('options:', this.options);

		// If there is a grid on this page then submit the filters via XHR
		// and populate the filtered product grid content asynchronously.
		this.gridInstance = $('.grid');
		if (this.gridInstance.length > 0) {
			this.form.submit($.proxy(function(e){
				e.preventDefault();
				this.applyFilter();
				return false;
			}, this));
		} 

		// Submits the form when any of the input type elements get changed.
		// You can see it in action on the Reviews tab.
		if (this.options.event == 'change') {
			this.form.find('input, select, checkbox, radio').bind('change', $.proxy(function(){
				this.applyFilter();
			}, this));
		} else {
			//always submit on sort selection
			this.form.find('.sort-select').bind('change', $.proxy(function(){
				this.applyFilter();
			}, this));
		}
		
		
		this.form.find('#range-min, #range-max').bind('change', $.proxy(function(){
			this.range();
		}, this));
			
		this.clear();
	},
	/* public method apply
	 *
	 * Apply these filters to the specified product grid. */
	applyFilter: function() {
		var uri = this.form.attr('action') + '?' + this.form.serialize()
		this.gridInstance.grid('reload', uri);
		this.log('applying form filters!');
	},
	/* Apply these filters to the specified product grid. */
	range: function() {

		var idxMin = document.getElementById("range-min").selectedIndex; //jquery bug
		var idxMax = document.getElementById("range-max").selectedIndex +1; //jquery bug
		
		$sliders = $('.slider span', this.element);
		
		$sliders.removeClass('fill');
		
		if((idxMax - idxMin) > 0){
			$sliders.each(function(idx, el){
				if (idx >= idxMin && idx < idxMax) {
					$(el).addClass('fill');
				}
			});
		}
		this.log('applying range filters!');
	},
	clear: function(){
		this.form.find('input:not([type="checkbox"]), select:not(#range-max)').each($.proxy(function(idx,el){
			$(el).val("");
		}, this));
		this.form.find('input[type="checkbox"], input[type="radio"]').each($.proxy(function(idx,el){
			$(el).removeAttr("checked").parent().removeClass("red");
		}, this));
		this.log('clearing form filters!');
	}

});

lg.plugin('gridFilter', lg.Filter, '.filter');


