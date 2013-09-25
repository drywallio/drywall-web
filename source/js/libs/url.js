define(['underscore'], function (_) {

	return function (url, fields, data, options) {

		if (!_.isString(url)) {
			url = '';
		}

		var config = _.extend({
			slug: /:(\w+)/g,
			separator: '+'
		}, options);

		var endpoint = url.replace(config.slug, function (match, name) {
			var param = fields[name];
			return _.isArray(param) ? _.map(param, encodeURIComponent)
					.join(config.separator)
				: _.isFunction(param) ? encodeURIComponent(param(name, fields))
				: encodeURIComponent(param);

		});

		var query = '';
		if (data && _.keys(data).length > 0) {
			query += endpoint.indexOf('?') === -1 ? '?' : '&';
			query += _.chain(data)
				.pairs()
				.map(function (pair) {
					var name = pair[0];
					var value = pair[1];
					return encodeURIComponent(name) +
						'=' + encodeURIComponent(value);
				})
				.value()
				.join('&');
		}

		return endpoint + query;
	};
});
