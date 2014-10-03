define([
  'jquery', 'underscore', 'backbone', 'app',
  'backbone.localstorage',
  'constants',
  'modules/GitHub'
],
function (
  $, _, Backbone, app,
  BackboneLocalStorage,
  constants,
  GitHub
) {

  var Models = {};
  var Collections = {};
  var Views = {};

  Models.LastVisitedWall = Backbone.Model.extend({
    idAttribute: 'wallId'
  });

  Collections.LastVisitedWalls = Backbone.Collection.extend({
    model: Models.LastVisitedWall,
    initialize: function (models, options) {
      this.options = options || {};
      this.options.maxWalls = this.options.maxWalls || 3;
      this.on('add', this._restrictSize);
    },
    localStorage: new BackboneLocalStorage('Drywall-lastVisitedWalls'),
    comparator: function (model) {
      return -model.get('timestamp');
    },
    _restrictSize: function (model) {
      if (this.length > this.options.maxWalls) {
        this.pop(model);
      }
    },
    _removeLast: function () {
      this.at(this.length - 1).destroy();
    }
  });

  Views.Navigator = Backbone.View.extend({
    template: 'gotowall/navigator',
    initialize: function (options) {
      this.options = options || {};

      this.options.LastVisitedWalls =
        new Collections.LastVisitedWalls();
      this.options.OrganizationRepositories =
        new GitHub.Collections.OrganizationRepositories();
      this.options.UserRepositories =
        new GitHub.Collections.UserRepositories();
      this.options.UserOrganizations =
        new GitHub.Collections.UserOrganizations(null, {
          user: app.session.get('nickname')
        });
      this.options.SearchUsers =
        new GitHub.Collections.SearchUsers();

      this.listenTo(this.options.OrganizationRepositories,
        'sync reset', this._updateRepositories);
      this.listenTo(this.options.UserRepositories,
        'sync reset', this._updateRepositories);
      this.listenTo(this.options.UserOrganizations,
        'sync reset', this._updateOwners);
      this.listenTo(this.options.SearchUsers,
        'sync reset', this._updateOwners);

      this.listenTo(app.session, 'change:id_token',
        this._getUserOrganizations);

      this._getUserOrganizations();
      this.options.LastVisitedWalls.fetch();
    },
    serialize: function () {
      return {
        host: location.host,
        lastVisitedWalls: this.options.LastVisitedWalls.toJSON()
      };
    },
    events: {
      'submit': '_showMyWall',
      'input .owner': '_findOwners',
      'focus .repository': '_getRepositories'
    },
    _getUserOrganizations: function () {
      if (app.session.has('id_token')) {
        this.options.UserOrganizations.fetch();
      } else {
        this.options.UserOrganizations.reset();
      }
    },
    _getOwner: function () {
      var owner = this.$el.find('.owner input').val().trim();
      return owner;
    },
    _getRepository: function () {
      var repo = this.$el.find('.repository input').val().trim();
      return repo;
    },
    _showMyWall: function (event) {
      event.preventDefault();
      var owner = this._getOwner();
      var repo = this._getRepository();
      if (owner && repo) {
        app.router.navigate(owner + '/' + repo, {trigger: true});
      }
    },
    _findOwners: _.throttle(function (event) {
      var query = $(event.target).val().trim();
      this.options.SearchUsers.options.query = query;
      if (query) {
        this.options.SearchUsers.fetch();
      } else {
        this.options.SearchUsers.reset();
      }
    }, 200, {leading: true, trailing: true}),
    _updateOwners: function () {
      var datalist = this.$el.find('.owner datalist').empty();
      var user = app.session.has('id_token') ?
        [new Backbone.Model({
          login: app.session.get('nickname')
        })] : [];
      this._addDatalistGroup(
        datalist,
        _.union(user, this.options.UserOrganizations.models),
        'My Organizations'
      );
      this._addDatalistGroup(
        datalist,
        this.options.SearchUsers.reject(function (model) {
          return this.options.UserOrganizations.findWhere({
            login: model.get('login')
          });
        }, this),
        'Search Results'
      );
    },
    _getRepositories: function (event) {
      var owner = this._getOwner();
      var isOwner = {login: owner};
      var inUserOrganizations =
        this.options.UserOrganizations.findWhere(isOwner);
      var inSearchUsers = this.options.SearchUsers.findWhere(isOwner);
      var isOrganization = inUserOrganizations ||
        (inSearchUsers && inSearchUsers.get('type') === 'Organization');
      var collection;
      if (isOrganization) {
        collection = this.options.OrganizationRepositories;
        collection.options.org = owner;
      } else {
        collection = this.options.UserRepositories;
        collection.options.user = owner;
      }
      if (owner) {
        collection.fetch();
      } else {
        collection.reset();
      }
    },
    _updateRepositories: function (collection) {
      var datalist = this.$el.find('.repository datalist').empty();
      this._addDatalistGroup(datalist, collection.models);
    },
    _addDatalistGroup: function (datalist, collection, title) {
      if (collection.length) {
        var optgroup;
        if (title) {
          optgroup = document.createElement('optgroup');
          optgroup.setAttribute('label', title);
        }
        var parent = title ? optgroup : datalist.get(0);
        _.forEach(collection, this._addDatalistOption, parent);
        if (title) {
          datalist.append(optgroup);
        }
      }
    },
    _addDatalistOption: function (model) {
      var option = document.createElement('option');
      var value = model.has('login') ? model.get('login') :
        model.has('name') ? model.get('name') :
        '';
      option.value = value;
      option.textContent = value;
      this.appendChild(option);
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
