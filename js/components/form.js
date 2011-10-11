/*
 * Form
 *
 * Adds ajax form submission and validation
 *
 * options:
 * - boolean 	debug		(data-debug)				: Set to true in order to output debugging information to the console
 * - string 	type		(data-type)				    : Form submission type (POST or GET)
 * - string 	responseloc	(data-responseloc)			: Id of element to show response in
 * - string 	review		(data-review)				: Url of page to display a review of the form before submission
 * - 
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
lg.aForm = lg.Component.extend({
	options: {
		action: '',
		type: 'post',
		async: false,
		responseloc: 'self',
		inlineedit: false,
		review: ''
	},
	init:function(opts,element){
		this._super(opts,element);
		
		this.form = $('form',this.element);
		this.form.attr('action',this.options.action);
		
		if (this.options.responseloc == 'self') {
			this.options.responseloc = this.element;
		} else {
			this.options.responseloc = '#' + this.options.responseloc;
		}

		this._build();
		
	},
	_build:function(){
		
		$('.preview',this.element).click(function(e){
			e.preventDefault();
			$('.preview-off').toggle();
			$('.preview-on').toggle();
		});
		
		$('button[type="submit"]',this.element).bind('click',$.proxy(function(e){
			e.preventDefault();
			this.blnSubmit = true;
			if (!lg.msgs['formerror']) {
				$.getJSON(lg.locale + '/js/msg.json', $.proxy(function(data) {
					lg.msgs = data;
					this.validateForm();
				},this));
			} else {
				this.validateForm();
			}
			if ($(this.options.responseloc).offset().top < $(window).scrollTop()){
				lg.smoothScroll(this.element);
			}
		},this));
		
		$('button[type="reset"]',this.element).click($.proxy(function(e){
			e.preventDefault();
			this.resetForm();
		},this));
		
		//handle dynamic dropdowns
		$('.ddd', this.element).each(function() {
			dddurl = $(this).data("dropdown-url");
			if (dddurl.indexOf("?") < 0) {dddurl += "?";}
			$('select',$(this)).each(function(){
				$(this).bind('change', function() {
					parentDiv = $(this).closest('.ddd');
					idx = $('select', parentDiv).index(this);
					var val = $('select',parentDiv).serialize().replace(/[^&]+=\.?(?:&|$)/g, '');
					$('select',parentDiv).each(function(){
						if ($('select',parentDiv).index(this) > idx) {
							$(this).html($('option:eq(0)',this));
						}
					});
					$(this).attr("disabled","disabled");
					$.ajax({
						url: dddurl + val,
						dataType: 'json',
						success: function(response) {
							var options = '';
							for (key in response) {
								options += '<option value="'+ key +'">'+ response[key] +'</option>';
							}
							$('select:eq('+(idx+1)+')',parentDiv).append(options);
							$('select', parentDiv).removeAttr("disabled");
						}
					});
				});
			});
		});
		
		if ($('input[type="date"]', this.element).length && $.fn.datepicker) {
			$('input[type="date"]', this.element).datepicker({
				inline: true,
				dateFormat: 'yy-mm-dd'
			});
		}
		
		// inline editing
		if (this.options.inlineedit) {
			$('.edit', this.element).bind('click',$.proxy(function(e){
				e.preventDefault();
				$('.edit, .inline-values', this.element).hide();
				$('.inline-form', this.element).show();
			},this));
			
			$('button[type="reset"]',this.element).click($.proxy(function(e){
				e.preventDefault();
				$('.edit, .inline-values', this.element).show();
				$('.inline-form', this.element).hide();
			},this));
		}

		this.log("Build Complete", this.element, this.options.responseloc);
		
	},
	resetForm: function() {
		$('.error-msgs',this.element).html("");
		$('.invalid',this.element).removeClass('invalid');
		if (this.form.length) this.form[0].reset();
	},
	submitForm: function() {
		//serialize, submit to action url
		//show loader
		if (this.options.async) {
			$.ajax({
				type: this.options.type,
				url: this.options.action,
				data: this.form.serialize(),
				success: $.proxy(function(response){
					$('#review-response').empty().remove();
					if (this.options.responseloc == 'self') {
						$(this.form).hide();
						$(this.options.responseloc).append(response);
					} else{
						$(this.options.responseloc).html(response);
					}
					
					$('input, select, textarea',this.form).each($.proxy(function(idx,el){
						$tag = $(el).get(0).tagName.toLowerCase();
						$val = ($tag == "checkbox" || $tag == "radio" || $tag == "select")  ? $(el).find("radio:checked, checkbox:checked, option:selected").text() : ($tag == "select" ? $(el).find("option:selected").val() : $(el).val()) ;
						if ($(el).val()) $(this.element).find("#"+$(el).attr("name")).html($val);
					},this));
					this.showResults();
				    this.log("Response received",this.element);
				},this),
				error: $.proxy(function(html){
				    $(this.element).html(html);
				    this.log("Form Error", this.element);
				},this)
			});
		} else {
			this.form.submit();
		}
		this.log("Form Submitted", this.element);
	},
	reviewForm: function() {
		//show review screen first
		//show loader
		$.ajax({
			url: this.options.review,
			success: $.proxy(function(response){
				$(this.form).hide();
				//show review and bind everything
				$(this.options.responseloc).append(response);
				$('input, select, textarea',this.form).each($.proxy(function(idx,el){
					$tag = $(el).get(0).tagName.toLowerCase();
					$val = ($tag == "checkbox" || $tag == "radio" || $tag == "select")  ? $(el).find("radio:checked, checkbox:checked, option:selected").text() : ($tag == "select" ? $(el).find("option:selected").val() : $(el).val()) ;
					if ($(el).val()) $(this.element).find("#"+$(el).attr("name")).html($val);
				},this));
				  
				$('#review-return').bind('click',$.proxy(function() {
					$('#review-response').empty().remove();
					$(this.form).show();
				},this));
				  
				$('#review-submit').bind('click',$.proxy(function() {
					  this.submitForm();
				},this));
			      
				this.showResults();
			    this.log("Review Response received",this.element);
			},this),
			error: $.proxy(function(html){
			    $(this.element).html(html);
			    this.log("Form Error", this.element);
			},this)
		});
	},
	errorMessage: '',
	validators: {
		email: function(el){
			var regE = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
			if (regE.test(el.val()) || !el.attr('required') && (!el.val() || el.val() == el.attr('placeholder'))){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['email']).split('%title%').join(el.attr('title'));
			}
		},
		tel: function(el) {
			var regE = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
			if (regE.test(el.val()) || !el.attr('required') && (!el.val() || el.val() == el.attr('placeholder'))){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['tel']).split('%title%').join(el.attr('title'));
			}
		},
		text: function(el){
			if (el.val() && el.val() != el.attr('placeholder')){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['required']).split('%title%').join(el.attr('title'));
			}
		},
		password: function(el){
			if (el.val() && el.val() != el.attr('placeholder')){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['required']).split('%title%').join(el.attr('title'));
			}
		},
		file: function(el){
			if (el.val() || !el.attr('required')){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['required']).split('%title%').join(el.attr('title'));
			}
		},
		match: function(el,target){
			if(el.val() && el.val() != el.attr('placeholder') && el.val() == $('[name="'+target+'"]').val()){
				return true;
			}else {
				return ('' + lg.msgs['formerror']['match']).split('%title%').join(el.attr('title')).split('%target_title%').join($('[name="'+target+'"]').attr('title'));
			}
		},
		minlength: function(el,target){
			if(!el.val() || el.val() == el.attr('placeholder') || el.val().length >= target){
				return true;
			}else{
				return ('' + lg.msgs['formerror']['minlength']).split('%title%').join(el.attr('title')).split('%target%').join(target).split('%used%').join(el.val().length);
			}
		},
		maxlength: function(el,target){
			if(!el.val() || el.val() == el.attr('placeholder') || el.val().length <= target){
				return true;
			}else{
				return ('' + lg.msgs['formerror']['maxlength']).split('%title%').join(el.attr('title')).split('%target%').join(target).split('%used%').join(el.val().length);
			}
		},
		textarea: function(el){
			if (el.val() && el.val() != el.attr('placeholder')){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['required']).split('%title%').join(el.attr('title'));
			}
		},
		checkbox: function(el){
			if (el.attr("checked") || !el.attr("required")){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['checkbox']).split('%title%').join(el.attr('title'));
			}
		},
		radio: function(el){
			if ($('input[name="'+ el.attr('name') +'"]:checked').val() || !el.attr("required")){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['checkbox']).split('%title%').join(el.attr('title'));
			}
		},
		select: function(el){
			if (el.val() || !el.attr("required")){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['required']).split('%title%').join(el.attr('title'));
			}
		},
		number: function(el){
			var regE = /^\s*\d+\s*$/;
			if (regE.test(el.val())){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['number']).split('%title%').join(el.attr('title'));
			}
		},
		date: function(el){
			if (el.val() || !el.attr("required")){
				return true;
			} else {
				return ('' + lg.msgs['formerror']['required']).split('%title%').join(el.attr('title'));
			}
		}
	},
	validateForm: function() {
		//validation will live here. Temporary Number Validation
		var regN = /^-{0,1}\d*\.{0,1}\d+$/;
		var toapply = [];
		var clean = true;
		var errcnt = 0;
		var fldcnt = 0;
		var fldinvalid = false;

		this.errorMessage = '';
		this.element.find('input[type], textarea, select').each($.proxy(function(idx,el) {
			
			var $el = $(el);
			$(el).unbind('blur').bind('blur',$.proxy(function(){
				this.blnSubmit = false;
				this.validateForm();
			},this));
			var rqd = $el.attr('required');
			fldinvalid=false;
			if(
					$el.attr('type') !='hidden' &&
					$el.attr('type')!='radio'
					// && !(($el.attr('type')=='text' || $el.get(0).nodeName.toLowerCase() == 'textarea' || $el.get(0).nodeName.toLowerCase() == 'select') && !$el.attr('required') && !$el.data('rules')) 
			)fldcnt++;
			
			if ((!$el.val() || $el.val() == '' || $el.val()==$el.attr('placeholder')) && !rqd) {
				$el.removeClass('invalid');
			} else {
				var ml=$el.attr('maxlength');
				if(ml && ml !='' && ml>0){
					toapply.push({v:'maxlength',t:parseInt(ml)});
				}
				
				var rule = $el.data('rules');
				if(rule){
					var rules=rule.split(',');
					var i=rules.length;
					while(i--){
						var ra=rules[i].split(':');
						var rid=ra[0].split(' ').join();
						if(this.validators[rid]){
							toapply.push({v:rid,t:ra[1]});
						}
					}
				}

				if ($el.get(0).nodeName.toLowerCase() == "input")var vdr = $el.attr('type');
				else var vdr = $el.get(0).nodeName.toLowerCase();
				if (vdr && this.validators[vdr])toapply.push({v:vdr});
				
				var n=toapply.length;
				while(n--){
					var o=toapply.pop();
					var result;
					if(o.t)result=this.validators[o.v].apply(this,[$el,o.t]);
					else result=this.validators[o.v].apply(this,[$el]);
					if ($el.parent().hasClass('styled-select')) {
						$el = $el.parent();
					} 
					if(result !== true) {
						this.errorMessage += "<li class='highlight'>" + result + "</li>";
						$el.addClass('invalid');
						clean = false;
						fldinvalid=true;
						errcnt++;
					} else {
						if(!fldinvalid)$el.removeClass('invalid');
					}
				}
			}
		},this));
		
		if(!clean) {
			var hdr=fldcnt > 1 ?'<p><strong class="highlight">' + lg.msgs['formerror']['header'] + "</strong></p><ul>":'<ul>';
			$('.error-msgs',this.element).html(hdr+this.errorMessage+"</ul>");
			if(self!=parent){ // We're in iframe
				var ht=$(this.element).closest('html');
				var fr=$('iframe.iframed-form',top.document);
				fr.each(function(){
					if($(this).contents().find(ht).length){
						$(this).height($(document).height());
					}
				});
			}
			
		} else { 
			
			$('.error-msgs',this.element).html("");
			if (this.blnSubmit) {
				if (this.options.review) {
					this.reviewForm();
				} else {
					this.submitForm();
				}
			}
		}
		 			
		this.log("Validation Complete", this.element);
	},
	showResults: function (response) {
		if (this.options.inlineedit) {
			this._build();
		}
		lg.addImages($(this.options.responseloc));
	}
});

lg.plugin('aform',lg.aForm, '.aform');
