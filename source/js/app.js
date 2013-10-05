define([
	'jquery', 'underscore', 'backbone',
	'backbone.layoutmanager',
	'libs/url',
	'libs/api',
	'constants'
], function (
	$, _, Backbone,
	LayoutManager,
	url,
	api,
	constants
) {
	var app = _.extend({

		el: '#app',

		root: '/',

		constants: constants,

		api: api(
			'http://drywall.cf.sg/api',
			{ format: 'json' }
		),

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
