'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    main = require('../main/main.view'),
    User = require('../profile/user.model'),
    Home = require('../home/home.view'),
    Clue = require('../clue/clue.view'),
    ObservationView = require('../observation/observation.view'),
    Dashboard = require('../dashboard/dashboard.view'),
    MissionsAroundMe = require('../mission/aroundme/missions_aroundme.view'),
    Router = require('../routing/router'),
    Profile = require('../profile/profile.view'),
    UpdatePassword = require('../profile/update_password.view'),
    Session = require('../main/session.model'),
    Login = require('../profile/login.view'),
    UserSelector = require('../profile/user_selector.view'),
    About = require('../about/about.view');

module.exports = Marionette.Object.extend({
  initialize: function(options) {
  },

  home: function() {
    var session = Session.model.getInstance();
    var user = User.getCurrent();

    if (!user.get('email')) {
      main.getInstance().rgMain.show(new Home({
        name: 'home',
        model: user,
      }), {
        preventDestroy: true
      });
    } else {
      Router.getInstance().navigate('#dashboard/missions', {
        trigger: true
      });
    }
  },

  clue: function(queryString) {
    var params = _.parseQueryString(queryString);
    if ( params.missionId && !params.missionIds )
      params.missionIds = params.missionId;
    if ( params.missionIds ) {
      params.missionIds = params.missionIds.split(',');
      params.missionIds = _.map(params.missionIds, _.parseInt);
    }
    main.getInstance().rgMain.show(new Clue({
      name: 'clue',
      missionIds: params.missionIds
    }), {
      preventDestroy: true
    });
  },

  observationId: function(id) {
    var Observation = require('../observation/observation.model');
    var currentObservation = Observation.collection.getInstance().get(id);
    main.getInstance().rgMain.show(new ObservationView.Page({
      name: 'observation',
      model: currentObservation
    }), {
      preventDestroy: true
    });
  },

  dashboard: function(tab) {
    var rgMain = main.getInstance().rgMain;
    var currentIsDashboard = (rgMain.currentView && rgMain.currentView.getOption('name') == 'dashboard');

    if (!currentIsDashboard) {
      rgMain.show(new Dashboard({
        name: 'dashboard',
        tab: tab,
      }), {
        preventDestroy: true
      });
    } else
        rgMain.currentView.setTab(tab);
  },

  missionSheet: function(idm, id) {
    id = _.parseInt(id);
    idm = _.parseInt(idm);
    var MissionModel = require('../mission/mission.model');
    var mission = MissionModel.collection.getInstance().get(idm);
    mission.taxon = require('../taxons/taxons.model');
    var taxon = mission.taxon.collection.getInstance().get(id);

    var View = require('../mission/sheet/mission_sheet.view');
    main.getInstance().rgMain.show(new View({
      mission: mission,
      model: taxon
    }), {
      preventDestroy: true
    });
  },

  missionHome: function(id) {
    id = _.parseInt(id);
    var View ;
    var MissionModel = require('../mission/mission.model');
    var mission = MissionModel.collection.getInstance().get(id);
    var taxons = mission.get('taxon');
    // mission n taxon or mission 1 taxon
    if (taxons.length >= 2) {
      View = require('../mission/home/mission_home.view');
      main.getInstance().rgMain.show(new View({
        model: mission,
        collection: taxons
      }), {
        preventDestroy: true
      });
    } else {
      View = require('../mission/sheet/mission_sheet.view');
      main.getInstance().rgMain.show(new View({
        mission: mission,
        model: taxons.models[0],
        isMission: true
      }), {
        preventDestroy: true
      });
    }

  },

  missionsAll: function() {
    var Mission = require('../mission/mission.model');
    var MissionsAllFilter = require('../mission/all/missions_all_filter.view');
    var missions = Mission.collection.getInstance().clone();
    var params = MissionsAllFilter.getFilters() || {};

    var difficulty = params.difficulty;
    var startAt = params.startAt;
    var endAt = params.endAt;
    var removables = [];
    missions.forEach(function(mission) {
      var isMatch = true;
      if (isMatch && !_.isEmpty(difficulty)) {
        isMatch = false;
        difficulty.forEach(function(diff) {
          if (diff == mission.attributes.difficulty)
            isMatch = true;
       });
      }
      if (isMatch && (startAt || endAt) && !mission.isInSeason(startAt, endAt))
        isMatch = false;
      if (!isMatch)
        removables.push(mission);
    });
    if (removables.length)
        missions.remove(removables);

    var View = require('../mission/all/missions_all.view');
    main.getInstance().rgMain.show(new View({
      collection: missions,
      filterable: true
    }), {
      preventDestroy: true
    });
  },

  missionsAllFilter: function() {
    var View = (require('../mission/all/missions_all_filter.view')).getClass();
    main.getInstance().rgMain.show(new View(), {
      preventDestroy: true
    });
  },
/*
  missionsTraining: function() {
    var Mission = require('../mission/mission.model');
    var missions = new Backbone.Collection(Mission.collection.getInstance().where({difficulty: 0}));
    var View = require('../mission/all/missions_all.view');
    main.getInstance().rgMain.show(new View({
      collection: missions
    }), {
      preventDestroy: true
    });
  },
*/
/*
  _missionsAroundMe: function(options) {
    var rgMain = main.getInstance().rgMain;
    var state = options.state || {};

    if (rgMain.currentView && rgMain.currentView.getOption('name') == 'missionsAroundMe') {
      rgMain.currentView.setState(state.name, state.args);
      return false;
    }
*/
    /*var user = User.getCurrent();

    if (state.name != 'manually') {
      if (!user.get('departements').length)
          state.name = 'localize';
      else
          state.name = 'list';
    }

    rgMain.show(new MissionsAroundMe({
      name: 'missionsAroundMe',
      state: state
    }), {
      preventDestroy: true
    });
  },

  missionsAroundMe: function() {
    var user = User.getCurrent();
    var state;
    if ( user.get('departementIds').length && user.get('forceDepartement') )
      state = 'list';
    else
      state = 'localize';
    this._missionsAroundMe({
      state: {
        name: state
      }
    });
  },

  missionsAroundMeManually: function(queryString) {
    var params = _.parseQueryString(queryString);
    this._missionsAroundMe({
      state: {
        name: 'manually'
      }
    });
  },

  missionsAroundMeTab: function(tabSlug) {
    this._missionsAroundMe({
      state: {
        name: 'list',
        args: {
          tab: 'tab-' + tabSlug
        }
      }
    });
  },
  */
  profile: function() {
    var user = User.getCurrent();

    main.getInstance().rgMain.show(new Profile.Page({
      model: user,
      name: 'profile'
    }), {
      preventDestroy: true
    });
  },
  registration: function() {
    var user = new (User.model.getClass())();

    main.getInstance().rgMain.show(new Profile.Page({
      model: user,
      name: 'profile'
    }), {
      preventDestroy: true
    });
  },
  userSelector: function() {
    main.getInstance().rgMain.show(new UserSelector.Page({
      name: 'user_selector'
    }), {
      preventDestroy: true
    });
  },
  login: function(id) {
    var user = null;
    if ( id )
      user = User.collection.getInstance().get(id);
    main.getInstance().rgMain.show(new Login.Page({
      name: 'login',
      model: user
    }), {
      preventDestroy: true
    });
  },
  updatePassword: function() {
    var user = User.getCurrent();

    main.getInstance().rgMain.show(new UpdatePassword.Page({
      name: 'updatepassword',
      model: user
    }), {
      preventDestroy: true
    });
  },

  about: function() {
    main.getInstance().rgMain.show(new About.Page({
      name: 'about'
    }), {
      preventDestroy: true
    });
  }
});
