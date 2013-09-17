define(['underscore', 'app', 'modules/Session/Base'],
function (_, app, Session) {
	var clientId = '0de51057b17b6c698ab8';
	return Session.extend({
		signIn: function () {
			var origin = location.origin ||
					(location.protocol + '//' + location.host);
			location.href = app.api('login/github/', {
				redirect_uri: origin + '/login/github/redirect/'
			});
		}
	});
});