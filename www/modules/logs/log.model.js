'use strict';

var Backbone = require('backbone'),
    config = require('../main/config'),
    _ = require('lodash');

Backbone.LocalStorage = require('backbone.localstorage');

var types = {
  checkin: {
    category: 'checkin',
    icon: 'locatime'
  },
  checkout: {
    category: 'checkin',
    icon: 'locatime'
  },
  mission_complete: {
    category: 'mission',
    icon: 'palms'
  },
  mission_accept: {
    category: 'mission',
    icon: 'check'
  },
  mission_unaccept: {
    category: 'mission',
    icon: 'check'
  }
};

var LogModel = Backbone.Model.extend({
  defaults: {
    createdAt: new Date(),
    userId: null,
    type: '',//cf: var types
    data: null//An object
  },
  get: function(attr) {
    var self = this;

    var accessorName = 'get' + _.upperFirst(attr);
    if (self[accessorName]) {
      return self[accessorName]();
    }

    return Backbone.Model.prototype.get.call(self, attr);
  },
  toJSON: function() {
    var self = this;

    var result = Backbone.Model.prototype.toJSON.apply(self, arguments);
    _.forEach(['category','icon'], function(attr) {
      result[attr] = self['get' + _.upperFirst(attr)]();
    }, this);

    return result;
  },
  getCategory: function() {
    var self = this;

    return _.get(types, self.get('type') + '.category');
  },
  getIcon: function() {
    var self = this;

    return _.get(types, self.get('type') + '.icon', 'info');
  }
});

var LogCollection = Backbone.Collection.extend({
  model: LogModel,
  localStorage: new Backbone.LocalStorage('LogCollection'),
  initialize: function() {
    // Assign the Deferred issued by fetch() as a property
    this.deferred = this.fetch();
  }
});

var collectionInstance = null;

module.exports = {
  model: {
    getClass: function() {
      return LogModel;
    },
  },
  collection: {
    getClass: function() {
      return LogCollection;
    },
    getInstance: function() {
      if (!collectionInstance)
          collectionInstance = new LogCollection();
      return collectionInstance;
    }
  }
};
