define(
[
	'jquery', 'underscore', 'handlebars', 'backbone',
	'app',
	'router',
	'templates.built',
	'facebook',
	'modules/Session/Facebook',
	'helpers/currency'
],
function (
	$, _, Handlebars, Backbone,
	app,
	Router,
	templatesBuilt,
	FB,
	Session,
	currency
) {

	var JST = window.JST = _.extend(window.JST || {}, templatesBuilt);

	Backbone.Layout.configure({
		el: false,
		manage: true,
		prefix: '/templates/',
		fetch: function (path) {
			var prefix = Backbone.Layout.prototype.getAllOptions().prefix,
				bare = path.substr(prefix.length);

			if (JST[bare]) { return JST[bare]; }

			var done = this.async();
			$.get(path + '.html', function (response) {
				JST[bare] = Handlebars.compile(response);
				done(JST[bare]);
			}, 'text');
		}
	});

	Handlebars.registerHelper('$', currency);

	app.router = new Router();
	app.session = new Session();

	Backbone.history.start({
		pushState: true,
		root: app.root
	});

	$(document).ajaxError(function (event, request, settings, exception) {
		if (+request.status === 403 && settings.url.indexOf(app.api) !== -1) {
			// app.session.signOut();
			console.log('AJAX Error', exception);
		}
	});

	$(document).on('click', 'a:not([data-bypass])', function (event) {
		var href = $(this).prop('href'),
			baseURI = location.href.substr(0, location.href.indexOf('/', 8)),
			root = baseURI + app.root,
			isInternalLink = function (href, root) {
				return href && href.slice(0, root.length) === root;
			},
			holdingModifierKey = function (event) {
				return event.altKey ||
					event.ctrlKey ||
					event.metaKey ||
					event.shiftKey;
			};
		if (isInternalLink(href, root) && !holdingModifierKey(event)) {
			event.preventDefault();
			Backbone.history.navigate(href.slice(root.length), true);
			$(window).scrollTop(0);
		}
	});

	$(document).on('click', 'a.disabled	', function (event) {
		event.preventDefault();
	});

	/*
	var targetUrl = location.href.substr(location.href.indexOf('/', 8));

	app.session
		.on('signIn', function () {
			app.stream.go();
			var url = app.api + 'profile/';
			$.get(url).success(function (response) {
				_.extend(response, {dummy: true});
				app.session.save(response);
				Backbone.history.navigate('/dashboard', true);
			});
		})
		.on('signOut', function () {
			app.stream.pause();
			Backbone.history.navigate(app.root, true);
		});

	FB.init({
		appId: '219268451429695',
		channelUrl: 'https://www.redmart.com/channel.html',
		status: false,
		cookie: true,
		xfbml: false
	});

	if (app.session.id) {
		app.stream.go();
		if (targetUrl === app.root) {
			history.replaceState(null, '', '/dashboard');
		}
	}
	*/

});
