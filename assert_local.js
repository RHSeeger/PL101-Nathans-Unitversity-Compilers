_und = require("underscore")

GLOBAL.assert = function assert(pass, msg){
    var type = pass ? "PASSED" : "FAILED";
    if(type === "FAILED") {
        any_errors = true;
    }
    console.log(type, msg);
};

GLOBAL.assert_eq = function assert_eq(left, right, msg){
    var pass = _und.isEqual(left, right);
    var type = pass ? "PASSED" : "FAILED";
    if(type === "FAILED") {
        any_errors = true;
    }
    console.log(type, msg);
};
