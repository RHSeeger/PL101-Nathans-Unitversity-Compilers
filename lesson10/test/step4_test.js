var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step4');
var compileStatements = code.compileStatements;

suite("STEP 4>", function() {
    var op = function(t, l, r) {
        return { tag: t, left: l, right: r };
    };
    var ref = function(n) {
        return { tag: 'ident', name: n };
    };
    var app = function(f, args) {
        return { tag: 'call', name: f, args: args };
    };
    var ign = function(e) {
        return { tag: 'ignore', body: e };
    };

    var x = 5;
    var prg1 = [ign(op('+', ref('x'), 1))];

    test('x + 1;', function() {
        assert.deepEqual(eval(compileStatements(
            [ign(op('+', ref('x'), 1))],
            false) + ' _res'),
                         6);
    });
    test('3; x + 1;', function() {
        assert.deepEqual(eval(compileStatements(
            [ ign(3),
              ign(op('+', ref('x'), 1)) ],
            false) + ' _res'),
                         6);
    });
    test('x + 1; 3;', function() {
        assert.deepEqual(eval(compileStatements(
            [ ign(op('+', ref('x'), 1)),
              ign(3) ],
            false) + ' _res'),
                         3);
    });
    test('"x + 1; 3;" in function', function() {
        assert.deepEqual(eval('(function() {' + 
                              compileStatements(
                                  [ ign(op('+', ref('x'), 1)),
                                    ign(3) ], true) +
                              '})()'),
                         3);
    });
});
