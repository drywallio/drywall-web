/*jslint maxlen: 240 */
require.config({
  waitSeconds: 0,
  baseUrl: '/js',
  deps: ['main'],
  paths: {
    'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
    'handlebars.compiler': '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.1.0/handlebars.min',
    'handlebars': '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.1.0/handlebars.runtime.min',
    'hammerjs': '../bower_components/hammerjs/hammer.min',
    'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min',
    'backbone.layoutmanager': '//cdnjs.cloudflare.com/ajax/libs/backbone.layoutmanager/0.9.4/backbone.layoutmanager.min',
    'backbone.localstorage': '//cdnjs.cloudflare.com/ajax/libs/backbone-localstorage.js/1.1.13/backbone.localStorage-min',
    'backbone.paginator': '../bower_components/backbone.paginator/lib/backbone.paginator.min',
    'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    'backbone-loading': '../bower_components/backbone-loading/backbone-loading',
    'urlbuilder': '../bower_components/urlbuilder/urlbuilder',
    'handlebars-helpers-pack': '../bower_components/handlebars-helpers-pack/helpers',
    'doctit': '../bower_components/doctit/doctit',
    'auth0': '../bower_components/auth0.js/build/auth0.min',
    'googletagmanager': '../bower_components/googletagmanager/googletagmanager',
    'backbone.analytics': '../bower_components/backbone.analytics/backbone.analytics',
    'fastclick': '//cdnjs.cloudflare.com/ajax/libs/fastclick/0.6.7/fastclick.min',
    'es6-shim': '../bower_components/es6-shim/es6-shim',
    'backbone-session': '../bower_components/backbone-session/backbone-session',
    'queryString': '../bower_components/query-string/query-string',
    'Draggable': '//cdnjs.cloudflare.com/ajax/libs/gsap/1.13.2/utils/Draggable.min',
    'TweenLite': '//cdnjs.cloudflare.com/ajax/libs/gsap/1.13.2/TweenLite.min',
    'CSSPlugin': '//cdnjs.cloudflare.com/ajax/libs/gsap/1.13.2/plugins/CSSPlugin.min',
    'tinycolor': '../bower_components/tinycolor/tinycolor',
    'konami': '../bower_components/konami-js/konami'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'Draggable': {
      deps: [
        'CSSPlugin',
        'TweenLite',
        //'libs/gsap/plugins/ThrowPropsPlugin',
      ],
      exports: 'Draggable'
    },
    'facebook': {
      exports: 'FB'
    },
    'jquery': {
      exports: 'jQuery'
    },
    'backbone.layoutmanager': {
      deps: ['backbone']
    },
    'backbone.localstorage': {
      deps: ['backbone']
    },
    'backbone.paginator': {
      deps: ['backbone']
    },
    'mustache': {
      exports: 'mustache'
    },
    'underscore': {
      exports: '_'
    },
    'konami': {
      exports: 'Konami'
    }
  }
});
