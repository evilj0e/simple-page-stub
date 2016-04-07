/* global describe, it, xit */

'use strict';

require('should');

var html = require('./getHtml');
var error = require('./error-output');
var regExps = require('./staff/regExps');
var utils = require('./staff/utils');

describe('Forbidden tags.', function () {
    [ 'i', 'b', 'font', 'center', 'marquee', 'u', 's' ].forEach(function (tag) {
        it('Shouldn\'t be tag <' + tag + '>', function () {
            var pattern = regExps.tag(tag);
            var hasViolation = pattern.test(html);

            if (hasViolation) {
                error(pattern, 'Using tag <' + tag + '>.');
            }

            hasViolation.should.be.eql(false);
        });
    });
});

describe('Сodestyle.', function () {
    it('Shouldn\'t be tabs.', function () {
        var pattern = regExps.tabs();
        var hasViolation = pattern.test(html);

        if (hasViolation) {
            error(pattern, 'Tab symbol.');
        }

        hasViolation.should.be.eql(false);
    });

    it('The number of spaces in the indentation should be multiple of four.', function () {
        var found = utils.wrongSpacesChecker(html, true);

        (found).should.be.eql(0);
    });

    it('Shouldn\'t be spaces after openning tag.', function () {
        var pattern = regExps.spaceAfterTag();
        var hasViolation = pattern.test(html);

        if (hasViolation) {
            error(pattern, 'Spaces after tag.');
        }

        hasViolation.should.be.eql(false);
    });

    it('Shouldn\'t be spaces before closing tag.', function () {
        var pattern = regExps.spaceBeforeClosingTag();
        var hasViolation = pattern.test(html);

        if (hasViolation) {
            error(pattern, 'Space before closing tag.');
        }

        hasViolation.should.be.eql(false);
    });

    it('Shouldn\'t spaces after < symbol.', function () {
        var pattern = regExps.spaceAfterLessSign();
        var hasViolation = pattern.test(html);

        if (hasViolation) {
            error(pattern, 'Space after "<" symbol.');
        }

        hasViolation.should.be.eql(false);
    });

    it('Shouldn\'t spaces before > symbol.', function () {
        var pattern = regExps.spaceBeforeLessSign();
        var hasViolation = pattern.test(html);

        if (hasViolation) {
            error(pattern, 'Space before "<" symbol.');
        }

        hasViolation.should.be.eql(false);
    });

    describe('Using & patterns of attributes.', function () {
        describe('Forbidden attributes.', function () {
            [ 'style', 'border', 'align' ].forEach(function (attr) {
                it('Shouldn`t be attribute ' + attr + '.', function () {
                    var pattern = regExps.attrs(attr);
                    var hasViolation = pattern.test(html);

                    if (hasViolation) {
                        error(pattern, 'Using attribute ' + attr + '.');
                    }

                    hasViolation.should.be.eql(false);
                });
            });
        });

        it('Should use "" in attributes.', function () {
            var pattern = regExps.wrongQuoteInAttribute();
            var hasViolation = pattern.test(html);

            if (hasViolation) {
                error(pattern, 'Wrong / empty quotes in attribute.');
            }

            hasViolation.should.be.eql(false);
        });

        it('Should\'n be spaces in attributes after =.', function () {
            var pattern = regExps.spaceAfterEquals();
            var hasViolation = pattern.test(html);

            if (hasViolation) {
                error(pattern, 'Space after "=".');
            }

            hasViolation.should.be.eql(false);
        });

        it('Should\'n be spaces in attributes before =.', function () {
            var pattern = regExps.spaceBeforeEquals();
            var hasViolation = pattern.test(html);

            if (hasViolation) {
                error(pattern, 'Space before "=".');
            }

            hasViolation.should.be.eql(false);
        });

        it('Shouldn\'t be img tags without / empty attribute alt.', function () {
            utils.findImagesWithoutAlt(html).should.be.eql(0);
        });
    });

    xit('Shouldn\'t be strings more than 110 symbols.', function () {
        var pattern = regExps.maxLineLength(110);
        var hasViolation = pattern.test(html);

        if (hasViolation) {
            error(pattern, 'String more than 110 symbols.');
        }

        hasViolation.should.be.eql(false);
    });

    it('Shouldn\'t more than 2 empty lines in a row.', function () {
        var pattern = regExps.twoLineBreaksInARow();
        var hasViolation = pattern.test(html);

        if (hasViolation) {
            error(pattern, 'After line 2 empty lines in a row.');
        }

        hasViolation.should.be.eql(false);
    });

    describe('Check nesting of blocks.', function () {
        it('Shouldn\'t be block tags in inline tags.', function () {
            utils.getBlockInsideInline(html).should.be.eql(0);
        });

        it('Shouldn\'t be block tags in tag <p>.', function () {
            utils.getBlockInsideP(html).should.be.eql(0);
        });
    });

    it('Shouldn\'t be empty closed tags.', function () {
        utils.getClosedEmptyElements(html).should.be.eql(0);
    });
});
