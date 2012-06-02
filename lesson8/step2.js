var evalExpr = function(expr, env, cont) {
    if(typeof expr === 'number') {
        return thunk(cont, expr);
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
        case '*':
            return thunk(
                evalExpr, expr[1], env,
                function(v1) {
                    return thunk(
                        evalExpr, expr[2], env,
                        function(v2) {
                            return thunk(cont, v1 * v2);
                        }
                    );
                }
            );
        // Add multiplication
        default:
            throw new Error("Unknown form");
    }
};
