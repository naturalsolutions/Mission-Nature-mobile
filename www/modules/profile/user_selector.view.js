'use strict';

var Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    Dialog = require('bootstrap-dialog'),
    Router = require('../routing/router'),
    Session = require('../main/session.model'),
    User = require('./user.model');

var Page = Marionette.LayoutView.extend({
  header: {
    titleKey: 'login',
    buttons: {
      left: ['back']
    }
  },
  template: require('./user_selector.tpl.html'),
  className: 'page view user_selector container with-header-gap',
  events: {
    'click .user-row-info': 'onUserClick'
  },
  
  serializeData: function() {
    return {
      users: User.collection.getInstance().toJSON()
    };
  },

  onUserClick: function(e) {
    var $target = $(e.currentTarget);
    var userId = $target.data('user-id');
    var session = Session.model.getInstance();
    if ( session.get('needLogin') )
      Router.getInstance().navigate('login/'+userId, {trigger:true});
    else {
      var Main = require('../main/main.view.js');
      Main.getInstance().showLoader();
      session.logout().always(function() {
        Main.getInstance().hideLoader();
        var collection = User.collection.getInstance();
        var user = collection.get(userId);
        collection.setCurrent(user);
        Router.getInstance().navigate('dashboard', {trigger:true});
      });
    }
  }
});

module.exports = {
  Page: Page
};
