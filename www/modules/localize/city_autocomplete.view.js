'use strict';

var Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    User = require('../profile/user.model'),
    AutocompleteView = require('backbone-autocomplete'),
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
    var MyAutocomplete = AutocompleteView.extend({
      render: function render() {
        this.$el.html(this.template());
        this.resultsView.setElement(this.$('.ac-results'));
        this.$el.find('input').attr("placeholder", "Saisir une commune");
        return this;
      },
      onSelect: function(model){
          this.$el.find('input').val(model.get('label'));
          self.selectedItem = model;
      },
      doSearch: function() {
        if (!this.shouldSearch()) {
          return;
        }
        this.selectedModel = null;
        var filteredResults = this.collection.search(this.searchValue);
        this.resultsCollection.reset(filteredResults);
        this.resultsView.trigger('show');

      },
  });
 
  var nameCompletion = new MyAutocomplete({
      className: 'bb-autocomplete-custom',
      searchField: 'label', // setting the field to use as a search
      minimumInputLength: 2,
      collection: city,
  });
 
  nameCompletion.render().$el.appendTo(self.$el.find('.autocomplete-outer'));
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
