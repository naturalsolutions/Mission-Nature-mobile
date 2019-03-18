'use strict';
var Backbone = require('backbone'),
    config = require('../main/config'),
    _ = require('lodash'),
    moment = require('moment'),
    $ = require('jquery');
Backbone.LocalStorage = require('backbone.localstorage');
var TFmodel = Backbone.Model.extend({
    defaults: {
        uid: '',
        startTime: 0,
        // curCount: 0,
        totalDuration: 0,

        serverValue: 0,
        prevCountTotal: 0,
        curCountTotal: 0,
        delta: 0,
        total: 0
    },
    url: config.coreUrl,
    initialize: function() {
        var self = this;
        this.setProgressLog();
        this.on('change:total', function() {
            self.setProgressLog();
        });
    },
    get: function(attr) {
        var self = this;
        var accessorName = 'get' + _.upperFirst(attr);
        if (self[accessorName]) {
            return self[accessorName]();
        }
        return Backbone.Model.prototype.get.call(self, attr);
    },
    getIsStart: function() {
        return this.get('startTime');
    },
    toggleStart: function() {
        var isStart = this.get('isStart');
        if (!isStart) this.start();
        else this.stop();
    },
    start: function(_startTime, _curCountTotalInit) {
        var self = this;
        this.set('startTime', _startTime || moment().unix());
        this.set('curCountTotalInit', _curCountTotalInit || this.get('curCountTotal'));
        this.save();
        this.intervalId = setInterval(function() {
            var curCount = moment().unix() - self.get('startTime');
            var curCountTotal = self.get('curCountTotalInit') + curCount;
            var delta = curCountTotal - self.get('prevCountTotal');
            var total = self.get('serverValue') + delta;
            self.set({
                // curCount: curCount,
                curCountTotal: curCountTotal,
                delta: delta,
                total: total
            }).save();
        }, 1000);
        $('body').alterClass('*-forest', 'in-forest');
    },
    stop: function() {
        var isStart = this.get('isStart');
        if (!isStart)
            return false;
        if (this.intervalId)
            clearInterval(this.intervalId);
        this.intervalId = null;
        // this.set('totalDuration', this.get('curCount') + this.get('totalDuration'));
        this.set('startTime', 0);
        // this.set('curCount', 0);
        this.save();
        $('body').alterClass('*-forest', '');
    },
    reset: function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.set(this.defaults);
        this.save();
    },
    // getCurrentDuration: function() {
    //     var isStart = this.get('isStart');
    //     if (isStart) return this.get('curCount') + this.get('totalDuration');
    //     else return this.get('totalDuration');
    // },
    getProgress: function() {
        var max = 60 * 60 * 10; //10h in seconds
        var totalTime = this.get('total');
        return _.clamp(_.ceil(totalTime / max, 2), 0, 1);
    },
    setProgressLog: function() {
        var timeMax = 60 * 60 * 10; //10h in seconds
        var totalTime = this.get('total');
        var ratio = _.clamp(totalTime / timeMax, 0, 1);
        ratio = ratio * 10;
        var min = 1;
        var max = 10;
        var gap = max - min;
        ratio = ratio / max * gap + min;
        ratio = _.clamp(ratio, min, max);
        this.set('progressLog', _.ceil(_.log10(ratio), 2));
    }
});
var TFcollection = Backbone.Collection.extend({
    model: TFmodel,
    localStorage: new Backbone.LocalStorage('timeForestCollection'),
    initialize: function() {
        // Assign the Deferred issued by fetch() as a property
        this.deferred = this.fetch();
        var User = require('../profile/user.model');
        User.collection.getInstance().on('change:current', function(newUser, prevUser) {
            if (!prevUser)
                return false;
            var prevTimeForest = prevUser.getTimeForest();
            if (!prevUser.isAnonymous())
                prevTimeForest.stop();
            else {
                var newTimeForest = newUser.getTimeForest();
                var curCountTotal = newTimeForest.get('curCountTotal') + prevTimeForest.get('curCountTotal');
                var delta = curCountTotal - newTimeForest.get('prevCountTotal');
                var total = newTimeForest.get('serverValue') + delta;
                newTimeForest.set({
                    // curCount: curCount,
                    curCountTotal: curCountTotal,
                    delta: delta,
                    total: total
                });
                if (prevTimeForest.get('isStart'))
                    newTimeForest.start(prevTimeForest.get('startTime'), prevTimeForest.get('curCountTotalInit'));
                else
                    newTimeForest.save();
                prevTimeForest.reset();
            }
        });
    }
});
var modelInstance = null;
var collectionInstance = null;
module.exports = {
    model: {
        setInstance: function(model) {
            modelInstance = model;
        },
        getInstance: function() {
            if (!modelInstance) modelInstance = new TFmodel();
            return modelInstance;
        },
        getClass: function() {
            return TFmodel;
        }
    },
    collection: {
        getInstance: function() {
            if (!collectionInstance) collectionInstance = new TFcollection();
            return collectionInstance;
        }
    }
};