module.exports = function (grunt) {
	grunt.registerTask('prod', [
		'default',
		'open:production',
		'connect:production:keepalive'
	]);
};
