'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  _ = require('lodash'),
  $ = require('jquery'),
  User = require('../profile/user.model'),
  Observation = require('../observation/observation.model'),
  moment = require('moment');

var ClassDef = Marionette.LayoutView.extend({
  header: {
    titleKey: 'dashboard',
    buttons: {
      left: ['menu']
    }
  },
  template: require('./dashboard.tpl.html'),
  className: 'page dashboard ns-full-height',

  // affichage score sur clic dashboard
/*
  events: {
    'click .header': 'onHeaderClick',
    'click .js-btn-time-forest': 'onTimeForestClick'
  },
*/
  curTab: null,
  tabs: {
    missions: {
      getView: function() {
        return new(require('./dashboard_missions.view'))();
      }
    },
    logs: {
      getView: function() {
          return new(require('./dashboard_logs.view'))();
        }
        //ClassDef: require('./dashboard_logs.view')
    },
    observations: {
      getView: 'getObservationView',
    },
  },

  regions: {
    tabContent: '.tab-content'
  },

  initialize: function(options) {
    var self = this;
    this.defaultTab = _.keys(this.tabs)[0];
    this.curTab = options.tab || this.defaultTab;
    this.currentUser = User.getCurrent();
    this.listenTo(this.currentUser.get('timeForest'), 'change:progressLog', this.setUserSky);
    this.listenTo(User.collection.getInstance(), 'change:current', this.onCurrentUserChange);
//    this.listenTo(this.currentUser.getTimeForest(), 'change:total', this.displayTimeForest);

  },

  serializeData: function() {
    var observations = User.getCurrent().get('observations');

    this.tabs.observations.badge = _.filter(observations, function(obs) {
      return obs.get('shared') < 1;
    }).length;
    return {
      user: User.getCurrent().toJSON(),
      tabs: this.tabs
    };
  },

  onRender: function(options) {
    var self = this;
    this.displayTab();
    this.setUserSky();
//    this.displayTimeForest();
  },

  onCurrentUserChange: function(newUser, prevUser) {
//    this.stopListening(prevUser.getTimeForest());
    this.listenTo(newUser.getTimeForest(), 'change:total', this.displayTimeForest);
    this.render();
  },

  displayTimeForest: function() {
    var duration = User.getCurrent().getTimeForest().get('total');
    var display = moment.duration(duration, 'seconds').format('h[h] mm[min] ss[s]');
    if ( display.indexOf('min') < 0 )
      display = 0+'min '+display;
    if ( display.indexOf('h') < 0 )
      display = 0+'h '+display;
    this.$el.find('.js-count-time-forest').text(display);
  },

  onTimeForestClick: function(e) {
    if ( this.$el.find('.header').hasClass('show-score-explode') )
      return false;
    e.stopPropagation();
    User.getCurrent().getTimeForest().toggleStart();
  },

  setUserSky: function() {
    this.$el.find('.score-implode .user-sky').css({
      'background-position-y': (User.getCurrent().get('timeForest').get('progressLog')*100)+'%'
    });
  },

  onHeaderClick: function() {
    this.$el.find('.header').toggleClass('show-score-explode');
  },

  setTab: function(tab) {
    tab = tab || this.defaultTab;
    if (tab == this.curTab)
      return false;

    this.curTab = tab;
    this.displayTab();
  },

  displayTab: function() {
    var tab = this.tabs[this.curTab];
    //var tabView = tab.ClassDef ? new tab.ClassDef() : this[tab.getView]();
    this.showChildView('tabContent', _.isString(tab.getView) ? this[tab.getView]() : tab.getView());

    var $tabs = this.$el.find('.nav-tabs .tab');
    $tabs.removeClass('active');
    $tabs.filter('.tab-' + this.curTab).addClass('active');
  },

  getObservationView: function() {
    var self =this;
    var observations = Observation.collection.getInstance().clone();
    observations.comparator = function(model) {
        var comparator = model.get('date');
        return -comparator;
    };
    observations.sort();
    observations = observations.where({
      userId: User.getCurrent().get('id')
    });

    var ObservationsView = require('../observation/observation_list.view');
    return new ObservationsView({
      collection: new Backbone.Collection(observations)
    });

  }
});

module.exports = ClassDef;