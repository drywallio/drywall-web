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
        'header': new Navigation.Views.Primary()
      });
    }
  });

  Views.NavContent = Views.Nav.extend({
    beforeRender: function (options) {
      Views.Nav.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        'footer': new Navigation.Views.Legalese()
      });
    }
  });

  Views.Preload = Views.Nav.extend({
    template: 'layouts/preload',
    initialize: function (options) {
      Views.Nav.prototype.initialize.apply(this, arguments);
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
        }).setViews({
          'article': new Wall.Views.Draggable({
            coordinates: coordinates,
            issues: issues,
            repo: repo,
            stickies: new Wall.Collections.Stickies(null, {
              coordinates: coordinates,
              issues: issues,
              repo: repo,
              owner: this.options.owner,
              repository: this.options.repository
            })
          })
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
    template: 'layouts/repository'
  });

  Views.Landing = Views.NavContent.extend({
    template: 'layouts/landing',
    beforeRender: function () {
      Views.NavContent.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        '.sign-in': new Navigation.Views.SignIn()
      });
    }
  });

  Views.Pricing = Views.NavContent.extend({
    title: 'Plans & Pricing',
    template: 'layouts/pricing'
  });

  Views.Error = Views.NavContent.extend({
    template: 'layouts/error',
    initialize: function (options) {
      Views.NavContent.prototype.initialize.apply(this, arguments);
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
      Views.NavContent.prototype.beforeRender.apply(this, arguments);
      if (!app.session.has('id_token')) {
        this.setViews({
          '.sign-in': new Navigation.Views.SignIn()
        });
      }
      if (this.options.error.status === 402) {
        var owner = Backbone.history.fragment.substr(
          0, Backbone.history.fragment.indexOf('/')
        );
        var owners = new Billing.Collections.Billings();
        this.setViews({
          '.pricing': new Billing.Views.Plans({
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
