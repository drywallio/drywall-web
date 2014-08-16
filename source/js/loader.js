/*jslint maxlen: 240 */
require.config({
  baseUrl: '/js',
  deps: ['main'],
  paths: {
    'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
    'handlebars': '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0-rc.4/handlebars.min',
    'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min',
    'backbone.layoutmanager': '//cdnjs.cloudflare.com/ajax/libs/backbone.layoutmanager/0.9.4/backbone.layoutmanager.min',
    'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min',
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
    'Draggable': '//cdnjs.cloudflare.com/ajax/libs/gsap/1.10.3/utils/Draggable.min',
    'TweenLite': '//cdnjs.cloudflare.com/ajax/libs/gsap/1.10.3/TweenLite.min',
    'CSSPlugin': '//cdnjs.cloudflare.com/ajax/libs/gsap/1.10.3/plugins/CSSPlugin.min'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'Draggable': {
      deps: [
        'CSSPlugin',
        'libs/gsap/plugins/ThrowPropsPlugin',
        'TweenLite'
      ],
      exports: 'Draggable'
    },
    'facebook': {
      exports: 'FB'
    },
    'handlebars': {
      exports: 'Handlebars'
    },
    'jquery': {
      exports: 'jQuery'
    },
    'backbone.layoutmanager': {
      deps: ['backbone']
    },
    'mustache': {
      exports: 'mustache'
    },
    'underscore': {
      exports: '_'
    }
  }
});
