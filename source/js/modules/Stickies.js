define([
  'jquery', 'underscore', 'backbone',
  'constants',
  'Draggable',
  'modules/GitHub',
  'modules/References'
],
function (
  $, _, Backbone,
  constants,
  Draggable,
  GitHub,
  References
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  var stickieWidth = constants.STICKIE.WIDTH;
  var stickieHeight = constants.STICKIE.HEIGHT;
  var stickieColour = constants.STICKIE.COLOUR;

  var tileWidth = constants.TILE.WIDTH;
  var tileHeight = constants.TILE.HEIGHT;

  Models.Stickies = Backbone.Model.extend({
  });

  Collections.Stickies = Backbone.Collection.extend({
    model: Models.Stickies,
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
      this.listenTo(this.model, 'change:title', this._setTitle);
      this.listenTo(this.model, 'change:labels', this._setColor);
    },
    serialize: function () {
      return this.model.pick('x', 'y', 'title');
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
      }
    },
    _setColor: function () {
      var labels = this.model.get('labels') || [];
      var first = _.find(labels, function (label) { return !!label.color; });
      var color = first ? '#' + first.color : stickieColour;
      this.$el.css('background-color', color);
    },
    _setTitle: function () {
      if (!this.edit) {
        this.$el.find('.title').text(this.model.get('title'));
      }
    },
    _saveEdit: function () {
      var that = this;
      var textarea = this.$el.find('textarea');
      var title = textarea.val().trim();
      if (title !== this.model.get('title')) {
        textarea.attr('readonly', true);
        new GitHub.Models.IssueEdit(null, this.model.attributes)
          .save('title', title)
          .then(function () {
            that.model.set('title', title);
          })
          .always(function () {
            this._cancelEdit();
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
      var tagName = this.edit ? 'textarea' : 'div';
      if (title.prop('tagName').toLowerCase() !== tagName) {
        var element = $(document.createElement(tagName))
          .addClass('title')
          .text(this.model.get('title'));
        title.replaceWith(element);
      }
    },
    afterRender: function () {
      var that = this;
      // /*
      //   Glitch: Scrolling when focus on input that is translateX'd off-screen
      //   Possibly related bug: Chromium issue 231600
      // */
      // this.$el.find('textarea').get().forEach(function (element) {
      //   element.focus();
      //   var end = element.value.length;
      //   element.setSelectionRange(end, end);
      // });
      this._setColor();
      this.insertView('', new References.Views.References({
        model: this.model,
        collection: new References.Collections.References(null, {
          stickie: this.model
        })
      })).render();
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
          onDrag: function () {
            var position = {
              x: this.x,
              y: this.y
            };
            that.model.set(position);
            if (that.edit) {
              that._cancelEdit();
            }
          },
          onClick: function (event) {
            if (!that.edit) {
              that.edit = true;
              that._setEdit();
            }
          },
          onDragEnd: function () {
            that.options.coordinate.save(
              that.model.pick('x', 'y')
            );
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
