if (typeof module !== 'undefined') {
    // In Node.js load required modules
} else {
    // In browser assume loaded by <script>
}

var thunk = function (f) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return { tag: "thunk", func: f, args: args };
};
var thunkValue = function (x) {
    return { tag: "value", val: x };
};
var trampoline = function (thk) {
    while (true) {
        if (thk.tag === "value") {
            return thk.val;
        } else if (thk.tag === "thunk") {
            thk = thk.func.apply(null, thk.args);
        } else {
            throw new Error("Bad thunk");
        }
    }
};
var evalExpr = function(expr, env, cont, xcont) {
    if(typeof expr === 'number') {
        return thunk(cont, expr);
    }
    switch(expr[0]) {
        case '+':
            return thunk(
                evalExpr, expr[1], env,
                function(v1) {
                    return thunk(
                        evalExpr, expr[2], env,
                        function(v2) {
                            return thunk(cont, v1 + v2);
                    }, xcont);
            }, xcont);
        case 'throw':
            return thunk(xcont, 'EXCEPTION!');
        default:
            throw new Error("Unknown form");
    }
};

var evalDiv = function (top, bottom, env, cont, xcont) {
    // Here's the code for addition
    // to help you get going.
    return thunk(
        evalExpr, top, env,
        function(v1) {
            return thunk(
                evalExpr, bottom, env,
                function(v2) {
                    if (v2 === 0) {
                        return thunk(xcont, "EXCEPTION!");
                    } else {
                        return thunk(cont, v1 / v2);
                    }
            }, xcont);
    }, xcont);
};

if (typeof module !== 'undefined') {
    module.exports.evalDiv = evalDiv;
    module.exports.thunkValue = thunkValue;
    module.exports.trampoline = trampoline;
}



