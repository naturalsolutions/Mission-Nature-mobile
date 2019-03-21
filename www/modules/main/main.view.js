'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  MainRegion = require('./main.region'),
  footer = require('../footer/footer.view'),
  header = require('../header/header'),
  sidenav = require('../sidenav/sidenav'),
  $ = require('jquery'),
  _ = require('lodash'),
  Dialog = require('bootstrap-dialog'),
  i18n = require('i18next'),
  moment = require('moment'),
//  TimeForest = require('../time_forest/time_forest.model'),
  Router = require('../routing/router'),
  Session = require('./session.model'),
  User = require('../profile/user.model'),
//  Departement = require('./departement.model'),
  Help = require('./help.model'),
  CurrentPos = require('../localize/current_position.model');

var Layout = Marionette.LayoutView.extend({
  el: '.app',
  template: require('./main.tpl.html'),
  className: 'ns-full-height',

  initialize: function() {
    var self = this;
    this.dialogs = [];
   var currentPos = CurrentPos.model.getInstance();
    currentPos.on('change', function() {
      var lat = _.get(currentPos.get('coords'), 'latitude', '');
      var lon = _.get(currentPos.get('coords'), 'longitude', '');
      var timeStamp = currentPos.get('timestamp');
      var user = User.getCurrent();

      // if ( !user.get('forceDepartement') ) {
      //   var selectedDepartements = Departement.collection.getInstance().clone();
      //   selectedDepartements.forEach(function(departement) {
      //     var distFromUser = _.getDistanceFromLatLonInKm(lat, lon, departement.get('lat'), departement.get('lon'));
      //     departement.set('distFromUser', distFromUser);
      //   });
      //   selectedDepartements.comparator = 'distFromUser';
      //   selectedDepartements.sort();

      //   var i = 1;
      //   while (selectedDepartements.at(i)) {
      //     var departement = selectedDepartements.at(i);
      //     if (departement.get('distFromUser') <= 150)
      //         i++;
      //     else {
      //       selectedDepartements.remove(departement);
      //     }
      //   }
      //   user.set('departementIds', selectedDepartements.pluck('id'));
      // }
      user.save();
    });
    currentPos.on('unwatch', function() {
      var user = User.getCurrent();
      user.set('departementIds', []);
    });
    currentPos.watch();
/*
    var timeForest = User.getCurrent().get('timeForest');
    if(timeForest.get('isStart'))
      timeForest.start(timeForest.get('startTime'), timeForest.get('curCountTotalInit'));
*/
    this.Help = require('./help.model');
    var queryHash = window.location.hash;
    var params = _.parseQueryHash(queryHash);
    var currentUser = User.getCurrent();
    var helps = this.Help.collection.getInstance();
    helps.each(function(help){
      self.listenTo(currentUser, 'change:displayHelp'+help.get('id'),
        function(){
          helps.someHelp(help.get('id'));
        }
      );
    });

  },

  regions: {
    rgHeader: 'header',
    rgSidenav: 'aside',
    rgMain: new MainRegion({
      el: 'main'
    }),
    rgFooter: 'footer'
  },

  render: function(options) {
    var self = this;
    Marionette.LayoutView.prototype.render.apply(this, options);

    this.rgHeader.show(header.getInstance());
    this.rgSidenav.show(sidenav.getInstance());
    this.rgFooter.show(footer.getInstance());
  },

  /*onCurrentUserChange: function(currentUser, prev) {
    var self = this;
    if (prev)
      this.stopListening(prev);
    this.listenTo(currentUser, 'change:level', function(model, level) {
      if (!level)
        return false;
      self.addDialog({
        cssClass: 'theme-primary with-bg-forest user-score user-level-' + level,
        badgeClassNames: 'badge-circle bg-wood border-brown text-white',
        title: i18n.t('dialogs.level.title'),
        message: i18n.t('dialogs.level.message.level_' + level),
        button: i18n.t('dialogs.level.button')
      });
    });
    this.listenTo(currentUser, 'change:palm', function(model, palm) {
      if (!palm)
        return false;
      var palmName = currentUser.get('palmName');
      var nbCompleted = currentUser.get('completedMissions').length;
      self.addDialog({
        cssClass: 'theme-primary with-bg-forest user-score user-palm-' + palmName,
        badgeClassNames: 'badge-circle bg-wood border-brown text-white',
        badge: nbCompleted + '<div class="text-xs text-bottom">' + i18n.t('mission.label', {
          count: nbCompleted
        }) + '</div>',
        title: i18n.t('dialogs.palm.title'),
        message: i18n.t('dialogs.palm.message.' + palmName),
        button: i18n.t('dialogs.palm.button')
      });
    });
  },*/

  addDialog: function(data) {
    var self = this;
    var message = (!data.badge && !data.badgeClassNames) ? '' : '<div class="badge ' + (data.badgeClassNames || '') + '">' + (data.badge || '') + '</div>';
    message += '<div class="floating floating-bottom full-w"><h3>' + data.title + '</h3><p>' + data.message + '</p></div>';

    var dialog = new Dialog({
      message: message,
      cssClass: 'fs-dialog text-center ' + data.cssClass,
      buttons: [{
        label: data.button,
        //cssClass: 'btn-primary',
        action: function(dialog) {
          dialog.close();
        }
      }],
      onhidden: function(dialog) {
        self.dialogs.shift();
        self.openDialog();
      }
    });
    this.dialogs.push(dialog);
    if (this.dialogs.length == 1)
      this.openDialog();
  },

  addDialogHelp: function(data) {
    var self = this;
    var queryHash = window.location.hash;
    var queryParams = _.parseQueryHash(queryHash);
    var title = (data && data.title) ? '<span class="btn-lg btn-fab bg-blue-royal btn-inner-border"> <span class="icon icomoon">help</span> </span><p>'+ data.title + '</p>' : '<span class="btn-lg btn-fab bg-blue-royal btn-inner-border"> <span class="icon icomoon">help</span> </span>';
    var message = (data && data.description) ? data.description : '<p class="description" > Description de l\'aide</p>';
    var dialog = new Dialog({
      title: title,
      message: message,
      cssClass: 'dialog-help',
      buttons: [{
        label: i18n.t('dialogs.help.btns.disable'),
        cssClass: 'btn-lg btn-block bg-gray-dark',
        action: function(dialog) {
          self.Help.collection.getInstance().stopHelp(queryParams);
          dialog.close();
        }
      }],
      onhidden: function(dialog) {
        self.dialogs.shift();
        self.openDialog();
      }
    });
    this.dialogs.push(dialog);
    if (this.dialogs.length == 1)
      this.openDialog();
  },

  openDialog: function() {
    if (!this.dialogs.length)
      return false;

    var dialog = this.dialogs[0];
    dialog.realize();
    if(dialog.options.cssClass !== "dialog-help")
      dialog.getModalHeader().hide();
    dialog.open();
  },

  blockUI: function() {
    $('body').addClass('block-ui');
  },

  unblockUI: function() {
    $('body').removeClass('block-ui');
  },

  showLoader: function() {
    $('.page-loader').addClass('display');
  },

  hideLoader: function() {
    $('.page-loader').removeClass('display');
  },

});

var instance = null;

module.exports = {
  init: function() {
    if (instance) {
      console.log('An instance still exists');
    } else {
      instance = new Layout();
    }
  },
  getInstance: function() {
    if (!instance) {
      console.log('You have to call init() first');
      return null;
    }
    return instance;
  }
};
