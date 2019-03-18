'use strict';
var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    User = require('../profile/user.model'),
    $ = require('jquery'),
    Router = require('../routing/router'),
    moment = require('moment'),
    Help = require('../main/help.model'),
    _ = require('lodash');

var ClassDef = Marionette.LayoutView.extend({
  template: require('./dashboard_logs.tpl.html'),
  className: 'inner logs',
  events: {
    'click .log-item': 'onLogClick'
  },

  initialize: function() {
    this.logs = User.getCurrent().get('logs');
    this.someHelp();
  },

  serializeData: function() {
    var logs = this.logs.toJSON();
    _.forEach(logs, function(log) {
      log.createdAt = moment(log.createdAt).calendar();
    });
    return {
      logs: logs
    };
  },

  someHelp: function(){
    var queryHash = window.location.hash;
    var params = _.parseQueryHash(queryHash);
    var currentUser = User.getCurrent();
    var helps = Help.collection.getInstance();
    helps.someHelp(params);
  },

  onLogClick: function(e) {
    var id = $(e.currentTarget).data('id');
    var log = this.logs.get(id);
    var category = log.get('category');
    if (category == 'mission')
    Router.getInstance().navigate('/mission/' + log.get('data').mission.id, {trigger: true});
  }
});

module.exports = ClassDef;
