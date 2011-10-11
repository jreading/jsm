/*
 * Modelpicker
 *
 *
 * options:
 * - string 	detailsurl		: url for response file
 *
 *
 * requires:
 * - lg.js
 * - modelpicker
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.Modelpicker = lg.Component.extend({

	options: {
		detailsurl: ''
	},

	init: function(opts,element) {

		this._super(opts,element);

		this._build();
	},
	_build: function(){

		if (this.options.detailsurl.indexOf("?") < 0) {this.options.detailsurl += "?"}
		
		$('.mp-category',this.element).bind('click',$.proxy(function(e){
			e.preventDefault();
			this.loadContent($(e.target).data("productsurl"));
			
		},this));

		this.log('Build Complete');
	},
	loadContent: function(url) {

		$.ajax({
			type: 'GET',
			url: url,
			dataType: 'json',
			success: $.proxy(function(data) {
				this.json = data;
				var filters = "";
				$.each(data.filters, function(key, val) {
					filters += '<label><input type="checkbox" value="'+ key +'"><span>'+ val +'</span></label>';
				});
				$('#model-picker-filter').empty().append(filters);
				
				var models = "";
				$.each(data.models, function(key, val) {
					models += '<option data-facetvalue="'+ val.filter +'">'+ key +'</option>';
				});
				$('#model-picker-products-select').empty().append(models);
				this.clearAll();
				this.bindActions();
			},this)
		});
		this.log('loadContent complete')
	},
	loadProduct: function(el) {
		
		$.ajax({
			type: 'GET',
			url: this.options.detailsurl + "&id=" + $(el).text(),
			dataType: 'json',
			success: $.proxy(function(data) {
				this.json = data;
				
				$.each(data, function(key, val) {
					$('#product-image img','.modelpicker-modal').attr('src',val.image);
					$('#btn-go').unbind('click').bind('click',function(e){
						e.preventDefault();
						location = val.supporturl;
					});
				});
			},this)
		});

	},
	clearAll: function() {
		$('#products-select').empty();
		$('#product-image img','.modelpicker-modal').attr('src','/common/images/global/b.gif');
		$('#btn-go','.compare-modal').unbind('click');
		
		document.getElementById('model-picker-products-select').selectedIndex = -1; //jquery bug
		
	},
	bindActions: function() {

		$options = $('#model-picker-products-select option');
		$checkboxes = $('#modelpicker-modal-content-form input[type="checkbox"]');

		$('#model-picker-products-select').unbind('click').bind('click',$.proxy(function(e) {
			this.loadProduct(e.target);
		},this));

		$checkboxes.bind('click', $.proxy(function(e) {
			this.clearAll();
			$options.attr('disabled','disabled');
			$options.addClass('disabled');
			$checkboxes.each(function(){
				$facet = $(this);
				$options.each(function(idx,el){
					if ($facet.attr('checked')) {
						if ($(el).data('facetvalue').indexOf($facet.val()) > -1) {
							$(el).removeAttr('disabled').removeClass('disabled');
						}
					}
				});
			});
			if (!$('#modelpicker-modal-content-form input[type="checkbox"]:checked').length) {
				$options.removeAttr('disabled').removeClass('disabled');
			}
		},this));
		
		$('.close, .cancel','.modelpicker-modal').bind('click',function(e) {
			e.preventDefault();
			$('.modelpicker-modal',this.element).removeClass('active');
		});
		
		$('.modelpicker-modal').addClass('active').css({
			top: $(document).scrollTop() + ($(window).height()/2) - 200,
			left: 340 - ($('#modelpicker-modal').width()/2)
		});
	}
});

lg.plugin('modelpicker',lg.Modelpicker, '.modelpicker');

