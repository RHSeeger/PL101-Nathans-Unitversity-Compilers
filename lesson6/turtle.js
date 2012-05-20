if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var PEG = require('pegjs');
    var fs = require('fs');
    var parse = PEG.buildParser(fs.readFileSync('turtle.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = TURTLE.parse;
}

var evalExpr = function (expr, env) {
    if (typeof expr === 'undefined') {
        throw new Error("expr was undefined, why?");
    }
    if (typeof env === 'undefined') {
        throw new Error("env was undefined, why?");
    }
    // console.log("\nevalExpr: " + JSON.stringify(expr) + "\n\t" + JSON.stringify(env));
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Look at tag to see what to do
    switch(expr.tag) {
    case '+':
        return evalExpr(expr.left, env) + evalExpr(expr.right, env);
    case '-':
        return evalExpr(expr.left, env) - evalExpr(expr.right, env);
    case 'ident':
        return lookup(env, expr.name);
    case 'call':
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

var lookup = function (env, v) {
    if (!(env.hasOwnProperty('bindings')))
        throw new Error(v + " not found");
    if (env.bindings.hasOwnProperty(v))
        return env.bindings[v];
    return lookup(env.outer, v);
};

var evalStatement = function (stmt, env) {
    // console.log("\nevalStatement: " + JSON.stringify(stmt) + "\n\t" + JSON.stringify(env));
    var val;
    // Statements always have tags
    switch(stmt.tag) {
        // A single expression
    case 'ignore':
        // Just evaluate expression
        return evalExpr(stmt.body, env);
        // Declare new variable
    case 'var':
        // New variable gets default value of 0
        add_binding(env, stmt.name, 0);
        return 0;
    case ':=':
        // Evaluate right hand side
        val = evalExpr(stmt.right, env);
        update(env, stmt.left, val);
        return val;
    case 'if':
        if(evalExpr(stmt.expr, env)) {
            val = evalStatements(stmt.body, env);
        }
        return val;
    case 'repeat':
        var numTimes = evalExpr(stmt.expr, env);
        // console.log("repeating " + numTimes + " times");
        for(var i=0; i<numTimes; i++) {
            val = evalStatements(stmt.body, env);
        }
        return val;
    case 'define':
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

var evalStatements = function (seq, env) {
    var i;
    var val = undefined;
    for(i = 0; i < seq.length; i++) {
        val = evalStatement(seq[i], env);
    }
    return val;
};

var add_binding = function() { // varargs
    // alert("Adding bindings (" + arguments.length + ") : " + JSON.stringify(arguments));
    var env = arguments[0];
    //console.log("env = " + JSON.stringify(env));
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
        // alert("Adding binding internal: " + variable + " = " + JSON.stringify(value));
        if (env.bindings.hasOwnProperty(variable)) {
            throw new Error("variable " + variable + " already defined");
        }
        env.bindings[variable] = value;
    }
    //alert("New env: " + JSON.stringify(env.bindings));
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
    module.exports.add_binding = add_binding;
}
