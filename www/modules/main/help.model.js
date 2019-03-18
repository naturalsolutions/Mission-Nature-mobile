'use strict';
var Backbone = require('backbone'),
    $ = require('jquery'),
    Main = require('../main/main.view'),
    User = require('../profile/user.model'),
    config = require('../main/config');

var Model = Backbone.Model.extend({
  defaults: {
    id:'',
    title: '',
    description: '',
  },
});

var Collection = Backbone.Collection.extend({
  model: Model,

  checkStatus: function(queryString){
    var currentUser = User.getCurrent();
    var helpExists = currentUser.get('displayHelp'+queryString);
    var status;
    var needSomeHelp = this.findWhere({id: queryString});
    if(helpExists === undefined && needSomeHelp)
      status = currentUser.attributes['displayHelp'+queryString]= true;
    else
      status = currentUser.get('displayHelp'+queryString);
    return status;
  },

  toggleStatus: function(queryString){
    var status = this.checkStatus(queryString);
    var needSomeHelp = this.findWhere({id: queryString});
    if(needSomeHelp){
      if(status)
        this.stopHelp(queryString);
      else
        this.startHelp(queryString);
      }
  },

  startHelp: function(queryString){
    $('body').alterClass('*-help', 'with-help');
    User.getCurrent().set('displayHelp'+queryString, true).save();
  },

  stopHelp: function(queryString){
    $('body').alterClass('*-help', '');
    User.getCurrent().set('displayHelp'+queryString, false).save();
  },

  someHelp: function(querystring){
    var needSomeHelp = this.findWhere({id: querystring});
    var displayHelpState = this.checkStatus(querystring);
    if(displayHelpState && needSomeHelp){
      $('body').alterClass('*-help', 'with-help');
      Main.getInstance().addDialogHelp({
        title: needSomeHelp.get('title'),
        description: needSomeHelp.get('description'),
      });
    }else{
      $('body').alterClass('*-help', '');
    }
  },
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
