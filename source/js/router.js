define([
  'jquery', 'underscore', 'backbone', 'app',
  'queryString',
  'modules/Layouts',
  'modules/GitHub'
], function (
  $, _, Backbone, app,
  queryString,
  Layouts,
  GitHub
) {
  return Backbone.Router.extend({
    routes: {
      '': 'landing',
      'authentication': 'authentication',
      ':owner/:repository': 'repository',
      '*path': 'error'
    },

    landing: function () {
      app.useLayout(Layouts.Views.Landing, {
      }).setViews({
      }).render();
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
