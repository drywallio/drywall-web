define(['underscore'], function (_) {
  var matchDomain = function (domains) {
    return function () {
      return _.contains(domains, window.location.host);
    };
  };

  return _.chain([{
    predicate: matchDomain(['drywall.cf.sg']),
    type: 'production',
    googletagmanager: {
      id: 'GTM-PKNHQH'
    }
  }, {
    predicate: function () { return true; },
    type: 'development',
    googletagmanager: {
      id: ''
    }
  }])
  .find(function (env) { return env.predicate(); })
  .omit('predicate')
  .defaults({
    api: {
      base: '//drywall-api.herokuapp.com'
    },
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
