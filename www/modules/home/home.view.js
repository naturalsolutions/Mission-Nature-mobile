'use strict';

var Backbone = require('backbone'),
  $ = require('jquery'),
  _ = require('lodash'),
  Marionette = require('backbone.marionette');

var Layout = Marionette.LayoutView.extend({
  header: 'none',
  template: require('./home.tpl.html'),
  className: 'page home ns-full-height container',
  events: {},

  initialize: function() {},
  serializeData: function() {},

  onRender: function(options) {},

  onShow: function() {
    $('body').addClass('footer-none');
  },
  onBeforeDestroy: function(options) {
    $('body').removeClass('footer-none');
  }
});

module.exports = Layout;