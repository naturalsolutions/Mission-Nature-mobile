'use strict';
var Backbone = require('backbone'),
  _ = require('lodash'), // FIXME: "_ = Backbone._" doesn't work... why?
  i18n = require('i18next'),
  $ = Backbone.$;
var GeoModel = Backbone.Model.extend({
  _id: null,
  _dfd: null,
  defaultOptions: {
    enableHighAccuracy: true,
    maximumAge: 1000*60*10,
    timeout: 1000 * 60
  },
  initialize: function(options) {
    var self = this;
    // Allow user to customize geolocation options
    this.options = _.defaults(options || {}, this.defaultOptions);
    // Ensure geolocation callback are called in the context of this model instance
    this._success = _.bind(this._success, this);
    this._error = _.bind(this._error, this);

    this.onChange = function() {
      if (self._dfd)
        self._dfd.resolve(self.attributes);
    };

    this.onError = function(model, error) {
      if (self._dfd)
        self._dfd.reject(error);
    };
  },
  _success: function(position) {
    this.set({
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      timestamp: position.timestamp
    });
    if (this.watchTimeout)
      clearTimeout(this.watchTimeout);
  },
  _error: function(error) {
    console.log('ERROR(' + error.code + '): ' + error.message);
    this.trigger('error', this, error);
    var lastposTime = this.get('timestamp') || 0;
    var now = Date.now();
    var diffTime = now - lastposTime;
    if (lastposTime && (diffTime > this.options.maximumAge)) {
      this.clear(); // Erase position data
    }

    this.unwatch(); // Stop watching because something went wrong
  },
  promise: function() {
    return this._dfd.promise();
  },
  unwatch: function() {
    if (this._id)
      navigator.geolocation.clearWatch(this._id);
    if (this.watchTimeout)
      clearTimeout(this.watchTimeout);
    this.off('change', this.onChange);
    this.off('error', this.onError);
    this._id = null;
    this.watchTimeout = null;
    this._dfd = null;
    this.trigger('unwatch');
  },
  watch: function(options) {
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
    // "Resolve" this model after a first position has been found
    this.once('change', this.onChange);
    this.once('error', this.onError);
    this.watchTimeout = setTimeout(function() {
      self._error({
        code: 3,
        message: "Fallback timeout"
      });
    }, this.options.timeout + 1000);
    this._id = navigator.geolocation.watchPosition(this._success, this._error, this.options);

    return this._dfd.promise();
  },

  positionError: function(error) {
    var errors = {
      1: i18n.t('position.errors.dialogs.permission_denied'),
      2: i18n.t('position.errors.dialogs.position_unavailable'),
      3: i18n.t('position.errors.dialogs.request_timeout')
    };
    return errors[error.code];
  },

});
var instance;
module.exports = {
  model: {
    getClass: function() {
      return GeoModel;
    },
    getInstance: function() {
      if (!instance)
        instance = new GeoModel();
      return instance;
    }
  }
};