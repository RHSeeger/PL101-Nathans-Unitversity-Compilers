if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var PEG = require('pegjs');
    var fs = require('fs');
    var parse = PEG.buildParser(fs.readFileSync('turtle.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = TURTLE.parse;
}

var debug = false;
var log = function(x) { if(debug) { console.log(x); } };

var stringify = function(x) {
    if (typeof x === "function") {
        return "function()";
    } else {
        return JSON.stringify(x);
    }
}

var thunk = function (f) {
    var args = Array.prototype.slice.call(arguments);
    log("\nthunk: " + stringify(args));
    args.shift();
    return { tag: "thunk", func: f, args: args };
};
var thunkValue = function (x) {
    return { tag: "value", val: x };
};
var trampoline = function (thk) {
    while (true) {
        log("\nTrampoline on: " + stringify(thk));
        if (thk.tag === "value") {
            return thk.val;
        } else if (thk.tag === "thunk") {
            thk = thk.func.apply(null, thk.args);
        } else {
            throw new Error("Bad thunk: " + stringify(thk));
        }
    }
};



var evalExpr = function (expr, env, cont, xcont) {
    log("\nevalExpr(" + stringify(expr) + ", " + stringify(env) + ")");
    if (typeof expr === 'undefined') {
        return thunk(xcont, "expr was undefined, why?");
    }
    if (typeof env === 'undefined') {
        return thunk(xcont, "env was undefined, why?");
    }
    if (typeof expr === 'number') {
        return thunk(cont, expr);
    }
    // Look at tag to see what to do
    switch(expr.tag) {
    case '+':
        log("\n+");
        var result = thunk(
            evalExpr, expr.left, env,
            function(v1) {
                return thunk(
                    evalExpr, expr.right, env,
                    function(v2) {
                        return thunk(cont, v1 + v2);
                    }, xcont);
            }, xcont);
        log("\nreturning: " + stringify(result));
        return result;
    case '-':
        log("\n-");
        return thunk(
            evalExpr, expr.left, env,
            function(v1) {
                return thunk(
                    evalExpr, expr.right, env,
                    function(v2) {
                        return thunk(cont, v1 - v2);
                    }, xcont);
            }, xcont);
    case 'ident': 
        return thunk(
            lookup, env, expr.name, function(v) {
                return thunk(cont, v);
            });
        //return thunk(cont, lookup(env, expr.name));
    case 'call': throw new Error("call not implemented yet");
        var func = lookup(env, expr.name);
        // Evaluate arguments to pass
        var ev_args = [];
        var i = 0;
        for(i = 0; i < expr.args.length; i++) {
            ev_args[i] = evalExpr(expr.args[i], env);
        }
        return func.apply(null, ev_args);
    default:
        throw new Error("Undefined expression type " + expr.tag);
    } 
};

var lookup = function (env, v, cont, xcont) {
    if (!(env.hasOwnProperty('bindings')))
        return thunk(xcont, v + " not found");
    if (env.bindings.hasOwnProperty(v))
        return thunk(cont, env.bindings[v])
    return lookup(env.outer, v);
};

var evalStatement = function (stmt, env, cont, xcont) {
    // log("\nevalStatement: " + stringify(stmt) + "\n\t" + stringify(env));
    var val;
    // Statements always have tags
    switch(stmt.tag) {
    case 'ignore':     // A single expression
        return thunk(evalExpr, stmt.body, env, cont, xcont);
    case 'var':        // Declare new variable
        return thunk(add_binding, env, stmt.name, cont, xcont);
    case ':=':        // Evaluate right hand side
        return thunk(
            evalExpr, stmt.right, env,
            function(v1) {
                return thunk(
                    update, stmt.left, v1,
                    function(v2) {
                        return thunk(cont, v1);
                    }, xcont);
            }, xcont);
        // val = evalExpr(stmt.right, env);
        // update(env, stmt.left, val);
        // return val;
    case 'if': throw new Error("'if' not implemented yet");
        if(evalExpr(stmt.expr, env)) {
            val = evalStatements(stmt.body, env);
        }
        return val;
    case 'repeat': throw new Error("'repeat' not implemented yet");
        var numTimes = evalExpr(stmt.expr, env);
        // log("repeating " + numTimes + " times");
        for(var i=0; i<numTimes; i++) {
            val = evalStatements(stmt.body, env);
        }
        return val;
    case 'define': throw new Error("'define' note implemented yet");
        // name args body
        var new_func = function() {
            // This function takes any number of arguments
            var i;
            var new_env;
            var new_bindings;
            new_bindings = { };
            for(i = 0; i < stmt.args.length; i++) {
                new_bindings[stmt.args[i]] = arguments[i];
            }
            new_env = { bindings: new_bindings, outer: env };
            return evalStatements(stmt.body, new_env);
        };
        add_binding(env, stmt.name, new_func);
        return 0;
    }
};

var evalStatements = function (seq, env, cont, xcont) {
    throw new Error("evalStatements not implemented yet");
    // return thunk(
    //     evalExpr, seq[0], env,
    //     function(v2) {
    //         return thunk(cont, v1);
    //     }, xcont);

    // return thunk(
    //     evalExpr, seq[0], env,
    //     function(v1) {
    //         return thunk(
    //             evalExpr, seq[1], env,
    //             function(v2) {
    //                 return thunk(cont, v1);
    //             }, xcont);
    //     }, xcont);
        


    // var result;
    // for(var i=seq.length-1; i>=0; i--) {
    //     var value = seq[i];
    //     var oldresult = result;
    //     result = thunk(
    //         evalExpr, value, env, function(v1) {
    //             return thunk(cont, 
    //     return thunk(
    //         evalExpr, stmt.right, env,
    //         function(v1) {
    //             return thunk(
    //                 update, stmt.left, v1,
    //                 function(v2) {
    //                     return thunk(cont, v1);
    //                 }, xcont);
    //         }, xcont);
        
    // var i;
    // var val = undefined;
    // for(i = 0; i < seq.length; i++) {
    //     val = evalStatement(seq[i], env);
    // }
    // return val;
};

var add_binding = function() { // varargs
    // alert("Adding bindings (" + arguments.length + ") : " + stringify(arguments));
    var env = arguments[0];
    //log("env = " + stringify(env));
    if (!(env.hasOwnProperty('bindings'))) {
        // alert("Initializing env.bindings");
        env.bindings = {}
    }
    if (!(env.hasOwnProperty('outer'))) {
        // alert("Initializing env.outer");
        env.outer = {}
    }
    if (arguments.length % 2 != 1) {
        throw new Error("missing value for variable '" + arguments[arguments.length-1] + "'");
    }
    for(var i=1; i<arguments.length; i+=2) {
        var variable = arguments[i];
        var value = arguments[i+1];
        // alert("Adding binding internal: " + variable + " = " + stringify(value));
        if (env.bindings.hasOwnProperty(variable)) {
            throw new Error("variable " + variable + " already defined");
        }
        env.bindings[variable] = value;
    }
    //alert("New env: " + stringify(env.bindings));
};

var update = function(env, variable, value) {
    for (var e = env; e !== null; e = e.outer) {
        if (!(e.hasOwnProperty("bindings"))) {
            throw new Error("undefined variable: " + variable);
        }
        if (e.bindings.hasOwnProperty(variable)) {
            e.bindings[variable] = value;
            return value;
        }
    }
    throw "undefined variable: " + variable;
};

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalExpr = evalExpr;
    module.exports.evalStatement = evalStatement;
    module.exports.trampoline = trampoline;
    module.exports.thunkValue = thunkValue;
}
