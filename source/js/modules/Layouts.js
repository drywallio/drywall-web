define(['jquery', 'underscore', 'backbone', 'app',
	'modules/Header'
],
function ($, _, Backbone, app,
	Header
) {
	var Models = {};
	var Collections = {};
	var Views = {};

	Views.Base = Backbone.View.extend({
		template: 'layouts/base',
		initialize: function (options) {
			this.setViews({
				'header': new Header.Views.Account({
				})
			});
			window.scrollTo(0, 0);
		}
	});

	Views.Landing = Views.Base.extend({
		template: 'layouts/landing'
	});

	Views['404'] = Views.Base.extend({
		template: 'layouts/404'
	});

	return {
		Models: Models,
		Collections: Collections,
		Views: Views
	};

});
