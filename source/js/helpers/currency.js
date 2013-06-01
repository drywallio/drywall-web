define(['underscore', 'handlebars'], function (_, Handlebars) {

	return function (amount, options) {
		if (isNaN(amount)) {
			return new Handlebars.SafeString('');
		}

		var hash = _.extend({
			decimal: '.',
			precision: 2,
			symbol: '$',
			thousand: ','
		}, options.hash);

		var significand = amount * Math.pow(10, hash.precision),
			digits = (amount === 0) ?
				(new Array(1 + hash.precision)).join('0') :
				parseInt(significand, 10).toString(),
			until = digits.length - hash.precision,
			before = digits.substr(0, until) || '0',
			split = before.replace(/\B(?=(\d{3})+(?!\d))/g, hash.thousand),
			after = digits.substr(-1 * hash.precision);

		var output = hash.precision > 0 ?
				hash.symbol + split + hash.decimal + after :
				hash.symbol + split;

		return new Handlebars.SafeString(output);
	};

});
