//var assert = require("assert");
require("../assert_local.js");
var PEG = require("pegjs");
var fs = require('fs');

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
var filetext;

try {
    filetext = fs.readFileSync('grammer-scheem.peg', 'ascii');
    //console.log("DATA: " + filetext);;
} catch (err) {
    console.error("There was an error opening the file:");
    console.log(err);
}
var parse = wrapExceptions(PEG.buildParser(filetext).parse);

assert_eq(parse(""), undefined,    "don't parse empty string");
assert_eq(parse("atom"), "atom",    "parse atom");
assert_eq(parse("+"), "+",    "parse +");
assert_eq(parse("(+ x 3)"), ["+", "x", "3"],    "parse (+ x 3)");
assert_eq(parse("(+ 1 (f x 3 y))"),     ["+", "1", ["f", "x", "3", "y"]],    "parse (+ (1 (f x 3 y))");
