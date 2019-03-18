'use strict';
var Backbone = require('backbone'),
  _ = require('lodash'),
  i18n = require('i18next');

var extendMessages = function() {
  _.extend(Backbone.Validation.messages, {
    required: i18n.t('validation.errors.required'),
    email: i18n.t('validation.errors.email')
  });
};

var extendCallbacks = function() {
  _.extend(Backbone.Validation.callbacks, {
    valid: function(view, attr, selector) {
      // compose the attr - for complex situations
      var arr = attr.split('.'),
        el = '';
      for (var i = 0; i < arr.length; i++) {
        if (i === 0) el += arr[i];
        else el += '[' + arr[i] + ']';
      }

      var control, group;
      control = view.$('[' + selector + '="' + el + '"]');
      group = control.parents('.form-group');
      group.removeClass('has-error');

      if (control.data('error-style') === 'tooltip') {
        if (control.data('tooltip')) {
          return control.tooltip('hide');
        }
      } else if (control.data('error-style') === 'inline') {
        return group.find('.help-inline.error-message').remove();
      } else {
        return group.find('.help-block.error-message').remove();
      }
    },

    invalid: function(view, attr, error, selector) {
      console.log(error);
      // compose the attr - for complex situations
      var arr = attr.split('.'),
        el = '';
      for (var i = 0; i < arr.length; i++) {
        if (i === 0) el += arr[i];
        else el += '[' + arr[i] + ']';
      }

      var control, group, position, target;
      control = view.$('[' + selector + '="' + el + '"]');
      group = control.parents('.form-group');
      group.addClass('has-error');

      if (control.data('error-style') === 'tooltip') {
        position = control.data('tooltip-position') || 'right';
        control.tooltip({
          placement: position,
          trigger: 'manual',
          title: error
        });
        return control.tooltip('show');
      } else if (control.data('error-style') === 'inline') {
        if (group.find('.help-inline').length === 0) {
          group.append('<span class="help-inline error-message"></span>');
        }

        target = group.find('.help-inline');
        return target.text(error);
      } else {
        if (group.find('.help-block').length === 0) {
          group.append('<p class="help-block error-message"></p>');
        }

        target = group.find('.help-block');
        return target.text(error);
      }
    }
  });
};

module.exports = {
  init: function() {
    extendMessages();
    extendCallbacks();
  }
};
