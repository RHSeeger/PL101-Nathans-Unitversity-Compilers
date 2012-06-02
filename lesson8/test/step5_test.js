var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step5');
var evalTwo = code.evalTwo;

suite("STEP 5>", function() {
    var env = { bindings: { x: 3, y: 4 }, outer: null };
    test('x=7 and y=10', function() {
        evalTwo(['set!', 'x', 7], ['set!', 'y', 10], env);
        assert.deepEqual(env, { bindings: { x: 7, y: 10 }, outer: null });
    });
    test('x=1+1 and y=11', function() {
        evalTwo(['set!', 'x', ['+', 1, 1]], ['set!', 'y', 11], env);
        assert.deepEqual(env, { bindings: { x: 2, y: 11 }, outer: null });
    });
    test('x=13 and y=2+3', function() {
        evalTwo(['set!', 'x', 13], ['set!', 'y', ['+', 2, 3]], env);
        assert.deepEqual(env, { bindings: { x: 13, y: 5 }, outer: null });
    });
    test('x=15 versus x=10+2', function() {
        evalTwo(['set!', 'x', 15], ['set!', 'x', ['+', 10, 2]], env);
        assert.deepEqual(env, { bindings: { x: 12, y: 5 }, outer: null });
    });
    test('x=3+5 versus x=17', function() {
        evalTwo(['set!', 'x', ['+', 3, 5]], ['set!', 'x', 17], env);
        assert.deepEqual(env, { bindings: { x: 8, y: 5 }, outer: null });
    });
});
