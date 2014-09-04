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

  Views.Chooser = Backbone.View.extend({
    template: 'navigation/chooser'
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
