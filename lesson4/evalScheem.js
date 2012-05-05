require("../assert_local.js");
var assert = require("assert");
var PEG = require("pegjs");
// var fs = require('fs');

var wrapExceptions = function(f) {
    return function(x) {
        try {
            return f(x);
        }
        catch(err) {
            return undefined;
        }
    };
};

var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return env[expr];
    }
    // Look at head of list for operation
    switch (expr[0]) {
    case '+':
        return evalScheem(expr[1], env) + evalScheem(expr[2], env);
    case '-':
        return evalScheem(expr[1], env) - evalScheem(expr[2], env);
    case '*':
        return evalScheem(expr[1], env) * evalScheem(expr[2], env);
    case '/':
        return evalScheem(expr[1], env) / evalScheem(expr[2], env);
    case 'set!':
        env[expr[1]] = evalScheem(expr[2], env);
        return 0;
    case 'define':
        env[expr[1]] = evalScheem(expr[2], env);
        return 0;
    case 'begin':
        var result;
        for (var i=1 ; i<expr.length; i++) {
            result = evalScheem(expr[i], env);
        }
        return result;
    case 'quote':
        return expr[1];
    }
};


/* Stage 1 */
assert_eq(evalScheem(5), 5,    '5 test');
assert_eq(evalScheem(['+', 2, 3]), 5,    '(+ 2 3) test');
assert_eq(evalScheem(['*', 2, 3]), 6,    '(* 2 3) test');
assert_eq(evalScheem(['/', 1, 2]), 0.5,    '(/ 1 2) test');
assert_eq(evalScheem(['*', ['/', 8, 4], ['+', 1, 1]]), 4,    '(* (/ 8 4) (+ 1 1)) test');

/* Stage 2 */
var env = {x:2, y:3, z:10};
assert_eq(evalScheem(5, env), 5,    '5 test');
assert_eq(evalScheem('x', env), 2,    'x test');
assert_eq(evalScheem(['+', 2, 3], env), 5,    '(+ 2 3) test');
assert_eq(evalScheem(['*', 'y', 3], env), 9,    '(* y 3) test');
assert_eq(evalScheem(['/', 'z', ['+', 'x', 'y']], env), 2,    '(/ z (+ x y)) test');

/* Stage 3 */
assert_eq(evalScheem('x', env), 2,    'x test');
var tmp = evalScheem(['define', 'a', 5], env);
assert_eq(tmp, 0,    'evaluation of define test');
assert_eq(env, {x:2, y:3, z:10, a:5},    '(define a 5) test');
var tmp = evalScheem(['set!', 'a', 1], env);
assert_eq(env, {x:2, y:3, z:10, a:1},    '(set! a 1) test');
var tmp = evalScheem(['set!', 'x', 7], env);
assert_eq(env, {x:7, y:3, z:10, a:1},    '(set! x 7) test');
var tmp = evalScheem(['set!', 'y', ['+', 'x', 1]], env);
assert_eq(env, {x:7, y:8, z:10, a:1},    '(set! y (+ x 1)) test');

/* Stage 4 */
assert_eq(evalScheem(['begin', 1, 2, 3], {}), 3,
    '(begin 1 2 3) test');
assert_eq(evalScheem(['begin', ['+', 2, 2]], {}), 4,
    '(begin (+ 2 2)) test');
assert_eq(evalScheem(['begin', 'x', 'y', 'x'], {x:1, y:2}), 1,
    '(begin x y x) test');
assert_eq(evalScheem(['begin', ['set!', 'x', 5], 
        ['set!', 'x', ['+', 'y', 'x']], 'x'], {x:1, y:2}), 7,
    '(begin (set! x 5) (set! x (+ y x) x)) test');

/* Stage 5 */
assert_eq(evalScheem(['+', 2, 3], {}), 5,
    '(+ 2 3) test');
assert_eq(evalScheem(['quote', ['+', 2, 3]], {}), ['+', 2, 3],
    '(quote (+ 2 3)) test');
assert_eq(evalScheem(['quote', ['quote', ['+', 2, 3]]], {}),
    ['quote', ['+', 2, 3]],
    '(quote (quote (+ 2 3))) test');
