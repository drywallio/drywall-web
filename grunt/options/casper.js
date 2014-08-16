module.exports = {
  options: {
    args: [
      '--baseUrl=http://localhost:' +
        '<%= connect.staging.options.port %>/',
      '--disk-cache=false',
      '--local-storage=./tests/ghost/temp/storage'
    ],
    engine: 'slimerjs',
    logLevel: 'debug',
    verbose: true,
    test: true
  },
  phantomjs: {
    src: ['tests/casper/**/*_test.js'],
    options: {
      engine: 'phantomjs'
    }
  },
  slimerjs: {
    src: ['tests/casper/**/*_test.js'],
    options: {
      engine: 'slimerjs'
    }
  }
};
