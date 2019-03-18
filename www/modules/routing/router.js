'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  $ = require('jquery'),
  _ = require('lodash');

var Router = Marionette.AppRouter.extend({
  lastHistoryUrl: '',
  isOutOfHistory: false,
  nbRoutesOutOfHistory: 0,
  isGoingBackward: false,
  initialize: function() {
    var self = this;
    this.listenTo(this, 'route', function (name, args) {
      if ( self.isOutOfHistory ) {
        if ( !self.isGoingBackward )
          self.nbRoutesOutOfHistory++;
        if ( !self.nbRoutesOutOfHistory )
          self.stopOutOfHistory();
      }
      this.isGoingBackward = false;
    });
    document.addEventListener('backbutton', function(e) {
      e.preventDefault();
      _.defer(function() {
         if ( !e.isDefaultPrevented )
           self.back();
       });
    }, false);
  },

  execute: function(callback, args, name) {
    var Dialog = require('bootstrap-dialog');
    if(Dialog.dialogs)
      $.each(Dialog.dialogs, function(id, dialog){
        if(dialog.options.cssClass && dialog.options.cssClass === "dialog-help")
          dialog.close();
      });
    if (callback)
      callback.apply(this, args);
  },

  startOutOfHistory: function() {
    this.lastHistoryUrl = window.location.href;
    this.isOutOfHistory = true;
    this.nbRoutesOutOfHistory = 0;
  },

  stopOutOfHistory: function() {
    this.lastHistoryUrl = '';
    this.isOutOfHistory = false;
    this.nbRoutesOutOfHistory = 0;
  },

  back: function() {
    this.isGoingBackward = true;
    if ( !this.isOutOfHistory )
      window.history.back();
    else {
      this.nbRoutesOutOfHistory--;
      if ( window.location.href != this.lastHistoryUrl )
        window.history.back();
      else {
        window.history.go(-(2+this.nbRoutesOutOfHistory));
        this.stopOutOfHistory();
      }
    }
  },



  appRoutes: {
    '': 'home',
    'observation/:id': 'observationId',
    'dashboard(/:tab)': 'dashboard',
    'clue': 'clue',
    'mission/:id': 'missionHome',
    'mission/:idm/taxon/:id': 'missionSheet',
//    'missions/aroundme': 'missionsAroundMe',
//    'missions/aroundme/manually': 'missionsAroundMeManually',
    //'missions/aroundme/tab-:tab': 'missionsAroundMeTab',
    'missions/all': 'missionsAll',
    'missions/all/filter': 'missionsAllFilter',
//    'missions/training': 'missionsTraining',
    'profile': 'profile',
    'registration': 'registration',
    'updatepassword': 'updatePassword',
    'user-selector': 'userSelector',
    'login(/:id)': 'login'
  },
});

var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance)
      instance = new Router({
        controller: new(require('./router_controller'))()
      });
    return instance;
  }
};