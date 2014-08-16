define(['underscore', 'urlbuilder'], function (_, urlbuilder) {
  return function (apiBasePath, globalParameters) {
    if (apiBasePath[apiBasePath.length - 1] === '/') {
      apiBasePath = apiBasePath.substr(0, apiBasePath.length - 1);
    }
    return function (endpoint, fields, parameters) {
      var separator = /^\//.test(endpoint) ? '' : '/';
      return urlbuilder(
        apiBasePath + separator + endpoint,
        _.clone(fields),
        _.defaults(globalParameters || {}, parameters)
      );
    };
  };
});
