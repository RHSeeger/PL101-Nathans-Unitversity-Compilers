require("../assert_local.js");
var assert = require("assert");
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

assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );

// Spaces around parens
assert_eq(parse("( + x 3 )"), ["+", "x", "3"],    "parse ( + x 3 )");
assert_eq(parse("(+  x  3)"), ["+", "x", "3"],    "multiple spaces between atoms/expressions");
assert_eq(parse("  x  "), "x",    "multiple before/after atoms");
assert_eq(parse(" (+ x 3) "), ["+", "x", "3"],    "multiple before/after expressions");
assert_eq(parse("(+\nx\n3)"), ["+", "x", "3"],    "newlines");
assert_eq(parse("(+\tx\t3)"), ["+", "x", "3"],    "tabs");

assert_eq(parse("'a"), ["quote", "a"], "quoted atom");
assert_eq(parse("'(1 2 3)"), ["quote", ["1", "2", "3"]], "quoted atom");

assert_eq(parse(";; commented text"), ["comment", " commented text"], "commented whole line");
assert_eq(parse("a ;; ct"), ["a", ["comment", " ct"]], "comment after value");
assert_eq(parse("a;;ct"), ["a", ["comment", "ct"]], "comment after value nospace");


