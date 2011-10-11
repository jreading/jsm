/*
 * Video
 *
 *
 * options:
 * - string width       : width
 * - string height	 	: height
 * - string video		: path to video.
 *
 * requires:
 * - lg.js
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.Video = lg.Component.extend({
	options:{
		width:'320px',
		height:'240px',
		video: ''
	},
	init:function(options,elem){
		this._super(options,elem);
		
		head.feature("video", function() {
			var tag = document.createElement('video');
			return !!tag.canPlayType;
		});
		
		this._build();
	},
	_build:function(){

		this.element.css('width',this.options.width);
		this.element.css('height',this.options.height);
		
		this.element.find('img').bind('click',$.proxy(function(e){
			e.preventDefault();
			
			$(this).hide();
			
			$player = this.element.find('.player');
			$player.show();

			this.videoSrc = this.options.video;

			if (head.video) {
				this.strParams = "?autoplay=1&html5=True";
			} else {
				this.strParams = "?autoplay=1";
			}
			
			this.reelSrc = this.videoSrc + this.strParams;
			
			$player.html('<iframe title="video player" class="" type="text/html" width="'+this.options.width+'" height="'+this.options.height+'" src="' + this.reelSrc +'" frameborder="0" allowFullScreen></iframe>')
			
		},this));
	}
});

lg.plugin('video', lg.Video, '.video');
