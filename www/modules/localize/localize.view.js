'use strict';

var Marionette = require('backbone.marionette'),
    Header = require('../header/header');

module.exports = Marionette.LayoutView.extend({
  template: require('./localize.tpl.html'),
  className: 'state state-localize',
  events: {},

  initialize: function(options) {
    this.options = options;

    // Cordova env use background geolocation
    var CurrentPos;
    if(window.cordova && window.BackgroundGeolocation) {
      CurrentPos = require('../localize/bg_position.model');
    } else {
      CurrentPos = require('../localize/current_position.model');
    }

    this.currentPos = CurrentPos.model.getInstance();
    this.maxDuration = this.currentPos.options.timeout;

    Header.getInstance().set({
      titleKey: 'missionsAroundmeLocalize'
    });
  },

  onShow: function() {
    this.$progressBar = this.$el.find('.progress-bar');

    if ( this.options.$placeholder ) {
      this.$el.append(this.options.$placeholder);
    }

    this.watchCurrentPos();
    this.getCurrentLocation();
  },

  stopTimer: function() {
    if ( this.interval )
      clearInterval(this.interval);
  },

  getCurrentLocation: function() {
    var self = this;
    var start = new Date();
    self.$progressBar.css({
      width: '0%'
    });
    this.interval = setInterval(function() {
      var duration = new Date() - start;
      var ratio = Math.min(100, duration/self.maxDuration*100);
      self.$progressBar.css({
        width: Math.round(ratio)+'%'
      });
    }, 1000);
    setTimeout(function() {
      self.currentPos.getCurrentLocation().then(function(success) {
        if ( !self.willBeDestroyed )
        self.onPositionSucess();
      }, function(error) {
        if ( !self.willBeDestroyed )
        self.onPositionError(error);
      });
    }, 100);
  },

  onPositionError: function(error) {
    var self = this;
    this.stopTimer();
    var msgerror = this.currentPos.positionError(error);
    var currentDialog = require('bootstrap-dialog').confirm({
      title: 'Problème de géolocalisation',
      message: msgerror,
      btnCancelLabel: 'Saisir votre département',
      btnOKLabel: 'Réessayer automatiquement',
      callback: function(result) {
          // result will be true if button was click, while it will be false if users close the dialog directly.
          if(result) {
            self.watchCurrentPos();
          }else {
            self.triggerMethod('abort');
          }
      }
    });
    currentDialog.getModalFooter().find('.btn').addClass('btn-block');
  },

  onPositionSucess: function() {
    var self = this;
    this.stopTimer();
    self.$progressBar.css({
      width: '100%'
    });
    setTimeout(function() {
      self.triggerMethod('success');
    }, 700);
  },

  onDestroy: function() {
    this.stopTimer();
  }
});
