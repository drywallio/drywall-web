module.exports = function (grunt) {
  grunt.registerTask('heroku', [
    'connect:production:keepalive'
  ]);
};
