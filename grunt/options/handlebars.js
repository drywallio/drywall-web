module.exports = {
  compile: {
    options: {
      processName: function (filename) {
        var prefix = 'templates/',
          cutoff = filename.indexOf(prefix);
        if (cutoff === -1) {
          throw new Error('Invalid template path');
        }
        return filename
          // Strip "templates/" prefix
          .substring(cutoff + prefix.length)
          // Trim ".html" extension
          .split('.').slice(0, -1).join('.');
      },
      namespace: 'JST',
      amd: true,
      handlebars: {
        parse: require('handlebars').parse,
        precompile: require('handlebars').precompile
      }
    },
    files: {
      '<%= staging %>/js/templates.built.js':
        '<%= staging %>/templates/**/*.html'
    }
  }
};
