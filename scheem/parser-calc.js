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
    filetext = fs.readFileSync('grammer-calc.peg', 'ascii');
    //console.log("DATA: " + filetext);;
} catch (err) {
    console.error("There was an error opening the file:");
    console.log(err);
}

var parse = wrapExceptions(PEG.buildParser(filetext).parse);

assert_eq(parse("1+2"),
    {tag:"+", left:1, right:2},
    "parse 1+2");
assert_eq(parse("1+2*3"),
    {tag:"+", left:1, right:{tag:"*", left:2, right:3}},
    "parse 1+2*3");
assert_eq(parse("1,2"),
    {tag:",", left:1, right:2},
    "parse 1,2");
assert_eq(parse("1,2+3"),
    {tag:",", left:1, right:{tag:"+", left:2, right:3}},
    "parse 1,2+3");
assert_eq(parse("1*2,3"),
    {tag:",", left:{tag:"*", left:1, right:2}, right:3},
    "parse 1*2,3");

assert_eq(parse("1+2+3"), {tag:"+", left:1, right: {tag:"+", left:2, right:3}}, "parse 1+2+3");
