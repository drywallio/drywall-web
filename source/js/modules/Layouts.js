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

  Views.Organization = Views.Nav.extend({
    template: 'layouts/organization'
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
      app.session.signIn();
    }
  });

  Views.Github = Views.Base.extend({
    template: 'layouts/github',
    events: {
      'click button.cancel': 'cancel'
    },
    cancel: function () {
      app.session.signOut();
    },
    afterRender: function () {
      console.log('AFTER RENDER GITHUB');
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
