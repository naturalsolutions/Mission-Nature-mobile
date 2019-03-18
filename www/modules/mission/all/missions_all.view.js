'use strict';
var Marionette = require('backbone.marionette'),
    Header = require('../../header/header'),
    Router = require('../../routing/router'),
    _ = require('lodash'),
    MissionListItem = require('../list_item/mission_list_item.view'),
    User = require('../../profile/user.model'),
    Help = require('../../main/help.model'),
    Footer = require('../../footer/footer.view');

module.exports = Marionette.CompositeView.extend({
  template: require('./missions_all.tpl.html'),
  className: 'page page-missions page-missions-all page-scrollable',
  childView: MissionListItem,
  childViewContainer: '.items',
  events: {},

  initialize: function(options) {
    var self = this;
//    this.header = {
  //    titleKey: 'missions'
    //};
    // FILTRE DES MISSIONS
    if ( !options.filterable ) {
      this.header = {
        titleKey: 'missions'
      };
    } else {
      this.header = {
        titleKey: 'missions',
        buttons: {
          right: ['option']
        }
      };
      this.listenTo(Header.getInstance(), 'btn:option:click', function(e) {
        Router.getInstance().navigate('missions/all/filter', {
          trigger: true
        });
      });
    }
    this.listenTo(Footer.getInstance(), 'btn:clue:click', function(e) {
      e.preventDefault();
      var ids = self.collection.pluck('id');
      Router.getInstance().navigate('clue?missionIds='+ids.join(), {trigger:true});
    });

    var queryHash = window.location.hash;
    var params = _.parseQueryHash(queryHash);

    var currentUser = User.getCurrent();
    var helps = Help.collection.getInstance();

    helps.someHelp(params);
  },

  onShow: function() {
    var self = this;
  },

  onDestroy: function() {
    var self = this;
  }
});
