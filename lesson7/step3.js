var factorialThunk = function (n, cont) {
    if (n <= 1) {
        return thunk(cont, [1]); // update
    } else {
        var new_cont = function (v) {
            return thunk(cont, [n * v]); // update
        };
        return thunk(factorialThunk, [n-1, new_cont]);
    }
};