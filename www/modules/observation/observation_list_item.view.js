'use strict';

var Marionette = require('backbone.marionette');

var View = Marionette.ItemView.extend({
  tagName: 'li',
  template: require('./observation_list_item.tpl.html'),
  attributes: function() {
    return {
      'class': 'observation-list-item pull-left shared-'+this.model.get('shared')
    };
  },
  serializeData: function() {
    return {
      observation: this.model.toJSON()
    };
  }
});

module.exports = View;
