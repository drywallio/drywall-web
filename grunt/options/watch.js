module.exports = {
  js: {
    files: [
      'Gruntfile.js',
      'package.json',
      '<%= source %>/js/**/*.js',
      'tests/**/*.js'
    ],
    tasks: [
      'jshint',
      'lintspaces',
      'nodeunit'
    ]
  },
  css: {
    files: [
      '<%= source %>/styles/**/*.styl'
    ],
    tasks: [
      'stylus:source'
    ]
  }
};
