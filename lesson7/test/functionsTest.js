if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var funcs = require('../step5');
} else {
    // In browser assume loaded by <script>
    var assert = chai.assert;
    var expect = chai.expect;
}

/*
 * TESTS
 */

suite("SUM -", function() {
    suite("normal recursive -", function() {
        test('base', function() {
            assert.deepEqual(funcs.sum.normal(1), 1);
        });
        test('normal', function() {
            assert.deepEqual(funcs.sum.normal(5), 15);
        });
    });
    suite("cps -", function() {
        test('base', function() {
            assert.deepEqual(funcs.sum.cps(1), 1);
        });
        test('normal', function() {
            assert.deepEqual(funcs.sum.cps(5), 15);
        });
    });
    suite("thunked -", function() {
        test('base', function() {
            assert.deepEqual(funcs.sum.thunked(1), 1);
        });
        test('normal', function() {
            assert.deepEqual(funcs.sum.thunked(5), 15);
        });
    });
});

suite("LJOIN -", function() {
    suite("normal recursive -", function() {
        test('base', function() {
            assert.deepEqual(funcs.ljoin.normal([], "-"), "");
        });
        test('normal', function() {
            assert.deepEqual(funcs.ljoin.normal([1,2,3,4,5], "-"), "1-2-3-4-5");
        });
    });
    suite("cps -", function() {
        test('base', function() {
            assert.deepEqual(funcs.ljoin.cps([], "-"), "");
        });
        test('normal', function() {
            assert.deepEqual(funcs.ljoin.cps([1,2,3,4,5], "-"), "1-2-3-4-5");
        });
    });
    suite("thunked -", function() {
        test('base', function() {
            assert.deepEqual(funcs.ljoin.thunked([], "-"), "");
        });
        test('normal', function() {
            assert.deepEqual(funcs.ljoin.thunked([1,2,3,4,5], "-"), "1-2-3-4-5");
        });
    });
});
