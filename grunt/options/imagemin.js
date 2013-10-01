module.exports = {
	images: {
		options: {
			optimizationLevel: 7,
			progressive: true
		},
		files: [{
			expand: true,
			src: ['<%= staging %>/img/**/*.{jpg,jpeg,png}'],
			dest: ''
		}]
	}
};
