define([
  'jquery', 'underscore', 'backbone', 'app'
],
function (
  $, _, Backbone, app
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  var ghSync = function (method, model, options) {
    var extendedOptions = _.extend({
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Accept', 'application/vnd.github+json');
        var identities = app.session.get('identities') || [];
        var identity = _(identities).findWhere({connection: 'github'}) || {};
        var access_token = identity.access_token;
        if (access_token) {
          xhr.setRequestHeader('Authorization', 'token ' + access_token);
        }
      },
    }, options);
    if (method === 'read') {
      // Adds query param in GET request
      extendedOptions.data = _.defaults({
        per_page: 100,
      }, extendedOptions.data || {});
    }
    return Backbone.sync(method, model, extendedOptions);
  };
  var ghInitialize = function (models, options) {
    this.options = options || {};
  };

  var ghCollection = Backbone.Collection.extend({
    initialize: ghInitialize,
    sync: ghSync
  });
  var ghModel = Backbone.Model.extend({
    initialize: ghInitialize,
    sync: ghSync
  });

  Models.Repo = ghModel.extend({
    url: function () {
      return 'https://api.github.com/repos/' +
        this.options.owner + '/' +
        this.options.repository;
    }
  });

  Collections.Issues = ghCollection.extend({
    url: function () {
      return 'https://api.github.com/repos/' +
        this.options.owner + '/' +
        this.options.repository +
        '/issues';
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
