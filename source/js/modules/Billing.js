define([
  'jquery', 'underscore', 'backbone', 'app',
  'session'
],
function (
  $, _, Backbone, app,
  session
) {
  var Models = {};
  var Collections = {};
  var Views = {};

  Models.Payment = session.prototype.Model.extend({
    initialize: function (models, options) {
      this.options = options || {};
    },
    url: function () {
      return app.api(
        '/billing/:user/create',
        _.pick(this.options, 'user')
      );
    }
  });

  Collections.Orgs = session.prototype.Collection.extend({
    initialize: function (models, options) {
      this.options = options || {};
    },
    url: function () {
      return app.api(
        '/billing/:user/list',
        _.pick(this.options, 'user')
      );
    }
  });

  var fibonacci = _.memoize(function (n) {
    return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
  });

  var tiers = 'Micro Mini Medium Monster'
    .split(' ')
    .map(function (name, index, list) {
      var seq = 2 * (2 + index);
      var quantity = fibonacci(seq);
      var monthly = {};
      monthly.plan = index + 1;
      monthly.rate = 6 - (index / 1);
      monthly.total = monthly.rate * quantity;
      var yearly = {};
      yearly.plan = monthly.plan + list.length;
      yearly.total = monthly.total * 10;
      yearly.savings = monthly.total * 2;
      return {
        name: name,
        quantity: quantity,
        monthly: monthly,
        yearly: yearly
      };
    });

  Views.Plans = Backbone.View.extend({
    template: 'billing/plans',
    initialize: function (options) {
      this.options = options;
      if (options.owners) {
        this.listenTo(options.owners, 'sync', this.render);
      }
    },
    events: {
      'input select.owner': 'toggleRepo',
      'click button[data-plan]': 'choosePlan'
    },
    serialize: function () {
      var owners = this.options.owners ?
        this.options.owners.toJSON() : [];
      var choice = this.options.owner ?
        _.findWhere(owners, {owner: this.options.owner}) || {} : {};
      // choice = {
      //   plan: 3,
      //   owner: 'cofounders',
      //   paidBy: 'cbas'
      // };
      return {
        unpaid: !!choice.owner && !choice.plan,
        downgrade: !!choice.owner && !!choice.plan,
        interactive: !!choice.owner,
        owners: owners
          .map(function (org) {
            org.active = choice.owner &&
              choice.owner === org.owner;
            return org;
          }, this),
        tiers: tiers.map(function (tier) {
          return _.extend(tier, {
            active: choice.plan === tier.monthly.plan ||
              choice.plan === tier.yearly.plan,
            monthly: _.extend(tier.monthly, {
              active: choice.plan === tier.monthly.plan
            }),
            yearly: _.extend(tier.yearly, {
              active: choice.plan === tier.yearly.plan
            })
          });
        })
      };
    },
    toggleRepo: function (event) {
      this.options.owner = $(event.target).val();
      this.render();
    },
    choosePlan: function (event) {
      var plan = $(event.target).closest('button').data('plan');
      var payment = new Models.Payment(null, {
        user: app.session.get('nickname')
      }).save({
        owner: this.options.owner,
        plan: plan,
        returnUrl: document.location.protocol+ '//' +
          document.location.host +
          '/pricing',
        cancelUrl: document.location.protocol+ '//' +
          document.location.host +
          '/pricing'
      }).then(function (response) {
        location.assign(response.url);
      });
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
