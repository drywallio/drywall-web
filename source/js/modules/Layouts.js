define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'modules/Billing',
  'modules/GitHub',
  'modules/Navigation',
  'modules/Wall',
  'modules/Stickies',
  'modules/GoToWall'
],
function (
  $, _, Backbone, app,
  constants,
  Billing,
  GitHub,
  Navigation,
  Wall,
  Stickies,
  GoToWall
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
      this.insertViews({
        '> header': [
          new Navigation.Views.Account(),
          new Navigation.Views.Toggle()
        ],
        '> aside': new Navigation.Views.Primary()
      });
    }
  });

  Views.Content = Views.Nav.extend({
    beforeRender: function (options) {
      Views.Nav.prototype.beforeRender.apply(this, arguments);
      this.insertViews({
        '> .main > footer': new Navigation.Views.Legalese()
      });
    }
  });

  Views.Preload = Views.Base.extend({
    template: 'layouts/preload',
    initialize: function (options) {
      Views.Base.prototype.initialize.apply(this, arguments);
      new Wall.Models.Preload(null,
        _.pick(this.options, 'owner', 'repository'))
      .fetch({
        success: function (preload) {
          app.useLayout(Views.Repository, preload.pick(
            'coordinates', 'issues', 'repo', 'owner', 'repository'
          )).render();
        },
        error: function (preload, err) {
          if (err.status === 404) {
            err.message = 'Wall not Found';
          }
          app.useLayout(Views.Error, {
            error: err
          }).render();
        }
      });
    }
  });

  Views.Repository = Views.Nav.extend({
    template: 'layouts/repository',
    beforeRender: function () {
      this.insertViews({
        '> header': new Navigation.Views.Breadcrumbs({
          repo: this.options.repo
        })
      });
      Views.Nav.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        '> .main > article': new Wall.Views.Draggable({
          coordinates: this.options.coordinates,
          issues: this.options.issues,
          repo: this.options.repo,
          stickies: new Stickies.Collections.Stickies(null, _.pick(
            this.options,
            'coordinates', 'issues', 'repo', 'owner', 'repository'
          ))
        })
      });
    }
  });

  Views.Landing = Views.Content.extend({
    title: 'Project Management Tool for GitHub Issues',
    template: 'layouts/landing',
    serialize: function () {
      return app.session.toJSON();
    },
    initialize: function (options) {
      Views.Base.prototype.initialize.apply(this, arguments);
      new Wall.Models.Preload(null, {
        owner: constants.DEMO_WALL.OWNER,
        repository: constants.DEMO_WALL.REPOSITORY
      })
      .fetch({
        success: function (preload) {
          var stickies = new Stickies.Collections.Stickies(null, preload.pick(
            'coordinates', 'issues', 'repo', 'owner', 'repository'
          ));
          stickies.each(function (stickie) {
            this._addStickie(stickie);
          }, this);
        }.bind(this)
      });
    },
    beforeRender: function () {
      Views.Content.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        '> .main > article > .gotowall': new GoToWall.Views.Navigator()
      });
    },
    _addStickie: function (stickie) {
      this.insertView('.zoom > .stickies', new Stickies.Views.Stickie({
        model: stickie,
        repo: new GitHub.Models.Repo({
          permissions: {pull: true}
        })
      })).render();
    }
  });

  Views.Pricing = Views.Content.extend({
    title: 'Plans & Pricing',
    template: 'layouts/pricing'
  });

  Views.Error = Views.Content.extend({
    template: 'layouts/error',
    initialize: function (options) {
      Views.Content.prototype.initialize.apply(this, arguments);
    },
    serialize: function () {
      var error = this.options.error;
      var code = error.status;
      return {
        showSignIn: !app.session.has('id_token'),
        showPricing: code === 402,
        code: code,
        title: error.message || (
          code === 402 ? 'Plan Upgrade Needed' :
          code === 404 ? 'Wall not Found' :
          'Oops!')
      };
    },
    beforeRender: function () {
      Views.Content.prototype.beforeRender.apply(this, arguments);
      if (!app.session.has('id_token')) {
        this.setViews({
          '> .main > article .sign-in': new Navigation.Views.SignIn()
        });
      }
      if (this.options.error.status === 402) {
        var owner = Backbone.history.fragment.substr(
          0, Backbone.history.fragment.indexOf('/')
        );
        var owners = new Billing.Collections.Billings();
        this.setViews({
          '> .main > article .pricing': new Billing.Views.Plans({
            returnPath: Backbone.history.fragment,
            owner: owner,
            owners: owners
          })
        });
        owners.fetch();
      }
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
