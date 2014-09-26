define([
  'handlebars-helpers-pack/currency',
  'handlebars-helpers-pack/encodeURIComponent',
  'handlebars-helpers-pack/json',
  'handlebars-helpers-pack/date',
  'handlebars-helpers-pack/ifCond'
], function (
  currency_helper,
  encodeURIComponent_helper,
  json_helper,
  date_helper,
  ifCond_helper
) {
  var helpers = [
    {name: '$', fn: currency_helper},
    {name: 'encodeURIComponent', fn: encodeURIComponent_helper},
    {name: 'json', fn: json_helper},
    {name: 'date', fn: date_helper},
    {name: 'ifCond', fn: ifCond_helper}
  ];
  return {
    helpers: helpers,
    register: function (Handlebars) {
      helpers.forEach(function (helper) {
        Handlebars.registerHelper(helper.name, helper.fn);
      });
    }
  };
});
