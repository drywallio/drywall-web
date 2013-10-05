module.exports = function (grunt) {
	return {
		build: {
			options: grunt.util._.merge({
				node: true
			}, grunt.file.readJSON('.jshintrc')),
			src: [
				'package.json',
				'Gruntfile.js',
				'grunt/**/*.js'
			]
		},
		tests: {
			options: grunt.util._.merge({
				node: true,
				globals: {
					casper: true
				}
			}, grunt.file.readJSON('.jshintrc')),
			src: [
				'tests/**/*_test.js'
			]
		},
		app: {
			options: grunt.util._.merge({
				browser: true,
				devel: true,
				globals: {
					require: true,
					define: true
				}
			}, grunt.file.readJSON('.jshintrc')),
			src: [
				'<%= source %>/js/**/*.js',
				'!<%= source %>/js/libs/**/*.js'
			]
		}
	};
};
