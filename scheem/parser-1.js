require("../assert_local.js");
var PEG = require("./peg.js");
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
    filetext = fs.readFileSync('grammer-1.peg', 'ascii');
    //console.log("DATA: " + filetext);;
} catch (err) {
    console.error("There was an error opening the file:");
    console.log(err);
}
var parse = wrapExceptions(PEG.buildParser(filetext).parse);

assert_eq(parse(""), undefined,    "don't parse empty string");
assert_eq(parse("dog"), ["dog"],    "parse dog");
assert_eq(parse("black dog"), ["black", "dog"],    "parse black dog");
assert_eq(parse("angry black dog"), ["angry", "black", "dog"],    "parse angry black dog");
assert_eq(parse("Gray dog"), undefined,    "don't parse Gray dog");
