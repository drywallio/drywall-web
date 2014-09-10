module.exports = function (grunt) {
  return {
    development: {
      options: {
        base: '<%= source %>',
        port: 9000
      }
    },
    staging: {
      options: {
        base: '<%= staging %>',
        port: 9001
      }
    },
    production: {
      options: {
        base: '<%= production %>',
        port: process.env.PORT || 9002
      }
    },
    options: {
      hostname: '*',
      middleware: function (connect, options) {
        return [
          connect.static(
            Array.isArray(options.base) ?
              options.base.slice(-1)[0] :
              options.base
          ),
          function (req, res) {
            var path = options.base + '/index.html';
            var file = grunt.file.read(path);
            res.end(file);
          }
        ];
      }
    }
  };
};
