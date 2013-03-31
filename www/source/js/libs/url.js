define(['underscore'], function (_) {

	return function (url, params, options) {

		var config = _.extend({
			slug: /:(\w+)/g,
			separator: '+'
		}, options);

		return url.replace(config.slug, function (match, name) {

			var param = params[name];

			return _.isArray(param) ? _.map(param, encodeURIComponent)
					.join(config.separator)
				: _.isFunction(param) ? encodeURIComponent(param(name, params))
				: encodeURIComponent(param);

		});
	};
});
