module.exports = {
	source: {
		options: {
			compress: false,
			import: [
				'nib'
			]
		},
		files: {
			'<%= source %>/styles/app.css':
			'<%= source %>/styles/app.styl'
		}
	},
	staging: {
		options: {
			compress: true,
			import: [
				'nib'
			]
		},
		files: {
			'<%= staging %>/styles/app.css':
			'<%= staging %>/styles/app.styl'
		}
	}
};
