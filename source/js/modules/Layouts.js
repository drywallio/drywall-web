define([
  'jquery', 'underscore', 'backbone', 'app',
  'modules/Coordinates',
  'modules/GitHub',
  'modules/Navigation',
  'modules/Wall'
],
function (
  $, _, Backbone, app,
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
        console.warn(err);
        var handler = err.status === 402 ? 'Pricing' : 'Error';
        app.useLayout(Views[handler], {
        }).render();
      });
    }
  });

  Views.Repository = Views.Nav.extend({
    template: 'layouts/repository'
  });

  Views.Landing = Views.NavContent.extend({
    template: 'layouts/landing',
    events: {
      'submit form.signin': 'signin'
    },
    signin: function (event) {
      event.preventDefault();
      this.$el.addClass('working');
      app.session.signIn(_.extend(app.env.auth0.signIn, {
        state: '/cofounders/drywall-web'
      }));
    }
  });

  Views.Pricing = Views.NavContent.extend({
    title: 'Plans & Pricing',
    template: 'layouts/pricing'
  });

  Views.Error = Views.NavContent.extend({
    template: 'layouts/error'
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
