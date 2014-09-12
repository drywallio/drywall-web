define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants'
], function (
  $, _, Backbone, app,
  constants
) {
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
        state: Backbone.history.fragment === '' ?
          '/cofounders/drywall-web' :
          '/' + Backbone.history.fragment
      }));
    }
  });

  Views.Toggle = Backbone.View.extend({
    template: 'navigation/toggle',
    events: {
      'click': function (event) {
        event.stopImmediatePropagation();
        $(app.el).toggleClass('navigation-primary-reveal');
      }
    }
  });

  Views.Primary = Backbone.View.extend({
    template: 'navigation/primary',
    initialize: function () {
      _.bindAll(this, '_keydown');
      $(document).keydown(this._keydown);
    },
    cleanup: function () {
      $(document).off('keydown', this._keydown);
    },
    _keydown: function (event) {
      var KEY = constants.KEY;
      switch (event.keyCode) {
        case KEY.ESC:
          this.close();
          break;
      }
    },
    close: function () {
      $(app.el).removeClass('navigation-primary-reveal');
    },
    events: {
      'click': function (event) {
        this.close();
      },
      'click .sign-out': function (event) {
        app.session.signOut()
        .then(function () {
          app.router.navigate('/', {trigger: true});
        });
      }
    },
    serialize: function () {
      return {
        session: app.session.toJSON()
      };
    }
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
      'click': function () {
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
