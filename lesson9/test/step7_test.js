var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step7');
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
            console.log("Error: " + err);
            return undefined;
        }
    };
};

suite("STEP 7>", function() {
    var context = {
        bindings: {
            'x': base('string'),
            '+': arrow(base('num'), 
                       arrow(base('num'), base('num'))),
            '<': arrow(base('num'),
                       arrow(base('num'), base('bool')))
        }
    };

    typeExpr = wrapExceptions(typeExpr);

    assert_eq(
        typeExpr(['lambda-one', 'x', base('num'), 5], { }),
        arrow(base('num'), base('num')),
        "(lambda-one x num 5) has type num -> num");
    assert_eq(
        typeExpr(['lambda-one', 'x', base('num'), 5], context),
        arrow(base('num'), base('num')),
        "(lambda-one x num 5) has type num -> num with x typed");
    assert_eq(
        typeExpr(['lambda-one', 'x', base('num'), 'x'], { }),
        arrow(base('num'), base('num')),
        "(lambda-one x num x) has type num -> num");
    assert_eq(
        typeExpr(['lambda-one', 'x', arrow(base('num'), base('num')), ['x', 3]], { }),
        arrow(arrow(base('num'), base('num')), base('num')),
        "(lambda-one x (num -> num) (x 3)) has type (num -> num) -> num");
});
