'use strict';

var Backbone = require('backbone'),
    $ = require('jquery'),
    _ = require('lodash'),
    i18n = require('i18next'),
    Marionette = require('backbone.marionette');

var Layout = Marionette.LayoutView.extend({
  header: {
    titleKey: 'settings',
    buttons: {
      left: ['back']
    }
  },
  template: require('./settings.tpl.html'),
  className: 'page settings ns-full-height',
  events: {},

  initialize: function() {},
  serializeData: function() {},

  onRender: function(options) {},

  onShow: function() {},

});

module.exports = Layout;
