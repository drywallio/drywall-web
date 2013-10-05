define(['underscore', 'libs/url'], function (_, url) {

	return function (apiBasePath) {

		return function (endpoint, fields, data) {
			var path = apiBasePath;

			var hasSlash = /\/$/.test(path) || /^\//.test(endpoint);
			if (!hasSlash) {
				path += '/';
			}

			path += endpoint;

			return url(path, _.clone(fields), _.defaults({
				format: 'json'
			}, data));
		};

	};

});
