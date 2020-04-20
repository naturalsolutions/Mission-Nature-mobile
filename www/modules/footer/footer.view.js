'use strict';

var Backbone = require('backbone'),
  Marionette = require('backbone.marionette'),
  $ = require('jquery'),
  _ = require('lodash'),
  User = require('../profile/user.model'),
  Observation = require('../observation/observation.model'),
  Router = require('../routing/router'),
  config = require('../main/config'),
  moment = require('moment');

var View = Marionette.LayoutView.extend({
  header: 'none',
  template: require('./footer.tpl.html'),
  className: '',
  events: {
    'click .capture-photo-js': 'capturePhoto',
    'submit form': 'uploadPhoto',

    'click .btn-help': 'toggleHelp'
  },


  initialize: function() {
    this.Main = require('../main/main.view.js');

    this.listenTo(User.collection.getInstance(), 'change:current', this.onCurrentUserChange);
  },

  onCurrentUserChange: function(newUser, prevUser) {
    this.stopListening(prevUser.getTimeForest());
    this.listenTo(newUser.getTimeForest(), 'change:total', this.displayTimeForest);
    this.render();
  },

  serializeData: function() {},

  onRender: function(options) {
    var self = this;
    this.$fabDial = this.$el.find('.fab-dial');
    this.$fabDial.nsFabDial();

   this.onBackBtnClick = this.onBackBtnClick || function(e) {
     self.$fabDial.trigger('click');
     e.isDefaultPrevented = true;
   };

    this.$fabDial.on('show.bs.dropdown', function(e) {
      $('body').addClass('show-footer-overlay');
     document.addEventListener('backbutton', self.onBackBtnClick, false);
    });
    this.$fabDial.on('hide.bs.dropdown', function(e) {
      $('body').removeClass('show-footer-overlay');
     document.removeEventListener('backbutton', self.onBackBtnClick, false);
    });

    this.displayTimeForest();
  },

  onBtnClueClick: function(e) {
    this.trigger('btn:clue:click', e);
    if ( !e.isDefaultPrevented() )
      Router.getInstance().navigate('clue', {trigger:true});
  },

  displayTimeForest: function() {
    var duration = User.getCurrent().getTimeForest().get('total');
    var display = moment.duration(duration, 'seconds').format('h[h] mm[min] ss[s]');
    this.$el.find('.time-forest-display-js').text(display);
  },

  toggleHelp: function() {
    var Help = require('../main/help.model');
    var queryHash = window.location.hash;
    var queryParams = _.parseQueryHash(queryHash);

    Help.collection.getInstance().toggleStatus(queryParams);
  },

  capturePhoto: function() {
    var self = this;

    this.Main.getInstance().showLoader();
    if (!window.cordova)
      self.createObservation();
    else {
      // Take picture using device camera and retrieve image as a local path
      navigator.camera.getPicture(
        _.bind(self.onSuccess, self),
        _.bind(self.onFail, self), {
          /* jshint ignore:start */
          quality: 75,
          targetWidth: 1000,
          targetHeight: 1000,
          destinationType: Camera.DestinationType.FILE_URI,
          correctOrientation: true,
          sourceType: Camera.PictureSourceType.CAMERA,
          /* jshint ignore:end */
        }
      );
    }
  },

  onSuccess: function(imageURI) {
    var self = this;

    if (window.cordova) {
      //TODO put tag projet in config
      var tagprojet = 'mission-nature';
      var fsFail = function(error) {
        console.log('failed with error code: ' + error.code);
      };
      var copiedFile = function(fileEntry) {
        self.createObservation(fileEntry.toInternalURL());
      };
      var gotFileEntry = function(fileEntry) {
        var gotFileSystem = function(fileSystem) {
          fileSystem.root.getDirectory(tagprojet, {
            create: true,
            exclusive: false
          }, function(dossier) {
            fileEntry.moveTo(dossier, (new Date()).getTime() + '_' + tagprojet + '.jpg', copiedFile, fsFail);
          }, fsFail);
        };
        /* jshint ignore:start */
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, fsFail);
        /* jshint ignore:end */
      };
      window.resolveLocalFileSystemURL(imageURI, gotFileEntry, fsFail);
    }
  },

  onFail: function(message) {
    console.log(message);
    this.Main.getInstance().hideLoader();
  },

  createObservation: function(fe, id) {
    var self = this;
    var router = require('../routing/router');
    var observationModel = new(Observation.model.getClass())();

    // Cordova env use background geolocation
    var CurrentPos;
    if(window.cordova && window.BackgroundGeolocation) {
      CurrentPos = require('../localize/bg_position.model');
    } else {
      CurrentPos = require('../localize/current_position.model');
    }
    var currentPos = CurrentPos.model.getInstance();
    console.log("footer currentpos");

    currentPos.getCurrentLocation().always(function() {
      //set observation model
      observationModel.set({
          'userId': User.getCurrent().get('id'),
          'date': moment().format('X'),
          'photos': [{
            'url': fe ? fe : '',
            'externId': id ? id : ''
          }],
          'coords': {
            latitude: _.get(currentPos.get('coords'), 'latitude', 0),
            longitude: _.get(currentPos.get('coords'), 'longitude', 0),
          },
          'timestamp': moment(currentPos.get('timestamp')).unix(),
          'provider': currentPos.get('provider'),
          'accuracy': currentPos.get('accuracy')
      });
      // DEBUG: console.log("footer getCurrentLocation always, observationModel: ", observationModel);

      //Save observation in localstorage
      Observation.collection.getInstance().add(observationModel)
        .save()
        .done(function(data) {
          //navigate
          router.getInstance().navigate('observation/' + data.id, {
            trigger: true
          });
          self.Main.getInstance().hideLoader();
        })
        .fail(function(e) {
          console.log(e);
        });
    });
  },

  forestTime: function(e) {
    e.preventDefault();
    e.stopPropagation();

    User.getCurrent().getTimeForest().toggleStart();

  }

});

var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance)
      instance = new View();
    return instance;
  }
};