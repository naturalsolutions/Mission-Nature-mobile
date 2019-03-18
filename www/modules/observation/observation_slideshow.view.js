'use strict';

var Marionette = require('backbone.marionette'),
    _ = require('lodash'),
    $ = require('jQuery'),
    Swiper = require('swiper'),
    bootstrap = require('bootstrap'),
    Dialog = require('bootstrap-dialog');

var View = Marionette.LayoutView.extend({
  template: require('./observation_slideshow.tpl.html'),
  className: 'slideshow slideshow-modal slideshow-obs',
  events: {
    'click .btn-close': 'onBtnCloseClick',
    'click .btn-delete': 'onBtnDeleteClick'
  },

  serializeData: function() {
    var self = this;

    return {
      photos: self.model.get('photos')
    };
  },

  onRender: function() {
    var self = this;
    var hasMany = self.model.get('photos').length > 1;

    self.swiper = new Swiper(self.$el.find('.swiper'), {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: false
    });

    if (hasMany)
    self.$el.addClass('has-many');
    else
    self.$el.removeClass('has-many');
  },

  onBtnCloseClick: function() {
    var self = this;

    self.destroy();
  },

  onBtnDeleteClick: function(e) {
    var self = this;

    if (self.model.get('photos').length < 2)
    return false;

    /*if ( !confirm("Voulez-vous vraiment supprimer cette photo ?") )
    	return false;*/

    Dialog.show({
      title: 'Confimer',
      message: 'Voulez-vous vraiment supprimer cette photo ?',
      buttons: [{
        label: 'Oui',
        action: function(dialog) {
          dialog.close();
          self.deletePhoto();
        }
      },{
        label: 'Non',
        action: function(dialog) {
          dialog.close();
        }
      }]
    });
  },

  deletePhoto: function() {
    	var self = this;

    	if (self.model.get('photos').length < 2)
        	return false;

    self.hasDeleted = true;

    var photoIndex = self.swiper.activeIndex;
    var photo = self.model.get('photos')[photoIndex];

    var fsFail = function(error) {
      console.log(error);
    };

    _.pullAt(self.model.get('photos'), photoIndex);
    self.model.save()
                .done(function() {
                  self.render();
                  if (window.cordova) {
                    	/* jshint ignore:start */
                    window.resolveLocalFileSystemURL(photo.url, function(fs) {
                      //1- Delete file mobile
                      fs.remove(function() {
                        //Dialog ?
                      }, fsFail);
                    }, fsFail);
                    /* jshint ignore:end */
                  }
                })
                .fail(function(error) {
                  console.log(error);
                });
  },

  onDestroy: function() {
    	var self = this;

    if (self.hasDeleted)
        self.model.trigger('change:photos');
  }
});

module.exports = {
  getClass: function() {
    return View;
  }
};
