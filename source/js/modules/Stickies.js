define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'Draggable',
  'tinycolor',
  'modules/GitHub',
  'modules/References'
],
function (
  $, _, Backbone, app,
  constants,
  Draggable,
  tinycolor,
  GitHub,
  References
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  var stickieWidth = constants.STICKIE.WIDTH;
  var stickieHeight = constants.STICKIE.HEIGHT;

  var tileWidth = constants.TILE.WIDTH;
  var tileHeight = constants.TILE.HEIGHT;

  Collections.Boundaries = Backbone.Collection.extend({
    bounds: function (models) {
      var coordinates = models || this;
      var x = coordinates.map(function (coordinate) {
        return coordinate.get('x');
      });
      var y = coordinates.map(function (coordinate) {
        return coordinate.get('y');
      });
      x = _.isEmpty(x) ? [0] : x;
      y = _.isEmpty(y) ? [0] : y;

      var box = {
        left: _.min(x),
        right: _.max(x) + stickieWidth,
        top: _.min(y),
        bottom: _.max(y) + stickieHeight
      };

      return _.extend({
        width: box.right - box.left,
        height: box.bottom - box.top
      }, box);
    }
  });

  Collections.Stickies = Collections.Boundaries.extend({
    initialize: function (models, options) {
      this.options = options || {};
      this.options.untouchedBounds = this._untouchedBounds();
      options.issues.each(this._layoutStickie, this);
      this.listenTo(options.issues, 'add', this._layoutStickie);
    },
    _layoutStickie: function (issue) {
      var match = issue.pick('number');
      var coordinate = this.options.coordinates.findWhere(match);

      if (!coordinate) {
        coordinate = new this.options.coordinates.model(
          this._randomCoordinates(issue)
        );
        this.options.coordinates.add(coordinate);
      }
      this._addStickie(issue, coordinate);
    },
    _randomCoordinates: function (issue) {
      var bounds = this.options.untouchedBounds;
      var startY = bounds.top;
      var x = this._getRandomNum(bounds.left, bounds.left + bounds.width);
      if (x < bounds.left + bounds.width * 0.5) {
        startY = bounds.top + bounds.height * 0.5;
      }
      var y = this._getRandomNum(startY, bounds.top + bounds.height);
      bounds.maxX = Math.max(x, bounds.maxX);
      bounds.maxY = Math.max(y, bounds.maxY);
      bounds.width =  bounds.maxX - bounds.left + stickieWidth;
      bounds.height = bounds.maxY - bounds.top + stickieHeight / 2;

      return {
        number: issue.get('number'),
        x: x,
        y: y
      };
    },
    _getRandomNum: function (min, max) {
      return Math.random() * (max - min) + min;
    },
    _addStickie: function(issue, coordinate) {
      var data = _.extend(issue.toJSON(), coordinate.toJSON());
      var stickie = new this.model(data);
      this.add(stickie);
    },
    _untouchedBounds: function () {
      var top = 0;
      var left = 0;

      if (this.options.coordinates.length > 0) {
        var bounds = this.bounds(this.options.coordinates);
        top = bounds.bottom + stickieHeight;
        left = bounds.left;
      }

      return {
        top: top,
        left: left,
        width: 0,
        height: 0,
        maxX: 0,
        maxY: 0
      };
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
    template: 'stickies/stickie',
    initialize: function (options) {
      this.listenTo(this.model, 'change:title', this._setTitle);
      this.listenTo(this.model, 'change:labels', this._setColor);
      this.listenTo(app, 'konami', this._konami);
    },
    serialize: function () {
      var json = _.extend(
        this.model.toJSON(),
        _.pick(this.model.collection.options, 'owner', 'repository')
      );
      if (json.labels) {
        json.labels.forEach(function (label) {
          label.fgColor = tinycolor.mostReadable(
            label.color, constants.STICKIE.FOREGROUND_COLOR
          ).toHexString();
        });
      }
      return json;
    },
    edit: false,
    events: {
      'blur textarea': '_saveEdit',
      'keydown textarea': function (event) {
        var KEY = constants.KEY;
        switch (event.keyCode) {
          case KEY.RETURN:
            this._saveEdit();
            break;
          case KEY.ESC:
            this._cancelEdit();
            break;
        }
      },
      'change .state > input': function (event) {
        var that = this;
        var toggle = this.$el.find('.state > input').is(':checked');
        var state = toggle ? 'closed' : 'open';
        new GitHub.Models.IssueEdit(null, this.model.attributes)
          .save('state', state)
          .done(function () {
            that.model.set('state', state);
            that.$el.find('.state > input').prop('checked', toggle);
          });
      },
      'dblclick .title': function (event) {
        var permissions = this.options.repo.get('permissions') || {};
        if (permissions.push) {
          this.edit = true;
          this._setEdit();
        }
      },
      'touchstart': function (event) {
        var clonedEvent = _.clone(event.originalEvent);
        this.touchDelay = setTimeout(function () {
          this.$el.addClass('touch-hold');
          this.draggable.enable();
          this.draggable.startDrag(clonedEvent);
        }.bind(this), 500);
      },
      'touchend': function (event) {
        this.$el.removeClass('touch-hold');
        clearTimeout(this.touchDelay);
        this.draggable.disable();
      }
    },
    _setColor: function () {
      var labels = this.model.get('labels') || [];
      var first = _.find(labels, function (label) { return !!label.color; });
      var bgColor = first ? '#' + first.color :
        constants.STICKIE.BACKGROUND_COLOR;
      var fgColor = tinycolor.mostReadable(
        bgColor, constants.STICKIE.FOREGROUND_COLOR
      ).toHexString();
      this.$el.find('.card').css({
        'background-color': bgColor,
        color: fgColor
      });
    },
    _setTitle: function () {
      this.$el.find('.title').text(this.model.get('title'));
    },
    _saveEdit: function () {
      var that = this;
      var textarea = this.$el.find('textarea');
      var title = textarea.val().trim();
      if (title !== this.model.get('title')) {
        textarea.attr('readonly', true);
        new GitHub.Models.IssueEdit(null, this.model.attributes)
          .save('title', title)
          .done(function () {
            that.model.set('title', title);
          })
          .always(function () {
            that._cancelEdit();
            textarea.attr('readonly', false);
          });
      } else {
        this._cancelEdit();
      }
    },
    _cancelEdit: function () {
      if (this.edit) {
        this.edit = false;
        this._setEdit();
      }
    },
    _setEdit: function () {
      var title = this.$el.find('.title');
      var isEdit = this.edit === true;
      var textarea = title.filter('textarea');
      textarea.toggleClass('hidden', !isEdit);
      title.filter('div').toggleClass('hidden', isEdit);
      textarea.focus();
    },
    _konami: function () {
      this.$el.removeClass('konami');
      _.delay(function () {
        this.$el.addClass('konami');
      }.bind(this), _.random(0, 10000));
    },
    afterRender: function () {
      var that = this;

      if (constants.WALL.ENABLE_REFERENCES) {
        this.references = new References.Views.Anchor({
          el: this.$el[0],
          model: this.model,
          collection: new References.Collections.References(null, {
            stickie: this.model
          })
        }).render();
      }

      this._setColor();

      this.$el.css({
        transform: 'translate3d(' +
          this.model.get('x') + 'px, ' +
          this.model.get('y') + 'px, ' +
          '0px' +
        ')'
      });

      var permissions = this.options.repo.get('permissions') || {};
      this.draggable = new Draggable(this.$el, {
        type: 'x,y',
        maxDuration: 0.5,
        edgeResistance: 0.75,
        throwProps: true,
        snap: {
          x: snapX,
          y: snapY
        },
        onDrag: function () {
          if (permissions.push) {
            that.model.set({
              x: this.x,
              y: this.y
            });
          }
        },
        onDragEnd: function () {
          if (permissions.push) {
            that.options.coordinate.save(
              that.model.pick('x', 'y')
            );
          }
        }
      });
      if ('ontouchstart' in document.documentElement) {
        this.draggable.disable();
      }
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
