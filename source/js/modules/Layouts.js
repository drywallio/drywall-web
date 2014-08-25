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

  Views.Preload = Views.Nav.extend({
    template: 'layouts/preload',
    initialize: function (options) {
      Views.Nav.prototype.initialize.apply(this, arguments);
      var path = {
        owner: this.options.owner,
        repository: this.options.repository
      };
      this.coordinates = new Coordinates.Collections.Coordinates(null, path);
      this.issues = new GitHub.Collections.Issues(null, path);
      this.repo = new GitHub.Models.Repo(null, path);
      Promise.all([
        this.coordinates.fetch(),
        this.issues.fetch(),
        this.repo.fetch()
      ])
      .then(function () {
        app.useLayout(Views.Repository, {
        }).setViews({
          'article .void': new Wall.Views.Draggable({
            coordinates: this.coordinates,
            issues: this.issues,
            repo: this.repo,
            stickies: new Wall.Collections.Stickies(null, {
              coordinates: this.coordinates,
              issues: this.issues,
              repo: this.repo,
              owner: this.options.owner,
              repository: this.options.repository
            })
          })
        }).render();
      }.bind(this))
      .catch(function (err) {
        var handler = err.status === 402 ? 'Pricing' : 'Error';
        app.useLayout(Views[handler], {
        }).render();
      });
    }
  });

  Views.Repository = Views.Nav.extend({
    template: 'layouts/repository'
  });

  Views.Landing = Views.Base.extend({
    template: 'layouts/landing',
    events: {
      'submit form.signin': 'signin'
    },
    signin: function (event) {
      event.preventDefault();
      this.$el.addClass('working');
      app.session.signIn({
        connection: 'github',
        connection_scope: app.env.auth0.scopes,
        state: '/cofounders/drywall-web'
      });
    }
  });

  Views.Pricing = Views.Nav.extend({
    template: 'layouts/pricing'
  });

  Views.Error = Views.Nav.extend({
    template: 'layouts/error'
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
