var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step3');
var compileExpr = code.compileExpr;

var assert_eq = function(actual, expect, description) {
    test(description, function() {
        assert.deepEqual(actual, expect);
    });
}

var wrapExceptions = function(f) {
    return function() {
        try {
            return f.apply(null, arguments);
        } catch(err) {
            console.log("Error: " + err);
            return undefined;
        }
    };
};

suite("STEP 3>", function() {
    var op = function(t, l, r) { return { tag: t, left: l, right: r }; };
    var ref = function(n) { return { tag: 'ident', name: n }; };
    var app = function(f, args) { return { tag: 'call', name: f, args: args }; };

    var x = 5;
    var f = function (x) { return 3 * x + 1; };
    var g = function () { return 17; };
    var add = function (x, y) { return x + y; };

    test('x + 1', function() {
        assert.deepEqual(eval(compileExpr(op('+', ref('x'), 1))), 6);
    });
    test('f(3)', function() {
        assert.deepEqual(eval(compileExpr(app('f', [3]))), 10);
    });
    test('g()', function() {
        assert.deepEqual(eval(compileExpr(app('g', []))), 17);
    });
    test('add(2, 3)', function() {
        assert.deepEqual(eval(compileExpr(app('add', [2, 3]))), 5);
    });
    test('f(f(3))', function() {
        assert.deepEqual(eval(compileExpr(app('f', [app('f', [3])]))), 31);
    });
});
