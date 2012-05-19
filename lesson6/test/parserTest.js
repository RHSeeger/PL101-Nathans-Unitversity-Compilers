if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var parse = PEG.buildParser(fs.readFileSync('turtle.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = TURTLE.parse;
    var assert = chai.assert;
    var expect = chai.expect;
}

/*
 * TESTS
 */

suite("PARSER TESTS", function() {
    suite('stage 2', function() {
        test('parse 42', function() {
            assert.deepEqual(parse("42"), 42,    "parse 42");
        });
        test('parse -42', function() {
            assert.deepEqual(parse("-42"), -42,    "parse -42");
        });
        test('parse -10.5', function() {
            assert.deepEqual(parse("-10.5"), -10.5,    "parse -10.5");
        });
    });

    suite('stage 3', function() {
        test('parse 42', function() {
            assert.deepEqual(parse("42"), 42,    "parse 42");
        });
        test('parse x', function() {
            assert.deepEqual(parse("x"), { tag:"ident", name:"x" },    "parse x");
        });
        test('parse abc', function() {
            assert.deepEqual(parse("abc"), { tag:"ident", name:"abc" },    "parse abc");
        });
    });
});
