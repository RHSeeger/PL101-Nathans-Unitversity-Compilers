var evalScheem = function (expr, env) {
    if (typeof env === "undefined") {
        throw new Error("called evalScheem with no env: " + JSON.stringify(expr));
    }
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return lookup(env, expr);
    }
    // Look at head of list for operation
    switch (expr[0]) {
    case '+':
        return expr.slice(1).map(function (elem, index) {
            return evalScheem(elem, env);
        }).reduce(function (e1, e2) {
            return e1 + e2;
        }, 0);
    case '-':
        if (expr.length < 2) {
            throw "incorrect number of arguments to procedure";
        }
        if (expr.slice(1).length === 1) {
            return (- expr[1]);
        }
        return expr.slice(1).map(function (elem, index) {
            return evalScheem(elem, env);
        }).reduce(function (e1, e2) {
            return e1 - e2;
        });
    case '*':
        return expr.slice(1).map(function (elem, index) {
            return evalScheem(elem, env);
        }).reduce(function (e1, e2) {
            return e1 * e2;
        }, 1);
    case '/':
        switch(expr.slice(1).length) {
        case 0:
            return 1;
        case 1:
            return 1 / expr[1];
        default:
            return expr.slice(1).map(function (elem, index) {
                return evalScheem(elem, env);
            }).reduce(function (e1, e2) {
                return e1 / e2;
            });
        }
        break;
    case 'set!':
        update(env, expr[1], evalScheem(expr[2], env));
        return 0;
    case 'define':
        add_binding(env, expr[1], evalScheem(expr[2], env));
        return 0;
    case 'begin':
        var result;
        for (var i=1 ; i<expr.length; i++) {
            result = evalScheem(expr[i], env);
        }
        return result;
    case 'quote':
        return expr[1];
    case '=':
        return (evalScheem(expr[1], env) === evalScheem(expr[2], env)) ? '#t' : '#f';
    case '<':
        return (evalScheem(expr[1], env) < evalScheem(expr[2], env)) ? '#t' : '#f';
    case '>':
        return (evalScheem(expr[1], env) > evalScheem(expr[2], env)) ? '#t' : '#f';
    case 'cons':
        return [evalScheem(expr[1],env)].concat(evalScheem(expr[2],env));
    case 'car':
        return evalScheem(expr[1], env)[0];
    case 'cdr':
        return evalScheem(expr[1], env).slice(1);
    case 'list':
        var result = [];
        for(var i=1; i<expr.length; i++) {
            result.push(evalScheem(expr[i], env));
        }
        return result;
    case 'if':
        if (evalScheem(expr[1], env) === '#t') {
            return evalScheem(expr[2], env);
        }
        return evalScheem(expr[3], env);
    case 'let-one':
        var body = expr[3];
        var variable = expr[1];
        var value = evalScheem(expr[2], env);
        //console.log("let-one (" + variable + " = " + value + ") (" + JSON.stringify(body) + ")");
        return evalScheem(body, createEnv(variable, value, env));
    case 'lambda-one':
        var arg = expr[1];
        var body = expr[2];
        //console.log("lambda-one (arg=" + arg + ") (body=" + body + ")");
        return function (argList) {
            return evalScheem(body, createEnv(arg, argList[0], env));
        };
    case 'lambda':
        return lambda(expr.slice(1), env);
    default:
        return call_function(expr, env);
    }
};

var createEnv = function() { //varargs
    if (arguments.length % 2 != 1) {
        throw new Error("missing value for variable '" + arguments[arguments.length-1] + "'");
    }
    var bindings = {};
    for(var i=0; i<arguments.length-1; i+=2) {
        var name = arguments[i];
        var value = arguments[i+1];
        bindings[name] = value;
    }
    var result = {
        bindings: bindings,
        outer: arguments[arguments.length-1]
    };
    return result;
};

var lookup = function (env, variable) {
    //console.log("looking for " + variable + " in " + JSON.stringify(env));
    if (!(env.hasOwnProperty('bindings'))) {
        return undefined;
        //        throw new Error("not an environment: " + JSON.stringify(env));
    }
    if (env.bindings.hasOwnProperty(variable)) {
        return env.bindings[variable];
    }
    return lookup(env.outer, variable);
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

var add_binding = function() { // varargs
    var env = arguments[0];
    //console.log("env = " + JSON.stringify(env));
    if (!(env.hasOwnProperty('bindings'))) {
        //console.log("Initializing env.bindings");
        env.bindings = {}
    }
    if (!(env.hasOwnProperty('outer'))) {
        //console.log("Initializing env.outer");
        env.outer = {}
    }
    if (arguments.length % 2 != 1) {
        throw new Error("missing value for variable '" + arguments[arguments.length-1] + "'");
    }
    for(var i=1; i<arguments.length; i+=2) {
        var variable = arguments[i];
        var value = arguments[i+1];
        if (env.bindings.hasOwnProperty(variable)) {
            throw new Error("variable " + variable + " already defined");
        }
        env.bindings[variable] = value;
    }
};

var call_function = function(argList, env) {
    //console.log("call_function: (" + JSON.stringify(argList) + ", " + JSON.stringify(env) + ")");
    var func = evalScheem(argList[0], env);
    //console.log("func: " + JSON.stringify(func));
    //console.log("call_function on " + func.toString() + "(" + JSON.stringify(args) + ")");
    var args = []
    for (var i=1; i<argList.length; i++) {
        args.push(evalScheem(argList[i], env));
    }
    return func(args);
//    return evalScheem(expr[0], env)(evalScheem(expr[1], env));
};

// should evaluate the body in the environment passed in here
// not in the one of the caller
var lambda = function(inputs, env) {
    //console.log("lambda(" + JSON.stringify(inputs) + ", " + JSON.stringify(env) + ")");
    if (inputs.length != 2) { // argnames body
        throw new Error ("usage: lamdba (argnames) (body)");
    }
    var argnames = inputs[0];
    var body = inputs[1];

    //console.log("lambda (" + JSON.stringify(argnames) + ") (" + JSON.stringify(body) + ")");
    return function(argList) {
        //console.log("called me with argList: " + JSON.stringify(argList));
        //console.log("env is: " + JSON.stringify(env));
        var g = argList.length;
        if (argnames.length != g) {
            throw new Error("called function with invalid number of args");
        }
        var envvals = [];
        for (var i=0; i<argnames.length; i++) {
            envvals.push(argnames[i], argList[i]);
        }
        envvals.push(env);
        return evalScheem(body, createEnv.apply(null, envvals));
    }
};

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.lookup = lookup;
    module.exports.createEnv = createEnv;
    module.exports.update = update;
    module.exports.add_binding = add_binding;
}

