define([
	'jquery', 'underscore', 'backbone', 'app'
], function (
	$, _, Backbone, app
) {
	return Backbone.Router.extend({

		routes: {
			'': 'landing',
			'*path': '404'
		},

		landing: function () {
		},

		404: function () {
		}

	});
});
