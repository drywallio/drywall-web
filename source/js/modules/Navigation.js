define(['jquery', 'underscore', 'backbone', 'app'
], function ($, _, Backbone, app) {
	var Models = {};
	var Collections = {};
	var Views = {};

	Views.Primary = Backbone.View.extend({
		template: 'navigation/primary',
		beforeRender: function () {
			this.setViews({
				'.account': new Views.Account({
				}),
				'.breadcrumbs': new Views.Breadcrumbs({
				})
			});
		}
	});

	Views.Account = Backbone.View.extend({
		template: 'navigation/account',
		initialize: function () {
			this.listenTo(app.session, 'change', this.render);
		},
		events: {
		},
		serialize: function () {
			return app.session.toJSON();
		}
	});

	Views.Breadcrumbs = Backbone.View.extend({
		template: 'navigation/breadcrumbs',
		initialize: function () {
		},
		events: {
		},
		serialize: function () {
			return {};
		}
	});

	return {
		Models: Models,
		Collections: Collections,
		Views: Views
	};

});
