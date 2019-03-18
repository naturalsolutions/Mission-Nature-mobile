'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    _ = require('lodash'),
    $ = require('jQuery'),
    i18n = require('i18next'),
    Router = require('../routing/router');
//i18n = require('i18n');

var View = Marionette.LayoutView.extend({
  template: require('./header.html'),
  className: 'inner clearfix',
  events: {
    'click .btn_back': 'historyBack',
    'click .btn_close': 'historyBack'
  },
  triggers: {
    'click .btn_menu': 'btn:menu:click',
    'click .btn_option': 'btn:option:click',
    'click .btn_plus': 'btn:plus:click'
  },
  btns: {
    menu: {
      icon: 'hamburger'
    },
    back: {
      icon: 'arrow_left'
    },
    plus: {
      icon: 'plus'
    },
    search: {
      icon: 'search'
    },
    option: {
      icon: 'khebab'
    },
    close: {
      icon: 'close'
    }
  },

  serializeData: function() {
    var self = this;

    var data = self.data || {};
    data = _.defaultsDeep(data, {
      title: '',
      titleKey: '',
      titleArgs: {},
      buttons: {
        left: ['menu'],
        right: [],
      }
    });

    if ( !data.title && data.titleKey ) {
      data.title = i18n.t('header.titles.'+data.titleKey, data.titleArgs);
    }

    _.forEach(data.buttons, function(side) {
      _.forEach(side, function(btnName, index) {
        var config = self.btns[btnName];
        side[index] = {
          name: btnName,
          icon: config.icon
        };
      });
    });

    return data;
  },

  set: function(data) {
    var self = this;

    self.data = _.cloneDeep(data);
    if (!self.data || self.data == 'none')
            self.data = {
              classNames: 'hidden'
            };

    Marionette.LayoutView.prototype.render.apply(self);
  },

  onRender: function(options) {
    this.$el.parent('header').attr('class', _.get(this.data, 'classNames', ''));
  },



  historyBack: function() {
    Router.getInstance().back();
  }

  /*onBtnMenuClick: function(e) {
  	var app = require('app');
  	app.rootView.rgSidenav.currentView.toggleShow();
  }*/
});

var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance)
        instance = new View();
    return instance;
  }
};
