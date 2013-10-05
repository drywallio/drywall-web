'use strict';

var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname + '/../../source/js'
});

exports['URL string builder'] = {

	setUp: function (callback) {
		var that = this;
		requirejs(['libs/url'],
		function (url) {
			that.url = url;
			callback();
		});
	},

	tearDown: function (callback) {
		callback();
	},

	'default': function (test) {
		var path = '//example.com/items/:id',
			params = {id: 123},
			output = this.url(path, params);

		test.equals(output, '//example.com/items/123');
		test.done();
	},

	'slug': function (test) {
		var path = '//example.com/items/{ID}',
			params = {ID: 123},
			options = {slug: /\{([A-Z]+)\}/g},
			output = this.url(path, params, null, options);

		test.equals(output, '//example.com/items/123');
		test.done();
	},

	'separator': function (test) {
		var path = '//example.com/items/:sort',
			params = {sort: ['height', 'price', 'rating']},
			options = {separator: '_'},
			output = this.url(path, params, null, options);

		test.equals(output, '//example.com/items/height_price_rating');
		test.done();
	},

	'parameter list': function (test) {
		var path = '//example.com/items/:codes',
			params = {codes: 'abcde'.split('')},
			output = this.url(path, params);

		test.equals(output, '//example.com/items/a+b+c+d+e');
		test.done();
	},

	'multiple fields': function (test) {
		var path = '//example.com/:name/in/:where',
			params = {name: 'Alice', where: 'Wonderland'},
			output = this.url(path, params);

		test.equals(output, '//example.com/Alice/in/Wonderland');
		test.done();
	},

	'parameter callback': function (test) {
		var path = '//example.com/:person',
			callback = function (slug, person) {
				test.equals(slug, 'person');
				test.equals(person, params);
				return person.name.toUpperCase();
			},
			params = {person: callback, name: 'Bob'},
			output = this.url(path, params);

		test.equals(output, '//example.com/BOB');
		test.done();
	},

	'encode funky characters': function (test) {
		var path = '//example.com/:disapproval',
			params = {disapproval: 'ಠ_ಠ'},
			output = this.url(path, params);

		test.equals(output, '//example.com/%E0%B2%A0_%E0%B2%A0');
		test.done();
	},

	'query string': function (test) {
		var path = '//example.com/',
			data = {foo: 'bar'},
			output = this.url(path, null, data);

		test.equals(output, '//example.com/?foo=bar');
		test.done();
	},

	'escaping query parameter': function (test) {
		var path = '//example.com/',
			data = {hi: 'me & you'},
			output = this.url(path, null, data);

		test.equals(output, '//example.com/?hi=me%20%26%20you');
		test.done();
	},

	'multiple query parameters': function (test) {
		var path = '//example.com/',
			data = {foo: 'bar', count: 123},
			output = this.url(path, null, data);

		test.equals(output, '//example.com/?foo=bar&count=123');
		test.done();
	}

};
