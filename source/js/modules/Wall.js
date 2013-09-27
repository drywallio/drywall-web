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

	var stickieWidth = 311;
	var stickieHeight = 311;

	var gridWidth = 26;
	var gridHeight = 26;

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
			var x = this.map(function (stickie) {
				return stickie.get('x');
			});
			var y = this.map(function (stickie) {
				return stickie.get('y');
			});

			var box = {
				left: _.min(x),
				right: _.max(x) + stickieWidth,
				top: _.min(y),
				bottom: _.max(y) + stickieHeight
			};

			return _.extend(box, {
				width: box.right - box.left,
				height: box.bottom - box.top
			});
		}
	});

	Views.Draggable = Backbone.View.extend({
		template: 'wall/draggable',
		initialize: function (options) {
			this.options = options;
			this.listenTo(this.collection, 'sync', this.render);
			this.listenTo(this.collection, 'change', this.updateGrid);
		},
		beforeRender: function () {
			this.getViews('.stickie').each(function(stickie) {
				stickie.remove();
			});
			this.insertViews({
				'.stickies': this.collection.map(function (stickie) {
					return new Views.Stickie({
						model: stickie
					});
				})
			});
		},
		afterRender: function () {
			this.updateGrid();
			Draggable.create(this.$el, {
				trigger: this.$el.find('.grid'),
				type: 'x,y',
				maxDuration: 0.5,
				edgeResistance: 0.75,
				throwProps: true
			});
		},
		updateGrid: function () {
			var box = this.collection.bounds();
			var left = box.left - stickieWidth;
			var top = box.top - stickieHeight;
			var width = stickieWidth + box.width + stickieWidth;
			var height = stickieHeight + box.height + stickieHeight;
			this.$el.find('.grid').css({
				width: width,
				height: height,
				transform: 'translate3d(' +
					left + 'px, ' +
					top + 'px, ' +
					'0px' +
				')'
			});
		}
	});

	var snapX = function (endValue) {
		var minX = this.minX || 0;
		var maxX = this.maxX || 1E10;
		var cell = Math.round(endValue / gridWidth) * gridWidth;
		var target = Math.max(minX, Math.min(maxX, cell));
		return target;
	};

	var snapY = function (endValue) {
		var minY = this.minY || 0;
		var maxY = this.maxY || 1E10;
		var cell = Math.round(endValue / gridHeight) * gridHeight;
		var target = Math.max(minY, Math.min(maxY, cell));
		return target;
	};

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
			Draggable.create(this.$el, {
				type: 'x,y',
				bounds: this.$el.parent().siblings('.grid'),
				// bounds: {
					// top: 48,
					// left: 0
					// width: 0,
					// height: 0
				// },
				maxDuration: 0.5,
				edgeResistance: 0.75,
				throwProps: true,
				snap: {
					x: snapX,
					y: snapY
				},
				onDragEnd: function () {
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
