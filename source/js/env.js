define(['underscore'], function (_) {
  var matchDomain = function (domains) {
    return function () {
      return _.contains(domains, window.location.host);
    };
  };

  return _.chain([{
    predicate: matchDomain(['drywall.cf.sg']),
    type: 'production',
    api: {
      base: 'http://drywall-api-production.herokuapp.com'
    },
    googletagmanager: {
      id: 'GTM-PKNHQH'
    }
  }, {
    predicate: matchDomain(['staging.drywall.cf.sg']),
    type: 'staging',
    api: {
      base: 'http://drywall-api-staging.herokuapp.com'
    },
    googletagmanager: {
      id: 'GTM-W65W3Q'
    }
  }, {
    predicate: function () { return true; },
    type: 'development',
    api: {
      base: 'http://drywall-api-staging.herokuapp.com'
    },
    googletagmanager: {
      id: ''
    }
  }])
  .find(function (env) { return env.predicate(); })
  .omit('predicate')
  .defaults({
    auth0: {
      scopes: ['repo'],
      domain: 'drywall.auth0.com',
      clientID: 'aoGE4SXQR2Rg0oPxEycSrIPK9hbD8HQd'
    }
  })
  .value();
});
