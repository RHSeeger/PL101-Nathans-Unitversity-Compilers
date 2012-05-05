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
    }
};


// Stage 1
assert_eq(evalScheem(5), 5,    '5 test');
assert_eq(evalScheem(['+', 2, 3]), 5,    '(+ 2 3) test');
assert_eq(evalScheem(['*', 2, 3]), 6,    '(* 2 3) test');
assert_eq(evalScheem(['/', 1, 2]), 0.5,    '(/ 1 2) test');
assert_eq(evalScheem(['*', ['/', 8, 4], ['+', 1, 1]]), 4,    '(* (/ 8 4) (+ 1 1)) test');

// Stage 2
var env = {x:2, y:3, z:10};
assert_eq(evalScheem(5, env), 5,    '5 test');
assert_eq(evalScheem('x', env), 2,    'x test');
assert_eq(evalScheem(['+', 2, 3], env), 5,    '(+ 2 3) test');
assert_eq(evalScheem(['*', 'y', 3], env), 9,    '(* y 3) test');
assert_eq(evalScheem(['/', 'z', ['+', 'x', 'y']], env), 2,    '(/ z (+ x y)) test');