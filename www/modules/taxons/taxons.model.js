'use strict';
var Backbone = require('backbone'),
_ = require('lodash');

var Model = Backbone.Model.extend({
  defaults: {
    id: '',
    cd_nom: '',
    title: '',
    family: '',
    url: '',
    description: '',
    caracteristic: '',
    environments: '',
    environment_description: '',
    not_confuse: '',
    sources: ''
  },

  getCredits: function(credits) {
    var self = this;
    /*"description"
    "characteristic"
    "environment"
    "environment_description"
    "not_confuse"
    "sources"*/
    var currentCredits = credits.where({num: Number(self.get('id')), type:"taxon"});
    return new Collection(currentCredits);
  }
});

var Collection = Backbone.Collection.extend({
  model: Model,
 
});

var collectionInstance = null;

module.exports = {
  Model: Model,
  collection: {
    getClass: function() {
      return Collection;
    },


    getInstance: function() {
      if (!collectionInstance)
          collectionInstance = new Collection();
      return collectionInstance;
    }
  }
};
