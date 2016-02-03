module.exports = function (grunt) {
  grunt.registerTask('heroku-run', [
    'connect:production:keepalive'
  ]);
};
