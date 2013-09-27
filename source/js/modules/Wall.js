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
		},
		bounds: function () {
			console.log(this.map(function (stickie) {
				return [
					stickie.get('x'),
					stickie.get('y')
				];
			}));
			return {
				top: 0,
				left: 0,
				width: this.max(function (stickie) {
					return stickie.get('x');
				}).get('x'),
				height: this.max(function (stickie) {
					return stickie.get('y');
				}).get('y')
			};
		}
	});

	Views.Draggable = Backbone.View.extend({
		template: 'wall/draggable',
		initialize: function (options) {
			this.options = options;
			this.listenTo(this.collection, 'sync', this.render);
			this.listenTo(this.collection, 'change', this._fitGrid);
		},
		beforeRender: function () {
			this.getViews('.stickie').each(function(stickie) {
				stickie.remove();
			});
			console.log('bounds', this.collection.bounds());
			this.insertViews({
				'.stickies': this.collection.map(function (stickie) {
					return new Views.Stickie({
						model: stickie
					});
				})
			});
		},
		afterRender: function () {
			Draggable.create(this.$el, {
				trigger: this.$el.find('.grid'),
				type: 'x,y',
				maxDuration: 0.5,
				edgeResistance: 0.75,
				throwProps: true
			});
		},
		_fitGrid: function () {
			console.log('bounds', this.collection.bounds());
		}
	});

	Views.Stickie = Backbone.View.extend({
		template: 'wall/stickie',
		initialize: function () {
			this.listenTo(this.model, 'change', this.updateCoordinates);
		},
		serialize: function () {
			return this.model.toJSON();
		},
		updateCoordinates: function () {
			var x = this.model.get('x');
			var y = this.model.get('y');
			this.$el.find('.coordinates .x').html(x);
			this.$el.find('.coordinates .y').html(y);
		},
		afterRender: function () {
			var that = this;
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
			Draggable.create(this.$el, {
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
				},
				onDragEnd: function () {
					// console.log("drag ended", this.endX, this.x);
					that.model.set({
						x: this.x,
						y: this.y
					});
				}
			});
		}
	});

	return {
		Models: Models,
		Collections: Collections,
		Views: Views
	};

});
