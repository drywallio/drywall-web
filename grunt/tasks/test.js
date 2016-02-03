module.exports = function (grunt) {
  grunt.registerTask('test', [
    'clean:tests',
    'lintspaces',
    'jshint'
  ]);
};
