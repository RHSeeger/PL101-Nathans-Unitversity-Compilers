if (typeof module !== 'undefined') {
    // In Node.js load required modules
} else {
    // In browser assume loaded by <script>
}

var compileExpr = function (expr) {
    if (typeof expr === 'number') {
        return expr.toString();
    }
    switch(expr.tag) {
    case '+':
        return '(' + compileExpr(expr.left) + ')+(' +
            compileExpr(expr.right) + ')';
    case 'ident':
        return expr.name;
    case 'call':
        var args = expr.args.map(function(value) {
            return compileExpr(value);
        });
        var result = expr.name + "(" + args.join(",") + ")";
        return result;
    default:
        throw new Error('Unknown tag ' + expr.tag);
    }
};


if (typeof module !== 'undefined') {
    module.exports.compileExpr = compileExpr;
}
