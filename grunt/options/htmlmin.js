module.exports = {
	options: {
		removeComments: true,
		removeCommentsFromCDATA: true,
		removeCDATASectionsFromCDATA: true,
		collapseWhitespace: false,
		collapseBooleanAttributes: true,
		removeAttributeQuotes: true,
		removeRedundantAttributes: true,
		useShortDoctype: true,
		removeEmptyAttributes: true,
		removeOptionalTags: true,
		removeEmptyElements: false
	},
	html: {
		files: [{
			expand: true,
			src: [
				'<%= staging %>/index.html'
			]
		}]
	},
	templates: {
		files: [{
			expand: true,
			src: [
				'<%= staging %>/templates/**/*.html'
			]
		}]
	}
};
