define([
  'jquery', 'underscore', 'backbone', 'app'
],
function (
  $, _, Backbone, app
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  var GitHub = {
    token: '',
    Models: Models,
    Collections: Collections,
    Views: Views
  };

  var ghSync = function () {
    console.log('got it sync!');
    console.log('GitHub sync! token:', GitHub.token);
  };
  var ghInitialize = function (models, options) {
    console.log('GitHub initialize');
    this.options = options || {};
  };

  var ghCollection = Backbone.Collection.extend({
    sync: ghSync,
    initialize: ghInitialize,
    fetch: function () {
      console.log('got it fetch!');
    }
  });
  var ghModel = Backbone.Model.extend({
    sync: ghSync,
    initialize: ghInitialize
  });

  Collections.Issues = ghCollection.extend({
    url: function () {
      return 'https://api.github.com/repos/' +
        this.options.owner + '/' +
        this.options.repository +
        '/issues';
    }
  });

  return GitHub;
});
