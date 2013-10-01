module.exports = {
	options: {
		report: 'min'
	},
	compress: {
		src: ['<%= staging %>/styles/app.css'],
		dest: '<%= staging %>/styles/app.css'
	}
};
