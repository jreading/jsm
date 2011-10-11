/*
 * TabPanel
 *
 * The TabPanel component is used for rendering header tabs and content panels,
 * which may exist in the markup or may be loaded upon request via XHR.
 *
 * options:
 *
 * requires:
 * - lg.js
 * - steps.css
 *
 * authors:
 *   Big Red Tech <bigred.tech@icrossing.com>
 *  	Adam Abouraya <Adam.Abouraya@icrossing.com>
 * 		Arne G Strout <arne.strout@icrossing.com>
 * 		John Reading <john.reading@icrossing.com>
 * 		Jonathan Zuckerman <jonathan.zuckerman@icrossing.com>
 */
lg.Steps = lg.Component.extend({

	options: {},

	init: function(options, element) {
		this._super(options, element);

		this.uri = this.element.data('uri');

		/*this.category = $('#category');
		this.product = $('#product');
		this.type = $('#type');
		this.number = $('#number');*/

		// on the prod picker
		this.product = $('#product');
		this.description = $('#desc');
		this.type = $('#type');
		this.image = $('#image');
		this.model = $('#model');
		this.other = $('#other');

		// on the reg form
		this.productImage = $('#product_image');
		this.modelNumber = $('#model_number');
		this.productDescription = $('#product_description');
		this.productName = $('#product_name');

		this.pages = this.element.closest('.pages');


		this.element.delegate('a[value]', 'click', $.proxy(this.nextStep, this));
		this.product.bind('change', $.proxy(this.nextStep, this));


		this.model.bind('change', $.proxy(function(){
			var selectedOption = this.model.find('option:selected');
			if (selectedOption.length == 0) {
				this.image.fadeOut('fast').removeAttr('src');
			}
			else if (selectedOption.data('image') && selectedOption.data('image') != this.image.attr('src')) {
				this.image.fadeOut('fast', $.proxy(function(){
					this.description.val( selectedOption.data('desc') );
					this.type.val( selectedOption.data('type') );

					this.image.attr( 'src', selectedOption.data('image') );
					this.image.fadeIn('fast');
				}, this));
			}

			this.updateModel();
		}, this));

		$('#get_started').bind('click', $.proxy(this.showRegistration, this));
	},

	serialize: function() {
		var forms = this.element.find('form'),
			qs = '?' + forms.serialize();

		// if it's not a proper form element, it can still impart a value.
		// todo: this is conceptually a radio element.. would it be possible
		//       to style this the same but using the proper form element?
		forms.find('a.active').each(function(){
			var target = $(this);
			if ( target.attr('value').length ) {
				qs += '&' + target.attr('name') + '=' + target.attr('value');
			}
		});

		return qs;
	},

	// the first page "product picker" has individual steps which must be
	// completed in order.
	nextStep: function(e) {
		this.log('proceeding to next step');
		e.preventDefault();

		var target = $(e.target),
		    step = target.closest('li[data-step]'),
			nextStep = step.next('li[data-step]');

		// If the event-triggering element was a link, highlight it.
		if ( target.is('a') ){
			// Book it, if we have already selected this path.
			if ( target.is('.active') ){
				return false;
			}
			target.addClass('active')
			      .siblings().removeClass('active');
		}

		lg.overlayShow(nextStep);

		// Populate the next step with info from the server.
		// todo: figure out why .contains isn't working in this case,
		//       i don't love these (unnecessary?) find calls on the input ids.
		$.ajax({
			type: 'GET',
			url: this.uri + 'step-' + nextStep.data('step') + '.json' + this.serialize(),
			dataType: 'json',
			success: $.proxy(function(response) {
				lg.overlayHide();

				var select = nextStep.find('select'),
				    linkList = nextStep.find('form.link-list');
				// If the next step...
				// ..contains a select list - as in Step 2 and 4 -
				// then loop through and add each item as an option.
				//if ( $.contains(nextStep, this.product) ) {
				if ( select.length ) {
					var options = '';
					for ( name in response ) {
						var entry = response[name],
							attrib = entry.image ? ' data-image="' + entry.image + '"' : '',
							attrib = attrib + (entry.desc ? ' data-desc="' + entry.desc +'"' : '');
							attrib = attrib + (entry.type ? ' data-type="' + entry.type +'"' : '');

						// different JSON formats for multiple vs. non-multiple.
						// really the difference is the content, but this is
						// a one-off anyway, so it seemed like the fastest way
						// to get the job done, ask Jonz if you have questions.
						if (select.is(this.model)) {
							options = options + '<option value="' + name + '"' + attrib + '>' + name + '</option>';
						}
						else {
							options = options + '<option value="' + name + '"' + attrib + '>' + entry + '</option>';
						}
					}
					select.html( options );
				}
				// ..contains a list of links - as in Step 3 -
				// then loop through and add each option as a link.
				//else if ( $.contains(nextStep, this.type) ) {
				else if ( linkList.length ) {
					var form = linkList.closest('form'),
					    name = form.attr('name'),
					    links = '';
					for ( value in response ) {
						var entry = response[value];
						links = links + '<a href="#" name="' + name + '" value="' + value + '">' + entry + '</a>';
					}
					linkList.html( links );
				}
				else {
					lg.showError('ajaxerror');
					return false;
				}


				// Reveal the new step and hide any subsequent steps,
				// which are no longer valid since we changed a parent step.
				nextStep.css( 'visibility', 'visible' )
						.nextAll( '[data-step]' ).css( 'visibility', 'hidden' );
			}, this),
			error: function(x, y, z) {
				lg.showError('ajaxerror');
				lg.overlayHide();
			}
		});
		this.log('Loaded step ' + step.data('step'));
	},

	updateModel: function() {
		// copy the selected image and product info into the reg form.
		this.productImage.attr('src', this.image.attr('src'));
		this.modelNumber.text( this.model.val().toString() );
		$('input[name="modelname"]').val(this.model.val().toString());
		this.productName.text( this.type.val() + ' ' ); // extra space to give it some margin from the next word.
		this.productDescription.text( this.description.val() );
	},

	// once the product has been picked, they can fill out registration for it.
	showRegistration: function(e) {
		// ensure that a model number is being submitted
		if ( ! this.model.val() && ! this.other.val() ) {
			lg.showError('productregerror');
			return false;

			this.pages.children('li').hide()
				.filter('.model-selection').show();
		}

		// switch pages
		this.pages.children('li').hide()
			.filter('.registration-form').show();

		// this occurs on "submit" so regardless of the outcome,
		// return false - we are trying to do this w/ ajax.
		return false;
	}
});

lg.plugin('stepify', lg.Steps, '.steps');


