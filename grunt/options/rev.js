module.exports = {
	js: {
		files: [{
			src: [
				'<%= staging %>/js/loader.js'
			]
		}]
	},
	css: {
		files: [{
			src: [
				'<%= staging %>/styles/app.css'
			]
		}]
	},
	assets: {
		files: [{
			src: [
				'<%= staging %>/img/**/*.{jpg,jpeg,gif,png,webp}',
				'<%= staging %>/fonts/**/*.{eot,svg,ttf,woff}'
			]
		}]
	}
};
