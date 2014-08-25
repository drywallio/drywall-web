define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'Draggable'
],
function (
  $, _, Backbone, app,
  constants,
  Draggable
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  var stickieWidth = constants.STICKIE.WIDTH;
  var stickieHeight = constants.STICKIE.HEIGHT;

  var gridWidth = constants.GRID.WIDTH;
  var gridHeight = constants.GRID.HEIGHT;

  Collections.Stickies = Backbone.Collection.extend({
    initialize: function (models, options) {
      this.options = options || {};
      this.listenTo(
        options.issues,
        'add change',
        this._mergeIssuesCoordinates
      );
      this.listenTo(
        options.coordinates,
        'add change',
        this._mergeIssuesCoordinates
      );
    },
    _mergeIssuesCoordinates: function (model) {
      var match = {number: model.get('number')};
      var issue = this.options.issues.findWhere(match);
      var coordinate = this.options.coordinates.findWhere(match);
      var stickie = this.findWhere(match);
      if (issue && coordinate) {
        var data = _.extend(issue.toJSON(), coordinate.toJSON());
        if (!stickie) {
          stickie = new this.model(data);
          this.add(stickie);
        } else {
          stickie.set(data);
        }
      }
      else if (stickie) {
        this.remove(stickie);
      }
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
      this.listenTo(options.stickies, 'change', this.updateGrid);
      this.listenTo(options.stickies, 'add', this.addStickie);
    },
    addStickie: function (stickie) {
      var coordinate = this.options.coordinates
        .findWhere(stickie.pick('number'));
      var stickieView = new Views.Stickie({
        model: stickie,
        coordinate: coordinate
      });
      this.insertView('.stickies', stickieView);
      stickieView.render();
      this.updateGrid();
    },
    updateGrid: function () {
      var box = this.options.stickies.bounds();
      var left = box.left - stickieWidth;
      var top = box.top - stickieHeight;
      var width = stickieWidth + box.width + stickieWidth;
      var height = stickieHeight + box.height + stickieHeight;

      if (this.draggable) {
        _.each(this.draggable, function (draggable) {
          draggable.disable();
        });
      }

      this.$el.find('.grid').css({
        width: width,
        height: height,
        transform: 'translate3d(' +
          left + 'px, ' +
          top + 'px, ' +
          '0px' +
        ')'
      });

      var voidPadding = 20;

      /*jshint laxbreak:true, laxcomma:true */
      this.draggable = Draggable.create(this.$el, {
        trigger: this.$el.find('.grid'),
        type: 'x,y',
        maxDuration: 0.5,
        edgeResistance: 0.5,
        throwProps: true,
        bounds: {
          top:
            // grid to draggable offset
            - top
            // container on the page offset
            + this.$el.parent().position().top
            // margin to the screen
            - voidPadding
            // grid overflowing the viewport
            - (height - this.$el.parent().height())
          ,
          left:
            // grid to draggable offset
            - left
            // container on the page offset
            + this.$el.parent().position().left
            // margin to the screen
            - voidPadding
            // grid overflowing the viewport
            - (width - this.$el.parent().width())
          ,
          width:
            // GSAP has a weird bug so we use width
            // instead of the calculated movement area
            // + (width - this.$el.parent().width())
            + width
            // margin to the screen
            + (voidPadding * 2)
          ,
          height:
            // GSAP does it correctly for height
            // so we use the calculated movement area
            + (height - this.$el.parent().height())
            // + height
            // margin to the screen
            + voidPadding * 2
        }
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
    initialize: function (options) {
      this.options = options || {};
      this.listenTo(this.model, 'change', this.updateCoordinates);
    },
    serialize: function () {
      var labels = this.model.get('labels') || [];
      var first = _.find(labels, function (label) { return !!label.color; });
      var color = (first ? '#' + first.color : 'lemonchiffon');
      return _.extend(this.model.pick('x', 'y', 'title'), {
        color: color
      });
    },
    updateCoordinates: function () {
      var x = this.model.get('x');
      var y = this.model.get('y');
      this.$el.find('.coordinates .x').html(x);
      this.$el.find('.coordinates .y').html(y);
    },
    afterRender: function () {
      var that = this;
      this.$el.css({
        transform: 'translate3d(' +
          this.model.get('x') + 'px, ' +
          this.model.get('y') + 'px, ' +
          '0px' +
        ')'
      });
      Draggable.create(this.$el, {
        type: 'x,y',
        bounds: this.$el.parent().siblings('.grid'),
        maxDuration: 0.5,
        edgeResistance: 0.75,
        throwProps: true,
        snap: {
          x: snapX,
          y: snapY
        },
        onDragEnd: function () {
          var position = {
            x: this.x,
            y: this.y
          };
          that.model.set(position);
          that.options.coordinate.save(position);
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
