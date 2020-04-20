#!/usr/bin/env node

module.exports = context => {
    return new Promise(resolve => {
        var grunt = require("grunt");
        grunt.tasks(['default'], {}, function () {
            resolve();
        });
    })
};