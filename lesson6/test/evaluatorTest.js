if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var turtle = require('../turtle');
    var evalExpr = turtle.evalExpr;
    var evalStatement = turtle.evalStatement;
    var add_binding = turtle.add_binding;
} else {
    // In browser assume loaded by <script>
    var assert = chai.assert;
    var expect = chai.expect;
}

/*
 * TESTS
 */

suite("EVALUATOR TESTS", function() {
    suite("step 6", function() {
        test('3+5', function() {
            var env = { bindings: { x:2, y:3 }, outer: { } };
            assert.deepEqual(evalExpr({tag:"+", left:3, right:5}, env), 8,    '3+5');
        });
        test('x', function() {
            var env = { bindings: { x:2, y:3 }, outer: { } };
            assert.deepEqual(evalExpr({ tag:"ident", name:"x"}, env), 2, 'x');
        });
        test('x+5', function() {
            var env = { bindings: { x:2, y:3 }, outer: { } };
            assert.deepEqual(evalExpr({tag:"+", left:{ tag:"ident", name:"x"}, right:5}, env), 7, 'x+5');
        });
        test('x+y', function() {
            var env = { bindings: { x:2, y:3 }, outer: { } };
            assert.deepEqual(evalExpr({tag:"+", left:{ tag:"ident", name:"x" }, right:{ tag:"ident", name:"y" }}, env), 5, 'x+y'); 
        });
    });

    suite("step 7", function() {
        test('3', function() {
            assert.deepEqual(evalStatement({tag:"ignore", body:3}, {}), 3);
        });
        test('repeat(5){3;}', function() {
            assert.deepEqual(evalStatement({tag:"repeat", expr:5, body: [{tag:"ignore", body:3}]}, {}), 3);
        });
    });

    suite("internal", function() {
        test('binding variable', function() {
            var env = {};
            add_binding(env, 'x', 1);
            assert.deepEqual(env, {bindings: {x:1}, outer: {}});
        });
        test('binding functions', function() {
            var f = function(a,b) { return a+b; };
            var env = {};
            add_binding(env, 'myfunc', f);
            assert.deepEqual(env, { bindings: {myfunc:f}, outer: {} });
        });
    });

});
