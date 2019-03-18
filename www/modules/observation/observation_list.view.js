'use strict';
var Marionette = require('backbone.marionette'),
  ListItem = require('./observation_list_item.view'),
  Help = require('../main/help.model'),
  User = require('../profile/user.model'),
  _ = require('lodash');

var emptyView = Marionette.LayoutView.extend({
  tagName: 'li',
  template: _.template('<div class="btn-lg text-center text-muted">Vos observations s\'affichent ici.</div>'),
  initialize: function() {
    this.someHelp();
  },
  someHelp: function(){
    var queryHash = window.location.hash;
    var params = _.parseQueryHash(queryHash);
    var currentUser = User.getCurrent();
    var helps = Help.collection.getInstance();
    helps.someHelp(params);
  },
});

module.exports = Marionette.CollectionView.extend({
  tagName: 'ul',
  className: 'list-unstyled clearfix',
  childView: ListItem,
  emptyView: emptyView
});