var assert = require('chai').assert;
var expect = require('chai').expect;
var step3 = require('../step3');
var step = step3.step;
var thunkValue = step3.thunkValue;
var thunk = step3.thunk;

suite("STEP 3>", function() {

    test('thunk value', function() {
        var state = { data: thunkValue(5), done: false };
        step(state);
        assert.deepEqual(state, { data: 5, done: true });
    });
    test('thunk function, one step, done', function() {
        var state = { 
            data: thunk(function(x) { 
                return thunkValue(x + 1); 
            }, 5), 
            done: false 
        };
        step(state);
        assert.deepEqual(state.done, false);
    });
    test('thunk function, two step, done', function() {
        var state = { 
            data: thunk(function(x) { 
                return thunkValue(x + 1); 
            }, 5), 
            done: false 
        };
        step(state);
        step(state);
        assert.deepEqual(state.done, true);
        assert.deepEqual(state.data, 6);
    });
});
