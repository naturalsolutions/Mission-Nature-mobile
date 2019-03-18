'use strict';
var Marionette = require('backbone.marionette'),
  _ = require('lodash'),
  Header = require('../../header/header'),
  $ = require('jquery'),
  Router = require('../../routing/router');
//  Departement = require('../../main/departement.model');
var filters = null;
var View = Marionette.LayoutView.extend({
  header: {
    titleKey: 'missionsFilter',
    buttons: {
      left: ['back']
    }
  },
  template: require('./missions_all_filter.tpl.html'),
  className: 'page page-missions-all-filter page-scrollable',
  events: {
    'click .btn_search': 'onBtnSearchClick'
  },
  initialize: function() {
    var self = this;
    self.filters = filters ? _.clone(filters) : {};
    self.listenTo(Header.getInstance(), 'btn:back:click', function(e) {
      Router.getInstance().navigate('missions/all', {
        trigger: true
      });
    });
  },
  serializeData: function() {
    var self = this;
  },
  onRender: function() {
    var self = this;
  },
  onShow: function() {
    var self = this;

    self.$el.find('.js-datetimepicker').datetimepicker({
      locale: 'fr',
      format: 'DD/MM/YYYY',
      ignoreReadonly: true,
      focusOnShow: false,
      allowInputToggle: true
    });
    self.$el.find('.js-datetimepicker').data("DateTimePicker").locale('fr');
    var $dpStart = self.$el.find('.js-datetimepicker.date-start');
    var $dpEnd = self.$el.find('.js-datetimepicker.date-end');
    $dpStart.on('dp.change', function(e) {
      $dpEnd.data("DateTimePicker").minDate(e.date);
      self.filters.startAt = e.date.toDate();
    });
    $dpEnd.on('dp.change', function(e) {
      $dpStart.data("DateTimePicker").maxDate(e.date);
      self.filters.endAt = e.date.toDate();
    });
    if (self.filters.startAt) $dpStart.data('DateTimePicker').date(self.filters.startAt);
    if (self.filters.endAt) $dpEnd.data('DateTimePicker').date(self.filters.endAt);

    if (!_.isEmpty(self.filters.difficulty)){
      self.filters.difficulty.forEach(function(dif){
        var $check = self.$el.find('input[type=checkbox]').filter(function() {return this.value == dif; });
        $check.prop('checked', true);
      });
    }
  },
  onBtnSearchClick: function() {
    var self = this;
    var chkArray = [];
    $('.check:checked').each(function() {
      chkArray.push($(this).val());
    });
    self.filters.difficulty = chkArray;

    filters = self.filters;
    Router.getInstance().navigate('missions/all', {
      trigger: true
    });
  },
  onDestroy: function() {
    var self = this;
  }
});
module.exports = {
  getFilters: function() {
    return filters;
  },
  getClass: function() {
    return View;
  }
};