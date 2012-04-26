define(['js/modules/othermodule'],function(OtherModule) {

	var OtherModule = OtherModule.extend({
		showMessage: function(args) {
			$(args[0].element).append('<div id="msg2">'+args[1]+'!!!</div>');
		}
	});

	JsMBP.plugin('othermodule', OtherModule, '.othermodule');

	return OtherModule;
});

