'use strict';

var Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    Router = require('../../routing/router'),
    User = require('../../profile/user.model'),
//    departement = require('../../main/departement.model'),
    Header = require('../../header/header');

module.exports = Marionette.LayoutView.extend({
  template: require('./missions_aroundme_manually.tpl.html'),
  className: 'state state-manually',
  events: {
    'click .btn-geoloc': 'onGeolocClick'
  },

  initialize: function(options) {
    this.options = options;

    Header.getInstance().set({
      titleKey: 'missionsAroundmeManually',
      buttons: {
        left: ['back']
      }
    });
  },

  onShow: function() {
/*    this.$el.find('input.js-autocomplete').autocomplete({
//      source: departement.collection.getInstance().toJSON(),
      appendTo: this.$el.find('.js-autocomplete-results'),
      _renderItem: function(ul, item) {
        var $li = $('<li />');
        $li.text(item.title).data(item).appendTo(ul);
        return ul;
      },
      select: function(event, ui) {
        var user = User.getCurrent();
        user.set({
          forceDepartement: true,
          departementIds: [ui.item.id]
        });
        user.save();
        Router.getInstance().navigate('#missions/aroundme', {trigger: true});
      }
    });*/
  },

  onGeolocClick: function() {
    var user = User.getCurrent();
    user.set({
      forceDepartement: false
    }).save();
    Router.getInstance().navigate('#missions/aroundme', {trigger: true});
  }
});
