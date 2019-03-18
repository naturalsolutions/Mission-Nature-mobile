'use strict';

var Backbone = require('backbone'),
  $ = require('jquery'),
  _ = require('lodash');

var Model = Backbone.Model.extend({
  defaults: {
    indexTable: {}
  },
  load: function() {
    var self = this;
    var deferred = $.Deferred();
    $.when($.get('./data/cities.csv'), $.getJSON('./data/cities_index.json'))
      .then(function(response1, response2) {
        self.rows = response1[0].split('\n');
        _.forEach(self.rows, function(row, index) {
            row = row.split(',');
            var code = row[2];
            /*if (code.length < 5)
                code = '0' + code;
            code = 'INSEEC' + code;*/

            self.rows[index] = {
                label: row[0],
                dpt: row[1],
                code: code
                //codeInsee: row[2]
            };
        });
        self.set('indexTable', response2[0]);
        deferred.resolve();
      }, function(error) {
        console.log(error);
      });

    return deferred;
  },
  search: function(term) {
    term = term.toLowerCase();
    var letters = term.substring(0, 2);
    var startIndex = this.get('indexTable')[letters];
    if ( !startIndex )
      return [];
    var matched = [];
    var nbCities = this.rows.length;
    for ( var i = startIndex; i < nbCities; i++ ) {
      var row = this.rows[i];
      var label = row.label.toLowerCase();
      if ( _.startsWith(label, term) )
        matched.push(row);
      if ( matched.length >= 20 )
        break;
    }
    return matched;
  }
});

var modelInstance;

module.exports = {
  model: {
    getInstance: function() {
      if ( !modelInstance )
        modelInstance = new Model();
      return modelInstance;
    }
  }
};
