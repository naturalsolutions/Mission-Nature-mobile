'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    _ = require('lodash'),
    $ = require('jQuery'),
    i18n = require('i18next'),
    User = require('../../profile/user.model.js');

var View = Marionette.ItemView.extend({
  template: require('./taxon_filter_item.tpl.html'),
  className: 'media taxon-filter-item',
  events: {
    'click .js-filter-taxon': 'onLinkClick'
  },
  initialize: function(options) {
    this.options = options;
  },

  serializeData: function() {
    return {
      taxon: this.model.toJSON(),
      mission_id: this.options.mission_id
    };
  },

  onRender: function(options) {
    var user = User.getCurrent();
    var isComplete = this.model.get('complete');

    if (user.hasCompletedMission(this.model))
    this.$el.addClass('is-complete');
    else if (user.hasAcceptedMission(this.model))
    this.$el.addClass('is-accept');
  },

  onLinkClick: function(e) {
    if ( this.options.cancelLink ) {
      this.trigger('click');
      e.preventDefault();
      return false;
    }
  }
});

module.exports = View;
