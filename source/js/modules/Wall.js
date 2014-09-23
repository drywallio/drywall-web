define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'modules/Stickies',
  'Draggable',
  'TweenLite'
],
function (
  $, _, Backbone, app,
  constants,
  Stickies,
  Draggable,
  TweenLite
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  Models.Controls = Backbone.Model.extend({
    defaults: {
      scaleValue: 1,
    }
  });

  Views.Draggable = Backbone.View.extend({
    template: 'wall/draggable',
    initialize: function (options) {
      this.options.scaleVal = 1;
      this.listenTo(options.stickies, 'add', this.addStickie);
      this.options.controls = new Models.Controls();
      this.listenTo(this.options.controls, 'change', this.scaleGrid);

      // this.listenTo(options.stickies, 'change', this.changeStickie);
      // this.listenTo(options.stickies, 'remove', this.removeStickie);
    },
    afterRender: function () {
      this.insertView('aside', new Views.Controls({
        model: this.options.controls,
        zoomInput: this.$el,
        zoomTarget: this.$el.find('.zoom')
      })).render();

      this.options.stickies.each(function (stickie) {
        this.addStickie(stickie);
      }, this);
      this.createDraggableScreen();
    },
    addStickie: function (stickie) {
      var coordinate = this.options.coordinates
        .findWhere(stickie.pick('number'));
      this.insertView('> .zoom > .stickies', new Stickies.Views.Stickie({
        model: stickie,
        coordinate: coordinate,
        repo: this.options.repo
      })).render();
    },
    dragStickies: function (options) {
      var that = this;
      return function () {
        $(app.el).addClass('wall-draggable-moving');
        var scaleMultiplier = 1 / options.controls.get('scaleValue');
        var stickies = this.target.parentNode.querySelector('.stickies');
        var xDest = that.prevX + (this.x * scaleMultiplier);
        var yDest = that.prevY + (this.y * scaleMultiplier);
        TweenLite.to(stickies, 0, {
          x: xDest,
          y: yDest
        });
      };
    },
    scaleGrid: function () {
      var scaleVal = this.options.controls.get('scaleValue');
      var scaleMultiplier = 1 / scaleVal;
      var shiftPercent = -((scaleMultiplier - 1) / 2 * 100) + '%';
      TweenLite.to(this.$el.find('.grid'), 0, {
        scale: scaleVal,
        left: shiftPercent,
        top: shiftPercent,
        width: 100 * scaleMultiplier + '%',
        height: 100 * scaleMultiplier + '%'
      });
    },
    prevX: 0,
    prevY: 0,
    createDraggableScreen: function () {
      var that = this;
      Draggable.create(this.$el.find('.draggablescreen'), {
        type: 'x,y',
        dragResistance: 0,
        zIndexBoost: false,
        onDrag: this.dragStickies(this.options),
        onDragEnd: function () {
          $(app.el).removeClass('wall-draggable-moving');
          this.target.style.zIndex = 0;
          var scaleMultiplier = 1 / that.options.controls.get('scaleValue');
          that.prevX = that.prevX + (this.x * scaleMultiplier);
          that.prevY = that.prevY + (this.y * scaleMultiplier);
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
      $scale.val(capped);
      $scale.trigger('change').trigger('input');
    },
    setScale: function (event) {
      var $scale = this.$el.find('.scale');
      var value = $scale.val();
      var curScale = 1 / Math.pow(1 + constants.WALL.ZOOMFACTOR, value - 1);
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
