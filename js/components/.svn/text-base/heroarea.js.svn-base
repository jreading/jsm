/*
 * Hero Area and Tabs module
 *
 * Adds functionality to the Hero area, such as clickable indicators, timed rotation, and sliding tabs.
 * This class automatically will find the hero area container by the class ".hero-area", then the individual hero images
 * should all have the same class ".hero". The tabs should all be div children of ".tabs" and there should be three.
 * If there is only one hero image then the single image will display, rotation will be disabled, and the indicator will be hidden.
 *
 * options:
 * - num 		interval	(data-interval)				: Number of miliseconds between the rotation
 * - boolean 	debug		(data-debug)				: Set to true in order to output debugging information to the console
 * - num 		left		(imagearea: data-left)		: Specified on each imagearea div via data param 'data-left', indicates the
 * 								      					  starting position of the content for each hero image, relative to the left edge of the
 * 														  image, in pixels.
 * - num 		top			(imagearea: data-top)		: Specified on each imagearea div via data param 'data-top', indicates the
 * 													      starting position of the content for each hero image, relative to the top edge of the
 * 														  image, in pixels.
 *
 * markup:
 * @see / for full markup example
 * @example Implementation
	<section id="hero-area" data-interval="10000">
		<div class="hero">
				<img src="/common/images/promos/hero1.jpg" width="960" height="456">
				<div class="imagearea" data-left="600" data-top="10">
					<div class="headline-wrapper"><h1>Headline</h1></div>
					<div class="herocopy-wrapper"><p>Body</p></div>
					<a href="http://www.lg.com" class="small button">Button Title</a>
				</div>
		</div>
	</section>
 *
 * methods:
 * - selectImg(n)					: Selects the image in the specified position, zero based.
 * - changeImg()					: Rotates to the next image in the sequence
 *
 * requires:
 * - lg.css
 * - heroarea.css or sub-heroarea.css
 *
 * authors-
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.HeroArea = lg.Component.extend({
	options: {
		interval:20000
	},
	init:function(opts,element){
		this._super(opts,element);
		this._build();
	},
	timerInt:0,
	_build:function(){

		this.panels=this.element.find('.hero');

		this.panels.addClass('inactive');
		this.panels.css('display','block');

		this.element.find('.tabs div h3,.tabs .xout,.tabs .plusminus').bind('click', $.proxy(function(e) {
			if(!$(e.target).parent().hasClass('active')){
				this.element.find('.tabs div').removeClass('active');
				$(e.target).parent().addClass('active');
			}else{
				$(e.target).parent().removeClass('active');
			}
		},this));

		this.element.find('.tabs div').click($.proxy(function(e){
			if(!$(e.target).hasClass('active')){
				this.element.find('.tabs div').removeClass('active');
				$(e.target).addClass('active');
			}
		},this));

		this.element.find('.tabs div .close-link').bind('click', function(e) {
			e.preventDefault();
			$(this).parent().removeClass('active');
		});

		idx=-1;

		if (this.options.interval) {
			this.timerInt=setInterval($.proxy(this.changeImg,this),this.options.interval);
		}
		setTimeout($.proxy(this.changeImg,this),100);

		this.log("Building Hero Area");
		this.panels.each(function(){
			$(this).find('img').click(function(e){
				var link=$(this).parent().find('a.button').attr('href');
				window.location=link;
			});

			$(this).find('.imagearea').each(function(){
				$(this).css('left',$(this).data('left'));
				$(this).css('top',$(this).data('top'));
				$(this).find('.headline-wrapper').css('width',$(this).data('titlewidth'));
				$(this).find('.herocopy-wrapper').css('width',$(this).data('titlewidth'));
			});
		});
		
		//Find Right Product Filter Buttons
		$('input.find-filter').bind('click', function(e) {
			var checked = $(this).attr("checked");
			if (checked) {
				$(this).parent().addClass('red');
		    } else {
		    	$(this).parent().removeClass('red');
			}
		});
		
		//Find Right Product Filter Buttons Hover Image Swap
		$('label.swap').bind('mouseover', function(e) {
		
			var imgSwap = $(this).data('image');
			
			$(this).closest('.hero').find('img.step').attr('src', imgSwap);
			
		});

		// Tab Indicators
		$('#indicator ul li:eq(0), #hero-nav ul li:eq(0)').addClass('active');
		$('#indicator ul li, #hero-nav ul li').click($.proxy(function(e){
			e.preventDefault();
			this.selectImg($(e.target).index());
		},this));
		
		$('.next', this.element).click($.proxy(function(e){
			e.preventDefault();
			this.selectImg($(e.target).closest('.hero').index('.hero')+1);
		},this));
		
		$('.previous', this.element).click($.proxy(function(e){
			e.preventDefault();
			this.selectImg($(e.target).closest('.hero').index('.hero')-1);
		},this));
		
		$('.start', this.element).click($.proxy(function(e){
			e.preventDefault();
			this.selectImg(0);
			this.broadcast('gridFilter', 'clear');
			this.broadcast('gridFilter', 'applyFilter');
			//Add ability to reset to original image in each step
		},this));

		if($('#indicator ul li, #hero-nav ul li').size()<2){
			$('#indicator, #hero-nav').css('display','none');
		}
	},
	selectImg: function(n){
		idx=n-1;
		clearInterval(this.timerInt);
		this.changeImg();
	},
	changeImg: function(){
		var max=this.panels.size();
		idx++;
		if(idx>=max)idx=0;
		var selected=this.panels.eq(idx);
		this.panels.not(selected).removeClass('active').addClass('inactive');
		selected.removeClass('inactive').addClass('active');

		if(!head.csstransitions){
			selected.css("opacity",0);
			selected.animate({opacity:1.0},900);
		}

		$('#indicator ul li, #hero-nav ul li').removeClass('active');
		$('#indicator ul li:eq('+(idx)+'), #hero-nav ul li:eq('+(idx)+')').addClass('active');
	},
	panels:undefined
});

lg.plugin('heroarea',lg.HeroArea, '#hero-area');

