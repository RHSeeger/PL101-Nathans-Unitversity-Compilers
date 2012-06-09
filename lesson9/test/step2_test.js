var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step2');
var prettyType = code.prettyType;

suite("STEP 2>", function() {
    test('num', function() {
        var example1 = { tag: 'basetype', name: 'num' };
        assert.deepEqual(prettyType(example1), 'num');
    });

    test('(num -> num)', function() {
        var example2 = {
            tag: 'arrowtype',
            left: { tag: 'basetype', name: 'num' },
            right: { tag: 'basetype', name: 'num' } 
        };
        assert.deepEqual(prettyType(example2), '(num -> num)');
    });

    test('(num -> (num -> num))', function() {
        var example3 = {
            tag: 'arrowtype',
            left: { tag: 'basetype', name: 'num' },
            right: {
                tag: 'arrowtype',
                left: { tag: 'basetype', name: 'num' },
                right: { tag: 'basetype', name: 'num' } 
            }
        };
        assert.deepEqual(prettyType(example3), '(num -> (num -> num))');
    });
});

