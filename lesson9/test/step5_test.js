var assert = require('chai').assert;
var expect = require('chai').expect;
var typeExprTester = require('../step5').typeExprTester;

var assert_eq = function(actual, expect, description) {
    test(description, function() {
        assert.deepEqual(actual, expect);
    });
}

suite("STEP 5>", function() {
    var base = function (name) {
        return { tag: 'basetype', name: name };
    };
    var arrow = function (left, right) {
        return { tag: 'arrowtype', 
                 left: left,
                 right: right };
    };

    var context1 = { 
        bindings: {
            'f': arrow(base('num'),
                       arrow(base('num'), base('num'))),
            'x': base('num') 
        }
    };
    var context2 = { 
        bindings: {
            'f': arrow(arrow(base('num'), base('num')),
                       base('num')),
            'x': arrow(base('num'), base('num'))
        }
    };


    assert_eq(typeExprTester(context1),
              arrow(base('num'), base('num')),
              'f: num -> (num -> num), x: num'); 
    assert_eq(typeExprTester(context2),
              base('num'),
              'f: (num -> num) -> num, x: num - > num'); 
});
