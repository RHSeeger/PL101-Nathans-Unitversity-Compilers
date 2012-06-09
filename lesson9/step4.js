if (typeof module !== 'undefined') {
    // In Node.js load required modules
} else {
    // In browser assume loaded by <script>
}

var typeExpr = function (expr, context) {
    if (typeof expr === 'number') {
        return { tag: 'basetype', name: 'num' };
    }
    if (typeof expr === 'string') {
        return lookup(context, expr);
    }
};

var sameType = function (a, b) {
    if (a.tag === 'basetype' && a.tag === 'basetype') {
        return a.name === b.name;
    } else if (a.tag === 'arrowtype' || a.tag === 'arrowtype') {
        return a.left === b.left && a.right === b.right;
    } else {
        return false;
    }
};

if (typeof module !== 'undefined') {
    module.exports.sameType = sameType;
}
