/* global describe, it */

'use strict';

require('should');
var fs = require('fs');
var files = fs.readdirSync('.');

files = files.filter(function (file) {
    return fs.statSync(file).isFile() && /\.html$/.test(file);
});

describe('Check html files count.', function () {
    it('Should be one html file in the project.', function () {
        files.length.should.be.eql(1);
    });
});

module.exports = fs.readFileSync(files[0], 'utf-8');
