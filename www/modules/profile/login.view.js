'use strict';

var Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    $ = require('jquery'),
    _ = require('lodash'),
    config = require('../main/config'),
    Dialog = require('bootstrap-dialog'),
    Session = require('../main/session.model'),
    Router = require('../routing/router'),
    i18n = require('i18next'),
    Main = require('../main/main.view'),
    Utilities = require('../main/utilities'),
    Profile = require('../profile/profile.view'),
    User = require('../profile/user.model');

var View = Marionette.LayoutView.extend({
  template: require('./login.tpl.html'),
  className: 'login view',
  events: {
    'submit form': 'onFormSubmit',
    'click .request-npw-js': 'requestNewPassword'
  },

  initialize: function(options) {
    this.session = Session.model.getInstance();
  },

  serializeData: function() {
    return {
      user: this.model ? this.model.toJSON() : null
    };
  },

  onRender: function(options) {
    var formSchema = {
      email: {
          type: 'Text',
          dataType: 'email',
          editorAttrs: {
              placeholder: "E-mail"
          },
          validators: ['required', 'email']
      },
      password: {
        type: 'Password',
        editorAttrs: {
          placeholder: 'Mot de passe'
        },
        validators: ['required']
      }
    };
    var formOptions = {
      template: require('./form_login.tpl.html'),
      schema: formSchema,
      data: {
        email: '',
        password: ''
      }
    };
    if ( this.model ) {
      var userData = this.model.toJSON();
      _.merge(formOptions, {
        data: userData,
        templateData: {
          user: userData
        }
      });
    }
    this.formLogin = new Backbone.Form(formOptions);
    this.formLogin.render();
    this.$el.find('form > .well').append(this.formLogin.$el);
  },

  onFormSubmit: function(e) {
    e.preventDefault();

    var self = this;
    var $form = self.$el.find('form');

    if ($form.hasClass('loading'))
      return false;

    var errors = this.formLogin.validate();
    console.log(errors);
    if (errors)
      return false;

    var formValues = this.formLogin.getValue();
    
    self.$el.addClass('block-ui');
    $form.addClass('loading');
    
    this.session.login(formValues.email, formValues.password).then(function(user) {
      self.$el.removeClass('block-ui');
      $form.removeClass('loading');

      console.log('self.willBeDestroyed', self.willBeDestroyed);
      if ( !self.willBeDestroyed )
        Router.getInstance().navigate('dashboard', {
          trigger: true
        });

    }, function(error) {
      self.$el.removeClass('block-ui');
      $form.removeClass('loading');
      Dialog.alert({
        closable: true,
        message: i18n.t('dialogs.loginError')
      });
    });
  },

  requestNewPassword: function() {
    // e.preventDefault();
    var self = this;

    var formSchema = {
      email: {
        type: 'Text',
        dataType: 'email',
        editorAttrs: {
          placeholder: 'Entrez votre email'
        },
        validators: ['required', 'email']
      },
    };
    var $tpl = $('<fieldset class="" data-fields="email"></fieldset>');
    var formOptions = {
      template: $tpl.html(),
      schema: formSchema,
    };
    if ( this.model ) {
      var userData = this.model.toJSON();
      _.merge(formOptions, {
        data: userData,
        templateData: {
          user: userData
        }
      });
    }
    this.formNPW = new Backbone.Form(formOptions);
    this.formNPW.render();

    Dialog.show({
      title: 'Demande de changement de mot de passe',
      message: this.formNPW.$el,
      type: 'type-success',
      buttons: [{
        label: 'Changer votre mot de passe',
        cssClass: 'btn-block btn-primary btn-lg',
        action: function(dialogItself) {
          var errors = self.formNPW.validate();
          if (errors)
              return false;
          dialogItself.enableButtons(false);
          dialogItself.setClosable(false);

          var formValues = self.formNPW.getValue();
          $.ajax({
            url: config.apiUrl + '/user/request_new_password.json',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              name: formValues.email
            }),
            error: function(jqXHR, textStatus, errorThrown) {
              dialogItself.close();
              self.dialogRequestNewpwFail(errorThrown);
              //console.log(errorThrown);
            },
            success: function(response) {
              if (response)
                  dialogItself.close();
              self.dialogRequestNewpwSuccess();
            }
          });
        }
      }]
    });
  },

  dialogRequestNewpwSuccess: function() {
    Dialog.show({
      title: 'Demande de renouvellement de mot de passe',
      message: 'Un email vous a été envoyé avec les instructions à suivre pour le renouvellement de votre mot de passe',
      type: 'type-success',
      buttons: [{
        label: 'Fermer',
        action: function(dialogItself) {
          dialogItself.close();
        }
      }]
    });
  },

  dialogRequestNewpwFail: function(errorThrown) {
    Dialog.show({
      title: 'Une erreur est survenue',
      message: errorThrown,
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
  className: 'page login container with-header-gap',
  header: {
    titleKey: 'login',
    buttons: {
      left: ['back']
    }
  }
});

module.exports = {
  Page: Page,
  View: View
};
