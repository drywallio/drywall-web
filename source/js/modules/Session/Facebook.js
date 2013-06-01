define(['underscore', 'facebook', 'modules/Session/Base'],
function (_, FB, Session) {
	return Session.extend({
		signIn: function (options) {
			options = options || {};
			var that = this,
				authResponse = FB.getAuthResponse(),
				onSuccess = function (authResponse) {
					that.save(authResponse, {
						error: options.error,
						success: function () {
							that.trigger('signIn');
							if (_.isFunction(options.success)) {
								options.success();
							}
						}
					});
				};
			if (authResponse) {
				onSuccess(authResponse);
			} else {
				FB.login(function (response) {
					if (response.authResponse) {
						onSuccess(response.authResponse);
					} else {
						if (_.isFunction(options.error)) { options.error(); }
					}
				}, {scope: options.scope || ''});
			}
		},
		getAuthStatus: function (options) {
			options = options || {};
			FB.getLoginStatus(_.bind(function (response) {
				if (response.status === 'connected') {
					if (_.isFunction(options.success)) { options.success(); }
				} else {
					if (_.isFunction(options.error)) { options.error(); }
				}
			}, this));
		}
	});
});
