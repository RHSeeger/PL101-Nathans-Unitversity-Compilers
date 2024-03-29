if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var PEG = require('pegjs');
    var fs = require('fs');
    var parse = PEG.buildParser(fs.readFileSync('scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
}

// Array.prototype.compare = function(testArr) {
//     if (this.length != testArr.length) return false;
//     for (var i = 0; i < testArr.length; i++) {
//         if (this[i].compare) { 
//             if (!this[i].compare(testArr[i])) return false;
//         }
//         if (this[i] !== testArr[i]) return false;
//     }
//     return true;
// }

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

var basicEnvironment = function() {
    return createEnv(
        "+", function(expr) {
            return expr.reduce(function (e1, e2) {
                return e1 + e2;
            }, 0);
        },

        '-', function(expr) {
            if (expr.length < 1) {
                throw "incorrect number of arguments to procedure";
            }
            if (expr.length === 1) {
                return (- expr[0]);
            }
            return expr.reduce(function (e1, e2) {
                return e1 - e2;
            });
        },
        '*', function(expr) {
            return expr.reduce(function (e1, e2) {
                return e1 * e2;
            }, 1);
        }, 
        '/', function(expr) {
            switch(expr.length) {
            case 0:
                return 1;
            case 1:
                return 1 / expr[0];
            default:
                return expr.reduce(function (e1, e2) {
                    return e1 / e2;
                });
            }
        },
        'eq?', function(expr) {
            var elem1 = expr[0];
            var elem2 = expr[1];
            var isArray = function(elem) {
                return (Object.prototype.toString.call(elem) === '[object Array]');
            }
            var compareem = function(elem1, elem2) {
                if (isArray(elem1) && isArray(elem2)) {
                    if (elem1.length != elem2.length) return false;
                    for (var i = 0; i < elem1.length; i++) {
                        if (elem1[i].compare) { 
                            if (!elem1[i].compare(elem2[i])) return false;
                        }
                        if (elem1[i] !== elem2[i]) return false;
                    }
                    return true;
                } else if (typeof elem1 === Array || typeof elem2 === Array) {
                    return false;
                }
                return (elem1 === elem2);
            }
            return (compareem(expr[0], expr[1]) ? "#t" : "#f");
        },
        '=', function(expr) {
            return (expr[0] === expr[1]) ? '#t' : '#f';
        },
        '<', function(expr) {
            return (expr[0] < expr[1]) ? '#t' : '#f';
        },
        '>', function(expr) {
            return (expr[0] > expr[1]) ? '#t' : '#f';
        },
        'cons', function(expr) {
            return [expr[0]].concat(expr[1]);
        },
        'car', function(expr) {
            return expr[0][0];
        },
        'cdr', function(expr) {
            return expr[0].slice(1);
        },
        'list', function(expr) {
            return expr;
        },

        {}
    );
}

var seval = function (code) { 
    return evalScheem(parse(code), basicEnvironment()); 
}

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.lookup = lookup;
    module.exports.createEnv = createEnv;
    module.exports.update = update;
    module.exports.add_binding = add_binding;
    module.exports.seval = seval;
    module.exports.basicEnvironment = basicEnvironment;
}

