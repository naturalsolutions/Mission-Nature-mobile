'use strict';

var Backbone = require('backbone'),
	Marionette = require('backbone.marionette'),
	_ = require('lodash'),
	$ = require('jquery'),
	bootstrap = require('bootstrap'),
	User = require('../../profile/user.model'),
	Mission = require('../../mission/mission.model'),
	Router = require('../../routing/router'),
  Header = require('../../header/header'),
  Footer = require('../../footer/footer.view');

var lastTabIndex = 0;

module.exports = Marionette.LayoutView.extend({
  template: require('./missions_aroundme_list.tpl.html'),
  className: 'state state-list',
  events: {
  },

  initialize: function() {
    var self = this;
    var user = User.getCurrent();
    var departementIds = user.get('departementIds');

    Header.getInstance().set({
      classNames: 'no-shadow',
      titleKey: 'missionsAroundme',
      buttons: {
        right: ['plus']
      }
    });
    
    this.collection = Mission.collection.getInstance().filter(function(mission) {
      var isInDepartement = mission.isInDepartement(departementIds);//_.intersection(departementIds, mission.get('departementIds')).length;
      var inSeason = mission.inSeason(new Date());
      return (isInDepartement && inSeason.isMatch);
    });

    this.collection = new Backbone.Collection(this.collection);

    var missions = this.collection.toJSON();
    missions = _.sortBy(missions, function(mission) {
      mission.isAccepted = user.hasAcceptedMission(mission);
      mission.isCompleted = user.hasCompletedMission(mission);
      return mission.inSeason.end.delta;
    });

    this.missionTabs = [];
    for (var i = 0; i <= 3; i++) {
      this.missionTabs.push({
        missions: _.where(missions, {difficulty: i})
      });
    }

    this.listenTo(Footer.getInstance(), 'btn:clue:click', function(e) {
      e.preventDefault();
      var tabIndex = self.$el.find('.js-nav-tabs > .active').index();
      var ids = _.pluck(self.missionTabs[tabIndex].missions, 'id');
      Router.getInstance().navigate('clue?missionIds='+ids.join(), {trigger:true});
    });

    /*_.forEach(self.collection, function(mission) {
    			console.log(mission);
    			var isInDepartement = mission.isInDepartement(departementIds);//_.intersection(departementIds, mission.get('departementIds')).length;
    			var isInSeason = mission.inSeason(new Date());
    			console.log(mission.get('title'), isInSeason);
    			if (!isInDepartement || !isInSeason)
    				self.collection.remove(mission);
    		});*/
  },

  serializeData: function() {
    var user = User.getCurrent();
    var departement;
    if ( user.get('departementIds').length && user.get('forceDepartement') )
      departement = user.get('departement');

    return {
      departement: (departement ? departement.toJSON() : null),
      missionTabs: this.missionTabs,
      lastTabIndex: lastTabIndex
    };
  },

  onShow: function() {
    var self = this;

    self.$el.find('.js-nav-tabs a').click(function(e) {
      e.preventDefault();
      $(this).tab('show');
      lastTabIndex = $(this).parent().index();
    });

    self.$el.find('.donutchart').nsDonutChart({
      onCreate: function(api) {

      }
    });
  },

  onDestroy: function() {
    var self = this;
  }
});
