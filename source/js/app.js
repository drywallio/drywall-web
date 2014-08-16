define([
  'jquery', 'underscore', 'backbone',
  'backbone.layoutmanager',
  'libs/api',
  'constants',
  'env',
  'doctit'
], function (
  $, _, Backbone,
  LayoutManager,
  api,
  constants,
  env,
  doctit
) {
  var app = _.extend({

    el: '#app',

    root: '/',

    env: env,

    constants: constants,

    api: api(localStorage.getItem('api') === null ?
      env.api.base :
      localStorage.getItem('api')
    ),

    title: doctit,

    useLayout: function (layout, options) {
      options = options || {};

      if (_.isString(layout)) {
        if (this.layout) {
          this.layout.template = layout;
        } else {
          this.layout = new Backbone.Layout(_.extend({
            el: app.el,
            template: layout
          }, options));
        }
      }

      else if (
        (layout.prototype instanceof Backbone.Layout ||
          layout.prototype instanceof Backbone.View)
      ) {
        var Constructor = layout;
        if (this.layout) {
          this.layout.remove();
        }
        this.layout = new Constructor(options);
        $(app.el).empty().append(this.layout.el);
      }

      if (typeof this.layout.title === 'string') {
        app.title.message = this.layout.title;
      }

      return this.layout;
    }

  }, Backbone.Events);

  return app;
});
