define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'modules/Billing',
  'modules/GitHub',
  'modules/Navigation',
  'modules/Walls',
  'modules/Stickies',
  'modules/GoToWall'
],
function (
  $, _, Backbone, app,
  constants,
  Billing,
  GitHub,
  Navigation,
  Walls,
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
    initialize: function () {
      Views.Base.prototype.initialize.apply(this, arguments);
      this.listenTo(app, 'walls.views.wall.pan.start', function (event) {
        this.$el.find('> header').addClass('wall-panning');
      });
      this.listenTo(app, 'walls.views.wall.pan.end', function (event) {
        this.$el.find('> header').removeClass('wall-panning');
      });
    },
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

      new Walls.Models.Preload(null,
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
      var wall = this.options.owner + '/' + this.options.repository;
      new GoToWall.Collections.LastVisitedWalls()
        .create({
          wallId: wall.toLowerCase(),
          wall: wall,
          timestamp: new Date().getTime()
        });

      this.insertViews({
        '> header': new Navigation.Views.Breadcrumbs({
          repo: this.options.repo
        })
      });
      Views.Nav.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        '> .main > article': new Walls.Views.Wall({
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
      new Walls.Models.Preload(null, {
        owner: constants.DEMO_WALL.OWNER,
        repository: constants.DEMO_WALL.REPOSITORY
      })
      .fetch({
        success: function (preload) {
          this.setViews({
            '> .main > .demo': new Walls.Views.Demo({
              coordinates: preload.get('coordinates'),
              issues: preload.get('issues'),
              repo: preload.get('repo'),
              stickies: new Stickies.Collections.Stickies(null, preload.pick(
                'coordinates', 'issues', 'repo', 'owner', 'repository'
              ))
            })
          }).render();
        }.bind(this)
      });
    },
    beforeRender: function () {
      Views.Content.prototype.beforeRender.apply(this, arguments);
      this.setViews({
        '> .main > article > .gotowall': new GoToWall.Views.Navigator()
      });
    }
  });

  Views.About = Views.Content.extend({
    title: 'About',
    template: 'layouts/about'
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
