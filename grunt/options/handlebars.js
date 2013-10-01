module.exports = {
	compile: {
		options: {
			processName: function (filename) {
				var prefix = 'templates/',
					cutoff = filename.indexOf(prefix);
				if (cutoff === -1) {
					throw new Error('Invalid template path');
				}
				return filename
					// Strip "templates/" prefix
					.substring(cutoff + prefix.length)
					// Trim ".html" extension
					.split('.').slice(0, -1).join('.');
			},
			namespace: 'JST',
			amd: true
		},
		files: {
			'<%= staging %>/js/templates.built.js':
				'<%= staging %>/templates/**/*.html'
		}
	}
};
