casper.start(casper.cli.get('baseUrl'))

.waitForSelector('#app > *')

.then(function () {
	this.test.assertTitle(
		'Drywall',
		'Make sure the title is set'
	);
	this.test.assertExists(
		'header',
		'Check if it has a header element'
	);
})

.run(function () {
	this.test.done();
});
