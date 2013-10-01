module.exports = function (grunt) {
	grunt.registerTask('test', [
		'clean:tests',
		'jshint',
		'nodeunit',
		'stage',
		'connect:staging',
		'ghost'
	]);
};
