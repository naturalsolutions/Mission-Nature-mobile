'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    _ = require('lodash'),
    $ = require('jquery'),
    header = require('../header/header');

var Region = Marionette.Region.extend({
  attachHtml: function(view) {
    var self = this;

    if (self.$el.children('div').length && self.currentView) {
      var last = self.currentView;
      last.willBeDestroyed = true;
      var $last = last.$el;
      $last.on('transitionend, webkitTransitionEnd', function(e) {
        if ($last.hasClass('animate-close')) {
          $last.removeClass('animate animate-close');
          last.destroy();
        }
      });
      $last.addClass('animate animate-close');
    }

    header.getInstance().set(view.header);
    /*self.app = require('app');
    		self.app.rootView.rgHeader.currentView.set(view.header);*/

    self.$el.prepend(view.el);
    $('body').alterClass('section-*', 'section-'+_.get(view, 'options.name', ''));
  }
});

module.exports = Region;
