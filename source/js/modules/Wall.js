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
      options.issues.each(this._merge, this);
      options.coordinates.each(this._merge, this);
      this.listenTo(
        options.issues,
        'add remove change',
        this._merge
      );
      this.listenTo(
        options.coordinates,
        'add remove change',
        this._merge
      );
    },
    _merge: function (model) {
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
      this.listenTo(options.stickies, 'add change remove', this.updateGrid);
      this.listenTo(options.stickies, 'add', this.addStickie);
      // this.listenTo(options.stickies, 'change', this.changeStickie);
      // this.listenTo(options.stickies, 'remove', this.removeStickie);
    },
    afterRender: function () {
      this.insertView('aside', new Views.Controls({
        zoomInput: this.$el,
        zoomTarget: this.$el.find('.zoom')
      })).render();
      this.options.stickies.each(function (stickie) {
        this.addStickie(stickie);
      }, this);
      this.updateGrid();
    },
    addStickie: function (stickie) {
      var coordinate = this.options.coordinates
        .findWhere(stickie.pick('number'));
      var stickieView = new Views.Stickie({
        model: stickie,
        coordinate: coordinate,
        repo: this.options.repo
      });
      this.insertView('.stickies', stickieView);
      stickieView.render();
    },
    updateGrid: function () {
      var gridPadding = Math.floor(stickieWidth);
      var voidPadding = Math.floor(gridPadding / 10);
      var box = this.options.stickies.bounds();
      var left = box.left - gridPadding;
      var top = box.top - gridPadding;
      var width = gridPadding + box.width + gridPadding;
      var height = gridPadding + box.height + gridPadding;

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

      /*jshint laxbreak:true, laxcomma:true */
      var bounds = {
        top:
          // grid to draggable offset
          - top
          // container on the page offset
          + this.$el.parent().offset().top
          // margin to the screen
          - voidPadding
          // grid overflowing the viewport
          - (height - this.$el.parent().height())
        ,
        left:
          // grid to draggable offset
          - left
          // container on the page offset
          + this.$el.parent().offset().left
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
      };

      this.draggable = Draggable.create(this.$el.find('.anchor'), {
        trigger: this.$el.find('.grid'),
        type: 'x,y',
        maxDuration: 0.5,
        edgeResistance: 0.5,
        throwProps: true,
        bounds: bounds
      });
    }
  });

  Views.Controls = Backbone.View.extend({
    template: 'wall/controls',
    initialize: function (options) {
      this.options = options || {};
      this.options.zoomInput.on('wheel', this.onWheelZoom.bind(this));
    },
    events: {
      'input .scale': 'setScale'
    },
    cleanup: function () {
      this.options.zoomInput.off('wheel');
    },
    onWheelZoom: function (event) {
      var evt = event.originalEvent;
      if (evt.button || evt.buttons ||
        evt.altKey || evt.ctrlKey || evt.shiftKey || evt.metaKey
      ) {
        return;
      }
      if (evt.deltaY < 0) {
        this.zoomInStep();
      } else if (evt.deltaY > 0) {
        this.zoomOutStep();
      }
    },
    zoomInStep: _.throttle(function () {
      var direction = 1;
      this.stepScale(direction);
    }, 200, {trailing: false}),
    zoomOutStep: _.throttle(function () {
      var direction = -1;
      this.stepScale(direction);
    }, 200, {trailing: false}),
    stepScale: function (direction) {
      var $scale = this.$el.find('.scale');
      var value = parseFloat($scale.val(), 10);
      var step = parseFloat($scale.attr('step'), 10) * direction;
      var min = parseFloat($scale.attr('min'), 10);
      var max = parseFloat($scale.attr('max'), 10);
      var capped = Math.min(max, Math.max(min, value + step));
      $scale.val(capped);
      $scale.trigger('change').trigger('input');
    },
    setScale: function (event) {
      var $scale = this.$el.find('.scale');
      var value = parseFloat($scale.val(), 10);
      this.options.zoomTarget.css('transform', 'scale(' + value + ')');
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
      var permissions = this.options.repo.get('permissions') || {};
      if (permissions.push) {
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
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };

});
