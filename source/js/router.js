define([
	'jquery', 'underscore', 'backbone', 'app',
	'modules/Layouts'
], function (
	$, _, Backbone, app,
	Layouts
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

		repository: function () {
			app.useLayout(Layouts.Views.Wall, {
			}).setViews({
			}).render();
		},

		404: function () {
			app.useLayout(Layouts.Views['404'], {
			}).render();
		}

	});
});
