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
      'pricing': 'pricing',
      'authentication': 'authentication',
      ':owner/:repository': 'repository',
      '*path': 'error'
    },

    landing: function () {
      app.useLayout(Layouts.Views.Landing, {
      }).setViews({
      }).render();
    },

    pricing: function () {
      var owners = app.session.has('id_token') ?
        new Billing.Collections.Orgs(null, {
          user: app.session.get('nickname')
        }) : null;
      app.useLayout(Layouts.Views.Pricing, {
      }).setViews({
        'article': new Billing.Views.Plans({
          owners: owners,
          owner: app.session.get('nickname')
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
      app.useLayout(Layouts.Views.Error, {
      }).render();
    }
  });
});
