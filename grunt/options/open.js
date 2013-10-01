module.exports = {
	development: {
		path: 'http://localhost:' +
			'<%= connect.development.options.port %>/'
	},
	staging: {
		path: 'http://localhost:' +
			'<%= connect.staging.options.port %>/'
	},
	production: {
		path: 'http://localhost:' +
			'<%= connect.production.options.port %>/'
	}
};
