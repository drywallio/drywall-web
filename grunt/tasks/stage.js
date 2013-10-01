module.exports = function (grunt) {
	grunt.registerTask('stage', [
		'clean:staging',
		'copy:staging',
		'imagemin',
		'rev:assets',
		'usemin:templates',
		'stylus:staging',
		'cssmin',
		'usemin:css',
		'rev:css',
		'htmlmin:templates',
		'handlebars',
		'requirejs',
		'rev:js',
		'usemin:html',
		'htmlmin:html'
	]);
};
