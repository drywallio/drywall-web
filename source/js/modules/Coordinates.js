define([
  'jquery', 'underscore', 'backbone', 'app'
],
function (
  $, _, Backbone, app
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  Collections.Coordinates = Backbone.Collection.extend({
    initialize: function (models, options) {
      this.options = options || {};
    },
    url: function () {
      return app.api(
        ':owner/:repository/coordinates',
        _.pick(this.options, 'owner', 'repository')
      );
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
