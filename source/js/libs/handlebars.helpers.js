define([
	'handlebars',
	'helpers/currency',
	'helpers/encodeURIComponent'
], function (
	Handlebars,
	currency,
	encodeURIComponent_helper
) {
	Handlebars.registerHelper('$', currency);
	Handlebars.registerHelper('encodeURIComponent', encodeURIComponent_helper);

	return Handlebars;
});
