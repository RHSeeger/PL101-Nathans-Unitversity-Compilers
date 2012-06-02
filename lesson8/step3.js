if (typeof module !== 'undefined') {
    // In Node.js load required modules
} else {
    // In browser assume loaded by <script>
}


var thunkValue = function (x) {
    return { tag: "value", val: x };
};

var thunk = function (f) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return { tag: "thunk", func: f, args: args };
};

var stepStart = function (expr, env) {
    return { 
        data: evalExpr(expr, env, thunkValue),
        done: false
    };
};

var stepStart = function (expr, env) {
    return { 
        data: evalExpr(expr, env, thunkValue),
        done: false
    };
};

var step = function (state) {
    if (state.done === true) {
        throw new Error("state already done");
    }
    if (state.data.tag === "value") {
        state.data = state.data.val;
        state.done = true;
        return state.done;
    }
    if (state.data.tag === "thunk") {
        state.data = state.data.func.apply(null, state.data.args);
        state.done = false;
        return state.done;
    }
    throw new Error("can't step on non-thunk type");
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


if (typeof module !== 'undefined') {
    module.exports.thunk = thunk;
    module.exports.thunkValue = thunkValue;
    module.exports.step = step;
}



