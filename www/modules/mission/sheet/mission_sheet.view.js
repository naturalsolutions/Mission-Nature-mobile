'use strict';
var Backbone = require('backbone'),
$ = require('jquery'),
  Marionette = require('backbone.marionette'),
  _ = require('lodash'),
  Observation = require('../../observation/observation.model'),
  Router = require('../../routing/router'),
  User = require('../../profile/user.model.js'),
  Header = require('../../header/header'),
  Help = require('../../main/help.model'),
  Credit = require('../../main/credit.model'),
  Footer = require('../../footer/footer.view');

module.exports = Marionette.LayoutView.extend({
  template: require('./mission_sheet.tpl.html'),
  events: {
    'click .btn-accept': 'onAcceptClick',
    'click .btn-sheet': 'openWindow',
    'click .btn-back': 'onBackClick'
  },
  attributes: function () {
    var user = User.getCurrent();
    var classNames = 'page page-mission_sheet';
    var mission =  _.get(this.options, 'mission', '');

    if (mission && user.hasCompletedMission(mission))
      classNames += ' is-complete';
    else if (mission && user.hasAcceptedMission(mission))
      classNames += ' is-accept';
    return {
      'class': classNames
    };
  },

  regions: {
    observations: '.observations'
  },

  initialize: function (option) {
    var self = this;
    var user = User.getCurrent();
    this.mission =  _.get(option, 'mission', '');
    this.isMission = _.get(option, 'isMission', false);

    var title = (this.isMission) ? this.mission.get('title') : this.model.get('title');
    this.header = {
      title: title,
      buttons: {
        left: ['back']
      }
    };

    this.listenTo(user, 'change:acceptedMissions', this.onAcceptChange);
    this.listenTo(Observation.collection.getInstance(), 'add', function (observation) {
      observation.set({
        'missionId': self.mission.get('id'),
        'cd_nom': self.model.get('cd_nom')
      });
      observation.save();
    });

    var poster = (this.model.get('id') > 9 ? '' : '0') + this.model.get('id') + '.jpg';
    this.posterURL = './images/mission_taxon/taxon/poster/' + poster;


    var credits = Credit.collection.getInstance();
    var currentCredits = this.model.getCredits(credits);
    this.creditsTaxon = currentCredits.findWhere({num: Number(self.model.get('id')), type:"taxon", nom_fichier:poster});

  },

  openWindow: function (ev) {
    var toOpen;
    if (ev.currentTarget.id === "url")
      toOpen = this.model.get('url');
    else
      toOpen = ev.currentTarget.innerHTML;
    window.open(toOpen, '_blank');
  },

  onRender: function () {
    var self = this;
    var user = User.getCurrent();
    var observations = Observation.collection.getInstance();
    observations = observations.where({
      userId: user.get('id'),
      missionId: self.mission.get('id')
    });
    var ObservationsView = require('../../observation/observation_list.view');
    this.showChildView('observations', new ObservationsView({
      collection: new Backbone.Collection(observations)
    }));

    this.setBadgeEnv();

  },

  setBadgeEnv: function() {
    var self = this;
    _.forEach(this.model.get('environments'), function(env) {
      if( ! env.label)
        return;
      switch (env.label) {
        case "affleurements rocheux":
          self.$el.find('.milieu-'+env.indice).addClass("grey");
          break;
        case 'forêts de conifères':
          self.$el.find('.milieu-'+env.indice).addClass("green");
          break;
        case "forêts de feuillus":
          self.$el.find('.milieu-'+env.indice).addClass("green-light");
          break;
        case "fourrés et boisements":
          self.$el.find('.milieu-'+env.indice).addClass("yellow");
          break;
        case "jardins et parcs":
          self.$el.find('.milieu-'+env.indice).addClass("pink");
          break;
        case "landes sèches":
          self.$el.find('.milieu-'+env.indice).addClass("orange");
          break;
        case "prairies":
          self.$el.find('.milieu-'+env.indice).addClass("grey-light");
          break;
        case "rivières, mares et étangs":
          self.$el.find('.milieu-'+env.indice).addClass("blue");
          break;
        case "vergers":
          self.$el.find('.milieu-'+env.indice).addClass("yellow-light");
          break;
        case "villages et zones urbaines":
          self.$el.find('.milieu-'+env.indice).addClass("orange-light");
          break;
        case "zones humides":
          self.$el.find('.milieu-'+env.indice).addClass("blue-light");
          break;
        default:
          console.log("wrong environment");
          break;
      }
    });
  },

  serializeData: function () {
    return {
      taxon: this.model.toJSON(),
      mission: this.mission.toJSON(),
      isMission: this.isMission,
      creditsTaxon: this.creditsTaxon ? this.creditsTaxon.toJSON() : "",
      posterURL: this.posterURL
    };
  },

  onAcceptClick: function (e) {
    var user = User.getCurrent();
    user.toggleAcceptedMission(this.mission);
    user.save();
  },

  onAcceptChange: function () {
    var user = User.getCurrent();
    if (user.hasAcceptedMission(this.mission))
      this.$el.addClass('is-accept');
    else
      this.$el.removeClass('is-accept');
  },

  onBackClick: function () {
    Router.getInstance().back();
  },

  onDestroy: function () {
    var self = this;
  }
});