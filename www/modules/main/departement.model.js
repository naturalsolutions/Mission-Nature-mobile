'use strict';
var Backbone = require('backbone'),
    config = require('../main/config');

var Model = Backbone.Model.extend({
  defaults: {
    title: '',
    lat: 0,
    lon: 0
  },
  toString: function() {
    return this.get('title');
  }
});

var Collection = Backbone.Collection.extend({
  model: Model
});

var collectionInstance = null;

module.exports = {
  Model: Model,
  collection: {
    getInstance: function() {
      if (!collectionInstance)
          collectionInstance = new Collection();
      return collectionInstance;
    }
  }
};
