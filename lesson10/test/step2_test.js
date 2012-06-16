var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step2');
var compileEnvironment = code.compileEnvironment;

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

suite("STEP 2>", function() {
    var env1 = [ 
        ['x', 5],
        ['y', 100] ];
    var env2 = [
        ['x', 7],
        ['f', function(x) { return 2 * x; }] ];

    assert_eq(
        eval(compileEnvironment(env1) + 'x'),
        5, 'x in env1');
    assert_eq(
        eval(compileEnvironment(env1) + 'y'),
        100, 'y in env1');
    assert_eq(
        eval(compileEnvironment(env2) + 'x'),
        7, 'x in env2');
    assert_eq(
        eval(compileEnvironment(env2) + 'f(x)'),
        14, 'f(x) in env2');
});
