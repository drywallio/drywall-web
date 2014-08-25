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
      return _.pick(app.session.toJSON(),
        'gravatar_id',
        'name'
      );
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
