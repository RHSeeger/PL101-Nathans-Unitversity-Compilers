
var factorialCPS = function (n, cont) {
    if (n <= 1) {
        return cont(1);
    } else {
        var new_cont = function (v) {
            cont(v * n);
        };
        return factorialCPS(n-1, new_cont);
    }
};