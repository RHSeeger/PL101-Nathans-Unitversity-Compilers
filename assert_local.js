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
    if (pass) {
        console.log("PASSED", msg);
    } else {
        any_errors = true;
        console.log("FAILED", msg);
        console.log("\texpected: " + JSON.stringify(right));
        console.log("\tactual  : "+ JSON.stringify(left));
    }
};
