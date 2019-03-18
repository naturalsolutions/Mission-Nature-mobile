'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  $ = require('jquery'),
  Mission = require('../mission/mission.model'),
  MissionListItem = require('../mission/list_item/mission_list_item.view'),
  _ = require('lodash'),
  config = require('../main/config'),
  Help = require('../main/help.model'),
  User = require('../profile/user.model'),
  i18n = require('i18next');

var Layout = Marionette.LayoutView.extend({
  header: {
    titleKey: 'clue',
    buttons: {
      left: ['close']
    },
    classNames: 'brown'
  },
  template: require('./clue.tpl.html'),
  className: 'page page-scrollable clue no-footer-padding clearfix no-header',
  events: {
    'click .marker': 'onMarkerClick'
  },

  initialize: function(options) {
    var missionCollection = Mission.collection.getInstance();
    var missions = _.filter(missionCollection.toJSON(), function(mission) {
      return ( !options.missionIds || _.includes(options.missionIds, mission.id));
    });

    var environmentNames = _.uniq(_.flatten(_.pluck(missions, 'environments')));
    this.environments = {};
    _.forEach(environmentNames, function(environmentName) {
      var environmentConfig = {};//config.clueEnvironments[environmentName];
      if ( environmentConfig ) {
        var environmentMissions = _.filter(missions, function(mission) {
          return _.includes(mission.environments, environmentName);
        });
        this.environments[environmentName] = _.merge({
          missions: environmentMissions
        }, environmentConfig);
      }
    }, this);

    var MissionListView = Marionette.CollectionView.extend({
      tagName: 'ul',
      className: 'list-unstyled',
      childView: MissionListItem
    });
    this.missionListCollection = new Backbone.Collection();
    this.missionListView = new MissionListView({
      collection: this.missionListCollection
    });
    this.missionListView.render();


    var queryHash = window.location.hash;
    var params = _.parseQueryHash(queryHash);
    var currentUser = User.getCurrent();
    var helps = Help.collection.getInstance();

    helps.someHelp(params);
  },

  serializeData: function() {
    return {
      environments: this.environments
    };
  },

  onShow: function() {
    var self = this;
    var $img = this.$el.find('img.map');
    $img.load(function() {
      var imgW = $img.width();
      var w = self.$el.width();
      var scrollMax = imgW - w;
      self.$el.scrollLeft(scrollMax/2);
    });
  },

  onMarkerClick: function(e) {
    var $marker = $(e.currentTarget);
    var name = $marker.attr('name');
    var environment = this.environments[name];
    var missions = [];
    _.forEach(environment.missions, function(mission) {
      missions.push(Mission.collection.getInstance().get(mission.id));
    });
    this.missionListCollection.reset(missions);
    var Dialog = require('bootstrap-dialog');
    var dialog = Dialog.show({
      closable: true,
      title: i18n.t('clue.'+name),
      message: this.missionListView.$el
    });
    dialog.getModalBody().click(function() {
      dialog.close();
    });
  }
});

module.exports = Layout;
