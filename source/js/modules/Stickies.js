define([
  'jquery', 'underscore', 'backbone',
  'constants',
  'Draggable',
  'modules/GitHub'
],
function (
  $, _, Backbone,
  constants,
  Draggable,
  GitHub
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
    getReferences: function () {
      var pattern = /#(\d+)/g;
      var body = this.get('body') || '';
      var title = this.get('title') || '';
      var ownNumber = parseInt(this.get('number'), 10);
      var matches = _.chain().union(
        body.match(pattern),
        title.match(pattern)
      ).compact().value();
      var references = _.chain(matches).map(function (match) {
        pattern.lastIndex = 0;
        var submatches = pattern.exec(match);
        var digits = submatches[1];
        return parseInt(digits, 10);
      }).without(ownNumber).value();
      return references;
    }
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
      this.listenTo(this.model, 'change:title', function () {
        this.$el.find('.title').text(this.model.get('title'));
      });
    },
    serialize: function () {
      var labels = this.model.get('labels') || [];
      var first = _.find(labels, function (label) { return !!label.color; });
      var color = first ? '#' + first.color : stickieColour;
      return _.extend(this.model.pick('x', 'y', 'title'), {
        color: color,
        edit: this.edit
      });
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
    _saveEdit: function () {
      var that = this;
      var textarea = this.$el.find('textarea');
      var title = textarea.val().trim();
      if (title !== this.model.get('title')) {
        textarea.attr('readonly', true);
        new GitHub.Models.IssueEdit(null, this.model.attributes)
          .save('title', title)
          .then(function () {
            that.edit = false;
            that.model.set('title', title);
          })
          .fail(function () {
            this._cancelEdit();
          });
      } else {
        this._cancelEdit();
      }
    },
    _cancelEdit: function () {
      if (this.edit) {
        this.edit = false;
        this.render();
      }
    },
    // _drawReferences: function (dragX, dragY) {
    //   var references = this.model.getReferences();
    //   if (references.length === 0) {
    //     return;
    //   }
    //   var svgns = 'http://www.w3.org/2000/svg';
    //   var x = dragX === undefined ?
    //     this.model.get('x') : dragX;
    //   var y = dragY === undefined ?
    //     this.model.get('y') : dragY;
    //   var svg = this.$el[0].querySelector('svg');
    //   if (svg) {
    //     console.log('detaching svg');
    //     $(svg).detach();
    //   } else {
    //     console.log('creating svg');
    //     svg = document.createElementNS(svgns, 'svg');
    //     svg.setAttribute('width', 1);
    //     svg.setAttribute('height', 1);
    //     svg.setAttribute('viewBox', '0 0 1 1');
    //   }
    //   svg.style.left = -x + stickieWidth / 2;
    //   svg.style.top = -y + stickieHeight / 2;
    //   references.forEach(function (reference) {
    //     var coordinates = this.options.coordinate.collection
    //       .findWhere({ number: reference });
    //     var line = document.createElementNS(svgns, 'line');
    //     line.setAttribute('x1', x);
    //     line.setAttribute('y1', y);
    //     line.setAttribute('x2', coordinates.get('x'));
    //     line.setAttribute('y2', coordinates.get('y'));
    //     line.setAttribute('data-number', reference);
    //     line.style.stroke = 'black';
    //     line.style.strokeWidth = 5;
    //     svg.appendChild(line);
    //   }, this);
    //   $(svg).appendTo(this.$el);
    // },
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
      this.insertView(new Views.References({
        model: this.model,
        coordinate: this.options.coordinate
      })).render();
      // this._drawReferences();
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
          },
          onClick: function (event) {
            if (!that.edit) {
              that.edit = true;
              that.render();
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

  Views.References = Backbone.View.extend({
    template: 'stickies/references',
    initialize: function (options) {
      this.listenTo(this.model, 'change:title change:body change:x change:y', function () {
        console.log('render', arguments);
        this.render();
      });
    },
    serialize: function () {
      var references = this.model.getReferences();
      var x = parseInt(this.model.get('x'), 10);
      var y = parseInt(this.model.get('y'), 10);
      return {
        left: -x + stickieWidth / 2,
        top: -y + stickieHeight / 2,
        references: references.map(function (reference) {
          var coordinates = this.options.coordinate.collection
            .findWhere({ number: reference });
          return {
            x1: x,
            y1: y,
            x2: coordinates.get('x'),
            y2: coordinates.get('y'),
            number: reference
          };
        }, this)
      };
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
