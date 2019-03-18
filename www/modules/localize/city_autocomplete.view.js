'use strict';

var Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    User = require('../profile/user.model'),
    City = require('./city.model');

module.exports = Marionette.LayoutView.extend({
  template: require('./city_autocomplete.tpl.html'),
  className: '',
  events: {
    'submit form': 'onFormSubmit',
  },

  initialize: function(options) {
    this.options = options;
  },

  onRender: function() {
    var self = this;
    var city = City.model.getInstance();
    this.$el.find('input.js-autocomplete').autocomplete({
      select: function(event, ui) {
        self.selectedItem = ui.item;
      },
      source: function(request, response) {
        response(city.search(request.term));
      },
      appendTo: self.$el.find('.js-autocomplete-results'),
      minLength: 2
    });
  },

  onFormSubmit: function(e) {
    var self = this;
    e.preventDefault();

    if ( !this.selectedItem )
      return false;

    if ( window.cordova && window.cordova.plugins.Keyboard.isVisible ) {
      self.onKeyboardhide = function() {
        window.removeEventListener('native.keyboardhide', self.onKeyboardhide);
        self.saveUser();
      };
      window.addEventListener('native.keyboardhide', self.onKeyboardhide);
    } else
      self.saveUser();
  },

  saveUser: function() {
    var user = User.getCurrent();
    user.set('city', this.selectedItem);
    user.save();
  },

  onDestroy: function() {
    var self = this;
  }
});
