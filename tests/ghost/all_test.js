casper.start(casper.cli.get('baseUrl'));


casper.on('page.error', function (msg, trace) {
	this.test.fail(msg);
});

casper.waitForSelector('#app > *:not([class~=layout-loading])');

casper.then(function () {
	this.test.assertTitle(
		'Drywall',
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
