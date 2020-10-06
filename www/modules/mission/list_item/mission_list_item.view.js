'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    _ = require('lodash'),
    $ = require('jquery'),
    i18n = require('i18next'),
    User = require('../../profile/user.model.js');

var View = Marionette.ItemView.extend({
  template: require('./mission_list_item.tpl.html'),
  className: 'media mission-list-item',
  events: {
    'click .js-link-mission': 'onLinkClick'
  },
  initialize: function(options) {
    this.options = options;
  },

  serializeData: function() {
    return {
      mission: this.model.toJSON()
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
