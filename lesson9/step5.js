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
var sameType = function (a, b) {
    if(a.tag === 'basetype') {
        if(b.tag === 'basetype') {
            return a.name === b.name;
        }
        return false;
    }
    if(a.tag === 'arrowtype') {
        if(b.tag === 'arrowtype') {
            return sameType(a.left, b.left) &&
                   sameType(a.right, b.right);
        }
        return false;
    }
};
var typeExpr = function (expr, context) {
    if (typeof expr === 'number') {
        return { tag: 'basetype', name: 'num' };
    }
    if (typeof expr === 'string') {
        return lookup(context, expr);
    }
    // Application (A B)
    var A = expr[0];
    var B = expr[1];
    var A_type = typeExpr(A, context);
    var B_type = typeExpr(B, context);
    // Check that A type is arrow type
    if (A_type.tag !== 'arrowtype') {
        throw new Error('Not an arrow type');
    }
    var U_type = A_type.left;
    var V_type = A_type.right;
    // Verify argument type matches
    if (sameType(U_type, B_type) === false) {
        throw new Error('Argument type did not match');
    }
    return V_type;
};

var typeExprTester = function (context) {
    return bindTypes('f', context);
};

/* I'll admit, I'm not entirely sure what we're testing here */
var bindTypes = function(fname, context) {
    ftype = lookup(context, fname);
    if (ftype.tag !== 'arrowtype') {
        throw new Error("not a function");
    }
    return ftype.right;
};

if (typeof module !== 'undefined') {
    module.exports.typeExprTester = typeExprTester;
}
