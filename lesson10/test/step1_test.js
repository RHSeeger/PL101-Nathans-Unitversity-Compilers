var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step1');
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

suite("STEP 1>", function() {
    var op = function(t, l, r) {
        return { tag: t, left: l, right: r };
    };

    assert_eq(eval(compileExpr(op('+', 1, 1))), 2, 
              '1 + 1');
    assert_eq(eval(compileExpr(op('-', 5, 1))), 4, 
              '5 - 1');
    assert_eq(eval(compileExpr(op('*', 2, 3))), 6, 
              '2 * 3');
    assert_eq(eval(compileExpr(op('<', 1, 2))), true, 
              '1 < 2');
    assert_eq(eval(compileExpr(op('<', op('+', op('*', 2, 3), 1), op('*', 3, 1)))), false, 
              '2 * 3 + 1 < 3 * 1');
});
