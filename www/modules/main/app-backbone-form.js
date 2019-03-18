'use strict';
var Backbone = require('backbone');
var _ = require('lodash');
var $ = require('jquery');

var extendForm = function() {
  var Form = Backbone.Form;

  Form.template = _.template('<form role="form" data-fieldsets></form>');

  Form.Fieldset.template = _.template('<fieldset data-fields><% if (legend) { %><legend><%= legend %></legend><% } %></fieldset>');

  Form.Field.template = _.template('<div class="form-group field-<%= key %>"><span data-editor></span><p class="help-block" data-error></p><p class="help-block"><%= help %></p></div>');

  Form.NestedField.template = _.template('<div class="field-<%= key %>">' +
      '<div title="<%= title %>" class="input-xlarge">' +
        '<span data-editor></span>' +
        '<div class="help-inline" data-error></div>' +
      '</div>' +
      '<div class="help-block"><%= help %></div>' +
    '</div>');

  Form.editors.Base.prototype.className = 'form-control input-lg';
  Form.Field.errorClassName = 'has-error';

  /*if (Form.editors.List) {

    Form.editors.List.template = _.template('\
      <div class="bbf-list">\
        <ul class="unstyled clearfix" data-items></ul>\
        <button type="button" class="btn bbf-add" data-action="add">Add</button>\
      </div>\
    ');


    Form.editors.List.Item.template = _.template('\
      <li class="clearfix">\
        <div class="pull-left" data-editor></div>\
        <button type="button" class="btn bbf-del" data-action="remove">&times;</button>\
      </li>\
    ');


    Form.editors.List.Object.template = Form.editors.List.NestedModel.template = _.template('\
      <div class="bbf-list-modal"><%= summary %></div>\
    ');

  }*/
};

var initCustomeEditors = function() {
  var Form = Backbone.Form;

  Form.editors.DialogSelect = Form.editors.Base.extend({
    tagName: 'p',
    className: 'form-control-static input-lg',
    events: {
      'click': 'onClick'
    },

    initialize: function(options) {
      Form.editors.Base.prototype.initialize.call(this, options);

      if (!this.schema || !this.schema.options) throw new Error("Missing required 'schema.options'");
    },

    render: function() {
      this.setValue(this.value);

      return this;
    },

    onClick: function(e) {
      var self = this;
      var i18n = require('i18next');
      var Marionette = require('backbone.marionette');
      var Dialog = require('bootstrap-dialog');
      
      var ListView = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list-unstyled',
        childView: this.schema.options.itemView,
        childViewOptions: this.schema.options.itemViewOptions,
        childEvents: {
          'click': onChildClick
        }
      });
      var listView = new ListView({
        collection: this.schema.options.collection
      });
      listView.render();

      var dialog = Dialog.show({
        closable: true,
        title: this.schema.options.dialogTitle,
        cssClass: 'fs-dialog fs-dialog-with-scroll',
        message: listView.$el
      });

      function onChildClick(childView) {
        dialog.close();
        self.setValue(childView.model.get('id'));
      }
    },

    getValue: function() {
      return this.$el.data('value');
    },

    setValue: function(value) {
      var self = this;
      this.schema.options.collection.forEach(function(model) {
        if ( model.get('id') == value )
          self.$el.html(self.schema.options.getSelectedLabel(model));
      });
      if ( !this.$el.text() )
        this.$el.html(this.schema.editorAttrs.placeholder);
      this.$el.data('value', value);
    },

  });

  Form.editors.DialogLinkedSelect = Form.editors.Base.extend({
    tagName: 'p',
    className: 'form-control-static input-lg ',
    events: {
      'click' : 'onClick',
    },

    initialize: function(options) {
      Form.editors.Base.prototype.initialize.call(this, options);

      if (!this.schema || !this.schema.options) throw new Error("Missing required 'schema.options'");
    },

    render: function() {
      this.setValue(this.value);
      return this;
    },

    onClick: function(e) {
      if ( !this.schema.options.master)
        return this.onClickLinked();
      var self = this;
      var i18n = require('i18next');
      var Marionette = require('backbone.marionette');
      var Dialog = require('bootstrap-dialog');

      var ListView = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list-unstyled',
        childView: this.schema.options.itemView,
        childViewOptions: this.schema.options.itemViewOptions,
        childEvents: {
          'click': onChildClick
        }
      });
      var listView = new ListView({
        collection: this.schema.options.collection
      });
      listView.render();

      var dialog = Dialog.show({
        closable: true,
        title: this.schema.options.dialogTitle,
        cssClass: 'fs-dialog fs-dialog-with-scroll',
        message: listView.$el
      });

      function onChildClick(childView) {
        dialog.close();
        if (childView.model.get(self.schema.options.idName)) {
          self.setValue(childView.model.get(self.schema.options.idName));
          self.form.getEditor(self.schema.options.idNameLink).setValue('');
        }
      }
    },

    onClickLinked : function(e) {
      var self = this;
      var i18n = require('i18next');
      var Marionette = require('backbone.marionette');
      var Dialog = require('bootstrap-dialog');

      var ListView = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list-unstyled',
        childView: this.schema.options.itemView,
        childViewOptions: this.schema.options.itemViewOptions,
        childEvents: {
          'click': onChildClick
        }
      });
      // TODO generic filter collection
      var listView = new ListView({
        collection: (this.schema.options.master) ? this.schema.options.collection : this.getFilteredCollection(this.form.getEditor('missionId').getValue('missionId'))
      });
      listView.render();

      var dialog = Dialog.show({
        closable: true,
        title: this.schema.options.dialogTitle,
        cssClass: 'fs-dialog fs-dialog-with-scroll',
        message: listView.$el
      });

      function onChildClick(childView) {
        dialog.close();
        if (childView.model.get(self.schema.options.idName)) {
          self.setValue(childView.model.get(self.schema.options.idName));
        }
      }
    },

    getValue: function() {
      return this.$el.data('value');
    },

    setValue: function(value) {
      var self = this;
      if( !value )
        return this.$el.html(this.schema.options.editorAttrs.placeholder);

      var collection = (this.schema.options.master) ? this.schema.options.collection : this.getFilteredCollection(this.form.getEditor('missionId').getValue('missionId'));

      collection.forEach(function(model) {
        if ( value && model.get(self.schema.options.idName) == value ) {
          self.$el.html(self.schema.options.getSelectedLabel(model));
        }
      });
      if ( !this.$el.text() )
        this.$el.html(this.schema.options.editorAttrs.placeholder);
      this.$el.data('value', value);

      this.trigger('change', this);

    },

    getFilteredCollection: function(filter) {
      // TODO generic filter collection
      var filteredCollection = this.schema.options.collection.get(filter);
      filteredCollection = filteredCollection.get('taxon');
      return filteredCollection;
    }

  });
};

module.exports = {
  init: function() {
    extendForm();
    initCustomeEditors();
  }
};
