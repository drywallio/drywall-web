define([
  'jquery', 'underscore', 'backbone',
  'constants'
],
function (
  $, _, Backbone,
  constants
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  var throttleAnimation = function (func) {
    function done() {
      if (ctx) {
        func.apply(ctx, args);
        ctx = undefined;
        args = undefined;
      }
      pending = false;
    }
    var ctx, args, pending;
    return function() {
      if (pending) {
        ctx = this;
        args = arguments;
      } else {
        func.apply(this, arguments);
        pending = requestAnimationFrame(done);
      }
    };
  };

  Models.Reference = Backbone.Model.extend({
  });

  Collections.References = Backbone.Collection.extend({
    initialize: function (models, options) {
      this.options = options || {};
      this.listenTo(
        options.stickie,
        'change:title change:body',
        this._setReferences
      );
      this._setReferences();
    },
    _setReferences: function () {
      var pattern = /#(\d+)/g;
      var stickie = this.options.stickie;
      var body = stickie.get('body') || '';
      var title = stickie.get('title') || '';
      var ownNumber = stickie.get('number');
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
      var issues = references.map(function (reference) {
        return stickie.collection.findWhere({
          number: reference
        });
      });
      this.reset(issues);
    }
  });

  Views.References = Backbone.View.extend({
    template: 'references/references',
    initialize: function (options) {
      this.listenTo(this.model, 'change:x change:y',
        throttleAnimation(this._setCoordinates)
      );
      this.listenTo(this.collection, 'add', this._addReference);
      this.listenTo(this.collection, 'remove', this._removeReference);
    },
    _addReference: function () {
      console.error('TODO _addReference does not exist');
    },
    _removeReference: function () {
      console.error('TODO _removeReference does not exist');
    },
    afterRender: function () {
      this._setCoordinates();
      var svgns = 'http://www.w3.org/2000/svg';
      var references = this.collection;
      references.forEach(function (reference) {
        var line = document.createElementNS(svgns, 'svg');
        this.$el.append(line);
        this.insertView(new Views.Reference({
          el: line,
          source: this.model,
          target: reference
        })).render();
      }, this);
    },
    _setCoordinates: function () {
      this.$el.css({
        left: - this.model.get('x') + constants.STICKIE.WIDTH / 2,
        top: - this.model.get('y') + constants.STICKIE.HEIGHT / 2
      });
    }
  });

  Views.Reference = Backbone.View.extend({
    template: 'references/reference',
    initialize: function (options) {
      var _setCoordinates = throttleAnimation(this._setCoordinates);
      this.listenTo(options.source, 'change:x change:y', _setCoordinates);
      this.listenTo(options.target, 'change:x change:y', _setCoordinates);
    },
    beforeRender: function () {
    },
    serialize: function () {
      return {
        number: this.options.target.get('number')
      };
    },
    afterRender: function () {
      // Hack
      var line = this.$el.find('line');
      this.$el.replaceWith(line);
      this.$el = line;

      this._setCoordinates();
    },
    _setCoordinates: function _setCoordinates() {
      var x1 = this.options.source.get('x');
      var y1 = this.options.source.get('y');
      this.$el[0].setAttribute('x1', x1);
      this.$el[0].setAttribute('y1', y1);

      var x2 = this.options.target.get('x');
      var y2 = this.options.target.get('y');
      this.$el[0].setAttribute('x2', x2);
      this.$el[0].setAttribute('y2', y2);
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
