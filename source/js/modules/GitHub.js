define([
  'jquery', 'underscore', 'backbone', 'app',
  'libs/api'
],
function (
  $, _, Backbone, app,
  api
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
        per_page: this.options.per_page || 100,
      }, extendedOptions.data || {});
    }
    return Backbone.sync(method, model, extendedOptions);
  };
  var ghInitialize = function (models, options) {
    this.options = options || {};
  };
  var ghApi = api('https://api.github.com');

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
      return ghApi('repos/:owner/:repository', this.options);
    }
  });

  Models.IssueEdit = ghModel.extend({
    url: function () {
      return ghApi('repos/:owner/:repository/issues/:number', this.options);
    },
    isNew: function () {
      return false;
    },
    save: function (key, value, options) {
      var opts = { patch: true };
      var args = [].slice.call(arguments, 0);
      if (args.length === 1) {
        args.push(opts);
      } else if (args.length === 2) {
        if (!key || typeof key === 'object') {
          args[1] = _.defaults(args[1], opts);
        } else {
          args.push(opts);
        }
      } else if (args.length === 3) {
        args[2] = _.defaults(args[2], opts);
      }
      return ghModel.prototype.save.apply(this, args);
    }
  });

  Collections.Issues = ghCollection.extend({
    url: function () {
      return ghApi(
        'repos/:owner/:repository/issues',
        this.options,
        {state: 'all'}
      );
    }
  });

  Collections.OrganisationRepositories = ghCollection.extend({
    url: function () {
      return ghApi('orgs/:org/repos', this.options);
    }
  });

  Collections.UserRepositories = ghCollection.extend({
    url: function () {
      return ghApi('user/:user/repos', this.options);
    }
  });

  Collections.UserOrganisations = ghCollection.extend({
    initialize: function (options) {
      this.options = options || {};
      this.comparator = 'login';
    },
    url: function () {
      return ghApi('user/orgs' , this.options);
    },
    addUser: function () {
      return this.add(new this.model({
        isUser: true,
        login: this.options.user
      }));
    }
  });

  Collections.SearchUsers = ghCollection.extend({
    initialize: function (models, options) {
      this.options = options || {};
      this.options.per_page = 7;
      this.comparator = 'login';
    },
    set: function (response, options) {
      return Backbone.Collection.prototype.set.call(
        this, response.items, options);
    },
    url: function () {
      return ghApi(
        'search/users?q=:query+in:login+repos:>1',
        this.options
      );
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
