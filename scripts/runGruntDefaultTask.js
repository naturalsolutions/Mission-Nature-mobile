#!/usr/bin/env node

module.exports = function (context) {

    var grunt = require("grunt"),
        Q = context.requireCordovaModule('q');

    var deferral = new Q.defer();

    grunt.tasks(['default'], {}, function () {
        deferral.resolve();
    });

    return deferral.promise;

};