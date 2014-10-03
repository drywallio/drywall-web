define([
  'backbone',
  'backbone.localstorage'
],
function (
  Backbone,
  LocalStorage
) {
  var Models = {};
  var Collections = {};
  var Views = {};


  Collections.LastVisitedWalls = Backbone.Collection.extend({
    initialize: function (models, options) {
      this.options = options || {};
    },
    localStorage: new LocalStorage('Drywall-lastVisitedWalls'),
    comparator: function (model) {
      return -model.get('timestamp');
    },
    add: function (models, options) {
      var maxWalls = this.options.maxWalls || 3;
      if (this.length > maxWalls) {
        this.at(this.length - 1).destroy();
      }

      return Backbone.Collection.prototype.add.apply(this, arguments);
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});
