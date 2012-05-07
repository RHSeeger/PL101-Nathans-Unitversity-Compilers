var evalScheem = function (expr, env) {
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
        return evalScheem(expr[1])[0];
    case 'cdr':
        return evalScheem(expr[1]).slice(1);
    case 'if':
        if (evalScheem(expr[1], env) === '#t') {
            return evalScheem(expr[2], env);
        }
        return evalScheem(expr[3], env);
    case 'let-one':
        return evalScheem(expr[3], createEnv(expr[1], evalScheem(expr[2]), env));
    case 'lambda-one':
        var arg = expr[1];
        var body = expr[2];
        //console.log("lambda-one (arg=" + arg + ") (body=" + body + ")");
        return function (x) {
            return evalScheem(body, createEnv(arg, x, env));
        };
    default:
        return evalScheem(expr[0], env)(evalScheem(expr[1], env));
    }
};

var createEnv = function(name, value, outer) {
    var bindings = {};
    bindings[name] = value;
    return {
        bindings: bindings,
        outer: outer
    };
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

var add_binding = function(env, variable, value) {
    console.log("env = " + JSON.stringify(env));
    if (!(env.hasOwnProperty('bindings'))) {
        //console.log("Initializing env.bindings");
        env.bindings = {}
    }
    if (!(env.hasOwnProperty('outer'))) {
        //console.log("Initializing env.outer");
        env.outer = {}
    }
    if (env.bindings.hasOwnProperty(variable)) {
        throw new Error("variable " + variable + " already defined");
    }
    env.bindings[variable] = value;
};

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.lookup = lookup;
    module.exports.createEnv = createEnv;
    module.exports.update = update;
    module.exports.add_binding = add_binding;
}

