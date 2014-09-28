define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'modules/GitHub',
],
function (
  $, _, Backbone, app,
  constants,
  GitHub
) {

  var Models = {};
  var Collections = {};
  var Views = {};

  Views.Navigator = Backbone.View.extend({
    template: 'gotowall/navigator',
    initialize: function (options) {
      this.options = options || {};

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
    },
    serialize: function () {
      return {
        host: location.host
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
      this._addDatalistGroup(
        datalist,
        this.options.UserOrganizations.models,
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
      option.value = model.has('login') ? model.get('login') :
        model.has('name') ? model.get('name') :
        '';
      option.textContent = model.get('login');
      this.appendChild(option);
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
