var thunk = function (f, lst) {
    return { tag: "thunk", func: f, args: lst };
};

var thunkValue = function (x) {
    return { tag: "value", val: x };
};

var evalThunk = function (thk) {
    if (thk.tag === "value") {
        return thk.val;
    }
    if (thk.tag === "thunk") {
        var sub_expr = thk.func.apply(null, thk.args);
        return evalThunk(sub_expr);
    }
};

var trampoline = function (thk) {
    while (true) {
        if (thk.tag === "value") {
            return thk.val;
        }
        if (thk.tag === "thunk") {
            thk = thk.func.apply(null, thk.args);
        }
    }
};

var result = function(x) {
    return x;
}

/*
 * FUNCTIONS
 */

// SUM
var sum = {
    // normal recursive
    normal : function(x) {
        if (x <= 1) {
            return x;
        } else {
            return x + this.normal(x-1);
        }
    },

    // continuation passing style
    cps : function(n) {
        var t = function(x, cont) {
            if (x <= 1) {
                return cont(x);
            } else {
                var new_cont = function(y) {
                    return cont(x+y);
                }
                return t(x-1, new_cont);
            }
        }
        return t(n, result);
    },
    
    // cps - thunked
    thunked : function(x) {
        var t = function(n, cont) {
            if (n <= 1) return thunk(cont, [1]);
            else {
                var new_cont = function (v) {
                    return thunk(cont, [v + n]);
                };
                return thunk(t, [n - 1, new_cont]);
            }
        }
        return trampoline(t(x, thunkValue));
    }
}

var ljoin = {
    // normal recursive
    normal : function(x, joinStr) {
        if (x.length === 0) {
            return "";
        } else if(x.length === 1) {
            return x[0];
        } else {
            return "" + x[0] + joinStr + this.normal(x.slice(1), joinStr);
        }
    },

    // continuation passing style
    cps : function(n, joinStr) {
        var t = function(x, cont) {
            if (x.length === 0) {
                return cont("");
            } else if(x.length === 1) {
                return cont(x[0]);
            } else {
                var new_cont = function(y) {
                    return cont(x[0] + joinStr + y);
                }
                return t(x.slice(1), new_cont);
            }
        }
        return t(n, result);
    },
    
    // cps - thunked
    thunked : function(n, joinStr) {
        var t = function(x, cont) {
            if (x.length === 0) {
                return thunk(cont, [""]);
            } else if(x.length === 1) {
                return thunk(cont, [x[0]]);;
            } else {
                var new_cont = function (v) {
                    return thunk(cont, [x[0] + joinStr + v]);
                };
                return thunk(t, [x.slice(1), new_cont]);
            }
        }
        return trampoline(t(n, thunkValue));
    }
}

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.sum = sum;
    module.exports.ljoin = ljoin;
}
