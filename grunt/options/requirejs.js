module.exports = {
	compile: {
		options: {
			baseUrl: '<%= staging %>/js',
			mainConfigFile: '<%= staging %>/js/loader.js',
			out: '<%= staging %>/js/loader.js',
			name: 'loader',
			optimize: 'uglify',
			// generateSourceMaps: true,
			preserveLicenseComments: false
		}
	}
};
