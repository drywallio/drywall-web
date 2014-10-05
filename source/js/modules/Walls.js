define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'modules/Coordinates',
  'modules/GitHub',
  'modules/Stickies',
  'Draggable',
  'TweenLite',
  'hammerjs'
],
function (
  $, _, Backbone, app,
  constants,
  Coordinates,
  GitHub,
  Stickies,
  Draggable,
  TweenLite,
  Hammer
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  Models.Controls = Backbone.Model.extend({
    defaults: {
      scaleValue: 1,
    }
  });

  Models.Preload = Backbone.Model.extend({
    initialize: function (attributes, options) {
      this.options = options || {};
    },
    fetch: function (options) {
      options = options || {};
      var success = options.success || $.noop;
      var error = options.error || $.noop;

      var promise = $.Deferred();

      var path = _.pick(this.options, 'owner', 'repository');
      var coordinates = new Coordinates.Collections.Coordinates(null, path);
      var issues = new GitHub.Collections.Issues(null, path);
      var repo = new GitHub.Models.Repo(null, path);

      Promise.all(
        [coordinates, issues, repo]
          .map(function (collection) {
            return collection.fetch();
          })
      )
      .then(function (data) {
        this.set({
          coordinates: coordinates,
          issues: issues,
          repo: repo,
          owner: this.options.owner,
          repository: this.options.repository
        });
        success(this, data, options);
        promise.resolve(this);
      }.bind(this))
      .catch(function (err) {
        error(this, err, options);
        promise.reject(err);
      });
      return promise;
    }
  });

  Views.Wall = Backbone.View.extend({
    template: 'walls/wall',
    initialize: function (options) {
      this.options.scaleVal = 1;
      this.listenTo(options.stickies, 'add', this._addStickie);
      this.options.controls = new Models.Controls();
      this.listenTo(this.options.controls, 'change', this._scaleGrid);

      // this.listenTo(options.stickies, 'change', this.changeStickie);
      // this.listenTo(options.stickies, 'remove', this.removeStickie);
    },
    beforeRender: function () {
      this.options.stickies.each(function (stickie) {
        this._addStickie(stickie);
      }, this);
    },
    afterRender: function () {
      this.insertView('aside', new Views.Controls({
        model: this.options.controls,
        zoomInput: this.$el,
        zoomTarget: this.$el.find('.zoom')
      })).render();
      this._createDraggableScreen();
    },
    _addStickie: function (stickie) {
      var coordinate = this.options.coordinates
        .findWhere(stickie.pick('number'));
      this.insertView('> .zoom > .stickies', new Stickies.Views.Stickie({
        model: stickie,
        coordinate: coordinate,
        repo: this.options.repo
      }));
    },
    _tweenStickies: function (stickies, duration, x, y) {
      var xDest = this.prevX + x;
      var yDest = this.prevY + y;
      console.log('tween x:%d, y:%d', xDest, yDest);
      TweenLite.to(stickies, duration || 0, {x: xDest, y: yDest});
    },
    _scaleGrid: function () {
      var scaleVal = this.options.controls.get('scaleValue');
      if (scaleVal > 0.25) {
        var scaleMultiplier = 1 / scaleVal;
        var shiftPercent = -((scaleMultiplier - 1) / 2 * 100) + '%';
        TweenLite.to(this.$el.find('.grid'), 0, {
          scale: scaleVal,
          left: shiftPercent,
          top: shiftPercent,
          width: 100 * scaleMultiplier + '%',
          height: 100 * scaleMultiplier + '%'
        });
      }
    },
    prevX: 0,
    prevY: 0,
    _createDraggableScreen: function () {
      var that = this;
      var stickies = this.$el.find('.stickies').get(0);
      Draggable.create(this.$el.find('.draggablescreen'), {
        type: 'x,y',
        dragResistance: 0,
        zIndexBoost: false,
        onDragStart: function () {
          app.trigger('walls.views.wall.pan.start');
        },
        onDrag: function () {
          var scaleMultiplier = 1 / that.options.controls.get('scaleValue');
          var x = this.x * scaleMultiplier;
          var y = this.y * scaleMultiplier;
          that._tweenStickies(stickies, 0, x, y);
        },
        onDragEnd: function () {
          app.trigger('walls.views.wall.pan.end');
          this.target.style.zIndex = 0;
          var scaleMultiplier = 1 / that.options.controls.get('scaleValue');
          that.prevX = that.prevX + (this.x * scaleMultiplier);
          that.prevY = that.prevY + (this.y * scaleMultiplier);
          TweenLite.to(this.target, 0, {x: 0, y: 0});
        }
      });
    }
  });

  Views.Demo = Views.Wall.extend({
    afterRender: function () {
      Views.Wall.prototype.afterRender.apply(this, arguments);
      function delay(ms) {
        return function () {
          return new Promise(function (resolve, reject) {
            setTimeout(resolve, ms);
          });
        };
      }
      _.delay(function loop() {
        this.options.frames.reduce(function (timeline, play) {
          var wait = delay(_.random(1500, 5000));
          return timeline.then(play).then(wait)
            .catch(console.error.bind(console));
        }, Promise.resolve()).then(loop);
      }.bind(this), 1000);
    },
    _getStickies: function (input) {
      function isCollection(obj) {
        return obj instanceof Backbone.Collection;
      }
      function hasModels(list) {
        return list.length > 0 &&
          list[0] instanceof Backbone.Model;
      }
      if (isCollection(input)) {
        return input;
      }
      var list = _.isArray(input) ? input : [input];
      var models = hasModels(list) ? list :
        this.options.stickies.filter(function (stickie) {
          return _.contains(list, stickie.get('number'));
        });
      return new Stickies.Collections.Stickies(models);
    },
    panTo: function (input) {
      this.zoomTo();

      var collection = this._getStickies(input);
      var bounds = collection.bounds();

      var stickies = this.$el.find('.stickies').get(0);
      var viewport = stickies.parentNode.getBoundingClientRect();

      var scaleMultiplier = 1 / this.options.controls.get('scaleValue');

      var x = -(bounds.left + (bounds.right - bounds.left) / 2) +
        (viewport.width * scaleMultiplier) / 2;
      var y = -(bounds.top + (bounds.bottom - bounds.top) / 2) +
        (viewport.height * scaleMultiplier) / 2;

      console.log(
        'w', viewport.width * scaleMultiplier,
        'h', viewport.height * scaleMultiplier
      );
      console.log('number: %d (x:%d, y:%d)', (input.get ? input.get('number') : input.length), x, y);

      this.prevX = 0;
      this.prevY = 0;

      this._tweenStickies(stickies, 0.5, x, y);

      this.prevX = x;
      this.prevY = y;

      return this;
    },
    zoomTo: function (level) {
      var $scale = this.$el.find('.scale');
      $scale.data('prevX', 0);
      $scale.data('prevY', 0);
      $scale.data('prevScale', 1);
      var zoom = parseFloat(level === undefined ? $scale.val() : level, 10);
      console.log(zoom, $scale.val(), level);
      $scale.val(zoom).trigger('input');
      return this;
    },
    drag: function (number, x, y) {
      return this;
    }
  });

  Views.Controls = Backbone.View.extend({
    template: 'walls/controls',
    initialize: function (options) {
      options.lastScale = 1;
      this.options.zoomInput.on('wheel', this.onWheelZoom.bind(this));

      var mc = new Hammer.Manager(this.options.zoomTarget.parent().get(0));
      mc.add(new Hammer.Pinch());
      mc.on('pinchmove', this.onPinch.bind(this));
    },
    serialize: function () {
      return constants.WALL;
    },
    events: {
      'input .scale': 'setScale'
    },
    afterRender: function () {
      this.options.zoomTarget.css('transform-origin', '0 0');
      var $scale = this.$el.find('.scale');
      $scale.data('prevX', 0);
      $scale.data('prevY', 0);
      $scale.data('prevScale', 1);
    },
    cleanup: function () {
      this.options.zoomInput.off('wheel');
    },
    onPinch: function(evt) {
      var $scale = this.$el.find('.scale');
      var minScaleDiff = 0.06;
      $scale.data('mouseX', evt.center.x);
      $scale.data('mouseY', evt.center.y);
      if (evt.scale > (1 + minScaleDiff)) {
        this.zoomInStep();
      } else if (evt.scale < (1 - minScaleDiff)) {
        this.zoomOutStep();
      }
      $scale.removeData('mouseX');
      $scale.removeData('mouseY');
    },
    onWheelZoom: function (event) {
      var evt = event.originalEvent;
      if (evt.button || evt.buttons ||
        evt.altKey || evt.ctrlKey || evt.shiftKey || evt.metaKey
      ) {
        return;
      }
      var $scale = this.$el.find('.scale');
      $scale.data('mouseX', evt.clientX);
      $scale.data('mouseY', evt.clientY);
      if (evt.deltaY < 0) {
        this.zoomInStep();
      } else if (evt.deltaY > 0) {
        this.zoomOutStep();
      }
      $scale.removeData('mouseX');
      $scale.removeData('mouseY');
    },
    zoomInStep: _.throttle(function () {
      var direction = -1;
      this.stepScale(direction);
    }, 300, {trailing: false}),
    zoomOutStep: _.throttle(function () {
      var direction = 1;
      this.stepScale(direction);
    }, 300, {trailing: false}),
    stepScale: function (direction) {
      var $scale = this.$el.find('.scale');
      var value = parseFloat($scale.val(), 10);
      var step = parseFloat($scale.attr('step'), 10) * direction;
      var min = parseFloat($scale.attr('min'), 10);
      var max = parseFloat($scale.attr('max'), 10);
      var capped = Math.min(max, Math.max(min, value + step));
      $scale.val(capped).trigger('change').trigger('input');
    },
    setScale: function (event) {
      var $scale = this.$el.find('.scale');
      var value = $scale.val();
      var curScale = 1 / Math.pow(constants.WALL.ZOOM_FACTOR, value - 1);
      var prevX = $scale.data('prevX') || 0;
      var prevY = $scale.data('prevY') || 0;
      var mouseX = $scale.data('mouseX') || $(document).width() / 2;
      var mouseY = $scale.data('mouseY') || $(document).height() / 2;
      var prevScale = $scale.data('prevScale') || 1;

      var mouseXinPrevScale = (mouseX - prevX) / prevScale;
      var mouseXinCurScale = mouseXinPrevScale * curScale + prevX;
      var newX = prevX + mouseX - mouseXinCurScale;
      var mouseYinPrevScale = (mouseY - prevY) / prevScale;
      var mouseYinCurScale = mouseYinPrevScale * curScale + prevY;
      var newY = prevY + mouseY - mouseYinCurScale;

      console.log('setScale x:%f y:%f scale:%f', newX, newY, curScale);
      TweenLite.to(this.options.zoomTarget, 0, {
        scale: curScale,
        x: newX,
        y: newY
      });
      this.model.set({
        scaleValue: curScale
      });
      $scale.data('prevScale', curScale);
      $scale.data('prevX', newX);
      $scale.data('prevY', newY);
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
