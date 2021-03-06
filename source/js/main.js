define(
[
  'es6-shim',
  'jquery', 'underscore', 'backbone',
  'app',
  'router',
  'templates.built',
  'session',
  'googletagmanager',
  'konami',
  'fastclick',
  'backbone-loading',
  'handlebars',
  'libs/handlebars.helpers',
  'modules/Layouts'
],
function (
  es6,
  $, _, Backbone,
  app,
  Router,
  templatesBuilt,
  Session,
  googletagmanager,
  Konami,
  FastClick,
  bbLoading,
  Handlebars,
  handlebarsHelpersPack,
  Layouts
) {
  if (typeof Function.prototype.bind === 'undefined') {
    Function.prototype.bind = function (that) {
      return _.bind(this, that);
    };
  }

  var JST = window.JST = _.extend(window.JST || {}, templatesBuilt);
  handlebarsHelpersPack.register(Handlebars);

  Backbone.Layout.configure({
    el: false,
    manage: true,
    prefix: '/templates/',
    fetchTemplate: function (path) {
      var prefix = Backbone.Layout.prototype.getAllOptions().prefix;
      var bare = path.substr(prefix.length);

      if (JST[bare]) { return JST[bare]; }

      var done = this.async();
      $.get(path + '.html', function (response) {
        require(['handlebars.compiler'], function (Handlebars) {
          if (!JST[bare]) {
            handlebarsHelpersPack.register(Handlebars);
            JST[bare] = Handlebars.compile(response);
          }
          done(JST[bare]);
        });
      }, 'text');
    }
  });

  $(function() {
    FastClick.attach(document.body);
  });

  app.title.sitename = document.title;
  app.title.message = '';

  app.router = new Router();
  app.xhrPool = [];

  app.session = new Session(null, {
    domain: app.env.auth0.domain,
    clientID: app.env.auth0.clientID,
    callbackURL: document.location.protocol+ '//' +
      document.location.host +
      '/authentication'
  });
  app.session.fetch()
  .then(function () {
    return app.session.getAuthStatus();
  })
  .catch(function (err) {
    if (location.pathname !== '/') {
      app.session.signOut();
    }
  })
  .then(function () {
    _.defer(function () {
      Backbone.history.start({
        pushState: true,
        root: app.root
      });
    });
  });

  googletagmanager(app.env.googletagmanager.id);

  $(document).on('click', 'a:not([data-bypass])', function (event) {
    var href = $(this).prop('href'),
      baseURI = location.href.substr(0, location.href.indexOf('/', 8)),
      root = baseURI + app.root,
      isInternalLink = function (href, root) {
        return href && href.slice(0, root.length) === root;
      },
      holdingModifierKey = function (event) {
        return event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey;
      };
    if (isInternalLink(href, root) && !holdingModifierKey(event)) {
      event.preventDefault();
      Backbone.history.navigate(href.slice(root.length), {
        trigger: true
      });
    }
  });

  $(document).on('click', 'a[href="#"]', function (event) {
    event.preventDefault();
  });

  var konami = new Konami(function () {
    app.trigger('konami');
  });
});
