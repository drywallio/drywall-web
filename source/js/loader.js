require.config({

	baseUrl: '/js',

	deps: ['main'],

	paths: {
		backbone: '//cdnjs.cloudflare.com' +
			'/ajax/libs/backbone.js/1.0.0/backbone-min',
		facebook: '//connect.facebook.net/en_US/all',
		handlebars: '//cdnjs.cloudflare.com' +
			'/ajax/libs/handlebars.js/1.0.0-rc.4/handlebars.min',
		jquery: '//cdnjs.cloudflare.com' +
			'/ajax/libs/jquery/1.9.1/jquery.min',
		'backbone.layoutmanager': '//cdnjs.cloudflare.com' +
			'/ajax/libs/backbone.layoutmanager' +
			'/0.8.8/backbone.layoutmanager.min',
		mustache: '//cdnjs.cloudflare.com' +
			'/ajax/libs/mustache.js/0.7.0/mustache.min',
		underscore: '//cdnjs.cloudflare.com' +
			'/ajax/libs/underscore.js/1.4.4/underscore-min'
	},

	shim: {
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		facebook: {
			exports: 'FB'
		},
		handlebars: {
			exports: 'Handlebars'
		},
		jquery: {
			exports: 'jQuery'
		},
		'backbone.layoutmanager': {
			deps: ['backbone']
		},
		mustache: {
			exports: 'mustache'
		},
		underscore: {
			exports: '_'
		}
	}

});
