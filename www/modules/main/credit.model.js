'use strict';
var Backbone = require('backbone'),
    config = require('./config');

var Model = Backbone.Model.extend({
  defaults: {
    type: '',
    taxon: '',
    num: '',
    nom_fichier: '',
    credit: ''
  },
  toString: function() {
    return this.get('credit');
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
