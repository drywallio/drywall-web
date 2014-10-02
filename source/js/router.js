define([
  'jquery', 'underscore', 'backbone', 'app',
  'queryString',
  'modules/Billing',
  'modules/Layouts',
  'modules/GitHub'
], function (
  $, _, Backbone, app,
  queryString,
  Billing,
  Layouts,
  GitHub
) {
  return Backbone.Router.extend({
    routes: {
      '': 'landing',
      'about': 'about',
      'pricing': 'pricing',
      'pricing/:owner': 'pricing',
      'authentication': 'authentication',
      ':owner/:repository': 'repository',
      '*path': 'error'
    },

    landing: function () {
      app.useLayout(Layouts.Views.Landing, {
      }).setViews({
      }).render();
    },

    about: function () {
      app.useLayout(Layouts.Views.About, {
      }).setViews({
      }).render();
    },

    pricing: function (owner) {
      var owners = app.session.has('id_token') ?
        new Billing.Collections.Billings() : null;
      app.useLayout(Layouts.Views.Pricing, {
      }).setViews({
        'article': new Billing.Views.Plans({
          owner: owner,
          owners: owners
        })
      }).render();
      if (owners) {
        owners.fetch();
      }
    },

    authentication: function () {
      var params = queryString.parse(location.search || location.hash);
      app.router.navigate(params.state, {
        replace: true,
        trigger: true
      });
    },

    repository: function (owner, repository) {
      app.useLayout(Layouts.Views.Preload, {
        owner: owner,
        repository: repository
      }).render();
    },

    error: function () {
      function HTTPError (status, message) {
        this.status = status;
        this.message = message;
      }
      HTTPError.prototype = new Error();
      HTTPError.prototype.constructor = HTTPError;
      app.useLayout(Layouts.Views.Error, {
        error: new HTTPError(404, 'Page not Found')
      }).render();
    }
  });
});
