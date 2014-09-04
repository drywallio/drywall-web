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

  Models.Billings = session.prototype.Model.extend({
    url: function () {
      return app.api('/billings');
    }
  });

  Collections.Billings = session.prototype.Collection.extend({
    url: function () {
      return app.api('/billings');
    },
    comparator: function (model) {
      return model.get('owner').toLowerCase();
    },
    parse: function (response) {
      var owner = _.findWhere(response, {
        owner: app.session.get('user_id')
      });
      if (owner) {
        owner.owner = app.session.get('nickname');
      }
      return response;
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
      'change select.owner': 'toggleRepo',
      'click button[data-plan]': 'choosePlan'
    },
    serialize: function () {
      var owners = this.options.owners ?
        this.options.owners.toJSON() : [];
      var choice = this.options.owner &&
        _.findWhere(owners, {owner: this.options.owner}) ||
        _.findWhere(owners, {paidBy: app.session.get('nickname')}) ||
        _.find(owners, function (owner) { return !!owner.paidBy; }) ||
        _.findWhere(owners, {owner: app.session.get('nickname')}) ||
        owners[0] ||
        {};
      var interactive = owners.length > 0;
      return {
        interactive: interactive,
        unpaid: interactive && !choice.plan && !choice.paidBy,
        downgrade: interactive && !!choice.plan,
        nextBillingDate: choice.nextBillingDate,
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
      var that = this;
      var owner = this.$el.find('select.owner').val();
      var plan = $(event.target).closest('button').data('plan');
      new Models.Billings().save({
        owner: owner,
        plan: plan,
        returnUrl: document.location.protocol+ '//' +
          document.location.host +
          '/pricing/' + owner,
        cancelUrl: document.location.protocol+ '//' +
          document.location.host +
          '/pricing/' + owner
      }).then(function (response) {
        if (response.url) {
          location.assign(response.url);
        } else {
          that.options.owners.fetch();
        }
      });
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
