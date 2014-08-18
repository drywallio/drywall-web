define([
  'jquery', 'underscore', 'backbone', 'app',
  'queryString',
  'modules/Layouts',
  'modules/Wall',
  'modules/GitHub',
  'modules/Stickies'
], function (
  $, _, Backbone, app,
  queryString,
  Layouts,
  Wall,
  GitHub,
  Stickies
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
      // var rand = function (max) {
      //   var grid = 26;
      //   return Math.round(Math.random() * max / grid) * grid;
      // };
      // var randX = _.partial(rand, document.body.clientWidth - 320);
      // var randY = _.partial(rand, document.body.clientHeight - 320);
      // var stickies = new Wall.Collections.Stickies([{
      //   title: 'Hello world',
      //   x: randX(),
      //   y: randY(),
      //   color: '#15c2d2'
      // }, {
      //   title: 'How are you doing?',
      //   x: randX(),
      //   y: randY(),
      //   color: '#4ccef8'
      // }, {
      //   title: 'Not another stickie!',
      //   x: randX(),
      //   y: randY(),
      //   color: '#deb4e3'
      // }, {
      //   title: 'You shall not pass',
      //   x: randX(),
      //   y: randY(),
      //   color: '#f4a22e'
      // }, {
      //   title: 'Chocolate and bananas for code monkeys',
      //   x: randX(),
      //   y: randY(),
      //   color: '#ffca45'
      // }, {
      //   title: 'Vroom Vroom',
      //   x: randX(),
      //   y: randY(),
      //   color: '#e7524e'
      // }, {
      //   title: 'Shake it baby!',
      //   x: randX(),
      //   y: randY(),
      //   color: '#be6ac8'
      // }], {
      //   organization: organization,
      //   repository: repository
      // });
      var issues = new GitHub.Collections.Issues(null, {
        owner: owner,
        repository: repository
      });
      var stickies = new Stickies.Collections.Stickies(null, {
        owner: owner,
        repository: repository
      });
      app.useLayout(Layouts.Views.Repository, {
      }).setViews({
        'article': new Wall.Views.Draggable({
          issues: issues,
          stickies: stickies
        })
      }).render();
      issues.fetch();
      stickies.fetch();
    },

    404: function () {
      app.useLayout(Layouts.Views['404'], {
      }).render();
    }

  });
});
