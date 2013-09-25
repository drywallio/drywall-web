define([
	'jquery', 'underscore', 'backbone', 'app',
	'modules/Layouts',
	'modules/Wall'
], function (
	$, _, Backbone, app,
	Layouts,
	Wall
) {
	return Backbone.Router.extend({

		routes: {
			'': 'landing',
			'login/github/redirect/': 'github',
			':organization': 'organization',
			':organization/:repository': 'repository',
			'*path': '404'
		},

		landing: function () {
			app.useLayout(Layouts.Views.Landing, {
			}).setViews({
			}).render();
		},

		github: function () {
			console.log('GITHUB CALLBACK!');
			app.useLayout(Layouts.Views.Github, {
			}).setViews({
			}).render();
		},

		organization: function () {
			app.useLayout(Layouts.Views.Organization, {
			}).setViews({
			}).render();
		},

		repository: function (organization, repository) {
			var rand = function () {
				return Math.round(Math.random() * 30);
			};
			var stickies = new Wall.Collections.Stickies([{
				title: 'Hello world',
				x: 26 * rand(),
				y: 26 * rand(),
				color: '#15c2d2'
			}, {
				title: 'How are you doing?',
				x: 26 * rand(),
				y: 26 * rand(),
				color: '#4ccef8'
			}, {
				title: 'Not another stickie!',
				x: 26 * rand(),
				y: 26 * rand(),
				color: '#deb4e3'
			}, {
				title: 'You shall not pass',
				x: 26 * rand(),
				y: 26 * rand(),
				color: '#f4a22e'
			}, {
				title: 'Chocolate and bananas for code monkeys',
				x: 26 * rand(),
				y: 26 * rand(),
				color: '#ffca45'
			}, {
				title: 'Vroom Vroom',
				x: 26 * rand(),
				y: 26 * rand(),
				color: '#e7524e'
			}, {
				title: 'Shake it baby!',
				x: 26 * rand(),
				y: 26 * rand(),
				color: '#be6ac8'
			}], {
				organization: organization,
				repository: repository
			});
			app.useLayout(Layouts.Views.Repository, {
			}).setViews({
				'article': new Wall.Views.Draggable({
					collection: stickies
				})
			}).render();
			stickies.fetch();
		},

		404: function () {
			app.useLayout(Layouts.Views['404'], {
			}).render();
		}

	});
});
