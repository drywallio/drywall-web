define(['jquery', 'underscore', 'backbone', 'app'
], function ($, _, Backbone, app) {
	var Models = {};
	var Collections = {};
	var Views = {};

	Views.Account = Backbone.View.extend({
		template: 'header/account',
		initialize: function () {
			this.listenTo(app.session, 'change', this.render);
		},
		events: {
		},
		serialize: function () {
			return app.session.toJSON();
		}
	});

	return {
		Models: Models,
		Collections: Collections,
		Views: Views
	};

});
