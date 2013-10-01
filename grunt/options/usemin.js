module.exports = {
	options: {
		dirs: ['<%= staging %>']
	},
	templates: {
		options: {
			type: 'html',
			basedir: '.'
		},
		files: [{
			src: ['<%= staging %>/templates/**/*.html']
		}]
	},
	css: ['<%= staging %>/styles/app.css'],
	html: ['<%= staging %>/index.html']
};
