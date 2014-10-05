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
      base: '//drywall-api-production.herokuapp.com'
    },
    googletagmanager: {
      id: 'GTM-PKNHQH'
    }
  }, {
    predicate: matchDomain(['staging.drywall.cf.sg']),
    type: 'staging',
    api: {
      base: '//drywall-api-staging.herokuapp.com'
    },
    googletagmanager: {
      id: 'GTM-W65W3Q'
    }
  }, {
    predicate: function () { return true; },
    type: 'development',
    api: {
      base: '//drywall-api-staging.herokuapp.com'
    },
    googletagmanager: {
      id: ''
    }
  }])
  .find(function (env) { return env.predicate(); })
  .omit('predicate')
  .defaults({
    auth0: {
      signIn: {
        connection: 'github',
        connection_scope: ['repo'],
        scope: 'openid nickname identities',
        offline_mode: true
      },
      domain: 'drywall.auth0.com',
      clientID: 'aoGE4SXQR2Rg0oPxEycSrIPK9hbD8HQd'
    }
  })
  .value();
});
