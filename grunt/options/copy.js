module.exports = {
	staging: {
		files: [{
			expand: true,
			cwd: '<%= source %>/',
			dest: '<%= staging %>/',
			src: [
				'index.html',
				'robots.txt',
				'js/**',
				'styles/**',
				'img/**',
				'templates/**'
			]
		}]
	},
	production: {
		files: [{
			expand: true,
			cwd: '<%= staging %>/',
			dest: '<%= production %>/',
			src: [
				'index.html',
				'robots.txt',
				'js/*.loader.js',
				'styles/*.app.css',
				'img/**/*.{jpg,jpeg,gif,png,ico,webp}'
			]
		}]
	}
};
