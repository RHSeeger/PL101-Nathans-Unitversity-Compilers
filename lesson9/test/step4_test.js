var assert = require('chai').assert;
var expect = require('chai').expect;
var sameType = require('../step4').sameType;

var assert_eq = function(actual, expect, description) {
    test(description, function() {
        assert.deepEqual(actual, expect);
    });
}
    
suite("STEP 4>", function() {
    var base = function (name) {
        return { tag: 'basetype', name: name };
    };
    var arrow = function (left, right) {
        return { tag: 'arrowtype', left: left, right: right };
    };

    var b1 = base('num');
    var b2 = base('atom');
    var a1 = arrow(b1, b1);
    var a2 = arrow(b1, b2);
    var a3 = arrow(b2, b1);

    assert_eq(sameType(b1, b1), true,
              'sameType of num, num');
    assert_eq(sameType(b1, b2), false,
              'sameType of num, atom');
    assert_eq(sameType(b1, a1), false,
              'sameType of num, num -> num');
    assert_eq(sameType(a1, b1), false,
              'sameType of num -> num, num');
    assert_eq(sameType(a1, a1), true,
              'sameType of num -> num, num -> num');
    assert_eq(sameType(a1, a2), false,
              'sameType of num -> num, num -> atom');
    assert_eq(sameType(a1, a3), false,
              'sameType of atom -> num, num -> num');
});
