module.exports = function (grunt) {
  grunt.registerTask('heroku', [
    'default',
    'connect:production:keepalive'
  ]);
};
