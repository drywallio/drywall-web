module.exports = function (grunt) {
	grunt.registerTask('dev', [
		'stylus:source',
		'connect:development',
		'open:development',
		'watch'
	]);
};
