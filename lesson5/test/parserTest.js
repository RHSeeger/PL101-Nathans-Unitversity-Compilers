if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalScheem = require('../scheem').evalScheem;
    var parse = PEG.buildParser(fs.readFileSync('scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
    var expect = chai.expect;
}

/*
 * TESTS
 */

suite("PARSER TESTS", function() {
    suite('simple', function() {
        test("don't parse empty string", function() {
            expect(function () {
                parse("");
            }).to.throw();
        });
        test('parse atom', function() {
            assert.deepEqual("atom", parse("atom"));
        });
        test('parse +"', function() {
            assert.deepEqual("+", parse("+"));
        });
        test('parse (+ x 3)', function() {
            assert.deepEqual(["+", "x", 3], parse("(+ x 3)"));
        });
        test('parse (+ (1 (f x 3 y))', function() {
            assert.deepEqual(["+", 1, ["f", "x", 3, "y"]], parse("(+ 1 (f x 3 y))"));
        });
        test('simple list', function() {
            assert.deepEqual(["a", "b", "c"], parse("(a b c)"));
        });
    });

    suite('spaces', function() {
        test('parse ( + x 3 )', function() {
            assert.deepEqual(["+", "x", 3], parse("( + x 3 )"));
        });
        test('multiple spaces between atoms/expressions', function() {
            assert.deepEqual(["+", "x", 3], parse("(+  x  3)"));
        });
        test('multiple before/after atoms', function() {
            assert.deepEqual("x", parse("  x  "));
        });
        test('multiple before/after expressions', function() {
            assert.deepEqual(["+", "x", 3], parse(" (+ x 3) "));
        });
        test('newlines', function() {
            assert.deepEqual(["+", "x", 3], parse("(+\nx\n3)"));
        });
        test('tabs', function() {
            assert.deepEqual(["+", "x", 3], parse("(+\tx\t3)"));
        });
    });

    suite('quoted', function() {
        test('quoted atom', function() {
            assert.deepEqual(["quote", "a"], parse("'a"));
        });
        // test('quoted atom', function() {
        //     assert.deepEqual(["quote", [1, 2, 3]], parse("'(1 2 3)"));
        // });
    });

    suite('comments', function() {
        test('commented whole line', function() {
            assert.deepEqual(["comment", " commented text"], parse(";; commented text"));
        });
        test('comment after value', function() {
            assert.deepEqual(["a", ["comment", " ct"]], parse("a ;; ct"));
        });
        test('comment after value nospace', function() {
            assert.deepEqual(["a", ["comment", "ct"]], parse("a;;ct"));
        });
    });

    suite('numbers', function() {
        test('simple number', function() {
            assert.deepEqual(5, parse("5"));
        });
    });

    suite('edge cases', function() {
        test('empty list', function() {
            assert.deepEqual(parse("'()"), ["quote", []]);
        });
    });
});