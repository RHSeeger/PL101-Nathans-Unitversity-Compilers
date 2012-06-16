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
            var func = expr.name;
            var args = [];
            var i = 0;
            for(i = 0; i < expr.args.length; i++) {
                args[i] = compileExpr(expr.args[i]);
            }
            return expr.name + '(' + args.join(',') + ')';
        default:
            throw new Error('Unknown tag ' + expr.tag);
    }
};
var compileStatement = function (stmt) {
    var i;
    // Statements always have tags
    switch(stmt.tag) {
        // A single expression
        case 'ignore':
            // Just evaluate expression
            return '_res = (' + 
                compileExpr(stmt.body) + '); ';
        // Assignment
        case ':=':
            return '_res = (' + stmt.left + ' = ' +
                compileExpr(stmt.right) + '); ';
        // Declare new variable
        case 'var':
            // Evaluates to 0
            return '_res = 0; var ' + stmt.name + '; ';
        case 'repeat':
            return compileRepeat(stmt);
        // Should not get here
        default:
            console.log(stmt);
            throw new Error('Unknown tag ' + stmt.tag);
    }
};
var compileStatements = function (seq, is_funcbody) {
    var res = '';
    var i;
    res += 'var _res; ';
    for(i = 0; i < seq.length; i++) {
        res += compileStatement(seq[i]);
    }
    if(is_funcbody) res += 'return _res; ';
    return res;
};
var repeat = function (num, func) {
    var i;
    var res;
    for(i = 0; i < num; i++) {
        res = func();
    }
    return res;
};

var compileRepeat = function (stmt) {
    var result =  "var _res = repeat(" + compileExpr(stmt.expr) + ", function() {" + compileStatements(stmt.body, true) + "});";
    return result;
};

if (typeof module !== 'undefined') {
    module.exports.compileRepeat = compileRepeat;
    module.exports.compileStatement = compileStatement;
    module.exports.compileStatements = compileStatements;
    module.exports.repeat = repeat;
}
