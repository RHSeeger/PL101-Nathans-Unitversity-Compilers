var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return env[expr];
    }
    // Look at head of list for operation
    switch (expr[0]) {
    case '+':
        return evalScheem(expr[1], env) + evalScheem(expr[2], env);
    case '-':
        return evalScheem(expr[1], env) - evalScheem(expr[2], env);
    case '*':
        return evalScheem(expr[1], env) * evalScheem(expr[2], env);
    case '/':
        return evalScheem(expr[1], env) / evalScheem(expr[2], env);
    case 'set!':
        env[expr[1]] = evalScheem(expr[2], env);
        return 0;
    case 'define':
        env[expr[1]] = evalScheem(expr[2], env);
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
        } else { 
            return evalScheem(expr[3], env);
        }
   }
};

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
}

