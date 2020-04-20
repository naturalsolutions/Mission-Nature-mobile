'use strict';
var Backbone = require('backbone'),
  config = require('../main/config'),
  _ = require('lodash'),
  time_forest = require('../time_forest/time_forest.model'),
  $ = require('jquery');

Backbone.LocalStorage = require('backbone.localstorage');

var UserModel = Backbone.Model.extend({
  defaults: {
    externId: '',
    firstname: '',
    lastname: '',
    nickname: '',
    email: '',
    isCurrent: false,
    language: 'fr',
    totalTimeOnMission: 0,
    newsletter: false,
//    departementIds: [],
   positionEnabled: true,
    nbComputedObs: 0,
    level: 0,
    palm: 0,
    acceptedMissionIds: [],
    completedMissionIds: []
  },
  url: config.coreUrl,

  get: function(attr) {
    var self = this;

    var accessorName = 'get' + _.upperFirst(attr);
    if (self[accessorName]) {
      return self[accessorName]();
    }
    return Backbone.Model.prototype.get.call(self, attr);
  },

  getTimeForest: function(){
    //var currentTimeForest = time_forest.collection.getInstance().getCurrentUserTimeForest();
    var collection = time_forest.collection.getInstance();
    var timeForest = collection.findWhere({
      uid: this.get('id')
    });
    if (!timeForest) {
      timeForest = new (time_forest.model.getClass())();
      timeForest.set('uid', this.get('id'));
      collection.add(timeForest)
        .save();
    }

    return timeForest;
  },

  getHasCity: function() {
    return this.get('city') && this.get('city').code;
  },

  toJSON: function() {
    var self = this;
    var result = Backbone.Model.prototype.toJSON.apply(self, arguments);
    _.forEach(['palmName', 'timeOnMissionLevel'], function(attr) {
      result[attr] = self['get' + _.upperFirst(attr)]();
    }, this);

    if (result.mission)
      result.mission = result.mission.toJSON();

    return result;
  },
  isAnonymous: function() {
    return !this.get('email');
  },

  getPalmName: function() {
    var self = this;

    var names = ['bronze', 'silver', 'gold'];
    var palm = self.get('palm');

    return names[palm - 1] || '';
  },
  getTimeOnMissionLevel: function() {
    return 1;
  },

  addLog: function(type, data) {
    var logs = require('../logs/log.model').collection.getInstance();
    logs.add({
      userId: this.get('id'),
      type: type,
      data: data
    }).save();
  },

  getLogs: function() {
    var logs = require('../logs/log.model').collection.getInstance();
    return new Backbone.Collection(logs.where({
      userId: this.get('id')
    }));
  },

  getAcceptedMissions: function() {
    return this.getMissions('accepted');
  },
  toggleAcceptedMission: function(mission) {
    if (!this.hasCompletedMission(mission)) {
      var result = this.toggleMission(mission, 'accepted');
      this.addLog((result ? 'mission_accept' : 'mission_unaccept'),{
        mission: {
          id: Number(mission.get('id')),
          num: mission.get('num'),
          title: mission.get('title')
        }
      });
    }
  },
  hasAcceptedMission: function(mission) {
    return this.hasMission(mission, 'accepted');
  },

  getCompletedMissions: function() {
    var missionIds = this.get('completedMissionIds');
    var missions = require('../mission/mission.model').collection.getInstance();
    return missions.filter(function(mission) {
      return missionIds.indexOf(Number(mission.get('id'))) > -1;
    });
  },
  addCompletedMission: function(mission) {
    var result = this.addMission(mission, 'completed');
    this.addLog('mission_complete', {
      mission: {
        id: Number(mission.get('id')),
        num: mission.get('num'),
        title: mission.get('title')
      }
    });
    return this;
  },
  hasCompletedMission: function(mission) {
    return this.hasMission(mission, 'completed');
  },

  getObservations: function() {
    var observations = require('../observation/observation.model').collection.getInstance();
    return observations.where({
      'userId': this.id
    });
  },

  getCompleteObservations: function() {
    var observations = this.get('observations');
    return observations.filter(function(obs) {
      return (obs.get('shared') > 0);
    });
  },

  getComputableObservations: function() {
    var observations = this.get('completeObservations');
    return observations.filter(function(obs) {
      //console.log("obs instanceof Backbone.Model", obs instanceof Backbone.Model);
      return obs.get('mission').get('difficulty') > 0;
    });
  },

  getMissions: function(listName) {
    var missionIds = this.get(listName + 'MissionIds');
    var missions = require('../mission/mission.model').collection.getInstance();
    return missions.filter(function(mission) {
      return missionIds.indexOf(Number(mission.get('id'))) > -1;
    });
  },
  addMission: function(mission, listName) {

    var missionIds = this.get(listName + 'MissionIds');
    missionIds.push(Number(mission.get('id')));
    this.trigger('change:' + listName + 'Missions', this);

    return true;
  },
  removeMission: function(mission, listName) {
    if (!this.hasMission(mission, listName))
      return false;

    var missionIds = this.get(listName + 'MissionIds');
    _.pull(missionIds, Number(mission.get('id')) );
    this.trigger('change:' + listName + 'Missions', this);

    return true;
  },
  toggleMission: function(mission, listName) {
    if (this.hasMission(mission, listName)) {
      this.removeMission(mission, listName);
      return false;
    }

    this.addMission(mission, listName);
    return true;
  },
  hasMission: function(mission, listName) {
    var id = mission.get ? Number(mission.get('id')) : mission.id;
    var missions = this.get(listName + 'MissionIds');

    return missions.indexOf(id) > -1;
  },
/*  getDepartement: function() {
    if ( !this.get('departementIds') || !this.get('departementIds')[0] )
      return null;
    var Departement = require('../main/departement.model');
    var id = this.get('departementIds')[0];

    return Departement.collection.getInstance().get(id);
  },*/

  computeScore: function() {
    var self = this;

    self.set('nbComputedObs', this.get('completeObservations').length);

    var computableObs = this.get('computableObservations');
    var nbComputedObs = computableObs.length;

    //TODO: define rules
    var palmPad = [3, 10, 30];
    for (var palmPadIndex = palmPad.length - 1; palmPadIndex >= 0; palmPadIndex--) {
      if (nbComputedObs >= palmPad[palmPadIndex]) {
        self.set('palm', palmPadIndex + 1);
        break;
      }
    }

    var difficultiesCompleted = _.countBy(computableObs, function(obs) {
      return obs.get('mission').get('difficulty');
    });
    //TODO: define rules
    for (var i = 2; i >= 0; i--) {
      if (difficultiesCompleted[i]) {
        self.set('level', i);
        break;
      }
    }
    self.save();
  }
});

