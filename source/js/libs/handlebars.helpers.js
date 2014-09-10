define([
  'handlebars.runtime',
  'handlebars-helpers-pack/currency',
  'handlebars-helpers-pack/encodeURIComponent',
  'handlebars-helpers-pack/json',
  'handlebars-helpers-pack/date'
], function (
  Handlebars,
  currency_helper,
  encodeURIComponent_helper,
  json_helper,
  date_helper
) {
  Handlebars.registerHelper('$', currency_helper);
  Handlebars.registerHelper('encodeURIComponent', encodeURIComponent_helper);
  Handlebars.registerHelper('json', json_helper);
  Handlebars.registerHelper('date', date_helper);

  return Handlebars;
});
