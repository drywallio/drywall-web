define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'Draggable',
  'TweenLite'
],
function (
  $, _, Backbone, app,
  constants,
  Draggable,
  TweenLite
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  var stickieWidth = constants.STICKIE.WIDTH;
  var stickieHeight = constants.STICKIE.HEIGHT;
  var stickieColour = constants.STICKIE.COLOUR;

  var tileWidth = constants.TILE.WIDTH;
  var tileHeight = constants.TILE.HEIGHT;

  Collections.Stickies = Backbone.Collection.extend({
    initialize: function (models, options) {
      this.options = options || {};
      var untouchedIssues = [];
      options.issues.reduce(this._layoutStickies, untouchedIssues, this);
      this._layoutUntouchedIssues(untouchedIssues);

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
    _layoutStickies: function(arr, issue) {
      var match = issue.pick('number');
      var coordinate = this.options.coordinates.findWhere(match);

      if (coordinate) {
        this.addStickie(issue, coordinate);
      } else {
        arr.push(issue);
      }
      return arr;
    },
    _layoutUntouchedIssues: function (issues) {
      var that = this;
      var bounds = that.bounds();

      issues.forEach(function (issue) {
        var coordinate = new that.options.coordinates.model({
          number: issue.get('number'),
          x: (Math.random() * bounds.width / 2) + bounds.left,
          y: (Math.random() * 200) + bounds.bottom + stickieWidth
        });
        that.options.coordinates.add(coordinate);
        that.addStickie(issue, coordinate);
      });
    },
    addStickie: function(issue, coordinate) {
      var data = _.extend(issue.toJSON(), coordinate.toJSON());
      var stickie = new this.model(data);
      this.add(stickie);
    },
    bounds: function () {
      var x = this.map(function (stickie) {
        return stickie.get('x');
      });
      var y = this.map(function (stickie) {
        return stickie.get('y');
      });
      x = _.isEmpty(x) ? [0] : x;
      y = _.isEmpty(y) ? [0] : y;

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
      this.options.scaleVal = 1;
      this.listenTo(options.stickies, 'add', this.addStickie);
      this.listenTo(this, 'zoom', this.updateScaleValue);
      this.listenTo(this, 'zoom', this.updateGrid);
      // this.listenTo(options.stickies, 'change', this.changeStickie);
      // this.listenTo(options.stickies, 'remove', this.removeStickie);
    },
    afterRender: function () {
      this.insertView('aside', new Views.Controls({
        zoomInput: this.$el,
        zoomTarget: this.$el.find('.zoom'),
        parent: this
      })).render();
      this.options.stickies.each(function (stickie) {
        this.addStickie(stickie);
      }, this);
      this.createDraggableScreen();
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
    dragStickies: function (options) {
      return function() {
        $(app.el).addClass('wall-draggable-moving');
        var stickies = this.target.parentNode.querySelector('.stickies');
        var scaleMultiplier = 1 / options.scaleVal;
        var xDist = (this.prevX - this.x) * scaleMultiplier;
        var yDist = (this.prevY - this.y) * scaleMultiplier;

        TweenLite.to(stickies, 0, {
          left: '-=' + xDist + 'px',
          top: '-=' + yDist + 'px'
        });
        this.prevX = this.x;
        this.prevY = this.y;
      };
    },
    updateScaleValue: function (scaleVal) {
      this.options.scaleVal = scaleVal;
    },
    updateGrid: function (scaleVal) {
      var scaleMultiplier = 1 / scaleVal;
      var shiftPercent = -((scaleMultiplier - 1)/ 2 * 100) + '%';

      TweenLite.to(this.$el.find('.grid'), 0, {
        scale: scaleVal,
        left: shiftPercent,
        top: shiftPercent,
        width: 100 * scaleMultiplier + '%',
        height: 100 * scaleMultiplier + '%'
      });
    },
    createDraggableScreen: function () {
      Draggable.create(this.$el.find('.draggablescreen'), {
        type: 'x,y',
        dragResistance: 0,
        zIndexBoost: false,
        onDrag: this.dragStickies(this.options),
        onPress: function () {
          this.prevX = 0;
          this.prevY = 0;
        },
        onDragEnd: function () {
          $(app.el).removeClass('wall-draggable-moving');
          this.target.style.zIndex = 0;
          TweenLite.to(this.target, 0, {x: 0, y: 0});
        }
      });
    }
  });

  Views.Controls = Backbone.View.extend({
    template: 'wall/controls',
    initialize: function (options) {
      options.lastScale = 1;
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
    }, 300, {trailing: false}),
    zoomOutStep: _.throttle(function () {
      var direction = -1;
      this.stepScale(direction);
    }, 300, {trailing: false}),
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
      this.options.parent.trigger('zoom', value);
    }
  });

  var snapX = function (endValue) {
    var minX = this.minX || 0;
    var maxX = this.maxX || 1E10;
    var cell = Math.round(endValue / tileWidth) * tileWidth;
    var target = Math.max(minX, Math.min(maxX, cell));
    return target;
  };

  var snapY = function (endValue) {
    var minY = this.minY || 0;
    var maxY = this.maxY || 1E10;
    var cell = Math.round(endValue / tileHeight) * tileHeight;
    var target = Math.max(minY, Math.min(maxY, cell));
    return target;
  };

  Views.Stickie = Backbone.View.extend({
    template: 'wall/stickie',
    initialize: function (options) {
      this.listenTo(this.model, 'change', this.updateCoordinates);
    },
    serialize: function () {
      var labels = this.model.get('labels') || [];
      var first = _.find(labels, function (label) { return !!label.color; });
      var color = (first ? '#' + first.color : stickieColour);
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
