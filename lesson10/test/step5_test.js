var assert = require('chai').assert;
var expect = require('chai').expect;
var code = require('../step5');
var compileStatement = code.compileStatement;
var compileStatements = code.compileStatements;
var compileExpr = code.compileExpr;
var repeat = code.repeat;

suite("STEP 5>", function() {
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
    var rep = function(n, e) {
        return { tag: 'repeat', expr: n, body: e };
    };

    var x = 5;
    var f = function () {
        x += 1;
        return x;
    };
    var prg1 = rep(3, [ign(2)]);
    var prg2 = rep(op('+', 2, 3), [ign(app('f', []))]);

    console.log(compileStatement(prg2));

    test('repeat(3) { 2; }', function() {
        assert.deepEqual(eval(compileStatement(prg1) + ' _res'),
                         2);
    });
    test('repeat(2 + 3) { f(); }', function() {
        assert.deepEqual(eval(compileStatement(prg2) + ' _res'),
                         10);
    });
    test('x === 10', function() {
        assert.deepEqual(x, 10);
    });
});
