if (typeof module !== 'undefined') {
    // In Node.js load required modules
} else {
    // In browser assume loaded by <script>
}

var base = function (name) {
    return { tag: 'basetype', name: name };
};
var arrow = function (left, right) {
    return { tag: 'arrowtype', 
             left: left,
             right: right };
};

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
    if (typeof expr === 'boolean') {
        return { tag: 'basetype', name: 'bool' };
    }
    if (expr[0] === 'if') {
        return typeExprIf(expr, context);
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

var typeExprIf = function (expr, context) {
    var ifStr = expr[0];
    var cond = expr[1];
    var blockTrue = expr[2];
    var blockFalse = expr[3];
    if ( ifStr !== "if" ) {
        throw new Error("not an if block");
    }
    if ( ! sameType(base('bool'), typeExpr(cond, context)) ) {
        throw new Error("conditional not boolean: " + JSON.stringify(typeExpr(cond, context)));
    }
    var typeTrue = typeExpr(blockTrue, context);
    var typeFalse = typeExpr(blockFalse, context);
    if ( ! sameType(typeTrue, typeFalse) ) {
        throw new Error("Type of true block != type of false block : " + JSON.stringify(typeExpr(blockTrue, context)) + " != " + JSON.stringify(typeExpr(blockFalse, context)));
    }
    return typeExpr(blockTrue, context);
};

if (typeof module !== 'undefined') {
    module.exports.base = base;
    module.exports.arrow = arrow;
    module.exports.typeExpr = typeExpr;
}
