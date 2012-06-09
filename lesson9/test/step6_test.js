var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step6');
var base = code.base;
var arrow = code.arrow;
var typeExpr = code.typeExpr;

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
            return undefined;
        }
    };
};

suite("STEP 6>", function() {
    var context = { bindings: {
        '+': arrow(base('num'), 
                   arrow(base('num'), base('num'))),
        '<': arrow(base('num'),
                   arrow(base('num'), base('bool'))) } };

    typeExpr = wrapExceptions(typeExpr);

    assert_eq(typeExpr(['if', true, 3, 5], { }), 
              base('num'),
              '(if true 3 5) has type num');

    assert_eq(typeExpr(['if', true, true, 5], { }), 
              undefined,
              '(if true true 5) is untyped');

    assert_eq(typeExpr(['if', 3, 3, 5], { }), 
              undefined,
              '(if 3 3 5) is untyped');

    assert_eq(typeExpr([['+', 2], 3], context), 
              base('num'),
              '((+ 2) 3) has type num');

    assert_eq(typeExpr([['<', 1], 2], context), 
              base('bool'),
              '((< 1) 2) has type bool');

    assert_eq(typeExpr(['if', [['<', 1], 2], [['+', 2], 3], 5], context), 
              base('num'),
              '(if ((< 1) 2) ((+ 2) 3) 5) has type num');
});
