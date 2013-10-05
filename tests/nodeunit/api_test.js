'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname + '/../../source/js'
});

exports['API string builder'] = {

	setUp: function (callback) {
		var that = this;
		requirejs(['libs/api'],
		function (api) {
			that.api = api;
			callback();
		});
	},

	tearDown: function (callback) {
		callback();
	},

	'default': function (test) {
		var base = '//example.com';
		var endpoint = 'items';
		var fields = {};
		var parameters = {};

		var output = this.api(base)(endpoint, fields, parameters);

		test.equals(output, '//example.com/items');
		test.done();
	},

	'query string parameters': function (test) {
		var base = '//example.com';
		var endpoint = '';
		var fields = {};
		var parameters = {
			where: 'wonderland'
		};

		var output = this.api(base)(endpoint, fields, parameters);

		test.equals(output, '//example.com/?where=wonderland');
		test.done();
	}

};
