define(['jquery', 'underscore', 'backbone', 'app'
], function ($, _, Backbone, app) {
  var Models = {};
  var Collections = {};
  var Views = {};

  Views.Primary = Backbone.View.extend({
    template: 'navigation/primary',
    // events: {
    //   'mouseenter': function (event) {
    //     if (!this.getView('.chooser')) {
    //       var chooser = new Views.Chooser({
    //       });
    //       this.setView('.chooser', chooser);
    //       chooser.render();
    //     }
    //   },
    //   'mouseleave': function (event) {
    //     this.removeView('.chooser');
    //   }
    // },
    beforeRender: function () {
      this.setViews({
        '.account': new Views.Account({
        }),
        // '.breadcrumbs': new Views.Breadcrumbs({
        // })
      });
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
      'click .signout': function () {
        app.session.signOut()
        .then(function () {
          app.router.navigate('/', {trigger: true});
        });
      },
      'click .signin': function () {
        app.session.signIn({
          connection: 'github',
          connection_scope: app.env.auth0.scopes,
          state: Backbone.history.fragment
        });
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

  Views.Chooser = Backbone.View.extend({
    template: 'navigation/chooser'
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };

});
