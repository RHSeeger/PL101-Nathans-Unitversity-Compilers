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
    // console.log("\nevalExpr: " + JSON.stringify(expr) + "\n\t" + JSON.stringify(env));
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Look at tag to see what to do
    switch(expr.tag) {
    case '+':
        return evalExpr(expr.left, env) +  evalExpr(expr.right, env);
    case 'ident':
        return evalExpr(lookup(env, expr.name), env);
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

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalExpr = evalExpr;
    module.exports.evalStatement = evalStatement;
}
