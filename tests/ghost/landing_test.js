casper.start(casper.cli.get('baseUrl'));

casper.on('page.error', function (msg, trace) {
  this.test.fail(msg);
});

casper.on('resource.received', function (resource) {
  var isNumber = function (value) {
    var string = Object.prototype.toString.call(value);
    return string === '[object Number]';
  };

  if (resource.stage === 'end' &&
    isNumber(resource.status) &&
    resource.status >= 400
  ) {
    // this.echo('HTTP ' + resource.status + ': ' + resource.url);
    this.test.fail(
      'Broken resource [' + resource.status + '] ' + resource.url
    );
  }
});

casper.waitForSelector('#app > *.layout:not(.loading)');

casper.then(function () {
  this.test.assertTitle(
    'DryWall',
    'Make sure the title is set'
  );
  this.test.assertExists(
    'header',
    'Check if it has a header element'
  );
});

casper.run(function () {
  this.test.done();
});
