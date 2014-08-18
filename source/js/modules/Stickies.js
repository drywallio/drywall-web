define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants'
],
function (
  $, _, Backbone, app,
  constants
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  var stickieWidth = constants.STICKIE.WIDTH;
  var stickieHeight = constants.STICKIE.HEIGHT;

  Models.Stickie = Backbone.Model.extend({
    url: function () {
      return app.api('stickies/:id', this);
    }
  });

  Collections.Stickies = Backbone.Collection.extend({
    model: Models.Stickie,
    initialize: function (models, options) {
      this.options = options || {};
    },
    url: function () {
      return app.api('stickies/', null, _.pick(
        this.options,
        'repository',
        'owner'
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

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
