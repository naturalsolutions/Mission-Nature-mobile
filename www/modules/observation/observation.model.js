'use strict';

var Backbone = require('backbone'),
  _ = require('lodash'),
  config = require('../main/config'),
  User = require('../profile/user.model.js');
  
Backbone.LocalStorage = require('backbone.localstorage');

var ObservationModel = Backbone.Model.extend({
  // Expected attributes : {
  //     date: '',
  //     missionId: '',
  //     scientific_name: '',
  //     cd_nom: '',
  //     photos:[],
  //     departement: '',
  //     shared: 0,
  //     externId: ''
  // }
  defaults: {
    type: 'observation'
  },
  url: config.apiUrl + '/node.json',
  initialize: function() {
    this.listenTo(this, 'change:shared', this.onSharedChange, this);
  },
  onSharedChange: function() {
    var user = User.getCurrent();
    if (this.get('shared') == 1) {
      var mission = this.getMission();
      if ( mission )
        user.addCompletedMission(mission).save();
    }
  },
  get: function(attr) {
    var self = this;
    var accessorName = 'get' + _.upperFirst(attr);
    if (self[accessorName]) {
      return self[accessorName]();
    }

    return Backbone.Model.prototype.get.call(self, attr);
  },

  getHasCoords: function() {
    return this.get('coords') && this.get('coords').latitude;
  },

  getHasGeolocation: function(){
    var user = User.getCurrent();
    var coords = this.getHasCoords();
    var city = user.get('hasCity');
    if(coords){
      return 'has coords';
    } else if(!coords && city){
      return 'has city';
    } else if (!coords && !city){
      return null;
    }
  },

  toJSON: function() {
    var self = this;
    var result = Backbone.Model.prototype.toJSON.apply(self, arguments);

    if (result.photos) {
      result.photos.map(function(photo) {
        if (photo.url) {
          photo.url = window.WkWebView.convertFilePath(window.cordova.file.dataDirectory + photo.url.substr(photo.url.lastIndexOf('/') + 1));
        }

        return photo;
      });
    }

    _.forEach(['mission'/*, 'departement'*/], function(attr) {
      result[attr] = self.get(attr);
    }, this);

    if (result.mission)
      result.mission = result.mission.toJSON();

    result.shared = _.parseInt(result.shared);

    return result;
  },
  getMissionId: function() {
    var self = this;
    var missionId = _.parseInt(self.attributes.missionId);
    
    return _.isNaN(missionId) ? null : missionId;
  },
  getMission: function() {
    var self = this;
    var missionId = self.get('missionId');
    if (!missionId)
      return null;

    var missions = require('../mission/mission.model').collection.getInstance();

    return missions.findWhere({
      id: missionId
    });
  },
/*  getDepartement: function() {
    var self = this;
    var departementId = self.get('departementId');
    if (!departementId)
      return null;

    var departements = require('../main/departement.model').collection.getInstance();

    return departements.get(departementId);
  }
  getDeptId: function() {
    var self = this;
    var dept = self.get('departement');
    if (!dept)
      return null;

    var depts = require('../main/departement.model').collection.getInstance();

    var currentDept = depts.findWhere({
      code: dept
    });

    return _.get(currentDept, 'id');
  }*/
});

var ObservationCollection = Backbone.Collection.extend({
  model: ObservationModel,
  url: '',
  localStorage: new Backbone.LocalStorage("ObservationCollection"),
  initialize: function() {
      var self = this;
      // Assign the Deferred issued by fetch() as a property
      this.deferred = this.fetch();

      User.collection.getInstance().on('change:current', function(newUser, prevUser) {
        if ( !prevUser.isAnonymous() )
          return false;
        var obs = self.where({
          userId: prevUser.get('id')
        });
        _.forEach(obs, function(model) {
          model.set('userId', newUser.get('id'));
          model.save();
        });
      });
    }
    /*toJSON: function() {
        var self = this;
        var result = Backbone.Model.prototype.toJSON.apply(self, arguments);

        result.mission = result.mission.toJSON();

        return result;
    }*/
});

var collectionInstance = null;

module.exports = {
  model: {
    getClass: function() {
      return ObservationModel;
    }
  },
  collection: {
    getClass: function() {
      return ObservationCollection;
    },
    getInstance: function() {
      if (!collectionInstance)
        collectionInstance = new ObservationCollection();
      return collectionInstance;
    }
  },
  capturePhoto: function (onSuccess, onFail) {
    if (!window.cordova) {
      return;
    }

    navigator.camera.getPicture(
      function(imageURI) {
        if (imageURI.indexOf('://') < 0) {
          imageURI = 'file://' + imageURI;
        }
        var currentName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        var correctPath = imageURI.substr(0, imageURI.lastIndexOf('/') + 1);

        window.resolveLocalFileSystemURL(correctPath, function (directoryEntry) {
          directoryEntry.getFile(currentName, {
            create: false
          }, function(fileEntry) {
            window.resolveLocalFileSystemURL(window.cordova.file.dataDirectory, function (newDirectoryEntry) {
              fileEntry.copyTo(newDirectoryEntry, currentName, function(newFileEntry) {
                onSuccess(window.WkWebView.convertFilePath(newFileEntry.toURL()));
              }, onFail);
            }, onFail);
          }, onFail);
        }, onFail);
      },
      onFail, {
      quality: 75,
      targetWidth: 1000,
      targetHeight: 1000,
      destinationType: navigator.camera.DestinationType.FILE_URI,
      correctOrientation: true,
      sourceType: navigator.camera.PictureSourceType.CAMERA
    });
  },
};

