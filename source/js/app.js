define([
	'jquery', 'underscore', 'backbone',
	'backbone.layoutmanager',
	'libs/url',
	'constants'
], function (
	$, _, Backbone,
	LayoutManager,
	url,
	constants
) {
	var app = _.extend({

		el: '#app',

		root: '/',

		constants: constants,

		api: function (endpoint, fields) {
			var apiBasePath = 'http://api.drywall.cf.sg';
			var hasSlash = /\/$/.test(apiBasePath) || /^\//.test(endpoint);
			if (!hasSlash) {
				apiBasePath += '/';
			}
			return url(apiBasePath + endpoint, _.clone(fields));
		},

		useLayout: function (layout, options) {
			options = options || {};

			if (_.isString(layout)) {
				if (this.layout) {
					this.layout.template = layout;
				} else {
					this.layout = new Backbone.Layout(_.extend({
						el: app.el,
						template: layout
					}, options));
				}
			}

			else if (
				(layout.prototype instanceof Backbone.Layout ||
					layout.prototype instanceof Backbone.View)
			) {
				var Constructor = layout;
				if (this.layout) {
					this.layout.removeView();
				}
				this.layout = new Constructor(_.extend({
					el: app.el
				}, options));
			}

			return this.layout;
		}

	}, Backbone.Events);

	return app;
});
