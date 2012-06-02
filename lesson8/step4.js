if (typeof module !== 'undefined') {
    // In Node.js load required modules
} else {
    // In browser assume loaded by <script>
}

var lookup = function (env, v) {
    if (!(env.hasOwnProperty('bindings')))
        throw new Error(v + " not found");
    if (env.bindings.hasOwnProperty(v))
        return env.bindings[v];
    return lookup(env.outer, v);
};
var update = function (env, v, val) {
    if (env.bindings.hasOwnProperty(v)) {
        env.bindings[v] = val;
    } else {
        update(env.outer, v, val);
    }
};
var thunk = function (f) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return { tag: "thunk", func: f, args: args };
};
var thunkValue = function (x) {
    return { tag: "value", val: x };
};
var evalExpr = function(expr, env, cont) {
    if(typeof expr === 'number') {
        return thunk(cont, expr);
    }
    if (typeof expr === 'string') {
        return thunk(cont, lookup(env, expr));
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
                        }
                    );
                }
            );
        case 'set!':
            return thunk(
                evalExpr, expr[2], env, 
                function(v) {
                    update(env, expr[1], v);
                    return thunk(cont, 0);
                }
            );
        default:
            throw new Error("Unknown form");
    }
};
var stepStart = function (expr, env) {
    return { 
        data: evalExpr(expr, env, thunkValue),
        done: false
    };
};
var step = function (state) {
    if (state.data.tag === "value") {
        state.done = true;
        state.data = state.data.val;
    } else if (state.data.tag === "thunk") {
        state.data = state.data.func.apply(null, state.data.args);
    } else {
        throw new Error("Bad thunk");
    }
};

var evalTwo = function (expr0, expr1, env) {
    var t0 = stepStart(expr0, env);
    var t1 = stepStart(expr1, env);
    while (! (t0.done && t1.done)) {
        if (! t0.done) { step(t0); }
        if (! t1.done) { step(t1); }
    }
};

if (typeof module !== 'undefined') {
    module.exports.evalTwo = evalTwo;
}



