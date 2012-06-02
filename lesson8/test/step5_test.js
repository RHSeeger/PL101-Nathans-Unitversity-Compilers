var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step5');
var evalDiv = code.evalDiv;
var thunkValue = code.thunkValue;
var trampoline = code.trampoline;

suite("STEP 6>", function() {
    test('1 / 2', function() {
        assert.deepEqual(trampoline(evalDiv(1, 2, {}, thunkValue, thunkValue)), 0.5);
    });
    test('exception in top', function() {
        assert.deepEqual(trampoline(evalDiv(['throw'], 2, {}, thunkValue, thunkValue)), 'EXCEPTION!');
    });
    test('exception in bottom', function() {
        assert.deepEqual(trampoline(evalDiv(1, ['throw'], {}, thunkValue, thunkValue)), 'EXCEPTION!');
    });
    test('division by zero exception', function() {
        assert.deepEqual(trampoline(evalDiv(1, 0, {}, thunkValue, thunkValue)), 'EXCEPTION!');
    });
});
