'use strict';

var Marionette = require('backbone.marionette'),
  header = require('../../header/header'),
  Router = require('../../routing/router'),
  User = require('../../profile/user.model'),
  Help = require('../../main/help.model'),
  _ = require('lodash'),
  $ = require('jquery'),
  i18n = require('i18next');

module.exports = Marionette.LayoutView.extend({
  header: {
    titleKey: 'missionsAroundme',
    buttons: {
      right: ['plus']
    }
  },
  template: require('./missions_aroundme.tpl.html'),
  className: 'page page-missions page-missions-aroundme page-no-scroll',
  events: {},
  regions: {
    rgStates: '.page-states'
  },

  serializeData: function() {
    var self = this;

    return {
      state: self.state
    };
  },

  initialize: function(options) {
    var self = this;

    self.listenTo(header.getInstance(), 'btn:plus:click', function(e) {
      Router.getInstance().navigate('#missions/all', {
        trigger: true
      });
    });
    self.initState = options.state;

    var queryHash = window.location.hash;
    var params = _.parseQueryHash(queryHash);
    var currentUser = User.getCurrent();
    var helps = Help.collection.getInstance();

    helps.someHelp(params);
  },

  onShow: function() {
    var self = this;

    self.setState('localize');
    //self.setState(self.initState.name, self.initState.args);
  },

  setState: function(name, args) {
    var self = this;

    name = name || 'list';

    self.$el.alterClass('state-*', 'state-' + name);

    var viewState;
    if (name == 'localize')
      viewState = self.getLocalizeView();
    else if (name == 'manually')
      viewState = self.getManuallyView();
    else if (name == 'list')
      viewState = self.getListView();

    self.rgStates.show(viewState);
  },

  getLocalizeView: function() {
    var self = this;

    var $missions = $('<ul class="list-unstyled missions clearfix"></ul>');
    for (var i = 0; i < 6; i++) {
      $missions.append('<li class="pull-left is-placeholder"><a class="inner"><div class="thumb"><div class="img"></div><div class="donutchart"></div><div class="title"></div></div></a></li>');
    }

    var $placeholder = $('<div><div class="title text-center">'+i18n.t('pages.missionsAroundme.localize.localizing')+'</div></div>');
    $placeholder.append($missions);

    var view = new(require('../../localize/localize.view'))({
      $placeholder: $placeholder
    });

    self.listenTo(view, 'success', function() {
      self.stopListening(view);
      self.setState('list', _.get(self, 'state.args'));
    });
    self.listenTo(view, 'abort', function() {
      self.stopListening(view);
      console.log('onLocalizeError');
      Router.getInstance().navigate('missions/aroundme/manually', {
        trigger: true
      });
    });

    return view;
  },

  getManuallyView: function() {
    var self = this;

    var view = new(require('./missions_aroundme_manually.view'))();

    return view;
  },

  getListView: function() {
    var self = this;

    var view = new(require('./missions_aroundme_list.view'))();

    return view;
  },

  onDestroy: function() {
    var self = this;
  }
});
