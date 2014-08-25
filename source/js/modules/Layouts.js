define([
  'jquery', 'underscore', 'backbone', 'app',
  'modules/Navigation'
],
function (
  $, _, Backbone, app,
  Navigation
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

  Views.Owner = Views.Nav.extend({
    template: 'layouts/owner'
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

  Views['404'] = Views.Base.extend({
    template: 'layouts/404'
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
