'use strict';
var Backbone = require('backbone'),
  _ = require('lodash'), // FIXME: "_ = Backbone._" doesn't work... why?
  i18n = require('i18next'),
  $ = Backbone.$;
var BGLocationModel = Backbone.Model.extend({
  //_id: null,
  _dfd: null,
  _isConfigured: false,
  status:{
    isRunning: false
  },
  defaultOptions: {
    locationProvider: window.BackgroundGeolocation.ACTIVITY_PROVIDER,
    desiredAccuracy: window.BackgroundGeolocation.HIGH_ACCURACY,
    debug: true
  },
  _locationOptions: {
    enableHighAccuracy: true,
    maximumAge: 1000*60*10,
    timeout: 1000 * 60
  },
  initialize: function(options) {
    var self = this;

    // Allow user to customize geolocation options
    this.options = _.defaults(options || {}, this.defaultOptions);
    // configure BackgroundGeolocation
    this._configure();
    // Ensure geolocation callback are called in the context of this model instance
    this._success = _.bind(this._success, this);
    this._error = _.bind(this._error, this);

    // When model change global dfd is resolved and cleared
    this.on('change', function(msg) {
      self._dfd.resolve(self.attributes);
      self._dfd = null;
    });

    window.BackgroundGeolocation.on('start', function() {
      console.log('[INFO] window.BackgroundGeolocation service has been started');
    });

    window.BackgroundGeolocation.on('stop', function() {
      console.log('[INFO] window.BackgroundGeolocation service has been stopped');
    });

    window.BackgroundGeolocation.on('authorization', function(status) {
      console.log(
        '[INFO] window.BackgroundGeolocation authorization status: ' + status
      );
      if (status !== window.BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay after permission prompt or otherwise alert will not be shown
        self._showSettingsApp();
      }
    });

    window.BackgroundGeolocation.on('stationary', function (stationary) {
      console.log('[DEBUG] window.BackgroundGeolocation stationary', stationary);
      self._showLocation("stationary", stationary);
      window.BackgroundGeolocation.startTask(function(taskKey){
          // push location
          console.log('[DEBUG] window.BackgroundGeolocation stationary taskKey', stationary);
          window.BackgroundGeolocation.endTask(taskKey);
      });
    });

    window.BackgroundGeolocation.on('location', function(location) {
      console.log('[DEBUG] window.BackgroundGeolocation location', location);
      self._showLocation("location", location);
      window.BackgroundGeolocation.startTask(function(taskKey){
        // push location
        self.set({
          coords: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          timestamp: location.time,
          provider: location.provider,
          locationProvider: location.locationProvider,
          accuracy: location.accuracy
        });
        window.BackgroundGeolocation.endTask(taskKey);
      });
    });

    // Ne passe pas dedans
    window.BackgroundGeolocation.on('error', function(error) {
      console.log('[ERROR] window.BackgroundGeolocation error:', error.code, error.message);
      // TODO open setting location
    });

  },

  _success: function(position) {
    this.set({
      coords: {
        latitude: position.latitude,
        longitude: position.longitude
      },
      timestamp: position.time,
      provider: position.provider,
      locationProvider: position.locationProvider,
      accuracy: position.accuracy
    });
    this._showLocation("getCurrentlocation", position);
  },

  _error: function(error) {
    console.log('ERROR(' + error.code + '): ' + error.message);
    if ( error && (error.code === 1 || error.code === 3) ) {
      this._showLocationSettings();
    }
    this.trigger('error', this, error);
    var lastPosTime = this.get('timestamp') || 0;
    var now = Date.now();
    var diffTime = now - lastPosTime;
    if(diffTime > this._locationOptions.maximumAge) {
      this.clear();
    }
  },

  _showSettingsApp : function() {
    setTimeout(function() {
      var showSettings = confirm("L'application Mision nature sollicite la permission d'utiliser la position de votre appareil pour géocaliser vos observations." +
      "Voulez-vous ouvrir les préférences de l'application ?");
      if (showSettings) {
        return window.BackgroundGeolocation.showAppSettings();
      }
    }, 1000);
  },

  _showLocationSettings: function() {
    setTimeout(function() {
      var showSettings = confirm("L'application Mision nature sollicite d'activer la localisation pour géocaliser vos observations."+
      "Voulez-vous ouvrir les préférences de localisation ?");
      if (showSettings) {
        return window.BackgroundGeolocation.showLocationSettings();
      }
    }, 1000);
  },

  _showLocation: function(type, position) {
      alert(
        "type:" + type + ", "+
        "latitude:" + position.latitude + ", "+
        "longitude:" + position.longitude + ", "+
        "timestamp:" + position.time + ", "+
        "provider:" + position.provider + ", "+
        "locationProvider:" + position.locationProvider,
        "accuracy:" + position.accuracy
      );
  },

  watch: function() {
    this._configure();
    this._checkStatus().always(function(){
      window.BackgroundGeolocation.start();
    });
  },

  getCurrentLocation: function(){
    var self = this;
    if (this._dfd) {
      var state = this._dfd.state();
      if (state == 'pending')
        return this._dfd;
      var dfd = $.Deferred();
      if (state == 'resolved')
        dfd.resolve();
      else
        dfd.reject();
      return dfd.promise();
    }
    this._dfd = $.Deferred();

    this._configure();
    this._checkStatus().always(function(){
      window.BackgroundGeolocation.getCurrentLocation(self._success, self._error, self._locationOptions);
    });
    return this._dfd.promise();
  },

  _configure: function() {
    if(this._isConfigured)
      return;
    window.BackgroundGeolocation.configure(this.options);
    this._isConfigured = true;
  },

  _checkStatus: function(){
    var self = this;
    var dfdCheck = $.Deferred();
    window.BackgroundGeolocation.checkStatus(function(status) {
      self.status.isRunning = status.isRunning;

      if (status.locationServicesEnabled && status.hasPermissions ) {
        dfdCheck.resolve();
      }

      if( !status.hasPermissions ) {
        self._showSettingsApp();
        dfdCheck.reject("User has not been authorized location service");
      } else if ( !status.locationServicesEnabled ) {
        self._showLocationSettings();
        dfdCheck.reject("User has not been enabled location service");
      }
    });
    return dfdCheck.promise();
  },

  stopTracking: function() {
    window.BackgroundGeolocation.stop();
    window.BackgroundGeolocation.removeAllListeners();
    this.status.isRunning = false;
    this._isConfigured = false;
  }

});
var instance;
module.exports = {
  model: {
    getClass: function() {
      return BGLocationModel;
    },
    getInstance: function() {
      if (!instance)
        instance = new BGLocationModel();
      return instance;
    }
  }
};