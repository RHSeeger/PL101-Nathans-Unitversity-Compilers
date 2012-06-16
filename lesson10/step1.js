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
            return '(' + compileExpr(expr.left) + ')+(' + compileExpr(expr.right) + ')';
        case '*':
            return '(' + compileExpr(expr.left) + ')*(' + compileExpr(expr.right) + ')';
        case '-':
            return '(' + compileExpr(expr.left) + ')-(' + compileExpr(expr.right) + ')';
        case '<':
            return '(' + compileExpr(expr.left) + ')<(' + compileExpr(expr.right) + ')';
        default:
            throw new Error('Unknown tag ' + expr.tag);
    }
};

if (typeof module !== 'undefined') {
    module.exports.compileExpr = compileExpr;
}
