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
			var rand = function (max) {
				var grid = 26;
				return Math.round(Math.random() * max / grid) * grid;
			};
			var randX = _.partial(rand, document.body.clientWidth - 320);
			var randY = _.partial(rand, document.body.clientHeight - 320);
			var stickies = new Wall.Collections.Stickies([{
				title: 'Hello world',
				x: randX(),
				y: randY(),
				color: '#15c2d2'
			}, {
				title: 'How are you doing?',
				x: randX(),
				y: randY(),
				color: '#4ccef8'
			}, {
				title: 'Not another stickie!',
				x: randX(),
				y: randY(),
				color: '#deb4e3'
			}, {
				title: 'You shall not pass',
				x: randX(),
				y: randY(),
				color: '#f4a22e'
			}, {
				title: 'Chocolate and bananas for code monkeys',
				x: randX(),
				y: randY(),
				color: '#ffca45'
			}, {
				title: 'Vroom Vroom',
				x: randX(),
				y: randY(),
				color: '#e7524e'
			}, {
				title: 'Shake it baby!',
				x: randX(),
				y: randY(),
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
