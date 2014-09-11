define([
  'jquery', 'underscore', 'backbone', 'app',
  'modules/Billing',
  'modules/Coordinates',
  'modules/GitHub',
  'modules/Navigation',
  'modules/Wall'
],
function (
  $, _, Backbone, app,
  Billing,
  Coordinates,
  GitHub,
  Navigation,
  Wall
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  Views.Base = Backbone.View.extend({
    initialize: function (options) {
      window.scrollTo(0, 0);
    }
  });

  Views.Nav = Views.Base.extend({
    beforeRender: function (options) {
      this.setViews({
        '> .main > header': [
          new Navigation.Views.Toggle(),
          new Navigation.Views.Account()
        ],
        '> aside': new Navigation.Views.Primary()
      });
    }
  });

  Views.Content = Views.Nav.extend({
    beforeRender: function (options) {
      Views.Nav.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        '> .main > footer': new Navigation.Views.Legalese()
      });
    }
  });

  Views.Preload = Views.Base.extend({
    template: 'layouts/preload',
    initialize: function (options) {
      Views.Base.prototype.initialize.apply(this, arguments);
      var path = {
        owner: this.options.owner,
        repository: this.options.repository
      };
      var coordinates = new Coordinates.Collections.Coordinates(null, path);
      var issues = new GitHub.Collections.Issues(null, path);
      var repo = new GitHub.Models.Repo(null, path);
      Promise.all(
        [coordinates, issues, repo]
          .map(function (collection) {
            return collection.fetch();
          })
      )
      .then(function (data) {
        app.useLayout(Views.Repository, {
          coordinates: coordinates,
          issues: issues,
          repo: repo,
          owner: this.options.owner,
          repository: this.options.repository
        }).render();
      }.bind(this))
      .catch(function (err) {
        app.useLayout(Views.Error, {
          error: err
        }).render();
      });
    }
  });

  Views.Repository = Views.Nav.extend({
    template: 'layouts/repository',
    beforeRender: function () {
      Views.Nav.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        '> .main > .viewport': new Wall.Views.Draggable({
          coordinates: this.options.coordinates,
          issues: this.options.issues,
          repo: this.options.repo,
          stickies: new Wall.Collections.Stickies(null, _.pick(
            this.options,
            'coordinates', 'issues', 'repo', 'owner', 'repository'
          ))
        })
      });
    }
  });

  Views.Landing = Views.Content.extend({
    template: 'layouts/landing',
    beforeRender: function () {
      Views.Content.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        '> .main > article .sign-in': new Navigation.Views.SignIn()
      });
    }
  });

  Views.Pricing = Views.Content.extend({
    title: 'Plans & Pricing',
    template: 'layouts/pricing'
  });

  Views.Error = Views.Content.extend({
    template: 'layouts/error',
    initialize: function (options) {
      Views.Content.prototype.initialize.apply(this, arguments);
    },
    serialize: function () {
      var error = this.options.error;
      var code = error.status;
      return {
        showSignIn: !app.session.has('id_token'),
        showPricing: code === 402,
        code: code,
        title: error.message || (
          code === 402 ? 'Plan Upgrade Needed' :
          code === 404 ? 'Wall not Found' :
          'Oops!')
      };
    },
    beforeRender: function () {
      Views.Content.prototype.beforeRender.apply(this, arguments);
      if (!app.session.has('id_token')) {
        this.setViews({
          '> .main > article .sign-in': new Navigation.Views.SignIn()
        });
      }
      if (this.options.error.status === 402) {
        var owner = Backbone.history.fragment.substr(
          0, Backbone.history.fragment.indexOf('/')
        );
        var owners = new Billing.Collections.Billings();
        this.setViews({
          '> .main > article .pricing': new Billing.Views.Plans({
            returnPath: Backbone.history.fragment,
            owner: owner,
            owners: owners
          })
        });
        owners.fetch();
      }
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
