'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    config = require('../main/config'),
    Dialog = require('bootstrap-dialog'),
    Session = require('../main/session.model'),
    User = require('./user.model'),
    i18n = require('i18next');

var View = Marionette.LayoutView.extend({
  template: _.template(''),
  className: 'updatepassword view',
  events: {
    'submit form': 'updatePassword',
  },

  initialize: function() {
    this.session = Session.model.getInstance();
    this.dfd = $.Deferred();
  },

  onRender: function() {
    this.form = new Backbone.Form({
      template: require('./update_password.tpl.html'),
      schema: {
        cur_password: {
          type: 'Password',
          editorAttrs: {
            placeholder: 'Votre mot de passe actuel'
          },
          validators: ['required']
        },
        password: {
          type: 'Password',
          editorAttrs: {
            placeholder: 'Votre nouveau mot de passe'
          },
          validators: ['required', {
            type: 'regexp',
            regexp: /.{6,}/,
            message: 'Passwords to short'
          }]
        },
        password2: {
          type: 'Password',
          editorAttrs: {
            placeholder: 'Confirmer le nouveau mot de passe'
          },
          validators: ['required', {
            type: 'match',
            field: 'password',
            message: 'Passwords must match!'
          },]
        },
      }
    }).render();

    this.$el.append(this.form.$el);
  },

  updatePassword: function(e) {
    e.preventDefault();

    var self = this;
    var $form = this.$el.find('form');

    if ($form.hasClass('loading'))
        return false;

    var errors = this.form.validate();
    console.log(errors);
    if (errors)
        return false;

    var formValues = this.form.getValue();
    var curPassword = formValues.cur_password;
    var password = formValues.password;

    var user = User.getCurrent();

    var data = {
      uid: user.get('externId'),
      mail: user.get('email'),
      current_pass: curPassword,
      pass: password,
    };

    if (user.get('externId')) {
      //update serveur
      this.$el.addClass('block-ui');
      $form.addClass('loading');
      var query = {
        url: config.apiUrl + '/user/' + user.get('externId') + '.json',
        type: 'put',
        contentType: 'application/json',
        data: JSON.stringify(data),
        error: function(jqXHR, textStatus, errorThrown) {
          self.$el.removeClass('block-ui');
          $form.removeClass('loading');
          //TODO: Manage error type
          console.log(errorThrown);
          $form.find('input[name="cur_password"]').val('');
          Dialog.alert({
            closable: true,
            message: i18n.t('dialogs.passwdError')
          });
        },
        success: function(response) {
          self.$el.removeClass('block-ui');
          $form.removeClass('loading');
          self.dfd.resolve();
          self.dialogRequestNewpassword();
        }
      };
      this.session.getCredentials(query).done(function() {
        $.ajax(query);
      });
    }
  },

  dialogRequestNewpassword: function() {
    Dialog.show({
      title: 'Modification de votre mot de passe',
      message: 'Votre mot de passe a été modifié !',
      type: 'type-success',
      buttons: [{
        label: 'Fermer',
        action: function(dialogItself) {
          dialogItself.close();
        }
      }]
    });
  }
});

var Page = View.extend({
  header: {
    titleKey: 'updatepassword',
    buttons: {
      left: ['back']
    }
  },
  className: 'page updatepassword ns-full-height'
});

module.exports = {
  View: View,
  Page: Page,
  openDialog: function(options) {
    var view = new View();
    view.render();

    var dialog = Dialog.show({
      title: 'Changer de mot de passe',
      message: view.$el,
      onhide: function(dialog) {
        dialog = null;
      }
    });
    view.dfd.then(function() {
      if (dialog)
          dialog.close();
    });
  }
};
