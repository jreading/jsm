/*
 * The Grid.
 *
 * Encapsulates functionality for populating and navigating the product grid
 * or any other paginated section with dynamicaly loaded content.
 * Implemented in markup like so:
 *
 *	<div class="grid" data-uri="page-1.html">
 *		<div class="shim">
 *			<ul class="content"></ul>
 *		</div>
 *		<div class="page-controls">
 *			<span class="pager"></span>
 *		</div>
 *	</div>
 *
 * The resource pointed to by the "data-uri" attribute should resemble:
 *
 *	<div class="product-grid">
 *      Has anyone really been far as decided to use even go want to do look more like?
 *  </div>
 *
 *	<div class="pager">
 *		Results <span class="start">x</span> to <span class="stop">y</span> of <span class="total">z</span>:
 *		<a href="#" data-uri="page-1.html" class="active">1</a>
 *		<a href="#" data-uri="page-2.html">2</a>
 *		<a href="#" data-uri="page-3.html">3</a>
 *		...
 *		<a href="#" data-uri="page-n.html">n</a>
 *	</div>
 *
 * The content in the "product-grid" element is added as a new "page"
 * to the list and the pager info drops in  and replaces the previous contents
 * of the "pager" element.  Multiple "page-controls" elements may exist on your page,
 * the paging info will be injected into the "pager" element in each of them.
 *
 * It is the duty of the CMS to keep the links, counts and ranges consistent.
 * Each link in the pager must point to a valid resource that has the same format as above.
 *
 * The only major caveat is that the page numbers in the pager MUST appear in
 * the order that their pages appear, i.e. the link for page 1 must be the
 * first <a> tag in the pager, page 2 must be the second <a> tag, etc..
 * Arbitrary other links may be added afterwards, but the index of the <a> tag
 * in the list of all <a> tags in the pager is what determines the order.
 *
 * todo: "product-grid" isn't really apt any longer, suggest using "grid-pager" and "grid-content".
 *
 * options:
 * - string uri             : required if content does not exist in markup on pageload,
 *                            a path to the initial page to load.
 * - boolean csstransitions : whether to use CSS transitions or jQuery timer animations.
 *
 * requires:
 * - lg.js
 * - grid.css
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.Grid = lg.Component.extend({
	options: {
		uri: false,
		csstransitions: head.csstransitions
	},
	/*  public method init
	 *
	 * Call the base constructor and then run the custom construction for the object.  */
	init: function(options, element) {
		this._super(options, element);

		this.hasHistory = !!(window.history && history.pushState);

		this.form         = this.element.find('form');
		this.pageList     = this.element.find('.content-pages');
		this.shim         = this.element.find('.shim');
		this.pageControls = this.element.find('.page-controls');
		this.comparison   = $('#compared-items');
		this.pageField    = $('#page_number');
		this.limitField   = $('#page_limit');
		this.loading 	  = false;
		this.currentPage  = 0;
		this.current      = 0;
		
		// Add CSS transitions conditionally based on the options.
		if (this.options.csstransitions) {
			this.element.addClass('slide');
		}

		// Handler for individual page links in the pager.
		$('.pages a', this.pageControls).live('click', $.proxy(function(e){
			e.preventDefault();
			this.viewPage($(e.target).index());
		}, this));

		// At A Glance Button Functions
		$('a.img-link', this.element).live('mouseenter', $.proxy(function(e) {
			$btn = $(e.target).closest('article').find('button.glance-btn');
			if(this.options.csstransitions) {
				$btn.css({opacity : 1});
			} else{
				$btn.fadeIn(100);
			}
		},this)).live('mouseleave', $.proxy(function(e) {
			$btn = $(e.target).closest('article').find('button.glance-btn');
			if(this.options.csstransitions) {
				$btn.css({opacity : 0});
			} else{
				$btn.fadeOut(100);
			}
		},this));
		
		$('> li',this.pageList).addClass('grid-page');
		
		// Autoload the initial page.
		this.viewPage(0, true);

	},
	handleCompoundProducts: function() {
		// compound product stuff..
		this.destination.find('.product-class-list ul li').each($.proxy(function(idx,el){
			$(el).bind('click',$.proxy(function(e){
				this.changeCompoundProduct(e);
			},this));
		},this));
	},
	handlePageControls: function(el) {
		this.pageControls.find('.pager > *').find('a').removeClass('active');
		this.pageControls.find('.pager').html(el);
	},
	/* public method viewPage
	 *
	 * View the specified page, potentially loading it via AJAX.
	 *
	 * int which - index of the page to change to, zero-indexed. */
	viewPage: function(which, initialLoad) {
		if (this.loading) return;
		this.loading = true;
		this.log('viewing', which);

		var link = this.element.find('.pages a').eq(which);
		
		// preloaded content
		if (link.hasClass('active')){
			this.pageList.find('li > .pager').remove();
			this.currentPage = which;
			this.current = which;
			this.loading = false;
			return false;
		}
		
		// Close any opened tooltips.
		this.broadcast('tooltipper', 'close');

		var uri   = link && link.length ? link.attr('data-uri') : this.options.uri;
		var which = link && link.length > 0 ? link.index() : 0;

		// Display the "loading" overlay on top of the grid shim.
		lg.overlayShow(this.shim);

		this.log('loading', which, uri);
		var success = $.proxy(function(response){
			
			response = $(response);
			
			if (which <= this.currentPage) {
				$(this.pageList).prepend('<li class="grid-page"></li>');
				this.destination = $('li.grid-page:eq(0)',this.pageList);
				var newLeft = '0px';
				this.current = 0;
			} else if (which > this.currentPage) {
				$(this.pageList).append('<li class="grid-page"></li>');
				this.destination = $('li.grid-page:eq(1)',this.pageList);
				var newLeft = '-' + $(this.destination).width() + 'px';
				this.current = 1;
			}
			
			this.previous = this.current == "1" ? "0" : "1";
			
			$('li.grid-page',this.pageList).css({'height':$('li.grid-page:eq('+ this.previous +')').height()});
			
			this.destination.html(response.filter('.product-grid').html());
			
			this.handleCompoundProducts();

			this.handlePageControls(response.filter('.pager').html());

			// Remove the overlay.
			lg.overlayHide();
			
			if (this.current == '0' && !initialLoad) {
				this.pageList.css({'left' : '-' + this.destination.outerWidth() + 'px'});
			}
			
			var newHeight = this.destination.outerHeight();
			var initDelay = this.pageList.find('.accordion').length ? 500 : 20;
			
			
			if (!initialLoad) {
				if (this.options.csstransitions) {
					this.pageList.addClass('animate');
					
					this.pageList.bind(transitionEnd, $.proxy(function(e) {
						if (e.originalEvent.propertyName == "left") {
							this.pageList.removeClass('animate');
							$('li.grid-page:eq('+this.previous+')',this.pageList).empty().remove();
							$('li.grid-page',this.pageList).css({'height':'auto'});
							this.pageList.css({'left' : '0px'});
							this.pageList.unbind(transitionEnd).bind(transitionEnd, function() {});
						}
					}, this));
					setTimeout($.proxy(function(){
						this.pageList.css({'left' : newLeft});
					},this),initDelay);
				} else {
					setTimeout($.proxy(function(){
						this.pageList.animate({'left' : newLeft}, $.proxy(function() {
							$('li.grid-page:eq('+this.previous+')',this.pageList).empty().remove();
							$('li.grid-page',this.pageList).css({'height':'auto'});
							this.pageList.css({'left' : '0px'});
						},this));
					},this),initDelay);
				}
			} else {
				$('li.grid-page',this.pageList).css({'height':'auto'});
			}

			this.currentPage = which;
			this.loading = false;
			// Plug-in any uninitialized components on the new page.
			this.callback(this.destination);
		}, this),

		error = function() {
			lg.showError('ajaxerror');
			lg.overlayHide();
		};

		this.request = $.ajax({
			url: uri,
			type: 'get',
			success: success,
			error: error
		});
	},	
	// Load pages from a new URL.
	reload: function(uri) {
		if (this.loading) return;
		this.loading = true;
		
		this.options.uri = uri;
		
		lg.overlayShow(this.shim);
		
		this.request = $.ajax({
			url: uri,
			type: 'get',
			success: $.proxy(function(response){
				response = $(response);
				$('li.grid-page:eq('+ this.current +')',this.pageList).html(response.filter('.product-grid').html());
				this.handleCompoundProducts();
				this.handlePageControls(response.filter('.pager').html());
				this.callback($('li.grid-page:eq('+ this.current +')',this.pageList));
				lg.overlayHide(this.shim);
				this.currentPage = 0;
				this.loading = false;
			},this),
			error: function() {
				lg.showError('ajaxerror');
				lg.overlayHide();
			}
		});

		this.log('reloading', uri);
	},

	// A method to toggle between versions for compound products,
	// which are products that have several distinct versions,
	// e.g. a TV with several sizes or feature sets.
	changeCompoundProduct: function(event) {

		var $li=$(event.target);
		var $parent=$li.parents('.product');
		// Set the active LI
		var $num=$li.index();
		$li.parent().find('li:not('+$num+')').toggleClass('active',false);
		$li.toggleClass('active',true);

		var $size=$li.parent().find('li').size();
		var $pct=(($size-$num)/$size)*50+50;
		var $tip=$parent.find('button.hotspot');
		
		if($tip && $tip!=''){ // TOOLTIP
			$($tip.data('tooltipper').tip).find('.product-classes').each(function(){
				var e=$(this);
				e.children('*:not('+$num+')').toggleClass('active',false);
				e.children('*:eq('+$num+')').toggleClass('active',true);
			});
		}

		$parent.find('.product-classes').each(function(){
			var e=$(this);
			e.children('*:not('+$num+')').toggleClass('active',false);
			e.children('*:eq('+$num+')').toggleClass('active',true);

			// Add images to and trigger the lazy-loading queue.
			if (e.hasClass('img-link')) {
				lg.addImages(e);
			}
		});
	}
});

lg.plugin('grid', lg.Grid, '.grid');
