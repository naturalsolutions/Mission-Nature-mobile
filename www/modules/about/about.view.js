'use strict';

var Backbone = require('backbone'),
    $ = require('jquery'),
    _ = require('lodash'),
    i18n = require('i18next'),
    Marionette = require('backbone.marionette');

var View = Marionette.LayoutView.extend({

  template: require('./about.tpl.html'),
  events: {
    'click #moreinfo': 'openInAppBrowser'
  },

  initialize: function() {},
  serializeData: function() {},

  openInAppBrowser: function(e){
    var self = this;
    var target = "_blank";
    var options = "location=yes";
    var url = "http://www.parc-naturel-normandie-maine.fr/agir/patrimoine_naturel/abc.html";

    var inAppBrowserRef;
    inAppBrowserRef = window.open(url, target, options);

  },

  onRender: function(options) {},

  onShow: function() {},

});
var Page = View.extend({
  header: {
    titleKey: 'about',
    buttons: {
      left: ['back']
    }
  },
  className: 'page about ns-full-height',
});

module.exports = {
  View: View,
  Page: Page
};
