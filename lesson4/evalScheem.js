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


var evalScheem = function (expr) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            return evalScheem(expr[1]) + evalScheem(expr[2]);
        case '-':
            return evalScheem(expr[1]) - evalScheem(expr[2]);
        case '*':
            return evalScheem(expr[1]) * evalScheem(expr[2]);
        case '/':
            return evalScheem(expr[1]) / evalScheem(expr[2]);
    }
};





assert_eq(evalScheem(5), 5,    '5 test');
assert_eq(evalScheem(['+', 2, 3]), 5,    '(+ 2 3) test');
assert_eq(evalScheem(['*', 2, 3]), 6,    '(* 2 3) test');
assert_eq(evalScheem(['/', 1, 2]), 0.5,    '(/ 1 2) test');
assert_eq(evalScheem(['*', ['/', 8, 4], ['+', 1, 1]]), 4,    '(* (/ 8 4) (+ 1 1)) test');
