module.exports = {
	test: {
		files: [{
			src: ['tests/ghost/**/*_test.js']
		}]
	},
	options: {
		args: {
			baseUrl: 'http://localhost:' +
				'<%= connect.staging.options.port %>/',
			'cookies-file': './tests/ghost/temp/cookies.txt',
			'disk-cache': false,
			'ignore-ssl-errors': true,
			'local-storage': './tests/ghost/temp/storage'
		},
		direct: false,
		logLevel: 'error',
		printCommand: true,
		printFilePaths: true
	}
};
