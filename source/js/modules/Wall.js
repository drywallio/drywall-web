define(['jquery', 'underscore', 'backbone', 'app',
	'draggable'
],
function ($, _, Backbone, app,
	Draggable
) {
	var Models = {};
	var Collections = {};
	var Views = {};

	Models.Stickie = Backbone.Model.extend({
		url: function () {
			return app.api('stickies/:id', this);
		}
	});

	Collections.Stickies = Backbone.Collection.extend({
		model: Models.Stickie,
		initialize: function (models, options) {
			this.options = options || {};
		},
		url: function () {
			return app.api('stickies/', null, _.pick(
				this.options,
				'repository',
				'organization'
			));
		}
	});

	Views.Draggable = Backbone.View.extend({
		template: 'wall/draggable',
		initialize: function (options) {
			this.options = options;
			this.listenTo(this.collection, 'sync', this.render);
		},
		beforeRender: function () {
			this.getViews('.stickie').each(function(stickie) {
				stickie.remove();
			});
			this.insertViews(this.collection.map(function (stickie) {
				return new Views.Stickie({
					model: stickie
				});
			}));
		},
		afterRender: function () {
			if (this.collection.length > 0) {
				Draggable.create('.stickie', {
					type: 'x,y',
					bounds: this.$el,
					edgeResistance: 0.5,
					throwProps: true
				});
			}
		}
	});

	Views.Stickie = Backbone.View.extend({
		template: 'wall/stickie'
	});

	return {
		Models: Models,
		Collections: Collections,
		Views: Views
	};

});
