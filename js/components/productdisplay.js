/*
 * ProductDisplay
 *
 * Adds functionality to the product display area of product details pages
 * This class automatically will find the product display container by the selector "#product-display"
 * Sets up the links for the Three60 and Enlarge buttons, and does some minor work to allow for the
 * modal windows for the enlarge image feature.
 *
 * options:
 * - boolean 	debug		(data-debug)				: Set to true in order to output debugging information to the console
 *
 *
 * requires:
 * - lg.js
 * - productdisplay.css
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.ProductDisplay = lg.Component.extend({
	init:function(opts,element){
		this._super(opts,element);
		this._build();
	},
	timerInt:0,
	_build:function(){
		var $this=this;
		$('.link-360').click(function(){
			$this.log("Clicked 360 button");
			var carousel=$('.product-carousel .carousel').data('carousel');
			$this.log("Carousel:"+carousel);
			carousel.handleRollovers($('#button360').get(0),'start');
		});

		$('.modal.tooltip').click(function(e){
			if(e.target==this){
				$tooltip=$(this).data('tooltipper');
				$this.log("Closing Modal on fill click "+$tooltip);
				$tooltip.close();
			}
		});

		var productDisplay = this.element;
		// Add images to be lazy-loaded, and force loading on click.
		this.element.delegate('.carousel li', 'click', function(){
			var index = $(this).index(),
			    pane = productDisplay.find('.pane').eq(index);
			lg.addImages(pane);
		});
	}
});

lg.plugin('productdisplay',lg.ProductDisplay, '#product-display');