var Collection = Backbone.Collection.extend({
  model: UserModel,
  url: '',
  localStorage: new Backbone.LocalStorage('userCollection'),
  initialize: function() {
    this.deferred = this.fetch();
  },
  getAnonymous: function() {
    var anonymous = this.findWhere({
      email: ''
    });
    //Create an anonymous if necessary
    if (!anonymous){
      anonymous = this.add(new UserModel());
      var Help = require('../main/help.model');
      anonymous.set('helps',Help.collection.getInstance());
      anonymous.save();
    }

    //Return the anonymous
    return anonymous;
  },
  setCurrent: function(model) {
    if ( model.get('email') )
      $('body').alterClass('*-anonymous', 'not-anonymous');
    else
      $('body').alterClass('*-anonymous', 'is-anonymous');

    var prev = this.getCurrent();
    if ( prev == model )
      return false;
    if ( prev ) {
      prev.set('isCurrent', false);
      prev.save();
    }
    model.set('isCurrent', true);
    model.save();
    this.current = model;
    this.trigger('change:current', model, prev);
  },
  getCurrent: function() {
    return this.current;
  },
  becomeAnonymous: function() {
    this.setCurrent(this.getAnonymous());
  }
});

var modelInstance = null;
var collectionInstance = null;

module.exports = {
  getCurrent: function() {
    return collectionInstance.getCurrent();
  },
  model: {
    clean: function() {
      if (modelInstance) {
        modelInstance = null;
      }
    },
    init: function(instance) {
      if (modelInstance) {
        console.log('An instance still exists');
        return false;
      }
      collectionInstance = new Collection();
      modelInstance = instance || collectionInstance.add(new UserModel());
    },
    setInstance: function(model) {
      modelInstance = model;
    },
    getInstance: function() {
      if (!modelInstance)
        console.log('You must call model.setInstance first');
      return modelInstance;
    },
    getClass: function() {
      return UserModel;
    }
  },
  collection: {
    getInstance: function() {
      if (!collectionInstance)
        collectionInstance = new Collection();
      return collectionInstance;
    }
  }
};
