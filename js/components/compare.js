lg.Compare = lg.Component.extend({

	options: {
		itemurl: '',
		detailsurl: '',
		productsurl: '',
		transitions: head.csstransitions
	},

	init: function(opts,element) {

		this._super(opts,element);

		this._build();
	},
	_build: function(){
		
		if (this.options.detailsurl.indexOf("?") < 0) {this.options.detailsurl += "?"}

		$('#scroller',this.element).unbind('scroll').bind('scroll',$.proxy(function(e){
			$('.item-info-wrapper, #items-wrapper').scrollLeft($(e.target).scrollLeft());
		},this));

		$('#sim',this.element).unbind('click').bind('click',$.proxy(function(e) {
			this.highlight('sim');
		},this));

		$('#diff',this.element).unbind('click').bind('click',$.proxy(function() {
			this.highlight('diff');
		},this));

		$('#btn-add-product, .change-product').unbind('click').bind('click',$.proxy(function(e){
			e.preventDefault();
			document.getElementById('products-select').selectedIndex = -1; //jquery bug
			this.addProduct(e.target);
		},this));

		$('.compare-modal .close, .compare-modal .cancel').bind('click',function(e) {
			e.preventDefault();
			$('.compare-modal',this.element).removeClass('active');
		});

		$('.remove-product').each($.proxy(function(idx,el){
			$(el).unbind('click').bind('click',$.proxy(function(e){
				e.preventDefault();
				this.removeProduct($(e.target));
			},this));
		},this));

		compareCookie = lg.compare.pageCategory();

		this.itemWidth = $('.item:first',this.element).outerWidth();

		this.setWidths();

		setTimeout(function(){
			$('.item-info-wrapper').css({'width': 720}); //strange ff/safari fix
		},1300);

		$('#items').show();
		$('#loader').hide();

		this.log('Build Complete');
	},
	setWidths: function() {
		numItems = $('.item',this.element).length;
		totalWidth = this.itemWidth * numItems;
		$('.item-info,  #items', this.element).css({'width':totalWidth});
		$('#scroller div', this.element).css({'width': totalWidth - 12});
		$('#num-products').text(numItems);
		this.log('Widths Set');
	},
	loadContent: function(idx,id) {
		$('#items').hide();
		$('#loader').show();
		$.ajax({
			url: this.options.itemurl + '?id=' + id,
			success: $.proxy(function(results) {
				//do stuff
				$results = $(results);
				if (idx !== false) {
					$('.item:eq('+idx+')',this.element).replaceWith($results.find('.item'));
					$('.items-info').each(function(i,el) {
						$('ul.first:eq('+ idx +')',el).replaceWith($results.find('ul.first:eq('+ i +')').clone());//must be cloned to prepend and preserve order
					});
				} else {
					$('#items').prepend($results.find('.item'));
					$('.items-info-content').each(function(i,el) {
						$('.item-info',el).prepend($results.find('ul.first:eq('+i+')').clone());
					});
				}
				$results.empty();
				$('.compare-modal',this.element).removeClass('active');

				setTimeout($.proxy(function(){
					this._build();
					this.recheckDiff();
					$('#items-info-wrapper').data().accordion.toggleItem($('.accordion-item:eq(0) label',this.element));
					$('#items-info-wrapper').data().accordion._build();
				},this),300);
			},this),
			error: function(xhr) {
				//nothing yet
			}
		});
		this.log('loadContent complete');
	},
	loadProduct: function(el) {

		$.ajax({
			type: 'GET',
			url: this.options.detailsurl + "&id=" + $(el).text(),
			dataType: 'json',
			success: $.proxy(function(data) {
				this.json = data;
				
				$.each(data, function(key, val) {
					$('#product-image img','.compare-modal').attr('src',val.image);
					features = "";
					$.each(val.features, function(key, val) {
						features += '<li>'+ val +'</li>';
					});
					$('#key-features ul','.compare-modal').html(features);
					$('#key-features','.compare-modal').show();
					$('#product-details h4','.compare-modal').html(key);
					$('#description','.compare-modal').html(val.description);
					$('#price','.compare-modal').html(val.price);
					$('#btn-go','.compare-modal').unbind('click').bind('click',function(e){
						e.preventDefault();
						location = val.supporturl;
					});
				});
			},this)
		});
	},
	addProduct: function(el) {
		$('.compare-modal-content h2', this.element).hide();
		$el = $(el);
		mode = $el.attr("id") == "btn-add-product" ? 'add' : 'change';
		if ($('.item', this.element).length == 8 && mode == "add") {
			lg.showError('comparelimit');
		} else {
			
			$.ajax({
				type: 'GET',
				url: this.options.productsurl,
				dataType: 'json',
				success: $.proxy(function(data) {
					this.json = data;
					var filters = "";
					$.each(data.filters, function(key, val) {
						filters += '<label><input type="checkbox" value="'+ key +'"><span>'+ val +'</span></label>';
					});
					$('#compare-filter').empty().append(filters);
					
					var models = "";
					$.each(data.models, function(key, val) {
						models += '<option data-facetvalue="'+ val.filter +'">'+ key +'</option>';
					});
					this.clearAll();
					$('#products-select').empty().append(models);
					this.bindActions();
				},this)
			});
			
			$('#compare-modal-content-form', this.element).show();
			$('#hdr-'+mode+'-product').show();
			$('#modal-add-product', this.element).addClass('active');
		}
	},
	clearAll: function() {
		$('#product-image img','.compare-modal').attr('src','/common/images/global/b.gif');
		$('#key-features ul','.compare-modal').empty();
		$('#key-features','.compare-modal').hide();
		$('#product-details h4','.compare-modal').empty();
		$('#description','.compare-modal').empty();
		$('#price','.compare-modal').empty();
		$('#btn-go','.compare-modal').unbind('click');
		
		document.getElementById('products-select').selectedIndex = -1; //jquery bug

	},
	bindActions: function() {
	
		$options = $('#products-select option',this.element);
		$checkboxes = $('#compare-modal-content-form input[type="checkbox"]', this.element);

		$('#products-select',this.element).unbind('click').bind('click',$.proxy(function(e){
			this.loadProduct(e.target);
		},this));

		$checkboxes.unbind('click').bind('click', $.proxy(function(e){
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
			if (!$('#compare-modal-content-form input[type="checkbox"]:checked').length) {
				$options.removeAttr('disabled').removeClass('disabled');
			}
		},this));
		
		$('#btn-add',this.element).unbind('click').bind('click',$.proxy(function(){
			//validate form, set cookie, reload response
			if($('#products-select').val() != null) {
				$('#btn-add',this.element).unbind('click');
				$item = $el.closest('.item');
				productID = $('#products-select').val();
				if (mode == 'add') {
					lg.compare.add(productID,compareCookie);
					this.loadContent(false,$('#products-select').val());
					
				} else  {
					//change item
					lg.compare.remove($item.data('id'),compareCookie);
					lg.compare.add(productID,compareCookie);
					this.loadContent($item.index(),$('#products-select').val());
				}
			};
		},this));
	},
	removeProduct: function(el) {
		$item = el.closest('.item');
		idx2 = $item.index();
		lg.compare.remove($item.data('id'),compareCookie);
		if (this.options.transitions) {
			$item.unbind(transitionEnd).bind(transitionEnd, $.proxy(function(e){
				if (!$(e.target).width()) {
					$(e.target).remove();
					this.setWidths();
				}
			},this));
			$item.addClass('remove');
		} else {
			$item.fadeOut('slow',$.proxy(function(){
				$item.empty().remove();
				this.setWidths();
			},this));
		}

		$('.item-info ul.first').each($.proxy(function(idx,el){
			$el = $(el);
			if ($el.index() == idx2) {
				if (this.options.transitions) {
					$el.unbind(transitionEnd).bind(transitionEnd, function(e){
						if (!$(e.target).width()) $(e.target).remove()
					});
					$el.addClass('remove');
				} else {
					$el.fadeOut('slow',function(){
						$el.remove();
					});
				}
			}
		},this));
		
		setTimeout($.proxy(function(){
			this.recheckDiff();
		},this),1000)
	},
	recheckDiff: function() {
		//recheck diff/sim
		$('ul.first > li', this.element).removeClass('sim','diff');
		if ($('#diff').attr('checked')) {
			this.highlight('diff');
		}
		if ($('#sim').attr('checked')) {
			this.highlight('sim');
		}
		this.log("sim/diff rechecked");
	},
	highlight: function(mode) {

		if (mode == 'diff') {
			if (!$('#diff').attr('checked')) {
				$('ul.first > li', this.element).removeClass('diff');
				return;
			}
		} else {
			if (!$('#sim').attr('checked')) {
				$('ul.first > li', this.element).removeClass('sim');
				return;
			}
		}

		$categories = $('.item-info-wrapper', this.element);
		$categories.each($.proxy(function(idx,el){
			$el = el;
			$contents = $('ul:first', $el);
			$contentsLength = $('ul.first', $el).length;
			$items = $('> li', $contents);
			$itemsLength = $items.length;

			$items.each(function(idx,el) {
				$idx = idx;
				blnSim = true;
				blnDiff = false;
				for (i=0; i < $contentsLength; i++) {
					$content = $('ul.first', $el).eq(i);
					if ($.trim($(el).text()) != $.trim($('> li', $content).eq($idx).text())) {
						blnDiff = true;
						blnSim = false;
					}
				}
				if (mode == 'sim' && blnSim) {
					$('ul.first', $el).each(function(idx,el){
						$('> li', el).eq($idx).addClass('sim');
					});
				}
				if (mode == 'diff' && blnDiff) {
					$('ul.first', $el).each(function(idx,el){
						$('> li', el).eq($idx).addClass('diff');
					});
				}
			});
		},this));
		this.log("highlighted");
	}
});

lg.plugin('compare',lg.Compare, '.compare');

