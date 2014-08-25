define([
  'jquery', 'underscore', 'backbone', 'app',
  'queryString',
  'modules/Layouts',
  'modules/Wall',
  'modules/Coordinates',
  'modules/GitHub'
], function (
  $, _, Backbone, app,
  queryString,
  Layouts,
  Wall,
  Coordinates,
  GitHub
) {
  return Backbone.Router.extend({

    routes: {
      '': 'landing',
      'authentication': 'authentication',
      ':owner': 'owner',
      ':owner/:repository': 'repository',
      '*path': '404'
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

    owner: function () {
      app.useLayout(Layouts.Views.Owner, {
      }).setViews({
      }).render();
    },

    repository: function (owner, repository) {
      var coordinates = new Coordinates.Collections.Coordinates(null, {
        owner: owner,
        repository: repository
      });
      var issues = new GitHub.Collections.Issues(null, {
        owner: owner,
        repository: repository
      });
      var stickies = new Wall.Collections.Stickies(null, {
        coordinates: coordinates,
        issues: issues,
        owner: owner,
        repository: repository
      });
      app.useLayout(Layouts.Views.Repository, {
      }).setViews({
        'article': new Wall.Views.Draggable({
          issues: issues,
          coordinates: coordinates,
          stickies: stickies
        })
      }).render();
      coordinates.fetch();
      issues.fetch();
    },

    404: function () {
      app.useLayout(Layouts.Views['404'], {
      }).render();
    }

  });
});
