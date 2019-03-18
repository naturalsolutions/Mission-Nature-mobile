'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    Mission = require('../mission/mission.model'),
    _ = require('lodash'),
    MissionListItem = require('../mission/list_item/mission_list_item.view'),
    Help = require('../main/help.model'),
    User = require('../profile/user.model');

var CollectionView = Marionette.CollectionView.extend({
  childView: MissionListItem
});

var ClassDef = Marionette.LayoutView.extend({
  template: require('./dashboard_missions.tpl.html'),
  className: 'inner missions',
  events: {
  },

  regions: {
    list: '.list-outer',
    listSuccessful: '.list-successful'
  },

  initialize: function() {
    var acceptedMissions = User.getCurrent().getAcceptedMissions();
    var completedMissions = User.getCurrent().getCompletedMissions();

    this.missions = _.filter(acceptedMissions, function(mission) {
      return completedMissions.indexOf(mission) == -1;
    });
    this.missions = _.sortBy(this.missions, function(mission) {
      return mission.inSeason().end.delta;
    });
    this.successfulMissions = User.getCurrent().getCompletedMissions();

    this.someHelp();
  },

  serializeData: function() {
    return {
      missions: this.missions,
      successfulMissions : this.successfulMissions
    };
  },

  someHelp: function(){
    var queryHash = window.location.hash;
    var params = _.parseQueryHash(queryHash);
    var currentUser = User.getCurrent();
    var helps = Help.collection.getInstance();
    helps.someHelp(params);
  },

  onRender: function() {
    var collectionView = new CollectionView({
      collection: new Backbone.Collection(this.missions)
    });
    var successfulMissionCollectionView = new CollectionView({
      collection: new Backbone.Collection(this.successfulMissions)
    });

    this.showChildView('list', collectionView);
    this.showChildView('listSuccessful', successfulMissionCollectionView);

  }
});

module.exports = ClassDef;
