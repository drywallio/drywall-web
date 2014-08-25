define([
  'jquery', 'underscore', 'backbone', 'app', 'auth0', 'backbone-session'
],
function (
  $, _, Backbone, app, Auth0, Session
) {
  var saveProfile = function (err, profile, id_token, access_token, state) {
    var auth0Attributes = {};
    if (id_token !== undefined) {
      auth0Attributes.id_token = id_token;
    }
    if(access_token !== undefined) {
      auth0Attributes.access_token = access_token;
    }
    this.save(_.extend(profile, auth0Attributes));
  };

  var sync = function (method, model, options) {
    if (app.session.has('id_token')) {
      options.headers = _.extend(options.headers || {}, {
        'Authorization': 'Bearer ' + app.session.get('id_token')
      });
    }
    model.once('request', function (model, xhr, options) {
      xhr.fail(function (xhr, textStatus) {
        if (xhr.status === 401) {
          app.session.signOut();
        }
      });
    });
    var identities = app.session.get('identities') || [];
    var identity = _(identities).findWhere({connection: 'github'}) || {};
    var access_token = identity.access_token;
    if (access_token) {
      if (method === 'read') {
        // Adds token as query param in GET request
        options.data = _.defaults({
          access_token: access_token
        }, options.data || {});

      } else {
        // JSON in other requests as payload
        options.attrs = _.defaults({
          access_token: access_token
        }, model.toJSON(options), options.attrs || {});
      }
    }
    return Backbone.sync.call(this, method, model, options);
  };

  var sessionModel = Backbone.Model.extend({
    sync: sync
  });
  var sessionCollection = Backbone.Collection.extend({
    sync: sync,
    model: sessionModel
  });

  return Session.extend({
    Model: sessionModel,
    Collection: sessionCollection,
    initialize: function (attributes, options) {
      this.auth0 = new Auth0(_.defaults(options, {
        // domain: 'xxxxxxxx.auth0.com',
        // clientID: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        // callbackURL: document.location.protocol+ '//' +
        //   document.location.host + '/xxxxxxxxxxxxxxxx',
        callbackOnLocationHash: true
      }));
      return Session.prototype.initialize.apply(this, arguments);
    },
    signIn: function (options) {
      var that = this;
      return new Promise(function (resolve, reject) {
        that.auth0.login(
          options,
          function (err, profile, id_token, access_token, state) {
            if (err) {
              reject();
            } else {
              saveProfile.apply(that, arguments);
              resolve();
            }
          }
        );
      });
    },
    // signOut: function (options) {
    //   var that = this;
    //   return new Promise(function (resolve, reject) {
    //     that.unset('id_token');
    //     that.unset('access_token');
    //     that.save()
    //       .then(function () {
    //         that.auth0.logout(_.defaults(options || {}, {
    //           returnTo: document.location.protocol+ '//' +
    //             document.location.host,
    //           accessToken:
    //         }));
    //       })
    //       .then(resolve, reject);
    //   });
    // },
    getAuthStatus: function (options) {
      var that = this;

      return new Promise(function (resolve, reject) {
        var id_token;
        var access_token;

        if (that.has('id_token')) {
          id_token = that.get('id_token');
        }
        if (that.has('access_token')) {
          access_token = that.get('access_token');
        }

        var hash = that.auth0.parseHash(window.location.hash);
        if (hash) {
          id_token = hash.id_token;
          access_token = hash.access_token;
        }

        if (!id_token || !access_token) {
          reject(Error('No valid tokens found'));
          return;
        }

        that.auth0.getProfile(
          id_token,
          function (err, profile) {
            if (err) {
              reject(err);
            } else {
              saveProfile.apply(
                that,
                [undefined, profile, id_token, access_token]
              );
              resolve();
            }
          }
        );
      });
    }
  });
});
