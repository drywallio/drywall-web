define([
  'handlebars',
  'handlebars-helpers-pack/currency',
  'handlebars-helpers-pack/encodeURIComponent',
  'handlebars-helpers-pack/json'
], function (
  Handlebars,
  currency_helper,
  encodeURIComponent_helper,
  json_helper
) {
  Handlebars.registerHelper('$', currency_helper);
  Handlebars.registerHelper('encodeURIComponent', encodeURIComponent_helper);
  Handlebars.registerHelper('json', json_helper);

  return Handlebars;
});
