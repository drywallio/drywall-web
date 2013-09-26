define(['jquery', 'underscore', 'backbone', 'app',
	'Draggable'
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
			var gridWidth = 26;
			var gridHeight = 26;
			var snapX = function (endValue) {
				var minX = this.minX || 0;
				var maxX = this.maxX || 1E10;
				var cell = Math.round(endValue / gridWidth) * gridWidth;
				var target = Math.max(minX, Math.min(maxX, cell));
				// console.log('minX', minX, 'maxX', maxX, 'target', target);
				return target;
			};
			var snapY = function (endValue) {
				var minY = this.minY || 0;
				var maxY = this.maxY || 1E10;
				var cell = Math.round(endValue / gridHeight) * gridHeight;
				var target = Math.max(minY, Math.min(maxY, cell));
				// console.log('minY', minY, 'maxY', maxY, 'target', target);
				return target;
			};
			if (this.collection.length > 0) {
				Draggable.create('.stickie', {
					type: 'x,y',
					bounds: {
						top: 48,
						left: 0
						// width: 0,
						// height: 0
					},
					maxDuration: 0.5,
					edgeResistance: 0.75,
					throwProps: true,
					snap: {
						x: snapX,
						y: snapY
					}
				});
			}
		}
	});

	Views.Stickie = Backbone.View.extend({
		template: 'wall/stickie',
		serialize: function () {
			return this.model.toJSON();
		}
	});

	return {
		Models: Models,
		Collections: Collections,
		Views: Views
	};

});
