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
			var stickies = new Wall.Collections.Stickies([], {
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
