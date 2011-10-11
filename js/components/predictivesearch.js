/*
 * PredictiveSearch
 *
 *
 * options:
 * - string 	url		: url for response file
 *
 *
 * requires:
 * - lg.js
 * - predictivesearch.css
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.PredictiveSearch = lg.Component.extend({

	options: {
		url: ''
	},

	init: function(opts,element) {

		this._super(opts,element);

		this._build();
	},
	_build: function(){
		this.$form = this.element.closest('form');
		
		this.element.attr('autocomplete','off');
		
		if (this.options.url.indexOf("?") < 0) {this.options.url += "?"}
		
		$(this.$form).css({'position':'relative'});
		
		$(this.element).bind('keydown',$.proxy(function(){
			if ($(this.element).val().length > 1) {
				this.loadResults();
			}
		},this));
		this.results = "";
		
		this.log('Build Complete');
	},
	loadResults: function() {
		$.ajax({
			type: 'GET',
			url: this.options.url + "&id=" + this.element.val(),
			success: $.proxy(function(html) {
				$("#psearch-results"+ this.element.attr('name')).remove();
				this.results = '<div class="psearch-results" id="psearch-results'+ this.element.attr('name') +'">'+ html +'</div>';
				this.$form.append($(this.results));
				$("#psearch-results" + this.element.attr('name')).css({
					'top': this.element.position().top + this.element.height() +6,
					'left': this.element.position().left,
					'width': this.element.outerWidth() - 2
				}).show();
				this.bindActions();
			},this)
		});
		this.log('Load Complete');
	},
	bindActions: function() {
		$('.psearch-results li a').bind('click', $.proxy(function(e){
			e.preventDefault();
			$(this.element).val($(e.target).parent().find('span:first').text());
			$('button[type="submit"]',this.$form).trigger('click');
			
		},this));
		$(document).bind('mouseup',function(e){
			$('.psearch-results').hide();
		});
	}
	
});

lg.plugin('psearch',lg.PredictiveSearch, '.psearch');

