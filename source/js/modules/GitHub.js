define([
  'jquery', 'underscore', 'backbone', 'app',
  'libs/api',
  'backbone.paginator'
],
function (
  $, _, Backbone, app,
  api,
  PageableCollection
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

  Collections.Issues = PageableCollection.extend({
    sync: ghSync,
    initialize: function (models, options) {
      this.options = options || {};
      this.options.promise = $.Deferred();
      this.options.continueLoading = true;
      this.on('sync', this._addNextPage);
      this.listenTo(app.router, 'route', this._stopLoading);
    },
    fetch: function (options) {
      PageableCollection.prototype.fetch.apply(this, arguments);
      return this.options.promise;
    },
    url: function () {
      return ghApi(
        'repos/:owner/:repository/issues',
        this.options,
        {state: 'all'}
      );
    },
    state: {
      pageSize: 100
    },
    _addNextPage: function (collection, models) {
      if (models.length < this.state.pageSize) {
        this.options.promise.resolve(collection);
      } else if (models.length === this.state.pageSize &&
                this.options.continueLoading) {
        this.getNextPage({remove: false});
      }
    },
    _stopLoading: function (e, pathArray) {
      var urlPath = pathArray.join('');
      var wallPath = this.options.owner + this.options.repository;
      if (urlPath !== wallPath) {
        this.options.continueLoading = false;
      }
    },
    comparator: 'number'
  });

  Collections.Labels = ghCollection.extend({
    url: function () {
      return ghApi('repos/:owner/:repository/labels', this.options);
    }
  });

  Collections.OrganizationRepositories = ghCollection.extend({
    url: function () {
      return ghApi('orgs/:org/repos', _.defaults(this.options, {
        type: 'all'
      }));
    }
  });

  Collections.UserRepositories = ghCollection.extend({
    url: function () {
      return ghApi('users/:user/repos', _.defaults(this.options, {
        type: 'owner'
      }));
    }
  });

  Collections.UserOrganizations = ghCollection.extend({
    comparator: function (model) {
      return model.get('login').toLowerCase();
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
    },
    comparator: function (model) {
      return model.get('login').toLowerCase();
    },
    parse: function (response) {
      return response.items;
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
