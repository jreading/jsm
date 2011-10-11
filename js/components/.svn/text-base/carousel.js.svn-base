lg.Carousel = lg.Component.extend({
	options: {
		actionstart: 'click',
		actionend: 'mouseleave',
		multiplier: 3,
		paneview: false,
		actionelement: 'img',
		transitions: head.csstransitions
	},

	init: function(options, element) {

		this._super(options, element);

		this.itemWidth;
		this.scrollWidth;
		this.intNumItems;
		this.totalMoves;
		this.madeMoves = 0;
		this.intPos = 0;

		this._build();

		this.log('initComplete', this.element);
	},
	_build: function(){
		this.contentDiv = $('ul:first', this.element);
		this.slides     = $('li:not(ul ul li)',this.contentDiv);
		this.arrowLeft  = $('.carousel-arrow-left', this.element);
		this.arrowRight = $('.carousel-arrow-right', this.element);

		this.log('CSS transitions: ',this.options.transitions);

		this.itemWidth = this.slides.first().width() + parseInt(this.slides.first().css('margin-left'));
		this.scrollWidth = this.itemWidth * this.options.multiplier;
		this.intNumItems = this.slides.length;
		this.totalMoves = Math.ceil(this.intNumItems / this.options.multiplier) - 1;
		this.contentDiv.css({'width':(this.intNumItems * this.itemWidth)+'px'});

		if (this.intNumItems == 1) {
			this.arrowLeft.hide();
			this.arrowRight.hide();
		}

		if (this.slides.length <= this.options.multiplier) this.arrowRight.addClass('disabled');

  		this.addRollovers();

  		this.arrowLeft.bind('click', $.proxy(function(e){
			e.preventDefault();
			this.scrollLeft();
		},this));

  		this.arrowRight.bind('click', $.proxy(function(e){
			e.preventDefault();
			this.scrollRight();
		},this));

		this.contentDiv.css({'display':'block'});

		this.element.parent().css({'position':'relative'});

		$('.question li', this.element).bind('click',function(e){
			e.preventDefault();
			$('.question li').removeClass('active');
			$(this).addClass('active');
		});

		this.log('buildComplete');
	},
	updateContent: function(path) {
		$.get(path, $.proxy(function(data) {
			this.element.html(data);
			this._build();
			lg.addImages(this.element);
			this.callback();
		},this));
	},
	// Scroll the slideshow to the left one page.
	scrollLeft:  function(){
		if(this.madeMoves > 0) {
			// close any open tooltips on the carousel slides that are sliding out
			this.broadcast('tooltipper', 'close', this.element.find('.hotspot'));

			if (this.options.transitions) {
				this.contentDiv.css({'left':this.intPos + this.scrollWidth})
			} else {
				this.contentDiv.stop().animate({'left':this.intPos + this.scrollWidth},'slow');
			}
			this.madeMoves--;
			this.intPos = this.intPos + this.scrollWidth;
			this.arrowRight.removeClass("disabled");
			if (this.madeMoves < 1) this.arrowLeft.addClass("disabled");
			$('.modal-window').removeClass('animate');
			if (!this.options.transitions) $('.modal-window').addClass('invisible');
		}
		this.log('arrow-left clicked');
	},
	// Scroll the slideshow to the right one page.
	scrollRight: function(){
		if(this.madeMoves < this.totalMoves) {
			this.broadcast('tooltipper', 'close', this.element.find('.hotspot'));

			if (this.options.transitions) {
				this.contentDiv.css({'left':this.intPos - this.scrollWidth});
			} else {
				this.contentDiv.stop().animate({'left':this.intPos - this.scrollWidth},'slow');
			}
			this.madeMoves++;
			this.intPos = this.intPos - this.scrollWidth;
			this.arrowLeft.removeClass("disabled");
			if (this.madeMoves == this.totalMoves) this.arrowRight.addClass("disabled");
			$('.modal-window').removeClass('animate');
			if (!this.options.transitions) $('.modal-window').addClass('invisible');
		}
		this.log('arrow-right clicked');
	},

	addRollovers: function(){
		this.slides.each($.proxy(function(index,el) {
			$(this.options.actionelement + ":first",el).bind(this.options.actionstart, $.proxy(function(e){
				e.preventDefault();
				this.handleRollovers($(e.target).closest('li'),'start');
  			},this)).bind(this.options.actionend, $.proxy(function(e){
  				e.preventDefault();
				this.handleRollovers($(e.target).closest('li'),'end');
  			},this));
  		},this));
		this.log('addRollovers: ' + this.options.actionstart + ' ' + this.options.actionend);
  	},

  	handleRollovers: function(el,ev) {
  		if (ev == "start") {
	  		if (this.options.paneview) {
				$('.three60').removeClass('active');
				idx = $(el).index();
				$('.pane, li').removeClass('active');

				$('.pane:eq('+ idx +')').addClass('active');
				var ts=$('.pane:eq(' + idx + ')').find('.three60').data('three60');
				if(ts && ts.reveal)ts.reveal();

				$(el).addClass('active');

				lg.addImages($('.pane:eq('+ idx +')'));
	  		}
  		} else {
  			// Do nothing
  		}
  		this.log('handleRollovers: ',ev);
  	}
});

lg.plugin('carousel', lg.Carousel, '.carousel');
