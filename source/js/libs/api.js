define(['underscore', 'libs/url'], function (_, url) {

	return function (apiBasePath, globalParameters) {

		return function (endpoint, fields, parameters) {
			var path = apiBasePath;

			var hasSlash = /\/$/.test(path) || /^\//.test(endpoint);
			if (!hasSlash) {
				path += '/';
			}

			path += endpoint;

			return url(
				path,
				_.clone(fields),
				_.defaults(globalParameters || {}, parameters)
			);
		};

	};

});
