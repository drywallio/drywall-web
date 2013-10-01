module.exports = function (grunt) {
	grunt.registerTask('publish', [
		'clean:production',
		'copy:production'
	]);
};
