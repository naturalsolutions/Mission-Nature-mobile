'use strict';
var Backbone = require('backbone'),
	_ = require('lodash'),
	config = require('../main/config'),
	moment = require('moment'),
  momentRange = require('moment-range'),
	i18n = require('i18next');

var Model = Backbone.Model.extend({
  defaults: { // removed externId / species / environments / criterias / description / caracteristic / find / map
    num: '0',
    title: '',
    poster: '',
    difficulty: '',//0 == unset
    difficultyName: '',
    seasons: [],//[{"startAt":"05","endAt":"11"}],
    introduction: '',
    id_taxons: [],
    taxon: []
  },
  //Usefull to preserve equality between get() and toJSON()
  //TODO: remove that, it may be confusing
  getDynAttrs: function() {
    return [/*'map', */ 'thumb', 'poster', 'difficultyName', 'seasons'];
  },
  get: function(attr) {
    var self = this;
    if (self.getDynAttrs().indexOf(attr) > -1) {
      return self['get' + _.upperFirst(attr)]();
    }

    return Backbone.Model.prototype.get.call(self, attr);
  },
  toJSON: function() {
    var self = this;
    var result = Backbone.Model.prototype.toJSON.apply(self, arguments);

    _.forEach(self.getDynAttrs(), function(attr) {
      result[attr] = self.get(attr);
    });

    result.inSeason = self.inSeason(new Date());
    result.isInSeason = result.inSeason.isMatch;
    var season = result.seasons[0];
    if ( season.startAt.getMonth() === 0 && season.endAt.getMonth() == 11 )
      result.displaySeasonShort = result.displaySeason = i18n.t('mission.season.fullyear');
    else {
      result.displaySeasonShort = i18n.t('mission.season.range', {
        postProcess: 'sprintf', sprintf:{ from : moment(season.startAt).format('MMM'), to: moment(season.endAt).format('MMM')}
      });
      result.displaySeason = i18n.t('mission.season.range', {
        postProcess: 'sprintf', sprintf:{ from : moment(season.startAt).format('MMMM'), to: moment(season.endAt).format('MMMM')}
      });
    }

    return result;
  },
  /*
  getMap: function() {
    var self = this;
    var id = self.get('id');

    return (id < 10 ? '0' : '') + id + '.png';
  },
  */
  getThumb: function() {
    var self = this;
    var id = self.get('id');

    return (id < 10 ? '0' : '') + id + '.jpg';
  },
  getPoster: function() {
    var self = this;
    var id = self.get('id');

    return (id < 10 ? '0' : '') + id + '.jpg';
  },
  getDifficultyName: function() {
    var self = this;
    var difficultyNames = [ 'beginner', 'confirmed', 'expert'];

    return difficultyNames[self.get('difficulty')];
  },
  getSeasons: function() {
    var self = this;

    var seasons = self.attributes.seasons;
    _.forEach(seasons, function(season) {
      if (_.isString(season.startAt)) {
        season.startAt = new Date(season.startAt);
      }
      if (_.isString(season.endAt)) {
        season.endAt = new Date(season.endAt);
      }
      season.monthes = [];
      var range = moment.range(season.startAt, season.endAt);
      range.by('months', function(moment) {
        var month = moment.format('M');
        if ( season.monthes.indexOf(month) )
          season.monthes.push(month);
      });
    });

    return seasons;
  },
  isinDifficulty: function(difficulties) {
    var self = this;
    var isPresent = false;

    console.log(self.difficulty);
    self.forEach(function(mission) {
      isPresent = false;
      difficulties.forEach(function(diff) {
        if (self.mission.attributes.difficulty == diff)
          isPresent = true;
      });
    });
    return isPresent;
  },
  isInDepartement: function(ids) {
    var self = this;
    if (!_.isArray(ids))
    ids = [ids];
    return _.intersection(ids, self.get('departementIds')).length;
  },
  isInSeason: function(startAt, endAt) {
    var self = this;

    return self.inSeason(startAt, endAt).isMatch;
  },
  inSeason: function(startAt, endAt) {
    var self = this;
    
    var seasons = self.get('seasons');
    var today = new Date();
    if (endAt && !startAt) {
      startAt = today;
    }
    if ( !startAt )
      startAt = new Date();
    if ( !endAt ) {
      endAt = startAt;
    }

    var inputRange = moment.range(startAt, endAt);
    var inputMonthes = [];
    inputRange.by('months', function(moment) {
      var month = moment.format('M');
      if ( inputMonthes.indexOf(month) )
        inputMonthes.push(month);
    });

    var year = startAt.getFullYear();
    var isMatch = false;
    var momentStart = moment(startAt);
    var momentEnd = moment(endAt ? endAt : startAt);

    var result = null;
    _.forEach(seasons, function(season, index) {
      var seasonStart = season.startAt;
      var seasonEnd = season.endAt;
      var isMatch = false;
      var duration = {
        days: moment(seasonEnd).diff(seasonStart, 'days')
      };
      var startDelta = momentStart.diff(seasonStart, 'days');
      var endDelta = Math.abs(momentEnd.diff(seasonEnd, 'days'));

      result = {
        isMatch: _.intersection(inputMonthes, season.monthes).length,
        duration: duration,
        start: {
          src: seasonStart,
          input: startAt,
          delta: startDelta,
          ratio: (startDelta / duration.days)
        },
        end: {
          src: seasonEnd,
          delta: endDelta,
          ratio: (endDelta / duration.days)
        }
      };

      result.end.input = endAt ? endAt : startAt;

      if (result.isMatch)
        return false;
    });

    return result;
  },
  toString: function() {
    return this.get('num') + '. ' + this.get('title') + ' / ' + this.get('taxon').title;
  }
});

var Collection = Backbone.Collection.extend({
  model: Model
});

var collectionInstance = null;

module.exports = {
  Model: Model,
  collection: {
    getClass: function() {
      return Collection;
    },
    getInstance: function() {
      if (!collectionInstance)
          collectionInstance = new Collection();
      return collectionInstance;
    }
  }
};
