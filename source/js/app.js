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

		apiBasePath: 'http://drywall.cf.sg/api',

		el: '#app',

		root: '/',

		constants: constants,

		api: function (endpoint, fields, data) {
			var path = this.apiBasePath;

			var hasSlash = /\/$/.test(path) || /^\//.test(endpoint);
			if (!hasSlash) {
				path += '/';
			}

			path += endpoint;

			return url(path, _.clone(fields), _.defaults({
				format: 'json'
			}, data));
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
					this.layout.remove();
				}
				this.layout = new Constructor(options);
				$(app.el).empty().append(this.layout.el);
			}

			return this.layout;
		}

	}, Backbone.Events);

	return app;
});
