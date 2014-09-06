define(['jquery', 'underscore', 'backbone', 'app'
], function ($, _, Backbone, app) {
  var Models = {};
  var Collections = {};
  var Views = {};

  Views.SignIn = Backbone.View.extend({
    template: 'navigation/sign-in',
    events: {
      'submit': 'signIn'
    },
    signIn: function (event) {
      event.preventDefault();
      app.session.signIn(_.extend(app.env.auth0.signIn, {
        state: '/cofounders/drywall-web'
      }));
    }
  });

  Views.Primary = Backbone.View.extend({
    template: 'navigation/primary'
  });

  Views.Account = Backbone.View.extend({
    template: 'navigation/account',
    initialize: function () {
      this.listenTo(app.session, 'change', this.render);
    },
    serialize: function () {
      return app.session.toJSON();
    },
    events: {
      'click .signout': function () {
        app.session.signOut()
        .then(function () {
          app.router.navigate('/', {trigger: true});
        });
      },
      'click .signin': function () {
        app.session.signIn(_.extend(app.env.auth0.signIn, {
          state: Backbone.history.fragment
        }));
      }
    }
  });

  Views.Breadcrumbs = Backbone.View.extend({
    template: 'navigation/breadcrumbs',
    initialize: function () {
    },
    serialize: function () {
      return {};
    }
  });

  Views.Legalese = Backbone.View.extend({
    template: 'navigation/legalese'
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };

});
