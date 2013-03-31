define(['underscore', 'backbone'],
function (_, Backbone) {
	return Backbone.Model.extend({
		url: function () {
			return 'Backbone.Session';
		},
		initialize: function (properties, options) {
			this.options = options || {};
			this.fetch();
		},
		sync: function (method, model, options) {
			options = options || {};
			var url = this.options.url || this.url,
				key = _.isFunction(url) ? url() : '' + url,
				response;
			switch (method) {
			case 'create':
			case 'update':
				var data = JSON.stringify(this.toJSON());
				response = localStorage.setItem(key, data);
				break;
			case 'delete':
				response = localStorage.removeItem(key);
				break;
			case 'read':
				response = JSON.parse(localStorage.getItem(key));
				break;
			}
			if (_.isFunction(options.success)) {
				options.success(this, response);
			}
		},
		signIn: function (options) {
			options = options || {};
			console.log('Override the signIn method');
			if (_.isFunction(options.error)) { options.error(this); }
		},
		signOut: function (options) {
			options = options || {};
			this.destroy();
			this.clear();
			this.trigger('signOut');
			if (_.isFunction(options.success)) { options.success(this); }
		},
		getAuthStatus: function (options) {
			options = options || {};
			console.log('Override the getAuthStatus method');
			if (_.isFunction(options.error)) { options.error(this); }
		}
	});
});
