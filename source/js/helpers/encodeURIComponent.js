define(['underscore', 'handlebars'], function (_, Handlebars) {

	return function (input) {
		var output = encodeURIComponent(input);
		return new Handlebars.SafeString(output);
	};

});
